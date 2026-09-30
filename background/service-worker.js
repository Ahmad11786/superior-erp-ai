// Service worker. Phase 1: initialise default settings and answer basic messages.
const DEFAULT_SETTINGS = {
  autoFill: true, autoSubmit: false, verifyIdentity: true, askBeforeSubmit: true,
  notifications: true, debugMode: false, logLevel: "INFO"
};

chrome.runtime.onInstalled.addListener(async () => {
  const { settings } = await chrome.storage.local.get("settings");
  await chrome.storage.local.set({ settings: Object.assign({}, DEFAULT_SETTINGS, settings || {}) });
  console.log("[SEA][INFO] Installed / updated. Settings initialised.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message) return false;
  if (message.type === "SEA_PING") {
    sendResponse({ ok: true, pong: true, time: Date.now() });
  } else if (message.type === "SEA_CONTENT_READY") {
    console.log("[SEA][INFO] Content script ready on", message.url);
  }
  return false;
});
