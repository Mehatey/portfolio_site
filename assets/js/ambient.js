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

   RAIN AND THUNDER, ON THE SECOND PASS

   Both were held back once, and the reason still holds -- it shaped how they
   are built rather than whether. Rain over a page of photographs is either
   invisible or it is a filter sitting on somebody's work, and thunder is
   sound arriving unrequested.

   So the rain is not a filter. It is a narrow diagonal band of streaks,
   masked at both edges, placed left or right of centre and never across the
   middle where the reading is: a squall passing the window rather than
   weather applied to the document. And the thunder is a call into sound.js,
   which returns immediately unless the visitor has turned sound on. A storm
   with the toggle off is a silent one, and it still looks right.
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

  /* ── A SQUALL ────────────────────────────────────────────────────────────
     A band of rain crossing the window on a diagonal, not a full-screen
     overlay. The distinction is the whole reason this one is allowed to
     exist: rain drawn over everything is a filter sitting on somebody's
     photographs, and rain drawn in a band is weather passing the window.

     The streaks are lines rather than dots because at any believable fall
     speed a raindrop IS a line -- the eye integrates it, and a camera would
     too. Each one carries its own length and speed so the band has depth,
     and the whole thing is masked at both ends so it has no edges.

     The flashes are the interesting part. A lightning flash is not a fade: it
     is two or three strikes a few frames apart, and the thunder arrives after
     it -- late by however far away the storm is. Both come from the same
     `far` value, so a distant flash is dimmer AND its thunder is later and
     duller, which is the only thing that makes a storm read as having a
     position rather than being an effect. */
  function squall(ctx, done) {
    var life = 0;
    var span = 900;
    var far = Math.random();
    /* The band sits left or right of centre, never across it. */
    var side = Math.random() < 0.5 ? 0 : 1;
    var bandW = innerWidth * (0.3 + Math.random() * 0.16);
    var bandX = side ? innerWidth - bandW - innerWidth * 0.04 : innerWidth * 0.04;
    var slant = 0.22 + Math.random() * 0.1;
    var drops = [];
    var N = 90;
    for (var i = 0; i < N; i++) {
      drops.push({
        x: Math.random(),
        y: Math.random(),
        len: 12 + Math.random() * 26,
        v: 0.011 + Math.random() * 0.014,
      });
    }
    /* Two or three strikes, each a cluster of one to three flashes. */
    var strikes = [];
    var nStrikes = 1 + Math.floor(Math.random() * 2);
    for (var k = 0; k < nStrikes; k++) {
      strikes.push({ at: 120 + Math.random() * (span - 360), fired: false });
    }
    var flash = 0;

    function frame() {
      life += 1;
      if (life >= span) {
        done();
        return;
      }
      /* One envelope for the whole squall so it arrives and leaves. */
      var pres = Math.min(1, life / 120) * Math.min(1, (span - life) / 160);
      ctx.clearRect(0, 0, innerWidth, innerHeight);

      for (var k = 0; k < strikes.length; k++) {
        var st = strikes[k];
        if (!st.fired && life >= st.at) {
          st.fired = true;
          flash = 1;
          /* Sound is optional and always late. Light first, then the sound
             catches up -- 300ms at the near end, two and a half seconds at
             the far. */
          if (typeof window.__thunder === "function") {
            setTimeout(
              function () {
                window.__thunder(far);
              },
              300 + far * 2200
            );
          }
        }
      }

      if (flash > 0.001) {
        /* Not a wash over the page: a broad soft glow at the top of the band,
           so the light has a source. */
        var fg = ctx.createRadialGradient(bandX + bandW * 0.5, -60, 0, bandX + bandW * 0.5, -60, innerHeight * 1.1);
        var fa = flash * (0.14 - far * 0.08) * pres;
        fg.addColorStop(0, "rgba(226,238,255," + fa.toFixed(4) + ")");
        fg.addColorStop(1, "rgba(226,238,255,0)");
        ctx.fillStyle = fg;
        ctx.fillRect(0, 0, innerWidth, innerHeight);
        /* Sharp decay with a bounce, which is what a multi-stroke flash does
           and what separates lightning from a lamp being switched on. */
        flash *= life % 3 === 0 ? 0.42 : 0.78;
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(bandX, 0, bandW, innerHeight);
      ctx.clip();
      ctx.lineWidth = 1;
      for (var i = 0; i < drops.length; i++) {
        var d = drops[i];
        d.y += d.v;
        if (d.y > 1.1) {
          d.y = -0.1;
          d.x = Math.random();
        }
        var x = bandX + d.x * bandW;
        var y = d.y * (innerHeight + 120) - 60;
        /* Fades at both ends of the band so the squall has no vertical edge. */
        var edge = Math.min(1, Math.min(d.x, 1 - d.x) / 0.22);
        ctx.strokeStyle = "rgba(198,220,248," + (0.2 * pres * edge).toFixed(4) + ")";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - d.len * slant, y + d.len);
        ctx.stroke();
      }
      ctx.restore();
      raf = requestAnimationFrame(frame);
    }
    frame();
  }

  var EVENTS = [birds, birds, shaft, flare, squall];

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

  /* A hook, not a HUD. Sid's standing rule is that nothing on the screen may
     explain itself to the visitor, and these effects fire once every few
     minutes at random -- which makes them close to untestable by waiting.
     window.__weather("squall") renders one on demand. It draws nothing that a
     real event would not draw, so what QA sees is what a visitor gets. */
  window.__weather = function (name) {
    var map = { birds: birds, shaft: shaft, flare: flare, squall: squall };
    var fn = map[name] || EVENTS[Math.floor(Math.random() * EVENTS.length)];
    clear();
    clearTimeout(timer);
    var ctx = stage();
    fn(ctx, function () {
      clear();
      schedule();
    });
    return name || "random";
  };

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
