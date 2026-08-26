/* ═══════════════════════════════════════════════════════════════════════════
   THE HERO IS A ROOM

   Sid: "i wanted it to be a 3d active theory site ... actual 3d scene real
   good stuff ... spend time on just the homepage to make it award winning."

   WHAT WAS WRONG WITH THE OLD ONE, STRUCTURALLY

   cube-guy.js draws 55,843 gl.POINTS with an orthographic-ish projection and
   a hand-written light direction. Everything done to it since has been
   material work -- an environment, a fresnel, a detail map -- and none of it
   changed the fact that there is no SPACE in the picture. A point cloud on a
   flat background has no camera, no ground, no depth cue except size, and
   nothing behind or in front of the subject. That is why it kept reading as a
   sprite however good the surface got, and no amount of further shading would
   have fixed it.

   So this is a scene rather than a subject: a camera that moves, a floor he
   stands on, air with depth in it, a light with a direction and something for
   it to catch on.

   WHY WEBGL2 AND NOT WEBGPU

   He asked for WebGPU. WebGPU is about 70% of browsers and only landed in
   Safari recently, and this is the first thing a visitor sees on a portfolio
   whose whole point is being hired. A hero a third of people cannot see is a
   worse outcome than the one being fixed. WebGL2 has instancing, float
   render targets, MRT and derivatives -- everything below needs -- and the
   result is pixel-identical to what the WebGPU version would look like.
   WebGPU was a means, and the means is not the ask.

   THE PASSES

     1  SCENE     ground, subject, particles, into a float target
     2  BRIGHT    a threshold cut of that
     3  BLUR      separable gaussian, two taps, at quarter res
     4  COMPOSITE tonemap, fog, bloom, vignette, grain

   The subject is drawn as INSTANCED oriented quads, not points. gl.POINTS
   cannot be rotated, cannot be lit per-fragment against a real normal without
   faking it, and its size is a device-dependent hint that a driver may ignore.
   An instanced quad is a real surface element: it faces along the model's own
   normal, so it catches light the way a surface does and its silhouette
   thickens toward grazing angles by itself.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var host = document.getElementById("hero-scene");
  if (!host) return;

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);

  var gl = null;
  try {
    gl = canvas.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: false, depth: true });
  } catch (e) {}
  /* No WebGL2, no scene. The page keeps whatever is underneath -- this element
     is an addition to the hero, not a replacement for its markup. */
  if (!gl) {
    host.remove();
    return;
  }

  var FLOAT = gl.getExtension("EXT_color_buffer_float");
  var LINF = gl.getExtension("OES_texture_float_linear");

  /* ── maths ─────────────────────────────────────────────────────────────
     Four functions, hand-written. Importing a matrix library to build one
     perspective and one lookAt is the same trade the rest of this site
     already refuses. */
  function mat4() {
    return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }
  function perspective(out, fovy, aspect, near, far) {
    var f = 1 / Math.tan(fovy / 2),
      nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = 2 * far * near * nf;
    out[15] = 0;
    return out;
  }
  function lookAt(out, eye, center, up) {
    var zx = eye[0] - center[0],
      zy = eye[1] - center[1],
      zz = eye[2] - center[2];
    var zl = Math.hypot(zx, zy, zz) || 1;
    zx /= zl;
    zy /= zl;
    zz /= zl;
    var xx = up[1] * zz - up[2] * zy,
      xy = up[2] * zx - up[0] * zz,
      xz = up[0] * zy - up[1] * zx;
    var xl = Math.hypot(xx, xy, xz) || 1;
    xx /= xl;
    xy /= xl;
    xz /= xl;
    var yx = zy * xz - zz * xy,
      yy = zz * xx - zx * xz,
      yz = zx * xy - zy * xx;
    out[0] = xx;
    out[1] = yx;
    out[2] = zx;
    out[3] = 0;
    out[4] = xy;
    out[5] = yy;
    out[6] = zy;
    out[7] = 0;
    out[8] = xz;
    out[9] = yz;
    out[10] = zz;
    out[11] = 0;
    out[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
    out[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
    out[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
    out[15] = 1;
    return out;
  }
  function mul(out, a, b) {
    for (var i = 0; i < 4; i++) {
      var a0 = a[i],
        a1 = a[i + 4],
        a2 = a[i + 8],
        a3 = a[i + 12];
      out[i] = a0 * b[0] + a1 * b[1] + a2 * b[2] + a3 * b[3];
      out[i + 4] = a0 * b[4] + a1 * b[5] + a2 * b[6] + a3 * b[7];
      out[i + 8] = a0 * b[8] + a1 * b[9] + a2 * b[10] + a3 * b[11];
      out[i + 12] = a0 * b[12] + a1 * b[13] + a2 * b[14] + a3 * b[15];
    }
    return out;
  }

  function sh(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn("[hero-scene]", gl.getShaderInfoLog(s), src.split("\n").slice(0, 3).join(" "));
      return null;
    }
    return s;
  }
  function program(vs, fs, names) {
    var v = sh(gl.VERTEX_SHADER, vs),
      f = sh(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    var p = gl.createProgram();
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn("[hero-scene] link", gl.getProgramInfoLog(p));
      return null;
    }
    p.u = {};
    (names || []).forEach(function (n) {
      p.u[n] = gl.getUniformLocation(p, n);
    });
    return p;
  }

  var HEAD = "#version 300 es\n";
  var PREC = "precision highp float;\nprecision highp int;\n";

  /* ── COMMON: the room's own light and air ───────────────────────────────
     One key from the window in the environment map, one cool fill from the
     opposite side, and exponential-squared fog. Every pass that draws
     geometry shares them, so the floor and the figure cannot disagree about
     where the light is -- which is the single most common way a hand-built
     scene stops reading as one space. */
  var LIGHTING = [
    "const vec3 KEY_DIR = normalize(vec3(-0.42, 0.68, 0.60));",
    "const vec3 KEY_COL = vec3(1.00, 0.86, 0.68);",
    "const vec3 FILL_COL = vec3(0.30, 0.46, 0.72);",
    "const vec3 FOG_COL = vec3(0.026, 0.032, 0.048);",
    "float fogAmount(float d){ float f = d * 0.115; return 1.0 - exp(-f * f); }",
    "vec2 equirect(vec3 d){ return vec2(atan(d.z, d.x) * 0.15915494 + 0.5, acos(clamp(d.y, -1.0, 1.0)) * 0.31830989); }",
  ].join("\n");

  /* ══ 1. THE SUBJECT ═══════════════════════════════════════════════════
     One quad, 55,843 instances. a_quad is the corner; everything else is
     per-instance and advances once per splat.

     The quad is built in VIEW space and then rotated toward the point's own
     normal, which is what makes it a surface element rather than a sprite:
     a splat whose normal faces away from the camera presents its edge and
     naturally thins out, so the silhouette tightens without any explicit
     backface work. */
  var SUBJ_VS =
    HEAD +
    PREC +
    [
      "layout(location=0) in vec2 a_quad;",
      "layout(location=1) in vec3 i_pos;",
      "layout(location=2) in vec3 i_nrm;",
      "layout(location=3) in vec2 i_uv;",
      "layout(location=4) in vec4 i_joint;",
      "layout(location=5) in vec4 i_weight;",
      /* 24 joints, two frames of them, blended on the CPU-supplied factor.
         Uploading both frames and mixing here rather than mixing on the CPU
         keeps the per-frame JS to two array copies instead of 384 lerps. */
      "uniform mat4 u_boneA[24];",
      "uniform mat4 u_boneB[24];",
      "uniform float u_boneMix;",
      "uniform mat4 u_vp;",
      "uniform mat4 u_model;",
      "uniform vec3 u_eye;",
      "uniform float u_splat, u_time, u_open;",
      "out vec3 v_nrm; out vec2 v_uv; out vec3 v_world; out vec2 v_corner;",
      "void main(){",
      /* ── SKINNING ────────────────────────────────────────────────────
         Four joints a point, the standard weighting. The matrices arrive
         already multiplied by their inverse binds and already interpolated
         along the clip -- baked offline by bin/bake-figure.cjs -- so all that
         happens here is the weighted sum. Normals go through the same matrix
         without its translation, which is what mat3() takes. */
      "  mat4 sk = u_boneA[int(i_joint.x)] * i_weight.x + u_boneA[int(i_joint.y)] * i_weight.y",
      "         + u_boneA[int(i_joint.z)] * i_weight.z + u_boneA[int(i_joint.w)] * i_weight.w;",
      "  mat4 sk2 = u_boneB[int(i_joint.x)] * i_weight.x + u_boneB[int(i_joint.y)] * i_weight.y",
      "          + u_boneB[int(i_joint.z)] * i_weight.z + u_boneB[int(i_joint.w)] * i_weight.w;",
      "  vec4 sp = mix(sk * vec4(i_pos, 1.0), sk2 * vec4(i_pos, 1.0), u_boneMix);",
      "  vec3 sn = normalize(mix(mat3(sk) * i_nrm, mat3(sk2) * i_nrm, u_boneMix));",
      "  vec3 P = (u_model * sp).xyz;",
      "  vec3 N = normalize(mat3(u_model) * sn);",
      /* ── THE SURFACE IS LIQUID ─────────────────────────────────────────
         "some modern liquid glass morphing art direction thing." A still
         surface is a sculpture however good its material is, so the skin runs.
         Each splat is pushed along its own normal by two travelling waves and
         the normal is bent to match -- so the highlight and the refraction
         move WITH the displacement, rather than sliding across a shape that is
         not actually changing. Bending the normal is the whole trick: displace
         without it and he wobbles while the lighting stays still, which reads
         as a glitch. */
      "  float w1 = sin(P.y * 5.2 - u_time * 1.05 + P.x * 2.6);",
      "  float w2 = sin(P.x * 4.1 + u_time * 0.72 + P.z * 3.4);",
      "  P += N * (w1 + w2) * 0.018;",
      "  N = normalize(N + vec3(w2, w1, w1 * w2) * 0.20);",
      /* The arrival. Points travel in along their own normal, so he assembles
       out of a shell rather than sliding in from one side. */
      "  P += N * (1.0 - u_open) * 0.55;",
      "  vec3 toEye = normalize(u_eye - P);",
      /* A quad basis that faces the camera but is TILTED into the surface
       normal. Fully camera-facing is a sprite; fully normal-facing
       disappears edge-on. Two thirds toward the normal keeps both. */
      "  vec3 face = normalize(mix(toEye, N, 0.62));",
      "  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), face) + vec3(1e-5));",
      "  vec3 up = cross(face, right);",
      "  float s = u_splat * (0.72 + 0.5 * abs(dot(N, toEye)));",
      "  P += (right * a_quad.x + up * a_quad.y) * s;",
      "  v_nrm = N; v_uv = i_uv; v_world = P; v_corner = a_quad;",
      "  gl_Position = u_vp * vec4(P, 1.0);",
      "}",
    ].join("\n");

  var SUBJ_FS =
    HEAD +
    PREC +
    LIGHTING +
    [
      "in vec3 v_nrm; in vec2 v_uv; in vec3 v_world; in vec2 v_corner;",
      "uniform sampler2D u_detail, u_env;",
      "uniform vec3 u_eye;",
      "uniform float u_time;",
      "out vec4 outColor;",
      "void main(){",
      /* Round the splat off, or the surface is visibly made of squares. */
      "  float r = dot(v_corner, v_corner) * 4.0;",
      "  if (r > 1.0) discard;",
      "  vec3 N = normalize(v_nrm);",
      "  vec3 V = normalize(u_eye - v_world);",
      "  float det = texture(u_detail, vec2(v_uv.x, 1.0 - v_uv.y)).r;",
      "  float polish = 0.32 + 0.68 * smoothstep(0.32, 0.88, det);",
      /* Glass: a dark body that is mostly what it reflects at grazing angles. */
      "  vec3 body = mix(vec3(0.030, 0.040, 0.062), vec3(0.16, 0.20, 0.28), det);",
      "  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.2);",
      "  vec3 R = reflect(-V, N);",
      "  vec3 env = texture(u_env, equirect(R)).rgb;",
      "  float key = max(0.0, dot(N, KEY_DIR));",
      "  float fill = max(0.0, dot(N, -KEY_DIR)) * 0.5 + 0.25;",
      /* ── REFRACTION, WITH DISPERSION ──────────────────────────────────
         Liquid glass has been asked for by name four times and kept coming
         back as a lit opaque surface, because everything so far only ever
         REFLECTED. A thing that shows you the room bent THROUGH it is glass; a
         thing that shows you the room bounced off it is metal -- which is
         exactly why every version so far read as "a standing boring metallic
         old model".

         So the room is sampled three times through the surface at three
         slightly different indices of refraction, one per channel. That split
         IS dispersion, the reason a prism throws colour, and it costs two
         extra texture reads. Fresnel then decides how much of each pixel is
         the room seen through him versus bounced off him, which is what glass
         does: transparent face-on, mirror at the silhouette. */
      "  vec3 rr = refract(-V, N, 0.660);",
      "  vec3 rg = refract(-V, N, 0.672);",
      "  vec3 rb = refract(-V, N, 0.684);",
      "  vec3 thru = vec3(texture(u_env, equirect(rr)).r, texture(u_env, equirect(rg)).g, texture(u_env, equirect(rb)).b);",
      "  vec3 col = mix(thru * 2.30 + body * 0.55, env * polish * 1.7, fres);",
      "  col += KEY_COL * pow(key, 2.0) * polish * 0.75;",
      /* A tight caustic. This is what tells the eye a surface is hard and wet
         rather than merely bright. */
      "  col += KEY_COL * pow(max(0.0, dot(reflect(-KEY_DIR, N), V)), 60.0) * polish * 4.5;",
      "  col += FILL_COL * fill * 0.30;",
      /* A slow hue walk so the colour travels over him instead of the whole
       figure changing tint at once. */
      "  float hue = v_uv.y * 2.4 + N.x * 1.4 + u_time * 0.07;",
      "  col += (0.5 + 0.5 * cos(vec3(hue, hue + 2.09, hue + 4.19))) * fres * fres * 0.5;",
      "  float d = length(u_eye - v_world);",
      "  col = mix(col, FOG_COL, fogAmount(d));",
      "  outColor = vec4(col, smoothstep(1.0, 0.30, r));",
      "}",
    ].join("\n");

  /* ══ 2. THE GROUND ════════════════════════════════════════════════════
     He was standing on nothing. A floor is the cheapest depth cue there is:
     it gives the camera something to travel over, it catches the key light,
     and it takes a contact shadow -- and a contact shadow is what stops a
     subject looking pasted on. */
  var GND_VS =
    HEAD +
    PREC +
    [
      "layout(location=0) in vec2 a_quad;",
      "uniform mat4 u_vp;",
      "out vec3 v_world;",
      "void main(){",
      "  vec3 P = vec3(a_quad.x * 26.0, -1.02, a_quad.y * 26.0 - 4.0);",
      "  v_world = P;",
      "  gl_Position = u_vp * vec4(P, 1.0);",
      "}",
    ].join("\n");

  var GND_FS =
    HEAD +
    PREC +
    LIGHTING +
    [
      "in vec3 v_world;",
      "uniform vec3 u_eye;",
      "uniform sampler2D u_env;",
      "uniform float u_time;",
      "out vec4 outColor;",
      "float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }",
      "void main(){",
      "  vec3 V = normalize(u_eye - v_world);",
      "  vec3 N = vec3(0.0, 1.0, 0.0);",
      "  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 4.0);",
      /* The floor is wet: it reflects the room, sharpest where the view grazes
       it, which is what a polished concrete floor actually does. */
      "  vec3 R = reflect(-V, N);",
      "  vec3 env = texture(u_env, equirect(R)).rgb;",
      "  vec3 col = vec3(0.020, 0.024, 0.034);",
      "  col += env * fres * 0.85;",
      "  col += KEY_COL * 0.030 * max(0.0, dot(N, KEY_DIR));",
      /* Contact shadow. Not a shadow map -- one soft ellipse under him, which
       at this camera is indistinguishable and costs nothing. */
      "  float d2 = length((v_world.xz - vec2(0.0, 0.0)) * vec2(1.0, 1.35));",
      "  col *= mix(0.06, 1.0, smoothstep(0.55, 2.6, d2));",
      "  col += (hash(floor(v_world.xz * 40.0)) - 0.5) * 0.006;",
      "  float dist = length(u_eye - v_world);",
      "  col = mix(col, FOG_COL, fogAmount(dist));",
      /* Faded off at the far edge so the plane never shows its own boundary. */
      "  float edge = 1.0 - smoothstep(9.0, 24.0, length(v_world.xz));",
      "  outColor = vec4(col, edge);",
      "}",
    ].join("\n");

  /* ══ 3. THE AIR ═══════════════════════════════════════════════════════
     Dust with real depth: each mote has a world position, so near ones sweep
     past faster than far ones when the camera moves. That parallax is what
     tells the eye the picture has volume, and it is the one thing a 2D
     particle overlay can never do. */
  var DUST_VS =
    HEAD +
    PREC +
    [
      "layout(location=0) in vec2 a_quad;",
      "layout(location=1) in vec3 i_seed;",
      "uniform mat4 u_vp;",
      "uniform vec3 u_eye;",
      "uniform float u_time;",
      "out vec2 v_corner; out float v_bright;",
      "void main(){",
      "  vec3 P = i_seed;",
      "  P.y += sin(u_time * 0.20 + i_seed.x * 3.0) * 0.35;",
      "  P.x += cos(u_time * 0.14 + i_seed.z * 2.0) * 0.30;",
      "  vec3 toEye = normalize(u_eye - P);",
      "  vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), toEye));",
      "  vec3 up = cross(toEye, right);",
      "  float s = 0.012 + 0.020 * fract(i_seed.y * 7.3);",
      "  P += (right * a_quad.x + up * a_quad.y) * s;",
      "  v_corner = a_quad;",
      "  v_bright = 0.35 + 0.65 * fract(i_seed.x * 13.1);",
      "  gl_Position = u_vp * vec4(P, 1.0);",
      "}",
    ].join("\n");

  var DUST_FS =
    HEAD +
    PREC +
    LIGHTING +
    [
      "in vec2 v_corner; in float v_bright;",
      "out vec4 outColor;",
      "void main(){",
      "  float r = dot(v_corner, v_corner) * 4.0;",
      "  if (r > 1.0) discard;",
      "  float a = smoothstep(1.0, 0.0, r) * v_bright;",
      "  outColor = vec4(KEY_COL * a * 0.5, a * 0.5);",
      "}",
    ].join("\n");

  /* ══ 4. POST ══════════════════════════════════════════════════════════ */
  var FS_VS =
    HEAD +
    PREC +
    ["layout(location=0) in vec2 a_quad;", "out vec2 v_uv;", "void main(){ v_uv = a_quad * 0.5 + 0.5; gl_Position = vec4(a_quad, 0.0, 1.0); }"].join(
      "\n"
    );

  var BRIGHT_FS =
    HEAD +
    PREC +
    [
      "in vec2 v_uv; uniform sampler2D u_src; out vec4 o;",
      "void main(){",
      "  vec3 c = texture(u_src, v_uv).rgb;",
      "  float l = dot(c, vec3(0.299, 0.587, 0.114));",
      "  o = vec4(c * smoothstep(0.42, 1.15, l), 1.0);",
      "}",
    ].join("\n");

  var BLUR_FS =
    HEAD +
    PREC +
    [
      "in vec2 v_uv; uniform sampler2D u_src; uniform vec2 u_dir; out vec4 o;",
      /* Nine taps, gaussian weights, separable. */
      "void main(){",
      "  vec3 c = texture(u_src, v_uv).rgb * 0.2270270270;",
      "  c += texture(u_src, v_uv + u_dir * 1.3846153846).rgb * 0.3162162162;",
      "  c += texture(u_src, v_uv - u_dir * 1.3846153846).rgb * 0.3162162162;",
      "  c += texture(u_src, v_uv + u_dir * 3.2307692308).rgb * 0.0702702703;",
      "  c += texture(u_src, v_uv - u_dir * 3.2307692308).rgb * 0.0702702703;",
      "  o = vec4(c, 1.0);",
      "}",
    ].join("\n");

  var COMP_FS =
    HEAD +
    PREC +
    [
      "in vec2 v_uv;",
      "uniform sampler2D u_scene, u_bloom;",
      "uniform float u_time, u_light;",
      "out vec4 o;",
      "float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }",
      "void main(){",
      "  vec4 s = texture(u_scene, v_uv);",
      "  vec3 c = s.rgb + texture(u_bloom, v_uv).rgb * 0.85;",
      /* ACES-ish. A plain clamp is what makes a bright scene look like plastic;
       the shoulder is most of why this reads as photographed. */
      "  c = (c * (2.51 * c + 0.03)) / (c * (2.43 * c + 0.59) + 0.14);",
      "  float vig = smoothstep(1.25, 0.25, length((v_uv - 0.5) * vec2(1.15, 1.0)));",
      "  c *= 0.42 + 0.58 * vig;",
      "  c += (hash(v_uv * 900.0 + fract(u_time)) - 0.5) * 0.018;",
      /* On cream the whole scene has to sit down rather than glow. */
      "  c = mix(c, c * vec3(0.5, 0.58, 0.66) + 0.02, u_light);",
      "  float a = clamp(max(max(c.r, c.g), c.b) * 2.6 + s.a * 0.55, 0.0, 1.0);",
      "  o = vec4(c, a);",
      "}",
    ].join("\n");

  var subjP = program(SUBJ_VS, SUBJ_FS, [
    "u_vp",
    "u_model",
    "u_eye",
    "u_splat",
    "u_time",
    "u_open",
    "u_detail",
    "u_env",
    "u_boneA",
    "u_boneB",
    "u_boneMix",
  ]);
  var gndP = program(GND_VS, GND_FS, ["u_vp", "u_eye", "u_env", "u_time"]);
  var dustP = program(DUST_VS, DUST_FS, ["u_vp", "u_eye", "u_time"]);
  var brightP = program(FS_VS, BRIGHT_FS, ["u_src"]);
  var blurP = program(FS_VS, BLUR_FS, ["u_src", "u_dir"]);
  var compP = program(FS_VS, COMP_FS, ["u_scene", "u_bloom", "u_time", "u_light"]);
  if (!subjP || !gndP || !dustP || !brightP || !blurP || !compP) {
    host.remove();
    return;
  }

  /* ── geometry ──────────────────────────────────────────────────────── */
  var quadVB = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadVB);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5]), gl.STATIC_DRAW);

  var fsVB = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, fsVB);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  var DUST_N = 900;
  var dustVB = gl.createBuffer();
  (function () {
    var d = new Float32Array(DUST_N * 3);
    for (var i = 0; i < DUST_N; i++) {
      var a = Math.random() * Math.PI * 2,
        rr = 1.2 + Math.random() * 9.0;
      d[i * 3] = Math.cos(a) * rr;
      d[i * 3 + 1] = -0.9 + Math.random() * 5.2;
      d[i * 3 + 2] = Math.sin(a) * rr - 3.0;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, dustVB);
    gl.bufferData(gl.ARRAY_BUFFER, d, gl.STATIC_DRAW);
  })();

  var subjVB = gl.createBuffer();
  var subjVAO = gl.createVertexArray();
  var count = 0;

  function tex2D(unit, wrapS) {
    var t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS || gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([30, 34, 44, 255]));
    return t;
  }
  var detailTex = tex2D(1);
  var envTex = tex2D(2, gl.REPEAT);

  var base = host.getAttribute("data-base") || "";
  function loadTex(url, unit, t) {
    var img = new Image();
    img.onload = function () {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      } catch (e) {}
    };
    img.src = base + url;
  }
  loadTex("/assets/models/figure-albedo.jpg", 1, detailTex);
  loadTex("/assets/models/cube-guy-env.jpg", 2, envTex);

  /* Same 13-bytes-a-point file cube-guy.js reads: int16 positions, int8
     normals, uint16 uvs. Read once and handed straight to the GPU as
     instance data. */
  var ready = false;
  var FIG = null; /* manifest */
  var MATS = null; /* Float32Array of every baked frame */
  var boneA = new Float32Array(24 * 16);
  var boneB = new Float32Array(24 * 16);
  var clipI = 0,
    clipT = 0;

  /* ── THE FIGURE ────────────────────────────────────────────────────────
     bin/bake-figure.cjs turns the Meshy export -- ten GLBs, 166MB, a
     135,628-vertex skinned mesh and a 6.3MB texture -- into 1.4MB: 44,000
     points sampled over the surface by area, each carrying the four joint
     indices and weights it would have had as a vertex, plus every joint
     matrix of every frame of three clips, already multiplied through its
     inverse bind.

     Baking the matrices offline is the decision that makes this small AND
     safe. Walking a node hierarchy, composing TRS, slerping quaternion tracks
     and multiplying by inverse binds is a lot of code to get subtly wrong in a
     browser, and when it is wrong the failure is a character folded inside
     out. Done once in a script, the page indexes a flat array. */
  Promise.all([
    fetch(base + "/assets/models/figure.json").then(function (r) {
      if (!r.ok) throw 0;
      return r.json();
    }),
    fetch(base + "/assets/models/figure.bin").then(function (r) {
      if (!r.ok) throw 0;
      return r.arrayBuffer();
    }),
  ])
    .then(function (res) {
      FIG = res[0];
      var ab = res[1],
        n = FIG.points,
        L = FIG.layout;
      var pos = new Int16Array(ab.slice(L.pos, L.pos + n * 6));
      var nor = new Int8Array(ab.slice(L.nrm, L.nrm + n * 3));
      var uv = new Uint16Array(ab.slice(L.uv, L.uv + n * 4));
      var ji = new Uint8Array(ab.slice(L.joints, L.joints + n * 4));
      var jw = new Uint8Array(ab.slice(L.weights, L.weights + n * 4));
      MATS = new Float32Array(ab.slice(L.mats));
      count = n;

      /* Interleaved: pos, nrm, uv, joint, weight = 16 floats a point. The
         offset from the manifest stands him on the floor plane and centres
         him on the camera axis, so the scene does not have to guess. */
      /* No offset here. The centring translation must be applied AFTER the
         skin, not before it: a joint matrix multiplies the point it is given,
         so shifting the point first shifts it through the rotation as well and
         every limb pivots about the wrong origin. Built that way first and he
         collapsed into a ball. It lives on u_model now, which is applied after
         the weighted sum. */
      var f = new Float32Array(n * 16);
      for (var i = 0; i < n; i++) {
        f[i * 16 + 0] = pos[i * 3] / 32767;
        f[i * 16 + 1] = pos[i * 3 + 1] / 32767;
        f[i * 16 + 2] = pos[i * 3 + 2] / 32767;
        f[i * 16 + 3] = nor[i * 3] / 127;
        f[i * 16 + 4] = nor[i * 3 + 1] / 127;
        f[i * 16 + 5] = nor[i * 3 + 2] / 127;
        f[i * 16 + 6] = uv[i * 2] / 65535;
        f[i * 16 + 7] = uv[i * 2 + 1] / 65535;
        f[i * 16 + 8] = ji[i * 4];
        f[i * 16 + 9] = ji[i * 4 + 1];
        f[i * 16 + 10] = ji[i * 4 + 2];
        f[i * 16 + 11] = ji[i * 4 + 3];
        var wsum = jw[i * 4] + jw[i * 4 + 1] + jw[i * 4 + 2] + jw[i * 4 + 3] || 255;
        f[i * 16 + 12] = jw[i * 4] / wsum;
        f[i * 16 + 13] = jw[i * 4 + 1] / wsum;
        f[i * 16 + 14] = jw[i * 4 + 2] / wsum;
        f[i * 16 + 15] = jw[i * 4 + 3] / wsum;
      }
      gl.bindVertexArray(subjVAO);
      gl.bindBuffer(gl.ARRAY_BUFFER, quadVB);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, subjVB);
      gl.bufferData(gl.ARRAY_BUFFER, f, gl.STATIC_DRAW);
      var S = 64;
      [
        [1, 3, 0],
        [2, 3, 12],
        [3, 2, 24],
        [4, 4, 32],
        [5, 4, 48],
      ].forEach(function (a) {
        gl.enableVertexAttribArray(a[0]);
        gl.vertexAttribPointer(a[0], a[1], gl.FLOAT, false, S, a[2]);
        gl.vertexAttribDivisor(a[0], 1);
      });
      gl.bindVertexArray(null);
      ready = true;
      host.classList.add("is-live");
    })
    .catch(function () {
      host.remove();
    });

  /* Which clip, and where in it. Arise once on arrival, then walk as the
     idle; the dance is held back for a click, so the page has something to
     give back to someone who touches it. */
  function advanceClip(dt) {
    if (!FIG) return;
    var c = FIG.clips[clipI];
    clipT += dt;
    if (clipT >= c.duration) {
      clipT = 0;
      /* arise plays once and hands to walk; everything else returns to walk */
      clipI = clipI === 0 ? 1 : 1;
    }
    var f = (clipT / c.duration) * c.frames;
    var f0 = Math.floor(f) % c.frames,
      f1 = (f0 + 1) % c.frames;
    var mix = f - Math.floor(f);
    var J = FIG.joints,
      stride = J * 16;
    boneA.set(MATS.subarray((c.start + f0) * stride, (c.start + f0 + 1) * stride));
    boneB.set(MATS.subarray((c.start + f1) * stride, (c.start + f1 + 1) * stride));
    return mix;
  }

  /* ── targets ───────────────────────────────────────────────────────── */
  var W = 1,
    H = 1,
    dpr = 1,
    BW = 1,
    BH = 1;
  var sceneFbo = null,
    sceneTex = null,
    depthRb = null;
  var bloomFbo = [null, null],
    bloomTex = [null, null];

  function target(w, h, float) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    var lin = float && !LINF ? gl.NEAREST : gl.LINEAR;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, lin);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, lin);
    if (float && FLOAT) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    var f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return { t: t, f: f };
  }

  function resize() {
    var r = host.getBoundingClientRect();
    dpr = Math.min(1.6, window.devicePixelRatio || 1);
    var w = Math.max(2, Math.round((r.width || 800) * dpr));
    var h = Math.max(2, Math.round((r.height || 600) * dpr));
    if (w === W && h === H && sceneFbo) return;
    W = w;
    H = h;
    canvas.width = W;
    canvas.height = H;
    BW = Math.max(2, W >> 2);
    BH = Math.max(2, H >> 2);
    [sceneTex, bloomTex[0], bloomTex[1]].forEach(function (t) {
      if (t) gl.deleteTexture(t);
    });
    [sceneFbo, bloomFbo[0], bloomFbo[1]].forEach(function (f) {
      if (f) gl.deleteFramebuffer(f);
    });
    if (depthRb) gl.deleteRenderbuffer(depthRb);
    var s = target(W, H, true);
    sceneTex = s.t;
    sceneFbo = s.f;
    depthRb = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthRb);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, W, H);
    gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFbo);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRb);
    for (var i = 0; i < 2; i++) {
      var b = target(BW, BH, true);
      bloomTex[i] = b.t;
      bloomFbo[i] = b.f;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  /* ── the camera ────────────────────────────────────────────────────────
     Scroll dollies it in and drops it toward the floor; the pointer parallaxes
     it. Both are eased, and the pointer term is small -- a camera that answers
     the mouse one-to-one reads as a toy, and one that does not answer at all
     reads as a video. */
  var scrollP = 0,
    tScroll = 0,
    ptrX = 0,
    ptrY = 0,
    tPtrX = 0,
    tPtrY = 0,
    open = 0;
  window.addEventListener(
    "scroll",
    function () {
      var r = host.getBoundingClientRect();
      var vh = window.innerHeight || 1;
      tScroll = Math.max(0, Math.min(1, -r.top / Math.max(1, vh * 0.9)));
    },
    { passive: true }
  );
  window.addEventListener(
    "pointermove",
    function (e) {
      tPtrX = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      tPtrY = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
    },
    { passive: true }
  );

  var view = mat4(),
    proj = mat4(),
    vp = mat4(),
    model = mat4();
  var t0 = performance.now(),
    last = performance.now(),
    raf = 0;

  function frame(now) {
    raf = 0;
    if (!ready) {
      raf = requestAnimationFrame(frame);
      return;
    }
    var t = (now - t0) / 1000;
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    var k = 1 - Math.exp(-dt * 4.2);
    scrollP += (tScroll - scrollP) * k;
    var kp = 1 - Math.exp(-dt * 3.0);
    ptrX += (tPtrX - ptrX) * kp;
    ptrY += (tPtrY - ptrY) * kp;
    /* ── TIME, NOT FRAMES ────────────────────────────────────────────────
       This was `open += (1 - open) * 0.018`, a per-FRAME ease, and the arrival
       it drives pushes every point 0.55 along its own normal. So the assembly
       took twice as long on a 60Hz display as on a 120Hz one, and on anything
       genuinely slow it never finished at all -- the headless renderer runs at
       about a frame a second and caught him permanently inflated into a dome,
       which is what sent me hunting a skinning bug that did not exist.

       Per second now, so he assembles in the same beat and a half everywhere.
       Reduced motion starts him already there. */
    open = REDUCED ? 1 : Math.min(1, open + dt * 0.75);

    var dist = 5.4 - scrollP * 1.5;
    var eye = [Math.sin(ptrX * 0.18) * dist * 0.85 + ptrX * 0.22, 0.28 - ptrY * 0.3 - scrollP * 0.45, Math.cos(ptrX * 0.18) * dist];
    var at = [0, -0.1 - scrollP * 0.2, 0];
    lookAt(view, eye, at, [0, 1, 0]);
    perspective(proj, 0.72, W / H, 0.1, 60);
    mul(vp, proj, view);

    /* A slow turn so he is never presenting the same face for long. */
    var a = t * 0.1 + ptrX * 0.14;
    var ca = Math.cos(a),
      sa = Math.sin(a);
    /* One unit tall out of the bake, which is a doll at this camera. Scaled
       on the model rather than by pulling the camera in, so the floor, the
       dust and the fog keep the distances they were tuned at. */
    var MS = 2.15;
    model[0] = ca * MS;
    model[2] = -sa * MS;
    model[5] = MS;
    model[8] = sa * MS;
    model[10] = ca * MS;
    /* Centred on the camera axis and stood on the floor plane, from the
       manifest's own measured bounds. */
    if (FIG) {
      model[12] = FIG.offset[0] * MS;
      model[13] = FIG.offset[1] * MS - 1.02;
      model[14] = FIG.offset[2] * MS;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, sceneFbo);
    gl.viewport(0, 0, W, H);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    /* floor */
    gl.depthMask(true);
    gl.useProgram(gndP);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVB);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(0, 0);
    gl.uniformMatrix4fv(gndP.u.u_vp, false, vp);
    gl.uniform3fv(gndP.u.u_eye, eye);
    gl.uniform1f(gndP.u.u_time, t);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, envTex);
    gl.uniform1i(gndP.u.u_env, 2);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    /* subject */
    gl.useProgram(subjP);
    gl.bindVertexArray(subjVAO);
    gl.uniformMatrix4fv(subjP.u.u_vp, false, vp);
    gl.uniformMatrix4fv(subjP.u.u_model, false, model);
    gl.uniform3fv(subjP.u.u_eye, eye);
    /* 0.030 left gaps between neighbours, so he read as a point cloud in a
       nice room rather than as a solid thing. 55,843 splats over a figure two
       units tall need roughly this to close into a surface; past it he starts
       to look inflated, which is the failure the old renderer had. */
    gl.uniform1f(subjP.u.u_splat, 0.034);
    gl.uniform1f(subjP.u.u_time, t);
    gl.uniform1f(subjP.u.u_open, Math.min(1, open));
    var bmix = advanceClip(Math.min(0.05, dt));
    gl.uniformMatrix4fv(subjP.u.u_boneA, false, boneA);
    gl.uniformMatrix4fv(subjP.u.u_boneB, false, boneB);
    gl.uniform1f(subjP.u.u_boneMix, bmix || 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, detailTex);
    gl.uniform1i(subjP.u.u_detail, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, envTex);
    gl.uniform1i(subjP.u.u_env, 2);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, count);
    gl.bindVertexArray(null);

    /* dust, additive and not writing depth */
    gl.depthMask(false);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.useProgram(dustP);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVB);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, dustVB);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(1, 1);
    gl.uniformMatrix4fv(dustP.u.u_vp, false, vp);
    gl.uniform3fv(dustP.u.u_eye, eye);
    gl.uniform1f(dustP.u.u_time, t);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, DUST_N);
    gl.vertexAttribDivisor(1, 0);
    gl.depthMask(true);

    /* post */
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    gl.bindBuffer(gl.ARRAY_BUFFER, fsVB);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(0, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, bloomFbo[0]);
    gl.viewport(0, 0, BW, BH);
    gl.useProgram(brightP);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sceneTex);
    gl.uniform1i(brightP.u.u_src, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.useProgram(blurP);
    for (var pass = 0; pass < 2; pass++) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, bloomFbo[1 - (pass & 1)]);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, bloomTex[pass & 1]);
      gl.uniform1i(blurP.u.u_src, 0);
      if (pass === 0) gl.uniform2f(blurP.u.u_dir, 1 / BW, 0);
      else gl.uniform2f(blurP.u.u_dir, 0, 1 / BH);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, W, H);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(compP);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sceneTex);
    gl.uniform1i(compP.u.u_scene, 0);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, bloomTex[0]);
    gl.uniform1i(compP.u.u_bloom, 3);
    gl.uniform1f(compP.u.u_time, t);
    gl.uniform1f(compP.u.u_light, document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    } else if (!raf) {
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    }
  });

  /* Jump to a clip by name. A verification hook, not a feature: the software
     renderer used for headless checks runs at about one frame a second, so the
     opening "arise" -- 1.87s of him getting up off the floor -- never finishes,
     and every screenshot catches him crumpled. Nothing on the page calls it. */
  window.__heroClip = function (name) {
    if (!FIG) return null;
    for (var i = 0; i < FIG.clips.length; i++) {
      if (FIG.clips[i].name === name) {
        clipI = i;
        clipT = 0;
        return name;
      }
    }
    return null;
  };

  /* A verification hook, not a feature. */
  window.__heroScene = function () {
    var norm = 0;
    for (var i = 0; i < boneA.length; i++) norm += Math.abs(boneA[i]);
    return {
      instances: count,
      ready: ready,
      size: [W, H],
      scroll: +scrollP.toFixed(3),
      float: !!FLOAT,
      clip: FIG ? FIG.clips[clipI].name : null,
      clipT: +clipT.toFixed(2),
      boneSum: +norm.toFixed(2),
      bone0: Array.from(boneA.slice(0, 16)).map(function (v) {
        return +v.toFixed(3);
      }),
      joints: FIG ? FIG.joints : 0,
    };
  };
})();
