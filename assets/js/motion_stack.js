/* ═══════════════════════════════════════════════════════════════════════════
   SMOOTH SCROLL, AND THE THING THAT RIDES IT

   Lenis on four of the six award sites scanned, GSAP on three. This wires both
   and hands GSAP's ScrollTrigger Lenis's clock, which is the one detail that
   is easy to miss and breaks everything if you do: ScrollTrigger listens to
   native scroll events, Lenis replaces native scrolling with a transform on a
   rAF, so without scrollerProxy every trigger fires on the raw wheel position
   while the page is somewhere else entirely.
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

    var gsap = window.gsap,
      ST = window.ScrollTrigger;
    if (gsap && ST) {
      gsap.registerPlugin(ST);

      if (lenis) {
        /* The handshake. Lenis drives, ScrollTrigger reads from it, and only
           one rAF exists — running both loops independently is what causes the
           one-frame stutter you see on sites that wire this carelessly. */
        lenis.on("scroll", ST.update);
        gsap.ticker.add(function (time) {
          lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
      }

      /* ── WHAT SCROLLTRIGGER IS ACTUALLY FOR HERE ──────────────────────────
         Not another reveal: the site already has two of those. This is the
         thing neither of them can do — a value that tracks scroll POSITION
         continuously rather than firing once on entry.

         Every section publishes how far through itself the reader is, as a CSS
         custom property. Anything can then key off it without writing its own
         scroll listener, which is how the page ends up with one scroll
         subscriber instead of nine. */
      var secs = document.querySelectorAll("section, .cs-section, .proj-body > *");
      for (var i = 0; i < secs.length; i++) {
        (function (el) {
          ST.create({
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            onUpdate: function (self) {
              el.style.setProperty("--sp", self.progress.toFixed(3));
            },
          });
        })(secs[i]);
      }
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") setTimeout(start, 0);
  else window.addEventListener("DOMContentLoaded", start);
})();
