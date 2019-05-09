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
    // A wrapper function to easily send Event Bridge messages associated with this and only this app.
    function emitAppSpecificEvent(method, data) {
        var event = {
            app: APP_NAME,
            method: method,
            data: data
        };
        ui.sendMessage(event);
    }


    // 1. Requests voices from the remote TTS API associated with a list of language codes we want to support.
    // 2. Upon successful response, gets/sets the `firstRun` setting using the Settings API.
    // 3. Sends a message to the UI JS to initialize the UI with API voice data, the user's selected voice (from Settings),
    //     and the `firstRun` flag.
    var SUPPORTED_LANGUAGE_CODES = ["en-US", "en-GB", "en-AU",
        "es-ES", "de-DE", "zh-CN", "fr-FR", "ru-RU", "it-IT", "ja-JP", "ko-KR", "pl-PL", "tr-TR", "nl-NL", "pt-BR"];
    function getVoices() {
        request({
            uri: config.REQUEST_URL + "/getVoices",
            method: "POST",
            json: true,
            body: {
                languageCodes: SUPPORTED_LANGUAGE_CODES
            }
        }, function (error, response) {
            if (error || response.status !== "success") {
                console.log("ERROR during call to /getVoices: " +
                    JSON.stringify(error) + "\nFull response: " + JSON.stringify(response));
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


    // If `updatePositionInterval` is truthy, clear the `updatePositionInterval` interval.
    function maybeClearUpdatePositionInterval() {
        if (updatePositionInterval) {
            Script.clearTimeout(updatePositionInterval);
            updatePositionInterval = false;
        }
    }


    // This signal handler is called when the TTS speech sample is finished playing.
    function injectorFinished() {
        maybeClearUpdatePositionInterval();
        injector.finished.disconnect(injectorFinished);
    }


    // Called on an interval. Updates the position of the TTS speech sample injector to be
    // my avatar's location.
    function updateInjectorPosition() {
        injector.setOptions({
            position: MyAvatar.position
        });
    }


    // 1. Stops the existing TTS injector if one is playing.
    // 2. Calls `maybeClearUpdatePositionInterval()`
    // 3. Plays the specified sound at my avatar's position at the specified volume.
    //     The `localOnly` property defaults to false but can be overridden.
    // 4. Connects the "finished" signal to the newly-playing injector.
    // 5. Sets up an interval to update the position of the injector.
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


    // If a TTS audio injector is playing speech, stop it.
    function stopSpeech() {
        if (injector && injector.isPlaying()) {
            injector.stop();
        }
    }


    // Called after a speech sample file is generated, either when the user clicks the "preview voice"
    // button, or when the user is generating arbitrary speech from text input.
    var DEFAULT_VOLUME = 0.5;
    function speakText(speechURL, volume, localOnly) {
        var lastSpeechSound = SoundCache.getSound(speechURL);
        volume = volume || DEFAULT_VOLUME;
        if (lastSpeechSound.downloaded) {
            playSound(lastSpeechSound, volume, localOnly);
        } else {
            lastSpeechSound.ready.connect(function() {
                playSound(lastSpeechSound, volume, localOnly);   
            });
        }
    }


    // Calls the `getSample` remote API to get a sample of a specified voice, then speaks the returned sample.
    function previewVoiceButtonClicked(data) {
        var sampleVoiceName = data.voiceName;
        if (!sampleVoiceName) {
            console.log("User tried to sample a TTS voice, but they didn't specify a voice name.");
            return;
        }

        var volume = data.volume;

        request({
            uri: config.REQUEST_URL + "/getSample",
            method: "POST",
            json: true,
            body: {
                voiceName: sampleVoiceName
            }
        }, function (error, response) {
            if (error || response.status !== "success") {
                console.log("ERROR during call to /getSample: " +
                    JSON.stringify(error) + "\nFull response: " + JSON.stringify(response));
                return;
            }

            speakText(response.speechURL, volume, true);
        });
    }


    // Sets the user's preferred TTS voice using the Settings API. That voice is then used for
    // future speech samples.
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
    }


    // Calls the remote `generateSpeech` API with specified data. The API will return a URL
    // to the speech sample MP3, which will then be played.
    // The caller can specify options to this function - `forceLocalOnly` will force the speech to be
    // played locally only. `ssmlInput` means the remote API will parse the input text as SSML.
    function generateSpeech(data, options) {
        var forceLocalOnly = options.forceLocalOnly;
        var ssmlInput = options.ssmlInput;

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
                languageCode: targetLanguageCode,
                ssmlInput: ssmlInput
            }
        }, function (error, response) {
            if (error || response.status !== "success") {
                console.log("ERROR during call to /generateSpeech: " +
                    JSON.stringify(error) + "\nFull response: " + JSON.stringify(response));
                return;
            }

            emitAppSpecificEvent("ttsResponseReceived");

            speakText(response.speechURL, volume, forceLocalOnly || false);
        });
    }
    

    // Calls the remote `translateText` API, then calls `generateSpeech()` to generate a speech sample associated with that
    // translated text.
    // When the translated text comes back, this script will send an Event Bridge message to update the
    // text in the user's input text field with the translated text.
    var request = Script.require("https://hifi-content.s3.amazonaws.com/Experiences/Releases/modules/request/v1.0/request.js").request;
    var config = Script.require("./config.json");
    var selectedVoice = Settings.getValue("tts/voice", "en-US-Wavenet-C");
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
                console.log("ERROR during call to /translateText: " +
                    JSON.stringify(error) + "\nFull response: " + JSON.stringify(response));
                return;
            }

            emitAppSpecificEvent("textTranslated", {
                translation: response.translation
            });

            generateSpeech({
                textToSpeak: response.translation,
                volume: volume
            }, {
                forceLocalOnly: data.forceLocalOnly,
                ssmlInput: false
            });
        });
    }


    // Handle EventBridge messages from the UI JavaScript.
    function onWebEventReceived(event) {
        if (event.app !== APP_NAME) {
            return;
        }

        switch (event.method) {
            case "eventBridgeReady":
                onEventBridgeReady();
                break;


            case "previewVoiceButtonClicked":
                previewVoiceButtonClicked(event.data);
                break;


            case "changeVoiceButtonClicked":
                changeVoiceButtonClicked(event.data);
                break;


            case "translateTextThenSpeak":
                translateTextThenSpeak(event.data);
                break;


            case "speakSSMLText":
                generateSpeech(event.data, {ssmlInput: true});
                break;


            case "stopSpeech":
                stopSpeech();
                break;


            default:
                console.log("Unrecognized event method supplied to App JS: " + event.method);
                break;
        }
    }


    // Called on startup. Sets up the app's UI.
    var AppUi = Script.require('./modules/appUi.js');
    var APP_NAME = "TTS";
    var ui;
    function startup() {
        ui = new AppUi({
            buttonName: APP_NAME,
            home: Script.resolvePath("./ui/textToSpeech_ui.html"),
            onMessage: onWebEventReceived,
            graphicsDirectory: Script.resolvePath("./appIcons/")
        });
    }
    startup();

    
    // Called on shutdown.
    function shutdown() {
        if (ui.isOpen) {
            ui.onClosed();
        }

        maybeClearUpdatePositionInterval();
    }
    Script.scriptEnding.connect(shutdown);
}()); // END LOCAL_SCOPE
