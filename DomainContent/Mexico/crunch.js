//
// Crunch.js
// Play a crunch sound and delete an entity when it is brought close to the head ("Eaten")
// High Fidelity 2017
//
// Crunch sound from soundbible.com
// License: Attribution 3.0 | Recorded by Simon Craggs
//
(function () {
    var CRUNCH_SOUND_URL = Script.resolvePath("./sounds/Apple_Bite-Simon_Craggs-1683647397.wav");
    var CRUNCH = SoundCache.getSound(Script.resolvePath(CRUNCH_SOUND_URL));
    var VOLUME = 0.5;
    var WITHIN_10_CM = 0.1;
    var playback;
    var _this = this;

    _this.preload = function (entityID) {
        _this.entityID = entityID;
        playback = {volume: VOLUME, position: Entities.getEntityProperties(_this.entityID).position};
    };

    var checkIfNearHead = function () {
        var pos = Entities.getEntityProperties(_this.entityID).position;
        var avatarHeadPosition = MyAvatar.getJointPosition("Head");
        if (isWithin10cm(pos.y, avatarHeadPosition.y) &
            isWithin10cm(pos.z, avatarHeadPosition.z)) {
            playEatingEffect(pos);
        }
    };

    var playEatingEffect = function (pos) {
        Audio.playSound(CRUNCH, playback);
        Entities.deleteEntity(_this.entityID);
    };

    // Helper function to see if the object is close to us
    var isWithin10cm = function (val1, val2) {
        if (Math.abs(Math.abs(val1) - Math.abs(val2)) <= WITHIN_10_CM) {
            return true;
        }

        return false;
    };
    Script.update.connect(checkIfNearHead);
    _this.unload = function (entityID) {
        Script.update.disconnect(checkIfNearHead);
    };
});