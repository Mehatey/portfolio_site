/* ─────────────────────────────────────────────────────────────────────────
   THE CUBE GUY, AS A DEPTH MAP

   Sid: "what if we have him in the centre in depth map and controllable
   interactive when u hover on him to slowly with a cool shader do something
   to it."

   The source is cube_guy_blender.glb, 27MB — 335k skinned vertices with
   normals, UVs, joints and weights, and a 1.8MB texture. None of that can go
   on a homepage, and a depth map wants none of it either: it is positions and
   a camera. So the model is sampled offline to 55,843 points, normalised into
   a unit box and quantised to int16, which is 336KB — about 1.2% of the GLB,
   and less than the two hero videos that were already there.

   Everything below is raw WebGL for the same reason home-field.js is: this
   page has no bundler, and a 600KB three.js to draw gl.POINTS with one
   attribute would be the largest thing on the site by a wide margin.

   Three states, and they are meant to be read in this order:

     · at rest      he turns slowly, shaded by distance from the camera —
                    near points bright and large, far ones dim and small. The
                    depth IS the image; there is no lighting model.
     · under the hand  drag to turn him, with inertia. This is the "controllable"
                    part, and it takes over from the idle spin rather than
                    fighting it.
     · on hover     over ~1.4s the cloud comes apart: every point drifts along
                    its own axis, a band sweeps him top to bottom pushing
                    points out along their normal from centre, and the palette
                    splits toward the near colour. Let go and it reassembles
                    over the same 1.4s. Slow on purpose — Sid asked for slow,
                    and a fast version of this reads as a glitch rather than
                    as something being taken apart.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var canvas = document.getElementById("cg-gl");
  if (!canvas) return;
  var host = canvas.parentNode;

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var gl = null;
  try {
    gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: true,
      premultipliedAlpha: false,
      powerPreference: "low-power",
    });
  } catch (e) {
    gl = null;
  }
  /* No context: the canvas stays empty and the hero is what it was before
     him. Nothing else on the page depends on this running. */
  if (!gl) return;

  /* ── ONE BUFFER, TWO PASSES ──────────────────────────────────────────────
     Sid: "i was mentioning hover on the cube, and then it shows only that
     area in a cool, flowy brush shader type shit. It reveals the actual
     model below it."

     So the hover is no longer something that happens to the whole figure. A
     brush follows the pointer across him, and inside it the cloud closes into
     the model itself — lit, solid, opaque — while everything outside stays
     the sparse depth map. Wiping the pointer across his chest paints the
     surface in and lets it fade out behind you.

     That needs the two halves composited differently, and no single draw call
     can do both: a surface wants alpha over the nearest fragment, a point
     cloud wants additive accumulation, and a cloud drawn additively over a
     surface is a fog. So the same buffer is drawn twice.

       PASS 1  the solid. Alpha blended, depth written, alpha faded to zero
               outside the brush so the rest of the figure never enters the
               depth buffer at all.
       PASS 2  the cloud. Additive, depth TESTED but not written, so particles
               behind the revealed surface are correctly hidden by it, and
               faded out inside the brush where the solid has taken over.

     Which is also why the context now asks for a depth buffer and why
     gl_Position.z carries real view depth rather than 0.

     The brush edge is warped by the point's own hash and by a slow sine, so
     it is a wet edge that crawls rather than a circle — the "flowy" part. */
  var VS = [
    "precision highp float;",
    "attribute vec3 p;",
    "attribute vec3 nrm;",
    "attribute vec2 uv;",
    "uniform mat3 u_rot;",
    "uniform float u_time, u_hov, u_size, u_aspect, u_dpr, u_scan, u_pass, u_brushR, u_scroll, u_grow;",
    "uniform vec2 u_ptr;",
    "varying float v_depth;",
    "varying float v_rand;",
    "varying float v_brush;",
    "varying float v_lit;",
    "varying vec2 v_scr;",
    "varying vec2 v_uv;",

    /* One hash per point, off its own position, so the scatter is stable
       between frames — a per-frame random would boil rather than drift. */
    "float hash(vec3 q) {",
    "  return fract(sin(dot(q, vec3(12.9898, 78.233, 37.719))) * 43758.5453);",
    "}",

    "void main() {",
    /* Blender is Z-up and WebGL is Y-up. Swapping here rather than in the
       exported data keeps the .bin in the model's own frame, so a re-export
       does not need this file changed. */
    /* ── THE HANDOFF ─────────────────────────────────────────────────────
       Sid: "when you scroll, i was thinking maybe the cube can get bigger and
       rotate, then sort of dissolve into the cube we have below."

       u_scroll is 0 while the hero is at rest and 1 by the time the cube
       section is arriving. Three things ride it: the camera pushes in
       (u_grow), the idle turn accelerates (in JS, so the drag inertia still
       composes with it), and the figure is squared off — every point is
       pulled toward the surface of a box, so he does not shrink away or
       explode, he BECOMES a cube, and hands the shape to the real one
       underneath as it comes up the page. */
    "  vec3 pos = vec3(p.x, p.z, p.y);",
    "  float sq = smoothstep(0.30, 0.92, u_scroll);",
    "  vec3 boxed = clamp(pos * 1.35, vec3(-0.34), vec3(0.34));",
    "  pos = mix(pos, boxed, sq);",
    "  vec3 nor = normalize(vec3(nrm.x, nrm.z, nrm.y) + 0.0001);",
    "  float n = hash(p);",
    "  v_rand = n;",

    /* The idle loosening. Small, and now only OUTSIDE the brush — it is what
       the revealed surface is being revealed out of. */
    "  vec3 dir = normalize(vec3(sin(n * 41.3), cos(n * 27.7), sin(n * 13.1)) + 0.0001);",
    "  float breathe = 0.55 + 0.45 * sin(u_time * 0.7 + n * 24.0);",
    "  float band = smoothstep(0.10, 0.0, abs(pos.y - u_scan));",

    "  vec3 r = u_rot * pos;",
    "  vec3 rn = u_rot * nor;",
    "  float z = r.z + 3.1;",
    /* 2.28 rather than 2.62: the figure sits inside its own canvas with air
       under the feet, so the hero's overflow:hidden has nothing of him to
       cut. */
    "  float f = 2.28 * u_grow;",
    "  vec2 ndc = vec2((r.x * f / z) / u_aspect, r.y * f / z);",

    /* ── THE BRUSH ────────────────────────────────────────────────────────
       Distance from the pointer in screen space, warped per point so the
       boundary is a wet edge rather than a circle. u_hov eases the radius
       from nothing, so it opens under the hand instead of snapping on. */
    "  float bd = length((ndc - u_ptr) * vec2(u_aspect, 1.0));",
    "  bd += (n - 0.5) * 0.17 + sin(pos.y * 9.0 + u_time * 0.9) * 0.055 + sin(pos.x * 13.0 - u_time * 0.7) * 0.045 + sin(pos.z * 7.0 + u_time * 0.5) * 0.03;",
    "  float R = u_brushR * u_hov;",
    "  float brush = R > 0.001 ? smoothstep(R, R * 0.35, bd) : 0.0;",
    "  v_brush = brush;",

    /* Loosen only what the brush has not claimed. */
    "  float loose = (1.0 - brush) * u_hov;",
    "  pos += dir * loose * (0.018 + 0.085 * n) * breathe;",
    "  pos += normalize(pos + 0.0001) * band * loose * 0.07;",
    "  r = u_rot * pos;",
    "  z = r.z + 3.1;",
    "  ndc = vec2((r.x * f / z) / u_aspect, r.y * f / z);",

    /* One key light, fixed in view space so turning him turns the shading
       rather than dragging the light around with him. */
    "  v_lit = 0.16 + 0.84 * max(0.0, dot(rn, normalize(vec3(-0.52, 0.55, 0.66))));",

    /* Depth is written by the solid pass and tested by the cloud, so it has
       to be a real number, not 0. Mapped to roughly the volume the figure
       occupies. */
    "  gl_Position = vec4(ndc, clamp((z - 1.8) / 2.6, -0.99, 0.99), 1.0);",
    /* Screen-space uv for the reveal's texture. Sampling the plate where the
       point LANDS rather than by any model uv means the footage sits still in
       the frame while he turns through it — the surface reads as a window cut
       into the film, which is the effect Sid is after, and it costs one
       varying. */
    "  v_scr = ndc * 0.5 + 0.5;",
    "  v_uv = uv;",

    /* Inside the brush the points grow until they overlap into a surface.
       That is the whole trick: no mesh is shipped, the solid is 55,843 points
       drawn large enough to close. */
    "  float grow = 1.0 + 3.6 * brush;",
    "  gl_PointSize = u_size * u_dpr * (2.15 / z) * (0.72 + 0.56 * n) * grow;",
    "  v_depth = clamp((4.1 - z) / 2.0, 0.0, 1.0);",
    "}",
  ].join("\n");

  var FS = [
    "precision highp float;",
    "uniform vec3 u_near, u_far;",
    "uniform float u_hov, u_fade, u_light, u_pass, u_scroll, u_texMode, u_hasTex, u_hasSkin, u_time;",
    "uniform sampler2D u_tex, u_skin;",
    "uniform vec2 u_texCover;",
    "varying float v_depth;",
    "varying float v_rand;",
    "varying float v_brush;",
    "varying float v_lit;",
    "varying vec2 v_scr;",
    "varying vec2 v_uv;",
    "void main() {",
    "  vec2 c = gl_PointCoord - 0.5;",
    "  float d = dot(c, c);",
    "  if (d > 0.25) discard;",

    "  float t = pow(v_depth, 1.35);",

    "  if (u_pass > 0.5) {",
    /* THE SOLID. A hard-edged disc, because a soft one leaves the surface
       looking like felt; the overlap between neighbours does the smoothing.
       Lit by the normal, with the depth map still tinting it so the revealed
       figure belongs to the same picture as the cloud around it. */
    "    if (v_brush < 0.02) discard;",
    "    vec3 lit = mix(u_far * 0.9, u_near, clamp(t * 0.24 + v_lit * 0.86 - 0.06, 0.0, 1.0));",
    "    lit *= 0.66 + 0.52 * v_lit;",

    /* ── FIVE MATERIALS, NOT FIVE FILTERS ────────────────────────────────
       Sid: "doesnt the cube have some material of its own. also all the
       materials other than the gray one kind of just look like glass and
       reflect my video ... i told u no chromatic aberration ... every hover
       once i leave and back should be a vividly different cube texture and
       material."

       Every one of them was the SAME operation — his footage sampled in
       screen space and tinted — which is exactly why they all read as glass:
       a surface that shows you what is behind it is glass, whatever you do to
       the pixels afterwards. Four filters over one reflection is not four
       materials.

       So the first thing that had to exist is the model's own skin. The GLB
       ships a 4096 base-colour texture and the extractor was throwing it away
       along with the UVs; both are here now (1024 JPEG, 157KB, and 4 bytes of
       uv a point), so his actual painted surface is material 0 and the
       default.

       The other four are lit surfaces with their own optical behaviour, not
       screen-space samples:

         0 SKIN     the model's own texture, lit. What he is actually made of.
         1 CHALK    matte, unlit-looking, dusty. No specular at all.
         2 METAL    hard fresnel rim, dark body, no texture — a cast object.
         3 IRIDESCENT  hue rotates with the viewing angle, like oil or beetle
                    shell. Reads as coloured without sampling anything.
         4 FILM     the one that DOES take his footage, kept because it is a
                    good idea once rather than five times.

       Chromatic aberration is gone. */
    "    vec3 mat;",
    "    float m = u_texMode;",
    "    float fres = pow(1.0 - clamp(v_lit, 0.0, 1.0), 2.2);",
    "    if (m < 0.5 && u_hasSkin > 0.5) {",
    "      vec3 skin = texture2D(u_skin, vec2(v_uv.x, 1.0 - v_uv.y)).rgb;",
    "      mat = skin * (0.34 + 1.05 * v_lit);",
    "    } else if (m < 1.5) {",
    /* chalk: heavy ambient, no highlight, a little grain off the point hash */
    "      float ch = 0.62 + 0.38 * v_lit;",
    "      mat = vec3(0.82, 0.80, 0.76) * ch * (0.9 + 0.2 * v_rand);",
    "    } else if (m < 2.5) {",
    /* metal: dark body, bright rim, tight highlight */
    "      float spec = pow(clamp(v_lit, 0.0, 1.0), 9.0);",
    "      mat = mix(vec3(0.06, 0.07, 0.09), vec3(0.62, 0.68, 0.78), fres * 0.9) + spec * 0.85;",
    "    } else if (m < 3.5) {",
    /* iridescent: angle-driven hue, no sampling at all */
    "      float a2 = fres * 3.4 + v_lit * 1.6;",
    "      mat = 0.5 + 0.5 * cos(vec3(a2, a2 + 2.09, a2 + 4.19));",
    "      mat *= 0.42 + 0.72 * v_lit;",
    "    } else if (u_hasTex > 0.5) {",
    "      vec2 tuv = (v_scr - 0.5) * u_texCover + 0.5;",
    "      vec3 tex = texture2D(u_tex, vec2(tuv.x, 1.0 - tuv.y)).rgb;",
    "      mat = clamp((pow(tex, vec3(0.8)) - 0.5) * 1.2 + 0.5, 0.0, 1.0) * (0.5 + 0.85 * v_lit);",
    "    } else {",
    "      mat = vec3(0.74, 0.78, 0.86) * (0.4 + 0.9 * v_lit);",
    "    }",
    "    lit = mix(lit, mat, 0.9);",
    /* Hard-edged disc — the overlap between neighbours does the smoothing;
       a soft one leaves the surface looking like felt. Faded out by the
       brush at its edge and by the scroll handoff at the end. */
    "    float a = smoothstep(0.25, 0.19, d) * smoothstep(0.01, 0.16, v_brush) * u_fade * (1.0 - smoothstep(0.55, 0.95, u_scroll));",
    "    gl_FragColor = vec4(lit, a);",
    "    return;",
    "  }",

    /* THE CLOUD. As before, minus whatever the brush has taken. */
    "  float soft = smoothstep(0.25, 0.02, d);",
    "  vec3 col = mix(u_far, u_near, t);",
    "  col = mix(col, mix(col, u_near, 0.75), u_hov * v_rand * (1.0 - v_brush));",
    "  float a = soft * u_fade * mix(0.50 + 0.50 * t, 0.66 + 0.34 * t, u_light);",
    "  a *= mix(1.0, 0.86, u_hov) * (1.0 - v_brush);",
    /* Gone by the time the real cube is on screen, so the two are never both
       claiming to be the object. */
    "  a *= 1.0 - smoothstep(0.62, 1.0, u_scroll);",
    "  gl_FragColor = vec4(col, a);",
    "}",
  ].join("\n");

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

  var vs = sh(gl.VERTEX_SHADER, VS);
  var fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;
  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog));
    return;
  }
  gl.useProgram(prog);

  var U = {};
  [
    "u_rot",
    "u_time",
    "u_hov",
    "u_size",
    "u_aspect",
    "u_dpr",
    "u_scan",
    "u_near",
    "u_far",
    "u_fade",
    "u_light",
    "u_pass",
    "u_ptr",
    "u_brushR",
    "u_scroll",
    "u_grow",
    "u_tex",
    "u_texMode",
    "u_hasTex",
    "u_texCover",
    "u_skin",
    "u_hasSkin",
  ].forEach(function (k) {
    U[k] = gl.getUniformLocation(prog, k);
  });
  var aP = gl.getAttribLocation(prog, "p");
  var aN = gl.getAttribLocation(prog, "nrm");
  var aUV = gl.getAttribLocation(prog, "uv");

  var buf = gl.createBuffer();
  var count = 0;
  var ready = false;

  gl.enable(gl.BLEND);

  /* ── theme ────────────────────────────────────────────────────────────
     Two palettes, and the blend mode changes with them. Additive is what
     makes a point cloud glow on a dark ground, and it is also what turns a
     cream page into a white rectangle, so the light theme composites
     normally and paints dark points instead. */
  var light = false;
  /* The cloud's blend mode, pulled out of readTheme because the solid pass
     sets its own and the cloud has to be able to put this one back every
     frame. */
  function setBlend() {
    if (light) gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    else gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  }
  function readTheme() {
    light = document.documentElement.getAttribute("data-theme") === "light";
    if (light) {
      gl.uniform3f(U.u_near, 0.05, 0.06, 0.09);
      gl.uniform3f(U.u_far, 0.62, 0.64, 0.68);
      gl.uniform1f(U.u_light, 1);
    } else {
      gl.uniform3f(U.u_near, 0.72, 0.83, 1.0);
      gl.uniform3f(U.u_far, 0.11, 0.17, 0.32);
      gl.uniform1f(U.u_light, 0);
    }
    setBlend();
  }
  /* ── THE PLATE, BORROWED ────────────────────────────────────────────────
     home-field already has his footage decoding in a <video> for the hero
     background. Reusing that element rather than mounting a second one means
     the reveal costs a texture upload and not another 2.2MB decode — two
     contexts can read the same video element, they just cannot share the
     texture object. If the field is not running (no WebGL there, or the
     element has not appeared yet) the reveal falls back to the clay render,
     which is what it was before. */
  var plate = null;
  var plateTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, plateTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([20, 24, 32, 255]));

  function findPlate() {
    if (plate && plate.readyState >= 2) return plate;
    var vids = document.querySelectorAll("#field-stage video");
    for (var i = 0; i < vids.length; i++) {
      if (vids[i].readyState >= 2 && vids[i].videoWidth) {
        plate = vids[i];
        return plate;
      }
    }
    return null;
  }

  /* The model's own base colour, downscaled from the GLB's 4096 to 1024. */
  var skinTex = gl.createTexture();
  var hasSkin = 0;
  gl.bindTexture(gl.TEXTURE_2D, skinTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([120, 120, 124, 255]));
  (function () {
    var img = new Image();
    img.onload = function () {
      gl.bindTexture(gl.TEXTURE_2D, skinTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      hasSkin = 1;
    };
    img.src = (canvas.getAttribute("data-base") || "") + "/assets/models/cube-guy-albedo.jpg";
  })();

  /* Material 0 is his own skin, and it is where he starts. After that every
     arrival steps to a different one — never the same twice running, which
     is what "vividly different" needs more than any amount of contrast. */
  var texMode = 0;

  readTheme();
  new MutationObserver(readTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* ── size ─────────────────────────────────────────────────────────────
     DPR capped at 2. 55k points at 3x on a 5K display is four million
     fragments a frame to draw something the size of a postcard. */
  var dpr = 1;
  var W = 1;
  var H = 1;
  function resize() {
    var r = host.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(1, Math.round(r.width * dpr));
    H = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== W || canvas.height !== H) {
      canvas.width = W;
      canvas.height = H;
    }
    gl.viewport(0, 0, W, H);
    gl.uniform1f(U.u_aspect, r.width / Math.max(1, r.height));
    gl.uniform1f(U.u_dpr, dpr);
    gl.uniform1f(U.u_size, Math.max(1.8, Math.min(4.0, r.width / 250)));
  }
  window.addEventListener("resize", resize);

  /* ── the data ─────────────────────────────────────────────────────────── */
  var base = canvas.getAttribute("data-base") || "";
  fetch(base + "/assets/models/cube-guy-points.bin")
    .then(function (r) {
      if (!r.ok) throw new Error("cube guy: " + r.status);
      return r.arrayBuffer();
    })
    .then(function (ab) {
      /* The file is positions then normals: N*3 int16, then N*3 int8. Nine
         bytes a point against twenty-four for two float32 triples, which is
         the difference between 503KB and 1.3MB. */
      var n = (ab.byteLength / 13) | 0;
      count = n;
      var pos = new Int16Array(ab, 0, n * 3);
      var nor = new Int8Array(ab, n * 6, n * 3);
      /* sliced rather than viewed: a Uint16Array cannot start at an odd byte
         offset, and positions+normals come to n*9 bytes, which is odd for any
         odd n. The copy is 223KB once, at load. */
      var tex = new Uint16Array(ab.slice(n * 9, n * 9 + n * 4));

      /* Interleaved, so both attributes come off one buffer and one bind.
         Expanded to float once here rather than per frame — WebGL1 has no
         integer attribute to normalise from. */
      var f = new Float32Array(n * 8);
      for (var i = 0; i < n; i++) {
        f[i * 8] = pos[i * 3] / 32767;
        f[i * 8 + 1] = pos[i * 3 + 1] / 32767;
        f[i * 8 + 2] = pos[i * 3 + 2] / 32767;
        f[i * 8 + 3] = nor[i * 3] / 127;
        f[i * 8 + 4] = nor[i * 3 + 1] / 127;
        f[i * 8 + 5] = nor[i * 3 + 2] / 127;
        f[i * 8 + 6] = tex[i * 2] / 65535;
        f[i * 8 + 7] = tex[i * 2 + 1] / 65535;
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, f, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(aP);
      gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 32, 0);
      gl.enableVertexAttribArray(aN);
      gl.vertexAttribPointer(aN, 3, gl.FLOAT, false, 32, 12);
      if (aUV >= 0) {
        gl.enableVertexAttribArray(aUV);
        gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 32, 24);
      }
      ready = true;
      host.classList.add("is-live");
      resize();
    })
    .catch(function (e) {
      console.error(e);
    });

  /* ── control ──────────────────────────────────────────────────────────── */
  var yaw = 0.5;
  var pitch = 0.05;
  var velY = 0;
  var velX = 0;
  var dragging = false;
  var lastX = 0;
  var lastY = 0;
  var hov = 0;
  var hovTarget = 0;
  var scrollP = 0;
  var hero = host.closest("section") || host.parentElement;

  /* The brush needs the pointer in the same clip space the vertex shader
     projects into, so it is normalised against the stage's own box: -1..1
     across, +1 at the top. */
  var ptrX = 0;
  var ptrY = 0;

  host.addEventListener("pointerenter", function (e) {
    if (e.pointerType === "touch") return;
    hovTarget = 1;
    /* Advanced on the way in rather than on the way out, so the material has
       already changed by the time the brush opens. */
    texMode = (texMode + 1 + Math.floor(Math.random() * 4)) % 5;
  });
  host.addEventListener("pointermove", function (e) {
    if (e.pointerType === "touch") return;
    var b = host.getBoundingClientRect();
    ptrX = ((e.clientX - b.left) / Math.max(1, b.width)) * 2 - 1;
    ptrY = 1 - ((e.clientY - b.top) / Math.max(1, b.height)) * 2;
  });
  host.addEventListener("pointerleave", function () {
    hovTarget = 0;
  });

  host.addEventListener("pointerdown", function (e) {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    velY = 0;
    velX = 0;
    host.classList.add("is-turning");
    if (host.setPointerCapture) {
      try {
        host.setPointerCapture(e.pointerId);
      } catch (_) {}
    }
  });
  window.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var dx = e.clientX - lastX;
    var dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    velY = dx * 0.006;
    velX = dy * 0.004;
    yaw += velY;
    pitch = Math.max(-0.55, Math.min(0.55, pitch + velX));
  });
  function endDrag() {
    if (!dragging) return;
    dragging = false;
    host.classList.remove("is-turning");
  }
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  /* ── frame ────────────────────────────────────────────────────────────── */
  var t0 = performance.now();
  var fade = 0;
  var visible = true;
  var onScreen = true;

  if (window.IntersectionObserver) {
    new IntersectionObserver(
      function (es) {
        onScreen = es[0].isIntersecting;
      },
      { threshold: 0 }
    ).observe(host);
  }
  document.addEventListener("visibilitychange", function () {
    visible = !document.hidden;
  });

  var rot = new Float32Array(9);
  function setRot(y, x) {
    var cy = Math.cos(y),
      sy = Math.sin(y),
      cx = Math.cos(x),
      sx = Math.sin(x);
    /* Yaw about up, then pitch about the camera's right. Written out rather
       than multiplied at runtime — it is the same nine numbers every frame. */
    rot[0] = cy;
    rot[1] = sy * sx;
    rot[2] = -sy * cx;
    rot[3] = 0;
    rot[4] = cx;
    rot[5] = sx;
    rot[6] = sy;
    rot[7] = -cy * sx;
    rot[8] = cy * cx;
  }

  resize();

  function frame(now) {
    requestAnimationFrame(frame);
    if (!ready || !visible || !onScreen) return;

    var t = (now - t0) / 1000;

    if (!dragging) {
      /* Inertia first, then the idle turn takes back over once it has
         decayed — so a flick spins him and then hands him back rather than
         stopping dead. */
      if (Math.abs(velY) > 0.0002) {
        yaw += velY;
        velY *= 0.955;
      } else if (!REDUCED) {
        yaw += 0.0016 + 0.026 * scrollP * scrollP;
      }
      pitch += (0.05 - pitch) * 0.012;
    }

    /* 1.4s each way. The easing is on the value rather than on a CSS
       transition because it drives a shader, and Sid asked for slow. */
    var target = REDUCED ? 0 : hovTarget;
    hov += (target - hov) * 0.018;
    /* ── HE ARRIVES SECOND ────────────────────────────────────────────────
       The field opens on Sid's pixelated plate with the frame to itself
       (phase 0), then the clear take (phase 1), and only then does the figure
       fade up. Sid: "basically, i want a little hierarchy in how we show
       information on the homepage."

       Guarded so that if home-field never runs — no WebGL there, or the file
       fails — __fieldPhase stays undefined and he simply appears, rather than
       waiting forever for a sequence that is not coming. */
    var fp = window.__fieldPhase;
    var welcome = fp === undefined || fp >= 1;
    fade += ((welcome ? 1 : 0) - fade) * 0.03;

    setRot(yaw, pitch);
    gl.uniformMatrix3fv(U.u_rot, false, rot);
    gl.uniform1f(U.u_time, t);
    gl.uniform1f(U.u_hov, hov);
    gl.uniform2f(U.u_ptr, ptrX, ptrY);
    gl.uniform1f(U.u_brushR, 0.46);

    /* Uploaded only while the reveal is actually open — at rest this is a
       point cloud and there is nothing to texture. */
    var v = hov > 0.01 ? findPlate() : null;
    if (v) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, plateTex);
      try {
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v);
        gl.uniform1i(U.u_tex, 0);
        gl.uniform1f(U.u_hasTex, 1);
      } catch (e) {
        gl.uniform1f(U.u_hasTex, 0);
      }
      /* cover, so the plate is not stretched across a tall stage */
      var va = v.videoWidth / Math.max(1, v.videoHeight);
      var sa = canvas.width / Math.max(1, canvas.height);
      if (va > sa) gl.uniform2f(U.u_texCover, sa / va, 1);
      else gl.uniform2f(U.u_texCover, 1, va / sa);
    } else {
      gl.uniform1f(U.u_hasTex, 0);
    }
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, skinTex);
    gl.uniform1i(U.u_skin, 1);
    gl.uniform1f(U.u_hasSkin, hasSkin);
    gl.uniform1f(U.u_texMode, texMode);

    /* Progress through the hero, 0 at rest and 1 once it has scrolled by. The
       stage is absolutely positioned inside the hero, so it is already
       travelling up the page — this is what happens to him on the way. */
    var heroH = Math.max(1, hero ? hero.offsetHeight : window.innerHeight);
    var prog = Math.max(0, Math.min(1, (window.scrollY || 0) / heroH));
    scrollP += (prog - scrollP) * 0.12;
    gl.uniform1f(U.u_scroll, scrollP);
    gl.uniform1f(U.u_grow, 1 + 0.55 * scrollP);
    gl.uniform1f(U.u_fade, fade);
    /* The band travels the height of the figure and wraps, a shade slower
       than the drift so the two never lock into a rhythm. */
    gl.uniform1f(U.u_scan, ((t * 0.24) % 2.4) - 1.2);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /* PASS 1 — the solid, where the brush has claimed him. Alpha over, depth
       written, so the nearest surface wins and the cloud behind it cannot
       shine through. Skipped entirely when nothing is hovered, which is the
       common case and the whole cost of the feature. */
    if (hov > 0.004) {
      gl.uniform1f(U.u_pass, 1);
      gl.enable(gl.DEPTH_TEST);
      gl.depthMask(true);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.POINTS, 0, count);
    }

    /* PASS 2 — the cloud. Depth TESTED against what the solid just wrote but
       not written to, so particles behind the revealed surface are hidden by
       it while particles in front still accumulate. Blend mode is the
       theme's: additive glows on the dark page, normal composites on cream. */
    gl.uniform1f(U.u_pass, 0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(false);
    setBlend();
    gl.drawArrays(gl.POINTS, 0, count);
    gl.depthMask(true);
  }
  /* A verification hook, not a feature. Nothing calls it and nothing renders
     because of it; it lets a headless run hold each material still and
     screenshot it, which is the only way to check that five materials look
     like five materials rather than trusting the code. */
  window.__cgSetMat = function (m) {
    texMode = (((m | 0) % 5) + 5) % 5;
  };

  requestAnimationFrame(frame);
})();
