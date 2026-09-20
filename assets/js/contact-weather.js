/* ── LIGHT RAIN, AND BIRDS ─────────────────────────────────────────────
   Sid: "this page looks a bit boring can we reduce size of desk and make
   it breathe a bit and also add some light rain here and some pixel birds
   to make it come alive."

   One fixed canvas behind the page's content. Rain: ~140 thin streaks
   falling at slightly different speeds and lengths, faint, with a little
   wind. Birds: a few pixel sprites on the site's 3px cell grid, crossing
   the upper third now and then in a loose V, wings on a two-frame beat.
   Both are drawn in ink at low alpha so they read on the dark room and the
   cream one alike. Paused when the tab is hidden and under reduced motion. */
(function () {
  "use strict";
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var host = document.body;
  var canvas = document.createElement("canvas");
  canvas.className = "contact-weather";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;";
  /* Behind the page: the shell and the desk sit at z-index 1 and above. */
  host.insertBefore(canvas, host.firstChild);
  var ctx = canvas.getContext("2d");
  var W = 0,
    H = 0,
    dpr = 1;

  function size() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  window.addEventListener("resize", size, { passive: true });

  function ink() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "16,22,30" : "220,232,248";
  }

  /* rain */
  var drops = [];
  for (var i = 0; i < 140; i++) {
    drops.push({ x: Math.random(), y: Math.random(), l: 10 + Math.random() * 18, v: 0.55 + Math.random() * 0.6, a: 0.05 + Math.random() * 0.1 });
  }

  /* birds: a 7x5 sprite, two frames */
  var FRAMES = [
    ["..X...X", ".X.X.X.", "X...X..", ".......", "......."],
    [".......", "X.....X", ".X.X.X.", "..X.X..", "......."],
  ];
  var flocks = [];
  function spawn() {
    var n = 3 + Math.floor(Math.random() * 4);
    var dir = Math.random() < 0.5 ? 1 : -1;
    var y0 = H * (0.12 + Math.random() * 0.25);
    var speed = 38 + Math.random() * 22;
    var birds = [];
    for (var k = 0; k < n; k++) {
      birds.push({ dx: -k * 26 * dir + (k % 2 ? 4 : 0), dy: Math.abs(k - (n - 1) / 2) * 14, ph: Math.random() * 6 });
    }
    flocks.push({ x: dir > 0 ? -160 : W + 160, y: y0, dir: dir, v: speed, birds: birds, t: 0 });
  }
  var nextFlock = 2 + Math.random() * 4;

  function bird(x, y, frame, alpha) {
    var cell = 3;
    ctx.fillStyle = "rgba(" + ink() + "," + alpha + ")";
    var rows = FRAMES[frame];
    for (var r = 0; r < rows.length; r++) {
      for (var c = 0; c < rows[r].length; c++) {
        if (rows[r][c] === "X") ctx.fillRect(Math.round(x + c * cell), Math.round(y + r * cell), cell, cell);
      }
    }
  }

  var last = 0,
    running = true,
    raf = 0;
  function frame(now) {
    raf = 0;
    if (!running) return;
    var dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;
    ctx.clearRect(0, 0, W, H);

    /* rain */
    var wind = Math.sin(now / 4000) * 0.12;
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    for (var i = 0; i < drops.length; i++) {
      var d = drops[i];
      d.y += d.v * dt * 0.9;
      d.x += wind * dt * 0.08;
      if (d.y > 1.05) {
        d.y = -0.05;
        d.x = Math.random();
      }
      if (d.x > 1.02) d.x = -0.02;
      var x = d.x * W,
        y = d.y * H;
      ctx.strokeStyle = "rgba(" + ink() + "," + d.a + ")";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + wind * d.l * 2, y + d.l);
      ctx.stroke();
    }

    /* birds */
    nextFlock -= dt;
    if (nextFlock <= 0 && flocks.length < 2) {
      spawn();
      nextFlock = 9 + Math.random() * 12;
    }
    for (var f = flocks.length - 1; f >= 0; f--) {
      var fl = flocks[f];
      fl.t += dt;
      fl.x += fl.dir * fl.v * dt;
      for (var b = 0; b < fl.birds.length; b++) {
        var bb = fl.birds[b];
        var fr = Math.floor((fl.t * 4 + bb.ph) % 2);
        var bob = Math.sin(fl.t * 1.6 + bb.ph) * 3;
        bird(fl.x + bb.dx, fl.y + bb.dy + bob, fr, 0.5);
      }
      if ((fl.dir > 0 && fl.x > W + 200) || (fl.dir < 0 && fl.x < -200)) flocks.splice(f, 1);
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    last = 0;
    if (running && !raf) raf = requestAnimationFrame(frame);
  });
})();
