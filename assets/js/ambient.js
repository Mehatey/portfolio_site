/* ═══════════════════════════════════════════════════════════════════════════
   WEATHER

   Sid: "once in a while on my site can we have some realistic rain and thunder
   and some sunlight and some pixel birds which fly over the screen. like little
   little creative things which others might miss or not do." And: "once in a
   while a creative lens flare or some random nifty visual fun things which dont
   overwhelm but the viewer feels like hmm this is pretty nice site nuanced."

   THE WHOLE DESIGN IS IN "ONCE IN A WHILE"

   The failure mode for this feature is not that an effect looks bad. It is
   that it looks good the first time and is wallpaper by the fourth, and a
   portfolio is a page people scroll twice. So the constraints come before the
   drawing:

     · ONE EVENT AT A TIME, ever. Two of these at once is weather.
     · RARE. First one lands 40 to 90 seconds in, and the gap after that is
       three to seven minutes. A visitor who reads one case study sees perhaps
       two of these; a visitor who skims sees none, which is correct.
     · IT NEVER RUNS WHEN NOBODY IS LOOKING. Hidden tab, reduced motion, or a
       coarse pointer and it does not schedule at all.
     · IT COSTS NOTHING AT REST. The canvas is created for an event and removed
       when it ends. Idle cost is one setTimeout. This matters: the same person
       asking for this asked, on the same day, why the site was laggy.

   WHY NO RAIN AND NO THUNDER HERE

   He asked for both and both are deliberately absent. Rain over a page of
   photographs and video is either invisible or it is a filter over somebody's
   work, and thunder is sound that arrives without being asked for -- the site
   has a sound toggle now (see sound.js) and anything audible belongs behind
   it. The three that landed are the three that can be quiet.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  if (!window.matchMedia) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  /* A phone is held close, runs on a battery, and has no pointer to be
     surprised beside. This is a desktop grace note. */
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  var host = null;
  var raf = 0;
  var timer = 0;

  function stage() {
    var cv = document.createElement("canvas");
    cv.className = "ambient-layer";
    cv.setAttribute("aria-hidden", "true");
    cv.width = innerWidth;
    cv.height = innerHeight;
    cv.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;z-index:7;pointer-events:none;" +
      /* Under the nav (9000) and the grade (8000), over the page. Screen blend
         so everything drawn here can only ADD light -- nothing this file does
         is allowed to darken somebody's photograph. */
      "mix-blend-mode:screen;";
    document.body.appendChild(cv);
    host = cv;
    return cv.getContext("2d");
  }

  function clear() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (host && host.parentNode) host.parentNode.removeChild(host);
    host = null;
  }

  /* ── BIRDS ───────────────────────────────────────────────────────────────
     Five to nine of them, in a loose skein rather than a formation: each bird
     carries its own vertical offset and its own wingbeat phase, and the flock
     drifts on one slow sine so the whole line breathes. Drawn as filled rects
     on a pixel grid with no anti-aliasing, because "pixel birds" is the ask
     and a smooth bird at this size is a smudge.

     The wing is two rects that meet at the body and swap height. That is the
     entire animation and at 3px it is enough -- at this scale a bird is a
     silhouette that changes shape, and anything more is detail nobody can
     resolve travelling at 40px a second. */
  function birds(ctx, done) {
    var n = 5 + Math.floor(Math.random() * 5);
    var px = 3;
    var dir = Math.random() < 0.5 ? 1 : -1;
    var baseY = innerHeight * (0.12 + Math.random() * 0.26);
    var speed = 0.55 + Math.random() * 0.35;
    var flock = [];
    for (var i = 0; i < n; i++) {
      flock.push({
        x: dir > 0 ? -60 - i * (34 + Math.random() * 26) : innerWidth + 60 + i * (34 + Math.random() * 26),
        y: baseY + (i % 3) * 16 + Math.random() * 14,
        phase: Math.random() * Math.PI * 2,
        beat: 0.16 + Math.random() * 0.07,
      });
    }
    var t = 0;
    var life = 0;

    function frame() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      t += 1;
      life += 1;
      var alive = false;
      /* Fades in over the first second and out over the last, so a bird never
         pops into existence at the edge of the screen. */
      var fade = Math.min(1, life / 60) * Math.min(1, (900 - life) / 90);
      if (fade <= 0) {
        done();
        return;
      }
      ctx.fillStyle = "rgba(214, 226, 240," + (0.34 * fade).toFixed(3) + ")";
      for (var i = 0; i < flock.length; i++) {
        var b = flock[i];
        b.x += speed * dir;
        var drift = Math.sin(t * 0.008 + b.phase) * 0.5;
        b.y += drift * 0.6;
        if (b.x > -80 && b.x < innerWidth + 80) alive = true;
        var wing = Math.sin(t * b.beat + b.phase);
        var up = Math.round(wing * 2);
        var x = Math.round(b.x / px) * px;
        var y = Math.round(b.y / px) * px;
        /* body, then a wing either side at opposite heights */
        ctx.fillRect(x, y, px, px);
        ctx.fillRect(x - px * 2, y - up * px, px * 2, px);
        ctx.fillRect(x + px, y + up * px, px * 2, px);
      }
      if (!alive && life > 120) {
        done();
        return;
      }
      raf = requestAnimationFrame(frame);
    }
    frame();
  }

  /* ── A SHAFT OF LIGHT ────────────────────────────────────────────────────
     A single soft diagonal band that crosses the screen once and leaves. It is
     drawn as a rotated gradient rather than a radial "sun", because a sun is
     an object and asks to be looked at; a shaft is a condition of the room and
     reads as the light having changed rather than as something having been
     added to the page. */
  function shaft(ctx, done) {
    var life = 0;
    var span = 520;
    var angle = -0.42 + Math.random() * 0.16;
    var warm = Math.random() < 0.5;
    var from = -innerWidth * 0.5;
    var to = innerWidth * 1.5;

    function frame() {
      life += 1;
      var p = life / span;
      if (p >= 1) {
        done();
        return;
      }
      /* In and out on one sine, so it has no edges in time either. */
      var a = Math.sin(p * Math.PI) * 0.1;
      var x = from + (to - from) * p;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.save();
      ctx.translate(x, innerHeight * 0.5);
      ctx.rotate(angle);
      var g = ctx.createLinearGradient(-260, 0, 260, 0);
      var tint = warm ? "255,236,205" : "205,228,255";
      g.addColorStop(0, "rgba(" + tint + ",0)");
      g.addColorStop(0.5, "rgba(" + tint + "," + a.toFixed(3) + ")");
      g.addColorStop(1, "rgba(" + tint + ",0)");
      ctx.fillStyle = g;
      ctx.fillRect(-260, -innerHeight * 1.4, 520, innerHeight * 2.8);
      ctx.restore();
      raf = requestAnimationFrame(frame);
    }
    frame();
  }

  /* ── A FLARE ─────────────────────────────────────────────────────────────
     The lens artefact, not the lamp: a bright core with two ghosts on the
     opposite side of centre, which is what an anamorphic flare actually does
     and is the part that makes it read as a lens rather than as a glow. It
     travels a short distance and dies. */
  function flare(ctx, done) {
    var life = 0;
    var span = 320;
    var x0 = innerWidth * (0.15 + Math.random() * 0.7);
    var y0 = innerHeight * (0.12 + Math.random() * 0.3);
    var dx = (Math.random() - 0.5) * 220;
    var dy = 40 + Math.random() * 90;

    function blob(cx, cy, r, a, tint) {
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, "rgba(" + tint + "," + a.toFixed(3) + ")");
      g.addColorStop(1, "rgba(" + tint + ",0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    function frame() {
      life += 1;
      var p = life / span;
      if (p >= 1) {
        done();
        return;
      }
      var a = Math.sin(p * Math.PI);
      var x = x0 + dx * p;
      var y = y0 + dy * p;
      var cx = innerWidth / 2;
      var cy = innerHeight / 2;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      blob(x, y, 150, 0.13 * a, "255,246,224");
      /* The ghosts mirror through the centre of the frame at fractional
         distances. That reflection is the whole tell. */
      blob(cx + (cx - x) * 0.45, cy + (cy - y) * 0.45, 62, 0.05 * a, "168,214,255");
      blob(cx + (cx - x) * 0.85, cy + (cy - y) * 0.85, 96, 0.035 * a, "255,196,168");
      raf = requestAnimationFrame(frame);
    }
    frame();
  }

  var EVENTS = [birds, birds, shaft, flare];

  function run() {
    if (document.hidden) {
      schedule();
      return;
    }
    var ctx = stage();
    var pick = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    pick(ctx, function () {
      clear();
      schedule();
    });
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(run, 180000 + Math.random() * 240000);
  }

  /* The first one is sooner than the rest, so somebody who stays on one page
     for a minute gets to see that this happens at all. */
  timer = setTimeout(run, 40000 + Math.random() * 50000);

  addEventListener(
    "resize",
    function () {
      if (host) {
        host.width = innerWidth;
        host.height = innerHeight;
      }
    },
    { passive: true }
  );

  /* A tab that comes back after an hour should not fire instantly because a
     timer matured while nobody was there. */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      clear();
      clearTimeout(timer);
    } else {
      schedule();
    }
  });
})();
