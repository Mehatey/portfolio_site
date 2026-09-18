/* Whole-site audit: every asset that 404s, every console error, duplicate
   ids, images with no alt, controls with no accessible name. Internal links
   are collected and resolved once at the end so nothing is fetched twice. */
const { open } = require("./qa.cjs");
const say = (s) => process.stdout.write(s + "\n");
(async () => {
  const { b, p, S } = await open();
  const internal = new Set(),
    external = new Set(),
    assetFails = new Map();
  for (const r of process.argv.slice(2)) {
    const errs = [];
    const onErr = (e) => errs.push(String(e).slice(0, 100));
    const onResp = (res) => {
      if (res.status() >= 400) assetFails.set(res.url().replace(/^https?:\/\/127\.0\.0\.1:4000/, ""), (assetFails.get(res.url()) || 0) + 1);
    };
    p.on("pageerror", onErr);
    p.on("response", onResp);
    try {
      await p.goto("http://127.0.0.1:4000" + r, { waitUntil: "domcontentloaded", timeout: 45000 });
      await p.evaluate(() => {
        document.querySelectorAll("img[loading=lazy]").forEach((i) => (i.loading = "eager"));
      });
      await S(3200);
      const o = await p.evaluate(() => {
        const bad = [];
        const ids = {};
        document.querySelectorAll("[id]").forEach((e) => {
          ids[e.id] = (ids[e.id] || 0) + 1;
        });
        const dup = Object.entries(ids)
          .filter(([, n]) => n > 1)
          .map(([k]) => k);
        if (dup.length) bad.push("DUP-ID " + dup.slice(0, 3).join(","));
        let noAlt = 0;
        document.querySelectorAll("img").forEach((i) => {
          if (!i.hasAttribute("alt")) noAlt++;
        });
        if (noAlt) bad.push("IMG-NO-ALT-ATTR " + noAlt);
        let noName = 0;
        document.querySelectorAll("button, a").forEach((e) => {
          const t = (e.textContent || "").trim();
          if (t) return;
          if (e.getAttribute("aria-label") || e.getAttribute("title") || e.querySelector("[aria-label]")) return;
          if (e.querySelector("img[alt]:not([alt=''])")) return;
          const r2 = e.getBoundingClientRect();
          if (r2.width < 4 || r2.height < 4) return;
          noName++;
        });
        if (noName) bad.push("CONTROL-NO-NAME " + noName);
        const links = [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));
        return { bad, links };
      });
      o.links.forEach((h) => {
        if (!h || h.startsWith("#") || h.startsWith("mailto:") || h.startsWith("tel:") || h.startsWith("javascript:")) return;
        if (/^https?:\/\//.test(h)) external.add(h);
        else internal.add(h.split("#")[0]);
      });
      say(r.padEnd(22) + (o.bad.length ? o.bad.join("  |  ") : "clean") + (errs.length ? "  JS: " + errs[0] : ""));
    } catch (e) {
      say(r.padEnd(22) + "FAILED " + String(e).slice(0, 44));
    }
    p.off("pageerror", onErr);
    p.off("response", onResp);
  }
  say("");
  if (assetFails.size) {
    say("ASSET 4xx/5xx:");
    [...assetFails.keys()].slice(0, 20).forEach((u) => say("  " + u));
  } else say("no failing assets on any page");
  require("fs").writeFileSync("/tmp/links.json", JSON.stringify({ internal: [...internal], external: [...external] }, null, 1));
  say("collected " + internal.size + " internal and " + external.size + " external links -> /tmp/links.json");
  await b.close();
})();
