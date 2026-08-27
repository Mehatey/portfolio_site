/* ═══════════════════════════════════════════════════════════════════════════
   FIVE HOMEPAGES, ONE PAGE

   Sid: "can you give me a button where i can shuffle between homepages while
   on homepages like a creative way for the person to try a new style and
   composition like a creative playful homepage itself."

   WHAT THIS IS AND WHAT IT DELIBERATELY IS NOT

   It is one hero that can be arranged five ways. It is NOT five heroes.

   The distinction is the whole design. Every direction states the same
   facts -- the sentence, the film, the work, the figure -- and differs only
   in composition, type treatment and technique. So there is no arrangement
   in which a visitor is told something the others withhold, nothing to keep
   in sync, and no way for one of the five to quietly rot because nobody
   looks at it. The markup and the copy have exactly one owner.

   Almost all of the work is CSS, scoped under html[data-home]. This file
   does three things: cycles the attribute, remembers the choice, and boots
   the one direction that needs a renderer of its own.

   THE ORDER

     01  the room      the figure in his room, the film beside him
     02  the index     no image at all. the work, listed.
     03  the field     a curl-noise particle field, the sentence inside it
     04  the terminal  monospace on a hairline grid, the site read out
     05  the film      the reel full bleed, everything else receding

   Deliberately a CYCLE and not a picker. A row of five labelled buttons is a
   settings panel and reads as configuration; one control that advances and
   names where it landed reads as an invitation, and the visitor discovers
   the five rather than being handed a menu of them.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var KEY = "sid_home_dir";
  var DIRS = [
    { id: "room", name: "The room" },
    { id: "index", name: "The index" },
    { id: "field", name: "The field" },
    { id: "terminal", name: "The terminal" },
    { id: "film", name: "The film" },
  ];

  var html = document.documentElement;
  var hero = document.getElementById("hero");
  var btn = document.getElementById("hero-shuffle");
  var elN = document.getElementById("shuffle-n");
  var elName = document.getElementById("shuffle-name");
  if (!hero || !btn || !elN || !elName) return;

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var i = 0;
  try {
    var saved = localStorage.getItem(KEY);
    for (var k = 0; k < DIRS.length; k++) if (DIRS[k].id === saved) i = k;
  } catch (e) {}

  function label() {
    /* Padded so the control does not change width as the number changes,
       which at 11px monospace in the corner of a hero is a visible twitch. */
    elN.textContent = "0" + (i + 1) + "/0" + DIRS.length;
    elName.textContent = DIRS[i].name;
    btn.setAttribute("aria-label", "Homepage direction " + (i + 1) + " of " + DIRS.length + ", " + DIRS[i].name + ". Press for the next one.");
  }

  function paint() {
    /* 01 writes no attribute. A visitor who has never pressed the control and
       a visitor who has cycled back round to the start should be looking at
       byte-identical pages, and the default should not need a selector. */
    if (i === 0) html.removeAttribute("data-home");
    else html.setAttribute("data-home", DIRS[i].id);
    label();
    if (DIRS[i].id === "field") field.start();
    else field.stop();
  }

  btn.addEventListener("click", function () {
    i = (i + 1) % DIRS.length;
    try {
      localStorage.setItem(KEY, DIRS[i].id);
    } catch (e) {}

    btn.classList.add("is-turning");
    setTimeout(function () {
      btn.classList.remove("is-turning");
    }, 660);

    if (REDUCED) {
      paint();
      return;
    }
    /* Out, swap, in. A hard cut between two compositions reads as a bug the
       first time somebody sees it; the dip is what tells them the page
       changed on purpose. 260ms matches the CSS. */
    hero.classList.add("is-swapping");
    setTimeout(function () {
      paint();
      requestAnimationFrame(function () {
        hero.classList.remove("is-swapping");
      });
    }, 260);
  });

  /* ═════════════════════════════════════════════════════════════════════════
     03 · THE FIELD

     A curl-noise displacement field. Every point holds a fixed base position
     and is offset each frame by the curl of a value-noise potential sampled
     at that base, so the cloud swirls, folds and never drains -- curl of any
     field is divergence free, which is precisely why particles driven by one
     do not pile up in sinks the way plain noise sends them.

     It is a DISPLACEMENT, not an advection. Real advection integrates
     velocity into position across frames, which needs the positions to live
     in a float texture and be ping-ponged. This does not: the offset is a
     pure function of (base, time), so there is no state, no framebuffer, no
     float-texture extension to feel out, and nothing to go wrong on a
     machine that lacks one. The read is close to identical at this density
     and it costs one draw call.

     Booted only when this direction is chosen, and torn down when it is left,
     so four visitors in five never compile it.
     ═════════════════════════════════════════════════════════════════════════ */
  var field = (function () {
    var host = document.getElementById("hero-field");
    var gl = null,
      raf = 0,
      prog = null,
      vao = null,
      t0 = 0,
      canvas = null;
    var N = 46000;
    var ptr = { x: 0, y: 0 },
      cur = { x: 0, y: 0 };

    var VS = [
      "#version 300 es",
      "precision highp float;",
      "layout(location=0) in vec3 a_base;",
      "layout(location=1) in float a_seed;",
      "uniform float u_time, u_aspect, u_size;",
      "uniform vec2 u_ptr;",
      "out float v_fade;",
      "out float v_seed;",

      /* Cheap hashed value noise. Not the prettiest gradient noise there is,
         but curl only needs the DERIVATIVES to be continuous, and taking
         central differences of a smoothstepped lattice gives that. */
      "float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }",
      "float vnoise(vec3 x){",
      "  vec3 i = floor(x), f = fract(x);",
      "  f = f * f * (3.0 - 2.0 * f);",
      "  return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),",
      "                 mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),",
      "             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),",
      "                 mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);",
      "}",
      /* The potential is three decorrelated noise fields; the curl is its
         antisymmetric derivative. Six samples a component, central
         differences at e. */
      "vec3 pot(vec3 p){ return vec3(vnoise(p), vnoise(p + 31.7), vnoise(p + 74.3)); }",
      "vec3 curl(vec3 p){",
      "  float e = 0.16;",
      "  vec3 dx = (pot(p + vec3(e,0,0)) - pot(p - vec3(e,0,0)));",
      "  vec3 dy = (pot(p + vec3(0,e,0)) - pot(p - vec3(0,e,0)));",
      "  vec3 dz = (pot(p + vec3(0,0,e)) - pot(p - vec3(0,0,e)));",
      "  return vec3(dy.z - dz.y, dz.x - dx.z, dx.y - dy.x) / (2.0 * e);",
      "}",

      "void main(){",
      "  vec3 b = a_base;",
      /* Two octaves: a large slow fold, and a small fast shimmer on top. One
         octave alone reads as a lava lamp. */
      "  vec3 v = curl(b * 0.9 + vec3(0.0, 0.0, u_time * 0.055)) * 0.34;",
      "  v += curl(b * 2.7 - vec3(0.0, u_time * 0.09, 0.0)) * 0.09;",
      "  vec3 p = b + v;",
      /* The pointer parts the field. Falloff in the plane only, so it reads
         as a hand through smoke rather than as a sphere in a volume. */
      "  vec2 d = p.xy - u_ptr;",
      "  float g = exp(-dot(d, d) * 5.2);",
      "  p.xy += normalize(d + 1e-4) * g * 0.30;",
      "  gl_Position = vec4(p.x / u_aspect, p.y, 0.0, 1.0);",
      /* Depth reads as size and as fade, which is the only cue this has --
         there is no perspective divide here, the field is flat by design. */
      "  float depth = 0.5 + 0.5 * p.z;",
      "  gl_PointSize = u_size * mix(0.55, 2.1, depth);",
      "  v_fade = mix(0.06, 0.5, depth) * (1.0 - smoothstep(0.75, 1.15, length(p.xy)));",
      "  v_seed = a_seed;",
      "}",
    ].join("\n");

    var FS = [
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
      /* Warm and cool split on the seed, off the same two lights the hero
         scene uses, so this direction belongs to the same site as 01. */
      "  vec3 warm = vec3(1.00, 0.86, 0.68);",
      "  vec3 cool = vec3(0.30, 0.46, 0.72);",
      "  vec3 col = mix(cool, warm, smoothstep(0.35, 0.8, v_seed));",
      /* On cream the field has to be ink on paper, not light in a room. */
      "  col = mix(col, vec3(0.10, 0.12, 0.16), u_light);",
      "  o = vec4(col * a, a);",
      "}",
    ].join("\n");

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        /* Said out loud. The hero scene spent five commits silently removing
           itself over a one-word shader error; nothing in this file is going
           to repeat that. Note that terser is configured with drop_console,
           so this only survives into a development build -- which is exactly
           where you need it. */
        if (window.console && console.warn) console.warn("[home-field]", gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    function boot() {
      canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      host.appendChild(canvas);
      try {
        gl = canvas.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: true });
      } catch (e) {}
      if (!gl) {
        /* No WebGL2, no field. The direction still works: the sentence is
           centred at its largest on the site's own background, which is a
           legitimate composition and not a broken one. */
        gl = null;
        return false;
      }
      var v = compile(gl.VERTEX_SHADER, VS),
        f = compile(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) {
        gl = null;
        return false;
      }
      prog = gl.createProgram();
      gl.attachShader(prog, v);
      gl.attachShader(prog, f);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        if (window.console && console.warn) console.warn("[home-field] link", gl.getProgramInfoLog(prog));
        gl = null;
        return false;
      }
      prog.u = {};
      ["u_time", "u_aspect", "u_size", "u_ptr", "u_light"].forEach(function (n) {
        prog.u[n] = gl.getUniformLocation(prog, n);
      });

      /* Seeded by index rather than Math.random: the field should look the
         same every time somebody lands on this direction, so that a second
         visit is recognisably the same picture. */
      var base = new Float32Array(N * 3),
        seed = new Float32Array(N);
      for (var j = 0; j < N; j++) {
        var a = j * 2.399963229728653; /* golden angle, in radians */
        var rr = Math.sqrt((j + 0.5) / N);
        base[j * 3] = Math.cos(a) * rr * 1.06;
        base[j * 3 + 1] = Math.sin(a) * rr * 1.06;
        base[j * 3 + 2] = ((j * 0.6180339887) % 1) * 2 - 1;
        seed[j] = (j * 0.7548776662) % 1;
      }

      vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      var bb = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, bb);
      gl.bufferData(gl.ARRAY_BUFFER, base, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      var sb = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, sb);
      gl.bufferData(gl.ARRAY_BUFFER, seed, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 0, 0);
      gl.bindVertexArray(null);
      return true;
    }

    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      var w = Math.max(1, Math.round(host.clientWidth * dpr));
      var h = Math.max(1, Math.round(host.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      return dpr;
    }

    function onMove(e) {
      var r = host.getBoundingClientRect();
      if (!r.width || !r.height) return;
      /* Into the same clip space the vertex shader works in, aspect
         corrected, so the pointer term parts the field where the cursor
         actually is rather than where it would be on a square screen. */
      ptr.x = (((e.clientX - r.left) / r.width) * 2 - 1) * (r.width / r.height);
      ptr.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    }

    function frame(now) {
      if (!gl) return;
      var dpr = size();
      var t = (now - t0) / 1000;
      cur.x += (ptr.x - cur.x) * 0.08;
      cur.y += (ptr.y - cur.y) * 0.08;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      /* Premultiplied additive-over. The points are light in the dark theme
         and ink in the light one, and this is the blend that lets one shader
         serve both without a second pass. */
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(prog);
      gl.uniform1f(prog.u.u_time, t);
      gl.uniform1f(prog.u.u_aspect, canvas.width / canvas.height);
      gl.uniform1f(prog.u.u_size, 2.0 * dpr);
      gl.uniform2f(prog.u.u_ptr, cur.x, cur.y);
      gl.uniform1f(prog.u.u_light, html.getAttribute("data-theme") === "light" ? 1 : 0);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.POINTS, 0, N);
      gl.bindVertexArray(null);
      raf = requestAnimationFrame(frame);
    }

    return {
      start: function () {
        if (!host || raf) return;
        if (REDUCED) return;
        if (!gl && !boot()) return;
        t0 = performance.now();
        window.addEventListener("pointermove", onMove, { passive: true });
        raf = requestAnimationFrame(frame);
      },
      stop: function () {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        window.removeEventListener("pointermove", onMove);
      },
    };
  })();

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) field.stop();
    else if (DIRS[i].id === "field") field.start();
  });

  paint();
})();
