"use strict";
/*jslint vars:true, plusplus:true, forin:true*/
/*global Tablet, Script,  */
/* eslint indent: ["error", 4, { "outerIIFEBody": 1 }] */
//
// textToSpeech.js
//
// Created by Zach Fox on 2019-04-22
// Copyright 2019 Zach Fox
//
// Distributed under the Apache License, Version 2.0
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function () { // BEGIN LOCAL_SCOPE
    function emitAppSpecificEvent(method, data) {
        var event = {
            app: APP_NAME,
            method: method,
            data: data
        };
        ui.sendMessage(event);
    }


    function getVoices() {
        request({
            uri: config.REQUEST_URL + "/getVoices",
            method: "POST",
            json: true,
            body: {
                languageCodes: ["en-US", "en-GB", "en-AU", "es-ES", "de-DE", "zh-CN", "fr-FR", "ru-RU", "it-IT", "ja-JP", "ko-KR", "pl-PL", "tr-TR"]
            }
        }, function (error, response) {
            if (error || response.status !== "success") {
                console.log("ERROR during call to /getVoices: " + JSON.stringify(error) + "\nFull response: " + JSON.stringify(response));
                return;
            }

            var firstRun = Settings.getValue("tts/firstRun", true);

            if (firstRun) {
                Settings.setValue("tts/firstRun", false);
            }

            emitAppSpecificEvent("initializeUI", {
                "voices": response.voices,
                "selectedVoice": selectedVoice,
                "firstRun": firstRun
            });
        });
    }


    // This is the message that's received from the UI JS that indicates that the UI is ready.
    function onEventBridgeReady() {
        getVoices();
    }


    function maybeClearUpdatePositionInterval() {
        if (updatePositionInterval) {
            Script.clearTimeout(updatePositionInterval);
            updatePositionInterval = false;
        }
    }


    function injectorFinished() {
        maybeClearUpdatePositionInterval();
        injector.finished.disconnect(injectorFinished);
    }


    function updateInjectorPosition() {
        injector.setOptions({
            position: MyAvatar.position
        });
    }


    var injector;
    var updatePositionInterval = false;
    var UPDATE_POSITION_INTERVAL_MS = 50;
    function playSound(sound, volume, localOnly) {
        if (injector) {
            injector.stop();
        }
        maybeClearUpdatePositionInterval();
        injector = Audio.playSound(sound, {
            position: MyAvatar.position,
            volume: volume,
            localOnly: localOnly || false
        });
        injector.finished.connect(injectorFinished);
        updatePositionInterval = Script.setInterval(updateInjectorPosition, UPDATE_POSITION_INTERVAL_MS);
    }


    function speakText(speechURL, volume, localOnly) {
        var lastSpeechSound = SoundCache.getSound(speechURL);
        volume = volume || 0.5;
        if (lastSpeechSound.downloaded) {
            playSound(lastSpeechSound, volume, localOnly);
        } else {
            lastSpeechSound.ready.connect(function() {
                playSound(lastSpeechSound, volume, localOnly);   
            });
        }
    }


    function changeVoiceButtonClicked(data) {
        var newVoiceName = data.voiceName;
        var newLanguageCode = data.targetLanguageCode;
        if (!newVoiceName) {
            console.log("User tried to change the TTS voice, but they didn't specify a voice name.");
            emitAppSpecificEvent("ttsResponseReceived");
            return;
        }
        if (!newLanguageCode) {
            console.log("User tried to change the TTS voice, but they didn't specify a target language code.");
            emitAppSpecificEvent("ttsResponseReceived");
            return;
        }

        selectedVoice = newVoiceName;
        targetLanguageCode = newLanguageCode;

        Settings.setValue("tts/voice", newVoiceName);
        Settings.setValue("tts/targetLanguageCode", newLanguageCode);
        
        var volume = data.volume;

        request({
            uri: config.REQUEST_URL + "/getSample",
            method: "POST",
            json: true,
            body: {
                voiceName: newVoiceName
            }
        }, function (error, response) {
            if (error || response.status !== "success") {
                console.log("ERROR during call to /getSample: " + JSON.stringify(error) + "\nFull response: " + JSON.stringify(response));
                return;
            }

            emitAppSpecificEvent("ttsResponseReceived");

            speakText(response.speechURL, volume, true);
        })
    }


    function generateSpeech(data, forceLocalOnly) {
        var textToSpeak = data.textToSpeak;
        if (!textToSpeak || textToSpeak.length === 0) {
            console.log("User tried to speak some text, but they didn't specify any text.");
            emitAppSpecificEvent("ttsResponseReceived");
            return;
        }

        var volume = data.volume;

        request({
            uri: config.REQUEST_URL + "/generateSpeech",
            method: "POST",
            json: true,
            body: {
                text: textToSpeak,
                voiceName: selectedVoice,
                languageCode: targetLanguageCode
            }
        }, function (error, response) {
            if (error || response.status !== "success") {
                console.log("ERROR during call to /generateSpeech: " + JSON.stringify(error) + "\nFull response: " + JSON.stringify(response));
                return;
            }

            emitAppSpecificEvent("ttsResponseReceived");

            speakText(response.speechURL, volume, forceLocalOnly || false);
        });
    }
    

    var request = Script.require("https://hifi-content.s3.amazonaws.com/Experiences/Releases/modules/request/v1.0/request.js").request;
    var config = Script.require("./config.json");
    var selectedVoice = Settings.getValue("tts/voice", "en-US-Wavenet-A");
    var targetLanguageCode = Settings.getValue("tts/targetLanguageCode", "en-US");
    function translateTextThenSpeak(data) {
        var textToSpeak = data.textToSpeak;
        if (!textToSpeak || textToSpeak.length === 0) {
            console.log("User tried to auto-translate some text, but they didn't specify any text.");
            emitAppSpecificEvent("ttsResponseReceived");
            return;
        }
        var volume = data.volume;

        request({
            uri: config.REQUEST_URL + "/translateText",
            method: "POST",
            json: true,
            body: {
                text: textToSpeak,
                targetLanguageCode: targetLanguageCode
            }
        }, function (error, response) {
            if (error || response.status !== "success") {
                console.log("ERROR during call to /translateText: " + JSON.stringify(error) + "\nFull response: " + JSON.stringify(response));
                return;
            }

            emitAppSpecificEvent("textTranslated", {
                translation: response.translation
            });

            generateSpeech({
                textToSpeak: response.translation,
                volume: volume
            }, data.forceLocalOnly);
        });
    }


    // Handle EventBridge messages from UI JavaScript.
    function onWebEventReceived(event) {
        if (event.app !== APP_NAME) {
            return;
        }

        switch (event.method) {
            case "eventBridgeReady":
                onEventBridgeReady();
                break;


            case "changeVoiceButtonClicked":
                changeVoiceButtonClicked(event.data);
                break;


            case "translateTextThenSpeak":
                translateTextThenSpeak(event.data);
                break;


            default:
                console.log("Unrecognized event method supplied to App JS: " + event.method);
                break;
        }
    }


    var AppUi = Script.require('./modules/appUi.js');
    var APP_NAME = "TTS";
    var ui;
    function startup() {
        ui = new AppUi({
            buttonName: APP_NAME,
            home: Script.resolvePath("./ui/textToSpeech_ui.html"),
            onMessage: onWebEventReceived
        });
    }
    startup();

    function shutdown() {
        if (ui.isOpen) {
            ui.onClosed();
        }

        maybeClearUpdatePositionInterval();
    }
    Script.scriptEnding.connect(shutdown);
}()); // END LOCAL_SCOPE
