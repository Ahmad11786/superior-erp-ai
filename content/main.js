(function () {
    "use strict";

    console.log("[SEA][INFO] Content script loaded");

    if (!window.SEAERPDetector) {
        console.error("[SEA][ERROR] ERP detector not loaded");
        return;
    }

    if (!window.SEAFormReader) {
        console.error("[SEA][ERROR] Form reader not loaded");
        return;
    }

    if (!window.SEAFormFiller) {
        console.error("[SEA][ERROR] Form filler not loaded");
        return;
    }

    console.log("[SEA][INFO] All modules loaded");

    let lastForm = null;

    function findFeedbackForm() {
        return document.querySelector("form.js_surveyform");
    }

    function processForm() {
        const form = findFeedbackForm();

        if (!form) {
            return;
        }

        if (form === lastForm) {
            return;
        }
        lastForm = form;

        console.log("[SEA][FORM] Feedback form detected");

        const forms = window.SEAFormReader.scanForms();

        console.log("[SEA][FORM] Form data:", forms);
    }

    function testAutoFill() {
        const form = findFeedbackForm();

        if (!form) {
            console.log("[SEA][TEST] No feedback form found.");
            return false;
        }

        const result = window.SEAFormFiller.fillFeedbackForm(5);

        console.log("[SEA][TEST] Auto fill result:", result);

        return result;
    }

    window.SEA = {
        testAutoFill,
        scan: processForm
    };

    const observer = new MutationObserver(() => {
        processForm();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    processForm();

    console.log("[SEA][INFO] Test command ready");
    console.log("[SEA][INFO] Dynamic form watcher active");
})();