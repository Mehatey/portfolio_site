/* =====================================================================
   home-gl.js — the homepage's WebGL layer.

   Two jobs, one canvas, one rAF loop:

   1. A living backdrop. Domain-warped fBm noise drifting under a dark
      palette, so the page is never a flat void. It leans with scroll
      velocity and with the cursor, which is what makes it read as a
      *space* you are moving through rather than a looping gif.

   2. The work gallery. Every project image stays a real <img> inside a
      real <a> — the DOM owns layout, links and accessibility. We just
      hide the pixels and redraw them in GL at the element's own screen
      rect. That buys three things a DOM image cannot do:

        · inertia — the plane's rect is lerped toward the true rect, so
          images visibly drag behind the scroll and settle after it,
        · a real bend — the plane is 24×24 verts and curls along its
          own surface with scroll velocity, it is not a skew fake,
        · velocity chromatic aberration + hover ripple, per-pixel.

   No dependencies, no CDN, ~1 draw call per visible image. If WebGL is
   missing or the reader asked for reduced motion, we bail before doing
   anything and the plain DOM images stay visible. That fallback is the
   default state of the markup, not a special case.
   ===================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var canvas = document.getElementById("gl-stage");
  if (!canvas) return;

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  var gl = null;
  try {
    gl =
      canvas.getContext("webgl", {
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
      }) || canvas.getContext("experimental-webgl", { alpha: true, antialias: true });
  } catch (e) {
    gl = null;
  }
  if (!gl) return;

  root.classList.add("gl-on");

  /* ── tiny GL helpers ──────────────────────────────────────────── */
  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn("[home-gl]", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  function program(vsrc, fsrc) {
    var vs = compile(gl.VERTEX_SHADER, vsrc);
    var fs = compile(gl.FRAGMENT_SHADER, fsrc);
    if (!vs || !fs) return null;
    var p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn("[home-gl]", gl.getProgramInfoLog(p));
      return null;
    }
    p.u = {};
    p.a = {};
    var i,
      n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (i = 0; i < n; i++) {
      var un = gl.getActiveUniform(p, i).name.replace(/\[0\]$/, "");
      p.u[un] = gl.getUniformLocation(p, un);
    }
    n = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
    for (i = 0; i < n; i++) {
      var an = gl.getActiveAttrib(p, i).name;
      p.a[an] = gl.getAttribLocation(p, an);
    }
    return p;
  }

  /* ── shared noise chunk ───────────────────────────────────────── */
  var NOISE = [
    "vec2 hash2(vec2 p){",
    "  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));",
    "  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);",
    "}",
    "float snoise(vec2 p){",
    "  const float K1 = 0.366025404; const float K2 = 0.211324865;",
    "  vec2 i = floor(p + (p.x + p.y) * K1);",
    "  vec2 a = p - i + (i.x + i.y) * K2;",
    "  vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);",
    "  vec2 b = a - o + K2; vec2 c = a - 1.0 + 2.0 * K2;",
    "  vec3 h = max(0.5 - vec3(dot(a,a), dot(b,b), dot(c,c)), 0.0);",
    "  vec3 n = h*h*h*h*vec3(dot(a,hash2(i)), dot(b,hash2(i+o)), dot(c,hash2(i+1.0)));",
    "  return dot(n, vec3(70.0));",
    "}",
    "float fbm(vec2 p){",
    "  float v = 0.0; float amp = 0.5;",
    "  for (int i = 0; i < 4; i++){ v += amp * snoise(p); p *= 2.02; amp *= 0.5; }",
    "  return v;",
    "}",
    "float grain(vec2 uv, float t){",
    "  return fract(sin(dot(uv * (1.0 + t * 0.0007), vec2(12.9898, 78.233))) * 43758.5453);",
    "}",
  ].join("\n");

  /* ── 1. backdrop ──────────────────────────────────────────────── */
  var BG_VS = ["attribute vec2 a_pos;", "varying vec2 v_uv;", "void main(){ v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }"].join(
    "\n"
  );

  var BG_FS = [
    "precision highp float;",
    "varying vec2 v_uv;",
    "uniform vec2 u_res;",
    "uniform float u_time;",
    "uniform float u_vel;",
    "uniform float u_scroll;",
    "uniform vec2 u_mouse;",
    "uniform float u_light;",
    NOISE,
    "void main(){",
    "  vec2 uv = v_uv;",
    "  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;",
    // domain warp: noise sampled through noise, which is what stops the
    // field looking like a blurred blob and makes it look like weather.
    "  float t = u_time * 0.035;",
    "  vec2 drift = vec2(0.0, u_scroll * 0.00016);",
    "  vec2 q = vec2(fbm(p * 0.55 + drift + t), fbm(p * 0.55 + drift + vec2(5.2, 1.3) - t));",
    "  vec2 r = vec2(fbm(p * 0.68 + 2.1 * q + vec2(1.7, 9.2) + t * 1.4 + u_mouse * 0.25),",
    "                fbm(p * 0.68 + 2.1 * q + vec2(8.3, 2.8) - t * 1.1 - u_mouse * 0.25));",
    "  float f = fbm(p * 0.6 + 2.0 * r + drift);",
    "  f = f * 0.5 + 0.5;",
    "  float band = smoothstep(0.18, 1.05, f);",
    // Three inks, all now well under the type. The field used to be the
    // loudest thing on the page; with the hero film carrying the drama it
    // only has to be weather behind glass. The second ink also moved off
    // amber — warm was the last of the yellow, and it is gone.
    "  vec3 deep  = mix(vec3(0.016, 0.023, 0.043), vec3(0.945, 0.937, 0.918), u_light);",
    "  vec3 blue  = mix(vec3(0.078, 0.121, 0.253), vec3(0.901, 0.919, 0.951), u_light);",
    "  vec3 cool  = mix(vec3(0.152, 0.118, 0.259), vec3(0.936, 0.921, 0.944), u_light);",
    "  vec3 col = deep;",
    "  col = mix(col, blue, band * 0.44);",
    "  col = mix(col, cool, smoothstep(0.66, 1.06, f) * (0.16 + abs(u_vel) * 0.24));",
    // a faint moving specular so the field has a light source, not just hue
    "  float spec = pow(max(0.0, 1.0 - length(p - vec2(u_mouse.x * 0.5, u_mouse.y * 0.35))), 3.2);",
    "  col += mix(vec3(0.022, 0.028, 0.044), vec3(0.0), u_light) * spec;",
    "  float vig = smoothstep(1.35, 0.25, length(p));",
    "  col *= mix(mix(0.52, 1.0, vig), mix(0.962, 1.0, vig), u_light);",
    "  col += (grain(uv, u_time) - 0.5) * 0.016;",
    "  gl_FragColor = vec4(col, 1.0);",
    "}",
  ].join("\n");

  /* ── 2. media planes ──────────────────────────────────────────── */
  var MED_VS = [
    "precision highp float;",
    "attribute vec2 a_uv;",
    "uniform vec4 u_rect;", // x, y, w, h in CSS px, top-left origin
    "uniform vec2 u_res;",
    "uniform float u_vel;",
    "uniform float u_hover;",
    "uniform float u_time;",
    "uniform float u_enter;",
    "uniform float u_z;", // depth in CSS px, positive = further from camera
    "uniform float u_persp;", // camera distance in CSS px
    "varying vec2 v_uv;",
    "varying float v_bend;",
    "void main(){",
    "  v_uv = a_uv;",
    "  vec2 p = u_rect.xy + a_uv * u_rect.zw;",
    // The curl. sin across the plane's own width means the middle of the
    // image leads and the edges trail — the sheet-of-paper bend, not a skew.
    "  float archX = sin(a_uv.x * 3.14159265);",
    "  float archY = sin(a_uv.y * 3.14159265);",
    "  float bend = archX * u_vel * 34.0;",
    "  p.y += bend;",
    "  p.x += archY * u_vel * 6.0;",
    // idle breathing so a parked gallery is still alive
    "  p += vec2(sin(u_time * 0.6 + a_uv.y * 2.0), cos(u_time * 0.5 + a_uv.x * 2.0)) * 1.6;",
    // hover lifts the plane a hair toward the viewer
    "  vec2 mid = u_rect.xy + u_rect.zw * 0.5;",
    "  p = mid + (p - mid) * (1.0 + u_hover * 0.022);",
    // entry: rises and unfolds as it comes into view
    "  p.y += (1.0 - u_enter) * 46.0;",
    "  p = mid + (p - mid) * mix(0.965, 1.0, u_enter);",
    "  v_bend = bend / 34.0;",
    // Real perspective, not a parallax multiplier. The plane sits at u_z in
    // front of / behind the screen and we hand the divide to the GPU by
    // writing w instead of pre-scaling xy — so near planes genuinely sweep
    // faster than far ones, the shrink is correct foreshortening rather than
    // a tuned constant, and varyings stay perspective-correct. The vanishing
    // point is the viewport centre, which is also where a plane's GL position
    // agrees most closely with its DOM rect, so links stay clickable exactly
    // where people actually click.
    "  float w = (u_persp + u_z) / u_persp;",
    "  vec2 ndc = vec2(p.x / u_res.x * 2.0 - 1.0, 1.0 - p.y / u_res.y * 2.0);",
    "  vec2 midNdc = vec2(mid.x / u_res.x * 2.0 - 1.0, 1.0 - mid.y / u_res.y * 2.0);",
    // The plane's CENTRE goes through the perspective divide, so a deep plane
    // sweeps past the vanishing point more slowly than a near one — real
    // differential motion, not a tuned scroll multiplier. Its SIZE is put
    // back, because the DOM rect is still the layout authority here and a
    // foreshortened plane would sit visibly inset inside its own frame.
    // Multiplying by w and letting the GPU divide keeps varyings correct.
    "  vec2 out2 = midNdc / w + (ndc - midNdc);",
    "  gl_Position = vec4(out2 * w, 0.0, w);",
    "}",
  ].join("\n");

  var MED_FS = [
    "precision highp float;",
    "varying vec2 v_uv;",
    "varying float v_bend;",
    "uniform sampler2D u_tex;",
    "uniform vec2 u_cover;", // uv scale for object-fit: cover
    "uniform vec2 u_offset;",
    "uniform float u_vel;",
    "uniform float u_hover;",
    "uniform vec2 u_mouse;", // in plane uv space
    "uniform float u_time;",
    "uniform float u_enter;",
    "uniform float u_radius;", // corner radius, in uv of the shorter side
    "uniform vec2 u_aspect;",
    "uniform float u_light;",
    NOISE,
    "void main(){",
    "  vec2 uv = v_uv * u_cover + u_offset;",
    // hover ripple — a real ring travelling out from the cursor
    "  vec2 d = (v_uv - u_mouse) * u_aspect;",
    "  float dist = length(d);",
    "  float ring = sin(dist * 26.0 - u_time * 4.5) * exp(-dist * 4.5);",
    "  uv += normalize(d + 1e-5) * ring * 0.010 * u_hover;",
    // velocity chromatic split, strongest at the bent middle
    "  float ca = (abs(u_vel) * 0.020 + u_hover * 0.0022) * (0.45 + abs(v_bend));",
    "  vec3 col;",
    "  col.r = texture2D(u_tex, uv + vec2(ca, ca * 0.35)).r;",
    "  col.g = texture2D(u_tex, uv).g;",
    "  col.b = texture2D(u_tex, uv - vec2(ca, ca * 0.35)).b;",
    // the bend catches light: the leading face brightens, the trailing dims
    "  col *= 1.0 + v_bend * 0.5;",
    // resting state sits back a touch; hover brings it fully forward
    "  float rest = mix(0.955, 1.06, u_hover);",
    "  col = mix(vec3(dot(col, vec3(0.299, 0.587, 0.114))), col, mix(0.96, 1.12, u_hover));",
    "  col *= rest;",
    "  col += (grain(v_uv, u_time) - 0.5) * 0.018;",
    // rounded-rect coverage, antialiased in uv space
    "  vec2 q = abs(v_uv - 0.5) * 2.0 * u_aspect - (u_aspect - vec2(u_radius));",
    "  float sd = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - u_radius;",
    "  float alpha = 1.0 - smoothstep(-0.004, 0.004, sd);",
    "  alpha *= u_enter;",
    "  if (alpha <= 0.003) discard;",
    "  gl_FragColor = vec4(col, alpha);",
    "}",
  ].join("\n");

  var bgProg = program(BG_VS, BG_FS);
  var medProg = program(MED_VS, MED_FS);
  if (!bgProg || !medProg) {
    root.classList.remove("gl-on");
    return;
  }

  /* ── geometry ─────────────────────────────────────────────────── */
  var quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  var SEG = 24;
  var verts = [];
  var idx = [];
  for (var y = 0; y <= SEG; y++) {
    for (var x = 0; x <= SEG; x++) verts.push(x / SEG, y / SEG);
  }
  for (var yy = 0; yy < SEG; yy++) {
    for (var xx = 0; xx < SEG; xx++) {
      var a = yy * (SEG + 1) + xx;
      idx.push(a, a + 1, a + SEG + 1, a + 1, a + SEG + 2, a + SEG + 1);
    }
  }
  var planeVB = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, planeVB);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  var planeIB = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planeIB);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
  var planeCount = idx.length;

  /* ── media collection ─────────────────────────────────────────── */
  var media = [];

  function makeTexture(img) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([12, 14, 22, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  }

  function upload(m) {
    if (!m.img.naturalWidth) return;
    gl.bindTexture(gl.TEXTURE_2D, m.tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, m.img);
      m.ready = true;
      m.ratio = m.img.naturalWidth / m.img.naturalHeight;
      m.holder.classList.add("is-gl");
    } catch (e) {
      /* tainted or not decodable — leave the DOM image showing */
    }
  }

  function collect() {
    var nodes = document.querySelectorAll("[data-gl-media]");
    for (var i = 0; i < nodes.length; i++) {
      var holder = nodes[i];
      if (holder.__gl) continue;
      var img = holder.querySelector("img");
      if (!img) continue;
      holder.__gl = true;
      var m = {
        holder: holder,
        img: img,
        tex: makeTexture(img),
        ready: false,
        ratio: 1,
        rect: null,
        target: null,
        hover: 0,
        hoverT: 0,
        mouse: [0.5, 0.5],
        mouseT: [0.5, 0.5],
        enter: 0,
        // Depth. An explicit data-gl-z wins; otherwise planes are dealt a
        // repeating set of depths so neighbours in the gallery never sit on
        // the same layer. Kept under ~250px against a 1600px camera so the
        // worst-case gap between a plane and its DOM link is small, and only
        // at the very top and bottom of the viewport.
        z: (function (el, i) {
          var explicit = parseFloat(el.getAttribute("data-gl-z"));
          if (isFinite(explicit)) return explicit;
          var ladder = [0, 96, 208, 40, 152, 248];
          return ladder[i % ladder.length];
        })(holder, media.length),
      };
      media.push(m);
      if (img.complete && img.naturalWidth) upload(m);
      else
        img.addEventListener(
          "load",
          (function (mm) {
            return function () {
              upload(mm);
            };
          })(m),
          { once: true }
        );

      holder.addEventListener("pointerenter", function () {
        this.__hover = 1;
      });
      holder.addEventListener("pointerleave", function () {
        this.__hover = 0;
      });
      holder.addEventListener("pointermove", function (e) {
        var r = this.getBoundingClientRect();
        this.__mx = (e.clientX - r.left) / r.width;
        this.__my = (e.clientY - r.top) / r.height;
      });
    }
  }
  collect();

  /* ── state ────────────────────────────────────────────────────── */
  var dpr = 1;
  var W = 0;
  var H = 0;
  var lastScroll = window.scrollY || 0;
  var vel = 0;
  var velSmooth = 0;
  var mouse = [0, 0];
  var mouseS = [0, 0];
  var start = performance.now();

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    gl.viewport(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < media.length; i++) media[i].rect = null;
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  window.addEventListener(
    "pointermove",
    function (e) {
      mouse[0] = (e.clientX / window.innerWidth) * 2 - 1;
      mouse[1] = 1 - (e.clientY / window.innerHeight) * 2;
    },
    { passive: true }
  );

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // Every smoothing constant below is authored as "per 60Hz frame". Applied
  // raw, the whole feel would be refresh-rate dependent: on a 120Hz ProMotion
  // display the inertia converges in half the time it was tuned for, and on a
  // struggling machine the planes lag a viewport behind their DOM rects.
  // step = how many 60Hz frames this frame actually took.
  var step = 1;
  function sm(k) {
    return 1 - Math.pow(1 - k, step);
  }

  var running = true;
  var prevT = 0;
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) {
      lastScroll = window.scrollY;
      prevT = 0;
      requestAnimationFrame(frame);
    }
  });

  function frame(now) {
    if (!running) return;
    var t = (now - start) / 1000;

    // clamped so a tab-switch or a long GC pause cannot teleport the sim
    var dt = prevT ? Math.min(64, Math.max(4, now - prevT)) : 16.667;
    prevT = now;
    step = dt / 16.667;

    var sy = window.scrollY || 0;
    // normalised to px-per-60Hz-frame so scroll velocity reads the same
    // whatever the refresh rate
    var raw = (sy - lastScroll) / step;
    lastScroll = sy;
    vel = lerp(vel, Math.max(-160, Math.min(160, raw)), sm(0.16));
    velSmooth = vel / 160;

    mouseS[0] = lerp(mouseS[0], mouse[0], sm(0.06));
    mouseS[1] = lerp(mouseS[1], mouse[1], sm(0.06));

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);

    var light = root.getAttribute("data-theme") === "light" ? 1 : 0;

    /* backdrop */
    gl.useProgram(bgProg);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(bgProg.a.a_pos);
    gl.vertexAttribPointer(bgProg.a.a_pos, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(bgProg.u.u_res, canvas.width, canvas.height);
    gl.uniform1f(bgProg.u.u_time, t);
    gl.uniform1f(bgProg.u.u_vel, velSmooth);
    gl.uniform1f(bgProg.u.u_scroll, sy);
    gl.uniform2f(bgProg.u.u_mouse, mouseS[0], mouseS[1]);
    gl.uniform1f(bgProg.u.u_light, light);
    gl.disable(gl.BLEND);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    /* media */
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(medProg);
    gl.bindBuffer(gl.ARRAY_BUFFER, planeVB);
    gl.enableVertexAttribArray(medProg.a.a_uv);
    gl.vertexAttribPointer(medProg.a.a_uv, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planeIB);
    gl.uniform2f(medProg.u.u_res, W, H);
    gl.uniform1f(medProg.u.u_time, t);
    gl.uniform1f(medProg.u.u_light, light);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(medProg.u.u_tex, 0);

    for (var i = 0; i < media.length; i++) {
      var m = media[i];
      if (!m.ready) continue;
      var r = m.holder.getBoundingClientRect();
      if (r.bottom < -280 || r.top > H + 280 || r.width < 2) {
        m.rect = null;
        m.enter = 0;
        continue;
      }
      var tgt = [r.left, r.top, r.width, r.height];
      if (!m.rect) m.rect = tgt.slice();
      // inertia: the plane chases its own DOM rect, so it drags on a
      // fast scroll and settles a beat after you stop.
      var kPos = sm(0.18),
        kSize = sm(0.3);
      for (var k = 0; k < 4; k++) m.rect[k] = lerp(m.rect[k], tgt[k], k < 2 ? kPos : kSize);

      // Leash. Inertia alone let a plane trail so far behind its DOM rect on a
      // hard flick that it drifted clear of its own section and parked on top
      // of the NEXT project's headline — white copy over a busy photograph,
      // unreadable for the half-second it took to settle. The drag should read
      // as "attached, with give", never as "detached and floating". So the
      // offset from the true rect is capped: past the limit the plane is
      // dragged along rigidly, and everything inside it still springs.
      var maxLagY = H * 0.11;
      var maxLagX = 90;
      var dx = m.rect[0] - tgt[0];
      var dy = m.rect[1] - tgt[1];
      if (dx > maxLagX) m.rect[0] = tgt[0] + maxLagX;
      else if (dx < -maxLagX) m.rect[0] = tgt[0] - maxLagX;
      if (dy > maxLagY) m.rect[1] = tgt[1] + maxLagY;
      else if (dy < -maxLagY) m.rect[1] = tgt[1] - maxLagY;

      // Enter progress. u_enter drives the plane's alpha, so this has to reach
      // a solid 1.0 while the image is still being looked at — an earlier
      // version ramped against the top of the viewport, which left every
      // image sitting at ~60% opacity with the page showing through it.
      // Now: 0 as the top edge appears, 1 once it has risen past ~62% height.
      var seen = (H * 0.94 - r.top) / (H * 0.32);
      m.enter = lerp(m.enter, Math.max(0, Math.min(1, seen)), sm(0.16));

      m.hoverT = m.holder.__hover ? 1 : 0;
      m.hover = lerp(m.hover, m.hoverT, sm(0.09));
      m.mouseT[0] = m.holder.__mx == null ? 0.5 : m.holder.__mx;
      m.mouseT[1] = m.holder.__my == null ? 0.5 : m.holder.__my;
      m.mouse[0] = lerp(m.mouse[0], m.mouseT[0], sm(0.12));
      m.mouse[1] = lerp(m.mouse[1], m.mouseT[1], sm(0.12));

      // object-fit: cover, computed in uv
      var boxRatio = m.rect[2] / m.rect[3];
      var cx = 1,
        cy = 1;
      if (m.ratio > boxRatio) cx = boxRatio / m.ratio;
      else cy = m.ratio / boxRatio;
      var ox = (1 - cx) * 0.5;
      var oy = (1 - cy) * 0.5;

      var ax = boxRatio >= 1 ? boxRatio : 1;
      var ay = boxRatio >= 1 ? 1 : 1 / boxRatio;

      gl.bindTexture(gl.TEXTURE_2D, m.tex);
      gl.uniform4f(medProg.u.u_rect, m.rect[0], m.rect[1], m.rect[2], m.rect[3]);
      gl.uniform2f(medProg.u.u_cover, cx, cy);
      gl.uniform2f(medProg.u.u_offset, ox, oy);
      gl.uniform1f(medProg.u.u_vel, velSmooth);
      gl.uniform1f(medProg.u.u_hover, m.hover);
      gl.uniform2f(medProg.u.u_mouse, m.mouse[0], m.mouse[1]);
      gl.uniform1f(medProg.u.u_enter, m.enter);
      gl.uniform1f(medProg.u.u_z, m.z || 0);
      gl.uniform1f(medProg.u.u_persp, 1200);
      gl.uniform1f(medProg.u.u_radius, 0.055 * Math.min(ax, ay) * 2.0);
      gl.uniform2f(medProg.u.u_aspect, ax, ay);
      gl.drawElements(gl.TRIANGLES, planeCount, gl.UNSIGNED_SHORT, 0);
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Re-scan if anything is added later (the cube, lazy sections).
  if (window.MutationObserver) {
    var mo = new MutationObserver(function () {
      collect();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  gl.canvas.addEventListener("webglcontextlost", function (e) {
    e.preventDefault();
    running = false;
    root.classList.remove("gl-on");
  });
})();
