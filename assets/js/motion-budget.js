/* ─────────────────────────────────────────────────────────────────────────
   WHEN THE MACHINE CANNOT KEEP UP, THE DECORATION GOES FIRST

   Measured on 6 Sep with the CPU throttled 4x, which is roughly a mid-range
   laptop three years old — the machine a recruiter actually opens this on:

       /          13 fps    71 long tasks
       /play/     15 fps    54 long tasks
       /works/    23 fps    14 long tasks
       /mool/     44 fps     2 long tasks

   Unthrottled every one of those is 39 to 58 fps, which is why it never
   showed up: the site is fine on the machine it was built on.

   The cause is not any one layer. Instrumented, a two second scroll on the
   home page schedules rAF callbacks from FOURTEEN independent loops — the
   nav glass, the scenery, the caustics, two GL fields, the cube, the hero
   scene, the scroll velocity, the collectibles, the wind, the magnetic
   controls, the jaali — plus 22 canvases. Each one is individually cheap and
   was measured as cheap when it was written. Together they are a slideshow.

   ── WHY A GOVERNOR AND NOT A BUDGET ─────────────────────────────────────
   gl-budget.js already caps how many WebGL contexts a page may open, and it
   works: mobile home went from nine contexts to seven. But a context cap is
   a static decision made at build time, and this is a dynamic problem — the
   same page is smooth on one machine and unusable on another. The only
   honest input is the frame rate the visitor is actually getting.

   So this measures, and publishes. It does not decide what to drop: each
   layer decides for itself whether it is decoration, by calling ok() and
   returning early. A layer that does not ask keeps running, which is the
   right default — the ones that matter should not have to opt in to
   working.

   ── HYSTERESIS, OR IT OSCILLATES ────────────────────────────────────────
   Shedding layers raises the frame rate, which would immediately re-enable
   them, which lowers it again. The thresholds are therefore asymmetric and
   there is a floor on how often the state may change: it drops to low below
   20fps sustained over three seconds, and comes back above 40 sustained over
   three. Between those it holds whatever it is. See the note beside the
   thresholds for why 20 and not 26.

   Verified against real browsing: unthrottled, /, /works/ and /play/ all stay
   full, so nothing changes on the machine this was built on. At four times
   throttle / and /play/ drop to low and /works/ holds, which is the shape you
   want -- the heaviest pages shed and the rest do not.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var root = document.documentElement;

  /* Somebody who has asked for less motion gets the reduced set immediately
     and permanently, without having to earn it by having a slow machine. */
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  var state = reduced ? "low" : "full";
  var frames = 0,
    since = 0,
    lowFor = 0,
    highFor = 0;

  function publish(next) {
    if (next === state) return;
    state = next;
    root.setAttribute("data-perf", state);
    /* Layers that need to tear something down rather than merely skip a
       frame get told. Everything else just reads ok() on its next tick. */
    try {
      window.dispatchEvent(new CustomEvent("sid:perf", { detail: { state: state } }));
    } catch (e) {}
  }
  root.setAttribute("data-perf", state);

  if (!reduced) {
    var tick = function (now) {
      if (!since) since = now;
      frames++;
      var span = now - since;
      if (span >= 1000) {
        var fps = (frames * 1000) / span;
        frames = 0;
        since = now;

        /* ── DELIBERATELY CONSERVATIVE ────────────────────────────────
           The first pass shed decoration below 26fps, and measured against
           real browsing that fired on /play/ on a perfectly good machine --
           201 images, an auto-scroll and a GL field is genuinely the heaviest
           page here, and it sits in the thirties unthrottled.

           That is the wrong trade. A governor that changes what the author
           sees on his own machine is a governor that will be tuned by taste
           rather than by need, and the whole point is insurance for the
           visitor whose laptop cannot cope. Below twenty is not "could be
           smoother", it is a slideshow, and nobody looking at a slideshow
           would rather keep the wind.

           Frame rate is also noisy enough that a single bad second means
           nothing: three consecutive seconds under, and three over to come
           back. */
        if (fps < 20) {
          lowFor += 1;
          highFor = 0;
        } else if (fps > 40) {
          highFor += 1;
          lowFor = 0;
        } else {
          lowFor = 0;
          highFor = 0;
        }

        /* Three seconds either way. */
        if (lowFor >= 3) publish("low");
        else if (highFor >= 3) publish("full");
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* The one thing every decorative loop calls. Cheap on purpose: it is read
     once per frame per layer, so it must not do work of its own. */
  window.SidPerf = {
    ok: function () {
      return state === "full";
    },
    state: function () {
      return state;
    },
  };
})();
