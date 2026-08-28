/* ═══════════════════════════════════════════════════════════════════════════
   03 · THE ARCHIVE — A CORRIDOR OF PHOTOGRAPHS

   Sid: "do all the good techniques everything high definition interactive and
   amazing look at award winners."

   The second interaction that recurs across the 2026 honours, after
   cursor-uncovers-detail, is TRUE Z-AXIS DEPTH: the camera travels through
   real space rather than layers sliding over each other at different rates.
   Oryzo does it with one product; Explore Primland does it over terrain. This
   is that, done with the archive.

   The direction was a flat CSS grid of 117 <img>. It is a corridor now --
   photographs suspended in a volume, with the camera flying through them.
   Same argument as before ("this is how much I have looked at") and a
   completely different claim about it: you are not scanning a contact sheet,
   you are moving through six years of looking.

   WHY A TEXTURE ARRAY AND NOT AN ATLAS

   WebGL2 has TEXTURE_2D_ARRAY, which is the right tool and is not available
   in WebGL1 -- so this is one of the places the version actually buys
   something. Thirty-two photographs become thirty-two layers of one object,
   each sampled by an integer index handed to the instance. No atlas
   arithmetic, no bleeding between neighbours at mip boundaries, no packing
   step, and one bind for the whole corridor.

   Every image is drawn into a 256x256 offscreen canvas first, because a
   texture array demands every layer be identical in size and these are 206
   photographs at whatever aspect the camera gave them. Cropped centre-square
   rather than squashed: a photograph may be cut, never distorted.

   THE CAMERA

   Forward at a constant rate, plus the site's own scroll velocity -- so
   throwing the page accelerates you down the corridor and stopping coasts to
   the base speed. That is the one place this differs from a screensaver: the
   depth is driven by the reader.

   Cards that pass behind the camera wrap to the far end with a new layer, so
   the corridor is endless with a fixed 260 quads and 32 textures in memory.
   ═══════════════════════════════════════════════════════════════════════════ */
