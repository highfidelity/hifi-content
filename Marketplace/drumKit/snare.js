//
//  snare.js
//
//  created by Rebecca Stankus on 01/24/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var _this;

    var AUDIO_VOLUME_LEVEL = 1;
    var playing = false;
    var sound;

    var Cowbell = function() {
        _this = this;
    };

    Cowbell.prototype = {
        preload: function(entityID){
            _this.entityID = entityID;
            sound = SoundCache.getSound(Script.resolvePath("DrumKit/pearlkit-snare2.wav"));
        },
        collisionWithEntity: function(thisEntity, otherEntity, collision) {
            if (collision.type === 0) {
                _this.homePos = Entities.getEntityProperties(_this.entityID, ["position"]).position;
                _this.injector = Audio.playSound(_this.sound, {position: _this.homePos, volume: AUDIO_VOLUME_LEVEL});
                if (sound.downloaded && !playing) {
                    Audio.playSound(sound, {
                        position: _this.homePos,
                        volume: AUDIO_VOLUME_LEVEL
                    });
                    playing = true;
                    Script.setTimeout(function() {
                        playing = false;
                    }, 250);
                }
            }
        },
        clickReleaseOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.isLeftButton) {
                this.collisionWithEntity();
            }
        }
    };

    return new Cowbell();
});
