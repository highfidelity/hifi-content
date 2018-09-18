// Sounds from:
// Whispher: https://freesound.org/people/DRFX/sounds/350763/


// http://hifi-content.s3-us-west-1.amazonaws.com/robin/dev/utils/Sound.js

(function () {

    var Sound = Script.require("http://hifi-content.s3-us-west-1.amazonaws.com/robin/dev/utils/Sound.js?v" + Math.random());

    var overlayID;
    var entityID;
    var flickerInterval;

    var DELTA_DISTANCE;

    var endCondition = false;

    var startPosition;

    var distances = [8, 6, 2, 1.5, 1];
    var count = 0;

    var MIN_DELTA_MOVE = 1000;


    var MIN_DELTA_INVISIBLE = 100;
    var MAX_DELTA_INVISIBLE = 2000;

    var MIN_DELTA_VISIBLE = 500;
    var MAX_DELTA_VISIBLE = 1500;

    var MIN_DELTA_END = 5000;
    var MAX_DELTA_END = 6000;

    var END_VISIBLE = 1500;

    var SECS_TO_MS = 1000;

    var isRunning = false;

    var SOUND_WHISPER_URL = "http://hifi-content.s3-us-west-1.amazonaws.com/robin/dev/domains/halloween/flashingLight/whisper1.wav";
    var SOUND_LAUGH_URL = "http://hifi-content.s3-us-west-1.amazonaws.com/robin/dev/domains/halloween/flashingLight/childlaugh.wav";
    var SOUND_THUMP_URL = "https://hifi-content.s3.amazonaws.com/alan/dev/Audio/thud1.wav";
    var SOUND_FINAL_THUMP_URL = "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/Halloween/sounds/fleshed/_robin_hit_stereo.wav";
    var SOUND_SCREAM_URL = "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/Halloween/sounds/fleshed/_robin_scream_mono.wav";

    var soundWhisper;
    var soundFinalThump;
    var soundThump;
    var soundScream;

    var injectorWhispher;
    var injectorFinalThump;
    var injectorThump;
    var injectorScream;

    var overlayProperties = {
        type: "model",
        name: "test_hello", // https://hifi-content.s3.amazonaws.com/alan/dev/Statue-Scary.fbx
        url: "https://hifi-content.s3.amazonaws.com/alan/dev/Statue-Scary3.fbx",
        dimensions: { x: 0.6769, y: 1.7771, z: 0.7370 }, //  2.0453 0.8890 // dimensions: { x: 0.5015, y: 0.9090, z: 0.5014 }
        visible: false
    };

    function findSurfaceBelowPosition(pos) {
        var result = Entities.findRayIntersection({
            origin: pos,
            direction: { x: 0.0, y: -1.0, z: 0.0 }
        }, true);

        JSON.stringify("findSurfaceBelowPosition", JSON.stringify(result));
        if (result.intersects) {
            return result.intersection;
        }
        return pos;
    }

    function getNextPosition(deltaDistance) {

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
        var surfacePos = findSurfaceBelowPosition(newPos);
        newPos.y = surfacePos.y + (overlayProperties.dimensions.y / 2);

        return newPos;
    }

    function getStartPosition(position) {
        // starts as invisible overlay so do not see where this places the overlay
        var surfacePos = findSurfaceBelowPosition(position);
        var startPos = {
            x: surfacePos.x,
            y: surfacePos.y + (overlayProperties.dimensions.y / 2),
            z: surfacePos.z
        };

        return startPos;
    }

    function startEnd() {
        print("STARTING END ++++ ");

        Script.setTimeout(function () {

            if (soundScream.isLoaded()) {

                soundScream.playSoundStaticPosition({
                    position: MyAvatar.position,
                    localOnly: true
                }, 1000, turnOff);

                // injectorScream = Audio.playSound(soundScream, {
                //     position: MyAvatar.position,
                //     localOnly: true
                // });

                Script.setTimeout(function () {

                    lastVisible();

                }, 500);

                // var soundLengthScream = soundScream.duration * SECS_TO_MS;

                // Script.setTimeout(function () {
                //     if (injectorScream) {
                //         injectorScream.stop();
                //         injectorScream = null;

                //         turnOff();
                //     }
                // }, soundLengthScream + 1000);

            } else {
                lastVisible();
            }

            function lastVisible() {

                var modelFacePosition = { x: 0, y: -0.5, z: -0.5 };
                var endPosition = Vec3.sum(Camera.position, Vec3.multiplyQbyV(Camera.orientation, modelFacePosition));

                var modelEndPosition = {
                    position: endPosition,
                    rotation: Quat.cancelOutRollAndPitch(Quat.lookAtSimple(endPosition, Camera.position))
                };

                updateModelPosition(modelEndPosition);

                Script.setTimeout(function () {
                    scriptEnding();
                }, END_VISIBLE);
            }

        }, getRandomDeltaTime(MIN_DELTA_END, MAX_DELTA_END)); // 3000); // BASE_TIME + random?
    }

    function updateModelPosition(nextPlacement) {

        var properties = {
            visible: true,
            position: nextPlacement.position,
            rotation: nextPlacement.rotation ? nextPlacement.rotation : Quat.cancelOutRollAndPitch(Quat.lookAtSimple(nextPlacement.position, MyAvatar.position))
        };

        if (endCondition) {
            properties.parentID = MyAvatar.sessionUUID;
            properties.jointIndex = MyAvatar.getJointIndex("Head")
                ? MyAvatar.getJointIndex("Head")
                : MyAvatar.getJointIndex("Hips");
        }

        Overlays.editOverlay(overlayID, properties);
    }

    function turnOn() {

        if (isRunning) {

            var nextPosition = getNextPosition(DELTA_DISTANCE);

            if (!endCondition) {

                print("5 ++++ ", endCondition);

                updateModelPosition({ position: nextPosition });

                var soundPosition = getPositionFromObject(nextPosition);

                if (count === distances.length) {
                    // final thump

                    if (soundFinalThump.isLoaded()) {
                        soundFinalThump.playSoundStaticPosition({
                            position: soundPosition,
                            localOnly: true
                        });

                        // injectorFinalThump = Audio.playSound(soundFinalThump, {
                        //     position: soundPosition,
                        //     localOnly: true
                        // });

                        // var soundLengthLaugh = soundFinalThump.duration * SECS_TO_MS;

                        // Script.setTimeout(function () {
                        //     if (injectorFinalThump) {
                        //         injectorFinalThump.stop();
                        //         injectorFinalThump = null;

                        //     }
                        // }, soundLengthLaugh);

                    }

                } else if (soundThump.isLoaded()) { //(soundThump.downloaded) {

                    soundThump.playSoundStaticPosition({
                        position: soundPosition,
                        localOnly: true
                    });

                    // injectorThump = Audio.playSound(soundThump, {
                    //     position: soundPosition,
                    //     localOnly: true
                    // });

                    // var soundLength = soundThump.duration * SECS_TO_MS;

                    // Script.setTimeout(function () {
                    //     if (injectorThump) {
                    //         injectorThump.stop();
                    //         injectorThump = null;

                    //     }
                    // }, soundLength);

                }

                // turn off
                Script.setTimeout(function () {
                    turnOff();
                }, count === distances.length ? 2000 : getRandomDeltaTime(MIN_DELTA_VISIBLE, MAX_DELTA_VISIBLE)); // DELTA_TIME);

            } else {
                print("3 ++++ ");
                turnOff();
                startEnd();
            }
        } else {
            scriptEnding();
        }
    }

    function turnOff() {

        if (isRunning) {

            setVisibleFalse(overlayID);

            Script.setTimeout(function () {

                if (!endCondition) {
                    turnOn();
                }

            }, getRandomDeltaTime(MIN_DELTA_INVISIBLE, MAX_DELTA_INVISIBLE)); // DELTA_TIME);

        } else {
            print("1 ++++ ");
            scriptEnding();
        }

    }

    function setVisibleFalse(id) {
        Overlays.editOverlay(id, {
            visible: false
        });
    }

    function getPositionFromObject(position) {
        // makes the sounds sound close to the user

        var headIdx = MyAvatar.getJointIndex("Head");
        var headPos = MyAvatar.getJointPosition(headIdx);

        var focusPosition = position;

        return Vec3.sum(Vec3.multiply(0.2, Vec3.normalize(Vec3.subtract(focusPosition, headPos))), headPos);
    }

    function getRandomDeltaTime(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function start() {
        isRunning = true;
        endCondition = false;

        if (soundWhisper.isLoaded()) {

            soundWhisper.playSoundStaticPosition({
                position: MyAvatar.position,
                localOnly: true
            }, null, turnOff);

            // injectorWhispher = Audio.playSound(soundWhisper, {
            //     position: MyAvatar.position,
            //     localOnly: true
            // });

            // var soundLength = soundWhisper.duration * SECS_TO_MS;

            // Script.setTimeout(function () {
            //     if (injectorWhispher) {
            //         injectorWhispher.stop();
            //         injectorWhispher = null;

            //         turnOff(); // not necessary since it's already visible false
            //     }
            // }, soundLength);
        }
    }

    function createStatue() {

        if (!overlayID) {
            overlayID = Overlays.addOverlay("model", overlayProperties);
        }

    }

    var Zone = function () {
        this.overlayID;
    };

    Zone.prototype = {

        preload: function (id) {
            entityID = id;

            soundThump = new Sound(SOUND_THUMP_URL);
            soundWhisper = new Sound(SOUND_WHISPER_URL);
            soundFinalThump = new Sound(SOUND_FINAL_THUMP_URL);
            soundScream = new Sound(SOUND_SCREAM_URL);

            print(soundThump);
            print(Sound);

            // soundWhisper = SoundCache.getSound(SOUND_WHISPER_URL);
            // soundFinalThump = SoundCache.getSound(SOUND_FINAL_THUMP_URL);
            // soundThump = SoundCache.getSound(SOUND_THUMP_URL);
            // soundScream = SoundCache.getSound(SOUND_SCREAM_URL);

            var properties = Entities.getEntityProperties(entityID, ["position"]);

            startPosition = getStartPosition(properties.position);
            overlayProperties.position = startPosition;

            createStatue();
        },

        enterEntity: function () {
            start();
        },

        leaveEntity: function () {
            // this.unload();
        },

        unload: scriptEnding
    };

    function scriptEnding() {

        if (overlayID) {
            Overlays.deleteOverlay(overlayID);
            overlayID = null;
        }

        // if (injectorWhispher) {
        //     injectorWhispher.stop();
        //     injectorWhispher = null;
        // }

        // if (injectorFinalThump) {
        //     injectorFinalThump.stop();
        //     injectorFinalThump = null;
        // }

        soundThump.unload();
        soundWhisper.unload();
        soundFinalThump.unload();
        soundScream.unload();

        // if (injectorThump) {
        //     injectorThump.stop();
        //     injectorThump = null;
        // }

        // if (injectorScream) {
        //     injectorScream.stop();
        //     injectorScream = null;
        // }

        var properties = Entities.getEntityProperties(entityID, ["position"]);

        startPosition = getStartPosition(properties.position);
        overlayProperties.position = startPosition;
        endCondition = false;
        isRunning = false;
        count = 0;

        createStatue();
    }

    return new Zone();
});