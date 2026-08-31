/* gl-budget.js — one place that decides how many WebGL layers a page may open.
 *
 * Why this exists. iOS Safari keeps roughly eight live WebGL contexts per tab
 * and silently drops the OLDEST when a ninth arrives. It does not throw, and
 * the console stays clean: the failure surfaces as some unrelated canvas
 * further up the page going blank. That makes it invisible to every check we
 * run — 628 assertions and zero page errors on a page that is quietly broken
 * on a phone.
 *
 * Measured on 31 Aug, after the 30 Aug Safari pass:
 *
 *     desktop /        12 contexts      mobile /        9   <- over the limit
 *     desktop /mool/    6               mobile /mool/   4
 *     desktop /works/   7               mobile /works/  4
 *     desktop /about/   7               mobile /about/  4
 *
 * The 30 Aug fix gated buddha-voxels on touch, which took mobile home from ten
 * to nine. Nine is still over eight, so the bug was reduced, not closed.
 *
 * Rather than add a fourth bespoke `matchMedia` guard — the pattern that let
 * the count drift up in the first place — layers now ask before they build.
 * A layer that is refused must return without creating a context.
 *
 * To re-enable an ambient layer on phones, move it out of AMBIENT below. That
 * is the whole switch; nothing else needs to change.
 */
(function () {
  "use strict";

  /* Refused on phones. This list was cut down after looking at the result:
   * the first version also dropped `site-field`, and the before/after shots of
   * /mool/ on a 390px viewport showed why that was wrong — site-field IS the
   * teal atmosphere behind every page, and without it the footer sits on flat
   * black. It is the background art direction, not decoration, so it stays.
   *
   * What is left are the two layers a phone genuinely cannot show:
   *   caustics    a full-viewport overlay at low alpha; at 390px it is noise
   *   wall-cloth  cloth simulation over a wall photograph, and the photograph
   *               is still there when the sim does not run
   *
   * footer-water also stays: it holds the figure up, and it is the subject of
   * its own section rather than a wash over someone else's. */
  var AMBIENT = ["caustics", "wall-cloth"];

  var coarse = window.matchMedia && window.matchMedia("(hover: none), (max-width: 760px)").matches;

  /* Eight is the iOS ceiling. Seven leaves one slot of headroom and is what
   * the home page lands on once the two layers above are refused; every other
   * route sits at two. Desktop Safari's ceiling is nearer sixteen, so twelve
   * carries the same margin there. */
  var CAP = coarse ? 7 : 12;

  var granted = [];
  var refused = [];

  function claim(name) {
    if (coarse && AMBIENT.indexOf(name) !== -1) {
      refused.push(name);
      return false;
    }
    if (granted.length >= CAP) {
      refused.push(name);
      return false;
    }
    granted.push(name);
    return true;
  }

  /* Layers that tear themselves down (context loss, a section leaving the
   * document) should hand the slot back so a later one can use it. */
  function release(name) {
    var i = granted.indexOf(name);
    if (i !== -1) granted.splice(i, 1);
  }

  window.SidGL = {
    claim: claim,
    release: release,
    cap: CAP,
    coarse: coarse,
    /* DEV-only introspection. Deliberately not rendered anywhere: the art
     * pieces and this site must never show telemetry to a visitor. Read it
     * from the console or a QA harness. */
    state: function () {
      return { cap: CAP, coarse: coarse, granted: granted.slice(), refused: refused.slice() };
    },
  };
})();
