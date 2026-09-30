var SEA = (typeof SEA !== "undefined") ? SEA : {};

SEA.Logger = {

    info: function (...args) {
        console.log("[SEA][INFO]", ...args);
    },

    warn: function (...args) {
        console.warn("[SEA][WARN]", ...args);
    },

    error: function (...args) {
        console.error("[SEA][ERROR]", ...args);
    },

    debug: function (...args) {
        console.debug("[SEA][DEBUG]", ...args);
    }

};