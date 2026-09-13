const { execFileSync: run } = require("node:child_process");
process.chdir(__dirname);
const m = (...a) => run("/opt/homebrew/bin/magick", a);
m("../../../assets/img/marriott/06-enroll-poster.jpg", "-crop", "866x488+117+65", "+repage", "layers/marriott-enrollment-source.png");
m(
  "layers/marriott-enrollment-source.png",
  "-background",
  "#141416",
  "-gravity",
  "center",
  "-extent",
  "866x523",
  "layers/marriott-enrollment-screen.png"
);
m(
  "layers/mool-plans-source.png",
  "-background",
  "#2c3378",
  "-gravity",
  "center",
  "-extent",
  "612x1316",
  "(",
  "-size",
  "612x1316",
  "xc:black",
  "-fill",
  "white",
  "-draw",
  "roundrectangle 0,0 611,1315 45,45",
  ")",
  "-alpha",
  "off",
  "-compose",
  "CopyOpacity",
  "-composite",
  "layers/mool-plans-screen.png"
);
for (const s of [
  { id: "marriott-enrollment", w: 866, h: 523, q: [336, 230, 1035, 222, 1061, 634, 347, 659] },
  { id: "mool-plans", w: 612, h: 1316, q: [580, 93, 938, 93, 961, 906, 560, 906] },
]) {
  const [a, b, c, d, e, f, g, h] = s.q;
  const pts = `0,0 ${a},${b} ${s.w - 1},0 ${c},${d} ${s.w - 1},${s.h - 1} ${e},${f} 0,${s.h - 1} ${g},${h}`;
  m(
    `layers/${s.id}-screen.png`,
    "-alpha",
    "set",
    "-virtual-pixel",
    "transparent",
    "-define",
    "distort:viewport=1536x1024+0+0",
    "-distort",
    "Perspective",
    pts,
    `layers/${s.id}-mapped.png`
  );
  m(`${s.id}-scene.png`, `layers/${s.id}-mapped.png`, "-compose", "over", "-composite", `${s.id}.png`);
  m(`${s.id}.png`, "-quality", "91", `${s.id}.webp`);
}
