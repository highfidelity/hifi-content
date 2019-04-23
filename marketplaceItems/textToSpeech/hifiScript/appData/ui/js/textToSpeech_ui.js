//
//  textToSpeech_ui.js
//
//  Created by Zach Fox on 2019-04-22
//  Copyright 2019 High Fidelity
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* globals document setTimeout clearTimeout */

// Emit an event specific to the App JS over the EventBridge.
var APP_NAME = "TTS";
function emitAppSpecificEvent(method, data) {
    var event = {
        app: APP_NAME,
        method: method,
        data: data
    };
    EventBridge.emitWebEvent(JSON.stringify(event));
}


function sampleButtonClicked(voiceName) {
    document.getElementById("loadingContainer").style.display = "block";
    
    emitAppSpecificEvent("sampleButtonClicked", {
        voiceName: voiceName
    });
}


function generateSpeech(voiceName) {
    document.getElementById("loadingContainer").style.display = "block";

    var inputText = document.getElementById("inputText");
    
    emitAppSpecificEvent("generateSpeech", {
        textToSpeak: inputText.value,
        voiceName: voiceName
    });
}


function autoTranslateButtonClicked(voiceName, targetLanguageCode) {
    document.getElementById("loadingContainer").style.display = "block";

    var inputText = document.getElementById("inputText");
    
    emitAppSpecificEvent("autoTranslateButtonClicked", {
        textToSpeak: inputText.value,
        voiceName: voiceName,
        targetLanguageCode: targetLanguageCode
    });
}

function fillSampleButtonContainer(voices) {
    var sampleButtonContainer = document.getElementById("sampleButtonContainer");
    for (var i = 0; i < voices.length; i++) {
        if (voices[i].languageCode !== "en-US") {
            continue;
        }

        var input = document.createElement("input");
        input.id = `sampleButton${i}`;
        input.setAttribute("type", "button");
        input.setAttribute("data-voiceName", voices[i].voiceName);
        input.value = `Voice ${i}`;
        input.addEventListener("click", function(event) {
            sampleButtonClicked(event.target.getAttribute("data-voiceName"));
        });
        
        sampleButtonContainer.appendChild(input);
    }
}


function fillSubmitButtonContainer(voices) {
    var submitButtonContainer = document.getElementById("submitButtonContainer");
    for (var i = 0; i < voices.length; i++) {
        if (voices[i].languageCode !== "en-US") {
            continue;
        }

        var input = document.createElement("input");
        input.id = `submitButton${i}`;
        input.setAttribute("type", "button");
        input.setAttribute("data-voiceName", voices[i].voiceName);
        input.value = `Voice ${i}`;
        input.addEventListener("click", function(event) {
            generateSpeech(event.target.getAttribute("data-voiceName"));
        });
        
        submitButtonContainer.appendChild(input);
    }
}


function fillTranslateButtonContainer(voices) {
    var translateButtonContainer = document.getElementById("translateButtonContainer");
    var alreadyAddedLanguageCodes = [];
    for (var i = 0; i < voices.length; i++) {
        if (alreadyAddedLanguageCodes.indexOf(voices[i].languageCode) > -1) {
            continue;
        } else {
            alreadyAddedLanguageCodes.push(voices[i].languageCode);
        }

        var input = document.createElement("input");
        input.id = `sampleButton${i}`;
        input.setAttribute("type", "button");
        input.setAttribute("data-voiceName", voices[i].voiceName);
        input.setAttribute("data-targetLanguageCode", voices[i].languageCode);
        input.value = `${voices[i].languageCode}`;
        input.addEventListener("click", function(event) {
            autoTranslateButtonClicked(event.target.getAttribute("data-voiceName"), event.target.getAttribute("data-targetLanguageCode"));
        });
        
        translateButtonContainer.appendChild(input);
    }
}


// Disables the loading spinner
function initializeUI(data) {
    var voices = data.voices;

    fillSampleButtonContainer(voices);
    fillSubmitButtonContainer(voices);
    fillTranslateButtonContainer(voices);

    document.getElementById("loadingContainer").style.display = "none";
}


function ttsResponseReceived() {
    document.getElementById("loadingContainer").style.display = "none";
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
            initializeUI(event.data);
            break;


        case "ttsResponseReceived":
            ttsResponseReceived();
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
    setTimeout(function () {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        emitAppSpecificEvent("eventBridgeReady");
    }, EVENTBRIDGE_SETUP_DELAY);
}


// Call onLoad() once the DOM is ready
document.addEventListener("DOMContentLoaded", function (event) {
    onLoad();
});