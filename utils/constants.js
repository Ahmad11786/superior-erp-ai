// Shared constants. Loaded before every other content script.
var SEA = (typeof SEA !== "undefined") ? SEA : {};
SEA.VERSION = "0.1.0";
SEA.ERP_HOST = "erp.superior.edu.pk";
SEA.MSG = { GET_STATUS: "SEA_GET_STATUS", PING: "SEA_PING", CONTENT_READY: "SEA_CONTENT_READY" };
SEA.STATES = ["IDLE","SCANNING","IDENTIFYING_STUDENT","VERIFYING_ASSIGNMENT","FORM_DETECTED","READING",
  "ANALYZING","WAITING_FOR_USER","FILLING","VALIDATING","READY_TO_SUBMIT","SUBMITTING",
  "WAITING_FOR_NEXT_FORM","COMPLETED","PAUSED","STOPPED","ERROR"];
SEA.DEFAULT_SETTINGS = {
  autoFill: true, autoSubmit: false, verifyIdentity: true, askBeforeSubmit: true,
  notifications: true, debugMode: false, logLevel: "INFO"
};
