/* ─────────────────────────────────────────────────────────────────────────
   THE FOOTER OPENS

   Two problems, one file.

   1. "the get to know sid images dont have any shader or creative 3d
      tratement or animation" — so hovering a tile now resolves it into an
      ASCII rendition of ITSELF. Not a decorative glyph field laid over the
      picture: the picture is sampled, cell by cell, and redrawn as characters
      carrying its own colour. The photograph is still there; it has just been
      quantised into something a terminal could print.

   2. "that whole section needs to feel like ok this is the start of a new
      footer section rn it kind of just floats up randomly" — so the section
      has a ground now: a slow dither field behind the rail that wakes when
      the section enters view, sweeping left to right once, and thereafter
      breathing. It is the visual equivalent of a room light coming on.

   Both are 2D canvas, not WebGL, and deliberately. A glyph grid is a text
   raster; the thing that draws text fastest and sharpest in a browser is the
   text engine. A shader would have to carry an atlas to do worse.

   Nothing here samples the DOM — the ASCII pass reads the <img>/<video>
   element directly, which is same-origin and therefore untainted. ───────── */
(function () {
  "use strict";

  var strip = document.querySelector(".sid-strip");
  if (!strip) return;
  var rows = strip.querySelector(".sid-strip__rows");
  if (!rows) return;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* The ramp is ordered by ink coverage, not by ASCII value. Getting this
     wrong is the single most common way an ASCII pass looks like noise: the
     eye reads the picture out of the DENSITY of the glyphs, so the sequence
     has to be monotonic in how much of the cell each character fills. */
  var RAMP = " .·:-=+ic*%#@";
  var CW = 9,
    CH = 13;

  /* ══ 1. THE GROUND ══════════════════════════════════════════════════════
     A dither field behind the rail. Kept at a very low alpha: this is a
     texture you notice on the second look, and a legible field of characters
     behind a row of photographs is a competing image. */
  var bg = document.createElement("canvas");
  bg.className = "sid-field";
  bg.setAttribute("aria-hidden", "true");
  strip.insertBefore(bg, strip.firstChild);
  var bgx = bg.getContext("2d");

  /* ══ 2. THE PASS ════════════════════════════════════════════════════════
     Above the tiles, inert to the pointer, so the tile keeps its own hover. */
  var fg = document.createElement("canvas");
  fg.className = "sid-ascii";
  fg.setAttribute("aria-hidden", "true");
  rows.appendChild(fg);
  var fgx = fg.getContext("2d");

  /* The sampler. One small canvas reused for every tile — allocating a canvas
     per hover is how a smooth effect becomes a stutter on the fourth tile. */
  var samp = document.createElement("canvas");
  var sampx = samp.getContext("2d", { willReadFrequently: true });

  var dpr = Math.min(2, devicePixelRatio || 1);
  var W = 0,
    H = 0,
    RW = 0,
    RH = 0;

  function size() {
    var r = strip.getBoundingClientRect();
    W = Math.round(r.width);
    H = Math.round(r.height);
    bg.width = Math.round(W * dpr);
    bg.height = Math.round(H * dpr);
    bg.style.width = W + "px";
    bg.style.height = H + "px";
    bgx.setTransform(dpr, 0, 0, dpr, 0, 0);

    /* The bleed is applied here rather than in the stylesheet. A <canvas> is a
       replaced element carrying an intrinsic 300x150, and stretching one with
       four absolute offsets and auto width is exactly the case browsers
       disagree about — measured, it stayed 300x150 and the pass drew into a
       postage stamp in the corner. Explicit size, no ambiguity.

       BLEED exists because a tile at the centre of the rail is scaled to 1.24
       and hangs out of the rows box; a canvas flush with that box guillotines
       the top and bottom of the very tile the effect is for. */
    var BLEED = 70;
    var rr = rows.getBoundingClientRect();
    RW = Math.round(rr.width);
    RH = Math.round(rr.height) + BLEED * 2;
    fg.style.top = -BLEED + "px";
    fg.style.width = RW + "px";
    fg.style.height = RH + "px";
    fg.width = Math.round(RW * dpr);
    fg.height = Math.round(RH * dpr);
    fgx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  addEventListener("resize", size);

  /* ── pointer, in strip-local coordinates ─────────────────────────────── */
  var px = -1e4,
    py = -1e4,
    warm = 0; /* how lit the field is under the pointer */
  strip.addEventListener(
    "pointermove",
    function (e) {
      var r = strip.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
      warm = 1;
    },
    { passive: true }
  );
  strip.addEventListener("pointerleave", function () {
    warm = 0;
  });

  /* ── the sweep ────────────────────────────────────────────────────────
     Fires once when the section first crosses into view. This is the whole
     answer to "it kind of just floats up randomly": a section that announces
     itself has a beginning, and a beginning is an event, not a state. */
  var sweep = -1; /* -1 = not started, else 0..1 */
  var live = false;
  new IntersectionObserver(
    function (es) {
      for (var i = 0; i < es.length; i++) {
        live = es[i].isIntersecting;
        if (live && sweep < 0) {
          sweep = 0;
          /* Same signal drives the CSS chapter opening, so the rule draws
             across at the same moment the dither field sweeps under it and
             the two read as one event rather than two effects. */
          strip.classList.add("is-open");
        }
      }
      if (live && !raf) raf = requestAnimationFrame(frame);
    },
    { rootMargin: "120px 0px" }
  ).observe(strip);

  /* ── hover state ──────────────────────────────────────────────────────── */
  var hot = null /* the hovered <figure> */,
    hotMedia = null,
    mix = 0; /* 0 photograph, 1 ASCII */

  rows.addEventListener("pointerover", function (e) {
    var t = e.target.closest ? e.target.closest(".sid-tile") : null;
    if (!t || t === hot) return;
    var m = t.querySelector("video, img");
    /* A tile whose media has not decoded yet would sample as a black
       rectangle, which reads as the effect being broken rather than as the
       effect being early. Leave the photograph alone until it is there. */
    if (!m) return;
    if (m.tagName === "IMG" && !m.complete) return;
    if (m.tagName === "VIDEO" && m.readyState < 2) return;
    hot = t;
    hotMedia = m;
    t.classList.add("is-ascii");
    if (!raf) raf = requestAnimationFrame(frame);
  });
  rows.addEventListener("pointerout", function (e) {
    if (!hot) return;
    if (e.relatedTarget && hot.contains(e.relatedTarget)) return;
    hot.classList.remove("is-ascii");
    hot = null;
    hotMedia = null;
  });

  /* ══ the loop ═══════════════════════════════════════════════════════════ */
  var raf = 0,
    t0 = 0,
    acc = 0;

  function frame(now) {
    raf = live || mix > 0.002 ? requestAnimationFrame(frame) : 0;
    var dt = t0 ? Math.min(0.05, (now - t0) / 1000) : 0.016;
    t0 = now;
    var t = now / 1000;

    if (sweep >= 0 && sweep < 1) sweep = Math.min(1, sweep + dt / 1.5);
    mix += ((hot ? 1 : 0) - mix) * Math.min(1, dt * 9);

    /* The ground runs at half rate. A dither field that updates every frame
       is a static-noise television; at 30fps it reads as a slow machine
       thinking, which is the intended register. */
    acc += dt;
    if (acc > 1 / 30) {
      acc = 0;
      drawGround(t);
    }
    drawAscii();
  }

  function drawGround(t) {
    bgx.clearRect(0, 0, W, H);
    if (reduce) return;
    var cols = Math.ceil(W / CW),
      rowsN = Math.ceil(H / CH);
    bgx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
    bgx.textBaseline = "top";
    /* One fillStyle for the whole pass. Per-glyph colour on 3,000 cells is
       3,000 state changes and it is the difference between free and 6ms. */
    var lit = getComputedStyle(strip).color;
    bgx.fillStyle = lit;

    /* Where the sweep front is, in pixels, and how wide its wake is. */
    var front = sweep < 0 ? -1 : (-0.25 + sweep * 1.5) * W;

    for (var j = 0; j < rowsN; j++) {
      var y = j * CH;
      for (var i = 0; i < cols; i++) {
        var x = i * CW;

        /* Two drifting sine plates crossed with a third at an angle. Cheap,
           and it does not tile visibly at this cell size — which is all a
           background field has to achieve. */
        var v = Math.sin(x * 0.013 + t * 0.31) * 0.5 + Math.sin(y * 0.021 - t * 0.24) * 0.5 + Math.sin((x + y) * 0.008 + t * 0.17) * 0.45;
        v = v * 0.34 + 0.5;

        /* The sweep: a bright front with a long tail behind it, so the
           section fills in from the left rather than blinking on. */
        if (front > 0) {
          var d = x - front;
          if (d > 0) v = 0; /* ahead of the front: nothing yet */
          else v += Math.exp(-Math.pow(d / 190, 2)) * 0.55;
        }

        /* The pointer. exp() falloff rather than a hard radius: a circle of
           characters following the mouse is a cursor, a warm patch is light. */
        if (warm > 0) {
          var dx = x - px,
            dy = (y - py) * 1.6; /* squashed: the section is wide and short */
          v += Math.exp(-(dx * dx + dy * dy) / 12000) * 0.75 * warm;
        }

        if (v <= 0.06) continue;
        var k = Math.min(RAMP.length - 1, (v * RAMP.length) | 0);
        if (k <= 0) continue;
        bgx.globalAlpha = Math.min(0.4, v * 0.2);
        bgx.fillText(RAMP.charAt(k), x, y);
      }
    }
    bgx.globalAlpha = 1;
  }

  function drawAscii() {
    fgx.clearRect(0, 0, RW, RH);
    if (mix < 0.004 || !hotMedia) return;

    /* The canvas is deliberately taller than the rows box — tiles scale up as
       they cross the centre and overflow it — so the ORIGIN is the canvas's
       own rect, not the rows rect. Using the parent's rect here clipped the
       top and bottom of every enlarged tile. */
    var rr = fg.getBoundingClientRect();
    var tr = hot.getBoundingClientRect();
    var x0 = tr.left - rr.left,
      y0 = tr.top - rr.top;
    var w = tr.width,
      h = tr.height;
    if (w < 8 || h < 8) return;

    var cols = Math.max(2, Math.round(w / CW)),
      rowsN = Math.max(2, Math.round(h / CH));
    if (samp.width !== cols || samp.height !== rowsN) {
      samp.width = cols;
      samp.height = rowsN;
    }

    /* Draw the media into a grid-sized canvas: the browser's own downscale is
       the box filter, so each destination pixel already IS the average of the
       cell it stands for. Sampling by hand would be slower and worse. */
    try {
      sampx.drawImage(hotMedia, 0, 0, cols, rowsN);
    } catch (err) {
      return;
    }
    var d;
    try {
      d = sampx.getImageData(0, 0, cols, rowsN).data;
    } catch (err) {
      return;
    }

    /* ── EXPOSE FOR THE PICTURE, NOT FOR THE FORMULA ────────────────────
       A fixed x1.35 lift is an exposure guess, and half of these photographs
       are indoors at night. Sampled, the desk shot's brightest cell came back
       at 0.19 — rendered faithfully, the ASCII pass was a black rectangle
       with a few grey commas in it, which reads as broken rather than as dark.

       So the tile is metered: find the brightest cell, and scale the whole
       grid so that cell lands near white. Clamped, because an already
       well-exposed picture must not be blown out, and a nearly black frame
       must not be amplified into noise. */
    var sum = 0,
      n = cols * rowsN;
    for (var q = 0; q < n; q++) {
      sum += d[q * 4] * 0.299 + d[q * 4 + 1] * 0.587 + d[q * 4 + 2] * 0.114;
    }
    /* Metered on the MEAN, not the peak. Peak was the first attempt and it
       fails on exactly the pictures that need it: the desk shot is a dark room
       with one lamp in it, so its brightest cell is already near white, the
       gain comes out at 1.2, and the other 95% of the frame stays black. The
       mean is what the eye calls the exposure. Target 0.42 -- mid-grey, a
       little under, because glyphs only cover part of their cell and the
       rendered field always reads darker than the number says. */
    var gain = Math.max(1.0, Math.min(5.0, 0.42 / Math.max(0.03, sum / n / 255)));

    var cw = w / cols,
      ch = h / rowsN;
    fgx.save();
    fgx.beginPath();
    /* Clipped to the tile, and to its rounded corner, or the glyphs spill
       past the picture and the effect reads as an overlay instead of as the
       picture's own resolution failing. */
    var rad = 3;
    if (fgx.roundRect) fgx.roundRect(x0, y0, w, h, rad);
    else fgx.rect(x0, y0, w, h);
    fgx.clip();
    fgx.font = Math.round(ch) + "px ui-monospace, SFMono-Regular, Menlo, monospace";
    fgx.textBaseline = "top";
    fgx.globalAlpha = mix;

    for (var j = 0; j < rowsN; j++) {
      for (var i = 0; i < cols; i++) {
        var o = (j * cols + i) * 4;
        var r = d[o],
          g = d[o + 1],
          b = d[o + 2];
        var lum = Math.min(1, ((r * 0.299 + g * 0.587 + b * 0.114) / 255) * gain);
        var k = Math.min(RAMP.length - 1, Math.round(Math.pow(lum, 0.7) * (RAMP.length - 1)));
        if (k === 0) continue;
        /* The cell keeps the photograph's own colour, lifted — a glyph covers
           a fraction of its cell, so drawing it at the source colour loses
           most of the light and the whole picture goes muddy. */
        /* Exposed, then pulled a third of the way to white. A glyph inks maybe
           a quarter of its cell, so a character drawn at the source colour
           delivers a quarter of that colour's light and the whole rendition
           sinks. The lift puts it back; the remaining two thirds are what keep
           it recognisably this photograph and not a green terminal. */
        fgx.fillStyle =
          "rgb(" +
          Math.min(255, (r * gain * 0.66 + 87) | 0) +
          "," +
          Math.min(255, (g * gain * 0.66 + 87) | 0) +
          "," +
          Math.min(255, (b * gain * 0.66 + 87) | 0) +
          ")";
        fgx.fillText(RAMP.charAt(k), x0 + i * cw, y0 + j * ch);
      }
    }
    fgx.restore();
    fgx.globalAlpha = 1;
  }
})();
