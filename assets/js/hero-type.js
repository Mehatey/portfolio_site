/* ═══════════════════════════════════════════════════════════════════════════
   THE HEADLINE FLOATS

   Sid: "I want some interesting typography animation on hover on the main
   text. I was thinking people should be break individual letters and then move
   them around the page like they were floating on water ... each and
   individual should feel lively ... that particular section needs to lock
   people in."

   THE BUG THIS ALSO FIXES

   _includes/live_type.html splits every large heading on the site into
   per-character spans and drives each character's weight off the pointer. On
   the home page it has never once worked. Measured: at 1.5s the hero carried
   31 .lt-c spans; by 4s it carried zero. The typewriter writes
   `ink.textContent = txt.slice(0, pos)` on every frame it types, and assigning
   textContent destroys every child element — so the splitter ran, the
   typewriter overwrote it a beat later, and the one page the effect was
   designed for was the one page that never had it.

   So the ordering inverts. The typewriter finishes, says so, and this file
   takes the finished line apart. Nothing races.

   WHY THIS IS NOT live_type WITH MORE NUMBERS

   live_type moves one axis: weight. It is deliberately cheap because it runs
   on sixteen case-study headings as well. This runs on one heading, on the
   page a visitor lands on, and it is the thing that has to hold them — so it
   carries a small fluid simulation instead:

     · BUOYANCY. At rest every letter rises and falls on its own slow sine,
       phase-shifted by its x position so the bob travels along the line as a
       wave rather than pulsing as a block. This is the half that matters
       most: the line is alive before anyone touches it, which is what makes
       someone touch it.

     · WAKE. The pointer carries velocity, and letters are pushed along that
       velocity, not merely away from the cursor. A radial shove reads as a
       magnet; a shove biased along the direction of travel reads as
       something moving THROUGH water. The swirl term is perpendicular to
       travel, which is what curls the letters behind the pointer.

     · SURFACE TENSION. Letters spring home on a soft constant with heavy
       damping, so they drift back and overshoot slightly rather than
       snapping. A letter that returns exactly to its mark and stops has no
       mass.

     · TILT. Rotation is driven by horizontal velocity, so a letter leans
       into its own movement and rights itself as it settles.

   The letters never leave the line's reading order, and the layout never
   moves: each .lt-c is an inline-block, so its box stays where the browser
   put it and only its transform travels. The sentence is always readable,
   which matters more here than the effect does — this headline is the one
   thing a recruiter has to be able to take in.

   Off for coarse pointers and reduced motion, where there is no cursor to
   answer and no version of "floating" worth having.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var hero = document.getElementById("hero");
  if (!hero) return;
  if (window.matchMedia && window.matchMedia("(hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)").matches) return;

  /* ── the numbers ────────────────────────────────────────────────────────
     Collected so the feel is tunable without reading the loop. */
  /* Tuned against a measured sweep rather than by eye. The first pass ran
     PUSH 4200 against SPRING 116, and the steady state of that pair is
     PUSH/SPRING = 36px at the very centre of the field — which fell to about
     14px measured across a real cursor path, i.e. a wobble. The ratio is what
     sets the displacement, so both numbers moved: 9000 over 70 puts the
     ceiling at 128px and lets MAX do the limiting instead of the spring. */
  var R = 265, // px. How far the pointer reaches.
    PUSH = 9000, // radial shove strength
    /* WAKE was 3.4 and it was the wrong term to lead with. At that strength
       the pointer's own velocity beat the radial shove, so letters were
       DRAGGED ALONG behind the cursor instead of parting around it — they
       piled up in the direction of travel and the left clause collapsed into
       an unreadable clump. Water pushed by a hand parts and closes; it does
       not follow the hand. Radial leads, wake seasons. */
    WAKE = 1.3, // how much of the pointer's own velocity is transferred
    SWIRL = 0.6, // perpendicular component — the curl behind the cursor
    SPRING = 70, // pull home
    DAMP = 5.2, // velocity bleed. High: water, not rubber.
    /* 120 let two letters occupy the same space. A headline is legible or it
       is decoration, and this one is the page's only claim. */
    MAX = 72, // px. Displacement ceiling, so the line stays a line.
    /* A surface moves up and down more readily than side to side, and so does
       reading: vertical displacement keeps letters in their own columns and
       the sentence in its own order, where horizontal displacement is what
       makes neighbours collide. Biased rather than clamped, so it still
       carries sideways when genuinely shoved. */
    ANI_X = 0.68,
    ANI_Y = 1.22,
    BOB_A = 3.2, // px of idle rise and fall
    BOB_HZ = 0.42, // idle cycles a second
    W_BASE = 350,
    W_PEAK = 760;

  var letters = [];
  var raf = 0,
    last = 0,
    running = false;

  /* Pointer, its smoothed velocity, and whether it is anywhere near us. */
  var px = -9999,
    py = -9999,
    ppx = -9999,
    ppy = -9999,
    pvx = 0,
    pvy = 0,
    near = 0;

  /* ── TAKING THE LINE APART ──────────────────────────────────────────────
     Words stay whole (an inline-block is a break opportunity, and a headline
     that can break between any two letters will), and only the characters
     inside a word become their own boxes. Same structure live_type builds, so
     the CSS that styles .lt-c and .lt-w is shared rather than duplicated. */
  function split(host) {
    if (host.getAttribute("data-hero-split") === "1") return;
    host.setAttribute("data-hero-split", "1");
    var lines = host.querySelectorAll(".tw__ink");
    for (var i = 0; i < lines.length; i++) {
      var ink = lines[i];
      var text = ink.textContent;
      if (!text) continue;
      var frag = document.createDocumentFragment();
      var parts = text.split(/(\s+)/);
      for (var p = 0; p < parts.length; p++) {
        if (!parts[p]) continue;
        if (/^\s+$/.test(parts[p])) {
          frag.appendChild(document.createTextNode(" "));
          continue;
        }
        var word = document.createElement("span");
        word.className = "lt-w";
        for (var c = 0; c < parts[p].length; c++) {
          var sp = document.createElement("span");
          sp.className = "lt-c";
          sp.textContent = parts[p][c];
          word.appendChild(sp);
          letters.push({
            el: sp,
            hx: 0,
            hy: 0, // home, in viewport coords
            ox: 0,
            oy: 0, // current offset
            vx: 0,
            vy: 0,
            rot: 0,
            w: W_BASE,
            /* One stable phase per letter. Seeded off its index rather than
               off Math.random so the wave is the same on every load and the
               page does not open differently for no reason. */
            ph: letters.length * 0.7,
          });
          sp.style.fontVariationSettings = '"wght" ' + W_BASE;
        }
        frag.appendChild(word);
      }
      ink.textContent = "";
      ink.appendChild(frag);
    }
  }

  /* Homes are measured, never computed. A letter's resting position is
     wherever the browser laid it out, and that changes with the viewport, the
     font loading and the hero's own scroll transform — so it is re-read on
     resize and on scroll rather than assumed. Measured with the transform
     temporarily cleared, or every measurement bakes in the last frame's
     displacement and the letters walk away from the line over time. */
  function measure() {
    for (var i = 0; i < letters.length; i++) {
      var L = letters[i];
      L.el.style.transform = "";
      var r = L.el.getBoundingClientRect();
      L.hx = r.left + r.width / 2;
      L.hy = r.top + r.height / 2;
    }
    apply();
  }

  function apply() {
    for (var i = 0; i < letters.length; i++) {
      var L = letters[i];
      L.el.style.transform = "translate3d(" + L.ox.toFixed(2) + "px," + L.oy.toFixed(2) + "px,0) rotate(" + L.rot.toFixed(2) + "deg)";
    }
  }

  function frame(now) {
    raf = 0;
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    var t = now / 1000;

    /* Pointer velocity, smoothed. The raw frame-to-frame delta is spiky
       enough to make the wake stutter. */
    if (ppx > -9998) {
      pvx += ((px - ppx) / Math.max(dt, 0.001) - pvx) * 0.25;
      pvy += ((py - ppy) / Math.max(dt, 0.001) - pvy) * 0.25;
    }
    ppx = px;
    ppy = py;

    var moving = false;

    for (var i = 0; i < letters.length; i++) {
      var L = letters[i];

      /* ── buoyancy ──────────────────────────────────────────────────────
         The phase is offset by the letter's own x, so the rise and fall
         travels along the line instead of the whole headline breathing at
         once. Amplitude is tiny on purpose: at rest this should read as the
         type being afloat, not as the type animating. */
      var bob = Math.sin(t * BOB_HZ * 6.28318 + L.ph + L.hx * 0.006) * BOB_A;
      var bobX = Math.cos(t * BOB_HZ * 4.1 + L.ph) * (BOB_A * 0.35);

      /* ── the wake ──────────────────────────────────────────────────────
         Distance is taken from the letter's HOME, not its current position.
         Using the current one makes the field chase letters it has already
         displaced and the whole line runs away from the cursor. */
      var dx = L.hx - px,
        dy = L.hy - py;
      var d = Math.sqrt(dx * dx + dy * dy);
      var fx = 0,
        fy = 0;

      if (d < R) {
        /* Smooth falloff, strongest at the pointer, nothing at the rim. */
        var f = 1 - d / R;
        f = f * f * (3 - 2 * f);
        var inv = 1 / Math.max(d, 12);

        /* radial: out of the way */
        fx += dx * inv * f * PUSH * dt;
        fy += dy * inv * f * PUSH * dt;

        /* wake: carried along with the pointer's own travel. This is the
           term that makes it water rather than magnetism. */
        fx += pvx * f * WAKE * dt;
        fy += pvy * f * WAKE * dt;

        /* swirl: perpendicular to travel, so letters curl in behind. */
        fx += -pvy * f * SWIRL * dt;
        fy += pvx * f * SWIRL * dt;
      }

      /* ── surface tension ───────────────────────────────────────────────
         Spring toward home with heavy damping. Both are per-second and
         scaled by dt, so a 120Hz panel and a 60Hz one settle identically. */
      fx += -L.ox * SPRING * dt;
      fy += -L.oy * SPRING * dt;

      L.vx = (L.vx + fx) * Math.max(0, 1 - DAMP * dt);
      L.vy = (L.vy + fy) * Math.max(0, 1 - DAMP * dt);

      L.ox += L.vx * dt * ANI_X;
      L.oy += L.vy * dt * ANI_Y;

      /* Ceiling, applied radially so a letter never squares off against the
         limit on one axis while the other keeps going. */
      var m = Math.sqrt(L.ox * L.ox + L.oy * L.oy);
      if (m > MAX) {
        L.ox *= MAX / m;
        L.oy *= MAX / m;
      }

      /* Tilt into the movement, and right itself as it settles. */
      L.rot += (L.vx * 0.02 - L.rot) * Math.min(1, dt * 7);

      /* Weight follows proximity, same axis live_type uses. Written only
         when it has actually changed by a visible amount — a variable-font
         axis rewritten every frame on sixty letters is the single most
         expensive thing this loop could do. */
      var tw = d < R ? W_BASE + (W_PEAK - W_BASE) * (1 - d / R) * (1 - d / R) : W_BASE;
      L.w += (tw - L.w) * Math.min(1, dt * 9);
      var wr = Math.round(L.w / 8) * 8;
      if (wr !== L.wr) {
        L.wr = wr;
        L.el.style.fontVariationSettings = '"wght" ' + wr;
      }

      var ox = L.ox + bobX,
        oy = L.oy + bob;
      L.el.style.transform = "translate3d(" + ox.toFixed(2) + "px," + oy.toFixed(2) + "px,0) rotate(" + L.rot.toFixed(2) + "deg)";

      if (Math.abs(L.vx) > 0.5 || Math.abs(L.vy) > 0.5 || m > 0.4) moving = true;
    }

    /* The buoyancy never stops, so the loop never stops while the hero is on
       screen — but it does stop the moment it scrolls away. See the observer
       below. That is the whole budget: one rAF, sixty transforms, and no
       layout read after the initial measure. */
    if (running) raf = requestAnimationFrame(frame);
    else if (moving) raf = requestAnimationFrame(frame);
  }

  function start() {
    if (raf || !letters.length) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  }

  hero.addEventListener(
    "pointermove",
    function (e) {
      px = e.clientX;
      py = e.clientY;
      near = 1;
      start();
    },
    { passive: true }
  );
  hero.addEventListener(
    "pointerleave",
    function () {
      /* Parked far away rather than zeroed, so the same falloff carries every
         letter home instead of the field switching off underneath them. */
      px = -9999;
      py = -9999;
      pvx = pvy = 0;
      near = 0;
    },
    { passive: true }
  );

  window.addEventListener("resize", measure, { passive: true });
  window.addEventListener("scroll", measure, { passive: true });

  /* Only run while the hero is actually on screen. Buoyancy is an infinite
     animation and there is no reason to pay for it three sections down. */
  if (window.IntersectionObserver) {
    new IntersectionObserver(
      function (es) {
        running = es[0].isIntersecting;
        if (running) start();
      },
      { threshold: 0.05 }
    ).observe(hero);
  } else {
    running = true;
  }

  /* ── THE HANDOFF ────────────────────────────────────────────────────────
     The typewriter owns .tw__ink until it has finished writing into it, and
     assigning textContent destroys children — so the split cannot happen
     before then. sid:herotyped is dispatched by the typewriter at the foot of
     _layouts/sid_home.html the moment the last character lands.

     The timeout is a floor, not a race: if that script fails, is edited, or
     the reduced-motion branch returns early without ever typing, the letters
     still come apart and the effect still runs. */
  var armed = false;
  function arm() {
    if (armed) return;
    armed = true;
    var hosts = hero.querySelectorAll(".tw");
    for (var i = 0; i < hosts.length; i++) split(hosts[i]);
    /* Measured after a frame so the split's own layout has settled. */
    requestAnimationFrame(function () {
      measure();
      running = true;
      start();
    });
  }
  window.addEventListener("sid:herotyped", arm);
  setTimeout(arm, 4200);

  /* A verification hook, not a feature. Nothing on the page calls it; it lets
     a headless run put the pointer somewhere and read the resulting
     displacement, which is the only way to check that a fluid is a fluid. */
  window.__heroTypeState = function () {
    return {
      letters: letters.length,
      maxOffset: letters.reduce(function (a, L) {
        return Math.max(a, Math.sqrt(L.ox * L.ox + L.oy * L.oy));
      }, 0),
      split: letters.length > 0,
    };
  };
})();
