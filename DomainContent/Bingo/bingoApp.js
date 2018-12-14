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
    var SEARCH_RADIUS = 200;
    var SPREADSHEET_URL = "https://script.google.com/macros/s/AKfycbzFuuJ30c_qUZmBB8PnjLtunaJx1VbhSRFjsy_6wocR2_p7wohJ/exec";
    var BEGINNING_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoBeginning.wav"));
    var OPEN_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoBoomOpener.wav"));
    var CLOSE_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoGong.wav"));
    var NEW_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoOrgan.wav"));
    var FAREWELL_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoFarewell.wav"));
    var PLAYER_COUNTER_TEXT = "{15d6a1a1-c361-4c8e-8b9a-f4cb4ae2dd83}";

    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
    var appPage = Script.resolvePath('bingo.html');
    var button = tablet.addButton({
        text: 'BOSS',
        icon: TABLET_BUTTON_IMAGE,
        activeIcon: TABLET_BUTTON_PRESSED
    });
    var open = false;
    var numberWheel;
    var soundPosition;
    var injector;
    var clickToPlaySign;

    function encodeURLParams(params) {
        var paramPairs = [];
        for (var key in params) {
            paramPairs.push(key + "=" + params[key]);
        }
        return paramPairs.join("&");
    }
    
    function findTargets() {
        Entities.findEntities(MyAvatar.position, SEARCH_RADIUS).forEach(function(nearbyEntity) {
            var properties = Entities.getEntityProperties(nearbyEntity, ['position', 'name']);
            if (properties.name && properties.name.indexOf("Bingo") !== -1) {
                if (properties.name === "Bingo Wheel") {
                    numberWheel = nearbyEntity;
                } else if (properties.name === "Bingo Wall") {
                    Entities.getChildrenIDs(nearbyEntity).forEach(function(childOfWall) {
                        var childName = Entities.getEntityProperties(childOfWall, 'name').name;
                        if (childName === "Bingo Click To Play Sign") {
                            clickToPlaySign = nearbyEntity;
                        }
                    });
                }
            } else if (properties.name === "Game Podium") {
                soundPosition = properties.position;
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
        playSound(BEGINNING_SOUND, 1);
        if (!numberWheel) {
            findTargets();
        }
        Script.setTimeout(function() {
            if (!numberWheel) {
                print("ERROR: Unable to find wheel");
            }
            Entities.callEntityServerMethod(numberWheel, 'gameOn');
        }, BEGINNING_SOUND.duration * 1000 * 0.5);
    }

    function newRound() {
        playSound(NEW_SOUND, 1);
        Entities.callEntityServerMethod(numberWheel, 'newRound');
        Entities.callEntityServerMethod(PLAYER_COUNTER_TEXT, 'reset');
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
        var bingoNumberTexts = Entities.findEntitiesByName("Bingo Wheel Number", MyAvatar.position, 100);
        Entities.editEntity(bingoNumberTexts[0], {
            text: "BINGO",
            lineHeight: 1.1
        });
    }

    function gameOver() {
        playSound(FAREWELL_SOUND, 1);
        Script.setTimeout(function() {
            Entities.callEntityServerMethod(numberWheel, 'gameOver');
        }, FAREWELL_SOUND.duration * 1000 * 0.9);
    }

    function openRegistration() {
        playSound(OPEN_SOUND, 1);
        Script.setTimeout(function() {
            Entities.callEntityServerMethod(numberWheel, 'openRegistration');
        }, OPEN_SOUND.duration * 1000 * 0.2);
    }

    function closeRegistration() {
        playSound(CLOSE_SOUND, 1);
        Script.setTimeout(function() {
            Entities.callEntityServerMethod(numberWheel, 'closeRegistration');
        }, CLOSE_SOUND.duration * 1000 * 0.35);
    }

    function onWebEventReceived(event) {
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

    this.unload = function() {
    };

    Entities.callEntityMethod(clickToPlaySign, 'removeCards');
    button.clicked.connect(onClicked);
    tablet.screenChanged.connect(onScreenChanged);
    tablet.webEventReceived.connect(onWebEventReceived);
    Script.scriptEnding.connect(appEnding);
}());
