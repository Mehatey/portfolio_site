/* ═══════════════════════════════════════════════════════════════════════════
   01 · INK — THE SENTENCE IN A REAL FLUID

   Sid: "not cool enough."

   Correct. Chrome type is a 2023 look: it is on a hundred portfolios, and
   however well the metal is shaded it cannot surprise anybody. Competence is
   not the same as being worth remembering.

   So this is not a material on a shape. It is a fluid simulation, and the
   sentence is dye injected into it.

   WHAT IS ACTUALLY RUNNING

   Navier-Stokes, incompressible, on the GPU. The full loop every frame:

     1  ADVECT VELOCITY   the field carries itself downstream
     2  DIVERGENCE        where fluid is accumulating or draining
     3  PRESSURE          24 Jacobi iterations solving for the field that
                          cancels that divergence
     4  SUBTRACT GRADIENT the projection step; what comes out is
                          divergence-free, which is what makes it a fluid
                          rather than a smear
     5  ADVECT DYE        the ink is carried by the corrected velocity
     6  RENDER

   Step 3 is the one everybody skips. Without a pressure solve you get a
   displacement field that looks vaguely fluid-ish and cannot form a vortex,
   because nothing enforces conservation of mass. With it you get real
   curl -- ink wraps around itself, sheets roll into spirals, and a stroke
   left behind by the cursor keeps turning after the cursor has gone.

   VORTICITY CONFINEMENT

   A grid this coarse loses small eddies to numerical dissipation within a
   second. Vorticity confinement measures the curl that is left, finds the
   direction that would strengthen it, and pushes back along it -- so the
   small structure survives instead of blurring out. It is the difference
   between smoke and fog.

   THE SENTENCE IS THE INK

   "PRODUCT DESIGNER" is rasterised once and re-injected on a slow cycle. So
   the words form, are taken apart by the flow they are sitting in, dissolve,
   and are written again. Nothing about that is a transition between two
   states -- the letters are made of the same stuff that is destroying them.

   And the cursor is a hand in water: it adds velocity, not just colour, so
   what you disturb keeps moving after you stop.
   ═══════════════════════════════════════════════════════════════════════════ */
