const start = document.querySelector("#start");
const status = document.querySelector("#status");
const list = document.querySelector("#events");
const download = document.querySelector("#download");
const mark = document.querySelector("#mark");
const exportTest = document.querySelector("#export");
const port = chrome.runtime.connect({ name: "replay-panel" });
let activeTabId = null;
let activeUrl = null;
let markedEvents = null;

start.addEventListener("click", () => port.postMessage({ type: "start" }));
port.onMessage.addListener((message) => {
  if (message.type !== "started") return;
  activeTabId = message.tabId;
  activeUrl = message.url;
  status.textContent = `Recording ${new URL(message.url).hostname}`;
  start.textContent = "Recording";
  mark.disabled = false;
  refresh();
});

async function refresh() {
  if (!activeTabId) return;
  const { traces = {} } = await chrome.storage.local.get({ traces: {} });
  const events = traces[activeTabId] || [];
  list.replaceChildren(
    ...events.map((event) => {
      const item = document.createElement("li");
      item.textContent = `${event.type.toUpperCase()} · ${event.key || event.target?.name || event.path || "event"}`;
      return item;
    })
  );
  download.disabled = events.length === 0;
  setTimeout(refresh, 700);
}

mark.addEventListener("click", async () => {
  const { traces = {} } = await chrome.storage.local.get({ traces: {} });
  markedEvents = [...(traces[activeTabId] || []), { type: "marker", t: Date.now(), category: "keyboard-failure" }];
  traces[activeTabId] = markedEvents;
  await chrome.storage.local.set({ traces });
  const escaped = markedEvents.find((event) => event.type === "focus" && event.openDialog && event.target?.insideDialog === false);
  status.textContent = escaped
    ? `Found: focus left “${escaped.openDialog.name}” for “${escaped.target.name}”.`
    : "Marked. No open-dialog escape detected, but the trace is ready for review.";
  exportTest.disabled = !escaped;
});

const quote = (value) => JSON.stringify(value);

function compile(events) {
  const escaped = events.find((event) => event.type === "focus" && event.openDialog && event.target?.insideDialog === false);
  const steps = events
    .filter((event) => event.type === "click" || event.type === "key")
    .map((event) => {
      if (event.type === "click") {
        return `  await page.getByRole(${quote(event.target.role)}, { name: ${quote(event.target.name)} }).click();`;
      }
      return `  await page.keyboard.press(${quote(event.key)});`;
    });
  return [
    'import { test, expect } from "@playwright/test";',
    "",
    `test(${quote(`keyboard focus stays inside ${escaped.openDialog.name}`)}, async ({ page }) => {`,
    `  await page.goto(${quote(activeUrl)});`,
    ...steps,
    `  const boundary = page.getByRole("dialog", { name: ${quote(escaped.openDialog.name)} });`,
    "  await expect.poll(async () => boundary.evaluate((node) => node.contains(document.activeElement)),",
    '    { message: "Focus escaped the open dialog" },',
    "  ).toBe(true);",
    "});",
    "",
  ].join("\n");
}

function save(name, contents, type) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = Object.assign(document.createElement("a"), { href: url, download: name });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

exportTest.addEventListener("click", () => {
  if (markedEvents) save("replay-accessibility.spec.js", compile(markedEvents), "text/javascript");
});

download.addEventListener("click", async () => {
  const { traces = {} } = await chrome.storage.local.get({ traces: {} });
  const contents = JSON.stringify(
    { schemaVersion: 1, events: traces[activeTabId] || [], settings: { screenshots: "off", aiSharing: "off" } },
    null,
    2
  );
  save("replay-trace.json", contents, "application/json");
});
