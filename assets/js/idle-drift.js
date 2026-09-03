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

  /* ── WHAT ARRIVES NOW ────────────────────────────────────────────────────
     Sid: "no squares and cubes of different materials be creative come on ...
     instead lets have some nice liquid glass clouds and a tree and a river and
     all very well animated."

     Fair. Seven tiles and two cubes is a set of primitives, and a primitive is
     what you draw when you have a material and no subject. The material was
     never the problem -- backdrop-filter genuinely refracts the page behind it
     and that is why this is DOM and not a shader (see the note above) -- so
     the glass stays and the shapes become a place.

     A scene, not a scatter. Three kinds of thing, each on its own clock:

       RIVER   one wide band low on the screen. It does not cross and leave; it
               sits and flows, because a river is the only thing here that is
               a location rather than an event. Its surface is two very slow
               skewed highlights travelling at different speeds, which is what
               reads as water rather than as a moving rectangle.

       CLOUDS  three, drifting sideways at different heights and speeds. Built
               from overlapping radial lobes on one element rather than a
               border-radius blob, because a cloud is a silhouette of several
               masses and a rounded rectangle is a lozenge.

       TREE    one, standing still. It is the only object that does not move,
               and that is the point of including it: without something fixed,
               the other two read as screensaver. It sways a degree and a half
               off its base, which is enough to be alive and not enough to be
               a flag.

     Still seven objects. Still "not trying to swarm your whole screen", which
     was the constraint in the original brief and has not changed. */
  var SCENE = [
    { kind: "river", y: 0.74, w: 1.34, h: 0.13, dur: 68, phase: 0 },
    { kind: "cloud", y: 0.16, w: 0.3, h: 0.1, dur: 96, phase: 0.1 },
    { kind: "cloud", y: 0.31, w: 0.22, h: 0.075, dur: 132, phase: 0.55 },
    { kind: "cloud", y: 0.08, w: 0.17, h: 0.055, dur: 154, phase: 0.82 },
    { kind: "tree", x: 0.18, y: 0.74, w: 0.11, h: 0.3, dur: 26, phase: 0.2 },
    { kind: "tree", x: 0.83, y: 0.74, w: 0.07, h: 0.19, dur: 31, phase: 0.66 },
    { kind: "cloud", y: 0.23, w: 0.13, h: 0.05, dur: 118, phase: 0.36 },
  ];

  var layer = document.createElement("div");
  layer.className = "idle-drift";
  layer.setAttribute("aria-hidden", "true");

  var pieces = [];
  for (var i = 0; i < SCENE.length; i++) {
    var d = SCENE[i];
    var el = document.createElement("div");
    el.className = "idle-drift__p is-" + d.kind;
    /* The tree is the one shape that cannot be made from a single box: a
       canopy and a trunk are two masses with different glass in them, so it
       gets two children and the canopy carries the face. */
    if (d.kind === "tree") {
      el.innerHTML = '<i class="t-canopy"></i><i class="t-trunk"></i>';
    }
    if (d.kind === "river") {
      /* Two highlights at different speeds. One is the surface, two is a
         current -- the parallax between them is the entire illusion. */
      el.innerHTML = '<i class="r-glint r-glint--a"></i><i class="r-glint r-glint--b"></i>';
    }
    /* "u can add a face to one side" survives from the original brief, and it
       is better placed now: on the larger tree, once, so the thing that has
       been standing there the whole time turns out to have been watching. */
    if (i === 4) {
      el.classList.add("has-face");
      el.querySelector(".t-canopy").innerHTML = '<b class="eye"></b><b class="eye"></b><b class="mouth"></b>';
    }
    layer.appendChild(el);
    pieces.push({
      el: el,
      kind: d.kind,
      x: d.x,
      y: d.y,
      w: d.w,
      h: d.h,
      dur: d.dur,
      phase: d.phase,
    });
  }
  document.body.appendChild(layer);

  for (var k = 0; k < pieces.length; k++) {
    var q = pieces[k];
    q.el.style.width = (q.w * 100).toFixed(2) + "vw";
    q.el.style.height = (q.h * 100).toFixed(2) + "vh";
    q.el.style.top = (q.y * 100).toFixed(2) + "vh";
    if (q.kind === "tree" || q.kind === "river") q.el.style.left = ((q.x || -0.17) * 100).toFixed(2) + "vw";
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

    var W = innerWidth;
    for (var i = 0; i < pieces.length; i++) {
      var p = pieces[i];
      var u = (((clock / p.dur + p.phase) % 1) + 1) % 1;

      if (p.kind === "cloud") {
        /* Left to right and off the far side, starting and ending well clear
           of the window so nothing appears at an edge. Clouds do not spin and
           they do not bob much: a cloud that rotates is a balloon. */
        var cx = -0.34 * W + u * (W * 1.68);
        var lift = Math.sin(clock * 0.11 + p.phase * 6.28) * 8;
        p.el.style.transform = "translate3d(" + cx.toFixed(1) + "px," + lift.toFixed(1) + "px,0)";
      } else if (p.kind === "river") {
        /* It stays. Only its two highlights move, and they are children, so
           the band itself never leaves the composition. A very slight vertical
           breathe keeps the surface from reading as a printed stripe. */
        var swell = Math.sin(clock * 0.07) * 5;
        p.el.style.transform = "translate3d(0," + swell.toFixed(1) + "px,0)";
        p.el.style.setProperty("--a", ((clock * 0.06 + p.phase) % 1).toFixed(4));
        p.el.style.setProperty("--b", ((clock * 0.037 + p.phase * 0.5) % 1).toFixed(4));
      } else {
        /* The tree is rooted. It sways about its BASE, which is what
           transform-origin does in the stylesheet -- swaying about the centre
           makes it hover, and a hovering tree is a shrub in an earthquake. */
        var tilt = Math.sin(clock * 0.19 + p.phase * 6.28) * 1.4;
        p.el.style.transform = "rotate(" + tilt.toFixed(2) + "deg)";
      }
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
