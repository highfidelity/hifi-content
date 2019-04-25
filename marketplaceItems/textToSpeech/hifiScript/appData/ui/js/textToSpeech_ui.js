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

    var popupBackground = document.getElementById("popupBackground");
    var infoContentContainer = document.getElementById("infoContentContainer");
    document.getElementById("popupTitleText").innerHTML = "Data Privacy";

    infoContentContainer.style.display = "block";
    popupBackground.style.display = "block";
}


function openChangeVoicePopup(event) {
    event.stopPropagation();

    var popupBackground = document.getElementById("popupBackground");
    var changeVoiceContentContainer = document.getElementById("changeVoiceContentContainer");
    document.getElementById("popupTitleText").innerHTML = "Change Voice:";

    changeVoiceContentContainer.style.display = "block";
    popupBackground.style.display = "block";
}


function closePopup(event) {
    event.stopPropagation();

    document.getElementById("infoContentContainer").style.display = "none";
    document.getElementById("changeVoiceContentContainer").style.display = "none";

    var popupBackground = document.getElementById("popupBackground");
    popupBackground.style.display = "none";
}


function changeVoiceButtonClicked(voiceName, targetLanguageCode, gender) {
    document.getElementById("loadingContainer").style.display = "block";

    fillCurrentVoiceData(voiceName, targetLanguageCode, gender);

    emitAppSpecificEvent("changeVoiceButtonClicked", {
        voiceName: voiceName,
        targetLanguageCode: targetLanguageCode
    });
}


function translateTextThenSpeak() {
    document.getElementById("loadingContainer").style.display = "block";

    var inputText = document.getElementById("inputText");

    emitAppSpecificEvent("translateTextThenSpeak", {
        textToSpeak: inputText.value
    });
}


function fillChangeVoiceContentContainer(voices) {
    var changeVoiceContentContainer = document.getElementById("changeVoiceContentContainer");
    var currentVoiceGender;
    var currentLanguageCode;
    var currentVoiceName;
    for (var i = 0; i < voices.length; i++) {
        var input = document.createElement("input");
        input.id = `changeVoiceButton${i}`;
        input.setAttribute("type", "button");

        currentVoiceName = voices[i].voiceName;
        input.setAttribute("data-voiceName", currentVoiceName);

        currentLanguageCode = voices[i].languageCode;
        input.setAttribute("data-targetLanguageCode", currentLanguageCode);

        currentVoiceGender = voices[i].voiceGender;
        input.setAttribute("data-voiceGender", currentVoiceGender);

        currentVoiceName = currentVoiceName.replace(voices[i].languageCode + "-", "");
        input.value = `${voices[i].languageCode} ${currentVoiceName}`;

        input.addEventListener("click", function (event) {
            changeVoiceButtonClicked(event.target.getAttribute("data-voiceName"), event.target.getAttribute("data-targetLanguageCode"), event.target.getAttribute("data-voiceGender"));
        });

        changeVoiceContentContainer.appendChild(input);
    }
}


function setupFirstRun() {
    var inputText = document.getElementById("inputText");

    inputText.value = `Hi there! Welcome to Text to Speech. Just type what you want me to say and then click "Say It".`;

    emitAppSpecificEvent("translateTextThenSpeak", {
        textToSpeak: inputText.value,
        forceLocalOnly: true
    });
}


function getLanguageTextFromLanguageCode(targetLanguageCode) {
    switch (targetLanguageCode) {
        case "en-US":
            return "English (US)";
        case "en-GB":
            return "English (GB)";
        case "en-AU":
            return "English (AU)";
        case "es-ES":
            return "Spanish (ES)";
        case "de-DE":
            return "German (DE)";
        case "zh-CN":
            return "Chinese (CN)";
        case "fr-FR":
            return "French (FR)";
        case "ru-RU":
            return "Russian (RU)";
        case "it-IT":
            return "Italian (IT)";
        case "ja-JP":
            return "Japanese (JP)";
        case "ko-KR":
            return "Korean (KR)";
        case "pl-PL":
            return "Polish (PL)";
        case "tr-TR":
            return "Turkish (TR)";
        default:
            return "Unknown Language";
    }
}


function fillCurrentVoiceData(selectedVoiceName, selectedVoiceLanguageCode, selectedVoiceGender) {
    var voiceLanguageText = document.getElementById("voiceLanguageText");
    voiceLanguageText.innerHTML = getLanguageTextFromLanguageCode(selectedVoiceLanguageCode);

    var voiceName = document.getElementById("voiceName");
    voiceName.innerHTML = selectedVoiceName;

    var voiceGender = document.getElementById("voiceGender");
    voiceGender.innerHTML = selectedVoiceGender;
}


// Disables the loading spinner
function initializeUI(data) {
    var voices = data.voices;

    for (var i = 0; i < voices.length; i++) {
        if (voices[i].voiceName === data.selectedVoice) {
            fillCurrentVoiceData(voices[i].voiceName, voices[i].languageCode, voices[i].voiceGender);
            break;
        }
    }

    fillChangeVoiceContentContainer(voices);

    var firstRun = data.firstRun;

    if (firstRun) {
        setupFirstRun();
    } else {
        document.getElementById("loadingContainer").style.display = "none";
        // This won't do anything unless the DOM has focus, which means it likely won't do anything
        // most of the time in HiFi.
        var inputText = document.getElementById("inputText");
        inputText.focus();
    }
}


function ttsResponseReceived() {
    document.getElementById("loadingContainer").style.display = "none";

    var inputText = document.getElementById("inputText");
    inputText.focus();
    inputText.setSelectionRange(0, inputText.value.length);
}


function textTranslated(data) {
    var translation = data.translation;

    var inputText = document.getElementById("inputText");
    inputText.value = translation;
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


        case "textTranslated":
            textTranslated(event.data);
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