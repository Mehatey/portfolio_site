/* ─────────────────────────────────────────────────────────────────────────
   THE WASH, AND WHAT IT DRIES INTO

   Sid: "I really like this watercolor movement background animation, hover
   effect, and click effect, which I want to have in our homepage background",
   and "when things are fading out, like the colors are fading out, can you
   make them fade into code or ASCII ... I also want to show some design tech
   bit on the fade-out."

   So the hero is a real fluid simulation, and where a wash DRIES the pigment
   is replaced by the code that drew it. Not code sprinkled on top as
   decoration: a glyph only appears in a cell whose pigment fell this sample,
   so the text is literally what the paint leaves behind. A painter's surface
   resolving into the shader underneath it is the whole argument of the page.

   ── WHY IT WATCHES FOR A FALL RATHER THAN A THRESHOLD ────────────────────
   Drawing code wherever pigment is thin would put text on the empty paper,
   which is just a noisy background. Drawing it where pigment DECREASED
   between two samples means the glyphs track the drying edge and move with
   it, and the untouched sheet stays untouched.

   ── COST ────────────────────────────────────────────────────────────────
   The sim is GPU. This is one small drawImage plus one getImageData at
   roughly 90 by 50 cells, ten times a second, on a canvas a few hundred
   pixels wide. Reading back every frame at full size would cost more than
   the simulation it is watching.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var hero = document.getElementById("hero");
  var wash = document.getElementById("hero-wash");
  var code = document.getElementById("hero-wash-code");
  if (!hero || !wash || !code || typeof Watercolour !== "function") return;

  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Absorption triples, not colours. Each says how much red, green and blue
     that pigment REMOVES, which is why these glaze rather than stack to mud.
     Tuned toward the site's blues with one warm ink so the mixes go green and
     violet instead of grey. */
  var INKS = [
    [0.8, 0.56, 0.14], // indigo
    [0.9, 0.26, 0.06], // cerulean
    [0.1, 0.72, 0.46], // madder
    [0.32, 0.3, 0.86], // ochre
  ];

  /* The engine's own notes give a phone profile and this was ignoring it,
     running desktop settings on every device: scale 0.5, eight pressure
     iterations, dpr up to 1.6. Cost is roughly (iterations + 6) full screen
     passes at scale x canvas per frame, so that is a lot of fragment work for
     a mid range handset to carry behind a page someone is trying to read.
     Coarse pointer rather than width, because the question is what hardware is
     drawing this, not how wide the window happens to be. */
  var small = matchMedia("(pointer: coarse)").matches || innerWidth < 760;

  var wc = Watercolour(wash, {
    palette: INKS,
    paper: [0.968, 0.96, 0.945],
    scale: small ? 0.35 : 0.5,
    dpr: small ? 1.25 : 1.6,
    ambient: reduce ? 0 : 0.42,
    drops: reduce ? 0 : 0.4,
    dry: 0.9948,
    settle: 0.9968,
    diffuse: 0.34,
    edge: 1.2,
    granulate: 0.6,
    density: 1.55,
    bloom: 0.8,
    vignette: 0.18,
    grain: 0.016,
    /* The engine's own pointer binding listens on the canvas, which sits
       behind the headline: hovering the words would do nothing. Driving it
       from the hero instead makes the whole panel reactive and leaves the
       text selectable. */
    pointer: false,
    /* the code overlay samples this canvas from a later frame, which the
       drawing buffer does not survive by default */
    preserve: true,
    iterations: small ? 5 : 8,
  });
  if (!wc) {
    hero.classList.add("no-wash");
    return;
  }
  hero.classList.add("has-wash");

  /* ── pointer: hover pushes the water, click drops pigment ── */
  var px = 0.5,
    py = 0.5,
    seeded = false;
  function xy(e) {
    var r = hero.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
  }
  if (!reduce) {
    hero.addEventListener(
      "pointermove",
      function (e) {
        var p = xy(e),
          dx = p[0] - px,
          dy = p[1] - py;
        px = p[0];
        py = p[1];
        if (!seeded) {
          seeded = true;
          return;
        }
        var sp = Math.hypot(dx, dy);
        if (sp > 0.0015) wc.push(px, py, dx * 46, dy * 46, 0.1, Math.min(1, sp * 26));
      },
      { passive: true }
    );

    hero.addEventListener(
      "pointerdown",
      function (e) {
        var p = xy(e);
        /* drop() takes an ink TRIPLE, not an index into the palette. Passing
         an integer sets the uniform to a number and uniform3fv throws on
         every click, which kills the drop silently. */
        wc.drop(p[0], p[1], INKS[(Math.random() * INKS.length) | 0], 0.055 + Math.random() * 0.05, 1);
        wc.push(p[0], p[1], 0, 0, 0.09, 0.5);
      },
      { passive: true }
    );
  }

  /* ── the code that the paint dries into ───────────────────────────────── */
  var ctx = code.getContext("2d");
  var CELL = 27; // px per glyph cell at CSS scale
  var cols = 0,
    rows = 0,
    dpr = 1;
  var samp = document.createElement("canvas");
  var sctx = samp.getContext("2d", { willReadFrequently: true });
  var prev = null;
  var live = []; // glyphs currently fading in and out

  /* Real fragments from the kind of shader that draws this, so the fade reads
     as the machinery surfacing rather than as random characters. */
  var TOKENS = [
    "vec3",
    "vec2",
    "float",
    "uniform",
    "texture",
    "mix(",
    "fract(",
    "smoothstep",
    "gl_FragColor",
    "#version 300",
    "in vec2 uv",
    "exp(-d)",
    "absorb",
    "0.5",
    "wetness",
    "diffuse",
    "edge",
    "pigment",
    "clamp(",
    "length(",
    "dot(",
    "}",
    "{",
    "//",
    "vec4(",
    "sampler2D",
    "1.0",
    "aTexCoord",
    "premultiply",
  ];

  function size() {
    var r = hero.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    code.width = Math.round(r.width * dpr);
    code.height = Math.round(r.height * dpr);
    code.style.width = r.width + "px";
    code.style.height = r.height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.max(8, Math.round(r.width / CELL));
    rows = Math.max(6, Math.round(r.height / CELL));
    samp.width = cols;
    samp.height = rows;
    prev = null;
    live.length = 0;
  }
  size();
  addEventListener("resize", size, { passive: true });

  /* A token is sixty to eighty pixels wide and a cell is twenty seven, so
     spawning per cell stacked three or four strings on the same baseline and
     the overlay read as a smudge. A glyph now claims a run of cells on its own
     row, and nothing else lands there until it has gone. */
  var SPAN = 3;
  function free(i) {
    var r = (i / cols) | 0,
      c = i % cols;
    for (var k = 0; k < live.length; k++) {
      var s = live[k];
      if (s.row === r && Math.abs(s.col - c) < SPAN) return false;
    }
    return true;
  }

  var last = 0,
    acc = 0,
    raf = 0,
    onScreen = true;
  /* The nav scrim is a dark wash tuned for a dark site. Over the cream hero it
     reads as a grey band across the top, so the page is told when the nav is
     sitting on paper. Keyed to the hero still touching the top of the viewport
     rather than to plain visibility: the moment it scrolls away the page is
     dark again and the dark scrim is the correct one. */
  function onPaper() {
    var r = hero.getBoundingClientRect();
    document.body.classList.toggle("on-paper", r.top <= 0 && r.bottom > 120);
  }
  onPaper();
  addEventListener("scroll", onPaper, { passive: true });
  addEventListener("resize", onPaper, { passive: true });

  new IntersectionObserver(
    function (es) {
      onScreen = es[0].isIntersecting;
    },
    { threshold: 0.01 }
  ).observe(hero);

  function tick(now) {
    raf = requestAnimationFrame(tick);
    var dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    if (!onScreen || document.hidden) return;

    /* Sample ten times a second. The glyphs are a slow read of a fast
       surface; sampling every frame costs more and looks busier. */
    acc += dt;
    if (acc > 0.1) {
      acc = 0;
      sctx.drawImage(wash, 0, 0, cols, rows);
      var d = sctx.getImageData(0, 0, cols, rows).data;
      if (prev) {
        for (var i = 0; i < cols * rows; i++) {
          var o = i * 4;
          /* Paper is light, pigment is dark, so ink is the inverse of luma. */
          var ink = 1 - (d[o] * 0.299 + d[o + 1] * 0.587 + d[o + 2] * 0.114) / 255;
          var fell = prev[i] - ink;
          if (fell > 0.012 && prev[i] > 0.1 && live.length < 60 && free(i)) {
            live.push({
              cell: i,
              col: i % cols,
              row: (i / cols) | 0,
              x: (i % cols) * CELL + 3,
              y: ((i / cols) | 0) * CELL + CELL - 6,
              t: TOKENS[(Math.random() * TOKENS.length) | 0],
              a: 0,
              peak: Math.min(0.85, 0.25 + fell * 14),
              life: 0,
              hold: 1.1 + Math.random() * 1.5,
              r: d[o],
              g: d[o + 1],
              b: d[o + 2],
            });
          }
          prev[i] = ink;
        }
      } else {
        prev = new Float32Array(cols * rows);
        for (var j = 0; j < cols * rows; j++) {
          var q = j * 4;
          prev[j] = 1 - (d[q] * 0.299 + d[q + 1] * 0.587 + d[q + 2] * 0.114) / 255;
        }
      }
    }

    ctx.clearRect(0, 0, code.width, code.height);
    ctx.font = '11px "DM Mono", ui-monospace, Menlo, monospace';
    ctx.textBaseline = "alphabetic";
    for (var k = live.length - 1; k >= 0; k--) {
      var s = live[k];
      s.life += dt;
      /* in over 0.35s, hold, then out. A glyph that snaps on reads as a
         glitch; the paint it replaces does not snap either. */
      s.a = s.life < 0.35 ? (s.life / 0.35) * s.peak : s.life < s.hold ? s.peak : s.peak * Math.max(0, 1 - (s.life - s.hold) / 0.9);
      if (s.life > s.hold + 0.9) {
        live.splice(k, 1);
        continue;
      }
      /* Coloured from the pigment that was there, darkened so it reads as
         ink on paper rather than as a highlight. */
      ctx.fillStyle = "rgba(" + ((s.r * 0.55) | 0) + "," + ((s.g * 0.55) | 0) + "," + ((s.b * 0.6) | 0) + "," + s.a.toFixed(3) + ")";
      ctx.fillText(s.t, s.x, s.y);
    }
  }
  if (!reduce) raf = requestAnimationFrame(tick);

  window.__heroWash = wc;
})();
