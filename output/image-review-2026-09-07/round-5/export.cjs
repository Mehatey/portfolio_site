const fs = require("fs"),
  { execFileSync: r } = require("child_process");
process.chdir(__dirname);
const P = require("./projects.json");
const font = "/System/Library/Fonts/Supplemental/Arial.ttf";
for (const p of P) {
  const thumbs = [],
    mobile = [];
  for (const a of p.pieces) {
    const f = "media/" + p.slug + "/" + a.id;
    for (const suffix of ["", "-mobile"]) {
      r("magick", [f + suffix + ".png", "-quality", "92", f + suffix + ".webp"]);
      if (a.type === "application") r("magick", [f + "-artifact" + suffix + ".png", "-quality", "94", f + "-artifact" + suffix + ".webp"]);
    }
    r("magick", [f + ".png", "-resize", "480x300", "audit/thumb-" + p.slug + "-" + a.id + ".jpg"]);
    thumbs.push("audit/thumb-" + p.slug + "-" + a.id + ".jpg");
    r("magick", [f + "-mobile.png", "-resize", "225x330", "audit/mobile-" + p.slug + "-" + a.id + ".jpg"]);
    mobile.push("audit/mobile-" + p.slug + "-" + a.id + ".jpg");
  }
  r("magick", ["montage", "-font", font, ...thumbs, "-tile", "3x", "-geometry", "+6+6", "audit/" + p.slug + "-final-desktop.jpg"]);
  r("magick", ["montage", "-font", font, ...mobile, "-tile", "6x", "-geometry", "+5+5", "audit/" + p.slug + "-final-mobile.jpg"]);
}
console.log("Exported 166 responsive stills and 32 QA sheets");
