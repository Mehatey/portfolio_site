/* ─────────────────────────────────────────────────────────────────────────
   WHAT THE PAGE DOES WHEN NOBODY IS DOING ANYTHING

   Sid: "once in a while when someone is on a screen for a while without
   scrollign can we have falling slowly like on water or gliding squares and
   cubes fall in a slow way with amazing liquid glass and reflections of the
   background. also u can add a face to one side. let it feel creatively done
   and not trying to swarm your whole screen."

   Seven objects. Not seventy. The brief has the constraint in it — "not
   trying to swarm your whole screen" — and it is the whole design: this is
   something you notice out of the corner of your eye and then look at, which
   only works if there is room around each one.

   ── WHY DOM AND NOT A SHADER ────────────────────────────────────────────
   Because the requirement is reflections OF THE BACKGROUND, and the
   background is the page: type, photographs, the hero canvas, the pond. A
   WebGL layer over the document cannot read the document — there is no API
   that hands rendered DOM pixels to a shader, which is the same wall the film
   grade ran into.

   backdrop-filter can. It is composited against whatever is actually behind
   the element, so a div with a blur and a saturation lift over a photograph
   genuinely carries that photograph, smeared, the way glass does. Everything
   else here — the specular edge, the caustic seam across the face, the
   coloured fringe — is painted on top of that real sample. The glass is
   doing the optics; the CSS is doing the jewellery.

   ── THE FALL ────────────────────────────────────────────────────────────
   Slow, and unequal. Each object gets its own duration between 34 and 62
   seconds, its own horizontal sway period, its own rotation rate — all
   irrational against each other, so the group never resolves into a pattern
   and never loops visibly. "Like on water" is mostly this: things adrift are
   never in step.

   ── AND IT LEAVES ───────────────────────────────────────────────────────
   In 2.4s, and it goes in 0.45. Arriving slowly is what makes it ambient;
   leaving fast is what keeps it from ever being in the way of somebody who
   has just decided to read something. ────────────────────────────────── */
(function () {
  "use strict";

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  /* Touch has no idle: a finger is either on the glass or the page is in a
     pocket. And a full-screen backdrop-filter layer on a phone GPU is a real
     cost for something nobody will be sitting still long enough to see. */
  if (matchMedia("(hover: none)").matches) return;

  var IDLE_MS = 15000;
  var N = 7;

  var layer = document.createElement("div");
  layer.className = "idle-drift";
  layer.setAttribute("aria-hidden", "true");

  var pieces = [];
  for (var i = 0; i < N; i++) {
    var el = document.createElement("div");
    el.className = "idle-drift__p";
    /* One of the seven is a cube rather than a tile — three faces, so it
       reads as an object with a far side rather than as a pane. Two of them,
       out of seven, because a set that is all one thing is a texture. */
    var cube = i === 1 || i === 5;
    if (cube) el.classList.add("is-cube");
    if (cube) {
      el.innerHTML = '<i class="f f--top"></i><i class="f f--l"></i><i class="f f--r"></i>';
    }
    /* "u can add a face to one side." One of them. A face on every object is
       a mascot; a face on one of seven is the moment you realise one of them
       has been looking at you. It rides the right-hand face of a cube, so it
       turns away and comes back as the object rotates. */
    if (i === 5) {
      el.classList.add("has-face");
      var f = el.querySelector(".f--r") || el;
      f.innerHTML = '<b class="eye"></b><b class="eye"></b><b class="mouth"></b>';
    }
    layer.appendChild(el);
    pieces.push({
      el: el,
      size: 34 + ((i * 37) % 62) /* 34..96, no two alike, no randomness */,
      x: 0.08 + ((i * 0.1618 * 5) % 1) * 0.84 /* golden-ratio stride: spread without clumping */,
      dur: 34 + ((i * 11) % 29) /* seconds to cross */,
      phase: (i * 0.7654) % 1,
      sway: 26 + ((i * 13) % 34),
      swayHz: 0.035 + (i % 4) * 0.012,
      spin: (i % 2 ? 1 : -1) * (3 + (i % 3)),
    });
  }
  document.body.appendChild(layer);

  for (var k = 0; k < pieces.length; k++) {
    var p = pieces[k];
    p.el.style.width = p.size + "px";
    p.el.style.height = p.size + "px";
  }

  /* ── idle ─────────────────────────────────────────────────────────────── */
  var timer = 0,
    on = false;

  function wake() {
    if (on) {
      on = false;
      offAt = performance.now();
      layer.classList.remove("is-on");
    }
    clearTimeout(timer);
    timer = setTimeout(sleep, IDLE_MS);
  }
  function sleep() {
    if (document.hidden) return;
    on = true;
    layer.classList.add("is-on");
    if (!raf) {
      t0 = 0;
      raf = requestAnimationFrame(frame);
    }
  }

  ["scroll", "pointerdown", "wheel", "keydown", "pointermove"].forEach(function (e) {
    addEventListener(e, wake, { passive: true });
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) wake();
  });
  wake();

  /* ── the drift ────────────────────────────────────────────────────────── */
  var raf = 0,
    t0 = 0,
    offAt = -1e9,
    clock = 0;

  function frame(now) {
    if (!t0) t0 = now;
    var dt = Math.min(0.05, (now - t0) / 1000);
    t0 = now;
    /* The clock only advances while the layer is up, so an object that was
       three quarters of the way down when somebody scrolled is three quarters
       of the way down when they stop again. Otherwise every wake-up teleports
       the whole set, which is the tell that it is a loop. */
    if (on) clock += dt;

    var H = innerHeight,
      W = innerWidth;
    for (var i = 0; i < pieces.length; i++) {
      var p = pieces[i];
      var u = (((clock / p.dur + p.phase) % 1) + 1) % 1;
      /* Off the top and off the bottom, so nothing ever pops into being at
         the edge of the window. */
      var y = -160 + u * (H + 320);
      var x = p.x * W + Math.sin(clock * p.swayHz * 6.28 + p.phase * 6.28) * p.sway;
      p.el.style.transform =
        "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) rotate(" + (clock * p.spin * 0.6 + p.phase * 360).toFixed(1) + "deg)";
    }

    /* Keeps running for a beat after it is dismissed, so the fade-out is
       animated rather than a still frame going transparent -- the objects
       carry on drifting as they go, which is what makes them read as having
       left rather than as having been switched off. `clock` is frozen the
       moment `on` drops, so they do not actually travel; the sway and the
       spin are what you see finish. */
    if (on || now - offAt < 700) raf = requestAnimationFrame(frame);
    else raf = 0;
  }
})();
