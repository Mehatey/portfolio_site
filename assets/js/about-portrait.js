/* ═══════════════════════════════════════════════════════════════════════════
   THE PORTRAIT IS MADE OF THE SAME STUFF HE IS

   Sid: "the tilt card on my face is not really cool. Everybody does that
   nowadays." And, on the direction as a whole: "telling a story in a cohesive
   visual language."

   He is right on both counts, and the second explains the first. A pointer-
   tracked 3D tilt is a component — it is installable, it is on a thousand
   portfolios, and it says nothing about the person inside the frame. It also
   had nothing to do with the rest of this site: the home page is one substance
   of 55,843 points that becomes a figure, a Buddha, a tree, a brain and a
   cube, and then you arrive at About and the person it is all about is a flat
   photograph in a glass card that wobbles.

   So the portrait is made of points too. The same grammar, the same behaviour,
   arriving on the one page where a visitor is explicitly looking for HIM: the
   substance settles into his face.

   HOW IT IS BUILT

   There is no 3D scan of Sid, and inventing one would look like someone else.
   What exists is the photograph, so the cloud is sampled FROM it: the image is
   drawn once to an offscreen canvas, read back, and every cell above a
   luminance floor becomes a point carrying that pixel's colour. Roughly 20,000
   of them at the default grid. The portrait is therefore genuinely his face,
   not a model of it — the same relationship the hero's cloud has to his own
   character model.

   THREE BEHAVIOURS, MATCHING THE HOME PAGE

     ARRIVAL   the points begin scattered on their own axes and converge as
               the card comes into view, each on a small per-point delay so
               the face gathers out of noise rather than fading up. This is
               the About-page version of the figure assembling.

     BREATH    at rest every point drifts on a slow sine keyed to its own
               position, so the portrait is never quite still — the same
               buoyancy the hero's letters have.

     THE HAND  the pointer pushes points aside locally and they settle back.
               Local, not global: moving the cursor near his shoulder should
               not disturb his eyes, which is the difference between a
               material and an effect.

   The real <img> stays in the markup underneath, which is what a screen
   reader, a crawler, a reduced-motion visitor and anyone without WebGL gets.
   The canvas is decoration layered over content that was already correct.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var card = document.getElementById("about-profile-card");
  if (!card) return;

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (REDUCED) return;

  var img = card.querySelector(".about-photo.active") || card.querySelector(".about-photo");
  if (!img) return;

  var canvas = document.createElement("canvas");
  canvas.className = "about-cloud";
  canvas.setAttribute("aria-hidden", "true");
  card.appendChild(canvas);

  var gl = null;
  try {
    gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false });
  } catch (e) {
    gl = null;
  }
  /* No context, no cloud. The photograph is already there and already right. */
  if (!gl) {
    canvas.remove();
    return;
  }

  var VS = [
    "attribute vec2 a_pos;", // resting position, 0..1 across the image
    "attribute vec3 a_col;",
    "attribute vec2 a_seed;",
    "uniform vec2 u_res;",
    "uniform float u_time, u_in, u_dpr, u_size;",
    "uniform vec2 u_ptr;",
    "uniform float u_ptrOn;",
    "varying vec3 v_col;",
    "varying float v_a;",
    "void main() {",
    "  vec2 p = a_pos;",

    /* ── ARRIVAL ────────────────────────────────────────────────────────
       u_in runs 0 to 1 as the card enters. Each point remaps it through its
       own delay, so the face gathers from the inside out over the whole
       range instead of every point landing together. The scatter direction
       is the point's own stable seed, and the distance falls off with the
       square so the last of the travel is slow — things arriving should
       decelerate. */
    "  float d = clamp((u_in - a_seed.x * 0.42) / 0.58, 0.0, 1.0);",
    "  d = d * d * (3.0 - 2.0 * d);",
    "  float away = (1.0 - d) * (1.0 - d);",
    "  vec2 dir = vec2(cos(a_seed.y * 6.28318), sin(a_seed.y * 6.28318));",
    "  p += dir * away * (0.18 + a_seed.x * 0.5);",

    /* ── BREATH ─────────────────────────────────────────────────────────
       Tiny, and keyed to position rather than to index, so the drift travels
       across the face as a wave rather than shimmering per point. */
    "  p.x += sin(u_time * 0.5 + a_pos.y * 9.0 + a_seed.y * 6.0) * 0.0022;",
    "  p.y += cos(u_time * 0.42 + a_pos.x * 8.0 + a_seed.x * 6.0) * 0.0026;",

    /* ── THE HAND ───────────────────────────────────────────────────────
       Local. The falloff is deliberately tight so a cursor near one edge of
       the portrait leaves the rest of it alone. */
    "  vec2 toP = p - u_ptr;",
    "  float pd = length(toP * vec2(1.0, 1.0));",
    "  float infl = u_ptrOn * exp(-pd * pd * 46.0);",
    "  p += normalize(toP + 0.0001) * infl * 0.05;",

    "  v_col = a_col;",
    /* ── HE EMERGES FROM THE DARK ────────────────────────────────────────
       Sampling every cell above the floor gave a full rectangle of points,
       including the grey wall behind him — so the card read as a panel of
       grain with a figure somewhere in it, rather than as a figure.

       Alpha follows the point's own luminance, so the lit half of his face
       and the blue of the shirt carry the portrait and the surround falls
       away to nothing. Same composition the hero uses: the substance is the
       subject, and everything around it is dark. The points are still drawn —
       they still move, and they still catch the hand — they are simply almost
       transparent where the photograph had nothing to say. */
    "  float lum = dot(a_col, vec3(0.299, 0.587, 0.114));",
    "  float mx = max(a_col.r, max(a_col.g, a_col.b));",
    "  float mn = min(a_col.r, min(a_col.g, a_col.b));",
    "  float sat = mx > 0.001 ? (mx - mn) / mx : 0.0;",
    /* Keying on darkness was the first attempt and it was simply wrong about
       the photograph: the surround is not dark, it is a LIGHT GREY WALL at
       about 0.55 luminance, well above any floor that would have dropped it.

       What actually separates him from it is that he is coloured and it is
       not. The wall is the one region that is both mid-to-light AND
       desaturated; his shirt and skin are saturated, and his hair and the
       shadow under the cap are dark. So `wall` is the product of those two
       conditions and presence is its inverse — which keeps the dark parts of
       him that have no colour at all, because they fail the lightness half. */
    "  float wall = smoothstep(0.34, 0.63, lum) * (1.0 - smoothstep(0.05, 0.20, sat));",
    "  float presence = clamp(1.0 - wall, 0.0, 1.0);",
    /* Points fade in with their own arrival and dim slightly where the hand
       has pushed them, so a disturbance reads as depth rather than as a hole. */
    "  v_a = d * presence * (1.0 - infl * 0.45);",
    "  vec2 clip = vec2(p.x * 2.0 - 1.0, 1.0 - p.y * 2.0);",
    "  gl_Position = vec4(clip, 0.0, 1.0);",
    "  gl_PointSize = u_size * u_dpr * (1.0 + infl * 1.4);",
    "}",
  ].join("\n");

  var FS = [
    "precision mediump float;",
    "varying vec3 v_col;",
    "varying float v_a;",
    "void main() {",
    "  vec2 c = gl_PointCoord - 0.5;",
    "  float r = dot(c, c);",
    "  if (r > 0.25) discard;",
    /* Soft-edged, so overlapping points blend into skin rather than tiling
       into a visible grid of discs. */
    "  float soft = smoothstep(0.25, 0.02, r);",
    "  gl_FragColor = vec4(v_col, soft * v_a);",
    "}",
  ].join("\n");

  function sh(t, src) {
    var o = gl.createShader(t);
    gl.shaderSource(o, src);
    gl.compileShader(o);
    if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(o));
      return null;
    }
    return o;
  }
  var vs = sh(gl.VERTEX_SHADER, VS),
    fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) {
    canvas.remove();
    return;
  }
  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    canvas.remove();
    return;
  }
  gl.useProgram(prog);

  var U = {};
  ["u_res", "u_time", "u_in", "u_dpr", "u_size", "u_ptr", "u_ptrOn"].forEach(function (k) {
    U[k] = gl.getUniformLocation(prog, k);
  });
  var aPos = gl.getAttribLocation(prog, "a_pos"),
    aCol = gl.getAttribLocation(prog, "a_col"),
    aSeed = gl.getAttribLocation(prog, "a_seed");

  var count = 0,
    ready = false;

  /* ── SAMPLING THE PHOTOGRAPH ─────────────────────────────────────────────
     Drawn once into an offscreen 2D canvas at the grid's own resolution, so
     the browser does the downscaling with its own filtering and every cell is
     already an average of the pixels it covers. Reading back one small image
     is far cheaper than reading the full-size one and averaging by hand, and
     the result is smoother.

     The luminance floor drops the near-black surround: those points would
     draw as invisible dots and cost the same as visible ones. */
  function build() {
    var GRID = 190;
    var off = document.createElement("canvas");
    off.width = GRID;
    off.height = GRID;
    var c2 = off.getContext("2d", { willReadFrequently: true });
    if (!c2) return;
    try {
      c2.drawImage(img, 0, 0, GRID, GRID);
    } catch (e) {
      return;
    }
    var data;
    try {
      data = c2.getImageData(0, 0, GRID, GRID).data;
    } catch (e) {
      /* A cross-origin image taints the canvas and getImageData throws. The
         photograph is same-origin here, but a CDN move would change that and
         should degrade rather than break. */
      return;
    }

    var pos = [],
      col = [],
      seed = [];
    for (var y = 0; y < GRID; y++) {
      for (var x = 0; x < GRID; x++) {
        var i = (y * GRID + x) * 4;
        var r = data[i] / 255,
          g = data[i + 1] / 255,
          b = data[i + 2] / 255;
        var lum = 0.299 * r + 0.587 * g + 0.114 * b;
        if (lum < 0.055) continue;
        pos.push((x + 0.5) / GRID, (y + 0.5) / GRID);
        col.push(r, g, b);
        /* Two stable randoms per point: one for its arrival delay and travel
           distance, one for its direction. Hashed off the grid position so
           the assembly is identical on every load. */
        var h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
        var h2 = Math.sin(x * 269.5 + y * 183.3) * 24634.6345;
        seed.push(h - Math.floor(h), h2 - Math.floor(h2));
      }
    }
    count = pos.length / 2;
    if (!count) return;

    function buf(arr, loc, n) {
      var b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, n, gl.FLOAT, false, 0, 0);
    }
    buf(pos, aPos, 2);
    buf(col, aCol, 3);
    buf(seed, aSeed, 2);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    ready = true;
    card.classList.add("has-cloud");
    resize();
  }

  var dpr = 1,
    W = 1,
    H = 1;
  function resize() {
    var r = card.getBoundingClientRect();
    if (r.width < 4) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(2, Math.round(r.width * dpr));
    H = Math.max(2, Math.round(r.height * dpr));
    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W;
      canvas.height = H;
    }
    gl.viewport(0, 0, W, H);
    gl.uniform2f(U.u_res, W, H);
    gl.uniform1f(U.u_dpr, dpr);
    /* Sized so neighbours just overlap: the grid is 190 across the card's
       width, so each cell is width/190 and a point a little larger than that
       closes into a surface. */
    /* 1.9 rather than 1.55: at the smaller size the grid never closed and
       skin read as stipple. A point a little under twice its cell overlaps its
       neighbours enough to become a surface while still leaving the texture
       visible, which is the point of drawing it this way at all. */
    gl.uniform1f(U.u_size, Math.max(1.8, (r.width / 190) * 1.9));
  }
  window.addEventListener("resize", resize, { passive: true });

  /* ── the pointer, in image space ─────────────────────────────────────── */
  var px = -9,
    py = -9,
    tOn = 0,
    on = 0;
  card.addEventListener(
    "pointermove",
    function (e) {
      var r = card.getBoundingClientRect();
      px = (e.clientX - r.left) / Math.max(1, r.width);
      py = (e.clientY - r.top) / Math.max(1, r.height);
      tOn = 1;
    },
    { passive: true }
  );
  card.addEventListener(
    "pointerleave",
    function () {
      tOn = 0;
    },
    { passive: true }
  );

  var inV = 0,
    inT = 0,
    onScreen = false,
    t0 = performance.now(),
    raf = 0;

  if (window.IntersectionObserver) {
    new IntersectionObserver(
      function (es) {
        onScreen = es[0].isIntersecting;
        /* Assembles once, on arrival, and does not run backwards when the
           card scrolls away — a portrait that dismantles itself every time it
           leaves the viewport is a fidget, not an entrance. */
        if (onScreen) {
          inT = 1;
          start();
        }
      },
      { threshold: 0.25 }
    ).observe(card);
  } else {
    inT = 1;
    onScreen = true;
  }

  function frame(now) {
    raf = 0;
    if (!ready) return;
    var t = (now - t0) / 1000;
    inV += (inT - inV) * 0.026;
    on += (tOn - on) * (tOn > on ? 0.12 : 0.06);

    gl.uniform1f(U.u_time, t);
    gl.uniform1f(U.u_in, Math.min(1, inV * 1.05));
    gl.uniform2f(U.u_ptr, px, py);
    gl.uniform1f(U.u_ptrOn, on);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, count);

    /* Keeps running while it is on screen, because the breath never stops;
       stops entirely once it is not, because nothing should. */
    if (onScreen) raf = requestAnimationFrame(frame);
  }
  function start() {
    if (!raf) raf = requestAnimationFrame(frame);
  }
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && onScreen) start();
  });

  if (img.complete && img.naturalWidth) build();
  else img.addEventListener("load", build, { once: true });

  /* A verification hook, not a feature. Nothing on the page calls it; it lets
     a headless run read the point count and the arrival value, which is the
     only way to check that a portrait made of twenty thousand points is
     actually made of twenty thousand points. */
  window.__aboutCloud = function () {
    return { points: count, ready: ready, arrival: +inV.toFixed(3) };
  };
})();
