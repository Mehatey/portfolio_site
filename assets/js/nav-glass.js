/* ═══════════════════════════════════════════════════════════════════════════
   THE NAV IS GLASS, NOT A BLUR

   Sid: "real screen-space refraction on the nav. still backdrop-filter."

   WHAT backdrop-filter ACTUALLY IS

   A convolution. It takes what is behind an element and blurs it in place.
   Every pixel stays where it was; it just gets mixed with its neighbours.
   That is frosted plastic. It is not glass, and no amount of tuning the
   radius will make it glass, because the thing that makes glass legible AS
   glass is that it MOVES what is behind it -- and a blur moves nothing.

   WHAT THIS DOES INSTEAD

   Refraction. The capsule is described as a signed distance field, the
   surface normal is taken from the gradient of that field, and the
   background is sampled at an offset along that normal. So the page behind
   the nav is displaced -- pushed outward at the rim where the surface turns
   away from you, undisturbed through the middle where it is flat. That
   displacement is the whole tell. It is why a real lens is obvious even when
   it is perfectly clear.

   Three things on top of it, each doing a specific job:

     · DISPERSION. Red, green and blue are refracted at slightly different
       strengths, so the rim carries a colour fringe. This is the single
       detail that separates glass from acrylic, and it is two extra taps.
     · FRESNEL. Reflectance rises at grazing angles, so the edge of the
       capsule returns more light than its face. Without it a refracting
       shape reads as a hole rather than as a solid.
     · A SPECULAR from the upper left, the same direction every other light
       on this site comes from.

   WHAT IT CAN AND CANNOT REFRACT, STATED PLAINLY

   It refracts #site-field -- the full-viewport WebGL background that runs
   behind every page. It does NOT refract DOM content scrolling under the
   nav, and no technique can: a browser gives you no way to read back
   rendered DOM pixels. Sites that appear to do it either put the whole page
   in WebGL or accept the same limit quietly. The scrim gradient behind the
   nav stays and is what keeps type legible as it passes under; this supplies
   the material, not the legibility.

   THE SOURCE IS COPIED SMALL

   The strip of field behind the nav is drawn into a 512x64 canvas and
   uploaded from there. Refraction of a soft, low-frequency background does
   not need resolution, and copying a 1440x90 region at full size every frame
   is most of a megabyte of texture upload for detail the effect cannot show.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var nav = document.querySelector(".studio-nav");
  var links = document.querySelector(".studio-links");
  var mark = document.querySelector(".studio-mark");
  if (!nav || !links) return;

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (REDUCED) return;
  if (window.matchMedia && window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

  var SRC_W = 512,
    SRC_H = 64;

  var host = document.createElement("div");
  host.className = "nav-glass";
  host.setAttribute("aria-hidden", "true");
  var canvas = document.createElement("canvas");
  host.appendChild(canvas);
  nav.appendChild(host);

  var gl = null;
  try {
    gl = canvas.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: true });
  } catch (e) {}
  if (!gl) {
    host.remove();
    return;
  }

  var VS = [
    "#version 300 es",
    "const vec2 P[3] = vec2[3](vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));",
    "out vec2 v_uv;",
    "void main(){",
    "  vec2 p = P[gl_VertexID];",
    "  v_uv = p * 0.5 + 0.5;",
    "  gl_Position = vec4(p, 0.0, 1.0);",
    "}",
  ].join("\n");

  var FS = [
    "#version 300 es",
    "precision highp float;",
    "in vec2 v_uv;",
    "uniform sampler2D u_src;",
    "uniform vec2 u_res;",
    "uniform vec4 u_pill;" /* x, y, halfW, halfH in pixels */,
    "uniform float u_pillR;",
    "uniform vec3 u_mark;" /* x, y, radius */,
    "uniform float u_light, u_time;",
    "out vec4 o;",

    /* Rounded box, exact. The classic: push the point into the first
       quadrant, subtract the half extents less the radius, and take the
       length of the positive part. */
    "float sdBox(vec2 p, vec2 b, float r){",
    "  vec2 q = abs(p) - b + r;",
    "  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;",
    "}",
    "float sdScene(vec2 p){",
    "  float a = sdBox(p - u_pill.xy, u_pill.zw, u_pillR);",
    "  float b = length(p - u_mark.xy) - u_mark.z;",
    "  return min(a, b);",
    "}",

    "void main(){",
    "  vec2 px = v_uv * u_res;",
    "  px.y = u_res.y - px.y;",
    "  float d = sdScene(px);",
    /* Outside the glass there is nothing to draw. The scrim behind the nav
       is a separate element and keeps doing its own job. */
    "  if (d > 0.0) { o = vec4(0.0); return; }",

    /* The surface. A real capsule is not flat: it is thickest in the middle
       and curves away to nothing at the rim. `h` is that thickness, from the
       distance field, and its GRADIENT is the surface normal. Central
       differences on the field rather than an analytic normal, because the
       field is a min() of two shapes and its analytic derivative is
       discontinuous where they meet. */
    "  float e = 1.0;",
    "  float gx = sdScene(px + vec2(e, 0.0)) - sdScene(px - vec2(e, 0.0));",
    "  float gy = sdScene(px + vec2(0.0, e)) - sdScene(px - vec2(0.0, e));",
    /* Thickness falls off over the last 14px, which is the bevel. */
    "  float h = smoothstep(0.0, -14.0, d);",
    "  vec3 N = normalize(vec3(gx, gy, 0.55 + h * 0.9));",

    /* THE DISPLACEMENT. This is the part backdrop-filter cannot do. The
       background is sampled at an offset along the normal, scaled by how
       steeply the surface is turning -- so the middle of the capsule is
       undisturbed and the rim pushes what is behind it outward. */
    "  float bend = (1.0 - h) * 0.055;",
    "  vec2 base = v_uv;",
    "  vec2 off = N.xy * bend;",
    /* Dispersion: three taps at slightly different indices of refraction. */
    "  float r = texture(u_src, base + off * 1.10).r;",
    "  float g = texture(u_src, base + off * 1.00).g;",
    "  float b = texture(u_src, base + off * 0.90).b;",
    "  vec3 col = vec3(r, g, b);",

    /* Fresnel. Reflectance climbs at grazing angles, which here means at the
       rim, where N.z is smallest. Without this a refracting shape reads as a
       hole rather than as something solid sitting on the page. */
    "  float fres = pow(1.0 - clamp(N.z, 0.0, 1.0), 2.6);",
    "  vec3 key = vec3(1.00, 0.86, 0.68);",
    "  vec3 cool = vec3(0.30, 0.46, 0.72);",
    "  col += mix(cool, key, 0.35) * fres * 0.55;",

    /* One specular, from the upper left, where every other light on this
       site comes from. */
    "  vec3 L = normalize(vec3(-0.42, 0.68, 0.60));",
    "  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));",
    "  col += key * pow(max(0.0, dot(N, H)), 42.0) * 0.7;",

    /* A hairline at the very edge, so the capsule has a boundary rather than
       fading out. Drawn from the field itself, so it follows the shape
       exactly and costs nothing extra. */
    "  float rim = smoothstep(1.6, 0.0, abs(d + 0.8));",
    "  col += vec3(1.0) * rim * 0.28;",

    /* ── ON CREAM IT IS STILL GLASS ───────────────────────────────────
       First pass tinted toward ink and came out a grey slab with a dark rim
       lying across a bright page -- the opposite of what glass does on
       paper. A clear object on a light ground is BRIGHTER than the ground,
       not darker: it gathers light and returns it. So the light branch
       lifts toward white and keeps only the fresnel and the specular as
       structure. */
    "  vec3 lightCol = mix(col, vec3(1.0), 0.62) + key * pow(max(0.0, dot(N, H)), 42.0) * 0.4;",
    "  col = mix(col, lightCol, u_light);",
    /* And the whole capsule steps back on cream. On a near-white page the
       body of clear glass is invisible by definition -- it is the same value
       as the paper -- so everything that DOES show is the fresnel rim, and at
       full strength that rim is a grey outline reading as a plate. Roughly
       half, which leaves a boundary you can see and nothing you would call a
       shape. */
    "  float lightDamp = mix(1.0, 0.52, u_light);",

    /* ── ALPHA IS WHERE GLASS IS WON OR LOST ──────────────────────────
       0.30 + h * 0.34 put the middle of the capsule at 0.64, and a
       two-thirds opaque tinted shape is a PLATE. Glass is almost entirely
       edge: the body is very nearly clear and the whole read comes from the
       rim, where the fresnel climbs and the surface returns light.

       0.06 through the middle, and the fresnel term carries the rest --
       which is exactly the physical story, and is also the only version
       where the page is genuinely visible through it. */
    "  float a = smoothstep(0.0, -1.5, d) * (0.06 + h * 0.08 + fres * 0.62) * lightDamp;",
    "  o = vec4(col * a, a);",
    "}",
  ].join("\n");

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      if (window.console && console.warn) console.warn("[nav-glass]", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  var v = compile(gl.VERTEX_SHADER, VS),
    f = compile(gl.FRAGMENT_SHADER, FS);
  if (!v || !f) {
    host.remove();
    return;
  }
  var prog = gl.createProgram();
  gl.attachShader(prog, v);
  gl.attachShader(prog, f);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    if (window.console && console.warn) console.warn("[nav-glass] link", gl.getProgramInfoLog(prog));
    host.remove();
    return;
  }
  var U = {};
  ["u_src", "u_res", "u_pill", "u_pillR", "u_mark", "u_light", "u_time"].forEach(function (n) {
    U[n] = gl.getUniformLocation(prog, n);
  });

  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  var pad = document.createElement("canvas");
  pad.width = SRC_W;
  pad.height = SRC_H;
  var pctx = pad.getContext("2d", { alpha: false });

  var raf = 0,
    t0 = performance.now();

  function frame(now) {
    /* Decoration yields first. See assets/js/motion-budget.js: fourteen rAF
       loops and twenty two canvases put the home page at 13fps on a four
       times throttled CPU, which is a mid-range laptop. The frame is skipped
       rather than the loop torn down, so the layer resumes the moment the
       machine can afford it again. */
    if (window.SidPerf && !window.SidPerf.ok()) {
      raf = requestAnimationFrame(frame);
      return;
    }
    raf = 0;
    var nb = host.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    var w = Math.max(1, Math.round(nb.width * dpr));
    var h = Math.max(1, Math.round(nb.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    /* ── WHAT IS ACTUALLY BEHIND THE NAV ─────────────────────────────────
       Not one canvas but whichever one this page puts full-viewport behind
       its content. #site-field is the shared one on most routes; the home
       page draws #gl-stage instead. Asked in order and re-found every frame
       rather than cached, because either can remove itself if its own
       shaders fail and a reference to a canvas that is gone would upload a
       stale picture forever.

       The FIRST attempt sampled #site-field only and got nothing on the home
       page: measured `field: false` with the glass running against an empty
       texture, which is a refraction of nothing and looks like a flat tint. */
    var src = document.querySelector("#site-field canvas") || document.getElementById("gl-stage");
    if (src && src.width > 4 && src !== canvas) {
      /* The strip of that canvas that lies behind the nav, in ITS pixels.
         The nav is inset from the viewport -- 36px from the left and 22 from
         the top at 1440 -- so copying from 0,0 would refract the wrong part
         of the background and the displacement would not line up with what a
         reader can see beside the capsule. */
      var vw = Math.max(1, window.innerWidth),
        vh = Math.max(1, window.innerHeight);
      var sx = Math.max(0, Math.round((nb.left / vw) * src.width));
      var sy = Math.max(0, Math.round((nb.top / vh) * src.height));
      var sw = Math.max(1, Math.round((nb.width / vw) * src.width));
      var sh = Math.max(1, Math.round((nb.height / vh) * src.height));
      try {
        pctx.drawImage(src, sx, sy, sw, sh, 0, 0, SRC_W, SRC_H);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pad);
      } catch (e) {}
    }

    /* The capsules' real geometry, read from the DOM, so the glass is
       wherever the layout actually put them at this width. */
    var lb = links.getBoundingClientRect();
    var mb = mark ? mark.getBoundingClientRect() : null;
    var ox = nb.left,
      oy = nb.top;
    var px = (lb.left - ox + lb.width / 2) * dpr;
    var py = h - (lb.top - oy + lb.height / 2) * dpr;

    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(prog);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(U.u_src, 0);
    gl.uniform2f(U.u_res, w, h);
    /* Padded a few pixels beyond the element so the glass has a lip around the
       links rather than ending exactly at the text. */
    gl.uniform4f(U.u_pill, px, py, (lb.width / 2 + 14) * dpr, (lb.height / 2 + 9) * dpr);
    gl.uniform1f(U.u_pillR, (lb.height / 2 + 9) * dpr);
    if (mb)
      gl.uniform3f(
        U.u_mark,
        (mb.left - ox + mb.width / 2) * dpr,
        h - (mb.top - oy + mb.height / 2) * dpr,
        (Math.max(mb.width, mb.height) / 2 + 4) * dpr
      );
    else gl.uniform3f(U.u_mark, -1000, -1000, 1);
    gl.uniform1f(U.u_light, document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0);
    gl.uniform1f(U.u_time, (now - t0) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    } else if (!raf) raf = requestAnimationFrame(frame);
  });

  /* A verification hook, not a feature. */
  window.__navGlass = function () {
    return { gl: !!gl, size: [canvas.width, canvas.height], running: !!raf };
  };
})();
