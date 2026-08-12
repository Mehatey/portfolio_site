/* ============================================================
   Homepage hero — the film.

   Sid sits and works, pixelated, behind everything. Moving the
   pointer paints the clear footage back in. It is a real paint
   system, not a CSS mask: a mask texture ping-pongs between two
   framebuffers, the brush is written into it each frame, and the
   whole thing decays, so a stroke fades the way ink lifts rather
   than snapping off. The composite shader mixes pixel -> clear
   through that mask and adds an RGB fringe on the wet edge, so
   the reveal shares the site's chromatic language.

   Falls back, in order: no WebGL or reduced motion -> the freeze
   frame as a plain <img>, nothing else runs. Backgrounded tab ->
   the loop stops entirely.
   ============================================================ */
(function () {
  "use strict";

  var stage = document.getElementById("film-stage");
  if (!stage) return;

  var canvas = document.getElementById("film-gl");
  var vPix = document.getElementById("film-pixel");
  var vClear = document.getElementById("film-clear");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var gl = null;
  if (!reduce && canvas) {
    try {
      gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false });
    } catch (e) {
      gl = null;
    }
  }
  if (!gl) {
    stage.classList.add("is-static");
    return;
  }
  stage.classList.add("is-gl");

  function sh(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  function prog(vs, fs) {
    var p = gl.createProgram();
    var a = sh(gl.VERTEX_SHADER, vs),
      b = sh(gl.FRAGMENT_SHADER, fs);
    if (!a || !b) return null;
    gl.attachShader(p, a);
    gl.attachShader(p, b);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(p));
      return null;
    }
    p.u = {};
    var n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) {
      var un = gl.getActiveUniform(p, i).name;
      p.u[un] = gl.getUniformLocation(p, un);
    }
    return p;
  }

  var VS = "attribute vec2 a; varying vec2 v; void main(){ v = a * 0.5 + 0.5; gl_Position = vec4(a, 0.0, 1.0); }";

  /* The brush. Written into a half-resolution mask that decays every
     frame, so strokes have a tail and the last place you looked stays
     warm for a moment. */
  var FS_MASK = [
    "precision highp float; varying vec2 v;",
    "uniform sampler2D u_prev;",
    "uniform vec2 u_mouse;",
    "uniform float u_down, u_radius, u_decay, u_aspect;",
    "void main(){",
    "  float m = texture2D(u_prev, v).r * u_decay;",
    "  vec2 d = v - u_mouse; d.x *= u_aspect;",
    "  float br = 1.0 - smoothstep(0.0, u_radius, length(d));",
    "  br = br * br;",
    "  m = max(m, br * u_down);",
    "  gl_FragColor = vec4(m, 0.0, 0.0, 1.0);",
    "}",
  ].join("\n");

  /* ══ THE COMPOSITE ═══════════════════════════════════════════════════════
     Sid: "we start with the pixel video and then we have pixels ontop of the
     original vid where u can see me properly ... i want u to basically make ur
     own shaders or effects on the original video ... the same 2 videos
     repeating on hover is not it."

     He is right that it was not it. The old composite had exactly one idea:
     mix(pixelated_file, clear_file, mask). Two pre-rendered clips crossfaded
     by a brush. Every stroke you ever made produced the same picture, the
     coarse state was a fixed encode nobody could tune, and once you had swept
     the frame twice there was nothing further to find.

     This replaces it with two halves that each do real work.

     THE VEIL — what you see before the brush arrives.

     It is no longer the pixelated file. It is the ORIGINAL footage, mosaicked
     into cells on the GPU and then ordered-dithered, which is the difference
     between a picture of pixels and a picture behind pixels: the cell average
     is a real average of him, so the veil moves when he moves and you can read
     the shape of a person in it. That is the "pixels on top of the original
     vid where u can see me properly" half.

     The pixelated file has not been thrown away — it is where the page starts.
     u_boot runs 0 to 1 over the first few seconds, so the hero opens on the
     encode Sid shot, and then the pixels lift off it and reseat themselves on
     the live footage. Same first frame as before, different thing underneath
     by the time you reach for the mouse.

     THE PROCESS — what the brush reveals.

     Six of them, cycled by clicking the frame. Each is written here rather
     than filmed, so each responds to what is actually in the shot:

       CLEAN     the footage, graded. The baseline, and the one that answers
                 "let me see you properly".
       SCAN      a CRT: RGB separated along the line phase, scanlines, bloom.
       EDGE      a Sobel pass. He becomes a live line drawing.
       THERMAL   luminance remapped through a four-stop ramp.
       SLICE     horizontal bands displaced on a stepped clock, channels torn.
       HALFTONE  a print screen — dot radius per cell driven by cell tone.

     Only the selected process is evaluated. Crossfading two of them would mean
     running both shaders for every pixel of the transition, and EDGE and
     HALFTONE are the expensive ones, so the change is a cut with a flash on it
     (u_flash) instead. A cut is also the more honest edit: these are six
     different treatments, not six points on one dial.
     ════════════════════════════════════════════════════════════════════════ */
  var FS_COMP = [
    "precision highp float; varying vec2 v;",
    "uniform sampler2D u_base, u_clear, u_mask;",
    "uniform vec2 u_res;",
    "uniform float u_time, u_fade, u_fx, u_boot, u_flash, u_light;",
    "uniform vec2 u_cover;",

    "float lum(vec3 c){ return dot(c, vec3(0.299, 0.587, 0.114)); }",

    /* Ordered dither. The compact recursive form: bayer2 is a two-by-two
       threshold built out of fract(), and one call to it at half scale plus
       one at full gives the four-by-four pattern without an array lookup,
       which WebGL1 cannot index dynamically anyway. */
    "float bayer2(vec2 a){ a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }",
    "float bayer4(vec2 a){ return bayer2(0.5 * a) * 0.25 + bayer2(a); }",

    "vec3 sample_clear(vec2 uv){ return texture2D(u_clear, uv).rgb; }",

    /* ── the veil ───────────────────────────────────────────────────────── */
    "vec3 veil(vec2 uv, vec2 sc){",
    /* Cell size in screen space, not uv space, so the mosaic stays square on
       any aspect and does not stretch with the cover crop. */
    "  vec2 cells = floor(u_res / 13.0);",
    "  vec2 cuv = (floor(sc * cells) + 0.5) / cells;",
    "  vec2 muv = (cuv - 0.5) * u_cover + 0.5; muv.y = 1.0 - muv.y;",
    "  vec3 c = sample_clear(muv);",
    "  float l = lum(c);",
    /* Lift before quantising. The clear footage is a dim room, and the first
       version quantised its raw luminance straight onto a ramp topping out at
       0.72 — so the veil came out as a nearly black plate and lost the one
       thing it is for, which is that you can make out a person in it. The
       gamma opens the shadows where all of this shot's information is, and
       the ramp now runs to near-white so the highlights have somewhere to go.
       The pre-rendered encode this replaces was graded; this one has to grade
       itself. */
    /* Theme-aware, because the two themes need opposite corrections and the
       first version only had the dark one. On the near-black page the footage
       is a dim room and its shadows have to be opened or the veil is a black
       plate. On cream, that same lift pushed every cell into the top of the
       range and the mosaic vanished into the paper — a wash of pale grey with
       a person somewhere in it. Light mode gets a gamma above 1 instead,
       which deepens the midtones so the cells read as marks ON paper rather
       than as paper. */
    "  float lift = mix(pow(clamp(l * 1.35, 0.0, 1.0), 0.72), pow(clamp(l * 1.04, 0.0, 1.0), 1.55), u_light);",
    /* Quantise to seven tones through the dither threshold, then re-tint with
       the cell's own colour so it is not a grey plate. */
    "  float q = floor(lift * 7.0 + bayer4(sc * u_res * 0.25)) / 7.0;",
    /* Same direction in both themes — dark cells stay dark, bright cells go
       to the page — but the light ramp stops well short of the paper colour
       so the lightest cells still have an edge against it. */
    "  vec3 dk = mix(vec3(0.06, 0.08, 0.14), vec3(0.88, 0.93, 1.0), q);",
    "  vec3 lt = mix(vec3(0.09, 0.10, 0.13), vec3(0.80, 0.79, 0.76), q);",
    "  vec3 tone = mix(dk, lt, u_light);",
    "  return mix(tone, tone * 0.5 + c * mix(1.15, 0.85, u_light), 0.42);",
    "}",

    /* ── the processes ──────────────────────────────────────────────────── */
    "vec3 fx_scan(vec2 uv){",
    "  float ph = sin(uv.y * 620.0 + u_time * 2.0);",
    "  float o = 0.0016 + 0.0012 * ph;",
    "  vec3 c = vec3(sample_clear(uv + vec2(o, 0.0)).r, sample_clear(uv).g, sample_clear(uv - vec2(o, 0.0)).b);",
    "  c *= 0.86 + 0.14 * ph;",
    "  c += pow(max(vec3(0.0), c - 0.62), vec3(1.6)) * 1.5;",
    "  return c;",
    "}",

    "vec3 fx_edge(vec2 uv, vec2 px){",
    /* Sobel on luminance. Eight taps plus the centre; the centre is only used
       to keep a little of the original value in the line colour so the drawing
       still knows which parts of him were bright. */
    "  float tl = lum(sample_clear(uv + px * vec2(-1.0, -1.0)));",
    "  float t  = lum(sample_clear(uv + px * vec2( 0.0, -1.0)));",
    "  float tr = lum(sample_clear(uv + px * vec2( 1.0, -1.0)));",
    "  float l  = lum(sample_clear(uv + px * vec2(-1.0,  0.0)));",
    "  float r  = lum(sample_clear(uv + px * vec2( 1.0,  0.0)));",
    "  float bl = lum(sample_clear(uv + px * vec2(-1.0,  1.0)));",
    "  float b  = lum(sample_clear(uv + px * vec2( 0.0,  1.0)));",
    "  float br = lum(sample_clear(uv + px * vec2( 1.0,  1.0)));",
    "  float gx = (tr + 2.0 * r + br) - (tl + 2.0 * l + bl);",
    "  float gy = (bl + 2.0 * b + br) - (tl + 2.0 * t + tr);",
    "  float g = clamp(length(vec2(gx, gy)) * 1.5, 0.0, 1.0);",
    "  g = smoothstep(0.08, 0.55, g);",
    "  vec3 ink = mix(vec3(0.42, 0.72, 1.0), vec3(1.0), g * 0.6);",
    "  return vec3(0.02, 0.03, 0.06) + ink * g;",
    "}",

    "vec3 fx_thermal(vec2 uv){",
    "  float l = lum(sample_clear(uv));",
    /* Four stops, chained. Deliberately not a smooth hue rotation: a ramp with
       corners in it reads as an instrument, a smooth one reads as a filter. */
    "  vec3 c = mix(vec3(0.03, 0.05, 0.22), vec3(0.55, 0.10, 0.62), smoothstep(0.0, 0.38, l));",
    "  c = mix(c, vec3(1.0, 0.42, 0.16), smoothstep(0.34, 0.68, l));",
    "  c = mix(c, vec3(1.0, 0.94, 0.72), smoothstep(0.66, 0.96, l));",
    "  return c;",
    "}",

    "vec3 fx_slice(vec2 uv, vec2 sc){",
    /* A stepped clock, so the tear holds for a few frames and then jumps —
       displacement driven by a continuous time is a wobble, not a glitch. */
    "  float t = floor(u_time * 8.0);",
    "  float band = floor(sc.y * 26.0);",
    "  float n = fract(sin(band * 91.7 + t * 13.3) * 43758.5453);",
    "  float hit = step(0.82, n);",
    "  float sx = (n - 0.5) * 0.09 * hit;",
    "  vec2 duv = uv + vec2(sx, 0.0);",
    "  float o = 0.004 * hit;",
    "  vec3 c = vec3(sample_clear(duv + vec2(o, 0.0)).r, sample_clear(duv).g, sample_clear(duv - vec2(o, 0.0)).b);",
    "  return c * (1.0 + hit * 0.22);",
    "}",

    "vec3 fx_halftone(vec2 uv, vec2 sc){",
    "  vec2 cells = floor(u_res / 9.0);",
    "  vec2 g = sc * cells;",
    "  vec2 cuv = (floor(g) + 0.5) / cells;",
    "  vec2 muv = (cuv - 0.5) * u_cover + 0.5; muv.y = 1.0 - muv.y;",
    "  vec3 c = sample_clear(muv);",
    "  float l = lum(c);",
    /* Radius from tone, distance from the cell centre, and a smoothstep across
       roughly one cell-pixel so the dots have an edge without aliasing. */
    "  float d = length(fract(g) - 0.5);",
    "  float rad = sqrt(l) * 0.72;",
    "  float dot_ = smoothstep(rad, rad - 0.14, d);",
    "  vec3 ink = mix(vec3(0.55, 0.7, 0.95), c * 1.3, 0.45);",
    "  return vec3(0.02, 0.03, 0.05) + ink * dot_;",
    "}",

    "vec3 process(vec2 uv, vec2 sc, vec2 px){",
    "  if (u_fx < 0.5) {",
    /* CLEAN. A grade rather than a passthrough: lifted blacks and a touch of
       contrast, so it still belongs to the page it is sitting behind. */
    "    vec3 c = sample_clear(uv);",
    "    return clamp((c - 0.5) * 1.1 + 0.5 + vec3(0.012, 0.016, 0.028), 0.0, 1.4);",
    "  }",
    "  else if (u_fx < 1.5) return fx_scan(uv);",
    "  else if (u_fx < 2.5) return fx_edge(uv, px);",
    "  else if (u_fx < 3.5) return fx_thermal(uv);",
    "  else if (u_fx < 4.5) return fx_slice(uv, sc);",
    "  return fx_halftone(uv, sc);",
    "}",

    "void main(){",
    "  vec2 sc = v;",
    // object-fit: cover, done in uv rather than by scaling the quad, so the
    // film crops instead of stretching and the mask keeps stage coordinates
    "  vec2 uv = (v - 0.5) * u_cover + 0.5;",
    "  uv.y = 1.0 - uv.y;",
    /* ── THE MASK, NORMALISED ─────────────────────────────────────────────
       The brush writes `br * u_down` into the mask, and u_down is about 0.6
       for an ordinary stroke — so the raw mask peaks near 0.6 and never
       reaches 1. Mixed straight, that meant the middle of a stroke was still
       forty percent veil: with the old composite that was survivable, because
       the veil was a pre-rendered pixel clip and the difference was mostly a
       softness. Against a hard procedural mosaic it is the difference between
       revealing him and not.

       Rather than push u_down to 1 and lose the pressure sensitivity in the
       brush — a fast sweep should still open harder than a slow one — the
       stroke's own range is remapped here. 0.62 is where a normal stroke
       tops out, so dividing by it puts the middle of the stroke at full
       reveal and leaves the falloff, and the smootherstep keeps the boundary
       from becoming a hard-edged disc. */
    "  float rawMask = clamp(texture2D(u_mask, v).r, 0.0, 1.0);",
    "  float mask = clamp(rawMask / 0.62, 0.0, 1.0);",
    "  mask = mask * mask * (3.0 - 2.0 * mask);",

    /* One screen pixel expressed in uv, for the Sobel taps. */
    "  vec2 px = u_cover / u_res;",

    /* The veil: the pixelated encode at boot, the live mosaic thereafter. */
    "  vec3 pixFile = texture2D(u_base, uv).rgb;",
    "  vec3 base = mix(pixFile, veil(uv, sc), u_boot);",

    "  vec3 shown = process(uv, sc, px);",

    /* The wet edge keeps its chromatic split, but it is now applied to the
       revealed side only rather than to the whole clear sample — the processes
       already own their own colour and a fringe on top of THERMAL was mud. */
    "  vec3 col = mix(base, shown, mask);",
    "  float edge = smoothstep(0.14, 0.5, mask) * (1.0 - smoothstep(0.5, 0.92, mask));",
    "  col += vec3(0.30, 0.46, 1.0) * edge * 0.16;",
    /* A second, tighter rim right at the boundary. This is most of what Sid
       means by wanting the reveal "shown better": the old edge was a soft 10%
       lift that a bright frame swallowed whole, so the brush had no outline
       and the reveal read as a vague brightening rather than as an opening. */
    "  float rim = smoothstep(0.42, 0.5, mask) * (1.0 - smoothstep(0.5, 0.58, mask));",
    "  col += vec3(0.55, 0.72, 1.0) * rim * 0.5;",

    /* The cut. One frame of lifted, split, brightened image when the process
       changes, decayed in script — it stands in for the crossfade this shader
       deliberately does not run. */
    "  if (u_flash > 0.001) {",
    "    float f = u_flash;",
    "    col += vec3(0.34, 0.46, 0.72) * f * 0.5;",
    "    col *= 1.0 + f * 0.25;",
    "  }",

    // scanline + vignette: it should read as footage on a screen
    "  col *= 0.93 + 0.07 * sin(v.y * u_res.y * 1.1);",
    "  col *= 1.0 - 0.42 * length((v - 0.5) * vec2(1.05, 1.0));",
    "  gl_FragColor = vec4(col, u_fade);",
    "}",
  ].join("\n");

  var pMask = prog(VS, FS_MASK),
    pComp = prog(VS, FS_COMP);
  if (!pMask || !pComp) {
    stage.classList.remove("is-gl");
    stage.classList.add("is-static");
    return;
  }

  var quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  function bindQuad(p) {
    var a = gl.getAttribLocation(p, "a");
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
  }

  function newTex() {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([8, 11, 18, 255]));
    return t;
  }
  var texPix = newTex(),
    texClear = newTex();

  var MW = 2,
    MH = 2,
    maskTex = [newTex(), newTex()],
    maskFbo = [gl.createFramebuffer(), gl.createFramebuffer()],
    ping = 0;

  function sizeMask(w, h) {
    MW = Math.max(2, Math.round(w / 2));
    MH = Math.max(2, Math.round(h / 2));
    for (var i = 0; i < 2; i++) {
      gl.bindTexture(gl.TEXTURE_2D, maskTex[i]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, MW, MH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, maskFbo[i]);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, maskTex[i], 0);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var vidAspect = 16 / 9;
  function resize() {
    var w = stage.clientWidth || window.innerWidth;
    var h = stage.clientHeight || window.innerHeight;
    canvas.width = Math.max(2, Math.round(w * dpr));
    canvas.height = Math.max(2, Math.round(h * dpr));
    sizeMask(canvas.width, canvas.height);
  }
  window.addEventListener("resize", resize, { passive: true });

  function upload(tex, video) {
    if (video.readyState < 2) return false;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    try {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    } catch (e) {
      return false;
    }
    if (video.videoWidth) vidAspect = video.videoWidth / video.videoHeight;
    return true;
  }

  /* Pointer. Tracked against the stage, lerped, and the stroke
     strength follows speed — a slow drag opens a small window, a
     fast sweep tears a wide one. */
  var mouse = [0.5, 0.5],
    target = [0.5, 0.5],
    lastPos = [0.5, 0.5],
    vel = 0,
    lastMove = -1e9,
    touched = false;

  function onMove(e) {
    var r = stage.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width;
    var y = 1 - (e.clientY - r.top) / r.height;
    if (x < -0.15 || x > 1.15 || y < -0.15 || y > 1.15) return;
    target = [x, y];
    vel = Math.min(1, Math.hypot(x - lastPos[0], y - lastPos[1]) * 16);
    lastPos = [x, y];
    lastMove = performance.now();
    if (!touched) {
      touched = true;
      stage.classList.add("is-touched");
    }
  }
  window.addEventListener("pointermove", onMove, { passive: true });

  /* ── THE PROCESSES ──────────────────────────────────────────────────────
     Sid: "when i click on the background let the pixel video change or the
     shader applied to the original video."

     Six treatments, cycled on click, named on screen for a beat afterwards so
     the click has an answer. The name is the only chrome the film carries and
     it earns its place by being the one thing a visitor cannot deduce: that
     the frame is a control at all.

     Click rather than hover, because hover is already spoken for — the pointer
     paints the reveal, and a page where moving does one thing and pausing does
     another is a page you cannot operate deliberately. */
  var FX = ["CLEAN", "SCAN", "EDGE", "THERMAL", "SLICE", "HALFTONE"];
  var fx = 0,
    flash = 0;

  var label = document.createElement("span");
  label.className = "film__fx";
  label.setAttribute("aria-hidden", "true");
  label.textContent = FX[0];
  stage.appendChild(label);

  function setFx(next) {
    fx = ((next % FX.length) + FX.length) % FX.length;
    flash = 1;
    label.textContent = FX[fx];
    label.classList.remove("is-on");
    /* Restart the CSS transition rather than waiting it out — clicking twice
       quickly should show the second name, not swallow it. */
    void label.offsetWidth;
    label.classList.add("is-on");
  }

  /* The stage itself cannot be the click target: .film carries
     `pointer-events: none` so that the headline, the rotating line, the
     dropdowns and the links sitting on top of it all remain usable. Turning
     that off to catch a click here would be trading a working hero for a
     party trick.

     So the listener goes on the hero section — which is the region a visitor
     would describe as "the background" — and steps aside for anything that is
     itself a control. The closest() test is the whole guard: if the click
     landed on a link, a button, a select or a form field, that element owns
     it. Everything else in that rectangle is film. */
  var heroEl = stage.closest("section") || stage.parentElement;
  if (heroEl) {
    heroEl.addEventListener("pointerdown", function (e) {
      /* Left button only. A right-click is a context menu, and a middle-click
         is a paste on Linux. */
      if (e.button !== undefined && e.button !== 0) return;
      var t = e.target;
      if (t && t.closest && t.closest('a, button, select, input, textarea, label, [role="button"], [contenteditable]')) return;
      /* A text selection drag starts with a pointerdown too. Changing the
         process under a selection is harmless, but doing it on the second
         click of a double-click to select a word is not, so the gesture is
         ignored while text is being selected. */
      var sel = window.getSelection && window.getSelection();
      if (sel && sel.type === "Range" && !sel.isCollapsed) return;
      setFx(fx + 1);
    });
  }

  var running = true;
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) {
      last = performance.now();
      requestAnimationFrame(frame);
      vPix.play().catch(function () {});
      vClear.play().catch(function () {});
    } else {
      vPix.pause();
      vClear.pause();
    }
  });

  [vPix, vClear].forEach(function (v) {
    v.addEventListener(
      "loadeddata",
      function () {
        v.play().catch(function () {});
      },
      { once: true }
    );
  });

  canvas.addEventListener("webglcontextlost", function (e) {
    e.preventDefault();
    running = false;
    stage.classList.remove("is-gl");
    stage.classList.add("is-static");
  });

  /* ── THE OPENING ────────────────────────────────────────────────────────
     Sid: "i want the homepage reveal animation to be shown better."

     What was here was a lissajous drift — sin(0.36t) against sin(0.53t) — an
     invisible hand wandering the frame forever at a constant, aimless speed.
     It did demonstrate that the frame responds to something, eventually, if
     you were still watching. What it never did was demonstrate the *idea*,
     which is that the picture underneath is a real one and the pointer opens
     it.

     So the first three and a half seconds are choreographed. A single stroke
     enters from the left, crosses the frame on an ease-out with a slight rise
     through the middle, and pauses at the far side — one deliberate wipe, at
     reading speed, wide enough to clear a third of the frame. Then it hands
     over to the old drift, which is the right behaviour for minute two and the
     wrong one for second one.

     `INTRO` is the duration and `intro()` returns the point plus how hard to
     press, because the stroke should also open wider as it accelerates and
     ease off as it settles. */
  var INTRO = 3.4;

  function intro(t) {
    var k = Math.min(1, t / INTRO);
    /* Ease-out-quint on position: most of the travel happens early, so it
       reads as a hand that started before you looked. */
    var e = 1 - Math.pow(1 - k, 5.0);
    var x = -0.08 + e * 1.16;
    /* A shallow arc rather than a ruled line. Half a sine over the width. */
    var y = 0.5 + Math.sin(k * Math.PI) * 0.12;
    /* Pressure follows the derivative of the ease: hardest while moving. */
    var press = 0.55 + Math.pow(1 - k, 3.0) * 0.75;
    return [x, y, press];
  }

  /* After the opening, an unattended hero should still move. Same slow figure
     as before — it is good at being ignorable, which is what it is for now. */
  function idlePoint(t) {
    return [0.5 + Math.sin(t * 0.36) * 0.26, 0.52 + Math.sin(t * 0.53) * 0.16];
  }

  /* Which theme the page is wearing, watched rather than read once — the
     toggle is a button on every page and the film has to answer it. */
  var light = document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0;
  new MutationObserver(function () {
    light = document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0;
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  var t0 = performance.now(),
    last = t0,
    fade = 0;

  function frame(now) {
    if (!running) return;
    var dt = Math.min(64, now - last);
    last = now;
    var step = dt / 16.667;
    var t = (now - t0) / 1000;
    var sm = function (k) {
      return 1 - Math.pow(1 - k, step);
    };

    var press = 1;
    if (!touched) {
      if (t < INTRO) {
        var ip = intro(t);
        target = [ip[0], ip[1]];
        press = ip[2];
        vel = 0.5;
      } else {
        target = idlePoint(t);
        vel = 0.28;
      }
      lastMove = now;
    }

    mouse[0] += (target[0] - mouse[0]) * sm(0.16);
    mouse[1] += (target[1] - mouse[1]) * sm(0.16);

    var idle = (now - lastMove) / 1000;
    var down = Math.max(0, (0.6 + vel * 0.7) * press * Math.max(0, 1 - idle * 1.4));
    vel *= Math.pow(0.9, step);
    fade += (1 - fade) * sm(0.03);
    /* The pixels lift off the pre-rendered encode and reseat on the live
       footage. Held flat for the first second so the page genuinely opens on
       the file Sid shot, then eased across the second. */
    var boot = Math.max(0, Math.min(1, (t - 1.0) / 1.6));
    boot = boot * boot * (3 - 2 * boot);
    flash *= Math.pow(0.86, step);
    if (flash < 0.004) flash = 0;

    upload(texPix, vPix);
    upload(texClear, vClear);

    var src = ping,
      dst = 1 - ping;
    gl.bindFramebuffer(gl.FRAMEBUFFER, maskFbo[dst]);
    gl.viewport(0, 0, MW, MH);
    gl.useProgram(pMask);
    bindQuad(pMask);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, maskTex[src]);
    gl.uniform1i(pMask.u.u_prev, 0);
    gl.uniform2f(pMask.u.u_mouse, mouse[0], mouse[1]);
    gl.uniform1f(pMask.u.u_down, down);
    /* The opening stroke is deliberately fatter than a pointer stroke: it has
       one pass to show what the brush does, where a visitor has as many as
       they like. */
    gl.uniform1f(pMask.u.u_radius, (touched || t >= INTRO ? 0.1 : 0.17) + vel * 0.06);
    gl.uniform1f(pMask.u.u_decay, Math.pow(0.972, step));
    gl.uniform1f(pMask.u.u_aspect, canvas.width / canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    ping = dst;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(pComp);
    bindQuad(pComp);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texPix);
    gl.uniform1i(pComp.u.u_base, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texClear);
    gl.uniform1i(pComp.u.u_clear, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, maskTex[ping]);
    gl.uniform1i(pComp.u.u_mask, 2);
    gl.uniform2f(pComp.u.u_res, canvas.width, canvas.height);
    gl.uniform1f(pComp.u.u_time, t);
    gl.uniform1f(pComp.u.u_fade, fade);
    gl.uniform1f(pComp.u.u_fx, fx);
    gl.uniform1f(pComp.u.u_boot, boot);
    gl.uniform1f(pComp.u.u_flash, flash);
    gl.uniform1f(pComp.u.u_light, light);
    // cover: shrink uv on whichever axis has slack, so the film fills the
    // stage by cropping. Sampling a narrower slice of the source is what
    // crops it; the axis that already matches is left at 1.
    var stageAspect = canvas.width / canvas.height;
    if (vidAspect > stageAspect) gl.uniform2f(pComp.u.u_cover, stageAspect / vidAspect, 1.0);
    else gl.uniform2f(pComp.u.u_cover, 1.0, vidAspect / stageAspect);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(frame);
  }

  resize();
  requestAnimationFrame(frame);
})();
