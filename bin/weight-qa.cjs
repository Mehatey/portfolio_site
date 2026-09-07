/* How heavy is each page, and does it still move.
 *
 * Written after /ai-prototypes/ shipped at 64.5MB -- 61MB of it video, one
 * file 26.4MB -- while 628 assertions, a hover harness, a reachability
 * harness, a contrast audit and an accessibility audit were all green.
 *
 * None of them could have seen it. Presence checks do not weigh anything, and
 * the throttled performance run I had done covered four routes chosen by hand
 * and that page was not one of them. A page can be correct in every way those
 * harnesses understand and still be unusable.
 *
 * So this measures the two things a visitor actually feels, on EVERY route
 * rather than a list someone picked: total bytes transferred through a full
 * scroll, and the frame rate while doing it on a throttled CPU. Budgets are
 * deliberately generous -- this is meant to catch 64MB, not to police 3MB.
 */
const { chromium } = require("playwright");
const B = process.env.QA_BASE || "http://127.0.0.1:4000";
const sys = process.env.PORTFOLIO_CHROME;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ROUTES = [
  "/",
  "/works/",
  "/about/",
  "/contact/",
  "/play/",
  "/ai-prototypes/",
  "/arcana/",
  "/404.html",
  "/mool/",
  "/marriott/",
  "/m-health-fairview/",
  "/encoded/",
  "/bloom/",
  "/naavo/",
  "/aananda/",
  "/ai-self/",
  "/mind-your-feelings/",
  "/alpha-stockathon/",
  "/shot-on-iphone/",
  "/illustrations/",
  "/b-plus-b/",
  "/cube-guy/",
  "/mandalas/",
];
const MB = 1048576;
/* Generous on purpose. This exists to catch 64MB, not to police 3MB, and a
   long case study that a visitor scrolls end to end legitimately pulls
   thirty: /mandalas/ has 47 videos and correctly fetches four of them before
   any scrolling. The number to watch is what arrives BEFORE the reader asks
   for it, and that is small everywhere. */
const BUDGET_MB = 36;
/* Measured after the frame governor has had time to act. It needs three
   seconds of sustained low frame rate before shedding decoration, so a two
   second sample only ever sees the transient: / reads 19fps over two seconds
   and 75 over the next five. Sampling the transient would report every heavy
   page as broken forever, which is the fastest way to get a harness ignored. */
const MIN_FPS = 22;

(async () => {
  /* Falls back to the Chrome that is actually installed rather than to
     Playwright's bundled shell. The bundle is a separate download that a
     `npm install` can quietly invalidate, and a harness that dies on a
     missing browser is a harness nobody runs. */
  const b = await chromium.launch(sys ? { executablePath: sys } : { channel: "chrome" });
  const rows = [];
  let bad = 0;
  for (const r of ROUTES) {
    const c = await b.newContext({ viewport: { width: 1512, height: 950 } });
    const p = await c.newPage();
    const cdp = await c.newCDPSession(p);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    let bytes = 0,
      biggest = { n: "", b: 0 };
    p.on("response", (res) => {
      const len = +(res.headers()["content-length"] || 0);
      bytes += len;
      if (len > biggest.b) biggest = { n: res.url().replace(B, ""), b: len };
    });
    try {
      await p.goto(B + r, { waitUntil: "load", timeout: 40000 });
    } catch (e) {
      rows.push([r, "NAV FAIL", 0, 0, ""]);
      await c.close();
      bad++;
      continue;
    }
    await sleep(1500);
    try {
      await p.click("#loader-skip", { timeout: 2000 });
      await sleep(2200);
    } catch (e) {}
    await p.evaluate(() => {
      window.__f = 0;
      const t = () => {
        window.__f++;
        requestAnimationFrame(t);
      };
      requestAnimationFrame(t);
    });
    /* Four seconds of scrolling to get past the governor's decision window,
       then the sample. */
    for (let i = 0; i < 30; i++) {
      await p.mouse.wheel(0, 500);
      await sleep(120);
    }
    await p.evaluate(() => {
      window.__f = 0;
    });
    const t0 = Date.now();
    for (let i = 0; i < 24; i++) {
      await p.mouse.wheel(0, 500);
      await sleep(120);
    }
    const secs = (Date.now() - t0) / 1000;
    const fps = Math.round((await p.evaluate(() => window.__f)) / secs);
    await sleep(600);
    const mb = bytes / MB;
    const over = mb > BUDGET_MB || fps < MIN_FPS;
    if (over) bad++;
    rows.push([r, over ? "OVER" : "ok", mb, fps, biggest.b > 2 * MB ? (biggest.b / MB).toFixed(1) + "MB " + biggest.n.slice(-42) : ""]);
    await c.close();
  }
  console.log("\n  route                 weight    fps   largest single asset");
  rows.forEach(([r, st, mb, fps, big]) =>
    console.log(
      (st === "ok" ? "  " : " !") +
        r.padEnd(22) +
        (typeof mb === "number" ? mb.toFixed(1) + "MB" : "").padStart(8) +
        String(fps).padStart(6) +
        "   " +
        big
    )
  );
  console.log("\nbudget " + BUDGET_MB + "MB and " + MIN_FPS + "fps at 4x CPU throttle");
  console.log(bad ? "over budget: " + bad : "every route within budget");
  await b.close();
  process.exit(bad ? 1 : 0);
})();
