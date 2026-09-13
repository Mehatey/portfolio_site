const fs = require("fs");
process.chdir(__dirname);
const rows = [
  ["Marriott", "Reception dashboard", "originals/marriott.webp", "round-2/marriott.webp", "After the project introduction."],
  [
    "Marriott",
    "Loyalty enrollment",
    "round-2/layers/marriott-enrollment-source.png",
    "round-2/marriott-enrollment.webp",
    "Beside the enrollment walkthrough.",
  ],
  [
    "M Health Fairview",
    "Choosing care at home",
    "../../assets/img/fairview/cover.webp",
    "round-2/fairview.webp",
    "Introduce the care discovery section.",
  ],
  [
    "Alpha Stockathon",
    "Gameplay on a laptop",
    "../../10.alpha/29.2.webp",
    "round-2/alpha.webp",
    "Beside the final challenge. Keep flat gameplay screens for detail.",
  ],
  ["Aananda", "The book in use", "../../9.aananda/14.webp", "round-2/aananda.webp", "Open the book section, followed by original spreads."],
  ["Mool", "Paths & Plans", "round-2/layers/mool-plans-source.png", "round-2/mool-plans.webp", "After the dashboard overview."],
];
const fig = (src, label) =>
  `<figure><figcaption>${label}</figcaption><a href="${src}" target="_blank" aria-label="Open ${label} at full size"><img src="${src}" alt="${label}" loading="lazy"></a></figure>`;
fs.writeFileSync(
  "index.html",
  `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Portfolio image review</title><style>*{box-sizing:border-box}body{margin:0;background:#f4f3ef;color:#20211f;font:15px/1.5 system-ui,sans-serif}main{max-width:1600px;margin:auto;padding:40px 32px}h1{font-size:32px;letter-spacing:-1px;margin:0}header p{color:#666;margin:6px 0 32px}h2{font-size:22px;letter-spacing:-.5px;margin:0}h2 span{font-weight:400;color:#6b6b66;margin-left:10px}section{margin:0 0 56px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:20px}figure{margin:0;min-width:0}figcaption{font-size:12px;color:#686a64;padding:12px 0 7px}figure a{display:flex;align-items:center;justify-content:center;background:#e5e5df;aspect-ratio:3/2;overflow:hidden;border-radius:5px}img{display:block;width:100%;height:100%;object-fit:contain}section>p{font-size:12px;color:#686a64;margin:10px 0}a{color:inherit}details{border-top:1px solid #ccc;padding:20px 0}summary{cursor:pointer}table{border-collapse:collapse;width:100%;margin-top:20px}td,th{text-align:left;border-bottom:1px solid #ddd;padding:12px;font-size:13px;vertical-align:top}footer{font-size:12px;color:#666;padding-top:30px}@media(max-width:650px){main{padding:24px 18px}.pair{grid-template-columns:1fr;gap:6px}h1{font-size:28px}h2{font-size:20px}h2 span{display:block;margin:0;font-size:15px}section{margin-bottom:40px}td,th{padding:8px 4px}}</style><main><header><h1>New settings. Same work.</h1><p>Six mockups. Original artwork preserved. Tap any image to enlarge.</p></header>${rows.map(([p, u, a, b, n]) => `<section><h2>${p}<span>${u}</span></h2><div class="pair">${fig(a, "Original artwork")}${fig(b, "New mockup")}</div><p>${n}</p></section>`).join("")}<section><h2>Your picks</h2><div class="pair">${fig("mool-b.webp", "Mool · B selected")}${fig("originals/naavo.webp", "Naavo · original stays")}</div></section><details><summary>Recruiter review · all 16 project pages</summary><div id="audit"></div></details><footer>Generated settings are illustrative presentation mockups. Source UI and artwork remain original. Local preview only. <a href="round-1.html">Previous batch</a> · <a href="round-2/audit.md">Review notes</a></footer></main></html>`
);
fs.writeFileSync(
  "round-2/selections.json",
  JSON.stringify(
    {
      mool_cover: "../mool-b.webp",
      naavo_cover: "../originals/naavo.webp",
      naavo_rejected: ["../naavo-a.webp", "../naavo-b.webp"],
      publication: false,
      batch: rows.map(([project, useCase, source, output, placement]) => ({
        project,
        useCase,
        source,
        output,
        placement,
        status: "awaiting visual direction",
      })),
    },
    null,
    2
  )
);
