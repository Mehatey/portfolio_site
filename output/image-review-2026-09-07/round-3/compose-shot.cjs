const { execFileSync: r } = require("child_process");
process.chdir(__dirname);
const m = (...a) => r("/opt/homebrew/bin/magick", a);
m("../../../8.shotoniphone/3.webp", "-crop", "400x115+135+85", "+repage", "-resize", "560x", "layers/shot-header.png");
m("../../../8.shotoniphone/3.webp", "-crop", "1138x840+581+86", "+repage", "-resize", "800x", "layers/shot-photo.png");
m("../../../8.shotoniphone/3.webp", "-crop", "405x85+132+480", "+repage", "-resize", "690x", "layers/shot-quote.png");
m("../../../8.shotoniphone/3.webp", "-crop", "154x154+145+720", "+repage", "-resize", "185x", "layers/shot-qr.png");
m(
  "-size",
  "900x1200",
  "xc:#f1f1f1",
  "layers/shot-header.png",
  "-geometry",
  "+50+35",
  "-composite",
  "layers/shot-photo.png",
  "-geometry",
  "+50+220",
  "-composite",
  "layers/shot-quote.png",
  "-geometry",
  "+50+846",
  "-composite",
  "layers/shot-qr.png",
  "-geometry",
  "+50+990",
  "-composite",
  "layers/shot-poster.png"
);
m("../../../8.shotoniphone/4.webp", "-crop", "424x836+687+87", "+repage", "layers/shot-phone.png");
function map(src, w, h, q, o) {
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
    o
  );
}
map("layers/shot-poster.png", 900, 1200, [358, 71, 1001, 110, 1001, 895, 360, 944], "layers/shot-poster-mapped.png");
m("layers/shot-poster-mapped.png", "-channel", "RGB", "-evaluate", "multiply", "0.9", "+channel", "-blur", "0x0.35", "layers/shot-poster-lit.png");
map("layers/shot-phone.png", 424, 836, [1061, 379, 1226, 385, 1258, 752, 1087, 755], "layers/shot-phone-mapped.png");
m(
  "shot-scene.png",
  "layers/shot-poster-mapped.png",
  "-compose",
  "Multiply",
  "-composite",
  "layers/shot-phone-mapped.png",
  "-compose",
  "over",
  "-composite",
  "shot.png"
);
m("shot.png", "-quality", "92", "shot.webp");
