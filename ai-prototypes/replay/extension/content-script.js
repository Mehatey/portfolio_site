(() => {
  if (window.__replayRecorderInstalled) return;
  window.__replayRecorderInstalled = true;
  const allowed = new Set(["Tab", "Enter", " ", "Escape", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
  const startedAt = performance.now();
  const send = (event) => chrome.runtime.sendMessage({ source: "replay-content", event: { t: Math.round(performance.now() - startedAt), ...event } });
  const name = (element) =>
    element.getAttribute("aria-label") ||
    element.textContent?.replace(/\s+/g, " ").trim().slice(0, 80) ||
    element.id ||
    element.tagName.toLowerCase();
  const role = (element) =>
    element.getAttribute("role") ||
    { BUTTON: "button", A: "link", INPUT: "textbox", SELECT: "combobox" }[element.tagName] ||
    element.tagName.toLowerCase();
  const visibleDialog = () =>
    [...document.querySelectorAll('[role="dialog"][aria-modal="true"]')].find((element) => !element.hidden && element.getClientRects().length);
  const dialogName = (element) => {
    if (!element) return null;
    const labelledBy = element.getAttribute("aria-labelledby");
    return element.getAttribute("aria-label") || (labelledBy && document.getElementById(labelledBy)?.textContent.trim()) || "Dialog";
  };

  document.addEventListener(
    "keydown",
    (event) => {
      if (!allowed.has(event.key)) return;
      send({ type: "key", key: event.key === " " ? "Space" : event.key === "Tab" && event.shiftKey ? "Shift+Tab" : event.key });
    },
    true
  );

  document.addEventListener(
    "focusin",
    (event) => {
      const dialog = visibleDialog();
      send({
        type: "focus",
        target: {
          role: role(event.target),
          name: name(event.target),
          id: event.target.id || null,
          insideDialog: dialog ? dialog.contains(event.target) : null,
        },
        openDialog: dialog ? { role: "dialog", name: dialogName(dialog) } : null,
      });
    },
    true
  );

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target.closest("button, a, input, select, textarea");
      if (target) send({ type: "click", target: { role: role(target), name: name(target), id: target.id || null } });
    },
    true
  );

  send({ type: "route", path: `${location.pathname}${location.search}` });
})();
