const fs = require("fs"),
  path = require("path"),
  crypto = require("crypto");
process.chdir(__dirname);
fs.mkdirSync("references", { recursive: true });
const images = {
  "mool-ui": "5.mool/8.webp",
  "fairview-ui": "assets/img/fairview/cover.webp",
  "alpha-ui": "10.alpha/29.2.webp",
  "aananda-spread": "9.aananda/14.webp",
  "naavo-labels": "7.naavo/13.3 solo.webp",
  "naavo-bottles": "7.naavo/13.5 solo.webp",
  "naavo-carton": "7.naavo/15.1.webp",
  "naavo-brand": "7.naavo/1.png",
  "naavo-incense": "7.naavo/17.1.webp",
  "apna-identity": "11.illu/29.1.webp",
  "shot-poster": "8.shotoniphone/3.webp",
  "shot-ui": "8.shotoniphone/4.webp",
};
const references = Object.entries(images).map(([id, p]) => {
  const file = "../../../" + p,
    copy = "references/" + id + path.extname(p);
  fs.copyFileSync(file, copy);
  return { id, original: file, preservedCopy: copy, sha256: crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex") };
});
const prompts = ["prompts.json", "prompts-extra.json", "prompts-applications.json", "prompt-shot.json", "prompt-incense.json"].map((file) => ({
  file,
  records: JSON.parse(fs.readFileSync(file, "utf8")),
}));
const outputs = ["mool", "fairview", "alpha", "aananda", "naavo-gift", "naavo-use", "naavo-incense", "apna", "shot"].map((id) => ({
  id,
  scene: id + "-scene.png",
  png: id + ".png",
  webp: id + ".webp",
  status: "proposal for review",
  kind: id === "naavo-gift" ? "new packaging concept using existing identity" : "illustrative setting using original artwork",
}));
const motion = [
  {
    id: "naavo",
    inputs: ["../../../7.naavo/14.mp4", "naavo-gift.png", "naavo-use.png"],
    method: "Original box-opening animation followed by slow photographic push-ins and crossfades. No synthesized human motion.",
  },
  {
    id: "cube",
    inputs: ["../../../2.cube/conception/7.3.jpg", "../../../2.cube/2d/5.2.mp4", "../../../2.cube/3d/12.mp4"],
    method: "Cuts between original drawing and actual gameplay clips.",
  },
  { id: "mindu", inputs: ["../../../6.mindu/kiosk2.mp4"], method: "Original continuous kiosk-to-brain documentation, resized and muted." },
].map((x) => ({ ...x, mp4: x.id + "-motion.mp4", gif: x.id + "-motion.gif" }));
const doc = {
  date: "2026-09-07",
  scope: "Round 3, contextual applications and interaction evidence; local review only",
  references,
  prompts,
  outputs,
  motion,
  proof: JSON.parse(fs.readFileSync("evidence/sources.json", "utf8")),
  reproduction: [
    "node compose.cjs",
    "node compose-applications.cjs",
    "node compose-shot.cjs",
    "node compose-incense.cjs",
    "node motion.cjs",
    "node motion-proof.cjs",
    "node evidence.cjs",
    "node placements.cjs",
    "node placements-proof.cjs",
    "node gallery.cjs",
    "node export.cjs",
  ],
  constraints: [
    "Original production assets unchanged",
    "No publication",
    "No usage reset redeemed",
    "Built-in image generation only, no separate API generation",
    "Generated human settings are illustrative, not research or deployment evidence",
  ],
  notes: [
    "Mool preserves a 564x1130 viewport from the taller original planning screen.",
    "Shot on iPhone reflows original bitmap header/photo/quote/QR into a portrait poster. Original wording and source credits retained.",
    "Naavo label typography comes from originals, including existing spelling.",
    "Aananda original page artwork uses separate perspective mapping and restored foreground thumbs.",
    "Apna Adda original face artwork is unwrapped, ink extracted and perspective mapped.",
    "Vantage screenshot was captured from the existing deployed prototype without submitting a message. It illustrates prototype interface, not verified business metrics.",
  ],
};
doc.exports = { manifest: "exports/manifest.json", download: "exports/selected-webp.zip", widths: [480, 900, 1536] };
doc.resume = "RESUME.md";
fs.writeFileSync("sources.json", JSON.stringify(doc, null, 2));
