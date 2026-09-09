const params = new URLSearchParams(location.search);
const mode = params.get("mode") === "fixed" ? "fixed" : "broken";
const dialog = document.querySelector("#delivery-dialog");
const scrim = document.querySelector("#scrim");
const trigger = document.querySelector("#delivery-trigger");
const close = document.querySelector("#close-dialog");
const apply = document.querySelector("#apply-delivery");
let dialogOpen = false;

function accessibleName(element) {
  return element.getAttribute("aria-label") || element.textContent.replace(/\s+/g, " ").trim().slice(0, 80) || element.name || element.id;
}

function roleOf(element) {
  return element.getAttribute("role") || { BUTTON: "button", A: "link", INPUT: "textbox" }[element.tagName] || element.tagName.toLowerCase();
}

function targetRef(element) {
  return {
    id: element.id || null,
    tag: element === document.body ? "body" : element.tagName.toLowerCase(),
    role: roleOf(element),
    name: accessibleName(element),
    insideDialog: dialog.contains(element),
    locatorCandidates: [
      element.id ? { kind: "css", value: `#${element.id}` } : null,
      { kind: "role", role: roleOf(element), name: accessibleName(element) },
    ].filter(Boolean),
  };
}

function send(type, detail = {}) {
  parent.postMessage({ source: "replay-fixture", type, mode, dialogOpen, ...detail }, location.origin);
}

function openDialog() {
  dialogOpen = true;
  dialog.hidden = false;
  scrim.hidden = false;
  if (mode === "fixed") dialog.querySelector(".option").focus();
  send("dialog", { state: "open", target: targetRef(dialog) });
}

function closeDialog() {
  dialogOpen = false;
  dialog.hidden = true;
  scrim.hidden = true;
  trigger.focus();
  send("dialog", { state: "closed", target: targetRef(trigger) });
}

function trapFocus(event) {
  if (mode !== "fixed" || !dialogOpen || event.key !== "Tab") return;
  const focusable = [...dialog.querySelectorAll("button:not([disabled])")];
  const first = focusable[0];
  const last = focusable.at(-1);
  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  }
}

trigger.addEventListener("click", openDialog);
close.addEventListener("click", closeDialog);
apply.addEventListener("click", closeDialog);
document.addEventListener("keydown", (event) => {
  trapFocus(event);
  send("key", { key: event.key, shiftKey: event.shiftKey });
});
document.addEventListener("focusin", (event) => send("focus", { target: targetRef(event.target) }));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && dialogOpen) closeDialog();
});

window.replayJourney = async () => {
  openDialog();
  const buttons = [...dialog.querySelectorAll("button")];
  buttons[0].focus();
  buttons[1].focus();
  buttons[2].focus();
  if (mode === "broken") document.querySelector(".continue").focus();
  else buttons[0].focus();
  return { passed: dialog.contains(document.activeElement), target: targetRef(document.activeElement) };
};

send("ready");
