//
// cornyLaugh.js
// A corn on the cob that laughs
// Attach to an entity 
// 
// Author: Elisa Lupin-Jimenez
// Copyright High Fidelity 2017
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// All assets are under CC Attribution Non-Commerical
// http://creativecommons.org/licenses/
//

(function () {
    var LAUGH_URL = Script.resolvePath("sounds/corny-laugh.wav");
    var LAUGH;
    var RIM_SHOT_URL = Script.resolvePath("sounds/rim-shot.wav");
    var RIM_SHOT;
    var SOUND_VOLUME = 10;
    var LAUGH_INTERVAL = 800;
    var ROLL_INTERVAL = 3000;


    var _entityID;
    this.preload = function(entityID) {
        _entityID = entityID;
        LAUGH = SoundCache.getSound(Script.resolvePath(LAUGH_URL));
        RIM_SHOT = SoundCache.getSound(Script.resolvePath(RIM_SHOT_URL));

        if (RIM_SHOT.downloaded) {
            Audio.playSound(RIM_SHOT, {
                position: Entities.getEntityProperties(_entityID).position,
                volume: SOUND_VOLUME
            });
        }
    };

    Script.setTimeout(function() {
        if (LAUGH.downloaded) {
            Audio.playSound(LAUGH, {
                position: Entities.getEntityProperties(_entityID).position,
                volume: SOUND_VOLUME
            });
        }
    }, LAUGH_INTERVAL);


    Script.setInterval(function() {
        var switchRoll = !switchRoll;
        if (switchRoll) {
            var angularVelocity = {
                "angularVelocity": {
                    "x": 0,
                    "y": 0,
                    "z": 3
                }
            };
            Entities.editEntity(_entityID, angularVelocity);
        } else { 
            angularVelocity = {
                "angularVelocity": {
                    "x": 0,
                    "y": 0,
                    "z": -3
                }
            };
            Entities.editEntity(_entityID, angularVelocity);
        }
    }, ROLL_INTERVAL);

    this.unload = function() {

    };

});