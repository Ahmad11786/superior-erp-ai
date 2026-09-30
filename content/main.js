(function () {
    "use strict";

    console.log("[SEA][INFO] Content script loaded");

    if (!SEA.ErpDetector.isErpHost()) {
        console.log("[SEA][INFO] Not an ERP page");
        return;
    }

    console.log("[SEA][INFO] ERP detected");

    let lastForm = null;
    let processing = false;
    let watcherStarted = false;

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

    function modulesReady() {
        if (!window.SEAFormReader) {
            console.log(
                "[SEA][WAIT] Form reader is not loaded yet."
            );

            return false;
        }

        if (typeof window.SEAFormReader.scanForms !== "function") {
            console.log(
                "[SEA][WAIT] Form reader scanForms is not ready yet."
            );

            return false;
        }

        if (!window.SEAFormFiller) {
            console.log(
                "[SEA][WAIT] Form filler is not loaded yet."
            );

            return false;
        }

        if (
            typeof window.SEAFormFiller.fillFeedbackForm !==
            "function"
        ) {
            console.log(
                "[SEA][WAIT] Form filler is not ready yet."
            );

            return false;
        }

        return true;
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

        if (!modulesReady()) {
            return;
        }

        processing = true;

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

            console.log(
                "[SEA][SETTINGS]",
                settings
            );

            if (!settings.autoFill) {
                console.log(
                    "[SEA][INFO] Auto Fill is disabled."
                );

                lastForm = form;
                return;
            }

            const answers = await getAnswers();

            if (!Object.keys(answers).length) {
                console.warn(
                    "[SEA][INFO] No feedback answers configured."
                );

                lastForm = form;
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

            if (!fillResult || !fillResult.ok) {
                console.warn(
                    "[SEA][STATE] Form was not completely filled.",
                    fillResult
                );

                lastForm = form;
                return;
            }

            console.log(
                "[SEA][STATE] Form filled successfully."
            );

            if (
                typeof window.SEAFormFiller.validateForm ===
                "function"
            ) {
                console.log(
                    "[SEA][STATE] Validating..."
                );

                const validation =
                    window.SEAFormFiller.validateForm();

                console.log(
                    "[SEA][STATE] Validation:",
                    validation
                );

                if (!validation || !validation.ok) {
                    console.warn(
                        "[SEA][STATE] Validation failed.",
                        validation
                    );

                    lastForm = form;
                    return;
                }

                console.log(
                    "[SEA][STATE] Form validation successful."
                );
            }

            if (!settings.autoSubmit) {
                console.log(
                    "[SEA][INFO] Auto Submit is disabled."
                );

                lastForm = form;
                return;
            }

            if (settings.askBeforeSubmit) {
                console.log(
                    "[SEA][INFO] Ask Before Submit is enabled."
                );

                lastForm = form;
                return;
            }

            if (
                typeof window.SEAFormFiller.submitForm !==
                "function"
            ) {
                console.error(
                    "[SEA][ERROR] submitForm function not found."
                );

                lastForm = form;
                return;
            }

            console.log(
                "[SEA][STATE] Automatically submitting..."
            );

            const submitResult =
                window.SEAFormFiller.submitForm();

            console.log(
                "[SEA][STATE] Submit result:",
                submitResult
            );

            lastForm = form;

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
        if (watcherStarted) {
            return;
        }

        watcherStarted = true;

        console.log(
            "[SEA][INFO] Starting feedback form watcher..."
        );

        const observer =
            new MutationObserver(function () {
                processForm();
            });

        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        processForm();

        console.log(
            "[SEA][INFO] Dynamic form watcher active"
        );
    }

    function waitForModules() {
        let attempts = 0;

        const interval = setInterval(function () {
            attempts++;

            if (modulesReady()) {
                clearInterval(interval);

                console.log(
                    "[SEA][INFO] All form modules are ready."
                );

                startWatcher();

                return;
            }

            if (attempts >= 100) {
                clearInterval(interval);

                console.error(
                    "[SEA][ERROR] Form modules did not load."
                );
            }

        }, 100);
    }

    window.SEA = window.SEA || {};

    window.SEA.scan = processForm;

    window.SEA.getStatus = function () {
        return {
            erp: true,
            formDetected: !!findFeedbackForm(),
            readerReady:
                !!window.SEAFormReader &&
                typeof window.SEAFormReader.scanForms ===
                    "function",
            fillerReady:
                !!window.SEAFormFiller &&
                typeof window.SEAFormFiller.fillFeedbackForm ===
                    "function"
        };
    };

    waitForModules();

    console.log(
        "[SEA][INFO] Main controller initialized."
    );

})();