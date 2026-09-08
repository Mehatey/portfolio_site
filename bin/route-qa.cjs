/* Does every link on this site actually go somewhere?
 *
 * bin/link-qa.sh checks OUTBOUND urls and nothing had ever checked the
 * internal ones, which is the larger risk: an outbound link that rots is
 * somebody else's site changing, an internal one that 404s is a page this
 * repo renamed and forgot. On a portfolio the second is worse, because the
 * link a recruiter clicks is almost always internal.
 *
 * Crawls the anchors on every top-level route and requests each distinct
 * target. Fragments, mailto and tel are skipped; genuinely external hosts are
 * left to link-qa.
 */
const { chromium } = require("playwright");
const B = process.env.QA_BASE || "http://127.0.0.1:4000";
const sys = process.env.PORTFOLIO_CHROME;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const START = ["/", "/works/", "/about/", "/contact/", "/play/", "/ai-prototypes/", "/arcana/", "/404.html"];

(async () => {
  const browser = await chromium.launch(sys ? { executablePath: sys } : { channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const found = new Map();

  for (const route of START) {
    try {
      await page.goto(B + route, { waitUntil: "domcontentloaded", timeout: 30000 });
      await sleep(2000);
      await page.keyboard.press("Escape");
      await sleep(1000);
      const hrefs = await page.evaluate(() =>
        [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")).filter((h) => h && !/^(#|mailto:|tel:|javascript:)/.test(h))
      );
      hrefs.forEach((h) => {
        if (/^https?:\/\//.test(h) && h.indexOf(B) !== 0) return; /* link-qa owns these */
        const u = h.indexOf("http") === 0 ? h : B + (h[0] === "/" ? h : "/" + h);
        if (!found.has(u)) found.set(u, route);
      });
    } catch (e) {
      console.log("  could not crawl " + route + ": " + e.message.slice(0, 50));
    }
  }

  const bad = [];
  for (const [u, from] of found) {
    const r = await page.request.get(u).catch(() => null);
    if (!r || r.status() >= 400) bad.push((r ? r.status() : "ERR") + "  " + u.replace(B, "") + "   linked from " + from);
  }

  console.log("\nchecked " + found.size + " internal targets across " + START.length + " routes");
  console.log(bad.length ? "broken:\n  " + bad.join("\n  ") : "every internal link resolves");
  await browser.close();
  process.exit(bad.length ? 1 : 0);
})();
