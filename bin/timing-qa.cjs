/* Does anything on this site say something too briefly to be read?
 *
 * Written after Sid's reader said "the intro texts are disappearing a bit
 * fast" and it turned out the second line had NEVER finished resolving --
 * scheduled at 5200ms into a loader that cleared at 6600ms, so every visitor
 * saw a burst of random glyphs where a sentence about his work should have
 * been.
 *
 * The reason no harness caught it is worth stating plainly, because it
 * indicts all of them: a11y-qa, reach-qa, weight-qa and the deep sweep all
 * DISMISS the intro as their first action and then audit a page that has
 * stopped moving. Every check measured a static property -- broken media,
 * overflow, contrast, console errors. A sentence that is on screen for half a
 * second is perfectly correct by every one of those measures. Nothing here
 * looked at time.
 *
 * So this one only looks at time. It watches each route from first paint,
 * touching nothing, and records how long each piece of text is actually
 * legible. Anything a person is expected to READ that holds for less than
 * MIN_READ is a finding, whatever it looks like in a screenshot.
 *
 * Reading speed: adult silent reading is roughly 240 words a minute, so a
 * seven word line needs about 1.7s to be read once, and rather more to be
 * read comfortably by somebody who was not expecting it. 1200ms is the floor
 * used here -- deliberately below the comfortable figure, because this is
 * looking for text nobody CAN read rather than text somebody might want
 * longer with.
 */
const { chromium } = require("playwright");
const B = process.env.QA_BASE || "http://127.0.0.1:4000";
const sys = process.env.PORTFOLIO_CHROME;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ROUTES = ["/", "/works/", "/about/", "/contact/", "/play/", "/ai-prototypes/", "/mool/", "/marriott/", "/bloom/", "/404.html"];

const MIN_READ = 1200;
const WATCH_MS = 14000;
const TICK = 140;

/* Scrambling text is not text yet. A line mid-reveal is a random glyph soup,
   and counting it as legible is what let the old intro look fine. */
const isNoise = (t) => /[@#*<>\\\\/]{2,}|[A-Z0-9!?@#*<>\\\\/]{6,}/.test(t);

(async () => {
  const browser = await chromium.launch(sys ? { executablePath: sys } : { channel: "chrome" });
  const findings = [];

  for (const route of ROUTES) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();

    /* Every sample is one pass over the visible text, keyed by a stable
       identity so a node can be followed across frames. */
    await page.addInitScript(() => {
      window.__seen = new Map();
      window.__sample = function () {
        const now = performance.now();
        document.querySelectorAll("h1,h2,h3,p,span,b,em,li,figcaption,a,button").forEach((e) => {
          if (e.children.length) return;
          const t = (e.textContent || "").trim();
          if (t.length < 8) return;
          const r = e.getBoundingClientRect();
          if (r.width < 8 || r.height < 6 || r.bottom < 0 || r.top > innerHeight) return;
          const s = getComputedStyle(e);
          if (s.visibility === "hidden" || +s.opacity < 0.55) return;
          /* An ancestor at low opacity hides it just as effectively. */
          let n = e.parentElement,
            hidden = false;
          while (n && n !== document.documentElement) {
            const ps = getComputedStyle(n);
            if (ps.visibility === "hidden" || ps.display === "none" || +ps.opacity < 0.55) {
              hidden = true;
              break;
            }
            n = n.parentElement;
          }
          if (hidden) return;
          const key = (e.id || e.className || e.tagName) + "|" + t.slice(0, 40);
          const rec = window.__seen.get(key) || { first: now, last: now, text: t.slice(0, 46), gone: false };
          rec.last = now;
          window.__seen.set(key, rec);
        });
      };
    });

    await page.goto(B + route, { waitUntil: "domcontentloaded", timeout: 30000 });

    /* NOTHING is dismissed and nothing is clicked. That is the entire point:
       the intro has to be allowed to play. */
    const t0 = Date.now();
    while (Date.now() - t0 < WATCH_MS) {
      await page.evaluate(() => window.__sample && window.__sample()).catch(() => {});
      await sleep(TICK);
    }

    const rows = await page
      .evaluate(() => {
        const out = [];
        window.__seen.forEach((v, k) => out.push({ key: k, ms: Math.round(v.last - v.first), text: v.text }));
        return out;
      })
      .catch(() => []);

    /* Text still on screen when the watch ends has not "disappeared" -- it is
       simply still there, so its measured span is a floor, not a lifetime. */
    const stillUp = await page
      .evaluate(() => {
        const set = new Set();
        document.querySelectorAll("h1,h2,h3,p,span,b,em,li,figcaption,a,button").forEach((e) => {
          if (e.children.length) return;
          const t = (e.textContent || "").trim();
          if (t.length < 8) return;
          const r = e.getBoundingClientRect();
          if (r.width < 8 || r.bottom < 0 || r.top > innerHeight) return;
          if (+getComputedStyle(e).opacity < 0.55) return;
          set.add((e.id || e.className || e.tagName) + "|" + t.slice(0, 40));
        });
        return [...set];
      })
      .catch(() => []);
    const up = new Set(stillUp);

    /* A typewriter reveal emits every prefix of its sentence as a separate
       string -- "Research", "Research to", "Research to shipped" -- and each
       one is legitimately on screen for a few frames. Those are not passages
       anybody is expected to read, they are one passage being drawn, so a
       string that is a prefix of another seen on the same page is dropped.
       Without this the report is nine lines of noise around one real finding,
       which is how a harness gets ignored. */
    const texts = rows.map((r) => r.text);
    rows.forEach((r) => {
      if (up.has(r.key)) return;
      if (texts.some((t) => t !== r.text && t.startsWith(r.text))) return;
      if (r.ms >= MIN_READ) return;
      if (isNoise(r.text)) return;
      findings.push({ route, ms: r.ms, text: r.text, key: r.key.split("|")[0].slice(0, 24) });
    });

    await ctx.close();
  }

  if (!findings.length) {
    console.log(`\nwatched ${ROUTES.length} routes for ${WATCH_MS / 1000}s each, touching nothing.`);
    console.log(`every sentence that came and went was legible for at least ${MIN_READ}ms.`);
  } else {
    console.log(`\n${findings.length} passage(s) shown for less than ${MIN_READ}ms:\n`);
    findings
      .sort((a, b) => a.ms - b.ms)
      .forEach((f) => {
        console.log(`  ${String(f.ms).padStart(5)}ms  ${f.route.padEnd(18)} .${f.key.padEnd(24)} "${f.text}"`);
      });
  }
  await browser.close();
  process.exit(findings.length ? 1 : 0);
})();
