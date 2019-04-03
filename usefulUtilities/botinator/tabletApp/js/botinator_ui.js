/*

    Botinator
    Created by Milad Nazeri on 2019-01-07
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    TABLET UI JS
    
*/


// *************************************
// START VARS AND CONSTS
// *************************************
// #region VARS AND CONSTS


var loadingContainer;
var contentBoundaryCorners1Position;
var contentBoundaryCorners2Position;
var volumeSlider;
var totalNumberOfBotsNeeded;
var availableACs;
var playStopButton; 
var updateBotDataButton;


// #endregion
// *************************************
// END VARS AND CONSTS
// *************************************

// *************************************
// START UTILITY_FUNCTIONS
// *************************************
// #region UTILITY_FUNCTIONS


// Handle the volume being changed
function updateVolume(slider) {
    EventBridge.emitWebEvent(JSON.stringify({
        app: "botinator",
        method: "updateVolume",
        volume: slider.value
    }));
}


// Update the corner boundery location
function updateCornerBoundery(cornerType) {
    EventBridge.emitWebEvent(JSON.stringify({
        app: "botinator",
        method: "updateContentBoundaryCorners",
        cornerType: cornerType
    }));
}


// Update the total numberf of bots needed
function updateTotalNumberOfBotsNeeded(input) {
    EventBridge.emitWebEvent(JSON.stringify({
        app: "botinator",
        method: "updateTotalNumberOfBotsNeeded",
        totalNumberOfBotsNeeded: input.value
    }));
    totalNumberOfBotsNeeded.innerHTML = "Current Bots: " + input.value;
}


// Update the current availabler ACs indicated
function updateAvailableACsUI(currentAvailableACs) {
    availableACs.innerHTML = currentAvailableACs;
}


// Update the current availabler ACs indicated
function updateContentBoundaryCornersUI(contentBoundaryCorners) {
    contentBoundaryCorners1Position.innerHTML = convertPositionToArray(contentBoundaryCorners[0]);
    contentBoundaryCorners2Position.innerHTML = convertPositionToArray(contentBoundaryCorners[1]);
}


// Change the play/stop button label
function updatePlayLabel(playState) {
    isPlaying = playState;
    var playLabel = isPlaying ? "Stop" : "Play";
    playStopButton.value = playLabel;
}


// Handle play state change
var isPlaying = false;
function updateIsPlaying() {
    isPlaying = !isPlaying;
    EventBridge.emitWebEvent(JSON.stringify({
        app: "botinator",
        method: "updateIsPlaying",
        isPlaying: isPlaying
    }));
    updatePlayLabel(isPlaying);
}


function maybeDisablePlayButton(acs) {
    if (acs > 0 && !playStopButton.disabled){
        playStopButton.disabled = false;
        updateBotDataButton.disabled = false;

        playStopButton.classList.add("buttonControls");
        playStopButton.classList.remove("buttonDisabled");
        updateBotDataButton.classList.add("buttonControls");
        updateBotDataButton.classList.remove("buttonDisabled");
        return;
    }
    playStopButton.disabled = true;
    updateBotDataButton.disabled = true;

    playStopButton.classList.remove("buttonControls");
    playStopButton.classList.add("buttonDisabled");
    updateBotDataButton.classList.remove("buttonControls");
    updateBotDataButton.classList.add("buttonDisabled");
}


// Convert object to array to make it easier to read
// and to also format it for 2 decimal places
var FIXED_DIGITS = 2;
function convertPositionToArray(position) {
    var arrayToReturn = [
        +position.x.toFixed(FIXED_DIGITS), 
        +position.y.toFixed(FIXED_DIGITS), 
        +position.z.toFixed(FIXED_DIGITS)
    ];

    return arrayToReturn;
}


function sendData() {
    EventBridge.emitWebEvent(JSON.stringify({
        app: "botinator",
        method: "sendData"
    }));
}


// #endregion
// *************************************
// END UTILITY_FUNCTIONS
// *************************************


// Handle incoming tablet messages
function onScriptEventReceived(message) {
    try {
        message = JSON.parse(message);
    } catch (e) {
        console.log(e);
        return;
    }

    if (message.app !== "botinator") {
        return; 
    }

    switch (message.method) {
        case "UPDATE_UI":
            loadingContainer.style.display = "none";
            // Saving for when volume gets fixed
            // volumeSlider.value = message.volume;         
            totalNumberOfBotsNeeded.innerHTML = "Current Bots: " + message.totalNumberOfBotsNeeded;
            availableACs.innerHTML = message.availableACs;
            updateContentBoundaryCornersUI(message.contentBoundaryCorners);
            updatePlayLabel(message.playState);
            maybeDisablePlayButton(message.availableACs);
            break;
        case "UPDATE_AVAILABLE_ACS":
            updateAvailableACsUI(message.availableACs);
            maybeDisablePlayButton(message.availableACs);
            break;
        case "UPDATE_CONTENT_BOUNDARY_CORNERS":
            updateContentBoundaryCornersUI(message.contentBoundaryCorners);
            break;
        case "UPDATE_CURRENT_SERVER_PLAY_STATUS":
            updatePlayLabel(message.playState);
            updateAvailableACsUI(message.availableACs);
            maybeDisablePlayButton(message.availableACs);
            break;
        default:
            console.log("Unknown message received from botinator.js! " + JSON.stringify(message));
            break;
    }
}


// This is how much time to give the Eventbridge to wake up.  This won't be needed in RC78 and will be removed.
// Run when the JS is loaded and give enough time to for EventBridge to come back
var EVENTBRIDGE_SETUP_DELAY = 500;
function onLoad() {
    loadingContainer = document.getElementById("loadingContainer");
    contentBoundaryCorners1Position = document.getElementById("contentBoundaryCorners1Position");
    contentBoundaryCorners2Position = document.getElementById("contentBoundaryCorners2Position");
    volumeSlider = document.getElementById("volumeSlider");
    totalNumberOfBotsNeeded = document.getElementById("totalNumberOfBotsNeeded");
    availableACs = document.getElementById("availableACs");
    playStopButton = document.getElementById("playStopButton");
    updateBotDataButton = document.getElementById("updateBotDataButton");

    setTimeout(function() {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        EventBridge.emitWebEvent(JSON.stringify({
            app: "botinator",
            method: "eventBridgeReady"
        }));
    }, EVENTBRIDGE_SETUP_DELAY);
}

onLoad();