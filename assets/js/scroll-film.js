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
    var src = media.getAttribute("poster") || media.currentSrc || media.getAttribute("src");
    if (!src) return;

    var cell = document.createElement("button");
    cell.type = "button";
    cell.className = "sfilm__cell";
    cell.style.backgroundImage = "url(" + src + ")";
    cell.setAttribute("aria-label", "Go to visual " + (i + 1) + " of " + blocks.length);
    cell.addEventListener("click", function () {
      b.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    rail.appendChild(cell);
    shots.push({ el: cell, block: b });
  });
  if (shots.length < 4) return;

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