window.__archiveDepth = (function () {
  "use strict";

  var COUNT = 260; /* quads in the corridor */
  var LAYERS = 32; /* photographs resident */
  /* 384, not 256. Sid: "everything high definition." A card arriving at the
     near plane covers roughly 300 device pixels on a retina display, so 256
     was being magnified and read soft exactly where the reader is looking
     hardest. 32 layers at 384 square is about 18MB of texture memory, which
     is a fraction of what the hero's point cloud already holds. */
  var TEX = 384; /* px per layer */
  var FAR = 46;

  var host = null,
    gl = null,
    prog = null,
    vao = null,
    tex = null,
    canvas = null,
    raf = 0,
    t0 = 0,
    last = 0,
    live = false,
    ready = 0,
    z = 0;
  var ptr = { x: 0, y: 0 },
    cur = { x: 0, y: 0 };
  var inst = null,
    instBuf = null;

  var SKIP = [16, 74, 193, 194, 195, 196, 205];

  var VS = [
    "#version 300 es",
    "precision highp float;",
    "layout(location=0) in vec2 a_quad;",
    "layout(location=1) in vec4 a_pos;" /* xyz + layer */,
    "layout(location=2) in vec2 a_size;",
    "uniform float u_z, u_aspect, u_far;",
    "uniform vec2 u_ptr;",
    "out vec2 v_uv;",
    "out float v_layer;",
    "out float v_fog;",
    "void main(){",
    "  vec3 P = a_pos.xyz;",
    /* Wrap in the shader rather than on the CPU: the position buffer never
       changes, so there is nothing to re-upload per frame. */
    "  float zz = mod(P.z + u_z, u_far);",
    "  P.z = zz;",
    /* The camera drifts with the pointer. Applied to the WORLD, not to a view
       matrix, because there is no view matrix here -- one translation and a
       perspective divide is the whole camera. */
    /* ── THE TUNNEL OPENS TOWARD YOU ──────────────────────────────────
       A cylinder of photographs is a cylinder you are inside of, and the
       near end of it closes over the middle of the frame -- measured by
       looking: the knocked-out sentence was unreadable under the cards
       arriving. So the radius grows as the cards approach, which turns the
       cylinder into a funnel and keeps a clear cone down the axis for the
       type to live in. The far end stays tight, so the corridor still reads
       as a corridor rather than as a hole. */
    "  P.xy *= 1.0 + pow(1.0 - zz / u_far, 2.0) * 2.6;",
    "  P.x += u_ptr.x * 1.4 * (1.0 - zz / u_far);",
    "  P.y += u_ptr.y * 0.9 * (1.0 - zz / u_far);",
    "  vec2 corner = a_quad * a_size;",
    "  P.xy += corner;",
    /* Perspective. Near plane at 0.6 so a card does not blow up to fill the
       frame in the last metre before it passes. */
    "  float d = max(0.6, zz);",
    "  vec2 proj = P.xy / d * 1.9;",
    "  gl_Position = vec4(proj.x / u_aspect, proj.y, 0.0, 1.0);",
    "  v_uv = a_quad + 0.5;",
    "  v_layer = a_pos.w;",
    /* Fades in from the far end and out in the last two metres, so nothing
       ever pops at either boundary of the wrap. */
    "  v_fog = smoothstep(u_far, u_far * 0.55, zz) * smoothstep(0.6, 3.0, zz);",
    "}",
  ].join("\n");

  var FS = [
    "#version 300 es",
    "precision highp float;",
    "precision highp sampler2DArray;",
    "in vec2 v_uv;",
    "in float v_layer;",
    "in float v_fog;",
    "uniform sampler2DArray u_tex;",
    "uniform float u_light;",
    "out vec4 o;",
    "void main(){",
    "  vec3 c = texture(u_tex, vec3(v_uv, v_layer)).rgb;",
    /* Held back so the type knocked over the corridor stays readable, and
       cooled, because a wall of warm photographs at full saturation is a
       moodboard rather than an archive. */
    "  c = mix(vec3(dot(c, vec3(0.299, 0.587, 0.114))), c, 0.72) * 0.7;",
    "  float a = v_fog;",
    /* On cream the corridor lightens rather than darkens into the distance,
       so the fog runs to paper instead of to ink. */
    "  c = mix(c, mix(vec3(0.95, 0.94, 0.91), c, a), u_light);",
    "  o = vec4(c * a, a);",
    "}",
  ].join("\n");

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      if (window.console && console.warn) console.warn("[archive-depth]", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  function boot() {
    host = document.getElementById("hero-archive-gl");
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
    var v = compile(gl.VERTEX_SHADER, VS),
      f = compile(gl.FRAGMENT_SHADER, FS);
    if (!v || !f) {
      host.remove();
      gl = null;
      return false;
    }
    prog = gl.createProgram();
    gl.attachShader(prog, v);
    gl.attachShader(prog, f);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      if (window.console && console.warn) console.warn("[archive-depth] link", gl.getProgramInfoLog(prog));
      host.remove();
      gl = null;
      return false;
    }
    prog.u = {};
    ["u_z", "u_aspect", "u_far", "u_ptr", "u_tex", "u_light"].forEach(function (n) {
      prog.u[n] = gl.getUniformLocation(prog, n);
    });

    /* ── the corridor ──────────────────────────────────────────────────
       Cards are placed in a ring around the camera's path rather than
       filling the volume: the middle of the frame has to stay clear for the
       sentence, and a card that flies straight at the reader's eye is a
       jump-scare rather than an archive. Radius is biased outward by a
       square root so the ring does not crowd its inner edge. */
    inst = new Float32Array(COUNT * 6);
    for (var i = 0; i < COUNT; i++) {
      var a = i * 2.399963229728653; /* golden angle */
      var rr = 1.5 + Math.sqrt(((i * 7919) % 1000) / 1000) * 3.4;
      var w = 0.8 + (((i * 31) % 17) / 17) * 0.7;
      inst[i * 6] = Math.cos(a) * rr;
      inst[i * 6 + 1] = Math.sin(a) * rr * 0.72;
      inst[i * 6 + 2] = (i / COUNT) * FAR;
      inst[i * 6 + 3] = i % LAYERS;
      inst[i * 6 + 4] = w;
      inst[i * 6 + 5] = w;
    }

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    var qb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, qb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    instBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
    gl.bufferData(gl.ARRAY_BUFFER, inst, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 24, 0);
    gl.vertexAttribDivisor(1, 1);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 24, 16);
    gl.vertexAttribDivisor(2, 1);
    gl.bindVertexArray(null);

    /* ── the texture array ─────────────────────────────────────────────
       Allocated at full size immediately and filled layer by layer as the
       photographs decode, so the corridor is drawable from the first frame
       and simply gains detail. texStorage3D rather than texImage3D: the
       storage is immutable, which is both faster and the only way to be
       certain every layer is the same format. */
    tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex);
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, TEX, TEX, LAYERS);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    var pad = document.createElement("canvas");
    pad.width = pad.height = TEX;
    var pctx = pad.getContext("2d");
    var base = host.getAttribute("data-base") || "";

    /* Spread across the whole archive on a stride, same reasoning as the DOM
       version: neighbouring export numbers tend to be one shoot. */
    var picked = [],
      f2 = 1;
    while (picked.length < LAYERS && f2 <= 206) {
      if (SKIP.indexOf(f2) === -1) picked.push(f2);
      f2 += 6;
    }
    picked.forEach(function (n, layer) {
      var im = new Image();
      im.decoding = "async";
      im.onload = function () {
        /* Centre-square crop. A photograph may be cut and may not be
           squashed, and a texture array insists every layer match. */
        var s = Math.min(im.naturalWidth, im.naturalHeight);
        pctx.drawImage(im, (im.naturalWidth - s) / 2, (im.naturalHeight - s) / 2, s, s, 0, 0, TEX, TEX);
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex);
        gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, layer, TEX, TEX, 1, gl.RGBA, gl.UNSIGNED_BYTE, pad);
        ready++;
      };
      im.onerror = function () {};
      im.src = base + "/play/assets/spatial/p" + n + ".webp";
    });

    window.addEventListener("pointermove", onMove, { passive: true });
    return true;
  }

  function onMove(e) {
    ptr.x = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
    ptr.y = -(e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
  }

  function frame(now) {
    raf = 0;
    if (!gl || !live) return;
    var dt = Math.min(0.05, (now - last) / 1000) || 0.016;
    last = now;

    /* Forward always, faster when the reader throws the page. The site's own
       scroll velocity, so this cannot disagree with anything else keyed to
       it. */
    var sv = window.__sv ? window.__sv() : { a: 0 };
    z -= dt * (2.2 + sv.a * 26);

    var kp = 1 - Math.exp(-dt * 2.4);
    cur.x += (ptr.x - cur.x) * kp;
    cur.y += (ptr.y - cur.y) * kp;

    var dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    var w = Math.max(1, Math.round(host.clientWidth * dpr));
    var h = Math.max(1, Math.round(host.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(prog);
    gl.uniform1f(prog.u.u_z, ((z % FAR) + FAR) % FAR);
    gl.uniform1f(prog.u.u_aspect, w / h);
    gl.uniform1f(prog.u.u_far, FAR);
    gl.uniform2f(prog.u.u_ptr, cur.x, cur.y);
    gl.uniform1f(prog.u.u_light, document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex);
    gl.uniform1i(prog.u.u_tex, 0);
    gl.bindVertexArray(vao);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, COUNT);
    gl.bindVertexArray(null);
    raf = requestAnimationFrame(frame);
  }

  return {
    start: function () {
      if (live) return;
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!gl && !boot()) return;
      live = true;
      t0 = last = performance.now();
      if (!raf) raf = requestAnimationFrame(frame);
    },
    stop: function () {
      live = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
    /* A verification hook, not a feature. */
    state: function () {
      return { live: live, layers: ready, quads: COUNT, gl: !!gl, z: +z.toFixed(1), size: canvas ? [canvas.width, canvas.height] : null };
    },
  };
})();
