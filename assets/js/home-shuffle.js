/* ═══════════════════════════════════════════════════════════════════════════
   FIVE HOMEPAGES, ONE PAGE

   Sid: "can you give me a button where i can shuffle between homepages while
   on homepages like a creative way for the person to try a new style and
   composition like a creative playful homepage itself."

   WHAT THIS IS

   Five homepages, one document. Not five arrangements of one homepage --
   that is what the first attempt was and it is why it failed; see the note
   under THE ORDER below.

   Each direction uses different material and makes a different argument.
   What they share is the FACTS, not the presentation: the sentence, the
   role, the city and the work appear in all five, so there is no version in
   which a visitor is told something the others withhold, and none of them
   can quietly rot because nobody looks at it. One markup, one set of claims,
   five ways of standing behind them.

   Everything visual is CSS, scoped under html[data-home]. This file cycles
   the attribute, remembers the choice, and starts or stops the four
   directions that need code of their own -- a renderer, a pointer handler, a
   grid to build, an input to focus. Each is started only when its direction
   is showing and stopped when it is not, so a visitor pays for the one
   homepage they are looking at.

   THE ORDER

     01  the room      the figure in his room, the film beside him
     02  the wall      the pinboard above his desk, the work pinned to it
     03  the archive   206 photographs, dense, the sentence cut out of them
     04  the line      one input. type where you want to go.
     05  the culture   reaction-diffusion, seeded with the sentence itself

     THE FIRST FIVE WERE NOT FIVE CONCEPTS

     Sid: "they all look too similar and i wanted new concepts other than
     cube guy and my working video."

     He was right and the fault is worth writing down, because it is easy to
     make again: three of the original five showed the same reel, two showed
     the same figure, and all five set the same sentence the same way with
     the same foot row beneath it. Changing what is hidden and what is
     centred produces LAYOUTS. A concept needs different material and a
     different argument.

     So the three weakest went -- the index, the terminal and the film, which
     were type-with-a-list, type-with-a-table, and the reel again -- and what
     replaced them uses assets nothing else on this site touches and makes a
     different claim in each case:

       the wall      "this is the room it comes out of"
       the archive   "this is how much I have looked at"
       the line      "you already know what you are looking for"

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
    { id: "wall", name: "The wall" },
    { id: "archive", name: "The archive" },
    { id: "line", name: "The line" },
    { id: "field", name: "The culture" },
  ];

  var html = document.documentElement;
  var hero = document.getElementById("hero");
  /* ── TWO ARROWS INSTEAD OF ONE NAMED BUTTON ────────────────────────────
     Sid: "Have arrows on the left and the right, very subtle on the bottom,
     and start with the fifth one ... Don't mention icons, and you don't need
     to mention the culture."

     The old control was a single button printing "03/05" and the direction's
     name. Both are gone. A direction that announces itself is a menu, and
     these five are meant to be come across rather than picked from a list --
     which is what the file header has always said they were for. */
  var prev = document.getElementById("hero-prev");
  var next = document.getElementById("hero-next");
  if (!hero || !prev || !next) return;

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Fifth by default, on Sid's instruction. A returning visitor still gets
     whichever one they last moved to -- a stored preference outranks a
     default, or the arrows would appear not to work across a reload. */
  var i = DIRS.length - 1;
  try {
    var saved = localStorage.getItem(KEY);
    for (var k = 0; k < DIRS.length; k++) if (DIRS[k].id === saved) i = k;
  } catch (e) {}

  function label() {
    /* The arrows carry no text. What they carry is where they will take you,
       for anybody listening rather than looking. */
    prev.setAttribute("aria-label", "Previous homepage layout, " + DIRS[(i - 1 + DIRS.length) % DIRS.length].name);
    next.setAttribute("aria-label", "Next homepage layout, " + DIRS[(i + 1) % DIRS.length].name);
  }

  function paint() {
    /* 01 writes no attribute. A visitor who has never pressed the control and
       a visitor who has cycled back round to the start should be looking at
       byte-identical pages, and the default should not need a selector. */
    if (i === 0) html.removeAttribute("data-home");
    else html.setAttribute("data-home", DIRS[i].id);
    label();
    /* ── TWO FIELDS, ONE CHOSEN AT RUNTIME ─────────────────────────────
       home-gl-field.js is a real GPGPU simulation and needs float render
       targets, which are not core in WebGL2. If it starts, it owns the
       direction; if the extension is missing it declines and the
       displacement version below takes over. Both are kept: the cheaper one
       is not dead code, it is the fallback that lets the direction exist on
       a machine that cannot run the simulation. */
    /* ── THREE FALLBACKS DEEP, BEST FIRST ──────────────────────────────
       Sid: "i dont like the generic shader one with the dots be more
       creative it needs to be award winning not generic."

       He is right about the particles. A curl-noise field is the shader
       equivalent of a stock photo -- however well it is implemented it
       cannot be why anyone remembers a site. The reaction-diffusion culture
       replaces it as the picture; the two particle versions stay underneath
       purely as fallbacks for machines that cannot run it, in descending
       order of what they require. */
    if (DIRS[i].id === "field") {
      var on = window.__culture && window.__culture.start();
      if (!on) on = window.__fieldSim && window.__fieldSim.start();
      if (!on) field.start();
    } else {
      field.stop();
      if (window.__fieldSim) window.__fieldSim.stop();
      if (window.__culture) window.__culture.stop();
    }
    if (DIRS[i].id === "wall") wall.start();
    else wall.stop();
    if (DIRS[i].id === "archive") archive.build();
    if (DIRS[i].id === "line") line.focus();

    /* ── ONE RENDERER PER DIRECTION ────────────────────────────────────
       Each of the five draws by a genuinely different method, and each is
       started only while its direction is showing:

         room      instanced splats, image-based lighting  (hero-scene.js)
         wall      a photograph lit by the cursor          (home-gl-wall.js)
         archive   photographs in real depth               (below)
         line      a raymarched gyroid, no geometry        (home-gl-line.js)
         field     curl-noise particles                    (below)

       Started and stopped here rather than each watching the attribute for
       itself: five independent observers of one value is five chances for
       two renderers to both think they are on. */
    /* 01 is the solid: the sentence extruded and cast in glass. If it
       starts, the hero's figure and film plate stand down and it is the whole
       subject; if it cannot, .is-solid is never set and the room is exactly
       what it was. */
    /* 01 is mercury: the sentence as liquid metal you can stir and break.
       The glass version stays underneath as the fallback -- it is cheaper by
       a wide margin, and the machine that cannot afford a ninety-step march
       with fourteen smooth minima in its inner loop should still get an
       object rather than nothing. */
    if (i === 0) {
      /* Ink first: a real fluid solve. Mercury and then glass underneath,
         each cheaper than the last, so a machine that cannot afford half
         float render targets still gets an object rather than nothing. */
      var on01 = window.__ink && window.__ink.start();
      if (!on01 && window.__mercury) on01 = window.__mercury.start();
      if (!on01 && window.__solidType) on01 = window.__solidType.start();
      if (on01) hero.classList.add("is-solid");
    } else {
      if (window.__ink) window.__ink.stop();
      if (window.__mercury) window.__mercury.stop();
      if (window.__solidType) window.__solidType.stop();
      hero.classList.remove("is-solid");
    }
    if (window.__wallLight) {
      if (DIRS[i].id === "wall") window.__wallLight.start();
      else window.__wallLight.stop();
    }
    if (window.__lineField) {
      if (DIRS[i].id === "line") window.__lineField.start();
      else window.__lineField.stop();
    }
    if (window.__archiveDepth) {
      if (DIRS[i].id === "archive") {
        window.__archiveDepth.start();
        var ar = document.getElementById("hero-archive");
        if (ar && window.__archiveDepth.state().gl) ar.classList.add("is-deep");
      } else window.__archiveDepth.stop();
    }
  }

  function go(step) {
    i = (i + step + DIRS.length) % DIRS.length;
    try {
      localStorage.setItem(KEY, DIRS[i].id);
    } catch (e) {}

    var pressed = step > 0 ? next : prev;
    pressed.classList.add("is-turning");
    setTimeout(function () {
      pressed.classList.remove("is-turning");
    }, 480);

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
  }

  prev.addEventListener("click", function () {
    go(-1);
  });
  next.addEventListener("click", function () {
    go(1);
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

  /* ═════════════════════════════════════════════════════════════════════════
     02 · THE WALL

     One pointer handler writing two custom properties, and CSS doing the
     rest. The photograph and the pinned cards travel in OPPOSITE directions
     -- the wall against the pointer, the paper with it -- which is the whole
     parallax: two planes at two depths rather than one image on a spring.

     Listener attached only while this direction is showing, and removed when
     it is not. A pointermove handler that survives its own direction is four
     visitors in five paying for a picture they are not looking at.
     ═════════════════════════════════════════════════════════════════════════ */
  var wall = (function () {
    var host = null,
      on = false,
      raf = 0,
      last = 0,
      cards = [];

    function move(e) {
      if (!host) return;
      var w = window.innerWidth || 1,
        h = window.innerHeight || 1;
      host.style.setProperty("--wx", ((e.clientX / w) * 2 - 1).toFixed(3));
      host.style.setProperty("--wy", ((e.clientY / h) * 2 - 1).toFixed(3));
      /* ── THE HAND DISTURBS THEM ────────────────────────────────────────
         A push into each card's angular velocity, scaled by how close the
         pointer passed and signed by which side it passed on. Velocity, not
         angle: shoving the position teleports a card, shoving the velocity
         makes it swing -- which is the entire difference between an
         animation and a physical response. */
      for (var i = 0; i < cards.length; i++) {
        var c = cards[i];
        var r = c.el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        var d2 = dx * dx + dy * dy;
        if (d2 > 62500) continue; /* 250px */
        var near = 1 - Math.sqrt(d2) / 250;
        c.w += (dx > 0 ? -1 : 1) * near * near * 0.9;
      }
    }

    /* ═══════════════════════════════════════════════════════════════════
       PINNED PAPER IS A PENDULUM

       Sid: "look for as much interactivity physics motion."

       Every card on this wall hangs from a single pin at its top edge, and
       an object suspended from one point above its centre of mass is a
       pendulum -- so it is simulated as one rather than given a hover
       transition.

         a = -(g / L) * sin(t) - damp * w

       Small-angle would let sin(t) collapse to t and the whole thing become
       a spring, but the nonlinearity is worth keeping: it is why a big swing
       takes longer to come back than a small one, which is exactly the thing
       that reads as weight.

       Integrated on a FIXED 1/120s step with an accumulator, not on the
       frame delta. A variable step in a stiff oscillator changes the
       effective damping with the framerate, so the same card settles at a
       different rate on a 60Hz and a 120Hz display -- the framerate bug this
       codebase has now found three times, in a form where it would have been
       far harder to see.

       Each card gets its own length from its own height, so the big
       statement card swings slowly and the little project tags swing fast.
       That is free and it is most of what sells it.
       ═══════════════════════════════════════════════════════════════════ */
    function tick(now) {
      raf = 0;
      if (!on) return;
      var dt = Math.min(0.05, (now - last) / 1000) || 0.016;
      last = now;

      var sv = window.__sv ? window.__sv() : { v: 0 };
      var acc = dt;
      for (var i = 0; i < cards.length; i++) {
        var c = cards[i];
        /* Scrolling shakes the wall. Sign follows the scroll direction, so
           throwing the page down swings everything one way and stopping lets
           it fall back. */
        c.w += sv.v * 0.5 * dt * c.gl;
        var steps = 0;
        var left = acc;
        while (left > 0 && steps < 8) {
          var h = Math.min(1 / 120, left);
          var a = -c.gl * Math.sin(c.t) - 3.1 * c.w;
          c.w += a * h;
          c.t += c.w * h;
          left -= h;
          steps++;
        }
        /* Below a thousandth of a radian nobody can see it and the transform
           is pure cost. Parked, and woken by the next disturbance. */
        if (Math.abs(c.t) < 0.001 && Math.abs(c.w) < 0.004) {
          c.t = 0;
          c.w = 0;
        }
        if (c.t !== c.shown) {
          c.shown = c.t;
          c.el.style.setProperty("--swing", (c.t * 57.29578).toFixed(2) + "deg");
        }
      }
      raf = requestAnimationFrame(tick);
    }

    return {
      start: function () {
        if (on || REDUCED) return;
        host = document.querySelector(".hero-wall");
        if (!host) return;
        on = true;
        cards = [].slice.call(host.querySelectorAll(".hero-pin")).map(function (el) {
          var h = el.getBoundingClientRect().height || 60;
          return {
            el: el,
            t: 0,
            w: 0,
            shown: null,
            /* g/L. Longer card, slower swing -- the pin is the pivot and the
               card's own height is the arm. */
            gl: 900 / Math.max(40, h * 1.6),
          };
        });
        window.addEventListener("pointermove", move, { passive: true });
        last = performance.now();
        if (!raf) raf = requestAnimationFrame(tick);
      },
      stop: function () {
        if (!on) return;
        on = false;
        window.removeEventListener("pointermove", move);
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        cards.forEach(function (c) {
          c.el.style.removeProperty("--swing");
        });
        cards = [];
      },
    };
  })();

  /* ═════════════════════════════════════════════════════════════════════════
     03 · THE ARCHIVE

     Sixty tiles off the 206 in /play/assets/spatial/, built once, the first
     time this direction is chosen, and kept.

     The stride is fixed rather than random: the same visitor should get the
     same wall on a second visit, because a mosaic that reshuffles itself is
     a screensaver. 206/60 gives a stride of 3, which also means consecutive
     tiles are never consecutive exports -- neighbouring files tend to be the
     same shoot, and three abreast is what stops the wall reading as one
     afternoon repeated.

     Six numbers are skipped: 193 does not exist, and 16, 74, 194, 195, 196
     and 205 are the clips rather than the stills. Those are the same
     exclusions /play/ itself applies, and requesting them would be six 404s
     behind a wall of photographs where nobody would ever notice them.
     ═════════════════════════════════════════════════════════════════════════ */
  var archive = (function () {
    var built = false;
    var SKIP = [16, 74, 193, 194, 195, 196, 205];
    return {
      build: function () {
        if (built) return;
        var host = document.getElementById("hero-archive-grid");
        var root = document.getElementById("hero-archive");
        if (!host || !root) return;
        built = true;
        var base = root.getAttribute("data-base") || "";
        /* ── ENOUGH TILES TO BE A WALL ────────────────────────────────
           Sixty was a guess and at 1440x900 it filled five rows of eleven
           and left a third of the screen empty below them, with the bottom
           of the knocked-out sentence hanging over nothing. A mosaic that
           stops halfway down is not a mosaic.

           Counted off the box instead, using the same clamp the CSS sizes
           the cells with, plus a row of slack for the gap rounding. Capped
           at what exists. */
        var box = root.getBoundingClientRect();
        var cell = Math.max(76, Math.min(130, (window.innerWidth || 1440) * 0.08));
        var cols = Math.max(1, Math.ceil(box.width / cell));
        var rows = Math.max(1, Math.ceil(box.height / cell)) + 1;
        var want = Math.min(199, cols * rows);
        /* Spread across the whole archive rather than taking the first N:
           neighbouring export numbers tend to be the same shoot, and a wall
           of one afternoon is a worse wall. */
        var stride = Math.max(1, Math.floor(206 / want));
        var frag = document.createDocumentFragment();
        var n = 0;
        for (var f = 1; f <= 206 && n < want; f += stride) {
          if (SKIP.indexOf(f) !== -1) continue;
          var im = document.createElement("img");
          im.alt = "";
          im.decoding = "async";
          /* Lazy, because sixty of these is more than the first screen shows
             at most widths and the ones below the fold can wait. */
          im.loading = n < 30 ? "eager" : "lazy";
          im.style.setProperty("--i", n);
          im.src = base + "/play/assets/spatial/p" + f + ".webp";
          /* .is-in on decode rather than on a timer, so the stagger is a
             stagger of ARRIVALS and a slow connection degrades into a slower
             fill rather than into a grid of empty boxes that were already
             told to be visible. */
          im.addEventListener("load", function () {
            this.classList.add("is-in");
          });
          frag.appendChild(im);
          n++;
        }
        host.appendChild(frag);
      },
    };
  })();

  /* ═════════════════════════════════════════════════════════════════════════
     04 · THE LINE

     Eleven destinations, matched on a plain substring, ranked only by
     whether the match is at the start of the label. No fuzzy scoring: with
     eleven targets a fuzzy matcher is a library and a surprise, and someone
     typing "wo" expects Work rather than whatever scores highest.

     Enter takes the top hit, arrows move through them. Everything is a real
     <a> underneath, so the list works with no JS at all beyond the filter --
     and the whole direction degrades to a text field and eleven links.
     ═════════════════════════════════════════════════════════════════════════ */
  var line = (function () {
    var wired = false,
      sel = 0,
      hits = [];
    var BASE = (document.getElementById("hero-archive") || {}).getAttribute
      ? document.getElementById("hero-archive").getAttribute("data-base") || ""
      : "";
    var TARGETS = [
      { label: "Work", note: "selected projects", url: "/works/" },
      { label: "Play", note: "206 pieces", url: "/play/" },
      { label: "About", note: "who this is", url: "/about/" },
      { label: "Contact", note: "start a conversation", url: "/contact/" },
      { label: "Mool", note: "fintech", url: "/mool/" },
      { label: "Encoded", note: "the met", url: "/encoded/" },
      { label: "AI prototypes", note: "eleven live", url: "/ai-prototypes/" },
      { label: "Marriott", note: "enterprise ux", url: "/marriott/" },
      { label: "Bloom", note: "vision pro", url: "/bloom/" },
      { label: "Mandalas", note: "artwork", url: "/mandalas/" },
      { label: "Resume", note: "the short version", url: "/about/" },
    ];

    function render(q) {
      var list = document.getElementById("hero-line-hits");
      if (!list) return;
      var s = q.trim().toLowerCase();
      hits = TARGETS.filter(function (t) {
        return !s || t.label.toLowerCase().indexOf(s) !== -1 || t.note.indexOf(s) !== -1;
      }).sort(function (a, b) {
        var ai = a.label.toLowerCase().indexOf(s) === 0 ? 0 : 1;
        var bi = b.label.toLowerCase().indexOf(s) === 0 ? 0 : 1;
        return ai - bi;
      });
      hits = hits.slice(0, 6);
      sel = 0;
      list.textContent = "";
      hits.forEach(function (t, n) {
        var li = document.createElement("li");
        if (n === 0) li.className = "is-on";
        var a = document.createElement("a");
        a.href = BASE + t.url;
        a.innerHTML = "<span></span><em></em>";
        a.firstChild.textContent = t.label;
        a.lastChild.textContent = t.note;
        li.appendChild(a);
        list.appendChild(li);
      });
    }

    function wire() {
      if (wired) return;
      var input = document.getElementById("hero-line-in");
      var list = document.getElementById("hero-line-hits");
      if (!input || !list) return;
      wired = true;
      input.addEventListener("input", function () {
        render(input.value);
      });
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && hits[sel]) {
          e.preventDefault();
          window.location.href = BASE + hits[sel].url;
          return;
        }
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        e.preventDefault();
        sel = (sel + (e.key === "ArrowDown" ? 1 : hits.length - 1)) % Math.max(1, hits.length);
        [].forEach.call(list.children, function (li, n) {
          li.className = n === sel ? "is-on" : "";
        });
      });
      render("");
    }

    return {
      focus: function () {
        wire();
        var input = document.getElementById("hero-line-in");
        /* Focused, because a text field nobody has clicked into is a text
           field nobody uses. Deferred past the crossfade so the focus ring
           does not appear on an element that is still at opacity 0. */
        if (input)
          setTimeout(function () {
            try {
              input.focus({ preventScroll: true });
            } catch (e) {
              input.focus();
            }
          }, 320);
      },
    };
  })();

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) field.stop();
    else if (DIRS[i].id === "field") field.start();
  });

  paint();
})();
