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
    "uniform float u_shift, u_raw;",
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
    "  vec2 uv = (p - 0.5) * u_cover + 0.5 - vec2(u_shift, 0.0);",
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

    /* ── FIVE TREATMENTS, NOT FOUR GRIDS AND FIVE PALETTES ───────────────
       Sid: "for the click bg hover effects its repeating a lot and some just
       change colors. please change it up not all the hovers need to be an
       overlay like asci choose 5 distinct hover effects and shaders for the
       vid."

       He is describing a real structural fault, not a taste problem. Every
       state used to reduce the footage to ONE NUMBER per cell — a density —
       and then draw that number four ways: glyphs, dots, contour lines,
       blocks. Four different marks, but the same picture underneath every
       time, at the same grid resolution, so they read as one effect with a
       skin on it. The palette then rotated separately, which is where "some
       just change colors" comes from: two of the five changes a visitor sees
       genuinely were only a hue.

       So three of the five do not touch the grid at all. They treat the plate
       itself — its edges, its scanlines, its flow — and they keep the film's
       own colour, which is what makes them read as different pieces of work
       rather than different inks:

         0 GLYPHS    the ASCII atlas. The site's own language, kept.
         1 HALFTONE  a colour dot screen, printed in the film's own colour
                     rather than in one ink — a print, not a stencil.
         2 EDGES     a Sobel over the plate. A line drawing of the footage,
                     no cells anywhere in it.
         3 TAPE      per-scanline horizontal displacement with the channels
                     split — the plate as damaged video.
         4 LIQUID    the plate resampled through a drifting flow field, so it
                     smears like something wet and settles again.

       Two are marks on a grid, three are the film handled directly. */

    /* The plate, sampled anywhere, graded once. Everything below reads
       through this so the grade cannot drift between systems. */
    "vec3 plate(vec2 uv){",
    "  vec2 t = clamp(uv, 0.0, 1.0);",
    "  vec3 c = texture2D(u_real, vec2(t.x, 1.0 - t.y)).rgb;",
    "  return clamp((pow(c, vec3(0.78)) - 0.5) * 1.12 + 0.5, 0.0, 1.0);",
    "}",
    "float plateLum(vec2 uv){ return dot(plate(uv), vec3(0.299, 0.587, 0.114)); }",

    "vec4 treat(int sysm, vec2 uv, vec2 cuv, float d, vec3 tint, float filmA, float ink, float t, float quiet){",
    "  if (sysm == 0) {",
    "    float idx = floor(d * 15.0 + 0.5);",
    "    vec2 auv = vec2((idx + cuv.x) / 16.0, 1.0 - cuv.y);",
    "    float a = texture2D(u_atlas, auv).r * ink;",
    "    float A = clamp(filmA + a, 0.0, 1.0);",
    "    return vec4(mix(plate(uv), tint, clamp(a / max(A, 0.001), 0.0, 1.0)), A);",
    "  }",
    "  if (sysm == 1) {",
    /* Dots carrying the film's own colour. The radius still comes from
       density, so the screen is a real halftone rather than a stencil, but
       what prints is the photograph. */
    "    float r = sqrt(d) * 0.66;",
    "    float cov = smoothstep(r, r - 0.10, length(cuv - 0.5));",
    "    vec3 c = plate(uv);",
    "    c = mix(vec3(dot(c, vec3(0.3, 0.59, 0.11))), c, 1.25);",
    "    float A = clamp(cov * 0.78 * quiet + filmA * 0.35, 0.0, 1.0);",
    "    return vec4(mix(plate(uv), c, 0.85), A);",
    "  }",
    "  if (sysm == 2) {",
    /* Sobel. The epsilon is in plate space rather than screen space so the
       line weight does not change with the viewport. */
    "    float e = 0.0022;",
    "    float gx = plateLum(uv + vec2(e, 0.0)) - plateLum(uv - vec2(e, 0.0));",
    "    float gy = plateLum(uv + vec2(0.0, e)) - plateLum(uv - vec2(0.0, e));",
    "    float g = length(vec2(gx, gy)) * 3.4;",
    "    float edge = smoothstep(0.10, 0.55, g);",
    "    float A = clamp(edge * 0.92 * quiet + filmA * 0.22, 0.0, 1.0);",
    "    return vec4(mix(plate(uv), tint, clamp((edge * 0.92) / max(A, 0.001), 0.0, 1.0)), A);",
    "  }",
    "  if (sysm == 3) {",
    /* Tape. One horizontal offset per scanline, two frequencies so it does
       not read as a single sine, and the channels pulled apart across it. */
    "    float band = floor(uv.y * 150.0);",
    "    float off = sin(band * 0.7 + t * 1.7) * 0.004 + (hash(vec2(band, floor(t * 3.0))) - 0.5) * 0.012;",
    "    float sp = 0.0045 + 0.004 * abs(off) * 40.0;",
    "    vec3 c = vec3(plate(uv + vec2(off + sp, 0.0)).r, plate(uv + vec2(off, 0.0)).g, plate(uv + vec2(off - sp, 0.0)).b);",
    "    c *= 0.86 + 0.14 * sin(uv.y * 620.0);",
    "    return vec4(c, clamp(filmA * 2.4 * quiet, 0.0, 0.92));",
    "  }",
    /* Liquid. The plate resampled through a slow flow field, then lightly
       posterised so the smear has edges to see. */
    "  vec2 w = vec2(fbm(uv * 3.2 + vec2(t * 0.07, 0.0)), fbm(uv * 3.2 + vec2(6.7, -t * 0.055))) - 0.5;",
    "  vec3 c = plate(uv + w * 0.075);",
    "  c = mix(c, floor(c * 7.0 + 0.5) / 7.0, 0.55);",
    "  return vec4(c, clamp(filmA * 2.2 * quiet, 0.0, 0.9));",
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

    /* ── THE FALLOFF WAS UPSIDE DOWN ──────────────────────────────────────
       This has always read "full weather at the top, quiet under the type",
       and it has always done the opposite. `v` comes from the clip-space
       quad, so v.y is 0 at the BOTTOM of the screen — and smoothstep(0.86,
       0.16, v.y) returns 1 there. The field was running at full strength
       across the bottom third and at 0.42 across the top: loudest exactly
       where the headline and the sentence sit, quietest across the empty sky
       above the figure.

       It was survivable while every state was a sparse grid of marks. It
       stopped being survivable the moment three of the five treatments
       started printing the plate itself — at which point the copy was sitting
       on a full-contrast line drawing of a chain-link fence.

       Both ends corrected: quiet at the bottom, and quieter than before,
       because what it is holding back now is a photograph rather than a
       scattering of glyphs. */
    "  d *= mix(0.22, 1.0, smoothstep(0.16, 0.86, v.y));",
    "  d = clamp(d, 0.0, 1.0);",

    /* ── THE CLOCK ────────────────────────────────────────────────────────
       Two treatments are evaluated and mixed whenever the clock is mid-change,
       so it morphs between them rather than cutting. Both are full RGBA now,
       so a cross-fade between a line drawing and a colour halftone is a real
       dissolve rather than two ink amounts averaged. */
    "  vec3 ink;",
    "  if (u_pal < 0.5)      ink = mix(vec3(0.62, 0.76, 0.98), vec3(0.08, 0.11, 0.18), u_light);",
    "  else if (u_pal < 1.5) ink = mix(vec3(1.00, 0.52, 0.30), vec3(0.42, 0.13, 0.02), u_light);",
    "  else if (u_pal < 2.5) ink = mix(vec3(0.52, 0.98, 0.72), vec3(0.02, 0.30, 0.16), u_light);",
    "  else if (u_pal < 3.5) ink = mix(vec3(0.98, 0.45, 0.78), vec3(0.38, 0.05, 0.24), u_light);",
    "  else                  ink = mix(vec3(0.94, 0.92, 0.86), vec3(0.10, 0.10, 0.10), u_light);",
    "  vec3 tint = mix(ink, ink * vec3(1.12, 0.94, 1.04), smoothstep(0.55, 1.0, d));",

    "  float inkAmt = mix(0.40, 0.22, u_light) * u_fade * (0.3 + 0.7 * d);",

    /* The plate's own uv, cover-corrected and slid right. */
    "  vec2 uvP = (v - 0.5) * u_cover + 0.5 - vec2(u_shift, 0.0);",

    /* Under the pointer the film opens the rest of the way. Cream has
       nowhere to go but down, so the same film sits heavier on the light
       page at identical strength. */
    "  float filmA = (0.13 + 0.62 * u_ptrOn * smoothstep(0.50, 0.03, pd)) * mix(1.0, 0.62, u_light) * u_fade;",

    /* The three plate-handling treatments would otherwise print the footage
       at full strength straight through the headline. Same vertical falloff
       the density gets — and the same correction, see above. Lower floor
       again, because these carry the photograph rather than a mark derived
       from it. */
    "  float quiet = mix(0.14, 1.0, smoothstep(0.20, 0.82, v.y)) * u_fade;",

    "  vec4 A = treat(int(u_sys), uvP, cuv, d, tint, filmA, inkAmt, u_time, quiet);",
    "  vec4 outv = A;",
    "  if (u_sysBlend > 0.001) {",
    "    vec4 B = treat(int(u_sysNext), uvP, cuv, d, tint, filmA, inkAmt, u_time, quiet);",
    "    outv = mix(A, B, u_sysBlend);",
    "  }",
    "  vec3 outCol = outv.rgb;",
    "  float outA = outv.a;",

    /* ── PHASE 0 AND 1: THE PLATE, PLAINLY ────────────────────────────────
       No glyphs, no halftone, no pointer window, no vertical falloff — the
       footage full frame, which is the only state in which a viewer can
       simply watch it. u_raw cross-fades this out over 1.5s as the field
       takes over, so the treatments arrive as something that happens TO the
       picture rather than as the picture.

       The copy still has to be readable over it, so the plate carries the
       same bottom-weighted scrim the type has always needed — a gradient in
       the alpha, not a black box drawn over the film. */
    "  if (u_raw > 0.001) {",
    "    vec3 plain = plate(uvP);",
    "    float scrim = mix(0.34, 1.0, smoothstep(0.10, 0.62, v.y));",
    "    outCol = mix(outCol, plain, u_raw);",
    "    outA = mix(outA, u_fade * scrim, u_raw);",
    "  }",
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

  /* ── WHY SID COULD NOT SEE HIS VIDEO ───────────────────────────────────
     Four names were missing from this list: u_video, u_real, u_cover and
     u_pal. Every one of them is declared in the shader, written every frame,
     and was never once received.

     `gl.getUniformLocation` returns null for a name that is not in the list,
     and every `gl.uniform*` call with a null location is a silent no-op —
     WebGL's one genuinely dangerous piece of API design. So:

       · u_video and u_real kept their default sampler value of 0, which is
         the texture unit the glyph ATLAS is bound to. The field was not
         drawing itself from the footage, it was drawing itself from its own
         character sheet, and the hover window opened onto the same. That is
         the whole of "i dont see my video": there has been no path on which
         the film reached the screen since this file was written.
       · u_cover stayed (0, 0), so the aspect correction collapsed every
         sample to a single texel at the centre of the image.
       · u_pal stayed 0, so "everyclick let it change the styling and the
         vibe" advanced the drawing system and never the palette. Four of the
         five colourways have never been seen.

     Nothing errored, nothing warned, and every screenshot of this page for
     weeks looked plausible, because a field drawing itself from its own
     atlas still looks like a field. */
  var U = {};
  [
    "u_atlas",
    "u_video",
    "u_real",
    "u_res",
    "u_time",
    "u_n",
    "u_mode",
    "u_next",
    "u_blend",
    "u_light",
    "u_fade",
    "u_ptr",
    "u_cover",
    "u_shift",
    "u_raw",
    "u_ptrOn",
    "u_pal",
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
  /* ── THE OPENING IS A SEQUENCE NOW ──────────────────────────────────────
     Sid: "can we start with the pixelated video, the actual pixelated video?
     ... let that video play once, and then play the proper video without
     isolation and all the other effects that you have. basically, i want a
     little hierarchy in how we show information on the homepage."

     Three phases, and each one earns the next:

       0 PLATE     his own pixelated encode, full frame, no treatment at all.
                   It plays once and it is the first thing anyone sees.
       1 FILM      the clear take, also full frame, also untreated, for one
                   playthrough. The picture resolves.
       2 FIELD     only now do the five treatments come in, cross-fading over
                   1.5s, and only now does clicking change anything.

     The localStorage gate that made phase 0 a once-ever event is gone. It is
     the opening of the page; a page that opens differently depending on
     whether you have been before does not have an opening. */
  var phase = 0;
  var raw = 1; // 1 = the plate as itself, 0 = the treatments
  var filmDeadline = 0;

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
  var vPix = mkVideo(base + "/assets/video/sid_pixelated.mp4", false);
  if (vPix) {
    vPix.addEventListener("ended", function () {
      /* Phase 0 → 1. The clear take gets one full pass before anything is
         drawn over it; duration is read off the element, with a floor so a
         stalled metadata read cannot skip the phase entirely. */
      phase = 1;
      filmDeadline = performance.now() + Math.max(6000, (vClear.duration || 10) * 1000);
      /* Dropped from the DOM as well as from the draw, so a visitor who has
         seen it once is not decoding it for the rest of the session. */
      if (vPix.parentNode) vPix.parentNode.removeChild(vPix);
      vPix = null;
    });
  }

  /* How far right the plate sits, as a fraction of the frame. Read by both
     the cover clamp and the uniform. */
  var SHIFT = 0.11;

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
  var sys = Math.floor(Math.random() * 5),
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
        sysNext = (sys + 1 + Math.floor(Math.random() * 3)) % 5;
        sysBlend = 0.0001;
      }
    }

    gl.uniform2f(U.u_res, canvas.width, canvas.height);
    gl.uniform1f(U.u_time, reduce ? 0.0 : t);
    /* ── HOW FINE THE GRID IS ─────────────────────────────────────────────
       Sid: "can you increase the quality of that background video, or have
       you reduced the quality? i feel like its very low quality."

       Nothing was reduced — the plate is the same 1280x720 h264 it always
       was. What he was looking at is the grid: capped at 64 cells across the
       short edge, every face in that footage was being drawn with about
       forty dots, which is a resolution at which a person is a smudge. The
       cap is 132 now and the divisor is 9 rather than 15, so a 900px-tall
       hero draws 100 cells instead of 60 and the film reads as a film.

       It costs nothing: the cell count is a divisor inside the fragment
       shader, not a number of anything. Same one draw call either way. */
    gl.uniform1f(U.u_n, Math.max(40, Math.min(132, Math.round(Math.min(W, H) / 9))));
    gl.uniform1f(U.u_mode, mode);
    gl.uniform1f(U.u_next, next);
    gl.uniform1f(U.u_blend, blend > 0 ? Math.min(1, blend) : 0);
    gl.uniform1f(U.u_light, light);
    gl.uniform1f(U.u_fade, fade);
    /* Sid: "can you move my working video a little bit to the right so my
       face doesnt collide with the cube?" Sampling further left moves the
       image right. See SHIFT and the cover clamp above. */
    gl.uniform1f(U.u_shift, SHIFT);
    gl.uniform2f(U.u_ptr, pxN, pyN);
    gl.uniform1f(U.u_ptrOn, on);
    gl.uniform1f(U.u_sys, sys);
    gl.uniform1f(U.u_sysNext, sysNext);
    gl.uniform1f(U.u_sysBlend, sysBlend > 0 ? Math.min(1, sysBlend) : 0);
    gl.uniform1f(U.u_pal, pal);

    /* object-fit: cover in uv, so the footage crops rather than stretching. */
    var stageAspect = canvas.width / Math.max(1, canvas.height);
    var cx, cy;
    if (vidAspect > stageAspect) {
      cx = stageAspect / vidAspect;
      cy = 1.0;
    } else {
      cx = 1.0;
      cy = vidAspect / stageAspect;
    }
    /* ── THE SHIFT HAS TO FIT INSIDE THE PLATE ────────────────────────────
       Sliding the sampling window right by SHIFT pushes the left edge of the
       screen past uv.x = 0, and CLAMP_TO_EDGE answers that by repeating one
       column of pixels — which is the vertical smear that appeared down the
       left of the hero the moment the plate moved.

       The window has to be narrow enough that the whole shift stays on the
       film: uv.x is lowest at -cover.x/2 + 0.5 - SHIFT, so cover.x can be at
       most 1 - 2*SHIFT. Both axes scale together, otherwise fixing the smear
       would stretch the picture. */
    var lim = 1 - 2 * SHIFT;
    if (cx > lim) {
      cy *= lim / cx;
      cx = lim;
    }
    gl.uniform2f(U.u_cover, cx, cy);

    /* Phase 1 → 2 once the clear take has had its pass. */
    if (phase === 1 && filmDeadline && now > filmDeadline) phase = 2;
    /* Published so the cube guy can hold off until the plate has had the
       frame to itself. One number on window, read once a frame; the two
       canvases stay otherwise independent. */
    window.__fieldPhase = phase;
    /* 1.5s cross-fade from the plate into the treatments. */
    raw += ((phase === 2 ? 0 : 1) - raw) * 0.011;
    gl.uniform1f(U.u_raw, raw);

    upload(texVideo, vPix || vClear);
    upload(texReal, phase === 0 && vPix ? vPix : vClear);
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

    /* A verification hook, not a feature. Nothing on the page calls it and
     nothing renders because of it; it exists so a headless run can hold each
     treatment still and screenshot it, which is the only way to check that
     five states actually look like five states rather than trusting the
     code. No UI, no console output, no visible effect. */
    window.__fieldSetSys = function (n) {
      sys = (((n | 0) % 5) + 5) % 5;
      sysNext = sys;
      sysBlend = 0;
    };

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
      sysNext = (sys + 1 + Math.floor(Math.random() * 3)) % 5;
      sysBlend = 0.0001;
      pal = (pal + 1) % 5;
    });
  }

  raf = requestAnimationFrame(frame);
})();
