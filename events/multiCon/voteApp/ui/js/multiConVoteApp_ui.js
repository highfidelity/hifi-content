//
//  multiConVoteApp_ui.js
//
//  Created by Robin Wilson and Zach Fox on 2019-03-11
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* globals document EventBridge setTimeout */

// Emit an event specific to the `multiConVoteApp` over the EventBridge.
function emitMultiConVoteEvent(type, data) {
    var event = {
        app: 'multiConVote',
        type: type,
        data: data
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

    if (scriptEvent.app !== "multiConVote") {
        return;
    }

    
    switch (scriptEvent.method) {
        case "initializeUI":
            break;

        default:
            console.log("Unknown message from multiConVoteApp_app.js: " + JSON.stringify(scriptEvent));
            break;
    }
}


// This delay is necessary to allow for the JS EventBridge to become active.
// The delay is still necessary for HTML apps in RC78+.
var EVENTBRIDGE_SETUP_DELAY = 500;
function onLoad() {
    setTimeout(function() {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        emitMultiConVoteEvent("eventBridgeReady");
    }, EVENTBRIDGE_SETUP_DELAY);
}


// Wait for the DOM to be ready before calling onLoad().
document.addEventListener("DOMContentLoaded", function(event) {
    onLoad();
});