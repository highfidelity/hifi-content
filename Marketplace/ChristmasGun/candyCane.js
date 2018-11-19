//
//  christmasItem.js
//
//  created by Rebecca Stankus on 11/13/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() { 
    var _this;
    var EAT_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/eat.mp3?'));
    var CHECK_RADIUS = 0.25;

    var injector;
    var interval;
    
    function ChristmasItem() {
        _this = this;
    }

    ChristmasItem.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
        },

        collisionWithEntity: function(idA, idB, collision) {
            if (collision.type === 0) {
                var nameOfOtherEntity = Entities.getEntityProperties(idB, 'name').name;
                if (nameOfOtherEntity !== "Christmas App Gun") {
                    Entities.editEntity(idA, {
                        velocity: { x: 0, y: 0, z: 0 },
                        dynamic: false
                    });
                }
            }
        },

        checkIfNearHead: function() {
            var position = Entities.getEntityProperties(_this.entityID, "position").position;
            var foodDistance = CHECK_RADIUS * MyAvatar.scale;
            if (Vec3.distance(position, MyAvatar.getJointPosition("Head")) < foodDistance || 
                Vec3.distance(position, MyAvatar.getJointPosition("Neck")) < foodDistance) {
                _this.playSound(EAT_SOUND, 0.1);
                Entities.deleteEntity(_this.entityID);
            }
        },

        startNearGrab: function() {
            Script.update.connect(_this.checkIfNearHead());
        },

        startDistanceGrab: function() {
            Script.update.connect(_this.checkIfNearHead);
        },

        releaseGrab: function() {
            Script.update.disconnect(_this.checkIfNearHead);
        },

        playSound: function(sound, volume) {
            if (sound.downloaded) {
                if (injector) {
                    injector.stop();
                }
                injector = Audio.playSound(sound, {
                    position: Entities.getEntityProperties(_this.entityID, 'position').position,
                    volume: volume
                });
            }
        },
        
        unload: function() {
            if (interval) {
                Script.clearInterval(interval);
            }
        }
    };

    return new ChristmasItem();
});
