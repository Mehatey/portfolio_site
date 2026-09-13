const { execFileSync: r } = require("child_process");
process.chdir(__dirname);
const ff = (...a) => r("ffmpeg", ["-y", ...a], { stdio: "ignore" });
const enc = ["-an", "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p"];
const fit = "scale=1152:648:force_original_aspect_ratio=decrease,pad=1152:648:(ow-iw)/2:(oh-ih)/2:color=0x111411,fps=24,setsar=1";
ff("-loop", "1", "-i", "../../../2.cube/conception/7.3.jpg", "-t", "1.5", "-vf", fit, ...enc, "motion/cube-paper.mp4");
ff("-ss", "1", "-i", "../../../2.cube/2d/5.2.mp4", "-t", "3", "-vf", fit, ...enc, "motion/cube-2d.mp4");
ff("-ss", "0.3", "-i", "../../../2.cube/3d/12.mp4", "-t", "3", "-vf", fit, ...enc, "motion/cube-3d.mp4");
ff(
  "-i",
  "motion/cube-paper.mp4",
  "-i",
  "motion/cube-2d.mp4",
  "-i",
  "motion/cube-3d.mp4",
  "-filter_complex",
  "[0:v][1:v][2:v]concat=n=3:v=1:a=0[v]",
  "-map",
  "[v]",
  ...enc,
  "-movflags",
  "+faststart",
  "cube-motion.mp4"
);
ff("-i", "../../../6.mindu/kiosk2.mp4", "-vf", fit, ...enc, "-movflags", "+faststart", "mindu-motion.mp4");
for (const id of ["cube", "mindu"]) {
  ff(
    "-i",
    id + "-motion.mp4",
    "-filter_complex",
    "fps=12,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=192[p];[b][p]paletteuse=dither=bayer:bayer_scale=3",
    "-loop",
    "0",
    id + "-motion.gif"
  );
  ff("-ss", id === "cube" ? "2.5" : "3.6", "-i", id + "-motion.mp4", "-frames:v", "1", id + "-motion-poster.png");
  r("magick", [id + "-motion-poster.png", id + "-motion-poster.webp"]);
}
