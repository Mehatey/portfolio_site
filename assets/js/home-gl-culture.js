/* ═══════════════════════════════════════════════════════════════════════════
   05 · THE CULTURE — REACTION-DIFFUSION, SEEDED WITH THE SENTENCE

   Sid: "i dont like the generic shader one with the dots be more creative it
   needs to be award winning not generic."

   He is right. A curl-noise particle field is the single most common thing
   in WebGL portfolio work -- it is the shader equivalent of a stock photo,
   and however well it is implemented it cannot be the reason anybody
   remembers a site. The simulation underneath it was real; the picture it
   made was generic.

   So the machinery stays and the chemistry changes. This is Gray-Scott
   reaction-diffusion: two substances, one feeding and one consuming, on the
   same ping-pong pair the particles were using.

     U' = U + (Du * lap(U) - U*V*V + F*(1 - U)) * dt
     V' = V + (Dv * lap(V) + U*V*V - (F + k)*V) * dt

   Four numbers -- two diffusion rates, a feed and a kill -- and the entire
   character of the result lives in the last two. At F 0.037 / k 0.060 it
   grows corals. Slightly higher kill and it makes mitosis; slightly lower
   and it floods. These are the mitosis numbers, because they produce
   structures that keep dividing and re-forming rather than settling.

   WHY THIS AND NOT ANOTHER PRETTY SIMULATION

   Because the seed is the sentence. "Product designer, six years." is
   rasterised into the initial V, so the reaction begins INSIDE the letters
   and grows outward from them. The words are not drawn on top of the effect;
   the effect is what the words turned into. They stay legible because the
   feed rate is raised where the text is -- the chemistry is better fed
   inside the letterforms, so structure persists there and thins outside.

   The result is a headline that is continuously dissolving and re-growing
   out of a living culture, and it is a picture nothing else on the internet
   is making, because the seed is specific to this page.

   Nobody has to be told any of that. It reads as words that are alive.

   THE CURSOR FEEDS IT

   Pointer contact injects V, which is what starting a new colony looks like:
   a bloom that spreads, divides and eventually competes with the letters for
   the substrate. It does not spring back, because a reaction has state.
   ═══════════════════════════════════════════════════════════════════════════ */
