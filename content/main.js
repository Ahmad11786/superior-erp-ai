(function () {
    "use strict";

    SEA.Logger.info("Content script loaded");

    if (!SEA.ErpDetector.isErpHost()) {
        return;
    }

    SEA.Logger.info("ERP detected");

    let lastForm = null;
    let processing = false;

    const DEFAULT_SETTINGS = {
        autoFill: true,
        autoSubmit: false,
        verifyIdentity: true,
        askBeforeSubmit: true
    };

    async function getSettings() {
        const data = await chrome.storage.local.get("settings");

        return Object.assign(
            {},
            DEFAULT_SETTINGS,
            data.settings || {}
        );
    }

    async function getAnswers() {
        const data = await chrome.storage.local.get(
            "feedbackAnswers"
        );

        return data.feedbackAnswers || {};
    }

    function findFeedbackForm() {
        return document.querySelector(
            "form.js_surveyform"
        );
    }

    async function processForm() {
        if (processing) {
            return;
        }

        const form = findFeedbackForm();

        if (!form) {
            return;
        }

        if (form === lastForm) {
            return;
        }

        processing = true;
        lastForm = form;

        console.log(
            "[SEA][FORM] Feedback form detected"
        );

        try {
            const forms =
                window.SEAFormReader.scanForms();

            console.log(
                "[SEA][FORM] Form data:",
                forms
            );

            const settings = await getSettings();

            if (!settings.autoFill) {
                console.log(
                    "[SEA][INFO] Auto Fill is disabled."
                );
                return;
            }

            const answers = await getAnswers();

            if (!Object.keys(answers).length) {
                console.warn(
                    "[SEA][INFO] No feedback answers configured."
                );
                return;
            }

            console.log(
                "[SEA][STATE] Filling form..."
            );

            const fillResult =
                window.SEAFormFiller.fillFeedbackForm(
                    answers
                );

            console.log(
                "[SEA][STATE] Fill result:",
                fillResult
            );

            if (!fillResult.ok) {
                console.warn(
                    "[SEA][STATE] Form was not completely filled.",
                    fillResult.missing
                );
                return;
            }

            console.log(
                "[SEA][STATE] Validating..."
            );

            const validation =
                window.SEAFormFiller.validateForm();

            console.log(
                "[SEA][STATE] Validation:",
                validation
            );

            if (!validation.ok) {
                console.warn(
                    "[SEA][STATE] Validation failed.",
                    validation.missing
                );
                return;
            }

            console.log(
                "[SEA][STATE] Form ready."
            );

            if (!settings.autoSubmit) {
                console.log(
                    "[SEA][INFO] Auto Submit is disabled."
                );
                return;
            }

            if (settings.askBeforeSubmit) {
                console.log(
                    "[SEA][INFO] Ask Before Submit is enabled."
                );
                return;
            }

            console.log(
                "[SEA][STATE] Automatically submitting..."
            );

            window.SEAFormFiller.submitForm();

        } catch (error) {
            console.error(
                "[SEA][ERROR] Form processing failed:",
                error
            );
        } finally {
            processing = false;
        }
    }

    function startWatcher() {
        if (!document.documentElement) {
            return;
        }

        const observer = new MutationObserver(() => {
            processForm();
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        setInterval(() => {
            processForm();
        }, 1000);

        processForm();

        console.log(
            "[SEA][INFO] Dynamic form watcher active"
        );
    }

    chrome.runtime.onMessage.addListener(
        function (message, sender, sendResponse) {
            if (
                message &&
                message.type === SEA.MSG.GET_STATUS
            ) {
                sendResponse({
                    ok: true,
                    status: SEA.ErpDetector.getStatus()
                });
            }

            return false;
        }
    );

    try {
        chrome.runtime.sendMessage({
            type: SEA.MSG.CONTENT_READY,
            url: location.origin + location.pathname
        });
    } catch (e) {
        SEA.Logger.warn(
            "Background not reachable",
            String(e)
        );
    }

    startWatcher();
})();