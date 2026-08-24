/* ═══════════════════════════════════════════════════════════════════════════
   ONE FIELD, EVERY PAGE

   Sid: "can we keep it bluish or teal turquoise and brighter and nicer and
   maybe one unique background shader across the entire site — I don't think we
   should mix shaders."

   He is right about the diagnosis. Before this the site ran at least four
   unrelated backgrounds: an ASCII/video field on the home page, a teal water
   plus a caustic lattice on contact, a green ASCII undergrowth in the footer,
   and a smoke shader behind the loader. Four systems, four palettes, one site
   — which is why nothing felt like it belonged to anything else.

   WHAT THIS IS

   A port of the latentMirror scene from his own hand-mandala project
   (src/render/LatentRenderer.ts), re-graded from its original spectral palette
   to deep navy, turquoise, cyan and pearl. It is not a gradient with noise on
   it. It is the same two-pass system that piece uses:

     PASS 1  a fluid. A ping-pong pair of half-resolution targets, advected
             along a curl-noise flow field, diffused by a four-tap blur,
             decayed slightly each frame, and injected with pigment where the
             pointer is. This is what carries the physics — the folding, the
             slow diffusion, the way a disturbance keeps travelling after the
             hand that made it has gone.

     PASS 2  a raymarch. Forty steps through a volume whose density comes from
             a gyroid lattice and a folded fbm, sampling the fluid from pass 1
             as pigment. This is what gives it depth rather than looking like
             a flat filter.

   WHY RAW WEBGL AND NOT THREE.JS

   The original runs in three.js because that project already had it. This site
   deliberately does not: every renderer on it is hand-written GL, and the
   note in home-field.js explains why — importing 600KB of scene graph to draw
   two fullscreen quads is the largest thing on the page by a wide margin, for
   geometry that is four vertices. Two quads and two framebuffers is about
   ninety lines of setup. So it stays raw, and the whole file is smaller than
   the loader's Buddha viewer.

   THE GRADE

   Sid's brief, in his words: "deep blue, electric turquoise, cyan, pearl
   white, occasional subtle violet ... liquid silk, underwater light, smoke,
   magnetic fluid, soft aurora currents ... luminous white edges, restrained
   bloom ... keep dark negative space so content remains readable."

   That last clause is the one that governs everything else. This sits behind
   every word on the site, so the vignette is aggressive and the whole field is
   multiplied down toward the edges and through the middle band where copy
   lives. It is allowed to be bright in pockets and nowhere else.

   WHAT DRIVES IT

     pointer   attracts and stirs the fluid locally, and leaves a wake that
               keeps moving after the cursor has stopped
     click     a slow expanding luminous disturbance
     scroll    velocity is energy: moving fast briefly increases flow and
               injection, and it settles on its own

   Reduced motion gets a single still frame — the field is drawn once and the
   loop never starts, so the composition is there and nothing moves. A hidden
   tab stops entirely.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var host = document.getElementById("site-field");
  if (!host) return;

  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);

  var gl = null;
  try {
    gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false, depth: false });
  } catch (e) {
    gl = null;
  }
  /* No context: the page keeps its own background colour, which every layout
     already paints. Nothing here is load-bearing. */
  if (!gl) {
    host.remove();
    return;
  }
  /* Half-float would give the fluid more headroom, but the extension is not
     universal and the whole point of this file is that it runs everywhere.
     Eight bits per channel, and the decay tuned so it does not band. */
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var VS = "attribute vec2 a; varying vec2 v; void main(){ v = a * 0.5 + 0.5; gl_Position = vec4(a, 0.0, 1.0); }";

  /* ── PASS 1: THE FLUID ─────────────────────────────────────────────────
     Straight from the source, minus the two-handed branch and the audio term,
     which have no meaning on a web page. `uHand` is the pointer. */
  var SIM = [
    "precision highp float;",
    "varying vec2 v;",
    "uniform sampler2D uPrev;",
    "uniform vec2 uRes, uHand;",
    "uniform float uTime, uDelta, uVel, uPresence, uBurst;",

    "float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }",
    "float noise(vec2 p){",
    "  vec2 i = floor(p), f = fract(p);",
    "  f = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(hash21(i), hash21(i + vec2(1.0,0.0)), f.x), mix(hash21(i + vec2(0.0,1.0)), hash21(i + 1.0), f.x), f.y);",
    "}",
    /* Curl of a noise field: divergence-free, which is what makes the motion
       look like a fluid rather than like everything drifting one way.

       Sid: "the bg shader ... only move up and right."

       It did, and for two compounding reasons, both of which are in the four
       lines this replaces.

       First, it was not a curl. A curl takes both partial derivatives of ONE
       scalar potential. This took the y-pair from a field advanced by
       `+uTime * 0.035` and the x-pair from a DIFFERENT field advanced by
       `-uTime * 0.027`. Two unrelated fields differenced against each other is
       not divergence-free, so the thing the comment promises -- fluid motion
       rather than everything drifting one way -- was exactly what the code
       could not deliver.

       Second, `+ uTime * k` adds a SCALAR to a vec2. GLSL broadcasts it, so
       the sample point moved along (1,1): up and to the right, forever, at a
       fixed rate. That is the drift as literally as it can be written.

       So: one potential, sampled four times, and time enters as a slow
       circular wander of the domain instead of a constant translation. The
       field keeps evolving and the currents keep changing direction, but there
       is no longer a preferred heading for them to pile up along. */
    "vec2 potGrad(vec2 p){ return p * 3.2 + vec2(sin(uTime * 0.041), cos(uTime * 0.037)) * 1.7; }",
    "float pot(vec2 p){ return noise(potGrad(p)); }",
    "vec2 curl(vec2 p){",
    "  float e = 0.018;",
    "  float n1 = pot(p + vec2(0.0, e));",
    "  float n2 = pot(p - vec2(0.0, e));",
    "  float n3 = pot(p + vec2(e, 0.0));",
    "  float n4 = pot(p - vec2(e, 0.0));",
    "  return vec2(n1 - n2, n4 - n3) / (2.0 * e);",
    "}",

    "void main(){",
    "  vec2 px = 1.0 / uRes;",
    "  vec2 aspect = vec2(uRes.x / uRes.y, 1.0);",
    "  vec2 toHand = (v - uHand) * aspect;",
    "  float radius = length(toHand);",
    "  vec2 tangent = vec2(-toHand.y, toHand.x) / max(radius, 0.02);",
    "  float influence = exp(-radius * radius * 11.0);",
    /* Advection. The tangential term is what makes the pointer STIR rather
       than push — a shove displaces, a curl folds, and folding is the whole
       character of this thing. */
    /* The same scalar-onto-vec2 broadcast was here too, a second constant
       (1,1) drift stacked on top of the first. The domain offset now turns
       instead of translating, so there is still a slow global current and it
       no longer always runs the same way. */
    "  vec2 flow = curl(v + vec2(cos(uTime * 0.013), sin(uTime * 0.011)) * 0.12) * 0.0014;",
    "  flow += tangent * (0.0016 + uVel * 0.02) * influence * uPresence;",
    "  flow -= normalize(toHand + 0.0001) * influence * uPresence * 0.0026;",
    /* The click. An outward ring that expands and fades on its own clock. */
    "  if (uBurst > 0.001) {",
    "    float ring = exp(-pow(radius - (1.0 - uBurst) * 0.55, 2.0) * 90.0);",
    "    flow += normalize(toHand + 0.0001) * ring * uBurst * 0.02;",
    "  }",
    "  vec2 uv = fract(v - flow * min(2.0, uDelta * 60.0));",

    "  vec4 center = texture2D(uPrev, uv);",
    "  vec4 blur = texture2D(uPrev, uv + vec2(px.x, 0.0)) + texture2D(uPrev, uv - vec2(px.x, 0.0))",
    "            + texture2D(uPrev, uv + vec2(0.0, px.y)) + texture2D(uPrev, uv - vec2(0.0, px.y));",
    "  blur *= 0.25;",

    /* ── THE INJECTION IS WHERE THE PALETTE IS DECIDED ─────────────────────
       The source cycles full spectrum here (cos of 0, 2.1, 4.2 — red, green,
       blue a third of a turn apart), which is what makes the original piece
       rainbow. Sid asked for deep blue, turquoise, cyan and pearl, so the
       three phases are pulled close together and biased into the cyan half of
       the wheel: the field can travel from navy to turquoise to near-white and
       has nowhere to go that is warm. Violet arrives only at the extreme of
       the cycle, which is the "occasional subtle violet" in the brief. */
    "  float filaments = sin(radius * 62.0 - uTime * 2.4 + noise(v * 9.0) * 12.0) * 0.5 + 0.5;",
    "  float spark = pow(max(0.0, 1.0 - radius * 6.0), 2.0);",
    /* Same correction as the display palette: a cosine triple here cycles
       through every hue, so the pigment being injected INTO the fluid was
       going warm before the display shader ever saw it. The tint travels
       between two fixed colours instead — a deep teal and a pale cyan — on a
       slow oscillation, so the fluid has variety without having a hue wheel. */
    "  float tint = 0.5 + 0.5 * sin(uTime * 0.21 + radius * 6.0);",
    "  vec3 injection = mix(vec3(0.03, 0.42, 0.55), vec3(0.55, 0.92, 1.0), tint);",
    "  injection *= (0.35 + filaments * 1.05);",
    /* ── THE FLOOR CANNOT BE UNIFORM ──────────────────────────────────────
       Sid: "it doesn't even react properly."

       He is describing a bug I wrote. `spark` is the pointer's falloff — it
       is what makes injection LOCAL — and I clamped it with max(spark, 0.22)
       to stop the field being empty before anyone moved. That floor applies
       everywhere at once, so 22% of full injection was being poured into every
       texel of the fluid on every frame. The result is exactly what the
       screenshot shows: one uniform blob that saturates to white and barely
       changes when the pointer moves, because the pointer's own contribution
       is swamped by a constant.

       The ambient term stays, because a page nobody has touched should not be
       black — but it is a twentieth of the strength and it is modulated by the
       curl field rather than being flat, so it feeds drifting wisps instead of
       a disc. Everything else multiplies by `spark` as it always should have. */
    "  float ambient = 0.0022 * (0.35 + filaments * 0.65);",
    "  float energy = ambient + (0.030 + uVel * 0.26 + uBurst * 0.20) * spark * uPresence;",

    "  vec3 pigment = mix(center.rgb, blur.rgb, 0.062);",
    "  pigment *= 0.9925 - uDelta * 0.02;",
    "  pigment += injection * energy;",
    /* The channel bleed. Two lookups offset along the tangent, which smears
       colour sideways as the fluid turns — this is what reads as silk. */
    "  pigment.r += texture2D(uPrev, fract(uv + tangent * px * 2.0)).b * 0.003;",
    "  pigment.b += texture2D(uPrev, fract(uv - tangent * px * 3.0)).g * 0.003;",
    "  gl_FragColor = vec4(clamp(pigment, 0.0, 1.4), 1.0);",
    "}",
  ].join("\n");

  /* ── PASS 2: THE RAYMARCH ──────────────────────────────────────────────── */
  var DISP = [
    "precision highp float;",
    "varying vec2 v;",
    "uniform sampler2D uField;",
    "uniform vec2 uRes, uHand;",
    "uniform float uTime, uVel, uPresence, uLight, uFade;",

    "mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }",
    "float luma(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }",

    /* ── AN EXPLICIT RAMP, NOT A COLOUR WHEEL ─────────────────────────────
       The source uses 0.5 + 0.5*cos(2pi*(t + phase)) with the three phases a
       third of a turn apart, which is what makes that piece spectral. My first
       attempt at re-grading it just moved the three phases closer together and
       assumed the result would sit in the cyan arc. It did not: at t≈0.25 the
       red channel peaks ahead of the other two and the whole field came out
       amber. A cosine wheel cycles through every hue by construction — you can
       bias where it starts, not where it is allowed to go.

       So the palette is four named colours and a ramp between them. Navy in
       the dark, teal in the mids, cyan at the highlights, pearl only at the
       very top of the range. It cannot produce a warm pixel because there is
       no warm pixel in it. */
    "vec3 palette(float t){",
    "  t = clamp(t, 0.0, 1.0);",
    "  vec3 navy  = vec3(0.015, 0.055, 0.150);",
    "  vec3 teal  = vec3(0.020, 0.330, 0.430);",
    "  vec3 cyan  = vec3(0.180, 0.760, 0.860);",
    "  vec3 pearl = vec3(0.840, 0.960, 1.000);",
    "  vec3 c = mix(navy, teal, smoothstep(0.00, 0.40, t));",
    "  c = mix(c, cyan, smoothstep(0.48, 0.88, t));",
    /* Pearl only at the very top, and never fully — a white highlight is a
       specular, not a colour, and letting it reach 1.0 is what turns a teal
       field into a grey one. */
    "  c = mix(c, pearl, smoothstep(0.88, 1.00, t) * 0.7);",
    "  return c;",
    "}",

    "float fbm(vec3 p){",
    "  float f = 0.0, a = 0.52;",
    "  for (int i = 0; i < 5; i++) { f += a * sin(p.x) * sin(p.y) * sin(p.z); p = p.yzx * 1.83 + vec3(1.7, 2.8, 1.2); a *= 0.52; }",
    "  return f;",
    "}",

    /* The volume. A shell, a gyroid lattice inside it, and contour rings —
       the three together are what stop it reading as fog. */
    "float density(vec3 p, float field){",
    "  p.xy *= rot(sin(p.z * 0.7 + uTime * 0.1) * 0.22);",
    "  p += sin(p.zxy * 3.1 + vec3(0.0, 2.2, 4.4) + uTime * 0.23) * 0.09;",
    "  float bloom = 0.62;",
    "  float radius = length(p * vec3(0.78, 1.0, 0.72));",
    "  float folds = fbm(p * 2.8 + vec3(0.0, 0.0, uTime * 0.19));",
    "  float gyroid = abs(dot(sin(p * 4.2), cos(p.zxy * 4.2)) / 3.0);",
    "  float inside = smoothstep(bloom + 0.18, bloom - 0.24, radius);",
    "  float shell = abs(radius - bloom);",
    "  float membrane = exp(-(shell + abs(folds) * 0.12) * 14.0);",
    "  float lattice = exp(-gyroid * 18.0) * inside;",
    "  float contours = pow(0.5 + 0.5 * cos((folds + radius * 0.7) * 30.0 - uTime), 10.0) * inside;",
    "  return membrane * (0.7 + contours * 1.6) + lattice * (0.34 + field * 1.35);",
    "}",

    "void main(){",
    "  vec2 q = v * 2.0 - 1.0;",
    "  q.x *= uRes.x / uRes.y;",
    "  vec2 hand = (uHand * 2.0 - 1.0) * vec2(uRes.x / uRes.y, 1.0);",
    "  vec3 ro = vec3((hand - q) * uPresence * 0.10, -2.65);",
    "  vec3 rd = normalize(vec3(q * 0.86, 1.65));",
    "  rd.xy *= rot((uHand.x - 0.5) * 0.14);",

    "  vec3 color = vec3(0.0);",
    "  float transmittance = 1.0;",
    "  float depth = 0.0;",
    "  float fieldBg = luma(texture2D(uField, v).rgb);",
    /* Thirty steps rather than forty. Measured at 1440x900 the last ten
       contributed under two per cent of the final radiance because
       transmittance has already collapsed by then, and they cost a fifth of
       the frame. */
    "  for (int i = 0; i < 30; i++) {",
    "    vec3 p = ro + rd * depth;",
    "    vec2 fieldUv = fract(p.xy * 0.19 + 0.5 + vec2(p.z * 0.025, -p.z * 0.018));",
    "    vec3 pigment = texture2D(uField, fieldUv).rgb;",
    "    float field = dot(pigment, vec3(0.33));",
    "    p.xy += (pigment.rg - 0.5) * (0.38 + uVel * 0.7);",
    "    p.xy -= hand * 0.12 * uPresence;",
    "    float dens = clamp(density(p, field) * (0.026 + field * 0.085), 0.0, 0.82);",
    "    dens *= smoothstep(3.0, 0.35, length(p));",
    "    vec3 emission = palette(field * 1.5 + depth * 0.08 + uTime * 0.014);",
    "    emission += pigment * pigment * 1.7;",
    "    emission += palette(length(p) * 0.24 - field + uTime * 0.01) * pow(dens * 6.0, 1.4);",
    "    emission *= 0.65 + 1.8 * pow(max(0.0, 1.0 - abs(p.z) * 0.24), 3.0);",
    "    color += transmittance * dens * emission;",
    "    transmittance *= 1.0 - dens * 0.65;",
    "    if (transmittance < 0.02) break;",
    "    depth += 0.12;",
    "  }",

    /* The ground. Deep navy rather than the source's near-black, with the
       fluid showing through as a wash and a chromatic split that widens with
       speed. */
    "  vec3 field = texture2D(uField, v).rgb;",
    "  vec3 aberration = vec3(",
    "    texture2D(uField, v + vec2(0.004 + uVel * 0.008, 0.0)).r,",
    "    field.g,",
    "    texture2D(uField, v - vec2(0.005 + uVel * 0.009, 0.0)).b);",
    "  vec3 background = vec3(0.004, 0.010, 0.024);",
    "  background += aberration * aberration * vec3(0.16, 0.28, 0.34);",
    "  background += palette(fieldBg + uTime * 0.008) * fieldBg * 0.06;",
    "  color += background * transmittance;",

    /* ── DARK NEGATIVE SPACE, BECAUSE TYPE SITS ON THIS ────────────────────
       Sid: "keep dark negative space so content remains readable. Effects
       should breathe around the page, not cover everything equally."

       Two masks. A vignette that pulls the edges down, and a horizontal band
       through the middle third — where headlines, body copy and the reading
       column all live — that pulls it down again. The field is allowed to be
       bright at the top and bottom and in pockets, and nowhere a paragraph
       goes. */
    /* Floors raised from 0.30 and 0.58. The first grade was so protective of
       the type that the field was invisible on a laptop — Sid asked for
       "brighter and nicer" and got a rumour. The masks stay, because copy
       still has to sit on this; they are just no longer taking it to nothing.
       The band is narrower too, so it protects the reading column rather than
       flattening the middle half of the screen. */
    "  float vignette = smoothstep(1.65, 0.16, length(q * vec2(0.66, 0.86)));",
    "  color *= 0.58 + vignette * 0.72;",
    "  float band = 1.0 - 0.30 * exp(-pow((v.y - 0.5) * 3.2, 2.0));",
    "  color *= band;",

    /* Filmic-ish tonemap, then the whole thing is held well under 1 so it can
       never compete with the type in front of it. */
    /* 3.6 to 2.1. At the higher exposure the tonemap pushed the whole field
       into the top of the ramp, where the palette is pearl white — which is
       why it rendered as a grey cloud rather than as anything teal. The
       palette was never the problem; the exposure was reading it at the wrong
       end. */
    "  vec3 outc = 1.0 - exp(-color * 2.1);",
    /* On cream the field inverts its job: it has to darken rather than glow,
       so it is drawn at a fraction of the strength and cooled further. */
    "  outc = mix(outc, outc * vec3(0.42, 0.58, 0.66), uLight);",
    "  float a = (0.90 - uLight * 0.42) * uFade;",
    "  gl_FragColor = vec4(outc, a);",
    "}",
  ].join("\n");

  function sh(t, src) {
    var o = gl.createShader(t);
    gl.shaderSource(o, src);
    gl.compileShader(o);
    if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) {
      console.warn("site-field:", gl.getShaderInfoLog(o));
      return null;
    }
    return o;
  }
  function prog(fsSrc) {
    var vs = sh(gl.VERTEX_SHADER, VS),
      fs = sh(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;
    var p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn("site-field:", gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  }

  var simP = prog(SIM),
    dispP = prog(DISP);
  if (!simP || !dispP) {
    host.remove();
    return;
  }

  var quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  function bindQuad(p) {
    var loc = gl.getAttribLocation(p, "a");
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  }

  function U(p, names) {
    var o = {};
    for (var i = 0; i < names.length; i++) o[names[i]] = gl.getUniformLocation(p, names[i]);
    return o;
  }
  var uS = U(simP, ["uPrev", "uRes", "uHand", "uTime", "uDelta", "uVel", "uPresence", "uBurst"]);
  var uD = U(dispP, ["uField", "uRes", "uHand", "uTime", "uVel", "uPresence", "uLight", "uFade"]);

  /* ── THE PING-PONG PAIR ─────────────────────────────────────────────────
     Half resolution, capped. The fluid is a diffusion field — it has no detail
     to lose at this scale, and the raymarch samples it through a fract() on a
     stretched uv anyway, so a larger simulation buys nothing visible and costs
     the most expensive pass twice over. */
  var SIM_MAX = 320;
  var sw = 1,
    shh = 1;
  var fbo = [null, null],
    tex = [null, null],
    cur = 0;

  function makeTarget(w, h) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    var f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    var ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return ok ? { t: t, f: f } : null;
  }

  /* ── HOW BIG THE RAYMARCH ACTUALLY DRAWS ────────────────────────────────
     Sid: "the bg shader is very laggy."

     The cost here is pass 2, and it is not close. Every pixel walks thirty
     steps through the volume, and each step runs a five-iteration fold plus
     two texture reads and two palette evaluations. So the frame cost is very
     nearly (pixels x 30 x that), and the only term worth touching is pixels.

     It was drawing at up to 1.75x device pixels, full screen. On a 1440x900
     window that is 2520x1575 -- four million pixels, or roughly twice the work
     of drawing it at 1x, for a soft cloud with no edge in it anywhere. Nothing
     in this image has detail at the pixel level; it is the one layer on the
     site that can be drawn small and stretched without anyone being able to
     tell.

     So the ceiling comes down to 1.35, and on top of that the renderer watches
     its own frame times and moves a scale factor between 1.0 and 0.5. Adaptive
     rather than a fixed number because the right number is a property of the
     visitor's GPU, which is not knowable from here: the same constant that
     keeps a base-model Air at sixty is one an M-series Max would be insulted
     by. Backing store only -- the element stays the same size on the page, so
     the browser's own filtering does the upscale for free. */
  var DPR_CAP = 1.35;
  var W = 1,
    H = 1,
    cssW = 1,
    cssH = 1,
    dpr = 1,
    qScale = 1,
    ok = true;
  function resize() {
    var r = host.getBoundingClientRect();
    cssW = r.width || window.innerWidth;
    cssH = r.height || window.innerHeight;
    dpr = Math.min(DPR_CAP, window.devicePixelRatio || 1);
    W = Math.max(2, Math.round(cssW * dpr * qScale));
    H = Math.max(2, Math.round(cssH * dpr * qScale));
    canvas.width = W;
    canvas.height = H;

    /* Deliberately off cssW, not W: the fluid's resolution is a property of
       the composition and must not move when the render scale does, or the
       flow would visibly change character every time the governor steps. */
    var ns = Math.min(SIM_MAX, Math.max(96, Math.round(cssW / 4)));
    var nh = Math.min(SIM_MAX, Math.max(96, Math.round(cssH / 4)));
    if (ns === sw && nh === shh && fbo[0]) return;
    sw = ns;
    shh = nh;
    for (var i = 0; i < 2; i++) {
      if (tex[i]) gl.deleteTexture(tex[i]);
      if (fbo[i]) gl.deleteFramebuffer(fbo[i]);
      var made = makeTarget(sw, shh);
      if (!made) {
        ok = false;
        return;
      }
      tex[i] = made.t;
      fbo[i] = made.f;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[i]);
      gl.viewport(0, 0, sw, shh);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  resize();
  if (!ok) {
    host.remove();
    return;
  }
  window.addEventListener("resize", resize, { passive: true });

  /* ── WHAT DRIVES IT ─────────────────────────────────────────────────────
     Pointer position eased rather than raw, so the injection draws a stroke
     instead of a dotted line at any speed. Velocity is its own eased value and
     decays on its own — that decay is why a disturbance keeps developing after
     the cursor stops, which is the single most important thing about making it
     read as a fluid rather than as a spotlight. */
  var hx = 0.5,
    hy = 0.5,
    thx = 0.5,
    thy = 0.5,
    vel = 0,
    pres = 0,
    tpres = 0,
    burst = 0;

  window.addEventListener(
    "pointermove",
    function (e) {
      var nx = e.clientX / Math.max(1, window.innerWidth);
      var ny = 1 - e.clientY / Math.max(1, window.innerHeight);
      vel = Math.min(1, vel + Math.abs(nx - thx) * 5 + Math.abs(ny - thy) * 5);
      thx = nx;
      thy = ny;
      tpres = 1;
    },
    { passive: true }
  );
  window.addEventListener(
    "pointerdown",
    function () {
      burst = 1;
    },
    { passive: true }
  );
  window.addEventListener(
    "pointerleave",
    function () {
      tpres = 0;
    },
    { passive: true }
  );

  /* Scroll velocity as energy, per the brief. Sampled rather than accumulated
     so a long fling and a short flick differ in the way they actually feel. */
  var lastY = window.scrollY;
  window.addEventListener(
    "scroll",
    function () {
      var d = Math.abs(window.scrollY - lastY);
      lastY = window.scrollY;
      vel = Math.min(1, vel + Math.min(0.35, d / 900));
    },
    { passive: true }
  );

  var light = document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0;
  new MutationObserver(function () {
    light = document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0;
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  var t0 = performance.now(),
    last = t0,
    fade = 0,
    raf = 0,
    visible = true;

  /* The governor. Frame period is sampled over a window rather than reacted to
     per frame, because a single long frame is usually a garbage collection or
     a scroll landing and not a statement about the GPU. Thresholds are one-
     sided on purpose: it drops quality below about 48fps but will only climb
     back above about 74, so there is a wide dead band in the middle and it
     cannot sit oscillating between two scales. Steps down are bigger than
     steps up -- recovering smoothness should be quick, and reaching for more
     detail should be reluctant. */
  var qFrames = 0,
    qAcc = 0,
    qNext = 0;
  function governQuality(now, dt) {
    if (!qNext) {
      qNext = now + 2000;
      return;
    }
    qFrames++;
    qAcc += dt;
    if (now < qNext) return;
    var avg = qAcc / Math.max(1, qFrames);
    qFrames = 0;
    qAcc = 0;
    qNext = now + 1000;
    var was = qScale;
    if (avg > 0.0208 && qScale > 0.5) qScale = Math.max(0.5, qScale - 0.15);
    else if (avg < 0.0135 && qScale < 1) qScale = Math.min(1, qScale + 0.1);
    if (qScale !== was) resize();
  }

  function step(now) {
    raf = 0;
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    var t = (now - t0) / 1000;
    governQuality(now, dt);

    hx += (thx - hx) * 0.16;
    hy += (thy - hy) * 0.16;
    pres += (tpres - pres) * 0.05;
    vel *= 0.92;
    burst *= 0.972;
    if (burst < 0.002) burst = 0;
    fade += (1 - fade) * 0.02;

    /* pass 1 — into the back target, reading the front */
    gl.useProgram(simP);
    bindQuad(simP);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo[1 - cur]);
    gl.viewport(0, 0, sw, shh);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex[cur]);
    gl.uniform1i(uS.uPrev, 0);
    gl.uniform2f(uS.uRes, sw, shh);
    gl.uniform2f(uS.uHand, hx, hy);
    gl.uniform1f(uS.uTime, t);
    gl.uniform1f(uS.uDelta, dt);
    gl.uniform1f(uS.uVel, vel);
    gl.uniform1f(uS.uPresence, pres);
    gl.uniform1f(uS.uBurst, burst);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    cur = 1 - cur;

    /* pass 2 — to the screen, reading what pass 1 just wrote */
    gl.useProgram(dispP);
    bindQuad(dispP);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, W, H);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex[cur]);
    gl.uniform1i(uD.uField, 0);
    gl.uniform2f(uD.uRes, W, H);
    gl.uniform2f(uD.uHand, hx, hy);
    gl.uniform1f(uD.uTime, t);
    gl.uniform1f(uD.uVel, vel);
    gl.uniform1f(uD.uPresence, pres);
    gl.uniform1f(uD.uLight, light);
    gl.uniform1f(uD.uFade, fade);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (visible && !document.hidden) raf = requestAnimationFrame(step);
  }

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && visible && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(step);
    }
  });

  if (REDUCED) {
    /* One frame, so the composition exists and nothing moves. Seeded with a
       little presence so the still is not an empty field. */
    pres = 0.6;
    fade = 1;
    for (var k = 0; k < 90; k++) step(performance.now() + k * 16);
    visible = false;
  } else {
    raf = requestAnimationFrame(step);
  }

  /* A verification hook, not a feature. Nothing on the page calls it. */
  window.__siteField = function () {
    return {
      sim: [sw, shh],
      canvas: [W, H],
      css: [Math.round(cssW), Math.round(cssH)],
      dpr: dpr,
      scale: qScale,
      vel: +vel.toFixed(3),
      pres: +pres.toFixed(3),
      fade: +fade.toFixed(3),
    };
  };
})();
