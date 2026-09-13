const fs = require("fs"),
  { execFileSync: r } = require("child_process");
process.chdir(__dirname);
fs.mkdirSync("layers", { recursive: true });
const m = (...a) => r("magick", a);
const root = "../../../";
const F = "/System/Library/Fonts/Supplemental/Arial.ttf";
function map(src, name, q) {
  const wh = r("magick", ["identify", "-format", "%w %h", src], { encoding: "utf8" }).split(" ").map(Number);
  const [w, h] = wh;
  const pts = [0, 0, ...q[0], w - 1, 0, ...q[1], w - 1, h - 1, ...q[2], 0, h - 1, ...q[3]].join(" ");
  const out = "layers/" + name + ".png";
  m(
    src,
    "-alpha",
    "on",
    "-virtual-pixel",
    "transparent",
    "-define",
    "distort:viewport=1536x1024+0+0",
    "-distort",
    "Perspective",
    pts,
    "+repage",
    out
  );
  return out;
}
function comp(scene, layers, out) {
  let a = [scene];
  for (const l of layers) a.push(l, "-compose", "Multiply", "-composite");
  a.push("-quality", "93", out);
  m(...a);
}
// Extract the complete approved menu identity. Select the original light ink, not its red paper.
m(root + "11.illu/30.1.webp", "-crop", "470x147+202+79", "+repage", "layers/apna-header-source.png");
m("layers/apna-header-source.png", "-colorspace", "sRGB", "-fx", "max(0,min(1,(g-0.28)/0.55))", "-colorspace", "gray", "layers/apna-ink-mask.png");
m(
  "-size",
  "470x147",
  "xc:#fff3d9",
  "layers/apna-ink-mask.png",
  "-alpha",
  "off",
  "-compose",
  "CopyOpacity",
  "-composite",
  "layers/apna-light-ink.png"
);
m("-size", "650x240", "xc:#ef1710", "layers/apna-light-ink.png", "-gravity", "center", "-compose", "Over", "-composite", "assets/apna-logo.webp");
m("-size", "470x147", "xc:#ad211b", "layers/apna-ink-mask.png", "-alpha", "off", "-compose", "CopyOpacity", "-composite", "layers/apna-red-ink.png");
// Naavo labels keep the source 168:435 ratio, with a small neutral border on the label stock.
for (const c of ["green", "gold"])
  m(
    "../round-3/layers/naavo-" + c + "-label.png",
    "-resize",
    "124x321",
    "-background",
    "white",
    "-gravity",
    "center",
    "-extent",
    "133x357",
    "layers/naavo-" + c + ".png"
  );
m("assets/naavo-logo.webp", "-resize", "240x298", "-background", "#030303", "-gravity", "center", "-extent", "320x480", "layers/naavo-card.png");
const ng = map("layers/naavo-green.png", "naavo-green-mapped", [
    [693, 377],
    [825, 377],
    [825, 733],
    [693, 733],
  ]),
  ny = map("layers/naavo-gold.png", "naavo-gold-mapped", [
    [889, 377],
    [1021, 377],
    [1021, 733],
    [889, 733],
  ]),
  nc = map("layers/naavo-card.png", "naavo-card-mapped", [
    [1117, 288],
    [1423, 288],
    [1427, 738],
    [1118, 738],
  ]);
