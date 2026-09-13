const fs = require("fs");
process.chdir(__dirname);
let s = fs.readFileSync("../round-5/gallery.cjs", "utf8");
if (!s.includes("round-7/marriott-corrected.webp")) throw Error("Expected prior reference");
s = s.replaceAll("round-7/marriott-corrected.webp", "round-8/marriott-quiet.webp").replaceAll("R+'round-7/", "R+'round-8/");
fs.writeFileSync("../round-5/gallery.cjs", s);
let c = JSON.parse(fs.readFileSync("../round-5/carried-forward.json"));
c.heroes.marriott = "round-8/marriott-quiet.webp";
fs.writeFileSync("../round-5/carried-forward.json", JSON.stringify(c, null, 2));
let h = fs
  .readFileSync("../round-7/index.html", "utf8")
  .replace("../round-6/marriott-human.webp", "../round-7/marriott-corrected.webp")
  .replaceAll("marriott-corrected.png", "marriott-quiet.png")
  .replaceAll('src="marriott-corrected.webp"', 'src="marriott-quiet.webp"')
  .replace("Previous screen mapping", "Previous busier lobby")
  .replace("Actual tablet viewport, corrected mapping and more distant guests.", "One distant guest. Tablet in focus.");
fs.writeFileSync("index.html", h);
