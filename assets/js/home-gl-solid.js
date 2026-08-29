/* ═══════════════════════════════════════════════════════════════════════════
   01 · THE SOLID — THE SENTENCE, EXTRUDED AND CAST IN GLASS

   Sid: "even the cube getting up and dancing on click and video of me sitting
   and working is all earlier shit and my ideas. i want something fresh out of
   you, make fresh new good quality ideas not reusing old ones."

   Fair. The room was his figure and his footage rearranged. This uses no
   asset of his at all -- no model, no video, no photograph. The only input is
   the sentence, and the sentence was going to be on the page regardless.

   WHAT IT IS

   "Product designer, six years." raymarched as a solid object: the letters
   extruded into depth, rounded at the edges, and rendered as a thick piece of
   glass that turns slowly and refracts whatever is behind the page.

   The claim IS the object. That is the argument for doing it this way rather
   than putting a figure or a product next to the words: a portfolio hero
   needs a subject, and the most honest subject a designer has is the thing
   they are claiming.

   HOW YOU RAYMARCH TYPE

   You cannot march a canvas -- a rasterised glyph is a bitmap, and a
   distance field is what a raymarcher needs. So the sentence is rendered to a
   canvas, and that bitmap is converted into a real signed distance field on
   the CPU with 8SSEDT: two sweeps over the grid propagating the nearest known
   boundary point, once forward and once back. Exact to within a pixel, about
   four milliseconds for this size, and it happens once.

   The 3D field is then the classic extrusion:

     d = max( sdf2d(p.xy), |p.z| - thickness )

   with a rounding term subtracted so the edges are bevelled rather than
   knife-sharp -- a bevel is where glass catches its light, and without it
   this reads as a flat cut-out however good the shading is.

   THE GLASS

   Refraction, not transparency. The ray that hits the surface is bent by the
   normal and used to sample the background, three times at slightly different
   indices so the edges carry a colour fringe. Fresnel raises reflectance at
   grazing angles. A specular from the upper left, where every other light on
   this site comes from. And absorption with depth -- Beer's law -- so the
   thick middle of a letter is darker than its thin edge, which is the single
   cue that tells you a transparent object has VOLUME rather than being a
   window.

   Nothing here is a model, a texture or a video. It is one sentence, a
   distance transform, and a march.
   ═══════════════════════════════════════════════════════════════════════════ */
