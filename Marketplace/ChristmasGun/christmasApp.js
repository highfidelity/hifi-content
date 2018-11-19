//
//  christmasApp.js
//
//  Created by Rebecca Stankus on 11/01/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* global EventBridge */

(function() {
    var TABLET_BUTTON_IMAGE = Script.resolvePath('assets/icons/christmasTree-i.png?000');
    var TABLET_BUTTON_PRESSED = Script.resolvePath('assets/icons/christmasTree-a.png?000');
    var SEARCH_RADIUS = 100;
    var SONG_1 = SoundCache.getSound(Script.resolvePath('assets/sounds/holly.mp3?001'));
    var SONG_2 = SoundCache.getSound(Script.resolvePath('assets/sounds/white.mp3?002'));
    var SONG_3 = SoundCache.getSound(Script.resolvePath('assets/sounds/rudolph.mp3?002'));
    var SONG_4 = SoundCache.getSound(Script.resolvePath('assets/sounds/wonderland.mp3?002'));
    var SONG_5 = SoundCache.getSound(Script.resolvePath('assets/sounds/silver.mp3?002'));
    var BELLS_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/bells.mp3'));
    var Y_OFFSET_GUN = 0.4;
    var Y_OFFSET_SNOW = 2.4;

    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
    var appPage = Script.resolvePath('christmas.html?116');
    var button = tablet.addButton({
        text: 'CHRISTMAS',
        icon: TABLET_BUTTON_IMAGE,
        activeIcon: TABLET_BUTTON_PRESSED
    });
    var open = false;
    var injector;
    var gun;

    function getPositionGun() {
        var direction = Quat.getFront(MyAvatar.orientation);
        var distance = 1;
        var position = Vec3.sum(MyAvatar.position, Vec3.multiply(direction, distance));
        position.y += Y_OFFSET_GUN;
        return position;
    }

    function getPositionSnow() {
        var direction = Quat.getFront(MyAvatar.orientation);
        var distance = 3;
        var position = Vec3.sum(MyAvatar.position, Vec3.multiply(direction, distance));
        position.y += Y_OFFSET_SNOW;
        return position;
    }
  
    function findGun() {
        if (gun) {
            Entities.editEntity(gun, { position: getPositionGun() });
        } else {
            gun = Entities.addEntity({
                description: "CC_BY Alan Zimmerman",
                position: getPositionGun(),
                modelURL: Script.resolvePath("assets/models/x-mas-gun.fbx"),
                name: "Christmas App Gun",
                script: Script.resolvePath("christmasGun.js?006"),
                type: "Model",
                userData: JSON.stringify({
                    grabbableKey: {
                        "invertSolidWhileHeld": true
                    },
                    wearable: {
                        joints: {
                            RightHand: [{
                                x: 0.045345306396484375,
                                y: 0.1990046501159668,
                                z: 0.03554391860961914
                            },
                            {
                                x: -0.6955825090408325,
                                y: -0.7182574272155762,
                                z: -0.017593681812286377,
                                w: 0.0001678466796875
                            }],
                            LeftHand:[{
                                x: -0.06922149658203125,
                                y: 0.20457696914672852,
                                z: 0.044708251953125
                            },
                            {
                                x: 0.035721421241760254,
                                y: 0.0012054443359375,
                                z: 0.6234378814697266,
                                w: 0.7810330390930176
                            }]
                        }
                    }
                })
            }); 
        }
    }

    function onClicked() { 
        if (open) {
            tablet.gotoHomeScreen();
            if (gun) {
                Entities.deleteEntity(gun);
                gun = null;
            }
        } else {
            tablet.webEventReceived.connect(onWebEventReceived);
            tablet.gotoWebScreen(appPage);
            playSound(BELLS_SOUND, 0.3, "myPosition");
            findGun();
        }
    }

    function onWebEventReceived(event) {
        if (typeof event === 'string') {
            event = JSON.parse(event);
            if (event.app === "christmas1982") {
                switch (event.type) {
                    case 'snow':
                        createSnow();
                        break;
                    case 'song1':
                        playSound(SONG_1, 0.3, "overhead");
                        break;
                    case 'song2':
                        playSound(SONG_2, 0.3, "overhead");
                        break;
                    case 'song3':
                        playSound(SONG_3, 0.3, "overhead");
                        break;
                    case 'song4':
                        playSound(SONG_4, 0.3, "overhead");
                        break;
                    case 'song5':
                        playSound(SONG_5, 0.3, "overhead");
                        break;
                    case 'musicOff':
                        if (injector) {
                            injector.stop();
                        }
                        break;
                    case 'redLight':
                        setSpawn("redLight");
                        break;
                    case 'blueLight':
                        setSpawn("blueLight");
                        break;
                    case 'yellowLight':
                        setSpawn("yellowLight");
                        break;
                    case 'greenLight':
                        setSpawn("greenLight");
                        break;
                    case 'whiteLight':
                        setSpawn("whiteLight");
                        break;
                    case 'silverOrnament':
                        setSpawn("silverOrnament");
                        break;
                    case 'goldOrnament':
                        setSpawn("goldOrnament");
                        break;
                    case 'redOrnament':
                        setSpawn("redOrnament");
                        break;
                    case 'greenOrnament':
                        setSpawn("greenOrnament");
                        break;
                    case 'tree':
                        setSpawn("tree");
                        break;
                    case 'snowman':
                        setSpawn("snowman");
                        break;
                    case 'candyCane':
                        setSpawn("candyCane");
                        break;
                    case 'gift':
                        setSpawn("gift");
                        break;
                    case 'gifts':
                        setSpawn("gifts");
                        break;
                    case 'star':
                        setSpawn("star");
                        break;
                    default:
                        print(JSON.stringify(event));
                        print("error in detecting event.type");
                }
            }
        }
    }

    function createSnow() {
        var snowing = false;
        Entities.findEntities(MyAvatar.position, SEARCH_RADIUS).forEach(function(nearbyEntity){
            var name = Entities.getEntityProperties(nearbyEntity, 'name').name;
            if (name === "Christmas App Snow") {
                Entities.deleteEntity(nearbyEntity);
                snowing = true;
                return;
            }
        });
        if (!snowing) {
            Entities.addEntity({
                alpha: 0.3499999940395355,
                alphaFinish: 0,
                alphaStart: 0,
                angularDamping: 0,
                colorFinish: {
                    blue: 0,
                    green: 0,
                    red: 0
                },
                position: getPositionSnow(),
                colorStart: {
                    blue: 0,
                    green: 0,
                    red: 0
                },
                damping: 0,
                dimensions: {
                    x: 12.077852249145508,
                    y: 12.077852249145508,
                    z: 12.077852249145508
                },
                emitDimensions: {
                    x: 5,
                    y: 2,
                    z: 5
                },
                emitAcceleration: {
                    x: 0,
                    y: -0.20000000298023224,
                    z: 0
                },
                emitOrientation: {
                    w: 0.7071068286895752,
                    x: -1.5259198335115798e-05,
                    y: 0.7071068286895752,
                    z: -1.5259198335115798e-05
                },
                emitRate: 300,
                emitSpeed: 0,
                emitterShouldTrail: true,
                grab: {
                    grabbable: false
                },
                lifespan: 5.71999979019165,
                maxParticles: 2500,
                name: "Christmas App Snow",
                particleRadius: 0.5799999833106995,
                polarFinish: 3.1415927410125732,
                radiusFinish: 0.10000000149011612,
                radiusSpread: 0.5,
                radiusStart: 0,
                rotation: {
                    w: 1,
                    x: -1.52587890625e-05,
                    y: -1.52587890625e-05,
                    z: -1.52587890625e-05
                },
                speedSpread: 0,
                spinFinish: 0.5759586691856384,
                spinSpread: 6.2831854820251465,
                spinStart: -1.8500490188598633,
                textures: Script.resolvePath("assets/textures/particle-offset-snowflake.jpg"),
                type: "ParticleEffect"
            });
        }
    }

    function setSpawn(item) {
        Entities.callEntityMethod(gun, 'setSpawn', [item]);
    }

    function onScreenChanged(type, url) {
        open = (url === appPage);
        button.editProperties({isActive: open});
        if (!open) {
            if (gun) {
                Entities.deleteEntity(gun);
                gun = null;
                tablet.webEventReceived.disconnect(onWebEventReceived);
            }
        }
    }

    function appEnding() {
        if (gun) {
            Entities.deleteEntity(gun);
            gun = null;
        }
        button.clicked.disconnect(onClicked);
        tablet.removeButton(button);
        tablet.screenChanged.disconnect(onScreenChanged);
    }

    function playSound(sound, volume, where) {
        var soundPosition;
        if (where === "overhead") {
            soundPosition = getPositionSnow();
        } else if (where === "myPosition"){
            soundPosition = MyAvatar.position;
        }
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
            }
            injector = Audio.playSound(sound, {
                position: soundPosition,
                volume: volume,
                clientOnly: false
            });
        }
    }

    this.unload = function() {
        if (injector) {
            injector.stop();
        }
    };

    button.clicked.connect(onClicked);
    tablet.screenChanged.connect(onScreenChanged);
    Script.scriptEnding.connect(appEnding);
}());
