const { execFileSync: r } = require("child_process");
process.chdir(__dirname);
const m = (...a) => r("magick", a);
m(
  "../../../7.naavo/17.1.webp",
  "-alpha",
  "set",
  "-virtual-pixel",
  "transparent",
  "-define",
  "distort:viewport=315x1100+0+0",
  "-distort",
  "Perspective",
  "740,157 0,0 1027,173 314,0 960,1245 314,1099 674,1225 0,1099",
  "layers/incense-label.png"
);
m(
  "layers/incense-label.png",
  "(",
  "-size",
  "315x1100",
  "xc:black",
  "-fill",
  "white",
  "-draw",
  "roundrectangle 0,0 314,1099 20,20",
  ")",
  "-alpha",
  "off",
  "-compose",
  "CopyOpacity",
  "-composite",
  "-channel",
  "RGB",
  "-evaluate",
  "multiply",
  "0.88",
  "+channel",
  "layers/incense-label-alpha.png"
);
m(
  "layers/incense-label-alpha.png",
  "-virtual-pixel",
  "transparent",
  "-define",
  "distort:viewport=1536x1024+0+0",
  "-distort",
  "Perspective",
  "0,0 257,444 314,0 430,414 314,1099 735,833 0,1099 513,894",
  "-blur",
  "0x0.25",
  "layers/incense-label-mapped.png"
);
m("naavo-incense-scene.png", "layers/incense-label-mapped.png", "-compose", "over", "-composite", "naavo-incense.png");
m("naavo-incense.png", "-quality", "92", "naavo-incense.webp");
