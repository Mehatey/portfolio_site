/* Light-mode contrast sweep.
   The first version stopped at the first background that was not fully
   transparent, which on these pages is routinely a 0.02-alpha wash -- so it
   reported dark ink on cream as 1.03:1 and produced ten false positives per
   project page. It composites the whole ancestor stack over the page ground
   now, which is what the eye actually sees. */
const { open } = require("./qa.cjs");
const say = (s) => process.stdout.write(s + "\n");
(async () => {
  const { b, p, S } = await open();
  for (const r of process.argv.slice(2)) {
    const errs = [];
    const h = (e) => errs.push(String(e).slice(0, 80));
    p.on("pageerror", h);
    try {
      await p.goto("http://127.0.0.1:4000" + r, { waitUntil: "domcontentloaded", timeout: 40000 });
      await S(3200);
      const o = await p.evaluate(() => {
        const bad = [];
        const theme = document.documentElement.getAttribute("data-theme");
        if (theme !== "light") bad.push("THEME=" + theme);
        const px = (c) => {
          const m = (c || "").match(/[\d.]+/g);
          if (!m) return null;
          return [+m[0], +m[1], +m[2], m.length > 3 ? +m[3] : 1];
        };
        const over = (fg, bg) => [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3])).concat([1]);
        const lum = (c) => {
          const f = c.slice(0, 3).map((v) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
        };
        function ground(el) {
          let stack = [],
            e = el;
          while (e) {
            const c = px(getComputedStyle(e).backgroundColor);
            if (c && c[3] > 0.001) stack.push(c);
            e = e.parentElement;
          }
          let base = px(getComputedStyle(document.documentElement).backgroundColor);
          if (!base || base[3] < 0.99) base = [255, 255, 255, 1];
          for (let i = stack.length - 1; i >= 0; i--) base = over(stack[i], base);
          return base;
        }
        let low = 0,
          worst = 99,
          wt = "";
        document.querySelectorAll("p,h1,h2,h3,h4,li,a,span,b,em,td,figcaption,button,summary").forEach((e) => {
          if (e.children.length || !e.textContent.trim()) return;
          const cs = getComputedStyle(e),
            rr = e.getBoundingClientRect();
          if (rr.width < 12 || rr.height < 6 || cs.visibility === "hidden" || cs.display === "none" || +cs.opacity < 0.3) return;
          if (rr.top > innerHeight * 1.4 || rr.bottom < 0) return;
          /* Anything sitting on a picture, a canvas or a video is judged by eye,
       not by this: the ground is pixels, not a colour. */
          let e2 = e,
            onMedia = false;
          while (e2) {
            if (
              /^(IMG|VIDEO|CANVAS|SVG)$/.test(e2.tagName) ||
              (e2.querySelector && e2.matches(".proj-hero, .wq__media, .hero, .about-profile-card"))
            ) {
              onMedia = true;
              break;
            }
            e2 = e2.parentElement;
          }
          if (onMedia) return;
          const fg = px(cs.color);
          if (!fg) return;
          const g = ground(e);
          const a = lum(over(fg, g)),
            bl = lum(g);
          const ratio = (Math.max(a, bl) + 0.05) / (Math.min(a, bl) + 0.05);
          const big = parseFloat(cs.fontSize) >= 24;
          if (ratio < (big ? 3 : 4.5)) {
            low++;
            if (ratio < worst) {
              worst = ratio;
              wt = e.textContent.trim().slice(0, 30) + " " + cs.fontSize + " " + cs.color;
            }
          }
        });
        if (low) bad.push("LOW-CONTRAST " + low + " worst " + worst.toFixed(2) + ":1 '" + wt + "'");
        if (document.documentElement.scrollWidth > innerWidth + 2) bad.push("H-OVERFLOW");
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
