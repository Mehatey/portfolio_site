/* Mobile QA at 390x844 (iPhone 15/16 logical). Nothing in this session has
   been looked at below 1400px, and a recruiter link opens on a phone as
   often as not. */
const { chromium } = require("playwright");
const S = (ms) => new Promise((r) => setTimeout(r, ms));
const say = (s) => process.stdout.write(s + "\n");
(async () => {
  const b = await chromium.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--use-gl=angle", "--use-angle=metal", "--autoplay-policy=no-user-gesture-required"],
  });
  const ctx = await b.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });
  await ctx.addInitScript(() => {
    try {
      history.scrollRestoration = "manual";
      localStorage.setItem("sid_loaded", "1");
    } catch (e) {}
  });
  const p = await ctx.newPage();
  for (const r of process.argv.slice(2)) {
    const errs = [];
    const h = (e) => errs.push(String(e).slice(0, 90));
    p.on("pageerror", h);
    try {
      await p.goto("http://127.0.0.1:4000" + r, { waitUntil: "domcontentloaded", timeout: 45000 });
      await p.evaluate(() => {
        document.querySelectorAll("img[loading=lazy]").forEach((i) => (i.loading = "eager"));
      });
      await S(3000);
      const o = await p.evaluate(() => {
        const bad = [];
        const sw = document.documentElement.scrollWidth;
        if (sw > innerWidth + 2) bad.push("H-SCROLL " + sw + ">" + innerWidth);
        /* anything wider than the screen is what causes that */
        if (sw > innerWidth + 2) {
          const wide = [...document.querySelectorAll("body *")]
            .filter((e) => {
              const x = e.getBoundingClientRect();
              return x.width > innerWidth + 8 && x.height > 4 && getComputedStyle(e).position !== "fixed";
            })
            .slice(0, 3)
            .map(
              (e) =>
                (typeof e.className === "string" && e.className ? "." + e.className.trim().split(/\s+/)[0] : e.tagName) +
                " " +
                Math.round(e.getBoundingClientRect().width)
            );
          if (wide.length) bad.push("WIDEST: " + wide.join(", "));
        }
        /* tap targets under 40px that are real controls */
        let small = 0;
        document.querySelectorAll("a,button").forEach((e) => {
          const x = e.getBoundingClientRect();
          if (x.width < 4 || x.height < 4) return;
          if (getComputedStyle(e).display === "none") return;
          if (x.top > innerHeight * 2) return;
          if (x.height < 32 || x.width < 32) small++;
        });
        if (small > 0) bad.push("SMALL-TAP " + small);
        /* text too small to read on a phone */
        let tiny = 0;
        document.querySelectorAll("p,li,a,span,h1,h2,h3").forEach((e) => {
          if (e.children.length || !e.textContent.trim()) return;
          const fs = parseFloat(getComputedStyle(e).fontSize);
          if (fs && fs < 11 && e.getBoundingClientRect().width > 8 && !e.closest("footer,.marquee,.sid-strip")) tiny++;
        });
        if (tiny) bad.push("TINY-TEXT " + tiny);
        return bad;
      });
      say(r.padEnd(22) + (o.length ? o.join("  |  ") : "clean") + (errs.length ? "  JS: " + errs[0] : ""));
    } catch (e) {
      say(r.padEnd(22) + "FAILED " + String(e).slice(0, 44));
    }
    p.off("pageerror", h);
  }
  await b.close();
})();
