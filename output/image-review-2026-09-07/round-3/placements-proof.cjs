const fs = require("fs");
process.chdir(__dirname);
const root = "/output/image-review-2026-09-07/round-3/";
const slugs = {
  "encoded-proof": "encoded",
  "mindu-proof": "mind-your-feelings",
  "bodhi-proof": "bloom",
  "bloom-proof": "mandalas",
  "ai-self-proof": "ai-self",
  "cube-proof": "cube-guy",
  "broken-proof": "b-plus-b",
  "prototypes-proof": "ai-prototypes",
};
const projects = JSON.parse(fs.readFileSync("evidence/sources.json", "utf8"));
for (const p of projects) {
  const slug = slugs[p.id];
  let html = fs
    .readFileSync("../../../_site/" + slug + "/index.html", "utf8")
    .replace(/((?:src|href|poster|data-src)=["'])\/(?!\/)/g, "$1/_site/")
    .replace(/url\((["']?)\/(?!\/)/g, "url($1/_site/");
  const section = `<section class="review-proof" id="new-image" aria-label="Original project documentation"><p class="review-proof-label">A quick look · original project documentation</p><div class="review-proof-grid">${p.labels.map((l, i) => `<figure><a href="${root}evidence/${p.id}-${i}.png"><img src="${root}evidence/${p.id}-${i}.png" alt="${l}" loading="eager" width="548" height="340"></a><figcaption>${i + 1} · ${l}</figcaption></figure>`).join("")}</div></section>`;
  if (slug === "ai-prototypes") html = html.replace('<div class="proto-list">', section + '<div class="proto-list">');
  else html = html.replace(/(<div class="proj-body"[^>]*>)/, "$1" + section);
  html = html
    .replace(
      "</head>",
      `<style>.review-proof{scroll-margin-top:100px;width:100%;max-width:1200px;margin:32px auto 56px!important;opacity:1!important;transform:none!important}.review-proof-label{font:13px/1.5 system-ui!important;opacity:.6!important;letter-spacing:0!important;margin:0 0 16px!important}.review-proof-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.review-proof figure{margin:0!important;padding:0!important;min-width:0}.review-proof img{display:block!important;width:100%!important;height:auto!important;object-fit:contain!important;aspect-ratio:auto!important}.review-proof figcaption{font:13px/1.5 system-ui!important;opacity:.75;padding:8px 0}.review-bar{position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#f4f3ed;color:#161814;border:1px solid #777;border-radius:30px;padding:10px 18px;font:13px/1.3 system-ui;white-space:nowrap}.review-bar a{color:inherit!important;text-decoration:underline!important}@media(max-width:650px){.review-proof-grid{grid-template-columns:1fr;gap:20px}.review-proof{margin-top:24px!important}}</style></head>`
    )
    .replace(
      "</body>",
      `<aside class="review-bar">Local preview · <a href="/output/image-review-2026-09-07/#proof">Image gallery</a> · <a href="#new-image">New sequence</a></aside></body>`
    );
  fs.writeFileSync("placements/" + slug + ".html", html);
}
fs.writeFileSync("placements/proof-manifest.json", JSON.stringify(slugs, null, 2));
