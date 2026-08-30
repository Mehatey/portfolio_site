const candidates = {
  a: { label: "Candidate A", name: "Rhythm cut", src: "../../1.met/10.mp4", score: 86 },
  b: { label: "Candidate B", name: "Object cut", src: "../../1.met/8.mp4", score: 78 },
  c: { label: "Candidate C", name: "Ambient cut", src: "../../1.met/11.mp4", score: 71 },
};

const video = document.querySelector("#main-video");
const playButton = document.querySelector("#play-button");
const played = document.querySelector("#played");
const timestamp = document.querySelector("#timestamp");
const runDialog = document.querySelector("#run-dialog");
const toast = document.querySelector("#toast");
let activeCandidate = "a";

function formatTime(seconds) {
  const value = Number.isFinite(seconds) ? seconds : 0;
  const minutes = Math.floor(value / 60);
  const remaining = (value % 60).toFixed(1).padStart(4, "0");
  return `${String(minutes).padStart(2, "0")}:${remaining}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function updatePlayback() {
  const duration = Number.isFinite(video.duration) ? video.duration : 12.8;
  const progress = duration ? (video.currentTime / duration) * 100 : 0;
  played.style.width = `${progress}%`;
  timestamp.textContent = `${formatTime(video.currentTime)} / ${formatTime(duration)}`;
  playButton.classList.toggle("is-paused", video.paused);
  playButton.setAttribute("aria-label", video.paused ? "Play video" : "Pause video");
}

function selectCandidate(key) {
  activeCandidate = key;
  const candidate = candidates[key];
  document.querySelectorAll(".candidate-card").forEach((card) => {
    const active = card.dataset.candidate === key;
    card.classList.toggle("is-active", active);
    card.setAttribute("aria-pressed", String(active));
  });
  document.querySelector("#candidate-label").textContent = candidate.label;
  document.querySelector("#overall-score").textContent = candidate.score;
  document.querySelector("#approve-button").textContent = `Approve ${candidate.label.toLowerCase()}`;
  video.src = candidate.src;
  video.play().catch(() => {});
}

document.querySelectorAll(".candidate-card").forEach((card) => {
  card.addEventListener("click", () => selectCandidate(card.dataset.candidate));
});

playButton.addEventListener("click", () => {
  if (video.paused) video.play().catch(() => {});
  else video.pause();
});

video.addEventListener("timeupdate", updatePlayback);
video.addEventListener("play", updatePlayback);
video.addEventListener("pause", updatePlayback);

document.querySelector("#timeline").addEventListener("click", (event) => {
  const track = event.currentTarget.querySelector(".track");
  const rect = track.getBoundingClientRect();
  if (event.clientY < rect.top - 6 || event.clientY > rect.bottom + 12) return;
  const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  if (Number.isFinite(video.duration)) video.currentTime = ratio * video.duration;
});

document.querySelectorAll("[data-time]").forEach((item) => {
  item.addEventListener("click", () => {
    video.currentTime = Math.min(Number(item.dataset.time), video.duration || 12.8);
    video.play().catch(() => {});
  });
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    button.parentElement.querySelectorAll("button").forEach((peer) => peer.classList.remove("is-selected"));
    button.classList.add("is-selected");
    const decision = button.dataset.action === "agree" ? "Finding accepted" : "Finding dismissed";
    showToast(`${decision}. Human feedback added to evaluation set.`);
  });
});

async function runPipeline() {
  runDialog.showModal();
  const steps = [...document.querySelectorAll(".pipeline-step")];
  steps.forEach((step) => {
    step.classList.remove("is-done", "is-running");
    step.querySelector("b").textContent = "Waiting";
  });
  for (const step of steps) {
    step.classList.add("is-running");
    step.querySelector("b").textContent = "Running";
    await new Promise((resolve) => setTimeout(resolve, 520));
    step.classList.remove("is-running");
    step.classList.add("is-done");
    step.querySelector("b").textContent = "Complete";
  }
  await new Promise((resolve) => setTimeout(resolve, 350));
  runDialog.close();
  showToast("Evaluation complete. 3 findings need human judgment.");
}

document.querySelector("#run-evaluation").addEventListener("click", runPipeline);
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") runPipeline();
});

document.querySelector("#import-source").addEventListener("click", () => {
  const value = document.querySelector("#youtube-url").value.trim();
  if (!value) return showToast("Add a public YouTube URL or Cloud Storage URI.");
  showToast("Source registered. Run evaluation when ready.");
});

document.querySelector("#approve-button").addEventListener("click", () => {
  showToast(`${candidates[activeCandidate].label} approved by human reviewer.`);
});

document.querySelector("#compare-button").addEventListener("click", () => showToast("Comparison view queued for Candidate A and B."));
document.querySelector("#share-button").addEventListener("click", () => showToast("Private review link copied."));
document.querySelector("#add-candidate").addEventListener("click", () => showToast("Drop a video or connect a Cloud Storage source."));
document.querySelector("#edit-brief").addEventListener("click", () => showToast("Brief criteria unlocked for editing."));
document.querySelector("#filter-findings").addEventListener("click", () => showToast("Showing findings across all evaluation criteria."));

updatePlayback();
