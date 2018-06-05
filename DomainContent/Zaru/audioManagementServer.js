//
//  Created by Liv Erickson on 6/4/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){

    var GROUP_CLAP_URL = Script.resolvePath("sounds/small-clap.wav");
    var CHIME_SOUND = Script.resolvePath("sounds/bell-chime-alert.wav");
    var groupClapSound;

    var applauseQueue = [];

    var ApplauseManager = function() {};

    ApplauseManager.prototype = {
        remotelyCallable: ["queueApplauseIntent", "playIndividualClap"],
        preload: function(entityID) {
            groupClapSound = SoundCache.getSound(GROUP_CLAP_URL);
        },
        hasSenderInQueue: function(key) {
            var found = false;
            for (var i = 0; i < applauseQueue.length; i++) {
                if (applauseQueue[i].id === key) {
                    found = true;
                    break;
                }
            }
            return found;
        },
        playIndividualClap: function(entityID, params) {
            var chime = SoundCache.getSound(CHIME_SOUND);
            if (chime.downloaded) {
                Audio.playSound( chime, {
                    position: JSON.parse(params[0]),
                    volume: 0.5
                });
            }
            var properties = { 
                type: "ParticleEffect",
                position: JSON.parse(params[0]),
                isEmitting:true,
                lifespan:2,
                maxParticles:1,
                textures:"https://hifi-content.s3-us-west-1.amazonaws.com/liv/Production/Rust/heart.png",
                emitRate:1,
                emitSpeed:0,
                emitDimensions:{x:0,y:0,z:0},
                particleRadius:0.1,
                radiusSpread:0.25,
                radiusStart:0,
                radiusFinish:0,
                color:{red:15,blue:135,green:14},
                colorSpread:{red:0,blue:0,green:0},
                colorStart:{red:235,blue:173,green:2},
                colorFinish:{red:179,blue:30,green:0},
                emitAcceleration:{x:-0.5,y:2.5,z:-0.5},
                accelerationSpread:{x:0.5,y:1,z:0.5},
                alpha:0.5,
                alphaSpread:0.5,
                alphaStart:0.5,
                alphaFinish:0,
                lifetime: 5
            };
            Entities.addEntity(properties);
        },
        queueApplauseIntent : function(entityID, params) {
            var _remoteCallerID = Script.remoteCallerID + "";
            print("Remote caller ID: " + _remoteCallerID);
            var intentToAdd = { 
                id : _remoteCallerID,
                position:  params[0]
            };
            if (!this.hasSenderInQueue(intentToAdd.id)) {
                applauseQueue.push(intentToAdd); // queue once per caller
            }
            print(JSON.stringify(applauseQueue));
            if (applauseQueue.length > 2) {
                this.playCrowdApplauseAndResetIntent();
            }
        },
        playCrowdApplauseAndResetIntent : function(){
            applauseQueue.forEach(function(intent) {
                var spot = applauseQueue.pop().position;
                if (groupClapSound.downloaded) {
                    Audio.playSound(groupClapSound, {
                        position: spot,
                        volume: 1.0
                    });
                }
            });
        },
        unload: function() {

        }
    };

    return new ApplauseManager();

});