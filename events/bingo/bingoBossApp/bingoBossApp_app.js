//
//  bingoBossApp_app.js
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

    /* PLAY SOUND: Plays the specified sound at the specified volume at the position of the front of stage */
    var NUMBER_WHEEL = "{57e5e385-3968-4ebf-8048-a7650423d83b}";
    var soundPosition = Entities.getEntityProperties(NUMBER_WHEEL, 'position').position;
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

    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    /* GAME ON: This will play a sound and then, halfway through the sound, it will call a server method on the 
    wheel to begin the game */
    var BEGINNING_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoBeginning.wav"));
    var MS_PER_S = 1000;
    var HALF = 0.5;
    function lightsOn() {
        playSound(BEGINNING_SOUND, 1);
        Script.setTimeout(function() {
            Entities.callEntityServerMethod(NUMBER_WHEEL, 'lightsOn');
        }, BEGINNING_SOUND.duration * MS_PER_S * HALF);
    }

    /* OPEN REGISTRATION: This will play a sound and call a server method on the wheel to open registration */
    var OPEN_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoBoomOpener.wav"));
    var TEN_PERCENT = 0.1;
    function openRegistration() {
        playSound(OPEN_SOUND, 1);
        Script.setTimeout(function() {
            Entities.callEntityServerMethod(NUMBER_WHEEL, 'openRegistration');
        }, OPEN_SOUND.duration * MS_PER_S * TEN_PERCENT);
    }
    
    /* CLOSE REGISTRATION: This will play a sound and call a server method on the wheel to close registration */
    var CLOSE_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoGong.wav"));
    var THIRTY_FIVE_PERCENT = 0.35;
    function closeRegistration() {
        playSound(CLOSE_SOUND, 1);
        Script.setTimeout(function() {
            Entities.callEntityServerMethod(NUMBER_WHEEL, 'closeRegistration');
        }, CLOSE_SOUND.duration * MS_PER_S * THIRTY_FIVE_PERCENT);
    }

    /* NEW ROUND: Play sound and call wheel server function */
    var NEW_ROUND_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoOrgan.wav"));
    function newRound() {
        playSound(NEW_ROUND_SOUND, 1);
        Entities.callEntityServerMethod(NUMBER_WHEEL, 'newRound');
    }

    /* GAME OVER: This will play a sound and call a server method on the wheel to end the game */
    var FAREWELL_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoFarewell.wav"));
    var NINETY_PERCENT = 0.9;
    function lightsOut() {
        playSound(FAREWELL_SOUND, 1);
        Script.setTimeout(function() {
            Entities.callEntityServerMethod(NUMBER_WHEEL, 'lightsOut');
        }, FAREWELL_SOUND.duration * MS_PER_S * NINETY_PERCENT);
    }

    function givePrizes() {
        Entities.callEntityServerMethod(NUMBER_WHEEL, 'givePrizes');
    }

    /* ON WEB EVENT: Call the correct function or print an error when an event is received from bingoBossApp_ui.html */
    function onWebEventReceived(event) {
        if (event.app === 'bingo') {
            switch (event.type) {
                case 'lightsOn':
                    lightsOn();
                    break;
                case 'openRegistration':
                    openRegistration();
                    break;
                case 'closeRegistration':
                    closeRegistration();
                    break; 
                case 'newRound':
                    newRound();
                    break;
                case 'lightsOut':
                    lightsOut();
                    break;
                case 'givePrizes':
                    givePrizes();
                    break;
                default:
                    print("error in detecting event.type in Bingo app");
            }
        }
    }

    /* ON APP START: Setup app UI, button, and messaging between it's html page and this script */
    var ui;
    var AppUi = Script.require('appUi');
    var appPage = Script.resolvePath('bingoBossApp_ui.html?5');
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
