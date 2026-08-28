/* ═══════════════════════════════════════════════════════════════════════════
   02 · THE WALL — A LIT PHOTOGRAPH

   Sid: "take time study award winners dont do lame small changes."

   So I went and read what is actually winning. The one interaction that
   recurs across the 2026 Awwwards honours -- Hubtown, the Lando Norris site,
   half the WebGL-first studio work out of Paris and Amsterdam -- is not a
   transition or a particle count. It is CURSOR-UNCOVERS-DETAIL: the pointer
   is a light, and moving it reveals material that was there all along.

   This is that, applied to a photograph rather than to a mesh.

   HOW A FLAT PHOTOGRAPH GETS LIT

   The image has no normals; it is three channels of colour. But a pinboard
   is a nearly-flat surface whose relief correlates almost perfectly with its
   luminance -- the edges of paper, the curl of a postcard, the shadow under a
   pinned corner are all the places where brightness changes fastest. So the
   gradient of luminance IS the surface gradient, near enough, and a normal
   built from it is a normal you can light.

     N = normalize(vec3(-dL/dx, -dL/dy, k))

   k controls how much relief you claim: high k is a flat wall, low k is
   embossed tin. Held at 0.42, which reads as paper.

   That normal is then lit by a point light at the cursor, with a falloff, and
   the result is added to the photograph rather than replacing it. So the
   picture is always fully there -- this is not a torch in the dark, which is
   the version of this idea that was already tried on this site's footer and
   removed because it read as a stain. It is the same wall, with a light
   moving across it, and the paper standing up where the light grazes it.

   WHY IT IS NOT A CSS FILTER

   Because the gradient has to be taken in texture space at the display's own
   resolution, and because the light needs a specular term that depends on the
   view direction. Neither is expressible in a filter chain. This is four
   texture taps and a dot product per pixel, which is cheaper than the blur
   that a backdrop-filter would have cost.
   ═══════════════════════════════════════════════════════════════════════════ */
