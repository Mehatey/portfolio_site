chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

let writeQueue = Promise.resolve();

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.source !== "replay-content" || !sender.tab?.id) return;
  writeQueue = writeQueue.then(async () => {
    const { traces } = await chrome.storage.local.get({ traces: {} });
    const tabTrace = traces[sender.tab.id] || [];
    tabTrace.push(message.event);
    traces[sender.tab.id] = tabTrace.slice(-500);
    await chrome.storage.local.set({ traces });
  });
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "replay-panel") return;
  port.onMessage.addListener(async (message) => {
    if (message.type !== "start") return;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    await chrome.storage.local.get({ traces: {} }).then(({ traces }) => {
      traces[tab.id] = [];
      return chrome.storage.local.set({ traces });
    });
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content-script.js"] });
    port.postMessage({ type: "started", tabId: tab.id, url: tab.url });
  });
});
