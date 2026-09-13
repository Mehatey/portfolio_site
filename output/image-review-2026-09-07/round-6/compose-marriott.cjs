const fs = require("fs"),
  { execFileSync: r } = require("child_process");
process.chdir(__dirname);
const m = (...a) => r("magick", a);
fs.writeFileSync(
  "screen-mask.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024"><rect width="1536" height="1024" fill="black"/><polygon points="432,260 1170,273 1162,737 387,714" fill="white"/><path d="M 492 745 L 528 702 Q 534 674 550 679 Q 572 679 568 704 L 557 745 Z" fill="black"/></svg>`
);
m("screen-mask.svg", "-blur", "0x0.6", "screen-mask.png");
m("../round-2/marriott.webp", "screen-mask.png", "-alpha", "off", "-compose", "CopyOpacity", "-composite", "original-screen.png");
m("marriott-human-scene.png", "original-screen.png", "-compose", "Over", "-composite", "marriott-human.png");
m("marriott-human.png", "-quality", "94", "marriott-human.webp");
m("marriott-human.png", "-crop", "320x280+420+620", "+repage", "qa-hand.png");
m("marriott-human.png", "-resize", "390x", "qa-mobile.png");
