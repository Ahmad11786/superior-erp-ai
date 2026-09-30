(function () {

    "use strict";

    function normalize(text) {
        return (text || "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    }

    function findRatingRadio(row, rating) {

        const radios =
            [...row.querySelectorAll(
                'input[type="radio"]'
            )];

        const headers =
            row
                .closest("table")
                ?.querySelectorAll(
                    "thead th"
                );

        if (!headers) {
            return null;
        }

        for (
            let i = 0;
            i < radios.length;
            i++
        ) {

            const headerText =
                (
                    headers[i + 1]
                    ?.innerText || ""
                ).trim();

            if (
                headerText === String(rating)
            ) {
                return radios[i];
            }
        }

        return null;
    }

    function setRadio(radio) {

        if (!radio || radio.disabled) {
            return false;
        }

        radio.checked = true;

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

        return true;
    }

    function fillFeedbackForm(answers) {

        const form =
            document.querySelector(
                "form.js_surveyform"
            );

        if (!form) {
            return {
                ok: false,
                filled: 0,
                missing: ["No survey form found"]
            };
        }

        let filled = 0;
        let total = 0;

        const missing = [];

        const rows =
            [
                ...form.querySelectorAll(
                    ".js_question-wrapper tbody tr"
                )
            ];

        for (const row of rows) {

            const questionCell =
                row.querySelector("th");

            const question =
                (
                    questionCell?.innerText || ""
                )
                .replace(/\s+/g, " ")
                .trim();

            if (!question) {
                continue;
            }

            total++;

            const key =
                normalize(question);

            let rating = null;

            for (const answerKey in answers) {

                if (
                    normalize(answerKey) === key
                ) {
                    rating =
                        answers[answerKey];
                    break;
                }
            }

            if (
                rating === null ||
                rating === undefined
            ) {
                missing.push(question);
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

            if (setRadio(radio)) {
                filled++;
            }
        }

        return {
            ok:
                total > 0 &&
                missing.length === 0 &&
                filled === total,

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

        const requiredGroups =
            new Map();

        const radios =
            [
                ...form.querySelectorAll(
                    'input[type="radio"][required]'
                )
            ];

        for (const radio of radios) {

            if (!requiredGroups.has(radio.name)) {
                requiredGroups.set(
                    radio.name,
                    false
                );
            }

            if (radio.checked) {
                requiredGroups.set(
                    radio.name,
                    true
                );
            }
        }

        const missing = [];

        for (
            const [name, checked]
            of requiredGroups
        ) {
            if (!checked) {
                missing.push(name);
            }
        }

        return {
            ok: missing.length === 0,
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
                error: "Survey form not found"
            };
        }

        const submitButton =
            form.querySelector(
                'button[name="button_submit"]'
            ) ||
            form.querySelector(
                'input[name="button_submit"]'
            ) ||
            form.querySelector(
                'button[type="submit"]'
            );

        if (!submitButton) {
            return {
                ok: false,
                error: "Submit button not found"
            };
        }

        submitButton.click();

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