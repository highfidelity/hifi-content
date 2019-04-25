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


function previewVoiceButtonClicked(voiceName, targetLanguageCode) {
    emitAppSpecificEvent("previewVoiceButtonClicked", {
        voiceName: voiceName,
        targetLanguageCode: targetLanguageCode
    });
}


function changeVoiceButtonClicked(voiceName, targetLanguageCode, gender) {
    var changeVoiceButtons = document.getElementsByClassName("changeVoiceButton");
    for (var i = 0; i < changeVoiceButtons.length; i++) {
        changeVoiceButtons[i].classList.remove("selectedButton");
        changeVoiceButtons[i].parentElement.classList.remove("selectedVoice");

        if (changeVoiceButtons[i].getAttribute("data-voiceName") === voiceName) {
            changeVoiceButtons[i].classList.add("selectedButton");
            changeVoiceButtons[i].parentElement.classList.add("selectedVoice");
        }
    }

    fillCurrentVoiceData(voiceName, targetLanguageCode, gender);

    emitAppSpecificEvent("changeVoiceButtonClicked", {
        voiceName: voiceName,
        targetLanguageCode: targetLanguageCode
    });
}


function onKeyPress() {
    var key = window.event.keyCode;

    // If the user has pressed enter
    if (key === 13) {
        translateTextThenSpeak();
        return false;
    }
    else {
        return true;
    }
}


function translateTextThenSpeak() {
    document.getElementById("loadingContainer").style.display = "block";

    var inputText = document.getElementById("inputText");

    emitAppSpecificEvent("translateTextThenSpeak", {
        textToSpeak: inputText.value
    });
}


function stopSpeech() {
    emitAppSpecificEvent("stopSpeech");
}


function getReadableVoiceName(voiceName, index) {
    var suffix = voiceName.split("-");
    suffix = suffix[(suffix.length - 1)];

    var readableVoiceName = `Voice ${(index + 1)}`;

    return readableVoiceName;
}


function genderButtonClicked(gender) {
    var genderButtons = document.getElementsByClassName("genderButton");
    for (var i = 0; i < genderButtons.length; i++) {
        genderButtons[i].classList.remove("selectedButton");

        if (genderButtons[i].getAttribute("data-gender") === gender) {
            genderButtons[i].classList.add("selectedButton");
        }
    }

    var voiceButtonsContainer = document.getElementById("voiceButtonsContainer");
    voiceButtonsContainer.innerHTML = "";

    var selectedLanguage;
    var languageButtons = document.getElementsByClassName("languageButton");
    for (var i = 0; i < languageButtons.length; i++) {
        if (languageButtons[i].classList.contains("selectedButton")) {
            selectedLanguage = languageButtons[i].getAttribute("data-language");
            break;
        }
    }

    if (!selectedLanguage) {
        console.error("Could not find selectedButton language in the DOM!");
        return;
    }

    var possibleVoices = voicesObject[selectedLanguage][gender];
    for (var i = 0; i < possibleVoices.length; i++) {
        var div = document.createElement("div");
        div.classList.add("changeVoiceButtonContainer");
        div.addEventListener("click", function (event) {
            previewVoiceButtonClicked(event.target.childNodes[0].getAttribute("data-voiceName"), event.target.childNodes[0].getAttribute("data-targetLanguageCode"), event.target.childNodes[0].getAttribute("data-voiceGender"));
        });

        var input = document.createElement("input");
        input.id = `changeVoiceButton${i}`;
        input.classList.add("changeVoiceButton");
        input.setAttribute("type", "button");

        currentVoiceName = possibleVoices[i];
        input.setAttribute("data-voiceName", currentVoiceName);
        
        input.setAttribute("data-targetLanguageCode", selectedLanguage);

        input.setAttribute("data-voiceGender", gender);

        input.value = getReadableVoiceName(currentVoiceName, i);

        input.addEventListener("click", function (event) {
            changeVoiceButtonClicked(event.target.getAttribute("data-voiceName"), event.target.getAttribute("data-targetLanguageCode"), event.target.getAttribute("data-voiceGender"));
        });

        div.append(input);
        voiceButtonsContainer.appendChild(div);
    }

    changeVoiceButtonClicked(possibleVoices[0], selectedLanguage, gender);
}


