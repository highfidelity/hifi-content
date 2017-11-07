///
/// PooEmoji.js
/// An object that farts when picked up
/// Attach to an entity 
/// 
/// Author: Liv Erickson
/// Copyright High Fidelity 2017
///
/// Licensed under the Apache 2.0 License
/// See accompanying license file or http://apache.org/
///
/// All assets are under CC Attribution Non-Commerical
/// http://creativecommons.org/licenses/
///
(function () {
    var SOUND_URL = "http://mpassets.highfidelity.com/a5f42695-f15a-4f44-9660-14b4f8ca2b29-v1/poot.wav";
    var SOUND = SoundCache.getSound(Script.resolvePath(SOUND_URL));

    var _this;
    _this = this;
    var playback; 

    this.preload = function (entityID) {
        _this.entityID = entityID;
        playback = {volume: 0.5, position: Entities.getEntityProperties(_this.entityID).position};
    };

    this.unload = function () {

    };

    this.startNearGrab = function () {
        print(_this.entityID);
        Audio.playSound(SOUND, playback);
        Entities.deleteEntity(_this.entityID);
    };

    this.clickDownOnEntity = function() {
        print(_this.entityID);
        Audio.playSound(SOUND, playback);
    };
    
});