(function () {

    "use strict";


    SEA.Logger.info(
        "Superior ERP AI started."
    );


    if (
        !SEA.ErpDetector.isErpHost()
    ) {

        return;

    }


    /*
     * Explicit answer rules.
     *
     * These are the two questions you already
     * confirmed from the actual ERP form.
     */
    const ANSWERS = {

        "The teacher is kind, respectful, and easy to approach.": 5,

        "The teacher actively encouraged student participation during class.": 5

    };


    let processing = false;

    let navigationBusy = false;

    let lastFormSignature = "";


    async function getSettings() {

        try {

            const data =
                await chrome.storage.local.get(
                    "settings"
                );


            return Object.assign(
                {},
                SEA.DEFAULT_SETTINGS,
                data.settings || {}
            );

        } catch (error) {

            SEA.Logger.warn(
                "Settings unavailable. Using defaults."
            );


            return {
                ...SEA.DEFAULT_SETTINGS
            };

        }

    }


    function wait(ms) {

        return new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    ms
                )
        );

    }


    function getFormSignature(
        form
    ) {

        const questions =
            [
                ...form.querySelectorAll(
                    ".js_question-wrapper tbody tr"
                )
            ]
            .map(
                row =>
                    (
                        row
                            .querySelector("th")
                            ?.innerText || ""
                    )
                    .replace(/\s+/g, " ")
                    .trim()
            )
            .join("|");


        return [

            location.href,

            form.action || "",

            form.name || "",

            questions

        ].join("::");

    }


    async function processSurvey(
        form
    ) {

        if (processing) {

            return;

        }


        const signature =
            getFormSignature(
                form
            );


        if (
            signature ===
            lastFormSignature
        ) {

            return;

        }


        processing = true;


        SEA.Logger.info(
            "Feedback survey detected."
        );


        try {

            const survey =
                SEAFormReader
                    .scanSurveyForm();


            if (
                !survey ||
                !survey.questionCount
            ) {

                SEA.Logger.warn(
                    "Could not read survey."
                );

                return;

            }


            console.log(
                "[SEA][FORM] Survey:",
                survey
            );


            const settings =
                await getSettings();


            if (
                !settings.enabled
            ) {

                SEA.Logger.info(
                    "Assistant is disabled."
                );

                lastFormSignature =
                    signature;

                return;

            }


            if (
                !settings.autoFill
            ) {

                SEA.Logger.info(
                    "Auto Fill is disabled."
                );

                lastFormSignature =
                    signature;

                return;

            }


            SEA.Logger.info(
                "Using confirmed answer rules."
            );


            const result =
                SEAFormFiller
                    .fillFeedbackForm(
                        ANSWERS
                    );


            console.log(
                "[SEA][FORM] Fill result:",
                result
            );


            if (!result.ok) {

                SEA.Logger.warn(
                    "Survey was not completely filled."
                );


                console.warn(
                    "[SEA][FORM] Missing:",
                    result.missing
                );


                lastFormSignature =
                    signature;

                return;

            }


            SEA.Logger.info(
                "All configured questions filled."
            );


            const validation =
                SEAFormFiller
                    .validateForm();


            console.log(
                "[SEA][FORM] Validation:",
                validation
            );


            if (!validation.ok) {

                SEA.Logger.warn(
                    "Required fields are missing."
                );


                console.warn(
                    "[SEA][FORM] Missing:",
                    validation.missing
                );


                lastFormSignature =
                    signature;

                return;

            }


            SEA.Logger.info(
                "Form validation successful."
            );


            lastFormSignature =
                signature;


            /*
             * Safe default:
             * fill + validate, but don't submit.
             */

            if (
                !settings.autoSubmit
            ) {

                SEA.Logger.info(
                    "Auto Submit is OFF."
                );


                SEA.Logger.info(
                    "Form is ready for manual review."
                );


                return;

            }


            if (
                settings.askBeforeSubmit
            ) {

                SEA.Logger.info(
                    "Ask-before-submit is enabled."
                );


                return;

            }


            SEA.Logger.info(
                "Submitting survey..."
            );


            const submitResult =
                SEAFormFiller
                    .submitForm();


            console.log(
                "[SEA][FORM] Submit:",
                submitResult
            );


            await wait(
                settings.delayMs
            );


        } catch (error) {

            SEA.Logger.error(
                "Survey processing failed:",
                error
            );

        } finally {

            processing = false;

        }

    }


    function processFeedbackList() {

        if (
            processing ||
            navigationBusy
        ) {

            return;

        }


        const candidate =
            SEAListScanner
                .findPending();


        if (!candidate) {

            return;

        }


        navigationBusy =
            true;


        SEA.Logger.info(
            "Pending feedback found."
        );


        console.log(
            "[SEA][LIST] Candidate:",
            {
                type:
                    candidate.type,

                href:
                    candidate.href,

                text:
                    candidate.text
            }
        );


        try {

            SEAListScanner
                .openPending(
                    candidate
                );


        } catch (error) {

            SEA.Logger.error(
                "Could not open feedback:",
                error
            );


            navigationBusy =
                false;

        }

    }


    function scanPage() {

        const form =
            SEA.ErpDetector
                .getSurveyForm();


        if (form) {

            navigationBusy =
                false;


            processSurvey(
                form
            );


            return;

        }


        processFeedbackList();

    }


    function startWatcher() {

        if (!document.body) {

            setTimeout(
                startWatcher,
                300
            );

            return;

        }


        const observer =
            new MutationObserver(
                function () {

                    scanPage();

                }
            );


        observer.observe(
            document.body,
            {

                childList:
                    true,

                subtree:
                    true

            }
        );


        scanPage();


        SEA.Logger.info(
            "Automatic feedback watcher active."
        );

    }


    window.SEA =
        window.SEA || {};


    window.SEA.status =
        function () {

            return {

                url:
                    location.href,

                erp:
                    SEA.ErpDetector
                        .isErpHost(),

                survey:
                    SEA.ErpDetector
                        .isSurveyPage(),

                listScanner:
                    !!window.SEAListScanner,

                formReader:
                    !!window.SEAFormReader,

                formFiller:
                    !!window.SEAFormFiller,

                processing,

                navigationBusy

            };

        };


    window.SEA.scan =
        scanPage;


    startWatcher();

})();