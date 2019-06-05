/*

    Lily Pad User Inspector
    Created by Milad Nazeri on 2019-01-07
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    TABLET UI JS
    
*/


// Handle the slider being changed
function userSliderChanged(slider) {
    EventBridge.emitWebEvent(JSON.stringify({
        app: "lilyPadUserInspector",
        method: "updateUserScaler",
        currentUserScaler: slider.value
    }));

    document.getElementById("sliderValueDisplay").innerHTML = slider.value;
}


// Hnadle the nametag view mode change
var mode = "on";
function handleMode(radioButton) {
    mode = radioButton.value;
    EventBridge.emitWebEvent(JSON.stringify({
        app: "lilyPadUserInspector",
        method: "handleMode",
        mode: mode
    }));
}


// Handle incoming tablet messages
function onScriptEventReceived(message) {
    try {
        message = JSON.parse(message);
    } catch (e) {
        console.log(e);
        return;
    }

    if (message.app !== "lilyPadUserInspector") {
        return; 
    }

    switch (message.method) {
        case "updateUI":
            document.getElementById("sizeSlider").value = message.currentUserScaler; 
            mode = message.mode || "on";
            document.getElementById("sliderValueDisplay").innerHTML = message.currentUserScaler;
            
            switch (mode) {
                case "on":
                    document.getElementById("radio_on").checked = true;
                    break;

                case "off":
                    document.getElementById("radio_off").checked = true;
                    break;

                case "alwaysOn":
                    document.getElementById("radio_alwaysOn").checked = true;
                    break;

                default:
                    console.log("couldn't find the given mode");
                    
            }
            document.getElementById("loadingContainer").style.display = "none";
            break;
        default:
            console.log("Unknown message received from lilyPadUserInspector.js! " + JSON.stringify(message));
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
            app: "lilyPadUserInspector",
            method: "eventBridgeReady"
        }));
    }, EVENTBRIDGE_SETUP_DELAY);
}

onLoad();