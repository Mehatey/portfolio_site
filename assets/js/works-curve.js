/* ─────────────────────────────────────────────────────────────────────────
   THE GRID BENDS AWAY BEFORE IT GOES UNDER THE HEADER

   Sid: "for works can we have some creative webgl or shader effect of curving
   media from top or bottom or both with some nice physics and motion, like
   those 2026 pro portfolios -- a subtle slight creative effect on the top, or
   maybe just top, like before it enters the nav bar. Something subtle, not
   some crazy curve."

   ── WHY THIS IS NOT WEBGL ───────────────────────────────────────────────
   It was asked for as a shader and it should not be one, for three reasons
   that all point the same way.

   A shader cannot have the cards. Rendering DOM into a GL texture is the wall
   this site has already hit twice -- the loader film and the idle drift both
   ended up compositing real elements instead, because there is no way to hand
   live, lazily-loaded, linked, focusable cards to a fragment shader without
   first destroying every one of those properties.

   /works/ is the page that has to feel fastest: it is where a recruiter
   decides whether to keep going, it already ships 11.9MB, and gl-budget.js
   exists precisely because this site runs out of WebGL contexts on iOS.
   Spending one here to bend rectangles would be the worst trade on the site.

   And the effect itself is a rotation about a horizontal axis. That is one
   GPU-composited transform per card. A shader would be a much more expensive
   way to compute the same matrix.

   ── THE PHYSICS IS REAL, NOT AN EASING CURVE ────────────────────────────
   What makes this read as a sheet rather than as a CSS transition is that the
   bend carries momentum. Each card holds a velocity and a spring: the target
   angle comes from its distance to the header, the actual angle chases it,
   and scrolling hard adds an impulse that overshoots slightly and settles.
   Stop mid-scroll and the grid keeps moving for a beat, the way a real sheet
   would. That is three lines of integration and it is the entire difference
   between "animated" and "physical".

   ── AND IT KNOWS WHEN TO STOP ───────────────────────────────────────────
   Only cards inside the band are touched, the transform is cleared entirely
   once a card is clear of it so nothing holds a compositing layer it does not
   need, and the whole thing yields to the frame governor and to
   prefers-reduced-motion.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  if (!window.matchMedia) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  /* A bend is a pointer-era flourish; on a phone the cards are full width and
     the header is a different shape. */
  if (!matchMedia("(min-width: 900px)").matches) return;

  var cards = [].slice.call(document.querySelectorAll(".wk-card"));
  if (!cards.length) return;

  /* The header band. The grid should start giving way BEFORE it reaches it,
     so the bend leads the disappearance rather than reporting it. */
  var HEAD = 104;
  var BAND = 340;

  /* ── IT DRIVES --lens, IT DOES NOT SET A TRANSFORM ──────────────────────
     The page already has the whole consumer chain: _layouts/works.html reads
     one number per card and derives the squeeze, the spread, the bend and the
     rim from it, applied to the COVER rather than to the card, so the project
     title never distorts. Writing a competing inline transform on .wk-card
     would have overridden the hover lift and duplicated a system that was
     already better factored than the replacement. So this writes the number
     and touches nothing else. */
  var state = cards.map(function (el) {
    return { el: el, a: 0, v: 0, on: false };
  });

  var lastY = window.scrollY,
    impulse = 0,
    raf = 0,
    idle = 0;

  function tick() {
    raf = 0;

    if (window.SidPerf && !window.SidPerf.ok()) {
      /* Shed cleanly rather than freezing mid-bend. */
      for (var q = 0; q < state.length; q++) {
        if (state[q].on) {
          state[q].el.style.removeProperty("--lens");
          state[q].a = 0;
          state[q].v = 0;
          state[q].on = false;
        }
      }
      return;
    }

    var y = window.scrollY;
    var dy = y - lastY;
    lastY = y;
    /* Scroll speed feeds a decaying impulse, so a flick bends the sheet
       harder than a crawl and the extra bend dies on its own. */
    impulse += dy * 0.02;
    impulse *= 0.86;
    if (impulse > 6) impulse = 6;
    else if (impulse < -6) impulse = -6;

    var moving = Math.abs(dy) > 0.2 || Math.abs(impulse) > 0.02;
    var live = false;

    for (var i = 0; i < state.length; i++) {
      var s = state[i];
      var r = s.el.getBoundingClientRect();
      /* Skip anything nowhere near the band, which on this page is most of
         the grid most of the time. */
      if (r.bottom < HEAD - 60 || r.top > HEAD + BAND) {
        if (s.on) {
          s.el.style.removeProperty("--lens");
          s.a = 0;
          s.v = 0;
          s.on = false;
        }
        continue;
      }

      /* 0 at the bottom of the band, 1 once the card's top has reached the
         header. Eased so the bend arrives gently and finishes decisively. */
      var t = 1 - (r.top - HEAD) / BAND;
      if (t < 0) t = 0;
      else if (t > 1) t = 1;
      var e = t * t * (3 - 2 * t);

      var target = e * 9 + impulse * e;

      /* A spring: the angle chases the target, the velocity carries past it,
         and the damping brings it home. */
      s.v += (target - s.a) * 0.18;
      s.v *= 0.78;
      s.a += s.v;

      s.on = true;
      /* The spring runs in degrees for the feel, and is handed over as the
         0..1 the stylesheet expects. Clamped at 1.15 so an overshoot can go a
         little past the resting bend -- which is the whole point of having
         momentum -- without the squeeze going somewhere the CSS was never
         tuned for. */
      var lens = s.a / 9;
      if (lens < 0) lens = 0;
      else if (lens > 1.15) lens = 1.15;
      s.el.style.setProperty("--lens", lens.toFixed(4));

      if (Math.abs(s.v) > 0.01 || e > 0.001) live = true;
    }

    if (moving || live) {
      idle = 0;
      raf = requestAnimationFrame(tick);
    } else if (idle++ < 30) {
      raf = requestAnimationFrame(tick);
    }
  }

  function wake() {
    idle = 0;
    if (!raf) raf = requestAnimationFrame(tick);
  }

  window.addEventListener("scroll", wake, { passive: true });
  window.addEventListener("resize", wake, { passive: true });
  window.addEventListener("sid:perf", wake);
  wake();
})();
