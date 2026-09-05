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
  /* ── THE NINE ────────────────────────────────────────────────────────────
     Sid asked for "a very simple circle and a dashed line, or pixel animals or
     pixel parts of nature", and then: "make the pixel icons a little more
     detailed and add a little more colour or shadow, they look a lil flat."

     They were flat because each one was a single ink. A pixel sprite reads as
     an object rather than as a stencil when it has three tones -- a lit face,
     a body and a shaded side -- which is the whole vocabulary of pixel art and
     costs nothing but a second character in the grid.

     So the rows now carry four symbols:
       +  the lit tone, where the light lands
       #  the body tone
       -  the shaded tone, the side away from the light
       .  nothing
     Light comes from the upper left on every one of them, because a set lit
     from different directions reads as clip art from different sources.

     Each also gets a contact shadow when it lands; see draw().

     Order is deliberate rather than random. The star is first because it is
     the most legible at this size and the first click has to land clearly; the
     dashed line is last because it is the most abstract and only makes sense
     once the set has established what these are. */
  var SPRITES = [
    {
      name: "star",
      lit: "#fff6d8",
      ink: "#f2dfa4",
      dim: "#b9a065",
      rows: ["....+....", "....#....", "..+####..", "...+##-..", "..+#.#-..", ".+#...#-.", ".#.....-.", ".........", "........."],
    },
    {
      name: "moon",
      lit: "#f4f8ff",
      ink: "#d3ddef",
      dim: "#8d9ab4",
      rows: ["..++##...", ".++..##..", "+#....-..", "+#.......", "+#.......", "+#....-..", ".##..--..", "..####...", "........."],
    },
    {
      name: "leaf",
      lit: "#c8ecbe",
      ink: "#8fc98a",
      dim: "#4f8a55",
      rows: ["......++.", ".....+##.", "...++##..", "..+###-..", ".+###-...", "+###-....", "##--.....", ".-.......", "-........"],
    },
    {
      name: "bird",
      lit: "#eaf3ff",
      ink: "#bcd2ea",
      dim: "#7b93b2",
      rows: [".........", "..++.....", ".+###..##", "+#######-", ".+#####-.", "..+###-..", "...##....", ".........", "........."],
    },
    {
      name: "fish",
      lit: "#c9ecfa",
      ink: "#87c4dd",
      dim: "#4b87a3",
      rows: [".........", "...+##...", "..+###-.#", ".+##.###-", "..+#####-", "...+###-.", "....##-..", ".........", "........."],
    },
    {
      name: "flower",
      lit: "#ffd9e6",
      ink: "#eda6c0",
      dim: "#a86583",
      rows: ["..+.+....", ".+####-..", "..+##-...", ".+####-..", "..+.#-...", "...#.....", "...#.....", "..##.....", "...-....."],
    },
    {
      name: "cloud",
      lit: "#ffffff",
      ink: "#dbe6f3",
      dim: "#93a4bb",
      rows: [".........", "...++#...", "..+####..", ".+######-", "+#######-", ".-#####--", ".........", ".........", "........."],
    },
    {
      name: "circle",
      lit: "#e8eefa",
      ink: "#b9c6da",
      dim: "#77869c",
      rows: ["..++##...", ".+#...#-.", "+#.....-.", "+.......-", "+.......-", "#.......-", "##.....--", ".##...--.", "..####..."],
    },
    {
      name: "dash",
      lit: "#dfe8f5",
      ink: "#a9b7cb",
      dim: "#6d7c92",
      rows: [".........", ".........", ".........", "++.++.++.", "##.##.##.", "--.--.--.", ".........", ".........", "........."],
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

  function draw(sprite, x, y, rot, alpha, scale, grounded) {
    var rows = sprite.rows;
    var s = PX * (scale || 1);
    var half = (rows[0].length * s) / 2;

    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    ctx.globalAlpha = alpha;

    /* ── THE CONTACT SHADOW ────────────────────────────────────────────
       Only once it has landed. A shadow under a thing in mid-air is the
       tell that the shadow is painted on the sprite rather than cast by
       it, and these spend half their life falling. */
    if (grounded) {
      ctx.save();
      ctx.globalAlpha = alpha * 0.34;
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.ellipse(0, half * 0.92, half * 0.78, s * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    /* One pass per tone rather than one fillStyle change per pixel: eighty
       sprites of eighty cells is 6,400 state changes a frame the other way
       round, and this is three. */
    var TONES = [
      ["-", sprite.dim || sprite.ink],
      ["#", sprite.ink],
      ["+", sprite.lit || sprite.ink],
    ];
    for (var t = 0; t < TONES.length; t++) {
      var sym = TONES[t][0];
      ctx.fillStyle = TONES[t][1];
      for (var r = 0; r < rows.length; r++) {
        var row = rows[r];
        for (var c = 0; c < row.length; c++) {
          if (row[c] === sym) ctx.fillRect(Math.round(c * s - half), Math.round(r * s - half), s, s);
        }
      }
    }
    ctx.restore();
  }

  /* ══ THE LEDGES ════════════════════════════════════════════════════════
     Sid: "I wanted the pixel icons, if I send them on the same spot, to stack
     up on each other like Candy Crush, and if you can make them have real
     physics and interact with other images and titles and everything on the
     page that is a super plus."

     Both halves are the same problem: an object needs to know what is under
     it. So once per burst the page is measured into a list of horizontal
     ledges -- the TOP edge of every heading, picture and card currently near
     the viewport -- in DOCUMENT coordinates. A falling sprite lands on the
     highest ledge whose span it is over, or on the tops of sprites already
     resting there, or on the floor.

     WHY DOCUMENT COORDINATES AND NOT SCREEN. The canvas is fixed, so the
     obvious thing is to work in viewport space. That falls apart the moment
     you scroll: a pile resting on a heading would slide off it, because the
     heading moved and the pile did not. Everything here is stored against the
     page and drawn at `y - scrollY`, so a sprite sitting on a title stays on
     that title for as long as the title exists.

     Measured once per click rather than per frame. Reading the geometry of a
     hundred elements every frame is a forced layout every frame, and the page
     does not move underneath a falling object often enough to matter. */
  var LEDGE_SEL = "h1, h2, h3, .wk-card, .cs-grid-item, figure, .proj-cover, .sid-tile, blockquote";
  var ledges = [];

  function measureLedges() {
    ledges = [];
    var vy = window.scrollY || window.pageYOffset || 0;
    var top = vy - 200,
      bot = vy + innerHeight + 900;
    var els = document.querySelectorAll(LEDGE_SEL);
    for (var i = 0; i < els.length && ledges.length < 90; i++) {
      var r = els[i].getBoundingClientRect();
      if (r.width < 60 || r.height < 12) continue;
      var y = r.top + vy;
      if (y < top || y > bot) continue;
      ledges.push({ x0: r.left, x1: r.right, y: y });
    }
    /* Highest first, so the search below can stop at the first hit. */
    ledges.sort(function (a, z) {
      return a.y - z.y;
    });
  }

  /* What is under this object, in document space. Returns the surface Y it
     will come to rest on. */
  function surfaceUnder(o) {
    var half = (o.sprite.rows[0].length * PX) / 2;
    var best = docFloor();
    /* Page furniture. */
    for (var i = 0; i < ledges.length; i++) {
      var L = ledges[i];
      if (o.x < L.x0 - half || o.x > L.x1 + half) continue;
      /* Only a ledge that is BELOW where the object currently is can catch
         it; otherwise a sprite spawned under a heading teleports up onto it. */
      if (L.y < o.y - 4) continue;
      if (L.y < best) best = L.y;
    }
    /* And anything already resting. This is the stacking: a sprite landing
       where another one sits comes to rest on its shoulders, so clicking the
       same spot builds a column. */
    for (var j = 0; j < piled.length; j++) {
      var q = piled[j];
      if (Math.abs(q.x - o.x) > half * 1.5) continue;
      var top2 = q.y - half * 1.9;
      if (top2 < o.y - 4) continue;
      if (top2 < best) best = top2;
    }
    return best;
  }

  function docFloor() {
    /* The bottom of the document, not the bottom of the window: a pile that
       formed near the top of a long page should still be there, on the same
       line, when you scroll back. */
    return (window.scrollY || 0) + innerHeight - 26;
  }

  /* Capped. A page that accumulates every sprite you ever dropped is litter,
     which is the reason the old version faded them out. Sixty is more than
     anybody will make by accident and cheap to draw. */
  var MAX_PILE = 60;
  var piled = [];

  function frame() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    var vy = window.scrollY || window.pageYOffset || 0;

    for (var i = live.length - 1; i >= 0; i--) {
      var o = live[i];
      o.age += 1;

      /* A short pop upward before gravity takes it. Something that falls the
         instant you click reads as dropped; a beat of rise reads as
         released. */
      o.vy += 0.42;
      o.x += o.vx;
      o.y += o.vy;
      o.rot += o.spin;
      o.vx *= 0.995;

      var floor = surfaceUnder(o);
      if (o.y >= floor) {
        o.y = floor;
        /* One small bounce, damped hard. Two bounces is a ball; one is
           weight. */
        if (Math.abs(o.vy) > 3.2) {
          o.vy = -o.vy * 0.3;
          o.vx *= 0.7;
          o.spin *= 0.5;
        } else {
          /* It settles almost flat rather than at whatever angle it stopped
             at, but not exactly flat: a pile in which every piece is level is
             a stack of coins, and these are things that fell. */
          o.vy = 0;
          o.rot = (Math.random() - 0.5) * 0.22;
          piled.push(o);
          if (piled.length > MAX_PILE) piled.shift();
          live.splice(i, 1);
        }
      }
    }

    /* Drawn after the falling ones are resolved so a sprite that landed this
       frame is not drawn twice. */
    for (var k = 0; k < piled.length; k++) {
      var q = piled[k];
      var sy = q.y - vy;
      if (sy < -60 || sy > innerHeight + 60) continue;
      draw(q.sprite, q.x, sy, q.rot, 1, 1, true);
    }
    for (var m = 0; m < live.length; m++) {
      var f = live[m];
      draw(f.sprite, f.x, f.y - vy, f.rot, 1, 1, false);
    }

    /* The loop keeps running while anything is falling, and one more frame
       whenever the page scrolls, because the pile has to be redrawn at its
       new screen position. */
    if (live.length || piled.length) raf = requestAnimationFrame(frame);
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
      measureLedges();
      live.push({
        sprite: sprite,
        x: e.clientX,
        /* Document space. See the note on measureLedges. */
        y: e.clientY + (window.scrollY || 0),
        vx: (Math.random() - 0.5) * 2.4,
        vy: -4.2 - Math.random() * 2,
        rot: (Math.random() - 0.5) * 0.5,
        spin: (Math.random() - 0.5) * 0.09,
        age: 0,
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
      measureLedges();
    },
    { passive: true }
  );

  /* The pile is stored against the page, so scrolling has to repaint it at
     its new screen position. Only while there is something to paint. */
  addEventListener(
    "scroll",
    function () {
      if ((live.length || piled.length) && !raf) raf = requestAnimationFrame(frame);
    },
    { passive: true }
  );

  /* The footer asks for these, and for the sprite table so it can draw them
     the same way rather than keeping a second copy. */
  window.__collected = function () {
    return { got: got.slice(), sprites: SPRITES };
  };
})();
