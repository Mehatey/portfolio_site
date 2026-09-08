/* ─────────────────────────────────────────────────────────────────────────
   THINGS THAT WANDER THROUGH, RARELY

   Sid: "maybe every 1 or 2 min can we have some pixel birds fly over the
   screen, and also maybe a colour changing orb, and a pixel eye maybe every 3
   min. I really want these little easter eggs or hidden things which don't
   mean much but help tell my story. Simple small elements, nothing major."

   ── WHY THESE THREE AND NOT THREE NEW IDEAS ─────────────────────────────
   "Help tell my story" is the whole brief, and a thing invented from nothing
   cannot do that. Each of these is already somewhere else on the site: the
   birds cross the screensaver sky, the eye is what the mark's two pixels are
   a shorthand for, and the orb is the cursor's own glass seen from a
   distance. So a visitor who sees one has not been shown a decoration, they
   have caught a glimpse of something they will meet properly later. That is
   what makes it an easter egg rather than clutter.

   They are drawn as pixel art because the nav icons, the collectibles and the
   loader are pixel art. A smooth vector bird would be a fourth language.

   ── RARE ON PURPOSE, AND NEVER ON A TIMER YOU CAN FEEL ──────────────────
   The intervals are minutes apart and jittered by a large fraction, because
   anything regular stops being a surprise the second time you see it. Nothing
   appears in the first ninety seconds either: somebody who arrives, reads a
   case study and leaves should be able to miss all of it entirely. That is
   the point of a hidden thing.

   ── AND IT IS ALLOWED TO COST NOTHING ───────────────────────────────────
   One canvas for all three, and no rAF at all while nothing is on screen --
   the loop starts when something is scheduled in and stops when it leaves. It
   yields to the frame governor, stands down while the screensaver has the
   page, and sleeps with the tab.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  if (!window.matchMedia) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:6";
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
    ctx.imageSmoothingEnabled = false;
  }
  size();
  window.addEventListener("resize", size, { passive: true });

  /* Blues, light crimson and yellow only, per the palette rule. */
  var INK = ["150, 200, 255", "196, 226, 255", "244, 226, 168", "255, 168, 186"];
  var P = 3; /* one "pixel" */

  function px(x, y, w, h, c, a) {
    ctx.fillStyle = "rgba(" + c + "," + a.toFixed(3) + ")";
    ctx.fillRect(Math.round(x / P) * P, Math.round(y / P) * P, w * P, h * P);
  }

  var actors = [];
  var raf = 0,
    last = 0;

  /* ── THE BIRDS ────────────────────────────────────────────────────────
     A loose skein, each on its own flap clock so the group never beats
     together, drawn as three blocks whose vertical offset IS the wingbeat. */
  function birds() {
    var n = 3 + ((Math.random() * 3) | 0);
    var up = Math.random() < 0.5;
    var baseY = H * (0.12 + Math.random() * 0.3);
    var dir = Math.random() < 0.5 ? 1 : -1;
    var flock = [];
    for (var i = 0; i < n; i++) {
      flock.push({
        x: dir > 0 ? -60 - i * (30 + Math.random() * 50) : W + 60 + i * (30 + Math.random() * 50),
        y: baseY + (Math.random() - 0.5) * 90,
        v: (26 + Math.random() * 16) * dir,
        ph: Math.random() * 6.28,
        fl: 3 + Math.random() * 2.2,
        s: 0.8 + Math.random() * 0.5,
      });
    }
    return {
      life: 0,
      max: 26,
      draw: function (dt, t) {
        var alive = false;
        for (var i = 0; i < flock.length; i++) {
          var f = flock[i];
          f.x += f.v * dt;
          f.y += Math.sin(t * 0.5 + f.ph) * 6 * dt;
          /* ── WHY THIS IS NOT "IS IT ON SCREEN" ─────────────────────
             It was, and the flock was culled on its own first frame: birds
             spawn OFF screen by design so they fly in rather than appear, so
             on frame one not one of them is inside the viewport, the actor
             reported itself finished and was removed before anything could
             enter. They would never have been seen on the live site.

             The question is not "is it visible" but "has it finished its
             crossing", which is a different thing entirely for anything that
             enters from outside. */
          if (dir > 0 ? f.x < W + 60 : f.x > -60) alive = true;
          var lift = Math.sin(t * f.fl + f.ph) > 0 ? -1 : 1;
          var c = INK[1];
          var a = 0.5 * Math.min(1, this.life / 2) * Math.min(1, (this.max - this.life) / 3);
          /* Three blocks: body, and a wing each side offset by the beat. */
          px(f.x, f.y, 1, 1, c, a);
          px(f.x - P * 1.6 * f.s, f.y + lift * P, 1, 1, c, a * 0.85);
          px(f.x + P * 1.6 * f.s, f.y + lift * P, 1, 1, c, a * 0.85);
        }
        return alive;
      },
    };
  }

  /* ── THE ORB ──────────────────────────────────────────────────────────
     The cursor's glass, seen from far away and slowly changing its mind
     about what colour it is. Drawn as a pixel disc so it belongs to the
     same language as everything else here. */
  function orb() {
    var x = W * (0.12 + Math.random() * 0.76);
    var y = H * (0.2 + Math.random() * 0.5);
    var vx = (Math.random() - 0.5) * 14;
    var vy = -6 - Math.random() * 8;
    var r = 4 + Math.random() * 3;
    return {
      life: 0,
      max: 22,
      draw: function (dt, t) {
        x += vx * dt;
        y += vy * dt;
        var fade = Math.min(1, this.life / 3) * Math.min(1, (this.max - this.life) / 4);
        /* Cycles through the palette rather than through the whole wheel, so
           it can never arrive at a hue the site does not use. */
        var f = (t * 0.14) % INK.length;
        var c1 = INK[f | 0],
          c2 = INK[((f | 0) + 1) % INK.length];
        var mix = f % 1;
        var c = mix < 0.5 ? c1 : c2;
        for (var iy = -r; iy <= r; iy++) {
          for (var ix = -r; ix <= r; ix++) {
            var d = Math.sqrt(ix * ix + iy * iy);
            if (d > r) continue;
            var a = (1 - d / r) * 0.5 * fade;
            if (a < 0.02) continue;
            px(x + ix * P, y + iy * P, 1, 1, c, a);
          }
        }
        return y > -40;
      },
    };
  }

  /* ── THE EYE ──────────────────────────────────────────────────────────
     It opens, looks at you, and closes. The lid is the whole animation:
     nothing moves except how much of the eye there is. */
  function eye() {
    var x = W * (0.08 + Math.random() * 0.84);
    var y = H * (0.16 + Math.random() * 0.6);
    return {
      life: 0,
      max: 7,
      draw: function (dt, t) {
        var o = this.life / this.max;
        /* Open, hold, close. */
        var lid = o < 0.22 ? o / 0.22 : o > 0.72 ? Math.max(0, (1 - o) / 0.28) : 1;
        if (lid <= 0.01) return this.life < this.max;
        var w = 7;
        /* ── IT HAS TO READ ON A WHITE CARD TOO ────────────────────────
           The first build was a pale wash at 0.34 with no edge, which is
           fine over the dark page and a grey smudge over a product
           screenshot -- and these drift across the whole site, so half the
           time that is exactly what is behind them.

           So it is built like the mark's own face: a dark ground with a
           light form on it. The dark row underneath is what gives it an edge
           on any background, and the sclera above it is what makes it an eye
           rather than a blob. */
        for (var ix = -w; ix <= w; ix++) {
          /* Almond: full height in the middle, closing to a point at each
             corner, and the lid scales that height rather than fading it. */
          var edge = Math.round(3 * lid * Math.cos((ix / (w + 0.6)) * 1.45));
          if (edge < 0) continue;
          for (var iy = -edge; iy <= edge; iy++) {
            /* One pixel of shadow all the way round the form. */
            px(x + ix * P, y + iy * P, 1, 1, "10, 16, 28", 0.5 * lid);
          }
          for (var iy2 = -edge + (edge > 0 ? 1 : 0); iy2 <= edge - (edge > 0 ? 1 : 0); iy2++) {
            px(x + ix * P, y + iy2 * P, 1, 1, "232, 244, 255", 0.82 * lid);
          }
        }
        /* The pupil, centred on the eye rather than hung off its corner --
           px() takes a top-left, so it has to be stepped back by half its own
           size or it sits low and right, which is what made the first one
           look cross-eyed. It drifts, so the eye is looking rather than
           staring. */
        if (lid > 0.72) {
          var pd = Math.round(Math.sin(t * 0.5) * 2) * P;
          px(x + pd - P, y - P, 2, 2, "10, 16, 28", 0.92 * lid);
          px(x + pd - P, y - P, 1, 1, INK[0], 0.5 * lid);
        }
        return this.life < this.max;
      },
    };
  }

  function frame(now) {
    raf = 0;
    if (!last) last = now;
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    var t = now / 1000;

    ctx.clearRect(0, 0, W, H);

    /* The governor, and the screensaver: neither wants company. */
    var shed = (window.SidPerf && !window.SidPerf.ok()) || document.querySelector(".idle-drift.is-on");
    if (shed) {
      actors.length = 0;
      last = 0;
      return;
    }

    for (var i = actors.length - 1; i >= 0; i--) {
      var a = actors[i];
      a.life += dt;
      var keep = a.draw(dt, t) && a.life < a.max;
      if (!keep) actors.splice(i, 1);
    }

    if (actors.length) raf = requestAnimationFrame(frame);
    else {
      last = 0;
      ctx.clearRect(0, 0, W, H);
    }
  }

  function send(make) {
    if (document.hidden) return;
    if (window.SidPerf && !window.SidPerf.ok()) return;
    if (document.querySelector(".idle-drift.is-on")) return;
    if (document.getElementById("site-loader")) return;
    actors.push(make());
    if (!raf) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  }

  /* Jittered by a third either way, and nothing at all for the first ninety
     seconds. A visitor should be able to read a case study and leave without
     ever knowing these exist. */
  function schedule(make, everySec, firstSec) {
    var next = function () {
      var wait = everySec * (0.7 + Math.random() * 0.6) * 1000;
      setTimeout(function () {
        send(make);
        next();
      }, wait);
    };
    setTimeout(next, firstSec * 1000);
  }

  schedule(birds, 105, 92);
  schedule(orb, 145, 150);
  schedule(eye, 190, 220);

  /* ── A WAY TO SEE THEM WITHOUT WAITING THREE MINUTES ──────────────────
     Local only, and it is the reason this can be verified at all: the whole
     design is that nothing happens for ninety seconds and then rarely, which
     makes it impossible to screenshot honestly on a schedule. Never defined
     on the deployed site, so there is no hook for anybody to find and no
     debug surface shipped. Sid can preview them from the console too:
     SidDrift.birds(), SidDrift.orb(), SidDrift.eye(). */
  if (location.hostname === "127.0.0.1" || location.hostname === "localhost") {
    window.SidDrift = {
      birds: function () {
        send(birds);
      },
      orb: function () {
        send(orb);
      },
      eye: function () {
        send(eye);
      },
    };
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      actors.length = 0;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      ctx.clearRect(0, 0, W, H);
    }
  });
})();
