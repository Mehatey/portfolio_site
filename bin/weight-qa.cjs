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
/* QA_ROUTES=/play/,/mool/ runs a subset. A full pass is long enough that it
   is worth being able to re-check one page without paying for 23. */
const ONLY = (process.env.QA_ROUTES || "")
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);
const ALL_ROUTES = [
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
const ROUTES = ONLY.length ? ALL_ROUTES.filter((r) => ONLY.includes(r)) : ALL_ROUTES;
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
  /* Printed as each route finishes, not collected and printed at the end. A
     full pass is minutes long, and a run that is interrupted after ten
     routes should hand back ten routes rather than nothing. */
  const emit = (r, st, mb, fps, big) =>
    console.log(
      (st === "ok" ? "  " : " !") +
        r.padEnd(22) +
        (typeof mb === "number" ? mb.toFixed(1) + "MB" : String(mb)).padStart(8) +
        String(fps).padStart(6) +
        "   " +
        (big || "")
    );
  console.log("\n  route                 weight    fps   largest single asset");
  for (const r of ROUTES) {
    const c = await b.newContext({ viewport: { width: 1512, height: 950 } });
    const p = await c.newPage();
    /* Installed into every document rather than once after load. Several
       routes navigate under the harness -- a client side transition, the
       loader handing off -- and a counter installed after goto is wiped by
       that, which is why these pages reported 0fps. */
    await p.addInitScript(() => {
      window.__f = 0;
      const t = () => {
        window.__f++;
        requestAnimationFrame(t);
      };
      requestAnimationFrame(t);
    });
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
      /* Not "load": that blocks until every subresource is done, videos
         included, and at 4x throttle on a 26MB page it spends minutes waiting
         rather than measuring. Bytes are counted by the response listener for
         the whole session, so the settle and the scroll below still capture
         everything that arrives, including the lazy loads. */
      await p.goto(B + r, { waitUntil: "domcontentloaded", timeout: 40000 });
    } catch (e) {
      rows.push([r, "NAV FAIL", 0, 0, ""]);
      emit(r, "NAV FAIL", "-", 0, "");
      await c.close();
      bad++;
      continue;
    }
    try {
      await sleep(1500);
      try {
        await p.click("#loader-skip", { timeout: 2000 });
        await sleep(2200);
      } catch (e) {}
      /* Scrolled from inside the page rather than with mouse.wheel. Each
       mouse.wheel is a CDP round trip that waits on a renderer deliberately
       throttled 4x, so 54 of them cost minutes per route and the pass never
       finished. scrollBy fires the same scroll handlers at a predictable
       wall-clock cost.

       Four seconds first, to get past the governor's three second decision
       window, so the sample below is the steady state and not the transient. */
      const scrollFor = async (n) => {
        try {
          await p.evaluate(async (steps) => {
            for (let i = 0; i < steps; i++) {
              /* Stopped short of the very bottom on purpose. Project pages
                 arm a handover at 98.5% of the runway and open the NEXT
                 project (see _layouts/project.html), which is a deliberate
                 gesture, not something a weight pass should trip: falling
                 through it means measuring a page nobody asked for, and it
                 was reporting these routes as 0fps. Parking at 92% still
                 exercises every lazy load on the way down. */
              const max = (document.documentElement.scrollHeight - window.innerHeight) * 0.92;
              if (window.scrollY >= max) window.scrollTo(0, max * 0.5);
              else window.scrollBy(0, Math.min(500, max - window.scrollY));
              await new Promise((r) => setTimeout(r, 120));
            }
          }, n);
        } catch (e) {
          /* Some routes navigate under us -- a client side transition, or the
           loader handing off -- which destroys the execution context mid
           scroll. That is the page behaving normally, not a failure, so wait
           out the rest of the window and carry on measuring. */
          await sleep(n * 120);
        }
      };
      await scrollFor(30);
      /* Sampled as a delta across the window rather than reset-then-read.
         The reset can be lost -- the loader-skip click above tears the
         execution context down on some routes -- and a lost reset silently
         reports 0fps, which reads as a dead page rather than as a failed
         measurement. A delta needs nothing to survive but the counter the
         init script puts in every document. */
      const readFrames = async () => {
        for (let i = 0; i < 3; i++) {
          try {
            return await p.evaluate(() => ({ f: window.__f || 0, at: location.pathname }));
          } catch (e) {
            await sleep(400);
          }
        }
        return null;
      };
      const f0 = await readFrames();
      const t0 = Date.now();
      await scrollFor(24);
      const secs = (Date.now() - t0) / 1000;
      const f1 = await readFrames();
      /* null means the page never gave a readable number, which is a broken
         measurement and must not be reported as a slow page.

         A counter that went BACKWARDS means the document was replaced during
         the window: these routes navigate when the scroll reaches the end.
         Subtracting there yields a negative, and clamping that to zero
         reports a perfectly healthy page as 0fps -- which is exactly the
         false alarm this harness exists to avoid. The new document's own
         counter is the honest reading. */
      let fps = null;
      let went = "";
      if (f0 !== null && f1 !== null) {
        const navigated = f1.at !== f0.at || f1.f < f0.f;
        fps = Math.round((navigated ? f1.f : f1.f - f0.f) / secs);
        if (f1.at !== f0.at) went = "scrolled into " + f1.at;
      }
      await sleep(600);
      const mb = bytes / MB;
      const over = mb > BUDGET_MB || fps === null || fps < MIN_FPS;
      if (over) bad++;
      const big = biggest.b > 2 * MB ? (biggest.b / MB).toFixed(1) + "MB " + biggest.n.slice(-42) : "";
      rows.push([r, over ? "OVER" : "ok", mb, fps, big]);
      emit(r, over ? "OVER" : "ok", mb, fps === null ? "unread" : fps, [big, went].filter(Boolean).join("  "));
    } catch (e) {
      /* One route that misbehaves must not cost the other 22. */
      rows.push([r, "ERROR", bytes / MB, 0, ""]);
      emit(r, "ERROR", bytes / MB, 0, String(e.message).slice(0, 60));
      bad++;
    }
    await c.close();
  }
  console.log("\nbudget " + BUDGET_MB + "MB and " + MIN_FPS + "fps at 4x CPU throttle");
  console.log(bad ? "over budget: " + bad : "every route within budget");
  await b.close();
  process.exit(bad ? 1 : 0);
})();
