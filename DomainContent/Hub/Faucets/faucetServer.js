//
//  faucetServer.js
//
//  created by Rebecca Stankus on 04/27/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() { 
    var _this;
    var SOUND_URL = "http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/Hub/Faucets/sounds/faucet.wav";
    var AUDIO_VOLUME_LEVEL = 1;

    var sound;
    var injector;

    function Faucet() {
        _this = this;
    }

    Faucet.prototype = {
        on: null,
        remotelyCallable: ['toggle'],
        preload: function(entityID) {
            _this.entityID = entityID;
            sound = SoundCache.getSound(SOUND_URL);
            _this.on = Entities.getEntityProperties(_this.entityID, 'visible').visible;
        },
        toggle: function(){
            _this.on ? _this.turnOff() : _this.turnOn();
        },
        playSound: function(position) {
            if (sound.downloaded) {
                if (injector) {
                    injector.stop();
                }
                injector = Audio.playSound(sound, {
                    position: Entities.getEntityProperties(_this.entityID, 'position').position,
                    volume: AUDIO_VOLUME_LEVEL,
                    loop: true
                });
            }
        },
        turnOn: function() {
            Entities.editEntity(_this.entityID, {isEmitting: true});
            _this.on = true;
            _this.playSound();
        },
        turnOff: function() {
            Entities.editEntity(_this.entityID, {isEmitting: false});
            _this.on = false;
            if (injector) {
                injector.stop();
            }
        },
        unload: function() {
            if (injector) {
                injector.stop();
            }
        }
    };

    return new Faucet();
});
