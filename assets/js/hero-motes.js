/* ── THE FIGURE SHEDS PIXELS ──────────────────────────────────────────────
   Sid: "can we have some hover particles effect on the 3d model and some
   click stuff."

   A canvas laid over the figure's stage. While the pointer is over him, a
   few square motes a frame drift off from under the cursor in his own four
   colours (cream head, orange tee, teal trousers, navy shoes), rise, and
   fade. A click throws a ring of them outward. He also turns to look when
   the pointer arrives: the model already carries a "Look" animation. The
   click reaction that was already there is untouched. */
(function () {
  "use strict";
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia && window.matchMedia("(hover: none)").matches) return;
  var stage = document.getElementById("cg-stage");
  var model = document.getElementById("cg-model");
  if (!stage) return;

  var COLS = ["#efe9dc", "#e9a33b", "#2f8f8a", "#1c2a52"];
  var canvas = document.createElement("canvas");
  canvas.className = "cg-motes";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3;";
  stage.appendChild(canvas);
  var ctx = canvas.getContext("2d");
  var dpr = 1,
    W = 0,
    H = 0;
  function size() {
    var r = stage.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width;
    H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  window.addEventListener("resize", size, { passive: true });

  var motes = [],
    over = false,
    px = 0,
    py = 0,
    raf = 0,
    last = 0;
  function spawn(x, y, n, speed, spread) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2;
      var v = speed * (0.4 + Math.random() * 0.6);
      motes.push({
        x: x + (Math.random() - 0.5) * spread,
        y: y + (Math.random() - 0.5) * spread,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - speed * 0.5,
        s: 3 + Math.floor(Math.random() * 2) * 2,
        c: COLS[Math.floor(Math.random() * COLS.length)],
        life: 0,
        ttl: 0.9 + Math.random() * 0.8,
      });
    }
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function frame(now) {
    raf = 0;
    var dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;
    ctx.clearRect(0, 0, W, H);
    if (over) spawn(px, py, 1, 26, 18);
    for (var i = motes.length - 1; i >= 0; i--) {
      var m = motes[i];
      m.life += dt;
      if (m.life > m.ttl) {
        motes.splice(i, 1);
        continue;
      }
      m.vy -= 18 * dt; /* they rise */
      m.vx *= 0.985;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      var t = m.life / m.ttl;
      ctx.globalAlpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
      ctx.fillStyle = m.c;
      ctx.fillRect(Math.round(m.x), Math.round(m.y), m.s, m.s);
    }
    ctx.globalAlpha = 1;
    if (motes.length || over) raf = requestAnimationFrame(frame);
    else last = 0;
  }

  stage.addEventListener(
    "pointermove",
    function (e) {
      var r = stage.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
    },
    { passive: true }
  );
  stage.addEventListener(
    "pointerenter",
    function (e) {
      over = true;
      var r = stage.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(frame);
      /* He looks up when you arrive, if he is not already busy. */
      if (model && model.availableAnimations && model.availableAnimations.indexOf("Look") !== -1 && model.animationName === "Idle") {
        model.animationName = "Look";
        model.play({ repetitions: 1 });
        setTimeout(
          function () {
            if (model.animationName === "Look") {
              model.animationName = "Idle";
              model.play();
            }
          },
          (model.duration || 1.2) * 1000 + 80
        );
      }
    },
    { passive: true }
  );
  stage.addEventListener(
    "pointerleave",
    function () {
      over = false;
    },
    { passive: true }
  );
  stage.addEventListener(
    "pointerup",
    function (e) {
      var r = stage.getBoundingClientRect();
      spawn(e.clientX - r.left, e.clientY - r.top, 46, 140, 30);
    },
    { passive: true }
  );
})();
