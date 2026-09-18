/* ══ THE PORTRAIT IS ALIVE ═══════════════════════════════════════════════
   Sid: "i want my image to feel alive in about with constant motion and
   blurs and not a fixed shape like a rect or a circle, it shud feel modern
   design and tech futuristic cool af animated, not a basic ui card with
   tilt."

   And, one message earlier, about what was there: "the blur isnt good, it
   looks like a weird cloud, the whole image is blurred. when it moves or
   animates its super janky."

   Those two notes are not in conflict, and reading them together is the
   whole brief. He wants constant motion and he wants softness. What he does
   not want is the FACE softened, and he does not want the motion to cost
   frames. Every previous attempt failed one of those: an over-scaled 34px
   blur copy, three screen-blended copies of the top band, and a mask of
   three drifting radial gradients -- all of which soften the photograph
   uniformly, and all of which animate something the compositor cannot take,
   so the browser re-renders a filter or re-rasterises a mask sixty times a
   second on the largest element on the page. That is the jank, and it is
   structural rather than a matter of tuning.

   WHY THIS IS A SHADER. Put the motion on the GPU and the trade disappears:
   a fragment shader on one quad is the same cost whether it is still or
   moving, so "constant motion" becomes free rather than expensive. It also
   makes the one thing CSS genuinely cannot do possible -- varying the
   treatment ACROSS the picture. The centre samples the photograph
   untouched, so the face is sharper than it has ever been here, and
   everything soft happens where the picture meets the page.

   WHAT IT DOES, from the inside out:

     · THE SHAPE is four metaballs on slow independent orbits, summed into a
       field and thresholded. It is never a rectangle and never a circle,
       and because the four periods do not divide into each other it never
       repeats within a visit. That is the "not a fixed shape" part, and a
       signed distance field is the only way to get an edge that other
       effects can be driven BY.

     · THE EDGE BAND, where the field approaches its threshold, is where all
       the softness lives. Three things ramp up together across it: the UV
       is pushed along a curl of value noise, so the picture smears
       tangentially rather than blurring radially; the three colour channels
       are sampled at slightly different offsets, which is chromatic
       aberration and reads as a lens rather than as a filter; and the UV is
       snapped to a cell grid whose size grows toward the edge, so the smear
       arrives as pixel blocks.

     · THE DISSOLVE is that same cell grid thresholded against a per-cell
       hash, so the boundary breaks into squares that thin out rather than
       fading to nothing. This is the site's own language -- the cursor is a
       pixel block, the nav glyphs are pixel drawings, the footer is a pixel
       field -- and it is the reason the edge reads as "tech" instead of as
       a soft vignette.

     · APPROACH adds amplitude. The flow, the aberration and the cell size
       all lift toward the pointer, so moving onto the picture disturbs it
       and moving away lets it settle. Nothing switches on or off.

   FALLBACK. If there is no WebGL, or reduced motion is asked for, this file
   returns and the card keeps the static pixel-dissolve mask in the
   stylesheet -- a crisp photograph with a square-block top edge. That is a
   finished design on its own, not a degraded one.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var VERT = ["attribute vec2 p;", "varying vec2 uv;", "void main(){ uv = p * 0.5 + 0.5; uv.y = 1.0 - uv.y; gl_Position = vec4(p, 0.0, 1.0); }"].join(
    "\n"
  );

  var FRAG = [
    "precision highp float;",
    "varying vec2 uv;",
    "uniform sampler2D tex;",
    "uniform vec2 res;", // canvas size in px
    "uniform vec2 img;", // natural size of the photograph
    "uniform float t;",
    "uniform float hov;", // 0..1 approach
    "uniform float cellPx;",

    /* A hash and a value noise. Small on purpose: this runs per pixel and
       the shape it feeds is organic enough that gradient noise would be
       spending precision nobody can see. */
    "float hash(vec2 v){ return fract(sin(dot(v, vec2(127.1, 311.7))) * 43758.5453123); }",
    "float vnoise(vec2 v){",
    "  vec2 i = floor(v); vec2 f = fract(v);",
    "  vec2 u = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),",
    "             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);",
    "}",
    "float fbm(vec2 v){ return 0.58 * vnoise(v) + 0.28 * vnoise(v * 2.07) + 0.14 * vnoise(v * 4.13); }",

    /* THE SHAPE. Four metaballs, each on its own slow orbit. Summed as
       inverse square distance, which is what makes two of them MERGE as
       they approach instead of overlapping -- that merging is the thing
       that reads as alive rather than as four shapes moving. */
    "float field(vec2 q){",
    "  float s = 0.0;",
    /* ── A CALM FORM, NOT AN AMOEBA ────────────────────────────────────
       Sid: "you need to do some other visual treatment for that image, it
       looks terrible."

       The aspect bug was most of it, and the shape was the rest. Four balls
       on 0.05-0.09 orbits over a 500px card move the silhouette by up to
       45px in every direction, and because the four periods are unrelated
       the outline wanders rather than breathes -- a lumpy edge, shifting,
       around a photograph of a person. He asked for "not a fixed shape like
       a rect or a circle", and an amoeba is the overcorrection.

       The centres are pulled into a vertical column and the orbits cut to
       about a third -- 0.018 to 0.030, which is 9 to 15px. The field then
       reads as one tall rounded form with a living edge, which is what a
       portrait wants: the motion is in the boundary, not in the outline's
       identity. The two lower balls carry slightly more weight so the form
       is wider at the chest than at the crown, following the picture. */
    "  vec2 c1 = vec2(0.50 + 0.022 * sin(t * 0.21), 0.30 + 0.018 * cos(t * 0.17));",
    "  vec2 c2 = vec2(0.50 + 0.020 * cos(t * 0.13), 0.46 + 0.024 * sin(t * 0.11));",
    "  vec2 c3 = vec2(0.50 + 0.030 * sin(t * 0.09 + 1.7), 0.64 + 0.020 * cos(t * 0.15 + 0.6));",
    "  vec2 c4 = vec2(0.50 + 0.026 * cos(t * 0.19 + 2.4), 0.80 + 0.022 * sin(t * 0.23 + 1.1));",
    "  vec2 asp = vec2(1.0, res.y / max(res.x, 1.0));",
    "  s += 0.052 / max(dot((q - c1) / asp, (q - c1) / asp), 1e-4);",
    "  s += 0.062 / max(dot((q - c2) / asp, (q - c2) / asp), 1e-4);",
    "  s += 0.070 / max(dot((q - c3) / asp, (q - c3) / asp), 1e-4);",
    "  s += 0.066 / max(dot((q - c4) / asp, (q - c4) / asp), 1e-4);",
    "  return s;",
    "}",

    /* ── COVER FIT, AND IT WAS INVERTED ──────────────────────────────────
       Sid: "why am i stretched horribly like this."

       He was, and the maths says by how much. The canvas is 500x625 (0.800)
       and the photograph is 933x1400 (0.666), so ar = 1.200. Under `cover`
       the visible fraction of the picture's height should be 1/ar = 0.833 --
       crop the top and bottom, keep the width. The shader MULTIPLIED by ar
       instead, sampling 1.200 of the height: 1.44 times more of the
       photograph than fits, squeezed into the same pixels. A picture
       compressed vertically is a person stretched horizontally, which is
       exactly what he is pointing at.

       Both branches were the wrong way round. For a canvas that is
       relatively wider you DIVIDE the y range; for one that is relatively
       taller you MULTIPLY the x range. Derived rather than guessed:
       scale = max(cw/iw, ch/ih), and the visible fractions are
       cw/(iw*scale) and ch/(ih*scale), which reduce to 1 and 1/ar in the
       first case and ar and 1 in the second. */
    "vec2 cover(vec2 q){",
    "  float ar = (res.x / max(res.y, 1.0)) / (img.x / max(img.y, 1.0));",
    "  if (ar > 1.0) { q.y = (q.y - 0.5) / ar + 0.5; }",
    "  else { q.x = (q.x - 0.5) * ar + 0.5; }",
    "  return q;",
    "}",

    "void main(){",
    "  vec2 q = uv;",
    "  float f = field(q);",
    /* 1.0 is the threshold. `edge` is 0 in the core and 1 at the boundary,
       and everything soft is scaled by it -- so the face, which sits deep
       inside the field, is sampled with no distortion at all. */
    "  float inside = smoothstep(0.86, 1.22, f);",
    "  float edge = 1.0 - smoothstep(0.0, 0.62, f - 1.0);",
    "  edge = clamp(edge, 0.0, 1.0);",
    "  float amp = edge * edge * (0.55 + 0.85 * hov);",

    /* THE FLOW, SAMPLED PER CELL AND NOT PER PIXEL. This is what finally
       makes it read as blocks. Sampling the curl at the pixel gives every
       pixel in a cell a slightly different offset, which is a SMEAR -- and
       a smear along the boundary is the combing Sid would have seen next:
       fine horizontal feathering rather than squares. Sampling it at the
       cell's centre gives every pixel in the cell the SAME offset, so the
       cell moves as one solid object and the edge comes apart into blocks
       that slide instead of into hair.

       Curl rather than gradient, so the blocks travel ALONG the edge -- a
       radial push reads as a lens, a tangential one reads as the picture
       being carried away. */
    "  float fcs = cellPx * 2.0 / max(res.x, 1.0);",
    "  vec2 fq = floor(q / fcs) * fcs + fcs * 0.5;",
    "  float e = 0.012;",
    "  vec2 nq = fq * 3.1 + vec2(t * 0.045, -t * 0.032);",
    "  float n1 = fbm(nq + vec2(e, 0.0)) - fbm(nq - vec2(e, 0.0));",
    "  float n2 = fbm(nq + vec2(0.0, e)) - fbm(nq - vec2(0.0, e));",
    "  vec2 flow = vec2(n2, -n1) * 2.2;",

    /* THE CELLS, ON ONE GRID. The first version scaled the cell size by
       `edge`, which is per-pixel -- so two neighbouring pixels quantised
       against grids of different sizes and their snapped positions did not
       agree. Photographed: the edge came out as long vertical combing
       rather than as blocks, because the cell boundaries were never in the
       same place twice.

       The grid is fixed now and only the AMOUNT of snapping varies. Every
       pixel in a cell resolves to the same sample, so a cell is a solid
       square, and the blocks appear by blending toward that grid as the
       edge approaches rather than by coarsening it. Two grid steps, an
       octave apart, so the dissolve has a big block and a small one
       instead of one uniform size. */
    "  float cs = cellPx / max(res.x, 1.0);",
    "  float cs2 = cs * 2.0;",
    "  vec2 cq = floor(q / cs) * cs + cs * 0.5;",
    "  vec2 cq2 = floor(q / cs2) * cs2 + cs2 * 0.5;",
    "  vec2 grid = mix(cq, cq2, smoothstep(0.45, 0.95, edge));",
    "  vec2 sq = mix(q, grid, smoothstep(0.12, 0.72, edge));",
    "  vec2 base = sq + flow * amp * 0.075;",

    /* THE ABERRATION. One sample per channel, offset along the flow. Three
       taps is the cheapest honest chromatic split and it is the detail that
       makes the edge read as optical rather than as a cutout. */
    "  vec2 ab = flow * amp * 0.018 + vec2(amp * 0.006, 0.0);",
    "  float r = texture2D(tex, cover(base + ab)).r;",
    "  float g = texture2D(tex, cover(base)).g;",
    "  float b = texture2D(tex, cover(base - ab)).b;",
    "  vec3 col = vec3(r, g, b);",

    /* A little lift in the band, so where the picture is coming apart it is
       also catching light -- the same reasoning as the old bloom, except
       the light lands on the edge rather than over the whole face. */
    "  col += vec3(0.12, 0.15, 0.22) * edge * edge * (0.35 + 0.5 * hov);",

    /* THE DISSOLVE. Per-cell hash against the field, so the boundary breaks
       into squares that thin out. The hash walks slowly, which is what
       keeps the edge alive while the shape itself is barely moving. */
    "  vec2 dq = floor(q / cs2);",
    "  float grain = hash(dq + floor(vec2(t * 0.9, t * 0.55)));",
    "  float a = inside - edge * 0.55 * grain;",
    "  a = clamp(a, 0.0, 1.0);",
    "  if (a < 0.01) discard;",
    "  gl_FragColor = vec4(col * a, a);",
    "}",
  ].join("\n");

  function sh(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      /* Left as a console error rather than swallowed: a shader that does
         not compile is a bug in this file, and the page has already fallen
         back to the CSS dissolve by the time anyone reads it. */
      console.error("about-portrait:", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  function boot() {
    var card = document.getElementById("about-profile-card");
    if (!card) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var img = card.querySelector(".about-photo.active") || card.querySelector(".about-photo");
    if (!img) return;

    /* ── CLAIM A SLOT FIRST ────────────────────────────────────────────
       gl-budget.js is the one place that decides how many WebGL contexts a
       page may open, and it exists because iOS Safari keeps about eight per
       tab and silently DROPS THE OLDEST when a ninth arrives -- no throw, no
       console, just some unrelated canvas further up the page going blank.
       /about/ was already measured at seven desktop contexts and four on a
       phone, so this is the fifth on the device with the lower ceiling.

       A refused layer must return without creating a context, which is the
       contract in that file. The card then keeps the static CSS dissolve,
       and on a phone that is the better outcome anyway: a pointer-driven
       treatment has nothing to respond to on a touch screen. */
    if (window.SidGL && !window.SidGL.claim("about-portrait")) return;

    var cv = document.createElement("canvas");
    cv.className = "about-gl";
    cv.setAttribute("aria-hidden", "true");
    var gl = null;
    try {
      gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false });
    } catch (e) {}
    if (!gl) {
      if (window.SidGL) window.SidGL.release("about-portrait");
      return;
    }

    var vs = sh(gl, gl.VERTEX_SHADER, VERT);
    var fs = sh(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      if (window.SidGL) window.SidGL.release("about-portrait");
      return;
    }
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("about-portrait:", gl.getProgramInfoLog(prog));
      if (window.SidGL) window.SidGL.release("about-portrait");
      return;
    }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var U = {};
    ["tex", "res", "img", "t", "hov", "cellPx"].forEach(function (k) {
      U[k] = gl.getUniformLocation(prog, k);
    });

    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    var loaded = false;
    function upload() {
      if (!img.naturalWidth) return;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      /* The photograph is not a power of two and does not need to be:
         CLAMP_TO_EDGE plus LINEAR with no mipmaps is valid for NPOT in
         WebGL1, and mipmaps would only soften a texture whose whole point
         is that the middle of it stays sharp. */
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      } catch (e) {
        return;
      }
      gl.uniform2f(U.img, img.naturalWidth, img.naturalHeight);
      loaded = true;
    }
    if (img.complete) upload();
    img.addEventListener("load", upload);

    /* Blending is straight rather than premultiplied-by-source, because the
       shader writes colour ALREADY multiplied by alpha -- which is what
       stops the dissolved cells carrying a dark fringe from the transparent
       side of the gradient. */
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    function size() {
      var r = card.getBoundingClientRect();
      var w = Math.max(1, Math.round(r.width * dpr));
      var h = Math.max(1, Math.round(r.height * dpr));
      if (cv.width === w && cv.height === h) return;
      cv.width = w;
      cv.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.res, w, h);
      /* One screen pixel of cell is 13 device px at dpr 2, which is the same
         cell the 2D pixel canvas on this card already uses -- the two
         treatments are the same grid. */
      gl.uniform1f(U.cellPx, 13 * dpr);
    }

    var hov = 0,
      want = 0;
    card.addEventListener(
      "pointerenter",
      function () {
        want = 1;
      },
      { passive: true }
    );
    card.addEventListener(
      "pointerleave",
      function () {
        want = 0;
      },
      { passive: true }
    );
    card.addEventListener("focus", function () {
      want = 1;
    });
    card.addEventListener("blur", function () {
      want = 0;
    });

    var t0 = performance.now();
    var live = false,
      raf = 0;
    function frame(now) {
      raf = 0;
      if (!live) return;
      size();
      if (loaded) {
        hov += (want - hov) * 0.07;
        gl.uniform1f(U.t, (now - t0) / 1000);
        gl.uniform1f(U.hov, hov);
        gl.uniform1i(U.tex, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      raf = requestAnimationFrame(frame);
    }

    /* Nothing runs while the card is off screen. The page is 9,000px long
       and a shader turning over for the other 8,000 of them is exactly the
       kind of cost that makes a site feel heavy. */
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (es) {
          live = es[0].isIntersecting;
          if (live && !raf) raf = requestAnimationFrame(frame);
        },
        { rootMargin: "200px" }
      );
      io.observe(card);
    } else {
      live = true;
      raf = requestAnimationFrame(frame);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) live = false;
      else if ("IntersectionObserver" in window === false || card.getBoundingClientRect().top < window.innerHeight) {
        live = true;
        if (!raf) raf = requestAnimationFrame(frame);
      }
    });
    window.addEventListener("resize", size, { passive: true });

    /* If the context is lost -- a backgrounded tab on a phone, a GPU reset --
       the slot goes back to the budget and the card returns to the CSS
       dissolve rather than sitting as an empty transparent canvas. */
    cv.addEventListener(
      "webglcontextlost",
      function (e) {
        e.preventDefault();
        live = false;
        card.classList.remove("gl-live");
        if (window.SidGL) window.SidGL.release("about-portrait");
      },
      false
    );

    card.appendChild(cv);
    /* The flag the stylesheet keys off: the static CSS dissolve, the 2D
       pixel canvas and the photograph itself all stand down once the shader
       is actually drawing, so the two treatments never stack. Set last, so
       a failure anywhere above leaves the fallback in place. */
    card.classList.add("gl-live");

    /* ── AND THE CARD STOPS BEING A CARD, INLINE ───────────────────────
       Set here rather than in the stylesheet, and not for want of trying
       the stylesheet first: `.about-profile-card.gl-live { background: none
       !important }` sits later in the file than the `background: #0a0e14`
       it is meant to beat and still lost -- measured after the rebuild,
       computed background rgb(10, 14, 20). Rather than hunt whichever of
       the fourteen rules on this selector is winning, the element is told
       directly. An inline !important is the top of the cascade and cannot
       be argued with by a rule added later either.

       THE TILT GOES WITH IT. Sid: "not a basic ui card with tilt." That is
       `transform: perspective(1100px) rotateY(...) rotateX(...)` following
       the pointer, and it is the single most generic interaction a portrait
       can have -- every template has it. The shader's own motion is the
       interaction now, so a 3D card rotation underneath would be two
       different ideas about the same picture.

       ::before and ::after are a specular sweep and two vignette gradients
       painted over the whole rectangle. They were drawn for a rectangle
       and there is no longer one, so they read as a ghost frame around the
       blob. Cancelled by writing the custom properties they read from and
       hiding them via the class. */
    [
      ["background", "none"],
      ["box-shadow", "none"],
      ["border", "0"],
      ["border-radius", "0"],
      ["transform", "none"],
      ["overflow", "visible"],
    ].forEach(function (d) {
      card.style.setProperty(d[0], d[1], "important");
    });

    size();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
