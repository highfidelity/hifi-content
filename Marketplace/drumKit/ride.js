//
//  ride.js
//
//  created by Rebecca Stankus on 01/24/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var _this;

    var AUDIO_VOLUME_LEVEL = 0.8;
    var HALF = 0.5;
    var playing = false;
    var soundEdge;
    var soundBell;
    var soundMid;
    var topCenter;

    var Cowbell = function() {
        _this = this;
    };

    Cowbell.prototype = {
        preload: function(entityID){
            _this.entityID = entityID;
            var properties = Entities.getEntityProperties(_this.entityID, ["position", "dimensions"]);
            _this.homePos = properties.position;
            var newY = (properties.dimensions.y * HALF) + _this.homePos.y;
            topCenter = {x:_this.homePos.x, y:newY, z: _this.homePos.z};
            soundEdge = SoundCache.getSound(Script.resolvePath("DrumKit/pearlkit-ridecrash.wav"));
            soundBell = SoundCache.getSound(Script.resolvePath("DrumKit/pearlkit-ridebell.wav"));
            soundMid = SoundCache.getSound(Script.resolvePath("DrumKit/pearlkit-ride1.wav"));
        },
        collisionWithEntity: function(thisEntity, otherEntity, collision) {
            if (collision.type === 0) {
                if (Vec3.distance(collision.contactPoint, topCenter) < 0.1) {
                    this.playSound(soundBell);
                } else if (Vec3.distance(collision.contactPoint, topCenter) < 0.2) {
                    this.playSound(soundMid);
                } else {
                    this.playSound(soundEdge);
                }

            }
        },
        playSound: function(specificSound) {
            _this.injector = Audio.playSound(_this.sound, {position: _this.homePos, volume: AUDIO_VOLUME_LEVEL});
            if (specificSound.downloaded && !playing) {
                Audio.playSound(specificSound, {
                    position: _this.homePos,
                    volume: AUDIO_VOLUME_LEVEL
                });
                playing = true;
                Script.setTimeout(function() {
                    playing = false;
                }, 10);
            }
        },
        clickReleaseOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.isLeftButton) {
                this.playSound(soundBell);
            }
        }
    };

    return new Cowbell();
});
