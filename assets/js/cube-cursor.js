/* cube-cursor.js — the cube reacts to what you are pointing at.
 *
 * Sid: "what if we made the cube speech emerge from the cursor ... for each
 * page or when you hover on something it tells about it. like an intelligent
 * cursor."
 *
 * THE RULE THIS NEARLY BREAKS. cube_says.html carries the standing note: no
 * narrator text, no grey voice explaining a piece to the person already
 * looking at it, and nothing that feels like a tooltip. A cursor that tells
 * you about whatever it touches is, mechanically, a tooltip system, and
 * "Mool, a neobanking platform for underserved communities" is narrator text
 * with a pointer attached. It would be the worst thing on the page.
 *
 * The distinction that saves it is the one already written down there: the
 * cube OBSERVES, it never DESCRIBES. It is allowed to know something the
 * visitor does not and be dry about it. So the lines in _data/works.yml are
 * remarks, not captions, and a card with nothing worth remarking on stays
 * silent rather than getting a summary.
 *
 * FOUR THINGS KEEP IT FROM BECOMING CHROME.
 *
 *   Curated.     Only [data-cube] speaks. Most of the page does not.
 *   Rationed.    MAX_LINES per page load, then it is quiet for good.
 *   Spaced.      MIN_GAP between lines, so a sweep across a grid does not
 *                fire a run of them.
 *   Still.       The line is placed once, at the pointer, and then HOLDS.
 *                Text pinned to a moving cursor cannot be read until you
 *                stop moving, and CustomCursor already draws a five-point
 *                trail there; a caption chasing that is two moving things
 *                in the same 40px.
 *
 * It also never speaks over a control. Anything carrying [data-tip] has a
 * functional label already (Theme, Close, a company name) and two hover-text
 * systems firing in the same place is the mess this is meant to avoid.
 */
(function () {
  "use strict";

  /* No pointer, no cursor to be intelligent about. Touch gets nothing, the
     same as the tooltips. */
  if (!window.matchMedia || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var MAX_LINES = 4; /* per page load, then silent */
  var MIN_GAP = 900; /* ms between two lines */
  var INTENT = 200; /* ms of dwell before it speaks at all */
  var DWELL = 3400; /* ms the line stays up */
  var OFF_X = 26;
  var OFF_Y = 22;

  var spoken = 0;
  var lastAt = 0;
  var timer = 0;
  var hideTimer = 0;
  var node = null;

  function ensure() {
    if (node) return node;
    node = document.createElement("div");
    node.id = "cube-cursor";
    node.setAttribute("aria-hidden", "true"); /* the card's own text is the accessible name */
    document.body.appendChild(node);
    return node;
  }

  function hide() {
    if (!node) return;
    node.classList.remove("is-in");
  }

  function speak(text, x, y) {
    var el = ensure();
    el.textContent = text;

    /* Place once, then hold. Flip to the other side of the pointer when the
       line would otherwise run off the viewport, measured rather than
       assumed: the remarks vary from four words to eleven. */
    el.classList.add("is-measuring");
    var w = el.offsetWidth || 240;
    var h = el.offsetHeight || 24;
    el.classList.remove("is-measuring");

    var left = x + OFF_X;
    var top = y + OFF_Y;
    if (left + w > window.innerWidth - 16) left = x - w - OFF_X;
    if (top + h > window.innerHeight - 16) top = y - h - OFF_Y;
    el.style.left = Math.max(8, left) + "px";
    el.style.top = Math.max(8, top) + "px";

    el.classList.add("is-in");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, DWELL);

    spoken += 1;
    lastAt = Date.now();
  }

  document.addEventListener(
    "pointerover",
    function (e) {
      if (spoken >= MAX_LINES) return;
      var t = e.target && e.target.closest ? e.target.closest("[data-cube]") : null;
      if (!t) return;
      /* A control with its own label is not the cube's business. */
      if (t.closest("[data-tip]")) return;
      var line = t.getAttribute("data-cube");
      if (!line) return;
      if (Date.now() - lastAt < MIN_GAP) return;

      clearTimeout(timer);
      var x = e.clientX,
        y = e.clientY;
      timer = setTimeout(function () {
        /* Still on it? A pointer that has already moved on was passing
           through, not looking. */
        if (!t.matches(":hover")) return;
        speak(line, x, y);
      }, INTENT);
    },
    { passive: true }
  );

  document.addEventListener(
    "pointerout",
    function (e) {
      var t = e.target && e.target.closest ? e.target.closest("[data-cube]") : null;
      if (!t) return;
      clearTimeout(timer);
      hide();
    },
    { passive: true }
  );

  /* Scrolling is leaving, whatever the pointer is technically over. */
  window.addEventListener(
    "scroll",
    function () {
      clearTimeout(timer);
      hide();
    },
    { passive: true }
  );
})();
