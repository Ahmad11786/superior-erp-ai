var SEA = (typeof SEA !== "undefined") ? SEA : {};

SEA.ErpDetector = (function () {

    function isErpHost() {

        return (
            location.hostname === SEA.ERP_HOST
        );

    }


    function getSurveyForm() {

        return document.querySelector(
            "form.js_surveyform"
        );

    }


    function isSurveyPage() {

        return !!getSurveyForm();

    }


    function getStatus() {

        return {

            onErp:
                isErpHost(),

            pageState:
                !isErpHost()
                    ? "not-erp"
                    : isSurveyPage()
                        ? "survey-form"
                        : "erp-page",

            url:
                location.href,

            title:
                document.title,

            surveyForm:
                isSurveyPage()

        };

    }


    return {

        isErpHost,

        getSurveyForm,

        isSurveyPage,

        getStatus

    };

})();