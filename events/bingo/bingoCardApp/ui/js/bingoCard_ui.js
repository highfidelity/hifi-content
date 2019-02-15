//
//  bingoCard_ui.js
//
//  Created by Zach Fox on 2019-02-15
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* globals $ document EventBridge setTimeout */


// Turns a color JSON object into a CSS rgb() string.
function parseColor(scriptColorObject) {
    var colorString = "rgb(";

    colorString += scriptColorObject.red;
    colorString += ", ";
    colorString += scriptColorObject.green;
    colorString += ", ";
    colorString += scriptColorObject.blue;
    colorString += ")";

    return colorString;
}


function onScriptEventReceived(scriptEvent) {
    if (JSON.parse(scriptEvent).type === "initializeCard") {
        scriptEvent = JSON.parse(scriptEvent);

        $(".button-number").each(function(index){
            document.getElementById(index).innerHTML = scriptEvent.allNumbers[index];
            if (scriptEvent.selectedNumberIDs.indexOf(index) > -1) {
                document.getElementById(index).classList.add("selected");
            }
        });

        // Handle selection of Free space, which has HTML id === -1
        if (scriptEvent.selectedNumberIDs.indexOf(-1) > -1) {
            document.getElementById("-1").classList.add("selected");
        }

        document.getElementById("helpText").innerHTML = " ";


        var parsedColor = parseColor(scriptEvent.cardColor);
        $('body').css("background", parsedColor);
        
        $(".button-number").click(function() {
            if ($(this).hasClass("selected")){
                $(this).removeClass("selected");
                EventBridge.emitWebEvent(JSON.stringify({
                    type: 'bingoNumberDeselected',
                    deselectedID: parseInt($(this).attr("id"))
                }));
            } else {
                $(this).addClass("selected");
                EventBridge.emitWebEvent(JSON.stringify({
                    type: 'bingoNumberSelected',
                    selectedID: parseInt($(this).attr("id"))
                }));
            }
        });

        $(".button-free").click(function() {
            if ($(this).hasClass("selected")){
                $(this).removeClass("selected");
                EventBridge.emitWebEvent(JSON.stringify({
                    type: 'bingoNumberDeselected',
                    deselectedID: parseInt($(this).attr("id"))
                }));
            } else {
                $(this).addClass("selected");
                EventBridge.emitWebEvent(JSON.stringify({
                    type: 'bingoNumberSelected',
                    selectedID: parseInt($(this).attr("id"))
                }));
            }
        });

        var BINGO_STRING = "BINGO";
        $(".button-letter").click(function() {
            var index = BINGO_STRING.indexOf($(this).attr('id'));
            EventBridge.emitWebEvent(JSON.stringify({
                type: 'playSoundFromBingoHeaderButton',
                index: index
            }));
        });

        $("#bingoButton").click(function() {
            EventBridge.emitWebEvent(JSON.stringify({
                type: 'calledBingo'
            }));
        });
    } else if (JSON.parse(scriptEvent).type === "notLoggedIn") {
        document.getElementById("helpText").innerHTML = "Please log in, then re-open the BINGO app!";
        document.getElementsByClassName("button-container")[0].style.visibility = "hidden";
        document.getElementById("bingoButton").style.visibility = "hidden";
    }
}


// This delay is necessary to allow for the JS EventBridge to become active.
// The delay is still necessary for HTML apps in RC78+.
var EVENTBRIDGE_SETUP_DELAY = 500;
function onLoad() {
    setTimeout(function() {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        EventBridge.emitWebEvent(JSON.stringify({
            type: "eventBridgeReady"
        }));
    }, EVENTBRIDGE_SETUP_DELAY);
}


document.addEventListener("DOMContentLoaded", function(event) {
    onLoad();
});