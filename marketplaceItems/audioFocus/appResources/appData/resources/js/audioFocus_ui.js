/*
    Solo Point
    Created by Milad Nazeri on 2019-01-07
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Point to solo someone to hear them better in a crowd!
    TABLET JS
    
*/


// *************************************
// START UTILITY FUNCTIONS
// *************************************
// #region Utilty

var debug = true;
var FALSE = "false";

// Easy log function checking for message, an object to stringify, and whether it should be enabled or not
function log(message, object, enabled){
    if (!debug || enabled === FALSE) {
        return;
    }

    var finalMessage;

    finalMessage = "\n\n\t" + message + ":" + "\n\n";

    if (object) {
        finalMessage += "\n\t\t" + JSON.stringify(object, null, 4) + "\n";
    }

    print(finalMessage);
}

// #endregion
// *************************************
// END UTILITY FUNCTIONS
// *************************************

var UPDATE_SOLO = "UPDATE_SOLO";
var CLEAR_LIST = "CLEAR_LIST";

var avatarList = document.getElementById("avatar-list");
var soloNames = document.getElementById("solo-names");
var button = document.getElementById("clear-button");
var subheader = document.getElementById("sub-header");


button.addEventListener("click", function(){
    EventBridge.emitWebEvent(JSON.stringify({
        type: CLEAR_LIST
    }));
})

// Handle incoming tablet messages
function onScriptEventReceived(message) {
    var data;

    try {
        data = JSON.parse(message);
        switch (data.type) {
            case UPDATE_SOLO:
                log("in update solo");
                var finalList = data.value.map(function(avatar){
                    return `<li>${avatar}</li>`;
                }).join("");
                
                if (finalList.length > 0) {
                    button.style.visibility = "visible";
                    subheader.style.visibility = "visible";
                } else {
                    button.style.visibility = "hidden";
                    subheader.style.visibility = "hidden";
                }

                avatarList.innerHTML = finalList;
                
                break;
            default:
        }
    } catch (e) {
        console.log(e)
        return;
    }
    
}

var EVENTBRIDGE_SETUP_DELAY = 500;
var EVENT_BRIDGE_OPEN_MESSAGE = "EVENT_BRIDGE_OPEN_MESSAGE";


// Run when the JS is loaded and give enough time to for EventBridge to come back
function onLoad() {
            
    setTimeout(function () {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        EventBridge.emitWebEvent(JSON.stringify({
            type: EVENT_BRIDGE_OPEN_MESSAGE
        }));
    }, EVENTBRIDGE_SETUP_DELAY);
}


// *************************************
// START MAIN
// *************************************
// #region Main
onLoad();

// #endregion
// *************************************
// END MAIN 
// *************************************
