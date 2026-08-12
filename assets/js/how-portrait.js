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

   Four laws (click cycles them). The rule that earns them their place
   is that each has to be recognisable in a still frame — four labels
   over one effect is decoration, not a mechanism:

     DUST      points are points. The photograph, reconstructed.
     HALFTONE  a real newsprint screen. Exactly one dot per 2x2 source
               cell, uniform ink, and the tone lives entirely in dot
               SIZE — dark tone means no dot at all, so the plate has
               white space in it the way printed halftone does.
     SLIT      rows shear on a travelling wave and the points split
               into two chromatic channels that pull apart. The site
               already leans on chromatic aberration; this is that
               idiom taken to its limit rather than a new vocabulary.
     TOPO      only the points sitting ON a luminance contour survive.
               The face becomes a survey drawing — line, not tone.

   TOPO and HALFTONE both read tone, and tone read per-pixel from a
   photograph is noise. So a_lum is a 5x5 box blur of the luminance
   field, computed once on the CPU. Without it TOPO is speckle; with
   it, it is contour lines. That one change is the difference between
   the mode reading as an idea and reading as an accident.

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
    "attribute float a_lum;", // BLURRED luminance — see the note above
    "uniform float u_reveal;", // 0 scattered .. 1 resolved
    "uniform float u_time;",
    "uniform float u_mode;",
    "uniform float u_burst;", // 1 right after a click, decays to 0
    "uniform float u_px;", // one sampling pitch, in point-size units
    "uniform float u_light;", // 1 on the cream theme, 0 on the dark one
    "uniform vec2 u_ptr;", // pointer, in the same 0..1 space as a_uv
    "uniform float u_ptrOn;", // 0 when the pointer is away, 1 when it is on the plate
    "varying vec3 v_rgb;",
    "varying float v_fade;",

    "void main(){",
    "  vec2 uv = a_uv;",
    "  float rev = u_reveal;",
    "  float m = u_mode;",
    "  vec2 pos = uv;",
    "  float ix = floor(uv.x * 200.0);",
    "  float iy = floor(uv.y * 250.0);",
    "  float drop = 0.0;", // 1 = this point is not part of this law
    "  float s = 1.15;",
    "  vec3 col = a_rgb;",
    "  float extra = 1.0;",
    /* On paper the ink is dark, on a screen the light is bright. The
       same tone therefore has to mean opposite things in the two
       themes, or the halftone comes out as a negative of itself. */
    "  float tone = mix(a_lum, 1.0 - a_lum, u_light);",

    /* --- DUST ----------------------------------------------------- */
    /* At full reveal the points must slightly overlap their own cell,
       or the sampling lattice shows through as a dark grid. 1.45 is
       the smallest value that closes it. */
    "  if (m < 0.5) {",
    "    s = mix(1.35, 1.45, rev);",
    "    col = a_rgb;",
    "  }",

    /* --- HALFTONE ------------------------------------------------- */
    /* Four source points land in each screen cell, so three of them
       are dropped by grid parity rather than left to pile up — four
       overlapping dots would blow every cell out to solid ink. */
    "  else if (m < 1.5) {",
    "    vec2 cell = vec2(1.0 / 100.0, 1.0 / 125.0);",
    "    pos = (floor(uv / cell) + 0.5) * cell;",
    "    if (mod(ix, 2.0) > 0.5 || mod(iy, 2.0) > 0.5) drop = 1.0;",
    "    s = tone * 2.05 * mix(0.6, 1.0, rev);",
    "    col = mix(vec3(0.93, 0.95, 1.0), vec3(0.05, 0.07, 0.11), u_light);",
    /* no minimum dot size — the lightest tones have to vanish, or the
       plate fills in and the whole point of a screen is lost */
    "    extra = smoothstep(0.0, 0.1, tone);",
    "  }",

    /* --- SLIT ----------------------------------------------------- */
    /* The shear is quantised into 52 bands so it reads as scan lines
       rather than as a smooth ripple, and it never fully settles —
       even resolved, the plate keeps breathing. */
    "  else if (m < 2.5) {",
    "    float band = floor(uv.y * 52.0);",
    "    float w = sin(band * 0.66 + u_time * 1.5) * 0.65 + sin(band * 0.17 - u_time * 0.9) * 0.35;",
    "    pos.x += w * mix(0.11, 0.028, rev);",
    "    float ch = step(0.5, a_rnd.x);",
    "    pos.x += (ch * 2.0 - 1.0) * mix(0.035, 0.013, rev);",
    "    col = mix(vec3(1.0, 0.42, 0.7), vec3(0.42, 0.84, 1.0), ch) * (0.24 + a_lum * 0.88);",
    "    col *= mix(1.0, 0.62, u_light);",
    "    s = mix(1.3, 1.15, rev);",
    "  }",

    /* --- TOPO ----------------------------------------------------- */
    /* Keep only the points whose luminance sits near a band boundary.
       Roughly a fifth survive, and they land in lines, so the face is
       drawn rather than shaded. */
    "  else {",
    "    float f = a_lum * 12.0;",
    "    float dist = min(fract(f), 1.0 - fract(f));",
    "    float on = 1.0 - smoothstep(0.06, 0.17, dist);",
    "    if (on < 0.06) drop = 1.0;",
    "    pos.y += sin(u_time * 0.7 + a_lum * 30.0) * mix(0.03, 0.0022, rev);",
    "    col = mix(vec3(0.74, 0.87, 1.0), vec3(0.07, 0.2, 0.48), u_light);",
    "    s = 1.05;",
    "    extra = on;",
    "  }",

    /* --- THE LENS -------------------------------------------------- */
    /* Sid: "make my particle images more hover interactive and cooler."

       Before this the pointer was a switch: entering the plate set reveal
       to 1 and leaving set it to 0, so the whole cloud resolved or
       dispersed as one object and the cursor's position carried no
       meaning at all. You could hover the top-left corner and the
       bottom-right corner and get identical frames.

       Now the pointer is a place. Points within about a fifth of the
       plate of it are pushed outward along the radius, swirled slightly
       around it, grown and brightened — a bulge that travels with the
       cursor, strongest at the centre and gone by the edge of its reach.

       The falloff is a gaussian rather than a linear ramp because a
       linear one has a visible boundary circle, and a circle is exactly
       what a lens must not have. The y term is scaled by 1.25 to undo the
       source's 4:5 aspect, or the "circle" of influence is an ellipse.

       It runs in every mode, and each mode answers differently for free:
       DUST bulges, HALFTONE's dots fatten into a blown-out highlight,
       SLIT's bands bow around it, TOPO's contour lines part. One rule,
       four behaviours, because the rule acts on the position and size the
       mode has already chosen rather than replacing them. */
    "  vec2 pd = pos - u_ptr;",
    "  vec2 pda = pd * vec2(1.0, 1.25);",
    "  float pl2 = dot(pda, pda);",
    "  float infl = u_ptrOn * exp(-pl2 * 24.0);",
    "  if (infl > 0.002) {",
    "    float pr = sqrt(pl2);",
    "    vec2 dir = pda / max(0.0001, pr);",
    /* The push has to go to zero AT the cursor, not peak there. Scaling by
       the radius (saturating at 0.1) is what makes this a bulge rather than
       a hole: the first version displaced every point by the full amount
       including the ones directly under the pointer, so the centre emptied
       out and left a black disc with a hard ring of piled-up points around
       it — a puncture, not a lens. Zero at the centre, strongest at the
       shoulder, gone by the edge of the falloff. */
    "    float ring = min(pr / 0.1, 1.0);",
    /* A little rotation with the push, so the cloud turns around the cursor
       instead of only fleeing it. */
    "    float sw = infl * 0.8;",
    "    vec2 rot = vec2(dir.x * cos(sw) - dir.y * sin(sw), dir.x * sin(sw) + dir.y * cos(sw));",
    "    pos += rot * vec2(1.0, 0.8) * infl * ring * 0.042;",
    /* Size and light do peak at the centre — that is the part that reads as
       magnification, and it is what fills the middle the push vacates. */
    "    s *= 1.0 + infl * 2.3;",
    "    col += vec3(0.2, 0.26, 0.34) * infl;",
    "  }",

    /* --- the scatter ---------------------------------------------- */
    /* Dispersal is radial-outward plus a per-point drift, so the
       cloud has a silhouette rather than being a uniform fog.       */
    "  float ang = a_rnd.x * 6.2831853;",
    "  float rad = 0.05 + a_rnd.y * 0.22;",
    "  vec2 away = vec2(cos(ang), sin(ang)) * rad;",
    "  away += (uv - vec2(0.5)) * 0.30 * a_rnd.y;",
    "  away.y += sin(u_time * 0.6 + a_rnd.x * 12.0) * 0.018;",
    "  away.x += cos(u_time * 0.45 + a_rnd.y * 9.0) * 0.014;",
    "  float scat = clamp((1.0 - rev) + u_burst * 1.15, 0.0, 1.6);",
    "  pos += away * scat;",

    /* dropped points are pushed outside clip space rather than merely
       made transparent — a fully transparent point still costs a
       fragment, and there are tens of thousands of them */
    "  if (drop > 0.5) { gl_Position = vec4(3.0, 3.0, 0.0, 1.0); gl_PointSize = 0.0; v_rgb = vec3(0.0); v_fade = 0.0; return; }",

    "  gl_Position = vec4(pos.x * 2.0 - 1.0, 1.0 - pos.y * 2.0, 0.0, 1.0);",
    "  gl_PointSize = max(0.0, s * u_px);",

    "  col *= mix(1.0, 0.78, u_light);",
    /* scattered points are colder and dimmer — the colour arrives with
       the form, so hovering reads as the picture "finding" itself */
    "  float grey = dot(col, vec3(0.299, 0.587, 0.114));",
    "  col = mix(vec3(grey) * 0.92 + vec3(0.03, 0.05, 0.09), col, clamp(rev * 1.2, 0.0, 1.0));",
    "  v_rgb = col;",
    "  v_fade = mix(0.78, 1.0, rev) * (1.0 - u_burst * 0.25) * extra;",
    "}",
  ].join("\n");

  var FRAG = [
    "precision mediump float;",
    "varying vec3 v_rgb;",
    "varying float v_fade;",
    "void main(){",
    "  vec2 d = gl_PointCoord - vec2(0.5);",
    "  float r = dot(d, d);",
    "  if (r > 0.25) discard;",
    "  float a = smoothstep(0.25, 0.05, r);",
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

    /* luminance, then a 5x5 box blur of it. HALFTONE and TOPO both
       read tone, and per-pixel tone off a photograph is noise: TOPO
       in particular degenerates into speckle without this. */
    var N = GRID_W * GRID_H;
    var L0 = new Float32Array(N);
    for (var q = 0; q < N; q++) {
      L0[q] = (0.299 * d[q * 4] + 0.587 * d[q * 4 + 1] + 0.114 * d[q * 4 + 2]) / 255;
    }
    var LB = new Float32Array(N);
    for (var by = 0; by < GRID_H; by++) {
      for (var bx = 0; bx < GRID_W; bx++) {
        var acc = 0,
          cnt = 0;
        for (var dy = -2; dy <= 2; dy++) {
          var yy = by + dy;
          if (yy < 0 || yy >= GRID_H) continue;
          for (var dx = -2; dx <= 2; dx++) {
            var xx = bx + dx;
            if (xx < 0 || xx >= GRID_W) continue;
            acc += L0[yy * GRID_W + xx];
            cnt++;
          }
        }
        LB[by * GRID_W + bx] = acc / cnt;
      }
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
        uv.push((i + 0.5) / GRID_W, (j + 0.5) / GRID_H);
        rgb.push(d[o] / 255, d[o + 1] / 255, d[o + 2] / 255);
        rnd.push(Math.random(), Math.random());
        lum.push(LB[j * GRID_W + i]);
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
    ["u_reveal", "u_time", "u_mode", "u_burst", "u_px", "u_light", "u_ptr", "u_ptrOn"].forEach(function (k) {
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

    /* Where the pointer is on the plate, in the same 0..1 space the shader
       samples the photograph in, plus how much of it is currently applied.

       Both are eased rather than written straight through. A pointermove
       fires at whatever rate the mouse reports, which is not the frame rate,
       so assigning the raw value makes the lens stutter on any pointer
       polling below 120Hz; and switching u_ptrOn between 0 and 1 on
       enter/leave would pop the bulge in and out. The easing happens in the
       frame loop, against dt, for the same reason the reveal does. */
    var pxTo = 0.5,
      pyTo = 0.5,
      px = 0.5,
      py = 0.5,
      lensTo = 0,
      lens = 0;

    host.addEventListener(
      "pointermove",
      function (e) {
        var r = host.getBoundingClientRect();
        if (!r.width || !r.height) return;
        pxTo = (e.clientX - r.left) / r.width;
        pyTo = (e.clientY - r.top) / r.height;
        /* First contact should not drag the lens across the plate from
           wherever it was left; put it where the pointer actually is. */
        if (!lensTo) {
          px = pxTo;
          py = pyTo;
        }
        lensTo = 1;
      },
      { passive: true }
    );

    host.addEventListener("pointerenter", function () {
      want = 1;
    });
    host.addEventListener("pointerleave", function () {
      want = 0;
      lensTo = 0;
    });
    host.addEventListener("pointerdown", function () {
      want = 1;
      setMode(mode + 1);
    });
    /* keyboard parity — the slot is focusable */
    host.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        want = 1;
        setMode(mode + 1);
      }
    });
    host.addEventListener("focus", function () {
      want = 1;
      /* No pointer to follow, so the lens sits in the middle of the plate.
         Better than leaving a keyboard user with a resolved-but-inert
         picture that a mouse user sees moving. */
      pxTo = px = 0.5;
      pyTo = py = 0.5;
      lensTo = 1;
    });
    host.addEventListener("blur", function () {
      want = 0;
      lensTo = 0;
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
      /* The lens chases faster than the reveal — it is tracking a hand, not
         a state change — but not instantly, which is what gives the bulge
         its slight weight behind the cursor. */
      px += (pxTo - px) * (1 - Math.exp(-dt / 0.055));
      py += (pyTo - py) * (1 - Math.exp(-dt / 0.055));
      lens += (lensTo - lens) * (1 - Math.exp(-dt / 0.13));
      burst *= Math.exp(-dt / 0.28);
      if (burst < 0.002) burst = 0;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(U.u_reveal, reveal);
      gl.uniform1f(U.u_time, t);
      gl.uniform1f(U.u_mode, mode);
      gl.uniform1f(U.u_burst, burst);
      gl.uniform1f(U.u_px, W / GRID_W);
      gl.uniform1f(U.u_light, light);
      gl.uniform2f(U.u_ptr, px, py);
      gl.uniform1f(U.u_ptrOn, lens);
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
