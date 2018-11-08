//
//  bingoApp.js
//
//  Created by Rebecca Stankus on 10/11/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* global EventBridge */

(function() {
    var TABLET_BUTTON_IMAGE = Script.resolvePath('assets/icons/bingo-i.svg');
    var TABLET_BUTTON_PRESSED = Script.resolvePath('assets/icons/bingo-a.svg');
    var SEARCH_RADIUS = 100;
    var SPREADSHEET_URL = "https://script.google.com/macros/s/AKfycbzFuuJ30c_qUZmBB8PnjLtunaJx1VbhSRFjsy_6wocR2_p7wohJ/exec";
    var BEGINNING_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoBeginning.wav"));
    var OPEN_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoBoomOpener.wav"));
    var CLOSE_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoGong.wav"));
    var NEW_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoOrgan.wav"));
    var FAREWELL_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoFarewell.wav"));

    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
    var appPage = Script.resolvePath('bingo.html?018');
    var button = tablet.addButton({
        text: 'BOSS',
        icon: TABLET_BUTTON_IMAGE,
        activeIcon: TABLET_BUTTON_PRESSED
    });
    var open = false;
    var numberWheel;
    var injector;

    function encodeURLParams(params) {
        var paramPairs = [];
        for (var key in params) {
            paramPairs.push(key + "=" + params[key]);
        }
        return paramPairs.join("&");
    }
    
    function findTargets() {
        Entities.findEntities(MyAvatar.position, SEARCH_RADIUS).forEach(function(nearbyEntity) {
            var name = Entities.getEntityProperties(nearbyEntity, ['name']).name;
            if (name && name.indexOf("Bingo") !== -1) {
                if (name === "Bingo Wheel") {
                    print("found the wheel from the app");
                    numberWheel = nearbyEntity;
                }
            }
        });
    }

    function onClicked() { 
        if (open) {
            tablet.gotoHomeScreen();
        } else {
            tablet.gotoWebScreen(appPage);
            findTargets();
        }
    }

    function gameOn() {
        playSound(BEGINNING_SOUND);
        Script.setTimeout(function() {
            Entities.callEntityServerMethod(numberWheel, 'gameOn');
        }, BEGINNING_SOUND.duration * 1000 * 0.5);
    }

    function newRound() {
        playSound(NEW_SOUND);
        Entities.callEntityServerMethod(numberWheel, 'newRound');
        print("new round... clearing server list and calling sheet to clear stored users");
        var searchParamString = encodeURLParams({
            username: "Boss",
            type: "clear"
        });
        var searchRequest = new XMLHttpRequest();
        searchRequest.open('GET', SPREADSHEET_URL + "?" + searchParamString);
        searchRequest.timeout = 10000;
        searchRequest.ontimeout = function() {
            print("bingo: request timed out");
        };
        searchRequest.send();
    }

    function gameOver() {
        playSound(FAREWELL_SOUND);
        Script.setTimeout(function() {
            Entities.callEntityServerMethod(numberWheel, 'gameOver');
        }, FAREWELL_SOUND.duration * 1000 * 0.9);
    }

    function openRegistration() {
        playSound(OPEN_SOUND);
        Script.setTimeout(function() {
            Entities.callEntityServerMethod(numberWheel, 'openRegistration');
        }, OPEN_SOUND.duration * 1000 * 0.2);
    }

    function closeRegistration() {
        playSound(CLOSE_SOUND);
        Script.setTimeout(function() {
            Entities.callEntityServerMethod(numberWheel, 'closeRegistration');
        }, CLOSE_SOUND.duration * 1000);
    }

    function onWebEventReceived(event) {
        print(JSON.stringify(event));
        if (typeof event === 'string') {
            event = JSON.parse(event);
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
    }

    function onScreenChanged(type, url) {
        open = (url === appPage);
        button.editProperties({isActive: open});
    }

    function appEnding() {
        button.clicked.disconnect(onClicked);
        tablet.removeButton(button);
        tablet.screenChanged.disconnect(onScreenChanged);
        tablet.webEventReceived.disconnect(onWebEventReceived);
    }

    function playSound(sound, volume, localOnly) {
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
            }
            injector = Audio.playSound(sound, {
                position: MyAvatar.position,
                volume: volume,
                localOnly: localOnly
            });
        }
    }

    this.unload = function() {
    };

    button.clicked.connect(onClicked);
    tablet.screenChanged.connect(onScreenChanged);
    tablet.webEventReceived.connect(onWebEventReceived);
    Script.scriptEnding.connect(appEnding);
}());
