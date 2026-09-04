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

   ── THE DRIFT ───────────────────────────────────────────────────────────
   Slow, and unequal. Each object crosses on its own duration — 92 to 186
   seconds — with its own bob period and its own signed rotation rate, none of
   them a neat multiple of any other, so the group never resolves into a
   pattern and never visibly loops. "Like on water" is mostly this: things
   adrift are never in step.

   (This said "34 to 62 seconds" long after the numbers in SCENE had been
   rewritten twice. A range in a comment is a fact with an expiry date; it is
   restated here because it is genuinely the design, and it is worth checking
   against the table below rather than trusting.)

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

  /* ── AND NOW IT IS GLASS AGAIN, WITH THE MARK IN IT ──────────────────
     Sid: "those clouds ... look so bad. They look so kiddish, and the trees
     look so bad. That's not the vibe ... just have different colored, super
     nice refractive motion liquid glass, different shapes and sizes, cubes
     with my sort of face on it, the small directional ellipses (vertical),
     and the small little no-emotion smile that we have in our logo."

     He is right about why they failed, and it is not the material. A cloud
     drawn as four radial lobes and a tree drawn as three is illustration, and
     illustration at this size and this opacity reads as clip art -- the glass
     underneath was doing real optics for a shape that had no business being
     rendered in glass. The primitives were never the problem; the subject
     was.

     So the scene is objects again, and this time they are the site's own
     objects rather than generic ones:

       CUBE  the mark. A rounded square in the same proportion as the logo,
             and two of them carry the face -- the two tall capsule eyes and
             the short flat mouth, at the logo's own ratios. Not a smiley: the
             mouth is a line, which is the whole reason the logo reads as a
             device that happens to have a face rather than as a character.

       LENS  a vertical ellipse. "Directional" is the useful word in the
             brief: an upright ellipse has an axis, so a group of them has an
             orientation, and that is what stops a field of glass shapes
             reading as bubbles.

     Each gets its own --tint. Six colours off the site's own accent family
     and the nature palette, and NOT orange -- the same decision as the mark's
     drift, for the same reason.

     ── AND NOTHING IS CUT OFF AT THE TOP ─────────────────────────────────
     Sid: "The clouds are also cut off from the top." They were: a cloud at
     y 0.08 with height 0.055 sat at the very top of the viewport and the
     lift sine pushed it past the edge, so the first thing you saw was a
     shape with its head sliced off. Every y below is chosen so that y plus
     height plus the vertical sway stays inside 0.06 and 0.88 of the window.
     They enter and leave at the SIDES, which is the one edge a drifting
     object can cross without looking broken. */
  var SCENE = [
    { kind: "cube", y: 0.14, w: 0.075, h: 0.13, dur: 104, phase: 0.05, tint: "aqua", face: true, spin: 0.9 },
    { kind: "lens", y: 0.36, w: 0.03, h: 0.115, dur: 138, phase: 0.42, tint: "blue", spin: -0.5 },
    { kind: "cube", y: 0.58, w: 0.05, h: 0.088, dur: 122, phase: 0.71, tint: "moss", spin: -1.2 },
    { kind: "lens", y: 0.2, w: 0.022, h: 0.082, dur: 168, phase: 0.18, tint: "dusk", spin: 0.7 },
    { kind: "cube", y: 0.44, w: 0.096, h: 0.166, dur: 92, phase: 0.6, tint: "slate", face: true, spin: 0.55 },
    { kind: "lens", y: 0.68, w: 0.026, h: 0.096, dur: 150, phase: 0.88, tint: "aqua", spin: -0.85 },
    { kind: "cube", y: 0.28, w: 0.038, h: 0.066, dur: 186, phase: 0.31, tint: "ice", spin: 1.4 },
  ];

  var layer = document.createElement("div");
  layer.className = "idle-drift";
  layer.setAttribute("aria-hidden", "true");

  var pieces = [];
  for (var i = 0; i < SCENE.length; i++) {
    var d = SCENE[i];
    var el = document.createElement("div");
    el.className = "idle-drift__p is-" + d.kind + " t-" + d.tint;
    /* Two of the seven, not all of them. A face on every object is a crowd
       looking at you; on two it is the mark turning up in the weather. */
    if (d.face) {
      el.classList.add("has-face");
      el.innerHTML = '<b class="eye"></b><b class="eye"></b><b class="mouth"></b>';
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
      spin: d.spin || 0,
    });
  }
  document.body.appendChild(layer);

  for (var k = 0; k < pieces.length; k++) {
    var q = pieces[k];
    q.el.style.width = (q.w * 100).toFixed(2) + "vw";
    q.el.style.height = (q.h * 100).toFixed(2) + "vh";
    q.el.style.top = (q.y * 100).toFixed(2) + "vh";
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

      /* One motion for both kinds, because they are both objects adrift in
         the same medium -- what separates them is shape and rate, not
         behaviour. Across the window and off the far side, entering and
         leaving well clear of both edges so nothing ever appears or vanishes
         at a boundary.

         The vertical term is a slow sine of a few pixels. It is deliberately
         small: this is glass drifting, not floating, and anything larger
         reads as a balloon. Combined with the y values in SCENE it keeps
         every object inside the window at all times, which is the top-edge
         clipping Sid saw.

         The rotation is per-object and signed, so some turn one way and some
         the other. A group all rotating together is a carousel. */
      var cx = -0.3 * W + u * (W * 1.6);
      var bob = Math.sin(clock * 0.13 + p.phase * 6.28) * (p.kind === "lens" ? 9 : 6);
      var turn = Math.sin(clock * 0.055 + p.phase * 6.28) * (p.spin * 7);
      p.el.style.transform = "translate3d(" + cx.toFixed(1) + "px," + bob.toFixed(1) + "px,0) rotate(" + turn.toFixed(2) + "deg)";
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
