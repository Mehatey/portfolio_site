/* ═══════════════════════════════════════════════════════════════════════════
   WHAT YOU PICKED UP

   Sid: "a click could create pixel star icons, like a very simple circle and a
   dashed line, or pixel animals or pixel parts of nature, very well animated.
   I was thinking we can maybe have that as a click effect across the site, like
   one of each, and then it falls to the ground. It gets accumulated in the
   footer, and that would be a nice addition, like all the things that you've
   clicked on."

   ── THE PART THAT MAKES IT WORTH DOING ──────────────────────────────────
   A click effect on its own is a particle burst, and every template has one.
   What makes this different is the second half: the thing you spawned is still
   there at the bottom of the page. That turns a decoration into a record —
   the footer is quietly different for somebody who read three case studies
   than for somebody who bounced, and nothing announced that it was counting.

   So the rule is: ONE OF EACH, and the order is fixed. Nine objects, and you
   collect them in sequence. That is what stops it being a confetti cannon.
   Click forty times and you still have nine things, because the ninth click
   already gave you the last one — after that the fall still happens (the
   gesture should always answer) but nothing new is added to the shelf.

   ── WHY PIXELS AND NOT SVG ──────────────────────────────────────────────
   The site already has a pixel language: the nav marks, the loader icons, the
   birds in ambient.js. These are drawn on the same grid at the same scale, so
   they read as belonging rather than as a plugin. Each sprite is a string of
   rows, which is also the cheapest possible authoring format — a bird is nine
   characters of text.

   ── COST ────────────────────────────────────────────────────────────────
   One canvas, created on the first click and removed when the last object has
   landed. No rAF at rest. A click that lands on a link still navigates: this
   listens in the capture phase, never calls preventDefault, and never sits in
   front of anything — the canvas is pointer-events: none.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  if (!window.matchMedia) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var KEY = "sid_collected";
  var PX = 3;

  /* ── THE NINE ────────────────────────────────────────────────────────────
     Sid asked for "a very simple circle and a dashed line, or pixel animals or
     pixel parts of nature". So: one mark, some weather, some living things.
     Every grid is 9x9 or smaller and reads at 27px on a 3px cell.

     Order is deliberate rather than random. The star is first because it is
     the most legible at this size and the first click has to land clearly; the
     dashed line is last because it is the most abstract and only makes sense
     once the set has established what these are. */
  var SPRITES = [
    {
      name: "star",
      ink: "#f6e7b4",
      rows: ["....#....", "....#....", "..#####..", "...###...", "..##.##..", ".##...##.", ".#.....#.", ".........", "........."],
    },
    {
      name: "moon",
      ink: "#dfe7f5",
      rows: ["..####...", ".##..##..", "##....#..", "##.......", "##.......", "##....#..", ".##..##..", "..####...", "........."],
    },
    {
      name: "leaf",
      ink: "#a8d8a0",
      rows: ["......##.", ".....###.", "...####..", "..####...", ".####....", "####.....", "###......", ".#.......", "#........"],
    },
    {
      name: "bird",
      ink: "#cfe0f0",
      rows: [".........", "..##.....", ".####..##", "########.", ".######..", "..####...", "...##....", ".........", "........."],
    },
    {
      name: "fish",
      ink: "#9fd4e8",
      rows: [".........", "...###...", "..#####.#", ".###.####", "..#######", "...#####.", "....###..", ".........", "........."],
    },
    {
      name: "flower",
      ink: "#f2b8cc",
      rows: ["..#.#....", ".#####...", "..###....", ".#####...", "..#.#....", "...#.....", "...#.....", "..##.....", "...#....."],
    },
    {
      name: "cloud",
      ink: "#e6edf6",
      rows: [".........", "...###...", "..#####..", ".########", "#########", ".#######.", ".........", ".........", "........."],
    },
    {
      name: "circle",
      ink: "#cbd6e6",
      rows: ["..#####..", ".##...##.", "##.....##", "#.......#", "#.......#", "#.......#", "##.....##", ".##...##.", "..#####.."],
    },
    {
      name: "dash",
      ink: "#b9c6d8",
      rows: [".........", ".........", ".........", ".........", "##.##.##.", ".........", ".........", ".........", "........."],
    },
  ];

  function load() {
    try {
      var v = window.sessionStorage.getItem(KEY);
      return v ? JSON.parse(v) : [];
    } catch (e) {
      return [];
    }
  }
  function save(list) {
    try {
      window.sessionStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) {}
  }

  var got = load();
  var live = [];
  var cv = null;
  var ctx = null;
  var raf = 0;

  function stage() {
    if (cv) return;
    cv = document.createElement("canvas");
    cv.className = "collect-layer";
    cv.setAttribute("aria-hidden", "true");
    cv.width = innerWidth;
    cv.height = innerHeight;
    cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:8600;pointer-events:none;";
    document.body.appendChild(cv);
    ctx = cv.getContext("2d");
  }
  function teardown() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (cv && cv.parentNode) cv.parentNode.removeChild(cv);
    cv = null;
    ctx = null;
  }

  function draw(sprite, x, y, rot, alpha, scale) {
    var rows = sprite.rows;
    var s = PX * (scale || 1);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = sprite.ink;
    var half = (rows[0].length * s) / 2;
    for (var r = 0; r < rows.length; r++) {
      for (var c = 0; c < rows[r].length; c++) {
        if (rows[r][c] === "#") ctx.fillRect(Math.round(c * s - half), Math.round(r * s - half), s, s);
      }
    }
    ctx.restore();
  }

  function frame() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    var floor = innerHeight - 26;
    for (var i = live.length - 1; i >= 0; i--) {
      var o = live[i];
      o.age += 1;

      if (!o.landed) {
        /* A short pop upward before gravity takes it. Something that falls
           the instant you click reads as dropped; a beat of rise reads as
           released. */
        o.vy += 0.42;
        o.x += o.vx;
        o.y += o.vy;
        o.rot += o.spin;
        o.vx *= 0.995;
        if (o.y >= floor) {
          o.y = floor;
          o.landed = true;
          /* One small bounce, damped hard. Two bounces is a ball; one is
             weight. */
          if (Math.abs(o.vy) > 3) {
            o.vy = -o.vy * 0.28;
            o.landed = false;
          } else {
            o.vy = 0;
            o.rest = 0;
            /* It settles flat rather than at whatever angle it happened to
               stop at, which is what makes the row along the bottom read as
               a shelf instead of as debris. */
            o.rot = 0;
          }
        }
      } else {
        o.rest += 1;
      }

      /* Rests on the floor, then leaves — because the permanent copy of it is
         in the footer, and a screen that slowly fills with everything you have
         ever clicked is litter. */
      var alpha = 1;
      if (o.landed && o.rest > 46) alpha = Math.max(0, 1 - (o.rest - 46) / 34);
      if (alpha <= 0) {
        live.splice(i, 1);
        continue;
      }
      draw(o.sprite, o.x, o.y, o.rot, alpha, 1);
    }

    if (live.length) raf = requestAnimationFrame(frame);
    else {
      raf = 0;
      teardown();
    }
  }

  document.addEventListener(
    "click",
    function (e) {
      /* Never on the site's own controls: a sprite falling out of the theme
         toggle or the sound button reads as a glitch in the control, not as a
         reward for using it. */
      if (e.target.closest && e.target.closest("#theme-toggle, #sound-toggle, .cube-chat, [data-no-collect]")) return;

      /* The next unowned sprite, in order. Once all nine are held the gesture
         still answers -- a click that does nothing after the ninth would read
         as the feature breaking -- but the shelf does not grow. */
      var next = null;
      for (var i = 0; i < SPRITES.length; i++) {
        if (got.indexOf(SPRITES[i].name) === -1) {
          next = SPRITES[i];
          break;
        }
      }
      var sprite = next || SPRITES[Math.floor(Math.random() * SPRITES.length)];
      if (next) {
        got.push(next.name);
        save(got);
        document.dispatchEvent(new CustomEvent("sid:collected", { detail: { name: next.name, all: got.slice() } }));
      }

      stage();
      live.push({
        sprite: sprite,
        x: e.clientX,
        y: e.clientY,
        vx: (Math.random() - 0.5) * 2.4,
        vy: -4.2 - Math.random() * 2,
        rot: (Math.random() - 0.5) * 0.5,
        spin: (Math.random() - 0.5) * 0.09,
        age: 0,
        rest: 0,
        landed: false,
      });
      if (!raf) raf = requestAnimationFrame(frame);
    },
    true
  );

  addEventListener(
    "resize",
    function () {
      if (cv) {
        cv.width = innerWidth;
        cv.height = innerHeight;
      }
    },
    { passive: true }
  );

  /* The footer asks for these, and for the sprite table so it can draw them
     the same way rather than keeping a second copy. */
  window.__collected = function () {
    return { got: got.slice(), sprites: SPRITES };
  };
})();