window.__solidType = (function () {
  "use strict";

  /* 768x240 with the type set at 8.5% of the width. The first pass used 640
     and 10.8%, which put "Product designer," at about 600px inside a 640px
     canvas -- the glyphs all but touched the border, so the distance field
     was near zero along the edge of the texture and the raymarcher found a
     SURFACE there. It drew a dashed rectangle around the whole object: not a
     bug in the march, a text box with no margin in it. */
  var SW = 768,
    SH = 240;

  var host = null,
    canvas = null,
    gl = null,
    prog = null,
    sdfTex = null,
    bgTex = null,
    vao = null,
    raf = 0,
    t0 = 0,
    live = false;
  var ptr = { x: 0, y: 0 },
    cur = { x: 0, y: 0 };
  var pad = null,
    pctx = null;

  /* ── 8SSEDT ───────────────────────────────────────────────────────────
     Signed Euclidean distance transform in two sweeps. Each cell holds a
     vector to its nearest boundary; a sweep propagates the best candidate
     from the neighbours already visited, and the reverse sweep does the same
     backwards. Run once on the inside and once on the outside, subtract, and
     the result is signed.

     This is the standard method and it is here rather than a shader because
     it runs exactly once, at boot, and a GPU jump-flood would be more code
     for a cost nobody will ever notice. */
  function edt(mask, w, h) {
    var INF = 1e9;
    var gx = new Float32Array(w * h),
      gy = new Float32Array(w * h),
      d = new Float32Array(w * h);
    function init(inside) {
      for (var i = 0; i < w * h; i++) {
        var on = inside ? mask[i] > 0 : mask[i] === 0;
        if (on) {
          gx[i] = 0;
          gy[i] = 0;
          d[i] = 0;
        } else {
          gx[i] = INF;
          gy[i] = INF;
          d[i] = INF;
        }
      }
    }
    function cmp(i, ox, oy, dx, dy) {
      var j = i + oy * w + ox;
      if (j < 0 || j >= w * h) return;
      var nx = gx[j] + dx,
        ny = gy[j] + dy;
      var nd = nx * nx + ny * ny;
      if (nd < d[i]) {
        gx[i] = nx;
        gy[i] = ny;
        d[i] = nd;
      }
    }
    function sweep() {
      var x, y, i;
      for (y = 0; y < h; y++)
        for (x = 0; x < w; x++) {
          i = y * w + x;
          if (x > 0) cmp(i, -1, 0, 1, 0);
          if (y > 0) cmp(i, 0, -1, 0, 1);
          if (x > 0 && y > 0) cmp(i, -1, -1, 1, 1);
          if (x < w - 1 && y > 0) cmp(i, 1, -1, 1, 1);
        }
      for (y = h - 1; y >= 0; y--)
        for (x = w - 1; x >= 0; x--) {
          i = y * w + x;
          if (x < w - 1) cmp(i, 1, 0, 1, 0);
          if (y < h - 1) cmp(i, 0, 1, 0, 1);
          if (x < w - 1 && y < h - 1) cmp(i, 1, 1, 1, 1);
          if (x > 0 && y < h - 1) cmp(i, -1, 1, 1, 1);
        }
    }
    init(true);
    sweep();
    var inside = new Float32Array(w * h);
    for (var a = 0; a < w * h; a++) inside[a] = Math.sqrt(d[a]);
    init(false);
    sweep();
    /* ── THE SIGN ─────────────────────────────────────────────────────
       inside[] holds the distance to the nearest GLYPH cell, and d[] now
       holds the distance to the nearest BACKGROUND cell. So for a point
       outside a letter the first is positive and the second is zero, and for
       a point within one it is the other way round.

       Written the other way first -- sqrt(d) - inside -- which makes the
       BACKGROUND negative and the letters positive. The convention every
       raymarcher assumes is the opposite, so the field described a solid
       slab with letter-shaped holes punched through it, and that is exactly
       what it drew: a filled rectangle with the words faintly visible inside
       it and a hard dashed edge where the slab ended.

       I diagnosed that edge twice as a texture-border problem and fixed
       neither, because the artefact I was looking at was the SILHOUETTE OF
       THE OBJECT and the object was inside out. */
    var out = new Float32Array(w * h);
    for (var b = 0; b < w * h; b++) out[b] = inside[b] - Math.sqrt(d[b]);
    return out;
  }

  function buildSDF() {
    var c = document.createElement("canvas");
    c.width = SW;
    c.height = SH;
    var x = c.getContext("2d");
    x.fillStyle = "#000";
    x.fillRect(0, 0, SW, SH);
    x.fillStyle = "#fff";
    x.textAlign = "center";
    x.textBaseline = "middle";
    var f = 'Figtree, "Helvetica Neue", Arial, sans-serif';
    x.font = "500 " + Math.round(SW * 0.085) + "px " + f;
    x.fillText("Product designer,", SW / 2, SH * 0.34);
    x.fillText("six years.", SW / 2, SH * 0.7);
    var px = x.getImageData(0, 0, SW, SH).data;
    var mask = new Uint8Array(SW * SH);
    for (var i = 0; i < SW * SH; i++) mask[i] = px[i * 4] > 128 ? 1 : 0;
    var sd = edt(mask, SW, SH);

    /* Packed into a byte texture. 0.5 is the surface; the range is +/- 24px,
       which is more than the march ever needs and keeps the quantisation
       below a tenth of a pixel. */
    var buf = new Uint8Array(SW * SH * 4);
    for (var j = 0; j < SW * SH; j++) {
      /* +/-24px rather than +/-48. The packing is eight bits, so halving
         the range doubles the precision, and the coarse quantisation was
         showing as visible stepping down the extruded sides of every
         letter -- the march was landing on the same quantised value for
         several steps running. Nothing here ever needs to know about a
         distance greater than 24px. */
      var v = Math.max(0, Math.min(1, sd[j] / 24 + 0.5));
      var b = Math.round(v * 255);
      buf[j * 4] = b;
      buf[j * 4 + 1] = b;
      buf[j * 4 + 2] = b;
      buf[j * 4 + 3] = 255;
    }
    return buf;
  }

  var VS = [
    "#version 300 es",
    "const vec2 P[3] = vec2[3](vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));",
    "out vec2 v_uv;",
    "void main(){",
    "  vec2 p = P[gl_VertexID];",
    "  v_uv = p;",
    "  gl_Position = vec4(p, 0.0, 1.0);",
    "}",
  ].join("\n");

  var FS = [
    "#version 300 es",
    "precision highp float;",
    "in vec2 v_uv;",
    "uniform sampler2D u_sdf, u_bg;",
    "uniform float u_time, u_aspect, u_light;",
    "uniform vec2 u_ptr;",
    "out vec4 o;",

    "mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }",

    /* The 2D field, read back out of the packed texture. Outside the glyph
       box it returns a large positive number so the march cannot wander off
       the edge of the texture and find a false surface at the clamp. */
    "float sdf2(vec2 p){",
    "  vec2 uv = p * vec2(0.5, -0.5 * 3.2) + 0.5;",
    /* And a hard margin: within 3% of any edge the field is forced large and
       positive, so even a glyph that did reach the border could not present a
       surface there. Belt and braces, because this failure looked deliberate
       enough to survive a review. */
    "  if (uv.x < 0.03 || uv.x > 0.97 || uv.y < 0.03 || uv.y > 0.97) return 0.6;",
    "  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.6;",
    "  return (texture(u_sdf, uv).r - 0.5) * 0.15;",
    "}",
    /* The extrusion. max() of the 2D field and a slab in z is the standard
       prism; subtracting a constant rounds every edge of it at once, which is
       where a piece of glass catches its light. */
    /* ── THE SENTENCE, EXTRUDED ─────────────────────────────────────────── */
    "float mapType(vec3 p){",
    "  float d2 = sdf2(p.xy);",
    "  float slab = abs(p.z) - 0.075;",
    "  return max(d2, slab) - 0.022;",
    "}",
    /* ── THE VITRINE ─────────────────────────────────────────────────────
       A rounded box around it, and the sentence sits inside.

       Sid sent two references. Robert Aperios nests a solid orange core
       inside a frosted shell; Scott Darby runs one enormous cube past the
       edges of the frame with a different surface on every face. What is
       good in both is the same thing: a single object, and something to look
       THROUGH before you get to the thing that matters.

       So the words are in a case. Not for decoration -- the shell is what
       makes the refraction mean something, because now there are two
       surfaces between the reader and the claim, and the outer one displaces
       the inner one as it turns. A solid alone refracts the page behind it.
       A solid inside a case refracts ITSELF, which is a picture you cannot
       get from a mesh without rendering the whole thing twice.

       Rounded because a hard cube reads as a UI container. The corner radius
       is generous enough to catch a highlight along every edge, which is
       where the case announces itself at all -- it is otherwise almost
       invisible, and that is the intent. */
    "float sdRoundBox(vec3 p, vec3 b, float r){",
    "  vec3 q = abs(p) - b + r;",
    "  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;",
    "}",
    "float mapCase(vec3 p){",
    "  return sdRoundBox(p, vec3(1.06, 0.40, 0.30), 0.10);",
    "}",
    /* The scene returns both the distance and WHICH surface it is, so the
       shading stage can treat the case and the letters as different
       materials off one march. Packing the id into y is the standard trick
       and costs nothing. */
    "vec2 mapAll(vec3 p){",
    "  float a = mapType(p);",
    "  float b = mapCase(p);",
    "  return a < b ? vec2(a, 1.0) : vec2(b, 2.0);",
    "}",
    "float map(vec3 p){ return mapAll(p).x; }",
    "vec3 nrm(vec3 p){",
    "  vec2 e = vec2(1.0, -1.0) * 0.0016;",
    "  return normalize(e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) + e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));",
    "}",

    /* ── TWO MARCHES, ONE COMPOSITE ──────────────────────────────────────
       The first attempt marched the union of the case and the letters, which
       meant the ray stopped at whichever came first -- and the case is always
       first, because it is around them. The sentence was perfectly rendered
       and completely invisible inside an opaque white slab.

       A case you cannot see through is not a case. So the two are marched
       SEPARATELY and composited: the letters first, then the shell over them
       with its own low alpha. That also lets each carry its own material
       without an id branch, and it is what makes the shell's refraction
       displace the sentence rather than replace it. */
    "void main(){",
    "  vec2 uv = v_uv;",
    "  uv.x *= u_aspect;",
    "  vec3 ro = vec3(0.0, 0.0, 2.6);",
    "  vec3 rd = normalize(vec3(uv * 0.42, -1.0));",
    "  float a = sin(u_time * 0.16) * 0.30 + u_ptr.x * 0.22;",
    "  float b = sin(u_time * 0.11 + 1.3) * 0.12 - u_ptr.y * 0.14;",
    "  mat2 ry = rot(a), rx = rot(b), ryI = rot(-a), rxI = rot(-b);",
    "  vec2 base = v_uv * 0.5 + 0.5;",
    "  vec3 key = vec3(1.00, 0.86, 0.68), cool = vec3(0.30, 0.46, 0.72);",
    "  vec3 L = normalize(vec3(-0.42, 0.68, 0.60));",

    /* ── the letters ── */
    "  vec4 typeOut = vec4(0.0);",
    "  {",
    "    float t = 0.0; vec3 p = ro; float hit = 0.0;",
    "    for (int i = 0; i < 72; i++) {",
    "      p = ro + rd * t;",
    "      vec3 q = p; q.xz *= ry; q.yz *= rx;",
    "      float d = mapType(q);",
    "      if (d < 0.0009) { hit = 1.0; break; }",
    "      t += d * 0.75;",
    "      if (t > 5.0) break;",
    "    }",
    "    if (hit > 0.5) {",
    "      vec3 q = p; q.xz *= ry; q.yz *= rx;",
    "      vec2 e = vec2(1.0, -1.0) * 0.0016;",
    "      vec3 n = normalize(e.xyy * mapType(q + e.xyy) + e.yyx * mapType(q + e.yyx) + e.yxy * mapType(q + e.yxy) + e.xxx * mapType(q + e.xxx));",
    "      vec3 N = n; N.yz *= rxI; N.xz *= ryI;",
    "      vec3 rr = refract(rd, N, 0.72), rg = refract(rd, N, 0.70), rb = refract(rd, N, 0.68);",
    "      vec3 col;",
    "      col.r = texture(u_bg, base + rr.xy * 0.28).r;",
    "      col.g = texture(u_bg, base + rg.xy * 0.28).g;",
    "      col.b = texture(u_bg, base + rb.xy * 0.28).b;",
    "      float thick = clamp(0.5 - mapType(q + vec3(0.0, 0.0, -0.06)) * 3.0, 0.0, 1.0);",
    "      col *= exp(-vec3(0.55, 0.38, 0.26) * thick * 1.1);",
    "      float fres = pow(1.0 - max(0.0, dot(N, -rd)), 3.0);",
    "      col += mix(cool, key, 0.4) * fres * 1.15;",
    "      col += key * pow(max(0.0, dot(N, normalize(L - rd))), 60.0) * 1.8;",
    "      col += key * max(0.0, dot(N, L)) * 0.22;",
    "      col = mix(col, mix(col, vec3(0.10, 0.12, 0.16), 0.45), u_light);",
    "      typeOut = vec4(col, clamp(0.62 + fres * 0.8 + thick * 0.5, 0.0, 1.0));",
    "    }",
    "  }",

    /* ── the case, over them ── */
    "  vec4 caseOut = vec4(0.0);",
    "  {",
    "    float t = 0.0; vec3 p = ro; float hit = 0.0;",
    "    for (int i = 0; i < 40; i++) {",
    "      p = ro + rd * t;",
    "      vec3 q = p; q.xz *= ry; q.yz *= rx;",
    "      float d = mapCase(q);",
    "      if (d < 0.0012) { hit = 1.0; break; }",
    "      t += d * 0.9;",
    "      if (t > 5.0) break;",
    "    }",
    "    if (hit > 0.5) {",
    "      vec3 q = p; q.xz *= ry; q.yz *= rx;",
    "      vec2 e = vec2(1.0, -1.0) * 0.002;",
    "      vec3 n = normalize(e.xyy * mapCase(q + e.xyy) + e.yyx * mapCase(q + e.yyx) + e.yxy * mapCase(q + e.yxy) + e.xxx * mapCase(q + e.xxx));",
    "      vec3 N = n; N.yz *= rxI; N.xz *= ryI;",
    "      float f2 = pow(1.0 - max(0.0, dot(N, -rd)), 2.4);",
    /* Almost nothing across the face and everything at the edges. A frosted
       case is a surface that tells you about its own shape, not about what
       is behind it -- and if it tells you much of anything across the middle
       it is a wall, which is exactly what the first version built. */
    "      vec3 cc = mix(cool, key, 0.45) * f2 * 1.35;",
    "      cc += key * pow(max(0.0, dot(N, normalize(L - rd))), 34.0) * 1.1;",
    "      cc = mix(cc, mix(cc, vec3(0.12, 0.14, 0.18), 0.4), u_light);",
    "      caseOut = vec4(cc, clamp(f2 * 0.62, 0.0, 0.55));",
    "    }",
    "  }",

    /* Case over letters over page. */
    "  vec3 col = typeOut.rgb * typeOut.a;",
    "  float alpha = typeOut.a;",
    "  col = caseOut.rgb * caseOut.a + col * (1.0 - caseOut.a);",
    "  alpha = caseOut.a + alpha * (1.0 - caseOut.a);",
    "  if (alpha <= 0.001) { o = vec4(0.0); return; }",
    "  o = vec4(col, alpha);",
    "}",
  ].join("\n");

  function sh(t, src) {
    var s = gl.createShader(t);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      if (window.console && console.warn) console.warn("[solid-type]", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  function boot() {
    host = document.getElementById("hero-solid");
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
    var v = sh(gl.VERTEX_SHADER, VS),
      f = sh(gl.FRAGMENT_SHADER, FS);
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
      if (window.console && console.warn) console.warn("[solid-type] link", gl.getProgramInfoLog(prog));
      host.remove();
      gl = null;
      return false;
    }
    prog.u = {};
    ["u_sdf", "u_bg", "u_time", "u_aspect", "u_light", "u_ptr"].forEach(function (n) {
      prog.u[n] = gl.getUniformLocation(prog, n);
    });

    sdfTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, sdfTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, SW, SH, 0, gl.RGBA, gl.UNSIGNED_BYTE, buildSDF());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    bgTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, bgTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    pad = document.createElement("canvas");
    pad.width = 256;
    pad.height = 160;
    pctx = pad.getContext("2d", { alpha: false });

    vao = gl.createVertexArray();
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
    cur.x += (ptr.x - cur.x) * 0.045;
    cur.y += (ptr.y - cur.y) * 0.045;

    /* What the glass refracts: the page's own background canvas, same source
       the nav takes. Copied small, because a refracted image is displaced and
       absorbed and cannot show detail anyway. */
    var src = document.querySelector("#site-field canvas") || document.getElementById("gl-stage");
    if (src && src.width > 4 && src !== canvas) {
      try {
        pctx.drawImage(src, 0, 0, src.width, src.height, 0, 0, 256, 160);
        gl.bindTexture(gl.TEXTURE_2D, bgTex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pad);
      } catch (e) {}
    }

    var dpr = Math.min(window.devicePixelRatio || 1, 1.4);
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
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sdfTex);
    gl.uniform1i(prog.u.u_sdf, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, bgTex);
    gl.uniform1i(prog.u.u_bg, 1);
    gl.uniform1f(prog.u.u_time, (now - t0) / 1000);
    gl.uniform1f(prog.u.u_aspect, w / h);
    gl.uniform1f(prog.u.u_light, document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0);
    gl.uniform2f(prog.u.u_ptr, cur.x, cur.y);
    gl.bindVertexArray(vao);
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
      return { live: live, gl: !!gl, grid: [SW, SH], size: canvas ? [canvas.width, canvas.height] : null };
    },
  };
})();
