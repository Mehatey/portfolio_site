/* ═══════════════════════════════════════════════════════════════════════════
   THE MONOLITH

   Sid: "i want u to play with 3d and scroll page transitions look at monolith
   project and cool storytelling scroll transitions."

   WHAT IT IS

   One object, made of 90,000 points, that is scrubbed through five states by
   the scroll. It does not fade between pictures of five things; the same
   points travel, so what you watch is a thing BECOMING another thing, which
   is the only reason a sequence like this is worth the bytes.

   The five states are the site's own sentence taken apart:

     0  RESEARCH       a slab. Undifferentiated, heavy, nothing decided yet.
     1  INTERFACE      it unfolds into a grid of planes. Order imposed.
     2  SPATIAL        the grid closes into a sphere. The flat thing gains
                       a volume you can walk around.
     3  SHIPPED CODE   the sphere draws out into a stream. Structure becomes
                       a sequence -- a line of instructions.
     4  END TO END     the stream lifts and disperses upward into the page.

   "Research to shipped code, end to end" is the line in the hero. This is
   that sentence with a body.

   WHY THE POINTS DISPERSE BETWEEN STATES

   A straight lerp from slab to grid is a slab sliding into a grid, and it
   reads as cheap because real matter does not do that. Each point is pushed
   out along a curl-noise direction by an amount that peaks halfway through
   the transition and returns to zero at both ends. So the form comes apart,
   travels as a cloud, and reassembles -- which is the difference between a
   morph and a dissolve, and it costs one sine.

   WHY PROCEDURAL AND NOT A MODEL

   Every target position is computed in the vertex shader from the point's
   own index. There is no geometry to download, no bake step, and no file to
   go stale: 90,000 points cost 4 bytes of attribute each. The whole object
   is 360KB of nothing.

   THE SCROLL CONTRACT

   --mp, 0 to 1 across the pinned runway, published by the section itself.
   This file reads it and eases toward it. Nothing here listens to scroll
   directly -- the page owns scroll, and a second subscriber is a second
   thing that can disagree about where the reader is.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var host = document.getElementById("monolith");
  if (!host) return;

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);

  var gl = null;
  try {
    gl = canvas.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: true, depth: true });
  } catch (e) {}
  if (!gl) {
    /* No WebGL2, no sequence. The section keeps its type, which carries the
       whole argument on its own -- see the markup. It is a five-beat
       statement with or without a renderer behind it. */
    host.remove();
    return;
  }

  var N = 90000;

  var VS = [
    "#version 300 es",
    "precision highp float;",
    "layout(location=0) in vec2 a_quad;",
    "layout(location=1) in float a_id;",
    "uniform float u_p, u_time, u_aspect, u_size;",
    "uniform vec2 u_ptr;",
    "out float v_shade;",
    "out float v_id;",
    "out vec2 v_corner;",

    "const float PI = 3.14159265;",
    "float hash(float n){ return fract(sin(n * 127.1) * 43758.5453); }",
    "vec3 hash3(float n){ return vec3(hash(n), hash(n + 17.3), hash(n + 41.7)); }",

    /* ── THE FIVE FORMS ────────────────────────────────────────────────────
       Each is a pure function of the point's index, so the whole object is
       an integer per point. */

    /* 0. A slab. Deliberately the dullest shape here: it has to read as
       material that has not been decided about yet. */
    "vec3 fSlab(float i, vec3 r){",
    "  return vec3((r.x - 0.5) * 0.62, (r.y - 0.5) * 2.25, (r.z - 0.5) * 0.42);",
    "}",
    /* 1. A grid of planes. Twelve tiles, each with its own patch of points,
       laid out in a 4x3 wall with gaps -- the gaps are what make it read as
       an interface rather than as a rectangle. */
    "vec3 fGrid(float i, vec3 r){",
    "  float t = floor(mod(i, 12.0));",
    "  float cx = mod(t, 4.0), cy = floor(t / 4.0);",
    "  vec2 cell = vec2((cx - 1.5) * 0.62, (cy - 1.0) * 0.66);",
    "  return vec3(cell.x + (r.x - 0.5) * 0.5, cell.y + (r.y - 0.5) * 0.52, (r.z - 0.5) * 0.05);",
    "}",
    /* 2. A sphere. Fibonacci rather than lat/long, so the points do not bunch
       at the poles -- polar bunching is the single tell of a hand-rolled
       sphere. */
    "vec3 fSphere(float i, vec3 r){",
    "  float k = i + 0.5;",
    "  float phi = acos(1.0 - 2.0 * k / " + N + ".0);",
    "  float th = PI * (1.0 + sqrt(5.0)) * k;",
    "  float rad = 0.92 + (r.z - 0.5) * 0.06;",
    "  return vec3(cos(th) * sin(phi), cos(phi), sin(th) * sin(phi)) * rad;",
    "}",
    /* 3. A stream. A helix drawn out along x with a falling radius, which is
       a line that still has a body -- a bare line at this point count is a
       row of dots. */
    "vec3 fStream(float i, vec3 r){",
    "  float u = i / " + N + ".0;",
    "  float a = u * PI * 14.0;",
    "  float rad = (0.30 - u * 0.2) * (0.6 + r.z * 0.8);",
    "  return vec3((u - 0.5) * 3.1, sin(a) * rad + (r.y - 0.5) * 0.06, cos(a) * rad);",
    "}",
    /* 4. Dispersal. Upward and outward, seeded per point, so the object
        leaves rather than fades. */
    "vec3 fAway(float i, vec3 r){",
    "  vec3 d = normalize(r - 0.5 + 0.001);",
    "  return d * (1.4 + r.x * 2.6) + vec3(0.0, 1.6 + r.y * 2.2, 0.0);",
    "}",

    /* Curl of a cheap potential, for the travel between forms. */
    "vec3 pot(vec3 p){ return vec3(sin(p.y * 1.7 + p.z), sin(p.z * 1.5 + p.x), sin(p.x * 1.9 + p.y)); }",
    "vec3 curl(vec3 p){",
    "  float e = 0.24;",
    "  vec3 dx = pot(p + vec3(e,0,0)) - pot(p - vec3(e,0,0));",
    "  vec3 dy = pot(p + vec3(0,e,0)) - pot(p - vec3(0,e,0));",
    "  vec3 dz = pot(p + vec3(0,0,e)) - pot(p - vec3(0,0,e));",
    "  return vec3(dy.z - dz.y, dz.x - dx.z, dx.y - dy.x) / (2.0 * e);",
    "}",

    "vec3 formAt(float s, float i, vec3 r){",
    "  if (s < 0.5) return fSlab(i, r);",
    "  if (s < 1.5) return fGrid(i, r);",
    "  if (s < 2.5) return fSphere(i, r);",
    "  if (s < 3.5) return fStream(i, r);",
    "  return fAway(i, r);",
    "}",

    "void main(){",
    "  float i = a_id;",
    "  vec3 r = hash3(i);",
    /* Four transitions across the runway. `seg` is which one, `k` is how far
       through it -- smoothstepped, so each state holds briefly at both ends
       and the reader gets to SEE the thing it became before it leaves. */
    "  float f = clamp(u_p, 0.0, 1.0) * 4.0;",
    "  float seg = floor(f);",
    "  float k = smoothstep(0.0, 1.0, clamp(f - seg, 0.0, 1.0));",
    "  vec3 a = formAt(seg, i, r);",
    "  vec3 b = formAt(seg + 1.0, i, r);",
    "  vec3 P = mix(a, b, k);",
    /* The dispersal. Peaks at the middle of every transition and is exactly
       zero at both ends, so each form arrives clean. */
    "  float burst = sin(k * PI);",
    "  P += curl(P * 1.4 + vec3(0.0, 0.0, u_time * 0.12)) * burst * 0.42;",
    /* A slow drift so a held form is never completely still. */
    "  P += curl(P * 0.7 + vec3(u_time * 0.05, 0.0, 0.0)) * 0.018;",
    /* The whole object turns as you scroll, and answers the pointer. */
    "  float ang = u_p * 2.4 + u_ptr.x * 0.5 + u_time * 0.04;",
    "  float ca = cos(ang), sa = sin(ang);",
    "  P = vec3(P.x * ca + P.z * sa, P.y, -P.x * sa + P.z * ca);",
    "  P.y += u_ptr.y * 0.12;",
    /* One fixed camera. The object is what moves. */
    "  vec3 eye = vec3(0.0, 0.0, 3.5);",
    "  vec3 V = P - eye;",
    "  float d = max(0.001, -V.z);",
    "  vec2 proj = vec2(V.x / d, V.y / d) * 1.5;",
    "  gl_Position = vec4(proj.x / u_aspect + a_quad.x * u_size / u_aspect, proj.y + a_quad.y * u_size, 0.0, 1.0);",
    "  v_corner = a_quad;",
    "  v_id = i;",
    /* Depth as shade. There is no light in this scene on purpose -- a lit
       point cloud at 90k needs a normal per point and these points have no
       surface to take one from. Depth cueing is honest and it is enough. */
    "  v_shade = clamp(1.0 - (d - 2.4) * 0.42, 0.05, 1.0) * (1.0 - burst * 0.35);",
    "}",
  ].join("\n");

  var FS = [
    "#version 300 es",
    "precision highp float;",
    "in float v_shade;",
    "in float v_id;",
    "in vec2 v_corner;",
    "uniform float u_light, u_p;",
    "out vec4 o;",
    "void main(){",
    "  float r = dot(v_corner, v_corner) * 4.0;",
    "  if (r > 1.0) discard;",
    "  float a = (1.0 - r) * v_shade * 0.5;",
    /* The same two lights the hero scene is built on, so this belongs to the
       same site: warm key, cool fill, split on the point's own index and
       drifting with the sequence. */
    "  vec3 warm = vec3(1.00, 0.86, 0.68);",
    "  vec3 cool = vec3(0.30, 0.46, 0.72);",
    "  float m = fract(v_id * 0.00013 + u_p * 0.35);",
    "  vec3 c = mix(cool, warm, smoothstep(0.25, 0.75, m));",
    "  c = mix(c, vec3(0.09, 0.11, 0.15), u_light);",
    "  o = vec4(c * a, a);",
    "}",
  ].join("\n");

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      /* Loud. A silent shader failure on this site has already cost five
         commits once; see the note at the top of hero-scene.js. */
      if (window.console && console.warn) console.warn("[monolith]", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  var v = compile(gl.VERTEX_SHADER, VS),
    f = compile(gl.FRAGMENT_SHADER, FS);
  if (!v || !f) {
    host.remove();
    return;
  }
  var prog = gl.createProgram();
  gl.attachShader(prog, v);
  gl.attachShader(prog, f);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    if (window.console && console.warn) console.warn("[monolith] link", gl.getProgramInfoLog(prog));
    host.remove();
    return;
  }
  var U = {};
  ["u_p", "u_time", "u_aspect", "u_size", "u_ptr", "u_light"].forEach(function (n) {
    U[n] = gl.getUniformLocation(prog, n);
  });

  /* One quad, N instances, one float of attribute each. */
  var vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  var qb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, qb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  var ids = new Float32Array(N);
  for (var j = 0; j < N; j++) ids[j] = j;
  var ib = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, ib);
  gl.bufferData(gl.ARRAY_BUFFER, ids, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 0, 0);
  gl.vertexAttribDivisor(1, 1);
  gl.bindVertexArray(null);

  var raf = 0,
    t0 = performance.now(),
    last = t0,
    p = 0,
    tp = 0,
    ptr = { x: 0, y: 0 },
    cur = { x: 0, y: 0 },
    live = false;

  window.addEventListener(
    "pointermove",
    function (e) {
      ptr.x = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      ptr.y = -(e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
    },
    { passive: true }
  );

  /* Only while the section is on screen. Ninety thousand instances drawn
     behind three screens of other content is the whole cost of this feature
     paid for nothing. */
  var io = new IntersectionObserver(
    function (es) {
      live = es[0].isIntersecting;
      if (live && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    },
    { rootMargin: "20% 0px" }
  );
  io.observe(host);

  function size() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    var w = Math.max(1, Math.round(host.clientWidth * dpr));
    var h = Math.max(1, Math.round(host.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  function frame(now) {
    raf = 0;
    if (!live) return;
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    /* The page owns scroll. This reads the property the section publishes
       and eases toward it, which is what keeps the object feeling heavy --
       an object that tracks a scrollbar exactly reads as a slider, not as
       mass. */
    var raw = parseFloat(host.getAttribute("data-p"));
    tp = raw === raw ? raw : 0;
    p += (tp - p) * (1 - Math.exp(-dt * 6.5));
    var kp = 1 - Math.exp(-dt * 3.0);
    cur.x += (ptr.x - cur.x) * kp;
    cur.y += (ptr.y - cur.y) * kp;

    size();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(prog);
    gl.uniform1f(U.u_p, p);
    gl.uniform1f(U.u_time, (now - t0) / 1000);
    gl.uniform1f(U.u_aspect, canvas.width / canvas.height);
    gl.uniform1f(U.u_size, 0.0022 * (canvas.height / 900));
    gl.uniform2f(U.u_ptr, cur.x, cur.y);
    gl.uniform1f(U.u_light, document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0);
    gl.bindVertexArray(vao);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 3, N);
    gl.bindVertexArray(null);
    raf = requestAnimationFrame(frame);
  }

  if (REDUCED) {
    /* One frame, at the sphere -- the most legible of the five -- and then
       nothing. Somebody who asked for less motion should still see what the
       section is, not an empty box where an object was. */
    host.setAttribute("data-p", "0.5");
    live = true;
    frame(performance.now());
    live = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  /* A verification hook, not a feature. */
  window.__monolith = function () {
    return { instances: N, p: +p.toFixed(3), target: +tp.toFixed(3), live: live, size: [canvas.width, canvas.height] };
  };
})();
