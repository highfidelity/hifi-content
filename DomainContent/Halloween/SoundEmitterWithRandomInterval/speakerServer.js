//
//  speakerServer.js
//
//  Copied from soundEmitter.js by Caitlyn
//  Edited by Rebecca Stankus on 09/11/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var _this;

    var DEFAULT_REFRESH_INTERVAL = 1000;
    
    var injector = null;
    var speakerProperties = null;
    var soundURL;
    var soundVolume;
    var speakerUserData;
    var timeUntilNextSound;

    var Speaker = function() {
        _this = this;
    };

    Speaker.prototype = {
	
        preload: function(entityID) {
            _this.entityID = entityID;
            _this.getSoundData();
            _this.setNextInterval(DEFAULT_REFRESH_INTERVAL);
        },

        setNextInterval: function() {
            timeUntilNextSound = Math.floor(Math.random() * (speakerUserData.intervalMax 
                - speakerUserData.intervalMin) + speakerUserData.intervalMin);
            Script.setTimeout(function() {
                _this.playSound();
                _this.setNextInterval();
            }, timeUntilNextSound);
        },

        getSoundData: function() {
            speakerProperties = Entities.getEntityProperties(_this.entityID, ["position", "userData"]);
            if (!speakerProperties.userData || speakerProperties.userData === "{}") {
                print("Speaker ", _this.entityID, " is missing user data.");
                return;
            }

            try {
                speakerUserData = JSON.parse(speakerProperties.userData);
                soundURL = SoundCache.getSound(speakerUserData.soundURL);
                soundVolume = !isNaN(speakerUserData.soundVolume) ? speakerUserData.soundVolume : 1;
                timeUntilNextSound = Math.floor(Math.random() * (speakerUserData.intervalMax 
                    - speakerUserData.intervalMin) + speakerUserData.intervalMin);
                // verify that settings are legit
            } catch (e) {
                print("Error in retrieving soundData");
                return;
            }
        },

        playSound: function() {
            if (injector) {
                injector.stop();
            }
            if (soundURL && soundURL.downloaded) {
                injector = Audio.playSound(soundURL, {
                    position: speakerProperties.position,
                    volume: soundVolume,
                    loop: false,
                    localOnly: false
                });
            } else {
                print("soundURL not downloaded!");
                return;
            }
        },
	
        unload: function() {
            if (injector) {
                injector.stop();
                injector = null;
            }
        }
    };

    return new Speaker;
	
});
