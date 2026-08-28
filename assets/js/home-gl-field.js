/* ═══════════════════════════════════════════════════════════════════════════
   05 · THE FIELD — GPGPU PARTICLES, PING-PONGED

   Sid: "can you finish everything."

   This replaces the curl DISPLACEMENT that was here with a real curl
   ADVECTION, which is the last technique on my own reference list that this
   site did not actually have.

   THE DIFFERENCE, AND WHY IT IS NOT PEDANTRY

   The old field computed each point's offset as a pure function of (base,
   time). Every particle was tethered to a home position and wandered around
   it. It reads well at a glance and it is a lie about what is happening:
   nothing was ever carried anywhere, so the field could not transport, could
   not form filaments, and could not remember that you had disturbed it.

   This integrates instead:

     p(t+dt) = p(t) + curl(p(t)) * dt

   Position is state. It lives in a floating point texture, is read by the
   simulation, advanced, and written to a second texture; the two swap every
   frame. That is the ping-pong, and it is the whole of GPGPU on the web: the
   GPU is being used to compute something that is not an image, and the
   texture is the memory.

   What you get for it is what advection actually does -- particles pulled
   into the same streamlines gather into threads, sheets fold over one
   another, and a cursor pushed through the field leaves a wake that persists
   after the cursor has gone. None of that is expressible as a displacement.

   RESPAWN, BECAUSE ADVECTION DRIFTS

   A divergence-free field does not create sinks, but it does transport, and
   over minutes the cloud will smear off toward wherever the flow happens to
   lead. Each particle therefore carries an age in the alpha channel and is
   reseeded at its original position when it expires, on a stagger so the
   whole field never resets at once. Standard, and the reason a GPGPU field
   can run for an hour without turning into a smudge.

   FLOAT TARGETS, AND WHAT HAPPENS WITHOUT THEM

   Rendering into a float texture needs EXT_color_buffer_float, which is not
   core in WebGL2. If it is missing this file bows out and the caller keeps
   the displacement version -- which is exactly why that version was written
   first and is kept rather than deleted.
   ═══════════════════════════════════════════════════════════════════════════ */
