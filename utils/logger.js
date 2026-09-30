// Simple levelled logger. Never log passwords, tokens or personal data.
var SEA = (typeof SEA !== "undefined") ? SEA : {};
SEA.Logger = (function () {
  const LEVELS = { DEBUG: 0, INFO: 1, WARNING: 2, ERROR: 3 };
  let current = LEVELS.INFO;
  function log(level, msg, data) {
    if (LEVELS[level] < current) return;
    const line = "[SEA][" + level + "] " + msg;
    if (level === "ERROR") console.error(line, data !== undefined ? data : "");
    else if (level === "WARNING") console.warn(line, data !== undefined ? data : "");
    else console.log(line, data !== undefined ? data : "");
  }
  return {
    setLevel: function (l) { if (LEVELS[l] !== undefined) current = LEVELS[l]; },
    debug: (m, d) => log("DEBUG", m, d),
    info: (m, d) => log("INFO", m, d),
    warn: (m, d) => log("WARNING", m, d),
    error: (m, d) => log("ERROR", m, d)
  };
})();
