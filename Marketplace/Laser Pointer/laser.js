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
    var BEAM_LOCAL_OFFSET = {x:0, y:-0.0055, z:-0.045};
    var BEAM_LOCAL_DIRECTION = {x:0, y:0, z:-1000};
    var BEAM_MIN_SIZE = 0.02;
    var TRIGGER_TOGGLE_VALUE = 0.97;
    var ORIGIN_SIZE_RATIO = 0.53;
    var BEAM_OFFSET_RATIO = 0.4357;
    var TWO = 2;

    var equipped = false;
    var currentHand = null;
    var on = false;
    var doNotRayPick = [];
    var triggerReleased = true;
    
    var Laser = function() {
        _this = this;
    };

    Laser.prototype = {
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
            if (on) {
                if (triggerValue >= TRIGGER_TOGGLE_VALUE && triggerReleased) {
                    _this.turnOff();
                    triggerReleased = false;
                } else if (triggerValue < TRIGGER_TOGGLE_VALUE && !triggerReleased) {
                    triggerReleased = true;
                } else {
                    _this.turnOn();
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

        turnOn: function() {
            var PICK_MAX_DISTANCE = 100;
            
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
                var beamSize = 0.01 * beamPointDistance;

                if (beamSize < BEAM_MIN_SIZE) {
                    beamSize = BEAM_MIN_SIZE;
                }

                if (!on) {
                    _this.focus = Entities.addEntity({
                        type: 'Sphere',
                        dimensions: {x: beamSize, y: beamSize, z: beamSize},
                        name: "Laser Focus",
                        color: {red: 255, green: 0, blue: 0},
                        position: intersectionPosition,
                        collisionless: true
                    }, true);
                    doNotRayPick.push(_this.focus);
    
                    var originDiameter = ORIGIN_SIZE_RATIO * _this.diameter;

                    _this.origin = Entities.addEntity({
                        type: 'Sphere',
                        name: "Laser Origin",
                        parentID: _this.entityID,
                        localPosition: _this.beamOffset,
                        dimensions: {x: originDiameter, y: originDiameter, z: originDiameter},
                        color: {red: 255, green: 0, blue: 0},
                        collisionless: true
                    }, true);

                    doNotRayPick.push(_this.origin);
        
                    _this.beam = Entities.addEntity({
                        lifetime: 360,
                        type: 'Line',
                        name: "Laser Beam",
                        canCastShadow: false,
                        glow: 1.0,
                        lineWidth: 5,
                        alpha: 0.5,
                        ignoreRayIntersection: true,
                        drawInFront: true,
                        color: {red: 255, green: 0, blue: 0},
                        parentID: _this.origin,
                        localPosition: {x: 0, y: 0, z: _this.beamOffset},
                        localRotation: Quat.normalize({}),
                        dimensions: Vec3.multiply(PICK_MAX_DISTANCE * TWO, Vec3.ONE),
                        linePoints: [Vec3.ZERO, {x: 0, y: 0, z: -beamPointDistance}]
                    }, true);

                    doNotRayPick.push(_this.beam);
                } else {
                    Entities.editEntity(_this.focus, {
                        dimensions: {x: beamSize, y: beamSize, z: beamSize},
                        position: intersectionPosition
                    });

                    Entities.editEntity(_this.beam, {
                        localPosition: {x: 0, y: this.beamOffset, z: 0},
                        localRotation: Quat.normalize({}),
                        dimensions: Vec3.multiply(PICK_MAX_DISTANCE * TWO, Vec3.ONE),
                        linePoints: [Vec3.ZERO, {x: 0, y: 0, z: -beamPointDistance}]
                    });
                }
            } else {
                print("no intersection");
            }

            on = true;
        },
        
        turnOff : function() {
            Entities.deleteEntity(_this.focus);
            Entities.deleteEntity(_this.beam);
            Entities.deleteEntity(_this.origin);
            _this.focus = null;
            _this.beam = null;
            _this.origin = null;
            on = false;
        },

        unload: function() {
            _this.turnOff();
        }
    };

    return new Laser();
});
