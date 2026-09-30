(function () {

    "use strict";


    function clean(text) {

        return (text || "")
            .replace(/\s+/g, " ")
            .trim();

    }


    function readRow(
        row,
        index
    ) {

        const questionCell =
            row.querySelector("th");


        const question =
            clean(
                questionCell
                    ? questionCell.innerText
                    : ""
            );


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


        const options =
            radios.map(
                function (
                    radio,
                    radioIndex
                ) {

                    return {

                        index:
                            radioIndex,

                        rating:
                            clean(
                                headers[
                                    radioIndex + 1
                                ]
                                ?.innerText || ""
                            ),

                        value:
                            radio.value || "",

                        name:
                            radio.name || "",

                        checked:
                            radio.checked,

                        disabled:
                            radio.disabled

                    };

                }
            );


        return {

            index,

            question,

            required:
                radios.some(
                    radio =>
                        radio.required
                ),

            options

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


        const rows =
            [
                ...form.querySelectorAll(
                    ".js_question-wrapper tbody tr"
                )
            ]
            .map(readRow)
            .filter(
                row =>
                    row.question
            );


        return {

            action:
                form.action || "",

            method:
                (
                    form.method ||
                    "post"
                ).toLowerCase(),

            name:
                form.name || "",

            rows,

            questionCount:
                rows.length

        };

    }


    window.SEAFormReader = {

        scanSurveyForm

    };


    console.log(
        "[SEA][FORM READER] Loaded"
    );

})();