/* ═══════════════════════════════════════════════════════════════════════════
   THE MEDIA BENDS

   Sid, pointing at paul-michel.framer.website: "you see when you scroll on
   this site how the media bends a bit at the bottom, that makes it feel fluid
   and alive. what i wanted you to do for works and for play page."

   WHAT IS ACTUALLY HAPPENING THERE

   The pictures do not move -- their bottom EDGE does. Scrolling down, the
   edge arcs so the middle hangs lower than the corners, as though the sheet
   the picture is printed on is being dragged and the middle is the last part
   to catch up. Stop, and it flattens. It is drag, drawn.

   That is why it reads as alive rather than as an effect: the amount is a
   function of how fast you are moving, so the page answers the hand rather
   than running an animation at it.

   HOW IT IS DONE HERE

   One <clipPath> in objectBoundingBox units, shared by every element that
   opts in. Bounding-box units mean a single path fits a 400px cover and a
   1600px strip without knowing either size, and one path rewritten per frame
   is one DOM write for the whole page rather than one per picture.

   The amount comes from --sv, the signed damped scroll velocity that
   scroll-velocity.js already publishes for the whole site. Nothing here
   measures scroll itself: there is exactly one velocity on this site and
   everything that reacts to speed reads the same number, or two effects that
   should agree drift apart.

   WHY THE CURVE FLIPS RATHER THAN NEGATES

   A clip can only take away. Feeding a negative bend into the same path
   moves the control point below the box, where it is clipped and nothing
   visible changes -- so scrolling up would do nothing. Up gets its own path:
   the middle is trimmed instead of the corners, so the edge arcs the other
   way. Same gesture, mirrored, and both stay inside the box.

   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var html = document.documentElement;

  /* Nothing to bend, nothing to build. Both pages that use this carry the
     class on their media; anything else on the site is untouched. */
  if (!document.querySelector(".bend-media")) return;

  /* A bend is a motion cue. Somebody who asked for less motion gets a
     straight edge, which is what the media had before any of this. */
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var NS = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(NS, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";

  var defs = document.createElementNS(NS, "defs");
  var clip = document.createElementNS(NS, "clipPath");
  clip.setAttribute("id", "media-bend");
  clip.setAttribute("clipPathUnits", "objectBoundingBox");
  var path = document.createElementNS(NS, "path");
  path.setAttribute("d", "M0,0 H1 V1 H0 Z");
  clip.appendChild(path);
  defs.appendChild(clip);
  svg.appendChild(defs);
  document.body.appendChild(svg);

  /* ── HOW DEEP ──────────────────────────────────────────────────────────
     0.042 of the element's height at full speed, which on a 545px cover is
     about 23px of arc across the whole width -- visible as a curve, never as
     a corner being cut off. Started at 0.028 and it was too polite next to
     the reference: at rest both are perfectly straight, so the entire effect
     lives in the half second after a flick and it has to be legible in that
     window or it may as well not be there.

     A FRACTION OF HEIGHT IS THE CATCH. Bounding-box units are what let one
     path serve every element, and they also mean the arc scales with the
     element -- fine from a 315px card to a 545px cover, absurd on one of
     /play/'s 3,000px strips, where 4.2% is 137px of picture cut away. Those
     opt out on load; see the guard in play/index.html. */
  var MAX = 0.042;

  var shown = -999;

  function frame() {
    /* Read the published velocity rather than measuring scroll again. It is
       already damped with a fast attack and a slow release, which is exactly
       the curve a trailing edge wants -- the bend should arrive with the
       gesture and coast out of it. */
    var sv = parseFloat(getComputedStyle(html).getPropertyValue("--sv")) || 0;
    var b = sv * MAX;

    /* Quantised to a thousandth. A clip path rewrite re-rasterises every
       element referencing it, so it is worth not writing when the number has
       not meaningfully moved -- at rest that is zero writes a second. */
    var q = Math.round(b * 1000);
    if (q !== shown) {
      shown = q;
      var a = Math.abs(b);
      var d;
      if (q === 0) {
        d = "M0,0 H1 V1 H0 Z";
      } else if (b > 0) {
        /* Scrolling down: the corners lift and the middle stays, so the edge
           hangs in the centre. The quadratic's midpoint works out at exactly
           1 for any a, which is what keeps the deepest point of the picture
           intact however hard you throw the page. */
        d = "M0,0 H1 V" + (1 - a).toFixed(4) + " Q0.5," + (1 + a).toFixed(4) + " 0," + (1 - a).toFixed(4) + " Z";
      } else {
        /* Scrolling up: the corners stay and the middle lifts. */
        d = "M0,0 H1 V1 Q0.5," + (1 - 2 * a).toFixed(4) + " 0,1 Z";
      }
      path.setAttribute("d", d);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
