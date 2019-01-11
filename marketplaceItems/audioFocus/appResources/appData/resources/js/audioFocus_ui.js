/*
    Audio Focus
    Created by Milad Nazeri on 2019-01-07
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Point to solo someone to hear them better in a crowd!
    TABLET UI JS
    
*/
var button = document.getElementById("clear-button");
button.addEventListener("click", function(){
    EventBridge.emitWebEvent(JSON.stringify({
        type: "CLEAR_LIST"
    }));
})

// removes the user when span is clicked
function onSpanClicked(user){
    EventBridge.emitWebEvent(JSON.stringify({
        type: "REMOVE_USER",
        value: user
    }));
}


var avatarList = document.getElementById("avatar-list");
var subheader = document.getElementById("sub-header");
// Handle incoming tablet messages
function onScriptEventReceived(message) {
    var data;

    try {
        data = JSON.parse(message);
        switch (data.type) {
            case "UPDATE_SOLO":
                var finalList = data.value.map(function(avatar){
                    return `<li class="shadow">${avatar}<span onclick="onSpanClicked('${avatar}')">X</span></li>`;
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

// This is how much time to give the Eventbridge to wake up.  This won't be needed in RC78 and will be removed.
var EVENTBRIDGE_SETUP_DELAY = 100;
// Run when the JS is loaded and give enough time to for EventBridge to come back
function onLoad() {
    setTimeout(function () {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        EventBridge.emitWebEvent(JSON.stringify({
            type: "EVENT_BRIDGE_OPEN_MESSAGE"
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
