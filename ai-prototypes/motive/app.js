import { enableModel, modelState, runIntent } from "./core/engine.js";
import { clampLens, intentIndexFromDelta } from "./core/geometry.js";

const surface = document.querySelector("#surface");
const cursor = document.querySelector("#motive-cursor");
const cursorLabel = cursor.querySelector(".cursor-label");
const semanticFrame = document.querySelector("#semantic-frame");
const bloom = document.querySelector("#intent-bloom");
const bloomButtons = [...bloom.querySelectorAll("button")];
const lens = document.querySelector("#answer-lens");
const modelButton = document.querySelector("#model-button");
const modelLabel = document.querySelector("#model-label");
const modelLight = document.querySelector("#model-light");
const onboarding = document.querySelector("#onboarding");
let target = null;
let pointer = { x: innerWidth / 2, y: innerHeight / 2 };
let bloomOrigin = { ...pointer };
let selectedIntent = 0;
let bloomOpen = false;

function contextFor(element) {
  return {
    kind: element.dataset.kind || "metric",
    label: element.dataset.label || element.textContent.trim(),
    detail: element.dataset.detail || "No additional context is available.",
  };
}

function setTarget(next) {
  if (target === next) return;
  target = next;
  cursor.className = `motive-cursor${target ? ` is-target kind-${target.dataset.kind}` : ""}`;
  semanticFrame.classList.toggle("is-visible", Boolean(target));
  if (!target) return;
  const context = contextFor(target);
  const box = target.getBoundingClientRect();
  cursorLabel.textContent = `${context.kind.toUpperCase()} · ${context.label}`;
  semanticFrame.style.left = `${box.left}px`;
  semanticFrame.style.top = `${box.top}px`;
  semanticFrame.style.width = `${box.width}px`;
  semanticFrame.style.height = `${box.height}px`;
  onboarding.classList.add("is-gone");
}

function selectByPointer(x, y) {
  selectedIntent = intentIndexFromDelta(x - bloomOrigin.x, y - bloomOrigin.y);
  bloomButtons.forEach((button, index) => button.classList.toggle("is-selected", index === selectedIntent));
}

function openBloom(x = pointer.x, y = pointer.y) {
  if (!target) return;
  bloomOpen = true;
  bloomOrigin = { x, y };
  bloom.style.left = `${x}px`;
  bloom.style.top = `${y}px`;
  bloom.classList.add("is-open");
  bloom.setAttribute("aria-hidden", "false");
  selectedIntent = 0;
  bloomButtons.forEach((button, index) => button.classList.toggle("is-selected", index === 0));
}

function closeBloom() {
  bloomOpen = false;
  bloom.classList.remove("is-open");
  bloom.setAttribute("aria-hidden", "true");
}

function placeLens() {
  const width = Math.min(390, innerWidth - 28);
  const height = 245;
  const { x, y } = clampLens(pointer, { width: innerWidth, height: innerHeight }, { width, height });
  lens.style.left = `${x}px`;
  lens.style.top = `${y}px`;
}

async function runSelected(intent = bloomButtons[selectedIntent].dataset.intent) {
  if (!target) return;
  const context = contextFor(target);
  closeBloom();
  placeLens();
  lens.hidden = false;
  document.querySelector("#answer-title").textContent = `${intent[0].toUpperCase()}${intent.slice(1)} · ${context.label}`;
  const copy = document.querySelector("#answer-copy");
  copy.textContent = "Thinking from this exact interface object…";
  document.querySelector("#answer-source").textContent = "RUNNING LOCALLY";
  try {
    const result = await runIntent(context, intent, (text) => {
      copy.textContent = text;
    });
    document.querySelector("#answer-source").textContent = result.source.toUpperCase();
  } catch (error) {
    copy.textContent = "The local model could not finish. Switch to the semantic demo or try again.";
    document.querySelector("#answer-source").textContent = "MODEL INTERRUPTED";
    console.error(error);
  }
}

document.addEventListener("pointermove", (event) => {
  pointer = { x: event.clientX, y: event.clientY };
  cursor.style.transform = `translate3d(${event.clientX - 14}px, ${event.clientY - 14}px, 0)`;
  if (bloomOpen) selectByPointer(event.clientX, event.clientY);
  else setTarget(event.target.closest?.("[data-motive]") || null);
});

surface.addEventListener("focusin", (event) => setTarget(event.target.closest("[data-motive]")));
surface.addEventListener("pointerleave", () => {
  if (!bloomOpen) setTarget(null);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeBloom();
    lens.hidden = true;
  }
  if (event.key === " " && target && !event.repeat && !event.target.matches("textarea, input")) {
    event.preventDefault();
    openBloom();
  }
  if (bloomOpen && event.key === "ArrowRight") {
    event.preventDefault();
    selectedIntent = (selectedIntent + 1) % bloomButtons.length;
    bloomButtons.forEach((button, index) => button.classList.toggle("is-selected", index === selectedIntent));
  }
  if (bloomOpen && event.key === "ArrowLeft") {
    event.preventDefault();
    selectedIntent = (selectedIntent - 1 + bloomButtons.length) % bloomButtons.length;
    bloomButtons.forEach((button, index) => button.classList.toggle("is-selected", index === selectedIntent));
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === " " && bloomOpen) {
    event.preventDefault();
    runSelected();
  }
});

surface.addEventListener("click", (event) => {
  const clicked = event.target.closest("[data-motive]");
  if (!clicked || !matchMedia("(pointer: coarse)").matches) return;
  event.preventDefault();
  setTarget(clicked);
  const box = clicked.getBoundingClientRect();
  pointer = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  openBloom(pointer.x, pointer.y);
});

bloomButtons.forEach((button) => button.addEventListener("click", () => runSelected(button.dataset.intent)));
document.querySelector("#close-answer").addEventListener("click", () => {
  lens.hidden = true;
});
document.querySelector("#copy-answer").addEventListener("click", async (event) => {
  await navigator.clipboard.writeText(document.querySelector("#answer-copy").textContent);
  event.currentTarget.textContent = "Copied";
  setTimeout(() => {
    event.currentTarget.textContent = "Copy";
  }, 1200);
});

function renderModelState(state) {
  modelLabel.textContent = state.label;
  modelLight.className = state.state === "ready" ? "is-ready" : state.state === "fallback" ? "is-fallback" : "";
}

renderModelState(modelState());
if (matchMedia("(pointer: coarse)").matches) {
  onboarding.querySelector("b").textContent = "TAP ANY SIGNAL";
  onboarding.querySelector("span").textContent = "Tap an object once, then choose an action around it.";
}
modelButton.addEventListener("click", async () => {
  modelLabel.textContent = "Preparing model";
  modelButton.disabled = true;
  try {
    renderModelState(
      await enableModel((progress) => {
        modelLabel.textContent = `Downloading ${Math.round(progress * 100)}%`;
      })
    );
  } catch {
    renderModelState({ state: "fallback", label: "Semantic demo" });
  } finally {
    modelButton.disabled = false;
  }
});

setInterval(() => {
  document.querySelector("#clock").textContent = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}, 1000);
