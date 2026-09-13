const fs = require("fs");
process.chdir(__dirname);
const items = [
  ["mool", "Mool", "Banking at home, Pune", "../mool-b.webp", "Previously liked B", "mool.webp", "mool", "../../../5.mool/8.webp"],
  [
    "fairview",
    "M Health Fairview",
    "Choosing care together",
    "../round-2/fairview.webp",
    "Previous mockup",
    "fairview.webp",
    "m-health-fairview",
    "../../../assets/img/fairview/cover.webp",
  ],
  [
    "alpha",
    "Alpha Stockathon",
    "A game in a shared apartment",
    "../round-2/alpha.webp",
    "Previous mockup",
    "alpha.webp",
    "alpha-stockathon",
    "../../../10.alpha/29.2.webp",
  ],
  [
    "aananda",
    "Aananda",
    "A reader in a courtyard",
    "../round-2/aananda.webp",
    "Previous mockup",
    "aananda.webp",
    "aananda",
    "../../../9.aananda/14.webp",
  ],
  [
    "naavo-gift",
    "Naavo · gift set",
    "A new packaging application",
    "../../../7.naavo/15.1.webp",
    "Original packaging",
    "naavo-gift.webp",
    "naavo",
    "../../../7.naavo/13.3 solo.webp",
  ],
  [
    "naavo-use",
    "Naavo · daily ritual",
    "The oil in use",
    "../../../7.naavo/13.5 solo.webp",
    "Original bottles",
    "naavo-use.webp",
    "naavo",
    "../../../7.naavo/13.3 solo.webp",
  ],
  [
    "naavo-incense",
    "Naavo · incense",
    "An evening balcony routine",
    "../../../7.naavo/17.1.webp",
    "Original packaging",
    "naavo-incense.webp",
    "naavo",
    "../../../7.naavo/17.1.webp",
  ],
  [
    "apna",
    "Apna Adda",
    "Takeaway at the counter",
    "../../../11.illu/29.1.webp",
    "Original packaging",
    "apna.webp",
    "illustrations",
    "../../../11.illu/29.1.webp",
  ],
  [
    "shot",
    "Shot on iPhone",
    "From a street poster to its story",
    "../../../8.shotoniphone/3.webp",
    "Original poster",
    "shot.webp",
    "shot-on-iphone",
    "../../../8.shotoniphone/4.webp",
  ],
];
const url = (p) => "round-3/" + p;
const fig = (src, label, alt) =>
  `<figure><figcaption>${label}</figcaption><a class="image" href="${url(src)}" target="_blank" rel="noopener"><img src="${url(src)}" alt="${alt}" loading="lazy" width="1536" height="1024"></a></figure>`;
const sections = items
  .map(
    ([id, title, sub, old, oldlabel, asset, slug, source], i) =>
      `<section class="project" id="${id}"><div class="section-head"><div><span class="number">0${i + 1}</span><h2>${title}</h2><p>${sub}</p></div><a class="quiet" href="round-3/placements/${slug}.html#${id === "naavo-use" ? "new-image-2" : id === "naavo-incense" ? "new-image-3" : "new-image"}">Preview in project ↗</a></div><div class="pair">${fig(old, oldlabel, title + " previous artwork")}${fig(asset, "New · illustrative concept", title + " proposed contextual mockup")}</div><div class="links"><a href="${url(source)}" target="_blank">Source artwork ↗</a><a href="${url(asset.replace(".webp", ".png"))}" download>PNG ↓</a></div></section>`
  )
  .join("");
const motion = [
  ["naavo", "Naavo", "Original box opening → gift set → daily ritual", "naavo-gift.webp"],
  ["cube", "Cube of Creations", "Original drawing → 2D game → 3D world", "cube-motion-poster.webp"],
  ["mindu", "Mind Your Feelings", "Original kiosk interaction", "mindu-motion-poster.webp"],
]
  .map(
    ([id, title, caption, poster]) =>
      `<article class="motion-card"><h3>${title}</h3><video controls loop muted playsinline preload="metadata" poster="round-3/${poster}" aria-label="${title} motion study"><source src="round-3/${id}-motion.mp4" type="video/mp4"></video><div class="links"><span>${caption}</span><a download href="round-3/${id}-motion.gif">GIF ↓</a><a download href="round-3/${id}-motion.mp4">MP4 ↓</a></div></article>`
  )
  .join("");
