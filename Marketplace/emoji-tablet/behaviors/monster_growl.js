//
// monster_growl.js
// A little angry monster
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
    var GROWL_URL = Script.resolvePath("sounds/monster-growl.wav");
    var GROWL = SoundCache.getSound(Script.resolvePath(GROWL_URL));

    var _entityID;
    var properties = Entities.getEntityProperties(_entityID);
    var SOUND_VOLUME = 0.5;


    Audio.playSound(GROWL, {
        position: properties.position,
        volume: SOUND_VOLUME
    });
 
    this.unload = function() {
        // UI and Cache cleanup etc happen here,
    };

});