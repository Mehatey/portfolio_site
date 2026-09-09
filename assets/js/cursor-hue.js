/* ─────────────────────────────────────────────────────────────────────────
   THE CURSOR READS WHAT IT IS POINTING AT, AND SAYS SOMETHING ABOUT IT

   Sid: "enable that hover colour pixel colour blocks idea across all images
   and hover states of the cursor on the site. Live squares that animate with
   colours of the image or model or thing the cursor is hovering on is a good
   and creative way to use the cursor as an intelligent being. And also the
   cursor can have those animated chat bubbles which emerge from it, not
   button-like pill but a creative voice box with personality. This is first
   person talking from the cube's perspective, adding a little more personal
   guide to the user than what the text or the visuals already show. Like a
   supporting intelligent cursor is what I am going for."

   ── THIS REVERSES AN EARLIER DECISION ON PURPOSE ────────────────────────
   cube_says.html carries Sid's own instruction from before: "We don't do the
   interesting cursor thing. We just show it up there on the top between the
   nav bar and the cube logo. The cursor-on-hover thing looks weird and feels
   strange." That version was a TOOLTIP — a plate with a sentence in it,
   trailing the pointer, competing with the thing it described. He is asking
   for something else now and has asked for it twice: a character that has an
   opinion. So the line in the bar stays exactly where it is on the work
   cards, and this is the other half — colour, and a voice with a shape.

   ── THE CHIPS LIVE BESIDE THE MARK, NOT HERE ────────────────────────────
   They were in the bubble once. Sid: "I like the chat cursor bubble but I
   don't want the colours there too, I want them just next to the logo." So
   the squares are drawn by cube_says.html at the mark, and this file is the
   voice alone -- which is also why it now says nothing at all unless a line
   was written for the thing under the pointer.

   ── WHY IT DOES NOT FOLLOW THE POINTER EXACTLY ──────────────────────────
   A label welded to the cursor is a tooltip and reads as chrome. This lags
   on a spring and settles a little behind and above, so it arrives as
   something that came WITH you rather than something attached to you. It
   also means a fast sweep across a grid never has the panel keeping up, so
   sweeping does not fire sixteen readings.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  if (!window.matchMedia) return;
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  /* No room for it beside a pointer on a small window, and the panel would
     spend half its life clamped against an edge. */
  if (window.innerWidth < 1100) return;

  var HOLD = 150; // pointer must rest this long before anything appears

  /* What counts as a thing worth reading. Deliberately not every <img> on
     the page: the logo wall, the marquee monograms and the nav icons are
     furniture, and a cursor that reacts to furniture is noise rather than
     intelligence. */
  var SEL = ".wk-card, .sid-tile, .cs-grid-item, .cs-bleed, .cs-bleed-full, .gal-item, .proj-cover, figure.cs-fig, .kts__item";
  var SKIP = ".m-logo, .studio-mark, .logo-cube, .sfilm, .idle-drift";

  /* Same picture, same opinion, every time. A character whose remark on a
     thing changes each time you point at it is a random line generator, not
     a character. Hashing the source URL is what makes it consistent without
     storing anything. */
  function pick(list, seed) {
    var h = 0;
    for (var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return list[h % list.length];
  }

  /* ── IT ONLY SPEAKS WHEN IT HAS SOMETHING TO SAY ─────────────────────
     Sid: "i dont want the hover tooltip of the cursor to be on each and every
     small thing it should only be for imp things half the times the tooltip
     text doesnt make sense."

     Both halves of that were the same defect. The cursor used to fall back to
     a generated line about colour temperature whenever the thing under it had
     no authored copy -- four families, warm/cool/pale/mixed, picked by
     sampling the picture. It fired on every tile on the site, which is the
     "each and every small thing", and it produced things like "Restrained.
     Almost nothing in it." over a photograph of somebody jumping against a
     blue sky, which is the half that does not make sense. A remark derived
     from a histogram is not an observation; it only ever looked like one.

     So the generator is gone, and the rule is now simply: the cube speaks
     where Sid has written a line for it in _data/works.yml, and nowhere else.
     That is the definition of "important things" the page can actually
     enforce. The colour reading it used to narrate has not been lost -- it
     still runs, as squares beside the mark, which is where he asked for the
     colour to live and where it needs no words. */

  /* ── AND WHEN THE CUBE HAS SOMETHING BETTER TO SAY ────────────────────
     Every work card carries `data-cube`: one line per project, written by
     Sid in _data/works.yml, in the cube's own voice ("Most banks speak only
     to those who already have"). Those used to print in the top bar, and Sid
     has asked for the top left to be empty and for everything to come from
     the cursor -- so they come here instead.

     His writing beats a generated line about temperature every time, so it
     wins when it exists. The colour aside is what the cube says about
     everything else on the site, which is most of it. */
  function lineFor(el) {
    var owner = el.closest && el.closest("[data-cube]");
    return (owner && (owner.getAttribute("data-cube") || "").trim()) || "";
  }

  /* ── THE PANEL ────────────────────────────────────────────────────────── */
  var box = document.createElement("div");
  box.className = "curhue";
  box.setAttribute("aria-hidden", "true");
  /* ── THE BUBBLE IS ONLY THE VOICE NOW ─────────────────────────────────
     Sid: "I like the chat cursor bubble but I don't want the colours there
     too, I want them just next to the logo."

     He is right that it was saying the same thing twice: the chips beside the
     mark and the chips in the bubble were the same read of the same picture,
     eighteen inches apart. The mark keeps the colour, the cursor keeps the
     voice, and each does one job. */
  box.innerHTML = '<span class="curhue__say"></span>';
  var sayEl = box.querySelector(".curhue__say");
  var mounted = false;

  var mx = 0,
    my = 0,
    px = 0,
    py = 0,
    raf = 0,
    shown = false;
  var holdT = 0,
    current = null;

  function frame() {
    raf = 0;
    /* A spring, not a follow. 0.16 is slow enough that the panel is visibly
       arriving rather than welded on, fast enough that it never feels lost. */
    px += (mx - px) * 0.16;
    py += (my - py) * 0.16;
    box.style.transform = "translate3d(" + px.toFixed(1) + "px," + py.toFixed(1) + "px,0)";
    if (Math.abs(mx - px) > 0.4 || Math.abs(my - py) > 0.4) raf = requestAnimationFrame(frame);
  }

  function place(x, y) {
    /* Up and to the right of the pointer, flipped near the edges so it is
       never clamped against one. The panel is measured rather than assumed
       because its width is the length of whatever the cube just said. */
    var w = box.offsetWidth || 240;
    var h = box.offsetHeight || 40;
    var nx = x + 22;
    var ny = y - h - 16;
    if (nx + w > window.innerWidth - 16) nx = x - w - 22;
    if (ny < 12) ny = y + 26;
    mx = nx;
    my = ny;
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function show(el) {
    var img = window.SidHue && window.SidHue.pictureIn(el);
    /* The decode wait below is kept even though the panel no longer samples
       the picture: `show` is also what re-runs after a lazy image lands, and
       the chips beside the mark are read on the same pointer event. */
    /* Lazy pictures and video posters are routinely not decoded on the frame
       the pointer arrives. Wait for the one we were handed and come back,
       rather than reading nothing and never asking again. */
    if (img && (!img.complete || !img.naturalWidth)) {
      img.addEventListener(
        "load",
        function () {
          if (current === el) show(el);
        },
        { once: true }
      );
      return;
    }
    /* Nothing written for this one, so nothing is said. Checked before the
       panel is mounted rather than after, or an empty bubble flashes in and
       out on every uncaptioned tile the pointer crosses. */
    var line = lineFor(el);
    if (!line) return;

    if (!mounted) {
      document.body.appendChild(box);
      mounted = true;
    }

    sayEl.textContent = line;

    /* Jumped to the pointer on the first frame it is shown, or the panel
       flies in from wherever it was last dismissed. */
    if (!shown) {
      px = mx;
      py = my;
    }
    shown = true;
    box.classList.add("is-in");
    place(lastX, lastY);
  }

  function hide() {
    if (!shown) return;
    shown = false;
    current = null;
    box.classList.remove("is-in");
  }

  var lastX = 0,
    lastY = 0;

  document.addEventListener(
    "pointermove",
    function (e) {
      lastX = e.clientX;
      lastY = e.clientY;
      if (shown) place(lastX, lastY);

      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest(SKIP)) {
        clearTimeout(holdT);
        hide();
        return;
      }
      var el = t.closest(SEL);
      if (!el) {
        clearTimeout(holdT);
        holdT = setTimeout(hide, 120);
        return;
      }
      if (el === current) return;
      current = el;
      clearTimeout(holdT);
      holdT = setTimeout(function () {
        if (current === el) show(el);
      }, HOLD);
    },
    { passive: true }
  );

  /* Reading is not looking. While the page is moving the panel goes away, or
     scrolling past a grid drags a colour readout down the screen with it. */
  window.addEventListener(
    "scroll",
    function () {
      clearTimeout(holdT);
      current = null;
      hide();
    },
    { passive: true }
  );
  window.addEventListener("blur", hide);
  document.addEventListener("pointerdown", hide, { passive: true });
})();
