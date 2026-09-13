const { execFileSync: r } = require("node:child_process");
process.chdir(__dirname);
const m = (...a) => r("/opt/homebrew/bin/magick", a);
function map(src, w, h, q, out, viewport = "1536x1024+0+0") {
  const [a, b, c, d, e, f, g, j] = q;
  m(
    src,
    "-alpha",
    "set",
    "-virtual-pixel",
    "transparent",
    "-define",
    "distort:viewport=" + viewport,
    "-distort",
    "Perspective",
    `0,0 ${a},${b} ${w - 1},0 ${c},${d} ${w - 1},${h - 1} ${e},${f} 0,${h - 1} ${g},${j}`,
    out
  );
}
m("../../../7.naavo/13.3 solo.webp", "-crop", "168x435+864+177", "+repage", "layers/naavo-gold-label.png");
m("../../../7.naavo/13.3 solo.webp", "-crop", "168x435+1084+177", "+repage", "layers/naavo-green-label.png");
for (const id of ["gold", "green"])
  m(
    `layers/naavo-${id}-label.png`,
    "(",
    "-size",
    "168x435",
    "xc:black",
    "-fill",
    "white",
    "-draw",
    "roundrectangle 0,0 167,434 9,9",
    ")",
    "-alpha",
    "off",
    "-compose",
    "CopyOpacity",
    "-composite",
    `layers/naavo-${id}-label-alpha.png`
  );
map("layers/naavo-gold-label-alpha.png", 168, 435, [633, 437, 757, 421, 823, 752, 696, 773], "layers/gift-gold.png");
map("layers/naavo-green-label-alpha.png", 168, 435, [909, 401, 1030, 380, 1103, 706, 978, 729], "layers/gift-green.png");
m("../../../7.naavo/1.png", "-crop", "674x744+623+168", "+repage", "layers/naavo-brand.png");
map("layers/naavo-brand.png", 674, 744, [207, 80, 440, 18, 546, 222, 288, 310], "layers/gift-lid-brand.png");
m("layers/gift-lid-brand.png", "-channel", "RGB", "-evaluate", "add", "4%", "+channel", "-blur", "0x0.9", "layers/gift-lid-brand.png");
m(
  "naavo-gift-scene.png",
  "layers/gift-gold.png",
  "-compose",
  "over",
  "-composite",
  "layers/gift-green.png",
  "-compose",
  "over",
  "-composite",
  "layers/gift-lid-brand.png",
  "-compose",
  "over",
  "-composite",
  "naavo-gift.png"
);
map("layers/naavo-gold-label-alpha.png", 168, 435, [428, 398, 576, 398, 576, 798, 427, 798], "layers/use-label.png");
m("naavo-use-scene.png", "layers/use-label.png", "-compose", "over", "-composite", "naavo-use.png");
// Unwrap the three original illustrated box faces, then apply only their ink as overlays, preserving paper lighting.
const faces = [
  { id: "top", source: [335, 143, 484, 210, 321, 289, 174, 213], target: [377, 377, 675, 345, 813, 413, 468, 454] },
  { id: "left", source: [173, 215, 320, 291, 320, 470, 173, 405], target: [375, 383, 464, 460, 479, 789, 387, 675] },
  { id: "front", source: [322, 292, 484, 213, 485, 405, 323, 470], target: [470, 460, 814, 416, 812, 725, 485, 789] },
];
for (const f of faces) {
  const [a, b, c, d, e, g, h, j] = f.source;
  m(
    "../../../11.illu/29.1.webp",
    "-alpha",
    "set",
    "-virtual-pixel",
    "transparent",
    "-define",
    "distort:viewport=600x600+0+0",
    "-distort",
    "Perspective",
    `${a},${b} 0,0 ${c},${d} 599,0 ${e},${g} 599,599 ${h},${j} 0,599`,
    `layers/apna-${f.id}-flat.png`
  );
  m(
    `layers/apna-${f.id}-flat.png`,
    "-colorspace",
    "gray",
    "-threshold",
    "72%",
    "-fill",
    "black",
    "-draw",
    "rectangle 0,0 599,4 rectangle 0,595 599,599 rectangle 0,0 4,599 rectangle 595,0 599,599",
    "layers/apna-" + f.id + "-ink-mask.png"
  );
  m(
    "-size",
    "600x600",
    "xc:#fff9e9",
    `layers/apna-${f.id}-ink-mask.png`,
    "-alpha",
    "off",
    "-compose",
    "CopyOpacity",
    "-composite",
    `layers/apna-${f.id}-ink.png`
  );
  map(`layers/apna-${f.id}-ink.png`, 600, 600, f.target, `layers/apna-${f.id}-mapped.png`);
}
m(
  "apna-scene.png",
  "layers/apna-top-mapped.png",
  "-compose",
  "over",
  "-composite",
  "layers/apna-left-mapped.png",
  "-compose",
  "over",
  "-composite",
  "layers/apna-front-mapped.png",
  "-compose",
  "over",
  "-composite",
  "apna.png"
);
for (const id of ["naavo-gift", "naavo-use", "apna"]) m(`${id}.png`, "-quality", "92", `${id}.webp`);
