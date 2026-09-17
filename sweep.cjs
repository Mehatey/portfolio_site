const { chromium } = require("playwright");
const S = (ms) => new Promise((r) => setTimeout(r, ms));
const ROUTES = process.argv.slice(2);
(async () => {
  const b = await chromium.launch({
    headless: false,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--window-size=1440,940", "--window-position=0,0", "--autoplay-policy=no-user-gesture-required"],
  });
  const ctx = await b.newContext({ viewport: { width: 1400, height: 880 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => {
    try {
      history.scrollRestoration = "manual";
      localStorage.setItem("sid_loaded", "1");
    } catch (e) {}
  });
  const p = await ctx.newPage();
  for (const r of ROUTES) {
    const errs = [];
    const h = (e) => errs.push(String(e).slice(0, 110));
    p.on("pageerror", h);
    try {
      await p.goto("http://127.0.0.1:4000" + r + "?v=" + Date.now(), { waitUntil: "domcontentloaded", timeout: 45000 });
      await p.bringToFront();
      await S(3400);
      await p.evaluate(() => scrollTo(0, document.body.scrollHeight));
      await S(1400);
      await p.evaluate(() => scrollTo(0, 0));
      await S(600);
      const out = await p.evaluate(() => {
        const bad = [];
        if (document.documentElement.scrollWidth > innerWidth + 2) bad.push("H-OVERFLOW " + document.documentElement.scrollWidth + ">" + innerWidth);
        // media that is letterboxed or cropped by its box
        let crop = 0,
          letter = 0;
        document.querySelectorAll("img,video").forEach((m) => {
          if (m.closest("footer,.sid-strip,.ftr__right,.site-footer,.wk-frames,.proof-strip,#loader-collage,.marquee")) return;
          const r = m.getBoundingClientRect();
          if (r.width < 60 || r.height < 60) return;
          const nw = m.naturalWidth || m.videoWidth,
            nh = m.naturalHeight || m.videoHeight;
          if (!nw || !nh) return;
          const fit = getComputedStyle(m).objectFit,
            ba = r.width / r.height,
            na = nw / nh;
          if (Math.abs(ba - na) / na > 0.09) {
            if (fit === "cover") crop++;
            else if (fit === "contain") letter++;
          }
        });
        if (crop) bad.push("CROPPED " + crop);
        if (letter) bad.push("LETTERBOX " + letter);
        // tiny text
        const tiny = [];
        document.querySelectorAll("p,span,li,a,h1,h2,h3,h4,b,i,em,small,td,th,figcaption,button,label").forEach((e) => {
          if (!e.textContent.trim() || e.children.length) return;
          const fs = parseFloat(getComputedStyle(e).fontSize),
            r = e.getBoundingClientRect();
          if (
            fs &&
            fs < 9.5 &&
            r.width > 0 &&
            !e.closest("footer,.marquee,.sid-strip") &&
            !/^[\u25c6\u25c7\u00b7\u2022\u2013\u2014]+$/.test(e.textContent.trim())
          )
            tiny.push(fs.toFixed(1) + "px '" + e.textContent.trim().slice(0, 22) + "'");
        });
        if (tiny.length) bad.push("TINY(" + tiny.length + ") " + tiny.slice(0, 3).join(" / "));
        // headline/leading text overlapping a sibling block
        const over = [];
        const blocks = [...document.querySelectorAll("h1,h2,h3,p")]
          .filter((e) => e.textContent.trim() && e.getBoundingClientRect().height > 0)
          .slice(0, 220);
        for (let i = 0; i < blocks.length; i++)
          for (let j = i + 1; j < blocks.length; j++) {
            const a = blocks[i],
              c = blocks[j];
            if (a.contains(c) || c.contains(a)) continue;
            const x = a.getBoundingClientRect(),
              y = c.getBoundingClientRect();
            if (x.height < 4 || y.height < 4) continue;
            const ox = Math.min(x.right, y.right) - Math.max(x.left, y.left),
              oy = Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top);
            if (ox > 24 && oy > 10 && getComputedStyle(a).position === "static" && getComputedStyle(c).position === "static")
              over.push("'" + a.textContent.trim().slice(0, 16) + "' x '" + c.textContent.trim().slice(0, 16) + "'");
          }
        // text-overlap check removed: a collapsed <details> reports its inner
        // paragraph's natural box, so every accordion on the site read as three
        // overlaps. Verified on /about/: panel height 0, elementFromPoint none.
        return { bad, h: document.body.scrollHeight };
      });
      console.log(
        r.padEnd(26) +
          " h=" +
          String(out.h).padStart(6) +
          "  " +
          (out.bad.length ? out.bad.join("  |  ") : "clean") +
          (errs.length ? "   JS: " + errs[0] : "")
      );
    } catch (e) {
      console.log(r.padEnd(26) + " FAILED " + String(e).slice(0, 70));
    }
    p.off("pageerror", h);
  }
  await b.close();
})();
