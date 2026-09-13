const { execFileSync: r } = require("node:child_process");
process.chdir(__dirname);
const m = (...a) => r("/opt/homebrew/bin/magick", a);
function map(src, w, h, q, out) {
  const [a, b, c, d, e, f, g, h2] = q;
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
    `0,0 ${a},${b} ${w - 1},0 ${c},${d} ${w - 1},${h - 1} ${e},${f} 0,${h - 1} ${g},${h2}`,
    out
  );
}
m("../round-2/layers/mool-plans-source.png", "-crop", "564x1130+0+0", "+repage", "layers/mool-viewport.png");
const specs = [
  { id: "mool", src: "layers/mool-viewport.png", w: 564, h: 1130, q: [563, 160, 910, 160, 888, 855, 522, 840] },
  { id: "fairview", src: "../round-2/layers/fairview-screen.png", w: 992, h: 620, q: [772, 282, 1311, 317, 1234, 728, 707, 610] },
  { id: "alpha", src: "../round-2/layers/alpha-screen.png", w: 1600, h: 1000, q: [798, 308, 1345, 365, 1292, 698, 767, 590] },
];
for (const s of specs) {
  map(s.src, s.w, s.h, s.q, `layers/${s.id}-mapped.png`);
  m(`layers/${s.id}-mapped.png`, "-channel", "RGB", "-evaluate", "multiply", "0.91", "+channel", "-blur", "0x0.22", `layers/${s.id}-lit.png`);
  m(`${s.id}-scene.png`, `layers/${s.id}-lit.png`, "-compose", "over", "-composite", `${s.id}.png`);
}
m("../round-2/layers/aananda-book.png", "-crop", "610x630+40+8", "+repage", "layers/book-left.png");
m("../round-2/layers/aananda-book.png", "-crop", "600x630+651+8", "+repage", "layers/book-right.png");
map("layers/book-left.png", 610, 630, [473, 151, 944, 260, 816, 746, 368, 623], "layers/book-left-mapped.png");
map("layers/book-right.png", 600, 630, [944, 260, 1430, 326, 1313, 850, 816, 746], "layers/book-right-mapped.png");
m(
  "aananda-scene.png",
  "layers/book-left-mapped.png",
  "-compose",
  "over",
  "-composite",
  "layers/book-right-mapped.png",
  "-compose",
  "over",
  "-composite",
  "layers/book-base.png"
);
// Restore real foreground thumbs from the generated photograph after artwork mapping.
m(
  "-size",
  "1536x1024",
  "xc:black",
  "-fill",
  "white",
  "-draw",
  'path "M 330,450 L 388,420 L 383,528 C 407,520 429,502 448,495 C 458,491 464,502 460,517 C 453,542 432,557 411,567 L 373,585 L 359,624 L 320,615 Z" path "M 1313,852 C 1328,791 1321,737 1311,697 C 1304,666 1304,646 1316,624 C 1326,604 1342,612 1350,633 L 1372,677 L 1410,725 L 1390,879 Z"',
  "-blur",
  "0x0.65",
  "layers/hands-mask.png"
);
m("aananda-scene.png", "layers/hands-mask.png", "-alpha", "off", "-compose", "CopyOpacity", "-composite", "layers/hands.png");
m("layers/book-base.png", "layers/hands.png", "-compose", "over", "-composite", "aananda.png");
for (const id of ["mool", "fairview", "alpha", "aananda"]) m(`${id}.png`, "-quality", "92", `${id}.webp`);
