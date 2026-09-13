const fs = require("fs"),
  { execFileSync: r } = require("child_process");
process.chdir(__dirname);
fs.mkdirSync("evidence", { recursive: true });
const font = "/System/Library/Fonts/Supplemental/Arial.ttf";
const m = (...a) => r("magick", a);
const root = "../../../";
const frame = (id, file, t) => {
  r("ffmpeg", ["-y", "-ss", String(t), "-i", root + file, "-frames:v", "1", "evidence/" + id + ".png"], { stdio: "ignore" });
  return "evidence/" + id + ".png";
};
const projects = [
  {
    id: "encoded-proof",
    title: "Encoded",
    labels: ["Capture the space", "Align to the artwork", "Activate the interpretation"],
    sources: [frame("encoded-capture", "1.met/2.mp4", 2), frame("encoded-align", "1.met/5.mp4", 2), frame("encoded-activate", "1.met/8.mp4", 2)],
  },
  {
    id: "mindu-proof",
    title: "Mind Your Feelings",
    labels: ["Choose & draw", "Send to the brain", "See the response"],
    sources: [
      frame("mindu-draw", "6.mindu/kiosk2.mp4", 0.5),
      frame("mindu-send", "6.mindu/kiosk2.mp4", 1.8),
      frame("mindu-response", "6.mindu/kiosk2.mp4", 4),
    ],
  },
  {
    id: "bodhi-proof",
    title: "Bodhi on Vision Pro",
    labels: ["In the room", "Inside the headset", "Draw in space"],
    sources: [
      frame("bodhi-room", "15.bloom-vp/visitor-1.mp4", 2),
      frame("bodhi-tree", "15.bloom-vp/tree.mp4", 2),
      frame("bodhi-draw", "15.bloom-vp/vp-21.mp4", 7),
    ],
  },
  {
    id: "bloom-proof",
    title: "Bloom; who are you",
    labels: ["The room", "The system", "The encounter"],
    sources: [root + "4.mandala/13.1.webp", root + "4.mandala/brainbit.jpg", root + "4.mandala/p1.png"],
  },
  {
    id: "ai-self-proof",
    title: "AI Self",
    labels: ["AI perception", "AR companion concept", "VR experience study"],
    sources: [root + "2.ai-self/2.webp", frame("ai-self-ar", "2.ai-self/14.1.mp4", 6.2), root + "2.ai-self/21.webp"],
  },
  {
    id: "cube-proof",
    title: "Cube of Creations",
    labels: ["On paper", "In film", "In a playable world"],
    sources: [root + "2.cube/conception/7.3.jpg", root + "2.cube/short film hd/0.webp", root + "2.cube/3d/3.1.webp"],
  },
  {
    id: "broken-proof",
    title: "Broken and Beautiful",
    labels: ["An invitation", "A place to answer", "Responses"],
    sources: [root + "5.bb/board1.3.webp", frame("broken-answer", "5.bb/d2.mp4", 7.5), frame("broken-response", "5.bb/d5.mp4", 2)],
  },
  {
    id: "prototypes-proof",
    title: "2026 AI Experiments",
    labels: ["Latent Atlas · search", "Amnesiac · forgetting", "Vantage · actual prototype"],
    sources: [
      frame("proto-atlas", "assets/media/ai-prototypes/latent-atlas/module-02-semantic-search-web.mp4", 4),
      frame("proto-amnesiac", "assets/media/ai-prototypes/amnesiac/AMNESIAC-open-and-forget.mp4", 23),
      "evidence/vantage-live.png",
    ],
  },
];
for (const p of projects) {
  const args = [
    "-size",
    "1800x650",
    "xc:#111411",
    "-font",
    font,
    "-fill",
    "#f2f0e9",
    "-pointsize",
    "44",
    "-annotate",
    "+54+80",
    p.title,
    "-fill",
    "#92988e",
    "-pointsize",
    "20",
    "-annotate",
    "+54+118",
    "Original project documentation",
  ];
  for (let i = 0; i < 3; i++) {
    const out = "evidence/" + p.id + "-" + i + ".png";
    const crop = p.id === "broken-proof" && i === 1 ? ["-crop", "560x380+445+75", "+repage"] : [];
    if (crop.length)
      p.detailCrop = { frame: 1, geometry: "560x380+445+75", reason: "Make original response fields readable; full frame remains linked." };
    m(p.sources[i], ...crop, "-resize", "548x340", "-background", "#1c201c", "-gravity", "center", "-extent", "548x340", out);
    args.push(out, "-geometry", `+${54 + i * 572}+164`, "-compose", "over", "-composite");
  }
  args.push("-gravity", "northwest", "-fill", "#e0e5da", "-pointsize", "23");
  p.labels.forEach((t, i) => args.push("-annotate", `+${54 + i * 572}+570`, `${i + 1}  ${t}`));
  args.push("evidence/" + p.id + ".png");
  m(...args);
  m("evidence/" + p.id + ".png", "-quality", "91", "evidence/" + p.id + ".webp");
}
fs.writeFileSync("evidence/sources.json", JSON.stringify(projects, null, 2));
