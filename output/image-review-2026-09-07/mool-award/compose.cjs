const fs = require("fs"),
  { execFileSync: r } = require("child_process");
process.chdir(__dirname);
const m = (...a) => r("magick", a);
fs.writeFileSync(
  "ribbon-mask.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024"><rect width="1536" height="1024" fill="black"/><path fill="white" d="M275 0H430V308Q430 314 424 310L353 275L283 311Q275 315 275 307Z"/></svg>`
);
m("ribbon-mask.svg", "ribbon-scene.png", "-compose", "CopyOpacity", "-composite", "unused.png");
m(
  "ribbon-scene.png",
  "ribbon-mask.svg",
  "-alpha",
  "off",
  "-compose",
  "CopyOpacity",
  "-composite",
  "-crop",
  "158x314+274+0",
  "+repage",
  "-resize",
  "264x252!",
  "ribbon.png"
);
m(
  "award-source.png",
  "-channel",
  "G",
  "-separate",
  "+channel",
  "-level",
  "15%,90%",
  "-crop",
  "242x131+39+28",
  "+repage",
  "-filter",
  "Lanczos",
  "-resize",
  "222x120",
  "ink-mask.png"
);
m("-size", "222x120", "xc:#f7faff", "ink-mask.png", "-alpha", "off", "-compose", "CopyOpacity", "-composite", "ink.png");
m("ribbon.png", "ink.png", "-geometry", "+21+62", "-compose", "Over", "-composite", "ribbon-printed.png");
m("ribbon.png", "-background", "#060b2e", "-shadow", "45x10+7+12", "shadow.png");
m(
  "../mool-b.png",
  "shadow.png",
  "-geometry",
  "+60-8",
  "-compose",
  "Over",
  "-composite",
  "ribbon-printed.png",
  "-geometry",
  "+80+0",
  "-compose",
  "Over",
  "-composite",
  "mool-award.png"
);
m("mool-award.png", "-quality", "95", "mool-award.webp");
m("mool-award.png", "-crop", "370x310+30+0", "+repage", "qa-label.png");
m("mool-award.png", "-resize", "390x", "qa-mobile.png");
fs.writeFileSync(
  "decisions.md",
  `# Mool folded-indigo award ribbon\n\nOriginal folded-indigo cover preserved outside the new ribbon and its shadow. Award source supplied by user: tag_kyurius.png, 324×185. No higher-resolution original was found in the supplied folder; the provided white artwork was isolated and cleaned, then printed below its source resolution rather than inventing replacement lettering.\n\nGlossy blue ribbon hangs from the top-left, with a V-notch, beveled corners and soft cast shadow. Generated blank ribbon used for material only. Exact elephant and 2021 KYOORIUS DESIGN AWARDS lockup retained from supplied image; no winner category added.\n\nFinals mool-award.png and .webp. Prompt, source, compositing script and inspection crops retained. Local review only; production unchanged.\n`
);
