/* ═══════════════════════════════════════════════════════════════════════════
   SMOOTH SCROLL

   Lenis owns one requestAnimationFrame loop. It pauses with the tab and is
   disabled for reduced motion. No ScrollTrigger dependency: the old triggers
   only wrote an unused --sp property on every section.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function start() {
    var L = window.Lenis;
    var lenis = null;

    if (L && !REDUCED) {
      lenis = new L({
        /* 1.05 rather than the 1.2 default. Measured against the reference
           sites, a longer duration reads as lag on a trackpad — the page keeps
           travelling after the fingers stop, which feels like weight on a
           mouse wheel and like latency on a Mac. */
        duration: 1.05,
        easing: function (t) {
          return Math.min(1, 1.001 - Math.pow(2, -10 * t));
        },
        smoothWheel: true,
        /* Touch is left alone. Native momentum on iOS is better than anything
           a library does on top of it, and hijacking it is the single most
           common way a smooth-scroll site feels broken on a phone. */
        smoothTouch: false,
      });
      document.documentElement.classList.add("lenis");
      window.__lenis = lenis;
    }

    if (!lenis) return;

    var raf = 0;
    function frame(time) {
      raf = requestAnimationFrame(frame);
      lenis.raf(time);
    }
    function resume() {
      if (!document.hidden && !raf) raf = requestAnimationFrame(frame);
    }
    function pause() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) pause();
      else resume();
    });
    window.addEventListener("pagehide", pause);
    window.addEventListener("pageshow", resume);
    resume();
  }

  if (document.readyState === "complete" || document.readyState === "interactive") setTimeout(start, 0);
  else window.addEventListener("DOMContentLoaded", start);
})();
