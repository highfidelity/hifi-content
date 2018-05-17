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
    var CRUNCH;
    var playback;
    var SOUND_VOLUME = 0.5;
    var DISTANCE_WITHIN = 0.1;
    var _this = this;

    _this.preload = function (entityID) {
        _this.entityID = entityID;
        CRUNCH = SoundCache.getSound(Script.resolvePath(CRUNCH_SOUND_URL));
        playback = {volume: SOUND_VOLUME, position: Entities.getEntityProperties(_this.entityID, "position").position};
    };

    var checkIfNearHead = function() {
        var position = Entities.getEntityProperties(_this.entityID, 'position').position;
        if (Vec3.distance(position, MyAvatar.getJointPosition("Head")) < DISTANCE_WITHIN ||
            Vec3.distance(position, MyAvatar.getJointPosition("Neck")) < DISTANCE_WITHIN) {
            playEatingEffect(position);
        }
    };

    var playEatingEffect = function (position) {
        Audio.playSound(CRUNCH, playback);
        Entities.deleteEntity(_this.entityID);
    };

    Script.update.connect(checkIfNearHead);

    _this.unload = function (entityID) {
        Script.update.disconnect(checkIfNearHead);
    };
});
