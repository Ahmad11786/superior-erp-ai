const $ = (id) => document.getElementById(id);

async function init() {
  $("version").textContent = chrome.runtime.getManifest().version;

  const { settings } = await chrome.storage.local.get("settings");
  $("autoFill").textContent = settings && settings.autoFill ? "ON" : "OFF";
  $("autoSubmit").textContent = settings && settings.autoSubmit ? "ON" : "OFF";

  $("openOptions").onclick = () => chrome.runtime.openOptionsPage();
  $("pingBtn").onclick = async () => {
    try {
      const r = await chrome.runtime.sendMessage({ type: "SEA_PING" });
      $("pingResult").textContent = r && r.pong ? "Background OK" : "No reply";
    } catch (e) { $("pingResult").textContent = "Error: " + e.message; }
  };

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url || !tab.url.startsWith("https://erp.superior.edu.pk/")) {
    $("erpStatus").textContent = "Not on Superior ERP";
    return;
  }
  try {
    const res = await chrome.tabs.sendMessage(tab.id, { type: "SEA_GET_STATUS" });
    const s = res.status;
    $("dot").className = "dot " + (s.pageState === "login-page" ? "warn" : "on");
    $("erpStatus").textContent = s.pageState === "login-page"
      ? "ERP detected — please log in" : "ERP detected";
    $("pageInfo").textContent = "Forms on page: " + s.formCount;
  } catch (e) {
    $("erpStatus").textContent = "ERP tab found, reload the page";
  }
}
init();
