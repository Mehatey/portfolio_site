/* Accessibility basics across every route.
 *
 * Not a replacement for a real audit with a screen reader, and it does not
 * pretend to be: it checks the handful of things that are objectively true or
 * false and that regress silently when markup moves -- a missing alt
 * ATTRIBUTE (alt="" is valid and means decorative), heading order, one h1,
 * main and nav landmarks, a lang on <html>, and every control having an
 * accessible name.
 *
 * Run alongside hover-qa, reach-qa and link-qa before a push.
 */
const { chromium } = require("playwright");
const sys = process.env.PORTFOLIO_CHROME;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const B = process.env.QA_BASE || "http://127.0.0.1:4000";
const R = ["/", "/works/", "/about/", "/contact/", "/play/", "/mool/", "/encoded/", "/ai-prototypes/", "/404.html"];
(async () => {
  const b = await chromium.launch(sys ? { executablePath: sys } : {});
  const p = await b.newPage({ viewport: { width: 1512, height: 950 } });
  let tot = 0;
  for (const r of R) {
    await p.goto(B + r, { waitUntil: "load" });
    await sleep(1600);
    try {
      await p.click("#loader-skip", { timeout: 2000 });
      await sleep(2200);
    } catch (e) {}
    const o = await p.evaluate(() => {
      const out = [];
      // images without alt at all (alt="" is valid and means decorative)
      const noAlt = [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt"));
      if (noAlt.length) out.push(noAlt.length + " img missing alt attribute");
      // heading order
      const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter((h) => {
        const cs = getComputedStyle(h);
        return cs.display !== "none" && cs.visibility !== "hidden";
      });
      const h1 = hs.filter((h) => h.tagName === "H1").length;
      if (h1 === 0) out.push("no h1");
      if (h1 > 1) out.push(h1 + " h1 elements");
      let prev = 0,
        skips = 0;
      hs.forEach((h) => {
        const lv = +h.tagName[1];
        if (prev && lv > prev + 1) skips++;
        prev = lv;
      });
      if (skips) out.push(skips + " heading level skip(s)");
      // landmarks
      if (!document.querySelector("main")) out.push("no <main>");
      if (!document.querySelector("nav")) out.push("no <nav>");
      // buttons/links with no accessible name
      const nameless = [...document.querySelectorAll("a[href],button")].filter((e) => {
        /* offsetParent is null for anything inside a display:none ANCESTOR, which
      getComputedStyle on the element alone does not catch: the 404 page's
      "did you mean" link is display:inline inside a hidden <p> and gets its
      text only when a suggestion exists. */
        if (!e.offsetParent && getComputedStyle(e).position !== "fixed") return false;
        const t = (e.textContent || "").trim();
        return !t && !e.getAttribute("aria-label") && !e.getAttribute("title") && !e.querySelector("img[alt]:not([alt=''])");
      });
      if (nameless.length) out.push(nameless.length + " control(s) with no accessible name");
      // lang
      if (!document.documentElement.lang) out.push("no lang on <html>");
      return out;
    });
    tot += o.length;
    console.log(r.padEnd(18) + (o.length ? o.join("; ") : "ok"));
  }
  console.log("\ntotal findings: " + tot);
  await b.close();
  process.exit(tot ? 1 : 0);
})();