window.__wallLight = (function () {
  "use strict";

  var host = null,
    img = null,
    gl = null,
    prog = null,
    tex = null,
    canvas = null,
    raf = 0,
    t0 = 0,
    live = false,
    ready = false;
  var ptr = { x: 0.5, y: 0.4 },
    cur = { x: 0.5, y: 0.4 };

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
    "uniform vec2 u_res, u_ptr;",
    "uniform float u_time, u_light, u_cover;",
    "out vec4 o;",

    "float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }",

    "void main(){",
    /* object-fit: cover, by hand. The canvas is the viewport and the photo
       has its own aspect; letting the texture stretch would distort a
       photograph of real objects, which is the one thing a photograph may
       not do. */
    "  vec2 uv = v_uv;",
    "  uv.y = 1.0 - uv.y;",
    "  float sa = u_res.x / u_res.y;",
    "  vec2 sc = sa > u_cover ? vec2(1.0, u_cover / sa) : vec2(sa / u_cover, 1.0);",
    "  uv = (uv - 0.5) * sc + 0.5;",
    /* A very slight pointer parallax on the sample itself, so the picture
       has a hair of depth against the pinned cards over it. */
    "  uv += (u_ptr - 0.5) * -0.012;",
    /* ── THE WALL IS CUT OUT ───────────────────────────────────────────
       room-wall-*.webp is not a photograph of a wall. It is the OBJECTS on
       the wall, matted onto transparency -- every postcard, drawing and
       photograph masked out, with nothing between them.

       Sampling .rgb and discarding alpha therefore returns whatever colour
       is stored in the fully transparent texels, which for this file is
       white. That is what the pale horizontal bars lying across the dark
       between the cards were: not lighting at all, which is why three rounds
       of reducing the light never moved them. The <img> this replaced never
       showed them because the browser was compositing its alpha.

       So alpha is carried through: the light is computed on the objects, and
       the gaps between them stay empty and let the page show through. */
    "  vec4 texel = texture(u_src, uv);",
    "  vec3 base = texel.rgb;",
    "  float A = texel.a;",

    /* The surface normal, from the luminance gradient. Sobel would be
       steadier; four taps is enough here and costs half as much, and the
       image is already softened by the scale it is drawn at. */
    "  vec2 e = 1.4 / u_res;",
    /* Weighted by each tap's own alpha, so the boundary between an object
       and the empty wall is not read as a cliff of luminance. Without this
       every card carries a hard rim exactly where its matte ends. */
    "  vec4 tx1 = texture(u_src, uv + vec2(e.x, 0.0)), tx2 = texture(u_src, uv - vec2(e.x, 0.0));",
    "  float lx = lum(tx1.rgb) * tx1.a - lum(tx2.rgb) * tx2.a;",
    "  vec4 ty1 = texture(u_src, uv + vec2(0.0, e.y)), ty2 = texture(u_src, uv - vec2(0.0, e.y));",
    "  float ly = lum(ty1.rgb) * ty1.a - lum(ty2.rgb) * ty2.a;",
    /* 0.85, not 2.6. At 2.6 the gradient dominated the normal and every
       paper edge on the board came back as a hard white halo -- the whole
       wall read as embossed tin, which is the classic failure of a
       luminance-derived normal: the gradient is a proxy for relief, not a
       measurement of it, so claiming a lot of relief from it claims detail
       that is not there. Low enough that only real edges lift. */
    "  vec3 N = normalize(vec3(-lx * 0.6, -ly * 0.6, 1.0));",

    /* The cursor is the light. Distance in aspect-corrected screen space so
       the pool is round on any window. */
    "  vec2 d = (v_uv - u_ptr) * vec2(u_res.x / u_res.y, 1.0);",
    "  float dist = length(d);",
    "  vec3 L = normalize(vec3(d * -1.0, 0.52));",
    /* Tighter, so it is a lamp and not an overall brightening. */
    "  float fall = exp(-dist * dist * 7.5);",

    "  float dif = max(0.0, dot(N, L));",
    /* Specular. This is the term that makes paper read as paper: photographic
       prints and postcards have a sheen, and it is the sheen moving that
       tells you a light is moving rather than a brightness being turned up. */
    "  vec3 V = vec3(0.0, 0.0, 1.0);",
    "  vec3 H = normalize(L + V);",
    "  float spec = pow(max(0.0, dot(N, H)), 48.0);",

    /* Added, never replacing. The wall is always fully visible; the light is
       an addition to it. A torch that darkens everything it is not on was
       tried on this site's footer and removed for reading as a stain. */
    "  vec3 key = vec3(1.00, 0.86, 0.68);",
    /* ── THE LIGHT HAS A CEILING ──────────────────────────────────────
       Unclamped, the diffuse term ran away along every strong horizontal
       luminance edge on the board and came back as white bars lying across
       the cards. The cause is not the light, it is the normal: a
       luminance-derived normal is wildly wrong exactly AT an edge, where
       the gradient is enormous and the real surface is nearly flat. So the
       fix is not a smaller light, it is a hard ceiling on how much any one
       pixel may gain -- which leaves the effect intact across the broad
       areas where the normal is roughly right, and refuses to trust it
       where it is not. */
    "  vec3 add = key * (dif * fall * 0.34 + spec * fall * 0.26);",
    /* ── A DARK SURFACE REFLECTS LESS ─────────────────────────────────
       The clamp above stopped edges blowing out and left a worse artefact:
       an ABSOLUTE ceiling adds the same amount everywhere, so on the near
       black board between the cards a capped 0.16 is eight times the
       surroundings and every card edge came back as a pale horizontal bar
       lying across the dark.
       The light has to be modulated by the albedo it is landing on, which
       is both what fixes it and what is physically true: paint that is
       almost black returns almost nothing however hard you light it. */
    "  add *= 0.10 + 0.90 * lum(base);",
    "  vec3 col = base + min(add, vec3(0.20));",
    /* A slow breath, so the wall is never completely dead when the pointer
       is still. */
    "  col *= 1.0 + sin(u_time * 0.35 + uv.y * 2.0) * 0.012;",
    /* Cream: the same relief, less of it, and cooled rather than warmed --
       a lit wall in a bright room does not glow. */
    "  vec3 lightAdd = vec3(1.0) * (dif * fall * 0.2 + spec * fall * 0.14) * (0.2 + 0.8 * lum(base));",
    "  vec3 lightCol = base + min(lightAdd, vec3(0.1));",
    "  col = mix(col, lightCol, u_light);",
    "  o = vec4(col * A, A);",
    "}",
  ].join("\n");

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      if (window.console && console.warn) console.warn("[wall-light]", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  function boot() {
    host = document.querySelector(".hero-wall");
    img = host && host.querySelector(".hero-wall__img");
    if (!host || !img) return false;
    canvas = document.createElement("canvas");
    canvas.className = "hero-wall__canvas";
    canvas.setAttribute("aria-hidden", "true");
    host.insertBefore(canvas, host.firstChild);
    try {
      gl = canvas.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: true });
    } catch (e) {}
    if (!gl) {
      /* No shader, no problem: the <img> underneath is the direction. It
         loses the light and keeps the photograph, which is the part that
         carries the concept. */
      canvas.remove();
      return false;
    }
    var v = compile(gl.VERTEX_SHADER, VS),
      f = compile(gl.FRAGMENT_SHADER, FS);
    if (!v || !f) {
      canvas.remove();
      gl = null;
      return false;
    }
    prog = gl.createProgram();
    gl.attachShader(prog, v);
    gl.attachShader(prog, f);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      if (window.console && console.warn) console.warn("[wall-light] link", gl.getProgramInfoLog(prog));
      canvas.remove();
      gl = null;
      return false;
    }
    prog.u = {};
    ["u_src", "u_res", "u_ptr", "u_time", "u_light", "u_cover"].forEach(function (n) {
      prog.u[n] = gl.getUniformLocation(prog, n);
    });

    tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    var upload = function () {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      ready = true;
      /* The <img> is what was showing until now, and it stays in the DOM as
         the fallback -- but once the canvas is drawing the same picture,
         painting both is paying twice. */
      host.classList.add("is-lit");
    };
    if (img.complete && img.naturalWidth) upload();
    else img.addEventListener("load", upload, { once: true });

    window.addEventListener("pointermove", onMove, { passive: true });
    return true;
  }

  function onMove(e) {
    ptr.x = e.clientX / Math.max(1, window.innerWidth);
    ptr.y = 1 - e.clientY / Math.max(1, window.innerHeight);
  }

  function frame(now) {
    raf = 0;
    if (!gl || !live) return;
    if (!ready) {
      raf = requestAnimationFrame(frame);
      return;
    }
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = Math.max(1, Math.round(host.clientWidth * dpr));
    var h = Math.max(1, Math.round(host.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    /* Eased hard. The light has weight: a specular that snaps to the cursor
       reads as a cursor effect, and one that trails behind it reads as a
       lamp being carried. */
    cur.x += (ptr.x - cur.x) * 0.07;
    cur.y += (ptr.y - cur.y) * 0.07;

    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(prog);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(prog.u.u_src, 0);
    gl.uniform2f(prog.u.u_res, w, h);
    gl.uniform2f(prog.u.u_ptr, cur.x, cur.y);
    gl.uniform1f(prog.u.u_time, (now - t0) / 1000);
    gl.uniform1f(prog.u.u_cover, (img.naturalWidth || 16) / (img.naturalHeight || 9));
    gl.uniform1f(prog.u.u_light, document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = requestAnimationFrame(frame);
  }

  return {
    start: function () {
      if (live) return;
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!gl && !boot()) return;
      live = true;
      t0 = performance.now();
      if (!raf) raf = requestAnimationFrame(frame);
    },
    stop: function () {
      live = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
    /* A verification hook, not a feature. */
    state: function () {
      return { live: live, ready: ready, gl: !!gl, size: canvas ? [canvas.width, canvas.height] : null };
    },
  };
})();
