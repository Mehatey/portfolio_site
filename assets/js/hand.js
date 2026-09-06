/* ─────────────────────────────────────────────────────────────────────────
   STEER THE SITE WITH YOUR HAND

   Sid: "think of something which we can do more effects and hand tracking
   with."

   ── WHY THIS AND NOT A HAND-TRACKED TOY ─────────────────────────────────
   The obvious build is a page where you wave at some particles. That is a
   demo, it lives in one place, and nobody who is here to look at case
   studies will find it.

   This instead takes over the POINTER. Your index fingertip drives the same
   orb the mouse drives; a pinch is a click. Everything already built on the
   pointer therefore comes along for free and without knowing anything about
   it: the orb and its trail, the wind that bends away from you, the colour
   chips that read whatever you are pointing at, the cube's remarks, the
   magnetic controls, the jaali lighting up under your hand, the collectible
   sprites you can shove around. One integration, and the whole site becomes
   hand-controlled -- which is a far better argument that he can build this
   than a particle demo would be.

   ── IT IS OFF, AND IT ASKS ──────────────────────────────────────────────
   A portfolio that turns on a camera unprompted is a portfolio nobody
   forgives. Nothing here loads until the visitor presses the control: not
   the model, not the wasm, not the camera. The button says what it will do
   before it does it, the preview is always visible while it runs so there is
   never any doubt the camera is on, and one press turns it off and releases
   the device.

   Nothing leaves the machine. MediaPipe runs the model in wasm locally,
   there is no network call after the model file, and no frame is ever
   stored. That is worth saying out loud on the control itself, because a
   visitor cannot read this comment.

   ── THE SMOOTHING IS THE WHOLE CRAFT ────────────────────────────────────
   Raw landmark output is jittery by several pixels a frame, and a cursor
   that shakes is unusable however good the tracking is. Two things fix it:
   a one-euro-style adaptive filter, which smooths hard when the hand is
   still and barely at all when it is moving fast, so the pointer is steady
   without feeling laggy; and a pinch detector with separate make and break
   thresholds, because a single threshold produces a stream of accidental
   double clicks at exactly the distance people naturally hold.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  if (!window.matchMedia) return;
  /* Needs a pointer-driven site to take over, a camera, and a machine that
     is not already struggling. */
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var VISION = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";
  var MODEL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

  var btn = document.createElement("button");
  btn.type = "button";
  btn.id = "hand-toggle";
  btn.className = "hand-toggle";
  btn.setAttribute("data-tip", "Steer with your hand");
  btn.setAttribute("aria-label", "Steer with your hand. Uses your camera, on this device only.");
  btn.innerHTML = '<span class="hand-toggle__ico" aria-hidden="true"></span>';
  document.body.appendChild(btn);

  var wrap = null,
    video = null,
    preview = null,
    pctx = null;
  var landmarker = null,
    stream = null,
    raf = 0,
    on = false,
    loading = false;

  /* ── THE FILTER ────────────────────────────────────────────────────────
     One euro. `a` is recomputed every frame from how fast the point is
     moving: slow means smooth hard, fast means barely smooth at all. A fixed
     alpha cannot do both, and doing only one is the difference between a
     pointer that shakes and a pointer that lags. */
  function Euro(minCut, beta) {
    this.minCut = minCut;
    this.beta = beta;
    this.x = null;
    this.dx = 0;
    this.t = 0;
  }
  Euro.prototype.filter = function (v, now) {
    if (this.x === null) {
      this.x = v;
      this.t = now;
      return v;
    }
    var dt = Math.max(1e-3, (now - this.t) / 1000);
    this.t = now;
    var dv = (v - this.x) / dt;
    var ad = 1 / (1 + 1 / (2 * Math.PI * 1 * dt));
    this.dx = ad * dv + (1 - ad) * this.dx;
    var cut = this.minCut + this.beta * Math.abs(this.dx);
    var a = 1 / (1 + 1 / (2 * Math.PI * cut * dt));
    this.x = a * v + (1 - a) * this.x;
    return this.x;
  };
  var fx = new Euro(1.4, 0.02),
    fy = new Euro(1.4, 0.02);

  /* Separate make and break distances. One threshold puts a stream of
     accidental clicks at exactly the gap people naturally hold a pinch. */
  var PINCH_ON = 0.055,
    PINCH_OFF = 0.085;
  var pinched = false;

  function ui() {
    if (wrap) return;
    wrap = document.createElement("div");
    wrap.className = "hand-hud";
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML =
      '<canvas class="hand-hud__cv" width="160" height="120"></canvas><span class="hand-hud__tag">camera on · nothing leaves this device</span>';
    document.body.appendChild(wrap);
    preview = wrap.querySelector("canvas");
    pctx = preview.getContext("2d");
  }

  /* The site is driven entirely by pointer events, so the cleanest way in is
     to BE a pointer. Dispatching real events means every listener already
     written -- the orb, the wind, the chips, the magnets, the sprites -- gets
     the hand for free and none of them needs to know it exists. */
  function emit(type, x, y, extra) {
    var el = document.elementFromPoint(x, y) || document.body;
    var init = {
      bubbles: true,
      cancelable: true,
      composed: true,
      clientX: x,
      clientY: y,
      pointerId: 99,
      pointerType: "mouse",
      isPrimary: true,
      buttons: extra && extra.buttons ? extra.buttons : 0,
    };
    try {
      el.dispatchEvent(new PointerEvent(type, init));
    } catch (e) {}
    /* A few things on this site listen for mouse events rather than pointer
       ones, so the equivalent goes out too. */
    var mouseType = type === "pointermove" ? "mousemove" : type === "pointerdown" ? "mousedown" : type === "pointerup" ? "mouseup" : null;
    if (mouseType) {
      try {
        el.dispatchEvent(new MouseEvent(mouseType, init));
      } catch (e) {}
    }
    return el;
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    if (!landmarker || !video || video.readyState < 2) return;

    var now = performance.now();
    var res;
    try {
      res = landmarker.detectForVideo(video, now);
    } catch (e) {
      return;
    }

    /* The preview. Mirrored, because a camera that does not mirror makes
       every gesture feel inverted. */
    if (pctx) {
      pctx.save();
      pctx.scale(-1, 1);
      pctx.drawImage(video, -160, 0, 160, 120);
      pctx.restore();
    }

    var hands = res && res.landmarks;
    if (!hands || !hands.length) {
      wrap.classList.remove("is-tracking");
      return;
    }
    wrap.classList.add("is-tracking");
    var lm = hands[0];
    var tip = lm[8]; // index fingertip
    var thumb = lm[4];

    /* Mirrored to match the preview, and the usable range is squeezed: a
       hand cannot comfortably reach the edges of its own camera frame, so
       0.15 to 0.85 of the frame is mapped to the whole window. Without that
       the corners of the page are unreachable. */
    var nx = Math.min(1, Math.max(0, (1 - tip.x - 0.15) / 0.7));
    var ny = Math.min(1, Math.max(0, (tip.y - 0.15) / 0.7));
    var x = fx.filter(nx * innerWidth, now);
    var y = fy.filter(ny * innerHeight, now);

    if (pctx) {
      pctx.beginPath();
      pctx.arc(160 - tip.x * 160, tip.y * 120, 5, 0, Math.PI * 2);
      pctx.fillStyle = pinched ? "#ff9db0" : "#8fd0ff";
      pctx.fill();
    }

    emit("pointermove", x, y, { buttons: pinched ? 1 : 0 });

    var d = Math.hypot(tip.x - thumb.x, tip.y - thumb.y);
    if (!pinched && d < PINCH_ON) {
      pinched = true;
      wrap.classList.add("is-pinch");
      var el = emit("pointerdown", x, y, { buttons: 1 });
      emit("pointerup", x, y);
      /* A pinch is a click, so it has to actually activate what it is over.
         Dispatching the pointer pair alone does not navigate. */
      try {
        if (el && el.closest) {
          var act = el.closest("a[href],button,[role=button]");
          if (act) act.click();
        }
      } catch (e) {}
    } else if (pinched && d > PINCH_OFF) {
      pinched = false;
      wrap.classList.remove("is-pinch");
    }
  }

  async function start() {
    if (loading || on) return;
    loading = true;
    btn.classList.add("is-loading");
    try {
      var mod = await import(VISION + "/vision_bundle.mjs");
      var files = await mod.FilesetResolver.forVisionTasks(VISION + "/wasm");
      landmarker = await mod.HandLandmarker.createFromOptions(files, {
        baseOptions: { modelAssetPath: MODEL, delegate: "GPU" },
        runningMode: "VIDEO",
        numHands: 1,
      });
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: "user" } });
      video = document.createElement("video");
      video.playsInline = true;
      video.muted = true;
      video.srcObject = stream;
      await video.play();
      ui();
      on = true;
      document.documentElement.setAttribute("data-hand", "on");
      btn.classList.add("is-on");
      btn.setAttribute("data-tip", "Stop hand steering");
      raf = requestAnimationFrame(frame);
    } catch (e) {
      /* Refused permission, no camera, or the CDN is unreachable. Say so on
         the control rather than failing silently, and leave it usable. */
      btn.classList.add("is-failed");
      btn.setAttribute("data-tip", "Hand steering unavailable");
      setTimeout(function () {
        btn.classList.remove("is-failed");
        btn.setAttribute("data-tip", "Steer with your hand");
      }, 3200);
    }
    loading = false;
    btn.classList.remove("is-loading");
  }

  function stop() {
    on = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    /* The camera light must go out the moment this is off. Stopping every
       track is what actually releases the device; pausing the video does
       not. */
    if (stream) {
      stream.getTracks().forEach(function (t) {
        t.stop();
      });
      stream = null;
    }
    if (video) {
      video.srcObject = null;
      video = null;
    }
    if (wrap) {
      wrap.remove();
      wrap = null;
      preview = null;
      pctx = null;
    }
    document.documentElement.removeAttribute("data-hand");
    btn.classList.remove("is-on");
    btn.setAttribute("data-tip", "Steer with your hand");
    pinched = false;
    fx = new Euro(1.4, 0.02);
    fy = new Euro(1.4, 0.02);
  }

  btn.addEventListener("click", function () {
    if (on) stop();
    else start();
  });
  /* Leaving the page with a camera still live is the one unforgivable bug
     in a feature like this. */
  window.addEventListener("pagehide", stop);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden && on) stop();
  });
})();
