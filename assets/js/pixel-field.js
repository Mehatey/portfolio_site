/* ─────────────────────────────────────────────────────────────────────────
   THE BACKGROUND IS MADE OF PIXELS, AND THE POINTER FINDS THEM

   Sid: "remove these gray squares, the colored squares above the footer, like
   the pixel art thing which I told you to do. I want that to be a hover
   effect on the background, like a bunch of different pixels, interestingly
   done, not just a line of blue and blue squares which you hover on. That
   doesn't look good, right?"

   Right. The first version was a ROW — thirty-six squares in a line, in one
   place, at a fixed size. A line of squares is a progress bar or a legend; it
   reads as a component, and once you have hovered it once there is nothing
   left to find. "Pixel art" is not a strip of pixels, it is a field you
   discover.

   So the pixels are the ground now. A grid across the whole viewport, drawn
   nowhere until the pointer arrives, and lit only in the neighbourhood of the
   cursor — so moving across the page uncovers a soft constellation of
   coloured squares that were always notionally there and never visible at
   rest.

   ── WHY THIS IS ALSO THE ANSWER TO THE ORB ──────────────────────────────
   site-field, the fluid shader, was turned off in the same pass: it deposited
   pigment radially and left a large circular smudge in the middle of the page
   that Sid did not want. This occupies the same z-index and the same job —
   ambience that answers the pointer — and it cannot form a blob, because it
   has no memory. Every frame is drawn from the cursor position alone.

   ── WHY CANVAS AND NOT DOM ──────────────────────────────────────────────
   A 1728x1000 window at a 22px cell is about 3,500 cells. As elements that is
   3,500 nodes and a style recalculation per frame; as a canvas it is one
   node, and the loop only ever visits the cells inside the pointer's radius —
   roughly 200 of them — because the bounding box is computed first. Nothing
   is drawn or considered outside it.

   ── AND IT IS NOT A SPOTLIGHT ───────────────────────────────────────────
   A smooth radial falloff would be a torch, which is a different and much
   more common effect. Three things break it up: each cell's colour is fixed
   by a hash of its own coordinates, so the palette is stable as you move
   across it rather than shimmering; each cell carries a per-cell offset in
   the falloff, so the lit region has a ragged pixel edge instead of a circle;
   and cells below a threshold are skipped entirely, which is what leaves gaps
   inside the lit area and makes it read as art rather than as a gradient.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  if (!window.matchMedia) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  /* No pointer, no hover effect. On touch this would either never fire or
     fire once on tap and sit there, and a full-viewport canvas repainting on
     a phone GPU is a real cost for something nobody can trigger. */
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  var CELL = 22;
  var RADIUS = 190;
  /* The mark's nature palette and the accent family — the same six the idle
     glass and the rest of the site now share. No orange. */
  var PALETTE = [
    [120, 226, 220],
    [96, 190, 240],
    [148, 156, 202],
    [138, 176, 150],
    [122, 142, 172],
    [196, 224, 246],
  ];

  var cv = document.createElement("canvas");
  cv.className = "pixel-field";
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:fixed;inset:0;z-index:0;pointer-events:none;width:100%;height:100%";
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
  }
  size();
  window.addEventListener("resize", size, { passive: true });

  /* A cheap stable hash. The point is only that a given cell always answers
     the same way, so the field has a fixed identity you move over rather than
     a random one that reshuffles every frame. */
  function hash(cx, cy) {
    var h = (cx * 73856093) ^ (cy * 19349663);
    h = (h ^ (h >>> 13)) >>> 0;
    return h;
  }

  var mx = -1e4,
    my = -1e4,
    lit = 0,
    targetLit = 0,
    raf = 0;

  window.addEventListener(
    "pointermove",
    function (e) {
      mx = e.clientX;
      my = e.clientY;
      targetLit = 1;
      if (!raf) raf = requestAnimationFrame(frame);
    },
    { passive: true }
  );
  window.addEventListener(
    "pointerleave",
    function () {
      targetLit = 0;
      if (!raf) raf = requestAnimationFrame(frame);
    },
    { passive: true }
  );
  /* While the page is moving, the field steps back. Reading is the one thing
     it must never compete with, and a constellation sliding under a paragraph
     is exactly that. */
  var settle = 0;
  window.addEventListener(
    "scroll",
    function () {
      targetLit = 0;
      clearTimeout(settle);
      settle = setTimeout(function () {
        if (mx > -1e3) targetLit = 1;
        if (!raf) raf = requestAnimationFrame(frame);
      }, 420);
      if (!raf) raf = requestAnimationFrame(frame);
    },
    { passive: true }
  );

  function frame() {
    raf = 0;
    lit += (targetLit - lit) * 0.12;
    if (lit < 0.004) {
      lit = 0;
      ctx.clearRect(0, 0, W, H);
      return;
    }

    ctx.clearRect(0, 0, W, H);

    /* Only the cells the radius can actually reach. Everything outside this
       box is never visited, which is what keeps a full-viewport effect at the
       cost of a couple of hundred fills. */
    var c0 = Math.max(0, Math.floor((mx - RADIUS) / CELL));
    var c1 = Math.min(Math.ceil(W / CELL), Math.ceil((mx + RADIUS) / CELL));
    var r0 = Math.max(0, Math.floor((my - RADIUS) / CELL));
    var r1 = Math.min(Math.ceil(H / CELL), Math.ceil((my + RADIUS) / CELL));

    for (var cx = c0; cx < c1; cx++) {
      for (var cy = r0; cy < r1; cy++) {
        var x = cx * CELL;
        var y = cy * CELL;
        var dx = x + CELL / 2 - mx;
        var dy = y + CELL / 2 - my;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d > RADIUS) continue;

        var h = hash(cx, cy);
        /* Per-cell jitter on the falloff. Without it the lit area is a disc
           with a soft edge, which is a torch; with it the edge breaks into
           single squares and the whole thing reads as pixels. */
        var jitter = ((h >>> 8) & 255) / 255;
        var t = 1 - d / RADIUS;
        var a = t * t * (0.55 + jitter * 0.45) * lit;
        /* The gaps. Cells that do not clear the threshold are simply absent,
           and the holes inside the lit region are most of why this looks
           drawn rather than computed. */
        if (a < 0.06) continue;

        var col = PALETTE[h % PALETTE.length];
        ctx.fillStyle = "rgba(" + col[0] + "," + col[1] + "," + col[2] + "," + (a * 0.5).toFixed(3) + ")";
        /* One pixel short of the cell so the grid keeps its gutters and the
           squares never fuse into a solid block. */
        ctx.fillRect(x, y, CELL - 3, CELL - 3);
      }
    }

    if (lit > 0.004 || targetLit > 0) raf = requestAnimationFrame(frame);
  }
})();
