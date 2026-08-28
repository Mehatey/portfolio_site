/* ═══════════════════════════════════════════════════════════════════════════
   04 · THE LINE — A RAYMARCHED FIELD

   Sid: "really work on it make 5 distinct proper threejs webgpu idk use
   creative stuff come on."

   Every direction now renders by a genuinely different method. This is the
   raymarcher: no geometry at all, no texture, no particles. One fullscreen
   triangle, and every pixel walks a ray into a distance field until it hits
   something. The shape it hits is defined by arithmetic, so there is nothing
   to download and the silhouette is exact at any resolution.

   WHY THIS TECHNIQUE FOR THIS DIRECTION

   The line is the direction with no photography in it: no figure, no reel,
   no archive, nothing below the fold but type. So the one thing behind the
   words should be the one thing on this site that is not an image of
   anything -- a form that exists only as a formula. It is the honest
   backdrop for a page whose argument is "you already know what you are
   looking for".

   WHAT IT DRAWS

   A slowly folding gyroid, cut by a sphere. A gyroid is a triply periodic
   minimal surface -- sin(x)cos(y) + sin(y)cos(z) + sin(z)cos(x) -- which is
   three lines of maths for an object nobody can quite parse, and it moves
   through itself as it turns rather than merely rotating. The sphere cut is
   what stops it tiling out to the horizon and reading as wallpaper.

   THE COST, AND HOW IT IS KEPT DOWN

   A raymarcher is fragment-bound: cost is pixels times steps. Three things
   hold it:

     · 48 steps, hard capped, with an early break once the ray is inside
       tolerance. Beyond about 50 the extra steps buy detail that a soft,
       slowly moving surface has nothing to do with.
     · rendered at 0.6 scale and stretched back up by CSS. The surface has
       no high-frequency detail on it, so the resample costs nothing visible
       and saves nearly two thirds of the fragments.
     · the loop stops when the direction is not showing.

   Measured on this machine at 1440x900: 0.6 scale is 862x540 = 465k pixels
   at up to 48 steps.
   ═══════════════════════════════════════════════════════════════════════════ */
