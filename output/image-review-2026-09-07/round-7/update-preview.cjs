const fs = require("fs");
process.chdir(__dirname);
let s = fs.readFileSync("../round-5/gallery.cjs", "utf8");
if (!s.includes("round-6/marriott-human.webp")) throw Error("Expected previous revision");
s = s.replaceAll("round-6/marriott-human.webp", "round-7/marriott-corrected.webp").replaceAll("R+'round-6/", "R+'round-7/");
fs.writeFileSync("../round-5/gallery.cjs", s);
let c = JSON.parse(fs.readFileSync("../round-5/carried-forward.json"));
c.heroes.marriott = "round-7/marriott-corrected.webp";
fs.writeFileSync("../round-5/carried-forward.json", JSON.stringify(c, null, 2));
let html = fs
  .readFileSync("../round-6/index.html", "utf8")
  .replace("../round-2/marriott.webp", "../round-6/marriott-human.webp")
  .replaceAll("marriott-human.png", "marriott-corrected.png")
  .replaceAll("marriott-human.webp", "marriott-corrected.webp")
  .replace("../round-6/marriott-corrected.webp", "../round-6/marriott-human.webp")
  .replace("Previous empty hotel desk", "Previous screen mapping")
  .replace("People, natural blur and a working desk.", "Actual tablet viewport, corrected mapping and more distant guests.");
fs.writeFileSync("index.html", html);
fs.writeFileSync(
  "decisions.md",
  `# Marriott screen correction\n\nPrevious mapping incorrectly retained an expanded navigation X, rounded screenshot silhouette and black letterbox margins. This revision uses frame 0 of the original 02-dashboard.gif, extracts the active dashboard viewport with compact icon navigation, and maps it directly to the generated glass corners. The actual UI card corners remain because they belong to the source interface. No outer rounded screenshot or added inset frame remains.\n\nSource dashboard contains 35 arrivals and 65 departures, unlike the earlier cover. These are preserved source values, not newly generated numbers. The UI continues below the visible viewport.\n\nBackground guests are smaller and farther from the camera, interacting near the entrance rather than filling the lobby behind the tablet. Scene remains illustrative.\n\nInspected full scene, display crop, four glass corners, foreground finger overlap and mobile rendition. Source, prompt, geometry and compositing script retained. Original versions remain untouched. Updated only local gallery and story preview, not production. User corrections added to VISUAL_DIRECTION.md.\n`
);
