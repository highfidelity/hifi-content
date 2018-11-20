//
//  edibleItem.js
//
//  created by Rebecca Stankus on 11/13/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// This client script will be on the candy cane and gingerbread man so that when a user the item and places it 
// near their head, the item will disappear and a crunch sound will be heard.

(function() { 
    var EAT_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/eat.mp3'));
    var CHECK_RADIUS = 0.25; // distance from head at which item is considered "eaten"

    var _this;

    var injector;
    
    function EdibleItem() {
        _this = this;
    }

    EdibleItem.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
        },

        // When this item collides with another entity (excluding collisions with the gun as it travels through
        // the barrel), we will set its velocity to 0 to stop it and set its dynamic property to false so it will 
        // not fall or bounce around when bumped.
        collisionWithEntity: function(idA, idB, collision) {
            if (collision.type === 0) { // type 0 is the start of a collision. This prevents multiple calls
                var nameOfOtherEntity = Entities.getEntityProperties(idB, 'name').name;
                if (nameOfOtherEntity !== "Christmas App Gun") {
                    Entities.editEntity(idA, {
                        velocity: { x: 0, y: 0, z: 0 },
                        dynamic: false
                    });
                }
            }
        },

        // Here, we will check the distance between the item and the user's head. If it is close enough (determined by 
        // the CHECK_RADIUS value), we will delete the item and play the "eating" sound. We check for both head and 
        // neck joints to cover some cases where an avatar may not have a "Head" joint, for instance, Robimos.
        checkIfNearHead: function() {
            var position = Entities.getEntityProperties(_this.entityID, "position").position;
            var foodDistance = CHECK_RADIUS * MyAvatar.scale;
            if (Vec3.distance(position, MyAvatar.getJointPosition("Head")) < foodDistance || 
                Vec3.distance(position, MyAvatar.getJointPosition("Neck")) < foodDistance) {
                _this.playSound(EAT_SOUND, 0.1);
                Entities.deleteEntity(_this.entityID);
            }
        },

        // When the user grabs the item, we begin checking the distance betweenthe item and the user's head for HMD
        startNearGrab: function() {
            Script.update.connect(_this.checkIfNearHead());
        },

        // We also want to check if the item is grabbed in desktop via mouseclick
        startDistanceGrab: function() {
            Script.update.connect(_this.checkIfNearHead);
        },

        // When the user releases the item, we will stop checking the distance. This will cover both desktop and HMD
        releaseGrab: function() {
            Script.update.disconnect(_this.checkIfNearHead);
        },

        // Checks for a sound already playing and if one is found, stops it. Then it plays the new sound
        playSound: function(sound, volume) {
            if (sound.downloaded) {
                if (injector) {
                    injector.stop();
                }
                injector = Audio.playSound(sound, {
                    position: Entities.getEntityProperties(_this.entityID, 'position').position,
                    volume: volume,
                    localOnly: true
                });
            }
        }
    };

    return new EdibleItem();
});
