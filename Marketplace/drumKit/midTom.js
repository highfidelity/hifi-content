//
//  midTom.js
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

    var MidTom = function() {
        _this = this;
    };

    MidTom.prototype = {
        preload: function(entityID){
            _this.entityID = entityID;
            sound = SoundCache.getSound(Script.resolvePath("DrumKit/ambient_tom_2.wav"));
        },
        collisionWithEntity: function() {
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
        },
        clickReleaseOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.isLeftButton) {
                this.collisionWithEntity();
            }
        }
    };

    return new MidTom();
});
