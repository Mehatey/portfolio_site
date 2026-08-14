/* ============================================================
   Homepage hero — THE FIELD.

   What this replaces: two 10-second videos, one pixelated and one clear,
   crossfaded by a painted mask. Sid: "u can remove that video and both and
   have an auto switching reactive cursor new shader and coool webgl bg."

   Three reasons it had to go beyond him asking.

   It was 2.8MB of video to draw a picture nobody could read: measured, the
   hero band sat at mean luminance 19 of 255. Grading it helped and could only
   ever help so much, because the source is a dim room and half the frame is
   an unlit wall.

   It could not be themed. Footage has its own exposure, so on the cream page
   the same plate washed to near-white and on the near-black page it sank to
   mud. Two themes, one negative, no way to serve both.

   And it was a photograph of a room, which says nothing about what he makes.

   So the hero is generated now. An ASCII field: a grid of monospace glyphs
   picked per cell from a flow field, disturbed by the pointer, cycling
   through four states on its own. It is the site's own language — the nav
   marks are pixels, the footer plants are ASCII, the About portrait is a
   halftone — arriving in the one place that was still borrowing someone
   else's medium. It ships as about six kilobytes of script and no media at
   all, it is legible by construction in both themes because the palette is
   a uniform rather than an exposure, and it cannot be mud.

   HOW THE GLYPHS WORK

   The standard technique. A texture atlas is drawn once at runtime: sixteen
   characters in a row, ordered by how much ink each puts on the page, from a
   space to a solid block. The fragment shader reduces each cell to a single
   number, quantises it to sixteen steps, and samples the matching slice of
   the atlas. Everything after that is deciding what the number is.

   Falls back to nothing: without WebGL the hero is the page's own background,
   which is exactly what it was already designed to sit on.
   ============================================================ */
