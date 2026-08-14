/* ============================================================
   Homepage hero — the film.

   Sid sits and works, pixelated, behind everything. Moving the
   pointer paints the clear footage back in. It is a real paint
   system, not a CSS mask: a mask texture ping-pongs between two
   framebuffers, the brush is written into it each frame, and the
   whole thing decays, so a stroke fades the way ink lifts rather
   than snapping off. The composite shader mixes pixel -> clear
   through that mask and adds an RGB fringe on the wet edge, so
   the reveal shares the site's chromatic language.

   Falls back, in order: no WebGL or reduced motion -> the freeze
   frame as a plain <img>, nothing else runs. Backgrounded tab ->
   the loop stops entirely.
   ============================================================ */
(function () {
  "use strict";

  var stage = document.getElementById("film-stage");
  if (!stage) return;

  var canvas = document.getElementById("film-gl");
  var vPix = document.getElementById("film-pixel");
  var vClear = document.getElementById("film-clear");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var gl = null;
  if (!reduce && canvas) {
    try {
      gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false });
    } catch (e) {
      gl = null;
    }
  }
  if (!gl) {
    stage.classList.add("is-static");
    return;
  }
  stage.classList.add("is-gl");

  function sh(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  function prog(vs, fs) {
    var p = gl.createProgram();
    var a = sh(gl.VERTEX_SHADER, vs),
      b = sh(gl.FRAGMENT_SHADER, fs);
    if (!a || !b) return null;
    gl.attachShader(p, a);
    gl.attachShader(p, b);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(p));
      return null;
    }
    p.u = {};
    var n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) {
      var un = gl.getActiveUniform(p, i).name;
      p.u[un] = gl.getUniformLocation(p, un);
    }
    return p;
  }

  var VS = "attribute vec2 a; varying vec2 v; void main(){ v = a * 0.5 + 0.5; gl_Position = vec4(a, 0.0, 1.0); }";

  /* The brush. Written into a half-resolution mask that decays every
     frame, so strokes have a tail and the last place you looked stays
     warm for a moment. */
  var FS_MASK = [
    "precision highp float; varying vec2 v;",
    "uniform sampler2D u_prev;",
    "uniform vec2 u_mouse;",
    "uniform float u_down, u_radius, u_decay, u_aspect;",
    "void main(){",
    "  float m = texture2D(u_prev, v).r * u_decay;",
    "  vec2 d = v - u_mouse; d.x *= u_aspect;",
    "  float br = 1.0 - smoothstep(0.0, u_radius, length(d));",
    "  br = br * br;",
    "  m = max(m, br * u_down);",
    "  gl_FragColor = vec4(m, 0.0, 0.0, 1.0);",
    "}",
  ].join("\n");

  var FS_COMP = [
    "precision highp float; varying vec2 v;",
    "uniform sampler2D u_base, u_clear, u_mask;",
    "uniform vec2 u_res;",
    "uniform float u_time, u_fade;",
    "uniform vec2 u_cover;",
    "void main(){",
    "  vec2 uv = v;",
    // object-fit: cover, done in uv rather than by scaling the quad, so the
    // film crops instead of stretching and the mask keeps stage coordinates
    "  uv = (uv - 0.5) * u_cover + 0.5;",
    "  uv.y = 1.0 - uv.y;",
    /* ── THE PLATE IS ALREADY A PHOTOGRAPH ────────────────────────────────
       Measured on the rendered hero: mean luminance 19 of 255, standard
       deviation 22. That is a near-black rectangle with almost no structure
       in it — the largest element on the site, and you could not tell there
       was a person in it until you moved the pointer.

       Three things were taking it there at once and each looked reasonable
       alone: the pixelated encode is dark to begin with, a vignette
       multiplied the edges by as little as 0.58, and nothing ever lifted the
       exposure. A dark plate times a dark vignette is mud.

       So the base is graded before anything else touches it, the way a print
       is: shadows opened with a gamma, then a gentle contrast pivot about the
       midtone so opening them does not also flatten them. The picture is not
       brightened uniformly — that would just be a lighter mud — it is given
       back its separation. */
    "  float mask = clamp(texture2D(u_mask, v).r, 0.0, 1.0);",
    /* A floor of development. The brush is still what resolves the frame, but
       at rest the emulsion is no longer blank: a fifth of the clear plate
       bleeds through everywhere, which is the difference between "a dark
       rectangle" and "an undeveloped photograph of someone". */
    "  mask = max(mask, 0.28);",
    "  vec3 base = texture2D(u_base, uv).rgb;",
    "  base = pow(base, vec3(0.64));",
    "  base = clamp((base - 0.46) * 1.22 + 0.5, 0.0, 1.0);",
    // the wet edge splits into red/cyan, the same aberration the
    // project planes use, so the brush belongs to the site
    "  float o = 0.0045 * mask;",
    "  vec3 clr = vec3(texture2D(u_clear, uv + vec2(o, 0.0)).r, texture2D(u_clear, uv).g, texture2D(u_clear, uv - vec2(o, 0.0)).b);",
    "  vec3 col = mix(base, clr, mask);",
    "  float edge = smoothstep(0.18, 0.5, mask) * (1.0 - smoothstep(0.5, 0.9, mask));",
    "  col += vec3(0.30, 0.46, 1.0) * edge * 0.10;",
    // scanline + vignette: it should read as footage on a screen
    "  col *= 0.93 + 0.07 * sin(v.y * u_res.y * 1.1);",
    /* Down from 0.42. A vignette is meant to hold the eye in the frame, not
       to remove the corners of it — at 0.42 on a plate this dark the outer
       third of the picture was gone. */
    "  col *= 1.0 - 0.26 * length((v - 0.5) * vec2(1.05, 1.0));",
    "  gl_FragColor = vec4(col, u_fade);",
    "}",
  ].join("\n");

  var pMask = prog(VS, FS_MASK),
    pComp = prog(VS, FS_COMP);
  if (!pMask || !pComp) {
    stage.classList.remove("is-gl");
    stage.classList.add("is-static");
    return;
  }

  var quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  function bindQuad(p) {
    var a = gl.getAttribLocation(p, "a");
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
  }

  function newTex() {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([8, 11, 18, 255]));
    return t;
  }
  var texPix = newTex(),
    texClear = newTex();

  var MW = 2,
    MH = 2,
    maskTex = [newTex(), newTex()],
    maskFbo = [gl.createFramebuffer(), gl.createFramebuffer()],
    ping = 0;

  function sizeMask(w, h) {
    MW = Math.max(2, Math.round(w / 2));
    MH = Math.max(2, Math.round(h / 2));
    for (var i = 0; i < 2; i++) {
      gl.bindTexture(gl.TEXTURE_2D, maskTex[i]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, MW, MH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, maskFbo[i]);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, maskTex[i], 0);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var vidAspect = 16 / 9;
  function resize() {
    var w = stage.clientWidth || window.innerWidth;
    var h = stage.clientHeight || window.innerHeight;
    canvas.width = Math.max(2, Math.round(w * dpr));
    canvas.height = Math.max(2, Math.round(h * dpr));
    sizeMask(canvas.width, canvas.height);
  }
  window.addEventListener("resize", resize, { passive: true });

  function upload(tex, video) {
    if (video.readyState < 2) return false;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    try {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    } catch (e) {
      return false;
    }
    if (video.videoWidth) vidAspect = video.videoWidth / video.videoHeight;
    return true;
  }

  /* Pointer. Tracked against the stage, lerped, and the stroke
     strength follows speed — a slow drag opens a small window, a
     fast sweep tears a wide one. */
  var mouse = [0.5, 0.5],
    target = [0.5, 0.5],
    lastPos = [0.5, 0.5],
    vel = 0,
    lastMove = -1e9,
    touched = false;

  function onMove(e) {
    var r = stage.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width;
    var y = 1 - (e.clientY - r.top) / r.height;
    if (x < -0.15 || x > 1.15 || y < -0.15 || y > 1.15) return;
    target = [x, y];
    vel = Math.min(1, Math.hypot(x - lastPos[0], y - lastPos[1]) * 16);
    lastPos = [x, y];
    lastMove = performance.now();
    if (!touched) {
      touched = true;
      stage.classList.add("is-touched");
    }
  }
  window.addEventListener("pointermove", onMove, { passive: true });

  var running = true;
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    if (running) {
      last = performance.now();
      requestAnimationFrame(frame);
      vPix.play().catch(function () {});
      vClear.play().catch(function () {});
    } else {
      vPix.pause();
      vClear.pause();
    }
  });

  [vPix, vClear].forEach(function (v) {
    v.addEventListener(
      "loadeddata",
      function () {
        v.play().catch(function () {});
      },
      { once: true }
    );
  });

  canvas.addEventListener("webglcontextlost", function (e) {
    e.preventDefault();
    running = false;
    stage.classList.remove("is-gl");
    stage.classList.add("is-static");
  });

  /* An unattended hero should still move. Until the pointer arrives,
     an invisible hand drifts a slow figure across the frame so the
     reveal demonstrates itself. */
  function idlePoint(t) {
    return [0.5 + Math.sin(t * 0.36) * 0.26, 0.52 + Math.sin(t * 0.53) * 0.16];
  }

  var t0 = performance.now(),
    last = t0,
    fade = 0;

  function frame(now) {
    if (!running) return;
    var dt = Math.min(64, now - last);
    last = now;
    var step = dt / 16.667;
    var t = (now - t0) / 1000;
    var sm = function (k) {
      return 1 - Math.pow(1 - k, step);
    };

    if (!touched) {
      var p = idlePoint(t);
      target = p;
      vel = 0.28;
      lastMove = now;
    }

    mouse[0] += (target[0] - mouse[0]) * sm(0.16);
    mouse[1] += (target[1] - mouse[1]) * sm(0.16);

    var idle = (now - lastMove) / 1000;
    var down = Math.max(0, (0.6 + vel * 0.7) * Math.max(0, 1 - idle * 1.4));
    vel *= Math.pow(0.9, step);
    fade += (1 - fade) * sm(0.03);

    upload(texPix, vPix);
    upload(texClear, vClear);

    var src = ping,
      dst = 1 - ping;
    gl.bindFramebuffer(gl.FRAMEBUFFER, maskFbo[dst]);
    gl.viewport(0, 0, MW, MH);
    gl.useProgram(pMask);
    bindQuad(pMask);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, maskTex[src]);
    gl.uniform1i(pMask.u.u_prev, 0);
    gl.uniform2f(pMask.u.u_mouse, mouse[0], mouse[1]);
    gl.uniform1f(pMask.u.u_down, down);
    /* The idle hand paints wide and soft; a real pointer paints tight. At
       rest this reads as the developer washing across the plate, which is the
       thing the hero is actually about, rather than as a small bright dot
       wandering a dark field. */
    gl.uniform1f(pMask.u.u_radius, (touched ? 0.1 : 0.26) + vel * 0.06);
    gl.uniform1f(pMask.u.u_decay, Math.pow(0.972, step));
    gl.uniform1f(pMask.u.u_aspect, canvas.width / canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    ping = dst;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(pComp);
    bindQuad(pComp);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texPix);
    gl.uniform1i(pComp.u.u_base, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texClear);
    gl.uniform1i(pComp.u.u_clear, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, maskTex[ping]);
    gl.uniform1i(pComp.u.u_mask, 2);
    gl.uniform2f(pComp.u.u_res, canvas.width, canvas.height);
    gl.uniform1f(pComp.u.u_time, t);
    gl.uniform1f(pComp.u.u_fade, fade);
    // cover: shrink uv on whichever axis has slack, so the film fills the
    // stage by cropping. Sampling a narrower slice of the source is what
    // crops it; the axis that already matches is left at 1.
    var stageAspect = canvas.width / canvas.height;
    if (vidAspect > stageAspect) gl.uniform2f(pComp.u.u_cover, stageAspect / vidAspect, 1.0);
    else gl.uniform2f(pComp.u.u_cover, 1.0, vidAspect / stageAspect);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(frame);
  }

  resize();
  requestAnimationFrame(frame);
})();
