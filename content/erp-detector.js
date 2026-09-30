// Detects that the current page belongs to Superior ERP and whether the user appears logged in.
// NOTE: No ERP-specific selectors are invented here. The login check is a generic heuristic
// (a visible password field) and will be refined in superior-erp-adapter.js after real inspection.
var SEA = (typeof SEA !== "undefined") ? SEA : {};
SEA.ErpDetector = (function () {
  function isErpHost() {
    return location.hostname === SEA.ERP_HOST;
  }
  function hasVisiblePasswordField() {
    const fields = document.querySelectorAll('input[type="password"]');
    return Array.from(fields).some(f => f.offsetParent !== null);
  }
  function getStatus() {
    const onErp = isErpHost();
    return {
      onErp: onErp,
      pageState: !onErp ? "not-erp" : (hasVisiblePasswordField() ? "login-page" : "authenticated-or-unknown"),
      url: location.origin + location.pathname,
      title: document.title,
      formCount: document.querySelectorAll("form").length,
      version: SEA.VERSION
    };
  }
  return { isErpHost, getStatus };
})();
