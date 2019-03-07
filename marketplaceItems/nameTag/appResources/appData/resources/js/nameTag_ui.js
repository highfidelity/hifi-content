/*

    Name Tag
    Created by Milad Nazeri on 2019-01-07
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Point to solo someone to hear them better in a crowd!
    TABLET UI JS
    
*/



// *************************************
// START EVENTBRIDGE
// *************************************
// #region Eventbridge

function nameTagSwitchClicked(checkbox) {
    EventBridge.emitWebEvent(JSON.stringify({
        app: "nametag",
        method: "nametagSwitchClicked",
        nameTagEnabled: checkbox.checked
    }));
    // document.getElementById("firstRun").style.display = "none";
}

function userSliderChanged(slider) {
    EventBridge.emitWebEvent(JSON.stringify({
        app: "nametag",
        method: "updateUserScaler",
        currentUserScaler: slider.value
    }));
    // document.getElementById("firstRun").style.display = "none";
}


// Handle incoming tablet messages
function onScriptEventReceived(message) {
    try {
        message = JSON.parse(message);
    } catch (e) {
        console.log(e);
        return;
    }

    switch (message.method) {
        case "updateUI":
            // if (message.isFirstRun) {
            //     document.getElementById("firstRun").style.display = "block";
            // }
            document.getElementById("nameTagSwitch").checked = message.nameTagEnabled;
            document.getElementById("sizeSlider").value = message.currentUserScaler;            
            // document.getElementById("neverWhistleCheckbox").checked = message.neverWhistleEnabled;

            // var showAppreciationEntityCheckbox = document.getElementById("showAppreciationEntityCheckbox");
            // showAppreciationEntityCheckbox.checked = message.showAppreciationEntity;
            // if (showAppreciationEntityCheckbox.checked) {
            //     document.getElementById("colorPickerContainer").style.visibility = "visible";
            // } else {
            //     document.getElementById("colorPickerContainer").style.visibility = "hidden";
            // }

            // if (message.neverWhistleEnabled) {
            //     var crosshatch = document.getElementById("crosshatch");
            //     crosshatch.style.display = "inline-block";
            // }

            document.getElementById("loadingContainer").style.display = "none";

            // var color = document.getElementById("colorPicker").jscolor;
            // color.fromRGB(message.entityColor.red, message.entityColor.green, message.entityColor.blue);

            // var startColor = {
            //     "red": Math.floor(color.rgb[0] * START_COLOR_MULTIPLIER),
            //     "green": Math.floor(color.rgb[1] * START_COLOR_MULTIPLIER),
            //     "blue": Math.floor(color.rgb[2] * START_COLOR_MULTIPLIER)
            // };
            // var currentIntensityDisplayWidth = document.getElementById("currentIntensityDisplay").offsetWidth;
            // document.getElementById("currentIntensity").style.backgroundImage = 
            //     "linear-gradient(to right, rgb(" + startColor.red + ", " +
            //     startColor.green + ", " + startColor.blue + ") 0, " +
            //     color.toHEXString() + " " + currentIntensityDisplayWidth + "px)";
            break;
        default:
            console.log("Unknown message received from nameTag.js! " + JSON.stringify(message));
            break;
        }
    
}


// This is how much time to give the Eventbridge to wake up.  This won't be needed in RC78 and will be removed.
// Run when the JS is loaded and give enough time to for EventBridge to come back
var EVENTBRIDGE_SETUP_DELAY = 500;
function onLoad() {
    setTimeout(function() {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        EventBridge.emitWebEvent(JSON.stringify({
            app: "nametag",
            method: "eventBridgeReady"
        }));
    }, EVENTBRIDGE_SETUP_DELAY);
}

onLoad();