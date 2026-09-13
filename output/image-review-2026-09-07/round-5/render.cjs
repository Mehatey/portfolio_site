const fs = require("fs");
process.chdir(__dirname);
const P = require("./projects.json");
const base = "/output/image-review-2026-09-07/round-5/";
const esc = (s) => String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const apps = require("./applications.cjs");
const css = `@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box}html,body{margin:0}body{font-family:Figtree,Arial,sans-serif;background:var(--bg);color:var(--ink)}.art{width:1440px;height:900px;padding:60px 64px 40px;display:flex;flex-direction:column;position:relative;overflow:hidden}.mast{display:flex;justify-content:space-between;align-items:center;font-size:20px;font-weight:600;margin-bottom:35px}.status{font-size:17px;font-weight:500;opacity:.8}h1{font-size:57px;line-height:1.06;letter-spacing:-.025em;max-width:1120px;margin:0 0 18px;text-wrap:balance}p.deck{font-size:24px;line-height:1.35;max-width:1050px;margin:0 0 34px;opacity:.85}.body{flex:1;min-height:0;display:flex;gap:36px}.body>figure{flex:1;min-width:0}.body img{width:100%;height:100%;object-fit:contain;display:block}figure{margin:0;display:flex;flex-direction:column;min-height:0}.visual{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;overflow:hidden}.label{font-size:26px;line-height:1.15;font-weight:650;margin:18px 0 7px}.detail{font-size:20px;line-height:1.3;opacity:.82;max-width:34ch}.foot{display:flex;justify-content:space-between;font-size:15px;opacity:.65;padding-top:23px}.plate .body{align-items:stretch}.plate figure{flex:1.8}.notes{flex:1;display:flex;flex-direction:column;justify-content:center;gap:27px}.note{font-size:29px;line-height:1.22;border-top:1px solid color-mix(in srgb,var(--ink) 30%,transparent);padding-top:20px}.matrix .body{flex-direction:column;gap:0}.row{display:grid;grid-template-columns:370px 1fr;gap:55px;align-items:center;flex:1;border-top:1px solid color-mix(in srgb,var(--ink) 25%,transparent)}.row strong{font-size:39px;color:var(--accent)}.row p{font-size:29px;line-height:1.25;margin:0;max-width:47ch}.diagram .body{align-items:center}.node{flex:1;min-width:0;position:relative}.node .visual{height:240px;flex:none}.node h2{font-size:33px;line-height:1.08;margin:20px 0 15px}.node p{font-size:24px;line-height:1.35;margin:0;max-width:28ch;opacity:.85}.diagram.two .node .visual{height:330px}.node+.node:before{content:'→';position:absolute;left:-32px;top:110px;font-size:28px;color:var(--accent)}.diagram.textonly .body{align-items:stretch}.diagram.textonly .node{display:flex;flex-direction:column;justify-content:center;padding-right:20px}.diagram.textonly .node:before{top:43%}.diagram.textonly .node h2{font-size:43px;max-width:15ch}.impact .body{display:block}.impact-row{display:grid;grid-template-columns:310px 1fr;gap:40px;align-items:center;min-height:135px;border-top:1px solid #bbb}.impact-row strong{font-size:64px;color:var(--accent);font-weight:700}.impact-row p{font-size:32px;line-height:1.2;max-width:30ch}.application .body{gap:45px}.application .application-art{width:46%;flex:none}.application .proposal{flex:1;display:flex;flex-direction:column;justify-content:center;gap:21px}.proposal strong{font-size:31px;display:block;color:var(--accent);margin-bottom:8px}.proposal p{font-size:23px;margin:0;line-height:1.3}.application.no-image .proposal{flex-direction:row;align-items:center;gap:38px}.application.no-image .proposal>div{flex:1}.application.artifacts .body{align-items:stretch}.logo .body{align-items:center;justify-content:center}.logo .logo-stage{width:80%;height:100%;display:flex;align-items:center;justify-content:center}.logo img{max-width:780px;max-height:390px;object-fit:contain}.logo h1{font-size:46px}.logo .deck{max-width:900px}.sequence .body{align-items:stretch}.generated .body img{object-fit:contain}.film .body{align-items:center}.film img{object-fit:contain}.film .body{background:#0d1014}.comparison .visual{padding:8px;background:color-mix(in srgb,var(--ink) 5%,transparent)}.triptych .visual,.sequence .visual{padding:5px}.motion-hint{color:var(--accent)}
@media(max-width:900px){.art{width:750px;height:1100px;padding:42px 40px 32px}.mast{font-size:23px;margin-bottom:28px}.status{font-size:20px}h1{font-size:49px;max-width:670px}.deck,p.deck{font-size:26px;margin-bottom:28px}.body{gap:22px}.foot{font-size:18px;gap:20px}.label{font-size:28px}.detail{font-size:24px}.plate .body{flex-direction:column;gap:22px}.plate figure{flex:1;min-height:300px}.notes{flex:0;gap:14px}.note{font-size:25px;padding-top:12px}.row{grid-template-columns:1fr;gap:10px;padding:18px 0}.row strong{font-size:34px}.row p{font-size:27px}.diagram .body{flex-direction:column;align-items:stretch;gap:22px}.diagram .node{display:grid;grid-template-columns:220px 1fr;column-gap:25px;align-items:center;min-height:180px;flex:1}.diagram .node .visual{grid-row:1/3;height:175px}.diagram .node h2{font-size:30px;margin:0}.diagram .node p{font-size:24px}.diagram .node+.node:before{content:'↓';left:103px;top:-28px;font-size:26px}.diagram.textonly .node{display:block;padding:18px 0 18px 35px;min-height:0;border-top:1px solid color-mix(in srgb,var(--ink) 25%,transparent)}.diagram.textonly .node h2{font-size:36px;max-width:none;margin:0 0 12px}.diagram.textonly .node p{max-width:35ch;font-size:26px}.diagram.textonly .node:before{left:0;top:30px;font-size:22px}.impact-row{grid-template-columns:230px 1fr;gap:30px;min-height:170px}.impact-row strong{font-size:57px}.impact-row p{font-size:29px}.application .body{flex-direction:column;gap:22px}.application .application-art{width:100%;height:310px}.application .proposal{gap:15px}.proposal strong{font-size:30px;margin-bottom:5px}.proposal p{font-size:25px}.application.no-image .proposal{flex-direction:column;align-items:stretch}.application.no-image .proposal>div{flex:none}.application.artifacts .body,.triptych .body,.sequence .body{flex-direction:column;gap:20px}.triptych figure,.sequence figure,.application.artifacts figure{display:grid;grid-template-columns:290px 1fr;grid-template-rows:1fr auto;column-gap:20px;align-items:center;min-height:180px;flex:1}.triptych .visual,.sequence .visual,.application.artifacts .visual{grid-row:1/3;height:190px}.triptych .label,.sequence .label,.application.artifacts .label{align-self:end}.triptych .detail,.sequence .detail{align-self:start}.comparison .body{flex-direction:column;gap:22px}.comparison figure{display:grid;grid-template-columns:330px 1fr;column-gap:22px;align-items:center}.comparison .visual{grid-row:1/3;height:290px}.comparison .label{align-self:end}.comparison .detail{align-self:start}.logo img{max-width:630px;max-height:420px}.logo .logo-stage{width:100%}.generated .body{margin:0 -40px}.generated .body img{object-fit:contain}.film .body{margin:0 -40px}.film .body img{object-fit:contain}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`;
const img = (asset, alt) => `<img src="${base + asset}" alt="${esc(alt)}">`;
function fig(i) {
  return `<figure><div class="visual">${i.asset ? img(i.asset, i.label) : ""}</div><div class="label">${esc(i.label)}</div>${i.detail ? `<div class="detail">${esc(i.detail)}</div>` : ""}</figure>`;
}
function body(p, a) {
  const custom = apps.body(p, a);
  if (custom) return custom;
  const I = a.items || [];
  if (a.type === "logo") return `<div class="logo-stage">${img(a.logoAsset, a.title)}</div>`;
  if (a.type === "impact") return I.map((i) => `<div class="impact-row"><strong>${esc(i.label)}</strong><p>${esc(i.detail)}</p></div>`).join("");
  if (a.type === "matrix") return I.map((i) => `<div class="row"><strong>${esc(i.label)}</strong><p>${esc(i.detail)}</p></div>`).join("");
  if (a.type === "plate") return fig(I[0]) + `<div class="notes">${a.notes.map((t) => `<div class="note">${esc(t)}</div>`).join("")}</div>`;
  if (a.type === "diagram")
    return I.map(
      (i) =>
        `<div class="node">${i.asset ? `<div class="visual">${img(i.asset, i.label)}</div>` : ""}<h2>${esc(i.label)}</h2>${i.detail ? `<p>${esc(i.detail)}</p>` : ""}</div>`
    ).join("");
  if (a.type === "application" && !I.some((i) => i.asset))
    return `${a.asset ? `<div class="application-art">${img(a.asset, a.title)}</div>` : ""}<div class="proposal">${I.map((i) => `<div><strong>${esc(i.label)}</strong><p>${esc(i.detail)}</p></div>`).join("")}</div>`;
  if (a.type === "generated") return img("generated/" + a.generated + ".webp", a.title);
  if (a.type === "film") return img("media/" + p.slug + "/" + a.id + "-poster.webp", a.title);
  return I.map(fig).join("");
}
for (const p of P) {
  fs.mkdirSync("media/" + p.slug, { recursive: true });
  for (const a of p.pieces) {
    const cls = [
      a.type,
      a.items?.length === 2 ? "two" : "",
      a.type === "diagram" && !a.items.some((i) => i.asset) ? "textonly" : "",
      a.type === "application" && !a.asset ? "no-image" : "",
      a.type === "application" && a.items.some((i) => i.asset) ? "artifacts" : "",
    ].join(" ");
    const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(p.title + " · " + a.title)}</title><style>${css + apps.css}</style><body style="--accent:${p.color};--bg:${p.bg};--ink:${p.ink}"><article class="art ${cls}" data-media="${a.id}"><div class="mast"><span>${esc(p.title)}</span><span class="status">${a.concept ? "Proposed application" : a.type === "logo" ? "Identity motion study" : a.type === "film" ? "Original footage · new edit" : ""}</span></div><h1>${esc(a.title)}</h1><p class="deck">${esc(a.deck)}</p><div class="body">${body(p, a)}</div><div class="foot"><span>Siddharth Mehta</span><span>${a.concept ? "Concept for review" : ""}</span></div></article></body></html>`;
    fs.writeFileSync("media/" + p.slug + "/" + a.id + ".html", html);
  }
}
fs.writeFileSync("media.css", css);
console.log(
  "Rendered",
  P.reduce((n, p) => n + p.pieces.length, 0),
  "media source files"
);
