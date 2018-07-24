//
//  stageManager.js
//
//  Created by Rebecca Stankus on 06/11/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var TABLET_BUTTON_IMAGE = Script.resolvePath('svg/megaphone-i.svg');
    var TABLET_BUTTON_PRESSED = Script.resolvePath('svg/megaphone-a.svg');
    var CLIP_1 = SoundCache.getSound(Script.resolvePath('sounds/audio1.wav'));
    var CLIP_2 = SoundCache.getSound(Script.resolvePath('sounds/audio2.wav'));
    var SEARCH_RADIUS = 100;
    var NUMBER_OF_MUTE_BALLS = 4;
    var ONE_HUNDRED=100;

    var audioVolume = 0.7;
    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
    var appPage = Script.resolvePath('stageManager.html');
    var screenSetupPage = Script.resolvePath('screenSetup.html');
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
    var webOverlaySpawner;
    var webOverlayURL = "https://www.youtube.com/tv#/watch?v=zb2NUs0IDm4";
    
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
            print(event);
            event = JSON.parse(event);
            switch (event.type) {
                case 'setWebOverlayUrl' : 
                    webOverlayURL = event.url;
                    break;
                case 'spawnWebOverlay' :
                    webOverlaySpawner = Entities.addEntity({
                        type: 'Box',
                        position: stageCenterPosition,
                        visible: true,
                        userData: JSON.stringify({"url": webOverlayURL}),
                        grabbable: false,
                        name: "Web Overlay Spawner",
                        script: Script.resolvePath('webOverlaySpawner.js')
                    });
                    break;
                case 'removeSpawnedOverlay' :
                    Entities.deleteEntity(webOverlaySpawner); 
                    break;
                case 'backdropDown':
                    Entities.callEntityServerMethod(backdrop, 'lower');
                    break;
                case 'backdropUp':
                    Entities.callEntityServerMethod(backdrop, 'raise');
                    break;
                case 'silence':
                    silence();
                    break;
                case 'sound':
                    soundRestore();
                    break;
                case 'audio1':
                    playSound(CLIP_1);
                    break;
                case 'audio2':
                    playSound(CLIP_2);
                    break;
                case 'home':
                    tablet.gotoWebScreen(appPage);
                    break;
                case 'changeSet':
                    Entities.callEntityServerMethod(junglecube, 'raise');
                    break;
                case 'restoreSet':
                    Entities.callEntityServerMethod(junglecube, 'lower');
                    break;
                case 'volumeSlider':
                    if (injector) {
                        injector.setOptions( { volume: event.volume / ONE_HUNDRED } );
                    }
                    break;
                case 'screenSetup':
                    tablet.gotoWebScreen(screenSetupPage);
                    break;
                case 'webUpBoth':
                    screens.forEach(function(element) {
                        Entities.callEntityServerMethod(element, 'raise');
                    });
                    break;
                case 'webDownBoth':
                    screens.forEach(function(element) {
                        Entities.callEntityServerMethod(element, 'lower');
                    });
                    break;
                case 'webUpLeft':
                    Entities.callEntityServerMethod(screens[0], 'raise');
                    break;
                case 'webDownLeft':
                    Entities.callEntityServerMethod(screens[0], 'lower');
                    break;
                case 'webUpRight':
                    Entities.callEntityServerMethod(screens[1], 'raise');
                    break;
                case 'webDownRight':
                    Entities.callEntityServerMethod(screens[1], 'lower');
                    break;
                default:
                    print("error in detecting event.type");
            } 
        }
    }

    function onScreenChanged(type, url) {
        open = (url === appPage);
        button.editProperties({isActive: open});
    }

    function appEnding() {
        soundRestore();
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
            script: "http://hifi-content.s3.amazonaws.com/rebecca/Today/muteTest.js",
            type: "Sphere",
            userData: "{\"grabbableKey\":{\"grabbable\":false}}",
            visible: false
        });
        muteBalls.push(muteBall);
    }

    function soundRestore() {
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
