"use strict";


const status =
    document.getElementById(
        "status"
    );


const enableBtn =
    document.getElementById(
        "enableBtn"
    );


const disableBtn =
    document.getElementById(
        "disableBtn"
    );


async function getSettings() {

    const data =
        await chrome.storage.local.get(
            "settings"
        );


    return Object.assign(

        {
            enabled:
                true,

            autoFill:
                true,

            autoSubmit:
                false,

            askBeforeSubmit:
                true,

            delayMs:
                1500
        },

        data.settings || {}

    );

}


function updateStatus(
    enabled
) {

    if (enabled) {

        status.textContent =
            "Assistant: ON";

        status.className =
            "status on";

    } else {

        status.textContent =
            "Assistant: OFF";

        status.className =
            "status off";

    }

}


async function setEnabled(
    enabled
) {

    const settings =
        await getSettings();


    settings.enabled =
        enabled;


    settings.autoFill =
        enabled;


    await chrome.storage.local.set({

        settings

    });


    updateStatus(
        enabled
    );

}


enableBtn.addEventListener(
    "click",
    function () {

        setEnabled(
            true
        );

    }
);


disableBtn.addEventListener(
    "click",
    function () {

        setEnabled(
            false
        );

    }
);


getSettings()
    .then(
        function (settings) {

            updateStatus(
                settings.enabled &&
                settings.autoFill
            );

        }
    );