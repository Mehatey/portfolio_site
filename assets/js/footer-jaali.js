/* ─────────────────────────────────────────────────────────────────────────
   THE FLOOR OF THE PAGE IS A BLOCK PRINT

   Sid: "on the bottom of the footer can we have a pretty indian blue pattern
   tile thing going on which is interactive. Look at the site and look at the
   effects and what we are playing with and try and experiment on your own."

   ── WHAT IT IS ──────────────────────────────────────────────────────────
   A band of indigo tiles across the very bottom of every page, drawn in the
   language of a hand block print: one motif, repeated, slightly wrong every
   time. The wrongness is the entire point. A machine-printed repeat is a
   texture you stop seeing; a hand-printed one is a surface, because the block
   lands a hair off register, takes a little more or less dye, and turns a
   degree between presses. Every tile here carries its own tiny offset,
   rotation and ink density, all stable per tile, so the row reads as printed
   rather than as tiled.

   ── THE MOTIF ───────────────────────────────────────────────────────────
   A jaali: the pierced lattice screen, an eight-point star made by crossing
   two squares. It is drawn as strokes rather than fills so the light behind
   it comes through the way it does through a carved screen, which is what a
   jaali is for. Four rings of detail, and how many are drawn depends on how
   close the pointer is -- see below.

   ── HOW IT IS INTERACTIVE ───────────────────────────────────────────────
   Not "tiles light up near the mouse", which is a hover state wearing a
   costume. The pointer is a LAMP behind the screen: near it the lattice opens
   into its finer orders, the ink lifts, and the tile turns a few degrees
   toward the light. Move away and the pattern closes again. So the gesture is
   about revealing depth in the pattern, not about painting it.

   Clicking presses a tile: it takes more ink and blooms outward into its
   neighbours, the way a block does when you lean on it.

   ── COST ────────────────────────────────────────────────────────────────
   One canvas, 120px tall, redrawn only while the pointer is near it or a
   press is settling. Idle, it paints nothing and holds no rAF.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  if (!window.matchMedia) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var host = document.querySelector(".ftr");
  if (!host) return;

  var cv = document.createElement("canvas");
  cv.className = "ftr__jaali";
  cv.setAttribute("aria-hidden", "true");
  host.appendChild(cv);
  var ctx = cv.getContext("2d");
  if (!ctx) return;

  var TILE = 62;
  var H = 124;
  var W = 0,
    dpr = 1,
    cols = 0,
    rows = 2;

  /* Indigo. Real indigo is not one blue: it is a dye that goes down uneven
     and oxidises darker where it pooled, so the palette is three values of
     the same hue and the tile picks one from its own hash. */
  var INK = ["44, 74, 138", "30, 54, 108", "62, 98, 168"];

  function hash(i, salt) {
    var n = Math.sin(i * 91.7 + salt * 47.3) * 43758.5453;
    return n - Math.floor(n);
  }

  function size() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = host.clientWidth || window.innerWidth;
    cols = Math.ceil(W / TILE) + 1;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  window.addEventListener("resize", size, { passive: true });

  var mx = -9999,
    my = -9999,
    raf = 0,
    presses = [];

  /* One jaali cell. `lit` is 0 to 1 and decides how many orders of the
     lattice are drawn, which is the depth the lamp reveals. */
  function motif(cx, cy, r, lit, ink, alpha) {
    ctx.strokeStyle = "rgba(" + ink + "," + alpha.toFixed(3) + ")";

    /* Order one: the containing square. Always drawn, so the grid of the
       screen exists even in the dark. */
    ctx.lineWidth = 1;
    ctx.strokeRect(-r, -r, r * 2, r * 2);

    /* Order two: the eight-point star, two squares crossed. This is the
       motif proper and it comes in almost immediately. */
    if (lit > 0.06) {
      var a2 = Math.min(1, lit / 0.34);
      ctx.globalAlpha = a2;
      var s = r * 0.82;
      ctx.beginPath();
      ctx.rect(-s, -s, s * 2, s * 2);
      ctx.stroke();
      ctx.save();
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.rect(-s * 0.74, -s * 0.74, s * 1.48, s * 1.48);
      ctx.stroke();
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    /* Order three: the pierced centre. */
    if (lit > 0.36) {
      var a3 = Math.min(1, (lit - 0.36) / 0.3);
      ctx.globalAlpha = a3;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    /* Order four: the spokes, which only appear right under the lamp. This
       is the reward for going close, and it is the difference between a
       pattern that responds and a pattern that has something in it. */
    if (lit > 0.66) {
      var a4 = Math.min(1, (lit - 0.66) / 0.34);
      ctx.globalAlpha = a4 * 0.9;
      ctx.beginPath();
      for (var k = 0; k < 8; k++) {
        var an = (k / 8) * Math.PI * 2;
        ctx.moveTo(Math.cos(an) * r * 0.34, Math.sin(an) * r * 0.34);
        ctx.lineTo(Math.cos(an) * r * 0.78, Math.sin(an) * r * 0.78);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  function frame(now) {
    raf = 0;
    ctx.clearRect(0, 0, W, H);

    /* Where the lamp is, in canvas space. */
    var r = cv.getBoundingClientRect();
    var lx = mx - r.left,
      ly = my - r.top;
    var near = mx > -9000 && ly > -260 && ly < H + 260;

    var live = false;
    for (var j = 0; j < rows; j++) {
      for (var i = 0; i < cols; i++) {
        var idx = j * cols + i;
        var cx = i * TILE + TILE / 2;
        var cy = j * TILE + TILE / 2 + (H - rows * TILE) / 2;

        /* The block never lands twice in the same place. */
        var ox = (hash(idx, 1) - 0.5) * 3.4;
        var oy = (hash(idx, 2) - 0.5) * 3.4;
        var rot = (hash(idx, 3) - 0.5) * 0.1;
        var ink = INK[(hash(idx, 4) * INK.length) | 0];
        /* How much dye this impression took. */
        var dye = 0.24 + hash(idx, 5) * 0.3;

        var lit = 0;
        if (near) {
          var dx = cx - lx,
            dy = cy - ly;
          /* A gaussian, so the lamp has no edge. */
          lit = Math.exp(-(dx * dx + dy * dy) / 26000);
        }

        /* Presses bloom outward from where they landed. */
        for (var q = 0; q < presses.length; q++) {
          var pr = presses[q];
          var age = (now - pr.t) / 900;
          if (age > 1) continue;
          live = true;
          var pd = Math.hypot(cx - pr.x, cy - pr.y);
          var front = age * 340;
          var band = Math.exp(-Math.pow((pd - front) / 90, 2));
          lit = Math.min(1, lit + band * (1 - age) * 1.5);
        }

        if (lit > 0.004) live = true;

        ctx.save();
        ctx.translate(cx + ox, cy + oy);
        ctx.rotate(rot + lit * 0.16);
        motif(cx, cy, TILE * 0.4, lit, ink, dye + lit * 0.5);
        ctx.restore();
      }
    }

    /* Keep running while the lamp is over the band or a press is settling.
       Otherwise stop: an idle footer should cost nothing. */
    presses = presses.filter(function (p) {
      return now - p.t < 900;
    });
    if (near || live) raf = requestAnimationFrame(frame);
  }

  function wake() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  window.addEventListener(
    "pointermove",
    function (e) {
      mx = e.clientX;
      my = e.clientY;
      wake();
    },
    { passive: true }
  );
  window.addEventListener(
    "scroll",
    function () {
      if (mx > -9000) wake();
    },
    { passive: true }
  );
  host.addEventListener(
    "pointerdown",
    function (e) {
      var r = cv.getBoundingClientRect();
      /* Only presses on the band itself. A click on the headline should not
         set the floor rippling. */
      if (e.clientY < r.top - 20) return;
      presses.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() });
      wake();
    },
    { passive: true }
  );
  /* One paint on arrival so the band exists before anybody touches it. */
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) wake();
    }).observe(cv);
  } else wake();
})();
