const { execFileSync } = require("node:child_process");
const path = require("node:path");
process.chdir(__dirname);
const magick = (...args) => execFileSync("/opt/homebrew/bin/magick", args);
magick("../layers/marriott.png", "-background", "#090a0b", "-gravity", "center", "-extent", "1130x706", "layers/marriott-screen.png");
magick(
  "../../../assets/img/fairview/cover.webp",
  "-crop",
  "992x566+254+156",
  "+repage",
  "-background",
  "#161819",
  "-gravity",
  "center",
  "-extent",
  "992x620",
  "layers/fairview-screen.png"
);
magick(
  "../../../10.alpha/29.2.webp",
  "-resize",
  "1406x1000",
  "-background",
  "#09171e",
  "-gravity",
  "center",
  "-extent",
  "1600x1000",
  "layers/alpha-screen.png"
);
const scenes = [
  { id: "marriott", w: 1130, h: 706, quad: [431, 259, 1171, 272, 1165, 739, 383, 714] },
  { id: "fairview", w: 992, h: 620, quad: [287, 153, 1080, 150, 1114, 637, 313, 685] },
  { id: "alpha", w: 1600, h: 1000, quad: [335, 149, 1212, 149, 1218, 670, 343, 697] },
];
for (const s of scenes) {
  const [ax, ay, bx, by, cx, cy, dx, dy] = s.quad;
  const points = `0,0 ${ax},${ay} ${s.w - 1},0 ${bx},${by} ${s.w - 1},${s.h - 1} ${cx},${cy} 0,${s.h - 1} ${dx},${dy}`;
  magick(
    `layers/${s.id}-screen.png`,
    "-alpha",
    "set",
    "-virtual-pixel",
    "transparent",
    "-define",
    "distort:viewport=1536x1024+0+0",
    "-distort",
    "Perspective",
    points,
    `layers/${s.id}-mapped.png`
  );
  magick(`${s.id}-scene.png`, `layers/${s.id}-mapped.png`, "-compose", "over", "-composite", `${s.id}.png`);
}
magick("../../../9.aananda/14.webp", "-trim", "+repage", "-resize", "1260x", "layers/aananda-book.png");
magick(
  "aananda-scene.png",
  "(",
  "layers/aananda-book.png",
  "(",
  "+clone",
  "-background",
  "black",
  "-shadow",
  "32x12+7+15",
  ")",
  "+swap",
  "-background",
  "none",
  "-layers",
  "merge",
  "+repage",
  ")",
  "-gravity",
  "center",
  "-geometry",
  "+0+70",
  "-composite",
  "aananda.png"
);
for (const id of ["marriott", "fairview", "alpha", "aananda"]) magick(`${id}.png`, "-quality", "91", `${id}.webp`);
