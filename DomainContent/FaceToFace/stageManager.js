//
//  stageManager.js
//
//  Created by Rebecca Stankus on 06/11/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    print("starting stageapp");
    
    var TABLET_BUTTON_IMAGE = Script.resolvePath('svg/megaphone-i.svg');
    var TABLET_BUTTON_PRESSED = Script.resolvePath('svg/megaphone-a.svg');
    var CLIP_1 = SoundCache.getSound(Script.resolvePath('sounds/audio1.wav'));
    var CLIP_2 = SoundCache.getSound(Script.resolvePath('sounds/audio2.wav?12367'));
    var SEARCH_RADIUS = 100;
    var NUMBER_OF_MUTE_BALLS = 4;
    var ONE_HUNDRED=100;

    var audioVolume = 0.7;
    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
    var appPage = Script.resolvePath('stageManager.html?482');
    var screenSetupPage = Script.resolvePath('screenSetup.html?12');
    var button = tablet.addButton({
        text: 'STAGE',
        icon: TABLET_BUTTON_IMAGE,
        activeIcon: TABLET_BUTTON_PRESSED
    });
    var open = false;
    var screens = [];
    var backdrop;
    var injector;
    var silent = false;
    var muteBalls = [];
    var stageCenterPosition;
    var ambisonicProperties = [];
    var junglecube;
    
    function findTargets() {
        Entities.findEntities(MyAvatar.position, SEARCH_RADIUS).forEach(function(element) {
            var properties = Entities.getEntityProperties(element, ['name', 'position']);
            if ((properties.name.indexOf("Today Web Entity Left") !== -1)) {
                screens[0] = element;
            } else if (properties.name.indexOf("Today Web Entity Right") !== -1) {
                screens[1] = element;
            } else if (properties.name.indexOf("Today Backdrop") !== -1) {
                backdrop = element;
            } else if (properties.name === "Red Carpet on Stage") {
                stageCenterPosition = properties.position;
            } else if (properties.name === "Jungle-Cube") {
                junglecube = element;
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

    function onWebEventReceived(event) {
        if (typeof event === 'string') {
            findTargets();
            event = JSON.parse(event);
            if (event.type === 'webUpLeft') {
                Entities.callEntityServerMethod(screens[0], 'raise');
            } else if (event.type === 'webDownLeft') {
                Entities.callEntityServerMethod(screens[0], 'lower');
            } else if (event.type === 'webUpRight') {
                Entities.callEntityServerMethod(screens[1], 'raise');
            } else if (event.type === 'webDownRight') {
                Entities.callEntityServerMethod(screens[1], 'lower');
            } else if (event.type === 'webUpBoth') {
                screens.forEach(function(element) {
                    Entities.callEntityServerMethod(element, 'raise');
                });
            } else if (event.type === 'webDownBoth') {
                screens.forEach(function(element) {
                    Entities.callEntityServerMethod(element, 'lower');
                });
            } else if (event.type === 'screenSetup') {
                tablet.gotoWebScreen(screenSetupPage);
            } else if (event.type === 'backdropDown') {
                Entities.callEntityServerMethod(backdrop, 'lower');
            } else if (event.type === 'backdropUp') {
                Entities.callEntityServerMethod(backdrop, 'raise');
            } else if (event.type === 'silence') {
                silence();
            } else if (event.type === 'sound') {
                sound();
            } else if (event.type === 'audio1') {
                playSound(CLIP_1);
            } else if (event.type === 'audio2') {
                playSound(CLIP_2);
            } else if (event.type === 'home') {
                tablet.gotoWebScreen(appPage);
            } else if (event.type === 'changeSet') {
                Entities.callEntityServerMethod(junglecube, 'raise');
            } else if (event.type === 'restoreSet') {
                Entities.callEntityServerMethod(junglecube, 'lower');
            } else if (event.type === 'volumeSlider') {
                if (injector) {
                    injector.setOptions( { volume: event.volume / ONE_HUNDRED } );
                }
            }
        }
    }

    function onScreenChanged(type, url) {
        open = (url === appPage);
        button.editProperties({isActive: open});
    }

    function appEnding() {
        sound();
        button.clicked.disconnect(onClicked);
        tablet.removeButton(button);
        tablet.screenChanged.disconnect(onScreenChanged);
        tablet.webEventReceived.disconnect(onWebEventReceived);
    }

    function silence() {
        if (!silent) {
            Entities.findEntities(MyAvatar.position, SEARCH_RADIUS).forEach(function(element) {
                var properties = Entities.getEntityProperties(element);
                if (properties.name === "ambisonic" 
                        || properties.name === "sfx_jungle_crickets_birds" 
                        || properties.name === "sfx_howler_monkeys") {
                    ambisonicProperties.push(properties);
                    Entities.deleteEntity(element);
                }
            });
                
            var positions = [];
            for (var i = 0; i < NUMBER_OF_MUTE_BALLS; i++) {
                positions[i] = JSON.stringify(stageCenterPosition);
                positions[i] = JSON.parse(positions[i]);
            }
            positions[0].y += 1;
            positions[1].y += 4;
            positions[2].y += 1;
            positions[2].z += 10;
            positions[3].y += 4;
            positions[3].y += 10;
            positions.forEach(function(element) {
                createMuteBall(element);
            });
        }
        silent = true;  
    }

    function createMuteBall(position) {
        var muteBall = Entities.addEntity({
            clientOnly: false,
            color: {
                blue: 0,
                green: 234,
                red: 255
            },
            collisionless: true,
            position: position,
            dimensions: {
                x: 0.20000000298023224,
                y: 0.20000000298023224,
                z: 0.20000000298023224
            },
            name: "Mute All",
            script: "http://hifi-content.s3.amazonaws.com/rebecca/Today/muteTest.js?125",
            type: "Sphere",
            userData: "{\"grabbableKey\":{\"grabbable\":false}}",
            visible: false
        });
        muteBalls.push(muteBall);
    }

    function sound() {
        if (silent) {
            ambisonicProperties.forEach(function(element) {
                Entities.addEntity(element);
            });
            muteBalls.forEach(function(element) {
                Entities.deleteEntity(element);
            });
            silent = false;
            ambisonicProperties = [];
        }
    }

    function playSound(sound) {
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
            }
            injector = Audio.playSound(sound, {
                position: stageCenterPosition,
                volume: audioVolume
            });
        }
    }
    
    button.clicked.connect(onClicked);
    tablet.screenChanged.connect(onScreenChanged);
    tablet.webEventReceived.connect(onWebEventReceived);

    Script.scriptEnding.connect(appEnding);
}());
