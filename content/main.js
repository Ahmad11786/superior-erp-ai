(function () {
  "use strict";

  const ANSWERS = {
    "The teacher is kind, respectful, and easy to approach.": 5,
    "The teacher actively encouraged student participation during class.": 5
  };

  let settings = {
    enabled: true,
    autoFill: true,
    autoSubmit: true,
    delayMs: 1500
  };

  let processing = false;
  let lastFormSignature = "";

  async function loadSettings() {
    try {
      const saved = await chrome.storage.local.get([
        "enabled",
        "autoFill",
        "autoSubmit",
        "delayMs"
      ]);

      settings = {
        ...settings,
        ...saved
      };
    } catch (error) {
      console.error("[SEA] Settings error:", error);
    }
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function getFormSignature(form) {
    return [
      location.href,
      form.getAttribute("action") || "",
      form.getAttribute("name") || "",
      [...form.querySelectorAll(".js_question-wrapper")]
        .map(x => x.id)
        .join(",")
    ].join("|");
  }

  function isSurveyPage() {
    return !!document.querySelector("form.js_surveyform");
  }

  async function processSurvey() {
    if (processing) return;

    const form = document.querySelector("form.js_surveyform");

    if (!form) return;

    const signature = getFormSignature(form);

    if (signature === lastFormSignature) {
      return;
    }

    lastFormSignature = signature;
    processing = true;

    console.log("[SEA] Survey page detected.");

    try {
      if (!settings.enabled) {
        console.log("[SEA] Assistant disabled.");
        return;
      }

      await sleep(settings.delayMs);

      if (settings.autoFill) {
        const result = SEAFormFiller.fill(form, ANSWERS);

        console.log(
          `[SEA] Filled: ${result.filled}, Skipped: ${result.skipped}`
        );
      }

      await sleep(500);

      if (!SEAFormFiller.validate(form)) {
        console.warn("[SEA] Validation failed. Some required answers are missing.");
        return;
      }

      console.log("[SEA] Form validation passed.");

      if (!settings.autoSubmit) {
        console.log("[SEA] Auto submit disabled.");
        return;
      }

      await sleep(settings.delayMs);

      const result = SEAFormFiller.clickNextOrSubmit(form);

      console.log("[SEA] Action:", result.action);

      if (result.action === "next") {
        console.log("[SEA] Moving to next question page.");

        lastFormSignature = "";

        await waitForNextForm();
        return;
      }

      if (result.action === "submit") {
        console.log("[SEA] Final submission clicked.");

        lastFormSignature = "";

        await waitForPageChange();

        await sleep(2000);

        processPage();
      }

    } catch (error) {
      console.error("[SEA] Processing error:", error);
    } finally {
      processing = false;
    }
  }

  function waitForNextForm() {
    return new Promise(resolve => {
      let attempts = 0;

      const timer = setInterval(() => {
        attempts++;

        const form = document.querySelector("form.js_surveyform");

        if (form) {
          clearInterval(timer);
          resolve(true);
          return;
        }

        if (attempts >= 30) {
          clearInterval(timer);
          resolve(false);
        }
      }, 500);
    });
  }

  function waitForPageChange() {
    return new Promise(resolve => {
      let attempts = 0;
      const oldUrl = location.href;

      const timer = setInterval(() => {
        attempts++;

        if (location.href !== oldUrl) {
          clearInterval(timer);
          resolve(true);
          return;
        }

        if (document.querySelector("form.js_surveyform")) {
          clearInterval(timer);
          resolve(true);
          return;
        }

        if (attempts >= 30) {
          clearInterval(timer);
          resolve(false);
        }
      }, 500);
    });
  }

  async function processPendingForm() {
    if (processing) return;

    if (isSurveyPage()) {
      await processSurvey();
      return;
    }

    if (!window.SEAListScanner) {
      console.warn("[SEA] List scanner not available.");
      return;
    }

    const pending = SEAListScanner.findPending();

    if (!pending) {
      console.log("[SEA] No pending feedback form found.");
      return;
    }

    console.log("[SEA] Pending feedback found.");

    await sleep(settings.delayMs);

    SEAListScanner.openPending(pending);
  }

  function processPage() {
    setTimeout(() => {
      processPendingForm();
    }, 500);
  }

  async function start() {
    await loadSettings();

    console.log("[SEA] Automatic feedback assistant started.");

    processPage();

    const observer = new MutationObserver(() => {
      if (!processing) {
        processPage();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.addEventListener("load", processPage);

    setInterval(() => {
      if (!processing) {
        processPage();
      }
    }, 3000);
  }

  start();

})();