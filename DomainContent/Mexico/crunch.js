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
    var CHECK_RADIUS = 0.1;
    var injector;
    var _this = this;

    _this.preload = function(entityID) {
        _this.entityID = entityID;
    };

    var checkIfNearHead = function() {
        var position = Entities.getEntityProperties(_this.entityID, "position").position;
        var foodDistance = CHECK_RADIUS * MyAvatar.scale;
        if (Vec3.distance(position, MyAvatar.getJointPosition("Head")) < foodDistance || 
            Vec3.distance(position, MyAvatar.getJointPosition("Neck")) < foodDistance) {
            playEatingEffect(position);
        }
    };

    var playEatingEffect = function(position) {
        injector = Audio.playSound(CRUNCH, {volume: VOLUME, position: MyAvatar.getJointPosition("Head")});
        Entities.deleteEntity(_this.entityID);
    };

    Script.update.connect(checkIfNearHead);

    _this.unload = function(entityID) {
        if (injector) {
            injector.stop();
            injector = null;
        }
        Script.update.disconnect(checkIfNearHead);
    };
});