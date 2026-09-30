(function () {

    "use strict";

    SEA.Logger.info(
        "Content script loaded"
    );

    if (
        !SEA.ErpDetector.isErpHost()
    ) {
        SEA.Logger.warn(
            "Not a Superior ERP page."
        );
        return;
    }

    SEA.Logger.info(
        "Superior ERP detected."
    );

    let currentForm = null;
    let processing = false;

    const DEFAULT_SETTINGS = {
        autoFill: true,
        autoSubmit: false,
        askBeforeSubmit: true,
        debugMode: false
    };

    /*
     * Confirmed answers for the current test form.
     *
     * Rating:
     * 5 = highest rating
     */
    const CONFIRMED_ANSWERS = {

        "The teacher is kind, respectful, and easy to approach.": 5,

        "The teacher actively encouraged student participation during class.": 5

    };


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

        if (
            typeof window.SEAFormFiller.validateForm !==
                "function"
        ) {
            return false;
        }

        return true;
    }


    async function getSettings() {

        /*
         * Extension storage is used only for settings.
         * The actual test answers are stored above.
         */

        try {

            const data =
                await chrome.storage.local.get(
                    "settings"
                );

            return Object.assign(
                {},
                DEFAULT_SETTINGS,
                data.settings || {}
            );

        } catch (error) {

            SEA.Logger.warn(
                "Could not read settings. Using defaults."
            );

            return {
                ...DEFAULT_SETTINGS
            };

        }

    }


    function processForm() {

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
                "Form modules are not ready yet."
            );

            return;
        }

        processing = true;

        SEA.Logger.info(
            "Feedback form detected."
        );

        try {

            /*
             * Read the actual ERP survey.
             */

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


            /*
             * Show detected questions.
             */

            console.log(
                "[SEA][FORM] Questions:"
            );

            survey.questions.forEach(
                function (question) {

                    question.rows.forEach(
                        function (row) {

                            console.log(
                                "Question:",
                                row.question
                            );

                        }
                    );

                }
            );


            /*
             * Get settings.
             */

            getSettings().then(
                function (settings) {

                    if (!settings.autoFill) {

                        SEA.Logger.info(
                            "Auto Fill is disabled."
                        );

                        currentForm = form;

                        processing = false;

                        return;
                    }


                    /*
                     * Use confirmed answers.
                     */

                    const answers =
                        CONFIRMED_ANSWERS;


                    if (
                        !Object.keys(
                            answers
                        ).length
                    ) {

                        SEA.Logger.warn(
                            "No confirmed answers found."
                        );

                        currentForm = form;

                        processing = false;

                        return;
                    }


                    SEA.Logger.info(
                        "Confirmed answers found."
                    );


                    /*
                     * Fill the form.
                     */

                    SEA.Logger.info(
                        "Filling feedback form..."
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


                    /*
                     * Stop if some question
                     * does not have a confirmed answer.
                     */

                    if (!result.ok) {

                        SEA.Logger.warn(
                            "Form was not completely filled."
                        );

                        console.warn(
                            "[SEA][FORM] Missing:",
                            result.missing
                        );

                        currentForm = form;

                        processing = false;

                        return;
                    }


                    SEA.Logger.info(
                        "All confirmed questions filled."
                    );


                    /*
                     * Validate required fields.
                     */

                    const validation =
                        window.SEAFormFiller
                            .validateForm();


                    console.log(
                        "[SEA][FORM] Validation:",
                        validation
                    );


                    if (!validation.ok) {

                        SEA.Logger.warn(
                            "Form validation failed."
                        );

                        console.warn(
                            "[SEA][FORM] Missing required fields:",
                            validation.missing
                        );

                        currentForm = form;

                        processing = false;

                        return;
                    }


                    SEA.Logger.info(
                        "Form validation successful."
                    );


                    /*
                     * Do not submit automatically
                     * unless explicitly enabled.
                     */

                    if (
                        !settings.autoSubmit
                    ) {

                        SEA.Logger.info(
                            "Auto Submit is OFF."
                        );

                        SEA.Logger.info(
                            "Form is ready for manual submission."
                        );

                        currentForm = form;

                        processing = false;

                        return;
                    }


                    /*
                     * Ask-before-submit protection.
                     */

                    if (
                        settings.askBeforeSubmit
                    ) {

                        SEA.Logger.info(
                            "Waiting for submission confirmation."
                        );

                        currentForm = form;

                        processing = false;

                        return;
                    }


                    /*
                     * Submit.
                     */

                    SEA.Logger.info(
                        "Submitting feedback form..."
                    );

                    const submitResult =
                        window.SEAFormFiller
                            .submitForm();


                    console.log(
                        "[SEA][FORM] Submit result:",
                        submitResult
                    );


                    currentForm = form;

                    setTimeout(
                        function () {

                            processing = false;

                            SEA.Logger.info(
                                "Ready for next feedback form."
                            );

                        },
                        1500
                    );

                }
            );

        } catch (error) {

            SEA.Logger.error(
                "Form processing failed:",
                error
            );

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
            "Dynamic feedback form watcher active."
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

                        clearInterval(
                            timer
                        );


                        SEA.Logger.info(
                            "All form modules ready."
                        );


                        startWatcher();


                        return;

                    }


                    if (
                        attempts >= 100
                    ) {

                        clearInterval(
                            timer
                        );


                        SEA.Logger.error(
                            "Form modules failed to load."
                        );

                    }

                },
                100
            );

    }


    /*
     * Debug/status function.
     */

    window.SEA =
        window.SEA || {};


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

                processing:

                    processing,

                confirmedAnswers:

                    Object.keys(
                        CONFIRMED_ANSWERS
                    ).length

            };

        };


    /*
     * Manually scan the current form.
     */

    window.SEA.scan =
        processForm;


    waitForModules();

})();

