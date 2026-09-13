const fs = require("fs"),
  { execFileSync: r } = require("child_process");
process.chdir(__dirname);
const m = (...a) => r("magick", a);
const q = [445, 263, 1151, 277, 1150, 733, 400, 699],
  w = 1104,
  h = 690;
const pts = [0, 0, q[0], q[1], w - 1, 0, q[2], q[3], w - 1, h - 1, q[4], q[5], 0, h - 1, q[6], q[7]].join(" ");
m(
  "dashboard-screen.png",
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
  "screen-mapped.png"
);
fs.writeFileSync(
  "glass-mask.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024"><rect width="1536" height="1024" fill="black"/><polygon fill="white" points="445,263 1151,277 1150,733 400,699"/><path fill="black" d="M 493 718 L 523 686 Q 536 663 553 667 Q 574 672 568 689 L 558 716 Z"/></svg>`
);
m("glass-mask.svg", "-blur", "0x0.55", "glass-mask.png");
// Preserve the scene's subtle glass reflection while keeping the source UI legible.
m("scene.png", "-colorspace", "gray", "-evaluate", "multiply", "0.16", "-evaluate", "add", "88%", "lighting.png");
m(
  "screen-mapped.png",
  "lighting.png",
  "-compose",
  "Multiply",
  "-composite",
  "glass-mask.png",
  "-alpha",
  "off",
  "-compose",
  "CopyOpacity",
  "-composite",
  "screen-lit.png"
);
m("scene.png", "screen-lit.png", "-compose", "Over", "-composite", "marriott-corrected.png");
m("marriott-corrected.png", "-quality", "94", "marriott-corrected.webp");
m("marriott-corrected.png", "-crop", "850x560+355+220", "+repage", "qa-screen.png");
m("marriott-corrected.png", "-resize", "390x", "qa-mobile.png");
fs.writeFileSync(
  "provenance.json",
  JSON.stringify(
    {
      source: "assets/img/marriott/02-dashboard.gif",
      frame: 0,
      crop: { x: 49, y: 49, width: 1104, height: 690 },
      mapping: q,
      notes:
        "Actual tablet UI viewport with collapsed icon navigation. No added black padding. Cropped at viewport bottom, not stretched to fit. Existing component radius retained; no nested outer screenshot frame. Foreground finger and contact shadow excluded from mapping.",
    },
    null,
    2
  )
);
