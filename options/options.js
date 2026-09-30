const KEYS = ["autoFill", "autoSubmit", "verifyIdentity", "askBeforeSubmit", "notifications", "debugMode"];
const DEFAULTS = { autoFill: true, autoSubmit: false, verifyIdentity: true, askBeforeSubmit: true, notifications: true, debugMode: false };

async function load() {
  const { settings } = await chrome.storage.local.get("settings");
  const s = Object.assign({}, DEFAULTS, settings || {});
  KEYS.forEach(k => { document.getElementById(k).checked = !!s[k]; });
}
document.getElementById("save").onclick = async () => {
  const { settings } = await chrome.storage.local.get("settings");
  const s = Object.assign({}, DEFAULTS, settings || {});
  KEYS.forEach(k => { s[k] = document.getElementById(k).checked; });
  await chrome.storage.local.set({ settings: s });
  document.getElementById("msg").textContent = "Saved.";
};
load();
