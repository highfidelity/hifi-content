//
//  ping_ui.js
//
//  Created by Zach Fox on 2019-03-26
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* globals document setTimeout clearTimeout */

// Emit an event specific to the App JS over the EventBridge.
var APP_NAME = "PING";
function emitAppSpecificEvent(method, data) {
    var event = {
        app: APP_NAME,
        method: method,
        data: data
    };
    EventBridge.emitWebEvent(JSON.stringify(event));
}


// Updates the UI to show that the message to the other user didn't result in anything
// within a few seconds
function messageTimedOut() {
    messageTimeout = false;
    document.getElementById("loadingContainer").style.display = "none";

    var sentStatus = document.getElementById("sentStatus");
    sentStatus.innerHTML = `Your ping timed out! Maybe your recipient doesn't have the PING app?`;
}


// Sends a message to the App JS which will instruct the App JS to send a message
// over the Messages Mixer to request a browser notification from the Web App API
// Times out after a few seconds.
var MESSAGE_TIMEOUT_MS = 5000;
var messageTimeout = false;
function sendMessageToTarget() {
    document.getElementById("loadingContainer").style.display = "block";

    if (messageTimeout) {
        clearTimeout(messageTimeout);
        messageTimeout = false;
    }
    messageTimeout = setTimeout(function() {
        messageTimedOut();
    }, MESSAGE_TIMEOUT_MS);

    var targetDisplayName = document.getElementById("targetDisplayName");
    var targetUUID = targetDisplayName.getAttribute("data-uuid");

    emitAppSpecificEvent("sendMessageToTarget", {
        "targetUUID": targetUUID
    });
}


// Disables the loading spinner
function initializeUI() {
    document.getElementById("loadingContainer").style.display = "none";
}


// Updates the UI to show the target's display name so the user knows who they're going to ping
function updateDisplayName(displayName, targetUUID) {
    var targetDisplayName = document.getElementById("targetDisplayName");
    targetDisplayName.innerHTML = displayName;
    targetDisplayName.setAttribute("data-uuid", targetUUID);
    
    var submitButton = document.getElementById("submitButton");
    submitButton.value = `Send Ping to ${displayName}`;
    submitButton.disabled = false;
}


// Updates the "notification status" section of the App's UI with the ping's status
function notificationStatusReceived(status, pingReceiverDisplayName) {
    document.getElementById("loadingContainer").style.display = "none";

    if (messageTimeout) {
        clearTimeout(messageTimeout);
        messageTimeout = false;
    }

    var sentStatus = document.getElementById("sentStatus");
    if (status === "success") {
        sentStatus.innerHTML = `${pingReceiverDisplayName} successfully received your ping!`;
    } else {
        sentStatus.innerHTML = `${pingReceiverDisplayName} couldn't receive your ping. Please try again later.`;
    }
}


// Handle messages over the EventBridge from the App JS
function onScriptEventReceived(scriptEvent) {
    var event = scriptEvent;
    try {
        event = JSON.parse(event);
    } catch (error) {
        return;
    }
    
    if (event.app !== APP_NAME) {
        return;
    }
    
    switch (event.method) {
        case "initializeUI":
            initializeUI();
            break;


        case "updateDisplayName":
            updateDisplayName(event.data.displayName, event.data.targetUUID);
            break;


        case "notificationStatus":
            notificationStatusReceived(event.data.status, event.data.pingReceiverDisplayName);
            break;


        default:
            console.log("Unrecognized event method supplied to App UI JS: " + event.method);
            break;
    }
}


// This delay is necessary to allow for the JS EventBridge to become active.
// The delay is still necessary for HTML apps in RC78+.
var EVENTBRIDGE_SETUP_DELAY = 500;
function onLoad() {
    setTimeout(function() {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        emitAppSpecificEvent("eventBridgeReady");
    }, EVENTBRIDGE_SETUP_DELAY);
}


// Call onLoad() once the DOM is ready
document.addEventListener("DOMContentLoaded", function(event) {
    onLoad();
});