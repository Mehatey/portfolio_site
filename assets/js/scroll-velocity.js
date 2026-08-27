/* ═══════════════════════════════════════════════════════════════════════════
   SCROLL VELOCITY

   Its own file, and not part of motion_stack.js, for one concrete reason:
   /play/ needs it and must not have Lenis. That page runs its own ambient
   auto-scroll, and a smooth-scroll library driving the same scrollTop is two
   things arguing over one number. Velocity is the only part of the motion
   stack every page wants, so it is the part that ships alone.

   Everything else about it is in the comment below.
   ═══════════════════════════════════════════════════════════════════════════ */
/* ═════════════════════════════════════════════════════════════════════════
   SCROLL VELOCITY, PUBLISHED ONCE

   Sid: "there was supposed to be some scroll based animation ... coming from
   bottom and going to the top like a curve ... to make the scroll feel more
   vivid and motion and playful."

   WHY THIS AND NOT MORE TRANSITIONS

   Everything scroll-driven on this site so far keys off scroll POSITION:
   --sp above, the reveal classes, the hero's --hero-p. Position tells you
   WHERE the reader is. It cannot tell you HOW THEY ARE MOVING, and that is
   the whole difference between a page that animates and a page that feels
   kinetic. A tile that always rises the same way over the same distance
   looks identical whether someone is easing down the page or throwing it,
   so scrolling never feels like an act the page noticed.

   So one signed, damped velocity is published for the whole site to read:

     --sv    signed, -1 (up, fast) to 1 (down, fast)
     --sva   its magnitude, 0 to 1, for anything that does not care which
             way you went -- a blur, a stretch, a curvature

   Written on <html>, so any element anywhere can key off it in pure CSS
   with no listener of its own, and read by the WebGL layers through
   window.__sv. One subscriber, one damped value, every consumer in sync.
   A dozen components each running their own scroll maths is how the numbers
   end up disagreeing about how fast the page is going.

   NORMALISATION. 2600 px/s is a firm trackpad flick; past it the value
   clamps, so the effect has a ceiling rather than going through the floor
   on a mouse wheel with a big delta. Damping is per SECOND, not per frame,
   so it settles at the same rate at 60Hz and 120Hz -- the exact bug already
   found and fixed in hero-scene's arrival term.
   ═════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var html = document.documentElement;
  if (REDUCED) {
    /* Published as zero rather than left undefined, so consumers can read
       var(--sv) with no fallback dance and simply get stillness. */
    html.style.setProperty("--sv", "0");
    html.style.setProperty("--sva", "0");
    window.__sv = function () {
      return { v: 0, a: 0 };
    };
    return;
  }

  var MAX = 2600; /* px/s that reads as 1 */
  var lastY = window.scrollY || 0,
    lastT = performance.now();
  var v = 0,
    shown = 0;

  window.__sv = function () {
    return { v: v, a: Math.abs(v) };
  };

  function tick(now) {
    var dt = Math.min(0.1, (now - lastT) / 1000) || 0.016;
    lastT = now;
    var y = window.scrollY || 0;
    var raw = (y - lastY) / dt / MAX;
    lastY = y;
    if (raw > 1) raw = 1;
    else if (raw < -1) raw = -1;

    /* Attack fast, release slow. Rising to a new speed should feel
       immediate -- the page reacting late to a flick is worse than not
       reacting -- while falling back to rest wants to coast, because an
       instant snap to zero the moment the fingers stop is what makes
       velocity effects read as a glitch rather than as momentum. */
    var k = Math.abs(raw) > Math.abs(v) ? 14 : 4.2;
    v += (raw - v) * Math.min(1, k * dt);
    if (Math.abs(v) < 0.0015) v = 0;

    /* Only touched when it actually moved. Writing two custom properties
       on <html> every frame invalidates style for the whole document, and
       at rest that is sixty full recalcs a second to say "still zero". */
    if (Math.abs(v - shown) > 0.004 || (v === 0 && shown !== 0)) {
      shown = v;
      html.style.setProperty("--sv", v.toFixed(3));
      html.style.setProperty("--sva", Math.abs(v).toFixed(3));
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
