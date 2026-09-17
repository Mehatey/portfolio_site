/* QA harness. HEADLESS and never focused.
   Sid: "can u stop manually changing my mac screen when u do qa or testing,
   it keeps switching my screen, i am watching a movie."
   Every earlier script launched a visible Chrome and called bringToFront(),
   which raises a window over whatever he is doing. Layout geometry and
   computed styles are identical headless, so nothing measured here needs the
   window. Frame-rate checks are the one thing that does -- rAF throttles when
   a window is not composited -- so those are deliberately not run from this
   file; they need a headed pass at a time he is not using the machine. */
const { chromium } = require("playwright");
const S = (ms) => new Promise((r) => setTimeout(r, ms));
module.exports.open = async () => {
  const b = await chromium.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--use-gl=angle", "--use-angle=metal", "--autoplay-policy=no-user-gesture-required"],
  });
  const ctx = await b.newContext({ viewport: { width: 1400, height: 880 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => {
    try {
      history.scrollRestoration = "manual";
      localStorage.setItem("sid_loaded", "1");
    } catch (e) {}
  });
  const p = await ctx.newPage();
  return { b, p, S };
};
