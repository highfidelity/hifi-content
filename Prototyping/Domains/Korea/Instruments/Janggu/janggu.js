//
//  jangguDrum.js
//
//  created by Robin Wilson on 06/25/2018
//  references hitom.js created by Rebecca Stankus on 01/24/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var _this;

    var AUDIO_VOLUME_LEVEL = 1;
    var TIMEOUT_100_MS = 100;
    var TIMEOUT_10_MS = 10;

    var playing = false;
    var sound;

    var JangguDrum = function() {
        _this = this;
    };

    JangguDrum.prototype = {
        preload: function(entityID){
            _this.entityID = entityID;
            sound = SoundCache.getSound(Script.resolvePath("Sounds/ambient_tom_1.wav"));
        },
        collisionWithEntity: function(thisEntity, otherEntity, collision) {
            // if otherEntity name is "drumstick"
            if (collision.type === 0) {
                this.playSound();
            }
        },
        playSound: function() {
            _this.homePos = Entities.getEntityProperties(_this.entityID, ["position"]).position;
            _this.injector = Audio.playSound(_this.sound, {position: _this.homePos, volume: AUDIO_VOLUME_LEVEL});
            if (sound.downloaded && !playing) {
                Audio.playSound(sound, {
                    position: _this.homePos,
                    volume: AUDIO_VOLUME_LEVEL
                });
                // Entities.editEntity(_this.entityID, {color: newColor});
                playing = true;
                // Script.setTimeout(function() {
                //     playing = false;
                // }, TIMEOUT_10_MS);
                Script.setTimeout(function() {
                    playing = false;
                }, TIMEOUT_100_MS);
            }
        },
        clickReleaseOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.isLeftButton) {
                this.playSound();
            }
        }
    };

    return new JangguDrum();
});