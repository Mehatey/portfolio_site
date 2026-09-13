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
  "564x1144+0+0",
  "+repage",
  "-background",
  "#2d3778",
  "-gravity",
  "north",
  "-splice",
  "0x56",
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
  'path "M 165,0 L 410,0 L 410,24 Q 410,48 386,48 L 191,48 Q 167,48 165,24 Z"',
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
// Remove source mockup lighting before applying the new photograph's actual paper and shadows.
m("../round-3/layers/book-left.png", "-crop", "610x65+0+25", "+repage", "-scale", "610x1!", "-resize", "610x630!", "layers/left-flatfield.png");
m(
  "../round-3/layers/book-left.png",
  "layers/left-flatfield.png",
  "-channel",
  "RGB",
  "-fx",
  "u/max(v.g,0.1)*0.69",
  "+channel",
  "layers/book-left-print.png"
);
m(
  "../round-3/layers/book-right.png",
  "-channel",
  "R",
  "-evaluate",
  "multiply",
  "1.109",
  "-channel",
  "G",
  "-evaluate",
  "multiply",
  "1.109",
  "-channel",
  "B",
  "-evaluate",
  "multiply",
  "1.16",
  "+channel",
  "layers/book-right-print.png"
);
const bez = (p, c, q, t) => [0, 1].map((i) => (1 - t) ** 2 * p[i] + 2 * (1 - t) * t * c[i] + t * t * q[i]);
function page(id, w, top, bottom) {
  const inputs = [];
  const n = 20;
  for (let i = 0; i < n; i++) {
    let x0 = Math.max(0, Math.floor((w * i) / n) - 1),
      x1 = Math.min(w, Math.ceil((w * (i + 1)) / n) + 1);
    const t0 = x0 / w,
      t1 = x1 / w;
    const tl = bez(...top, t0),
      tr = bez(...top, t1),
      bl = bez(...bottom, t0),
      br = bez(...bottom, t1);
    const crop = `layers/${id}-${i}-src.png`,
      mapped = `layers/${id}-${i}.png`;
    m("layers/" + id + "-print.png", "-crop", `${x1 - x0}x630+${x0}+0`, "+repage", crop);
    map(crop, x1 - x0, 630, [...tl, ...tr, ...br, ...bl], mapped);
    inputs.push(mapped);
  }
  m("-size", "1536x1024", "xc:none", ...inputs.flatMap((p) => [p, "-compose", "over", "-composite"]), "layers/" + id + "-mapped.png");
}
page(
  "book-left",
  610,
  [
    [493, 155],
    [703, 193],
    [925, 266],
  ],
  [
    [374, 627],
    [591, 687],
    [807, 746],
  ]
);
page(
  "book-right",
  600,
  [
    [925, 266],
    [1126, 250],
    [1417, 333],
  ],
  [
    [807, 746],
    [1057, 799],
    [1311, 853],
  ]
);
m(
  "book-blank.png",
  "layers/book-left-mapped.png",
  "-compose",
  "Multiply",
  "-composite",
  "layers/book-right-mapped.png",
  "-compose",
  "Multiply",
  "-composite",
  "layers/book-printed.png"
);
// Restore only skin, leaving photographed contact shadows in the printed paper underneath.
m(
  "-size",
  "1536x1024",
  "xc:black",
  "-fill",
  "white",
  "-draw",
  'path "M 300,420 L 400,420 L 388,528 C 408,525 439,499 451,499 C 461,497 466,509 463,523 C 458,546 433,565 389,580 L 365,625 L 300,670 Z" path "M 1320,621 C 1301,619 1292,644 1295,665 C 1295,678 1302,699 1319,724 C 1330,749 1341,757 1331,780 L 1317,860 L 1480,940 L 1510,560 L 1390,570 L 1360,655 C 1346,644 1334,622 1320,621 Z"',
  "-blur",
  "0x0.7",
  "layers/skin-mask.png"
);
m("book-blank.png", "layers/skin-mask.png", "-alpha", "off", "-compose", "CopyOpacity", "-composite", "layers/skin.png");
m("layers/book-printed.png", "layers/skin.png", "-compose", "over", "-composite", "aananda.png");
for (const id of ["mool", "fairview", "alpha", "aananda"]) m(id + ".png", "-quality", "92", id + ".webp");
