const fs = require("fs");
process.chdir(__dirname);
const f = "../round-5/gallery.cjs";
let s = fs.readFileSync(f, "utf8");
if (!s.includes("round-2/marriott.webp")) throw Error("Expected previous hero");
s = s.replace('"marriott":"round-2/marriott.webp"', '"marriott":"round-6/marriott-human.webp"');
const old = "+'</p></details><div class=\"grid\">'+p.pieces.map";
const next =
  "+'</p></details><div class=\"grid\">'+(p.slug==='marriott'?'<figure class=\"tile generated\"><a class=\"zoom\" data-full=\"'+R+'round-6/marriott-human.webp\" href=\"'+R+'round-6/marriott-human.webp\"><img src=\"'+R+'round-6/marriott-human.webp\" alt=\"Hotel associate using the tablet, with guests softly blurred in the lobby\"></a><figcaption><b>Hotel reception · in use</b><a href=\"'+R+'round-6/\">Before / after ↗</a></figcaption></figure>':'')+p.pieces.map";
if (!s.includes(old)) throw Error("Expected grid insertion");
s = s.replace(old, next);
fs.writeFileSync(f, s);
let c = JSON.parse(fs.readFileSync("../round-5/carried-forward.json"));
c.heroes.marriott = "round-6/marriott-human.webp";
fs.writeFileSync("../round-5/carried-forward.json", JSON.stringify(c, null, 2));
fs.writeFileSync(
  "index.html",
  `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Marriott · hotel in use</title><style>*{box-sizing:border-box}body{background:#141613;color:#eee;margin:0;padding:30px;font:16px/1.4 Arial}a{color:inherit}header{display:flex;justify-content:space-between;gap:24px;margin-bottom:28px}h1{font-size:28px;margin:0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}figure{margin:0}img{width:100%;display:block}figcaption{padding-top:12px}footer{margin-top:28px}@media(max-width:700px){body{padding:18px}.grid{grid-template-columns:1fr}header{display:block}h1{margin-bottom:12px}}</style><header><h1>Marriott, in use.</h1><a href="../?project=marriott">All Marriott media ↗</a></header><main class="grid"><figure><img src="../round-2/marriott.webp" alt="Previous empty hotel desk"><figcaption>Previous</figcaption></figure><figure><a href="marriott-human.png"><img src="marriott-human.webp" alt="Seated employee using tablet, with guests blurred behind"></a><figcaption>People, natural blur and a working desk.</figcaption></figure></main><footer><a href="marriott-human.png" download>Download PNG</a> · <a href="marriott-human.webp" download>Download WebP</a></footer></html>`
);
fs.writeFileSync(
  "decisions.md",
  `# Marriott human context refinement\n\nUser preferred the hotel reception tablet and requested a seated employee using it, blurred people in the background, and a less perfect environment. One edit generated from ../round-2/marriott.webp. Original preserved.\n\nFinal: marriott-human.png and .webp. Prompt: marriott-prompt.txt. Raw edit: marriott-human-scene.png. compose-marriott.cjs restores the original screen inside its existing quadrilateral, excluding the finger and contact shadow. Checked full scene, hand close-up and 390px rendition.\n\nNew scene remains illustrative, not evidence of a hotel deployment. Local gallery and Marriott story preview updated; production portfolio unchanged. Preferences saved in ../../../VISUAL_DIRECTION.md and referenced from HANDOFF.md and /Users/siddharthmehta/AGENTS.md.\n`
);
