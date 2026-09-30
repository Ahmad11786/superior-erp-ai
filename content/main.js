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

    function testAutoFill() {
        const result = window.SEAFormFiller.fillFeedbackForm(5);

        console.log("[SEA][TEST] Auto fill result:", result);
    }

    window.SEA = {
        testAutoFill
    };

    console.log("[SEA][INFO] Test command ready");
})();