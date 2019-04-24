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


function openInfoPopup(event) {
    event.stopPropagation();

    var popupContainer = document.getElementById("popupContainer");
    var popupContentContainer = document.getElementById("popupContentContainer");

    popupContentContainer.innerHTML = `
        <p>High Fidelity's Text to Speech app relies on Google's Text to Speech and Translate APIs.</p>
        <h2>Google Translate API: Data Usage</h2>
        <p>When you use the Text to Speech app to automatically translate text, you are sending a copy of 
        your input text to Google's servers. According to <a href="https://cloud.google.com/translate/data-usage" target="_blank">Google's Data Usage FAQ on the Translate API support page</a>, 
        that text is stored on Google servers for a maximum of 14 days.</p>
        <h2>Google Text to Speech API: Data Usage</h2>
        <p>When you use the Text to Speech app to speak input text (whether or not it is automatically translated), you are sending a copy of 
        your input text to Google's servers. Google does not publish a Data Usage FAQ associated with the Text to Speech API. 
        <a href="https://cloud.google.com/security/privacy/" target="_blank">Here's a link to Google's Cloud Data privacy policy.</a></p>
        <h2>High Fidelity APIs</h2>
        <p>When you use the Text to Speech app to speak or translate input text, you are sending a copy of your input text to High Fidelity's
        servers. High Fidelity does not store a copy of this text for any reason. High Fidelity does briefly store a copy of the speech audio file associated
        with your input text so that High Fidelity Interface may play back that speech audio file. That file is deleted 60 seconds after it is generated.</p>
    `;
    popupContainer.style.display = "block";
}


function closePopup(event) {
    event.stopPropagation();
    
    var popupContainer = document.getElementById("popupContainer");
    popupContainer.style.display = "none";
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
        if (voices[i].languageCode.indexOf("en") === -1) {
            continue;
        }

        var input = document.createElement("input");
        input.id = `sampleButton${i}`;
        input.setAttribute("type", "button");
        input.setAttribute("data-voiceName", voices[i].voiceName);
        var voiceName = voices[i].voiceName;
        voiceName = voiceName.replace(voices[i].languageCode + "-", "");
        input.value = `${voices[i].languageCode} ${voiceName}`;
        input.addEventListener("click", function(event) {
            sampleButtonClicked(event.target.getAttribute("data-voiceName"));
        });
        
        sampleButtonContainer.appendChild(input);
    }
}


function fillSubmitButtonContainer(voices) {
    var submitButtonContainer = document.getElementById("submitButtonContainer");
    for (var i = 0; i < voices.length; i++) {
        if (voices[i].languageCode.indexOf("en") === -1) {
            continue;
        }

        var input = document.createElement("input");
        input.id = `submitButton${i}`;
        input.setAttribute("type", "button");
        input.setAttribute("data-voiceName", voices[i].voiceName);
        var voiceName = voices[i].voiceName;
        voiceName = voiceName.replace(voices[i].languageCode + "-", "");
        input.value = `${voices[i].languageCode} ${voiceName}`;
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
    
    // This won't do anything unless the DOM has focus, which means it likely won't do anything
    // most of the time in HiFi.
    var inputText = document.getElementById("inputText");
    inputText.focus();
}


function ttsResponseReceived() {
    document.getElementById("loadingContainer").style.display = "none";

    var inputText = document.getElementById("inputText");
    inputText.focus();
    inputText.setSelectionRange(0, inputText.value.length);
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