const { chromium } = require("playwright");
const S = (ms) => new Promise((r) => setTimeout(r, ms));
const say = (s) => process.stdout.write(s + "\n");
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
  for (const r of process.argv.slice(2)) {
    try {
      await p.goto("http://127.0.0.1:4000" + r, { waitUntil: "domcontentloaded", timeout: 40000 });
      await p.bringToFront();
      await S(2600);
      const o = await p.evaluate(() => {
        const m = document.querySelector(".proj-hero .hero-video");
        if (!m) return null;
        const box = m.getBoundingClientRect();
        const nw = m.naturalWidth || m.videoWidth,
          nh = m.naturalHeight || m.videoHeight;
        if (!nw) return { err: "no natural size" };
        const cs = getComputedStyle(m);
        // object-fit: cover maths -- scale so the image covers the box
        const sc = Math.max(box.width / nw, box.height / nh);
        const sw = nw * sc,
          sh = nh * sc;
        const pos = (cs.objectPosition || "50% 50%").split(" ");
        const py = parseFloat(pos[1] !== undefined ? pos[1] : pos[0]) / 100;
        const overflowY = Math.max(0, sh - box.height);
        const cutTop = overflowY * py,
          cutBot = overflowY - cutTop;
        const overflowX = Math.max(0, sw - box.width);
        const px = parseFloat(pos[0]) / 100;
        return {
          nat: nw + "x" + nh,
          box: Math.round(box.width) + "x" + Math.round(box.height),
          objPos: cs.objectPosition,
          cutTopPct: +((100 * cutTop) / sh).toFixed(1),
          cutBotPct: +((100 * cutBot) / sh).toFixed(1),
          cutLeftPct: +((100 * overflowX * px) / sw).toFixed(1),
          cutRightPct: +((100 * (overflowX - overflowX * px)) / sw).toFixed(1),
        };
      });
      if (!o) {
        say(r.padEnd(22) + "no hero media");
        continue;
      }
      if (o.err) {
        say(r.padEnd(22) + o.err);
        continue;
      }
      const flag = o.cutTopPct >= 8 ? "  << TOP CUT" : "";
      say(
        r.padEnd(22) +
          o.nat.padEnd(11) +
          " box " +
          o.box.padEnd(9) +
          " pos " +
          o.objPos.padEnd(11) +
          " cut top " +
          String(o.cutTopPct).padStart(5) +
          "%  bottom " +
          String(o.cutBotPct).padStart(5) +
          "%  sides " +
          o.cutLeftPct +
          "/" +
          o.cutRightPct +
          "%" +
          flag
      );
    } catch (e) {
      say(r.padEnd(22) + "FAILED " + String(e).slice(0, 40));
    }
  }
  await b.close();
})();
