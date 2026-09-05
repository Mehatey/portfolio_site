/* ─────────────────────────────────────────────────────────────────────────
   CONTROLS REACH FOR THE CURSOR BEFORE IT ARRIVES

   Sid, with a reference site: "he has added magnetic type of animation to
   when the cursor is near a button its really nice and smooth feels
   intentional i want us also to have it."

   THE VERSION THIS REPLACES DID NOT DO THAT. It lived in cursor_fluid.html
   and it bound `mousemove` ON each element, so the pull only began once the
   pointer was already inside the button -- by which point the affordance has
   done its job and the movement is just the button wobbling under your hand.
   The whole point of the effect is the moment BEFORE contact: a control that
   leans toward you as you approach reads as aware, and that is what "feels
   intentional" is describing.

   It also had no easing. The transform was written straight from the cursor
   position every frame and cleared outright on leave, so it snapped in and
   jumped back. Smooth was the other half of the brief.

   ── HOW THIS ONE WORKS ──────────────────────────────────────────────────
   One pointermove listener on the window, one rAF loop. Each control has a
   RADIUS around it; inside that radius it is pulled toward the cursor by a
   fraction of the distance, falling off with a smoothstep so the movement
   begins imperceptibly at the edge rather than switching on. Outside, its
   target is zero.

   Nothing is ever set directly from the pointer. Every control keeps its own
   current offset and eases toward its target at a fixed rate, which is what
   makes both the arrival and the return smooth, and what stops a fast sweep
   across the page from flinging six controls at once.

   ── WHY IT DOES NOT MEASURE EVERY FRAME ─────────────────────────────────
   getBoundingClientRect on twenty elements per frame is a forced layout per
   frame. Rects are cached and refreshed on scroll and resize, and only
   controls currently on screen are considered -- so the per-frame cost is
   arithmetic on a short list.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  if (!window.matchMedia) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  /* A magnetic control is meaningless without a pointer to be near. */
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  /* The site's real controls. `[data-magnetic]` is kept because a few pages
     already opt in by hand; the rest are the things a visitor actually aims
     at, and deliberately NOT every link -- body copy links that shift under
     the cursor are a reading problem, not a delight. */
  var SEL = [
    "[data-magnetic]",
    ".btn",
    ".hero__dir",
    ".studio-nav .nav a",
    ".gal-go",
    ".contact-links a",
    ".ftr__cta",
    ".ftr__copy",
    "#theme-toggle",
    "#cube-chat-fab",
    ".nextscroll__pin",
  ].join(",");

  var RADIUS = 120;
  var STRENGTH = 0.32;
  /* Capped so a control never leaves its own footprint far enough to look
     detached from the thing it labels. */
  var MAX = 14;
  var EASE = 0.14;

  var items = [];
  var mx = -9999,
    my = -9999;
  var raf = 0,
    dirty = true;

  function collect() {
    var els = document.querySelectorAll(SEL);
    items = [];
    for (var i = 0; i < els.length; i++) {
      items.push({ el: els[i], cx: 0, cy: 0, w: 0, h: 0, x: 0, y: 0, tx: 0, ty: 0, on: false });
    }
    dirty = true;
  }

  function measure() {
    var vh = window.innerHeight;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      /* Measured with the current offset removed, or a control that is
         already pulled would measure its pulled position and drift further
         every refresh. */
      var prev = it.el.style.transform;
      if (prev) it.el.style.transform = "";
      var r = it.el.getBoundingClientRect();
      if (prev) it.el.style.transform = prev;
      it.cx = r.left + r.width / 2;
      it.cy = r.top + r.height / 2;
      it.w = r.width;
      it.h = r.height;
      /* Off-screen controls are skipped by the loop rather than removed, so
         scrolling one back into view needs no re-collection. */
      it.vis = r.bottom > -RADIUS && r.top < vh + RADIUS && r.width > 0;
    }
    dirty = false;
  }

  function frame() {
    raf = 0;
    if (dirty) measure();

    var moving = false;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (!it.vis) {
        it.tx = it.ty = 0;
      } else {
        var dx = mx - it.cx;
        var dy = my - it.cy;
        /* The radius is measured from the control's EDGE, not its centre, so
           a wide button and a small icon both start reacting at the same
           distance from the thing you are aiming at. */
        var ex = Math.max(0, Math.abs(dx) - it.w / 2);
        var ey = Math.max(0, Math.abs(dy) - it.h / 2);
        var d = Math.sqrt(ex * ex + ey * ey);
        if (d < RADIUS) {
          var t = 1 - d / RADIUS;
          /* Smoothstep, so the pull begins at nothing at the edge of the
             radius instead of switching on at a fixed strength. */
          t = t * t * (3 - 2 * t);
          it.tx = Math.max(-MAX, Math.min(MAX, dx * STRENGTH * t));
          it.ty = Math.max(-MAX, Math.min(MAX, dy * STRENGTH * t));
        } else {
          it.tx = it.ty = 0;
        }
      }

      it.x += (it.tx - it.x) * EASE;
      it.y += (it.ty - it.y) * EASE;

      var near0 = Math.abs(it.x) < 0.05 && Math.abs(it.y) < 0.05;
      if (near0) {
        if (it.on) {
          it.el.style.transform = "";
          it.x = it.y = 0;
          it.on = false;
        }
      } else {
        it.el.style.transform = "translate3d(" + it.x.toFixed(2) + "px," + it.y.toFixed(2) + "px,0)";
        it.on = true;
        moving = true;
      }
    }
    /* The loop stops when everything has settled and restarts on the next
       pointer move, so an idle page costs nothing. */
    if (moving) raf = requestAnimationFrame(frame);
  }

  function wake() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  window.addEventListener(
    "pointermove",
    function (e) {
      mx = e.clientX;
      my = e.clientY;
      wake();
    },
    { passive: true }
  );
  window.addEventListener(
    "scroll",
    function () {
      dirty = true;
      wake();
    },
    { passive: true }
  );
  window.addEventListener(
    "resize",
    function () {
      dirty = true;
      wake();
    },
    { passive: true }
  );
  window.addEventListener(
    "pointerleave",
    function () {
      mx = my = -9999;
      wake();
    },
    { passive: true }
  );

  collect();
  /* Controls arrive late on several pages -- the sound toggle and the shelf
     are appended by their own scripts -- so the list is rebuilt once after
     load rather than only at parse time. */
  window.addEventListener("load", function () {
    setTimeout(collect, 600);
  });
})();
