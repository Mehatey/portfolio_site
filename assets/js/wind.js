/* ─────────────────────────────────────────────────────────────────────────
   THE POINTER MOVES THE AIR

   Sid: "I don't want any of that pixel hover. Just remove that pixel hover and
   instead just make it a sort of wind or a light movement."

   TWO ATTEMPTS AT THIS BRIEF FAILED THE SAME WAY. First a row of thirty-six
   coloured squares above the footer, then a field of them lit around the
   cursor. Both were MARKS: things drawn at positions, switching on and off.
   However carefully a grid of squares is animated it still reads as a
   readout, which is why the note in pixel-field.js arguing it was "the honest
   version of pixel art" was wrong — the fault was never the arrangement, it
   was that the answer had discrete state at all.

   Wind has none. What is drawn here is a few dozen filaments of light being
   carried by a flow field, and the pointer is a disturbance IN that flow
   rather than a thing that switches anything on. Move across the page and the
   air keeps moving after you; stop and it settles. There is no rest state to
   toggle, so there is nothing that can read as a control.

   ── WHY A FLOW FIELD AND NOT PARTICLES-TOWARD-THE-CURSOR ────────────────
   Particles that chase a cursor are a cursor effect: they point at you, and
   the eye reads the cursor as the subject. A flow field is a property of the
   SPACE — the filaments follow it whether or not anybody is there, and the
   pointer just bends it locally. That is the difference between a page that
   reacts to you and a page that has weather in it.

   The field is curl noise, which is divergence free: filaments carried by the
   curl of a potential never pile into sinks, so the movement stays even
   instead of draining into a few spots. That is one line of maths doing the
   work that would otherwise need per-particle rules.

   ── COST ────────────────────────────────────────────────────────────────
   One canvas, 70 filaments, one rAF that stops when nothing is moving. Each
   filament is a short trail of its own last positions, drawn as one stroked
   path, so the whole layer is 70 paths a frame at z-index 0 behind the page.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  if (!window.matchMedia) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  var N = 70;
  var TRAIL = 9;
  var SPEED = 0.42;
  /* How far the pointer's disturbance reaches, and how hard it pushes. Light
     on both: this is a draught, not a fan. */
  var GUST = 240;
  var GUST_FORCE = 0.9;

  var cv = document.createElement("canvas");
  cv.className = "wind-layer";
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:fixed;inset:0;z-index:0;pointer-events:none;width:100%;height:100%";
  var ctx = cv.getContext("2d");
  if (!ctx) return;
  document.body.appendChild(cv);

  var W = 0,
    H = 0,
    dpr = 1;
  function size() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size();
  window.addEventListener("resize", size, { passive: true });

  /* A cheap value noise. Two of these sampled a little apart give the curl,
     and the curl is the flow. Precision is irrelevant here -- what matters is
     that it is smooth and that it is the same every frame. */
  function hash(x, y) {
    var n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  }
  function noise(x, y) {
    var xi = Math.floor(x),
      yi = Math.floor(y);
    var xf = x - xi,
      yf = y - yi;
    var u = xf * xf * (3 - 2 * xf),
      v = yf * yf * (3 - 2 * yf);
    var a = hash(xi, yi),
      b = hash(xi + 1, yi),
      c = hash(xi, yi + 1),
      d = hash(xi + 1, yi + 1);
    return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
  }
  function curl(x, y, t) {
    var e = 0.6;
    var s = 0.0016;
    var n1 = noise((x + e) * s, (y + t) * s);
    var n2 = noise((x - e) * s, (y + t) * s);
    var n3 = noise(x * s, (y + e + t) * s);
    var n4 = noise(x * s, (y - e + t) * s);
    return [(n3 - n4) / (2 * e), -(n1 - n2) / (2 * e)];
  }

  /* The palette is the site's own: the mark's nature colours and the accent
     family, at very low alpha. No orange, the same decision as everywhere
     else. */
  var TINTS = ["120,226,220", "96,190,240", "148,156,202", "138,176,150", "196,224,246"];

  var parts = [];
  function seed() {
    parts = [];
    for (var i = 0; i < N; i++) {
      var x = Math.random() * W,
        y = Math.random() * H;
      parts.push({
        x: x,
        y: y,
        px: [],
        tint: TINTS[(Math.random() * TINTS.length) | 0],
        a: 0.05 + Math.random() * 0.16,
        w: 0.5 + Math.random() * 1.1,
      });
    }
  }
  seed();
  window.addEventListener("resize", seed, { passive: true });

  var mx = -9999,
    my = -9999,
    lastMove = 0;
  var raf = 0,
    t = 0;

  window.addEventListener(
    "pointermove",
    function (e) {
      mx = e.clientX;
      my = e.clientY;
      lastMove = performance.now();
      wake();
    },
    { passive: true }
  );

  /* While the page is scrolling the air steps back. Reading is the one thing
     it must never compete with. */
  var scrolling = 0;
  window.addEventListener(
    "scroll",
    function () {
      scrolling = performance.now();
      wake();
    },
    { passive: true }
  );

  function frame(now) {
    raf = 0;
    /* Decoration yields first. See assets/js/motion-budget.js: fourteen rAF
       loops on the home page turn a mid-range laptop into 13fps, and wind is
       atmosphere. Cleared rather than frozen, so it leaves nothing behind. */
    if (window.SidPerf && !window.SidPerf.ok()) {
      ctx.clearRect(0, 0, W, H);
      return;
    }
    t += 0.35;

    /* Global strength: full when the pointer has moved recently and the page
       is still, fading out otherwise. An idle page has no wind and costs
       nothing, which is the whole reason this can sit on every route. */
    var sinceMove = now - lastMove;
    var sinceScroll = now - scrolling;
    var life = Math.max(0, 1 - sinceMove / 2600) * (sinceScroll < 500 ? 0.25 : 1);
    if (life <= 0.005) {
      ctx.clearRect(0, 0, W, H);
      return;
    }

    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round";

    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      var f = curl(p.x, p.y, t);
      var vx = f[0] * SPEED,
        vy = f[1] * SPEED;

      /* The gust. A push directly away from the pointer, falling off with
         distance -- so moving across the page opens a wake behind the cursor
         rather than dragging a clump along with it. */
      var dx = p.x - mx,
        dy = p.y - my;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < GUST && d > 0.001) {
        var k = (1 - d / GUST) * GUST_FORCE;
        vx += (dx / d) * k;
        vy += (dy / d) * k;
      }

      p.px.push(p.x, p.y);
      if (p.px.length > TRAIL * 2) p.px.splice(0, 2);

      p.x += vx;
      p.y += vy;
      /* Wrapped, so the field never empties and no filament has to be
         respawned in view. */
      if (p.x < -20) p.x = W + 20;
      if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20;
      if (p.y > H + 20) p.y = -20;

      if (p.px.length < 4) continue;
      /* A wrap puts a straight line across the whole window, so a segment
         longer than a fifth of the screen is a teleport and the trail is
         dropped rather than drawn. */
      if (Math.abs(p.px[p.px.length - 2] - p.px[0]) > W * 0.2 || Math.abs(p.px[p.px.length - 1] - p.px[1]) > H * 0.2) {
        p.px.length = 0;
        continue;
      }

      ctx.beginPath();
      ctx.moveTo(p.px[0], p.px[1]);
      for (var j = 2; j < p.px.length; j += 2) ctx.lineTo(p.px[j], p.px[j + 1]);
      ctx.strokeStyle = "rgba(" + p.tint + "," + (p.a * life).toFixed(3) + ")";
      ctx.lineWidth = p.w;
      ctx.stroke();
    }

    raf = requestAnimationFrame(frame);
  }

  function wake() {
    if (!raf) raf = requestAnimationFrame(frame);
  }
})();
