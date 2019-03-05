//
//  bingoBossApp_ui.js
//
//  Created by Zach Fox on 2019-02-15
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* globals $ document EventBridge setTimeout */

// Emit an event specific to the `bingoBossApp` over the EventBridge.
function emitBingoBossEvent(type) {
    var event = {
        app: 'bingoBossApp',
        type: type
    };
    EventBridge.emitWebEvent(JSON.stringify(event));
}


// Handle incoming events over the EventBridge.
// Possible events include updating the "status text" area of the Boss app.
function onScriptEventReceived(scriptEvent) {
    try {
        scriptEvent = JSON.parse(scriptEvent);
    } catch (error) {
        console.log("ERROR parsing scriptEvent: " + error);
        return;
    }

    if (scriptEvent.app !== "bingoBossApp") {
        return;
    }

    
    switch (scriptEvent.method) {
        case "updateStatus":
            document.getElementById("statusText").innerHTML = scriptEvent.statusText;
            break;

        default:
            console.log("Unknown message from bingoBossApp_app.js: " + JSON.stringify(scriptEvent));
            break;
    }
}


// This delay is necessary to allow for the JS EventBridge to become active.
// The delay is still necessary for HTML apps in RC78+.
var EVENTBRIDGE_SETUP_DELAY = 500;
function onLoad() {
    setTimeout(function() {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        emitBingoBossEvent("eventBridgeReady");
    }, EVENTBRIDGE_SETUP_DELAY);

    $('.bingoButton').click(function() {
        emitBingoBossEvent($(this).attr('id'));
    });
}


// Wait for the DOM to be ready before calling onLoad().
document.addEventListener("DOMContentLoaded", function(event) {
    onLoad();
});