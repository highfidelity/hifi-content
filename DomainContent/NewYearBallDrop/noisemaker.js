//
// noisemaker.js
// 
// Created by Rebecca Stankus on 12/20/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function () {

    var PARTY_SOUND = SoundCache.getSound(Script.resolvePath('assets/audio/noisemaker.mp3'));
    var VOLUME = 0.1;
    var CHECK_RADIUS = 0.25;
    var LIFETIME = 30;
    var FIVE_SECONDS = 5000;

    var _this = this;
    var injector;
    var canPlay = true;

    _this.preload = function(entityID) {
        _this.entityID = entityID;
    };

    var setUpNoisemaker = function() {
        var editJSON = {
            lifetime: -1,
            visible: true,
            dynamic: true,
            collisionless: false
        };
        Entities.editEntity(_this.entityID, editJSON);
    };

    _this.startNearGrab = function() {
        setUpNoisemaker();
    };

    _this.startDistanceGrab = function() {
        setUpNoisemaker();
    };

    _this.releaseGrab = function() {
        var age = Entities.getEntityProperties(_this.entityID, 'age').age;
        Entities.editEntity(_this.entityID, { lifetime: age + LIFETIME });
    };

    var checkIfNearHead = function() {
        var position = Entities.getEntityProperties(_this.entityID, "position").position;
        var distance = CHECK_RADIUS * MyAvatar.scale;
        if (canPlay && (Vec3.distance(position, MyAvatar.getJointPosition("Head")) < distance || 
            Vec3.distance(position, MyAvatar.getJointPosition("Neck")) < distance)) {
            canPlay = false;
            Script.setTimeout(function() {
                canPlay = true;
            }, FIVE_SECONDS);
            playSound();
        }
    };

    var playSound = function() {
        if (PARTY_SOUND.downloaded) {
            if (injector) {
                injector.stop();
            }
            injector = Audio.playSound(PARTY_SOUND, {
                position: Entities.getEntityProperties(_this.entityID, 'position').position,
                volume: VOLUME
            });
        }
        Audio.playSound(PARTY_SOUND, {volume: VOLUME, position: MyAvatar.getJointPosition("Head")});
    };

    Script.update.connect(checkIfNearHead);

    _this.unload = function(entityID) {
        Script.update.disconnect(checkIfNearHead);
    };
});
