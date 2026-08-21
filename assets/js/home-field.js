/* ============================================================
   Homepage hero — THE FIELD.

   The visible source is the art-directed rooftop film. A second, hidden
   grayscale stream supplies per-pixel depth. The shader uses that depth for
   restrained cursor parallax, scroll drift and edge separation while keeping
   the original film recognisable. If WebGL or either texture fails, the
   colour video remains in the DOM as the complete fallback.
   ============================================================ */
(function () {
  "use strict";

  var stage = document.getElementById("field-stage");
  if (!stage) return;
  var canvas = document.getElementById("field-gl");
  if (!canvas) return;

  /* The colour plate is a complete fallback, not a loading placeholder. The
     conductor can still fade it when WebGL is unavailable, and the shader
     takes over only after both colour and depth frames have uploaded. */
  window.__fieldSetPresence = function (v) {
    stage.style.setProperty("--field-presence", Math.max(0, Math.min(1, +v || 0)).toFixed(3));
  };

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var gl = null;
  try {
    gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false });
  } catch (e) {
    gl = null;
  }
  if (!gl) return;

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
    "uniform sampler2D u_atlas, u_video, u_real, u_depth;",
    "uniform vec2 u_res;",
    "uniform float u_time, u_n, u_mode, u_next, u_blend, u_light, u_fade, u_sys, u_sysNext, u_sysBlend;",
    "uniform vec2 u_ptr, u_cover, u_parallax;",
    "uniform float u_shift, u_raw, u_reveal;",
    "uniform float u_ptrOn, u_pal, u_present, u_depthFx, u_scroll;",

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
    /* ── HOVERING DEVELOPS THE PICTURE ────────────────────────────────────
       Sid: "in the first pixel video let me hover on it and let it show the
       unpixelated video rather than not having anything."

       The two takes are the same shot, pixelated and clear. Before this the
       swap was purely temporal — the pixelated one played once, fired
       `ended`, and was removed from the DOM — so hovering during the only
       moment it is on screen did nothing at all.

       Now u_video always holds the pixelated take and u_real always holds
       the clear one, and this mixes between them. u_reveal is the pointer.
       Resolution is what the hover buys, which is the same gesture the
       portrait and the desk make elsewhere on the site: the picture comes
       into focus because you leaned in. */
    "vec3 plate(vec2 uv){",
    "  vec2 t = clamp(uv, 0.0, 1.0);",
    "  vec2 st = vec2(t.x, 1.0 - t.y);",
    "  float z = texture2D(u_depth, st).r;",
    "  vec2 shift = u_parallax * (z - 0.42) * u_depthFx * 0.026;",
    "  shift.y += (z - 0.46) * u_scroll * 0.045;",
    "  st = clamp(st + vec2(shift.x, -shift.y), vec2(0.004), vec2(0.996));",
    "  float split = (abs(z - 0.45) * u_depthFx + u_scroll) * 0.0018;",
    "  vec3 a = texture2D(u_video, st).rgb;",
    "  vec3 b = vec3(texture2D(u_real, st + vec2(split, 0.0)).r, texture2D(u_real, st).g, texture2D(u_real, st - vec2(split, 0.0)).b);",
    "  vec3 c = mix(a, b, max(u_reveal, u_depthFx * 0.72));",
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
    /* ── ONE MASK, TWO CONSUMERS ──────────────────────────────────────────
       There have always been two of these and they disagreed. `d` is the
       density the grid treatments draw from, and `quiet` is the alpha the
       plate treatments draw at; each carried its own hand-tuned vertical
       gradient, so a change to one silently left the other describing a
       composition that no longer existed. That is exactly what happened when
       the copy moved off the bottom edge — quiet was updated, this was not,
       and GLYPHS went on being gutted across the bottom two thirds for a
       headline that is not there any more.

       So the weighting is computed once, from where the type actually is, and
       both read it. Quieter under the two clauses at the margins and along
       the bottom edge where the live line sits; full strength through the
       middle column, which is the space the figure vacates.

       `d` gets a higher floor than `quiet` does, because density is what
       decides whether a mark is drawn at all: below about a third the ramp
       resolves to a space and the treatment stops being a picture and starts
       being a scattering of dots. */
    "  float sideQ = smoothstep(0.14, 0.42, abs(v.x - 0.5));",
    "  float footQ = smoothstep(0.24, 0.04, v.y);",
    "  float comp = (1.0 - 0.58 * sideQ) * (1.0 - 0.38 * footQ);",
    "  d *= mix(0.38, 1.0, comp);",
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

    /* Light was 0.22 against dark's 0.40 for the same reason filmA was cut:
       ink over cream reads heavier at equal alpha. That holds while the marks
       are a texture behind type and stops holding when they are the picture,
       and 0.22 left GLYPHS and EDGES as a grey haze on the light page. Cream
       now takes slightly MORE than the dark page, not less: the marks are
       drawn in a dark ink on a pale ground, which is the lower-contrast
       direction of the two at equal alpha. */
    "  float inkAmt = mix(0.40, 0.44, u_light) * u_fade * (0.3 + 0.7 * d);",

    /* The plate's own uv, cover-corrected and slid right. */
    "  vec2 uvP = (v - 0.5) * u_cover + 0.5 - vec2(u_shift, 0.0);",

    /* Under the pointer the film opens the rest of the way. Cream has
       nowhere to go but down, so the same film sits heavier on the light
       page at identical strength. */
    /* ── THE FILM IS A STATE NOW, NOT A WHISPER ───────────────────────────
       0.13 was the resting strength of footage that was only ever meant to
       sit UNDER a field of marks; the pointer term did the rest when someone
       leaned in. Two of the five treatments — TAPE and LIQUID — carry no
       marks at all and take their whole alpha from this number, so at 0.13
       they were drawing the photograph at three tenths of one, and on cream,
       where the 0.62 factor cut it again, at eight hundredths.

       Measured on the light page mid film beat: the hero was blank. The
       figure had dissolved on schedule and what replaced him was nothing, for
       six seconds, every lap.

       It is safe to raise because presence gates it: u_present is 0 for most
       of the cycle and this is multiplied through it, so a louder film is
       louder only in the beat that is meant to be film. The light-mode factor
       comes up too — 0.62 was set to stop a photograph washing out cream it
       was sitting behind, and it is not sitting behind anything now. */
    "  float filmA = (0.34 + 0.46 * u_ptrOn * smoothstep(0.50, 0.03, pd)) * mix(1.0, 0.78, u_light) * u_fade;",

    /* The three plate-handling treatments would otherwise print the footage
       at full strength straight through the headline. Same vertical falloff
       the density gets — and the same correction, see above. Lower floor
       again, because these carry the photograph rather than a mark derived
       from it. */
    /* ── THE FILM IS LOUDEST WHERE HE WAS ─────────────────────────────────
       This was a plain vertical gradient: quiet along the bottom, full
       strength at the top, because the headline used to sit in the bottom-
       left corner and the plate had to be held off it.

       The copy is not there any more. It is a clause at each margin on the
       vertical centre line, with one live line in the bottom-left corner, and
       the middle of the frame — the column the figure stands in — is the one
       region with nothing over it at any width.

       So the mask follows the composition instead of the old one. The film
       comes up strongest through the middle third and falls away under the
       two clauses and along the bottom edge, which does two jobs with one
       gradient: the type keeps its contrast, and the footage arrives out of
       exactly the space the figure just left rather than washing in over the
       whole screen. The handoff reads as a substitution.

       0.58 and 0.38 are weights, not cutoffs — the picture stays continuous
       across the frame. Cutting it would put a visible edge down both sides. */
    "  float quiet = comp * u_fade;",

    "  vec4 A = treat(int(u_sys), uvP, cuv, d, tint, filmA, inkAmt, u_time, quiet);",
    "  vec4 outv = A;",
    "  if (u_sysBlend > 0.001) {",
    "    vec4 B = treat(int(u_sysNext), uvP, cuv, d, tint, filmA, inkAmt, u_time, quiet);",

    /* ── THE CHANGE IS A DEVELOPING EDGE, NOT A DISSOLVE ──────────────────
       Sid: "the bg effects changing can we have a really nice animation or
       transition to the bg when it changes the effect or shader or filter."

       A straight mix() between two treatments is a cross-fade, and a
       cross-fade of two pictures of the same thing is a muddle: for the whole
       middle of it you are looking at 50% of each, which is neither, and the
       eye reads it as a smear rather than as a change.

       So the new treatment arrives across a WIPE. A diagonal front sweeps the
       frame, warped by the same fbm the field uses so the edge is torn rather
       than ruled, and the boundary carries a bright rim — the treatment
       develops the way a photograph does in a tray, edge first. Every pixel
       is fully one thing or fully the other; only the 4%-wide seam is a mix,
       and that seam is the animation. */
    "    float wipe = (v.x * 0.62 + v.y * 0.38);",
    "    wipe += (fbm(v * 3.1 + u_time * 0.05) - 0.5) * 0.28;",
    "    float front = u_sysBlend * 1.36 - 0.18;",
    "    float e = smoothstep(front - 0.04, front + 0.04, wipe);",
    "    outv = mix(B, A, e);",
    /* the rim: a thin bright line riding the front */
    "    float rim = smoothstep(0.055, 0.0, abs(wipe - front));",
    "    outv.rgb += tint * rim * 0.55 * u_fade;",
    "    outv.a = clamp(outv.a + rim * 0.30 * u_fade, 0.0, 1.0);",
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
    /* ── THE FIELD IS NOT ALWAYS ON ────────────────────────────────────
       u_present is the hero's own clock, written by home-hero.js. At 0 this
       whole canvas is transparent and the figure has the frame; at 1 the
       footage is the frame. It is applied to alpha rather than mixed toward
       the page colour so the hero's background shows through untouched —
       there is no grey plate half-drawn over the theme at the midpoint. */
    "  gl_FragColor = vec4(outCol, outA * u_present);",
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
    "u_depth",
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
    "u_parallax",
    "u_shift",
    "u_raw",
    "u_reveal",
    "u_ptrOn",
    "u_pal",
    "u_sys",
    "u_sysNext",
    "u_sysBlend",
    "u_present",
    "u_depthFx",
    "u_scroll",
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
  /* ── THE OPENING IS NOT THE FOOTAGE ANY MORE ────────────────────────────
     Sid: "maybe in the beginning we don't show my background videos with all
     those effects, and we start with the cube guy ... the background of me
     working shows up, but creatively and artfully done, because having the
     cube guy and background videos is a little too much."

     What was here was a three-phase opening that ran the other way round:
     PLATE, his pixelated encode full frame with no treatment for its whole
     ten seconds; then FILM, the clear take, also full frame, for another
     ten; and only at about twenty seconds did the treatments arrive and the
     figure fade up behind them. Measured on the live site, the first thing a
     visitor got was twenty seconds of video and no cube guy at all.

     So the sequence inverts and moves out of this file. The figure opens the
     page; home-hero.js decides when the footage is allowed in and for how
     long, and hands this file one number to obey. What is left here is the
     drawing — which is all this file was ever good at.

     u_raw is pinned to 0 for the same reason. It existed to show the plate
     with no treatment during phases 0 and 1, and there are no such phases
     now: when the film is on screen it is on screen AS the field, which is
     the "creatively and artfully done" half of the ask. The uniform stays
     because the shader branch is cheap and deleting it would take the plain
     plate out of reach for good.

     sid_pixelated.mp4 goes with the phases. It is a ten-second animation
     that opens on a black frame and resolves outward, which is an intro and
     nothing else; dropped into a cycle it would black the hero out every
     time the film came round. The arrival is the shader's job now, and the
     page carries 773KB less. */
  /* The new plate is already art-directed. Keep it legible as film and let
     depth, not a printed overlay, carry the interaction. */
  var raw = 1;

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

  /* ── THE FILM IS NOT NEEDED FOR SIX AND A HALF SECONDS ──────────────────
     2.1MB, and the largest asset on the page by some distance. It used to be
     mounted on the first frame because it WAS the first frame — the hero
     opened on the footage. It does not any more: home-hero.js holds the
     figure for 6.5s before the first handoff, and until then this canvas is
     drawn at zero presence.

     So it is created a second and a half in, which takes it out of the
     opening burst and leaves it competing with nothing while the point cloud
     and the albedo — the two things that ARE on screen at t=0 — land. Five
     seconds of headroom before the beat needs it, on any connection where the
     page was usable to begin with.

     `raf` and the draw loop do not wait for it: upload() returns false while
     readyState is low and the shader draws the field's own noise, which is
     what it does between frames anyway. */
  var base = stage.getAttribute("data-base") || "";
  var vClear = document.getElementById("field-video") || mkVideo(base + "/assets/video/sid_rooftop_4k.mp4", true);
  var vDepth = document.getElementById("field-depth") || mkVideo(base + "/assets/video/sid_rooftop_depth.mp4", true);
  [vClear, vDepth].forEach(function (video) {
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.play().catch(function () {});
  });

  /* How far right the plate sits, as a fraction of the frame. Read by both
     the cover clamp and the uniform. */
  /* Sid: "can you zoomout a bit for both videos its a little too zoomed in."

     Two numbers do this together. u_cover is the sampling window: bigger
     means MORE of the source is on screen, which is zooming out. But the
     window is clamped to 1 - 2*SHIFT so the rightward slide never runs off
     the plate and smears the left edge, and at SHIFT 0.11 that ceiling was
     0.78 — the clamp was the thing holding the crop tight.

     So the slide comes down to 0.06, which lifts the ceiling to 0.88, and
     ZOOM_OUT asks for 14% more frame. The result lands on the ceiling rather
     than above it: about 13% more of the shot on screen, both axes together
     so nothing stretches. */
  var SHIFT = 0;
  var ZOOM_OUT = 1;

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
    texReal = newTex(),
    texDepth = newTex();

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
    tOn = 0,
    /* Reveal is the eased pointer presence. It gets its own value rather
       than reusing `on` because `on` also drives the treatment window and
       snaps harder than a picture resolving should. */
    reveal = 0;
  var scrollFx = 0;
  var heroSection = stage.closest("section") || stage;
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

  /* Default 1: without a conductor the field behaves exactly as it did. */
  var pres = 1,
    presT = 1;

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
    var heroRect = heroSection.getBoundingClientRect();
    var scrollTarget = Math.max(0, Math.min(1, -heroRect.top / Math.max(1, heroRect.height * 0.72)));
    scrollFx += (scrollTarget - scrollFx) * (1 - Math.exp(-dt / 0.12));

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
        sysBlend += dt / 2.9;
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
    gl.uniform2f(U.u_parallax, (pxN - 0.5) * 2, (pyN - 0.5) * 2);
    gl.uniform1f(U.u_depthFx, reduce ? 0 : on);
    gl.uniform1f(U.u_scroll, reduce ? 0 : scrollFx);
    /* ── REVEAL IS PROXIMITY, NOT PRESENCE ────────────────────────────────
       First attempt keyed this to tOn, which is wrong here: the stage is the
       whole hero, so the pointer is inside it essentially always and the
       picture simply sat resolved. Nothing to reveal.

       So it is distance to the figure instead. The plate is slid right by
       SHIFT, so its centre is at 0.5 + SHIFT across; within about a fifth of
       the frame of that the take is fully clear, and by four tenths it is
       back to pixels. Moving toward him develops him, moving away lets him
       dissolve — which is the same "develop by moving through it" gesture
       the rest of this file is written around, and it means the resting
       state of the hero is the pixelated take, as intended.

       Developing in is slower than falling back out: leaning in resolves
       over about a second, leaving lets go in half that. */
    var rdx = pxN - (0.5 + SHIFT);
    var rdy = (pyN - 0.5) * 0.72; /* the frame is wider than it is tall */
    var rd = Math.sqrt(rdx * rdx + rdy * rdy);
    var rTarget = on ? Math.max(0, Math.min(1, (0.42 - rd) / 0.22)) : 0;
    reveal += (rTarget - reveal) * (rTarget > reveal ? 0.05 : 0.09);
    gl.uniform1f(U.u_reveal, reveal);
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
    cx *= ZOOM_OUT;
    cy *= ZOOM_OUT;
    var lim = 1 - 2 * SHIFT;
    if (cx > lim) {
      cy *= lim / cx;
      cx = lim;
    }
    gl.uniform2f(U.u_cover, cx, cy);

    gl.uniform1f(U.u_raw, raw);
    /* ── HOW MUCH OF THE FILM IS ALLOWED ────────────────────────────────
       presT is what home-hero.js asks for, pres is what the canvas is
       doing. The rise is slower than the fall for the same reason the
       figure's dissolve is: arriving is the beat you watch and leaving is
       the one that should get out of the way of what follows.

       Guarded so that if the conductor never runs — its file fails, or the
       markup it needs is not there — presT stays at its default of 1 and
       the hero is simply the field, which is what it was before any of
       this. It never gets stuck on an invisible canvas. */
    /* Fast, because the SHAPE of the fade is the conductor's job and this is
       only here to keep a jump from ever reaching the shader. At 0.018 the
       two easings compounded and the film did not arrive until the figure
       had already gone — measured mid-dissolve at melt 0.35 the frame was
       empty, which is a hole in the middle of the one beat that is supposed
       to be a handoff. */
    pres += (presT - pres) * (presT > pres ? 0.1 : 0.13);
    gl.uniform1f(U.u_present, fade * pres);

    /* One plate in both slots. u_reveal still mixes between them, which is
       now a mix of a thing with itself: a no-op that costs one texture
       lookup and keeps plate() and the reveal maths intact for whenever a
       second take exists again. The alternative was pulling u_real out of
       four places in the shader to save nothing measurable. */
    if (vClear.readyState >= 2 && vDepth.readyState >= 2 && !vDepth.seeking && Math.abs(vDepth.currentTime - vClear.currentTime) > 0.075) {
      vDepth.currentTime = vClear.currentTime;
    }
    var colorReady = upload(texVideo, vClear);
    upload(texReal, vClear);
    var depthReady = upload(texDepth, vDepth);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texVideo);
    gl.uniform1i(U.u_video, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texReal);
    gl.uniform1i(U.u_real, 2);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, texDepth);
    gl.uniform1i(U.u_depth, 3);
    if (colorReady && depthReady) stage.classList.add("is-gl", "is-depth");

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
  var heroEl = heroSection;
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

  /* ── THE SEAM WITH THE CONDUCTOR ────────────────────────────────────────
     Two functions and nothing else. home-hero.js says how present the film
     should be and, when a new beat starts, asks for a different drawing —
     so the footage is never twice the same picture two beats running. The
     wipe that carries that change is the one the auto clock already uses. */
  window.__fieldSetPresence = function (v) {
    presT = Math.max(0, Math.min(1, +v || 0));
    stage.style.setProperty("--field-presence", presT.toFixed(3));
  };
  window.__fieldNewLook = function () {
    if (reduce) return;
    sysNext = (sys + 1 + Math.floor(Math.random() * 3)) % 5;
    sysBlend = 0.0001;
    pal = (pal + 1 + Math.floor(Math.random() * 3)) % 5;
    nextSys = performance.now() + SYS_EVERY;
  };
  window.__fieldReady = true;

  raf = requestAnimationFrame(frame);
})();
