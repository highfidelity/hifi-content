//
// zoneStatueJumpScare.js
// 
// Created by Robin Wilson on 09/20/2018
// Copyright High Fidelity 2018
//
// Put script on a zone or collisionless entity and a scary statue follows you.
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// Whisper Sound: https://freesound.org/people/DRFX/sounds/350763/ by DRFX

(function () {

    var Sound = Script.require("http://hifi-content.s3-us-west-1.amazonaws.com/robin/dev/utils/Sound.js?v" + Math.random());

    var overlayID;
    var entityID;

    var endCondition = false;

    var startPosition;
    var isRunning = false;

    var distances = [8, 6, 2, 1.5, 1];
    var count = 0;

    var MIN_TIME_INVISIBLE = 100;
    var MAX_TIME_INVISIBLE = 2000;
    
    var MIN_TIME_VISIBLE = 500;
    var MAX_TIME_VISIBLE = 1500;
    
    var MIN_WAIT_TIME_JUMPSCARE = 5000;
    var MAX_WAIT_TIME_JUMPSCARE = 6000;
    
    var TIME_FINAL_MOVE_VISIBLE = 2000;
    var TIME_JUMPSCARE_VISIBLE = 1500;

    var SOUND_WHISPER_URL = "http://hifi-content.s3-us-west-1.amazonaws.com/robin/dev/domains/halloween/flashingLight/whisper1.wav";
    var SOUND_THUMP_URL = "https://hifi-content.s3.amazonaws.com/alan/dev/Audio/thud1.wav";
    var SOUND_FINAL_THUMP_URL = "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/Halloween/sounds/fleshed/_robin_hit_stereo.wav";
    var SOUND_SCREAM_URL = "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/Halloween/sounds/fleshed/_robin_scream_mono.wav";

    var soundWhisper;
    var soundFinalThump;
    var soundThump;
    var soundScream;

    var overlayProperties = {
        type: "model",
        name: "statue_apparition",
        url: "https://hifi-content.s3.amazonaws.com/alan/dev/Statue-Scary3.fbx",
        dimensions: { x: 0.6769, y: 1.7771, z: 0.7370 },
        visible: false
    };

    var utils = {

        position: {
            findSurfaceCollision: function (position) {
                // from position above ground, finds collision with ground
                var result = Entities.findRayIntersection({
                    origin: position,
                    direction: { x: 0.0, y: -1.0, z: 0.0 }
                }, true);

                if (result.intersects) {
                    return result.intersection;
                }
                return position;
            },
            getNext: function () {
                // statue movement using distances array
                var deltaMove;
                var direction;

                var isEnding = count >= distances.length;
                var is2ndLast = count === distances.length - 2;
                var is3rdLast = count === distances.length - 3;

                if (isEnding) {
                    // start jumpscare
                    endCondition = true;
                    return null;

                } else if (is2ndLast) {
                    // right
                    direction = Quat.getRight(MyAvatar.orientation);

                } else if (is3rdLast) {
                    // left
                    direction = Quat.inverse(Quat.getRight(MyAvatar.orientation));

                } else {
                    // forward for all other cases
                    direction = Quat.getForward(MyAvatar.orientation);

                }

                deltaMove = Vec3.multiply(distances[count], Vec3.normalize(direction));
                count++;

                var newPos = {
                    x: MyAvatar.position.x + deltaMove.x,
                    y: MyAvatar.position.y + 2, // 2 m above ground for hills
                    z: MyAvatar.position.z + deltaMove.z
                };

                // place on ground
                var surfacePos = this.findSurfaceCollision(newPos);
                newPos.y = surfacePos.y + (overlayProperties.dimensions.y / 2);

                return newPos;
            },
            getStart: function (position) {
                // starts as invisible overlay so do not see where this places the overlay
                var surfacePos = this.findSurfaceCollision(position);
                var startPos = {
                    x: surfacePos.x,
                    y: surfacePos.y + (overlayProperties.dimensions.y / 2),
                    z: surfacePos.z
                };

                return startPos;
            },
            updateModel: function (nextPlacement) {
                // updates the model with nextPlacement position
                var properties = {
                    visible: true,
                    position: nextPlacement.position,
                    rotation: nextPlacement.rotation 
                        ? nextPlacement.rotation 
                        : Quat.cancelOutRollAndPitch(Quat.lookAtSimple(nextPlacement.position, MyAvatar.position))
                };

                if (endCondition) {
                    properties.parentID = MyAvatar.sessionUUID;
                    properties.jointIndex = MyAvatar.getJointIndex("Head")
                        ? MyAvatar.getJointIndex("Head")
                        : MyAvatar.getJointIndex("Hips");
                }

                Overlays.editOverlay(overlayID, properties);
            }

        },
        createStatue: function () {
            // creates a new statue
            if (!overlayID) {
                overlayID = Overlays.addOverlay("model", overlayProperties);
            }
        },
        getRandom: function (min, max) {
            // get random number between min and max
            return Math.floor(Math.random() * (max - min)) + min;
        },
        getSoundPositionFromObject: function (position) {
            // makes the sounds sound close to the user

            var headIdx = MyAvatar.getJointIndex("Head");
            var headPosition = MyAvatar.getJointPosition(headIdx);

            var focusPosition = position;

            return Vec3.sum(Vec3.multiply(0.2, Vec3.normalize(Vec3.subtract(focusPosition, headPosition))), headPosition);
        }
    };

    function startJumpScare() {
        // begin the final jump scare

        Script.setTimeout(function () {

            var screamTimeBuffer = 1000;
            var visibleTimeBuffer = 500;

            soundScream.playSoundStaticPosition({
                position: MyAvatar.position,
                localOnly: true
            }, screamTimeBuffer);

            Script.setTimeout(
                // scream starts just before the jump scare
                jumpScare,
                visibleTimeBuffer
            );
        },
        utils.getRandom(MIN_WAIT_TIME_JUMPSCARE, MAX_WAIT_TIME_JUMPSCARE));

    }

    function jumpScare() {
        // do the jumpscare

        var modelFacePosition = { x: 0, y: -0.5, z: -0.5 };
        var endPosition = Vec3.sum(Camera.position, Vec3.multiplyQbyV(Camera.orientation, modelFacePosition));

        var modelEndPosition = {
            position: endPosition,
            rotation: Quat.cancelOutRollAndPitch(Quat.lookAtSimple(endPosition, Camera.position))
        };

        utils.position.updateModel(modelEndPosition);

        Script.setTimeout(
            scriptEnding,
            TIME_JUMPSCARE_VISIBLE
        );

    }

    function makeVisible() {
        // statue appears in new position

        var nextPosition = utils.position.getNext();
        var isLast = count === distances.length;

        utils.position.updateModel({ position: nextPosition });
        var soundPosition = utils.getSoundPositionFromObject(nextPosition);

        if (endCondition) {

            // begin jump scare
            makeInvisible();
            startJumpScare();

        } else if (isLast) {

            // final move
            soundFinalThump.playSoundStaticPosition({
                position: soundPosition,
                localOnly: true
            });

            Script.setTimeout(
                makeInvisible, 
                TIME_FINAL_MOVE_VISIBLE
            );

        } else {

            // regular move
            soundThump.playSoundStaticPosition({
                position: soundPosition,
                localOnly: true
            });

            Script.setTimeout(
                makeInvisible,
                utils.getRandom(MIN_TIME_VISIBLE, MAX_TIME_VISIBLE)
            );

        }
    }

    function makeInvisible() {
        // statue disappears

        Overlays.editOverlay(overlayID, {
            visible: false
        });

        Script.setTimeout(
            function () {
                if (!endCondition) {
                    makeVisible();
                }
            },
            utils.getRandom(MIN_TIME_INVISIBLE, MAX_TIME_INVISIBLE)
        );

    }

    function start() {

        endCondition = false;

        if (soundWhisper.isLoaded()) {

            soundWhisper.playSoundStaticPosition({
                position: MyAvatar.position,
                localOnly: true
            }, null, makeInvisible);

        } else {
            makeInvisible();
        }
    }

    var ZoneStatueJumpScare = function () {
        this.overlayID;
    };

    ZoneStatueJumpScare.prototype = {

        preload: function (id) {
            entityID = id;

            soundThump = new Sound(SOUND_THUMP_URL);
            soundWhisper = new Sound(SOUND_WHISPER_URL);
            soundFinalThump = new Sound(SOUND_FINAL_THUMP_URL);
            soundScream = new Sound(SOUND_SCREAM_URL);

            var properties = Entities.getEntityProperties(entityID, ["position"]);

            startPosition = utils.position.getStart(properties.position);
            overlayProperties.position = startPosition;

            utils.createStatue();
        },

        enterEntity: function () {
            if (isRunning === false){
                isRunning = true;
                start();
            }
        },

        unload: scriptEnding
    };

    function scriptEnding() {

        if (overlayID) {
            Overlays.deleteOverlay(overlayID);
            overlayID = null;
        }

        soundThump.unload();
        soundWhisper.unload();
        soundFinalThump.unload();
        soundScream.unload();

        var properties = Entities.getEntityProperties(entityID, ["position"]);

        startPosition = utils.position.getStart(properties.position);
        overlayProperties.position = startPosition;
        endCondition = false;
        count = 0;
        isRunning = false;

        utils.createStatue();
    }

    return new ZoneStatueJumpScare();
});