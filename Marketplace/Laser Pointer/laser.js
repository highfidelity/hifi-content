//
//  laser.js
//
//  Adapted from gun.js by David Back
//  by Rebecca Stankus on 01/05/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
/* globals RayPick */

(function() {

    var _this;

    var TRIGGER_CONTROLS = [Controller.Standard.LT, Controller.Standard.RT];
    var BEAM_LOCAL_OFFSET = {x: 0, y: -0.0055, z: -0.045};
    var BEAM_LOCAL_DIRECTION = {x: 0, y: 0, z: -1000};
    var BEAM_MIN_SIZE = 0.04;
    var TRIGGER_TOGGLE_VALUE = 0.97;
    var ORIGIN_SIZE_RATIO = 0.6;
    var BEAM_OFFSET_RATIO = 0.5;
    var MIN_FOCUS_SIZE = 0.02;
    var BEAM_WIDTH = 0.01;
    var HALF = 0.5;
    var LASER_ON_SOUND = SoundCache.getSound(Script.resolvePath("sounds/on.wav"));
    var FLASHLIGHT_ON_SOUND = SoundCache.getSound(Script.resolvePath("sounds/flashlight.wav"));
    var OFF_SOUND = SoundCache.getSound(Script.resolvePath("sounds/off.wav"));
    var AUDIO_VOLUME_LEVEL = 1;

    var equipped = false;
    var currentHand = null;
    var doNotRayPick = [];
    var triggerReleased = true;
    var injector;
    
    var Laser = function() {
        _this = this;
    };

    Laser.prototype = {

        on: false,
        flashlight: null,
        flashlightBeam: null,
        position: null,
        diameter: null,
        beamOffset: null,
        origin: null,
        beam: null,
        focus: null,

        preload: function(entityID) {
            _this.entityID = entityID;
            var dimensions = Entities.getEntityProperties(_this.entityID, 'dimensions').dimensions;
            _this.diameter = dimensions.x;
            _this.beamOffset = { 
                x: 0,
                y: 0,
                z: -(BEAM_OFFSET_RATIO * dimensions.z)
            };
        },

        startEquip: function(id, params) {
            equipped = true;
            currentHand = params[0] === "left" ? 0 : 1;
        },

        continueEquip: function(id, params) {
            if (!equipped) {
                var parentJointIndex = Entities.getEntityProperties(_this.entityID, 'parentJointIndex').parentJointIndex;
                currentHand = (parentJointIndex === MyAvatar.getJointIndex("LeftHand")) ? 0 : 1;
                equipped = true;
            } else {
                _this.toggleWithTriggerPressure();
            }
        },
        
        toggleWithTriggerPressure: function() {
            var triggerValue = Controller.getValue(TRIGGER_CONTROLS[currentHand]);
            if (_this.on) {
                if (_this.flashlight) {
                    if (triggerValue >= TRIGGER_TOGGLE_VALUE && triggerReleased) {
                        _this.turnOff();
                        triggerReleased = false;
                    } else if (triggerValue < TRIGGER_TOGGLE_VALUE && !triggerReleased) {
                        triggerReleased = true;
                    }
                } else {
                    if (triggerValue >= TRIGGER_TOGGLE_VALUE && triggerReleased) {
                        _this.flashlightMode();
                        triggerReleased = false;
                    } else if (triggerValue < TRIGGER_TOGGLE_VALUE && !triggerReleased) {
                        triggerReleased = true;
                    } else {
                        _this.turnOn();
                    }
                }
            } else {
                if (triggerValue >= TRIGGER_TOGGLE_VALUE && triggerReleased) {
                    _this.turnOn();
                    triggerReleased = false;
                } else if (triggerValue < TRIGGER_TOGGLE_VALUE && !triggerReleased) {
                    triggerReleased = true;
                }
            }
        },

        releaseEquip: function(id, params) {
            currentHand = null;
            equipped = false;
            _this.turnOff();
        },
        
        getBeamPosition: function() {
            var properties = Entities.getEntityProperties(_this.entityID, ['position', 'rotation']);
            var beamLocalPosition = Vec3.multiplyQbyV(properties.rotation, BEAM_LOCAL_OFFSET);
            var beamWorldPosition = Vec3.sum(properties.position, beamLocalPosition);
            return beamWorldPosition;
        },

        getBeamDirection: function() {
            var rotation = Entities.getEntityProperties(_this.entityID, ['rotation']).rotation;
            var beamAdjustedDirection = Vec3.multiplyQbyV(rotation, BEAM_LOCAL_DIRECTION);
            return beamAdjustedDirection;
        },

        playSound: function(sound) {
            if (sound.downloaded) {
                if (injector) {
                    injector.stop();
                }
                injector = Audio.playSound(sound, {
                    position: MyAvatar.position,
                    volume: AUDIO_VOLUME_LEVEL
                });
            }
        },

        turnOn: function() {
            var beamStart = _this.getBeamPosition();
            var beamDirection = _this.getBeamDirection();
            var beamDirectionLength = Vec3.length(beamDirection);
            var beamDirectionNormalized = Vec3.normalize(beamDirection);
            var beamPickRay = ({
                origin: beamStart,
                direction: beamDirectionNormalized
            });
            var entityIntersection = Entities.findRayIntersection(beamPickRay, true, [], doNotRayPick);
            var entityIntersectionDistance = entityIntersection.intersects ? entityIntersection.distance : Number.MAX_VALUE;
            var avatarIntersection = AvatarList.findRayIntersection(beamPickRay);
            var avatarIntersectionDistance = avatarIntersection.intersects ? avatarIntersection.distance : Number.MAX_VALUE;
            var intersection = null;
            var intersectEntityID = null;

            if (entityIntersection.intersects && entityIntersectionDistance < avatarIntersectionDistance && 
                entityIntersectionDistance < beamDirectionLength) {
                intersectEntityID = entityIntersection.entityID;
                intersection = entityIntersection;
            } else if (avatarIntersection.intersects && avatarIntersectionDistance < entityIntersectionDistance && 
                avatarIntersectionDistance < beamDirectionLength) {
                intersectEntityID = avatarIntersection.avatarID;
                intersection = avatarIntersection;
            }

            if (intersectEntityID) {
                var intersectionPosition = intersection.intersection;
                var beamPointDistance = Vec3.distance(intersectionPosition, beamStart);
                var beamSize = MIN_FOCUS_SIZE * beamPointDistance;

                if (beamSize < BEAM_MIN_SIZE) {
                    beamSize = BEAM_MIN_SIZE;
                }

                if (!_this.on) {
                    _this.playSound(LASER_ON_SOUND);
                    _this.focus = Entities.addEntity({
                        type: 'Model',
                        modelURL: Script.resolvePath("models/Glow-ball-red.fbx"),
                        dimensions: {x: beamSize, y: beamSize, z: beamSize},
                        name: "Laser Focus",
                        color: {red: 255, green: 0, blue: 0},
                        position: intersectionPosition,
                        collisionless: true,
                        userData: "{\"grabbableKey\":{\"grabbable\":false}}"
                    }, true);
                    doNotRayPick.push(_this.focus);
    
                    var originDiameter = ORIGIN_SIZE_RATIO * _this.diameter;

                    _this.origin = Entities.addEntity({
                        type: 'Model',
                        modelURL: Script.resolvePath("models/Glow-ball-red.fbx"),
                        name: "Laser Origin",
                        parentID: _this.entityID,
                        localPosition: _this.beamOffset,
                        dimensions: {x: originDiameter, y: originDiameter, z: originDiameter},
                        collisionless: true,
                        userData: "{\"grabbableKey\":{\"grabbable\":false}}",
                        description: "CC_BY Alan Zimmerman"
                    }, true);

                    doNotRayPick.push(_this.origin);
        
                    _this.beam = Entities.addEntity({
                        type: 'Model',
                        modelURL: Script.resolvePath("models/laser-beam-red.fbx"),
                        name: "Laser Beam",
                        parentID: _this.origin,
                        localPosition: {x: 0, y: 0, z: -(HALF * beamPointDistance)},
                        localRotation: Quat.normalize({}),
                        dimensions: {x: BEAM_WIDTH, y: BEAM_WIDTH, z: beamPointDistance},
                        userData: "{\"grabbableKey\":{\"grabbable\":false}}",
                        description: "CC_BY Alan Zimmerman"
                    }, true);
                    
                    doNotRayPick.push(_this.beam);
                } else {
                    Entities.editEntity(_this.focus, {
                        dimensions: {x: beamSize, y: beamSize, z: beamSize},
                        position: intersectionPosition
                    });

                    Entities.editEntity(_this.beam, {
                        localPosition: {x: 0, y: 0, z: -(HALF * beamPointDistance)},
                        localRotation: Quat.normalize({}),
                        dimensions: {x: BEAM_WIDTH, y: BEAM_WIDTH, z: beamPointDistance}
                    });
                }
            } else {
                print("no intersection");
            }

            _this.on = true;
        },

        flashlightMode: function() {
            _this.laserOff();
            _this.playSound(FLASHLIGHT_ON_SOUND);
            _this.flashlight = Entities.addEntity({
                type: "Light",
                color: {
                    blue: 22,
                    green: 88,
                    red: 255
                },
                cutoff: 18,
                dimensions: {
                    x: 3.652251958847046,
                    y: 3.652251958847046,
                    z: 11.81893539428711
                },
                exponent: 120,
                falloffRadius: 5,
                intensity: 5,
                isSpotlight: true,
                name: "Laser Flashlight",
                parentID: _this.entityID,
                localRotation: {
                    w: 0.999969482421875,
                    x: -0.007339596748352051,
                    y: 0.0000152587890625,
                    z: -0.0000457763671875
                },
                localPosition: {
                    x: -0.011594533920288086,
                    y: -0.0043926239013671875,
                    z: -0.04103599488735199
                },
                
                userData: "{\"grabbableKey\":{\"grabbable\":false}}"
            }, true);

            _this.flashlightBeam = Entities.addEntity({
                type: 'Model',
                modelURL: Script.resolvePath("models/light-beam.fbx"),
                name: "Laser Beam",
                parentID: _this.entityID,
                localPosition: {
                    x: -0.0007977485656738281,
                    y: -0.0014594662934541702,
                    z: -0.1237635612487793
                },
                localRotation: {
                    x: 0,
                    y: 0,
                    z: 0,
                    w: 1
                },
                dimensions: {
                    x: 0.0589,
                    y: 0.0589,
                    z: 0.1641
                },
                userData: "{\"grabbableKey\":{\"grabbable\":false}}",
                description: "CC_BY Alan Zimmerman"
            }, true);
        },

        laserOff: function() {
            Entities.deleteEntity(_this.focus);
            Entities.deleteEntity(_this.beam);
            Entities.deleteEntity(_this.origin);
            _this.focus = null;
            _this.beam = null;
            _this.origin = null;
        },

        lightOff: function() {
            Entities.deleteEntity(_this.flashlightBeam);
            Entities.deleteEntity(_this.flashlight);
            _this.flashlight = null;
            _this.flashlightBeam = null;
        },
        
        turnOff: function() {
            _this.playSound(OFF_SOUND);
            if (_this.flashlight) {
                this.lightOff();
            } else {
                _this.laserOff();
            }
            _this.on = false;
        },

        unload: function() {
            _this.turnOff();
        }
    };

    return new Laser();
});
