/* ═══════════════════════════════════════════════════════════════════════════
   THE SWARM — KINETIC TYPE THAT RESOLVES

   Sid: "i also really love the kinetic type on the bottom on this site can u
   incorporate something like that in my site too" (revelatio.studio).

   WHAT THEIRS DOES, AND THE ONE THING I WOULD CHANGE

   Revelatio's footer is a band of individual characters drifting in a
   physical field, disturbed by the pointer. It is beautiful and it is
   permanent noise: the glyphs are random, they never mean anything, and
   nothing is lost when they scatter because there was no arrangement to
   lose.

   So this one has a rest state that READS. At rest the field spells

     SIDDHARTH MEHTA · PRODUCT DESIGNER · NEW YORK · OPEN TO ROLES

   in three lines. Disturb it and the characters break formation, swarm, and
   then find their way back. The scatter costs something, which is what makes
   it worth doing -- you are pulling apart a sentence, not stirring soup, and
   watching it reassemble is the whole payoff.

   Every character is one this site already says somewhere. There is no
   random glyph in the set.

   THE PHYSICS

   Each character is a particle with a home. Three forces, in the order they
   matter:

     · a spring back to its home, critically damped enough that a letter
       returns without ringing
     · a repulsion from the pointer, falling off with the square of distance
     · the site's own scroll velocity, applied as a shear -- so throwing the
       page rakes the field sideways and stopping lets it settle

   Integrated on a fixed step for the same reason the pinned cards are: a
   variable step changes the effective damping with the framerate, so the
   same disturbance would settle at a different rate on a 60Hz and a 120Hz
   display.

   WHY CANVAS AND NOT WEBGL

   Four hundred glyphs is well inside what fillText does comfortably, the
   text stays crisp at any device pixel ratio without an atlas, and a footer
   band does not need a fourth GL context on a page that already has several.
   The right tool is the boring one here.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var host = document.getElementById("swarm");
  if (!host) return;

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var LINES = ["SIDDHARTH MEHTA", "PRODUCT DESIGNER · NEW YORK", "OPEN TO ROLES"];

  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);
  var ctx = canvas.getContext("2d");
  if (!ctx) {
    host.remove();
    return;
  }

  var chars = [],
    raf = 0,
    last = 0,
    live = false,
    dpr = 1,
    W = 0,
    H = 0;
  var ptr = { x: -9999, y: -9999 },
    burst = 0;

  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = host.clientWidth,
      h = host.clientHeight;
    if (!w || !h) return false;
    W = w;
    H = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* Homes are measured, not guessed: the glyphs are laid out with the same
       metrics the canvas will draw them with, so a letter's rest position is
       exactly where it would sit if this were ordinary type. That is what
       makes the resolved state read as a line rather than as an arrangement
       of characters that happens to be nearly a line. */
    /* Up from 1.9% of the width. At that size 48 characters sat in the
       middle of a 400px band and read as a caption; this is a band, and the
       type in it has to be the thing you are looking at. */
    var size = Math.max(18, Math.min(46, w * 0.029));
    ctx.font = "500 " + size + "px 'DM Mono', ui-monospace, monospace";
    var keep = chars.length > 0;
    var out = [];
    var lineH = size * 2.3;
    var top = h / 2 - ((LINES.length - 1) * lineH) / 2;
    var n = 0;
    for (var li = 0; li < LINES.length; li++) {
      var text = LINES[li];
      var tw = ctx.measureText(text).width;
      var x = (w - tw) / 2;
      for (var ci = 0; ci < text.length; ci++) {
        var ch = text[ci];
        var cw = ctx.measureText(ch).width;
        if (ch !== " ") {
          var old = keep && chars[n];
          out.push({
            c: ch,
            hx: x,
            hy: top + li * lineH,
            x: old ? old.x : x,
            y: old ? old.y : top + li * lineH,
            vx: old ? old.vx : 0,
            vy: old ? old.vy : 0,
            /* Per-character stiffness, so the line does not snap home as one
               object. Seeded off the index rather than random, so a reload
               settles the same way. */
            k: 34 + ((n * 37) % 23),
            r: 0,
            vr: 0,
          });
          n++;
        }
        x += cw;
      }
    }
    chars = out;
    return true;
  }

  function step(dt) {
    var sv = window.__sv ? window.__sv() : { v: 0, a: 0 };
    for (var i = 0; i < chars.length; i++) {
      var c = chars[i];
      /* Spring home. */
      var ax = (c.hx - c.x) * c.k;
      var ay = (c.hy - c.y) * c.k;
      /* Damping just under critical for this stiffness, so a letter arrives
         quickly and does not ring. */
      ax -= c.vx * 7.4;
      ay -= c.vy * 7.4;

      /* The pointer pushes. Inverse square, capped, so a character near the
         cursor leaves fast and one across the band barely notices. */
      var dx = c.x - ptr.x,
        dy = c.y - ptr.y;
      var d2 = dx * dx + dy * dy;
      if (d2 < 42000) {
        var f = 4200 / (d2 + 220);
        var inv = 1 / Math.sqrt(d2 + 0.001);
        ax += dx * inv * f;
        ay += dy * inv * f;
        c.vr += dx * inv * f * 0.0012;
      }

      /* Scroll rakes the field. Sideways only: a vertical push would fight
         the spring's own axis and read as jitter. */
      ax += sv.v * 260;

      c.vx += ax * dt;
      c.vy += ay * dt;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      /* Rotation is driven by horizontal speed and springs back to upright,
         so a character leans into its own travel and rights itself as it
         settles -- the same idea the hero's floating letters use. */
      c.vr += (0 - c.r) * 12 * dt - c.vr * 5.5 * dt + c.vx * 0.0009;
      c.r += c.vr * dt;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var light = document.documentElement.getAttribute("data-theme") === "light";
    for (var i = 0; i < chars.length; i++) {
      var c = chars[i];
      /* Displaced characters dim and the settled ones are bright, so the
         resolved sentence is the brightest thing in the band and a scattered
         field reads as having lost something. */
      var off = Math.min(1, (Math.abs(c.x - c.hx) + Math.abs(c.y - c.hy)) / 140);
      var a = 0.9 - off * 0.62;
      ctx.save();
      ctx.translate(c.x, c.y);
      if (c.r) ctx.rotate(c.r);
      ctx.globalAlpha = a;
      ctx.fillStyle = light ? "#14171c" : "#e9ecf2";
      ctx.fillText(c.c, 0, 0);
      ctx.restore();
    }
  }

  function frame(now) {
    raf = 0;
    if (!live) return;
    var dt = Math.min(0.05, (now - last) / 1000) || 0.016;
    last = now;
    /* Fixed sub-steps. A stiff spring integrated on a variable frame delta
       settles at a different rate on a 60Hz and a 120Hz display -- the
       framerate bug this codebase has now found four times. */
    var acc = dt,
      guard = 0;
    while (acc > 0 && guard < 6) {
      var h = Math.min(1 / 120, acc);
      step(h);
      acc -= h;
      guard++;
    }
    draw();
    raf = requestAnimationFrame(frame);
  }

  function onMove(e) {
    var r = host.getBoundingClientRect();
    ptr.x = e.clientX - r.left;
    ptr.y = e.clientY - r.top;
  }
  function onLeave() {
    ptr.x = ptr.y = -9999;
  }
  function onDown(e) {
    /* A shove, not a reset: every character takes an impulse away from the
       point of contact, and the springs bring the sentence back. */
    var r = host.getBoundingClientRect();
    var px = e.clientX - r.left,
      py = e.clientY - r.top;
    for (var i = 0; i < chars.length; i++) {
      var c = chars[i];
      var dx = c.x - px,
        dy = c.y - py;
      var d = Math.sqrt(dx * dx + dy * dy) + 1;
      var f = Math.min(900, 26000 / d);
      c.vx += (dx / d) * f;
      c.vy += (dy / d) * f;
      c.vr += (dx / d) * 0.9;
    }
  }

  /* Only while it is on screen. */
  var io = new IntersectionObserver(
    function (es) {
      live = es[0].isIntersecting && !REDUCED;
      if (live) {
        last = performance.now();
        if (!raf) raf = requestAnimationFrame(frame);
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    { rootMargin: "15% 0px" }
  );

  if (!layout()) {
    /* Zero-sized at boot: try again once layout has settled rather than
       giving up, which is what an element inside a lazily-revealed footer
       does on the first measure. */
    setTimeout(function () {
      if (layout()) io.observe(host);
    }, 400);
  } else {
    io.observe(host);
  }

  if (REDUCED) {
    /* Drawn once, at rest, so the sentence is there and nothing moves. */
    draw();
  } else {
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave, { passive: true });
    host.addEventListener("pointerdown", onDown, { passive: true });
  }
  window.addEventListener("resize", function () {
    layout();
    if (REDUCED) draw();
  });

  /* A verification hook, not a feature. */
  window.__swarm = function () {
    var off = 0;
    for (var i = 0; i < chars.length; i++) off += Math.abs(chars[i].x - chars[i].hx) + Math.abs(chars[i].y - chars[i].hy);
    return { chars: chars.length, live: live, displacement: +off.toFixed(1) };
  };
})();
