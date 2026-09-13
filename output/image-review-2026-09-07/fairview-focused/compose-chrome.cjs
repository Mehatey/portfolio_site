const fs = require("fs"),
  { execFileSync: r } = require("child_process");
process.chdir(__dirname);
const m = (...a) => r("magick", a);
fs.copyFileSync("chrome-bar-browser.png", "chrome-bar.png");
// Keep original UI at its original scale; browser controls reduce visible viewport height.
m("../round-4/layers/fairview-ui.png", "-crop", "992x532+0+0", "+repage", "viewport.png");
m("chrome-bar.png", "viewport.png", "-append", "browser-screen.png");
const q = [530, 117, 1399, 152, 1357, 706, 482, 594],
  w = 992,
  h = 604,
  pts = [0, 0, q[0], q[1], w - 1, 0, q[2], q[3], w - 1, h - 1, q[4], q[5], 0, h - 1, q[6], q[7]].join(" ");
m(
  "browser-screen.png",
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
  "chrome-mapped.png"
);
m(
  "chrome-mapped.png",
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
  "chrome-lit.png"
);
m("scene.png", "chrome-lit.png", "-compose", "Over", "-composite", "fairview-chrome.png");
m("fairview-chrome.png", "-quality", "95", "fairview-chrome.webp");
m("fairview-chrome.png", "-resize", "390x", "qa-chrome-mobile.png");
fs.writeFileSync(
  "chrome-notes.md",
  "Added a Chrome-style macOS tab strip and address bar, mapped with the original UI to the same four display corners. Original webpage pixels retain their original scale. Browser chrome reduces the visible page height, as in a real viewport. Address is the project domain, not a claim of current live page verification. Original versions preserved. Local preview only.\n"
);
let s = fs
  .readFileSync("../round-5/gallery.cjs", "utf8")
  .replaceAll("fairview-focused/fairview-focused.webp", "fairview-focused/fairview-chrome.webp");
fs.writeFileSync("../round-5/gallery.cjs", s);
let c = JSON.parse(fs.readFileSync("../round-5/carried-forward.json"));
c.heroes["m-health-fairview"] = "fairview-focused/fairview-chrome.webp";
fs.writeFileSync("../round-5/carried-forward.json", JSON.stringify(c, null, 2));
