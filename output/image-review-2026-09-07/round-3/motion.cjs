const { execFileSync: r } = require("child_process");
const fs = require("fs");
process.chdir(__dirname);
const ff = (...a) => r("ffmpeg", ["-y", ...a], { stdio: "ignore" });
fs.mkdirSync("motion", { recursive: true });
// An editorial loop uses existing package rotation, then the new still applications. No synthetic human motion.
ff(
  "-i",
  "../../../7.naavo/14.mp4",
  "-vf",
  "crop=700:932:350:0,scale=576:768,pad=1152:768:(ow-iw)/2:0:color=0xece9e9,fps=24,setsar=1",
  "-an",
  "-c:v",
  "libx264",
  "-pix_fmt",
  "yuv420p",
  "motion/rotation.mp4"
);
for (const [id, cx] of [
  ["naavo-gift", 0.52],
  ["naavo-use", 0.4],
])
  ff(
    "-loop",
    "1",
    "-i",
    id + ".png",
    "-vf",
    `scale=2304:1536,zoompan=z='1+0.035*on/95':x='iw*${cx}-iw/zoom*${cx}':y='ih/2-ih/zoom/2':d=96:s=1152x768:fps=24,setsar=1`,
    "-t",
    "4",
    "-an",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "motion/" + id + ".mp4"
  );
ff(
  "-i",
  "motion/rotation.mp4",
  "-i",
  "motion/naavo-gift.mp4",
  "-i",
  "motion/naavo-use.mp4",
  "-filter_complex",
  "[0:v][1:v]xfade=transition=fade:duration=0.5:offset=3.1[v1];[v1][2:v]xfade=transition=fade:duration=0.5:offset=6.6,fade=t=out:st=10.1:d=0.5[v]",
  "-map",
  "[v]",
  "-an",
  "-c:v",
  "libx264",
  "-crf",
  "19",
  "-pix_fmt",
  "yuv420p",
  "-movflags",
  "+faststart",
  "naavo-motion.mp4"
);
ff(
  "-i",
  "naavo-motion.mp4",
  "-filter_complex",
  "fps=12,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=192[p];[b][p]paletteuse=dither=bayer:bayer_scale=3",
  "-loop",
  "0",
  "naavo-motion.gif"
);
for (let i = 0; i < 6; i++) ff("-ss", String(i * 1.9), "-i", "naavo-motion.mp4", "-frames:v", "1", "-vf", "scale=480:-1", "motion/qa-" + i + ".jpg");
r("magick", [
  "montage",
  "-font",
  "/System/Library/Fonts/Supplemental/Arial.ttf",
  ...[0, 1, 2, 3, 4, 5].map((i) => "motion/qa-" + i + ".jpg"),
  "-tile",
  "3x",
  "-geometry",
  "480x320+5+5",
  "-background",
  "#222",
  "motion/qa-contact.jpg",
]);
