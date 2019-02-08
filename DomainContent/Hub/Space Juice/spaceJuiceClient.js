//
//  spaceJuiceClient.js
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

    var AUDIO_VOLUME_LEVEL = 0.25;
    var DRINK_SOUND = SoundCache.getSound(Script.resolvePath("sounds/drink.wav"));
    var BREAK_SOUND = SoundCache.getSound(Script.resolvePath("sounds/glassBreaking.wav"));
    var DISTANCE_CHECK_INTERVAL_MS = 100;
    var SEARCH_RADIUS = 0.1;
    var FALL_ANIMATION = Script.resolvePath("animations/Fall.fbx");
    var FALL_TIMEOUT_MS = 7000;
    var START_FRAME = 1;
    var FRAMES_PER_SECOND= 45;
    var END_FRAME = 150;
    var LIFETIME = 30;
    var DRINK_IT_DISTANCE = 0.2;
    var DONE_DRINKING_SHOT = 1000;
    var MOVE_GLASS_BEFORE_SPAWNING = 250;
    var VELOCITY_TO_BREAK = 1.75;
    var DRUNK_HAZE_1000_M = 1000;
    var DRUNK_HAZE_100_M = 100;
    var DRUNK_HAZE_50_M = 50;
    var DRUNK_HAZE_10_M = 10;

    var interval;
    var drunkZone = null;
    var drink;
    var drinking = false;
    var stillFull = true;
    var spawner;
    var canCreateNew = true;

    function Glass() {
        _this = this;
    }

    var shouldBreak = function(velocity) {
        return Math.abs(velocity.x) >= VELOCITY_TO_BREAK ||
        Math.abs(velocity.y) >= VELOCITY_TO_BREAK ||
        Math.abs(velocity.z) >= VELOCITY_TO_BREAK;
    };

    Glass.prototype = {
        remotelyCallable: ['drinkShot'],
        preload: function(entityID) {
            _this = this;
            _this.entityID = entityID;
            _this.position = Entities.getEntityProperties(_this.entityID, 'position').position;
            Entities.findEntities(_this.position, SEARCH_RADIUS).forEach(function(element) {
                var name = Entities.getEntityProperties(element, 'name').name;
                if (name === "space juice spawner") {
                    spawner = element;
                }
            });
            Entities.getChildrenIDs(_this.entityID).forEach(function(element) {
                if (Entities.getEntityProperties(element, 'name').name === "Space Shot") {
                    drink = element;
                }
            });
        },

        collisionWithEntity: function(myID, theirID, collision) {
            var properties = Entities.getEntityProperties(myID, ['velocity', 'position']);
            if (properties.velocity) {
                if (shouldBreak(properties.velocity)) {
                    _this.playSound(BREAK_SOUND, properties.position);
                    Entities.callEntityServerMethod(myID, 'breakGlass', '');
                }
            }
        },

        checkForDrunkZone: function(entityID, mouseEvent) {
            var isZone = false;
            Entities.findEntities(MyAvatar.getJointPosition("Hips"), SEARCH_RADIUS).forEach(function(element) {
                var properties = Entities.getEntityProperties(element, ['name', 'parentID']);
                if (properties.name === "Drunk Zone") {
                    if (properties.parentID === MyAvatar.sessionUUID) {
                        drunkZone = element;
                        isZone = true;
                    }
                }
            });
            return isZone;
        },

        startNearGrab: function(entityID, mouseEvent) {
            print("start near grab");
            Entities.editEntity(_this.entityID, {
                dynamic: true,
                lifetime: LIFETIME
            });
            if (stillFull) {
                interval = Script.setInterval(function() {
                    _this.distanceCheck();
                }, DISTANCE_CHECK_INTERVAL_MS);
            }
            if (canCreateNew) {
                Script.setTimeout(function() {
                    Entities.callEntityServerMethod(spawner, 'spawnNewGlass');
                    canCreateNew = false;
                }, MOVE_GLASS_BEFORE_SPAWNING);
            }
        },

        startFarGrab: function(entityID, mouseEvent) {
            Entities.editEntity(_this.entityID, {
                dynamic: true
            });

            _this.startNearGrab();
        },


        // this is called on release of far grab
        mouseReleaseOnEntity: function(entityID, mouseEvent) {
            Entities.editEntity(_this.entityID, {
                dynamic: true,
                lifetime: LIFETIME
            });
            if (canCreateNew) {
                Entities.callEntityServerMethod(spawner, 'spawnNewGlass');
                canCreateNew = false;
            }
        },

        // this is called on nearGrab release and mouseclick release
        releaseGrab: function(entityID, mouseEvent) {
            if (interval) {
                Script.clearInterval(interval);
            }
            if (JSON.stringify(mouseEvent) === "[]") {
                print("deleting entity in release grab");
                Entities.callEntityServerMethod(_this.entityID, 'deleteGlass');
            }
            if (canCreateNew) {
                Entities.callEntityServerMethod(spawner, 'spawnNewGlass');
                canCreateNew = false;
            }
        },

        distanceCheck: function(entityID, mouseEvent) {
            var position = Entities.getEntityProperties(_this.entityID, 'position').position;
            var facePosition = MyAvatar.getJointPosition("Head");
            var distanceToFace = Vec3.distance(facePosition, position);
            if (distanceToFace < DRINK_IT_DISTANCE && !drinking) {
                _this.drinkShot();
                var age = Entities.getEntityProperties(_this.entityID, "age").age;
                Entities.editEntity(_this.entityID, {
                    lifetime: age + LIFETIME
                });
                print("trying to delete entity");
                Entities.callEntityServerMethod(drink, 'deleteGlass');
                // Entities.deleteEntity(drink);
                stillFull = false;
                drinking = true;
            }
        },

        drinkShot: function(entityID, mouseEvent) {
            if (stillFull) {
                _this.playSound(DRINK_SOUND, MyAvatar.getJointPosition("Head"));
                if (_this.checkForDrunkZone()) {
                    var age = Entities.getEntityProperties(_this.entityID, "age").age;
                    var zoneHazeProperties = Entities.getEntityProperties(drunkZone, 'haze').haze;
                    var hazeRange = zoneHazeProperties.hazeRange;
                    switch (hazeRange) {
                        case DRUNK_HAZE_1000_M:
                            Entities.editEntity(drunkZone, {haze: {
                                hazeColor: {
                                    red: 0,
                                    green: 0,
                                    blue: 0
                                },
                                hazeRange: 100,
                                hazeBackgroundBlend: 0.5,
                                lifetime: age + LIFETIME
                            }});
                            break;
                        case DRUNK_HAZE_100_M:
                            Entities.editEntity(drunkZone, {haze: {
                                hazeRange: 50,
                                hazeBackgroundBlend: 0.25,
                                lifetime: age + LIFETIME
                            }});
                            break;
                        case DRUNK_HAZE_50_M:
                            Entities.editEntity(drunkZone, {haze: {
                                hazeRange: 10,
                                hazeBackgroundBlend: 0.1,
                                lifetime: age + LIFETIME
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
                        name: 'Drunk Zone',
                        hazeMode: 'enabled',
                        haze: {
                            hazeColor: {
                                red: 215,
                                green: 217,
                                blue: 167
                            },
                            hazeRange: 1000,
                            hazeBackgroundBlend: 0.9
                        },
                        dimensions: { x: 0.5, y: 2, z: 0.5 },
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
            Entities.callEntityServerMethod(spawner, 'spawnIfNeeded');
        },

        playSound: function(sound, position) {
            if (sound.downloaded) {
                Audio.playSound(sound, {
                    position: position,
                    volume: AUDIO_VOLUME_LEVEL
                });
            }
        },

        fallDown: function(entityID, mouseEvent) {
            MyAvatar.overrideAnimation(FALL_ANIMATION, FRAMES_PER_SECOND, 0, START_FRAME, END_FRAME);
            Script.setTimeout(function() {
                MyAvatar.restoreAnimation();
            }, FALL_TIMEOUT_MS);
        },

        unload: function(entityID, mouseEvent) {
            MyAvatar.restoreAnimation();
        }
    };

    return new Glass();
});
