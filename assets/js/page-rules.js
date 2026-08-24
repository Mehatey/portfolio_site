/* ═══════════════════════════════════════════════════════════════════════════
   THE FRAME IS A SET OF STRINGS

   Sid: "i want creative grid lines when you hover they vibrate like a water
   ripple ... grid lines dont have to be music."

   So no audio. What is left is the physics, and the physics is the whole
   effect: these are four lines held at both ends, which is a string. Running a
   real one-dimensional wave along them costs almost nothing and behaves
   correctly for free -- a disturbance travels away from where you touched it
   in both directions at once, reflects off the fixed ends, passes back through
   itself and interferes. None of that has to be authored. A tween cannot do
   it, and the difference is legible: a tweened wobble is centred on the cursor
   forever, a wave leaves the cursor behind.

   HOW IT IS DRIVEN

   The pointer does not "hover the line" -- a 1px target nobody can hit is not
   an interaction. It has a reach, and it plucks: the injection is proportional
   to the pointer's SPEED along the line as well as its nearness, so drawing
   the cursor across a rule strums it and parking on one does nothing. That is
   the difference between a line that reacts to you and a line that reacts to
   your attention.

   WHY SVG AND NOT CANVAS

   Four polylines of ninety points. A canvas would need its own DPR handling,
   its own resize path and a full clear-and-repaint per frame to draw what is,
   in the end, four strokes. The SVG path costs one `d` string per line per
   frame and inherits the frame's colour, its opacity variable and its
   light-theme override from the CSS that was already there.

   The loop sleeps. It only runs while some line still holds energy or the
   pointer is close enough to matter, so a page nobody is touching pays
   nothing.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var host = document.querySelector(".prules");
  if (!host) return;
  var svg = host.querySelector(".prules__svg");
  if (!svg) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var N = 90; // samples per line
  var REACH = 118; // px from the line at which a pluck still registers
  var GAIN = 0.42; // how hard speed converts to displacement
  /* ── WHY THERE ARE CEILINGS ──────────────────────────────────────────────
     The scheme is stable -- symplectic Euler on a discrete Laplacian, and 4*C2
     is well under the limit -- but stability is not the same as boundedness
     under a driven load. pluck() runs once per frame, so drawing the cursor
     slowly along a rule injects on every one of those frames, and without a
     ceiling the velocity field simply accumulates: measured, a single 30-frame
     strum reached a peak of 2336px and was still climbing at 3369px three
     seconds after the pointer had left. A string cannot be driven past its own
     amplitude, so both terms are clamped. */
  var MAXA = 3.4; // ceiling on one injection, px
  var VCAP = 3.2; // ceiling on a sample's velocity
  var UCAP = 13; // ceiling on a sample's displacement
  var C2 = 0.24; // wave speed squared, in samples
  /* ── AND WHY THERE IS A SPRING ───────────────────────────────────────────
     A pure wave equation conserves the shape it is given: the only restoring
     force is the curvature between neighbours, so a stretch of line displaced
     by the SAME amount everywhere has zero curvature and no reason to come
     back. It returns only by propagating out to the pinned ends, which is
     slow. Clamping made that the normal case rather than a corner one -- the
     ceiling flattens the crest into exactly such a plateau -- and the measured
     result was a rule that rang up to the cap and then simply stayed there,
     bent, indefinitely.

     So the string sits on a weak elastic bed: every sample is pulled toward
     its own rest position as well as toward its neighbours. Small enough that
     the travelling wave still reads as a travelling wave, large enough that
     the line always comes home. */
  var K = 0.018; // restoring pull toward the line's rest position
  var DAMP = 0.952; // per step; below 1 or it rings forever
  var SETTLE = 0.08; // px under which a line counts as still

  var lines = [];
  ["l", "r", "t", "b"].forEach(function (k) {
    var el = svg.querySelector('[data-rule="' + k + '"]');
    if (!el) return;
    lines.push({
      el: el,
      vertical: k === "l" || k === "r",
      u: new Float32Array(N),
      v: new Float32Array(N),
      a: 0,
      b: 0, // the line's two endpoints along its own axis
      fixed: 0, // its position on the other axis
      live: false,
    });
  });
  if (!lines.length) return;

  /* Geometry is read from the CSS custom properties the frame already owns, so
     the strings sit exactly where the rules used to and there is no second
     source of truth for the margin. */
  function layout() {
    var cs = getComputedStyle(host);
    var x = parseFloat(cs.getPropertyValue("--pr-x")) || 36;
    var t = parseFloat(cs.getPropertyValue("--pr-t")) || 70;
    var bo = parseFloat(cs.getPropertyValue("--pr-b")) || 92;
    var W = host.clientWidth || window.innerWidth;
    var H = host.clientHeight || window.innerHeight;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    for (var i = 0; i < lines.length; i++) {
      var L = lines[i];
      if (L.vertical) {
        L.a = 0;
        L.b = H;
        L.fixed = L.el.getAttribute("data-rule") === "l" ? x : W - x;
      } else {
        L.a = x;
        L.b = W - x;
        L.fixed = L.el.getAttribute("data-rule") === "t" ? t : H - bo;
      }
    }
    draw();
  }

  function draw() {
    for (var i = 0; i < lines.length; i++) {
      var L = lines[i];
      var span = L.b - L.a;
      var d = "";
      for (var j = 0; j < N; j++) {
        var along = L.a + (span * j) / (N - 1);
        var off = L.fixed + L.u[j];
        d += (j ? "L" : "M") + (L.vertical ? off.toFixed(2) + " " + along.toFixed(2) : along.toFixed(2) + " " + off.toFixed(2));
        if (j < N - 1) d += " ";
      }
      L.el.setAttribute("d", d);
    }
  }

  /* ── the pluck ──────────────────────────────────────────────────────────
     Speed along the line, not raw pointer speed: dragging straight at a rule
     and stopping should not ring it, and sliding along one should. The bump is
     a narrow gaussian rather than a single sample, or the wave starts as a
     step and the first thing it does is ring at the sample rate. */
  var px = -1e4,
    py = -1e4,
    lastX = -1e4,
    lastY = -1e4;

  function pluck() {
    var dxp = px - lastX,
      dyp = py - lastY;
    lastX = px;
    lastY = py;
    for (var i = 0; i < lines.length; i++) {
      var L = lines[i];
      var perp = L.vertical ? Math.abs(px - L.fixed) : Math.abs(py - L.fixed);
      if (perp > REACH) continue;
      var alongPos = L.vertical ? py : px;
      if (alongPos < L.a || alongPos > L.b) continue;
      var speed = L.vertical ? dyp : dxp;
      if (Math.abs(speed) < 0.4) continue;
      var near = 1 - perp / REACH;
      near = near * near;
      /* Signed by which side the pointer is on, so the line is pushed away
         from the cursor rather than always the same way. */
      var side = (L.vertical ? px - L.fixed : py - L.fixed) >= 0 ? 1 : -1;
      /* Speed is already px-per-frame, so the injection is per-frame by
         construction and needs no dt -- but it must not be able to pump the
         string indefinitely just because someone is moving slowly enough to
         stay in reach for a hundred frames. The ceiling is on the string's
         energy, applied in step(); this one only shapes a single tap. */
      var amp = Math.min(MAXA, Math.abs(speed) * GAIN * near) * side;
      var centre = ((alongPos - L.a) / (L.b - L.a)) * (N - 1);
      for (var j = 0; j < N; j++) {
        var dj = (j - centre) / 5.5;
        var g = Math.exp(-dj * dj);
        if (g < 0.004) continue;
        L.v[j] += amp * g;
      }
      L.live = true;
    }
  }

  /* ── A FIXED TIMESTEP, NOT A PER-FRAME ONE ───────────────────────────────
     Every constant above is a per-step figure, so integrating once per
     animation frame makes the whole effect a function of the display: a 120Hz
     panel damps twice as fast as a 60Hz one and the same pluck rings for half
     as long. That is a real bug and it is also what made this hard to tune --
     the measuring rig runs rAF slowly because the page is carrying a WebGL
     field, so decay that looked far too slow there was partly just fewer steps
     happening than wall-clock suggested.

     So the wave runs on its own clock at a fixed 60 steps a second, and the
     frame consumes however many of those have come due. Capped at four, or a
     backgrounded tab returning after a minute would try to integrate three
     thousand steps in one frame and lock the page. */
  var acc = 0,
    prev = 0;
  function advance(now) {
    if (!prev) prev = now;
    acc += Math.min(0.25, (now - prev) / 1000);
    prev = now;
    var ran = false,
      n = 0;
    while (acc >= 1 / 60 && n < 4) {
      acc -= 1 / 60;
      n++;
      if (step()) ran = true;
    }
    if (n === 0) {
      for (var i = 0; i < lines.length; i++) if (lines[i].live) ran = true;
    }
    if (n >= 4) acc = 0;
    return ran;
  }

  function step() {
    var any = false;
    for (var i = 0; i < lines.length; i++) {
      var L = lines[i];
      if (!L.live) continue;
      var u = L.u,
        v = L.v;
      var peak = 0;
      /* Ends are pinned: j runs 1..N-2, so u[0] and u[N-1] stay 0 and the wave
         reflects off them the way a string reflects off its bridge. */
      for (var j = 1; j < N - 1; j++) {
        v[j] += (u[j - 1] - 2 * u[j] + u[j + 1]) * C2 - u[j] * K;
        v[j] *= DAMP;
        if (v[j] > VCAP) v[j] = VCAP;
        else if (v[j] < -VCAP) v[j] = -VCAP;
      }
      for (var k = 1; k < N - 1; k++) {
        u[k] += v[k];
        if (u[k] > UCAP) {
          u[k] = UCAP;
          v[k] *= 0.5;
        } else if (u[k] < -UCAP) {
          u[k] = -UCAP;
          v[k] *= 0.5;
        }
        var m = u[k] < 0 ? -u[k] : u[k];
        if (m > peak) peak = m;
      }
      if (peak < SETTLE) {
        u.fill(0);
        v.fill(0);
        L.live = false;
      } else any = true;
    }
    return any;
  }

  var raf = 0;
  function frame(now) {
    raf = 0;
    pluck();
    var moving = advance(now || performance.now());
    draw();
    if (moving || near()) raf = requestAnimationFrame(frame);
    else prev = 0;
  }
  function near() {
    for (var i = 0; i < lines.length; i++) {
      var L = lines[i];
      var perp = L.vertical ? Math.abs(px - L.fixed) : Math.abs(py - L.fixed);
      if (perp <= REACH) return true;
    }
    return false;
  }
  function wake() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  window.addEventListener(
    "pointermove",
    function (e) {
      px = e.clientX;
      py = e.clientY;
      wake();
    },
    { passive: true }
  );
  window.addEventListener(
    "pointerleave",
    function () {
      px = py = -1e4;
    },
    { passive: true }
  );
  window.addEventListener("resize", layout, { passive: true });

  layout();

  /* A verification hook, not a feature. */
  window.__pageRules = function () {
    return {
      lines: lines.length,
      live: lines.filter(function (L) {
        return L.live;
      }).length,
      peak: +lines
        .reduce(function (m, L) {
          for (var i = 0; i < N; i++) m = Math.max(m, Math.abs(L.u[i]));
          return m;
        }, 0)
        .toFixed(2),
    };
  };
})();
