const fs = require("fs");
process.chdir(__dirname);
let s = fs.readFileSync("../round-5/gallery.cjs", "utf8");
if (!s.includes("round-8/marriott-quiet.webp")) throw Error("Expected previous revision");
s = s.replaceAll("round-8/marriott-quiet.webp", "round-9/marriott-tight.webp").replaceAll("R+'round-8/", "R+'round-9/");
fs.writeFileSync("../round-5/gallery.cjs", s);
let c = JSON.parse(fs.readFileSync("../round-5/carried-forward.json"));
c.heroes.marriott = "round-9/marriott-tight.webp";
fs.writeFileSync("../round-5/carried-forward.json", JSON.stringify(c, null, 2));
let h = fs
  .readFileSync("../round-8/index.html", "utf8")
  .replace("../round-7/marriott-corrected.webp", "user-reference.png")
  .replaceAll("marriott-quiet.png", "marriott-tight.png")
  .replaceAll("marriott-quiet.webp", "marriott-tight.webp")
  .replace("One distant guest. Tablet in focus.", "Tighter framing. Original UI fitted to the glass.");
fs.writeFileSync("index.html", h);
fs.writeFileSync(
  "decisions.md",
  `# Tighter tablet composition\n\nBased on the exact newly attached image, saved as user-reference.png. Device enlarged in composition; hotel and departing guest confined to the edges. Original compact-navigation dashboard mapped to the newly photographed glass corners without inset padding or nested outer screenshot frame. UI crop continues below the visible viewport; source ratios remain approximately consistent with physical glass.\n\nGenerated scene light transferred to original UI with restrained multiplication. Skin-color mask within the touch region preserves actual fingertip silhouette. Rejected an initial broad hand mask because it left a grey halo; final close-up inspected after correction. Full image and 390px rendition inspected.\n\nFiles: marriott-tight.png/.webp; prompt.txt; scene.png; provenance.json; compose.cjs. Local gallery and story preview updated. Original references retained and production pages untouched.\n`
);