const proofSlugs = JSON.parse(fs.readFileSync("placements/proof-manifest.json", "utf8"));
const proof = JSON.parse(fs.readFileSync("evidence/sources.json", "utf8"))
  .map(
    (p) =>
      `<article class="proof-card"><div class="section-head"><h3>${p.title}</h3><a class="quiet" href="round-3/placements/${proofSlugs[p.id]}.html#new-image">Preview in project ↗</a></div><div class="proof-frames">${p.labels.map((l, i) => `<figure><a href="${url(p.sources[i])}" target="_blank"><img src="round-3/evidence/${p.id}-${i}.png" alt="${l}, original ${p.title} documentation" loading="lazy" width="548" height="340"></a><figcaption>${i + 1} · ${l}</figcaption></figure>`).join("")}</div></article>`
  )
  .join("");
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Portfolio · imagery round 3</title><style>
*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:90px}body{margin:0;background:#f4f3ef;color:#22251f;font:15px/1.5 system-ui,sans-serif}a{color:inherit;text-underline-offset:4px}a:focus-visible,button:focus-visible,video:focus-visible{outline:3px solid #477659;outline-offset:4px}main{max-width:1600px;margin:auto;padding:42px 32px 90px}header{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:26px}h1{font-size:clamp(30px,4vw,54px);line-height:1.08;letter-spacing:-2px;margin:0}header p{margin:12px 0 0;color:#686c61}nav{position:sticky;top:0;z-index:3;background:#f4f3eff2;backdrop-filter:blur(12px);padding:16px 0;display:flex;gap:8px;align-items:center;border-block:1px solid #d5d6cd;margin-bottom:40px}nav a{padding:7px 14px;border-radius:20px;text-decoration:none;font-size:13px}nav a:hover{background:#e3e6db}nav a:first-child{background:#252c23;color:white}.quiet{font-size:13px;white-space:nowrap}.project{margin-bottom:68px}.section-head{display:flex;justify-content:space-between;align-items:end;gap:16px;margin-bottom:16px}.number{font-size:12px;letter-spacing:2px;color:#6d7765}h2{font-size:27px;letter-spacing:-.8px;line-height:1.2;margin:5px 0}h3{font-size:19px;letter-spacing:-.3px;margin:0 0 16px}.section-head p{margin:4px 0 0;color:#686c61;font-size:14px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}figure{margin:0;min-width:0}figcaption{font-size:12px;color:#666e60;padding:7px 0}.image{display:block;aspect-ratio:3/2;background:#e5e5df;border-radius:5px;overflow:hidden}.image img{width:100%;height:100%;object-fit:contain;display:block}.links{display:flex;justify-content:flex-end;gap:20px;font-size:12px;color:#636b5c;margin-top:12px}.links span{margin-right:auto}.group{border-top:1px solid #cdd1c5;padding-top:30px;margin-top:70px}.group>p{color:#686c61;margin:8px 0 28px}.motion-grid{display:grid;grid-template-columns:1fr 1fr;gap:36px 24px}.motion-card:first-child{grid-column:1/-1;max-width:1000px;width:100%;margin:auto}.motion-card video{width:100%;display:block;background:#111;border-radius:5px}.proof-card{padding:28px 0;border-bottom:1px solid #d9ddd2}.proof-frames{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.proof-frames img{width:100%;height:auto;display:block;background:#161916}.kept-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}.kept-grid img{width:100%;height:auto;aspect-ratio:3/2;object-fit:contain;background:#e5e5df}details{margin-top:24px}summary{cursor:pointer;font-size:15px}footer{border-top:1px solid #cdd1c5;margin-top:60px;padding-top:24px;color:#636b5c;font-size:12px;display:flex;gap:24px;flex-wrap:wrap}@media(max-width:650px){main{padding:28px 18px 60px}header{display:block}header>.quiet{display:inline-block;margin-top:16px}h1{letter-spacing:-1.2px}.pair,.motion-grid,.proof-frames,.kept-grid{grid-template-columns:1fr;gap:16px}.section-head{align-items:start}.section-head .quiet{white-space:normal;max-width:90px;text-align:right}.project{margin-bottom:44px}h2{font-size:23px}nav{gap:0;justify-content:space-between}nav a{padding:7px 9px}.motion-card:first-child{grid-column:auto}.links{gap:16px;flex-wrap:wrap}.links span{flex-basis:100%}.proof-frames{gap:20px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style></head><body><main><header><div><h1>Work, in the world.</h1><p>Nine new mockups. Three motion studies. Original artwork preserved.</p></div><a class="quiet" href="round-2.html">Previous round ↗</a></header><nav aria-label="Review sections"><a href="#mool">Mockups</a><a href="#motion">Motion</a><a href="#proof">Interaction proof</a><a href="#kept">Kept</a></nav>${sections}<section class="group" id="motion"><h2>Motion studies</h2><p>Play a loop. Download GIF or MP4.</p><div class="motion-grid">${motion}</div></section><section class="group" id="proof"><h2>Show what happens.</h2><p>Existing footage and artwork, arranged for a faster project read.</p><details><summary>Explore eight project sequences</summary>${proof}</details></section><section class="group" id="kept"><h2>Keep these.</h2><p>Your selected Marriott mockups and original Naavo cover. <a href="round-3/placements/marriott.html#new-image">Marriott placement ↗</a></p><div class="kept-grid">${fig("../round-2/marriott.webp", "Marriott · reception", "Approved Marriott reception tablet")}${fig("../round-2/marriott-enrollment.webp", "Marriott · enrollment", "Approved Marriott employee laptop")}${fig("../originals/naavo.webp", "Naavo · original cover", "Original Naavo cover retained")}</div></section><footer><span>Local review only · new settings are illustrative concepts</span><a href="round-3/decisions.md">Decisions & next priorities</a><a href="round-3/sources.json">Source manifest</a><a download href="round-3/exports/selected-webp.zip">Image exports ↓</a><a href="round-1.html">Round 1</a></footer></main></body></html>`;
fs.writeFileSync("../index.html", html);
fs.writeFileSync("gallery-items.json", JSON.stringify(items, null, 2));
