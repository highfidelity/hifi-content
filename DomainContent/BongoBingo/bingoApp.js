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
    var BINGO_CHANNEL = "BingoChannel";
    var TABLET_BUTTON_IMAGE = Script.resolvePath('assets/icons/bingo-i.svg');
    var TABLET_BUTTON_PRESSED = Script.resolvePath('assets/icons/bingo-a.svg');
    var SEARCH_RADIUS = 100;
    var PLAY_BINGO_SCRIPT = Script.resolvePath('bingoCardSpawner.js?003');

    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
    var appPage = Script.resolvePath('bingo.html?008');
    var button = tablet.addButton({
        text: 'BOSS',
        icon: TABLET_BUTTON_IMAGE,
        activeIcon: TABLET_BUTTON_PRESSED
    });
    var open = false;
    var gameOnLights = [];
    var numberWheel;
    var registrationLight;
    var registrationSign;
    
    function findTargets() {
        Entities.findEntities(MyAvatar.position, SEARCH_RADIUS).forEach(function(nearbyEntity) {
            var name = Entities.getEntityProperties(nearbyEntity, ['name']).name;
            if (name.indexOf("Bingo") !== -1) {
                if (name.indexOf("Wall Light") !== -1) {
                    // skip it--handled in wheel script
                } else if (name.indexOf("Bingo Click To Play Light") !== -1) {
                    registrationLight = nearbyEntity;
                } else if (name.indexOf("Light") !== -1) {
                    gameOnLights.push(nearbyEntity);
                } else if (name === "Bingo Wheel") {
                    numberWheel = nearbyEntity;
                } else if (name === "Bingo Click To Play") {
                    registrationSign = nearbyEntity;
                }
            }
        });
    }

    function onClicked() { 
        if (open) {
            tablet.gotoHomeScreen();
        } else {
            tablet.gotoWebScreen(appPage);
        }
    }

    function gameOn() {
        resetGame();
        gameOnLights.forEach(function(light) {
            Entities.editEntity(light, { locked: false });
            Entities.editEntity(light, { visible: true });
            Entities.editEntity(light, { locked: true });
        });
    }

    function resetGame() {
        Entities.callEntityMethod(numberWheel, 'reset');
    }

    function gameOver() {
        resetGame();
        closeRegistration();
        gameOnLights.forEach(function(light) {
            Entities.editEntity(light, { locked: false });
            Entities.editEntity(light, { visible: false });
            Entities.editEntity(light, { locked: true });
        });
    }

    function openRegistration() {
        Entities.editEntity(registrationLight, { locked: false });
        Entities.editEntity(registrationLight, { visible: true });
        Entities.editEntity(registrationLight, { locked: true });
        Entities.editEntity(registrationSign, { locked: false });
        Entities.editEntity(registrationSign, { script: PLAY_BINGO_SCRIPT });
        Entities.editEntity(registrationSign, { locked: true });
    }

    function closeRegistration() {
        Entities.editEntity(registrationLight, { locked: false });
        Entities.editEntity(registrationLight, { visible: false });
        Entities.editEntity(registrationLight, { locked: true });
        Entities.editEntity(registrationSign, { locked: false });
        Entities.editEntity(registrationSign, { script: "" });
        Entities.editEntity(registrationSign, { locked: true });
    }

    function onWebEventReceived(event) {
        if (typeof event === 'string') {
            event = JSON.parse(event);
            if (event.app === 'bingo') {
                switch (event.type) {
                    case 'gameOn':
                        gameOn();
                        break;
                    case 'resetGame':
                        resetGame();
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
        Messages.unsubscribe(BINGO_CHANNEL);
        button.clicked.disconnect(onClicked);
        tablet.removeButton(button);
        tablet.screenChanged.disconnect(onScreenChanged);
        tablet.webEventReceived.disconnect(onWebEventReceived);
    }

    this.unload = function() {
    };

    findTargets();
    Messages.subscribe(BINGO_CHANNEL);
    button.clicked.connect(onClicked);
    tablet.screenChanged.connect(onScreenChanged);
    tablet.webEventReceived.connect(onWebEventReceived);

    Script.scriptEnding.connect(appEnding);
}());
