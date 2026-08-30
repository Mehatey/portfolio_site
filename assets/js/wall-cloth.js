/* ═══════════════════════════════════════════════════════════════════════════
   THE WALL IS CLOTH

   Sid: "dont add any zoom effect to the image and do some warping so it feels
   like 3d spherical and more interactive maybe like cloth and smaller and
   placed on the page with no dissolve or scale or nothing."

   Every instruction here is a removal except one. The picture was arriving:
   it scaled from 1.08, translated up seven viewport-heights' worth, and faded
   in on its own scroll term. Three simultaneous entrance animations on a
   photograph, which is what makes a page feel like it is performing at you
   rather than showing you something.

   So it is simply PLACED. No scale, no dissolve, no travel. It is there when
   you get there, and the only thing that moves is the surface itself.

   WHAT MOVES INSTEAD

   The photograph is mapped onto a 96x64 mesh that behaves like a sheet
   pinned at its corners:

     · a spherical bow, so the middle stands proud of the edges and the thing
       reads as a surface in space rather than a rectangle on a page
     · two travelling waves at different rates, which is what stops a drape
       looking like a single slow pulse
     · a depression under the cursor that spreads outward and relaxes behind
       it, so pushing the wall actually pushes it

   The lighting is computed from the DISPLACED normal, recalculated per
   vertex from the same displacement function evaluated at two neighbours.
   That is the part that sells it: without it the cloth moves and the light
   does not, which reads as a texture sliding over a shape rather than a
   shape changing. With it, a ridge catches the key light as it rises and
   loses it as it flattens.

   THE PICTURE IS CUT OUT

   room-wall-*.webp is not a photograph of a wall. It is the objects ON the
   wall matted onto transparency -- every postcard, drawing and photograph
   masked, with nothing between them. So the cloth is invisible and what you
   see is the pinned paper moving as though attached to it, which is exactly
   what those objects are.

   Discovered the hard way twice: once as white bars in the hero's wall
   shader where alpha was zero, and once as a lit rounded rectangle painted
   into the empty space by a "curvature" overlay that assumed a rectangle
   existed. It is written down here so the third time does not happen.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var host = document.getElementById("wall-cloth");
  if (!host) return;

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var COLS = 96,
    ROWS = 64;

  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);

  var gl = null;
  try {
    gl = canvas.getContext("webgl2", { alpha: true, antialias: true, premultipliedAlpha: true });
  } catch (e) {}
  if (!gl) {
    /* No mesh. The <img> underneath is the fallback and is the picture -- it
       simply stops moving. */
    canvas.remove();
    return;
  }

  var VS = [
    "#version 300 es",
    "precision highp float;",
    "layout(location=0) in vec2 a_uv;",
    "uniform float u_time, u_aspect, u_push;",
    "uniform vec2 u_ptr;",
    "out vec2 v_uv;",
    "out vec3 v_nrm;",
    "out float v_z;",

    /* One displacement function, called three times per vertex -- here and at
       two neighbours -- so the normal is derived from the same maths that
       moved the surface and cannot drift out of step with it. */
    "float disp(vec2 uv){",
    /* The bow. A cosine in both axes is a dome: zero at the edges, maximum
       in the middle, and continuous everywhere. */
    "  vec2 c = uv - 0.5;",
    "  float dome = cos(c.x * 3.14159) * cos(c.y * 3.14159) * 0.16;",
    /* Two travelling waves at unrelated rates and angles. One alone reads as
       a pulse; two that never line up read as a sheet in moving air. */
    "  float w = sin(uv.x * 5.2 + u_time * 0.55) * cos(uv.y * 3.7 - u_time * 0.41) * 0.030;",
    "  w += sin((uv.x + uv.y) * 8.1 - u_time * 0.73) * 0.014;",
    /* The pointer presses in. Aspect-corrected so the dent is round on any
       window, and it PUSHES AWAY rather than pulling, because a surface you
       touch gives. */
    "  vec2 d = (uv - u_ptr) * vec2(u_aspect, 1.0);",
    "  float press = exp(-dot(d, d) * 26.0) * u_push;",
    /* A ring around the dent, which is what a real sheet does: material has
       to go somewhere, so it rises just outside where you pushed. */
    "  float ring = exp(-pow((length(d) - 0.22) * 7.0, 2.0)) * u_push * 0.35;",
    "  return dome + w - press * 0.30 + ring;",
    "}",

    "void main(){",
    "  v_uv = a_uv;",
    "  float z = disp(a_uv);",
    "  v_z = z;",
    /* Central differences on the displacement give the surface normal. The
       epsilon is one cell of the mesh, so the normal describes the geometry
       actually being drawn rather than the underlying function at infinite
       resolution -- which would light detail the mesh cannot show. */
    "  float e = 0.012;",
    "  float zx = disp(a_uv + vec2(e, 0.0)) - disp(a_uv - vec2(e, 0.0));",
    "  float zy = disp(a_uv + vec2(0.0, e)) - disp(a_uv - vec2(0.0, e));",
    "  v_nrm = normalize(vec3(-zx / (2.0 * e), -zy / (2.0 * e), 1.0));",
    /* Weak perspective. The sheet is nearly flat-on, so a full projection
       buys nothing; dividing x and y by depth is enough to make the raised
       middle read as nearer. */
    "  vec2 p = (a_uv - 0.5) * 2.0;",
    "  float persp = 1.0 + z * 0.30;",
    "  gl_Position = vec4(p * persp, 0.0, 1.0);",
    "}",
  ].join("\n");

  var FS = [
    "#version 300 es",
    "precision highp float;",
    "in vec2 v_uv;",
    "in vec3 v_nrm;",
    "in float v_z;",
    "uniform sampler2D u_tex;",
    "uniform float u_light;",
    "out vec4 o;",
    "void main(){",
    "  vec4 t = texture(u_tex, vec2(v_uv.x, 1.0 - v_uv.y));",
    /* Cut out. Below a fifth of coverage there is no object here and the
       page shows through -- this is the wall being empty, not the shader
       being transparent. */
    "  if (t.a < 0.02) discard;",
    "  vec3 N = normalize(v_nrm);",
    "  vec3 L = normalize(vec3(-0.42, 0.68, 0.60));",
    "  float dif = max(0.0, dot(N, L));",
    /* Added to the photograph and scaled by its own brightness, never
       replacing it: a dark object returns little light however hard you
       light it, and adding a flat amount is what made an earlier version of
       this wall read as embossed tin. */
    "  vec3 key = vec3(1.00, 0.86, 0.68);",
    "  float lum = dot(t.rgb, vec3(0.2126, 0.7152, 0.0722));",
    "  vec3 col = t.rgb + key * dif * 0.30 * (0.15 + 0.85 * lum);",
    /* And the parts that have curled away from the light sit back, which is
       most of what makes the surface read as three-dimensional at all. */
    "  col *= 0.72 + 0.28 * smoothstep(-0.06, 0.14, v_z);",
    "  col = mix(col, col * 1.06, u_light);",
    "  o = vec4(col * t.a, t.a);",
    "}",
  ].join("\n");

  function sh(t, src) {
    var s = gl.createShader(t);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      if (window.console && console.warn) console.warn("[wall-cloth]", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  var v = sh(gl.VERTEX_SHADER, VS),
    f = sh(gl.FRAGMENT_SHADER, FS);
  if (!v || !f) {
    canvas.remove();
    return;
  }
  var prog = gl.createProgram();
  gl.attachShader(prog, v);
  gl.attachShader(prog, f);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    if (window.console && console.warn) console.warn("[wall-cloth] link", gl.getProgramInfoLog(prog));
    canvas.remove();
    return;
  }
  var U = {};
  ["u_time", "u_aspect", "u_ptr", "u_push", "u_tex", "u_light"].forEach(function (n) {
    U[n] = gl.getUniformLocation(prog, n);
  });

  /* The mesh: a grid of triangles in UV space. Position is derived in the
     vertex shader, so the only attribute is the coordinate itself. */
  var verts = [];
  for (var y = 0; y < ROWS; y++) {
    for (var x = 0; x < COLS; x++) {
      var u0 = x / COLS,
        u1 = (x + 1) / COLS,
        v0 = y / ROWS,
        v1 = (y + 1) / ROWS;
      verts.push(u0, v0, u1, v0, u1, v1, u0, v0, u1, v1, u0, v1);
    }
  }
  var VCOUNT = verts.length / 2;
  var vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  var vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  var ready = false;
  var img = new Image();
  img.decoding = "async";
  img.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    ready = true;
    host.classList.add("is-cloth");
  };
  img.onerror = function () {
    canvas.remove();
  };
  img.src = host.getAttribute("data-src");

  var raf = 0,
    t0 = performance.now(),
    live = false;
  var ptr = { x: 0.5, y: 0.5 },
    cur = { x: 0.5, y: 0.5 },
    push = 0,
    pushT = 0;

  host.addEventListener(
    "pointermove",
    function (e) {
      var r = host.getBoundingClientRect();
      if (!r.width) return;
      ptr.x = (e.clientX - r.left) / r.width;
      ptr.y = 1 - (e.clientY - r.top) / r.height;
      pushT = 1;
    },
    { passive: true }
  );
  host.addEventListener(
    "pointerleave",
    function () {
      pushT = 0;
    },
    { passive: true }
  );

  function frame(now) {
    raf = 0;
    if (!live) return;
    if (!ready) {
      raf = requestAnimationFrame(frame);
      return;
    }
    /* Eased in and out, so the dent appears and heals rather than switching.
       Slower on release than on press: cloth recovers more slowly than it
       gives. */
    var k = pushT > push ? 0.11 : 0.035;
    push += (pushT - push) * k;
    cur.x += (ptr.x - cur.x) * 0.12;
    cur.y += (ptr.y - cur.y) * 0.12;

    var dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    var w = Math.max(1, Math.round(host.clientWidth * dpr));
    var h = Math.max(1, Math.round(host.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(prog);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(U.u_tex, 0);
    gl.uniform1f(U.u_time, (now - t0) / 1000);
    gl.uniform1f(U.u_aspect, w / h);
    gl.uniform1f(U.u_push, push);
    gl.uniform2f(U.u_ptr, cur.x, cur.y);
    gl.uniform1f(U.u_light, document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, VCOUNT);
    gl.bindVertexArray(null);
    raf = requestAnimationFrame(frame);
  }

  var io = new IntersectionObserver(
    function (es) {
      live = es[0].isIntersecting && !REDUCED;
      if (live && !raf) raf = requestAnimationFrame(frame);
      else if (!live && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    { rootMargin: "15% 0px" }
  );
  io.observe(host);

  if (REDUCED) {
    /* Drawn once, flat and still: the picture is the point and the drape is
       not. */
    live = true;
    setTimeout(function () {
      frame(performance.now());
      live = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }, 500);
  }

  /* A verification hook, not a feature. */
  window.__wallCloth = function () {
    return { ready: ready, live: live, verts: VCOUNT, push: +push.toFixed(3), size: [canvas.width, canvas.height] };
  };
})();
