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
      depth: false,
      premultipliedAlpha: false,
      powerPreference: "low-power",
    });
  } catch (e) {
    gl = null;
  }
  /* No context: the canvas stays empty and the hero is what it was before
     him. Nothing else on the page depends on this running. */
  if (!gl) return;

  var VS = [
    "precision highp float;",
    "attribute vec3 p;",
    "uniform mat3 u_rot;",
    "uniform float u_time, u_hov, u_size, u_aspect, u_dpr, u_scan;",
    "varying float v_depth;",
    "varying float v_rand;",

    /* One hash per point, off its own position, so the scatter is stable
       between frames — a per-frame random would boil rather than drift. */
    "float hash(vec3 q) {",
    "  return fract(sin(dot(q, vec3(12.9898, 78.233, 37.719))) * 43758.5453);",
    "}",

    "void main() {",
    /* Blender is Z-up and WebGL is Y-up. Swapping here rather than in the
       exported data keeps the .bin in the model's own frame, so a re-export
       does not need this file changed. */
    "  vec3 pos = vec3(p.x, p.z, p.y);",
    "  float n = hash(p);",
    "  v_rand = n;",

    /* THE COMING APART. Each point drifts along its own fixed direction, at
       its own rate, so the cloud loosens instead of inflating. */
    "  vec3 dir = normalize(vec3(sin(n * 41.3) , cos(n * 27.7), sin(n * 13.1)) + 0.0001);",
    "  float breathe = 0.55 + 0.45 * sin(u_time * 0.7 + n * 24.0);",
    "  pos += dir * u_hov * (0.018 + 0.085 * n) * breathe;",

    /* THE BAND. A thin horizontal sweep that pushes what it touches outward
       from the axis — the thing that makes it read as being scanned rather
       than as simply expanding. */
    "  float band = smoothstep(0.10, 0.0, abs(pos.y - u_scan));",
    "  pos += normalize(pos + 0.0001) * band * u_hov * 0.07;",

    "  vec3 r = u_rot * pos;",
    /* Camera at z = 3.1. A real divide, not an orthographic squash: the
        near shoulder has to actually be bigger than the far one or none of
        this reads as depth. */
    "  float z = r.z + 3.1;",
    "  float f = 2.62;",
    "  gl_Position = vec4((r.x * f / z) / u_aspect, (r.y * f / z), 0.0, 1.0);",
    "  gl_PointSize = u_size * u_dpr * (2.15 / z) * (0.72 + 0.56 * n);",
    /* 1 at the nearest surface, 0 at the furthest. This single number is the
       whole image. */
    "  v_depth = clamp((4.1 - z) / 2.0, 0.0, 1.0);",
    "}",
  ].join("\n");

  var FS = [
    "precision highp float;",
    "uniform vec3 u_near, u_far;",
    "uniform float u_hov, u_fade, u_light;",
    "varying float v_depth;",
    "varying float v_rand;",
    "void main() {",
    /* Round points with a soft edge. Square points at this size read as a
       screen door over the figure. */
    "  vec2 c = gl_PointCoord - 0.5;",
    "  float d = dot(c, c);",
    "  if (d > 0.25) discard;",
    "  float soft = smoothstep(0.25, 0.02, d);",

    "  float t = pow(v_depth, 1.35);",
    "  vec3 col = mix(u_far, u_near, t);",
    /* Coming apart splits the palette: the points that have travelled
       furthest go coldest, so the cloud reads as losing its surface. */
    "  col = mix(col, mix(col, u_near, 0.75), u_hov * v_rand);",

    "  float a = soft * u_fade * mix(0.50 + 0.50 * t, 0.66 + 0.34 * t, u_light);",
    "  a *= mix(1.0, 0.86, u_hov);",
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
  ["u_rot", "u_time", "u_hov", "u_size", "u_aspect", "u_dpr", "u_scan", "u_near", "u_far", "u_fade", "u_light"].forEach(function (k) {
    U[k] = gl.getUniformLocation(prog, k);
  });
  var aP = gl.getAttribLocation(prog, "p");

  var buf = gl.createBuffer();
  var count = 0;
  var ready = false;

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);

  /* ── theme ────────────────────────────────────────────────────────────
     Two palettes, and the blend mode changes with them. Additive is what
     makes a point cloud glow on a dark ground, and it is also what turns a
     cream page into a white rectangle, so the light theme composites
     normally and paints dark points instead. */
  var light = false;
  function readTheme() {
    light = document.documentElement.getAttribute("data-theme") === "light";
    if (light) {
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform3f(U.u_near, 0.05, 0.06, 0.09);
      gl.uniform3f(U.u_far, 0.62, 0.64, 0.68);
      gl.uniform1f(U.u_light, 1);
    } else {
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.uniform3f(U.u_near, 0.72, 0.83, 1.0);
      gl.uniform3f(U.u_far, 0.11, 0.17, 0.32);
      gl.uniform1f(U.u_light, 0);
    }
  }
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
      var raw = new Int16Array(ab);
      count = (raw.length / 3) | 0;
      /* Uploaded as int16 and scaled in the shader would save the copy, but
         WebGL1 has no integer attributes to normalise from, so the expansion
         happens once here rather than per frame. */
      var f = new Float32Array(raw.length);
      for (var i = 0; i < raw.length; i++) f[i] = raw[i] / 32767;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, f, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(aP);
      gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 0, 0);
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

  host.addEventListener("pointerenter", function (e) {
    if (e.pointerType === "touch") return;
    hovTarget = 1;
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
        yaw += 0.0016;
      }
      pitch += (0.05 - pitch) * 0.012;
    }

    /* 1.4s each way. The easing is on the value rather than on a CSS
       transition because it drives a shader, and Sid asked for slow. */
    var target = REDUCED ? 0 : hovTarget;
    hov += (target - hov) * 0.018;
    fade += (1 - fade) * 0.04;

    setRot(yaw, pitch);
    gl.uniformMatrix3fv(U.u_rot, false, rot);
    gl.uniform1f(U.u_time, t);
    gl.uniform1f(U.u_hov, hov);
    gl.uniform1f(U.u_fade, fade);
    /* The band travels the height of the figure and wraps, a shade slower
       than the drift so the two never lock into a rhythm. */
    gl.uniform1f(U.u_scan, ((t * 0.24) % 2.4) - 1.2);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, count);
  }
  requestAnimationFrame(frame);
})();
