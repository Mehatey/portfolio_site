/* ─────────────────────────────────────────────────────────────────────────
   THE TOP OF THE PAGE IS A LENS

   Sid, with a screenshot of gionatannese.com/projects: "i like the refraction
   in this site on the works on the top when you scroll."

   ── WHAT THAT SITE IS DOING, AND WHAT CAN BE DONE HERE ──────────────────
   It is displacing the project images as they pass under a band at the top of
   the window. Doing that literally requires reading the rendered page back
   into a shader, and a browser gives you no way to do it — the same wall the
   nav glass and the film grade both ran into. Sites that appear to do it put
   the entire page in WebGL.

   So the displacement is done to the elements themselves rather than to a
   picture of them. Each card carries --lens, which is how far into the band
   it has travelled, and the band squeezes what is inside it: the cover
   compresses vertically, spreads horizontally to keep its volume, bends on
   its own axis, blurs along the direction of travel and brightens at the
   rim. That is the same set of things a real cylindrical lens does to what
   passes behind it, applied one card at a time.

   It is not a fake of the effect. It is the effect, computed per element
   because per pixel is not available.

   ── WHY A BAND AND NOT A GRADIENT ───────────────────────────────────────
   A lens has edges, and the edges are what make it legible as an object
   rather than as the page mysteriously going soft at the top. Two hairlines
   and a very slight tint, so there is a thing there whose presence explains
   what is happening to the cards.

   ── COST ────────────────────────────────────────────────────────────────
   One rAF, seventeen getBoundingClientRect calls, and writes only when a
   card's value actually changes — a card sitting still mid-page writes
   nothing, which is most of them most of the time. ───────────────────── */
(function () {
  "use strict";

  var grid = document.querySelector(".wk-grid");
  if (!grid) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var cards = [].slice.call(grid.querySelectorAll(".wk-card"));
  if (!cards.length) return;

  var band = document.createElement("div");
  band.className = "wk-lens";
  band.setAttribute("aria-hidden", "true");
  band.innerHTML = '<i class="wk-lens__e wk-lens__e--t"></i><i class="wk-lens__e wk-lens__e--b"></i>';
  document.body.appendChild(band);

  /* The band sits under the nav. Read from the nav rather than guessed, so
     the two cannot drift apart the next time the nav's height changes — it
     has already gone from 70 to 62 once in this project. */
  function bandTop() {
    var n = document.querySelector(".nav");
    var r = n ? n.getBoundingClientRect() : null;
    return r ? r.bottom + 10 : 84;
  }

  var HEIGHT = 132;
  var last = [];
  var raf = 0;

  function frame() {
    raf = 0;
    var top = bandTop();
    var bot = top + HEIGHT;
    band.style.top = top + "px";
    band.style.height = HEIGHT + "px";

    for (var i = 0; i < cards.length; i++) {
      var r = cards[i].getBoundingClientRect();
      /* Nothing below the band and nothing fully above it. Cheap reject
         first: most of the list is one of those two on any given frame. */
      var v = 0;
      if (r.bottom > top && r.top < bot) {
        /* How much of the card's own height is inside the band, normalised.
           Using overlap rather than the card's top position means a tall card
           and a short one are affected by the same amount of glass. */
        var ov = Math.min(r.bottom, bot) - Math.max(r.top, top);
        v = Math.max(0, Math.min(1, ov / Math.min(HEIGHT, r.height || 1)));
      } else if (r.bottom <= top) {
        /* Above the band entirely: it has been through the glass and is on
           its way out of the window. Hold a little residue so it does not
           snap back to flat the instant it clears. */
        v = Math.max(0, 1 + (r.bottom - top) / 90) * 0.55;
      }
      v = v * v * (3 - 2 * v);
      if (Math.abs(v - (last[i] || 0)) < 0.004) continue;
      last[i] = v;
      cards[i].style.setProperty("--lens", v.toFixed(3));
    }
  }

  function tick() {
    if (!raf) raf = requestAnimationFrame(frame);
  }
  addEventListener("scroll", tick, { passive: true });
  addEventListener("resize", tick);
  tick();
})();
