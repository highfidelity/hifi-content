/*
    Appreciate
    Created by Zach Fox on 2019-01-30
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

/* globals document EventBridge setTimeout */

function appreciateSwitchClicked(checkbox) {
    EventBridge.emitWebEvent(JSON.stringify({
        method: "appreciateSwitchClicked",
        appreciateEnabled: checkbox.checked
    }));
    document.getElementById("firstRun").style.display = "none";
}

function neverWhistleCheckboxClicked(checkbox) {
    var crosshatch = document.getElementById("crosshatch");
    if (checkbox.checked) {
        crosshatch.style.display = "inline-block";
    } else {
        crosshatch.style.display = "none";
    }

    EventBridge.emitWebEvent(JSON.stringify({
        method: "neverWhistleCheckboxClicked",
        neverWhistle: checkbox.checked
    }));
}

var START_COLOR_MULTIPLIER = 0.2;
function setEntityColor(jscolor) {
    var newEntityColor = {
        "red": jscolor.rgb[0],
        "green": jscolor.rgb[1],
        "blue": jscolor.rgb[2]
    };

    var startColor = {
        "red": Math.floor(newEntityColor.red * START_COLOR_MULTIPLIER),
        "green": Math.floor(newEntityColor.green * START_COLOR_MULTIPLIER),
        "blue": Math.floor(newEntityColor.blue * START_COLOR_MULTIPLIER)
    };

    var currentIntensityDisplayWidth = document.getElementById("currentIntensityDisplay").offsetWidth;
    var bgString = "linear-gradient(to right, rgb(" + startColor.red + ", " +
        startColor.green + ", " + startColor.blue + ") 0, " +
        jscolor.toHEXString() + " " + currentIntensityDisplayWidth + "px)";
    document.getElementById("currentIntensity").style.backgroundImage = bgString;

    EventBridge.emitWebEvent(JSON.stringify({
        method: "setEntityColor",
        entityColor: newEntityColor
    }));
}

// Handle EventBridge messages from *_app.js.
function onScriptEventReceived(message) {
    message = JSON.parse(message);
    switch (message.method) {
        case "updateUI":
            if (message.isFirstRun) {
                document.getElementById("firstRun").style.display = "block";
            }
            document.getElementById("appreciateSwitch").checked = message.appreciateEnabled;
            document.getElementById("neverWhistleCheckbox").checked = message.neverWhistleEnabled;
            if (message.neverWhistleEnabled) {
                var crosshatch = document.getElementById("crosshatch");
                crosshatch.style.display = "inline-block";
            }

            document.getElementById("loadingContainer").style.display = "none";

            var color = document.getElementById("colorPicker").jscolor;
            color.fromRGB(message.entityColor.red, message.entityColor.green, message.entityColor.blue);

            var startColor = {
                "red": Math.floor(color.rgb[0] * START_COLOR_MULTIPLIER),
                "green": Math.floor(color.rgb[1] * START_COLOR_MULTIPLIER),
                "blue": Math.floor(color.rgb[2] * START_COLOR_MULTIPLIER)
            };
            var currentIntensityDisplayWidth = document.getElementById("currentIntensityDisplay").offsetWidth;
            document.getElementById("currentIntensity").style.backgroundImage = 
                "linear-gradient(to right, rgb(" + startColor.red + ", " +
                startColor.green + ", " + startColor.blue + ") 0, " +
                color.toHEXString() + " " + currentIntensityDisplayWidth + "px)";
            break;

        case "updateCurrentIntensityUI":
            document.getElementById("currentIntensity").style.width = message.currentIntensity * 100 + "%";
            break;
        default:
            console.log("Unknown message received from appreciate_app.js!");
            break;
    }
}

// This delay is necessary to allow for the JS EventBridge to become active.
// The delay won't be necessary in RC78.
var EVENTBRIDGE_SETUP_DELAY = 500;
function onLoad() {
    setTimeout(function() {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        EventBridge.emitWebEvent(JSON.stringify({
            method: "eventBridgeReady"
        }));
    }, EVENTBRIDGE_SETUP_DELAY);
}

onLoad();