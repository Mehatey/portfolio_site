const fs = require("fs"),
  { execFileSync: r } = require("child_process");
process.chdir(__dirname);
const P = require("./projects.json"),
  font = "/System/Library/Fonts/Supplemental/Arial.ttf";
let frames = [],
  logs = [];
for (const p of P)
  for (const a of p.pieces.filter((a) => ["film", "logo", "sequence"].includes(a.type))) {
    const f = "media/" + p.slug + "/" + a.id + ".mp4",
      dur = Number(r("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", f], { encoding: "utf8" }));
    for (const [n, t] of [0.6, dur / 2, Math.max(0.1, dur - 0.65)].entries()) {
      const out = "audit/mqa-" + p.slug + "-" + a.id + "-" + n + ".png";
      r("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-ss", String(t), "-i", f, "-frames:v", "1", out]);
      r("magick", [
        out,
        "-resize",
        "360x225",
        "-background",
        "#dfe3de",
        "-gravity",
        "center",
        "-extent",
        "380x258",
        "-font",
        font,
        "-fill",
        "#111",
        "-pointsize",
        "12",
        "-gravity",
        "south",
        "-annotate",
        "+0+5",
        p.slug + "/" + a.id + " · " + t.toFixed(1) + "s",
        out,
      ]);
      frames.push(out);
    }
    logs.push({ project: p.slug, id: a.id, duration: dur });
  }
for (let i = 0; i < frames.length; i += 12)
  r("magick", ["montage", "-font", font, ...frames.slice(i, i + 12), "-tile", "3x", "-geometry", "+4+4", "audit/motion-qa-" + i + ".jpg"]);
fs.writeFileSync("motion-qa.json", JSON.stringify(logs, null, 2));