m(
  "assets/naavo-logo.webp",
  "-channel",
  "RGB",
  "-fx",
  "max(r,max(g,b))<0.10?1:(j>355&&r>.5&&g>.5&&b>.5?0.16:u)",
  "+channel",
  "layers/naavo-pouch-ink.png"
);
const np = map("layers/naavo-pouch-ink.png", "naavo-pouch-mapped", [
  [226, 355],
  [477, 346],
  [480, 658],
  [234, 666],
]);
comp("generated/naavo-scene.png", [ng, ny, nc, np], "generated/naavo-travel.webp");
// Proposed reader's notebook. Exact identity reversed to dark ink on uncoated cloth.
m(
  "assets/aananda-logo.webp",
  "-colorspace",
  "gray",
  "-negate",
  "-level",
  "0%,98%",
  "-resize",
  "720x389",
  "-background",
  "white",
  "-gravity",
  "center",
  "-extent",
  "900x1400",
  "layers/aananda-notebook.png"
);
m(
  root + "9.aananda/20.webp",
  "-crop",
  "552x552+123+213",
  "+repage",
  "-resize",
  "650x650",
  "-background",
  "white",
  "-gravity",
  "center",
  "-extent",
  "900x650",
  "layers/aananda-discussion.png"
);
m(
  "-size",
  "1000x280",
  "xc:white",
  "-font",
  F,
  "-fill",
  "#34432d",
  "-pointsize",
  "45",
  "-gravity",
  "northwest",
  "-annotate",
  "+60+50",
  "Read. Reflect. Return.",
  "-pointsize",
  "25",
  "-annotate",
  "+60+139",
  "A question to carry beyond the page.",
  "layers/aananda-bookmark.png"
);
const ab = map("layers/aananda-notebook.png", "aananda-notebook-mapped", [
    [226, 196],
    [678, 145],
    [763, 852],
    [277, 914],
  ]),
  ac = map("layers/aananda-discussion.png", "aananda-discussion-mapped", [
    [898, 171],
    [1334, 242],
    [1295, 562],
    [852, 490],
  ]),
  am = map("layers/aananda-bookmark.png", "aananda-bookmark-mapped", [
    [837, 714],
    [1274, 615],
    [1304, 751],
    [865, 855],
  ]);
comp("generated/aananda-scene.png", [ab, ac, am], "generated/aananda-kit.webp");
// Complete original poster artwork sits inside print margins. No cropping or aspect stretching.
for (const [n, s] of [
  ["left", "8"],
  ["right", "11"],
  ["card", "3"],
])
  m(
    root + "8.shotoniphone/" + s + ".webp",
    "-resize",
    n === "card" ? "920x518" : "1000x563",
    "-background",
    "white",
    "-gravity",
    "center",
    "-extent",
    n === "card" ? "1000x560" : "1160x800",
    "layers/shot-" + n + ".png"
  );
const sl = map("layers/shot-left.png", "shot-left-mapped", [
    [156, 320],
    [759, 324],
    [758, 760],
    [108, 754],
  ]),
  sr = map("layers/shot-right.png", "shot-right-mapped", [
    [779, 325],
    [1366, 328],
    [1410, 766],
    [779, 762],
  ]),
  sc = map("layers/shot-card.png", "shot-card-mapped", [
    [278, 12],
    [602, 52],
    [567, 233],
    [235, 192],
  ]);
comp("generated/shot-scene.png", [sl, sr, sc], "generated/shot-zine.webp");
// Print only in unobstructed paper regions. Original scene keeps food, fingers, folds and contact shadows.
const ap1 = map("layers/apna-red-ink.png", "apna-header-mapped", [
    [480, 278],
    [949, 132],
    [990, 267],
    [521, 412],
  ]),
  ap2 = map("layers/apna-red-ink.png", "apna-footer-mapped", [
    [653, 889],
    [1047, 767],
    [1081, 872],
    [687, 994],
  ]);
comp("generated/apna-scene.png", [ap1, ap2], "generated/apna-wrap.webp");
const provenance = {
  method:
    "Original pixel artwork, proportional fit within flat print canvases, projective mapping to observed surface corners, multiply blending retains scene lighting and paper texture.",
  concepts: {
    "naavo-travel": "Proposed travel kit. Existing two labels, not a new claimed product release.",
    "aananda-kit":
      "Proposed reader notebook, discussion card and bookmark. Notebook is a new application of the exact identity, not the original book cover.",
    "shot-zine": "Proposed photo zine and response postcard using complete existing posters.",
    "apna-wrap": "Proposed food wrap using the final menu identity. Food and setting are illustrative.",
  },
};
fs.writeFileSync("composite-provenance.json", JSON.stringify(provenance, null, 2));
