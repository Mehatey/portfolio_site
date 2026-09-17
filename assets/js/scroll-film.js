/* ─────────────────────────────────────────────────────────────────────────
   HOW MUCH OF THE CASE STUDY IS LEFT, AS PICTURES

   Sid, with a reference site: "i wanted an image thumbnail subtle to show how
   much of the scroll is left like on this site."

   A progress BAR answers that question with a number nobody can picture. A
   column of the page's own images answers it with the thing the reader is
   actually deciding about: how much work is still to come, and whether it
   looks worth staying for. On a case study that runs eleven thousand pixels
   that is a different and much more useful question.

   ── WHAT IT IS ──────────────────────────────────────────────────────────
   One narrow fixed column on the right edge holding a miniature of every
   media block on the page, in order, at the proportions they actually have.
   A frame marks where the window currently is. Clicking a thumbnail scrolls
   to that block.

   ── WHY IT IS BUILT FROM THE PAGE AND NOT FROM DATA ─────────────────────
   Because it has to stay true. A hand-listed set of thumbnails is a second
   copy of the page's contents that goes stale the first time an image is
   added, and this site has fifteen case studies. It reads the DOM once on
   load, so it is correct by construction.

   ── AND IT IS QUIET ─────────────────────────────────────────────────────
   At rest it sits at a low opacity and is not interactive. It comes up while
   the page is moving and fades a beat after it stops, so it is present when
   you are travelling and gone when you are reading -- which is the whole
   argument for it being pictures rather than a bar. A permanent strip of
   thumbnails down the edge of every case study would be a filmstrip
   competing with the film.
   ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  if (!window.matchMedia) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  /* No hover to reveal it and no room for it. A 26px column on a 390px screen
     is 7% of the width for something nobody asked to see. */
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.innerWidth < 1200) return;

  var body = document.querySelector(".proj-body");
  if (!body) return;

  /* Every block that is a picture of the work. Captions, prose and the
     handover panel are deliberately not included: this is a map of the
     visual story, and putting text blocks in it makes it a table of
     contents, which the page already decided it did not want. */
  var blocks = [].slice.call(body.querySelectorAll(".cs-bleed, .cs-bleed-full, .cs-grid, .cs-grid-3, .cs-wide, .cs-pair, .cs-split"));
  if (blocks.length < 4) return;

  var rail = document.createElement("nav");
  rail.className = "sfilm";
  rail.setAttribute("aria-label", "Jump through the visual story");

  var shots = [];
  blocks.forEach(function (b, i) {
    /* The first image or video poster inside the block. A block with no
       picture in it is skipped rather than drawn as an empty box. */
    var media = b.querySelector("img, video");
    if (!media) return;
    /* ── FINDING THE PICTURE IS THE WHOLE PROBLEM ──────────────────────
       First pass read `poster || currentSrc || src` and silently produced no
       rail at all on /encoded/ and /bloom/, which both have eleven and ten
       media blocks. Their videos carry no `src` attribute -- the file is on a
       child <source>, which is the correct way to offer more than one format
       and the way half this site is authored. `currentSrc` is empty too until
       the video has actually selected a source, and these are `preload=none`.

       So the lookup walks the same ladder a browser does, and falls back to
       any <img> anywhere in the block, which covers the case where the first
       media element is a video that has not resolved yet. */
    var src = media.getAttribute("poster") || media.currentSrc || media.getAttribute("src") || media.getAttribute("data-src") || "";
    if (!src) {
      /* Any real image in the block, which covers a video that has not
         resolved a source yet. */
      var anyImg = b.querySelector("img");
      if (anyImg) src = anyImg.currentSrc || anyImg.getAttribute("src") || "";
    }
    /* A source's own file, last. On this site videos are lazy and the path
       sits on `data-src` of the <source>, not on the <video> -- which is why
       the first version of this produced no rail at all on /encoded/ and
       /bloom/: eleven and ten media blocks, one resolvable image between
       them, and a `shots.length < 4` bail that looked like the feature simply
       not existing. */
    if (!src) {
      var srcEl = b.querySelector("source");
      if (srcEl) src = srcEl.getAttribute("src") || srcEl.getAttribute("data-src") || "";
    }
    /* A video file is not a picture. Rather than set an .mp4 as a background
       and get an empty box, the cell is drawn as a blank frame -- it still
       marks a stop in the strip and still says how long the page is, which is
       most of the job. A filmstrip with a few unexposed frames is better than
       no filmstrip on the two most video-heavy case studies. */
    var isVideoFile = /\.(mp4|webm|mov)(\?|$)/i.test(src);
    if (isVideoFile) src = "";

    var cell = document.createElement("button");
    cell.type = "button";
    cell.className = "sfilm__cell" + (src ? "" : " is-blank");
    if (src) cell.style.backgroundImage = "url(" + src + ")";
    cell.setAttribute("aria-label", "Go to visual " + (i + 1) + " of " + blocks.length);
    cell.addEventListener("click", function () {
      b.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    rail.appendChild(cell);
    shots.push({ el: cell, block: b, media: media, filled: !!src });
  });
  if (shots.length < 4) return;

  /* ── AN UNEXPOSED FRAME IS STILL A BLANK FRAME ────────────────────────
     Sid: "the preview thumbnail is not loaded on the right."

     Measured across three case studies: /mool/ 0 blank of 11, /illustrations/
     1 of 20, and /cube-guy/ 33 of 39. The rule above draws a video file as a
     blank cell rather than setting an .mp4 as a background image, which is
     correct as far as it goes -- but on a page that is 85% video it produces
     a strip of empty boxes, which is what he is looking at.

     A video that is playing has the picture already. These autoplay when they
     reach the viewport, so by the time a reader is anywhere near one there is
     a decoded frame sitting in it, and one 26x36 drawImage is the whole cost
     of getting it out. Each cell is filled once, the first time its video has
     enough data, and then never looked at again.

     `willReadFrequently` is not set because nothing is read back -- the canvas
     goes straight to a data URL. The size is the cell's, not the video's, so
     the string stays small. */
  (function fillBlanks() {
    var pending = shots.filter(function (s) {
      return !s.filled && s.media && s.media.tagName === "VIDEO";
    });
    if (!pending.length) return;

    var cv = document.createElement("canvas");
    cv.width = 52;
    cv.height = 72;
    var cx = cv.getContext("2d");

    function grab(s) {
      var v = s.media;
      /* HAVE_CURRENT_DATA. Anything less and drawImage paints nothing, which
         would burn the one attempt this cell gets. */
      if (!v || v.readyState < 2 || s.filled) return false;
      try {
        cx.drawImage(v, 0, 0, cv.width, cv.height);
        s.el.style.backgroundImage = "url(" + cv.toDataURL("image/jpeg", 0.6) + ")";
        s.el.classList.remove("is-blank");
        s.filled = true;
        return true;
      } catch (e) {
        /* A cross origin frame taints the canvas. Nothing to do but leave the
           cell blank, which is where it already was. */
        s.filled = true;
        return false;
      }
    }

    function sweep() {
      for (var i = pending.length - 1; i >= 0; i--) if (grab(pending[i])) pending.splice(i, 1);
      if (!pending.length && iv) {
        clearInterval(iv);
        iv = 0;
      }
    }
    /* Twice a second while there is anything left, and it stops itself. A
       video only has a frame once it has been near the viewport, so this is
       waiting on the reader rather than on the network. */
    var iv = setInterval(sweep, 500);
    setTimeout(function () {
      if (iv) {
        clearInterval(iv);
        iv = 0;
      }
    }, 120000);
    sweep();
  })();

  var frame = document.createElement("span");
  frame.className = "sfilm__view";
  frame.setAttribute("aria-hidden", "true");
  rail.appendChild(frame);
  document.body.appendChild(rail);

  var raf = 0;
  var hideT = 0;
  var current = -1;

  function paint() {
    raf = 0;
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    if (docH <= 0) return;
    var p = Math.max(0, Math.min(1, window.scrollY / docH));

    /* The frame is the window, drawn at the same proportion of the rail that
       the window is of the document -- so its size says how long the page is
       and its position says where you are. Both are facts the reader can use;
       a dot would only give the second. */
    var railH = rail.clientHeight;
    var fh = Math.max(18, (window.innerHeight / document.documentElement.scrollHeight) * railH);
    frame.style.height = fh.toFixed(1) + "px";
    frame.style.transform = "translateY(" + (p * (railH - fh)).toFixed(1) + "px)";

    /* Which block the middle of the window is nearest. Marking the one in
       view rather than the one at the top stops the highlight flickering
       between two blocks at a boundary. */
    var mid = window.scrollY + window.innerHeight / 2;
    var best = 0,
      bestD = Infinity;
    for (var i = 0; i < shots.length; i++) {
      var r = shots[i].block.getBoundingClientRect();
      var c = r.top + window.scrollY + r.height / 2;
      var d = Math.abs(c - mid);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    if (best !== current) {
      if (shots[current]) shots[current].el.classList.remove("is-here");
      shots[best].el.classList.add("is-here");
      current = best;
    }
  }

  function onScroll() {
    rail.classList.add("is-live");
    clearTimeout(hideT);
    hideT = setTimeout(function () {
      rail.classList.remove("is-live");
    }, 900);
    if (!raf) raf = requestAnimationFrame(paint);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    if (!raf) raf = requestAnimationFrame(paint);
  });
  /* Hovering the rail holds it open, or a reader reaching for a thumbnail
     watches it fade out from under the cursor. */
  rail.addEventListener("pointerenter", function () {
    clearTimeout(hideT);
    rail.classList.add("is-live");
  });
  rail.addEventListener("pointerleave", onScroll);
  paint();
})();
