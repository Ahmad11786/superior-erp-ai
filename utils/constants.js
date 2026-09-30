var SEA = (typeof SEA !== "undefined") ? SEA : {};

SEA.VERSION = "1.0.0";

SEA.ERP_HOST = "erp.superior.edu.pk";

SEA.MSG = {
    GET_STATUS: "SEA_GET_STATUS",
    PING: "SEA_PING",
    CONTENT_READY: "SEA_CONTENT_READY"
};

SEA.STATES = [
    "IDLE",
    "SCANNING",
    "FORM_DETECTED",
    "READING",
    "FILLING",
    "VALIDATING",
    "READY_TO_SUBMIT",
    "SUBMITTING",
    "WAITING_FOR_NEXT_FORM",
    "COMPLETED",
    "PAUSED",
    "STOPPED",
    "ERROR"
];

SEA.DEFAULT_SETTINGS = {
    autoFill: true,
    autoSubmit: false,
    askBeforeSubmit: true,
    debugMode: false
};