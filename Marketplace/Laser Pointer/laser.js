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
    var equipped = false;
    var currentHand = null;
    var on = false;
    var beamFocus;
    var TRIGGER_CONTROLS = [Controller.Standard.LT, Controller.Standard.RT];
    var BEAM_LOCAL_OFFSET = {x:0, y:-0.0455, z:-0.04};
    var BEAM_LOCAL_DIRECTION = {x:0, y:0, z:-1000};
    var BEAM_MIN_SIZE = 0.01;
    var beamOverlay;
    var beam;
    var laserLine;
    
    Laser = function() {
        _this = this;
    };

    Laser.prototype = {
        startEquip: function(id, params) {
            equipped = true;
            currentHand = params[0] === "left" ? 0 : 1;
        },

        continueEquip: function(id, params) {
            if (!equipped) {
                return;
            }
            this.toggleWithTriggerPressure();
        },
        
        toggleWithTriggerPressure: function() {
            var triggerValue = Controller.getValue(TRIGGER_CONTROLS[currentHand]);
            if (triggerValue >= 0.97) {
                this.turnOn();
            } else {
                if (on) {
                    this.turnOff();
                }
            }
        },

        releaseEquip: function(id, params) {
            currentHand = null;
            equipped = false;
        },
        
        getBeamPosition: function() {
            var properties = Entities.getEntityProperties(this.entityID, ['position', 'rotation']);
            var beamLocalPosition = Vec3.multiplyQbyV(properties.rotation, BEAM_LOCAL_OFFSET);
            var beamWorldPosition = Vec3.sum(properties.position, beamLocalPosition);
            return beamWorldPosition;
        },

        getBeamDirection: function() {
            var rotation = Entities.getEntityProperties(this.entityID, ['rotation']).rotation;
            var beamAdjustedDirection = Vec3.multiplyQbyV(rotation, BEAM_LOCAL_DIRECTION);
            return beamAdjustedDirection;
        },

        turnOn: function() {
            var beamStart = this.getBeamPosition();
            var beamDirection = this.getBeamDirection();
            var beamEnd = Vec3.sum(beamStart, beamDirection);
            var beamPickRay = ({
                origin: beamStart,
                direction: beamEnd
            });
            /*var beamPickRay = RayPick.addPick({
                origin: beamStart,
                direction: beamEnd
            });*/
            // var intersection = RayPick.getEntityIntersection(beamPickRay);
            var intersection = Entities.findRayIntersection(beamPickRay, true, [], [_this], true, false);
            if (intersection.intersects) {
                var intersectionPosition = intersection.intersection;
                var beamPointDistance = Vec3.distance(intersectionPosition, beamStart);
                // print("beamPointDistance is " + beamPointDistance);
                // var beamDirectionNormalized = Vec3.normalize(beamDirection);
                // var direction = Vec3.multiply(beamDirectionNormalized, beamPointDistance);
                var beamSize = 0.01 * beamPointDistance;
                // print("beamSize is " + beamSize);
                // var newBeamPosition = Vec3.sum(beamStart, direction);
                if (beamSize < BEAM_MIN_SIZE) {
                    beamSize = BEAM_MIN_SIZE;
                }
                // print("beamSize is " + beamSize);
                if (!beamFocus) {
                    beamFocus = Entities.addEntity({
                        type: "Model",
                        modelURL: "https://hifi-content.s3.amazonaws.com/rebecca/laser/beam.fbx",
                        position: intersection.intersection,
                        dimensions: { x: beamSize , y: beamSize, z: beamSize },
                        color: { red:255, green:0, blue:0 },
                        name: "Laser Beam",
                        collisionless: true,
                        alpha: 1,
                        glow: 1,
                        solid: true
                    });
                    /* print("adding beam");
                    beam = Entities.addEntity({
                        type: "Line",
                        name: "normalDisplay",
                        linePoints: [beamStart, intersectionPosition],
                        color: { red: 255, green: 0, blue: 0 }
                    });*/
                    laserLine = Overlays.addOverlay("line3d", {
                        type: "line3d",
                        color: { red:0, green:255, blue:0 },
                        visible: true,
                        alpha: 1,
                        solid: true,
                        glow: 1.0,
                        ignoreRayIntersection: true, // always ignore this
                        drawInFront: 1, // Even when burried inside of something, show it.
                        start: beamStart,
                        end: intersectionPosition
                    });
                } else {
                    Entities.editEntity(beamFocus, {
                        position: intersection.intersection,
                        dimensions: { x: beamSize , y: beamSize, z: beamSize }
                    });
                    Entities.editEntity(beam, {
                        linePoints: [beamStart, intersectionPosition]
                    });
                    Overlays.editOverlay(laserLine, {
                        start: beamStart,
                        end: intersectionPosition
                    });
                }
            }
            on = true;
        },
        
        turnOff : function() {
            if (beamFocus !== undefined) {
                Entities.deleteEntity(beamFocus);
                Entities.deleteEntity(beam);
                Overlays.deleteOverlay(laserLine);
                beamFocus = undefined;
                beam = undefined;
            }
            on = false;
        },

        unload: function() {
            this.turnOff();
        },

        preload: function(entityID) {
            this.entityID = entityID;          
        }
    };

    return new Laser();
});
