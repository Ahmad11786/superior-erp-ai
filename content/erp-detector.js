var SEA = (typeof SEA !== "undefined") ? SEA : {};

SEA.ErpDetector = (function () {

    function isErpHost() {
        return location.hostname === SEA.ERP_HOST;
    }

    function getStatus() {
        if (!isErpHost()) {
            return {
                onErp: false,
                pageState: "not-erp"
            };
        }

        const surveyForm =
            document.querySelector("form.js_surveyform");

        return {
            onErp: true,
            pageState: surveyForm
                ? "survey-form"
                : "erp-page",
            url: location.href,
            title: document.title,
            surveyForm: !!surveyForm
        };
    }

    return {
        isErpHost,
        getStatus
    };

})();