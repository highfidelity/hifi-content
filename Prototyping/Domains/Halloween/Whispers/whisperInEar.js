(function () {

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
            console.log("GOT NOTHIGN");
            return null;
        }

    }


    function getPositionFromObject() {

        var headIdx = MyAvatar.getJointIndex("Head");
        var headPos = MyAvatar.getJointPosition(headIdx);

        var focusPosition = getPropertiesFromNamedObj("focusObj", MyAvatar.position, 100, ["position"]).position;


        console.log(JSON.stringify(headPos, focusPosition));

        // Entities.addEntity({
        //     name: "test_hello",
        //     type: "Box",
        //     lifetime: 180,
        //     position: Vec3.sum(Vec3.multiply(0.5, Vec3.normalize(Vec3.subtract(focusPosition, headPos))), headPos),
        //     dimensions: { x: 0.1, y: 0.1, z: 0.1 }
        // });

        return Vec3.sum(Vec3.multiply(0.2, Vec3.normalize(Vec3.subtract(focusPosition, headPos))), headPos);
    }

    function playSound() {

        var position = Entities.getEntityProperties(this.entityID, 'position').position;


        console.log(JSON.stringify(sound));
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
    }, 100);

})();