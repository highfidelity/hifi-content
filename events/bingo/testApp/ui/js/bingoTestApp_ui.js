//
//  bingoCard_ui.js
//
//  Created by Zach Fox on 2019-02-15
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

// Handle EventBridge messages from *_app.js.
function onScriptEventReceived(message) {
    try {
        message = JSON.parse(message);
    } catch (error) {
        console.log("Couldn't parse script event message: " + error);
        return;
    }

    if (message.app !== "bingoTestApp") {
        return;
    }

    switch (message.method) {
        case "initializeUI":
            document.getElementById("loadingContainer").style.display = "none";
            break;

        default:
            console.log("Unknown message received from bingoTestApp_app.js! " + JSON.stringify(message));
            break;
    }
}

// A wrapper for emitting web events over the event bridge.
// Adds "app": "bingo" key/value pair to message.
function emitBingoEvent(method) {
    var event = {
        app: 'bingo',
        method: method
    };
    EventBridge.emitWebEvent(JSON.stringify(event));
}

// This delay is necessary to allow for the JS EventBridge to become active.
// The delay is still necessary for HTML apps in RC78+.
var EVENTBRIDGE_SETUP_DELAY = 500;
function onLoad() {
    setTimeout(function() {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        emitBingoEvent("eventBridgeReady");
    }, EVENTBRIDGE_SETUP_DELAY);
}

document.addEventListener("DOMContentLoaded", function(event) {
    onLoad();
});
