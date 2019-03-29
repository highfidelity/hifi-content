/*

    User Inspector
    Created by Milad Nazeri on 2019-01-07
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    TABLET UI JS
    
*/


// *************************************
// START UTILITY_FUNCTIONS
// *************************************
// #region UTILITY_FUNCTIONS


// Handle the volume being changed
function volumeChanged(slider) {
    EventBridge.emitWebEvent(JSON.stringify({
        app: "botinator",
        method: "updateVolume",
        volume: slider.value
    }));
}


// Update the corner boundery location
function updateCornerBoundery(cornerType){
    EventBridge.emitWebEvent(JSON.stringify({
        app: "botinator",
        method: "updateContentBoundaryCorners",
        cornerType: cornerType
    }));
}


// Update the total numberf of bots needed
function updateTotalNumberOfBotsNeeded(input){
    EventBridge.emitWebEvent(JSON.stringify({
        app: "botinator",
        method: "updateTotalNumberOfBotsNeeded",
        totalNumberOfBotsNeeded: input.value
    }));
    document.getElementById("totalNumberOfBotsNeeded").innerHTML = "Current Bots: " + input.value;
}

// Update which kind of bot to use
// function updateBotType(input){
//     EventBridge.emitWebEvent(JSON.stringify({
//         app: "botinator",
//         method: "updateBotType",
//         updateBotType: input.value
//     }));
// }


// Update the current availabler ACs indicated
function updateAvailableACsUI(availableACs){
    console.log("availableAcs:" + availableACs)
    document.getElementById("availableACs").innerHTML = availableACs;
}


// Update the current availabler ACs indicated
function updateContentBoundaryCornersUI(contentBoundaryCorners){
    document.getElementById("contentBoundaryCorners1Position").innerHTML = contentBoundaryCorners[0];
    document.getElementById("contentBoundaryCorners2Position").innerHTML = contentBoundaryCorners[1];
}

var playState = false;
function updatePlayStateLabels(isPlaying){
    playState = isPlaying;
    var playLabel = playState ? "Stop" : "Play";
    document.getElementById("playStopButton").value = playLabel;
}

function changePlayState(){
    playState = !playState;
    EventBridge.emitWebEvent(JSON.stringify({
        app: "botinator",
        method: "updatePlayState",
        playState: playState
    }));
    updatePlayStateLabels(playState);
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

    console.log(JSON.stringify(message));
    switch (message.method) {
        case "UPDATE_UI":
            document.getElementById("loadingContainer").style.display = "none";
            document.getElementById("contentBoundaryCorners1Position").innerHTML = message.contentBoundaryCorners[0];
            document.getElementById("contentBoundaryCorners2Position").innerHTML = message.contentBoundaryCorners[1];
            document.getElementById("volumeSlider").value = message.volume;         
            document.getElementById("totalNumberOfBotsNeeded").innerHTML = "Current Bots: " + message.totalNumberOfBotsNeeded;
            document.getElementById("availableACs").innerHTML = message.availableACs;
            updatePlayStateLabels(message.playState);
            // document.getElementById("botType").innerHTML = message.botType;
            break;
        case "UPDATE_AVAILABLE_ACS":
            console.log("\n\nin update\n\n")
            updateAvailableACsUI(message.availableACs);
            break;
        case "UPDATE_CONTENT_BOUNDARY_CORNERS":
            document.getElementById("contentBoundaryCorners1Position").innerHTML = message.contentBoundaryCorners[0];
            document.getElementById("contentBoundaryCorners2Position").innerHTML = message.contentBoundaryCorners[1];
            updateContentBoundaryCornersUI(message.contentBoundaryCorners);
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
    setTimeout(function() {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        EventBridge.emitWebEvent(JSON.stringify({
            app: "botinator",
            method: "eventBridgeReady"
        }));
    }, EVENTBRIDGE_SETUP_DELAY);
}

onLoad();