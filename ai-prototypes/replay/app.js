import { appendEvent, buildFinding, createTrace, sanitizeKey, serializeTrace, targetLabel } from "./core/trace.js";
import { compilePlaywright, defaultSpec } from "./core/compiler.js";

const frame = document.querySelector("#fixture-frame");
const recordButton = document.querySelector("#record-button");
const markButton = document.querySelector("#mark-button");
const eventList = document.querySelector("#event-list");
const eventCount = document.querySelector("#event-count");
const tapeTitle = document.querySelector("#tape-title");
const proofPanel = document.querySelector("#proof-panel");
const exportPanel = document.querySelector("#export-panel");
const instruction = document.querySelector("#instruction");
const codeOutput = document.querySelector("#code-output");
const runResult = document.querySelector("#run-result");
const runMode = document.querySelector("#run-mode");
const focusWire = document.querySelector(".focus-wire");
let mode = "broken";
let recording = false;
let trace = createTrace("Replay checkout fixture");
let finding = null;
let previousTarget = null;
let code = "";

function reset() {
  trace = createTrace("Replay checkout fixture");
  finding = null;
  previousTarget = null;
  eventList.innerHTML = '<li class="empty-event"><span>01</span><p>Recording armed. Move into the checkout and use the keyboard.</p></li>';
  eventCount.textContent = "00";
  tapeTitle.textContent = "Listening for focus";
  proofPanel.hidden = true;
  exportPanel.hidden = true;
  focusWire.classList.remove("is-visible");
}

function eventCopy(event) {
  if (event.type === "key") return `<span class="event-kind">NAV KEY</span><strong>${event.key}</strong>`;
  if (event.type === "focus")
    return `<span class="event-kind">FOCUS</span><strong>${targetLabel(event.target)}</strong>${event.dialogOpen ? " · dialog open" : ""}`;
  if (event.type === "dialog") return `<span class="event-kind">STATE</span>Dialog ${event.state}`;
  return '<span class="event-kind">HUMAN MARKER</span><strong>Failure observed</strong>';
}

function renderEvents() {
  eventCount.textContent = String(trace.events.length).padStart(2, "0");
  tapeTitle.textContent = recording ? "Recording journey" : "Journey captured";
  eventList.innerHTML = trace.events
    .map(
      (event, index) => `<li data-event-id="${event.id}">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <p>${eventCopy(event)}</p>
        <span class="event-time">${(event.t / 1000).toFixed(1)}s</span>
      </li>`
    )
    .join("");
  eventList.scrollTop = eventList.scrollHeight;
}

function capture(event) {
  appendEvent(trace, event);
  renderEvents();
}

function startRecording() {
  reset();
  recording = true;
  recordButton.classList.add("is-recording");
  recordButton.querySelector("span:last-child").textContent = "Stop recording";
  markButton.disabled = false;
  instruction.textContent = "Recording. Open the delivery dialog, then keep pressing Tab.";
  frame.focus();
}

function stopRecording() {
  recording = false;
  recordButton.classList.remove("is-recording");
  recordButton.querySelector("span:last-child").textContent = "Record again";
  markButton.disabled = trace.events.length === 0;
  instruction.textContent = "Journey paused. Mark the exact moment if Replay has not already found it.";
  renderEvents();
}

function markFailure() {
  if (!recording && trace.events.length === 0) return;
  capture({ type: "marker", category: "keyboard-trap", note: "Failure observed by tester" });
  stopRecording();
  finding = buildFinding(trace);
  if (!finding) {
    instruction.textContent = "No focus failure found yet. Record until focus leaves the open dialog.";
    return;
  }
  finding.evidenceEventIds.forEach((id) => eventList.querySelector(`[data-event-id="${id}"]`)?.classList.add("is-evidence"));
  document.querySelector("#proof-title").textContent = finding.title;
  document.querySelector("#finding-detail").textContent = finding.detail;
  document.querySelector("#evidence-cites").innerHTML = finding.evidenceEventIds.map((id) => `<span>${id} · cited</span>`).join("");
  proofPanel.hidden = false;
  focusWire.classList.add("is-visible");
  proofPanel.scrollIntoView({ behavior: "smooth", block: "center" });
}

recordButton.addEventListener("click", () => (recording ? stopRecording() : startRecording()));
markButton.addEventListener("click", markFailure);

window.addEventListener("message", (message) => {
  if (message.source !== frame.contentWindow || message.data?.source !== "replay-fixture") return;
  if (!recording || message.data.type === "ready") return;
  const data = message.data;
  if (data.type === "key") {
    const key = sanitizeKey(data.key, data.shiftKey);
    if (key) capture({ type: "key", key });
  }
  if (data.type === "focus") {
    capture({ type: "focus", from: previousTarget, target: data.target, dialogOpen: data.dialogOpen });
    previousTarget = data.target;
    if (data.dialogOpen && !data.target.insideDialog) focusWire.classList.add("is-visible");
  }
  if (data.type === "dialog") capture({ type: "dialog", state: data.state, target: data.target });
});

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "m" && recording && document.activeElement !== document.querySelector("#assertion-input")) markFailure();
});

document.querySelectorAll(".mode-button").forEach((button) => {
  button.addEventListener("click", () => {
    mode = button.dataset.mode;
    document.querySelectorAll(".mode-button").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    frame.src = `./fixtures/checkout.html?mode=${mode}`;
    runMode.textContent = mode;
    runResult.className = "run-result";
    runResult.textContent = `Ready to verify against the ${mode} fixture.`;
  });
});

document.querySelector("#confirm-button").addEventListener("click", () => {
  const spec = defaultSpec(new URL(`./fixtures/checkout.html?mode=${mode}`, location.href).href);
  spec.title = document.querySelector("#assertion-input").value.trim().toLowerCase();
  spec.evidenceEventIds = finding?.evidenceEventIds || [];
  spec.confirmedAt = new Date().toISOString();
  code = compilePlaywright(spec);
  codeOutput.textContent = code;
  exportPanel.hidden = false;
  proofPanel.querySelector(".eyebrow").textContent = "RULE FINDING · CONFIRMED BY TESTER";
  document.querySelector("#confirm-button").textContent = "Assertion confirmed";
  exportPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#run-button").addEventListener("click", async () => {
  runResult.className = "run-result";
  runResult.textContent = `Replaying 4 deterministic steps against ${mode}…`;
  try {
    const result = await frame.contentWindow.replayJourney();
    runResult.classList.add(result.passed ? "is-pass" : "is-fail");
    runResult.textContent = result.passed
      ? `PASS · Focus remained inside the dialog on ${targetLabel(result.target)}.`
      : `FAIL · Focus escaped to ${targetLabel(result.target)} while the dialog stayed open.`;
  } catch {
    runResult.classList.add("is-fail");
    runResult.textContent = "Could not reach the fixture. Reload it, then run again.";
  }
});

function download(name, contents, type) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = Object.assign(document.createElement("a"), { href: url, download: name });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.querySelector("#download-button").addEventListener("click", () => download("delivery-dialog.spec.js", code, "text/javascript"));
document.querySelector("#download-trace").addEventListener("click", () => download("replay-trace.json", serializeTrace(trace), "application/json"));
