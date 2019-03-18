//
//  bingoWinner_ui.js
//
//  Created by Zach Fox on 2019-03-18
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* globals document setTimeout */

// Emit an event specific to the `multiConApp` over the EventBridge.
var APP_NAME = "bingoWinnerApp";
function emitAppSpecificEvent(method, data) {
    var event = {
        app: APP_NAME,
        method: method,
        data: data
    };
    EventBridge.emitWebEvent(JSON.stringify(event));
}


// From https://stackoverflow.com/a/1373724
function validateEmail(email) {
    var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    return re.test(String(email).toLowerCase());
}


function updateEmail() {
    var emailAddress = document.getElementById("email");
    if (emailAddress.checkValidity()) {
        document.getElementById("loadingContainer").style.display = "block";
        emitAppSpecificEvent("updateEmail", emailAddress.value);
    } else {
        return false;
    }
}


function initializeUI(prizeWon) {
    document.getElementById("loadingContainer").style.display = "none";

    var initialTextContainer = document.getElementById("initialTextContainer");
    initialTextContainer.innerHTML = `
        <p>Congratulations, you won a physical prize while playing Bingo Extremeo!</p>
        <p>Your prize is: <strong>${prizeWon}</strong></p>
        <p>To claim your prize, enter your email address into the text field below, then click SUBMIT.</p>
        <p>If you signed up for BINGO EXTREMEO through Eventbrite, enter the same email address you used there.</p>
    `;

    var formContainer = document.getElementById("formContainer");
    formContainer.style.display = "block";
}


function showError(errorText) {
    document.getElementById("loadingContainer").style.display = "none";

    var statusTextContainer = document.getElementById("statusTextContainer");
    statusTextContainer.innerHTML = errorText;
}


function showSuccess(successText) {
    document.getElementById("loadingContainer").style.display = "none";
    
    var statusTextContainer = document.getElementById("statusTextContainer");
    statusTextContainer.innerHTML = successText;

    var closeButtonContainer = document.getElementById("closeButtonContainer");
    closeButtonContainer.style.display = "block";
}


function finishAndClose() {
    emitAppSpecificEvent("finishAndClose");
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
            initializeUI(event.prizeWon);
            break;


        case "emailUpdateError":
        case "error":
            showError(event.errorText);
            break;


        case "emailUpdateSuccess":
            showSuccess(event.successText);
            break;


        default:
            console.log("Unrecognized event method supplied to Bingo Winner UI JS: " + event.method);
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