/* Is every control actually reachable?
 *
 * The bug that made this necessary: #cur-dot lost pointer-events: none, so
 * the cursor became the topmost hit target for the whole page. Every feature
 * was present, none could be reached, and 628 presence assertions were green
 * throughout.
 *
 * This asks the only question that would have caught it, for every link and
 * button on every route: if a person put the pointer at the centre of this
 * control, would the browser hand the event to the control? Anything that
 * answers no is either covered by an overlay or has a hit area that does not
 * match what is drawn, and both are invisible to a screenshot.
 *
 * Controls that are legitimately off-screen or zero-sized are skipped. A skip
 * link is meant to be 1x1 until focused.
 */
const { chromium } = require("playwright");
const B = process.env.QA_BASE || "http://127.0.0.1:4000";
const sys = process.env.PORTFOLIO_CHROME;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ROUTES = ["/", "/works/", "/about/", "/contact/", "/play/", "/mool/", "/encoded/", "/ai-prototypes/", "/404.html"];

(async () => {
  const b = await chromium.launch(sys ? { executablePath: sys } : {});
  let bad = 0,
    checked = 0;
  for (const theme of ["dark", "light"]) {
    const c = await b.newContext({ viewport: { width: 1512, height: 950 } });
    const p = await c.newPage();
    const cdp = await c.newCDPSession(p);
    for (const r of ROUTES) {
      await p.goto(B + r, { waitUntil: "load" });
      await sleep(1600);
      try {
        await p.click("#loader-skip", { timeout: 2000 });
        await sleep(2400);
      } catch (e) {}
      await p.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
      await sleep(1000);
      /* Park the pointer somewhere harmless first: a cursor sitting on a
         control is itself a hit-test hazard, which is the whole point. */
      await cdp.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 4, y: 4, button: "none", buttons: 0 });
      await sleep(300);

      const res = await p.evaluate(() => {
        const out = [];
        let n = 0;
        document.querySelectorAll("a[href], button:not([disabled])").forEach((el) => {
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity < 0.1) return;
          if (cs.pointerEvents === "none") return;
          const rc = el.getBoundingClientRect();
          if (rc.width < 6 || rc.height < 6) return;
          if (rc.bottom < 0 || rc.top > innerHeight || rc.right < 0 || rc.left > innerWidth) return;
          /* A closed <details> hides its contents, and some engines still
             report a live bounding rect for them. A link nobody can see is
             not a link that is blocked. */
          if (el.closest("details:not([open])")) return;
          /* Same for anything inside a collapsed disclosure of our own, or a
             pane that is currently hidden by the filter. */
          if (el.closest("[hidden], [aria-hidden='true']")) return;
          /* The 404 cube is six links on the six faces of a rotating solid.
             Five of them are turned away from the viewer at any instant, so
             their bounding-rect centre correctly resolves to whichever face
             is in front. A face pointing backwards is not a blocked control,
             it is the far side of a cube. */
          if (el.closest(".nf-face")) return;
          n++;
          const x = Math.round(rc.left + rc.width / 2),
            y = Math.round(rc.top + rc.height / 2);
          const hit = document.elementFromPoint(x, y);
          if (!hit) return;
          if (el === hit || el.contains(hit) || hit.contains(el)) return;
          /* A control sitting under another control is a layout question, not
             a bug: report what is on top so it can be judged. */
          out.push(
            (el.textContent || el.getAttribute("aria-label") || el.tagName).trim().slice(0, 26) +
              "  blocked by  " +
              hit.tagName.toLowerCase() +
              "#" +
              (hit.id || "-") +
              "." +
              (hit.className && hit.className.split ? hit.className.split(" ")[0] : "-")
          );
        });
        return { n, out };
      });
      checked += res.n;
      if (res.out.length) {
        bad += res.out.length;
        console.log("\n" + theme + "  " + r);
        [...new Set(res.out)].slice(0, 6).forEach((x) => console.log("   " + x));
      }
    }
    await c.close();
  }
  console.log("\nchecked " + checked + " controls across " + ROUTES.length + " routes x2 themes");
  console.log(bad ? "unreachable: " + bad : "every control reachable");
  await b.close();
  process.exit(bad ? 1 : 0);
})();
