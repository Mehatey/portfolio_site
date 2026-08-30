const film = document.querySelector(".film");
const progressLine = document.querySelector(".progress i");
const counter = document.querySelector(".counter span");
const chapter = document.querySelector(".chapter");
const canvas = document.querySelector(".paper");
const ctx = canvas.getContext("2d", { alpha: true });

const chapters = [
  "A thought arrives flat.",
  "A body learns weight.",
  "Looking becomes seeing.",
  "Making adds another side.",
  "Time, language, memory.",
  "He paints the inside himself.",
  "Still becoming.",
];

let target = 0;
let current = 0;
let duration = 30;
let activeChapter = 0;
let pointerX = 0.5;
let pointerY = 0.5;
const introOffset = 1;

function scrollProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
}

function updateChapter(index) {
  if (index === activeChapter) return;
  activeChapter = index;
  chapter.classList.add("changing");
  window.setTimeout(() => {
    chapter.textContent = chapters[index];
    counter.textContent = String(index + 1).padStart(2, "0");
    chapter.classList.remove("changing");
  }, 150);
}

function tick() {
  target = scrollProgress();
  current += (target - current) * 0.115;
  const authoredTime = introOffset + current * Math.max(0, duration - introOffset);
  if (film.readyState >= 2 && Math.abs(film.currentTime - authoredTime) > 0.018) {
    film.currentTime = authoredTime;
  }
  progressLine.style.transform = `scaleX(${current})`;
  updateChapter(Math.min(chapters.length - 1, Math.floor(current * chapters.length)));
  requestAnimationFrame(tick);
}

function resizePaper() {
  const dpr = Math.min(devicePixelRatio, 2);
  canvas.width = Math.round(innerWidth * dpr);
  canvas.height = Math.round(innerHeight * dpr);
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
}

function drawPaper() {
  const { width, height } = canvas;
  const image = ctx.createImageData(width, height);
  const data = image.data;
  const cx = pointerX * width;
  const cy = pointerY * height;
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const i = (y * width + x) * 4;
      const distance = Math.hypot(x - cx, y - cy);
      const grain = 35 + Math.random() * 70 + Math.max(0, 24 - distance * 0.02);
      data[i] = data[i + 1] = data[i + 2] = grain;
      data[i + 3] = 26;
    }
  }
  ctx.putImageData(image, 0, 0);
  window.setTimeout(drawPaper, 110);
}

film.addEventListener("loadedmetadata", () => {
  duration = Number.isFinite(film.duration) ? film.duration : 30;
  film.currentTime = introOffset + scrollProgress() * Math.max(0, duration - introOffset);
});

addEventListener("pointermove", (event) => {
  pointerX = event.clientX / innerWidth;
  pointerY = event.clientY / innerHeight;
});
addEventListener("resize", resizePaper);

resizePaper();
drawPaper();
requestAnimationFrame(tick);
