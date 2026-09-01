/* object-ascii.js — the ground behind the cube, written in characters.
 *
 * Sid: "we can have the cube on a page with an interesting ascii or something
 * nice on hover for the background."
 *
 * TWO DECISIONS WORTH KEEPING.
 *
 * It is a 2D canvas, not WebGL. gl-budget.js exists because this site was
 * opening twelve WebGL contexts on the home page and iOS Safari keeps about
 * eight; adding a thirteenth for a decorative field would have spent the
 * budget on the least important thing on the page. A character grid is
 * exactly what 2D canvas is good at, so it costs nothing against that cap.
 *
 * It shares strip-ascii.js's ramp and cell metrics rather than inventing a
 * second ASCII language. That file already established the rule that matters:
 * the ramp is ordered by INK COVERAGE, not by ASCII value, because the eye
 * reads the picture out of glyph density and a non-monotonic ramp reads as
 * noise. Two different ASCII treatments on one page would read as two
 * different sites.
 *
 * At rest almost nothing is drawn: the ambient field sits mostly under the
 * ink floor, so the section looks like quiet texture. The pointer raises a
 * soft bump around itself and the characters bloom out of the dark where your
 * hand is. That is the whole interaction, and it is the reason this is on
 * hover rather than running on a timer -- a field that churns on its own is
 * wallpaper, one that answers you is a surface.
 */
(function () {
  "use strict";

  var sec = document.getElementById("hs-object");
  if (!sec) return;
  var stage = sec.querySelector(".obj-stage") || sec;

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Same ramp and the same reasoning as strip-ascii.js. */
  var RAMP = " .·:-=+ic*%#@";
  var CW = 13;
  var CH = 17;

  var cv = document.createElement("canvas");
  cv.className = "obj-ascii";
  cv.setAttribute("aria-hidden", "true");
  var ctx = cv.getContext("2d");
  if (!ctx) return;
  stage.insertBefore(cv, stage.firstChild);

  var W = 0,
    H = 0,
    cols = 0,
    rows = 0,
    dpr = 1;

  function size() {
    var r = sec.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.round(r.width);
    H = Math.round(r.height);
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    cv.style.width = W + "px";
    cv.style.height = H + "px";
    cols = Math.ceil(W / CW);
    rows = Math.ceil(H / CH);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = '12px ui-monospace, "DM Mono", Menlo, monospace';
    ctx.textBaseline = "top";
    return true;
  }

  /* A cheap value-noise field. Two offset sine products rather than a real
     gradient noise: at this cell size the difference is invisible and this
     costs no table and no allocation. */
  function ambient(x, y, t) {
    return (
      0.5 +
      0.25 * Math.sin(x * 0.21 + t * 0.00021) * Math.cos(y * 0.27 - t * 0.00017) +
      0.25 * Math.sin((x + y) * 0.11 - t * 0.00009)
    );
  }

  /* Pointer state in canvas space. -999 parks it off the field so the bump
     contributes nothing before the first move and after the pointer leaves. */
  var px = -999,
    py = -999,
    warmth = 0, /* eased 0..1 presence, so arriving and leaving are not steps */
    targetWarmth = 0;

  var RADIUS = 230;

  var live = false;
  var raf = 0;

  function draw(now) {
    raf = 0;
    if (!live) return;

    warmth += (targetWarmth - warmth) * 0.07;

    ctx.clearRect(0, 0, W, H);

    var inkFloor = 0.55 - warmth * 0.06;
    var r2 = RADIUS * RADIUS;

    for (var gy = 0; gy < rows; gy++) {
      var cy = gy * CH;
      for (var gx = 0; gx < cols; gx++) {
        var cx = gx * CW;

        var v = ambient(gx, gy, now) * 0.42;

        if (warmth > 0.01) {
          var dx = cx - px,
            dy = cy - py;
          var d2 = dx * dx + dy * dy;
          if (d2 < r2) {
            /* Smooth falloff, squared so the edge of the bloom is soft rather
               than a visible disc. */
            var f = 1 - d2 / r2;
            v += f * f * warmth * 0.95;
          }
        }

        if (v <= inkFloor) continue;

        var t = (v - inkFloor) / (1 - inkFloor);
        if (t > 1) t = 1;
        var ch = RAMP[Math.min(RAMP.length - 1, Math.round(t * (RAMP.length - 1)))];
        if (ch === " ") continue;

        ctx.globalAlpha = 0.06 + t * 0.5;
        ctx.fillText(ch, cx, cy);
      }
    }
    ctx.globalAlpha = 1;

    /* Keep animating only while there is something to animate: a settled
       field with the pointer away is a still image and does not need frames. */
    if (Math.abs(targetWarmth - warmth) > 0.002 || warmth > 0.01) {
      raf = requestAnimationFrame(draw);
    }
  }

  function kick() {
    if (!raf && live) raf = requestAnimationFrame(draw);
  }

  function paintStill() {
    /* One frame, no loop: what the section looks like before you touch it and
       what reduced-motion gets permanently. */
    live = true;
    draw(0);
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  /* Only run while the section is actually on screen. */
  var io = new IntersectionObserver(
    function (es) {
      live = es[0].isIntersecting;
      if (live) kick();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    { rootMargin: "200px" }
  );

  function init() {
    if (!size()) return;
    io.observe(sec);
    paintStill();
  }

  if (!REDUCED) {
    sec.addEventListener(
      "pointermove",
      function (e) {
        var r = sec.getBoundingClientRect();
        px = e.clientX - r.left;
        py = e.clientY - r.top;
        targetWarmth = 1;
        kick();
      },
      { passive: true }
    );
    sec.addEventListener(
      "pointerleave",
      function () {
        targetWarmth = 0;
        kick();
      },
      { passive: true }
    );
  }

  var rt = 0;
  window.addEventListener(
    "resize",
    function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        if (size()) paintStill();
      }, 160);
    },
    { passive: true }
  );

  init();
})();
