(function () {
    "use strict";

    function fillFeedbackForm(score = 5) {
        const form = document.querySelector("form.js_surveyform");

        if (!form) {
            console.log("[SEA][FORM FILLER] No feedback form found.");
            return false;
        }

        const valueMap = {
            5: "135577",
            4: "135578",
            3: "135579",
            2: "135580",
            1: "135581"
        };

        const value = valueMap[score];

        if (!value) {
            console.error("[SEA][FORM FILLER] Invalid score:", score);
            return false;
        }

        const radioGroups = new Set(
            [...form.querySelectorAll('input[type="radio"]')]
                .map(input => input.name)
        );

        let filled = 0;

        for (const name of radioGroups) {
            const radio = form.querySelector(
                `input[type="radio"][name="${CSS.escape(name)}"][value="${value}"]`
            );

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

        console.log(
            `[SEA][FORM FILLER] Filled ${filled}/${radioGroups.size} questions with score ${score}.`
        );

        return filled === radioGroups.size;
    }

    window.SEAFormFiller = {
        fillFeedbackForm
    };
})();