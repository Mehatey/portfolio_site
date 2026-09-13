const fs = require("fs");
process.chdir(__dirname);
const root = "/output/image-review-2026-09-07/";
const cards = [
  ["apna", "Apna Adda", "illustrations", "../../../11.illu/30.1.webp", "Original menu"],
  ["shot", "Shot on iPhone · street poster", "shot-on-iphone", "../../../8.shotoniphone/3.webp", "Original artwork"],
  ["billboard", "Shot on iPhone · billboard", "shot-on-iphone", "../../../8.shotoniphone/3.webp", "Original artwork"],
  ["mool", "Mool", "mool", "../round-3/mool.webp", "Previous"],
  ["fairview", "Fairview", "m-health-fairview", "../round-3/fairview.webp", "Previous"],
  ["alpha", "Alpha Stockathon", "alpha-stockathon", "../round-3/alpha.webp", "Previous"],
  ["aananda", "Aananda", "aananda", "../round-3/aananda.webp", "Previous"],
];
let html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mockup corrections</title><style>*{box-sizing:border-box}body{margin:0;background:#eeece6;color:#181818;font:15px/1.5 system-ui}header,main,footer{max-width:1450px;margin:auto;padding:28px}header{padding-bottom:0}h1{font-size:30px;margin:0}p{color:#666;margin:8px 0}nav{display:flex;gap:12px;flex-wrap:wrap;margin:18px 0}a{color:inherit}section{margin:25px 0 65px;scroll-margin-top:20px}h2{font-size:20px;margin:0 0 12px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}.pair figure{margin:0;min-width:0}.pair img{display:block;width:100%;height:auto;aspect-ratio:3/2;object-fit:contain;background:#dedbd3}.pair figcaption{font-size:12px;padding:7px 0}section>a{font-size:12px}button{font:inherit;border:1px solid #aaa;background:transparent;border-radius:20px;padding:5px 12px;cursor:pointer}.single .pair{grid-template-columns:1fr;max-width:1100px;margin:auto}.single .before{display:none}@media(max-width:700px){header,main,footer{padding:18px}.pair{grid-template-columns:1fr;gap:10px}h1{font-size:25px}section{margin-bottom:45px}}dialog{border:0;padding:0;max-width:98vw;background:#111}dialog img{max-width:96vw;max-height:90vh;object-fit:contain}dialog::backdrop{background:#000c}dialog button{position:absolute;right:8px;top:8px;background:white}</style><header><h1>Mockup corrections</h1><p>Original artwork. New settings. Click any image for detail.</p><nav><button id="mode">Show new images only</button><a href="${root}round-3.html">Earlier batch</a><a href="${root}round-4/decisions.md">Notes + sources</a></nav></header><main>`;
for (const [id, title, slug, before, label] of cards) {
  const b = new URL(before, "http://localhost" + root + "round-4/").pathname;
  html += `<section id="${id}"><h2>${title}</h2><div class="pair"><figure class="before"><img src="${b}" alt="${title}, ${label.toLowerCase()}" loading="lazy"><figcaption>${label}</figcaption></figure><figure><img src="${root}round-4/${id}.webp" alt="${title}, corrected illustrative mockup" loading="lazy"><figcaption>New mockup</figcaption></figure></div><a href="${root}round-4/placements/${slug}.html#new-image${id === "billboard" ? "-2" : ""}">View in project page</a></section>`;
}
html += `</main><footer>Illustrative mockups for review. Original Naavo cover and approved Marriott images retained in earlier batch.</footer><dialog><button>Close</button><img alt="Mockup detail"></dialog><script>const d=document.querySelector('dialog');document.querySelectorAll('figure img').forEach(i=>{i.style.cursor='zoom-in';i.onclick=()=>{d.querySelector('img').src=i.src;d.showModal()}});d.querySelector('button').onclick=()=>d.close();d.onclick=e=>{if(e.target===d)d.close()};document.querySelector('#mode').onclick=e=>{document.body.classList.toggle('single');e.target.textContent=document.body.classList.contains('single')?'Show comparisons':'Show new images only'}</script></html>`;
fs.writeFileSync("../index.html", html);
fs.writeFileSync("manifest.json", JSON.stringify(cards, null, 2));
