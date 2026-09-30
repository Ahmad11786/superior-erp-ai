(function () {

    "use strict";

    function cleanText(text) {
        return (text || "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function getQuestionTitle(wrapper) {

        const heading =
            wrapper.querySelector("h1, h2, h3, h4, h5, h6");

        if (heading) {
            return cleanText(heading.innerText);
        }

        return "";
    }

    function getRows(wrapper) {

        return [...wrapper.querySelectorAll("tbody tr")];
    }

    function readRow(row) {

        const questionCell =
            row.querySelector("th");

        const questionText =
            cleanText(
                questionCell
                    ? questionCell.innerText
                    : ""
            );

        const radios =
            [...row.querySelectorAll(
                'input[type="radio"]'
            )];

        const options = radios.map(
            (radio, index) => {

                const cell =
                    radio.closest("td");

                const text =
                    cleanText(
                        cell
                            ? cell.innerText
                            : ""
                    );

                const header =
                    row
                        .closest("table")
                        ?.querySelectorAll(
                            "thead th"
                        );

                let rating = "";

                if (
                    header &&
                    header[index + 1]
                ) {
                    rating =
                        cleanText(
                            header[index + 1].innerText
                        );
                }

                return {
                    index,
                    rating,
                    text,
                    value: radio.value,
                    name: radio.name
                };
            }
        );

        return {
            question: questionText,
            options
        };
    }

    function readQuestion(wrapper, index) {

        const id =
            wrapper.id || "";

        const required =
            wrapper.dataset.required === "True" ||
            wrapper.dataset.required === "true";

        const rows =
            getRows(wrapper);

        return {
            index,
            id,
            title: getQuestionTitle(wrapper),
            required,
            rows: rows.map(readRow)
        };
    }

    function scanSurveyForm() {

        const form =
            document.querySelector(
                "form.js_surveyform"
            );

        if (!form) {
            return null;
        }

        const wrappers =
            [
                ...form.querySelectorAll(
                    ".js_question-wrapper"
                )
            ];

        const questions =
            wrappers.map(
                readQuestion
            );

        return {
            action: form.action || "",
            method: form.method || "post",
            name: form.name || "",
            questionCount: questions.length,
            questions
        };
    }

    function scanForms() {

        const forms =
            [...document.querySelectorAll("form")];

        return forms.map(
            (form, formIndex) => {

                const fields =
                    [
                        ...form.querySelectorAll(
                            "input:not([type='hidden']), textarea, select"
                        )
                    ];

                return {
                    formIndex,
                    action: form.action || "",
                    method: form.method || "get",
                    fields: fields.map(
                        (field, index) => ({
                            index,
                            tag: field.tagName.toLowerCase(),
                            type: field.type || "",
                            name: field.name || "",
                            id: field.id || "",
                            value: field.value || "",
                            required: field.required,
                            disabled: field.disabled
                        })
                    )
                };
            }
        );
    }

    window.SEAFormReader = {
        scanForms,
        scanSurveyForm
    };

    console.log(
        "[SEA][FORM READER] Loaded"
    );

})();