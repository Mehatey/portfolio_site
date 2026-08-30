/* ─────────────────────────────────────────────────────────────────────────
   LIGHT THROUGH WATER, ON EVERY PAGE

   Sid: "i want a more creative shader across the whole site then the one we
   have now", and earlier: "i dont like the generic shader one with the dots
   be more creaitve it needs to be award winning not generic".

   What was site-wide before this was the film grade: grain and a vignette,
   both CSS, neither of them a shader. This is the third layer of that grade
   and the only one that is actually computed — a caustic field, the pattern
   light makes on the floor of a pool, drifting across the whole document.

   WHY CAUSTICS AND NOT SOMETHING ELSE. The site already has a pond in its
   footer, a Buddha in still water and a room built around stillness. A
   caustic is the one ambient pattern that belongs to that world rather than
   being applied to it — and, unlike a particle field or a noise wash, it is
   an optical phenomenon with a shape people recognise, so it reads as light
   rather than as an effect.

   HOW IT IS COMPUTED. Five iterations of a folded domain, each fed back into
   the next with a phase that advances differently per iteration; the
   reciprocal of the folded distance is what produces the filaments, and the
   final pow() is what makes them thin. This is the standard construction and
   it earns its place by being the one that looks right: the filaments have to
   be sparse and very bright rather than dense and grey, which is a high
   exponent on a nearly-black field, not a contrast curve.

   HOW IT IS BLENDED. soft-light on the dark page: it lifts what is already
   light and leaves the blacks alone, so it never fogs a photograph or greys
   type. On cream it multiplies instead — light through water on a pale ground
   reads as the shadow between the filaments, not as the filaments.

   WHAT IT RESPONDS TO. Scroll velocity, off the site's shared --sv, pushes
   the field; a fast flick pulls the water sideways and it settles. And the
   pointer opens a slow, wide brightening — not a spotlight following the
   cursor, which would make it a cursor effect, but the difference between
   standing over water and not.

   COST. Half resolution, 30fps, one fullscreen quad, five loop iterations.
   Measured on this machine it is under a millisecond a frame; it stops
   entirely when the tab is hidden. ─────────────────────────────────────── */