window.__ink = (function () {
  "use strict";

  /* Velocity is coarse and dye is fine. Standard, and the reason is that the
     eye reads the DYE's resolution and the velocity's only through it -- so
     the expensive part, the pressure solve, runs on the small grid. */
  var SIM_W = 256,
    SIM_H = 144;
  var DYE_W = 1024,
    DYE_H = 576;
  var PRESSURE_ITER = 24;

  var host = null,
    canvas = null,
    gl = null,
    vao = null,
    raf = 0,
    t0 = 0,
    last = 0,
    live = false,
    ready = false;
  var P = {};
  var vel = null,
    dye = null,
    div = null,
    prs = null,
    txt = null;
  var ptr = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, down: 0, moved: 0 };
  var injectT = 0;

  var VS = [
    "#version 300 es",
    "const vec2 Q[3] = vec2[3](vec2(-1.,-1.), vec2(3.,-1.), vec2(-1.,3.));",
    "out vec2 v_uv;",
    "void main(){ vec2 p = Q[gl_VertexID]; v_uv = p * 0.5 + 0.5; gl_Position = vec4(p,0.,1.); }",
  ].join("\n");

  var HEAD = "#version 300 es\nprecision highp float;\nin vec2 v_uv;\nout vec4 o;\n";

  /* ── 1 · ADVECTION ────────────────────────────────────────────────────
     Semi-Lagrangian: for each cell, walk BACKWARD along the velocity and
     sample where the stuff now here used to be. Unconditionally stable at
     any timestep, which is why every real-time fluid uses it. */
  var ADVECT =
    HEAD +
    [
      "uniform sampler2D u_src, u_vel;",
      "uniform vec2 u_texel;",
      "uniform float u_dt, u_diss;",
      "void main(){",
      "  vec2 back = v_uv - texture(u_vel, v_uv).xy * u_dt * u_texel;",
      "  o = texture(u_src, back) * u_diss;",
      "}",
    ].join("\n");

  /* ── 2 · DIVERGENCE ───────────────────────────────────────────────────
     How much the field is gaining or losing at each cell. A real fluid has
     none; this is the error the pressure step exists to cancel. */
  var DIVERGENCE =
    HEAD +
    [
      "uniform sampler2D u_vel;",
      "uniform vec2 u_texel;",
      "void main(){",
      "  float l = texture(u_vel, v_uv - vec2(u_texel.x, 0.0)).x;",
      "  float r = texture(u_vel, v_uv + vec2(u_texel.x, 0.0)).x;",
      "  float b = texture(u_vel, v_uv - vec2(0.0, u_texel.y)).y;",
      "  float t = texture(u_vel, v_uv + vec2(0.0, u_texel.y)).y;",
      "  o = vec4(0.5 * (r - l + t - b), 0.0, 0.0, 1.0);",
      "}",
    ].join("\n");

  /* ── 3 · PRESSURE ─────────────────────────────────────────────────────
     Jacobi iteration on the Poisson equation. Each pass averages the four
     neighbours and subtracts the divergence; run enough times it converges
     on the pressure field whose gradient exactly cancels the error. 24 is
     well past the point where more is visible at this grid size. */
  var PRESSURE =
    HEAD +
    [
      "uniform sampler2D u_prs, u_div;",
      "uniform vec2 u_texel;",
      "void main(){",
      "  float l = texture(u_prs, v_uv - vec2(u_texel.x, 0.0)).x;",
      "  float r = texture(u_prs, v_uv + vec2(u_texel.x, 0.0)).x;",
      "  float b = texture(u_prs, v_uv - vec2(0.0, u_texel.y)).x;",
      "  float t = texture(u_prs, v_uv + vec2(0.0, u_texel.y)).x;",
      "  float d = texture(u_div, v_uv).x;",
      "  o = vec4((l + r + b + t - d) * 0.25, 0.0, 0.0, 1.0);",
      "}",
    ].join("\n");

  /* ── 4 · PROJECTION ───────────────────────────────────────────────────
     Subtract the pressure gradient. What comes out is divergence free, and
     THIS is the step that separates a fluid from a displacement field --
     without it nothing can circulate, because circulation requires that what
     leaves one place arrives somewhere else. */
  var GRADIENT =
    HEAD +
    [
      "uniform sampler2D u_prs, u_vel;",
      "uniform vec2 u_texel;",
      "void main(){",
      "  float l = texture(u_prs, v_uv - vec2(u_texel.x, 0.0)).x;",
      "  float r = texture(u_prs, v_uv + vec2(u_texel.x, 0.0)).x;",
      "  float b = texture(u_prs, v_uv - vec2(0.0, u_texel.y)).x;",
      "  float t = texture(u_prs, v_uv + vec2(0.0, u_texel.y)).x;",
      "  vec2 V = texture(u_vel, v_uv).xy - vec2(r - l, t - b) * 0.5;",
      "  o = vec4(V, 0.0, 1.0);",
      "}",
    ].join("\n");

  /* ── VORTICITY CONFINEMENT ────────────────────────────────────────────
     Measure the curl, take the gradient of its magnitude, and push along the
     perpendicular -- feeding energy back into whatever rotation survives.
     Without it a coarse grid dissipates every small eddy in about a second
     and the result reads as fog rather than smoke. */
  var VORTICITY =
    HEAD +
    [
      "uniform sampler2D u_vel;",
      "uniform vec2 u_texel;",
      "uniform float u_dt, u_curl;",
      "float curlAt(vec2 uv){",
      "  float t = texture(u_vel, uv + vec2(0.0, u_texel.y)).x;",
      "  float b = texture(u_vel, uv - vec2(0.0, u_texel.y)).x;",
      "  float r = texture(u_vel, uv + vec2(u_texel.x, 0.0)).y;",
      "  float l = texture(u_vel, uv - vec2(u_texel.x, 0.0)).y;",
      "  return r - l - t + b;",
      "}",
      "void main(){",
      "  float c = curlAt(v_uv);",
      "  float cl = abs(curlAt(v_uv - vec2(u_texel.x, 0.0)));",
      "  float cr = abs(curlAt(v_uv + vec2(u_texel.x, 0.0)));",
      "  float cb = abs(curlAt(v_uv - vec2(0.0, u_texel.y)));",
      "  float ct = abs(curlAt(v_uv + vec2(0.0, u_texel.y)));",
      "  vec2 g = vec2(cr - cl, ct - cb) * 0.5;",
      "  g /= length(g) + 1e-5;",
      "  vec2 force = vec2(g.y, -g.x) * c * u_curl;",
      "  o = vec4(texture(u_vel, v_uv).xy + force * u_dt, 0.0, 1.0);",
      "}",
    ].join("\n");

  /* ── SPLAT ────────────────────────────────────────────────────────────
     A gaussian of velocity or colour, added rather than assigned, so two
     splats in the same place reinforce instead of replacing. */
  var SPLAT =
    HEAD +
    [
      "uniform sampler2D u_src;",
      "uniform vec2 u_point;",
      "uniform vec3 u_value;",
      "uniform float u_radius, u_aspect;",
      "void main(){",
      "  vec2 d = (v_uv - u_point) * vec2(u_aspect, 1.0);",
      "  vec3 add = exp(-dot(d, d) / u_radius) * u_value;",
      "  o = vec4(texture(u_src, v_uv).xyz + add, 1.0);",
      "}",
    ].join("\n");

  /* ── INJECT THE SENTENCE ──────────────────────────────────────────────
     The words written into the dye. Not a splat: a masked add, so the ink
     arrives in exactly the shape of the letters and is then immediately at
     the mercy of whatever the fluid is doing. */
  var INJECT =
    HEAD +
    [
      "uniform sampler2D u_src, u_txt;",
      "uniform float u_amt;",
      "void main(){",
      "  float m = texture(u_txt, v_uv).r;",
      "  vec3 c = texture(u_src, v_uv).xyz;",
      /* Warm at the core, cooler at the edges of a stroke, so the ink has depth
       the instant it lands rather than being a flat fill. */ "  vec3 tint = mix(vec3(0.30, 0.46, 0.72), vec3(1.00, 0.86, 0.68), smoothstep(0.35, 0.95, m));",
      "  o = vec4(c + tint * m * u_amt, 1.0);",
      "}",
    ].join("\n");

  /* ── RENDER ───────────────────────────────────────────────────────────
     Shaded by the GRADIENT of the dye, not the dye itself. Raw density is a
     flat stain; its slope is where the structure is, and lighting that slope
     gives smoke a surface. Same reasoning as the reaction-diffusion
     direction, and it is the single thing that separates a fluid demo that
     looks like a screensaver from one that looks like ink. */
  var RENDER =
    HEAD +
    [
      "uniform sampler2D u_dye;",
      "uniform vec2 u_texel;",
      "uniform float u_light;",
      "void main(){",
      "  vec3 c = texture(u_dye, v_uv).xyz;",
      "  float lum = dot(c, vec3(0.33));",
      "  float gx = dot(texture(u_dye, v_uv + vec2(u_texel.x, 0.0)).xyz, vec3(0.33)) - dot(texture(u_dye, v_uv - vec2(u_texel.x, 0.0)).xyz, vec3(0.33));",
      "  float gy = dot(texture(u_dye, v_uv + vec2(0.0, u_texel.y)).xyz, vec3(0.33)) - dot(texture(u_dye, v_uv - vec2(0.0, u_texel.y)).xyz, vec3(0.33));",
      "  vec3 N = normalize(vec3(-gx * 42.0, -gy * 42.0, 1.0));",
      "  vec3 L = normalize(vec3(-0.42, 0.68, 0.60));",
      "  float dif = max(0.0, dot(N, L));",
      "  float rim = pow(1.0 - clamp(N.z, 0.0, 1.0), 1.7);",
      "  vec3 col = c * (0.55 + dif * 0.8) + vec3(1.0, 0.93, 0.84) * rim * lum * 1.1;",
      "  float a = clamp(lum * 2.2, 0.0, 1.0);",
      "  col = mix(col, mix(col, vec3(0.10, 0.12, 0.16), 0.55), u_light);",
      "  o = vec4(col * a, a);",
      "}",
    ].join("\n");

  function sh(t, src) {
    var s = gl.createShader(t);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      if (window.console && console.warn) console.warn("[ink]", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  function prog(fs, names) {
    var a = sh(gl.VERTEX_SHADER, VS),
      b = sh(gl.FRAGMENT_SHADER, fs);
    if (!a || !b) return null;
    var p = gl.createProgram();
    gl.attachShader(p, a);
    gl.attachShader(p, b);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      if (window.console && console.warn) console.warn("[ink] link", gl.getProgramInfoLog(p));
      return null;
    }
    p.u = {};
    names.forEach(function (n) {
      p.u[n] = gl.getUniformLocation(p, n);
    });
    return p;
  }

  /* A double-buffered float target: read one, write the other, swap. */
  function fbo(w, h, internal, format) {
    function make() {
      var t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.HALF_FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      var f = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, f);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { t: t, f: f };
    }
    return {
      a: make(),
      b: make(),
      w: w,
      h: h,
      texel: [1 / w, 1 / h],
      swap: function () {
        var s = this.a;
        this.a = this.b;
        this.b = s;
      },
    };
  }

  function draw(target) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.f : null);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function bindTex(p, name, tex, unit) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(p.u[name], unit);
  }

  function makeText() {
    var c = document.createElement("canvas");
    c.width = DYE_W;
    c.height = DYE_H;
    var x = c.getContext("2d");
    x.fillStyle = "#000";
    x.fillRect(0, 0, DYE_W, DYE_H);
    x.fillStyle = "#fff";
    x.textAlign = "center";
    x.textBaseline = "middle";
    /* Softened, because a hard-edged injection into a fluid produces a hard
       edge that the advection then smears into a visible stair. A blurred
       source dissolves the way ink actually does. */
    x.filter = "blur(2px)";
    var f = 'Figtree, "Helvetica Neue", Arial, sans-serif';
    x.letterSpacing = "10px";
    x.font = "600 " + Math.round(DYE_W * 0.088) + "px " + f;
    x.fillText("PRODUCT", DYE_W / 2, DYE_H * 0.4);
    x.fillText("DESIGNER", DYE_W / 2, DYE_H * 0.6);
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    return t;
  }

  function boot() {
    host = document.getElementById("hero-solid");
    if (!host) return false;
    canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);
    try {
      gl = canvas.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: true });
    } catch (e) {}
    if (!gl) {
      host.remove();
      return false;
    }
    /* Half float is enough for velocity and dye and is far more widely
       available than full float rendering. Without the linear filter the
       advection has to be done with nearest sampling, which is visibly
       blocky, so this is a hard requirement rather than a nicety. */
    if (!gl.getExtension("EXT_color_buffer_half_float") && !gl.getExtension("EXT_color_buffer_float")) {
      host.remove();
      gl = null;
      return false;
    }
    gl.getExtension("OES_texture_half_float_linear");

    P.advect = prog(ADVECT, ["u_src", "u_vel", "u_texel", "u_dt", "u_diss"]);
    P.div = prog(DIVERGENCE, ["u_vel", "u_texel"]);
    P.prs = prog(PRESSURE, ["u_prs", "u_div", "u_texel"]);
    P.grad = prog(GRADIENT, ["u_prs", "u_vel", "u_texel"]);
    P.vort = prog(VORTICITY, ["u_vel", "u_texel", "u_dt", "u_curl"]);
    P.splat = prog(SPLAT, ["u_src", "u_point", "u_value", "u_radius", "u_aspect"]);
    P.inject = prog(INJECT, ["u_src", "u_txt", "u_amt"]);
    P.render = prog(RENDER, ["u_dye", "u_texel", "u_light"]);
    for (var k in P)
      if (!P[k]) {
        host.remove();
        gl = null;
        return false;
      }

    vel = fbo(SIM_W, SIM_H, gl.RG16F, gl.RG);
    dye = fbo(DYE_W, DYE_H, gl.RGBA16F, gl.RGBA);
    div = fbo(SIM_W, SIM_H, gl.R16F, gl.RED);
    prs = fbo(SIM_W, SIM_H, gl.R16F, gl.RED);
    txt = makeText();
    vao = gl.createVertexArray();

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    ready = true;
    return true;
  }

  function onMove(e) {
    var r = host.getBoundingClientRect();
    if (!r.width) return;
    ptr.px = ptr.x;
    ptr.py = ptr.y;
    ptr.x = (e.clientX - r.left) / r.width;
    ptr.y = 1 - (e.clientY - r.top) / r.height;
    if (e.clientY >= r.top && e.clientY <= r.bottom) ptr.moved = 1;
  }
  function onDown(e) {
    var r = host.getBoundingClientRect();
    if (e.clientY < r.top || e.clientY > r.bottom) return;
    ptr.down = 1;
  }

  function splat(target, x, y, vx, vy, vz, radius) {
    gl.viewport(0, 0, target.w, target.h);
    gl.useProgram(P.splat);
    bindTex(P.splat, "u_src", target.a.t, 0);
    gl.uniform2f(P.splat.u.u_point, x, y);
    gl.uniform3f(P.splat.u.u_value, vx, vy, vz);
    gl.uniform1f(P.splat.u.u_radius, radius);
    gl.uniform1f(P.splat.u.u_aspect, target.w / target.h);
    draw(target.b);
    target.swap();
  }

  function frame(now) {
    raf = 0;
    if (!gl || !live || !ready) return;
    var dtReal = Math.min(0.033, (now - last) / 1000) || 0.016;
    last = now;
    /* The solver runs on a FIXED step regardless of the frame delta. A fluid
       integrated on a variable step changes its own viscosity with the
       framerate -- the same class of bug this codebase has found five times,
       and by far the worst place to have it, because it would mean the
       simulation behaved differently on a 60Hz and a 120Hz display. */
    var dt = 0.016;

    gl.bindVertexArray(vao);
    gl.disable(gl.BLEND);

    /* ── the hand in the water ── */
    if (ptr.moved) {
      var dx = (ptr.x - ptr.px) * 3400;
      var dy = (ptr.y - ptr.py) * 3400;
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        splat(vel, ptr.x, ptr.y, dx, dy, 0, 0.00035);
        /* A trace of ink follows the hand, so a stroke is visible as well as
           felt. Cool, so it reads as separate from the warm sentence. */
        splat(dye, ptr.x, ptr.y, 0.05, 0.1, 0.18, 0.00012);
      }
      ptr.px = ptr.x;
      ptr.py = ptr.y;
    }
    if (ptr.down) {
      /* A click is a burst: eight splats on a ring, which makes an expanding
         vortex ring rather than a single blob. */
      for (var b = 0; b < 8; b++) {
        var a2 = (b / 8) * Math.PI * 2;
        splat(vel, ptr.x, ptr.y, Math.cos(a2) * 3800, Math.sin(a2) * 3800, 0, 0.0006);
      }
      splat(dye, ptr.x, ptr.y, 0.5, 0.42, 0.34, 0.0004);
      ptr.down = 0;
    }

    /* ── the sentence, written into the ink ── */
    injectT += dtReal;
    /* Every four seconds, over about a second, so the words are always
    /* ── CONTINUOUS, NOT PULSED ─────────────────────────────────────────
       The first design wrote the sentence hard every five seconds and let it
       dissolve. That gives a hero which is blank for most of its cycle: at
       five and a half seconds against dye fading roughly a quarter a second,
       there is a four second hole in the middle where the frame has nothing
       in it. Measured by screenshotting five seconds after a disturbance and
       finding an empty page.

       The ink is injected EVERY frame at a low rate instead. The words are
       permanently being written and permanently being destroyed, and what
       you see is the equilibrium between the two -- always legible, always
       moving, never absent. Disturb it and the balance tips toward
       destruction for a few seconds until the writing catches up, which is
       the behaviour that makes stirring it feel like it cost something.

       A slow breath on the rate, so the equilibrium itself drifts and the
       page is never twice in the same state. */
    /* ── SOLVED, NOT GUESSED ────────────────────────────────────────────
       Continuous injection against exponential decay settles at

         equilibrium = amount / (1 - dissipation)

       and every previous number here was picked by eye against a DIFFERENT
       dissipation, so each time the fade was retuned the ink went either
       invisible or blown out. At 0.095 against 0.987 the steady state is
       7.3, which the renderer maps to alpha 1 across every stroke -- a
       white slab, which is exactly what it looked like.

       For a steady state of about 0.9 -- bright, not clipped -- the amount
       is 0.9 * (1 - 0.987). The breath is a tenth of that. */
    var amt = 0.0117 + Math.sin(injectT * 0.42) * 0.0012;
    if (amt > 0.0005) {
      gl.viewport(0, 0, dye.w, dye.h);
      gl.useProgram(P.inject);
      bindTex(P.inject, "u_src", dye.a.t, 0);
      bindTex(P.inject, "u_txt", txt, 1);
      gl.uniform1f(P.inject.u.u_amt, amt);
      draw(dye.b);
      dye.swap();
    }

    /* ── BUOYANCY, REMOVED ────────────────────────────────────────────
       I added a buoyancy pass so the ink would rise on its own and the hero
       would be alive without a cursor. It is the right idea and this was the
       wrong place for it: buoyancy ADDS to the velocity field every frame
       and nothing removes it, so however small the constant, it integrates
       into a standing updraught that carries the dye off the top of the
       frame. At 320 the screen was empty in a second; at 22 the words were
       still being dragged apart faster than they could be read.

       The fluid does not need it. The letters are injected into a field that
       already has the previous injection's motion in it, plus whatever the
       reader has done, and the vorticity term keeps that alive for a long
       time. What was missing was never ambient force -- it was that the
       words dissolved before the flow had done anything to them. */
    /* ── vorticity ── */
    gl.viewport(0, 0, SIM_W, SIM_H);
    gl.useProgram(P.vort);
    bindTex(P.vort, "u_vel", vel.a.t, 0);
    gl.uniform2f(P.vort.u.u_texel, vel.texel[0], vel.texel[1]);
    gl.uniform1f(P.vort.u.u_dt, dt);
    /* And less curl. At 22 the confinement was replacing most of what the
       dissipation removed, which is how a fluid ends up in perpetual
       motion. */
    gl.uniform1f(P.vort.u.u_curl, 11.0);
    draw(vel.b);
    vel.swap();

    /* ── divergence ── */
    gl.useProgram(P.div);
    bindTex(P.div, "u_vel", vel.a.t, 0);
    gl.uniform2f(P.div.u.u_texel, vel.texel[0], vel.texel[1]);
    draw(div.b);
    div.swap();

    /* ── pressure ── */
    gl.useProgram(P.prs);
    gl.uniform2f(P.prs.u.u_texel, prs.texel[0], prs.texel[1]);
    for (var i = 0; i < PRESSURE_ITER; i++) {
      bindTex(P.prs, "u_prs", prs.a.t, 0);
      bindTex(P.prs, "u_div", div.a.t, 1);
      draw(prs.b);
      prs.swap();
    }

    /* ── projection ── */
    gl.useProgram(P.grad);
    bindTex(P.grad, "u_prs", prs.a.t, 0);
    bindTex(P.grad, "u_vel", vel.a.t, 1);
    gl.uniform2f(P.grad.u.u_texel, vel.texel[0], vel.texel[1]);
    draw(vel.b);
    vel.swap();

    /* ── advect velocity ── */
    gl.useProgram(P.advect);
    gl.uniform2f(P.advect.u.u_texel, vel.texel[0], vel.texel[1]);
    gl.uniform1f(P.advect.u.u_dt, dt);
    /* ── THE WATER HAS TO SETTLE ──────────────────────────────────────
       0.998 is a time constant of 500 frames -- more than eight seconds for
       a stir to decay -- and vorticity confinement is ADDING energy on top
       of that every frame. So the fluid never calmed: it kept churning long
       after the reader had stopped, advecting the ink away as fast as it was
       being written, and the measured result was a hero that stayed blank
       after a single disturbance.

       0.987 is about a second and a half. Long enough that a stroke keeps
       curling after the cursor leaves, short enough that the sentence gets
       its page back. */
    gl.uniform1f(P.advect.u.u_diss, 0.987);
    bindTex(P.advect, "u_vel", vel.a.t, 0);
    bindTex(P.advect, "u_src", vel.a.t, 1);
    draw(vel.b);
    vel.swap();

    /* ── advect dye ── */
    gl.viewport(0, 0, dye.w, dye.h);
    gl.uniform2f(P.advect.u.u_texel, dye.texel[0], dye.texel[1]);
    /* The ink fades faster than the motion does, so the words clear rather
       than silting up into a permanent haze -- with dissipation at 1.0 the
       screen is a uniform smear inside a minute. */
    /* 0.9955 at 60fps is 0.76 a second, so the words are gone in about
       five. 0.9885 is 0.50 a second and they were gone in two, before the
       flow had a chance to do anything interesting to them. */
    /* 0.993, not 0.9962. Dissipation sets the RECOVERY TIME as well as the
       fade: the time constant is 1/(1-diss) frames, so 0.9962 is about four
       and a half seconds to rebuild after a disturbance -- measured, and long
       enough that a visitor who stirs it once sees a mostly-empty hero for
       several seconds afterwards. 0.993 is closer to two, which reads as the
       ink clearing rather than as the page having broken. */
    gl.uniform1f(P.advect.u.u_diss, 0.993);
    bindTex(P.advect, "u_vel", vel.a.t, 0);
    bindTex(P.advect, "u_src", dye.a.t, 1);
    draw(dye.b);
    dye.swap();

    /* ── to the screen ── */
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = Math.max(1, Math.round(host.clientWidth * dpr));
    var h = Math.max(1, Math.round(host.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(P.render);
    bindTex(P.render, "u_dye", dye.a.t, 0);
    gl.uniform2f(P.render.u.u_texel, dye.texel[0], dye.texel[1]);
    gl.uniform1f(P.render.u.u_light, document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0);
    draw(null);
    gl.bindVertexArray(null);
    raf = requestAnimationFrame(frame);
  }

  return {
    start: function () {
      if (live) return false;
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
      if (!gl && !boot()) return false;
      live = true;
      t0 = last = performance.now();
      injectT = 5.0; /* so the sentence writes itself almost immediately */
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
      return {
        live: live,
        gl: !!gl,
        sim: [SIM_W, SIM_H],
        dye: [DYE_W, DYE_H],
        iter: PRESSURE_ITER,
        size: canvas ? [canvas.width, canvas.height] : null,
      };
    },
  };
})();
