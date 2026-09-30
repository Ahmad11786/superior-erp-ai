(function () {
  "use strict";

  function normalize(text) {
    return (text || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function findAnswer(questionText, answers) {
    const target = normalize(questionText);

    for (const key of Object.keys(answers)) {
      if (normalize(key) === target) {
        return answers[key];
      }
    }

    return null;
  }

  function findRadio(row, rating) {
    const headers = [...row.closest("table").querySelectorAll("thead th")];

    let ratingIndex = -1;

    for (let i = 0; i < headers.length; i++) {
      if (normalize(headers[i].innerText) === String(rating)) {
        ratingIndex = i;
        break;
      }
    }

    const radios = [...row.querySelectorAll("input[type='radio']")];

    if (ratingIndex >= 0 && radios[ratingIndex - 1]) {
      return radios[ratingIndex - 1];
    }

    return radios.find(r => r.value === String(rating)) || null;
  }

  function fill(form, answers) {
    const rows = [...form.querySelectorAll(".js_question-wrapper tbody tr")];

    let filled = 0;
    let skipped = 0;

    for (const row of rows) {
      const questionCell = row.querySelector("th");

      if (!questionCell) {
        skipped++;
        continue;
      }

      const question = questionCell.innerText.trim();
      const answer = findAnswer(question, answers);

      if (answer === null) {
        skipped++;
        continue;
      }

      const radio = findRadio(row, answer);

      if (!radio) {
        skipped++;
        continue;
      }

      radio.checked = true;
      radio.click();

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
      skipped
    };
  }

  function validate(form) {
    const requiredGroups = new Set();

    for (const input of form.querySelectorAll("input[type='radio'][required]")) {
      requiredGroups.add(input.name);
    }

    for (const name of requiredGroups) {
      const checked = form.querySelector(
        `input[type="radio"][name="${CSS.escape(name)}"]:checked`
      );

      if (!checked) {
        return false;
      }
    }

    return true;
  }

  function getSubmitButton(form) {
    return (
      form.querySelector("button[name='button_submit']") ||
      form.querySelector("input[name='button_submit']") ||
      form.querySelector("button[type='submit']") ||
      form.querySelector("input[type='submit']")
    );
  }

  function getAction(button) {
    if (!button) return "unknown";

    const value = normalize(button.value);
    const text = normalize(button.innerText || button.textContent);

    if (
      value.includes("next") ||
      text.includes("next question") ||
      text === "next"
    ) {
      return "next";
    }

    if (
      value.includes("submit") ||
      value.includes("finish") ||
      value.includes("save") ||
      text.includes("submit") ||
      text.includes("finish") ||
      text.includes("complete") ||
      text.includes("save")
    ) {
      return "submit";
    }

    return "unknown";
  }

  function clickNextOrSubmit(form) {
    const button = getSubmitButton(form);

    if (!button) {
      return {
        success: false,
        action: "none"
      };
    }

    const action = getAction(button);

    button.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    setTimeout(() => {
      button.click();
    }, 300);

    return {
      success: true,
      action
    };
  }

  window.SEAFormFiller = {
    fill,
    validate,
    getSubmitButton,
    getAction,
    clickNextOrSubmit
  };

  console.log("[SEA][FORM FILLER] Loaded");
})();