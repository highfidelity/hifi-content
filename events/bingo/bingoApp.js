//
//  bingoApp.js
//
//  Created by Rebecca Stankus on 10/11/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* global Audio, Entities, EventBridge, MyAvatar, Script, SoundCache */

(function() {

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************

    /* PLAY SOUND: Plays the specified sound at the specified volume at the position of the game podium */
    var GAME_PODIUM = "{fdc0ec48-7c1b-4ab8-95ee-4f243f0a5c6f}";
    var soundPosition = Entities.getEntityProperties(GAME_PODIUM, 'position').position;
    var injector;
    function playSound(sound, volume) {
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
            }
            injector = Audio.playSound(sound, {
                position: soundPosition,
                volume: volume
            });
        }
    }

    /* ENCODE URL PARAMETERS: Formats data to send to Google sheet */
    function encodeURLParams(params) {
        var paramPairs = [];
        for (var key in params) {
            paramPairs.push(key + "=" + params[key]);
        }
        return paramPairs.join("&");
    }

    /* DEBUG PRINT: Enable or disable extra debugging messages */
    var DEBUG = 1;
    function debugPrint(msg) {
        if (DEBUG) {
            print(msg);
        }
    }

    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    /* GAME ON: This will play a sound and then, halfway through the sound, it will call a server method on the 
    wheel to begin the game */
    var NUMBER_WHEEL = "{57e5e385-3968-4ebf-8048-a7650423d83b}";
    var BEGINNING_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoBeginning.wav"));
    var MS_PER_S = 1000;
    var HALF = 0.5;
    function gameOn() {
        playSound(BEGINNING_SOUND, 1);
        Script.setTimeout(function() {
            Entities.callEntityServerMethod(NUMBER_WHEEL, 'gameOn');
        }, BEGINNING_SOUND.duration * MS_PER_S * HALF);
    }

    /* NEW ROUND: This will get the spreadsheet URL from an external file to clear the sheet,  play a sound, 
    call server methods on the wheel and avatar counter to reset the round, call the 
    sheet function that clears all entries, and reset the wheel text */
    var SPREADSHEET_URL_FILE = Script.resolvePath("bingoSheetURL.txt");
    var NEW_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoOrgan.wav"));
    var PLAYER_COUNTER_TEXT = "{15d6a1a1-c361-4c8e-8b9a-f4cb4ae2dd83}";
    var BINGO_WHEEL_TEXT = "{3a78b930-eba5-4f52-b906-f4fd78ad1ca9}";
    var CLEAR_URL_PARAM = encodeURLParams({ type: "clear" });
    var request = Script.require('request').request;
    function newRound() {
        var spreadsheetURL;
        request({
            uri: SPREADSHEET_URL_FILE
        }, function(error, response) {
            if (error || !response) {
                debugPrint("bingoApp.js: ERROR getting spreadsheet URL" + error || response);
                return;
            }
            spreadsheetURL = response;
            debugPrint("bingoApp.js: Successfully read spreadsheet URL from file! " + spreadsheetURL);
            playSound(NEW_SOUND, 1);
            request({
                uri: spreadsheetURL + "?" + CLEAR_URL_PARAM
            }, function (error, response) {
                debugPrint("bingoApp.js: Spreadsheet URL is " + spreadsheetURL + "?" + CLEAR_URL_PARAM);
                if (error || !response) {
                    debugPrint("bingoApp.js: ERROR when clearing Bingo entries!" + error || response);
                    return;
                }
                debugPrint("bingoApp.js: Successfully cleared Bingo entries from spreadsheet!");
            
                debugPrint("bingoApp.js: Resetting Bingo Wheel Number text (id: " + BINGO_WHEEL_TEXT + ")...");
                Entities.editEntity(BINGO_WHEEL_TEXT, {
                    text: "BINGO",
                    lineHeight: 1.1
                });
            
                debugPrint("bingoApp.js: Calling newRound on numberWheel (id: " + NUMBER_WHEEL + ")...");
                Entities.callEntityServerMethod(NUMBER_WHEEL, 'newRound');
            
                debugPrint("bingoApp.js: Calling reset on PLAYER_COUNTER_TEXT (id: " + PLAYER_COUNTER_TEXT + ")...");
                Entities.callEntityServerMethod(PLAYER_COUNTER_TEXT, 'reset');
            });
        });
    }

    /* GAME OVER: This will play a sound and call a server method on the wheel to end the game */
    var FAREWELL_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoFarewell.wav"));
    function gameOver() {
        playSound(FAREWELL_SOUND, 1);
        Script.setTimeout(function() {
            Entities.callEntityServerMethod(NUMBER_WHEEL, 'gameOver');
        }, FAREWELL_SOUND.duration * 1000 * 0.9);
    }

    /* OPEN REGISTRATION: This will play a sound and call a server method on the wheel to open registration */
    var OPEN_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoBoomOpener.wav"));
    function openRegistration() {
        playSound(OPEN_SOUND, 1);
        Script.setTimeout(function() {
            Entities.callEntityServerMethod(NUMBER_WHEEL, 'openRegistration');
        }, OPEN_SOUND.duration * 1000 * 0.2);
    }
    
    /* CLOSE REGISTRATION: This will play a sound and call a server method on the wheel to close registration */
    var CLOSE_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoGong.wav"));
    var WAIT_TO_CLOSE_SECONDS = 35;
    function closeRegistration() {
        playSound(CLOSE_SOUND, 1);
        Script.setTimeout(function() {
            Entities.callEntityServerMethod(NUMBER_WHEEL, 'closeRegistration');
        }, CLOSE_SOUND.duration * 1000 * WAIT_TO_CLOSE_SECONDS);
    }

    /* ON WEB EVENT: Call the correct function or print an error when an event is received from bingo.html */
    function onWebEventReceived(event) {
        if (event.app === 'bingo') {
            switch (event.type) {
                case 'gameOn':
                    gameOn();
                    break;
                case 'newRound':
                    newRound();
                    break;
                case 'gameOver':
                    gameOver();
                    break;
                case 'openRegistration':
                    openRegistration();
                    break;
                case 'closeRegistration':
                    closeRegistration();
                    break;  
                default:
                    print("error in detecting event.type in Bingo app");
            }
        }
    }

    /* ON APP START: Setup app UI, button, and messaging between it's html page and this script */
    var ui;
    var AppUi = Script.require('appUi');
    var appPage = Script.resolvePath('bingo.html');
    function startup() {
        ui = new AppUi({
            buttonName: "BOSS",
            home: appPage,
            graphicsDirectory: Script.resolvePath("assets/icons/"),
            onMessage: onWebEventReceived
        });
    }

    startup();
}());
