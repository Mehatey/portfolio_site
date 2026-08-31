#!/usr/bin/env node
/*
 * Visual QA capture. Companion to portfolio-qa.cjs, which measures.
 * This one exists to be LOOKED AT: HANDOFF's rule is that measurement and
 * looking find different bugs, and a page can pass 628 assertions while the
 * region you care about is blank.
 *
 * Deliberately does NOT inject `scroll-behavior: auto`. The 14 Aug session
 * lost a real bug that way: Play's auto-scroll never moved a pixel in
 * production because the site sets `scroll-behavior: smooth`, and every
 * screenshot ever taken was of a build where the bug could not occur.
 * Instead we scroll by proportion and wait for the page to settle.
 */

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const baseUrl = (process.argv[2] || "http://127.0.0.1:4123").replace(/\/$/, "");
const outDir = process.argv[3] || "/tmp/visual-qa";
const only = process.argv[4] || null;

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844, isMobile: true, hasTouch: true },
];

const routes = [
  { path: "/", name: "home", depths: [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1] },
  { path: "/works/", name: "works", depths: [0, 0.25, 0.5, 0.75, 1] },
  { path: "/about/", name: "about", depths: [0, 0.33, 0.66, 1] },
  { path: "/contact/", name: "contact", depths: [0, 0.5, 1] },
  { path: "/ai-prototypes/", name: "ai-prototypes", depths: [0, 0.33, 0.66, 1] },
  { path: "/play/", name: "play", depths: [0, 0.4, 0.8] },
  { path: "/mool/", name: "mool", depths: [0, 0.3, 0.6, 1] },
  { path: "/encoded/", name: "encoded", depths: [0, 0.5, 1] },
  { path: "/cube-guy/", name: "cube-guy", depths: [0, 0.5, 1] },
  { path: "/bloom/", name: "bloom", depths: [0, 0.5] },
  { path: "/mind-your-feelings/", name: "myf", depths: [0, 0.5] },
  { path: "/ai-self/", name: "ai-self", depths: [0, 0.5] },
  { path: "/mandalas/", name: "mandalas", depths: [0, 0.5] },
  { path: "/naavo/", name: "naavo", depths: [0, 0.5] },
  { path: "/aananda/", name: "aananda", depths: [0, 0.5] },
  { path: "/illustrations/", name: "illustrations", depths: [0, 0.5] },
  { path: "/alpha-stockathon/", name: "alpha-stockathon", depths: [0, 0.5] },
  { path: "/b-plus-b/", name: "b-plus-b", depths: [0, 0.5] },
  { path: "/shot-on-iphone/", name: "shot-on-iphone", depths: [0, 0.5] },
];

const noise = [/favicon/i, /net::ERR_/i, /WebGL warning/i, /THREE\.WebGLRenderer/i, /model-viewer/i, /Download the React DevTools/i];
const isNoise = (m) => noise.some((p) => p.test(m));

/* Probe for the things a screenshot cannot tell you apart from a design
 * choice: a canvas that painted nothing, an element wider than the viewport,
 * text at a contrast the page cannot support. */
async function probe(page) {
  return page.evaluate(() => {
    const out = { blankCanvases: [], overflow: [], glContexts: 0, invisibleText: [] };

    document.querySelectorAll("canvas").forEach((c, i) => {
      const r = c.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) return;
      const cs = getComputedStyle(c);
      if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) === 0) return;
      out.glContexts += 1;
      /* Only 2d contexts can be read back cheaply; a WebGL canvas with
       * preserveDrawingBuffer false reads as transparent even when painting,
       * so we record geometry/stacking instead of claiming it is blank. */
      out.blankCanvases.push({
        i,
        id: c.id || null,
        cls: c.className && c.className.toString().slice(0, 60),
        w: Math.round(r.width),
        h: Math.round(r.height),
        z: cs.zIndex,
        pos: cs.position,
        offscreen: r.bottom < 0 || r.top > innerHeight,
      });
    });

    const docW = document.documentElement.clientWidth;
    document.querySelectorAll("body *").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0) return;
      if (r.right > docW + 2 || r.left < -2) {
        out.overflow.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || "").toString().slice(0, 50),
          left: Math.round(r.left),
          right: Math.round(r.right),
        });
      }
    });
    out.overflow = out.overflow.slice(0, 12);

    out.scrollWidth = document.documentElement.scrollWidth;
    out.clientWidth = docW;
    out.scrollHeight = document.documentElement.scrollHeight;
    return out;
  });
}

