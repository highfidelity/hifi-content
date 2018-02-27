(function () {
    var teleportSound;
    var portalDestination;
    var animationURL;
    var position;
    var canTeleport;

    function playSound(entityID) {
        print("playing teleport sound");
        if (teleportSound.downloaded) {
            if (!position) {
                getProps(entityID);
            }
            Audio.playSound(teleportSound, { position: position, volume: 0.40, localOnly: true });
        }
    }

    function getProps(entityID) {
        var properties = Entities.getEntityProperties(entityID);
        if (properties) {
            animationURL = properties.modelURL;
            position = properties.position;
            portalDestination = properties.userData;
        }
    }

    function isPositionInsideBox(position, boxProperties) {
        var localPosition = Vec3.multiplyQbyV(Quat.inverse(boxProperties.rotation),
            Vec3.subtract(MyAvatar.position, boxProperties.position));
        var halfDimensions = Vec3.multiply(boxProperties.dimensions, 0.5);
        return -halfDimensions.x <= localPosition.x &&
            halfDimensions.x >= localPosition.x &&
            -halfDimensions.y <= localPosition.y &&
            halfDimensions.y >= localPosition.y &&
            -halfDimensions.z <= localPosition.z &&
            halfDimensions.z >= localPosition.z;
    }

    this.preload = function (entityID) {
        print("loading teleport script");
        teleportSound = SoundCache.getSound("http://s3.amazonaws.com/hifi-public/birarda/teleport.raw");
        getProps(entityID);
        // check if we are already in the object
        canTeleport = !isPositionInsideBox(MyAvatar.position, Entities.getEntityProperties(entityID));
    };

    this.enterEntity = function (entityID) {
        // check if we should teleport
        if (canTeleport === false) {
            // if we have not passed enough time, do not teleport the user
            return;
        }
        // get latest props in case we changed the destination
        getProps(entityID);
        print("enterEntity() .... The portal destination is " + portalDestination);

        if (portalDestination.length > 0) {
            print("Teleporting to hifi://" + portalDestination);
            Window.location = "hifi://" + portalDestination;
        }

    };

    this.leaveEntity = function (entityID) {
        print("leaveEntity() called ....");
        if (!animationURL) {
            getProps(entityID);
        }
        Entities.editEntity(entityID, {
            animation: { url: animationURL, currentFrame: 1, running: false }
        });

        if (canTeleport === true) {
            // only play the sound if we can teleport
            playSound(entityID);
        }
        canTeleport = true;
    };

    this.hoverEnterEntity = function (entityID) {
        print("hoverEnterEntity() called ....");
        if (!animationURL) {
            getProps(entityID);
        }
        Entities.editEntity(entityID, {
            animation: { url: animationURL, fps: 24, firstFrame: 1, lastFrame: 25, currentFrame: 1, running: true, hold: true }
        });
    };

    this.unload = function () {
        print("unloading teleport script");
    };
});
