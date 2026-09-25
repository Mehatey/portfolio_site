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
  btn.setAttribute("data-tip", "Hand steer");
  btn.setAttribute("aria-label", "Steer with your hand. Uses your camera, on this device only.");
  /* ── IT WAS A PADLOCK ──────────────────────────────────────────────────
     Sid: "check if the icons are right for the hand steering, there was a
     weird lock shape."

     It was, literally: the old mark was a rounded arch with its bottom border
     removed sitting on a rounded rectangle, which is the shackle and body of
     a padlock and nothing else. On a control that turns on a camera, an icon
     that reads as a lock is not merely wrong, it is a claim about the feature
     that the feature does not make.

     A hand with one finger raised, which is also the gesture the coaching
     asks for first.

     ── AND IT IS DRAWN IN CELLS ─────────────────────────────────────────
     Sid: "the icons on the right are not looking too good ... is it possible
     to make them pixel art style, like how we have in the navbar?"

     It was a stroked path, which is a different drawing system from the nav
     glyphs, the collectibles and the logo -- all of which are squares on a
     grid. Two icon languages in one interface is the sort of thing nobody
     names and everybody feels. Same 3px cell and same rounding as
     nav_icon.html: a raised index finger, a folded fist under it, and the
     thumb out to the side. */
  btn.innerHTML =
    '<span class="hand-toggle__ico" aria-hidden="true">' +
    '<svg class="nav-pixel" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    /* ── THIRD ATTEMPT, AND THE FIRST TWO SAY WHY ──────────────────────
       Sid: "the hand icon doesn't really look like a hand", after an earlier
       "can you not make it look more like a thumbs-up."

       Attempt one was a padlock. Attempt two was one raised digit over a
       solid block, which is the thumbs-up glyph. Attempt three put three
       separated fingers over a palm, which was closer and still read as a
       fork, because every finger was the same length and they sat in a
       straight row.

       A hand is not a comb. What makes a hand legible at twenty pixels is
       that the fingers are DIFFERENT lengths and the middle one is tallest --
       that silhouette is recognisable long before any detail is, which is why
       a child's drawing of a hand works. So the middle finger runs three
       cells, the two beside it run two, and the thumb comes off the side at
       the height a thumb actually joins, below the knuckles. Same 3px cell as
       every other glyph on the site. */
    /* middle finger, the tallest thing in the mark */
    '<rect x="10.5" y="2" width="3" height="3" rx="1"/>' +
    '<rect x="10.5" y="5" width="3" height="3" rx="1"/>' +
    /* index and ring, one cell shorter each side */
    '<rect x="6.5" y="5" width="3" height="3" rx="1"/>' +
    '<rect x="14.5" y="5" width="3" height="3" rx="1"/>' +
    /* the knuckle row, where four digits become one hand */
    '<rect x="6.5" y="8" width="3" height="3" rx="1"/>' +
    '<rect x="10.5" y="8" width="3" height="3" rx="1"/>' +
    '<rect x="14.5" y="8" width="3" height="3" rx="1"/>' +
    /* the thumb, off the side and below the knuckles */
    '<rect x="3" y="11" width="3" height="3" rx="1"/>' +
    /* the palm */
    '<rect x="6.5" y="11" width="3" height="3" rx="1"/>' +
    '<rect x="10.5" y="11" width="3" height="3" rx="1"/>' +
    '<rect x="14.5" y="11" width="3" height="3" rx="1"/>' +
    '<rect x="6.5" y="14" width="3" height="3" rx="1"/>' +
    '<rect x="10.5" y="14" width="3" height="3" rx="1"/>' +
    '<rect x="14.5" y="14" width="3" height="3" rx="1"/>' +
    /* tapering to the wrist */
    '<rect x="8.5" y="17" width="3" height="3" rx="1"/>' +
    '<rect x="12.5" y="17" width="3" height="3" rx="1"/>' +
    "</svg></span>";
  document.body.appendChild(btn);

  var wrap = null,
    video = null,
    preview = null,
    pinchX = 0,
    pinchY = 0,
    pinchTravel = 0,
    pctx = null;
  var landmarker = null,
    stream = null,
    raf = 0,
    on = false,
    loading = false;
  var coach = null,
    coachDone = null;

  /* Sid: "we show the instructions, but once the camera mode is on, it
     goes away." It did: three of four steps done fully hid the panel,
     which fired before "pinch and pull to scroll" had ever actually been
     pulled off, since that was the gesture that did not work. A step
     still dims once learned, so the list shows progress, but the panel
     itself no longer disappears -- it is the one thing on screen that
     remembers the gestures once the visitor has looked away. */
  function step(name) {
    if (!coach || !coachDone || coachDone[name]) return;
    coachDone[name] = true;
    var el = coach.querySelector('[data-step="' + name + '"]');
    if (el) el.classList.add("is-done");
  }

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
    fy = new Euro(1.4, 0.02),
    fScroll = new Euro(1.4, 0.02);

  /* Separate make and break distances. One threshold puts a stream of
     accidental clicks at exactly the gap people naturally hold a pinch. */
  var PINCH_ON = 0.055,
    PINCH_OFF = 0.085;
  /* 2.6 rather than 1. A hand has maybe 300px of comfortable vertical travel
     in frame and a page has thousands, so one-to-one turns scrolling into an
     arm exercise. Enough gain that a single pull covers most of a screen. */
  var SCROLL_GAIN = 2.6;
  var pinched = false;
  var lastX = 0,
    lastY = 0;

  /* ── SCROLL MOVED OFF THE PINCH ───────────────────────────────────────
     Sid: "the pinch and pull-to-scroll is not working... very janky.
     Can we have a simple one where you keep your hand up and it scrolls."

     Scrolling used to live inside a held pinch: fingers together, then drag.
     That asks a hand to do two precise things at once -- hold an exact gap
     AND move -- and natural tremor crosses the release threshold mid-drag,
     which reads as the scroll stuttering or stopping outright.

     An open hand is a pose, not a distance. It does not need to be held to
     a tolerance the way a pinch does, so it survives the same tremor a
     pinch does not. Four fingers counted rather than the thumb, whose axis
     runs a different way and makes a poor open/closed signal on its own. */
  var scrolling = false;
  var scrollLastY = 0;
  function fingerOut(tip, mcp, wrist) {
    var dTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
    var dMcp = Math.hypot(mcp.x - wrist.x, mcp.y - wrist.y);
    return dTip > dMcp * 1.35;
  }

  function ui() {
    if (wrap) return;
    wrap = document.createElement("div");
    wrap.className = "hand-hud";
    wrap.setAttribute("aria-hidden", "true");
    /* ── IT HAS TO SAY WHAT THE GESTURES ARE ──────────────────────────
       A friend of Sid's, trying it cold: "crazy feature, the hand steering,
       but as a first time user i am unaware what gestures will work, maybe
       having a small snackbar showing in the bottom how to steer or a quick
       tutorial would be nice."

       He is right, and it is the sharpest kind of feedback: the feature works
       and is unusable, because the two things you have to know -- point to
       move, pinch to click -- exist only in the source. Nothing on screen ever
       said them.

       So the coaching is part of the HUD rather than a separate tutorial: it
       is present while you are learning and it gets out of the way once you
       have. The steps light up as you actually perform them, which teaches
       faster than a list because you find out that the thing you just did was
       the thing it wanted. */
    /* ── ONE PANEL ────────────────────────────────────────────────────
       Sid: "even after hand tracking is enabled, how my camera preview is
       kind of just randomly floating there."

       It was three separate things stacked in a corner with a gap between
       each -- a bare rounded video, a glass card of instructions, and a line
       of text -- so nothing framed anything and the preview read as a window
       someone had left open on top of the page. They are one panel now: the
       preview is the head of the card, the steps are its body, and the
       privacy line is its foot, all inside one edge. */
    wrap.innerHTML =
      '<div class="hand-hud__panel">' +
      '<canvas class="hand-hud__cv" width="160" height="120"></canvas>' +
      '<div class="hand-coach" id="hand-coach">' +
      '<span class="hand-coach__step" data-step="see"><b></b>show your hand</span>' +
      '<span class="hand-coach__step" data-step="point"><b></b>point to move</span>' +
      '<span class="hand-coach__step" data-step="pinch"><b></b>pinch to click</span>' +
      '<span class="hand-coach__step" data-step="pull"><b></b>open hand to scroll</span>' +
      "</div>" +
      '<span class="hand-hud__tag">camera on · nothing leaves this device</span>' +
      "</div>";
    document.body.appendChild(wrap);
    preview = wrap.querySelector("canvas");
    pctx = preview.getContext("2d");
    coach = wrap.querySelector("#hand-coach");
    coachDone = { see: false, point: false, pinch: false, pull: false };
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
    step("see");
    var lm = hands[0];
    var tip = lm[8]; // index fingertip
    var thumb = lm[4];
    var wrist = lm[0];
    var openCount = 0;
    if (fingerOut(lm[8], lm[5], wrist)) openCount++;
    if (fingerOut(lm[12], lm[9], wrist)) openCount++;
    if (fingerOut(lm[16], lm[13], wrist)) openCount++;
    if (fingerOut(lm[20], lm[17], wrist)) openCount++;
    var handOpen = openCount >= 3;

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
    /* Moved far enough to be a deliberate gesture rather than jitter. */
    if (Math.abs(x - lastX) + Math.abs(y - lastY) > 120) step("point");
    lastX = x;
    lastY = y;

    /* ── OPEN HAND SCROLLS ─────────────────────────────────────────────
       See the note above fingerOut(): scrolling is a held pose now, not a
       held pinch. Raise an open hand and move it vertically; put the
       fingers back down (or pinch, to click instead) and it stops. Gated
       on !pinched so a click in progress cannot also drag the page. */
    if (handOpen && !pinched) {
      var wny = Math.min(1, Math.max(0, (wrist.y - 0.15) / 0.7));
      var wy = fScroll.filter(wny * innerHeight, now);
      if (scrolling) {
        var sdy = wy - scrollLastY;
        if (Math.abs(sdy) > 0.4) {
          window.scrollBy(0, -sdy * SCROLL_GAIN);
          step("pull");
        }
      }
      scrollLastY = wy;
      scrolling = true;
      wrap.classList.add("is-scroll");
    } else {
      scrolling = false;
      wrap.classList.remove("is-scroll");
    }

    /* ── PINCH TO CLICK ────────────────────────────────────────────────
       Held rather than instantaneous, so a hand that drifts slightly while
       closing does not fire a click on the frame the fingers happen to
       meet. If it barely moved between pinch and release, the thing under
       it is activated; if it travelled, nothing is (that is what a
       deliberate drag away from a pinch means, not a click). */
    var d = Math.hypot(tip.x - thumb.x, tip.y - thumb.y);
    if (!pinched && d < PINCH_ON) {
      pinched = true;
      wrap.classList.add("is-pinch");
      step("pinch");
      pinchX = x;
      pinchY = y;
      pinchTravel = 0;
      emit("pointerdown", x, y, { buttons: 1 });
    } else if (pinched) {
      pinchTravel += Math.abs(x - pinchX) + Math.abs(y - pinchY);
      pinchX = x;
      pinchY = y;
      if (d > PINCH_OFF) {
        pinched = false;
        wrap.classList.remove("is-pinch");
        var el = emit("pointerup", x, y);
        if (pinchTravel < 26) {
          try {
            if (el && el.closest) {
              var act = el.closest("a[href],button,[role=button]");
              if (act) act.click();
            }
          } catch (e) {}
        }
      }
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
      btn.setAttribute("data-tip", "Steer off");
      raf = requestAnimationFrame(frame);
    } catch (e) {
      /* Refused permission, no camera, or the CDN is unreachable. Say so on
         the control rather than failing silently, and leave it usable. */
      btn.classList.add("is-failed");
      btn.setAttribute("data-tip", "No camera");
      setTimeout(function () {
        btn.classList.remove("is-failed");
        btn.setAttribute("data-tip", "Hand steer");
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
      coach = null;
      coachDone = null;
    }
    document.documentElement.removeAttribute("data-hand");
    btn.classList.remove("is-on");
    btn.setAttribute("data-tip", "Hand steer");
    pinched = false;
    scrolling = false;
    fx = new Euro(1.4, 0.02);
    fy = new Euro(1.4, 0.02);
    fScroll = new Euro(1.4, 0.02);
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
