(function () {
    "use strict";

    function fillFeedbackForm(score = 5) {
        const form = document.querySelector("form.js_surveyform");

        if (!form) {
            console.log("[SEA][FORM FILLER] No feedback form found.");
            return false;
        }

        const questions = form.querySelectorAll(".js_question-wrapper");

        let filled = 0;
        let total = 0;

        for (const question of questions) {
            const rows = question.querySelectorAll("tbody tr");

            for (const row of rows) {
                const radios = row.querySelectorAll('input[type="radio"]');

                if (!radios.length) {
                    continue;
                }

                total++;

                const headers = question.querySelectorAll("thead th");
                let scoreIndex = -1;

                headers.forEach((header, index) => {
                    if (header.innerText.trim() === String(score)) {
                        scoreIndex = index;
                    }
                });

                if (scoreIndex === -1) {
                    console.error(
                        "[SEA][FORM FILLER] Score not found:",
                        score
                    );
                    continue;
                }

                const radio = radios[scoreIndex - 1];

                if (radio) {
                    radio.checked = true;

                    radio.dispatchEvent(
                        new Event("change", { bubbles: true })
                    );

                    radio.dispatchEvent(
                        new Event("input", { bubbles: true })
                    );

                    filled++;
                }
            }
        }

        console.log(
            `[SEA][FORM FILLER] Filled ${filled}/${total} questions with score ${score}.`
        );

        return total > 0 && filled === total;
    }

    window.SEAFormFiller = {
        fillFeedbackForm
    };

    console.log("[SEA][FORM FILLER] Loaded");
})();