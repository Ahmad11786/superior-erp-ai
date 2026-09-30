(function () {
    "use strict";

    function getQuestionText(question) {
        const title = question.querySelector("h1, h2, h3, h4, h5, h6");
        return title ? title.innerText.trim() : "";
    }

    function getRows(question) {
        return [...question.querySelectorAll("tbody tr")];
    }

    function getScoreForRadio(question, radio) {
        const row = radio.closest("tr");

        if (!row) {
            return null;
        }

        const cells = [...row.children];

        const cell = radio.closest("td");

        if (!cell) {
            return null;
        }

        const index = cells.indexOf(cell);

        if (index < 0) {
            return null;
        }

        const headers = [...question.querySelectorAll("thead th")];

        if (!headers[index]) {
            return null;
        }

        const score = headers[index].innerText.trim();

        return /^\d+$/.test(score) ? Number(score) : null;
    }

    function fillQuestion(question, score) {
        const rows = getRows(question);

        let filled = 0;
        let total = 0;

        for (const row of rows) {
            const radios = [...row.querySelectorAll('input[type="radio"]')];

            if (!radios.length) {
                continue;
            }

            total++;

            const radio = radios.find(
                input => getScoreForRadio(question, input) === Number(score)
            );

            if (!radio) {
                continue;
            }

            radio.checked = true;

            radio.dispatchEvent(
                new Event("input", { bubbles: true })
            );

            radio.dispatchEvent(
                new Event("change", { bubbles: true })
            );

            filled++;
        }

        return {
            filled,
            total,
            ok: total > 0 && filled === total
        };
    }

    function fillFeedbackForm(answers) {
        const form = document.querySelector("form.js_surveyform");

        if (!form) {
            console.log("[SEA][FORM FILLER] No feedback form found.");
            return {
                ok: false,
                filled: 0,
                total: 0,
                missing: ["FORM_NOT_FOUND"]
            };
        }

        const questions = [
            ...form.querySelectorAll(".js_question-wrapper")
        ];

        let filled = 0;
        let total = 0;
        const missing = [];

        questions.forEach((question, index) => {
            const text = getQuestionText(question);
            const key = text.toLowerCase().trim();

            const score =
                answers?.[key] ??
                answers?.[text] ??
                null;

            const rows = getRows(question);

            const hasRadio = rows.some(
                row => row.querySelectorAll('input[type="radio"]').length
            );

            if (!hasRadio) {
                return;
            }

            total += rows.filter(
                row => row.querySelectorAll('input[type="radio"]').length
            ).length;

            if (score === null) {
                missing.push({
                    index,
                    question: text
                });
                return;
            }

            const result = fillQuestion(question, score);

            filled += result.filled;

            if (!result.ok) {
                missing.push({
                    index,
                    question: text,
                    reason: "ANSWER_NOT_AVAILABLE"
                });
            }
        });

        const result = {
            ok: total > 0 && filled === total && missing.length === 0,
            filled,
            total,
            missing
        };

        console.log("[SEA][FORM FILLER] Result:", result);

        return result;
    }

    function validateForm() {
        const form = document.querySelector("form.js_surveyform");

        if (!form) {
            return {
                ok: false,
                missing: ["FORM_NOT_FOUND"]
            };
        }

        const requiredRadios = [
            ...form.querySelectorAll(
                'input[type="radio"][required]'
            )
        ];

        const groups = new Map();

        for (const radio of requiredRadios) {
            if (!groups.has(radio.name)) {
                groups.set(radio.name, []);
            }

            groups.get(radio.name).push(radio);
        }

        const missing = [];

        for (const [name, radios] of groups) {
            if (!radios.some(radio => radio.checked)) {
                missing.push(name);
            }
        }

        return {
            ok: missing.length === 0,
            missing
        };
    }

    function submitForm() {
        const form = document.querySelector("form.js_surveyform");

        if (!form) {
            return false;
        }

        const button =
            form.querySelector(
                'button[name="button_submit"], input[name="button_submit"]'
            );

        if (!button) {
            console.error(
                "[SEA][SUBMIT] Submit button not found."
            );
            return false;
        }

        console.log(
            "[SEA][SUBMIT] Clicking ERP form button."
        );

        button.click();

        return true;
    }

    window.SEAFormFiller = {
        fillFeedbackForm,
        validateForm,
        submitForm
    };

    console.log("[SEA][FORM FILLER] Loaded");
})();