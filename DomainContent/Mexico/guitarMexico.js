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
    var BOTH_HANDS = 2;
    var ONE_HAND = 1;
    var NO_HANDS = 0;
    var LIFETIME_ON_RELEASE = 30;
    var LIFETIME_ON_GRAB = 120;

    var playing = false;
    var song;
    var injector;
    var interval;
    var numberHandsGrabbing = 1;

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
            Entities.editEntity(_this.entityID, {lifetime: LIFETIME_ON_GRAB});
            if (numberHandsGrabbing === NO_HANDS) {
                print("1 hand");
                numberHandsGrabbing = ONE_HAND;
                this.playSound(song);
            } else {
                print("2 hands");
                numberHandsGrabbing = BOTH_HANDS;
                if (!playing) {
                    this.playSound(song);
                }
            }
        },
        releaseGrab: function() {
            if (numberHandsGrabbing === BOTH_HANDS) {
                print("1 hand");
                numberHandsGrabbing = ONE_HAND;
            } else {
                print("no hands");
                if (injector) {
                    injector.stop();
                }
                if (interval) {
                    Script.clearInterval(interval);
                }
                playing = false;
                Entities.editEntity(_this.entityID, {lifetime: LIFETIME_ON_RELEASE});
                numberHandsGrabbing = NO_HANDS;
            }
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
