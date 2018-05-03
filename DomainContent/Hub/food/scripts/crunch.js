//
// crunch.js
// Play a crunch sound and delete an entity when it is brought close to the head ("Eaten")
//
// Modified by: Elisa Lupin-Jimenez
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// All assets are under CC Attribution Non-Commerical
// http://creativecommons.org/licenses/
//

(function () {

    var CRUNCH_SOUND_URLS = [
        // sounds by InspectorJ from https://freesound.org/people/InspectorJ/sounds/332407/
        "https://hifi-content.s3.amazonaws.com/DomainContent/Hub-staging/food/sounds/crunch-1.wav",
        "https://hifi-content.s3.amazonaws.com/DomainContent/Hub-staging/food/sounds/crunch-2.wav",
        "https://hifi-content.s3.amazonaws.com/DomainContent/Hub-staging/food/sounds/crunch-3.wav",
        "https://hifi-content.s3.amazonaws.com/DomainContent/Hub-staging/food/sounds/crunch-4.wav",
        "https://hifi-content.s3.amazonaws.com/DomainContent/Hub-staging/food/sounds/crunch-5.wav",
        "https://hifi-content.s3.amazonaws.com/DomainContent/Hub-staging/food/sounds/crunch-6.wav",
        "https://hifi-content.s3.amazonaws.com/DomainContent/Hub-staging/food/sounds/crunch-7.wav",
        "https://hifi-content.s3.amazonaws.com/DomainContent/Hub-staging/food/sounds/crunch-8.wav",
        "https://hifi-content.s3.amazonaws.com/DomainContent/Hub-staging/food/sounds/crunch-9.wav",
        "https://hifi-content.s3.amazonaws.com/DomainContent/Hub-staging/food/sounds/crunch-10.wav"
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