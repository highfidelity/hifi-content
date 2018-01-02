///
/// monster_growl.js
/// A little angry monster
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
	var GROWL_URL = "https://hifi-content.s3.amazonaws.com/elisalj/emoji_scripts/behaviors/sounds/monster-growl.wav";
	var GROWL = SoundCache.getSound(Script.resolvePath(GROWL_URL));

    var _entityID;
    var props = Entities.getEntityProperties(_entityID);

	Audio.playSound(GROWL, {
      position: props.position,
      volume: 10
    });
 
    this.unload = function() {
         // UI and Cache cleanup etc happen here,
    };

});