function languageButtonClicked(selectedLanguage) {
    var genderButtonsContainer = document.getElementById("genderButtonsContainer");
    genderButtonsContainer.innerHTML = "";

    var voiceButtonsContainer = document.getElementById("voiceButtonsContainer");
    voiceButtonsContainer.innerHTML = "";

    var languageButtons = document.getElementsByClassName("languageButton");
    for (var i = 0; i < languageButtons.length; i++) {
        languageButtons[i].classList.remove("selectedButton");
        
        if (languageButtons[i].getAttribute("data-language") === selectedLanguage) {
            languageButtons[i].classList.add("selectedButton");
        }
    }

    var possibleGenders = Object.keys(voicesObject[selectedLanguage]).sort();
    for (var i = 0; i < possibleGenders.length; i++) {
        var input = document.createElement("input");
        input.id = `genderButton${i}`;
        input.setAttribute("type", "button");
        input.classList.add("genderButton");
        var gender = possibleGenders[i];
        input.setAttribute("data-gender", gender);
        input.value = gender.toLowerCase();
        input.addEventListener("click", function (event) {
            genderButtonClicked(event.target.getAttribute("data-gender"));
        });
        genderButtonsContainer.appendChild(input);
    }

    genderButtonClicked(possibleGenders[0]);
}


var voicesObject = {};
function fillChangeVoiceContentContainer(voices) {
    var languageButtonsContainer = document.getElementById("languageButtonsContainer");
    var genderButtonsContainer = document.getElementById("genderButtonsContainer");
    var voiceButtonsContainer = document.getElementById("voiceButtonsContainer");

    languageButtonsContainer.innerHTML = "";
    genderButtonsContainer.innerHTML = "";
    voiceButtonsContainer.innerHTML = "";
    
    voicesObject = {};

    var currentVoiceResultObject;
    var currentVoiceGender;
    var currentLanguageCode;
    var currentVoiceName;
    for (var i = 0; i < voices.length; i++) {
        currentVoiceResultObject = voices[i];

        currentLanguageCode = currentVoiceResultObject.languageCode;
        if (!voicesObject[currentLanguageCode]) {
            voicesObject[currentLanguageCode] = {};
        }

        currentVoiceGender = currentVoiceResultObject.voiceGender;
        if (!voicesObject[currentLanguageCode][currentVoiceGender]) {
            voicesObject[currentLanguageCode][currentVoiceGender] = [];
        }

        currentVoiceName = currentVoiceResultObject.voiceName;
        voicesObject[currentLanguageCode][currentVoiceGender].push(currentVoiceName);
    }

    var possibleLanguages = Object.keys(voicesObject).sort(function(a, b) {
        var aLang = getLanguageTextFromLanguageCode(a);
        var bLang = getLanguageTextFromLanguageCode(b);
        if (aLang < bLang) {
            return -1;
        }
        if (aLang > bLang) {
            return 1;
        }
        return 0;
    });
    for (var i = 0; i < possibleLanguages.length; i++) {
        var input = document.createElement("input");
        input.id = `languageButton${i}`;
        input.setAttribute("type", "button");
        input.classList.add("languageButton");
        input.value = getLanguageTextFromLanguageCode(possibleLanguages[i]);
        input.setAttribute("data-language", possibleLanguages[i]);
        input.addEventListener("click", function (event) {
            languageButtonClicked(event.target.getAttribute("data-language"));
        });
        languageButtonsContainer.appendChild(input);
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
        case "nl-NL":
            return "Dutch (NL)";
        case "pt-BR":
            return "Portuguese (BR)";
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
    voiceGender.innerHTML = selectedVoiceGender.toLowerCase();
}


// Disables the loading spinner
function initializeUI(data) {
    var voices = data.voices;

    for (var i = 0; i < voices.length; i++) {
        if (voices[i].voiceName.indexOf("Wavenet") === -1 && voices[i].languageCode !== "es-ES" && voices[i].languageCode !== "zh-CN") {
            voices.splice(i, 1);
            i--;
        }
    }

    fillChangeVoiceContentContainer(voices);

    for (var i = 0; i < voices.length; i++) {
        if (voices[i].voiceName === data.selectedVoice) {
            fillCurrentVoiceData(voices[i].voiceName, voices[i].languageCode, voices[i].voiceGender);
            languageButtonClicked(voices[i].languageCode);
            genderButtonClicked(voices[i].voiceGender);

            var changeVoiceButtons = document.getElementsByClassName("changeVoiceButton");
            for (var j = 0; j < changeVoiceButtons.length; j++) {
                changeVoiceButtons[j].classList.remove("selectedButton");
        
                if (changeVoiceButtons[j].getAttribute("data-voiceName") === data.selectedVoice) {
                    changeVoiceButtons[j].classList.add("selectedButton");
                    changeVoiceButtons[j].parentElement.classList.add("selectedVoice");
                }
            }
            break;
        }
    }

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