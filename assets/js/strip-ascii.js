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
    /* ── THE PER-TILE ASCII HOVER IS RETIRED ─────────────────────────
       Sid: "i dont like the hover asci effect on the get to know sid".
       Pointing at a photograph used to replace the photograph. The ambient
       field this file also paints behind the row is untouched; only the
       hover takeover is gone, so nothing below runs and no tile is ever
       given .is-ascii. Kept as an early return rather than deleted because
       the sampling code underneath is what draws the ambient field. */
    return;
    /* eslint-disable no-unreachable */
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
    raf = live || mix > 0.002 || palT < 1 ? requestAnimationFrame(frame) : 0;
    var dt = t0 ? Math.min(0.05, (now - t0) / 1000) : 0.016;
    t0 = now;
    var t = now / 1000;

    if (sweep >= 0 && sweep < 1) sweep = Math.min(1, sweep + dt / 1.5);
    mix += ((hot ? 1 : 0) - mix) * Math.min(1, dt * 9);

    /* The ground runs at half rate. A dither field that updates every frame
       is a static-noise television; at 30fps it reads as a slow machine
       thinking, which is the intended register. */
    /* Two and a half seconds for the front to cross. Slower than a
       transition and faster than a mood: long enough to watch the colour
       arrive, short enough that a tile is still near the middle when it
       finishes. Stepped by the real frame time rather than inside the 30fps
       gate below, or the change runs at whatever rate the gate happens to
       fire at. */
    if (palT < 1) palT = Math.min(1, palT + dt / 2.5);

    acc += dt;
    if (acc > 1 / 30) {
      acc = 0;
      findFocus();
      drawGround(t);
    }
    /* drawAscii() is no longer called. Sid: "instead of the ASCII or pattern
       behind the images". The per-tile character pass is what he is pointing
       at, and the colour field above replaces the ground it sat on. The
       function is left defined rather than deleted because `mix` and `hot`
       still drive whether the loop runs. */
  }

  /* ══ THE GROUND IS THE PICTURE'S OWN COLOUR ═════════════════════════════
     Sid: "instead of the ASCII or pattern behind the images, the image which
     is in the centre, right in focus -- use a colour picker and have a pixel
     art background with squares of the colours that animate live based on
     which pic is in focus."

     So the field is a grid of squares rather than a grid of characters, and
     the palette is not invented: it is read off whichever tile is currently
     nearest the middle of the strip, through assets/js/hue.js, the same
     reader the cursor panel and the mark use.

     ── WHY THE CHANGE SPREADS OUTWARD ──────────────────────────────────
     A crossfade where every cell turns at once is a colour-grade slider. The
     new palette arrives as a FRONT travelling out from the tile that caused
     it, so what you see is the picture colouring the room it is standing in
     -- cause and effect, in the right order. Each cell holds its own
     progress and its own delay, taken from its distance to the focused tile,
     which is one subtraction per cell and no per-cell state to allocate.

     ── AND IT STAYS A GROUND ───────────────────────────────────────────
     Low alpha, and squares smaller than the gap between the tiles. The row
     of photographs is the subject; a legible field of saturated colour
     behind it is a competing image, which is the same reason the character
     version was kept faint. */
  /* ── SMALLER, AND MANY MORE OF THEM ────────────────────────────────
     Sid: "can we have more pixel squares, these ones are too big and I don't
     like so big, I want more number of squares."

     26px to 14px, which is not a small change: the count goes up by a factor
     of three and a half, because it is an area. At 26 the field read as a
     grid of tiles you could count; at 14 it reads as a resolution -- close
     enough to a pixel that the wall looks like a low-res image of a colour
     rather than a pattern made of squares. */
  var CELL = 14; // square pitch, including its gap
  var PAL_N = 8;
  var palA = null, // what the field is showing
    palB = null, // what it is moving to
    palT = 1, // 0..1 through the change
    focusX = 0.5, // where the change started, as a fraction of the width
    focusEl = null;

  /* Which tile is nearest the middle. The rail drifts continuously and scales
     tiles up as they cross the centre, so "in focus" is a position, not a
     hover -- reading it from geometry means it stays true while nobody is
     touching the page at all. */
  function findFocus() {
    var r = strip.getBoundingClientRect();
    var mid = r.left + r.width / 2;
    var best = null,
      bestD = Infinity;
    var tiles = rows.querySelectorAll(".sid-tile");
    for (var i = 0; i < tiles.length; i++) {
      var tr = tiles[i].getBoundingClientRect();
      if (tr.width < 8) continue;
      var d = Math.abs(tr.left + tr.width / 2 - mid);
      if (d < bestD) {
        bestD = d;
        best = tiles[i];
      }
    }
    if (!best || best === focusEl) return;
    var img = window.SidHue && window.SidHue.pictureIn(best);
    var cols = img && window.SidHue.palette(img, PAL_N);
    if (!cols || !cols.length) return;
    /* ── SAY WHICH ONE IS BEING READ ──────────────────────────────────
       Sid: "some nice side effect so it's more clear to the user which pic's
       colours are being shown as pixels in the bg. Right now there are like
       4 images with a lot of colour so I'm not able to tell."

       The field takes its palette from exactly one tile and nothing said
       which. The class goes on the tile the read came from, and the CSS
       brings that one into focus while the rest go soft -- so the causal
       chain is visible: this picture, that wall. */
    if (focusEl) focusEl.classList.remove("is-source");
    best.classList.add("is-source");
    focusEl = best;
    var br = best.getBoundingClientRect();
    focusX = Math.max(0, Math.min(1, (br.left + br.width / 2 - r.left) / r.width));
    /* The first read has nothing to come from, so it arrives already there
       rather than fading up out of the previous section's colour. */
    palA = palB || cols;
    palB = cols;
    palT = palA === cols ? 1 : 0;
  }

  /* A stable pseudo-random per cell. The same cell must draw the same colour
     every frame or the field boils. */
  function cellHash(i, j) {
    var n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
    return n - Math.floor(n);
  }

  function drawGround(t) {
    bgx.clearRect(0, 0, W, H);
    if (reduce || !palB) return;

    var cols = Math.ceil(W / CELL) + 1,
      rowsN = Math.ceil(H / CELL) + 1;
    var fx = focusX * W;
    /* How far the front has travelled. It has to clear the whole width, so
       the reach is the longer of the two sides plus a margin for the wake. */
    var reach = Math.max(fx, W - fx) + 240;
    var front = palT * reach;

    for (var j = 0; j < rowsN; j++) {
      var y = j * CELL;
      for (var i = 0; i < cols; i++) {
        var x = i * CELL;
        var h = cellHash(i, j);

        /* Which chip this cell wears. Held per cell across a palette change,
           so a cell keeps its INDEX and only changes its colour -- the field
           recolours rather than reshuffling, which is what makes it read as
           the same wall under different light. */
        var idx = (h * 1000) | 0;

        /* Not every cell is filled. A field at full density is a solid
           rectangle; leaving two in five empty is what makes it read as
           pixels scattered on a ground. */
        if (h > 0.62) continue;

        var dx = x - fx;
        var d = Math.abs(dx) + Math.abs(y - H / 2) * 0.35;
        var flipped = d < front;
        var pal = flipped ? palB : palA;
        if (!pal || !pal.length) continue;
        bgx.fillStyle = pal[idx % pal.length];

        /* Cells right at the front flare briefly, so the change has a visible
           edge rather than being a boundary you can only infer. */
        var edge = Math.abs(d - front);
        var flare = front > 0 && front < reach ? Math.exp(-(edge * edge) / 5200) : 0;

        /* The slow ambient breath the character field had, kept: two drifting
           sines so the wall is never completely still. */
        var v = Math.sin(x * 0.011 + t * 0.24) * 0.5 + Math.sin(y * 0.019 - t * 0.19) * 0.5;
        /* The character field it replaces ran at two to eight per cent,
           because a legible field of GLYPHS behind photographs is a second
           image competing for the same read. Colour squares are not glyphs:
           they carry no detail to compete with, and at the same alpha they
           simply were not there. This is the level at which the wall is
           visibly the colour of the picture and still obviously behind it. */
        var a = 0.2 + v * 0.07 + flare * 0.55;

        /* The pointer. A warm patch rather than a circle of cells, same
           reasoning as before: a hard radius following the mouse is a
           cursor, a falloff is light. */
        if (warm > 0) {
          var wx = x - px,
            wy = (y - py) * 1.6;
          a += Math.exp(-(wx * wx + wy * wy) / 12000) * 0.34 * warm;
        }
        if (a <= 0.012) continue;

        bgx.globalAlpha = Math.min(0.72, a);
        /* Two pixels of gap, and a radius that grows with the flare, so a
           cell the front is passing through swells into a rounder, brighter
           dot and settles back to a square. */
        var sz = CELL - 3 + flare * 2;
        var rad = 1 + flare * 2;
        bgx.beginPath();
        if (bgx.roundRect) bgx.roundRect(x + 2, y + 2, sz, sz, rad);
        else bgx.rect(x + 2, y + 2, sz, sz);
        bgx.fill();
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
