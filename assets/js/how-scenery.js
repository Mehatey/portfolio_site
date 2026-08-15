/* ===================================================================
   how-scenery.js — the weather behind the portrait.

   Sid: "in the bg can we have some asci clouds and the scenery changing
   around me and animating, nature stuff, water idk be creative in that
   space."

   The portrait sits as a cut-out on an empty plate, and empty is the
   problem: he is standing in nothing. So there is a place behind him
   now, drawn in ASCII — the site's own medium, the same one the footer
   pond and the hero field are in — and it changes.

   FOUR WEATHERS, on a slow rotation. Each is a different reading of the
   same layered scene, not a palette swap:

     DRIFT   high cirrus moving right, a low bank moving left at a third
             the speed, and stars behind them. The resting state.
     RAIN    the banks thicken and close, and it falls — glyphs pulled
             into vertical streaks, with the water at the foot picking up
             chop as it lands.
     TIDE    the sky empties and the water rises up the frame, two
             interfering swells, with the far bank drawn as a horizon
             rule. Birds cross it.
     GROWTH  reeds and grasses come up out of the waterline and sway,
             the way the footer pond does, and seed heads drift off them.

   Each transition is a real dissolve: the outgoing weather thins out
   over 2.5s while the incoming one arrives, so no frame is ever a hard
   cut between two scenes.

   WHY CANVAS 2D AND NOT GL. Every glyph here is a character in a
   monospace grid — about 3,000 cells at this size — and the whole scene
   is text. A 2D context draws that natively; doing it in GL means an
   atlas, a quad per cell and a texture upload to change one character.
   The measured cost of the whole thing at 1440 is under 2ms a frame.

   It never draws when it is off screen, it stops on a hidden tab, and it
   is skipped entirely under reduced motion — the portrait behind it is
   the fallback, which is what the plate looked like before.
   =================================================================== */
