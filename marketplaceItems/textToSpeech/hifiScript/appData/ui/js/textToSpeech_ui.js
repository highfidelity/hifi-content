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


// Opens the "Data Privacy" info popup
function openInfoPopup(event) {
    event.stopPropagation();

    var popupBackground = document.getElementById("popupBackground");
    var infoContentContainer = document.getElementById("infoContentContainer");
    document.getElementById("popupTitleText").innerHTML = "Data Privacy";

    infoContentContainer.style.display = "block";
    popupBackground.style.display = "block";
}


// Opens the "Change Voice" popup
function openChangeVoicePopup(event) {
    event.stopPropagation();

    var popupBackground = document.getElementById("popupBackground");
    var changeVoiceContentContainer = document.getElementById("changeVoiceContentContainer");
    document.getElementById("popupTitleText").innerHTML = "Change Voice:";

    changeVoiceContentContainer.style.display = "block";
    popupBackground.style.display = "block";
}


// Closes the popup (data privacy, change voice, etc)
function closePopup(event) {
    event.stopPropagation();

    document.getElementById("infoContentContainer").style.display = "none";
    document.getElementById("changeVoiceContentContainer").style.display = "none";

    var popupBackground = document.getElementById("popupBackground");
    popupBackground.style.display = "none";
}


// Called when the user clicks on the "play" button to preview a voice.
function previewVoiceButtonClicked(voiceName, targetLanguageCode) {
    emitAppSpecificEvent("previewVoiceButtonClicked", {
        voiceName: voiceName,
        targetLanguageCode: targetLanguageCode
    });
}


// Called when the user clicks on the button to change their preferred voice:
// 1. Removes the "selectedVoice" button class from all voice choice buttons.
// 2. Adds the "selectedVoice" button class to the selected voice.
// 3. Fills the "current voice data" in the bottom left of the main UI.
// 4. Sends a message to the App JS to change the user's preferred voice.
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

    fillCurrentVoiceData(getReadableVoiceName(voiceName), targetLanguageCode, gender);

    emitAppSpecificEvent("changeVoiceButtonClicked", {
        voiceName: voiceName,
        targetLanguageCode: targetLanguageCode
    });
}


// Called when the user presses a key on their keyboard when the input text field is focused.
function onKeyDown(event) {
    var key = event.keyCode;

    // If the user has pressed enter
    if (key === 13) {
        // Speak SSML text if the user is pressing CTRL+ENTER
        if (event.ctrlKey) {
            speakSSMLText();
        } else {
            translateTextThenSpeak();
        }
        return false;
    }
    else {
        return true;
    }
}


// 1. Show the loading spinner.
// 2. Send a message to the App JS to tell it to speak SSML text.
function speakSSMLText() {
    document.getElementById("loadingContainer").style.display = "block";

    var inputText = document.getElementById("inputText");

    emitAppSpecificEvent("speakSSMLText", {
        textToSpeak: inputText.value
    });
}


// 1. Show the loading spinner.
// 2. Send a message to the App JS to tell it to translate input text, then speak it.
function translateTextThenSpeak() {
    document.getElementById("loadingContainer").style.display = "block";

    var inputText = document.getElementById("inputText");

    emitAppSpecificEvent("translateTextThenSpeak", {
        textToSpeak: inputText.value
    });
}


// Sends a message to the App JS to tell it to stop any active TTS speech.
function stopSpeech() {
    emitAppSpecificEvent("stopSpeech");
}


// Translates a Google TTS API Voice name (i.e. "en-US-Wavenet-A") to something more readable
function getReadableVoiceName(voiceName) {
    var suffix = voiceName.split("-");
    suffix = suffix[(suffix.length - 1)];

    var readableVoiceName = `Voice ${suffix}`;

    return readableVoiceName;
}


