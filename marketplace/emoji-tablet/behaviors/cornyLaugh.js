///
/// cornyLaugh.js
/// A corn on the cob that laughs
/// Attach to an entity 
/// 
/// Author: Elisa Lupin-Jimenez
/// Copyright High Fidelity 2017
///
/// Licensed under the Apache 2.0 License
/// See accompanying license file or http://apache.org/
///
/// All assets are under CC Attribution Non-Commerical
/// http://creativecommons.org/licenses/
///

(function () {
	var LAUGH_URL = "https://hifi-content.s3.amazonaws.com/elisalj/emoji_scripts/behaviors/sounds/corny-laugh.wav";
	var LAUGH = SoundCache.getSound(Script.resolvePath(LAUGH_URL));
	var RIM_SHOT_URL = "https://hifi-content.s3.amazonaws.com/elisalj/emoji_scripts/behaviors/sounds/rim-shot.wav";
	var RIM_SHOT = SoundCache.getSound(Script.resolvePath(RIM_SHOT_URL));


    var _entityID;
    this.preload = function(entityID) {
          _entityID = entityID;
    };

	Audio.playSound(RIM_SHOT, {
      	position: Entities.getEntityProperties(_entityID).position,
      	volume: 10
    });

    Script.setTimeout(Audio.playSound(LAUGH, {
        position: Entities.getEntityProperties(_entityID).position,
        volume: 10
    }), 800);


    Script.setInterval(function() {
        // var newVel = Entities.getEntityProperties(_entityID).velocity;
        // var newAng = Entities.getEntityProperties(_entityID).angularVelocity;
        // newVel.x *= -1;
        // newAng.y *= -1;
        rofl = !rofl;
        print(rofl);
        if (rofl) {
            var set = {
                "angularVelocity": {
                    "x": 0,
                    "y": 0,
                    "z": 3
                }
            };
            Entities.editEntity(_entityID, set);
        } else { 
            var set = {
                "angularVelocity": {
                    "x": 0,
                    "y": 0,
                    "z": -3
                }
            };
            Entities.editEntity(_entityID, set);
        }
    }, 3000);

    this.unload = function() {
         // UI and Cache cleanup etc happen here,
    };

});