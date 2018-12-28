//
//  ride.js
//
//  created by Rebecca Stankus on 01/24/18
//  updated 12/26/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var _this;

    var AUDIO_VOLUME_LEVEL = 0.8;
    var TIMEOUT_MS = 100;
    var BOW_SOUND = SoundCache.getSound(Script.resolvePath("Assets/Sounds/bow.wav"));
    var BELL_SOUND = SoundCache.getSound(Script.resolvePath("Assets/Sounds/bell.wav"));
    var CRASH_SOUND = SoundCache.getSound(Script.resolvePath("Assets/Sounds/crash.wav"));

    var playing = false;
    var injector;
    var topCenter;

    var Ride = function() {
        _this = this;
    };

    Ride.prototype = {
        preload: function(entityID){
            _this.entityID = entityID;
            var properties = Entities.getEntityProperties(_this.entityID, ["position", "dimensions"]);
            var newY = (properties.dimensions.y * 0.5) + properties.position.y;
            topCenter = {x: properties.position.x, y:newY, z: properties.position.z};
        },

        // In HMD, listen for collisions and then calculate the distance between the point of collision and the top 
        // center of the cymbal. If the collision occurred less than 0,1M from the center, play a bell sound. If it 
        // occurred between 0.1M and 0.2M, play a bow sound. If the collision occurred more than 0.2M from the center, 
        // play the crash sound. Collision type 0 is the start of a collision, whereas 1 would be the continuation 
        // and 2 would be the end. The use of the variable "playing" with a timeout prevents the cymbal from being 
        // played too quickly in succession.
        collisionWithEntity: function(thisEntity, otherEntity, collision) {
            if (collision.type === 0 && !playing) {
                if (Vec3.distance(collision.contactPoint, topCenter) < 0.1) {
                    _this.playSound(BELL_SOUND);
                } else if (Vec3.distance(collision.contactPoint, topCenter) < 0.2) {
                    _this.playSound(BOW_SOUND);
                } else {
                    _this.playSound(CRASH_SOUND);
                }
                playing = true;
                Script.setTimeout(function() {
                    playing = false;
                }, TIMEOUT_MS);
            }
        },

        // In desktop, listen for mouse clicks and then check that it was the left mouse button before playing the cymbal.
        // This will initiate the bow sound and a timeout as above.
        clickReleaseOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.isLeftButton && !playing) {
                _this.playSound(BOW_SOUND);
                playing = true;
                Script.setTimeout(function() {
                    playing = false;
                }, TIMEOUT_MS);
            }
        },

        playSound: function(sound) {
            if (sound.downloaded) {
                injector = Audio.playSound(sound, {
                    position: Entities.getEntityProperties(_this.entityID, ["position"]).position,
                    volume: AUDIO_VOLUME_LEVEL
                }); 
            }
        },

        unload: function() {
            if (injector) {
                injector.stop();
            }
        }
    };

    return new Ride();
});
