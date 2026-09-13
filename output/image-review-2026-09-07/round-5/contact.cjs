const fs = require("fs"),
  path = require("path"),
  { execFileSync: r } = require("child_process");
process.chdir(__dirname);
const c = require("./catalog.json"),
  font = "/System/Library/Fonts/Supplemental/Arial.ttf";
for (const p of c) {
  const candidates = p.sources.filter((s) => !s.includes("{{") && fs.existsSync("../../../" + s));
  const selected = [
    ...new Set([...candidates.slice(0, 3), ...Array.from({ length: 12 }, (_, i) => candidates[Math.floor((i * (candidates.length - 1)) / 11)])]),
  ].filter(Boolean);
  const thumbs = [];
  for (let i = 0; i < selected.length; i++) {
    const s = selected[i],
      dest = `source-frames/${p.slug}-${i}.jpg`;
    let input = "../../../" + s;
    if (/\.mp4$/i.test(s)) {
      try {
        r("ffmpeg", ["-y", "-ss", "1", "-i", input, "-frames:v", "1", dest], { stdio: "ignore" });
        input = dest;
      } catch {
        continue;
      }
    }
    try {
      r("magick", [
        input + "[0]",
        "-resize",
        "300x200",
        "-background",
        "#ddd",
        "-gravity",
        "center",
        "-extent",
        "320x230",
        "-font",
        font,
        "-fill",
        "#111",
        "-pointsize",
        "13",
        "-gravity",
        "south",
        "-annotate",
        "+0+5",
        s.split("/").pop(),
        dest,
      ]);
      thumbs.push(dest);
    } catch {}
  }
  if (thumbs.length) r("magick", ["montage", "-font", font, ...thumbs, "-tile", "4x", "-geometry", "+5+5", "audit/" + p.slug + "-sources.jpg"]);
}
