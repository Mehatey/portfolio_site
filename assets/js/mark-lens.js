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

   ── FIVE, IN THIS ORDER ─────────────────────────────────────────────────
     1  PIXELATE   the one he asked for by name, and the site's own language.
     2  SPECTRUM   a duotone gradient map through the accent family.
     3  SKETCH     the page redrawn by hand, the only one that moves geometry.
     4  CONTOUR    posterised light: the page reduced to four tones of ink.
     5  DRIFT      chromatic separation that breathes — closest to "alive".

   Two of these were renamed and one rebuilt after looking at them, which is
   the only way this kind of thing can be judged. 3 was called KALEIDO and is
   not a kaleidoscope: a turbulence displacement does not mirror, it wobbles,
   and what it actually produces is the whole page redrawn with a shaky pen —
   better than the thing it was aiming at, so it kept the effect and lost the
   name. 4 claimed to be a drawing and was posterising each colour channel
   SEPARATELY, so a photograph's channels stepped at different points and the
   result was red and cyan speckle on the images while the type did not move
   at all. Stepping LUMINANCE and re-tinting after is what actually reduces a
   page to ink.

   The order is deliberate: the first is legible immediately, the strangest
   sits in the middle, and the last is the quietest so the sequence does not
   end on a shout. It advances on every hover and remembers across pages, so a
   visitor discovers them over a session rather than all at once.
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

  var KEY = "sid_marklens";
  var MODES = ["pixelate", "spectrum", "sketch", "contour", "drift"];
  var at = 0;
  try {
    at = parseInt(window.sessionStorage.getItem(KEY) || "0", 10) % MODES.length;
  } catch (e) {}

  /* ── THE FILTERS ────────────────────────────────────────────────────────
     One inert SVG holding all five. feImage/feTile is the classic pixelate:
     shrink the source to a tiny scale with a non-smooth interpolation, then
     blow it back up. feComponentTransfer with discrete tables is what makes
     the contour posterise, and feColorMatrix on the alpha channel is what
     lets the spectrum map luminance onto two colours. */
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.style.cssText = "position:fixed;width:0;height:0;overflow:hidden;pointer-events:none";
  svg.innerHTML = [
    "<defs>",
    /* 1. PIXELATE — feFlood/feComposite/feTile, then feMorphology.
          The first attempt used feFlood + feComposite alone and produced no
          visible change at all: without feTile there is one flooded cell
          rather than a grid of them, so `in` clips the source to a single
          square and the dilate has nothing to spread. The canonical chain is
          flood one dot, composite it into a cell, TILE the cell across the
          filter region, clip the page to that grid of dots, then dilate each
          surviving dot back out to fill its cell. The dilate radius is what
          breathes, which is the "breathe slowly" ask, and it is the right
          parameter for it -- the grid stays put while the blocks swell. */
    '<filter id="ml-pixelate" x="0" y="0" width="100%" height="100%">',
    '  <feFlood x="2" y="2" width="1" height="1"/>',
    '  <feComposite width="7" height="7"/>',
    '  <feTile result="grid"/>',
    '  <feComposite in="SourceGraphic" in2="grid" operator="in"/>',
    '  <feMorphology operator="dilate" radius="3.5">',
    '    <animate attributeName="radius" values="3.5;5.5;3.5" dur="6s" repeatCount="indefinite"/>',
    "  </feMorphology>",
    "</filter>",
    /* 2. SPECTRUM — luminance to a two-point ramp in the accent family. */
    '<filter id="ml-spectrum" x="0" y="0" width="100%" height="100%">',
    '  <feColorMatrix type="saturate" values="0" result="g"/>',
    '  <feComponentTransfer in="g">',
    '    <feFuncR type="table" tableValues="0.05 0.15 0.55 0.98"/>',
    '    <feFuncG type="table" tableValues="0.06 0.55 0.86 0.99"/>',
    '    <feFuncB type="table" tableValues="0.14 0.72 0.86 1"/>',
    "  </feComponentTransfer>",
    "</filter>",
    /* 3. SKETCH — turbulence-driven displacement. Every edge on the page,
          type included, acquires the waver of a line drawn by a hand that is
          not quite steady, and the baseFrequency animation keeps that hand
          moving. The scale is the whole judgement here: at 26 the type was
          still legible and the images still read, which is the line between
          "redrawn" and "damaged". */
    '<filter id="ml-sketch" x="-8%" y="-8%" width="116%" height="116%">',
    '  <feTurbulence type="fractalNoise" baseFrequency="0.006 0.012" numOctaves="3" seed="9" result="n">',
    '    <animate attributeName="baseFrequency" values="0.006 0.012;0.014 0.006;0.006 0.012" dur="11s" repeatCount="indefinite"/>',
    "  </feTurbulence>",
    '  <feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G"/>',
    "</filter>",
    /* 4. CONTOUR — the page reduced to four tones of ink.
          Luminance FIRST, so all three channels step at the same threshold
          and a photograph breaks into flat bands instead of into colour
          noise. The tint goes on AFTERWARDS: the bands are chosen in grey,
          then the whole thing is carried into the site's blue-ink family, so
          the posterisation decides the shapes and the colour only decides the
          temperature. Four steps is the count that leaves a face readable. */
    '<filter id="ml-contour" x="0" y="0" width="100%" height="100%">',
    '  <feColorMatrix type="saturate" values="0" result="l"/>',
    '  <feComponentTransfer in="l" result="posterised">',
    '    <feFuncR type="discrete" tableValues="0.06 0.34 0.66 0.96"/>',
    '    <feFuncG type="discrete" tableValues="0.06 0.34 0.66 0.96"/>',
    '    <feFuncB type="discrete" tableValues="0.06 0.34 0.66 0.96"/>',
    "  </feComponentTransfer>",
    '  <feColorMatrix in="posterised" type="matrix" values="0.82 0 0 0 0.01  0 0.9 0 0 0.03  0 0 1 0 0.07  0 0 0 1 0"/>',
    "</filter>",
    /* 5. DRIFT — the channels separate and rejoin. Quietest of the five. */
    '<filter id="ml-drift" x="-4%" y="-4%" width="108%" height="108%">',
    '  <feOffset in="SourceGraphic" dx="-3" dy="0" result="r">',
    '    <animate attributeName="dx" values="-3;-7;-3" dur="7s" repeatCount="indefinite"/>',
    "  </feOffset>",
    '  <feColorMatrix in="r" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="rc"/>',
    '  <feOffset in="SourceGraphic" dx="3" dy="0" result="b">',
    '    <animate attributeName="dx" values="3;7;3" dur="7s" repeatCount="indefinite"/>',
    "  </feOffset>",
    '  <feColorMatrix in="b" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bc"/>',
    '  <feBlend in="rc" in2="bc" mode="screen" result="rb"/>',
    '  <feBlend in="SourceGraphic" in2="rb" mode="screen"/>',
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
    if (raf) cancelAnimationFrame(raf);
    var mode = MODES[at];
    apply(mode);
  });

  mark.addEventListener("pointerleave", function () {
    release();
    /* Advance AFTER the hover ends, so the effect does not change while it is
       being looked at, and the next hover is a different one. */
    at = (at + 1) % MODES.length;
    try {
      window.sessionStorage.setItem(KEY, String(at));
    } catch (e) {}
  });

  /* A click on the mark navigates home, and leaving a full-page filter applied
     across a navigation would carry it into the next page's first paint. */
  window.addEventListener("pagehide", release);
  mark.addEventListener("click", release);
})();