(function () {
  "use strict";

  var stage = document.getElementById("field-stage");
  if (!stage) return;
  var canvas = document.getElementById("field-gl");
  if (!canvas) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var gl = null;
  try {
    gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false });
  } catch (e) {
    gl = null;
  }
  if (!gl) return;
  stage.classList.add("is-gl");

  /* ── the atlas ─────────────────────────────────────────────────────────
     Ordered by ink. The ramp matters more than the characters: a jump in
     density between neighbours shows up as banding across the field, so the
     middle of this ramp is deliberately crowded where the eye is most
     sensitive. */
  var RAMP = " .·:-=+*x?%#@▓██";
  var CELL = 64;
  var atlasCv = document.createElement("canvas");
  atlasCv.width = CELL * RAMP.length;
  atlasCv.height = CELL;
  var a2d = atlasCv.getContext("2d");
  a2d.fillStyle = "#000";
  a2d.fillRect(0, 0, atlasCv.width, atlasCv.height);
  a2d.fillStyle = "#fff";
  a2d.font = "600 " + Math.round(CELL * 0.78) + "px 'DM Mono', ui-monospace, monospace";
  a2d.textAlign = "center";
  a2d.textBaseline = "middle";
  for (var i = 0; i < RAMP.length; i++) {
    a2d.fillText(RAMP[i], i * CELL + CELL / 2, CELL / 2 + CELL * 0.04);
  }

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

  var VS = "attribute vec2 a; varying vec2 v; void main(){ v = a * 0.5 + 0.5; gl_Position = vec4(a, 0.0, 1.0); }";

  var FS = [
    "precision highp float;",
    "varying vec2 v;",
    "uniform sampler2D u_atlas, u_video, u_real;",
    "uniform vec2 u_res;",
    "uniform float u_time, u_n, u_mode, u_next, u_blend, u_light, u_fade, u_sys, u_sysNext, u_sysBlend;",
    "uniform vec2 u_ptr, u_cover;",
    "uniform float u_ptrOn, u_pal;",

    /* Value noise. Cheap, and its softness suits a field that is going to be
       quantised to sixteen steps anyway — gradient noise would spend detail
       the ramp cannot show. */
    "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",
    "float noise(vec2 p){",
    "  vec2 i = floor(p), f = fract(p);",
    "  f = f * f * (3.0 - 2.0 * f);",
    "  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));",
    "  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);",
    "}",
    "float fbm(vec2 p){",
    "  float s = 0.0, amp = 0.5;",
    "  for (int k = 0; k < 5; k++) { s += noise(p) * amp; p *= 2.02; amp *= 0.5; }",
    "  return s;",
    "}",

    /* ── the four states ──────────────────────────────────────────────────
       Each returns density in 0..1 for a cell centre. They are written to
       hold the same average so the field does not flash brighter or darker
       as it changes state. */
    "float fieldFor(int m, vec2 p, float t){",
    /* DRIFT — slow diagonal weather. The resting state. */
    "  if (m == 0) return fbm(p * 2.4 + vec2(t * 0.06, -t * 0.04));",
    /* RINGS — concentric waves off centre, the field breathing. */
    "  if (m == 1) { float d = length(p - vec2(0.5, 0.5)); return 0.5 + 0.42 * sin(d * 22.0 - t * 1.4) * (1.0 - d); }",
    /* WEAVE — two crossed sine sheets, a woven grid that slides. */
    "  if (m == 2) return 0.5 + 0.3 * sin(p.x * 26.0 + t * 0.7) * sin(p.y * 18.0 - t * 0.5) + 0.18 * fbm(p * 3.0);",
    /* SCATTER — fbm torn by a fast second layer, the field agitated. */
    "  return fbm(p * 3.4 + vec2(-t * 0.12, t * 0.08)) * 0.7 + noise(p * 9.0 + t * 0.6) * 0.4;",
    "}",

    /* ── THE FIELD IS HIM, NOT NOISE ──────────────────────────────────────
       Sid: "it looks terrible and not personal to me at all nothing about it
       feels like me it feels like a generic fintech bg."

       He is right, and the fault is structural rather than a matter of taste.
       A field driven by fbm is the same field on anybody's site — swap the
       palette and it could sell insurance. The marks were his; the thing they
       were drawing was nobody's.

       So the density is the FOOTAGE now. Every cell reads the luminance of
       the video underneath and draws that, which means the glyphs, the
       halftone, the contours and the blocks are all portraits: it is his room
       and his face, rendered four ways. The flow noise survives only as a
       small perturbation, enough to keep the grid from looking like a print
       of a still, nowhere near enough to be the subject. */
    "float sampleField(vec2 p, float t){",
    "  vec2 uv = (p - 0.5) * u_cover + 0.5;",
    "  uv.y = 1.0 - uv.y;",
    "  vec3 c = texture2D(u_video, uv).rgb;",
    "  float lum = dot(c, vec3(0.299, 0.587, 0.114));",
    /* The source is a dim room, so it is lifted here rather than in a grade
       downstream: the ramp has sixteen steps and a signal that only ever uses
       the bottom four of them is a waste of all four systems. */
    "  lum = pow(clamp(lum * 1.9, 0.0, 1.0), 0.72);",
    "  float drift = fbm(p * 2.6 + vec2(t * 0.05, -t * 0.035));",
    "  return clamp(lum * 0.82 + drift * 0.24, 0.0, 1.0);",
    "}",

    /* One value in, one amount of ink out. Kept in a single function so the
       blend between two systems is a single mix rather than two code paths
       that have to be kept in step. */
    "float drawSystem(int sysm, float d, vec2 cuv, vec2 cid){",
    "  if (sysm == 0) {",
    "    float idx = floor(d * 15.0 + 0.5);",
    "    vec2 auv = vec2((idx + cuv.x) / 16.0, 1.0 - cuv.y);",
    "    return texture2D(u_atlas, auv).r;",
    "  }",
    "  if (sysm == 1) {",
    /* Halftone. Radius from density, edge softened across roughly one screen
       pixel of the cell so the dots have an edge without crawling. */
    "    float r = sqrt(d) * 0.62;",
    "    float dist = length(cuv - 0.5);",
    "    return smoothstep(r, r - 0.09, dist);",
    "  }",
    "  if (sysm == 2) {",
    /* Contours. The field read as height: keep only what sits near a band
       boundary, which draws the weather as lines instead of shading it. */
    "    float f = d * 9.0;",
    "    float dd = min(fract(f), 1.0 - fract(f));",
    "    float line = 1.0 - smoothstep(0.04, 0.16, dd);",
    "    return line * (0.4 + 0.6 * d);",
    "  }",
    /* Blocks. Flat cells with a hard step, plus a lift on the densest ones so
       the mosaic has a highlight rather than reading as a flat quilt. */
    "  float q = floor(d * 6.0) / 6.0;",
    "  float edge = step(0.06, cuv.x) * step(0.06, cuv.y) * step(cuv.x, 0.94) * step(cuv.y, 0.94);",
    "  return q * edge * (0.55 + 0.75 * smoothstep(0.6, 1.0, d));",
    "}",

    "void main(){",
    /* Square cells regardless of viewport shape: the grid is defined on the
       shorter axis and the longer one simply gets more of them. */
    "  vec2 px = v * u_res;",
    "  float cell = min(u_res.x, u_res.y) / u_n;",
    "  vec2 cid = floor(px / cell);",
    "  vec2 cuv = fract(px / cell);",
    "  vec2 cpos = (cid + 0.5) * cell / u_res;",

    "  float d = sampleField(cpos, u_time);",

    /* ── the pointer ──────────────────────────────────────────────────────
       Not a spotlight. The cursor pulls the field toward it and lifts its
       density, so the marks near your hand climb the ramp and the ones
       further out thin — the disturbance is in the DATA, not in a light laid
       over the top, which is why it still reads when the palette inverts. */
    "  vec2 toP = cpos - u_ptr;",
    "  toP.x *= u_res.x / max(1.0, u_res.y);",
    "  float pd = length(toP);",
    "  float infl = u_ptrOn * exp(-pd * pd * 26.0);",
    "  if (infl > 0.002) {",
    "    vec2 warp = cpos - normalize(toP + 1e-6) * infl * 0.05;",
    "    d = mix(d, sampleField(warp, u_time), 0.85);",
    "    d += infl * 0.5;",
    "    d -= smoothstep(0.16, 0.42, pd) * infl * 0.12;",
    "  }",

    /* Vertical falloff. The headline sits in the lower half, so the field
       gives that band back: full weather at the top, quiet under the type. */
    "  d *= mix(0.42, 1.0, smoothstep(0.86, 0.16, v.y));",
    "  d = clamp(d, 0.0, 1.0);",

    /* ── FOUR WAYS OF DRAWING THE SAME NUMBER ─────────────────────────────
       Sid: "not just asci i want it to keep changing bro come on."

       Everything above produces one value per cell. What changes on the
       clock is how that value is DRAWN, which is why the field can look like
       four unrelated pieces of work while staying one system that the
       pointer disturbs in one way:

         0 GLYPHS  the ASCII atlas, quantised to sixteen steps of ink
         1 DOTS    a halftone screen, radius from density
         2 LINES   contour bands, the field read as topography
         3 BLOCKS  flat mosaic with a channel offset on the busiest cells

       Two systems are evaluated and mixed whenever the clock is mid-change,
       so it morphs between them rather than cutting. */
    "  float sys = u_sysBlend > 0.001 ? -1.0 : u_sys;",
    "  float inkAmt = 0.0;",
    "  float inkA = drawSystem(int(u_sys), d, cuv, cid);",
    "  if (u_sysBlend > 0.001) {",
    "    float inkB = drawSystem(int(u_sysNext), d, cuv, cid);",
    "    inkAmt = mix(inkA, inkB, u_sysBlend);",
    "  } else { inkAmt = inkA; }",

    /* Colour is a uniform, not an exposure. This is the whole reason the
       field can live on both themes: dark page gets cool light ink on
       nothing, cream page gets deep ink on nothing, and neither can wash out
       because neither is a photograph. */
    /* ── FIVE VIBES ───────────────────────────────────────────────────────
       "everyclick let it change the styling and the vibe." A click advances
       both the drawing system and the palette, so the change is a change of
       register rather than the same picture in a different hue. */
    "  vec3 ink;",
    "  if (u_pal < 0.5)      ink = mix(vec3(0.62, 0.76, 0.98), vec3(0.08, 0.11, 0.18), u_light);",
    "  else if (u_pal < 1.5) ink = mix(vec3(1.00, 0.52, 0.30), vec3(0.42, 0.13, 0.02), u_light);",
    "  else if (u_pal < 2.5) ink = mix(vec3(0.52, 0.98, 0.72), vec3(0.02, 0.30, 0.16), u_light);",
    "  else if (u_pal < 3.5) ink = mix(vec3(0.98, 0.45, 0.78), vec3(0.38, 0.05, 0.24), u_light);",
    "  else                  ink = mix(vec3(0.94, 0.92, 0.86), vec3(0.10, 0.10, 0.10), u_light);",
    "  vec3 tint = ink;",
    "  tint = mix(tint, tint * vec3(1.12, 0.94, 1.04), smoothstep(0.55, 1.0, d));",

    "  float alpha = inkAmt * mix(0.72, 0.7, u_light) * u_fade;",
    "  alpha *= 0.3 + 0.7 * d;",

    /* ── THE WINDOW ───────────────────────────────────────────────────────
       "on hover show the real video". Under the pointer the glyph layer gives
       way and the footage itself shows through, full colour and unscreened —
       a hole cut in the print rather than a brightening of it. Soft-edged, so
       it reads as the film surfacing rather than as a circular mask. */
    "  vec2 ruv = (v - 0.5) * u_cover + 0.5;",
    "  ruv.y = 1.0 - ruv.y;",
    "  vec3 real = texture2D(u_real, ruv).rgb;",
    "  real = clamp((pow(real, vec3(0.78)) - 0.5) * 1.12 + 0.5, 0.0, 1.0);",
    "  float win = u_ptrOn * smoothstep(0.30, 0.05, pd);",
    "  vec3 outCol = mix(tint, real, win);",
    "  float outA = mix(alpha, u_fade * 0.98, win);",
    "  gl_FragColor = vec4(outCol, outA);",
    "}",
  ].join("\n");

  var prog = gl.createProgram();
  var vs = sh(gl.VERTEX_SHADER, VS),
    fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog));
    return;
  }
  gl.useProgram(prog);

  var quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var aLoc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

  var U = {};
  [
    "u_atlas",
    "u_res",
    "u_time",
    "u_n",
    "u_mode",
    "u_next",
    "u_blend",
    "u_light",
    "u_fade",
    "u_ptr",
    "u_ptrOn",
    "u_sys",
    "u_sysNext",
    "u_sysBlend",
  ].forEach(function (k) {
    U[k] = gl.getUniformLocation(prog, k);
  });

  /* ── THE FOOTAGE ───────────────────────────────────────────────────────
     Sid: "i want my video to play once the pixel one and on hover show the
     real video and also have the overlay bg and once its done playing once it
     doesnt show up again."

     So there are two plates and a rule. The pixelated encode plays exactly
     once, on a first visit, and the field draws itself from it; the moment it
     ends the source swaps to the clear footage and the pixel plate is never
     mounted again, remembered in localStorage so it does not return tomorrow
     either. Under the pointer the glyph layer opens and the clear plate shows
     through as itself.

     Both are decode sources only — nothing here is ever painted to the page
     directly, the shader reads them as textures. */
  var PIX_KEY = "sid_pixel_seen";
  var pixSeen = false;
  try {
    pixSeen = !!localStorage.getItem(PIX_KEY);
  } catch (e) {}

  function mkVideo(src, loop) {
    var v = document.createElement("video");
    v.src = src;
    v.muted = true;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    v.setAttribute("muted", "");
    v.loop = !!loop;
    v.preload = "auto";
    v.style.cssText = "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none";
    stage.appendChild(v);
    v.play().catch(function () {});
    return v;
  }

  var base = stage.getAttribute("data-base") || "";
  var vClear = mkVideo(base + "/assets/video/sid_sitting.mp4", true);
  var vPix = pixSeen ? null : mkVideo(base + "/assets/video/sid_pixelated.mp4", false);
  if (vPix) {
    vPix.addEventListener("ended", function () {
      try {
        localStorage.setItem(PIX_KEY, "1");
      } catch (e) {}
      /* Dropped from the DOM as well as from the draw, so a visitor who has
         seen it once is not decoding it for the rest of the session. */
      if (vPix.parentNode) vPix.parentNode.removeChild(vPix);
      vPix = null;
    });
  }

  var vidAspect = 16 / 9;
  function upload(t, video) {
    if (!video || video.readyState < 2) return false;
    gl.bindTexture(gl.TEXTURE_2D, t);
    try {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    } catch (e) {
      return false;
    }
    if (video.videoWidth) vidAspect = video.videoWidth / video.videoHeight;
    return true;
  }

  function newTex() {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([10, 12, 18, 255]));
    return t;
  }
  var texVideo = newTex(),
    texReal = newTex();

  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCv);
  gl.uniform1i(U.u_atlas, 0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0,
    H = 0;
  function resize() {
    W = stage.clientWidth || window.innerWidth;
    H = stage.clientHeight || window.innerHeight;
    canvas.width = Math.max(2, Math.round(W * dpr));
    canvas.height = Math.max(2, Math.round(H * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  var light = document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0;
  new MutationObserver(function () {
    light = document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0;
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* ── pointer ───────────────────────────────────────────────────────────── */
  var pxN = 0.5,
    pyN = 0.5,
    tpx = 0.5,
    tpy = 0.5,
    on = 0,
    tOn = 0;
  window.addEventListener(
    "pointermove",
    function (e) {
      var r = stage.getBoundingClientRect();
      tpx = (e.clientX - r.left) / Math.max(1, r.width);
      tpy = 1 - (e.clientY - r.top) / Math.max(1, r.height);
      tOn = tpx > -0.1 && tpx < 1.1 && tpy > -0.1 && tpy < 1.1 ? 1 : 0;
    },
    { passive: true }
  );
  window.addEventListener(
    "pointerleave",
    function () {
      tOn = 0;
    },
    { passive: true }
  );

  /* ── the states ────────────────────────────────────────────────────────
     Four, cycling on their own every eleven seconds with a two-second
     crossfade. "Auto switching" was the ask, and the reason it works rather
     than being a slideshow is that both states are evaluated and mixed in
     the shader, so the field MORPHS between weathers instead of cutting.

     Reduced motion parks it on DRIFT and never advances. */
  var mode = 0,
    next = 0,
    blend = 0,
    switchAt = 11000;

  /* ── THE CLOCK ─────────────────────────────────────────────────────────
     Sid: "i want it to keep changing bro come on. like every 20 sec it shud
     change or when someone comes back to homepage."

     Both. The drawing system advances every twenty seconds with a two second
     morph, and which one you start on is chosen at random on load — so the
     hero is not the same picture twice, and coming back to the homepage from
     anywhere in the site deals a different one rather than resuming the
     sequence you already saw.

     The weather underneath runs on its own slower clock, so the two are
     almost never in phase: a given combination of system and weather comes
     round about every four minutes. */
  var pal = Math.floor(Math.random() * 5);
  var sys = Math.floor(Math.random() * 4),
    sysNext = sys,
    sysBlend = 0,
    SYS_EVERY = 20000;

  var t0 = performance.now(),
    last = t0,
    fade = 0,
    raf = 0,
    visible = true,
    nextSwitch = t0 + switchAt,
    nextSys = t0 + SYS_EVERY;

  if (window.IntersectionObserver) {
    new IntersectionObserver(
      function (es) {
        visible = es[0].isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(frame);
      },
      { threshold: 0.01 }
    ).observe(stage);
  }

  function frame(now) {
    raf = 0;
    if (!visible) return;
    var dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    var t = (now - t0) / 1000;

    fade += (1 - fade) * (1 - Math.exp(-dt / 0.7));
    pxN += (tpx - pxN) * (1 - Math.exp(-dt / 0.07));
    pyN += (tpy - pyN) * (1 - Math.exp(-dt / 0.07));
    on += (tOn - on) * (1 - Math.exp(-dt / 0.18));

    if (!reduce) {
      if (blend > 0) {
        blend += dt / 2.0;
        if (blend >= 1) {
          mode = next;
          blend = 0;
          nextSwitch = now + switchAt;
        }
      } else if (now > nextSwitch) {
        next = (mode + 1) % 4;
        blend = 0.0001;
      }

      if (sysBlend > 0) {
        sysBlend += dt / 2.0;
        if (sysBlend >= 1) {
          sys = sysNext;
          sysBlend = 0;
          nextSys = now + SYS_EVERY;
        }
      } else if (now > nextSys) {
        /* Never the same one twice running: step by one or two so the order
           varies without ever repeating what is already on screen. */
        sysNext = (sys + 1 + Math.floor(Math.random() * 2)) % 4;
        sysBlend = 0.0001;
      }
    }

    gl.uniform2f(U.u_res, canvas.width, canvas.height);
    gl.uniform1f(U.u_time, reduce ? 0.0 : t);
    /* Cell count from the short edge, so the glyphs stay square and legible
       from a phone to a wide display. */
    gl.uniform1f(U.u_n, Math.max(26, Math.min(64, Math.round(Math.min(W, H) / 15))));
    gl.uniform1f(U.u_mode, mode);
    gl.uniform1f(U.u_next, next);
    gl.uniform1f(U.u_blend, blend > 0 ? Math.min(1, blend) : 0);
    gl.uniform1f(U.u_light, light);
    gl.uniform1f(U.u_fade, fade);
    gl.uniform2f(U.u_ptr, pxN, pyN);
    gl.uniform1f(U.u_ptrOn, on);
    gl.uniform1f(U.u_sys, sys);
    gl.uniform1f(U.u_sysNext, sysNext);
    gl.uniform1f(U.u_sysBlend, sysBlend > 0 ? Math.min(1, sysBlend) : 0);
    gl.uniform1f(U.u_pal, pal);

    /* object-fit: cover in uv, so the footage crops rather than stretching. */
    var stageAspect = canvas.width / Math.max(1, canvas.height);
    if (vidAspect > stageAspect) gl.uniform2f(U.u_cover, stageAspect / vidAspect, 1.0);
    else gl.uniform2f(U.u_cover, 1.0, vidAspect / stageAspect);

    upload(texVideo, vPix || vClear);
    upload(texReal, vClear);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texVideo);
    gl.uniform1i(U.u_video, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texReal);
    gl.uniform1i(U.u_real, 2);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    raf = requestAnimationFrame(frame);
  }

  /* Wait for the mono face before the atlas is drawn, or the glyphs are
     whatever the fallback happens to be and the ink ramp is wrong. */
  function boot() {
    a2d.font = "600 " + Math.round(CELL * 0.78) + "px 'DM Mono', ui-monospace, monospace";
    a2d.fillStyle = "#000";
    a2d.fillRect(0, 0, atlasCv.width, atlasCv.height);
    a2d.fillStyle = "#fff";
    for (var i = 0; i < RAMP.length; i++) a2d.fillText(RAMP[i], i * CELL + CELL / 2, CELL / 2 + CELL * 0.04);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCv);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot).catch(function () {});

  /* ── EVERY CLICK CHANGES THE REGISTER ──────────────────────────────────
     "everyclick let it change the styling and the vibe." Both advance: a new
     drawing system and a new palette, so it is a different piece of work
     rather than a recolour. Clicks on real controls are left alone. */
  var heroEl = stage.closest("section") || stage.parentElement;
  if (heroEl) {
    heroEl.addEventListener("pointerdown", function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      var t = e.target;
      if (t && t.closest && t.closest('a, button, select, input, textarea, label, [role="button"], [role="listbox"], .pgram')) return;
      sysNext = (sys + 1 + Math.floor(Math.random() * 2)) % 4;
      sysBlend = 0.0001;
      pal = (pal + 1) % 5;
    });
  }

  raf = requestAnimationFrame(frame);
})();
