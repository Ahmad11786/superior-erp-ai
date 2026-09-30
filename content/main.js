// Content script entry point. Phase 1: detect ERP, answer status requests from the popup.
(function () {
  SEA.Logger.info("Content script loaded");
  if (SEA.ErpDetector.isErpHost()) SEA.Logger.info("ERP detected");

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message && message.type === SEA.MSG.GET_STATUS) {
      sendResponse({ ok: true, status: SEA.ErpDetector.getStatus() });
    }
    return false;
  });

  try {
    chrome.runtime.sendMessage({ type: SEA.MSG.CONTENT_READY, url: location.origin + location.pathname });
  } catch (e) {
    SEA.Logger.warn("Background not reachable", String(e));
  }
})();
