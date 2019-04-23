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
                languageCodes: ["en-US", "es-ES", "de-DE", "zh-CN", "fr-FR", "ru-RU"]
            }
        }, function (error, response) {
            if (error || response.status !== "success") {
                console.log("ERROR during call to /getVoices: " + JSON.stringify(error) + "\nFull response: " + JSON.stringify(response));
                return;
            }

            emitAppSpecificEvent("initializeUI", {
                "voices": response.voices
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


    function sampleButtonClicked(data) {
        var voiceName = data.voiceName;
        if (!voiceName) {
            console.log("User tried to get a voice sample, but they didn't specify a voice name.");
            emitAppSpecificEvent("ttsResponseReceived");
            return;
        }
        
        var volume = data.volume;

        request({
            uri: config.REQUEST_URL + "/getSample",
            method: "POST",
            json: true,
            body: {
                voiceName: voiceName
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


    var request = Script.require("https://hifi-content.s3.amazonaws.com/Experiences/Releases/modules/request/v1.0/request.js").request;
    var config = Script.require("./config.json");
    function generateSpeech(data) {
        var textToSpeak = data.textToSpeak;
        if (!textToSpeak || textToSpeak.length === 0) {
            console.log("User tried to speak some text, but they didn't specify any text.");
            emitAppSpecificEvent("ttsResponseReceived");
            return;
        }

        var voiceName = data.voiceName;
        var languageCode = data.languageCode;
        var volume = data.volume;

        request({
            uri: config.REQUEST_URL + "/generateSpeech",
            method: "POST",
            json: true,
            body: {
                text: textToSpeak,
                voiceName: voiceName,
                languageCode: languageCode || "en-US"
            }
        }, function (error, response) {
            if (error || response.status !== "success") {
                console.log("ERROR during call to /generateSpeech: " + JSON.stringify(error) + "\nFull response: " + JSON.stringify(response));
                return;
            }

            emitAppSpecificEvent("ttsResponseReceived");

            speakText(response.speechURL, volume, false);
        });
    }
    

    function autoTranslateButtonClicked(data) {
        var textToSpeak = data.textToSpeak;
        if (!textToSpeak || textToSpeak.length === 0) {
            console.log("User tried to auto-translate some text, but they didn't specify any text.");
            emitAppSpecificEvent("ttsResponseReceived");
            return;
        }

        var voiceName = data.voiceName;
        var targetLanguageCode = data.targetLanguageCode;
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
                console.log("ERROR during call to /generateSpeech: " + JSON.stringify(error) + "\nFull response: " + JSON.stringify(response));
                return;
            }

            generateSpeech({
                textToSpeak: response.translation,
                languageCode: targetLanguageCode,
                voiceName: voiceName,
                volume: volume
            });
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


            case "sampleButtonClicked":
                sampleButtonClicked(event.data);
                break;


            case "generateSpeech":
                generateSpeech(event.data);
                break;


            case "autoTranslateButtonClicked":
                autoTranslateButtonClicked(event.data);
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
