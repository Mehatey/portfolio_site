const fs = require("fs"),
  path = require("path"),
  { execFileSync: r } = require("child_process");
process.chdir(__dirname);
const P = require("./projects.json"),
  font = "/System/Library/Fonts/Supplemental/Arial.ttf";
const m = (...a) => r("magick", a);
const run = (a) => r("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...a], { stdio: "inherit" });
const target = process.argv[2];
const records = target ? JSON.parse(fs.readFileSync("film-provenance.json")).filter((r) => r.project + "/" + r.id !== target) : [];
for (const p of P)
  for (const a of p.pieces.filter((x) => x.type === "film" && (!target || p.slug + "/" + x.id === target))) {
    const dir = "media/" + p.slug;
    fs.mkdirSync(dir, { recursive: true });
    const parts = [];
    for (let n = 0; n < a.clips.length; n++) {
      const c = a.clips[n],
        input = "../../../" + c.src;
      const d =
        c.kind === "still"
          ? c.duration
          : Number(r("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", input], { encoding: "utf8" }));
      const start = Math.min(c.start, Math.max(0, d - 0.6)),
        duration = Math.min(c.duration, d - start);
      const overlay = `${dir}/${a.id}-${n}-caption.png`;
      m(
        "-size",
        "1280x800",
        "xc:none",
        "-fill",
        p.bg,
        "-draw",
        "rectangle 0,720 1279,799",
        "-fill",
        p.color,
        "-draw",
        "rectangle 0,720 1279,723",
        "-font",
        font,
        "-fill",
        p.ink,
        "-pointsize",
        "28",
        "-annotate",
        "+32+769",
        c.label,
        overlay
      );
      const out = `${dir}/${a.id}-${n}-part.mp4`;
      run([
        "-threads",
        "2",
        ...(c.kind === "still" ? ["-loop", "1"] : ["-ss", String(start)]),
        "-t",
        String(duration),
        "-i",
        input,
        "-i",
        overlay,
        "-filter_complex",
        `[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:800:(ow-iw)/2:(720-ih)/2:color=${p.bg},setsar=1,fps=24[v];[v][1:v]overlay=0:0[out]`,
        "-map",
        "[out]",
        "-an",
        "-c:v",
        "libx264",
        "-threads",
        "2",
        "-preset",
        "fast",
        "-crf",
        "20",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        out,
      ]);
      parts.push(out);
      records.push({ project: p.slug, id: a.id, source: c.src, start, duration, label: c.label, kind: c.kind || "recording" });
    }
    const list = `${dir}/${a.id}-concat.txt`;
    fs.writeFileSync(list, parts.map((f) => "file '" + path.basename(f) + "'").join("\n"));
    run(["-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", `${dir}/${a.id}.mp4`]);
    run(["-ss", String(a.posterTime || 1), "-i", `${dir}/${a.id}.mp4`, "-frames:v", "1", `${dir}/${a.id}-poster.png`]);
    m(`${dir}/${a.id}-poster.png`, "-quality", "92", `${dir}/${a.id}-poster.webp`);
    console.log(p.slug, a.id);
  }
fs.writeFileSync("film-provenance.json", JSON.stringify(records, null, 2));
