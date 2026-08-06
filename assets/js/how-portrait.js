/* ===================================================================
   how-portrait.js — the portrait in "02 How I think" drawn as a point
   cloud instead of a photograph.

   The premise of that slot is a screen that wakes up and finds him.
   A photo that simply fades in states that; a cloud of particles that
   has to *resolve* into him performs it. So the image is never blitted
   — every frame it is reconstructed out of ~50,000 points that carry
   one pixel of colour each.

   Three states:
     idle   the points sit scattered in a slow-drifting cloud
     hover  they converge onto their true coordinates — the image
     click  they detonate and re-form under a different drawing law

   Four laws (click cycles them):
     DUST      points are points. Straight reconstruction.
     HALFTONE  size carries tone, colour is dropped. A newspaper cut.
     SLIT      rows shear on a travelling wave, channels separate.
     TOPO      points ride contour rings of the luminance field.

   The <img> stays in the DOM. It is the a11y text, the no-WebGL path
   and the reduced-motion path; GL only takes over after the point
   buffer is actually built and uploaded. Same contract as the rest of
   the page — the fallback is "the thing you already see".
   =================================================================== */
(function () {
  "use strict";

  var host = document.querySelector(".ide__photo");
  if (!host) return;
  var img = host.querySelector("img");
  if (!img) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var MODES = ["DUST", "HALFTONE", "SLIT", "TOPO"];
  var GRID_W = 200; // columns sampled across the frame
  var GRID_H = 250; // rows — the source is 4:5, so this is square sampling

  /* ── shaders ───────────────────────────────────────────────────── */

  var VERT = [
    "precision highp float;",
    "attribute vec2 a_uv;", // 0..1 position in the source image
    "attribute vec3 a_rgb;",
    "attribute vec2 a_rnd;", // two stable per-point randoms
    "attribute float a_lum;",
    "uniform float u_reveal;", // 0 scattered .. 1 resolved
    "uniform float u_time;",
    "uniform float u_mode;",
    "uniform float u_burst;", // 1 right after a click, decays to 0
    "uniform float u_aspect;",
    "uniform float u_px;", // one sampling pitch, in point-size units
    "uniform float u_light;", // 1 on the cream theme, 0 on the dark one
    "varying vec3 v_rgb;",
    "varying float v_lum;",
    "varying float v_fade;",

    "float hash(vec2 p){ return fract(sin(dot(p, vec2(41.71, 289.13))) * 43758.5453); }",

    "void main(){",
    "  vec2 uv = a_uv;",
    "  float rev = u_reveal;",
    "  float m = u_mode;",
    "  vec2 pos = uv;",

    /* --- the law ------------------------------------------------- */
    /* DUST: nothing extra — the scatter below does all the work.    */

    /* HALFTONE: snap to a coarser lattice so the points read as an
       engraved screen rather than a photograph.                     */
    "  if (m > 0.5 && m < 1.5) {",
    "    vec2 cell = vec2(1.0 / 100.0, 1.0 / 125.0);",
    "    pos = (floor(uv / cell) + 0.5) * cell;",
    "  }",

    /* SLIT: each row shears on a travelling wave. At full reveal the
       wave is still there but tiny, so the image keeps breathing.   */
    "  if (m > 1.5 && m < 2.5) {",
    "    float amp = mix(0.13, 0.012, rev);",
    "    float w = sin(uv.y * 46.0 + u_time * 1.1) * 0.6 + sin(uv.y * 13.0 - u_time * 0.7) * 0.4;",
    "    pos.x += w * amp;",
    "  }",

    /* TOPO: points migrate onto luminance contour rings — the face
       becomes a survey map that tightens back into a face.         */
    "  if (m > 2.5) {",
    "    float band = 9.0;",
    "    float target = (floor(a_lum * band) + 0.5) / band;",
    "    vec2 c = vec2(0.5, 0.46);",
    "    vec2 d = uv - c;",
    "    float r = length(d) + 0.0001;",
    "    float push = (target - a_lum) * mix(0.9, 0.07, rev);",
    "    pos += (d / r) * push;",
    "    pos.y += sin(u_time * 0.5 + a_lum * 22.0) * mix(0.02, 0.002, rev);",
    "  }",

    /* --- the scatter --------------------------------------------- */
    /* Dispersal is radial-outward plus a per-point drift, so the
       cloud has a silhouette rather than being a uniform fog.       */
    "  float ang = a_rnd.x * 6.2831853;",
    "  float rad = 0.05 + a_rnd.y * 0.22;",
    "  vec2 away = vec2(cos(ang), sin(ang)) * rad;",
    "  away += (uv - vec2(0.5)) * 0.30 * a_rnd.y;",
    "  float drift = sin(u_time * 0.6 + a_rnd.x * 12.0) * 0.018;",
    "  away.y += drift;",
    "  away.x += cos(u_time * 0.45 + a_rnd.y * 9.0) * 0.014;",

    "  float scat = (1.0 - rev) + u_burst * 1.15;",
    "  scat = clamp(scat, 0.0, 1.6);",
    "  pos += away * scat;",

    /* --- to clip space ------------------------------------------- */
    "  vec2 clip = vec2(pos.x * 2.0 - 1.0, 1.0 - pos.y * 2.0);",
    "  gl_Position = vec4(clip, 0.0, 1.0);",

    /* --- size ----------------------------------------------------- */
    "  float s = 1.15;",
    "  if (m > 0.5 && m < 1.5) {",
    "    float tone = mix(a_lum, 1.0 - a_lum, u_light);",
    "    s = mix(0.15, 2.0, tone) * mix(0.55, 1.15, rev);",
    "  }",
    "  else if (m > 2.5)       { s = mix(0.5, 1.25, a_lum); }",
    "  else                    { s = mix(1.35, 1.12, rev); }",
    "  gl_PointSize = max(1.0, s * u_px);",

    /* --- colour ---------------------------------------------------- */
    "  vec3 col = a_rgb;",
    "  if (m > 0.5 && m < 1.5) {",
    "    col = mix(vec3(mix(0.62, 0.96, a_lum)), vec3(mix(0.05, 0.26, a_lum)), u_light);",
    "  }",
    "  if (m > 1.5 && m < 2.5) {",
    "    float sh = (hash(vec2(uv.y, 3.1)) - 0.5) * mix(0.9, 0.12, rev);",
    "    col = vec3(a_rgb.r * (1.0 + sh), a_rgb.g, a_rgb.b * (1.0 - sh));",
    "  }",
    /* scattered points are colder and dimmer — the colour arrives with
       the form, so hovering reads as the picture "finding" itself */
    "  col *= mix(1.0, 0.74, u_light);",
    "  float grey = dot(col, vec3(0.299, 0.587, 0.114));",
    "  col = mix(vec3(grey) * 0.92 + vec3(0.03, 0.05, 0.09), col, clamp(rev * 1.15, 0.0, 1.0));",
    "  v_rgb = col;",
    "  v_lum = a_lum;",
    "  v_fade = mix(0.8, 1.0, rev) * (1.0 - u_burst * 0.25);",
    "}",
  ].join("\n");

  var FRAG = [
    "precision mediump float;",
    "varying vec3 v_rgb;",
    "varying float v_lum;",
    "varying float v_fade;",
    "void main(){",
    "  vec2 d = gl_PointCoord - vec2(0.5);",
    "  float r = dot(d, d);",
    "  if (r > 0.25) discard;",
    "  float a = smoothstep(0.25, 0.06, r);",
    "  gl_FragColor = vec4(v_rgb, a * v_fade);",
    "}",
  ].join("\n");

  /* ── boot ──────────────────────────────────────────────────────── */

  function sample(image) {
    var c = document.createElement("canvas");
    c.width = GRID_W;
    c.height = GRID_H;
    var x = c.getContext("2d", { willReadFrequently: true });
    if (!x) return null;
    x.drawImage(image, 0, 0, GRID_W, GRID_H);
    var d;
    try {
      d = x.getImageData(0, 0, GRID_W, GRID_H).data;
    } catch (e) {
      return null;
    }
    var uv = [],
      rgb = [],
      rnd = [],
      lum = [],
      n = 0;
    for (var j = 0; j < GRID_H; j++) {
      for (var i = 0; i < GRID_W; i++) {
        var o = (j * GRID_W + i) * 4;
        var a = d[o + 3] / 255;
        if (a < 0.22) continue; // the cutout's empty air
        var r = d[o] / 255,
          g = d[o + 1] / 255,
          b = d[o + 2] / 255;
        uv.push((i + 0.5) / GRID_W, (j + 0.5) / GRID_H);
        rgb.push(r, g, b);
        rnd.push(Math.random(), Math.random());
        lum.push(0.299 * r + 0.587 * g + 0.114 * b);
        n++;
      }
    }
    return n ? { n: n, uv: uv, rgb: rgb, rnd: rnd, lum: lum } : null;
  }

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
    return s;
  }

  function start(image) {
    var data = sample(image);
    if (!data) return;

    var cv = document.createElement("canvas");
    cv.className = "ide__cloud";
    cv.setAttribute("aria-hidden", "true");
    host.appendChild(cv);

    var gl = null;
    try {
      gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false }) || cv.getContext("experimental-webgl");
    } catch (e) {
      gl = null;
    }
    if (!gl) {
      cv.remove();
      return;
    }

    var vs = compile(gl, gl.VERTEX_SHADER, VERT);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      cv.remove();
      return;
    }
    var pr = gl.createProgram();
    gl.attachShader(pr, vs);
    gl.attachShader(pr, fs);
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
      cv.remove();
      return;
    }
    gl.useProgram(pr);

    function buf(arr, loc, size) {
      var b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
      var l = gl.getAttribLocation(pr, loc);
      gl.enableVertexAttribArray(l);
      gl.vertexAttribPointer(l, size, gl.FLOAT, false, 0, 0);
    }
    buf(data.uv, "a_uv", 2);
    buf(data.rgb, "a_rgb", 3);
    buf(data.rnd, "a_rnd", 2);
    buf(data.lum, "a_lum", 1);

    var U = {};
    ["u_reveal", "u_time", "u_mode", "u_burst", "u_aspect", "u_px", "u_light"].forEach(function (k) {
      U[k] = gl.getUniformLocation(pr, k);
    });

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    var dpr = 1,
      W = 1,
      H = 1;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var r = host.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width * dpr));
      H = Math.max(1, Math.round(r.height * dpr));
      if (cv.width !== W || cv.height !== H) {
        cv.width = W;
        cv.height = H;
      }
      gl.viewport(0, 0, W, H);
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    /* the point buffer is live — hand the slot over to GL. Only now
       does the slot become an interactive control: without the cloud
       there is nothing to operate, and a focusable div that does
       nothing is worse than no control at all. */
    host.classList.add("has-cloud");
    host.setAttribute("tabindex", "0");
    host.setAttribute("role", "button");
    host.setAttribute("aria-label", "Portrait of Sid Mehta drawn as a point cloud. Activate to change how it is drawn.");

    /* ── state ─────────────────────────────────────────────────── */
    var light = document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0;
    new MutationObserver(function () {
      light = document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0;
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    var reveal = 0,
      want = 0,
      mode = 0,
      burst = 0,
      t0 = performance.now(),
      visible = true,
      raf = 0;

    var label = document.createElement("span");
    label.className = "ide__mode";
    label.textContent = MODES[0];
    host.appendChild(label);

    function setMode(next) {
      mode = next % MODES.length;
      burst = 1;
      label.textContent = MODES[mode];
      label.classList.remove("is-hit");
      /* restart the flash */
      void label.offsetWidth;
      label.classList.add("is-hit");
    }

    host.addEventListener("pointerenter", function () {
      want = 1;
    });
    host.addEventListener("pointerleave", function () {
      want = 0;
    });
    host.addEventListener("pointerdown", function () {
      want = 1;
      setMode(mode + 1);
    });
    /* keyboard parity — the slot is focusable via the button below */
    host.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        want = 1;
        setMode(mode + 1);
      }
    });

    if (window.IntersectionObserver) {
      new IntersectionObserver(
        function (es) {
          visible = es[0].isIntersecting;
          if (visible && !raf) raf = requestAnimationFrame(frame);
        },
        { threshold: 0.02 }
      ).observe(host);
    }

    /* Easing is time-based, not per-frame. A per-frame lerp silently
       changes speed with the refresh rate — on a 120Hz display the
       reveal snaps, on a throttled tab it crawls. */
    var last = t0;
    function frame(now) {
      raf = 0;
      if (!visible) return;
      var t = (now - t0) / 1000;
      var dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      reveal += (want - reveal) * (1 - Math.exp(-dt / 0.19));
      burst *= Math.exp(-dt / 0.28);
      if (burst < 0.002) burst = 0;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(U.u_reveal, reveal);
      gl.uniform1f(U.u_time, t);
      gl.uniform1f(U.u_mode, mode);
      gl.uniform1f(U.u_burst, burst);
      gl.uniform1f(U.u_aspect, W / H);
      gl.uniform1f(U.u_px, W / GRID_W);
      gl.uniform1f(U.u_light, light);
      gl.drawArrays(gl.POINTS, 0, data.n);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
  }

  function go() {
    var once = false;
    function fire(im) {
      if (once) return;
      once = true;
      start(im);
    }
    var im = new Image();
    im.decoding = "async";
    im.onload = function () {
      fire(im);
    };
    im.onerror = function () {};
    im.src = img.currentSrc || img.src;
    if (im.complete && im.naturalWidth) fire(im);
  }

  if (document.readyState === "complete") go();
  else window.addEventListener("load", go, { once: true });
})();
