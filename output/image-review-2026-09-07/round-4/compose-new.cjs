const { execFileSync: r } = require("child_process");
process.chdir(__dirname);
const m = (...a) => r("magick", a);
function map(src, w, h, q, out) {
  const [a, b, c, d, e, f, g, j] = q;
  m(
    src,
    "-alpha",
    "set",
    "-virtual-pixel",
    "transparent",
    "-define",
    "distort:viewport=1536x1024+0+0",
    "-distort",
    "Perspective",
    `0,0 ${a},${b} ${w - 1},0 ${c},${d} ${w - 1},${h - 1} ${e},${f} 0,${h - 1} ${g},${j}`,
    out
  );
}
// Final menu, never the earlier logo explorations. Fit a single existing A4 panel.
m("../../../11.illu/30.1.webp", "-crop", "738x1046+60+61", "+repage", "layers/apna-art.png");
map("layers/apna-art.png", 738, 1046, [255, 44, 825, 49, 883, 820, 310, 887], "layers/apna-mapped.png");
m("apna-scene.png", "layers/apna-mapped.png", "-compose", "Multiply", "-composite", "layers/apna-printed.png");
// Restore stand prongs and their genuine photographed highlights.
m(
  "-size",
  "1536x1024",
  "xc:black",
  "-fill",
  "white",
  "-draw",
  "roundrectangle 498,801 514,893 6,6 roundrectangle 697,779 713,864 6,6",
  "-blur",
  "0x0.6",
  "layers/apna-occlusion.png"
);
m("apna-scene.png", "layers/apna-occlusion.png", "-alpha", "off", "-compose", "CopyOpacity", "-composite", "layers/apna-stand.png");
m("layers/apna-printed.png", "layers/apna-stand.png", "-compose", "over", "-composite", "apna.png");
// Keep the complete 1800:1012 composition. Extra substrate margins absorb differing panel sizes.
m(
  "../../../8.shotoniphone/3.webp",
  "-resize",
  "1190x669",
  "-background",
  "#f1f1f1",
  "-gravity",
  "center",
  "-extent",
  "1190x742",
  "layers/shot-art.png"
);
map("layers/shot-art.png", 1190, 742, [194, 125, 1385, 126, 1380, 865, 193, 865], "layers/shot-mapped.png");
m("shot-scene.png", "layers/shot-mapped.png", "-compose", "Multiply", "-composite", "shot.png");
m(
  "../../../8.shotoniphone/3.webp",
  "-resize",
  "1142x642",
  "-background",
  "#f1f1f1",
  "-gravity",
  "center",
  "-extent",
  "1217x642",
  "layers/billboard-art.png"
);
map("layers/billboard-art.png", 1217, 642, [164, 135, 1381, 136, 1381, 776, 164, 776], "layers/billboard-mapped.png");
m("billboard-scene-v2.png", "layers/billboard-mapped.png", "-compose", "Multiply", "-composite", "billboard.png");
for (const id of ["apna", "shot", "billboard"]) m(id + ".png", "-quality", "92", id + ".webp");
