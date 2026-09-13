const { execFileSync: r } = require("child_process");
process.chdir(__dirname);
const m = (...a) => r("magick", a);
const W = 1536,
  H = 1024;
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
// Correct optical panel ratios. Fit source artwork without independent width/height resizing.
m(
  "../round-2/layers/fairview-screen.png",
  "-crop",
  "992x566+0+27",
  "+repage",
  "-background",
  "white",
  "-gravity",
  "north",
  "-extent",
  "992x604",
  "layers/fairview-ui.png"
);
m(
  "../../../10.alpha/29.2.webp",
  "-resize",
  "1798x1000",
  "-background",
  "#080d12",
  "-gravity",
  "center",
  "-extent",
  "1798x1000",
  "layers/alpha-ui.png"
);
// A compact phone, with a normal UI viewport and a safe area below its physical notch.
m(
  "../round-2/layers/mool-plans-source.png",
  "-crop",
  "564x1134+0+10",
  "+repage",
  "-background",
  "#2d3778",
  "-gravity",
  "north",
  "-splice",
  "0x66",
  "-fill",
  "#2d3778",
  "-draw",
  "rectangle 0,66 12,95 rectangle 552,66 563,95",
  "layers/mool-ui.png"
);
m(
  "-size",
  "564x1200",
  "xc:black",
  "-fill",
  "white",
  "-draw",
  "roundrectangle 0,0 563,1199 56,56",
  "-fill",
  "black",
  "-draw",
  'path "M 175,0 L 401,0 L 401,21 Q 401,41 381,41 L 195,41 Q 175,41 175,21 Z"',
  "layers/mool-mask.png"
);
m("layers/mool-ui.png", "layers/mool-mask.png", "-alpha", "off", "-compose", "CopyOpacity", "-composite", "layers/mool-ui.png");
const specs = [
  { id: "fairview", w: 992, h: 604, q: [773, 283, 1311, 317, 1233, 727, 708, 609], scene: "../round-3/fairview-scene.png", reflection: 0.1 },
  { id: "alpha", w: 1798, h: 1000, q: [798, 309, 1344, 365, 1292, 697, 768, 590], scene: "../round-3/alpha-scene.png", reflection: 0.08 },
  { id: "mool", w: 564, h: 1200, q: [657, 269, 902, 276, 875, 807, 627, 793], scene: "mool-scene.png", reflection: 0.1 },
];
for (const s of specs) {
  map("layers/" + s.id + "-ui.png", s.w, s.h, s.q, "layers/" + s.id + "-mapped.png");
  m(
    "layers/" + s.id + "-mapped.png",
    s.scene,
    "-channel",
    "RGB",
    "-fx",
    `u*${1 - s.reflection}+v*${s.reflection}`,
    "+channel",
    "-blur",
    "0x0.28",
    "layers/" + s.id + "-glass.png"
  );
  m(s.scene, "layers/" + s.id + "-glass.png", "-compose", "over", "-composite", s.id + ".png");
}

for (const id of ["mool", "fairview", "alpha"]) m(id + ".png", "-quality", "92", id + ".webp");
