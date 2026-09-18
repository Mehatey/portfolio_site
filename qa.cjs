/* Live, visible Chrome. Sid: "don't do a headless Chrome. do live visual QA
   and debugging, and scroll through and open it yourself."
   bringToFront() is deliberately NOT called -- he also asked that this stop
   switching his screen, and a headed window renders correctly without being
   raised over whatever he is doing. */
const { chromium } = require("playwright");
const S = (ms) => new Promise((r) => setTimeout(r, ms));
module.exports.open = async (opts = {}) => {
  const b = await chromium.launch({
    headless: false,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--window-size=1440,900", "--window-position=40,60", "--autoplay-policy=no-user-gesture-required"],
  });
  const ctx = await b.newContext({ viewport: { width: 1400, height: 860 }, deviceScaleFactor: 2, ...opts });
  await ctx.addInitScript(() => {
    try {
      history.scrollRestoration = "manual";
      localStorage.setItem("sid_loaded", "1");
    } catch (e) {}
  });
  const p = await ctx.newPage();
  return { b, p, S };
};
