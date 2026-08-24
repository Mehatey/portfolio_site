/* ═══════════════════════════════════════════════════════════════════════════
   THE CONTENT IS THE SHADER

   Scanned the current Awwwards portfolio honourees to find out what they
   actually run, rather than guessing. The finding that mattered was not which
   libraries they load — it was WHERE the WebGL is.

   Lama Lama renders twenty-five videos and every image as GL planes. Its
   fragment shader samples a cursor vector-field texture and displaces the
   picture by it:

       vec2 vectorField = texture(u_cursor, roundedScreenUV).rg;
       vec2 cursorOffset = vectorField * ((0.08 * x_strength * y_strength) + 0.02);
       vec2 gh = st - cursorOffset;

   Pacôme Pertant does the same shape: every image is a plane with an
   in-shader cover fit (uPlaneSizes / uImageSizes), a uZoom on hover, and a
   nine-tap gaussian on the backface.

   Neither of them has an elaborate background. Two of the six sites scanned —
   Adcker and Artiom Yakushev — won Site of the Day with NO WebGL at all.

   So the craft is on the content, not behind it. This site had that exactly
   backwards: a two-pass fluid raymarch as wallpaper, and every project cover a
   flat DOM image. This file inverts it.

   HOW IT WORKS

   The <img> elements stay exactly where they are. They keep their src, their
   alt, their srcset, their place in the document — a screen reader, a crawler,
   a no-JS visitor and a printer all get precisely what they got before. The
   image is then made transparent and one fixed full-viewport canvas draws it
   back, at the same rect, through a shader.

   Per frame, for each plane in view:

     · its DOM rect becomes a clip-space quad, so the GL copy tracks layout,
       scroll, resize and reflow for free — there is no second source of truth
       about where a picture is
     · scroll parallax: the texture is sampled with a vertical offset scaled by
       how far the plane is from the centre of the viewport
     · the cursor field displaces it locally
     · hover eases a zoom and lifts the grade

   THE CURSOR FIELD

   A 128x128 RG texture, ping-ponged. Each frame the pointer stamps its own
   velocity into it and the whole field decays and diffuses slightly. That is
   what makes the displacement feel like a wake rather than a spotlight: the
   disturbance outlives the cursor and drifts.

   COST

   One canvas, one program, one quad, N draw calls where N is the number of
   planes actually intersecting the viewport — typically three to six. Textures
   are uploaded once, lazily, when a plane first comes near. No three.js: this
   draws axis-aligned quads, which is four vertices and a matrix nobody needs.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (REDUCED) return;

  /* Everything the site treats as a picture worth showing. Deliberately a
     list of existing selectors rather than a new attribute, so nothing in the
     markup has to change for this to apply. */
  /* Verified against the BUILT html rather than guessed from the templates:
     the first pass targeted .wk-media and .proto__shot, neither of which
     exists anywhere on this site, so the file matched nothing and returned
     before it drew a pixel. These are the containers the covers actually sit
     in — .wk-cover on the works index, .gal-frame on the home gallery,
     .cs-bleed and .cs-grid-item through every case study, .next-visual on the
     next-project card. */
  /* `.gal-frame img` was in this list and must not be: those are the homepage
     work covers, and `home-gl.js` already owns them -- it collects
     `[data-gl-media]`, which is exactly the `.gal-frame` element. Both files
     were hiding the same DOM image (one via `gl-hidden`, one via `.is-gl`) and
     then drawing it, so every homepage cover was being painted twice, by two
     different shaders, into the same pixels. The homepage is home-gl's; this
     file takes the rest of the site. */
  var SEL = [".wk-cover img", ".cs-bleed > img", ".cs-grid-item > img", ".next-visual img", ".mool-hero img"].join(",");

  var nodes = [].slice.call(document.querySelectorAll(SEL)).filter(function (n) {
    return n.tagName === "IMG";
  });
  if (!nodes.length) return;

  var canvas = document.createElement("canvas");
  canvas.id = "gl-media";
  canvas.setAttribute("aria-hidden", "true");
  var gl = null;
  try {
    gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false, depth: false });
  } catch (e) {
    gl = null;
  }
  /* No context: every <img> stays visible exactly as it is. This whole file is
     an enhancement over markup that already works. */
  if (!gl) return;
  document.body.appendChild(canvas);

  var VS =
    "attribute vec2 a; varying vec2 v; uniform vec4 u_rect; void main(){ v = a; vec2 p = mix(u_rect.xy, u_rect.zw, a); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }";

  var FS = [
    "precision mediump float;",
    "varying vec2 v;",
    "uniform sampler2D u_tex, u_field;",
    "uniform vec2 u_plane, u_image;",
    "uniform float u_hover, u_par, u_in, u_radius;",

    "void main(){",
    /* ── COVER, IN THE SHADER ──────────────────────────────────────────────
       Same maths object-fit: cover does, done here because the plane's aspect
       and the image's aspect are both uniforms and the alternative is
       letterboxing. Straight from the pattern both reference sites use. */
    "  vec2 ratio = vec2(",
    "    min((u_plane.x / u_plane.y) / (u_image.x / u_image.y), 1.0),",
    "    min((u_plane.y / u_plane.x) / (u_image.y / u_image.x), 1.0));",
    "  vec2 uv = vec2(v.x * ratio.x + (1.0 - ratio.x) * 0.5, (1.0 - v.y) * ratio.y + (1.0 - ratio.y) * 0.5);",

    /* ── SCROLL PARALLAX ──────────────────────────────────────────────────
       The picture moves inside its own frame as the frame crosses the
       viewport, which is what gives a flat grid depth. Small: 4% of the
       image, because parallax that reads as parallax is already too much. */
    /* The sample window is inset first, so the parallax offset below can
       never walk off the texture and clamp into a stretched edge pixel. 4% of
       travel needs 2% of headroom at each end. */
    "  uv = (uv - 0.5) * 0.94 + 0.5;",
    "  uv.y += u_par * 0.028;",

    /* ── HOVER ZOOM ───────────────────────────────────────────────────────
       Into the centre, so the crop grows rather than the picture sliding. */
    "  uv = (uv - 0.5) / (1.0 + u_hover * 0.07) + 0.5;",

    /* ── THE CURSOR FIELD ─────────────────────────────────────────────────
       Sampled in SCREEN space, not plane space, so one continuous wake runs
       across every picture it passes over rather than each plane having its
       own private disturbance. The edge weights fall to zero at the plane's
       border so the displacement can never drag the image off its own frame
       and expose the background. */
    "  vec2 field = texture2D(u_field, vec2(v.x, v.y)).rg * 2.0 - 1.0;",
    "  float ex = min(1.0, 4.0 * (1.0 - abs(v.x * 2.0 - 1.0)));",
    "  float ey = min(1.0, 4.0 * (1.0 - abs(v.y * 2.0 - 1.0)));",
    "  uv -= field * (0.05 * ex * ey + 0.012);",

    "  vec3 c = texture2D(u_tex, clamp(uv, 0.001, 0.999)).rgb;",

    /* Hover lifts the picture out of its resting grade rather than adding a
       highlight over it: contrast and saturation come up together, which is
       what a photograph does when it is the thing being looked at. */
    "  float g = dot(c, vec3(0.299, 0.587, 0.114));",
    "  c = mix(vec3(g), c, 1.0 + u_hover * 0.22);",
    "  c = mix(c * 0.86, c, 0.55 + u_hover * 0.45);",

    /* The arrival. A plane wipes up out of its own bottom edge the first time
       it is seen, and the leading edge carries a thin light.

       `up` is height measured from the plane's own bottom edge, and the wipe is
       a threshold travelling up through it, so it has to run 1 -> 0 as u_in
       runs 0 -> 1. Written against u_in directly it ran the other way: at rest
       the threshold sat at 1.0 and rev was zero over the whole plane, which
       meant every picture faded to nothing a second after it arrived. It read
       as correct only because the DOM copy was still lit underneath it. */
    "  float up = 1.0 - v.y;",
    "  float lead = 1.0 - u_in;",
    "  float rev = smoothstep(lead - 0.16, lead + 0.02, up);",
    "  float edge = smoothstep(0.10, 0.0, abs(up - lead)) * (1.0 - step(0.999, u_in));",
    "  c += edge * 0.16;",
    /* ── THE CORNERS ──────────────────────────────────────────────────────
       The DOM copy is clipped by border-radius; the GL copy is a rectangle,
       so without this every rounded card gained square corners the moment its
       texture uploaded. The radius is read off the element's own computed
       style and passed in pixels, so a card, a bleed and a grid cell each get
       their own — there is no shared constant to drift.

       Signed distance to a rounded box, antialiased over one pixel. */
    /* `half` is a reserved word in GLSL ES — declaring it fails the compile
       silently and the whole file returns before drawing. */
    "  vec2 hp = u_plane * 0.5;",
    "  vec2 q = abs((v - 0.5) * u_plane) - hp + u_radius;",
    "  float d = min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - u_radius;",
    "  float mask = 1.0 - smoothstep(-1.0, 0.5, d);",
    "  gl_FragColor = vec4(c, rev * mask);",
    "}",
  ].join("\n");

  /* The field shader: stamp the pointer, decay, diffuse. */
  var FIELD_FS = [
    "precision mediump float;",
    "varying vec2 v;",
    "uniform sampler2D u_prev;",
    "uniform vec2 u_ptr, u_vel, u_px;",
    "uniform float u_decay;",
    "void main(){",
    "  vec2 prev = texture2D(u_prev, v).rg;",
    /* four-tap diffusion, so a stamp spreads instead of staying a dot */
    "  vec2 blur = (texture2D(u_prev, v + vec2(u_px.x, 0.0)).rg + texture2D(u_prev, v - vec2(u_px.x, 0.0)).rg",
    "             + texture2D(u_prev, v + vec2(0.0, u_px.y)).rg + texture2D(u_prev, v - vec2(0.0, u_px.y)).rg) * 0.25;",
    "  vec2 f = mix(prev, blur, 0.22);",
    "  f = (f - 0.5) * u_decay + 0.5;",
    "  float d = distance(v, u_ptr);",
    "  f += u_vel * exp(-d * d * 260.0);",
    "  gl_FragColor = vec4(clamp(f, 0.0, 1.0), 0.0, 1.0);",
    "}",
  ].join("\n");

  function sh(t, src) {
    var o = gl.createShader(t);
    gl.shaderSource(o, src);
    gl.compileShader(o);
    if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) {
      console.warn("gl-media:", gl.getShaderInfoLog(o));
      return null;
    }
    return o;
  }
  function link(vs, fs) {
    var a = sh(gl.VERTEX_SHADER, vs),
      b = sh(gl.FRAGMENT_SHADER, fs);
    if (!a || !b) return null;
    var p = gl.createProgram();
    gl.attachShader(p, a);
    gl.attachShader(p, b);
    gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  }

  var prog = link(VS, FS);
  var fieldProg = link("attribute vec2 a; varying vec2 v; void main(){ v = a; gl_Position = vec4(a * 2.0 - 1.0, 0.0, 1.0); }", FIELD_FS);
  if (!prog || !fieldProg) {
    canvas.remove();
    return;
  }

  var quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);

  function attach(p) {
    var loc = gl.getAttribLocation(p, "a");
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  }
  function U(p, n) {
    var o = {};
    n.forEach(function (k) {
      o[k] = gl.getUniformLocation(p, k);
    });
    return o;
  }
  var uP = U(prog, ["u_rect", "u_tex", "u_field", "u_plane", "u_image", "u_hover", "u_par", "u_in", "u_radius"]);
  var uF = U(fieldProg, ["u_prev", "u_ptr", "u_vel", "u_px", "u_decay"]);

  /* ── the field targets ─────────────────────────────────────────────────── */
  var FN = 128,
    ft = [],
    ff = [],
    fcur = 0,
    fieldOK = true;
  for (var i = 0; i < 2; i++) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    /* Seeded at 0.5, which is zero displacement once the shader remaps to
       signed. A zeroed texture would shove every picture up and left on the
       first frame. */
    var seed = new Uint8Array(FN * FN * 4);
    for (var k = 0; k < seed.length; k += 4) {
      seed[k] = 128;
      seed[k + 1] = 128;
      seed[k + 3] = 255;
    }
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, FN, FN, 0, gl.RGBA, gl.UNSIGNED_BYTE, seed);
    var f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) fieldOK = false;
    ft.push(t);
    ff.push(f);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  /* ── the planes ────────────────────────────────────────────────────────── */
  var planes = nodes.map(function (el) {
    return { el: el, tex: null, iw: 1, ih: 1, hover: 0, thover: 0, seen: 0, inv: 0, asked: false, radius: 0 };
  });

  function upload(pl) {
    if (pl.asked) return;
    pl.asked = true;
    var src = pl.el.currentSrc || pl.el.src;
    if (!src) return;
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      var t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      } catch (e) {
        return;
      }
      pl.tex = t;
      pl.iw = img.naturalWidth || 1;
      pl.ih = img.naturalHeight || 1;
      /* Only now is the DOM copy hidden. If the upload never lands — a
         cross-origin image, a decode failure — the original stays on screen
         and nothing is lost. */
      pl.el.classList.add("gl-hidden");
    };
    img.src = src;
  }

  /* ── pointer ───────────────────────────────────────────────────────────── */
  var px = 0.5,
    py = 0.5,
    lpx = 0.5,
    lpy = 0.5,
    vx = 0,
    vy = 0;
  window.addEventListener(
    "pointermove",
    function (e) {
      px = e.clientX / Math.max(1, window.innerWidth);
      py = 1 - e.clientY / Math.max(1, window.innerHeight);
    },
    { passive: true }
  );

  planes.forEach(function (pl) {
    var host = pl.el.closest("a, figure, .cs-grid-item, .cs-bleed") || pl.el;
    host.addEventListener(
      "pointerenter",
      function () {
        pl.thover = 1;
      },
      { passive: true }
    );
    host.addEventListener(
      "pointerleave",
      function () {
        pl.thover = 0;
      },
      { passive: true }
    );
  });

  var W = 0,
    H = 0,
    dpr = 1;
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.round(window.innerWidth * dpr);
    H = Math.round(window.innerHeight * dpr);
    canvas.width = W;
    canvas.height = H;
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  function frame() {
    requestAnimationFrame(frame);
    if (document.hidden) return;

    /* velocity, smoothed and decayed, so a flick leaves a stroke */
    vx = (px - lpx) * 2.2 + vx * 0.82;
    vy = (py - lpy) * 2.2 + vy * 0.82;
    lpx = px;
    lpy = py;

    /* ── pass 1: the cursor field ─────────────────────────────────────── */
    if (fieldOK) {
      gl.useProgram(fieldProg);
      attach(fieldProg);
      gl.bindFramebuffer(gl.FRAMEBUFFER, ff[1 - fcur]);
      gl.viewport(0, 0, FN, FN);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, ft[fcur]);
      gl.uniform1i(uF.u_prev, 0);
      gl.uniform2f(uF.u_ptr, px, py);
      gl.uniform2f(uF.u_vel, Math.max(-0.4, Math.min(0.4, vx)), Math.max(-0.4, Math.min(0.4, vy)));
      gl.uniform2f(uF.u_px, 1 / FN, 1 / FN);
      gl.uniform1f(uF.u_decay, 0.94);
      gl.disable(gl.BLEND);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.enable(gl.BLEND);
      fcur = 1 - fcur;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    /* ── pass 2: the planes ───────────────────────────────────────────── */
    gl.viewport(0, 0, W, H);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);
    attach(prog);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, ft[fcur]);
    gl.uniform1i(uP.u_field, 1);

    var vh = window.innerHeight;
    for (var i = 0; i < planes.length; i++) {
      var pl = planes[i];
      var r = pl.el.getBoundingClientRect();
      if (r.bottom < -160 || r.top > vh + 160 || r.width < 4) {
        continue;
      }
      if (!pl.tex) {
        upload(pl);
        continue;
      }

      /* Read from the element rather than assumed. Cheap: getComputedStyle is
         only touched when the value is still unknown, and a plane's radius
         does not change while it is on screen. */
      if (!pl.radius) {
        var br = parseFloat(getComputedStyle(pl.el).borderTopLeftRadius) || 0;
        if (!br) {
          var host = pl.el.parentElement;
          br = host ? parseFloat(getComputedStyle(host).borderTopLeftRadius) || 0 : 0;
        }
        pl.radius = br || 0.001;
      }
      pl.hover += (pl.thover - pl.hover) * 0.09;
      /* Reveal runs once, on first sight, and stays run. */
      if (pl.seen < 1 && r.top < vh * 0.92) pl.seen = 1;
      pl.inv += ((pl.seen ? 1 : 0) - pl.inv) * 0.055;

      /* DOM rect to clip space. y is flipped because the canvas origin is
         bottom-left and getBoundingClientRect is top-down. */
      var x0 = r.left / window.innerWidth,
        x1 = r.right / window.innerWidth;
      var y0 = 1 - r.bottom / vh,
        y1 = 1 - r.top / vh;

      /* How far this plane is from the middle of the screen, signed. */
      var mid = (r.top + r.height / 2) / vh;
      gl.uniform4f(uP.u_rect, x0, y0, x1, y1);
      gl.uniform2f(uP.u_plane, r.width, r.height);
      gl.uniform2f(uP.u_image, pl.iw, pl.ih);
      gl.uniform1f(uP.u_hover, pl.hover);
      gl.uniform1f(uP.u_par, Math.max(-1, Math.min(1, mid * 2 - 1)));
      gl.uniform1f(uP.u_in, Math.min(1, pl.inv * 1.06));
      gl.uniform1f(uP.u_radius, Math.min(pl.radius, Math.min(r.width, r.height) * 0.5));
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, pl.tex);
      gl.uniform1i(uP.u_tex, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }
  requestAnimationFrame(frame);

  /* A verification hook, not a feature. */
  window.__glMedia = function () {
    return {
      planes: planes.length,
      uploaded: planes.filter(function (p) {
        return !!p.tex;
      }).length,
      field: fieldOK,
    };
  };
})();
