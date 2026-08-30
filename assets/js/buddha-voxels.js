/* ─────────────────────────────────────────────────────────────────────────
   THE HEAD COMES APART INTO CUBES

   Sid: "in the end when u scroll can we have a slow cube breakdown of the
   buddha head based on the scroll. something with solid physics and 3d shader
   and voxels and feel like super smooth well animated orbs."

   ── WHERE THE VOXELS COME FROM ──────────────────────────────────────────
   Not from the GLB. buddha-points.bin already exists in this repo — 55,843
   points sampled off the same figure, position as int16 and normal as int8,
   normalised into a unit box. It was built so the cube guy could turn into
   the Buddha, and it is exactly the data a voxel breakdown needs: a surface,
   with a normal at every point, which is the direction a piece of a shell
   flies when the shell fails.

   Every fifth point, so about eleven thousand cubes. That number is a
   decision, not a budget: at 55,000 the cubes have to be small enough that
   the result is dust, and dust is not what "cube breakdown" means. Eleven
   thousand at this size reads as masonry.

   ── THE PHYSICS ─────────────────────────────────────────────────────────
   Each cube gets one impulse, along its own surface normal, plus a swirl
   around the vertical axis so the cloud opens rather than simply inflating,
   and then falls under gravity. Position is the closed-form p + vt + ½gt²
   rather than an integrator, because the whole thing is scrubbed by scroll:
   an integrator can only go forwards, and scrolling back up has to put every
   cube exactly where it was. Closed form is reversible for free.

   The per-cube delay is what makes it a breakdown instead of an explosion.
   Each one starts up to 45% of the way into the range, keyed off a stable
   hash of its own index, so the surface fails in patches.

   ── THE HANDOFF ─────────────────────────────────────────────────────────
   model-viewer fades as the cubes arrive, over a range where the voxel head
   is still solid, so there is one moment where both are on screen and
   registered — and then only cubes. Done the other way round the figure
   visibly pops from one renderer to the other. ────────────────────────── */
