const fs = require("fs"),
  { execFileSync: r } = require("child_process");
process.chdir(__dirname);
const m = (...a) => r("magick", a);
const q = [530, 117, 1399, 152, 1357, 706, 482, 594],
  w = 992,
  h = 604;
const pts = [0, 0, q[0], q[1], w - 1, 0, q[2], q[3], w - 1, h - 1, q[4], q[5], 0, h - 1, q[6], q[7]].join(" ");
m(
  "../round-4/layers/fairview-ui.png",
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
  "mapped.png"
);
fs.writeFileSync(
  "mask.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024"><rect width="1536" height="1024" fill="black"/><polygon fill="white" points="530,117 1399,152 1357,706 482,594"/></svg>`
);
m("mask.svg", "-blur", "0x0.4", "mask.png");
m("scene.png", "-colorspace", "gray", "-blur", "0x40", "-fx", "0.94+0.04*u", "light.png");
m(
  "mapped.png",
  "light.png",
  "-compose",
  "Multiply",
  "-composite",
  "mask.png",
  "-alpha",
  "off",
  "-compose",
  "CopyOpacity",
  "-composite",
  "screen.png"
);
m("scene.png", "screen.png", "-compose", "Over", "-composite", "fairview-focused.png");
m("fairview-focused.png", "-quality", "95", "fairview-focused.webp");
m("fairview-focused.png", "-resize", "390x", "qa-mobile.png");
fs.writeFileSync(
  "provenance.json",
  JSON.stringify(
    {
      reference: "../round-4/fairview.webp",
      originalUI: "../round-4/layers/fairview-ui.png",
      glassCorners: q,
      notes:
        "Restored original artwork after tighter framing edit; physical perspective mapped to four glass corners; only restrained broad lighting applied. No production publication.",
    },
    null,
    2
  )
);
