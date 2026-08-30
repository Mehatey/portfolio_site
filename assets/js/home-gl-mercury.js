/* ═══════════════════════════════════════════════════════════════════════════
   01 · MERCURY — TYPE AS LIQUID METAL

   Sid: "cant u be more creative with click and hover and 3d text show me the
   highest quality scroll or web ready interactive."

   Fair. The glass version was a solid object that turned. It was correct and
   it was inert -- you could not do anything to it, and a hero you cannot
   touch is a picture.

   WHAT THIS IS

   The sentence, raymarched as a body of liquid metal, with fourteen droplets
   in orbit around it. The droplets and the letters are joined by a SMOOTH
   MINIMUM rather than a hard union, which is the whole idea: where two
   surfaces come near each other the field blends, so a droplet approaching a
   letter stretches toward it, necks, and merges -- and pulls away with a
   tail. That is metaball behaviour, and it is what makes a shape read as
   liquid rather than as geometry.

     smin(a, b, k) = mix(b, a, h) - k*h*(1-h),  h = clamp(.5 + .5(b-a)/k)

   One line. Everything else here is lighting.

   WHAT YOU CAN DO TO IT

     HOVER   the droplets are drawn toward the cursor and the surface under
             it swells -- the body deforms where your attention is
     CLICK   an impulse throws the droplets outward and ripples the letters;
             they fall back and re-merge on their own springs
     SCROLL  the whole body melts downward and the letters lose cohesion,
             so leaving the hero is the sentence liquefying

   WHY IT LOOKS LIKE METAL AND NOT LIKE PLASTIC

   Three things, and skipping any one of them is what makes chrome look like
   grey rubber:

     · REFLECTION, not diffuse. Polished metal has almost no diffuse term.
       Nearly all of what you see is the environment, so a procedural room --
       a warm bar above, a cool floor below, a horizon between -- is sampled
       along the reflected ray. That gradient IS the material.
     · FRESNEL toward white at grazing angles, which is why the rim of a
       chrome object is always brightest.
     · ANISOTROPY in the highlight, faintly, so the specular is not a
       perfect circle. A perfectly round highlight reads as a snooker ball.
   ═══════════════════════════════════════════════════════════════════════════ */
