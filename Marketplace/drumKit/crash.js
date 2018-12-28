//
//  crash.js
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

    var AUDIO_VOLUME_LEVEL = 1;
    var TIMEOUT_MS = 100;
    var CRASH_SOUND = SoundCache.getSound(Script.resolvePath("Assets/Sounds/crash.wav"));
    
    var playing = false;
    var injector;

    var Crash = function() {
        _this = this;
    };

    Crash.prototype = {
        preload: function(entityID){
            _this.entityID = entityID;
        },

        // In HMD, listen for collisions and then play a sound. Collision type 0 is the 
        // start of a collision, whereas 1 would be the continuation and 2 would be the end. The use of the variable 
        // "playing" with a timeout prevents the cymbal from being played too quickly in succession.
        collisionWithEntity: function(thisEntity, otherEntity, collision) {
            if (collision.type === 0 && !playing) {
                _this.playSound(CRASH_SOUND);
            }
        },

        // In desktop, listen for mouse clicks and then check that it was the left mouse button before playing the cymbal.
        // This will initiate the sound and timeout as above.
        clickReleaseOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.isLeftButton && !playing) {
                _this.playSound(CRASH_SOUND);
                playing = true;
                Script.setTimeout(function() {
                    playing = false;
                },TIMEOUT_MS);
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

    return new Crash();
});
