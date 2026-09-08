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

  /* Sid: "also let it show maybe after 20 sec." Fifteen caught people who
     were still reading. */
  var IDLE_MS = 20000;

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
  /* ── BIGGER, QUIETER, AND IT ARRIVES IN STAGES ───────────────────────
     Sid: "I just saw the screensaver of the colored cubes. It doesn't show
     enough of the background. It still has too much color on it, and they can
     be much bigger, like Microsoft, like that landscape and the water ... From
     my cube logo, in the screensaver position, a river of refraction and
     blending mode sort of slowly emerges and animates across the scene ...
     you can add more stuff on the page as time goes on."

     Four changes, and the first two are the same change. The objects roughly
     double in size and the tint drops by more than half: a small object with
     a strong tint is a coloured chip, and what he is describing -- the
     Windows landscape screensavers -- are large, nearly clear sheets that you
     read the room THROUGH. Size and transparency together are what make glass
     read as glass rather than as plastic.

     `at` is the third change. Every piece now has a time, in seconds of
     continued stillness, at which it arrives. Nothing appears all at once:
     the river comes first out of the mark, then a cube, then a lens, and the
     last piece does not turn up for the better part of a minute. Sitting
     still for longer is rewarded with more of it, which is the "add more
     stuff on the page as time goes on".

     RIVER is the fourth. One wide band, rotated off the horizontal, that
     grows out of the top-left corner where the mark sits and travels across
     the composition. It is the only piece that does not drift past -- it
     extends, which is what a river does. */
  /* ── THE LENSES CAME OUT AND THE CUBES GOT BIGGER ────────────────────
     Sid: "i just saw the sort of clouds and the cube thing moving around it
     doesn't look good at all. Can you animate the eyes, make it bigger, also
     remove these weird ellipses and bigger and make more refraction happen.
     It's just a little tinted rectangle otherwise in the screensaver."

     The ellipses are gone. They were argued for as "directional" -- an
     upright ellipse has an axis, so a group of them points somewhere -- and
     that argument was about the SHAPE rather than about what the shape is.
     Next to a cube carrying the site's own face, a plain ellipse is a
     primitive again, which is the exact fault the clouds and the tree had.

     What is left is the mark, at roughly half again the previous size, and
     the river. Four objects, not seven: fewer and larger is what makes each
     one read as a sheet of glass you look THROUGH rather than a tinted card
     you look at, which is the "just a little tinted rectangle" complaint. */
  /* ── SOMETHING HAS TO HAPPEN ACROSS THE WHOLE SCREEN ─────────────────
     Sid: "In the screensaver, let there be some sort of motion, like let
     something happen which takes over most of the entire screen. Let there be
     some grass, let there be some water, something more than just simple
     translets and squares moving around slowly. It looks fucking terrible."

     Fair. Four objects drifting across a black page is a screensaver from
     1996 however good the glass on them is -- there was no SCENE, only props.
     Two full-width layers go underneath them:

       WATER   a band across the lower third whose surface is two very slow
               skewed highlights travelling at different speeds. The parallax
               between them is the whole illusion; it is the same trick the
               earlier river used and it was the one part of that scene worth
               keeping.

       GRASS   a horizon of blades along the bottom, each leaning on its own
               phase of a shared breeze. Drawn as one repeating conic mask
               rather than as elements, so a hundred blades cost one paint.

     The mark and its glass still cross in front. What changed is that they
     now cross something instead of crossing nothing. */
  /* ── THE SCENE ────────────────────────────────────────────────────────
     Sid: "on screensaver mode can we not have any random squares behind a
     face square, and I want some rain and some liquid glass clouds which do a
     lot of refraction, and in the centre interacting with all the other
     content on my screen should be a nice black hole effect, turbulent
     displace, warping liquifying the content around it slowly increasing in
     size."

     The plain squares are gone. Every glass object in here now carries the
     face, because a featureless rounded rectangle drifting behind a face is
     the "random square" -- it reads as a stray div rather than as part of the
     scene. Three objects instead of five, all of them the mark.

     Added: two liquid-glass clouds at heavy refraction, a rain layer, and the
     hole at the centre. */
  var SCENE = [
    { kind: "grass", at: 0.4, y: 0.82, w: 1.4, h: 0.2, dur: 200, phase: 0, tint: "moss" },
    { kind: "river", at: 1.2, y: 0.66, w: 1.5, h: 0.15, dur: 150, phase: 0, tint: "ice" },
    { kind: "cloud", at: 2, y: 0.1, w: 0.44, h: 0.3, dur: 190, phase: 0.1, tint: "ice" },
    { kind: "cloud", at: 22, y: 0.32, w: 0.6, h: 0.34, dur: 240, phase: 0.62, tint: "aqua" },
    /* ── ONE CUBE ─────────────────────────────────────────────────────
       Sid: "in the screensaver let there be just one cube not multiple
       squares, instead you can also add some stars and a comet maybe and a
       spiral maybe ... maybe an eye as well."

       Three cubes drifting past each other read as a set of objects, and the
       mark is not a set: it is one character. Alone it is the thing that
       lives here, and everything else in the scene is weather around it.

       The eye is the second character and it is deliberately not another
       cube. Same glass, different creature: a lens with an iris behind it,
       which is what the mark's own eyes are a pixel-art shorthand for. The
       sun, stars, spiral, comet and birds are drawn on the rain canvas rather
       than added as objects here, because a sky made of DOM boxes is a sky
       that costs a composited layer per star. */
    { kind: "cube", at: 3, y: 0.24, w: 0.19, h: 0.32, dur: 138, phase: 0.05, tint: "aqua", face: true, spin: 0.55 },
    { kind: "eye", at: 17, y: 0.46, w: 0.15, h: 0.1, dur: 176, phase: 0.55, tint: "ice", spin: -0.4 },
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
    /* The bloom the glass throws past its own edge. Its own element rather
       than a third pseudo-element, because it has to sit BEHIND the glass
       (z-index -1) and a ::before/::after on a backdrop-filtered box cannot
       get behind its own host. */
    if (d.kind === "cube" || d.kind === "eye") el.insertAdjacentHTML("beforeend", '<i class="flare" aria-hidden="true"></i>');
    if (d.kind === "eye")
      el.insertAdjacentHTML("beforeend", '<i class="iris" aria-hidden="true"><i class="pupil"></i></i><i class="lid" aria-hidden="true"></i>');

    if (d.face) {
      el.classList.add("has-face");
      /* The eyes are their own elements so they can be scaled independently
         of the cube's drift -- a blink is a scaleY on the eye, and doing it
         on the cube would squash the whole object. */
      /* Appended, not assigned. `innerHTML =` here would delete the flare
         element inserted just above, which is the sort of thing that shows up
         as "the halo works on two of the three cubes". */
      /* The face goes INSIDE the glass front rather than on the piece,
         because the piece is now the 3D container and anything parented to it
         directly would float in space beside the cube rather than sit on it.
         Every `.idle-drift__p .eye` selector still matches by descent. */
      el.insertAdjacentHTML(
        "beforeend",
        '<i class="cf cf--t" aria-hidden="true"></i><i class="cf cf--r" aria-hidden="true"></i>' +
          '<span class="cube-front"><b class="eye"></b><b class="eye"></b><b class="mouth"></b></span>'
      );
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
      at: d.at || 0,
    });
  }
  /* ══ THE RAIN ══════════════════════════════════════════════════════════
     One canvas, a few hundred streaks falling on their own clocks. Canvas
     rather than elements because rain is the one thing in this scene where
     the count IS the effect: two hundred divs is two hundred layers, and two
     hundred lines on a canvas is one paint.

     The streaks are drawn along their own velocity vector rather than
     straight down, so when the wind term pushes them they lean, which is what
     stops it reading as a screensaver from 1996. */
  var rainCv = document.createElement("canvas");
  rainCv.className = "idle-rain";
  rainCv.setAttribute("aria-hidden", "true");
  layer.appendChild(rainCv);
  var rctx = rainCv.getContext("2d");
  var drops = [];

  /* ══ THE SKY ═══════════════════════════════════════════════════════════
     Sid: "make sure the cube eyes are never red and also the grass should
     sway around and there is a nice sun too and some birds and some animated
     abstract star, comet, spiral milky way."

     All of it goes on the rain canvas rather than into new layers or new
     elements. That is the same argument the rain itself was built on: two
     hundred divs is two hundred composited layers and two hundred shapes on a
     canvas is one paint. Everything here draws BEFORE the rain in the same
     frame, so the weather falls in front of the sky, which is the right
     order and free.

     Each piece is on its own slow clock, because a sky where several things
     move on the same period reads as one animation rather than as weather. */
  var stars = [];
  for (var st = 0; st < 90; st++) {
    stars.push({
      x: Math.random(),
      y: Math.random() * 0.72,
      r: 0.35 + Math.random() * 1.15,
      a: 0.16 + Math.random() * 0.5,
      /* Twinkle is a slow sine per star with its own phase and rate. A shared
         rate makes the whole field pulse together, which no sky does. */
      tw: 0.25 + Math.random() * 0.9,
      ph: Math.random() * 6.28,
    });
  }
  /* The spiral is drawn from a formula rather than stored as points: two arms,
     logarithmic, with the particle density falling off toward the rim the way
     it does in a real one. It turns about once every eight minutes. */
  var SPIRAL = [];
  for (var sp = 0; sp < 260; sp++) {
    var arm = sp % 2;
    var t = 0.12 + (sp / 260) * 2.5;
    SPIRAL.push({
      t: t,
      arm: arm,
      jitter: (Math.random() - 0.5) * 0.16,
      a: (0.5 - (sp / 260) * 0.36) * (0.5 + Math.random() * 0.5),
      r: 0.3 + Math.random() * 0.9,
    });
  }
  /* Birds cross rarely, in a loose skein, and flap on their own clocks. */
  var birds = [];
  for (var bd = 0; bd < 7; bd++) {
    birds.push({
      x: -0.2 - Math.random() * 1.4,
      y: 0.12 + Math.random() * 0.3,
      v: 0.012 + Math.random() * 0.016,
      s: 5 + Math.random() * 5,
      flap: 1.6 + Math.random() * 1.5,
      ph: Math.random() * 6.28,
    });
  }
  /* One comet at a time, and mostly there is not one. It is an event, not a
     feature: a comet on a loop is a screensaver from 1996. */
  var comet = null,
    nextComet = 7 + Math.random() * 15;
  var RW = 0,
    RH = 0;
  function sizeRain() {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    RW = innerWidth;
    RH = innerHeight;
    rainCv.width = Math.round(RW * dpr);
    rainCv.height = Math.round(RH * dpr);
    if (rctx) rctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!drops.length) {
      for (var d = 0; d < 210; d++) {
        drops.push({
          x: Math.random() * RW,
          y: Math.random() * RH,
          /* A spread of speeds is the depth cue: the fast ones read as near,
             the slow ones as far, and that is the whole illusion. */
          v: 260 + Math.random() * 620,
          len: 8 + Math.random() * 26,
          a: 0.06 + Math.random() * 0.22,
        });
      }
    }
  }
  sizeRain();
  addEventListener("resize", sizeRain, { passive: true });

  /* ══ THE HOLE ══════════════════════════════════════════════════════════
     Sid: "in the centre, interacting with all the other content on my screen,
     should be a nice black hole effect, turbulent displace, warping
     liquifying the content around it, slowly increasing in size."

     An SVG turbulence displacement applied to the PAGE, not to the overlay --
     which is the only way it can warp "all the other content". It is the same
     technique as the mark's lens and the desk's melt, so the site has one
     idea about how it distorts things.

     It grows the longer nobody touches anything: the scale ramps over about
     ninety seconds, so arriving at the screensaver is calm and staying in it
     is not. */
  var holeSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  holeSvg.setAttribute("aria-hidden", "true");
  holeSvg.style.cssText = "position:fixed;width:0;height:0;overflow:hidden;pointer-events:none";
  holeSvg.innerHTML =
    "<defs>" +
    '<filter id="idle-hole" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">' +
    '<feTurbulence id="idle-hole-noise" type="fractalNoise" baseFrequency="0.0052 0.0094" numOctaves="2" seed="11" result="w"/>' +
    '<feDisplacementMap id="idle-hole-disp" in="SourceGraphic" in2="w" scale="0" xChannelSelector="R" yChannelSelector="G"/>' +
    "</filter></defs>";
  document.body.appendChild(holeSvg);
  var holeDisp = holeSvg.querySelector("#idle-hole-disp");
  var holeNoise = holeSvg.querySelector("#idle-hole-noise");

  /* ── THERE IS NO VISIBLE SINGULARITY ──────────────────────────────────
     Sid: "ditch the black hole and just have the warping and displacement,
     the black circle with the blur outline looks very bad, i want it to be
     subtle not a flat shitty thing."

     It was a radial-gradient disc with a spinning rim drawn ON TOP of the
     warp, which is the problem: the warp is a real optical effect on real
     page content, and painting a flat black circle over it replaces the
     thing that was working with a sticker. Everything that made it read as
     a well -- the pull, the bend, the growth over time -- is in the
     displacement, and that stays. Nothing is drawn. */

  /* What the warp is applied to. Not <body>, which would take the overlay and
     the cursor with it. */
  function warpTargets() {
    var out = [];
    ["main", "footer", "#smoke-bg", ".site-footer"].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el && out.indexOf(el) === -1) out.push(el);
    });
    return out;
  }
  var warped = [];
  var holeAmt = 0,
    holeWant = 0;

  document.body.appendChild(layer);

  for (var k = 0; k < pieces.length; k++) {
    var q = pieces[k];
    q.el.style.width = (q.w * 100).toFixed(2) + "vw";
    q.el.style.height = (q.h * 100).toFixed(2) + "vh";
    q.el.style.top = (q.y * 100).toFixed(2) + "vh";
    /* The river starts AT the mark rather than at the window edge, because
       the brief is that it comes out of the logo. 24px is where the mark's
       own left edge sits once it is centred in the margin. */
    if (q.kind === "river") q.el.style.left = "24px";
    if (q.kind === "grass") q.el.style.left = "-20vw";
  }

  /* ── idle ─────────────────────────────────────────────────────────────── */
  var timer = 0,
    on = false;

  function wake() {
    if (on) {
      on = false;
      offAt = performance.now();
      layer.classList.remove("is-on");
      /* ── IT LETS GO, IT DOES NOT SWITCH OFF ─────────────────────────
         Sid: "when someone presses a key or scrolls again let it have some
         soft animation where all the stuff returns to normal rather than
         just stopping suddenly, cause most people will scroll."

         The warp is the part that mattered: the page was liquified by up to
         forty pixels and then snapped flat on the first wheel event, which
         is a jolt on exactly the gesture everybody makes. Setting the target
         to zero lets the same spring that grew it unwind it, over about a
         second, while the objects fade. The filter is only detached once the
         displacement is actually back to nothing. */
      holeWant = 0;
      if (!raf) raf = requestAnimationFrame(frame);
    }
    clearTimeout(timer);
    timer = setTimeout(sleep, IDLE_MS);
  }
  function sleep() {
    if (document.hidden) return;
    on = true;
    holeAt = performance.now();
    layer.classList.add("is-on");
    warped = warpTargets();
    warped.forEach(function (el) {
      el.style.filter = "url(#idle-hole)";
      el.style.willChange = "filter";
    });
    if (!raf) {
      t0 = 0;
      raf = requestAnimationFrame(frame);
    }
  }
  var holeAt = 0;

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

    /* ── THE HOLE GROWS, THEN LETS GO ─────────────────────────────────── */
    if (on) {
      /* Ninety seconds to full. Arriving is calm; staying is not. */
      var held = Math.min(1, (now - holeAt) / 90000);
      /* ── 46 WAS A SMEAR, NOT A WARP ─────────────────────────────────
         Sid: "sometimes the squares get warped and stretched badly, make
         sure that doesn't happen", and "i want it to be subtle".

         Both are this number against the noise frequency below. 46px of
         displacement driven by a field that only completes a cycle every few
         hundred pixels does not ripple content, it drags whole regions of it
         sideways -- and because the glass pieces sample the page through
         backdrop-filter, a dragged page is exactly what they show, which is
         the stretched square. Halved to 22, which still visibly bends the
         page over ninety seconds without any part of it travelling far
         enough to tear. */
      holeWant = held * held * 22;
    }
    holeAmt += (holeWant - holeAmt) * (holeWant > holeAmt ? 0.02 : 0.045);
    if (holeDisp) holeDisp.setAttribute("scale", holeAmt.toFixed(2));
    if (holeNoise) {
      /* The field itself turns, so the warp is turbulent rather than a fixed
         lens the page happens to be behind. */
      holeNoise.setAttribute("seed", (11 + clock * 0.35).toFixed(2));
    }

    if (!on && holeAmt < 0.25 && warped.length) {
      warped.forEach(function (el) {
        el.style.filter = "";
        el.style.willChange = "";
      });
      warped = [];
      holeAmt = 0;
      if (holeDisp) holeDisp.setAttribute("scale", "0");
    }

    /* ── THE RAIN ─────────────────────────────────────────────────────── */
    if (rctx) {
      rctx.clearRect(0, 0, RW, RH);
      if (on || now - offAt < 700) {
        /* ── SKY FIRST, WEATHER OVER IT ────────────────────────────── */
        var fade = on ? 1 : Math.max(0, 1 - (now - offAt) / 700);

        /* THE SUN. Low and warm, and never a disc with an edge: a sun in a
           scene like this is a place the light comes from, so it is drawn as
           three nested glows with no hard boundary, breathing slowly. */
        var sx = RW * 0.84,
          sy = RH * 0.66;
        var breathe = 1 + Math.sin(clock * 0.07) * 0.06;
        var sunG = rctx.createRadialGradient(sx, sy, 0, sx, sy, RH * 0.42 * breathe);
        sunG.addColorStop(0, "rgba(255, 238, 196," + (0.52 * fade).toFixed(3) + ")");
        sunG.addColorStop(0.1, "rgba(255, 220, 158," + (0.26 * fade).toFixed(3) + ")");
        sunG.addColorStop(0.4, "rgba(244, 192, 140," + (0.09 * fade).toFixed(3) + ")");
        sunG.addColorStop(1, "rgba(255, 200, 150, 0)");
        rctx.fillStyle = sunG;
        rctx.fillRect(0, 0, RW, RH);

        /* THE STARS. */
        for (var si = 0; si < stars.length; si++) {
          var s2 = stars[si];
          var tw = 0.62 + 0.38 * Math.sin(clock * s2.tw + s2.ph);
          rctx.fillStyle = "rgba(230, 243, 255," + (s2.a * tw * 2.1 * fade).toFixed(3) + ")";
          rctx.beginPath();
          rctx.arc(s2.x * RW, s2.y * RH, s2.r, 0, 6.2832);
          rctx.fill();
        }

        /* THE SPIRAL. Placed off to one side rather than centred, because a
           galaxy in the middle of the screen is a target. */
        var gx = RW * 0.15,
          gy = RH * 0.17,
          gr = Math.min(RW, RH) * 0.26;
        var spin = clock * 0.013;
        for (var gi = 0; gi < SPIRAL.length; gi++) {
          var q = SPIRAL[gi];
          var ang = q.t * 2.1 + q.arm * Math.PI + spin + q.jitter;
          var rad = Math.pow(q.t, 0.86) * gr;
          var px2 = gx + Math.cos(ang) * rad * 1.35;
          var py2 = gy + Math.sin(ang) * rad * 0.52;
          rctx.fillStyle = "rgba(202, 220, 255," + (q.a * 1.15 * fade).toFixed(3) + ")";
          rctx.beginPath();
          rctx.arc(px2, py2, q.r, 0, 6.2832);
          rctx.fill();
        }
        /* Its core, which is the only part with any real brightness. */
        var coreG = rctx.createRadialGradient(gx, gy, 0, gx, gy, gr * 0.42);
        coreG.addColorStop(0, "rgba(228, 236, 255," + (0.3 * fade).toFixed(3) + ")");
        coreG.addColorStop(1, "rgba(200, 220, 255, 0)");
        rctx.fillStyle = coreG;
        rctx.beginPath();
        rctx.ellipse(gx, gy, gr * 0.5, gr * 0.24, 0, 0, 6.2832);
        rctx.fill();

        /* THE COMET. Rare, and it has a real tail: a line of decreasing
           alpha behind the head, drawn along its own velocity. */
        nextComet -= dt;
        if (!comet && nextComet <= 0) {
          comet = { x: -0.08, y: 0.05 + Math.random() * 0.25, vx: 0.19 + Math.random() * 0.13, vy: 0.055 + Math.random() * 0.05, life: 0 };
        }
        if (comet) {
          comet.life += dt;
          comet.x += comet.vx * dt;
          comet.y += comet.vy * dt;
          var cxp = comet.x * RW,
            cyp = comet.y * RH;
          var ca = Math.min(1, comet.life * 1.6) * Math.max(0, 1 - comet.life / 5.5) * fade;
          var tailLen = 190;
          var tg = rctx.createLinearGradient(cxp, cyp, cxp - comet.vx * tailLen, cyp - comet.vy * tailLen);
          tg.addColorStop(0, "rgba(232, 244, 255," + (0.72 * ca).toFixed(3) + ")");
          tg.addColorStop(1, "rgba(180, 214, 255, 0)");
          rctx.strokeStyle = tg;
          rctx.lineWidth = 1.9;
          rctx.beginPath();
          rctx.moveTo(cxp, cyp);
          rctx.lineTo(cxp - comet.vx * tailLen, cyp - comet.vy * tailLen);
          rctx.stroke();
          rctx.fillStyle = "rgba(245, 250, 255," + (0.9 * ca).toFixed(3) + ")";
          rctx.beginPath();
          rctx.arc(cxp, cyp, 1.8, 0, 6.2832);
          rctx.fill();
          if (comet.life > 5.5 || comet.x > 1.25) {
            comet = null;
            nextComet = 9 + Math.random() * 18;
          }
        }

        /* THE BIRDS. Two strokes each, and the flap is the ANGLE between
           them rather than a change of size, which is what stops them
           reading as blinking chevrons. */
        rctx.strokeStyle = "rgba(220, 234, 250," + (0.6 * fade).toFixed(3) + ")";
        rctx.lineWidth = 1.4;
        for (var bi = 0; bi < birds.length; bi++) {
          var bp = birds[bi];
          bp.x += bp.v * dt;
          if (bp.x > 1.25) {
            bp.x = -0.25 - Math.random() * 0.5;
            bp.y = 0.1 + Math.random() * 0.32;
          }
          var bxp = bp.x * RW,
            byp = bp.y * RH + Math.sin(clock * 0.5 + bp.ph) * 7;
          var f = Math.sin(clock * bp.flap + bp.ph);
          var lift = bp.s * 0.55 * f;
          rctx.beginPath();
          rctx.moveTo(bxp - bp.s, byp - lift);
          rctx.quadraticCurveTo(bxp, byp + bp.s * 0.18, bxp + bp.s, byp - lift);
          rctx.stroke();
        }

        rctx.lineCap = "round";
        var wind = Math.sin(clock * 0.09) * 90;
        for (var r = 0; r < drops.length; r++) {
          var dp = drops[r];
          dp.y += dp.v * dt;
          dp.x += wind * dt;
          if (dp.y > RH + 40) {
            dp.y = -40;
            dp.x = Math.random() * RW;
          }
          if (dp.x > RW + 40) dp.x = -40;
          else if (dp.x < -40) dp.x = RW + 40;
          /* Drawn along the velocity vector, so a leaning drop is a leaning
             streak. Straight-down streaks under a sideways wind is the tell
             that rain is a sprite sheet. */
          var vx = wind * 0.02,
            vy = dp.v * 0.02;
          var m = Math.hypot(vx, vy) || 1;
          rctx.strokeStyle = "rgba(196, 226, 255," + dp.a.toFixed(3) + ")";
          rctx.lineWidth = 1;
          rctx.beginPath();
          rctx.moveTo(dp.x, dp.y);
          rctx.lineTo(dp.x - (vx / m) * dp.len, dp.y - (vy / m) * dp.len);
          rctx.stroke();
        }
      }
    }

    for (var i = 0; i < pieces.length; i++) {
      var p = pieces[i];
      var u = (((clock / p.dur + p.phase) % 1) + 1) % 1;

      /* ── ARRIVAL ─────────────────────────────────────────────────────
         Each piece fades up over four seconds once the clock passes its own
         `at`. Before that it is not drawn at all, which is what makes sitting
         still for a minute a different experience from sitting still for
         fifteen seconds. */
      var age = clock - p.at;
      if (age < 0) {
        p.el.style.opacity = "0";
        continue;
      }
      p.el.style.opacity = Math.min(1, age / 4).toFixed(3);

      if (p.kind === "grass") {
        /* Rooted. The blades lean on a shared breeze and the whole horizon
           sways a degree or so about its BASE -- about the centre it would
           hover, and a hovering lawn is a rug in a draught. */
        var sway = Math.sin(clock * 0.11 + p.phase) * 1.1;
        p.el.style.setProperty("--breeze", (Math.sin(clock * 0.23) * 0.5 + 0.5).toFixed(3));
        p.el.style.transform = "rotate(" + sway.toFixed(2) + "deg)";
        continue;
      }

      if (p.kind === "cloud") {
        /* Clouds drift like the cubes but much slower and they BREATHE --
           the mask scale is written per frame, so the silhouette is never the
           same shape twice. A cloud that holds a fixed outline is a blob. */
        var cu = -0.35 * W + u * (W * 1.7);
        var puff = 1 + Math.sin(clock * 0.07 + p.phase * 6.28) * 0.09;
        var lift = Math.sin(clock * 0.05 + p.phase * 3.1) * 14;
        p.el.style.transform = "translate3d(" + cu.toFixed(1) + "px," + lift.toFixed(1) + "px,0) scale(" + puff.toFixed(3) + ")";
        continue;
      }

      if (p.kind === "river") {
        /* It does not cross, it EXTENDS. Anchored at the mark's corner and
           growing along its own axis, so what you see is a band reaching out
           of the logo and across the scene rather than a rectangle sliding
           in from off-screen. Scale rather than translate for exactly that
           reason: a translated band has a leading edge that arrived from
           somewhere, a scaled one has a leading edge that is being made.

           It keeps growing for two and a half minutes and then holds, which
           is longer than almost anybody will sit -- the point is that it is
           never seen to finish. */
        var grow = Math.min(1, age / 150);
        var ease = 1 - Math.pow(1 - grow, 3);
        var sag = Math.sin(clock * 0.05) * 10;
        /* The two surface highlights, on periods that do not divide into one
           another (23s and 31s). The parallax between them is what reads as a
           current; in step they would read as one reflection sliding across
           glass. Without these the band was a blurred stripe: photographed at
           thirty seconds it was invisible over a dark page. */
        p.el.style.setProperty("--a", ((clock / 23) % 1).toFixed(4));
        p.el.style.setProperty("--b", ((clock / 31 + 0.4) % 1).toFixed(4));
        p.el.style.transform = "translate3d(0," + sag.toFixed(1) + "px,0) rotate(-9deg) scaleX(" + (0.04 + ease * 0.96).toFixed(4) + ")";
        continue;
      }

      /* One motion for both of the other kinds, because they are both
         objects adrift in the same medium -- what separates them is shape and
         rate, not behaviour. Across the window and off the far side, entering
         and leaving well clear of both edges so nothing appears or vanishes
         at a boundary.

         The vertical term is a slow sine of a few pixels. Deliberately small:
         this is glass drifting, not floating. Combined with the y values in
         SCENE it keeps every object inside the window at all times, which is
         the top-edge clipping Sid saw.

         The rotation is per-object and signed, so some turn one way and some
         the other. A group all rotating together is a carousel. */
      var cx = -0.3 * W + u * (W * 1.6);
      var bob = Math.sin(clock * 0.13 + p.phase * 6.28) * (p.kind === "lens" ? 9 : 6);
      var turn = Math.sin(clock * 0.055 + p.phase * 6.28) * (p.spin * 7);
      if (p.kind === "cube") {
        /* ── A CUBE HAS TO BE SEEN FROM SOMEWHERE ────────────────────
           Straight on, a cube is a square: the two extra faces are exactly
           edge-on and paint nothing. These are small, slow angles -- the
           object is drifting past, not tumbling -- and they are enough to
           open the side and the top. The perspective is per-object and scales
           with its size, so a small cube does not get a wide-angle lens.

           The Z rotation stays as well, so it still turns in the plane the
           way the flat ones did. */
        var yaw = -13 + Math.sin(clock * 0.041 + p.phase * 6.28) * 9;
        var pitch = 7 + Math.cos(clock * 0.033 + p.phase * 4.1) * 5;
        /* perspective() inside the transform rather than the perspective
           PROPERTY: the property sets up the 3D space a child is rendered in,
           and what has to be foreshortened here is this element's own
           rotation. Scaled to the object so a small cube does not get a
           wide-angle lens. */
        var per = Math.round((p.el.offsetWidth || 260) * 3.1);
        p.el.style.transform =
          "translate3d(" +
          cx.toFixed(1) +
          "px," +
          bob.toFixed(1) +
          "px,0) rotate(" +
          turn.toFixed(2) +
          "deg) " +
          "perspective(" +
          per +
          "px) rotateY(" +
          yaw.toFixed(2) +
          "deg) rotateX(" +
          pitch.toFixed(2) +
          "deg)";
      } else {
        p.el.style.transform = "translate3d(" + cx.toFixed(1) + "px," + bob.toFixed(1) + "px,0) rotate(" + turn.toFixed(2) + "deg)";
      }
    }

    /* Keeps running for a beat after it is dismissed, so the fade-out is
       animated rather than a still frame going transparent -- the objects
       carry on drifting as they go, which is what makes them read as having
       left rather than as having been switched off. `clock` is frozen the
       moment `on` drops, so they do not actually travel; the sway and the
       spin are what you see finish. */
    /* Also kept alive while the warp is unwinding, or the page would be
       left liquified with nothing running to relax it. */
    if (on || now - offAt < 700 || holeAmt > 0.25) raf = requestAnimationFrame(frame);
    else raf = 0;
  }
})();
