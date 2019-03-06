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

    // Plays the specified sound at the specified volume at number wheel's position
    var NUMBER_WHEEL = "{57e5e385-3968-4ebf-8048-a7650423d83b}";
    var injector;
    function playSound(sound, volume) {
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
            }
            injector = Audio.playSound(sound, {
                position: Entities.getEntityProperties(NUMBER_WHEEL, 'position').position,
                volume: volume
            });
        }
    }


    // Update the "status" text area in the app's UI with the supplied `statusText`
    var lastStatusText = "Nothing to report!";
    function sendStatusUpdateToUI(statusText) {
        if (statusText) {
            lastStatusText = statusText;
        }
        ui.sendMessage({
            app: 'bingoBossApp',
            method: "updateStatus",
            statusText: lastStatusText
        });
    }

    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    // Play the "beginning game" sound and then, halfway through the sound, call a server method on the 
    // Bingo wheel to turn the Bingo lights on
    var BEGINNING_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoBeginning.wav"));
    var MS_PER_S = 1000;
    var HALF = 0.5;
    function lightsOn() {
        playSound(BEGINNING_SOUND, 1);
        Script.setTimeout(function() {
            Entities.callEntityServerMethod(NUMBER_WHEEL, 'lightsOn');
        }, BEGINNING_SOUND.duration * MS_PER_S * HALF);
    }

    // Play the "open registration" sound and then, halfway through the sound, call a server method on the 
    // Bingo wheel to open registration
    var OPEN_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoBoomOpener.wav"));
    var TEN_PERCENT = 0.1;
    function openRegistration() {
        playSound(OPEN_SOUND, 1);
        Script.setTimeout(function() {
            Entities.callEntityServerMethod(NUMBER_WHEEL, 'openRegistration');
        }, OPEN_SOUND.duration * MS_PER_S * TEN_PERCENT);
    }
    
    // Play the "close registration" sound and then, halfway through the sound, call a server method on the 
    // Bingo wheel to close registration
    var CLOSE_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoGong.wav"));
    var THIRTY_FIVE_PERCENT = 0.35;
    function closeRegistration() {
        playSound(CLOSE_SOUND, 1);
        Script.setTimeout(function() {
            Entities.callEntityServerMethod(NUMBER_WHEEL, 'closeRegistration');
        }, CLOSE_SOUND.duration * MS_PER_S * THIRTY_FIVE_PERCENT);
    }

    // Play the "new round" sound and then call a server method on the 
    // Bingo wheel to start a new round
    var NEW_ROUND_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoOrgan.wav"));
    function newRound() {
        playSound(NEW_ROUND_SOUND, 1);
        Entities.callEntityServerMethod(NUMBER_WHEEL, 'newRound');
    }

    // Play the "lights out" sound and then, halfway through the sound, call a server method on the 
    // Bingo wheel to turn the lights out
    var FAREWELL_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoFarewell.wav"));
    var NINETY_PERCENT = 0.9;
    function lightsOut() {
        playSound(FAREWELL_SOUND, 1);
        Script.setTimeout(function() {
            Entities.callEntityServerMethod(NUMBER_WHEEL, 'lightsOut');
        }, FAREWELL_SOUND.duration * MS_PER_S * NINETY_PERCENT);
    }


    // Tell the number wheel to give prizes to avatars in the prize zones
    function givePrizes() {
        Entities.callEntityServerMethod(NUMBER_WHEEL, 'givePrizes');
    }

    // Handle EventBridge Web Events from bingoBossApp_ui.html
    function onWebEventReceived(event) {
        if (event.app === 'bingoBossApp') {
            switch (event.type) {
                case "eventBridgeReady":
                    sendStatusUpdateToUI();
                    break;
                case 'lightsOn':
                    lightsOn();
                    sendStatusUpdateToUI("Last button clicked: Lights On");
                    break;
                case 'openRegistration':
                    openRegistration();
                    sendStatusUpdateToUI("Last button clicked: Open Registration");
                    break;
                case 'closeRegistration':
                    closeRegistration();
                    sendStatusUpdateToUI("Last button clicked: Close Registration");
                    break; 
                case 'newRound':
                    newRound();
                    sendStatusUpdateToUI("Last button clicked: New Round");
                    break;
                case 'lightsOut':
                    lightsOut();
                    sendStatusUpdateToUI("Last button clicked: Lights Out");
                    break;
                case 'givePrizes':
                    givePrizes();
                    sendStatusUpdateToUI("Last button clicked: Give Prizes");
                    break;
                default:
                    print("error in detecting event.type in Bingo app");
            }
        }
    }

    // Setup AppUI module
    var ui;
    var AppUi = Script.require('appUi');
    var appPage = Script.resolvePath('ui/bingoBossApp_ui.html?1');
    function startup() {
        ui = new AppUi({
            buttonName: "BOSS",
            home: appPage,
            graphicsDirectory: Script.resolvePath("assets/icons/"),
            onMessage: onWebEventReceived
        });
    }

    startup();
})();
