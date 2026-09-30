"use strict";

const status =
    document.getElementById("status");

const enableBtn =
    document.getElementById("enableBtn");

const disableBtn =
    document.getElementById("disableBtn");


function updateStatus(enabled) {

    if (enabled) {

        status.textContent =
            "Auto Fill: ON";

        status.className =
            "status on";

    } else {

        status.textContent =
            "Auto Fill: OFF";

        status.className =
            "status off";
    }
}


async function loadSettings() {

    const data =
        await chrome.storage.local.get(
            "settings"
        );

    const settings =
        data.settings || {};

    updateStatus(
        settings.autoFill === true
    );
}


enableBtn.addEventListener(
    "click",
    async function () {

        const data =
            await chrome.storage.local.get(
                "settings"
            );

        const settings =
            data.settings || {};

        settings.autoFill = true;

        await chrome.storage.local.set({
            settings
        });

        updateStatus(true);
    }
);


disableBtn.addEventListener(
    "click",
    async function () {

        const data =
            await chrome.storage.local.get(
                "settings"
            );

        const settings =
            data.settings || {};

        settings.autoFill = false;

        await chrome.storage.local.set({
            settings
        });

        updateStatus(false);
    }
);


loadSettings();