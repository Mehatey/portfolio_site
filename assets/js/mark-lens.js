/* ═══════════════════════════════════════════════════════════════════════════
   THE MARK LOOKS AT THE PAGE

   Sid: "when I hover on the cube logo can you make the whole site or whatever
   media and everything else turn pixelated and breathe slowly around the site
   ... every time I hover on the cube logo it can do some effect to the rest of
   the page. Like cycle between 5 effects, one is pixelated and then when I
   leave and hover again let it do a gradient map or a kaleidoscope or
   something cool."

   ── THE IDEA, STATED ONCE ───────────────────────────────────────────────
   The mark is the one object on this site with a face. Giving it an effect it
   casts over everything else makes it the thing doing the looking rather than
   a logo that happens to animate — you hover the eye and the world changes to
   match what it sees. That is why the effects are all WAYS OF SEEING rather
   than decorations: a resolution limit, a spectral range, a symmetry, a
   contour, a movement. Each is a different sensor.

   ── WHY SVG FILTERS AND NOT A SHADER ────────────────────────────────────
   The requirement is that the effect applies to the PAGE — type, photographs,
   video, canvas, all of it, live. A WebGL layer cannot read the document; that
   is the same wall the film grade and idle-drift both ran into. A CSS `filter`
   with an SVG filter reference is composited by the browser over the real
   rendered tree, so a pixelate genuinely pixelates a playing video and the
   words next to it. It is the only technique that can do what was asked.

   ── WHY IT IS SAFE TO PUT A FILTER ON THE WHOLE PAGE ────────────────────
   Two guards. It only runs while the pointer is actually on the mark, which
   is a deliberate act and never longer than a few seconds. And it is applied
   to a wrapper that excludes the nav itself, so the control you are touching
   never distorts underneath you — a button that warps while you are pressing
   it is a broken button.

   ── ONE, NOT FIVE ───────────────────────────────────────────────────────
   Sid: "the kaleidoscope, the gradient map, the pixelation, the sudden
   earthquake strobe all look like defects. It needs to CHANGE THE MEDIA when
   you hover, not feel like a glitch. You can just keep one effect."

   He is describing the difference between a lens and a fault. Four of the
   five read as damage because that is literally what they were: a resolution
   limit, a posterise, a channel separation and a displacement are all things
   that happen to a picture when something has gone WRONG with it. However
   carefully they were tuned, the vocabulary was broken-screen.

   What survives is the one that reads as a material rather than a failure: a
   slow liquid wave. Water over the page is a thing being seen THROUGH
   something, which is what the mark casting its own way of seeing was always
   supposed to mean, and it is the only one of the five that never resolves
   into an artefact you could mistake for a rendering bug.

   It is also slower and shallower than the version it replaces. The old
   displacement ran at scale 26 with an eleven second frequency sweep, which
   at any given instant looks like a shaky hand; at 14, on a long swell with
   two waves crossing at different rates, it looks like depth. The cycling is
   gone with the rest -- an effect that is different every time you hover is
   a slot machine, and this one is now a property of the mark.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  if (!window.matchMedia) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  /* No hover, no gesture. And a full-page filter on a phone GPU is a real
     cost for something that cannot be triggered there anyway. */
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  var mark = document.querySelector(".studio-mark");
  if (!mark) return;

  /* One filter, always the same one, so there is nothing to remember
     between hovers and the sessionStorage cursor is gone with the cycle. */
  var MODE = "wave";

  /* ── THE FILTERS ────────────────────────────────────────────────────────
     One inert SVG holding the one filter. It lives in the document rather
     than in a stylesheet because a CSS `filter: url(#id)` can only reference
     a filter that exists in the DOM. */
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.style.cssText = "position:fixed;width:0;height:0;overflow:hidden;pointer-events:none";
  svg.innerHTML = [
    "<defs>",
    /* ── THE WAVE ──────────────────────────────────────────────────────────
       Two turbulence fields displacing the page, not one.

       A single fractalNoise field animated on its baseFrequency is what the
       old SKETCH filter was, and it wobbles: every part of the image moves on
       the same clock, so the whole page shivers together and reads as a hand
       that cannot hold still. Two fields at different scales, summed, give
       long swells with small ripples riding on them -- and because the two
       animations have coprime durations (13s and 19s) the sum never repeats
       inside any hover anybody will hold.

       The frequency is deliberately anisotropic, much lower across than down,
       so the distortion runs in horizontal bands. That is what water does,
       and it is also the direction that damages type least: a letter stretched
       sideways is still that letter, a letter stretched vertically is not.

       scale 14, down from 26. At 26 the page is being pulled about; at 14 the
       type stays entirely readable and the photographs move like something
       seen through a few inches of moving water, which is the whole point. */
    '<filter id="ml-wave" x="-6%" y="-6%" width="112%" height="112%" color-interpolation-filters="sRGB">',
    '  <feTurbulence type="fractalNoise" baseFrequency="0.003 0.011" numOctaves="2" seed="4" result="swell">',
    '    <animate attributeName="baseFrequency" values="0.003 0.011;0.006 0.008;0.003 0.011" dur="13s" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" repeatCount="indefinite"/>',
    "  </feTurbulence>",
    '  <feTurbulence type="fractalNoise" baseFrequency="0.011 0.024" numOctaves="1" seed="17" result="ripple">',
    '    <animate attributeName="baseFrequency" values="0.011 0.024;0.017 0.019;0.011 0.024" dur="19s" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" repeatCount="indefinite"/>',
    "  </feTurbulence>",
    /* The ripple is composited into the swell rather than applied as a second
       displacement pass: two chained feDisplacementMaps displace the ALREADY
       displaced image, which compounds the error at the edges and tears. */
    '  <feBlend in="swell" in2="ripple" mode="multiply" result="water"/>',
    '  <feDisplacementMap id="ml-disp" in="SourceGraphic" in2="water" scale="8" xChannelSelector="R" yChannelSelector="G" result="warped"/>',
    /* ── CHROMATIC ABERRATION ───────────────────────────────────────────
       Sid: "along with warping, chromatic aberration and a slow motion blur
       increasing all over the page the longer the person hovers, and a soft
       glitch too."

       Real dispersion is the three channels landing in slightly different
       places, so that is what this does rather than drawing coloured edges:
       the image is split into R, G and B, the red and blue copies are offset
       in opposite directions, and the three are screened back together. At
       zero offset it recombines to exactly the original image, which is what
       lets the whole effect ramp from nothing. */
    '  <feOffset id="ml-ro" in="warped" dx="0" dy="0" result="roff"/>',
    '  <feColorMatrix in="roff" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="rch"/>',
    '  <feOffset id="ml-bo" in="warped" dx="0" dy="0" result="boff"/>',
    '  <feColorMatrix in="boff" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bch"/>',
    '  <feColorMatrix in="warped" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="gch"/>',
    '  <feBlend in="rch" in2="gch" mode="screen" result="rg"/>',
    '  <feBlend in="rg" in2="bch" mode="screen" result="rgb"/>',
    /* Horizontal only, so it reads as movement rather than as the page going
       out of focus. */
    '  <feGaussianBlur id="ml-blur" in="rgb" stdDeviation="0 0"/>',
    "</filter>",
    "</defs>",
  ].join("");
  document.body.appendChild(svg);

  /* ── THE SUBJECT ────────────────────────────────────────────────────────
     Everything in <body> that is not the nav. Built once and reused, because
     wrapping the document in a new element would reparent every canvas on the
     page and tear down its context. Instead the filter goes on <main> plus the
     footer plus the fixed background layers — the real content — and the nav
     is simply never included. */
  function subjects() {
    var out = [];
    var main = document.querySelector("main");
    if (main) out.push(main);
    var f = document.querySelector("footer.site-footer, .site-footer, footer");
    if (f) out.push(f);
    ["#smoke-bg", "#site-field", ".sid-field", ".site-field", "#gl-stage"].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el && out.indexOf(el) === -1) out.push(el);
    });
    return out;
  }

  var held = [];
  var raf = 0;

  /* ── IT BUILDS WHILE YOU HOLD IT ──────────────────────────────────────
     Sid: "the light warping doesnt feel like enough of an effect ... it
     increases the longer the person hovers."

     The filter used to be one fixed set of numbers, so the whole thing was
     over in the first frame and holding the pointer there did nothing. Every
     parameter now runs off a single 0..1 `hold` that fills over about six
     seconds and drains in one, and each effect reads it through its own
     curve: the warp is close to linear, the aberration is quadratic so it
     stays invisible early and becomes obvious late, and the blur comes in
     last of all.

     The glitch is not on a timer. It fires on a Poisson-ish random check
     whose rate scales with `hold`, so early on it almost never happens and
     late it is frequent -- a regular interval would read as a loop, which is
     the difference between something breaking up and something animating. */
  var hold = 0,
    holding = false,
    glitch = 0,
    glitchUntil = 0,
    lastT = 0;
  var fDisp = null,
    fRo = null,
    fBo = null,
    fBlur = null;

  function nodes() {
    if (!fDisp) {
      fDisp = document.getElementById("ml-disp");
      fRo = document.getElementById("ml-ro");
      fBo = document.getElementById("ml-bo");
      fBlur = document.getElementById("ml-blur");
    }
    return fDisp;
  }

  function ramp(now) {
    raf = 0;
    if (!lastT) lastT = now;
    var dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;

    hold += holding ? dt / 6 : -dt / 1;
    hold = Math.max(0, Math.min(1, hold));

    if (!nodes()) return;

    /* A machine that cannot keep up should not be asked to composite a
       full-page SVG filter chain. See assets/js/motion-budget.js. */
    var ceiling = window.SidPerf && !window.SidPerf.ok() ? 0.35 : 1;
    var h = hold * ceiling;

    if (now > glitchUntil) glitch = 0;
    /* Rate rises with the hold: about once every four seconds at the start,
       several a second by the end. */
    if (h > 0.12 && now > glitchUntil && Math.random() < h * h * 0.09) {
      glitch = 1;
      glitchUntil = now + 60 + Math.random() * 90;
    }
    var g = glitch ? 1 : 0;

    /* The ceiling is set where the page is still READABLE at full hold.
       Measured at the first pass: warp 26 / aberration 2.8 / blur 1.7 put the
       card titles past legible, which is a different effect from the one he
       asked for -- "a soft glitch", not a broken monitor. These numbers keep
       the melt obvious and the page still a page. The glitch spike is allowed
       past it, because a spike lasts 60 to 150ms and nobody reads during one. */
    var warp = 8 + h * 15 + g * 14;
    var ab = h * h * 2.3 + g * 3.8;
    var blur = Math.max(0, h - 0.3) * 1.9 + g * 1;

    fDisp.setAttribute("scale", warp.toFixed(2));
    fRo.setAttribute("dx", ab.toFixed(2));
    fBo.setAttribute("dx", (-ab).toFixed(2));
    /* A glitch shoves the channels vertically as well, which is what makes it
       read as a broken signal rather than as more colour fringing. */
    fRo.setAttribute("dy", (g * (Math.random() - 0.5) * 5).toFixed(2));
    fBo.setAttribute("dy", (g * (Math.random() - 0.5) * 5).toFixed(2));
    fBlur.setAttribute("stdDeviation", blur.toFixed(2) + " 0");

    if (holding || hold > 0.001) raf = requestAnimationFrame(ramp);
    else {
      lastT = 0;
      release();
    }
  }

  function apply(mode) {
    held = subjects();
    var url = "url(#ml-" + mode + ")";
    held.forEach(function (el) {
      /* Stored so leaving restores exactly what was there rather than
         clearing a filter the page may have set for its own reasons. */
      el.dataset.mlPrev = el.style.filter || "";
      el.style.filter = url;
      el.style.willChange = "filter";
      /* The ease-in. A filter cannot be transitioned, so the arrival is done
         with opacity on a scale of the whole subject -- a very small settle
         that reads as the effect landing rather than snapping on. */
      el.style.transition = "transform 420ms cubic-bezier(0.16,1,0.3,1)";
      el.style.transform = "scale(1.004)";
    });
    document.documentElement.setAttribute("data-mark-lens", mode);
  }

  function release() {
    held.forEach(function (el) {
      el.style.filter = el.dataset.mlPrev || "";
      el.style.transform = "";
      delete el.dataset.mlPrev;
      /* will-change is dropped a beat later so the browser keeps the layer
         through the settle rather than re-rasterising mid-transition. */
      setTimeout(function () {
        el.style.willChange = "";
        el.style.transition = "";
      }, 460);
    });
    held = [];
    document.documentElement.removeAttribute("data-mark-lens");
  }

  mark.addEventListener("pointerenter", function () {
    holding = true;
    if (!held.length) apply(MODE);
    lastT = 0;
    if (!raf) raf = requestAnimationFrame(ramp);
  });

  /* Leaving sets the target to zero and lets the same ramp unwind it. The
     filter is only torn off the page once the numbers have actually reached
     zero, otherwise the effect vanishes on the frame the pointer leaves --
     which is the snap this was built to avoid. */
  mark.addEventListener("pointerleave", function () {
    holding = false;
    lastT = 0;
    if (!raf) raf = requestAnimationFrame(ramp);
  });

  /* A click on the mark navigates home, and leaving a full-page filter applied
     across a navigation would carry it into the next page's first paint. */
  window.addEventListener("pagehide", function () {
    holding = false;
    hold = 0;
    release();
  });
  mark.addEventListener("click", function () {
    holding = false;
    hold = 0;
    release();
  });
})();
