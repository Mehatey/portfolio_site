const fs = require("fs"),
  { execFileSync: r } = require("child_process");
process.chdir(__dirname);
fs.mkdirSync("exports", { recursive: true });
const items = JSON.parse(fs.readFileSync("gallery-items.json", "utf8"));
const manifest = [];
for (const [id, title, , , , asset] of items) {
  const sizes = [];
  for (const width of [480, 900, 1536]) {
    const file = "exports/" + id + "-" + width + ".webp";
    r("magick", [asset, "-resize", width + "x", "-quality", "88", file]);
    sizes.push({ width, file, bytes: fs.statSync(file).size });
  }
  manifest.push({ id, title, png: id + ".png", sizes });
  r("magick", [
    asset,
    "-resize",
    "512x342",
    "-background",
    "#f4f3ef",
    "-gravity",
    "south",
    "-splice",
    "0x44",
    "-font",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "-pointsize",
    "20",
    "-fill",
    "#252c23",
    "-annotate",
    "+0+12",
    title,
    "exports/" + id + "-tile.jpg",
  ]);
}
r("magick", [
  "montage",
  "-font",
  "/System/Library/Fonts/Supplemental/Arial.ttf",
  ...items.map((x) => "exports/" + x[0] + "-tile.jpg"),
  "-tile",
  "3x3",
  "-geometry",
  "+10+10",
  "-background",
  "#f4f3ef",
  "exports/overview.jpg",
]);
fs.writeFileSync("exports/manifest.json", JSON.stringify(manifest, null, 2));
r("zip", ["-q", "selected-webp.zip", ...manifest.flatMap((x) => x.sizes.map((s) => s.file.replace("exports/", ""))), "manifest.json"], {
  cwd: "exports",
});