(function () {
  "use strict";

  var sec = document.getElementById("lastfig");
  var stage = document.querySelector(".lastfig__stage");
  var mount = document.getElementById("lastfig-mount");
  if (!sec || !stage || !mount) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var cv = document.createElement("canvas");
  cv.className = "lastfig__vox";
  cv.setAttribute("aria-hidden", "true");
  var gl = cv.getContext("webgl2", { alpha: true, antialias: true, depth: true });
  if (!gl) return;
  /* On the STAGE, not on the mount. The mount is a min(46vh, 380px) square
     sized to the figure, and cubes that are meant to leave the figure have to
     have somewhere to go -- inside that box they would be clipped at the jaw
     line about a fifth of the way through the break. */
  stage.appendChild(cv);

  var BASE = (document.querySelector('meta[name="baseurl"]') || {}).content || "";

  var VS = [
    "#version 300 es",
    "in vec3 a_corner;" /* unit cube corner, -0.5..0.5 */,
    "in vec3 a_face;" /* that corner's face normal */,
    "in vec3 a_pos;" /* per instance: point on the surface */,
    "in vec3 a_nor;" /* per instance: surface normal there */,
    "in float a_id;" /* per instance: stable index */,
    "uniform mat4 u_vp;",
    "uniform float u_b;" /* breakdown, 0 solid .. 1 gone */,
    "uniform float u_size;",
    "uniform float u_spin;",
    "out vec3 v_n;",
    "out float v_life;",
    "out float v_id;",

    "float hash(float n){ return fract(sin(n * 12.9898) * 43758.5453); }",

    "mat3 rot(vec3 ax, float a){",
    "  float c = cos(a), s = sin(a); float t = 1.0 - c;",
    "  return mat3(t*ax.x*ax.x+c, t*ax.x*ax.y-s*ax.z, t*ax.x*ax.z+s*ax.y,",
    "              t*ax.x*ax.y+s*ax.z, t*ax.y*ax.y+c, t*ax.y*ax.z-s*ax.x,",
    "              t*ax.x*ax.z-s*ax.y, t*ax.y*ax.z+s*ax.x, t*ax.z*ax.z+c);",
    "}",

    "void main(){",
    "  float h = hash(a_id);",
    "  float h2 = hash(a_id + 91.7);",
    /* The delay. Up to 45% of the range, so the shell fails in patches
       rather than all at once. */
    "  float t = clamp((u_b - h * 0.45) / 0.55, 0.0, 1.0);",
    "  v_life = t;",
    "  v_id = a_id;",

    /* The impulse: outward along the surface normal, plus a swirl about the
       vertical axis so the cloud opens instead of inflating, plus a little
       per-cube scatter so no two travel together. */
    "  vec3 n = normalize(a_nor + 1e-5);",
    "  vec3 swirl = vec3(-a_pos.z, 0.0, a_pos.x);",
    "  vec3 vel = n * (0.55 + h2 * 0.5) + swirl * 0.42 + vec3(h - 0.5, h2 - 0.5, hash(a_id + 17.3) - 0.5) * 0.30;",

    /* Closed form, because the whole thing is scrubbed by scroll and has to
       be reversible. An integrator can only run one way. */
    /* Eased, not linear. A linear impulse means every cube is already
       travelling at full speed on the frame it lets go, so the surface does
       not fail -- it detonates. t*t starts each one at rest, which is what
       makes it read as masonry giving way. */
    "  float te = t * t;",
    "  vec3 p = a_pos + vel * te * 1.15 + vec3(0.0, -1.15, 0.0) * te * t * 0.6;",

    /* Tumble. A cube that translates without rotating reads as a sprite. */
    "  vec3 ax = normalize(vec3(h - 0.5, h2 - 0.5, hash(a_id + 5.1) - 0.5) + 1e-4);",
    "  mat3 R = rot(ax, te * (2.4 + h * 5.0) + u_spin * 0.15);",

    /* Cubes shrink as they go, which is what keeps eleven thousand of them
       from turning the far half of the screen into grey soup. */
    "  float s = u_size * (1.0 - t * 0.45);",
    "  vec3 corner = R * (a_corner * s);",
    "  v_n = normalize(R * a_face);",
    "  gl_Position = u_vp * vec4(p + corner, 1.0);",
    "}",
  ].join("\n");

  var FS = [
    "#version 300 es",
    "precision highp float;",
    "in vec3 v_n;",
    "in float v_life;",
    "in float v_id;",
    "uniform float u_light;",
    "out vec4 o;",
    "float hash(float n){ return fract(sin(n * 12.9898) * 43758.5453); }",
    "void main(){",
    "  vec3 N = normalize(v_n);",
    /* Two lights, matching the figure's own: a warm key from up and left, a
       cool fill from below and right. Flat-shaded per face, which is the
       whole aesthetic — a voxel with a smooth normal is not a voxel. */
    "  vec3 K = normalize(vec3(-0.45, 0.80, 0.42));",
    "  vec3 F = normalize(vec3(0.60, -0.35, 0.55));",
    "  float k = max(dot(N, K), 0.0);",
    "  float f = max(dot(N, F), 0.0);",
    "  vec3 col = vec3(0.052, 0.055, 0.040);",
    "  col += vec3(0.62, 0.56, 0.34) * pow(k, 0.85) * 0.85;",
    "  col += vec3(0.16, 0.30, 0.36) * f * 0.55;",
    /* A few cubes catch the light hard, the way a glazed surface does. Keyed
       off the stable id so the same ones always do. */
    "  col += vec3(0.9, 0.88, 0.78) * step(0.965, hash(v_id + 3.7)) * pow(k, 3.0) * 0.9;",
    "  col = mix(col, vec3(0.72, 0.74, 0.76) * (0.35 + k * 0.75), u_light);",
    /* They go out at the very end rather than crossing the bottom of the
       window as a rain of solids. */
    "  float a = 1.0 - smoothstep(0.72, 1.0, v_life);",
    "  if (a < 0.01) discard;",
    "  o = vec4(col, a);",
    "}",
  ].join("\n");

  function sh(ty, src) {
    var s = gl.createShader(ty);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn("voxels: " + gl.getShaderInfoLog(s));
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
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn("voxels: " + gl.getProgramInfoLog(prog));
    return;
  }
  gl.useProgram(prog);

  /* ── the cube ─────────────────────────────────────────────────────────
     24 vertices rather than 8. A cube shares its corners between three faces
     but not its normals, so eight vertices can only ever be smooth-shaded —
     and a smooth-shaded cube is a ball with corners. */
  var C = [],
    FN = [],
    IDX = [];
  var faces = [
    [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
    [
      [-1, 0, 0],
      [0, 1, 0],
      [0, 0, -1],
    ],
    [
      [0, 1, 0],
      [0, 0, 1],
      [1, 0, 0],
    ],
    [
      [0, -1, 0],
      [0, 0, -1],
      [1, 0, 0],
    ],
    [
      [0, 0, 1],
      [0, 1, 0],
      [-1, 0, 0],
    ],
    [
      [0, 0, -1],
      [0, 1, 0],
      [1, 0, 0],
    ],
  ];
  faces.forEach(function (f, i) {
    var n = f[0],
      u = f[1],
      v = f[2];
    [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ].forEach(function (s) {
      C.push((n[0] + u[0] * s[0] + v[0] * s[1]) * 0.5, (n[1] + u[1] * s[0] + v[1] * s[1]) * 0.5, (n[2] + u[2] * s[0] + v[2] * s[1]) * 0.5);
      FN.push(n[0], n[1], n[2]);
    });
    var b = i * 4;
    IDX.push(b, b + 1, b + 2, b, b + 2, b + 3);
  });

  var vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  function attr(name, data, n) {
    var b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    var l = gl.getAttribLocation(prog, name);
    if (l >= 0) {
      gl.enableVertexAttribArray(l);
      gl.vertexAttribPointer(l, n, gl.FLOAT, false, 0, 0);
    }
    return l;
  }
  attr("a_corner", C, 3);
  attr("a_face", FN, 3);
  var ib = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(IDX), gl.STATIC_DRAW);

  var U = {};
  ["u_vp", "u_b", "u_size", "u_spin", "u_light"].forEach(function (k) {
    U[k] = gl.getUniformLocation(prog, k);
  });

  var COUNT = 0,
    ready = false;

  /* ── the cloud ────────────────────────────────────────────────────────
     Fetched only when the section is within a screen, and only once. 500KB
     is not a cost anyone should pay for a state they may never scroll to. */
  var asked = false;
  function load() {
    if (asked) return;
    asked = true;
    fetch(BASE + "/assets/models/buddha-points.bin")
      .then(function (r) {
        if (!r.ok) throw new Error("points: " + r.status);
        return r.arrayBuffer();
      })
      .then(function (bb) {
        var n = (bb.byteLength / 9) | 0;
        var pos = new Int16Array(bb, 0, n * 3);
        var nor = new Int8Array(bb, n * 6, n * 3);
        /* Every fifth. At the full count the cubes have to be small enough
           that the result is dust; dust is not a cube breakdown. */
        /* Every seventh, not every fifth. Bigger cubes at the new camera
           distance overlap at 11,000, and overlapping cubes on a shell read
           as one solid lump rather than as blocks. */
        var STEP = 7;
        var m = Math.floor(n / STEP);
        var P = new Float32Array(m * 3),
          N = new Float32Array(m * 3),
          ID = new Float32Array(m);
        for (var i = 0; i < m; i++) {
          var k = i * STEP;
          /* Same axis remap the cube guy uses: the cloud is stored z-up. */
          P[i * 3] = pos[k * 3] / 32767;
          P[i * 3 + 1] = pos[k * 3 + 2] / 32767;
          P[i * 3 + 2] = pos[k * 3 + 1] / 32767;
          N[i * 3] = nor[k * 3] / 127;
          N[i * 3 + 1] = nor[k * 3 + 2] / 127;
          N[i * 3 + 2] = nor[k * 3 + 1] / 127;
          ID[i] = i;
        }
        gl.bindVertexArray(vao);
        [
          ["a_pos", P, 3],
          ["a_nor", N, 3],
          ["a_id", ID, 1],
        ].forEach(function (a) {
          var b = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, b);
          gl.bufferData(gl.ARRAY_BUFFER, a[1], gl.STATIC_DRAW);
          var l = gl.getAttribLocation(prog, a[0]);
          if (l >= 0) {
            gl.enableVertexAttribArray(l);
            gl.vertexAttribPointer(l, a[2], gl.FLOAT, false, 0, 0);
            gl.vertexAttribDivisor(l, 1);
          }
        });
        COUNT = m;
        ready = true;
      })
      .catch(function (e) {
        console.warn(e);
      });
  }

  /* ── camera ───────────────────────────────────────────────────────────
     Hand-built, because pulling a matrix library in for one perspective and
     one translation is 40KB to avoid twenty lines. */
  function vp(aspect, dist) {
    var f = 1 / Math.tan(0.62 / 2),
      near = 0.1,
      far = 24;
    var C = (far + near) / (near - far);
    var D = (2 * far * near) / (near - far);
    /* Perspective times a pure dolly, multiplied out by hand and written
       column-major. Pulling in a matrix library for one projection and one
       translation is forty kilobytes to avoid four lines, and the four lines
       are checkable: column 2 carries the depth remap, column 3 carries the
       camera distance, and w ends up as +dist so the divide is right. */
    return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, C, -1, 0, 0, -C * dist + D, dist]);
  }

  var raf = 0,
    live = false,
    spin = 0,
    b = 0,
    last = 0;

  new IntersectionObserver(
    function (es) {
      live = es[0].isIntersecting;
      if (live) {
        load();
        if (!raf) {
          last = 0;
          raf = requestAnimationFrame(frame);
        }
      }
    },
    { rootMargin: "300px 0px" }
  ).observe(sec);

  function size() {
    var r = cv.getBoundingClientRect();
    var dpr = Math.min(2, devicePixelRatio || 1);
    var w = Math.max(2, Math.round(r.width * dpr)),
      h = Math.max(2, Math.round(r.height * dpr));
    if (cv.width === w && cv.height === h) return;
    cv.width = w;
    cv.height = h;
    gl.viewport(0, 0, w, h);
  }

  function frame(now) {
    if (!live) {
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(frame);
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    spin += dt;

    /* The breakdown range is the LAST part of the section's own scroll, which
       is the part where the figure has already been seen turning. Breaking it
       up before it has been looked at is a trick; breaking it up after is an
       ending. */
    var box = sec.getBoundingClientRect();
    var held = box.height - innerHeight;
    var q = held > 40 ? Math.min(1, Math.max(0, -box.top / held)) : 0;
    b = Math.min(1, Math.max(0, (q - 0.55) / 0.44));

    /* The handoff. model-viewer goes while the voxel head is still solid, so
       there is one registered moment with both on screen. */
    /* b * 5 crossed the whole handoff in the first 4% of the section and read
       as a cut. Over b 0 to 0.38 there is a real dissolve, and it happens
       while the voxel head is still essentially solid. */
    var mv = mount.querySelector("model-viewer");
    if (mv) mv.style.opacity = String(Math.max(0, 1 - b * 2.6));
    cv.style.opacity = String(Math.min(1, b * 4));

    if (!ready || b <= 0) return;

    size();
    gl.useProgram(prog);
    gl.bindVertexArray(vao);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    /* The canvas is the full stage, but the head has to arrive the size the
       model-viewer head leaves at -- which is a 380px mount inside an 820px
       stage. 3.7 was a first guess and measured wrong: the voxel head spanned
       800 of 820px, more than twice the figure it replaced. The camera has to
       pull back by that ratio. */
    gl.uniformMatrix4fv(U.u_vp, false, vp(cv.width / cv.height, 7.6));
    gl.uniform1f(U.u_b, b);
    /* Scaled with the camera. Pulling the dolly back from 3.7 to 7.6 without
       touching this left eleven thousand cubes at half their apparent size,
       and the breakdown read as dust rather than as masonry -- which is the
       one thing the brief rules out. */
    gl.uniform1f(U.u_size, 0.066);
    gl.uniform1f(U.u_spin, spin);
    gl.uniform1f(U.u_light, document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0);
    gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, COUNT);
  }
})();