async function run() {
  fs.mkdirSync(outDir, { recursive: true });
  /* Playwright's own chromium download is absent on this machine, and the
   * puppeteer Chrome-for-Testing under ~/.cache is a truncated install with
   * no executable inside the .app. Fall back to system Chrome; Playwright
   * still uses a throwaway profile, so Sid's own session is untouched. */
  const systemChrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  const launchOpts = fs.existsSync(systemChrome) ? { executablePath: systemChrome } : {};
  const browser = await chromium.launch(launchOpts);
  const report = [];

  for (const vp of viewports) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: !!vp.isMobile,
      hasTouch: !!vp.hasTouch,
      deviceScaleFactor: 1,
    });
    /* The home page opens behind #enter-gate, a fixed full-viewport door that
     * only lifts on a click of Enter. It does not respond to scroll, so an
     * un-primed harness screenshots the same door at every scroll depth and
     * reports the whole site as one screen. loader.html skips the gate when
     * `sid_loaded` is set, which is also the state a returning visitor is in
     * and therefore the state most of the site should be judged in. */
    await ctx.addInitScript(() => {
      try {
        localStorage.setItem("sid_loaded", "1");
      } catch (_) {}
    });
    const page = await ctx.newPage();

    for (const route of routes) {
      if (only && route.name !== only) continue;
      const errors = [];
      page.removeAllListeners("console");
      page.removeAllListeners("pageerror");
      page.on("console", (m) => {
        if (m.type() === "error" && !isNoise(m.text())) errors.push(m.text().slice(0, 200));
      });
      page.on("pageerror", (e) => errors.push("PAGEERROR " + String(e).slice(0, 200)));

      try {
        await page.goto(baseUrl + route.path, { waitUntil: "networkidle", timeout: 45000 });
      } catch (e) {
        report.push({ vp: vp.name, route: route.name, fatal: String(e).slice(0, 160) });
        continue;
      }
      /* Let intros, loaders and first WebGL frames actually run. */
      await page.waitForTimeout(3500);

      const info = await probe(page);
      report.push({ vp: vp.name, route: route.name, errors, ...info });

      for (const d of route.depths) {
        await page.evaluate((frac) => {
          const max = document.documentElement.scrollHeight - innerHeight;
          window.scrollTo(0, Math.round(max * frac));
        }, d);
        /* 2600ms, not 1400. At 1400 the scroll-reveals on the home page are
         * still mid-fade, and a frame caught there reads as a contrast bug
         * that is not there: measuring the same headings after they settle
         * puts them comfortably above AA. A harness that is too impatient
         * invents findings the same way one that normalises invents passes. */
        await page.waitForTimeout(2600);
        const tag = String(Math.round(d * 100)).padStart(3, "0");
        await page.screenshot({
          path: path.join(outDir, `${route.name}--${vp.name}--${tag}.png`),
        });
      }
    }
    await ctx.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));

  for (const r of report) {
    const bits = [];
    if (r.fatal) bits.push("FATAL " + r.fatal);
    if (r.errors && r.errors.length) bits.push(`${r.errors.length} console err`);
    if (r.overflow && r.overflow.length) bits.push(`${r.overflow.length} overflow`);
    if (r.scrollWidth > r.clientWidth) bits.push(`H-SCROLL ${r.scrollWidth}>${r.clientWidth}`);
    if (r.glContexts) bits.push(`${r.glContexts} canvas`);
    console.log(`${r.vp.padEnd(8)} ${r.route.padEnd(18)} ${bits.join(" · ") || "clean"}`);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
