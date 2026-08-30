/* ─────────────────────────────────────────────────────────────────────────
   THE WATER CAME BACK

   Sid: "also what happened to the water in my footer".

   It was a section called the surfacing band and it was cut for good reasons
   that are still good: 90vh of page holding a 100vh sticky band and nothing
   else, so what it actually delivered was a full dead screen of murky teal
   you scrolled through twice, with hard vertical edges where it inherited the
   footer's padding. He said, of that: "on my homepage i hate this gradient."

   So this is not that section rebuilt. It costs NO page height at all — it
   lives inside the figure's own sticky stage, as the floor the figure is
   standing over. That fixes both halves at once: there is no corridor to walk
   through, and the water is finally doing something, which is holding the
   Buddha up and giving it back.

   ── WHAT IS ACTUALLY COMPUTED ───────────────────────────────────────────
   A flat plane in fake perspective. Screen y maps through 1/(y+k), which is
   the reciprocal that turns a rectangle into a receding floor and is why the
   ripples get finer and slower toward the waterline instead of the whole
   surface moving at one rate. Four directional waves with irrational periods
   give the normal; the normal displaces the reflection lookup, which is what
   makes a reflection read as water rather than as a mirror.

   ── THE REFLECTION IS SYNTHETIC, AND HONESTLY SO ────────────────────────
   Nothing can sample the DOM — the figure above is a model-viewer canvas and
   there is no API that hands its pixels to another context. So the shader
   does not reflect the figure; it reflects a light the same shape, in the
   same place, in the same colour, mirrored and bent by the surface. On a dark
   pond under a single lit object that is very close to all you would see
   anyway, and it has the enormous advantage of being able to break up
   correctly under the ripples.

   ── FRESNEL ────────────────────────────────────────────────────────────
   Reflectivity climbs toward the waterline, because a grazing angle reflects
   almost everything and a steep one reflects almost nothing. Getting this
   backwards is the single most common way computer water looks wrong: it goes
   uniformly shiny and reads as foil.

   ── RINGS ──────────────────────────────────────────────────────────────
   Four impulse slots. Clicking the figure drops one in; so does the pointer
   crossing the surface, throttled, so a sweep leaves a wake rather than a
   solid wall of rings. ──────────────────────────────────────────────── */
