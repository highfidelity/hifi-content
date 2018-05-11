//
// Crunch.js
// Play a crunch sound and delete an entity when it is brought close to the head ("Eaten")
// High Fidelity 2017
//
// Crunch sound from soundbible.com
// License: Attribution 3.0 | Recorded by Simon Craggs
//
(function () {
    var CRUNCH_SOUND_URL = "https://hifi-content.s3.amazonaws.com/liv/dev/emojis/Apple_Bite-Simon_Craggs-1683647397.wav";
    var CRUNCH = SoundCache.getSound(Script.resolvePath(CRUNCH_SOUND_URL));
    var playback;
    var SOUND_VOLUME = 0.5;
    var DISTANCE_WITHIN = 0.1;
    var _this = this;


    _this.preload = function (entityID) {
        _this.entityID = entityID;
        playback = {volume: SOUND_VOLUME, position: Entities.getEntityProperties(_this.entityID, "position").position};
    };

    var checkIfNearHead = function () {
        var position = Entities.getEntityProperties(_this.entityID, "position").position;
        var avatarHeadPosition = MyAvatar.getJointPosition("Head");
        if (isWithinDistance(position.y, avatarHeadPosition.y) &
            isWithinDistance(position.z, avatarHeadPosition.z)) {
            playEatingEffect(position);
        }
    };

    var playEatingEffect = function (position) {
        Audio.playSound(CRUNCH, playback);
        Entities.deleteEntity(_this.entityID);
    };

    // Helper function to see if the object is close to us
    var isWithinDistance = function (val1, val2) {
        if (Vec3.distance(val1, val2) <= DISTANCE_WITHIN) {
            return true;
        }
        return false;
    };

    Script.update.connect(checkIfNearHead);
    _this.unload = function (entityID) {
        Script.update.disconnect(checkIfNearHead);
    };
});