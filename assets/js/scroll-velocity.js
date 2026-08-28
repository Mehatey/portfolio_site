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
    /* And --hero-p is deliberately NOT published here.

       I wrote it the other way first, reasoning that the copy's breakaway is
       a scroll-linked position rather than an animation. That reasoning is
       wrong: a headline that fades out and lifts as you scroll IS motion,
       whatever drives it, and someone who has asked for less of it has asked
       for that too.

       Every rule that reads --hero-p carries a 0 fallback, so leaving it
       unset resolves to the same thing the hero looks like before you
       scroll: the copy at full strength, the plate in its corner, the
       figure lit. Verified with the property absent -- opacity 1 on the
       copy, the plate and the foot row. Nothing depends on it existing.

       The hero is also unpinned under reduced motion (see .hero-runway), so
       the section scrolls away normally rather than holding while nothing
       happens inside it. */
    return;
  }

  /* ═════════════════════════════════════════════════════════════════════════
     HOW FAR THROUGH THE HERO

     --hero-p, 0 to 1 across the first screen, smoothed. Everything in the
     home hero that breaks away on scroll reads it: the sentence, the film
     plate's travel and opening, the foot row.

     WHY IT LIVES HERE NOW

     It used to be published by cube-guy.js, inside that renderer's frame loop
     and behind its `if (!ready || !visible || !onScreen) return`. Fine for
     exactly as long as cube-guy was the figure on screen.

     The moment hero-scene.js started rendering -- which is to say the moment
     a one-word shader bug was fixed -- .cg-stage went display:none, its
     IntersectionObserver stopped reporting it on screen, the loop returned
     before the publish, and --hero-p froze at 0.000 for the life of the page.
     That silently took the entire scroll breakaway with it, on the one screen
     every visitor looks at first, and nothing failed loudly enough to notice.

     "How far through the hero am I" was never a fact about a renderer. It is
     a fact about the page, so it is published by the file that already owns
     scroll, next to the velocity, where no figure being swapped for another
     one can switch it off.
     ═════════════════════════════════════════════════════════════════════════ */
  var heroEl = null,
    runwayEl = null,
    heroQueried = false,
    hp = 0,
    hpShown = -1;
  function heroProgress() {
    if (!heroQueried) {
      heroEl = document.getElementById("hero");
      runwayEl = heroEl && heroEl.parentElement && heroEl.parentElement.classList.contains("hero-runway") ? heroEl.parentElement : null;
      heroQueried = true;
    }
    if (!heroEl) return;
    /* The runway, when there is one, is the scroll DISTANCE the sticky hero
       stays put for: the wrapper's height less the one screenful the hero
       itself occupies. Measuring the hero instead would end the sequence
       halfway through the pin, which is the same class of error as measuring
       a scroll effect against the element rather than against its travel.

       Without a wrapper -- phone, reduced motion, any other layout -- it
       falls back to 0.92 of the hero's own height, the number cube-guy.js
       used, so nothing keyed to the old range shifts underneath. */
    var runway = runwayEl
      ? Math.max(1, runwayEl.offsetHeight - (window.innerHeight || heroEl.offsetHeight))
      : Math.max(1, heroEl.offsetHeight * 0.92);
    var target = Math.max(0, Math.min(1, (window.scrollY || 0) / runway));
    /* Lightly smoothed, as before: enough to take a trackpad's stutter out
       without the copy lagging behind the scroll, which would break the link
       between the two. */
    hp += (target - hp) * 0.16;
    /* As a number too, for the renderers. A WebGL layer reading this back off
       computed style would be a forced style resolve inside a frame loop, to
       recover a float this file already holds. */
    window.__heroP = hp;
    if (Math.abs(hp - hpShown) > 0.002) {
      hpShown = hp;
      heroEl.style.setProperty("--hero-p", hp.toFixed(3));
    }
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
    heroProgress();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
