// A script for making a kitten meow when you click it
// I promise this won't get annoying
// One of those statements is a lie
//
// Copyright 2018 High Fidelity Inc.
// Author: Liv Erickson, 8/23/2018
// 
// Licensed under the Apache 2.0 license
// https://www.apache.org/licenses/LICENSE-2.0
//

(function() {

    var selfEntityID;
    var selfPosition;

    var MEOW_SOUND_URL = Script.resolvePath('./resources/sounds/meow.mp3');
    var MEOW_ANIMATION_URL = Script.resolvePath('kitten_Meow.fbx');
    var IDLE_ANIMATION_URL = Script.resolvePath('kitten_Idle.fbx');

    var meowSound = SoundCache.getSound(MEOW_SOUND_URL);

    var MeowEngine = function(){

    };

    MeowEngine.prototype = {
        preload : function(entityID) {
            selfEntityID = entityID;
            selfPosition = Entities.getEntityProperties(entityID, 'position').position;
        },

        mousePressOnEntity : function() {
            this.meow();
        },

        startNearTrigger: function() {
            this.meow();
        },
        
        meow: function() {
            var _timeout = 1000;
            var _volume = 0.5;
            var _meowFPS = 10;
            var _idleFPS = 30;

            if (meowSound.downloaded) {
                Audio.playSound(meowSound, {
                    position: selfPosition,
                    volume: _volume,
                    pitch: 1 + Math.random(),
                    localOnly: true
                });
                Entities.editEntity(selfEntityID, {
                    animation: {url: MEOW_ANIMATION_URL, loop: false, fps: _meowFPS}
                });
                Script.setTimeout(function(){ 
                    Entities.editEntity(selfEntityID, {
                        animation: {url: IDLE_ANIMATION_URL, loop: true, fps: _idleFPS}
                    });
                }, _timeout);
            }
        }
    };
    return new MeowEngine();
});
