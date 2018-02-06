//
//  guitarMexico.js
//
//  created by Rebecca Stankus on 01/31/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var _this;

    var AUDIO_VOLUME_LEVEL = 0.8;
    var SONG_LENGTH_MS = 50000;
    var UPDATE_POSITION_MS = 50;

    var playing = false;
    var song;
    var injector;
    var interval;

    var Guitar = function() {
        _this = this;
    };

    Guitar.prototype = {
        preload: function(entityID){
            _this.entityID = entityID;
            _this.homePos = Entities.getEntityProperties(_this.entityID, "position").position;
            song = SoundCache.getSound(Script.resolvePath("Sounds/mexicoAnthem.wav"));
        },
        startNearGrab: function(thisEntity, otherEntity, collision) {
            this.playSound(song);
        },
        releaseGrab: function() {
            if (injector) {
                injector.stop();
            }
            if (interval) {
                Script.clearInterval(interval);
            }
            playing = false;
        },
        playSound: function(specificSound) {
            if (specificSound.downloaded && !playing) {
                injector = Audio.playSound(specificSound, {
                    position: _this.homePos,
                    volume: AUDIO_VOLUME_LEVEL
                });
                playing = true;
                interval = Script.setInterval(function() {
                    var newAudioPosition = Entities.getEntityProperties(_this.entityID, 'position').position;
                    injector.options = { position: newAudioPosition };
                }, UPDATE_POSITION_MS);
                Script.setTimeout(function() {
                    playing = false;
                    if (interval) {
                        Script.clearInterval(interval);
                    }
                }, SONG_LENGTH_MS);
            }
        },
        clickReleaseOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.isLeftButton) {
                if (!playing) {
                    this.playSound(song);
                } else {
                    this.releaseGrab();
                }
            }
        },
        unload: function() {
            this.releaseGrab();
        }
    };

    return new Guitar ();
});
