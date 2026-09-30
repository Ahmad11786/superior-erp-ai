(function () {

    "use strict";


    function normalize(text) {

        return (text || "")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();

    }


    function findRatingRadio(
        row,
        rating
    ) {

        const radios =
            [
                ...row.querySelectorAll(
                    'input[type="radio"]'
                )
            ];


        const headers =
            [
                ...(
                    row
                        .closest("table")
                        ?.querySelectorAll(
                            "thead th"
                        ) || []
                )
            ];


        const wanted =
            String(rating)
                .trim();


        for (
            let i = 0;
            i < radios.length;
            i++
        ) {

            const header =
                String(
                    headers[i + 1]
                        ?.innerText || ""
                )
                .trim();


            if (
                header === wanted
            ) {

                return radios[i];

            }

        }


        return null;

    }


    function selectRadio(
        radio
    ) {

        if (
            !radio ||
            radio.disabled
        ) {

            return false;

        }


        radio.click();


        radio.dispatchEvent(
            new Event(
                "input",
                {
                    bubbles: true
                }
            )
        );


        radio.dispatchEvent(
            new Event(
                "change",
                {
                    bubbles: true
                }
            )
        );


        return radio.checked;

    }


    function fillFeedbackForm(
        answers
    ) {

        const form =
            document.querySelector(
                "form.js_surveyform"
            );


        if (!form) {

            return {

                ok: false,

                filled: 0,

                total: 0,

                missing: [
                    "Survey form not found"
                ]

            };

        }


        let total = 0;

        let filled = 0;

        const missing = [];


        const rows =
            [
                ...form.querySelectorAll(
                    ".js_question-wrapper tbody tr"
                )
            ];


        for (
            const row
            of rows
        ) {

            const question =
                (
                    row.querySelector("th")
                        ?.innerText || ""
                )
                .replace(/\s+/g, " ")
                .trim();


            if (!question) {

                continue;

            }


            total++;


            const normalizedQuestion =
                normalize(
                    question
                );


            let rating =
                undefined;


            for (
                const answerKey
                of Object.keys(
                    answers || {}
                )
            ) {

                if (
                    normalize(
                        answerKey
                    ) ===
                    normalizedQuestion
                ) {

                    rating =
                        answers[
                            answerKey
                        ];

                    break;

                }

            }


            if (
                rating === undefined ||
                rating === null
            ) {

                missing.push(
                    question
                );

                continue;

            }


            const radio =
                findRatingRadio(
                    row,
                    rating
                );


            if (!radio) {

                missing.push(
                    question +
                    " [rating " +
                    rating +
                    " not found]"
                );

                continue;

            }


            if (
                selectRadio(
                    radio
                )
            ) {

                filled++;

            } else {

                missing.push(
                    question +
                    " [selection failed]"
                );

            }

        }


        return {

            ok:
                total > 0 &&
                filled === total &&
                missing.length === 0,

            filled,

            total,

            missing

        };

    }


    function validateForm() {

        const form =
            document.querySelector(
                "form.js_surveyform"
            );


        if (!form) {

            return {

                ok: false,

                missing: [
                    "Survey form not found"
                ]

            };

        }


        const groups =
            new Map();


        const requiredRadios =
            [
                ...form.querySelectorAll(
                    'input[type="radio"][required]'
                )
            ];


        for (
            const radio
            of requiredRadios
        ) {

            if (
                !groups.has(
                    radio.name
                )
            ) {

                groups.set(
                    radio.name,
                    false
                );

            }


            if (
                radio.checked
            ) {

                groups.set(
                    radio.name,
                    true
                );

            }

        }


        const missing = [];


        for (
            const [
                name,
                checked
            ]
            of groups
        ) {

            if (!checked) {

                missing.push(
                    name
                );

            }

        }


        return {

            ok:
                missing.length === 0,

            missing

        };

    }


    function submitForm() {

        const form =
            document.querySelector(
                "form.js_surveyform"
            );


        if (!form) {

            return {

                ok: false,

                error:
                    "Survey form not found"

            };

        }


        const button =
            form.querySelector(
                'button[name="button_submit"]'
            ) ||
            form.querySelector(
                'input[name="button_submit"]'
            ) ||
            form.querySelector(
                'button[type="submit"]'
            );


        if (!button) {

            return {

                ok: false,

                error:
                    "Submit button not found"

            };

        }


        button.click();


        return {

            ok: true

        };

    }


    window.SEAFormFiller = {

        fillFeedbackForm,

        validateForm,

        submitForm

    };


    console.log(
        "[SEA][FORM FILLER] Loaded"
    );

})();