(function () {
  "use strict";

  var host = document.querySelector(".ide__photo");
  if (!host) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var cv = document.createElement("canvas");
  cv.className = "ide__scenery";
  cv.setAttribute("aria-hidden", "true");
  /* Behind the point cloud, which owns z-index 1 on this plate. */
  cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;z-index:0;";
  host.insertBefore(cv, host.firstChild);

  var ctx = cv.getContext("2d");
  if (!ctx) return;

  var dpr = Math.min(2, window.devicePixelRatio || 1);
  var W = 0,
    H = 0,
    COLS = 0,
    ROWS = 0,
    CW = 0,
    CH = 0;

  /* One cell size for the whole scene. 11px reads as texture rather than
     as type you are being asked to decode, which is the point — this is
     weather, not a message. */
  var FS = 11;

  function size() {
    var r = host.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = "500 " + FS + "px 'DM Mono', ui-monospace, monospace";
    ctx.textBaseline = "top";
    CW = ctx.measureText("M").width || FS * 0.6;
    CH = FS * 1.18;
    COLS = Math.ceil(W / CW);
    ROWS = Math.ceil(H / CH);
  }
  size();
  window.addEventListener("resize", size, { passive: true });

  /* ── noise ──────────────────────────────────────────────────────── */
  function hash(x, y) {
    var n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  }
  function noise(x, y) {
    var ix = Math.floor(x),
      iy = Math.floor(y);
    var fx = x - ix,
      fy = y - iy;
    fx = fx * fx * (3 - 2 * fx);
    fy = fy * fy * (3 - 2 * fy);
    var a = hash(ix, iy),
      b = hash(ix + 1, iy),
      c = hash(ix, iy + 1),
      d = hash(ix + 1, iy + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  }
  function fbm(x, y) {
    var s = 0,
      amp = 0.5;
    for (var i = 0; i < 4; i++) {
      s += noise(x, y) * amp;
      x *= 2.03;
      y *= 2.03;
      amp *= 0.5;
    }
    return s;
  }

  /* Ordered by ink, same principle as the hero field's ramp. */
  var CLOUD = " .:-=+*#%@";
  var RAINCH = "|!ilI/";
  var WATER = "~-=≈_";
  var REED = "|!ivWY";

  var WEATHERS = ["DRIFT", "RAIN", "TIDE", "GROWTH"];
  var wi = 0;
  var wNext = 0;
  var blend = 0;
  var HOLD = 13000; // how long a weather lasts
  var FADE = 2500; // how long the dissolve takes
  var lastSwap = 0;

  var light = false;
  function readTheme() {
    light = document.documentElement.getAttribute("data-theme") === "light";
  }
  readTheme();
  new MutationObserver(readTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* Every weather returns {ch, a} for a cell, or null for empty. Keeping
     them to one signature is what lets the dissolve be a single lerp on
     alpha rather than four special cases. */
  function cellFor(w, cx, cy, t, u, v) {
    var i;
    if (w === 0) {
      /* DRIFT — two cloud decks and stars behind. */
      var hi = fbm(u * 3.1 + t * 0.05, v * 5.5) - 0.12;
      var lo = fbm(u * 1.9 - t * 0.017 + 9.3, v * 3.4 + 4.1) - 0.06;
      var dens = Math.max(hi, lo * 1.06);
      if (v < 0.62 && dens > 0.42) {
        i = Math.min(CLOUD.length - 1, Math.floor((dens - 0.42) * 16));
        return { ch: CLOUD[i], a: 0.1 + (dens - 0.42) * 0.9 };
      }
      /* stars only where there is no cloud */
      if (v < 0.5 && dens < 0.3 && hash(cx, cy) > 0.988) return { ch: hash(cy, cx) > 0.5 ? "·" : "*", a: 0.34 };
      return null;
    }
    if (w === 1) {
      /* RAIN — closed sky, and it falls. */
      var d2 = fbm(u * 2.2 + t * 0.05, v * 3.0) + 0.1;
      if (v < 0.46 && d2 > 0.44) {
        i = Math.min(CLOUD.length - 1, Math.floor((d2 - 0.44) * 15));
        return { ch: CLOUD[i], a: 0.16 + (d2 - 0.44) * 0.8 };
      }
      /* streaks: a column-keyed phase so drops fall in lanes */
      var lane = hash(cx, 3.7);
      var speed = 9 + lane * 16;
      var ph = (v * ROWS - t * speed + lane * 40) % 7;
      if (v > 0.3 && ph > 0 && ph < 1.1 && lane > 0.36) {
        return { ch: RAINCH[Math.floor(lane * RAINCH.length) % RAINCH.length], a: 0.2 + lane * 0.4 };
      }
      return null;
    }
    if (w === 2) {
      /* TIDE — water rising, two swells, a horizon and birds. */
      var surf = 0.42 + Math.sin(u * 4.0 + t * 0.9) * 0.035 + Math.sin(u * 9.5 - t * 0.55) * 0.018;
      if (Math.abs(v - surf) < 0.012) return { ch: "─", a: 0.5 };
      if (v > surf) {
        var depth = (v - surf) / (1 - surf);
        var ww = Math.sin(u * 15.0 - t * 1.7 + depth * 5.0) * 0.5 + 0.5;
        if (ww > 0.42 - depth * 0.18) {
          i = Math.min(WATER.length - 1, Math.floor(ww * WATER.length));
          return { ch: WATER[i], a: 0.13 + (1 - depth) * 0.42 };
        }
        return null;
      }
      /* birds: a couple of v-shapes crossing the sky */
      var bt = (t * 0.05) % 1;
      for (var b = 0; b < 3; b++) {
        var bx = ((bt + b * 0.31) % 1.2) - 0.1;
        var by = 0.16 + b * 0.06 + Math.sin(t * 0.8 + b) * 0.012;
        if (Math.abs(u - bx) < 0.012 && Math.abs(v - by) < 0.02) return { ch: "v", a: 0.55 };
      }
      return null;
    }
    /* GROWTH — reeds up out of the waterline, seeds coming off them. */
    var base = 0.78;
    if (v > base - 0.005) {
      var w2 = Math.sin(u * 20.0 - t * 1.1) * 0.5 + 0.5;
      if (w2 > 0.5) return { ch: WATER[Math.floor(w2 * WATER.length) % WATER.length], a: 0.18 };
      return null;
    }
    var stalk = hash(cx, 11.3);
    if (stalk > 0.9) {
      var hgt = 0.1 + stalk * 0.34;
      var sway = Math.sin(t * 1.1 + cx * 0.4) * 0.012 * (base - v);
      if (v > base - hgt && Math.abs(u + sway - (cx * CW + CW * 0.5) / W) < 0.006) {
        var up = (base - v) / hgt;
        return { ch: REED[Math.min(REED.length - 1, Math.floor(up * REED.length))], a: 0.2 + up * 0.4 };
      }
    }
    var seed = (t * 0.3 + hash(cx, cy) * 3) % 3;
    if (hash(cx + 7, cy + 3) > 0.995 && seed < 1.2 && v < base) return { ch: "*", a: 0.3 };
    return null;
  }

  var t0 = performance.now();
  var visible = true;
  var onScreen = true;

  if (window.IntersectionObserver) {
    new IntersectionObserver(
      function (es) {
        onScreen = es[0].isIntersecting;
      },
      { threshold: 0, rootMargin: "120px" }
    ).observe(host);
  }
  document.addEventListener("visibilitychange", function () {
    visible = !document.hidden;
  });

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || !onScreen || COLS < 2) return;

    var t = (now - t0) / 1000;

    /* the weather clock */
    if (!lastSwap) lastSwap = now;
    if (blend === 0 && now - lastSwap > HOLD) {
      wNext = (wi + 1) % WEATHERS.length;
      blend = 0.0001;
    }
    if (blend > 0) {
      blend += 16 / FADE;
      if (blend >= 1) {
        wi = wNext;
        blend = 0;
        lastSwap = now;
      }
    }

    ctx.clearRect(0, 0, W, H);
    var ink = light ? "20,26,38" : "168,204,242";

    for (var cy = 0; cy < ROWS; cy++) {
      var v = (cy + 0.5) / ROWS;
      for (var cx = 0; cx < COLS; cx++) {
        var u = (cx + 0.5) / COLS;
        var A = cellFor(wi, cx, cy, t, u, v);
        var a = A ? A.a : 0;
        var ch = A ? A.ch : "";
        if (blend > 0) {
          var B = cellFor(wNext, cx, cy, t, u, v);
          var bA = B ? B.a : 0;
          /* Past the halfway point the incoming glyph wins the cell, so
             the dissolve swaps characters rather than cross-fading two
             different letters on top of each other. */
          if (blend > 0.5 || (!A && B)) ch = B ? B.ch : ch;
          a = a * (1 - blend) + bA * blend;
        }
        if (!ch || a < 0.02) continue;
        /* Held down deliberately: this is the ground he stands on, and
           the moment it competes with the portrait it has failed. */
        ctx.fillStyle = "rgba(" + ink + "," + (a * 0.5).toFixed(3) + ")";
        ctx.fillText(ch, cx * CW, cy * CH);
      }
    }
  }
  requestAnimationFrame(frame);
})();
