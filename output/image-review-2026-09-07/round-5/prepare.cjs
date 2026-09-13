const fs = require("fs"),
  path = require("path"),
  { execFileSync: r } = require("child_process");
process.chdir(__dirname);
const P = require("./projects.json");
fs.mkdirSync("assets", { recursive: true });
const root = "../../../";
const m = (...a) => r("magick", a);
const refs = {};
function prep(src) {
  if (refs[src]) return refs[src];
  const name = src.replace(/[^a-zA-Z0-9.-]/g, "_"),
    dest = "assets/" + name.replace(/\.[^.]+$/, ".webp");
  if (!fs.existsSync(root + src)) {
    console.error("MISSING", src);
    return null;
  }
  if (/\.mp4$/i.test(src)) {
    const frame = dest + ".png";
    r("ffmpeg", ["-y", "-threads", "2", "-ss", "1", "-i", root + src, "-threads", "2", "-frames:v", "1", frame], { stdio: "ignore" });
    m(frame, "-resize", "1800x1800>", "-quality", "94", dest);
  } else m(root + src + "[0]", "-resize", "1800x1800>", "-quality", "94", dest);
  refs[src] = dest;
  return dest;
}
for (const p of P)
  for (const a of p.pieces) {
    for (const i of a.items || []) if (i.src) i.asset = prep(i.src);
    if (a.src) a.asset = prep(a.src);
    if (a.clips) {
      for (const c of a.clips) if (!fs.existsSync(root + c.src)) console.error("MISSING CLIP", c.src);
    }
    if (a.logo) a.logoAsset = prep(a.logo);
  }
const crop = (src, geo, name) => {
  m(root + src, "-crop", geo, "+repage", "assets/" + name + ".webp");
  return "assets/" + name + ".webp";
};
const fair = P.find((p) => p.slug === "m-health-fairview");
fair.pieces[0].items[0].asset = crop("assets/img/fairview/03-audit.webp", "780x770+310+276", "fairview-old-ui");
fair.pieces[1].items[0].asset = "assets/fairview-old-ui.webp";
const mool = P.find((p) => p.slug === "mool");
mool.pieces[0].logoAsset = crop("5.mool/1.jpg", "600x450+660+385", "mool-logo");
const naavo = P.find((p) => p.slug === "naavo");
naavo.pieces[0].logoAsset = crop("7.naavo/1.png", "500x620+720+280", "naavo-logo");
const aa = P.find((p) => p.slug === "aananda");
aa.pieces[0].logoAsset = crop("9.aananda/1.png", "740x400+655+360", "aananda-logo");
const ill = P.find((p) => p.slug === "illustrations");
ill.pieces[2].logoAsset = crop("11.illu/30.1.webp", "630x145+116+88", "apna-logo");
fs.writeFileSync("projects.json", JSON.stringify(P, null, 2));
fs.writeFileSync("assets/provenance.json", JSON.stringify(refs, null, 2));