(function () {
  "use strict";

  var stage = document.querySelector(".lastfig__stage");
  var sec = document.getElementById("lastfig");
  if (!stage || !sec) return;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  var mount = document.getElementById("lastfig-mount");

  var cv = document.createElement("canvas");
  cv.className = "lastfig__water";
  cv.setAttribute("aria-hidden", "true");
  var gl = cv.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: false });
  if (!gl) return;
  stage.insertBefore(cv, stage.firstChild);

  var VS = ["#version 300 es", "in vec2 a;", "void main(){ gl_Position = vec4(a,0.,1.); }"].join("\n");

  var FS = [
    "#version 300 es",
    "precision highp float;",
    "uniform vec2 u_res;",
    "uniform float u_t;",
    "uniform float u_sv;",
    "uniform float u_fig;" /* how present the figure above is, 0..1 */,
    "uniform float u_halo;" /* pointer is on the figure */,
    "uniform float u_light;" /* theme */,
    "uniform vec4 u_r0;" /* rings: xy pos, z start time, w strength */,
    "uniform vec4 u_r1;",
    "uniform vec4 u_r2;",
    "uniform vec4 u_r3;",
    "out vec4 o;",

    /* Everything the surface reflects, as a function of a direction on the
       far side of the waterline. Two things live up there: the sky, which is
       the page's own ground colour fading up, and the figure, which is a warm
       disc a little above the horizon. */
    "vec3 sky(vec2 p){",
    "  float h = clamp(p.y, 0.0, 1.0);",
    "  vec3 c = mix(vec3(0.035, 0.055, 0.080), vec3(0.012, 0.018, 0.030), h);",
    /* The figure. Centred, sitting just above the waterline, warm, and wide
       enough that the ripples have something to break into pieces. */
    "  vec2 d = (p - vec2(0.5, 0.30)) * vec2(1.0, 1.55);",
    /* Wider than the figure, not narrower. A reflection on a disturbed
       surface is always larger and softer than the thing it reflects --
       every ripple that is not exactly level throws some of it sideways --
       so a tight disc reads as a second small object under the water rather
       than as the first one coming back. */
    "  float f = exp(-dot(d, d) * 15.0);",
    "  c += vec3(0.66, 0.60, 0.40) * f * u_fig;",
    /* And its halo, which only exists while the pointer is on it — so
       touching the figure lights the water under it. */
    "  c += vec3(0.30, 0.62, 0.68) * exp(-dot(d, d) * 7.0) * u_halo * 0.5;",
    "  return c;",
    "}",

    "float ring(vec4 r, vec2 p, float t){",
    "  if (r.w <= 0.0) return 0.0;",
    "  float age = t - r.z;",
    "  if (age < 0.0 || age > 6.0) return 0.0;",
    "  float d = length((p - r.xy) * vec2(1.0, 2.2));",
    /* A ring is a travelling wavefront with a soft envelope: the crest moves
       out at a fixed speed, the packet spreads, and the whole thing decays.
       Three separate falloffs, and all three are needed or it reads as a
       bullseye rather than as a disturbance. */
    "  float front = d - age * 0.30;",
    "  return sin(front * 46.0) * exp(-front * front * 90.0) * exp(-age * 0.75) * r.w;",
    "}",

    "void main(){",
    "  vec2 uv = gl_FragCoord.xy / u_res;",
    /* y = 0 at the bottom of the canvas, 1 at the waterline. Flip so v runs
       from the horizon down toward the viewer. */
    "  float v = 1.0 - uv.y;",
    /* The reciprocal that makes a rectangle a floor. The +0.05 is what keeps
       the horizon from going to infinity and taking the ripple frequency with
       it. */
    "  float z = 1.0 / (v + 0.05);",
    "  float ar = u_res.x / u_res.y;",
    "  vec2 p = vec2((uv.x - 0.5) * z * ar * 0.5, z);",

    /* Four waves. The periods are deliberately not related — two waves at a
       simple ratio produce a visible beat, which the eye reads as a pattern
       and therefore as fake. */
    "  float t = u_t;",
    "  float w = 0.0;",
    "  w += sin(p.x * 3.10 + p.y * 1.70 - t * 1.05) * 0.50;",
    "  w += sin(p.x * -2.30 + p.y * 3.90 - t * 0.83) * 0.38;",
    "  w += sin(p.x * 5.70 + p.y * 4.30 - t * 1.60) * 0.20;",
    "  w += sin(p.x * -7.90 + p.y * 6.10 - t * 2.10) * 0.11;",
    /* Scroll shear. Throwing the page pushes the surface sideways, which is
       the one place the water is allowed to acknowledge the document. */
    "  w += sin(p.x * 2.0 + u_sv * 3.0) * 0.18 * abs(u_sv);",

    "  w += ring(u_r0, uv, t) + ring(u_r1, uv, t) + ring(u_r2, uv, t) + ring(u_r3, uv, t);",

    /* The normal, by finite difference on the same wave sum. Cheaper and more
       stable here than an analytic derivative because the ring term is not
       differentiable in closed form. */
    "  float e = 0.0025;",
    "  vec2 q = p + vec2(e, 0.0);",
    "  float wx = sin(q.x * 3.10 + q.y * 1.70 - t * 1.05) * 0.50 + sin(q.x * -2.30 + q.y * 3.90 - t * 0.83) * 0.38;",
    "  q = p + vec2(0.0, e);",
    "  float wy = sin(q.x * 3.10 + q.y * 1.70 - t * 1.05) * 0.50 + sin(q.x * -2.30 + q.y * 3.90 - t * 0.83) * 0.38;",
    "  float base = sin(p.x * 3.10 + p.y * 1.70 - t * 1.05) * 0.50 + sin(p.x * -2.30 + p.y * 3.90 - t * 0.83) * 0.38;",
    "  vec2 n = vec2(wx - base, wy - base) / e;",
    /* Damped toward the horizon: at a grazing angle a wave of a given height
       displaces the reflection far less in screen space. Without this the far
       water boils. */
    "  n *= 0.016 * clamp(v * 2.2, 0.10, 1.0);",

    /* The mirrored lookup. Reflecting about the waterline means the figure
       lands directly under itself, which is the thing that makes a reflection
       legible as a reflection. */
    "  vec2 m = vec2(uv.x + n.x, v * 1.15) + n * vec2(1.0, 0.6);",
    "  vec3 refl = sky(m);",

    /* Fresnel. Almost everything at the horizon, almost nothing underfoot. */
    "  float fres = pow(clamp(1.0 - v, 0.0, 1.0), 2.4);",
    /* The page's ground is #04070c. Water DARKER than the surface it sits on
       cannot be seen at all -- the first values were 0.020/0.033/0.046, which
       is below the page, and the pond was a rectangle of nothing. A pond
       reads because it is lighter and cooler than the room around it. */
    "  vec3 deep = vec3(0.078, 0.120, 0.152);",
    /* The floor was 0.16, which on a page this dark means the near water is
       98% "deep" and deep is nearly the page colour. 0.34 keeps the whole
       sheet reading as a surface with something in it. */
    "  vec3 col = mix(deep, refl, 0.34 + 0.66 * fres);",

    /* Specular. The crests catch the same light the figure is lit by; the high
       exponent is what keeps them as glints rather than as a sheen. */
    "  float spec = pow(clamp(w * 0.5 + 0.5, 0.0, 1.0), 16.0);",
    "  col += vec3(0.62, 0.78, 0.86) * spec * (0.30 + 0.70 * fres) * (0.55 + 0.45 * u_fig);",
    /* A horizon. One bright line where the surface meets the far distance is
       the cheapest possible cue that a plane is receding, and without it a
       lit rectangle is just a lit rectangle. */
    "  col += vec3(0.34, 0.52, 0.60) * exp(-v * 20.0) * 0.95;",

    /* On cream the pond is a pale, cool sheet rather than a dark one -- a
       black pool on a paper-white page reads as a hole cut in the document. */
    "  col = mix(col, mix(vec3(0.80, 0.84, 0.88), col + 0.62, 0.55), u_light);",

    /* The edges. The old band's fatal flaw was hard vertical edges; this
       fades out on all four sides so the water has no boundary you can point
       at, only a middle. */
    "  float edge = smoothstep(0.0, 0.16, uv.x) * smoothstep(0.0, 0.16, 1.0 - uv.x);",
    /* ── THE TOP FADE WAS EATING THE ONLY BRIGHT PART ──────────────────
       This was smoothstep(0.0, 0.30, v), which fades the pond in over the
       first 30% below the waterline. But v is measured FROM the waterline and
       fresnel is strongest at v = 0 -- so the fade was removing exactly the
       grazing-angle band where a real pond does all of its reflecting, and
       leaving only the dark near water. The result was a rectangle of almost
       nothing with a faint glow above it.

       6% instead: enough that there is no hard line where the water starts,
       short enough that the horizon survives. */
    "  edge *= smoothstep(0.0, 0.06, v) * smoothstep(0.0, 0.14, 1.0 - v);",
    "  o = vec4(col, edge);",
    "}",
  ].join("\n");

  function sh(ty, src) {
    var s = gl.createShader(ty);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn("water: " + gl.getShaderInfoLog(s));
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
  gl.bindAttribLocation(prog, 0, "a");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn("water: " + gl.getProgramInfoLog(prog));
    return;
  }
  gl.useProgram(prog);
  var vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  var U = {};
  ["u_res", "u_t", "u_sv", "u_fig", "u_halo", "u_light", "u_r0", "u_r1", "u_r2", "u_r3"].forEach(function (k) {
    U[k] = gl.getUniformLocation(prog, k);
  });

  var SCALE = 0.62;
  function size() {
    var r = cv.getBoundingClientRect();
    var w = Math.max(2, Math.round(r.width * SCALE)),
      h = Math.max(2, Math.round(r.height * SCALE));
    if (cv.width === w && cv.height === h) return;
    cv.width = w;
    cv.height = h;
    gl.viewport(0, 0, w, h);
  }

  /* ── rings ───────────────────────────────────────────────────────────── */
  var rings = [
    [0, 0, -99, 0],
    [0, 0, -99, 0],
    [0, 0, -99, 0],
    [0, 0, -99, 0],
  ];
  var slot = 0,
    lastDrop = -1;
  function drop(x, y, strength) {
    rings[slot] = [x, y, clock, strength];
    slot = (slot + 1) % 4;
  }
  cv.style.pointerEvents = "none";
  /* The stage owns the listener rather than the canvas, because the canvas is
     inert to the pointer -- the figure above it has to keep its own hover. */
  stage.addEventListener(
    "pointermove",
    function (e) {
      var r = cv.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;
      /* Throttled, or a single sweep across the pond fills all four slots in
         one frame and the wake becomes a wall. */
      if (clock - lastDrop < 0.22) return;
      lastDrop = clock;
      drop((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height, 0.55);
    },
    { passive: true }
  );
  if (mount)
    mount.addEventListener("pointerdown", function () {
      /* Directly under the figure, hard. Touching the object disturbs what it
         is standing over, which is the only way the two read as one scene. */
      drop(0.5, 0.92, 1.6);
    });

  /* ── loop ────────────────────────────────────────────────────────────── */
  var raf = 0,
    clock = 0,
    last = 0,
    acc = 0,
    live = false;

  new IntersectionObserver(
    function (es) {
      live = es[0].isIntersecting;
      if (live && !raf) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    },
    { rootMargin: "200px 0px" }
  ).observe(sec);

  function frame(now) {
    if (!live) {
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(frame);
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    acc += dt;
    if (acc < 1 / 40) return;
    acc = 0;
    clock += dt;

    size();
    /* --f is written on the MOUNT and --halo on the STAGE, by the figure's own
       script. Read from the SECTION, as this did first, both come back as
       empty strings and parseFloat gives NaN -- so u_fig sat at zero, the
       reflection had nothing in it to reflect, and the pond rendered as a
       nearly-black sheet on a nearly-black page. Invisible, while every check
       it made of itself passed. */
    var fig = mount ? parseFloat(getComputedStyle(mount).getPropertyValue("--f")) : 0;
    var halo = parseFloat(getComputedStyle(stage).getPropertyValue("--halo"));
    if (!(fig >= 0)) fig = 0;
    if (!(halo >= 0)) halo = 0;

    gl.useProgram(prog);
    gl.bindVertexArray(vao);
    gl.uniform2f(U.u_res, cv.width, cv.height);
    gl.uniform1f(U.u_t, clock);
    gl.uniform1f(U.u_sv, typeof window.__sv === "function" ? window.__sv() : 0);
    gl.uniform1f(U.u_fig, Math.min(1, fig * 3));
    gl.uniform1f(U.u_halo, halo);
    gl.uniform1f(U.u_light, document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0);
    gl.uniform4fv(U.u_r0, rings[0]);
    gl.uniform4fv(U.u_r1, rings[1]);
    gl.uniform4fv(U.u_r2, rings[2]);
    gl.uniform4fv(U.u_r3, rings[3]);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  if (reduce) {
    /* One frame, then stop. The reflection and the fresnel are most of what
       this is; the motion is the part that has to go. */
    live = true;
    size();
    requestAnimationFrame(frame);
    setTimeout(function () {
      live = false;
    }, 120);
  }
})();
