//
//  drinkTequila.js
//
//  created by Rebecca Stankus on 02/05/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// get distance to mouth...if near, drink
(function() {

    var _this;

    var AUDIO_VOLUME_LEVEL = 0.5;
    var DRINK_SOUND = SoundCache.getSound(Script.resolvePath("Sounds/267425__gpenn76__long-slurp-swallow.wav"));
    var DISTANCE_CHECK_INTERVAL_MS = 100;
    var SEARCH_RADIUS = 2;
    var FALL_ANIMATION = "https://hifi-content.s3.amazonaws.com/rebecca/Mexico/animations/Fall.fbx";
    var FALL_TIMEOUT_MS = 7000;
    var START_FRAME = 1;
    var FRAMES_PER_SECOND= 45;
    var END_FRAME = 150;
    var DRUNK_ZONE_DIMENSIONS = {x: 0.5, y: 2, z: 0.5};
    var LIFETIME = 30;
    var DRINK_IT_DISTANCE = 0.2;
    var DONE_DRINKING_SHOT = 1000;
    var REMOVE_ELEPHANT = 30000;
    var WAIT_AFTER_GRABBING = 100;

    var interval;
    var drunkZone = null;
    var tequila;
    var drinking = false;
    var firstGrab = true;
    var pinkElephant1;

    this.preload = function(entityID) {
        _this = this;
        _this.entityID = entityID;
    };
    
    var checkForDrunkZone = function() {
        var isZone = false;
        Entities.findEntities(MyAvatar.position, SEARCH_RADIUS).forEach(function(element) {
            var properties = Entities.getEntityProperties(element, ['name', 'parentID']);
            if (properties.name === "Tequila Drunk Zone") {
                if (properties.parentID === MyAvatar.sessionUUID) {
                    drunkZone = element;
                    isZone = true;
                }
            }
        });
        return isZone;
    };

    this.startNearGrab = function() {
        if (firstGrab) {
            Script.setTimeout(function() {
                tequila = Entities.addEntity({
                    collisionless: 1,
                    color: {
                        blue: 45,
                        green: 170,
                        red: 247
                    },
                    dimensions: {
                        x: 0.05024334788322449,
                        y: 0.05231950804591179,
                        z: 0.049671873450279236
                    },
                    parentID: _this.entityID,
                    localPosition: {x:0, y:0, z:0},
                    localRotation: {x:0, y:0, z:90, w:0},
                    name: "Tequila Shot",
                    shape: "Cone",
                    type: "Shape",
                    userData: "{\"grabbableKey\":{\"grabbable\":false}}",
                    velocity: 0,
                    angularVelocity: 0,
                    damping: 1,
                    angularDamping: 1,
                    localVelocity: 0
                });
            }, WAIT_AFTER_GRABBING);
            interval = Script.setInterval(distanceCheck, DISTANCE_CHECK_INTERVAL_MS);
        }
    };

    this.clickReleaseOnEntity = function() {
        drinkShot();
    };

    this.releaseGrab = function() {
        if (interval) {
            Script.clearInterval(interval);
        }
        Entities.editEntity(_this.entityID, {lifetime: 10});
    };

    var distanceCheck = function() {
        var facePosition = MyAvatar.getJointPosition("Head");
        var distance = Vec3.distance(facePosition, Entities.getEntityProperties(_this.entityID, 'position').position);
        if (distance < DRINK_IT_DISTANCE && !drinking) {
            drinkShot();
            drinking = true;
        }
    };
    
    var drinkShot = function() {
        if (firstGrab) {
            playSound();
            Entities.deleteEntity(tequila);
            if (checkForDrunkZone()) {
                Entities.editEntity(drunkZone, {lifetime: LIFETIME});
                var zoneHazeProperties = Entities.getEntityProperties(drunkZone, 'haze').haze;
                var hazeRange = zoneHazeProperties.hazeRange;
                switch (hazeRange) {
                    case 1000:
                        Entities.editEntity(drunkZone, {haze: {
                            hazeColor:{
                                red: 0,
                                green: 0,
                                blue: 0
                            },
                            hazeRange: 100,
                            hazeBackgroundBlend: 0.5
                        }});
                        // show pink elephant overlay
                        break;
                    case 100:
                        Entities.editEntity(drunkZone, {haze: {
                            hazeRange: 50,
                            hazeBackgroundBlend: 0.25
                        }});
                        // show pink elephant overlay
                        break;
                    case 50:
                        Entities.editEntity(drunkZone, {haze: {
                            hazeRange: 10,
                            hazeBackgroundBlend: 0.1
                        }});
                        fallDown();
                        break;
                    case 10:
                        fallDown();
                        break;
                    default:
                        return;
                }
            } else {
                Entities.addEntity({
                    type: 'Zone',
                    name: 'Tequila Drunk Zone',
                    hazeMode: 'enabled',
                    haze: {
                        hazeColor:{
                            red: 215,
                            green: 217,
                            blue: 167
                        },
                        hazeRange: 1000,
                        hazeBackgroundBlend: 0.9
                    },
                    parentID: MyAvatar.sessionUUID,
                    parentJointIndex: 0,
                    position: MyAvatar.getJointPosition("Hips"),
                    dimensions: DRUNK_ZONE_DIMENSIONS,
                    lifetime: LIFETIME
                });
            /* pinkElephant1 = Overlays.addOverlay("model", {
                dimensions: {
                    x: 0.5,
                    y: 0.7,
                    z: 0.5
                },
                alpha:0.5,
                position: {x: 555.7121,y: 499.5868, z: 506.5796},
                modelURL: "https://hifi-content.s3.amazonaws.com/rebecca/Mexico/models/pinkElephant.fbx",
                rotation: {
                    w: 0.894934356212616,
                    x: -7.637845556018874e-07,
                    y: -0.4461978077888489,
                    z: -3.870036948683264e-07
                }
            });
            Script.setTimeout(function() {
                if (pinkElephant1) {
                    Overlays.deleteOverlay(pinkElephant1);
                }
            }, REMOVE_ELEPHANT);*/
            }
            drunkZone = null;
            Script.setTimeout(function() {
                drinking = false;
            }, DONE_DRINKING_SHOT);
        }
        if (Entities.getEntityProperties(_this.entityID, 'name').name !== "Tequila Shot Glass CC-BY Jarlan Perez") {
            firstGrab = false;
        }
    };

    var playSound = function() {
        if (DRINK_SOUND.downloaded) {
            Audio.playSound(DRINK_SOUND, {
                position: MyAvatar.getJointPosition("Head"),
                volume: AUDIO_VOLUME_LEVEL
            });
        }
    };

    var fallDown = function() {
        MyAvatar.overrideAnimation(FALL_ANIMATION, FRAMES_PER_SECOND, 0, START_FRAME, END_FRAME);
        Script.setTimeout(function(){
            MyAvatar.restoreAnimation();
        }, FALL_TIMEOUT_MS);
    };

    this.unload = function() {
        this.releaseGrab();
        MyAvatar.restoreAnimation();
        if (pinkElephant1) {
            Overlays.deleteOverlay(pinkElephant1);
        }
    };
});
