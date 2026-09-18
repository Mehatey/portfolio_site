const { open } = require("./qa.cjs");
const say = (s) => process.stdout.write(s + "\n");
(async () => {
  const { b, p, S } = await open();
  for (const r of process.argv.slice(2)) {
    const errs = [];
    const h = (e) => errs.push(String(e).slice(0, 90));
    p.on("pageerror", h);
    try {
      await p.goto("http://127.0.0.1:4000" + r, { waitUntil: "domcontentloaded", timeout: 40000 });
      await p.evaluate(() => {
        document.querySelectorAll("img[loading=lazy]").forEach((i) => (i.loading = "eager"));
      });
      await S(3000);
      await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * 0.5));
      await S(900);
      await p.evaluate(() => scrollTo(0, 0));
      await S(500);
      const o = await p.evaluate(() => {
        const bad = [];
        if (document.documentElement.scrollWidth > innerWidth + 2) bad.push("H-OVERFLOW " + document.documentElement.scrollWidth);
        // grid rows flush?
        let off = 0,
          rows = 0;
        document.querySelectorAll(".cs-grid, .cs-grid-3").forEach((g) => {
          const m = [...g.querySelectorAll(":scope > * > img, :scope > * > video")].filter((x) => x.getBoundingClientRect().height > 20);
          if (m.length < 2) return;
          rows++;
          const t = m.map((x) => x.getBoundingClientRect().top),
            bt = m.map((x) => x.getBoundingClientRect().bottom);
          if (Math.max(Math.max(...t) - Math.min(...t), Math.max(...bt) - Math.min(...bt)) > 3) off++;
        });
        if (off) bad.push("GRID-MISALIGN " + off + "/" + rows);
        // rules over media
        const media = [...document.querySelectorAll("img,video")]
          .map((m) => m.getBoundingClientRect())
          .filter((x) => x.width > 200 && x.height > 120);
        let hits = 0;
        document.querySelectorAll("body *").forEach((e) => {
          const x = e.getBoundingClientRect();
          if (x.height > 3 || x.height < 0.5 || x.width < 220) return;
          const cs = getComputedStyle(e);
          if (cs.opacity === "0" || cs.visibility === "hidden" || cs.display === "none") return;
          if ((cs.backgroundColor === "rgba(0, 0, 0, 0)" || cs.backgroundColor === "transparent") && cs.borderTopWidth === "0px") return;
          for (const m of media)
            if (x.top > m.top + 6 && x.bottom < m.bottom - 6 && x.left < m.right - 20 && x.right > m.left + 20) {
              hits++;
              break;
            }
        });
        if (hits) bad.push("RULES-OVER-MEDIA " + hits);
        // an invisible headline is the worst regression
        const h1 = document.querySelector(".proj-title, .wk-head h2, h1:not(.sr-only)");
        if (h1 && h1.textContent.trim() && +getComputedStyle(h1).opacity < 0.05) bad.push("HEADLINE-INVISIBLE");
        return bad;
      });
      say(r.padEnd(22) + (o.length ? o.join("  |  ") : "clean") + (errs.length ? "   JS: " + errs[0] : ""));
    } catch (e) {
      say(r.padEnd(22) + "FAILED " + String(e).slice(0, 50));
    }
    p.off("pageerror", h);
  }
  await b.close();
})();
