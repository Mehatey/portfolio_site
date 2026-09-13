const fs = require("fs"),
  { execFileSync: r } = require("child_process");
process.chdir(__dirname);
const m = (...a) => r("magick", a);
const q = [374, 144, 1317, 152, 1305, 745, 325, 714],
  w = 1104,
  h = 675;
m("../round-7/dashboard-frame.png", "+repage", "-crop", w + "x" + h + "+49+49", "+repage", "dashboard.png");
const pts = [0, 0, q[0], q[1], w - 1, 0, q[2], q[3], w - 1, h - 1, q[4], q[5], 0, h - 1, q[6], q[7]].join(" ");
m(
  "dashboard.png",
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
  `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024"><rect width="1536" height="1024" fill="black"/><polygon points="374,144 1317,152 1305,745 325,714" fill="white"/></svg>`
);
m("mask.svg", "scene.png", "-fx", "u*((i>410&&i<610&&j>590&&j<750&&v.r>v.g*1.10&&v.g>v.b*1.08)?0:1)", "-blur", "0x0.3", "mask.png");
m("scene.png", "-colorspace", "gray", "-fx", "0.80+0.32*u", "light.png");
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
m("scene.png", "screen.png", "-compose", "Over", "-composite", "marriott-tight.png");
m("marriott-tight.png", "-quality", "95", "marriott-tight.webp");
m("marriott-tight.png", "-crop", "320x240+400+580", "+repage", "qa-touch.png");
m("marriott-tight.png", "-resize", "390x", "qa-mobile.png");
fs.writeFileSync(
  "provenance.json",
  JSON.stringify(
    {
      source: "assets/img/marriott/02-dashboard.gif",
      frame: 0,
      crop: { x: 49, y: 49, width: w, height: h },
      glassCorners: q,
      notes:
        "Only actual active UI, no nested mockup frame or added letterbox. Pixel dimensions preserve an approximately 1.64 viewport ratio. Finger occlusion masked; generated glass luminance transferred as restrained multiplication.",
    },
    null,
    2
  )
);
