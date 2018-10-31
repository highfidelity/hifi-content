//
// whisperInEar.js
// 
// Created by Robin Wilson on 09/20/2018
// Copyright High Fidelity 2018
// 
// Plays a sound in the direction of a named entity.
// 
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// Sound from https://freesound.org/people/phatkatz4/sounds/192172/ by phatkatz4

(function () {

    var FOCUS_OBJECT_NAME = "focusObj";

    var RADIUS = 0.2;
    var SEARCH_RADIUS = 100;

    var WAIT_LOAD_TIME = 100;
    var SECS_TO_MS = 1000;
    var AUDIO_VOLUME_LEVEL = 0.3;
    var UPDATE_POSITION_MS = 50;
    var SOUND_URL = "http://hifi-content.s3-us-west-1.amazonaws.com/robin/dev/domains/halloween/directionWhisper/sounds/quick-over-here.wav";
    
    var sound = SoundCache.getSound(SOUND_URL);

    function getPropertiesFromNamedObj(entityName, searchOriginPosition, searchRadius, arrayOfProperties) {

        var entityList = Entities.findEntitiesByName(
            entityName,
            searchOriginPosition,
            searchRadius
        );

        if (entityList.length > 0) {
            return Entities.getEntityProperties(entityList[0], arrayOfProperties);
        } else {
            return null;
        }

    }

    function getPositionFromObject() {

        var headIdx = MyAvatar.getJointIndex("Head");
        var headPos = MyAvatar.getJointPosition(headIdx);

        var focusPosition = getPropertiesFromNamedObj(FOCUS_OBJECT_NAME, MyAvatar.position, SEARCH_RADIUS, ["position"]).position;

        return Vec3.sum(Vec3.multiply(RADIUS, Vec3.normalize(Vec3.subtract(focusPosition, headPos))), headPos);
    }

    function playSound() {

        var position = Entities.getEntityProperties(this.entityID, "position").position;

        // Play sound
        var injector = Audio.playSound(sound, {
            position: position,
            inputVolume: AUDIO_VOLUME_LEVEL,
            localOnly: true
        });

        // Update sound position using interval
        var updatePositionInterval = Script.setInterval(function () {
            var position = getPositionFromObject();
            injector.options = {
                position: position,
                inputVolume: AUDIO_VOLUME_LEVEL,
                localOnly: true
            };
        }, UPDATE_POSITION_MS);

        // length of sound timeout
        var soundLength = sound.duration * SECS_TO_MS;

        Script.setTimeout(function () {
            Script.clearInterval(updatePositionInterval);
            injector.stop();
        }, soundLength);
    }

    Script.setTimeout(function () {
        playSound();
    }, WAIT_LOAD_TIME);

})();