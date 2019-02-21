//
//  bingoCard_ui.js
//
//  Created by Zach Fox on 2019-02-15
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* globals $ document EventBridge setTimeout setInterval requestURL */

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


// Handle messages over the EventBridge from bingoCard_app.js
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

// Scrolls the "Called Numbers" UI element "left" or "right", if possible
function scrollCalledNumbers(direction) {
    var el = document.getElementById("calledNumbers");
    var leftX = document.getElementById("scrollCalledNumbersLeft").offsetLeft +
        document.getElementById("scrollCalledNumbersLeft").offsetWidth;
    var rightX = document.getElementById("scrollCalledNumbersRight").offsetLeft;
    var visibleLength = parseInt(rightX - leftX);
    var AMOUNT_TO_MOVE_PX = Math.min(visibleLength / 2, 125);

    var currentOffset = el.style.left;
    currentOffset = currentOffset === "" ? 0 : currentOffset.slice(0, -2);
    currentOffset = parseInt(currentOffset);
    var newOffset;

    if (direction === "left") {
        newOffset = currentOffset + AMOUNT_TO_MOVE_PX;
        // Don't move any more left such that any of the text would be off-banner
        newOffset = Math.min(0, newOffset);
        el.style.left = newOffset + "px";
    } else {
        newOffset = currentOffset - AMOUNT_TO_MOVE_PX;
        // Don't move any more right such that any of the text would be off-banner
        newOffset = Math.max(-(el.offsetWidth - visibleLength), newOffset);
        el.style.left = newOffset + "px";
    }
}

// Formats the called numbers array into something human-readable
function formatCalledNumbers(numbers) {
    var formattedNumbers = [];

    for (var i = 0; i < numbers.length; i++) {
        if (numbers[i] < 16) {
            formattedNumbers[i] = "<span class='bingoB'>B" + numbers[i] + "</span>";
        } else if (numbers[i] < 31) {
            formattedNumbers[i] = "<span class='bingoI'>I" + numbers[i] + "</span>";
        } else if (numbers[i] < 46) {
            formattedNumbers[i] = "<span class='bingoN'>N" + numbers[i] + "</span>";
        } else if (numbers[i] < 61) {
            formattedNumbers[i] = "<span class='bingoG'>G" + numbers[i] + "</span>";
        } else if (numbers[i] < 76) {
            formattedNumbers[i] = "<span class='bingoO'>O" + numbers[i] + "</span>";
        }
    }

    return formattedNumbers.join(", ");
}


// Gets the already-called BINGO numbers from the server, then displays them
// (formatted) in the Card UI.
function getCalledNumbers(requestURL) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            var response;
            try {
                response = JSON.parse(this.responseText);
            } catch (error) {
                console.log("ERROR when parsing getCalledNumbers request: " + JSON.stringify(error));
                return;
            }

            if (!response.calledNumbers || response.calledNumbers.length === 0) {
                document.getElementById("calledNumbers").innerHTML = "Nothing yet!";
            } else {
                var formattedNumbers = formatCalledNumbers(response.calledNumbers);
                document.getElementById("calledNumbers").innerHTML = formattedNumbers;
            }
        }
    };
    xhttp.open("GET", requestURL, true);
    xhttp.send();
}


// This delay is necessary to allow for the JS EventBridge to become active.
// The delay is still necessary for HTML apps in RC78+.
var EVENTBRIDGE_SETUP_DELAY = 500;
var NUMBER_CHECK_INTERVAL_MS = 5000;
var CONFIG_URL = "../../../config/config.json";
function onLoad() {
    setTimeout(function() {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        EventBridge.emitWebEvent(JSON.stringify({
            type: "eventBridgeReady"
        }));
    }, EVENTBRIDGE_SETUP_DELAY);

    // Get config.json from the server to know which URL to make future requests to,
    // then setup the interval to get called numbers.
    // This must not fail.
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            var requestURL = JSON.parse(this.responseText).requestURL + "?type=getCalledNumbers";

            setInterval(function() {
                getCalledNumbers(requestURL);
            }, NUMBER_CHECK_INTERVAL_MS);
            getCalledNumbers(requestURL);
        }
    };
    xhttp.open("GET", CONFIG_URL, true);
    xhttp.send();
}


// Call onLoad() once the DOM is ready
document.addEventListener("DOMContentLoaded", function(event) {
    onLoad();
});