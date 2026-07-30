/* Homepage hero film — pixel intro that freezes, then a WebGL brush that paints
   the clear footage through, with per-click blend/shader looks and a left
   motion-blur/darken so the headline stays legible. Falls back to a still image
   if WebGL is unavailable or the visitor prefers reduced motion. Self-contained. */
(function () {
  "use strict";
  var film = document.getElementById("home-film");
  var canvas = document.getElementById("home-film-gl");
  var vPix = document.getElementById("hf-pixel");
  var vClear = document.getElementById("hf-clear");
  var hint = document.getElementById("home-film-hint");
  var stage = document.getElementById("home-stage");
  if (!film || !canvas || !vPix || !vClear) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function fallback() {
    film.classList.add("is-fallback");
    if (!reduce) vClear.play && vClear.play().catch(function () {});
  }
  if (reduce) {
    fallback();
    return;
  }

  var gl = null;
  try {
    gl = canvas.getContext("webgl", { alpha: false, antialias: false, premultipliedAlpha: false });
  } catch (e) {
    gl = null;
  }
  if (!gl) {
    fallback();
    return;
  }

  try {
    var sh = function (type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    var prog = function (vs, fs) {
      var p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(p));
        return null;
      }
      return p;
    };

    var VS = "attribute vec2 a; varying vec2 v; void main(){ v = a*0.5+0.5; gl_Position = vec4(a,0.0,1.0); }";
    var FS_MASK = [
      "precision highp float; varying vec2 v;",
      "uniform sampler2D u_prev; uniform vec2 u_mouse; uniform float u_down, u_radius, u_decay, u_aspect;",
      "void main(){ float m = texture2D(u_prev, v).r * u_decay;",
      "  vec2 d = v - u_mouse; d.x *= u_aspect;",
      "  float br = 1.0 - smoothstep(0.0, u_radius, length(d));",
      "  m = max(m, br * u_down); gl_FragColor = vec4(m,0.0,0.0,1.0); }",
    ].join("\n");
    var FS_COMP = [
      "precision highp float; varying vec2 v;",
      "uniform sampler2D u_base, u_clear, u_mask; uniform vec2 u_res, u_mouse; uniform float u_time, u_mode;",
      "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }",
      "float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);",
      "  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }",
      "vec3 rev(vec2 uv, float mode, float mask){",
      "  if(mode<0.5){ return texture2D(u_clear,uv).rgb; }",
      "  if(mode<1.5){ float o=0.006*mask; return vec3(texture2D(u_clear,uv+vec2(o,0.0)).r, texture2D(u_clear,uv).g, texture2D(u_clear,uv-vec2(o,0.0)).b); }",
      "  if(mode<2.5){ vec3 c=texture2D(u_clear,uv).rgb; return c+c*c*1.1*mask; }",
      "  if(mode<3.5){ vec2 w=vec2(noise(uv*6.0+u_time*0.3), noise(uv*6.0-u_time*0.25))-0.5; return texture2D(u_clear,uv+w*0.05*mask).rgb; }",
      "  if(mode<4.5){ float l=dot(texture2D(u_clear,uv).rgb, vec3(0.299,0.587,0.114)); return mix(vec3(0.05,0.09,0.22), vec3(1.0,0.77,0.47), l); }",
      "  vec3 c=texture2D(u_clear,uv).rgb; float sl=0.85+0.15*sin(uv.y*u_res.y*1.2); return mix(c,(1.0-c)*sl,mask); }",
      "void main(){ vec2 uv=v; float mask=texture2D(u_mask,uv).r;",
      "  vec3 base=texture2D(u_base,uv).rgb; vec3 r=rev(uv,u_mode,mask);",
      "  vec3 col=mix(base,r,clamp(mask,0.0,1.0));",
      "  float edge=smoothstep(0.25,0.5,mask)*(1.0-smoothstep(0.5,0.85,mask)); col+=vec3(0.35,0.5,1.0)*edge*0.12;",
      "  float leftF=smoothstep(0.52,0.0,uv.x);",
      "  if(leftF>0.001){ vec3 sm=col; for(int i=1;i<=6;i++){ float dx=float(i)*2.5/u_res.x; sm+=texture2D(u_base,uv+vec2(dx,0.0)).rgb; } sm/=7.0; col=mix(col,sm,leftF*0.8); col*=mix(1.0,0.42,leftF); }",
      "  col *= 1.0 - 0.25*length((uv-0.5)*vec2(1.1,1.0));",
      "  gl_FragColor=vec4(col,1.0); }",
    ].join("\n");

    var pMask = prog(VS, FS_MASK),
      pComp = prog(VS, FS_COMP);
    if (!pMask || !pComp) {
      fallback();
      return;
    }

    var quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var bindQuad = function (p) {
      var a = gl.getAttribLocation(p, "a");
      gl.enableVertexAttribArray(a);
      gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    };
    var newTex = function (f) {
      var t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
      return t;
    };
    var texPix = newTex(gl.LINEAR),
      texClear = newTex(gl.LINEAR),
      texStill = newTex(gl.LINEAR);
    [texPix, texClear, texStill].forEach(function (t) {
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([8, 11, 18, 255]));
    });

    var MW = 1,
      MH = 1,
      maskTex = [newTex(gl.LINEAR), newTex(gl.LINEAR)],
      maskFbo = [gl.createFramebuffer(), gl.createFramebuffer()];
    var sizeMask = function (w, h) {
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
    };
    var ping = 0;
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var resize = function () {
      var w = canvas.clientWidth || window.innerWidth,
        h = canvas.clientHeight || window.innerHeight;
      canvas.width = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      sizeMask(canvas.width, canvas.height);
    };
    window.addEventListener("resize", resize);
    var upload = function (tex, video) {
      if (video.readyState < 2) return false;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      } catch (e) {
        return false;
      }
      return true;
    };

    // freeze still: the pre-rendered last frame of the pixel video
    var still = new Image();
    var stillReady = false;
    still.onload = function () {
      gl.bindTexture(gl.TEXTURE_2D, texStill);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, still);
      stillReady = true;
    };
    still.src = film.getAttribute("data-freeze");
    var cap = document.createElement("canvas");
    var captureStill = function () {
      if (stillReady) return;
      cap.width = 960;
      cap.height = Math.round(960 * (vPix.videoHeight / vPix.videoWidth || 0.5625));
      cap.getContext("2d").drawImage(vPix, 0, 0, cap.width, cap.height);
      gl.bindTexture(gl.TEXTURE_2D, texStill);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cap);
        stillReady = true;
      } catch (e) {}
    };

    // interaction — listen on window because the canvas sits behind the copy
    var mouse = [0.5, 0.5],
      target = [0.5, 0.5],
      down = 0,
      lastMove = 0,
      vel = 0,
      lastPos = [0.5, 0.5],
      interacted = false;
    var onMove = function (e) {
      var r = canvas.getBoundingClientRect();
      if (!r.width) return;
      var x = (e.clientX - r.left) / r.width,
        y = 1 - (e.clientY - r.top) / r.height;
      target = [x, y];
      var dx = x - lastPos[0],
        dy = y - lastPos[1];
      vel = Math.min(1, Math.hypot(dx, dy) * 14);
      lastPos = [x, y];
      lastMove = performance.now();
      if (!interacted && hint) {
        interacted = true;
        hint.classList.add("is-gone");
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    var MODES = 6,
      mode = 0;
    window.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a, button, input, textarea, select, [role=button], label")) return;
      if (stage) {
        var sr = stage.getBoundingClientRect();
        if (e.clientY > sr.bottom || e.clientY < sr.top) return;
      }
      mode = (mode + 1) % MODES;
      if (hint && !interacted) {
        interacted = true;
        hint.classList.add("is-gone");
      }
    });

    // intro: play the pixel expand once per session, then hold on the still
    var pixEnded = false;
    var freeze = function () {
      pixEnded = true;
      captureStill();
      try {
        sessionStorage.setItem("sid_hero_intro", "1");
      } catch (e) {}
    };
    var alreadySeen = false;
    try {
      alreadySeen = !!sessionStorage.getItem("sid_hero_intro");
    } catch (e) {}
    vClear.play && vClear.play().catch(function () {});
    if (alreadySeen) {
      pixEnded = true; // returning within the session: start frozen, no repeat expand
    } else {
      vPix.addEventListener("ended", freeze);
      vPix.addEventListener(
        "loadeddata",
        function () {
          vPix.play().catch(function () {
            freeze();
          });
        },
        { once: true }
      );
      setTimeout(function () {
        if (!pixEnded) freeze();
      }, 12000);
    }

    var t0 = performance.now();
    resize();
    var frame = function () {
      var now = performance.now(),
        t = (now - t0) / 1000;
      mouse[0] += (target[0] - mouse[0]) * 0.25;
      mouse[1] += (target[1] - mouse[1]) * 0.25;
      var idle = (now - lastMove) / 1000;
      down = Math.max(0, (0.55 + vel * 0.8) * Math.max(0, 1 - idle * 1.5));
      if (!pixEnded) upload(texPix, vPix);
      upload(texClear, vClear);

      var src = ping,
        dst = 1 - ping;
      gl.bindFramebuffer(gl.FRAMEBUFFER, maskFbo[dst]);
      gl.viewport(0, 0, MW, MH);
      gl.useProgram(pMask);
      bindQuad(pMask);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, maskTex[src]);
      gl.uniform1i(gl.getUniformLocation(pMask, "u_prev"), 0);
      gl.uniform2f(gl.getUniformLocation(pMask, "u_mouse"), mouse[0], mouse[1]);
      gl.uniform1f(gl.getUniformLocation(pMask, "u_down"), down);
      gl.uniform1f(gl.getUniformLocation(pMask, "u_radius"), 0.11 + vel * 0.05);
      gl.uniform1f(gl.getUniformLocation(pMask, "u_decay"), 0.965);
      gl.uniform1f(gl.getUniformLocation(pMask, "u_aspect"), canvas.width / canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      ping = dst;

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(pComp);
      bindQuad(pComp);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, pixEnded ? texStill : texPix);
      gl.uniform1i(gl.getUniformLocation(pComp, "u_base"), 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texClear);
      gl.uniform1i(gl.getUniformLocation(pComp, "u_clear"), 1);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, maskTex[ping]);
      gl.uniform1i(gl.getUniformLocation(pComp, "u_mask"), 2);
      gl.uniform2f(gl.getUniformLocation(pComp, "u_res"), canvas.width, canvas.height);
      gl.uniform1f(gl.getUniformLocation(pComp, "u_time"), t);
      gl.uniform1f(gl.getUniformLocation(pComp, "u_mode"), mode);
      gl.uniform2f(gl.getUniformLocation(pComp, "u_mouse"), mouse[0], mouse[1]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  } catch (err) {
    console.error("home-film:", err);
    fallback();
  }
})();
