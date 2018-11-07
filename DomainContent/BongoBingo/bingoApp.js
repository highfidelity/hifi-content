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
    var SPREADSHEET_URL = "https://script.google.com/macros/s/AKfycbzFuuJ30c_qUZmBB8PnjLtunaJx1VbhSRFjsy_6wocR2_p7wohJ/exec";

    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
    var appPage = Script.resolvePath('bingo.html?018');
    var button = tablet.addButton({
        text: 'BOSS',
        icon: TABLET_BUTTON_IMAGE,
        activeIcon: TABLET_BUTTON_PRESSED
    });
    var open = false;
    var numberWheel;

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
        Entities.callEntityServerMethod(numberWheel, 'gameOn');
    }

    function newRound() {
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
        Entities.callEntityServerMethod(numberWheel, 'gameOver');
    }

    function openRegistration() {
        Entities.callEntityServerMethod(numberWheel, 'openRegistration');
    }

    function closeRegistration() {
        Entities.callEntityServerMethod(numberWheel, 'closeRegistration');
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
        Messages.unsubscribe(BINGO_CHANNEL);
        button.clicked.disconnect(onClicked);
        tablet.removeButton(button);
        tablet.screenChanged.disconnect(onScreenChanged);
        tablet.webEventReceived.disconnect(onWebEventReceived);
    }

    this.unload = function() {
    };

    Messages.subscribe(BINGO_CHANNEL);
    button.clicked.connect(onClicked);
    tablet.screenChanged.connect(onScreenChanged);
    tablet.webEventReceived.connect(onWebEventReceived);
    Script.scriptEnding.connect(appEnding);
}());
