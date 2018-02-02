//
//  hitom.js
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
    var COLOR_1 = { blue: 255, green: 79, red: 255 };
    var COLOR_2 = { blue: 214, green: 105, red: 77 };
    var COLOR_3 = { blue: 87, green: 214, red: 71 };
    var COLOR_4 = { blue: 64, green: 170, red: 219 };
    var OFF_WHITE = { blue: 145, green: 145, red: 145 };
    var TIMEOUT_100_MS = 100;
    var TIMEOUT_10_MS = 10;

    var playing = false;
    var sound;

    var HiTom = function() {
        _this = this;
    };

    HiTom.prototype = {
        preload: function(entityID){
            _this.entityID = entityID;
            sound = SoundCache.getSound(Script.resolvePath("DrumKit/ambient_tom_1.wav"));
        },
        collisionWithEntity: function(thisEntity, otherEntity, collision) {
            if (collision.type === 0) {
                this.playSound();
            }
        },
        playSound: function() {
            var colorChange = Math.floor(Math.random() * 4);
            var newColor;
            switch (colorChange) {
                case 0:
                    newColor = COLOR_1;
                    break;
                case 1:
                    newColor = COLOR_2;
                    break;
                case 2:
                    newColor = COLOR_3;
                    break;
                case 3:
                    newColor = COLOR_4;
                    break;
                default:
                    newColor = COLOR_4;
            }
            _this.homePos = Entities.getEntityProperties(_this.entityID, ["position"]).position;
            _this.injector = Audio.playSound(_this.sound, {position: _this.homePos, volume: AUDIO_VOLUME_LEVEL});
            if (sound.downloaded && !playing) {
                Audio.playSound(sound, {
                    position: _this.homePos,
                    volume: AUDIO_VOLUME_LEVEL
                });
                Entities.editEntity(_this.entityID, {color: newColor});
                playing = true;
                Script.setTimeout(function() {
                    playing = false;
                }, TIMEOUT_10_MS);
                Script.setTimeout(function() {
                    playing = false;
                    Entities.editEntity(_this.entityID, {color: OFF_WHITE});
                }, TIMEOUT_100_MS);
            }
        },
        clickReleaseOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.isLeftButton) {
                this.playSound();
            }
        }
    };

    return new HiTom();
});