(function () {
  "use strict";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var raf = 0;

  var cv = document.createElement("canvas");
  cv.className = "caustics";
  cv.setAttribute("aria-hidden", "true");

  var gl = cv.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: "low-power" });
  if (!gl) return;
  /* This one is on every route and is therefore the context most likely to be
     alive when something else needs one. Losing it should cost the grade, not
     the page. */
  cv.addEventListener("webglcontextlost", function (e) {
    e.preventDefault();
    cancelAnimationFrame(raf);
    raf = 0;
    cv.style.display = "none";
  });

  var VS = ["#version 300 es", "in vec2 a;", "void main(){ gl_Position = vec4(a,0.,1.); }"].join("\n");

  var FS = [
    "#version 300 es",
    "precision highp float;",
    "uniform vec2 u_res;",
    "uniform float u_t;",
    "uniform float u_shear;",
    "uniform vec2 u_ptr;",
    "uniform float u_warm;",
    "uniform float u_light;",
    "uniform float u_invert;",
    "out vec4 o;",

    /* The folded domain. `p` is wrapped into one tile of 2pi and pushed a long
       way negative so the reciprocal below never lands on its singularity —
       that offset is not decoration, without it the field is full of blown
       white pixels. */
    "float caustic(vec2 uv, float t){",
    "  vec2 p = mod(uv * 6.28318, 6.28318) - 250.0;",
    "  vec2 i = p;",
    "  float c = 1.0;",
    "  const float inten = 0.0048;",
    "  for (int n = 0; n < 5; n++) {",
    "    float ti = t * (1.0 - (3.5 / float(n + 1)));",
    "    i = p + vec2(cos(ti - i.x) + sin(ti + i.y), sin(ti - i.y) + cos(ti + i.x));",
    "    c += 1.0 / length(vec2(p.x / (sin(i.x + ti) / inten), p.y / (cos(i.y + ti) / inten)));",
    "  }",
    "  c /= 5.0;",
    "  c = 1.17 - pow(c, 1.4);",
    /* 7, not 8. At 8 the filaments break into dashes at half resolution --
       the line gets thinner than the pixel that has to hold it. */
    "  return clamp(pow(abs(c), 7.0), 0.0, 1.0);",
    "}",

    "void main(){",
    "  vec2 uv = gl_FragCoord.xy / u_res;",
    "  vec2 q = uv;",
    "  q.x *= u_res.x / u_res.y;",
    /* Scale. 1.35 was the first guess and it put a SINGLE cell across a
       1000px window -- rendered in isolation the field was one enormous
       filament arch and a slab of empty blue, which composited over the page
       as a soft wash with no structure in it at all. That is how a caustic
       becomes a gradient.

       3.4 puts three or four cells across a laptop: enough that the filaments
       read as a pattern of light, few enough that it is still water and not a
       texture. */
    "  q *= 3.4;",
    /* Scroll shear. Horizontal, because the page travels vertically and a
       field that slides the same way you are scrolling is invisible. */
    "  q.x += u_shear * 0.16;",
    "  q.y -= u_t * 0.012;",

    /* A low-frequency warp before the fold. The caustic function wraps its
       domain into one tile, so at any scale where you can see more than a
       couple of cells the lattice is plainly visible -- rendered in isolation
       it was a five-by-four grid of identical arches, which is the single
       thing that gives a procedural field away as procedural. Bending the
       domain first costs two sines and there is no tile left to find. */
    "  q += vec2(sin(q.y * 0.62 + u_t * 0.09), cos(q.x * 0.55 - u_t * 0.07)) * 0.62;",

    "  float c = caustic(q, u_t * 0.42);",

    /* A second pass, half scale and drifting the other way, so the field has
       a near layer and a far one. Water is never one depth. */
    "  c += caustic(q * 0.53 + vec2(3.1, 1.7), u_t * 0.29 + 12.0) * 0.55;",

    /* The light falls from the top of the window. A perfectly even field
       reads as a filter over the page; a gradient reads as a source. */
    "  float fall = mix(1.0, 0.34, smoothstep(0.0, 0.95, 1.0 - uv.y));",
    "  c *= fall;",

    /* The pointer. Wide and slow -- the difference between standing over the
       water and not, rather than a torch being carried across it. */
    "  vec2 d = (uv - u_ptr) * vec2(u_res.x / u_res.y, 1.0);",
    "  c *= 1.0 + exp(-dot(d, d) * 5.5) * 0.85 * u_warm;",

    /* Faintly cool at the peaks. Pure white filaments read as a bloom bug;
       water bends blue further than it bends red. */
    "  vec3 tint = mix(vec3(0.62, 0.80, 1.0), vec3(1.0, 0.97, 0.90), clamp(c * 1.4, 0.0, 1.0));",
    /* ── CREAM NEEDS THE OTHER HALF OF THE PHENOMENON ──────────────────
       On the dark page the filaments ARE the image: bright lines screened
       onto black. Composited onto cream the same output is a bright colour
       multiplied against a bright ground, which is arithmetically almost
       nothing -- measured, the light page came back visually unchanged.

       What light through water looks like on a pale floor is the shadow
       BETWEEN the filaments, so on cream the field paints a cool grey-blue at
       the same alpha and multiply darkens it. Same geometry, opposite
       polarity, which is the honest translation rather than a second effect. */
    "  vec3 col = mix(tint, vec3(0.28, 0.36, 0.52), u_invert);",
    "  float a = clamp(c, 0.0, 1.0) * u_light;",
    "  o = vec4(col * a, a);",
    "}",
  ].join("\n");

  function sh(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      /* Logged rather than swallowed. A silent shader failure on this site has
         cost five commits of invisible work before. */
      console.warn("caustics: " + gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  var vs = sh(gl.VERTEX_SHADER, VS),
    fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;
  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, "a");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn("caustics: " + gl.getProgramInfoLog(prog));
    return;
  }
  gl.useProgram(prog);

  var vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  var U = {
    res: gl.getUniformLocation(prog, "u_res"),
    t: gl.getUniformLocation(prog, "u_t"),
    shear: gl.getUniformLocation(prog, "u_shear"),
    ptr: gl.getUniformLocation(prog, "u_ptr"),
    warm: gl.getUniformLocation(prog, "u_warm"),
    light: gl.getUniformLocation(prog, "u_light"),
    invert: gl.getUniformLocation(prog, "u_invert"),
  };

  document.body.appendChild(cv);

  /* Half resolution. A caustic is a soft field; the browser's own upscale of
     it is indistinguishable from computing it at device resolution, and it is
     a quarter of the fragments. */
  var SCALE = 0.5;
  function size() {
    var w = Math.max(2, Math.round(innerWidth * SCALE)),
      h = Math.max(2, Math.round(innerHeight * SCALE));
    if (cv.width === w && cv.height === h) return;
    cv.width = w;
    cv.height = h;
    gl.viewport(0, 0, w, h);
  }
  size();
  addEventListener("resize", size);

  var ptrX = 0.5,
    ptrY = 0.35,
    warm = 0,
    warmT = 0;
  addEventListener(
    "pointermove",
    function (e) {
      ptrX = e.clientX / innerWidth;
      ptrY = 1 - e.clientY / innerHeight;
      warmT = 1;
    },
    { passive: true }
  );
  addEventListener("pointerleave", function () {
    warmT = 0;
  });

  var t = 0,
    last = 0,
    acc = 0;

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;

    /* 30fps. Water is slow; the eye cannot tell, and it halves the cost. */
    acc += dt;
    if (acc < 1 / 30) return;
    acc = 0;

    t += dt;
    warm += (warmT - warm) * Math.min(1, dt * 2.2);

    /* One shared scroll velocity, published by scroll-velocity.js and read by
       five other things on this page. No listener of its own. */
    var sv = typeof window.__sv === "function" ? window.__sv() : 0;

    size();
    gl.useProgram(prog);
    gl.bindVertexArray(vao);
    gl.uniform2f(U.res, cv.width, cv.height);
    gl.uniform1f(U.t, t);
    gl.uniform1f(U.shear, sv);
    gl.uniform2f(U.ptr, ptrX, ptrY);
    gl.uniform1f(U.warm, warm);
    /* The one number that decides whether this is a grade or a gimmick. */
    var lightTheme = document.documentElement.getAttribute("data-theme") === "light";
    gl.uniform1f(U.light, lightTheme ? 0.8 : 0.85);
    gl.uniform1f(U.invert, lightTheme ? 1 : 0);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  raf = requestAnimationFrame(frame);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    } else if (!raf) raf = requestAnimationFrame(frame);
  });
})();
