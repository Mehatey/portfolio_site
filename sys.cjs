/* Design-system audit: what background layer each route runs, how the mark
   and the nav icons are drawn, and how the bar behaves -- in both themes. */
const { open } = require("./qa.cjs");
const say = (s) => process.stdout.write(s + "\n");
(async () => {
  const { b, p, S } = await open();
  for (const r of process.argv.slice(2)) {
    try {
      await p.goto("http://127.0.0.1:4000" + r, { waitUntil: "domcontentloaded", timeout: 40000 });
      await S(3000);
      const out = {};
      for (const theme of ["light", "dark"]) {
        await p.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
        await S(700);
        out[theme] = await p.evaluate(() => {
          const bg = [];
          document.querySelectorAll("canvas").forEach((c) => {
            const r2 = c.getBoundingClientRect();
            const cs = getComputedStyle(c);
            if (cs.display === "none" || +cs.opacity < 0.02) return;
            if (r2.width < 200 || r2.height < 150) return;
            const id = c.id || (typeof c.className === "string" ? c.className.trim().split(/\s+/)[0] : "canvas");
            bg.push(id + "(" + (c.getContext && c.getContext("webgl") ? "gl" : "2d") + ")");
          });
          const layers = [];
          [
            "#smoke-bg",
            "#loader-smoke-bg",
            "#work-collage",
            "#loader-collage",
            ".page-noise",
            ".grain",
            "#grain",
            ".bg-noise",
            ".hero-wash",
            "#hero-gl",
          ].forEach((sel) => {
            const e = document.querySelector(sel);
            if (!e) return;
            const cs = getComputedStyle(e);
            if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity < 0.02) return;
            layers.push(sel + "@" + (+cs.opacity).toFixed(2));
          });
          const m = document.querySelector(".studio-mark");
          const cube = m && m.querySelector(".logo-cube");
          const face = m && m.querySelector(".cube-face");
          const nav = document.querySelector(".studio-nav");
          const icons = [...document.querySelectorAll(".studio-link .nav-pixel")].map((s) => {
            const c = (s.className.baseVal || s.className || "").toString().match(/nav-pixel--(\w[\w-]*)/);
            return c ? c[1] : "?";
          });
          return {
            canvases: bg.join(",") || "none",
            layers: layers.join(",") || "none",
            markFill: face ? getComputedStyle(face).fill.replace(/\s/g, "") : "-",
            markStroke: face ? getComputedStyle(face).strokeWidth : "-",
            markFilter: cube ? getComputedStyle(cube).filter : "-",
            markSize: cube ? Math.round(cube.getBoundingClientRect().width) : 0,
            capsuleBg: m ? getComputedStyle(m).backgroundColor.replace(/\s/g, "") : "-",
            icons: icons.join("/") || "none",
            navPos: nav ? getComputedStyle(nav).position : "-",
            navTop: nav ? Math.round(nav.getBoundingClientRect().top) : 0,
            navBg: nav ? getComputedStyle(nav).backgroundColor.replace(/\s/g, "") : "-",
            scrim: document.querySelector(".nav-scrim") ? "yes" : "no",
            bodyCls: document.body.className.split(/\s+/).filter(Boolean).join(" ") || "-",
          };
        });
      }
      say("== " + r);
      say("  canvases  light: " + out.light.canvases);
      say("            dark : " + out.dark.canvases);
      say("  layers    light: " + out.light.layers);
      say("            dark : " + out.dark.layers);
      say(
        "  mark      light: fill=" +
          out.light.markFill +
          " stroke=" +
          out.light.markStroke +
          " size=" +
          out.light.markSize +
          " filter=" +
          out.light.markFilter.slice(0, 18) +
          " capsule=" +
          out.light.capsuleBg
      );
      say(
        "            dark : fill=" +
          out.dark.markFill +
          " stroke=" +
          out.dark.markStroke +
          " size=" +
          out.dark.markSize +
          " filter=" +
          out.dark.markFilter.slice(0, 18) +
          " capsule=" +
          out.dark.capsuleBg
      );
      say(
        "  icons     " +
          out.light.icons +
          "   nav=" +
          out.light.navPos +
          "@" +
          out.light.navTop +
          " bg=" +
          out.light.navBg +
          " scrim=" +
          out.light.scrim +
          "  body='" +
          out.light.bodyCls +
          "'"
      );
    } catch (e) {
      say(r.padEnd(20) + "FAILED " + String(e).slice(0, 50));
    }
  }
  await b.close();
})();
