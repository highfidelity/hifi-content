/*

    User Inspector
    Created by Milad Nazeri on 2019-01-07
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    TABLET UI JS
    
*/


// Handle the enable button being clicked
function nameTagSwitchClicked(checkbox) {
    EventBridge.emitWebEvent(JSON.stringify({
        app: "userInspector",
        method: "nametagSwitchClicked",
        nameTagEnabled: checkbox.checked
    }));
}


// Handle the slider being changed
function userSliderChanged(slider) {
    EventBridge.emitWebEvent(JSON.stringify({
        app: "userInspector",
        method: "updateUserScaler",
        currentUserScaler: slider.value
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

    if (message.app !== "userInspector") {
        return; 
    }

    switch (message.method) {
        case "updateUI":
            document.getElementById("nameTagSwitch").checked = message.nameTagEnabled;
            document.getElementById("sizeSlider").value = message.currentUserScaler;            
            document.getElementById("loadingContainer").style.display = "none";
            break;
        default:
            console.log("Unknown message received from userInspector.js! " + JSON.stringify(message));
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
            app: "userInspector",
            method: "eventBridgeReady"
        }));
    }, EVENTBRIDGE_SETUP_DELAY);
}

onLoad();