window.__fieldSim = (function () {
  "use strict";

  /* 256x256 = 65,536 particles. The texture is square because a simulation
     target must be, and the count follows from the texture rather than the
     other way round. */
  var SIDE = 256;
  var N = SIDE * SIDE;

  var host = null,
    canvas = null,
    gl = null,
    simP = null,
    drawP = null,
    fbo = null,
    texA = null,
    texB = null,
    seedTex = null,
    quadVAO = null,
    pointVAO = null,
    raf = 0,
    t0 = 0,
    last = 0,
    live = false,
    flip = 0;
  var ptr = { x: 0, y: 0 },
    cur = { x: 0, y: 0 };

  /* ── shared: the flow ─────────────────────────────────────────────────
     Curl of a value-noise potential. Divergence free by construction, which
     is the entire reason particles driven by it swirl and fold instead of
     draining into sinks. */
  var FLOW = [
    "float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }",
    "float vnoise(vec3 x){",
    "  vec3 i = floor(x), f = fract(x);",
    "  f = f * f * (3.0 - 2.0 * f);",
    "  return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),",
    "                 mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),",
    "             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),",
    "                 mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);",
    "}",
    "vec3 pot(vec3 p){ return vec3(vnoise(p), vnoise(p + 31.7), vnoise(p + 74.3)); }",
    "vec3 curl(vec3 p){",
    "  float e = 0.14;",
    "  vec3 dx = pot(p + vec3(e,0,0)) - pot(p - vec3(e,0,0));",
    "  vec3 dy = pot(p + vec3(0,e,0)) - pot(p - vec3(0,e,0));",
    "  vec3 dz = pot(p + vec3(0,0,e)) - pot(p - vec3(0,0,e));",
    "  return vec3(dy.z - dz.y, dz.x - dx.z, dx.y - dy.x) / (2.0 * e);",
    "}",
  ].join("\n");

  var FS_VS = [
    "#version 300 es",
    "const vec2 P[3] = vec2[3](vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));",
    "out vec2 v_uv;",
    "void main(){",
    "  vec2 p = P[gl_VertexID];",
    "  v_uv = p * 0.5 + 0.5;",
    "  gl_Position = vec4(p, 0.0, 1.0);",
    "}",
  ].join("\n");

  /* ── the simulation ───────────────────────────────────────────────────
     One fragment per particle. Reads the previous position, integrates,
     writes the new one. xyz is position, w is age. */
  var SIM_FS = [
    "#version 300 es",
    "precision highp float;",
    "in vec2 v_uv;",
    "uniform sampler2D u_prev, u_seed;",
    "uniform float u_dt, u_time;",
    "uniform vec2 u_ptr;",
    "out vec4 o;",
    FLOW,
    "void main(){",
    "  vec4 s = texture(u_prev, v_uv);",
    "  vec3 p = s.xyz;",
    "  float age = s.w;",
    "  vec3 home = texture(u_seed, v_uv).xyz;",

    /* First frame, and every respawn: start from the seed. */
    "  if (age <= 0.0) { o = vec4(home, 1.0); return; }",

    /* The advection. Two octaves, the second finer and faster, which is what
       gives the threads their internal structure rather than moving them as
       one smooth sheet. */
    "  vec3 v = curl(p * 0.9 + vec3(0.0, 0.0, u_time * 0.05)) * 0.32;",
    "  v += curl(p * 2.6 - vec3(0.0, u_time * 0.08, 0.0)) * 0.10;",

    /* The cursor pushes, and because position is STATE the push persists --
       a wake, not a deflection that springs back the moment the pointer
       leaves. This is the thing a displacement field cannot do. */
    "  vec2 d = p.xy - u_ptr;",
    "  float g = exp(-dot(d, d) * 4.5);",
    "  v.xy += normalize(d + 1e-4) * g * 1.6;",

    /* A weak pull home, so the cloud keeps its overall shape over minutes
       without the particles being tethered frame to frame. Two orders of
       magnitude below the flow: it decides where the field IS, not how it
       moves. */
    "  v += (home - p) * 0.06;",

    "  p += v * u_dt;",
    /* Age counts down at a rate seeded per particle, so the respawns are
       staggered across several seconds instead of the whole field blinking
       at once. */
    "  age -= u_dt * (0.05 + fract(texture(u_seed, v_uv).w) * 0.06);",
    "  o = vec4(p, age);",
    "}",
  ].join("\n");

  /* ── the draw ─────────────────────────────────────────────────────────
     One point per particle, its position fetched from the simulation
     texture by gl_VertexID. No attribute buffer at all: the vertex shader
     computes which texel it is and reads it. */
  var DRAW_VS = [
    "#version 300 es",
    "precision highp float;",
    "uniform sampler2D u_pos;",
    "uniform float u_side, u_aspect, u_size;",
    "out float v_fade;",
    "out float v_seed;",
    "void main(){",
    "  int id = gl_VertexID;",
    "  ivec2 tc = ivec2(id % int(u_side), id / int(u_side));",
    "  vec4 s = texelFetch(u_pos, tc, 0);",
    "  vec3 p = s.xyz;",
    "  gl_Position = vec4(p.x / u_aspect, p.y, 0.0, 1.0);",
    "  float depth = 0.5 + 0.5 * p.z;",
    "  gl_PointSize = u_size * mix(0.5, 2.0, depth);",
    /* Fades in and out with age, so a respawn is a particle appearing rather
       than a particle jumping. */
    "  float fade = smoothstep(0.0, 0.12, s.w) * smoothstep(1.0, 0.82, s.w);",
    "  v_fade = mix(0.05, 0.42, depth) * fade * (1.0 - smoothstep(0.8, 1.25, length(p.xy)));",
    "  v_seed = float(id) * 0.0000153;",
    "}",
  ].join("\n");

  var DRAW_FS = [
    "#version 300 es",
    "precision highp float;",
    "in float v_fade;",
    "in float v_seed;",
    "uniform float u_light;",
    "out vec4 o;",
    "void main(){",
    "  vec2 c = gl_PointCoord - 0.5;",
    "  float r = dot(c, c) * 4.0;",
    "  if (r > 1.0) discard;",
    "  float a = (1.0 - r) * v_fade;",
    "  vec3 warm = vec3(1.00, 0.86, 0.68);",
    "  vec3 cool = vec3(0.30, 0.46, 0.72);",
    "  vec3 col = mix(cool, warm, smoothstep(0.3, 0.8, fract(v_seed)));",
    "  col = mix(col, vec3(0.10, 0.12, 0.16), u_light);",
    "  o = vec4(col * a, a);",
    "}",
  ].join("\n");

  function sh(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      if (window.console && console.warn) console.warn("[field-sim]", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  function program(vs, fs, names) {
    var a = sh(gl.VERTEX_SHADER, vs),
      b = sh(gl.FRAGMENT_SHADER, fs);
    if (!a || !b) return null;
    var p = gl.createProgram();
    gl.attachShader(p, a);
    gl.attachShader(p, b);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      if (window.console && console.warn) console.warn("[field-sim] link", gl.getProgramInfoLog(p));
      return null;
    }
    p.u = {};
    names.forEach(function (n) {
      p.u[n] = gl.getUniformLocation(p, n);
    });
    return p;
  }

  function makeTex(data) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, SIDE, SIDE, 0, gl.RGBA, gl.FLOAT, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  function boot() {
    host = document.getElementById("hero-field");
    if (!host) return false;
    canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);
    try {
      gl = canvas.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: true });
    } catch (e) {}
    if (!gl) {
      canvas.remove();
      return false;
    }
    /* The one hard requirement. Without float render targets there is
       nowhere to keep the state, and the caller keeps the displacement
       version instead. */
    if (!gl.getExtension("EXT_color_buffer_float")) {
      canvas.remove();
      gl = null;
      return false;
    }

    simP = program(FS_VS, SIM_FS, ["u_prev", "u_seed", "u_dt", "u_time", "u_ptr"]);
    drawP = program(DRAW_VS, DRAW_FS, ["u_pos", "u_side", "u_aspect", "u_size", "u_light"]);
    if (!simP || !drawP) {
      canvas.remove();
      gl = null;
      return false;
    }

    /* Seeds. A Fibonacci disc so the rest state is even, with the fourth
       channel carrying a per-particle constant used to stagger the respawn
       clock. */
    var seed = new Float32Array(N * 4);
    for (var i = 0; i < N; i++) {
      var a = i * 2.399963229728653;
      var rr = Math.sqrt((i + 0.5) / N);
      seed[i * 4] = Math.cos(a) * rr * 1.02;
      seed[i * 4 + 1] = Math.sin(a) * rr * 1.02;
      seed[i * 4 + 2] = ((i * 0.6180339887) % 1) * 2 - 1;
      seed[i * 4 + 3] = (i * 0.7548776662) % 1;
    }
    seedTex = makeTex(seed);
    /* Both state textures start from the seed with a full life, so the first
       frame is already the rest shape rather than a black screen resolving. */
    var init = new Float32Array(N * 4);
    for (var j = 0; j < N; j++) {
      init[j * 4] = seed[j * 4];
      init[j * 4 + 1] = seed[j * 4 + 1];
      init[j * 4 + 2] = seed[j * 4 + 2];
      init[j * 4 + 3] = 0.25 + ((j * 0.381966) % 1) * 0.75;
    }
    texA = makeTex(init);
    texB = makeTex(init);
    fbo = gl.createFramebuffer();

    quadVAO = gl.createVertexArray();
    pointVAO = gl.createVertexArray();

    window.addEventListener("pointermove", onMove, { passive: true });
    return true;
  }

  function onMove(e) {
    var r = host.getBoundingClientRect();
    if (!r.width || !r.height) return;
    ptr.x = ((e.clientX - r.left) / r.width - 0.5) * 2 * (r.width / r.height);
    ptr.y = -((e.clientY - r.top) / r.height - 0.5) * 2;
  }

  function frame(now) {
    raf = 0;
    if (!gl || !live) return;
    var dt = Math.min(0.033, (now - last) / 1000) || 0.016;
    last = now;
    cur.x += (ptr.x - cur.x) * 0.1;
    cur.y += (ptr.y - cur.y) * 0.1;

    var src = flip ? texB : texA;
    var dst = flip ? texA : texB;

    /* ── step ─────────────────────────────────────────────────────────── */
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, dst, 0);
    gl.viewport(0, 0, SIDE, SIDE);
    gl.disable(gl.BLEND);
    gl.useProgram(simP);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, src);
    gl.uniform1i(simP.u.u_prev, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, seedTex);
    gl.uniform1i(simP.u.u_seed, 1);
    gl.uniform1f(simP.u.u_dt, dt);
    gl.uniform1f(simP.u.u_time, (now - t0) / 1000);
    gl.uniform2f(simP.u.u_ptr, cur.x, cur.y);
    gl.bindVertexArray(quadVAO);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    /* ── draw ─────────────────────────────────────────────────────────── */
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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
    gl.useProgram(drawP);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, dst);
    gl.uniform1i(drawP.u.u_pos, 0);
    gl.uniform1f(drawP.u.u_side, SIDE);
    gl.uniform1f(drawP.u.u_aspect, w / h);
    gl.uniform1f(drawP.u.u_size, 2.0 * dpr);
    gl.uniform1f(drawP.u.u_light, document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0);
    gl.bindVertexArray(pointVAO);
    gl.drawArrays(gl.POINTS, 0, N);
    gl.bindVertexArray(null);

    flip ^= 1;
    raf = requestAnimationFrame(frame);
  }

  return {
    start: function () {
      if (live) return false;
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
      if (!gl && !boot()) return false;
      live = true;
      t0 = last = performance.now();
      if (!raf) raf = requestAnimationFrame(frame);
      return true;
    },
    stop: function () {
      live = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
    /* A verification hook, not a feature. */
    state: function () {
      return { live: live, particles: N, gl: !!gl, size: canvas ? [canvas.width, canvas.height] : null };
    },
  };
})();