window.__culture = (function () {
  "use strict";

  /* The simulation runs at a fixed grid rather than at the viewport: a
     reaction-diffusion system's scale is set by its grid spacing, so a
     resolution that changed with the window would change the size of the
     structures with it. 512 is the largest that holds 60fps with the
     multi-step below on integrated graphics. */
  var W = 512,
    H = 288;
  /* Two solver steps a frame. One is too slow to be alive at these rates and
     four is imperceptibly different from two while costing twice. */
  var STEPS = 2;

  var host = null,
    canvas = null,
    gl = null,
    simP = null,
    drawP = null,
    fbo = null,
    texA = null,
    texB = null,
    seedTex = null,
    vao = null,
    raf = 0,
    t0 = 0,
    live = false,
    flip = 0,
    warm = 0;
  var ptr = { x: -9, y: -9 },
    down = 0;

  var FS_VS = [
    "#version 300 es",
    "const vec2 P[3] = vec2[3](vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));",
    "out vec2 v_uv;",
    "void main(){",
    "  vec2 p = P[gl_VertexID];",
    "  v_uv = p * 0.5 + 0.5;",
    "  gl_Position = vec4(p, 0.0, 1.0);",
    "}",
  ].join("\n");

  var SIM_FS = [
    "#version 300 es",
    "precision highp float;",
    "in vec2 v_uv;",
    "uniform sampler2D u_prev, u_seed;",
    "uniform vec2 u_texel, u_ptr;",
    "uniform float u_down, u_time;",
    "out vec4 o;",
    "void main(){",
    "  vec2 uv = v_uv;",
    "  vec2 c = texture(u_prev, uv).rg;",

    /* The Laplacian. The classic nine-point stencil: 0.2 to the four
       orthogonal neighbours, 0.05 to the four diagonals, -1 at the centre.
       The five-point version is cheaper and visibly anisotropic here --
       structures grow along the axes and the whole culture looks woven
       rather than organic. */
    "  vec2 lap = vec2(0.0);",
    "  lap += texture(u_prev, uv + vec2( u_texel.x, 0.0)).rg * 0.2;",
    "  lap += texture(u_prev, uv + vec2(-u_texel.x, 0.0)).rg * 0.2;",
    "  lap += texture(u_prev, uv + vec2(0.0,  u_texel.y)).rg * 0.2;",
    "  lap += texture(u_prev, uv + vec2(0.0, -u_texel.y)).rg * 0.2;",
    "  lap += texture(u_prev, uv + u_texel * vec2( 1.0,  1.0)).rg * 0.05;",
    "  lap += texture(u_prev, uv + u_texel * vec2(-1.0,  1.0)).rg * 0.05;",
    "  lap += texture(u_prev, uv + u_texel * vec2( 1.0, -1.0)).rg * 0.05;",
    "  lap += texture(u_prev, uv + u_texel * vec2(-1.0, -1.0)).rg * 0.05;",
    "  lap -= c;",

    /* The seed. Its red channel is the rasterised sentence. */
    "  float text = texture(u_seed, uv).r;",

    /* ── THE LETTERS ARE BETTER FED ─────────────────────────────────────
       F and k are what decide whether this system makes coral, spots,
       stripes or nothing, and varying them spatially is what lets an image
       persist inside a reaction rather than being eaten by it. The feed is
       raised and the kill lowered inside the letterforms, so structure is
       sustained there and starves outside -- which is why the sentence stays
       readable while everything around it keeps dividing.

       A slow drift on both, so the culture is never in equilibrium and the
       picture at minute five is not the picture at minute one. */
    "  float drift = sin(u_time * 0.06) * 0.0016;",
    "  float F = mix(0.0300, 0.0410, text) + drift;",
    "  float k = mix(0.0625, 0.0575, text) - drift * 0.5;",
    "  float Du = 0.21, Dv = 0.105;",

    "  float u = c.r, v = c.g;",
    "  float uvv = u * v * v;",
    "  float du = Du * lap.r - uvv + F * (1.0 - u);",
    "  float dv = Dv * lap.g + uvv - (F + k) * v;",
    "  u += du;",
    "  v += dv;",

    /* The cursor is a pipette. Contact injects V, which is exactly what
       starting a colony looks like: it blooms, divides, and competes with
       the letters for substrate. */
    "  float d = length((uv - u_ptr) * vec2(u_texel.y / u_texel.x, 1.0));",
    "  v += smoothstep(0.055, 0.0, d) * (0.16 + u_down * 0.5);",

    "  o = vec4(clamp(u, 0.0, 1.0), clamp(v, 0.0, 1.0), 0.0, 1.0);",
    "}",
  ].join("\n");

  var DRAW_FS = [
    "#version 300 es",
    "precision highp float;",
    "in vec2 v_uv;",
    "uniform sampler2D u_state, u_seed;",
    "uniform vec2 u_texel;",
    "uniform float u_light, u_warm;",
    "out vec4 o;",
    "void main(){",
    "  vec2 c = texture(u_state, v_uv).rg;",
    "  float v = c.g;",

    /* Shading the culture by the GRADIENT of V rather than by V itself. The
       raw concentration is a flat stain; its slope is where the structure
       actually is, and lighting that slope gives the colony a surface -- the
       difference between a heat map and something that looks grown. */
    "  float vx = texture(u_state, v_uv + vec2(u_texel.x, 0.0)).g - texture(u_state, v_uv - vec2(u_texel.x, 0.0)).g;",
    "  float vy = texture(u_state, v_uv + vec2(0.0, u_texel.y)).g - texture(u_state, v_uv - vec2(0.0, u_texel.y)).g;",
    "  vec3 N = normalize(vec3(-vx * 26.0, -vy * 26.0, 1.0));",
    "  vec3 L = normalize(vec3(-0.42, 0.68, 0.60));",
    "  float dif = max(0.0, dot(N, L));",
    "  float rim = pow(1.0 - clamp(N.z, 0.0, 1.0), 1.6);",

    "  vec3 keyC = vec3(1.00, 0.86, 0.68);",
    "  vec3 coolC = vec3(0.30, 0.46, 0.72);",
    /* Inside the sentence it runs warm and outside it runs cool, so the
       words are legible as COLOUR as well as as density -- and the two lights
       are the same two the rest of this site is lit by. */
    "  float text = texture(u_seed, v_uv).r;",
    "  vec3 tint = mix(coolC, keyC, clamp(text * 0.85 + u_warm * 0.3, 0.0, 1.0));",
    "  vec3 col = tint * (0.18 + dif * 0.55) + keyC * rim * 0.5;",

    /* Alpha from the concentration, so the empty substrate is genuinely
       empty and the page shows through it. */
    "  float a = smoothstep(0.04, 0.34, v) * 0.85;",
    "  col = mix(col, mix(col, vec3(0.09, 0.11, 0.15), 0.72), u_light);",
    "  o = vec4(col * a, a);",
    "}",
  ].join("\n");

  function sh(t, src) {
    var s = gl.createShader(t);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      if (window.console && console.warn) console.warn("[culture]", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  function prog(vs, fs, names) {
    var a = sh(gl.VERTEX_SHADER, vs),
      b = sh(gl.FRAGMENT_SHADER, fs);
    if (!a || !b) return null;
    var p = gl.createProgram();
    gl.attachShader(p, a);
    gl.attachShader(p, b);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      if (window.console && console.warn) console.warn("[culture] link", gl.getProgramInfoLog(p));
      return null;
    }
    p.u = {};
    names.forEach(function (n) {
      p.u[n] = gl.getUniformLocation(p, n);
    });
    return p;
  }

  function tex(data, fmt) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    /* ── THE SEED WAS UPSIDE DOWN ────────────────────────────────────────
       A 2D canvas has its origin at the top left and a GL texture has it at
       the bottom left, so uploading one into the other flips it. The
       simulation did not care -- a reaction is indifferent to which way up
       its substrate is -- so it grew a perfectly healthy culture in the shape
       of the sentence written upside down, directly beneath the real
       headline. It looked deliberate, which is what made it worth catching.

       Only the image upload needs it; the float state arrays are built in
       texture order already. */
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, fmt !== "float");
    if (fmt === "float") gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, W, H, 0, gl.RGBA, gl.FLOAT, data);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  /* ── the seed is the sentence ─────────────────────────────────────────
     Rasterised into a 2D canvas at the simulation's own resolution, blurred
     a little so the reaction has a gradient to grow along rather than a hard
     binary edge -- a step function seeds a reaction badly, and the letters
     come out with jagged coastlines. */
  function makeSeed() {
    var c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    var x = c.getContext("2d");
    x.fillStyle = "#000";
    x.fillRect(0, 0, W, H);
    x.fillStyle = "#fff";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.filter = "blur(1.5px)";
    var f = 'Figtree, "Helvetica Neue", Arial, sans-serif';
    x.font = "500 " + Math.round(W * 0.115) + "px " + f;
    x.fillText("Product designer,", W / 2, H * 0.38);
    x.fillText("six years.", W / 2, H * 0.54);
    return c;
  }

  function boot() {
    host = document.getElementById("hero-field");
    if (!host) return false;
    canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);
    try {
      gl = canvas.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: true });
    } catch (e) {}
    if (!gl) {
      canvas.remove();
      return false;
    }
    if (!gl.getExtension("EXT_color_buffer_float")) {
      canvas.remove();
      gl = null;
      return false;
    }

    simP = prog(FS_VS, SIM_FS, ["u_prev", "u_seed", "u_texel", "u_ptr", "u_down", "u_time"]);
    drawP = prog(FS_VS, DRAW_FS, ["u_state", "u_seed", "u_texel", "u_light", "u_warm"]);
    if (!simP || !drawP) {
      canvas.remove();
      gl = null;
      return false;
    }

    /* U starts at 1 everywhere -- a full substrate -- and V is seeded only
       inside the letters, which is why the culture grows out of the words
       rather than appearing all over the screen at once. */
    var init = new Float32Array(W * H * 4);
    var seedCanvas = makeSeed();
    var sctx = seedCanvas.getContext("2d");
    var px = sctx.getImageData(0, 0, W, H).data;
    for (var y = 0; y < H; y++) {
      /* Row-flipped for the same reason as the note in tex(): getImageData
         hands back canvas rows top-first and the texture wants them
         bottom-first, so the initial V would have been seeded with the
         sentence upside down relative to the seed texture the simulation
         reads every frame -- two copies of the same word disagreeing about
         which way up it is. */
      var sy = H - 1 - y;
      for (var x = 0; x < W; x++) {
        var di = (y * W + x) * 4;
        var si = (sy * W + x) * 4;
        init[di] = 1.0;
        init[di + 1] = px[si] / 255 > 0.35 ? 0.55 : 0.0;
        init[di + 2] = 0;
        init[di + 3] = 1;
      }
    }
    texA = tex(init, "float");
    texB = tex(init, "float");
    seedTex = tex(seedCanvas);
    fbo = gl.createFramebuffer();
    vao = gl.createVertexArray();

    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    return true;
  }

  function onMove(e) {
    var r = host.getBoundingClientRect();
    if (!r.width) return;
    ptr.x = (e.clientX - r.left) / r.width;
    ptr.y = 1 - (e.clientY - r.top) / r.height;
  }
  function onDown() {
    down = 1;
  }
  function onUp() {
    down = 0;
  }

  function frame(now) {
    raf = 0;
    if (!gl || !live) return;
    warm += (down - warm) * 0.06;

    gl.bindVertexArray(vao);
    gl.disable(gl.BLEND);
    for (var s = 0; s < STEPS; s++) {
      var src = flip ? texB : texA;
      var dst = flip ? texA : texB;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, dst, 0);
      gl.viewport(0, 0, W, H);
      gl.useProgram(simP);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, src);
      gl.uniform1i(simP.u.u_prev, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, seedTex);
      gl.uniform1i(simP.u.u_seed, 1);
      gl.uniform2f(simP.u.u_texel, 1 / W, 1 / H);
      gl.uniform2f(simP.u.u_ptr, ptr.x, ptr.y);
      gl.uniform1f(simP.u.u_down, down);
      gl.uniform1f(simP.u.u_time, (now - t0) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      flip ^= 1;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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
    gl.useProgram(drawP);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, flip ? texB : texA);
    gl.uniform1i(drawP.u.u_state, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, seedTex);
    gl.uniform1i(drawP.u.u_seed, 1);
    gl.uniform2f(drawP.u.u_texel, 1 / W, 1 / H);
    gl.uniform1f(drawP.u.u_light, document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0);
    gl.uniform1f(drawP.u.u_warm, warm);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
    raf = requestAnimationFrame(frame);
  }

  return {
    start: function () {
      if (live) return false;
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
      if (!gl && !boot()) return false;
      live = true;
      t0 = performance.now();
      if (!raf) raf = requestAnimationFrame(frame);
      return true;
    },
    stop: function () {
      live = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
    /* A verification hook, not a feature. */
    state: function () {
      return { live: live, grid: [W, H], steps: STEPS, gl: !!gl, size: canvas ? [canvas.width, canvas.height] : null };
    },
  };
})();
