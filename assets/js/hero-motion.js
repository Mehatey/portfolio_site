/* ═══════════════════════════════════════════════════════════════════════════
   TWO SMALL INTERACTIONS THAT MAKE THE HERO ONE PICTURE

   Sid: "improve more interactivity think visual designer animator pro."

   Neither of these is a new effect on top of the page. Both take something
   already on screen and connect it to something else already on screen, which
   is the difference between a page with animations on it and a page that
   behaves like one object.

   1. THE HEADLINE IS LIT BY THE SCENE. The hero has a real key light in
      assets/js/hero-scene.js and the type was flat white sitting over it --
      two layers. --lx carries the pointer's horizontal position into the
      headline's gradient, so the highlight travels across the words from the
      same side the room lights him from. It is a custom property and a
      background-clip, so it costs one paint and no layout.

   2. THE LINKS PULL. Standard award-site vocabulary, and this site already
      has a custom cursor to hang it on -- a target that leans toward you as
      you approach reads as the page noticing your intent rather than waiting
      for your click. Kept small: past about eight pixels it stops feeling like
      magnetism and starts feeling like the link is dodging.

   Everything is written on rAF from passive listeners, so the handlers
   themselves do no layout and each property is touched once a frame at most.
   Reduced motion gets neither.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var hero = document.getElementById("hero");
  var cols = document.querySelector(".hero__cols");

  /* ── 1. the light on the type ──────────────────────────────────────────── */
  if (hero && cols) {
    var lx = 0.5,
      tlx = 0.5,
      lraf = 0;
    function lightTick() {
      lraf = 0;
      lx += (tlx - lx) * 0.08;
      cols.style.setProperty("--lx", lx.toFixed(3));
      if (Math.abs(tlx - lx) > 0.002) lraf = requestAnimationFrame(lightTick);
    }
    window.addEventListener(
      "pointermove",
      function (e) {
        tlx = e.clientX / Math.max(1, window.innerWidth);
        if (!lraf) lraf = requestAnimationFrame(lightTick);
      },
      { passive: true }
    );
  }

  /* ── 2. magnetic links ─────────────────────────────────────────────────── */
  var MAG = 8; // px of pull at the centre. More reads as the link dodging.
  var REACH = 64; // px at which it starts
  var targets = [].slice.call(document.querySelectorAll(".studio-link, .gal-go, .hero__stamp-open"));
  if (!targets.length) return;

  var mx = 0,
    my = 0,
    mraf = 0;

  function magTick() {
    mraf = 0;
    var moving = false;
    for (var i = 0; i < targets.length; i++) {
      var t = targets[i];
      var r = t.getBoundingClientRect();
      /* Skipped once it is off screen: sixteen getBoundingClientRect calls a
         frame is fine, sixteen transforms on elements nobody can see is waste. */
      if (r.bottom < -40 || r.top > (window.innerHeight || 0) + 40) {
        if (t.__mag) {
          t.style.transform = "";
          t.__mag = 0;
        }
        continue;
      }
      var cx = r.left + r.width / 2,
        cy = r.top + r.height / 2;
      var dx = mx - cx,
        dy = my - cy;
      var d = Math.hypot(dx, dy);
      var pull = d < r.width / 2 + REACH ? 1 - d / (r.width / 2 + REACH) : 0;
      pull = pull * pull;
      var ox = dx * pull * (MAG / 24),
        oy = dy * pull * (MAG / 24);
      var prev = t.__mag || 0;
      var now = Math.hypot(ox, oy);
      if (now > 0.05 || prev > 0.05) {
        t.style.transform = "translate3d(" + ox.toFixed(2) + "px," + oy.toFixed(2) + "px,0)";
        t.__mag = now;
        if (now > 0.05) moving = true;
      }
    }
    if (moving) mraf = requestAnimationFrame(magTick);
  }

  window.addEventListener(
    "pointermove",
    function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (!mraf) mraf = requestAnimationFrame(magTick);
    },
    { passive: true }
  );

  /* A verification hook, not a feature. */
  window.__heroMotion = function () {
    return {
      lit: !!cols,
      lx: cols ? cols.style.getPropertyValue("--lx") : null,
      magnets: targets.length,
      pulled: targets.filter(function (t) {
        return (t.__mag || 0) > 0.05;
      }).length,
    };
  };
})();
