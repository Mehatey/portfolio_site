/* Safari/WebKit pass. This site leans on backdrop-filter (including the
   url(#filter) form, which WebKit does NOT support), mask-image,
   background-clip: text and WebGL -- all places where Chrome and Safari
   diverge. Never tested here before. */
const { webkit } = require("playwright");
const S = (ms) => new Promise((r) => setTimeout(r, ms));
const say = (s) => process.stdout.write(s + "\n");
(async () => {
  const b = await webkit.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1400, height: 860 }, deviceScaleFactor: 2 });
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
      await S(3400);
      const o = await p.evaluate(() => {
        const bad = [];
        if (document.documentElement.scrollWidth > innerWidth + 2) bad.push("H-OVERFLOW " + document.documentElement.scrollWidth);
        // WebGL actually running?
        const gl = [...document.querySelectorAll("canvas")].filter((c) => {
          try {
            return !!(c.getContext("webgl") || c.getContext("webgl2"));
          } catch (e) {
            return false;
          }
        });
        // does anything rely on backdrop-filter: url()?
        const urlBd = [...document.querySelectorAll("*")].filter((e) => {
          const v = getComputedStyle(e).backdropFilter || getComputedStyle(e).webkitBackdropFilter || "";
          return /url\(/.test(v);
        }).length;
        // did the theme apply?
        const theme = document.documentElement.getAttribute("data-theme");
        // is the hero title visible where there is one?
        const t = document.querySelector(".proj-title");
        const titleOp = t ? +getComputedStyle(t).opacity : null;
        if (t && titleOp < 0.05) bad.push("TITLE-INVISIBLE");
        // the mark
        const face = document.querySelector(".studio-mark .cube-face");
        const markFill = face ? getComputedStyle(face).fillOpacity : "-";
        if (face && +markFill > 0.5) bad.push("MARK-FILLED " + markFill);
        // portrait shader
        const glLive = document.getElementById("about-profile-card");
        return {
          bad,
          gl: gl.length,
          urlBd,
          theme,
          titleOp,
          markFill,
          portrait: glLive ? (glLive.classList.contains("gl-live") ? "shader" : "fallback") : "n/a",
        };
      });
      say(
        r.padEnd(20) +
          (o.bad.length ? o.bad.join(" | ") : "clean") +
          "  | theme=" +
          o.theme +
          " glCanvases=" +
          o.gl +
          " backdrop-url=" +
          o.urlBd +
          (o.portrait !== "n/a" ? " portrait=" + o.portrait : "") +
          (errs.length ? "  JS: " + errs[0] : "")
      );
    } catch (e) {
      say(r.padEnd(20) + "FAILED " + String(e).slice(0, 60));
    }
    p.off("pageerror", h);
  }
  await b.close();
})();
