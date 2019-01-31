/*
    Appreciate
    Created by Zach Fox on 2019-01-30
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

function appreciateSwitchClicked(checkbox) {
    EventBridge.emitWebEvent(JSON.stringify({
        method: "appreciateSwitchClicked",
        appreciateEnabled: checkbox.checked
    }));
}

// Handle EventBridge messages from *_app.js.
function onScriptEventReceived(message) {
    message = JSON.parse(message);
    switch (message.method) {
        case "updateUI":
            document.getElementById("appreciateSwitch").checked = message.appreciateEnabled;
            document.getElementById("loadingContainer").style.display = "none";
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