const fs = require("fs"),
  { execFileSync: r } = require("child_process");
process.chdir(__dirname);
const m = (...a) => r("magick", a);
// Recover only broad lighting changes from the generated edit, not regenerated lettering.
m("scene.png", "-colorspace", "gray", "-blur", "0x24", "new-light.png");
m("../round-7/marriott-corrected.webp", "-colorspace", "gray", "-blur", "0x24", "old-light.png");
m("new-light.png", "old-light.png", "-fx", "min(1.06,max(0.94,u/(v+0.001)))", "light-ratio.png");
m(
  "../round-7/marriott-corrected.png",
  "light-ratio.png",
  "-compose",
  "Multiply",
  "-composite",
  "../round-7/glass-mask.png",
  "-alpha",
  "off",
  "-compose",
  "CopyOpacity",
  "-composite",
  "exact-screen.png"
);
m("scene.png", "exact-screen.png", "-compose", "Over", "-composite", "marriott-quiet.png");
m("marriott-quiet.png", "-quality", "94", "marriott-quiet.webp");
m("marriott-quiet.png", "-crop", "850x640+355+225", "+repage", "qa-tablet.png");
m("marriott-quiet.png", "-resize", "390x", "qa-mobile.png");
fs.writeFileSync(
  "decisions.md",
  `# Quiet Marriott background and lighting\n\nUser requested one or two background people maximum, tablet dominant, and physically believable screen mapping, light and shadows. One distant guest retained at the doorway; group removed.\n\nExact Round 7 source-derived dashboard and geometry retained using its glass/finger mask. Only low-frequency light change from the generated revision is transferred, bounded to 0.94–1.06, preserving original lettering. Foreground hand, bezel and stand shadows come from the edited scene. No extra frame or screenshot padding.\n\nReviewed full tablet crop, glass edges, finger occlusion, contact shadow beneath stand, and 390px image. Local previews only. Prompt and previous versions preserved. Background-restraint preference added to VISUAL_DIRECTION.md.\n`
);
