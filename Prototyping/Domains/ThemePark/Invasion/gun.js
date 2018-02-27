//
//  gun.js
//
//  Created by David Back on 12/12/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() { 
    var invasionUtils = Script.require('./invasionUtils.js');
    
    var _this;
    var equipped = false;
    var currentHand = null;
    var canShoot = true;
    var laserID;
    var laserTimeout;
    var TRIGGER_CONTROLS = [Controller.Standard.LT, Controller.Standard.RT];
    var TRIGGER_THRESHOLD = 0.97;
    var BARREL_LOCAL_OFFSET = {x:0.015, y:0.065, z:-0.25};
    var BARREL_LOCAL_DIRECTION = {x:0, y:0, z:-1000};
    var GUN_CHANNEL_BASE = "GunChannel";
    var gunChannel;
    var gunHandler;
    
    function Gun() {
        _this = this;
    }

    Gun.prototype = {
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
            if (triggerValue >= TRIGGER_THRESHOLD) {
                if (canShoot === true) {
                    this.fire();
                    Messages.sendMessage(gunChannel, "Fire");
                    canShoot = false;
                }
            } else {
                canShoot = true;
            }
        },

        releaseEquip: function(id, params) {
            currentHand = null;
            equipped = false;
        },
        
        getBarrelPosition: function() {
            var properties = Entities.getEntityProperties(this.entityID, ['position', 'rotation']);
            var barrelLocalPosition = Vec3.multiplyQbyV(properties.rotation, BARREL_LOCAL_OFFSET);
            var barrelWorldPosition = Vec3.sum(properties.position, barrelLocalPosition);
            return barrelWorldPosition;
        },

        getBarrelDirection: function() {
            var rotation = Entities.getEntityProperties(this.entityID, ['rotation']).rotation;
            var barrelAdjustedDirection = Vec3.multiplyQbyV(rotation, BARREL_LOCAL_DIRECTION);
            return barrelAdjustedDirection;
        },

        fire: function() {
            this.stopFire();
            
            var fireStart = this.getBarrelPosition();
            var barrelDirection = this.getBarrelDirection();
            var fireEnd = Vec3.sum(fireStart, barrelDirection);
            
            var fireRay = {
                origin: fireStart,
                direction: fireEnd
            };
            var intersection = Entities.findRayIntersection(fireRay, true, [], [this.entityID]);
            if (intersection.intersects) {
                var distance = intersection.distance;
                var barrelDirectionNormalized = Vec3.normalize(barrelDirection);
                var direction = Vec3.multiply(barrelDirectionNormalized, distance);
                fireEnd = Vec3.sum(fireStart, direction);
                if (equipped) { // only send hit message from the avatar who has it equipped
                    var name = Entities.getEntityProperties(intersection.entityID, ['name']).name;
                    if (name.indexOf("Alien") !== -1) {
                        Messages.sendMessage(invasionUtils.ALIEN_CHANNEL_BASE, JSON.stringify({
                            type: "HitAlienWithLaser",
                            alienID: intersection.entityID
                        }));
                    }
                }
            }

            laserID = Overlays.addOverlay("line3d", {
                start: fireStart,
                end: fireEnd,
                color: { red:0, green:255, blue:255 },
                alpha: 1,
                visible: true,
                lineWidth: 10
            });
            
            Audio.playSound(SoundCache.getSound(invasionUtils.LASER_SOUND), {
                position: fireStart,
                volume: invasionUtils.LASER_VOLUME,
                localOnly: true
            });

            laserTimeout = Script.setTimeout(function() {
                _this.stopFire();
            }, 150);
        },
        
        stopFire : function() {
            if (laserTimeout !== undefined) {
                Script.clearTimeout(laserTimeout);
                laserTimeout = undefined;
            }
            if (laserID !== undefined) {
                Overlays.deleteOverlay(laserID);
                laserID = undefined;
            }
        },

        unload: function() {
            this.stopFire();
            Messages.unsubscribe(gunChannel);
            if (gunHandler !== undefined) {
                Messages.messageReceived.disconnect(gunHandler);
            }
        },

        preload: function(entityID) {
            this.entityID = entityID;
            gunChannel = GUN_CHANNEL_BASE + this.entityID;
            Messages.subscribe(gunChannel);
            gunHandler = function(channel, data, sender) {
                if (channel === gunChannel && sender !== MyAvatar.sessionUUID) {
                    _this.fire();
                }    
            };
            Messages.messageReceived.connect(gunHandler);           
        }
    };

    return new Gun();
});
