const fs = require("fs");
const path = require("path");
process.chdir(__dirname);
fs.mkdirSync("placements", { recursive: true });
const root = "/output/image-review-2026-09-07/";
const list = [
  { slug: "marriott", asset: "../round-2/marriott.webp", after: "assets/img/marriott/01-what.webp" },
  { slug: "mool", hero: "5.mool/cover.jpg", asset: "mool.webp", after: "5.mool/8.webp" },
  { slug: "m-health-fairview", asset: "fairview.webp", after: "assets/img/fairview/07-choose-poster.jpg" },
  { slug: "alpha-stockathon", asset: "alpha.webp", after: "10.alpha/29.2.webp" },
  { slug: "aananda", asset: "aananda.webp", after: "9.aananda/14.webp" },
  { slug: "naavo", asset: "naavo-gift.webp", after: "7.naavo/15.1.webp", extra: "naavo-use.webp" },
  { slug: "illustrations", asset: "apna.webp", after: "11.illu/29.1.webp" },
  { slug: "shot-on-iphone", asset: "shot.webp", after: "8.shotoniphone/4.webp" },
];
function mediaEnd(html, at) {
  const stack = [];
  const tags = /<div\b[^>]*>|<\/div>/g;
  let t;
  while ((t = tags.exec(html)) && t.index < at) {
    if (t[0].startsWith("</")) stack.pop();
    else stack.push({ at: t.index, tag: t[0] });
  }
  const grid = stack.find((x) => /class=["'][^"']*\bcs-grid(?:[\s"'-]|$)/.test(x.tag) && !x.tag.includes("cs-grid-item"));
  const box = grid || [...stack].reverse().find((x) => /cs-bleed|cs-wide/.test(x.tag)) || stack[stack.length - 1];
  if (!box) throw Error("No media wrapper");
  tags.lastIndex = box.at;
  let depth = 0;
  while ((t = tags.exec(html))) {
    depth += t[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return tags.lastIndex;
  }
  throw Error("Unclosed media wrapper");
}
const figure = (asset) =>
  `<figure class="review-insert" id="new-image${asset === "naavo-use.webp" ? "-2" : asset === "naavo-incense.webp" ? "-3" : ""}"><img src="${root}round-3/${asset}" alt="Proposed illustrative mockup" loading="eager"><figcaption>Illustrative mockup · placement preview</figcaption></figure>`;
for (const p of list) {
  let html = fs.readFileSync("../../../_site/" + p.slug + "/index.html", "utf8");
  html = html.replace(/((?:src|href|poster|data-src)=["'])\/(?!\/)/g, "$1/_site/").replace(/url\((["']?)\/(?!\/)/g, "url($1/_site/");
  if (p.slug === "mool")
    html = html.replace("</head>", "<style>@media(max-width:650px){.proj-hero .hero-video{object-position:left center!important}}</style></head>");
  if (p.hero) html = html.replaceAll('src="/_site/' + p.hero + '"', 'src="' + root + "round-3/" + p.asset + '"');
  const needle = "/_site/" + p.after;
  const at = html.indexOf(needle, html.indexOf('<div class="case-story">'));
  if (at < 0) throw Error("Missing placement " + p.slug);
  const close = mediaEnd(html, at);
  html = html.slice(0, close) + figure(p.asset) + (p.extra ? figure(p.extra) : "") + html.slice(close);
  if (p.slug === "marriott") {
    const pos = html.indexOf("/_site/assets/img/marriott/06-enroll-poster.jpg", html.indexOf('<div class="case-story">'));
    const end = mediaEnd(html, pos);
    html = html.slice(0, end) + figure("../round-2/marriott-enrollment.webp").replace('id="new-image"', 'id="new-image-2"') + html.slice(end);
  }
  if (p.slug === "naavo") {
    const incAt = html.indexOf("/_site/7.naavo/17.1.webp", html.indexOf('<div class="case-story">'));
    const incClose = mediaEnd(html, incAt);
    if (incAt > 0) html = html.slice(0, incClose) + figure("naavo-incense.webp") + html.slice(incClose);
  }
  html = html.replace(
    "</head>",
    `<style>.review-bar{position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#f4f3ed;color:#161814;border:1px solid #777;border-radius:30px;padding:10px 18px;font:13px/1.3 system-ui;box-shadow:0 3px 20px #0003;white-space:nowrap}.review-bar a{color:inherit!important;text-decoration:underline!important}.review-insert{scroll-margin-top:100px;grid-column:1/-1!important;flex-basis:100%!important;margin:32px auto!important;max-width:1200px!important;width:100%!important}.review-insert img{display:block!important;width:100%!important;height:auto!important;object-fit:contain!important}.review-insert figcaption{font:12px/1.5 system-ui;opacity:.65;padding:8px 0}.review-insert:before{display:none!important}</style></head>`
  );
  html = html.replace(
    "</body>",
    `<aside class="review-bar">Local preview · <a href="${root}">Image gallery</a> · <a href="#new-image">New image</a></aside></body>`
  );
  fs.writeFileSync("placements/" + p.slug + ".html", html);
}
fs.writeFileSync("placements/manifest.json", JSON.stringify(list, null, 2));
