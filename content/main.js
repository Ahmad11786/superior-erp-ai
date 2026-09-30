(function () {

    "use strict";

    SEA.Logger.info(
        "Content script loaded"
    );

    if (
        !SEA.ErpDetector.isErpHost()
    ) {
        return;
    }

    SEA.Logger.info(
        "ERP detected"
    );

    let currentForm = null;
    let processing = false;

    const DEFAULT_SETTINGS = {
        autoFill: true,
        autoSubmit: false,
        askBeforeSubmit: true,
        debugMode: false
    };

    function sleep(ms) {
        return new Promise(
            resolve => setTimeout(resolve, ms)
        );
    }

    async function getSettings() {

        const data =
            await chrome.storage.local.get(
                "settings"
            );

        return Object.assign(
            {},
            DEFAULT_SETTINGS,
            data.settings || {}
        );
    }

    async function getAnswers() {

        const data =
            await chrome.storage.local.get(
                "feedbackAnswers"
            );

        return data.feedbackAnswers || {};
    }

    function getForm() {

        return document.querySelector(
            "form.js_surveyform"
        );
    }

    function modulesReady() {

        if (
            !window.SEAFormReader ||
            typeof window.SEAFormReader.scanSurveyForm !==
                "function"
        ) {
            return false;
        }

        if (
            !window.SEAFormFiller ||
            typeof window.SEAFormFiller.fillFeedbackForm !==
                "function"
        ) {
            return false;
        }

        return true;
    }

    async function processForm() {

        if (processing) {
            return;
        }

        const form = getForm();

        if (!form) {
            return;
        }

        if (form === currentForm) {
            return;
        }

        if (!modulesReady()) {

            SEA.Logger.warn(
                "Waiting for form modules..."
            );

            return;
        }

        processing = true;

        SEA.Logger.info(
            "Feedback form detected"
        );

        try {

            const survey =
                window.SEAFormReader
                    .scanSurveyForm();

            if (!survey) {
                SEA.Logger.warn(
                    "Unable to read survey."
                );

                return;
            }

            console.log(
                "[SEA][FORM] Survey:",
                survey
            );

            const settings =
                await getSettings();

            if (!settings.autoFill) {

                SEA.Logger.info(
                    "Auto Fill is disabled."
                );

                currentForm = form;

                return;
            }

            const answers =
                await getAnswers();

            if (
                !Object.keys(answers).length
            ) {

                SEA.Logger.warn(
                    "No configured answers found."
                );

                currentForm = form;

                return;
            }

            SEA.Logger.info(
                "Filling configured answers..."
            );

            const result =
                window.SEAFormFiller
                    .fillFeedbackForm(
                        answers
                    );

            console.log(
                "[SEA][FORM] Fill result:",
                result
            );

            if (!result.ok) {

                SEA.Logger.warn(
                    "Form was not completely filled."
                );

                console.warn(
                    "[SEA][FORM] Missing:",
                    result.missing
                );

                currentForm = form;

                return;
            }

            SEA.Logger.info(
                "All configured questions filled."
            );

            const validation =
                window.SEAFormFiller
                    .validateForm();

            console.log(
                "[SEA][FORM] Validation:",
                validation
            );

            if (!validation.ok) {

                SEA.Logger.warn(
                    "Validation failed."
                );

                currentForm = form;

                return;
            }

            SEA.Logger.info(
                "Form validation successful."
            );

            if (!settings.autoSubmit) {

                SEA.Logger.info(
                    "Auto Submit is OFF."
                );

                currentForm = form;

                return;
            }

            if (settings.askBeforeSubmit) {

                SEA.Logger.info(
                    "Waiting for submission confirmation."
                );

                currentForm = form;

                return;
            }

            SEA.Logger.info(
                "Submitting form..."
            );

            const submitResult =
                window.SEAFormFiller
                    .submitForm();

            console.log(
                "[SEA][FORM] Submit result:",
                submitResult
            );

            currentForm = form;

            await sleep(1500);

        } catch (error) {

            SEA.Logger.error(
                "Form processing failed:",
                error
            );

        } finally {

            processing = false;
        }
    }

    function startWatcher() {

        if (!document.body) {

            setTimeout(
                startWatcher,
                250
            );

            return;
        }

        const observer =
            new MutationObserver(
                function () {
                    processForm();
                }
            );

        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );

        processForm();

        SEA.Logger.info(
            "Dynamic form watcher active."
        );
    }

    function waitForModules() {

        let attempts = 0;

        const timer =
            setInterval(
                function () {

                    attempts++;

                    if (
                        modulesReady()
                    ) {

                        clearInterval(timer);

                        SEA.Logger.info(
                            "All form modules ready."
                        );

                        startWatcher();

                        return;
                    }

                    if (
                        attempts >= 100
                    ) {

                        clearInterval(timer);

                        SEA.Logger.error(
                            "Form modules failed to load."
                        );
                    }

                },
                100
            );
    }

    window.SEA = window.SEA || {};

    window.SEA.scan =
        processForm;

    window.SEA.status =
        function () {

            return {
                erp:
                    SEA.ErpDetector
                        .isErpHost(),

                form:
                    !!getForm(),

                reader:
                    !!window.SEAFormReader,

                filler:
                    !!window.SEAFormFiller,

                processing
            };
        };

    waitForModules();

})();