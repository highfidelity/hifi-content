//
//  tequilaClient.js
//
//  created by Rebecca Stankus on 02/05/18
//  updated 04/30/2018
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
    var SEARCH_RADIUS = 0.1;
    var FALL_ANIMATION = "https://hifi-content.s3.amazonaws.com/rebecca/Mexico/animations/Fall.fbx";
    var FALL_TIMEOUT_MS = 7000;
    var START_FRAME = 1;
    var FRAMES_PER_SECOND= 45;
    var END_FRAME = 150;
    var LIFETIME = 30;
    var DRINK_IT_DISTANCE = 0.2;
    var DONE_DRINKING_SHOT = 1000;
    var MOVE_GLASS_BEFORE_SPAWNING = 250;
    var VELOCITY_TO_BREAK = 2;
    var DRUNK_HAZE_1000_M = 1000;
    var DRUNK_HAZE_100_M = 100;
    var DRUNK_HAZE_50_M = 50;
    var DRUNK_HAZE_10_M = 10;

    var interval;
    var drunkZone = null;
    var tequila;
    var drinking = false;
    var stillFull = true;
    var spawner;
    var spawnerPosition;
    var canCreateNew = true;
    var breakURL = "https://hifi-content.s3.amazonaws.com/liv/dev/250709__aiwha__glass-break-2.wav";
    var breakSound = SoundCache.getSound(breakURL);
    var volumeLevel = 0.65;
    var _entityID;

    function TequilaGlass() {
        _this = this;
    }

    var shouldBreak = function(velocity) {
        return Math.abs(velocity.x) >= VELOCITY_TO_BREAK ||
      Math.abs(velocity.y) >= VELOCITY_TO_BREAK ||
      Math.abs(velocity.z) >= VELOCITY_TO_BREAK;
    };

    TequilaGlass.prototype = {
        remotelyCallable: ['drinkShot'],
        preload: function(entityID) {
            _this = this;
            _this.entityID = entityID;
            _this.position = Entities.getEntityProperties(_this.entityID, 'position').position;
            Entities.findEntities(_this.position, SEARCH_RADIUS).forEach(function(element){
                var name= Entities.getEntityProperties(element, 'name').name;
                if (name === "tequila spawner") {
                    spawner = element;
                }
            });
            spawnerPosition = Entities.getEntityProperties(spawner, 'position').position;
            Entities.getChildrenIDs(_this.entityID).forEach(function(element){
                if (Entities.getEntityProperties(element, 'name').name === "Tequila Shot") {
                    tequila = element;
                }
            });
        },

        collisionWithEntity : function(myID, theirID, collision) {
            var properties = Entities.getEntityProperties(myID, ['velocity', 'position']);
            if (shouldBreak(properties.velocity)) {
                if (breakSound.downloaded){
                    Audio.playSound(breakSound, {
                        volume: volumeLevel,
                        position: properties.position
                    });
                }
                Entities.callEntityServerMethod(myID, 'breakPlate', '');
            }
        },

        checkForDrunkZone: function(entityID, mouseEvent) {
            var isZone = false;
            Entities.findEntities(MyAvatar.getJointPosition("Hips"), SEARCH_RADIUS).forEach(function(element) {
                var properties = Entities.getEntityProperties(element, ['name', 'parentID']);
                if (properties.name === "Tequila Drunk Zone") {
                    if (properties.parentID === MyAvatar.sessionUUID) {
                        drunkZone = element;
                        isZone = true;
                    }
                }
            });
            return isZone;
        },

        startNearGrab: function(entityID, mouseEvent) {
            if (stillFull) {
                interval = Script.setInterval(function() {
                    _this.distanceCheck();
                }, DISTANCE_CHECK_INTERVAL_MS);
            }
            if (canCreateNew) {
                Script.setTimeout(function() {
                    Entities.callEntityServerMethod(spawner, 'spawnNewTequilaShot');
                    canCreateNew = false;
                }, MOVE_GLASS_BEFORE_SPAWNING);
            }
        },

        startFarGrab: function(entityID, mouseEvent) {
            _this.startNearGrab();
        },

        mouseReleaseOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.button === "Primary") {
                _this.drinkShot();
            }
            if (canCreateNew) {
                Entities.callEntityServerMethod(spawner, 'spawnNewTequilaShot');
                canCreateNew = false;
            }
        },

        releaseGrab: function(entityID, mouseEvent) {
            if (interval) {
                Script.clearInterval(interval);
            }
            if (canCreateNew) {
                Entities.callEntityServerMethod(spawner, 'spawnNewTequilaShot');
                canCreateNew = false;
            }
        },

        distanceCheck: function(entityID, mouseEvent) {
            var position = Entities.getEntityProperties(_this.entityID, 'position').position;
            var facePosition = MyAvatar.getJointPosition("Head");
            var distanceToFace = Vec3.distance(facePosition, position);
            if (distanceToFace < DRINK_IT_DISTANCE && !drinking) {
                _this.drinkShot();
                drinking = true;
            }
        },

        drinkShot: function(entityID, mouseEvent) {
            if (stillFull) {
                _this.playSound();
                if (_this.checkForDrunkZone()) {
                    Entities.editEntity(drunkZone, {lifetime: LIFETIME});
                    var zoneHazeProperties = Entities.getEntityProperties(drunkZone, 'haze').haze;
                    var hazeRange = zoneHazeProperties.hazeRange;
                    switch (hazeRange) {
                        case DRUNK_HAZE_1000_M:
                            Entities.editEntity(drunkZone, {haze: {
                                hazeColor:{
                                    red: 0,
                                    green: 0,
                                    blue: 0
                                },
                                hazeRange: 100,
                                hazeBackgroundBlend: 0.5,
                                lifetime: 30
                            }});
                            break;
                        case DRUNK_HAZE_100_M:
                            Entities.editEntity(drunkZone, {haze: {
                                hazeRange: 50,
                                hazeBackgroundBlend: 0.25,
                                lifetime: 30
                            }});
                            break;
                        case DRUNK_HAZE_50_M:
                            Entities.editEntity(drunkZone, {haze: {
                                hazeRange: 10,
                                hazeBackgroundBlend: 0.1,
                                lifetime: 30
                            }});
                            _this.fallDown();
                            break;
                        case DRUNK_HAZE_10_M:
                            _this.fallDown();
                            break;
                        default:
                            return;
                    }
                } else {
                    drunkZone = Entities.addEntity({
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
                        dimensions: {x: 0.5, y: 2, z: 0.5},
                        lifetime: LIFETIME,
                        parentID: MyAvatar.sessionUUID,
                        parentJointIndex: 0,
                        position: MyAvatar.getJointPosition("Hips")
                    }, true);
                }
                drunkZone = null;
                Script.setTimeout(function() {
                    drinking = false;
                }, DONE_DRINKING_SHOT);
            }
            var thisPosition = Entities.getEntityProperties(_this.entityID, 'position').position;
            if (Vec3.distance(thisPosition, spawnerPosition) > SEARCH_RADIUS) {
                Entities.editEntity(_this.entityID, {
                    lifetime: LIFETIME
                });
                Entities.deleteEntity(tequila);
                stillFull = false;
            } else {
                Entities.deleteEntity(_this.entityID);
                if (canCreateNew) {
                    Entities.callEntityServerMethod(spawner, 'spawnNewTequilaShot');
                    canCreateNew = false;
                }
            }
        },

        playSound: function(entityID, mouseEvent) {
            if (DRINK_SOUND.downloaded) {
                Audio.playSound(DRINK_SOUND, {
                    position: MyAvatar.getJointPosition("Head"),
                    volume: AUDIO_VOLUME_LEVEL
                });
            }
        },

        fallDown: function(entityID, mouseEvent) {
            MyAvatar.overrideAnimation(FALL_ANIMATION, FRAMES_PER_SECOND, 0, START_FRAME, END_FRAME);
            Script.setTimeout(function(){
                MyAvatar.restoreAnimation();
            }, FALL_TIMEOUT_MS);
        },

        unload: function(entityID, mouseEvent) {
            MyAvatar.restoreAnimation();
        }
    };

    return new TequilaGlass();
});
