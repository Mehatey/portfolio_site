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
    baseSize = 20;

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
    /* ── THE ECHOES ─────────────────────────────────────────────────────
       Sid, on noth.in: "this type of kinetic type and simplicity is so
       beautifully animated i love it."

       What that site does that mine did not: it shows the SAME sentence at
       several stages of resolution at once. One clean instance in the middle
       and a dozen half-formed copies scattered around it, each caught
       somewhere between legible and dissolved. It is one idea rendered as a
       process rather than as a state, and it is why the page reads as a thing
       thinking rather than a thing animating.

       So the band gains echoes. The centre copy is exact -- that is the one
       you read -- and each ghost carries a `decay` that scatters its
       characters from their homes by a fixed per-character amount, dims it,
       and shrinks it. A ghost at 0.2 is a sentence you can almost read; one
       at 0.9 is debris that used to be words.

       The offsets are seeded off the character index rather than random, so
       every visit shows the same arrangement -- a field that reshuffles on
       reload is a screensaver, and this one is supposed to look like the same
       thought, held at several depths.

       Ghosts drift, obey the pointer and take the scroll shear like
       everything else, but their springs pull them back to their DISPLACED
       home rather than the true one. They never resolve. That is the point:
       the middle one is the only sentence that made it. */
    var GHOSTS = [
      { x: 0.14, y: 0.2, d: 0.55, s: 0.52 },
      { x: 0.82, y: 0.16, d: 0.75, s: 0.46 },
      { x: 0.24, y: 0.78, d: 0.35, s: 0.6 },
      { x: 0.76, y: 0.82, d: 0.62, s: 0.5 },
      { x: 0.5, y: 0.08, d: 0.9, s: 0.4 },
      { x: 0.08, y: 0.52, d: 0.85, s: 0.42 },
      { x: 0.92, y: 0.55, d: 0.45, s: 0.55 },
    ];
    for (var gi = 0; gi < GHOSTS.length; gi++) {
      var g = GHOSTS[gi];
      var gsize = size * g.s;
      ctx.font = "500 " + gsize + "px 'DM Mono', ui-monospace, monospace";
      var glh = gsize * 2.1;
      var gtop = h * g.y - ((LINES.length - 1) * glh) / 2;
      for (var gl = 0; gl < LINES.length; gl++) {
        var gt = LINES[gl];
        var gw = ctx.measureText(gt).width;
        var gx = w * g.x - gw / 2;
        for (var gc = 0; gc < gt.length; gc++) {
          var gch = gt[gc];
          var gcw = ctx.measureText(gch).width;
          if (gch !== " ") {
            /* Seeded scatter. Two different multipliers on the same index so
               x and y are not correlated, which they would visibly be with
               one. */
            var sx = (((n * 71) % 100) / 100 - 0.5) * gsize * 5.5 * g.d;
            var sy = (((n * 131) % 100) / 100 - 0.5) * gsize * 3.2 * g.d;
            out.push({
              c: gch,
              hx: gx + sx,
              hy: gtop + gl * glh + sy,
              x: gx + sx,
              y: gtop + gl * glh + sy,
              vx: 0,
              vy: 0,
              k: 20 + ((n * 29) % 18),
              r: (((n * 53) % 100) / 100 - 0.5) * 0.5 * g.d,
              vr: 0,
              /* Ghosts keep their own size and their own dimness, and they
                 are never counted as resolved -- see draw(). */
              size: gsize,
              ghost: 0.34 - g.d * 0.2,
            });
            n++;
          }
          gx += gcw;
        }
      }
    }
    ctx.font = "500 " + size + "px 'DM Mono', ui-monospace, monospace";
    baseSize = size;
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
    ctx.font = "500 " + baseSize + "px 'DM Mono', ui-monospace, monospace";
    var light = document.documentElement.getAttribute("data-theme") === "light";
    for (var i = 0; i < chars.length; i++) {
      var c = chars[i];
      /* Displaced characters dim and the settled ones are bright, so the
         resolved sentence is the brightest thing in the band and a scattered
         field reads as having lost something. */
      var off = Math.min(1, (Math.abs(c.x - c.hx) + Math.abs(c.y - c.hy)) / 140);
      /* The resolved copy is bright and the echoes are not. That contrast is
         the whole composition: one sentence made it, the rest are still
         trying. */
      var a = c.ghost !== undefined ? c.ghost * (1 - off * 0.5) : 0.9 - off * 0.62;
      ctx.save();
      ctx.translate(c.x, c.y);
      if (c.r) ctx.rotate(c.r);
      ctx.globalAlpha = Math.max(0, a);
      if (c.size && c.size !== baseSize) ctx.font = "500 " + c.size + "px 'DM Mono', ui-monospace, monospace";
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
