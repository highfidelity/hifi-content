//
// Crunch.js
// Play a crunch sound and delete an entity when it is brought close to the head ("Eaten")
// High Fidelity 2017
//
// Crunch sound from soundbible.com
// License: Attribution 3.0 | Recorded by Simon Craggs
//

(function () {

    var CRUNCH_SOUND_URLS = [
        // sounds by InspectorJ from https://freesound.org/people/InspectorJ/sounds/332407/
        Script.resolvePath("sounds/crunch-1.wav"),
        Script.resolvePath("sounds/crunch-2.wav"),
        Script.resolvePath("sounds/crunch-3.wav"),
        Script.resolvePath("sounds/crunch-4.wav"),
        Script.resolvePath("sounds/crunch-5.wav"),
        Script.resolvePath("sounds/crunch-6.wav"),
        Script.resolvePath("sounds/crunch-7.wav"),
        Script.resolvePath("sounds/crunch-8.wav"),
        Script.resolvePath("sounds/crunch-9.wav"),
        Script.resolvePath("sounds/crunch-10.wav")
    ];
    var CRUNCH_SOUNDS = [];

    var VOLUME = 0.5;
    var CHECK_RADIUS = 0.1;

    var _this = this;
    var injector;

    _this.preload = function(entityID) {
        _this.entityID = entityID;
        CRUNCH_SOUND_URLS.forEach(function(crunch) {
            CRUNCH_SOUNDS.push(SoundCache.getSound(crunch));
        });
    };

    var checkIfNearHead = function() {
        var position = Entities.getEntityProperties(_this.entityID, "position").position;
        if (Vec3.distance(position, MyAvatar.getJointPosition("Head")) < (CHECK_RADIUS * MyAvatar.scale)) {
            playEatingEffect();
        }
    };

    var playEatingEffect = function() {
        var size = CRUNCH_SOUND_URLS.length - 1;
        var index = Math.round(Math.random() * size);
        var crunchSound = CRUNCH_SOUNDS[index];
        injector = Audio.playSound(crunchSound, {volume: VOLUME, position: MyAvatar.getJointPosition("Head")});
        Entities.deleteEntity(_this.entityID);
    };

    Script.update.connect(checkIfNearHead);

    _this.unload = function(entityID) {
        Script.update.disconnect(checkIfNearHead);
    };

});