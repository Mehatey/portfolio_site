const { execFileSync: r } = require("child_process"),
  fs = require("fs");
process.chdir(__dirname);
const P = require("./projects.json");
for (const p of P)
  for (const a of p.pieces.filter((a) => ["logo", "sequence"].includes(a.type))) {
    const d = "media/" + p.slug;
    r("ffmpeg", [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-framerate",
      "24",
      "-i",
      d + "/frames-" + a.id + "/%04d.png",
      "-c:v",
      "libx264",
      "-crf",
      "19",
      "-preset",
      "fast",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      d + "/" + a.id + ".mp4",
    ]);
    r("magick", [d + "/frames-" + a.id + "/" + (a.type === "logo" ? "0100" : "0040") + ".png", "-quality", "92", d + "/" + a.id + "-poster.webp"]);
    console.log(p.slug, a.id);
  }