// Called when a user clicks on a button to select a voice gender (after selecting a language):
// 1. Removes the "selectedButton" button class from all gender choice buttons.
// 2. Adds the "selectedButton" button class to the selected gender.
// 3. Clears all buttons from the `voiceButtonsContainer` (which holds all voice choices for this combination
//     of language and gender).
// 4. Determines the user's selected language in the UI.
// 5. Sorts the pre-filled `voicesObject` by all possible voices (for this combination of language and gender).
// 6. For each voice in (5), creates a clickable button for that voice choice.
// 7 (optional). If the caller sets `isStartingUp = true`, then this code won't call `changeVoiceButtonClicked()`.
//     Otherwise, that'll happen, and the user will be forced to choose the default voice associated with that gender.
function genderButtonClicked(gender, isStartingUp) {
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

    var possibleVoices = voicesObject[selectedLanguage][gender].sort();
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

        input.value = getReadableVoiceName(currentVoiceName);

        input.addEventListener("click", function (event) {
            changeVoiceButtonClicked(event.target.getAttribute("data-voiceName"), event.target.getAttribute("data-targetLanguageCode"), event.target.getAttribute("data-voiceGender"));
        });

        div.append(input);
        voiceButtonsContainer.appendChild(div);
    }

    if (!isStartingUp) {
        changeVoiceButtonClicked(possibleVoices[0], selectedLanguage, gender);
    }
}


// Called when a user clicks on a button to select a voice language:
// 1. Clears all buttons from the `genderButtonsContainer` (which holds all gender choices for this language).
// 2. Clears all buttons from the `voiceButtonsContainer` (which holds all voice choices for a combination
//     of language and gender).
// 3. Adds the "selectedButton" button class to the selected language.
// 4. Sorts the pre-filled `voicesObject` by all possible genders (for this language).
// 5. For each gender in (4), creates a clickable button for that gender choice.
// 6 (optional). If the caller sets `isStartingUp = true`, then this code won't call `genderButtonClicked()`.
//     Otherwise, that'll happen, and the user will be forced to choose the default voice associated with that language.
function languageButtonClicked(selectedLanguage, isStartingUp) {
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

    if (!isStartingUp) {
        genderButtonClicked(possibleGenders[0]);
    }
}


// Fills the `voicesObject` object using data from the passed `voices` object.
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


// Introduces the user to the TTS app if it's their first time using it.
function setupFirstRun() {
    var inputText = document.getElementById("inputText");

    inputText.value = `Hi there! Welcome to Text to Speech. Just type what you want me to say and then click "Say It".`;

    emitAppSpecificEvent("translateTextThenSpeak", {
        textToSpeak: inputText.value,
        forceLocalOnly: true
    });
}


// Translates a language code into a human-readable language choice.
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


// Fills the UI element in the bottom right of the app with current voice choice data.
function fillCurrentVoiceData(selectedVoiceName, selectedVoiceLanguageCode, selectedVoiceGender) {
    var voiceLanguageText = document.getElementById("voiceLanguageText");
    voiceLanguageText.innerHTML = getLanguageTextFromLanguageCode(selectedVoiceLanguageCode);

    var voiceName = document.getElementById("voiceName");
    voiceName.innerHTML = selectedVoiceName;

    var voiceGender = document.getElementById("voiceGender");
    voiceGender.innerHTML = selectedVoiceGender.toLowerCase();
}


// 1. Passes valid voices to `fillChangeVoiceContentContainer()`.
// 2. Sets up the selected button in the "Choose Voice" popup.
// 3a. If this is the first time the user has used the app, calls `setupFirstRun()`
// 3b. Otherwise, clears the loading spinner.
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
            fillCurrentVoiceData(getReadableVoiceName(voices[i].voiceName), voices[i].languageCode, voices[i].voiceGender);
            languageButtonClicked(voices[i].languageCode, true);
            genderButtonClicked(voices[i].voiceGender, true);

            var changeVoiceButtons = document.getElementsByClassName("changeVoiceButton");
            for (var j = 0; j < changeVoiceButtons.length; j++) {
                changeVoiceButtons[j].classList.remove("selectedButton");
                changeVoiceButtons[j].parentElement.classList.remove("selectedVoice");
        
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


// Clears the loading spinner and focuses all of the input text.
function ttsResponseReceived() {
    document.getElementById("loadingContainer").style.display = "none";

    var inputText = document.getElementById("inputText");
    inputText.focus();
    inputText.setSelectionRange(0, inputText.value.length);
}


// Called when the remote API returns translated text. Sets the input textbox
// to show the translated text.
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