window.__lineField = (function () {
  "use strict";

  var host = null,
    gl = null,
    prog = null,
    canvas = null,
    raf = 0,
    t0 = 0,
    live = false;
  var ptr = { x: 0, y: 0 },
    cur = { x: 0, y: 0 };
  var SCALE = 0.6;

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
    "uniform float u_time, u_aspect, u_light;",
    "uniform vec2 u_ptr;",
    "out vec4 o;",

    "mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }",

    /* The field. Gyroid intersected with a sphere: max() of the two is the
       intersection, and the 0.42 scales the gyroid's value back toward a
       true distance -- a raw gyroid is not a distance function and marching
       it at full stride overshoots and produces holes. */
    "float map(vec3 p){",
    "  vec3 q = p;",
    "  q.xz *= rot(u_time * 0.08 + u_ptr.x * 0.35);",
    "  q.xy *= rot(u_time * 0.05 + u_ptr.y * 0.2);",
    "  float g = dot(sin(q * 1.6), cos(q.yzx * 1.6));",
    "  float shell = length(p) - 1.05;",
    "  return max(g * 0.42, shell);",
    "}",

    /* Central differences for the normal. Four taps rather than six: the
       tetrahedral trick, which is the standard saving and is exact enough
       for a surface this soft. */
    "vec3 nrm(vec3 p){",
    "  vec2 e = vec2(1.0, -1.0) * 0.0025;",
    "  return normalize(",
    "    e.xyy * map(p + e.xyy) + e.yyx * map(p + e.yyx) +",
    "    e.yxy * map(p + e.yxy) + e.xxx * map(p + e.xxx));",
    "}",

    "void main(){",
    "  vec2 uv = v_uv;",
    "  uv.x *= u_aspect;",
    "  vec3 ro = vec3(0.0, 0.0, 5.4);",
    "  vec3 rd = normalize(vec3(uv * 0.52, -1.0));",
    "  float t = 0.0;",
    "  float hit = 0.0;",
    "  for (int i = 0; i < 48; i++) {",
    "    vec3 p = ro + rd * t;",
    "    float d = map(p);",
    "    if (d < 0.004) { hit = 1.0; break; }",
    "    t += d * 0.72;",
    "    if (t > 7.0) break;",
    "  }",
    "  vec3 col = vec3(0.0);",
    "  float a = 0.0;",
    "  if (hit > 0.5) {",
    "    vec3 p = ro + rd * t;",
    "    vec3 n = nrm(p);",
    "    vec3 L = normalize(vec3(-0.42, 0.68, 0.60));",
    /* The same key and fill the whole site is lit by, so this belongs to it.
       A rim term does most of the visible work: a minimal surface reads by
       its edges, not by its facing planes. */
    "    float dif = max(0.0, dot(n, L));",
    "    float rim = pow(1.0 - max(0.0, dot(n, -rd)), 2.4);",
    "    vec3 warm = vec3(1.00, 0.86, 0.68);",
    "    vec3 cool = vec3(0.30, 0.46, 0.72);",
    /* ── IT IS THE BACKDROP, NOT THE SUBJECT ──────────────────────────
       First pass filled the frame at full strength and drowned the input,
       which is exactly backwards: this is the one direction whose argument
       is quiet, and it had the loudest object on the site behind it. The
       form is smaller, further away, and about a third of the brightness --
       present enough that you notice something is turning, never enough to
       compete with a line of type. */
    "    col = cool * 0.10 + warm * dif * 0.13 + mix(cool, warm, 0.5) * rim * 0.34;",
    /* Falls off with distance so the far side of the shell sinks rather than
       tiling brightly to the edge of the frame. */
    "    col *= smoothstep(7.0, 2.6, t);",
    "    a = clamp(dot(col, vec3(0.7)) * 1.6, 0.0, 1.0) * 0.42;",
    "  }",
    /* On cream it inverts: the same form, drawn as ink, so the direction
       reads in both themes without a second shader. */
    "  col = mix(col, vec3(0.08, 0.10, 0.14) * (0.35 + a), u_light);",
    /* And it falls away at the edges of the frame, so the form sits in the
       middle distance rather than being cropped by the window. */
    "  float vig = smoothstep(1.25, 0.35, length(v_uv * vec2(u_aspect, 1.0)) * 0.62);",
    "  a *= vig;",
    "  o = vec4(col * a, a);",
    "}",
  ].join("\n");

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      if (window.console && console.warn) console.warn("[line-field]", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  function boot() {
    host = document.getElementById("hero-line-gl");
    if (!host) return false;
    canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);
    try {
      gl = canvas.getContext("webgl2", { alpha: true, antialias: false, premultipliedAlpha: true });
    } catch (e) {}
    if (!gl) {
      /* No field. The direction is a text interface and works perfectly
         without a backdrop -- that is the point of it. */
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
      if (window.console && console.warn) console.warn("[line-field] link", gl.getProgramInfoLog(prog));
      host.remove();
      gl = null;
      return false;
    }
    prog.u = {};
    ["u_time", "u_aspect", "u_ptr", "u_light"].forEach(function (n) {
      prog.u[n] = gl.getUniformLocation(prog, n);
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
    var w = Math.max(1, Math.round(host.clientWidth * SCALE));
    var h = Math.max(1, Math.round(host.clientHeight * SCALE));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    cur.x += (ptr.x - cur.x) * 0.05;
    cur.y += (ptr.y - cur.y) * 0.05;
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(prog);
    gl.uniform1f(prog.u.u_time, (now - t0) / 1000);
    gl.uniform1f(prog.u.u_aspect, w / h);
    gl.uniform2f(prog.u.u_ptr, cur.x, cur.y);
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
      return { live: live, size: canvas ? [canvas.width, canvas.height] : null, gl: !!gl };
    },
  };
})();
