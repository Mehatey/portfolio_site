/* ════════════════════════════════════════════════════════════════════════
   THE HERO CONDUCTOR

   Sid: "maybe in the beginning, we don't show my background videos with all
   those effects, and we start with the cube guy ... in the middle, at certain
   times, we can have the cube guy's particles kind of drift away slowly and
   then be replaced in a nice WebGL shader-type way. The background of me
   working shows up, but creatively and artfully done, because I feel like
   having the cube guy AND background videos is a little too much. Maybe we
   shift through them in a fairly quick enough fashion, but not too sudden."

   The last sentence of that is the whole design brief and it is a statement
   about time, not about pictures. Both things are good; they are bad
   together; so they take turns. This file is the turn-taking and nothing
   else — it draws no pixels, owns no canvas, and holds no state either of
   the two renderers needs.

   THE SEAM

   Two canvases, two files, one number each:

     assets/js/cube-guy.js     window.__cgSetMelt(0..1)
                               0 = the figure. 1 = every point has drifted
                               off and the canvas is empty.

     assets/js/home-field.js   window.__fieldSetPresence(0..1)
                               0 = the footage canvas is fully transparent.
                               1 = the treated film is the hero's floor.
                               window.__fieldNewLook() picks a different
                               drawing and palette for the next appearance.

   Neither file knows this one exists, and both default to sensible
   behaviour if it never runs: the figure stands, the film sits at full
   presence, and the page is what it was. That is deliberate — a hero whose
   two halves both go blank because a third script 404'd is not a hero.

   THE BEAT

     FIGURE   6.5s   he has the frame. This is the state the page opens in.
     LEAVING  2.6s   he dissolves; the film rises underneath him, starting
                     0.45s late so the middle of the beat is HIM leaving
                     rather than a cross-fade of two subjects.
     FILM     6.0s   the footage, as the field draws it — a different
                     treatment and palette every time it comes round.
     RETURN   2.4s   the film goes first, he reassembles into the space it
                     leaves.

   About seventeen and a half seconds a lap. "Fairly quick, but not too
   sudden" is a narrow window and this is the middle of it: long enough that
   neither state feels like a flash, short enough that a visitor who scrolls
   at a normal rate sees the handoff happen at least once.

   WHAT STOPS IT

     · reduced motion — parked on FIGURE for good. The dissolve is the whole
       effect, and there is no reduced version of it that is worth having.
     · the hero off screen — an IntersectionObserver stops the clock rather
       than the animation, so coming back to the top of the page resumes the
       beat where it was instead of restarting it mid-dissolve.
     · a hidden tab — same, via visibilitychange. Without it the clock runs
       on while rAF is throttled to a crawl, and returning to the tab lands
       you three beats into a sequence you never saw.
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var hero = document.getElementById("hero");
  if (!hero) return;

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Milliseconds. One place, so the rhythm is tunable without reading the
     state machine. */
  var T_FIGURE = 6500,
    T_LEAVING = 2600,
    T_FILM = 6000,
    T_RETURN = 2400,
    /* How far into LEAVING the film starts to arrive, and how far into
       RETURN it has finished going. Both are offsets INTO their beat, which
       is what keeps the two curves from being mirror images of each other. */
    FILM_IN_DELAY = 450,
    FILM_OUT_LEAD = 300;

  var STILL = 0,
    LEAVING = 1,
    FILM = 2,
    RETURN = 3;

  var state = STILL,
    /* Elapsed inside the current beat. Advanced by measured frame time
       rather than by comparing timestamps to a start mark, so a stall does
       not teleport the sequence forward. */
    el = 0,
    last = 0,
    onScreen = true,
    raf = 0;

  /* smoothstep, so every ramp starts and ends at rest. A linear dissolve
     reads as a wipe with a hard in and out at both ends. */
  function ease(x) {
    x = x < 0 ? 0 : x > 1 ? 1 : x;
    return x * x * (3 - 2 * x);
  }

  function melt(v) {
    if (window.__cgSetMelt) window.__cgSetMelt(v);
  }
  function film(v) {
    if (window.__fieldSetPresence) window.__fieldSetPresence(v);
  }

  /* Published for the page's own CSS: --hero-beat runs 0 → 1 across the two
     handoffs and sits at 0 while either subject is holding. The copy uses it
     to ease its own weight down a little as the frame changes hands, so the
     type belongs to the transition instead of sitting on top of it. */
  function publish(v) {
    hero.style.setProperty("--hero-beat", v.toFixed(3));
  }

  /* ── REDUCED MOTION ─────────────────────────────────────────────────────
     Not "the same thing, slower". The figure stays, the film stays away, and
     the hero is one composition that never changes hands. Everything the
     sequence was carrying — who he is, what he makes, what the room looks
     like — is on the page as type and as the work below it. */
  if (REDUCED) {
    melt(0);
    film(0);
    publish(0);
    return;
  }

  function step(now) {
    raf = 0;
    if (!last) last = now;
    /* Clamped: a tab that was backgrounded, or a frame the GPU took a
       quarter of a second over, must not advance the beat by that amount. */
    var dt = Math.min(64, now - last);
    last = now;

    if (onScreen && !document.hidden) el += dt;

    switch (state) {
      case STILL:
        melt(0);
        film(0);
        publish(0);
        if (el >= T_FIGURE) {
          state = LEAVING;
          el = 0;
          /* Asked for here rather than at the top of FILM so the wipe that
             carries the new treatment has the whole dissolve to run in and
             the film is already the picture it means to be by the time it
             is fully present. */
          if (window.__fieldNewLook) window.__fieldNewLook();
        }
        break;

      case LEAVING:
        melt(ease(el / T_LEAVING));
        film(ease((el - FILM_IN_DELAY) / (T_LEAVING - FILM_IN_DELAY)));
        publish(ease(el / T_LEAVING));
        if (el >= T_LEAVING) {
          state = FILM;
          el = 0;
        }
        break;

      case FILM:
        melt(1);
        film(1);
        publish(1);
        if (el >= T_FILM) {
          state = RETURN;
          el = 0;
        }
        break;

      case RETURN:
        /* The film leaves first and finishes early; he comes back into the
           space it has already vacated. Reversed — him arriving over a
           picture that is still there — reads as two things occupying one
           frame, which is the exact complaint the sequence exists to fix. */
        film(1 - ease(el / (T_RETURN - FILM_OUT_LEAD)));
        melt(1 - ease(el / T_RETURN));
        publish(1 - ease(el / T_RETURN));
        if (el >= T_RETURN) {
          state = STILL;
          el = 0;
        }
        break;
    }

    raf = requestAnimationFrame(step);
  }

  /* ── THE CLOCK STOPS WHEN NOBODY IS LOOKING ─────────────────────────────
     `el` stops advancing but the loop keeps running, so the two renderers go
     on receiving the values they already had rather than being left to hold
     whatever the last frame happened to set. Cheap: two function calls per
     frame against two shaders that are already drawing. */
  if (window.IntersectionObserver) {
    new IntersectionObserver(
      function (es) {
        onScreen = es[0].isIntersecting;
      },
      { threshold: 0.02 }
    ).observe(hero);
  }
  document.addEventListener(
    "visibilitychange",
    function () {
      /* Drop the stale mark so the first frame back measures from itself
         rather than from whenever the tab was hidden. */
      last = 0;
    },
    { passive: true }
  );

  /* A verification hook, not a feature. Nothing on the page calls it; it
     lets a headless run hold any beat still and screenshot it, which is the
     only way to check that a dissolve looks like a dissolve. */
  window.__heroBeat = function (s, frac) {
    if (s === undefined) return { state: state, el: el };
    state = s | 0;
    el = (frac || 0) * [T_FIGURE, T_LEAVING, T_FILM, T_RETURN][state];
    return null;
  };

  raf = requestAnimationFrame(step);
})();
