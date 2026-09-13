/* ══ THE RECORD IN THE CORNER ═══════════════════════════════════════════
   A record player for the cube's room. It is deliberately the second thing
   in here: the cube is what the page is about, so the disc sits in the far
   corner at a size you notice on the way past rather than one that asks to
   be dealt with first.

   Everything it reports, it reports without words. Which track is playing is
   a lit tick on a ring of seven. How much is left is how far the ring has
   filled. Whether it is playing is whether the disc is turning. A text
   readout would be a fourth thing to read on a page that already has a title,
   a question and an answer, and none of those three facts is worth a line of
   type when a shape will carry it.

   ── ON WHEN, EXACTLY ─────────────────────────────────────────────────────
   Sid's standing rule for the site is that nothing makes noise at a stranger
   unasked, and the browser's own autoplay policy says roughly the same thing
   in stricter language. Both are honoured the same way: the ambient bed comes
   up by itself only for a visitor who has already turned sound on elsewhere
   on the site (the shared `sid_sound` key), and for everyone else the first
   click on the disc is the ask. Nothing here ever plays before a gesture. */
(function () {
  "use strict";

  var BASE = "./audio/";
  /* Seven clips, each cut to about thirty seconds with a fade at both ends,
     loudness matched so skipping between them does not jump. `just-be` is the
     exception at ninety five seconds, because the thing Sid wants heard about
     that one happens in the first minute and a half. */
  var TRACKS = [
    { src: "music/lift-off.mp3", name: "Lift Off", hue: 196 },
    { src: "music/elysium.mp3", name: "Elysium", hue: 268 },
    { src: "music/enough.mp3", name: "Enough", hue: 22 },
    { src: "music/instructions-earth.mp3", name: "Instructions for Earth", hue: 146 },
    { src: "music/eternal-now.mp3", name: "The Eternal Now", hue: 44 },
    { src: "music/jaago.mp3", name: "Jaago", hue: 336 },
    {
      src: "music/just-be.mp3",
      name: "Just Be",
      hue: 168,
      /* The one track that gets a mark of its own. Sid: "the first one to two
         minutes will give you goosebumps." */
      seated: true,
      note: "Just Be · give the first minute a chance"
    }
  ];

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── MARKUP ──────────────────────────────────────────────────────────── */
  var root = document.createElement("div");
  root.className = "vinyl";
  root.innerHTML = [
    '<button class="vinyl__step vinyl__step--prev" type="button" aria-label="Previous track">',
    '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M8.4 2.2 4.1 6l4.3 3.8zM3.6 2.2h1V9.8h-1z"/></svg>',
    "</button>",
    '<div class="vinyl__deck">',
    '<canvas class="vinyl__levels" width="240" height="240" aria-hidden="true"></canvas>',
    '<svg class="vinyl__ring" viewBox="0 0 120 120" aria-hidden="true">',
    '<circle class="vinyl__ring-bed" cx="60" cy="60" r="55" />',
    '<circle class="vinyl__ring-fill" cx="60" cy="60" r="55" />',
    '<g class="vinyl__ticks"></g>',
    "</svg>",
    '<button class="vinyl__disc" type="button" aria-label="Play music">',
    '<span class="vinyl__label" aria-hidden="true"></span>',
    '<span class="vinyl__spindle" aria-hidden="true"></span>',
    "</button>",
    "</div>",
    '<button class="vinyl__step vinyl__step--next" type="button" aria-label="Next track">',
    '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.6 2.2 7.9 6l-4.3 3.8zM7.4 2.2h1V9.8h-1z"/></svg>',
    "</button>",
    '<span class="vinyl__seat" hidden aria-hidden="true">',
    '<svg viewBox="0 0 24 24"><path d="M12 3.4c1.5 1.6 2.2 3.2 2.2 4.8 0 1.6-.7 3.2-2.2 4.8-1.5-1.6-2.2-3.2-2.2-4.8 0-1.6.7-3.2 2.2-4.8zM5.2 8.1c2 .5 3.4 1.4 4.3 2.6.9 1.2 1.3 2.8 1.3 4.8-2-.5-3.4-1.4-4.3-2.6-.9-1.2-1.3-2.8-1.3-4.8zm13.6 0c0 2-.4 3.6-1.3 4.8-.9 1.2-2.3 2.1-4.3 2.6 0-2 .4-3.6 1.3-4.8.9-1.2 2.3-2.1 4.3-2.6zM3.6 17.2c1.9-.8 3.8-1.2 5.6-1.2 1.2 0 2.1.2 2.8.6.7-.4 1.6-.6 2.8-.6 1.8 0 3.7.4 5.6 1.2-1.9 2.2-4.6 3.3-8.4 3.3s-6.5-1.1-8.4-3.3z"/></svg>',
    "</span>",
    '<p class="vinyl__note" aria-hidden="true"></p>'
  ].join("");

  var css = [
    ".vinyl{position:fixed;right:clamp(18px,2.4vw,34px);bottom:clamp(18px,3vh,34px);z-index:4;",
    "display:flex;align-items:center;gap:6px;pointer-events:auto;",
    "font-family:'Helvetica Neue',Helvetica,Arial,sans-serif}",
    ".vinyl__deck{position:relative;width:clamp(74px,7.4vw,104px);aspect-ratio:1}",
    /* The disc itself: grooves as a repeating conic sheen over a dark body,
       with the track's own hue pooled in the label. No album art, because
       seven covers would be seven more images to load and seven more visual
       identities on a page that already has a character in it. */
    ".vinyl__disc{position:absolute;inset:6%;display:grid;place-items:center;padding:0;border:0;border-radius:50%;cursor:pointer;",
    "background:radial-gradient(circle at 50% 50%,#12171d 0 30%,#090c11 30% 100%),",
    "repeating-conic-gradient(from 0deg,rgba(255,255,255,.045) 0deg 2deg,rgba(0,0,0,0) 2deg 6deg);",
    "box-shadow:0 10px 30px -12px rgba(0,0,0,.9),inset 0 0 0 1px rgba(190,225,240,.10);",
    "transition:box-shadow .4s ease,transform .4s cubic-bezier(.16,1,.3,1)}",
    ".vinyl__disc:before{content:'';position:absolute;inset:0;border-radius:50%;pointer-events:none;",
    /* the light raking across a turning record */
    "background:conic-gradient(from 210deg,rgba(255,255,255,0) 0deg,rgba(255,255,255,.09) 26deg,rgba(255,255,255,0) 64deg,rgba(255,255,255,0) 180deg,rgba(255,255,255,.06) 210deg,rgba(255,255,255,0) 250deg)}",
    ".vinyl__label{position:relative;width:42%;aspect-ratio:1;border-radius:50%;",
    "background:radial-gradient(circle at 34% 30%,hsl(var(--vin-h,196) 74% 66%/.92),hsl(var(--vin-h,196) 62% 40%/.72) 52%,hsl(var(--vin-h,196) 58% 22%/.86) 100%);",
    "box-shadow:0 0 18px -4px hsl(var(--vin-h,196) 80% 60%/.42);transition:background .9s ease,box-shadow .9s ease}",
    ".vinyl__spindle{position:absolute;width:7%;aspect-ratio:1;border-radius:50%;background:#05070b;box-shadow:inset 0 0 0 1px rgba(190,225,240,.22)}",
    ".vinyl:hover .vinyl__disc,.vinyl__disc:focus-visible{transform:scale(1.03);box-shadow:0 14px 38px -12px rgba(0,0,0,.95),inset 0 0 0 1px hsl(var(--vin-h,196) 70% 60%/.5)}",
    ".vinyl__disc:focus-visible{outline:2px solid hsl(var(--vin-h,196) 76% 64%);outline-offset:3px}",
    ".vinyl.is-playing .vinyl__disc{animation:vinyl-spin 3.4s linear infinite}",
    "@keyframes vinyl-spin{to{transform:rotate(1turn)}}",
    ".vinyl.is-playing:hover .vinyl__disc{animation-play-state:running}",
    /* The ring: bed, fill and seven ticks. Rotated so zero is at the top. */
    ".vinyl__ring{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);overflow:visible;pointer-events:none}",
    ".vinyl__ring circle{fill:none;stroke-linecap:round}",
    ".vinyl__ring-bed{stroke:rgba(190,225,240,.12);stroke-width:1.5}",
    ".vinyl__ring-fill{stroke:hsl(var(--vin-h,196) 78% 66%);stroke-width:2.2;",
    "stroke-dasharray:345.6;stroke-dashoffset:345.6;filter:drop-shadow(0 0 5px hsl(var(--vin-h,196) 80% 60%/.55));",
    "transition:stroke-dashoffset .28s linear,stroke .9s ease}",
    ".vinyl__ticks circle{fill:rgba(190,225,240,.26);stroke:none;transition:fill .4s ease,r .4s ease}",
    ".vinyl__ticks circle.is-on{fill:hsl(var(--vin-h,196) 82% 70%);r:2.4}",
    /* Skip controls stay out of the way until the pointer is on the player.
       They are the part a visitor does not need to see to understand it. */
    ".vinyl__step{width:26px;height:26px;display:grid;place-items:center;padding:0;border:0;border-radius:50%;",
    "background:rgba(6,10,14,.5);color:rgba(238,246,247,.7);cursor:pointer;opacity:0;transform:scale(.7);",
    "transition:opacity .3s ease,transform .3s cubic-bezier(.16,1,.3,1),color .2s}",
    ".vinyl__step svg{width:11px;height:11px;fill:currentColor}",
    ".vinyl:hover .vinyl__step,.vinyl:focus-within .vinyl__step{opacity:1;transform:none}",
    ".vinyl__step:hover{color:#fff}",
    ".vinyl__step:focus-visible{opacity:1;transform:none;outline:2px solid hsl(var(--vin-h,196) 76% 64%);outline-offset:2px}",
    /* Levels: the disc is turning whether or not there is anything in the
       groove, so the loudness has to be drawn somewhere. Faint bars around
       the rim, tied to the analyser rather than to a clock. */
    ".vinyl__levels{position:absolute;inset:-16%;width:132%;height:132%;pointer-events:none;opacity:0;transition:opacity .6s ease}",
    ".vinyl.is-playing .vinyl__levels{opacity:.85}",
    /* The seated figure marks the one track with an instruction attached. */
    ".vinyl__seat{position:absolute;left:50%;bottom:calc(100% + 8px);width:19px;height:19px;transform:translateX(-50%);",
    "color:hsl(168 70% 68%);opacity:.5;pointer-events:none;transition:opacity .5s ease,filter .5s ease}",
    ".vinyl__seat svg{width:100%;height:100%;fill:currentColor}",
    ".vinyl.is-seated .vinyl__seat{opacity:1;filter:drop-shadow(0 0 9px hsl(168 76% 62%/.6));animation:vinyl-breathe 4.4s ease-in-out infinite}",
    "@keyframes vinyl-breathe{0%,100%{transform:translateX(-50%) scale(1)}50%{transform:translateX(-50%) scale(1.13)}}",
    ".vinyl__note{position:absolute;right:0;bottom:calc(100% + 30px);margin:0;width:max-content;max-width:min(230px,42vw);",
    "color:rgba(238,246,247,.82);font-size:10px;font-weight:600;letter-spacing:.06em;line-height:1.4;text-align:right;",
    "text-shadow:0 1px 12px rgba(0,0,0,.85);opacity:0;transform:translateY(4px);transition:opacity .4s ease,transform .4s ease;pointer-events:none}",
    ".vinyl.is-seated .vinyl__note,.vinyl:hover .vinyl__note{opacity:1;transform:none}",
    /* On a phone the conversation panel runs the full width of the bottom of
       the screen, so the corner the disc lives in on a desktop is occupied.
       It sits instead on the right edge just above the panel, which on this
       page is open sky: the title owns the top of the screen and the panel
       owns the bottom, and the gap between them is the only place a 54px disc
       can stand without covering one of them. The skip controls stay out
       rather than waiting on a hover a touch screen cannot give. */
    "@media(max-width:760px),(orientation:portrait) and (max-width:1024px){",
    ".vinyl{right:14px;bottom:calc(196px + env(safe-area-inset-bottom,0px));top:auto;gap:2px}",
    ".vinyl__deck{width:54px}.vinyl__step{width:32px;height:32px;opacity:1;transform:none}",
    ".vinyl__step svg{width:10px;height:10px}",
    ".vinyl__seat{bottom:calc(100% + 6px);top:auto}",
    ".vinyl__note{display:none}}",
    "@media(max-height:520px) and (orientation:landscape){.vinyl__note{display:none}}",
    "@media(prefers-reduced-motion:reduce){",
    ".vinyl.is-playing .vinyl__disc{animation:none}",
    ".vinyl.is-seated .vinyl__seat{animation:none}",
    ".vinyl__disc,.vinyl__step,.vinyl__ring-fill{transition:none}}",
    "@media print{.vinyl{display:none}}"
  ].join("");

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
  document.body.appendChild(root);

  var deck = root.querySelector(".vinyl__deck");
  var disc = root.querySelector(".vinyl__disc");
  var labelEl = root.querySelector(".vinyl__label");
  var fill = root.querySelector(".vinyl__ring-fill");
  var ticksG = root.querySelector(".vinyl__ticks");
  var seat = root.querySelector(".vinyl__seat");
  var noteEl = root.querySelector(".vinyl__note");
  var levels = root.querySelector(".vinyl__levels");
  var lctx = levels.getContext("2d");
  var CIRC = 2 * Math.PI * 55;

  /* Seven ticks around the ring, one per track, drawn where each track's
     share of the playlist begins. It is a progress bar and a table of
     contents in the same 100 pixels. */
  (function ticks() {
    var svgns = "http://www.w3.org/2000/svg";
    for (var i = 0; i < TRACKS.length; i++) {
      var a = (i / TRACKS.length) * Math.PI * 2;
      var c = document.createElementNS(svgns, "circle");
      c.setAttribute("cx", (60 + Math.cos(a) * 55).toFixed(2));
      c.setAttribute("cy", (60 + Math.sin(a) * 55).toFixed(2));
      c.setAttribute("r", "1.5");
      ticksG.appendChild(c);
    }
  })();
  var tickEls = ticksG.querySelectorAll("circle");

  /* ── PLAYBACK ────────────────────────────────────────────────────────── */
  var music = new Audio();
  music.preload = "none";
  music.crossOrigin = "anonymous";
  var ambient = new Audio(BASE + "ambient.mp3");
  ambient.loop = true;
  ambient.preload = "none";
  ambient.volume = 0;

  var idx = 0;
  var playing = false;
  var ac = null;
  var analyser = null;
  var bins = null;

  function wantsSound() {
    try {
      return localStorage.getItem("sid_sound") === "on";
    } catch (_) {
      return false;
    }
  }
  function remember(on) {
    try {
      localStorage.setItem("sid_sound", on ? "on" : "off");
    } catch (_) {}
  }

  /* The analyser is built on first play rather than up front: an AudioContext
     created before a gesture starts suspended and stays that way, and one
     created for a visitor who never presses play is a decoder held open for
     nothing. */
  function graph() {
    if (ac || !window.AudioContext) return;
    try {
      ac = new AudioContext();
      analyser = ac.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.78;
      bins = new Uint8Array(analyser.frequencyBinCount);
      var src = ac.createMediaElementSource(music);
      src.connect(analyser);
      analyser.connect(ac.destination);
    } catch (_) {
      /* Safari refuses a second source on the same element; the player still
         works, it just has no bars. */
      analyser = null;
    }
  }

  function paint(i) {
    var t = TRACKS[i];
    root.style.setProperty("--vin-h", String(t.hue));
    for (var k = 0; k < tickEls.length; k++) tickEls[k].classList.toggle("is-on", k === i);
    root.classList.toggle("is-seated", !!t.seated);
    seat.hidden = !t.seated;
    noteEl.textContent = t.note || "";
    disc.setAttribute("aria-label", (playing ? "Pause " : "Play ") + t.name);
  }

  function load(i, go) {
    idx = (i + TRACKS.length) % TRACKS.length;
    music.src = BASE + TRACKS[idx].src;
    fill.style.strokeDashoffset = String(CIRC);
    paint(idx);
    if (go) start();
  }

  function fade(el, to, ms) {
    var from = el.volume;
    var t0 = performance.now();
    (function tick(now) {
      var p = Math.min(1, (now - t0) / ms);
      el.volume = Math.max(0, Math.min(1, from + (to - from) * p));
      if (p < 1) requestAnimationFrame(tick);
      else if (to === 0) el.pause();
    })(t0);
  }

  function start() {
    graph();
    if (ac && ac.state === "suspended") ac.resume();
    music.volume = 0.72;
    var p = music.play();
    if (p && p.catch) p.catch(function () {});
    /* The bed sits under the music at a fifth of its level, so the room does
       not fall silent in the gap between one clip ending and the next
       starting. */
    if (ambient.paused) {
      ambient.play().then(
        function () {
          fade(ambient, 0.26, 1400);
        },
        function () {}
      );
    }
    playing = true;
    root.classList.add("is-playing");
    remember(true);
    paint(idx);
  }

  function pause() {
    music.pause();
    fade(ambient, 0, 900);
    playing = false;
    root.classList.remove("is-playing");
    remember(false);
    paint(idx);
  }

  function toggle() {
    if (playing) pause();
    else start();
  }

  disc.addEventListener("click", toggle);
  root.querySelector(".vinyl__step--next").addEventListener("click", function () {
    load(idx + 1, true);
  });
  root.querySelector(".vinyl__step--prev").addEventListener("click", function () {
    /* Back inside the first few seconds means the start of this track, the
       way it does on every other player anyone has used. */
    if (music.currentTime > 3) music.currentTime = 0;
    else load(idx - 1, true);
  });
  music.addEventListener("ended", function () {
    load(idx + 1, true);
  });

  /* Space toggles, arrows skip, but only when nothing else on the page wants
     the key: the cube owns Enter and Space while it has focus, and a visitor
     typing into the conversation should not be scrubbing a record. */
  document.addEventListener("keydown", function (e) {
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if (t && t.id === "stage") return;
    if (e.key === " " && !(t && t.classList && t.classList.contains("cube-note-chip"))) {
      e.preventDefault();
      toggle();
    } else if (e.key === "ArrowRight" && e.shiftKey) {
      load(idx + 1, true);
    } else if (e.key === "ArrowLeft" && e.shiftKey) {
      load(idx - 1, true);
    }
  });

  /* ── THE RING AND THE BARS ───────────────────────────────────────────── */
  (function frame() {
    requestAnimationFrame(frame);
    if (music.duration) {
      var p = music.currentTime / music.duration;
      fill.style.strokeDashoffset = (CIRC * (1 - p)).toFixed(1);
    }
    if (!playing || !analyser || reduced) {
      if (lctx && !playing) lctx.clearRect(0, 0, 240, 240);
      return;
    }
    analyser.getByteFrequencyData(bins);
    lctx.clearRect(0, 0, 240, 240);
    var n = 40;
    var h = TRACKS[idx].hue;
    lctx.strokeStyle = "hsl(" + h + " 80% 68% / 0.5)";
    lctx.lineWidth = 1.6;
    lctx.lineCap = "round";
    for (var i = 0; i < n; i++) {
      /* Mirrored around the vertical so the ring reads as one shape rather
         than as a strip that has been bent into a circle. */
      var b = bins[Math.round((Math.min(i, n - 1 - i) / (n / 2)) * (bins.length - 2))] / 255;
      var a = (i / n) * Math.PI * 2 - Math.PI / 2;
      /* Outside the progress ring, not on top of it. The ring is at 55 of a
         120 box and this canvas is 132% of the same square, which puts the
         ring at r=109 here; the bars start past it so the two read as two
         instruments rather than as one smeared one. */
      var r0 = 116;
      var r1 = 116 + b * 15;
      lctx.globalAlpha = 0.25 + b * 0.75;
      lctx.beginPath();
      lctx.moveTo(120 + Math.cos(a) * r0, 120 + Math.sin(a) * r0);
      lctx.lineTo(120 + Math.cos(a) * r1, 120 + Math.sin(a) * r1);
      lctx.stroke();
    }
    lctx.globalAlpha = 1;
  })();

  load(0, false);

  /* A visitor who already turned sound on somewhere else on the site has
     asked once and should not have to ask again. Everyone else gets a still
     disc until they press it. The gesture listener is here because even a
     remembered yes cannot beat the autoplay policy without one. */
  if (wantsSound()) {
    var once = function () {
      document.removeEventListener("pointerdown", once);
      document.removeEventListener("keydown", once);
      if (!playing) start();
    };
    document.addEventListener("pointerdown", once, { once: true });
    document.addEventListener("keydown", once, { once: true });
  }

  window.sidVinyl = {
    play: start,
    pause: pause,
    next: function () {
      load(idx + 1, true);
    },
    state: function () {
      return { playing: playing, track: TRACKS[idx].name, index: idx };
    }
  };
})();
