(function () {
    "use strict";

    function getLabel(field) {
        const id = field.id;

        if (id) {
            const label = document.querySelector(`label[for="${CSS.escape(id)}"]`);
            if (label) {
                return label.innerText.trim();
            }
        }

        const parentLabel = field.closest("label");
        if (parentLabel) {
            return parentLabel.innerText.trim();
        }

        return "";
    }

    function readField(field, index) {
        return {
            index: index,
            tag: field.tagName.toLowerCase(),
            type: field.type || "",
            name: field.name || "",
            id: field.id || "",
            value: field.value || "",
            label: getLabel(field),
            placeholder: field.placeholder || "",
            required: field.required || false,
            disabled: field.disabled || false
        };
    }

    function scanForms() {
        const forms = [...document.querySelectorAll("form")];

        const result = forms.map((form, formIndex) => {
            const fields = [
                ...form.querySelectorAll(
                    "input:not([type='hidden']), textarea, select"
                )
            ];

            return {
                formIndex: formIndex,
                action: form.action || "",
                method: form.method || "get",
                fields: fields.map((field, index) =>
                    readField(field, index)
                )
            };
        });

        console.log("[SEA][FORM SCANNER] Forms found:", result);

        return result;
    }

    window.SEAFormReader = {
        scanForms
    };

    scanForms();
})();