window.__mercury = (function () {
  "use strict";

  var SW = 768,
    SH = 224;
  var BLOBS = 14;

  var host = null,
    canvas = null,
    gl = null,
    prog = null,
    sdfTex = null,
    vao = null,
    raf = 0,
    t0 = 0,
    last = 0,
    live = false;
  var ptr = { x: 0, y: 0 },
    cur = { x: 0, y: 0 },
    hit = 0;
  /* Droplet state lives on the CPU: fourteen bodies is nothing to integrate
     and it keeps the impulse logic readable. */
  var bx = new Float32Array(BLOBS * 3),
    bv = new Float32Array(BLOBS * 3),
    bhome = new Float32Array(BLOBS * 3),
    brad = new Float32Array(BLOBS),
    uni = new Float32Array(BLOBS * 4);

  /* ── the distance field ───────────────────────────────────────────────
     Same 8SSEDT as the glass version: a bitmap of the sentence swept twice
     to give every cell its true distance to the nearest edge. A raymarcher
     needs distance, and a rasterised glyph only has coverage. */
  function edt(mask, w, h) {
    var INF = 1e9;
    var gx = new Float32Array(w * h),
      gy = new Float32Array(w * h),
      d = new Float32Array(w * h);
    function init(inside) {
      for (var i = 0; i < w * h; i++) {
        var on = inside ? mask[i] > 0 : mask[i] === 0;
        gx[i] = gy[i] = on ? 0 : INF;
        d[i] = on ? 0 : INF;
      }
    }
    function cmp(i, ox, oy, dx, dy) {
      var j = i + oy * w + ox;
      if (j < 0 || j >= w * h) return;
      var nx = gx[j] + dx,
        ny = gy[j] + dy,
        nd = nx * nx + ny * ny;
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
    var out = new Float32Array(w * h);
    /* inside minus outside. The other way round makes the background solid
       and the letters holes -- which is exactly the bug that cost an hour on
       the glass version, so it is written down here too. */
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
    /* Tracked out, and a size down. A smooth minimum bridges anything that
       comes within its blend radius, so letters set tight fuse into each
       other the moment the material is liquid -- the spacing is part of the
       physics here, not only the typography. */
    x.letterSpacing = "6px";
    x.font = "600 " + Math.round(SW * 0.092) + "px " + f;
    x.fillText("PRODUCT", SW / 2, SH * 0.31);
    x.fillText("DESIGNER", SW / 2, SH * 0.69);
    var px = x.getImageData(0, 0, SW, SH).data;
    var mask = new Uint8Array(SW * SH);
    for (var i = 0; i < SW * SH; i++) mask[i] = px[i * 4] > 128 ? 1 : 0;
    var sd = edt(mask, SW, SH);
    var buf = new Uint8Array(SW * SH * 4);
    for (var j = 0; j < SW * SH; j++) {
      var v = Math.max(0, Math.min(1, sd[j] / 26 + 0.5));
      var q = Math.round(v * 255);
      buf[j * 4] = q;
      buf[j * 4 + 1] = q;
      buf[j * 4 + 2] = q;
      buf[j * 4 + 3] = 255;
    }
    return buf;
  }

  var VS = [
    "#version 300 es",
    "const vec2 P[3] = vec2[3](vec2(-1.,-1.), vec2(3.,-1.), vec2(-1.,3.));",
    "out vec2 v_uv;",
    "void main(){ vec2 p = P[gl_VertexID]; v_uv = p; gl_Position = vec4(p,0.,1.); }",
  ].join("\n");

  var FS = [
    "#version 300 es",
    "precision highp float;",
    "in vec2 v_uv;",
    "uniform sampler2D u_sdf;",
    "uniform vec4 u_blob[" + BLOBS + "];",
    "uniform float u_time, u_aspect, u_light, u_melt, u_hit;",
    "uniform vec2 u_ptr;",
    "out vec4 o;",

    /* Polynomial smooth minimum. The single line that turns a union of
       shapes into a body of liquid. */
    "float smin(float a, float b, float k){",
    "  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);",
    "  return mix(b, a, h) - k * h * (1.0 - h);",
    "}",

    "float sdText(vec3 p){",
    "  vec2 uv = p.xy * vec2(0.5, -0.5 * 3.43) + 0.5;",
    /* Hard margin. Outside the glyph box the field must be large and
       positive or the march finds a surface at the texture clamp and draws a
       box around the whole object. */
    "  if (uv.x < 0.02 || uv.x > 0.98 || uv.y < 0.02 || uv.y > 0.98) return 0.7;",
    "  float d2 = (texture(u_sdf, uv).r - 0.5) * 0.185;",
    /* The letters have real thickness and a rounded profile, so the light
       wraps around their edges instead of hitting a wall. */
    /* ── ROUND THE PROFILE, NOT THE SILHOUETTE ─────────────────────────
       Chrome needs curvature to be chrome: the material IS the variation in
       what it reflects, and a flat front face gives every fragment the same
       normal and therefore the same sample of the room. The first pass was a
       flat slab and the letters came back a uniform dark grey next to
       droplets that looked like real metal.

       The obvious fix -- subtract a big rounding from the whole field -- is
       what the second pass did, and it INFLATES the shape in every direction
       at once. At the radius needed to curve the strokes, the gaps between
       adjacent letters closed and "PRODUCT DESIGNER" fused into one mass.

       This is the standard rounded extrusion instead. The 2D field is
       shrunk by r first, so the silhouette comes back to where it started,
       and the rounding is then applied to the corner where the 2D edge meets
       the z cap. The stroke gets a domed cross-section, the letters stay
       apart, and the normal still sweeps the whole room across the width of
       every stem. */
    "  float r = 0.05;",
    "  float dIn = d2 + r;",
    "  vec2 w = vec2(dIn, abs(p.z) - 0.028);",
    "  return min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - r;",
    "}",

    "float map(vec3 p){",
    /* Scroll melts it: the body sags and thins as the hero leaves. */
    "  vec3 q = p;",
    "  q.y += u_melt * 0.35 * (1.0 - abs(q.x) * 0.4);",
    "  float d = sdText(q) + u_melt * 0.05;",
    /* The droplets, each merged into the body with a smooth minimum. The
       blend radius grows with the droplet's size so a big one necks over a
       longer distance -- which is what surface tension actually does. */
    "  for (int i = 0; i < " + BLOBS + "; i++) {",
    "    vec4 b = u_blob[i];",
    "    float sd = length(p - b.xyz) - b.w;",
    "    d = smin(d, sd, 0.085 + b.w * 0.5);",
    "  }",
    /* A swell under the cursor. The body reacts where the attention is, and
       it is a real displacement of the field rather than a highlight painted
       on top. */
    "  float pd = length(p.xy - u_ptr);",
    "  d -= exp(-pd * pd * 6.0) * 0.045;",
    /* The click ripple, travelling outward from the centre and dying. */
    "  d += sin(pd * 22.0 - u_hit * 9.0) * exp(-pd * 2.5) * u_hit * 0.03;",
    "  return d;",
    "}",

    "vec3 nrm(vec3 p){",
    "  vec2 e = vec2(1.0, -1.0) * 0.0016;",
    "  return normalize(e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) + e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));",
    "}",

    /* ── THE ROOM THE METAL REFLECTS ──────────────────────────────────────
       Polished metal has almost no diffuse component: nearly everything you
       see in it is its surroundings. So there is a procedural environment --
       a warm bar overhead, a cool floor below, a bright horizon where they
       meet -- sampled along the reflected ray. This gradient is the material;
       without it chrome renders as grey rubber. */
    "vec3 env(vec3 r){",
    "  float up = r.y * 0.5 + 0.5;",
    "  vec3 sky = mix(vec3(0.06, 0.08, 0.13), vec3(0.55, 0.68, 0.92), pow(up, 0.7));",
    "  vec3 gnd = mix(vec3(0.04, 0.04, 0.06), vec3(0.16, 0.14, 0.13), pow(1.0 - up, 0.5));",
    "  vec3 c = mix(gnd, sky, smoothstep(0.42, 0.58, up));",
    /* The horizon line, which is the thing a chrome surface always shows and
       the strongest single cue that it is polished. */
    "  c += vec3(1.0, 0.93, 0.82) * exp(-pow((up - 0.5) * 26.0, 2.0)) * 0.7;",
    /* One warm strip lamp overhead, drawn narrow so it travels across the
       surface as a hard streak. */
    "  c += vec3(1.0, 0.86, 0.68) * pow(max(0.0, r.y), 8.0) * 1.4;",
    "  c += vec3(0.30, 0.46, 0.72) * pow(max(0.0, -r.y), 5.0) * 0.35;",
    "  return c;",
    "}",

    "void main(){",
    "  vec2 uv = v_uv;",
    "  uv.x *= u_aspect;",
    "  vec3 ro = vec3(0.0, 0.0, 2.35);",
    "  vec3 rd = normalize(vec3(uv * 0.46, -1.0));",
    "  float t = 0.0;",
    "  float hitS = 0.0;",
    "  vec3 p = ro;",
    "  for (int i = 0; i < 90; i++) {",
    "    p = ro + rd * t;",
    "    float d = map(p);",
    "    if (d < 0.0008) { hitS = 1.0; break; }",
    /* Under-relaxed, because a smooth minimum is not a true distance -- it
       under-estimates near a blend, and a full step overshoots into the
       surface and punches holes through every neck. */
    "    t += d * 0.62;",
    "    if (t > 5.0) break;",
    "  }",
    "  if (hitS < 0.5) { o = vec4(0.0); return; }",

    "  vec3 N = nrm(p);",
    "  vec3 V = -rd;",
    "  vec3 R = reflect(rd, N);",
    "  vec3 col = env(R);",

    /* Fresnel toward white. The rim of a chrome object is always the
       brightest part of it. */
    "  float fres = pow(1.0 - max(0.0, dot(N, V)), 4.0);",
    "  col = mix(col * 0.82, vec3(1.0), fres * 0.72);",

    /* A slightly anisotropic highlight. A perfectly circular specular reads
       as a snooker ball; stretching it along one axis reads as brushed,
       poured, moving metal. */
    "  vec3 L = normalize(vec3(-0.42, 0.68, 0.60));",
    "  vec3 H = normalize(L + V);",
    "  float nh = max(0.0, dot(N, H));",
    "  float aniso = pow(nh, 90.0) + pow(nh, 20.0) * 0.18 * (1.0 - abs(N.x));",
    "  col += vec3(1.0, 0.93, 0.84) * aniso * 1.5;",

    /* Contact darkening in the necks. Where the field is blended the surface
       is concave, and a concave patch of metal sees less of the room -- this
       is a cheap ambient occlusion and it is what makes a merge look like a
       merge rather than two shapes overlapping. */
    "  float ao = clamp(map(p + N * 0.06) / 0.06, 0.0, 1.0);",
    "  col *= 0.35 + 0.65 * ao;",

    "  col = mix(col, mix(col, vec3(0.72, 0.74, 0.78), 0.45), u_light);",
    "  float a = clamp(0.86 + fres * 0.4, 0.0, 1.0);",
    "  o = vec4(col * a, a);",
    "}",
  ].join("\n");

  function sh(t, src) {
    var s = gl.createShader(t);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      if (window.console && console.warn) console.warn("[mercury]", gl.getShaderInfoLog(s));
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
      if (window.console && console.warn) console.warn("[mercury] link", gl.getProgramInfoLog(prog));
      host.remove();
      gl = null;
      return false;
    }
    prog.u = {};
    ["u_sdf", "u_time", "u_aspect", "u_light", "u_ptr", "u_melt", "u_hit", "u_blob"].forEach(function (n) {
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

    /* Droplets on an ellipse around the sentence, sized on a seeded sequence
       so no two are alike and the arrangement is identical on every visit. */
    for (var i = 0; i < BLOBS; i++) {
      var a = (i / BLOBS) * Math.PI * 2;
      var rr = 0.62 + ((i * 0.6180339887) % 1) * 0.34;
      bhome[i * 3] = Math.cos(a) * rr * 1.62;
      bhome[i * 3 + 1] = Math.sin(a) * rr * 0.66;
      bhome[i * 3 + 2] = (((i * 0.7548776662) % 1) - 0.5) * 0.14;
      bx[i * 3] = bhome[i * 3];
      bx[i * 3 + 1] = bhome[i * 3 + 1];
      bx[i * 3 + 2] = bhome[i * 3 + 2];
      /* Smaller and more varied. At 0.045-0.10 they were the size of the
         letters and sat on top of the sentence; the point is that they visit
         it, not that they hide it. */
      brad[i] = 0.026 + ((i * 0.3819660113) % 1) * 0.032;
    }

    vao = gl.createVertexArray();
    /* ── ON THE WINDOW, NOT THE HOST ────────────────────────────────────
       .hero-solid carries pointer-events: none, because it covers the whole
       hero and must not swallow clicks meant for the nav or the links under
       it. So an element listener on it never fires -- measured: hover did
       nothing and a click left the impulse term at exactly 0.

       Listening on the window and converting into the host's box gets the
       interaction back without the canvas intercepting anything. */
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return true;
  }

  function onMove(e) {
    var r = host.getBoundingClientRect();
    if (!r.width) return;
    ptr.x = ((e.clientX - r.left) / r.width - 0.5) * 2 * (r.width / r.height) * 0.46 * 2.35;
    ptr.y = -((e.clientY - r.top) / r.height - 0.5) * 2 * 0.46 * 2.35;
  }

  function onDown(e) {
    /* Only within the hero. A click on the footer should not detonate an
       object three screens above it. */
    var r = host.getBoundingClientRect();
    if (e.clientY < r.top || e.clientY > r.bottom) return;
    /* An impulse outward from the centre, and the ripple term in the shader
       is lit for a beat. The droplets come back on their own springs, so the
       sentence re-forms without anything scheduling it. */
    hit = 1;
    for (var i = 0; i < BLOBS; i++) {
      var dx = bx[i * 3],
        dy = bx[i * 3 + 1];
      var d = Math.hypot(dx, dy) + 0.001;
      bv[i * 3] += (dx / d) * 2.6;
      bv[i * 3 + 1] += (dy / d) * 2.6;
      bv[i * 3 + 2] += (((i * 0.7548776662) % 1) - 0.5) * 1.4;
    }
  }

  function step(h) {
    for (var i = 0; i < BLOBS; i++) {
      var i3 = i * 3;
      /* A spring home, plus attraction to the cursor. The attraction is
         capped by distance so a droplet across the frame is not yanked --
         what should happen is that the two or three nearest gather, which
         reads as the body noticing you. */
      var ax = (bhome[i3] - bx[i3]) * 14,
        ay = (bhome[i3 + 1] - bx[i3 + 1]) * 14,
        az = (bhome[i3 + 2] - bx[i3 + 2]) * 14;
      var dx = cur.x - bx[i3],
        dy = cur.y - bx[i3 + 1];
      var d2 = dx * dx + dy * dy;
      var pull = 9 / (1 + d2 * 22);
      ax += dx * pull;
      ay += dy * pull;
      /* A slow orbit so a still frame is never completely dead. */
      ax += -bx[i3 + 1] * 0.5;
      ay += bx[i3] * 0.5;
      bv[i3] += ax * h;
      bv[i3 + 1] += ay * h;
      bv[i3 + 2] += az * h;
      var damp = 4.2;
      bv[i3] -= bv[i3] * damp * h;
      bv[i3 + 1] -= bv[i3 + 1] * damp * h;
      bv[i3 + 2] -= bv[i3 + 2] * damp * h;
      bx[i3] += bv[i3] * h;
      bx[i3 + 1] += bv[i3 + 1] * h;
      bx[i3 + 2] += bv[i3 + 2] * h;
    }
    if (hit > 0) hit = Math.max(0, hit - h * 1.6);
  }

  function frame(now) {
    raf = 0;
    if (!gl || !live) return;
    var dt = Math.min(0.05, (now - last) / 1000) || 0.016;
    last = now;
    cur.x += (ptr.x - cur.x) * (1 - Math.exp(-dt * 6));
    cur.y += (ptr.y - cur.y) * (1 - Math.exp(-dt * 6));
    /* Fixed sub-steps, sixth time in this codebase and the same reason: a
       stiff spring on a variable frame delta settles at a different rate on
       a 60Hz and a 120Hz display. */
    var acc = dt,
      guard = 0;
    while (acc > 0 && guard < 8) {
      var h = Math.min(1 / 120, acc);
      step(h);
      acc -= h;
      guard++;
    }

    for (var i = 0; i < BLOBS; i++) {
      uni[i * 4] = bx[i * 3];
      uni[i * 4 + 1] = bx[i * 3 + 1];
      uni[i * 4 + 2] = bx[i * 3 + 2];
      uni[i * 4 + 3] = brad[i];
    }

    /* Half resolution. A ninety-step march with fourteen smooth minima in
       the inner loop is the most expensive thing on this site; the surface
       has no high-frequency detail, so the resample is invisible and it buys
       back three quarters of the fragments. */
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5) * 0.55;
    var w = Math.max(1, Math.round(host.clientWidth * dpr));
    var h2 = Math.max(1, Math.round(host.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h2) {
      canvas.width = w;
      canvas.height = h2;
    }
    var melt = 0;
    var hp = window.__heroP;
    if (typeof hp === "number") melt = Math.max(0, Math.min(1, hp));

    gl.viewport(0, 0, w, h2);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(prog);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sdfTex);
    gl.uniform1i(prog.u.u_sdf, 0);
    gl.uniform1f(prog.u.u_time, (now - t0) / 1000);
    gl.uniform1f(prog.u.u_aspect, w / h2);
    gl.uniform1f(prog.u.u_light, document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0);
    gl.uniform1f(prog.u.u_melt, melt);
    gl.uniform1f(prog.u.u_hit, hit);
    gl.uniform2f(prog.u.u_ptr, cur.x, cur.y);
    gl.uniform4fv(prog.u.u_blob, uni);
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
      t0 = last = performance.now();
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
      return { live: live, gl: !!gl, blobs: BLOBS, hit: +hit.toFixed(2), size: canvas ? [canvas.width, canvas.height] : null };
    },
  };
})();
