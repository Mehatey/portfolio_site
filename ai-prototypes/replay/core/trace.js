export const NAVIGATION_KEYS = new Set(["Tab", "Enter", " ", "Escape", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

export function sanitizeKey(key, shiftKey = false) {
  if (!NAVIGATION_KEYS.has(key)) return null;
  return key === "Tab" && shiftKey ? "Shift+Tab" : key === " " ? "Space" : key;
}

export function createTrace(origin = "local fixture") {
  return {
    schemaVersion: 1,
    id: globalThis.crypto?.randomUUID?.() || `trace-${Date.now()}`,
    origin,
    startedAt: new Date().toISOString(),
    settings: { axCapture: true, screenshots: "off", aiSharing: "off" },
    events: [],
    attachments: [],
  };
}

export function appendEvent(trace, event) {
  const now = performance.now();
  trace._startedAt ||= now;
  trace.events.push({
    id: `e${String(trace.events.length + 1).padStart(2, "0")}`,
    t: Math.max(0, Math.round(now - trace._startedAt)),
    ...event,
  });
  return trace.events.at(-1);
}

export function targetLabel(target) {
  if (!target) return "page";
  return target.name || (target.id ? `#${target.id}` : target.role || target.tag || "element");
}

export function buildFinding(trace) {
  const escaped = trace.events.find((event) => event.type === "focus" && event.dialogOpen && event.target && !event.target.insideDialog);
  const lost = trace.events.find((event) => event.type === "focus" && ["body", "document"].includes(event.target?.tag));
  const marker = [...trace.events].reverse().find((event) => event.type === "marker");
  const evidence = [escaped || lost, marker].filter(Boolean);
  if (!evidence.length) return null;

  return {
    id: "finding-focus-containment",
    source: "rule",
    category: escaped ? "keyboard-trap" : "focus-lost",
    title: escaped ? "Focus left the open dialog" : "Keyboard focus disappeared",
    detail: escaped
      ? `${targetLabel(escaped.from)} moved to ${targetLabel(escaped.target)} while the dialog remained open.`
      : "The active element returned to the page instead of a usable control.",
    evidenceEventIds: evidence.map((event) => event.id),
    status: "needs-confirmation",
  };
}

export function serializeTrace(trace) {
  const { _startedAt, ...safeTrace } = trace;
  return JSON.stringify(safeTrace, null, 2);
}
