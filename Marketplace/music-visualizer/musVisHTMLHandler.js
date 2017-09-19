//  
//  musVisHTMLHandler.js
//  A handler for monitoring changes/requests/contradictions between the html page and tablet app
//   
//  Author: Elisa Lupin-Jimenez
//  Copyright High Fidelity 2017
//  
//  Licensed under the Apache 2.0 License
//  See accompanying license file or http://apache.org/
//  
//  All assets are under CC Attribution Non-Commerical
//  http://creativecommons.org/licenses/
//  

var NO_SELECTION_TEXT = "No file selected";
var CLEAR_SELECTION_TEXT = "Clear selection";
var CHOOSE_FILE_TEXT = "Choose audio file";

function chooseAudioFile() {
    EventBridge.emitWebEvent(JSON.stringify({
        type: "chooseAudioFile",
        value: $(".blueButton").val()
    }));
}

// mic sync, audio file, and finger trail are mutually exclusive
function main() {

    $(".mic-check").click(function() {
        if ($(".mic-check").is(":checked") && $('.filename').text() !== NO_SELECTION_TEXT) {
            $('.filename').html(NO_SELECTION_TEXT);
            EventBridge.emitWebEvent(JSON.stringify({
                "type": "contradiction"
            }));  
        }

        if ($(".mic-check").is(":checked") && $('[name="ForD"]:checked').val() === "finger") {
            $('[name="ForD"]')[2].checked = true;
        }
    });

    $('[name="ForD"]').click(function() {
        if ($('[name="ForD"]:checked').val() === "finger") {
            if ($(".mic-check").is(":checked")) {
                $(".mic-check").prop('checked', false);
            }
            if ($('.filename').text() !== NO_SELECTION_TEXT) {
                EventBridge.emitWebEvent(JSON.stringify({
                    "type": "contradiction"
                }));  
            }
        }
    });

    // sends JSON with user's specifications to tablet app 
    $(".particle-button").click(function() {
        console.log(this.name + " button click");
        var clickEvent = {
            "type": "click",
            "data": this.name,
            "sync": $(".mic-check").is(":checked"),
            "behavior": $('[name="ForD"]:checked').val()
        };
        EventBridge.emitWebEvent(JSON.stringify(clickEvent));
    });

    // updates selected filename shown and checks for contradictions
    openEventBridge(function() {
        EventBridge.scriptEventReceived.connect(function(message) {
            var filename = JSON.parse(message).file;
            if (filename !== "") {
                $('.filename').html(filename);
                $(".blueButton").prop("value", CLEAR_SELECTION_TEXT);
            } else {
                $('.filename').html(NO_SELECTION_TEXT);
                $(".blueButton").prop("value", CHOOSE_FILE_TEXT);
            }
            if (filename !== "" && $(".mic-check").is(":checked")) {
                $(".mic-check").prop('checked', false);
            }
            if (filename !== "" && $('[name="ForD"]:checked').val() === "finger") {
                $('[name="ForD"]')[2].checked = true;
            }
        });
    });
}

$(document).ready(main);