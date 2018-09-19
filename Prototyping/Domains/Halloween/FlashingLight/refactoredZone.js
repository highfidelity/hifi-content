// Sounds from:
// Whispher: https://freesound.org/people/DRFX/sounds/350763/


// http://hifi-content.s3-us-west-1.amazonaws.com/robin/dev/utils/Sound.js

(function () {

    var Sound = Script.require("http://hifi-content.s3-us-west-1.amazonaws.com/robin/dev/utils/Sound.js?v" + Math.random());

    var overlayID;
    var entityID;

    var endCondition = false;

    var startPosition;

    var distances = [8, 6, 2, 1.5, 1];
    var count = 0;

    var MIN_TIME_INVISIBLE = 100;
    var MAX_TIME_INVISIBLE = 2000;

    var MIN_TIME_VISIBLE = 500;
    var MAX_TIME_VISIBLE = 1500;

    var MIN_WAIT_TIME_JUMPSCARE = 5000;
    var MAX_WAIT_TIME_JUMPSCARE = 6000;

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

        findSurfaceBelowPosition: function (pos) {
            var result = Entities.findRayIntersection({
                origin: pos,
                direction: { x: 0.0, y: -1.0, z: 0.0 }
            }, true);
    
            if (result.intersects) {
                return result.intersection;
            }
            return pos;
        },

    }

    function findSurfaceBelowPosition(pos) {
        var result = Entities.findRayIntersection({
            origin: pos,
            direction: { x: 0.0, y: -1.0, z: 0.0 }
        }, true);

        if (result.intersects) {
            return result.intersection;
        }
        return pos;
    }

    function getNextPosition() {

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

    function startJumpScare() {

        Script.setTimeout(function () {

            soundScream.playSoundStaticPosition({
                position: MyAvatar.position,
                localOnly: true
            }, 1000);

            Script.setTimeout(function () {
                // scream starts just before the jump scare
                jumpScare();

            }, 500);

        }, getRandomDeltaTime(MIN_WAIT_TIME_JUMPSCARE, MAX_WAIT_TIME_JUMPSCARE));
    }

    function jumpScare() {

        var modelFacePosition = { x: 0, y: -0.5, z: -0.5 };
        var endPosition = Vec3.sum(Camera.position, Vec3.multiplyQbyV(Camera.orientation, modelFacePosition));

        var modelEndPosition = {
            position: endPosition,
            rotation: Quat.cancelOutRollAndPitch(Quat.lookAtSimple(endPosition, Camera.position))
        };

        updateModelPosition(modelEndPosition);

        Script.setTimeout(function () {
            scriptEnding();
        }, TIME_JUMPSCARE_VISIBLE);

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

    function makeVisible() {

        var nextPosition = getNextPosition();
        var isLast = count === distances.length;

        updateModelPosition({ position: nextPosition });
        var soundPosition = getPositionFromObject(nextPosition);

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

            Script.setTimeout(function () {
                makeInvisible();
            }, 2000);

        } else {

            // regular move
            soundThump.playSoundStaticPosition({
                position: soundPosition,
                localOnly: true
            });

            Script.setTimeout(function () {
                makeInvisible();
            }, getRandomDeltaTime(MIN_TIME_VISIBLE, MAX_TIME_VISIBLE));

        }

        // if (!endCondition) {

        //     print("5 ++++ ", endCondition);

        //     updateModelPosition({ position: nextPosition });

        //     var soundPosition = getPositionFromObject(nextPosition);

        //     if (count === distances.length) {
        //         // final thump

        //         if (soundFinalThump.isLoaded()) {

        //             soundFinalThump.playSoundStaticPosition({
        //                 position: soundPosition,
        //                 localOnly: true
        //             });

        //         }

        //     } else if (soundThump.isLoaded()) {

        //         soundThump.playSoundStaticPosition({
        //             position: soundPosition,
        //             localOnly: true
        //         });

        //     }

        //     // turn off
        //     Script.setTimeout(function () {
        //         makeInvisible();
        //     }, count === distances.length ? 2000 : getRandomDeltaTime(MIN_TIME_VISIBLE, MAX_TIME_VISIBLE)); // DELTA_TIME);

        // } else {
        //     print("3 ++++ ");
        //     makeInvisible();
        //     startJumpScare();
        // }

    }

    function makeInvisible() {

        setInvisible(overlayID);

        Script.setTimeout(function () {

            if (!endCondition) {
                makeVisible();
            }

        }, getRandomDeltaTime(MIN_TIME_INVISIBLE, MAX_TIME_INVISIBLE)); // DELTA_TIME);

    }

    function setInvisible(id) {
        Overlays.editOverlay(id, {
            visible: false
        });
    }

    function getPositionFromObject(position) { // getSoundPosition 
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

        endCondition = false;

        if (soundWhisper.isLoaded()) {

            soundWhisper.playSoundStaticPosition({
                position: MyAvatar.position,
                localOnly: true
            }, null, makeInvisible);

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

        soundThump.unload();
        soundWhisper.unload();
        soundFinalThump.unload();
        soundScream.unload();

        var properties = Entities.getEntityProperties(entityID, ["position"]);

        startPosition = getStartPosition(properties.position);
        overlayProperties.position = startPosition;
        endCondition = false;
        count = 0;

        createStatue();
    }

    return new Zone();
});