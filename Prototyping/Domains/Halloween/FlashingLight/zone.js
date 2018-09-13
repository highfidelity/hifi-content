// Sounds from: 
// Laugh : https://freesound.org/people/RaspberryTickle/sounds/203230/
// Whispher: https://freesound.org/people/DRFX/sounds/350763/

(function () {

    var lightID;
    var objectID;
    var entityID;

    var DELTA_DISTANCE;

    var endCondition = false;

    var curPosition;

    var BASE_TIME = 500;
    var SECS_TO_MS = 1000;

    var isRunning = false;

    var SOUND_WHISPER_URL = "http://hifi-content.s3-us-west-1.amazonaws.com/robin/dev/domains/halloween/flashingLight/whisper1.wav";
    var SOUND_LAUGH_URL = "http://hifi-content.s3-us-west-1.amazonaws.com/robin/dev/domains/halloween/flashingLight/childlaugh.wav";

    var soundWhisper;
    var soundLaugh;
    var injectorWhispher;
    var injectorLaugh;

    var modelProperties = {
        name: "test_hello",
        type: "Model",
        modelURL: "http://hifi-content.s3-us-west-1.amazonaws.com/robin/dev/domains/halloween/flashingLight/boyStatue.fbx",
        lifetime: 180,
        dimensions: { x: 0.5015, y: 0.9090, z: 0.5014 }
    };

    var lightProperties = {
        name: "robin_test_Flicker Light",
        type: "Light",
        userData: "{\"grabbableKey\":{\"grabbable\":false},\"maxLightIntensity\":5,\"interval\":150}",
        serverScripts: "http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/zombies/flicker.js",
        visible: true,
        canCastShadow: true,
        collisionless: true,
        color: {
            red: 164,
            green: 224,
            blue: 197
        },
        isSpotlight: true,
        falloffRadius: 10,
        exponent: 10,
        cutoff: 60,
        clientOnly: false,
        localPosition: {
            x: 0.16131210327148438,
            y: -0.13422012329101562,
            z: -0.9129418730735779
        },
        localRotation: {
            x: 0.996185302734375,
            y: -0.0000457763671875,
            z: -0.0001068115234375,
            w: 0.08711373805999756
        },
        localDimensions: {
            x: 23.510772705078125,
            y: 23.510772705078125,
            z: 27.147899627685547
        }
    };

    var DELTA_TIME = 1500;

    // var MIN_DELTA_TIME = 10;
    // var MAX_DELTA_TIME = 1000;


    function getNextPosition(deltaDistance) {
        var moveTowards = MyAvatar.position;

        // END CONDITION
        // model current position is within deltaDistance
        if (Vec3.distance(curPosition, MyAvatar.position) < deltaDistance) {
            endCondition = true;
            return null;
        }

        // calculate next closer position to user
        var deltaMove = Vec3.multiply(deltaDistance, Vec3.normalize(Vec3.subtract(moveTowards, curPosition)));

        var newPos = {
            x: curPosition.x + deltaMove.x,
            y: curPosition.y,
            z: curPosition.z + deltaMove.z
        };

        return newPos;
    }

    function startEnd() {

        // var lightNextPosition = {
        //     position: Vec3.sum(Camera.position, Vec3.multiplyQbyV(Camera.orientation, lightFacePosition)),
        //     rotation: Camera.orientation
        // };

        Script.setTimeout(function () {

            if (soundLaugh.downloaded) {

                injectorLaugh = Audio.playSound(soundLaugh, {
                    position: MyAvatar.position,
                    inputVolume: 0.3
                });

                var soundLength = soundLaugh.duration * SECS_TO_MS;

                Script.setTimeout(function () {
                    if (injectorLaugh) {
                        injectorLaugh.stop();
                        injectorLaugh = null;
                    }

                    lastVisible();

                }, soundLength);
            } else {
                lastVisible();
            }

            function lastVisible() {

                var modelFacePosition = { x: 0, y: -0.3, z: -0.5 };
                var endPosition = Vec3.sum(Camera.position, Vec3.multiplyQbyV(Camera.orientation, modelFacePosition));
                // var lightFacePosition = { x: 0, y: -0.3, z: -0.9 };
        
                var modelEndPosition = {
                    position: endPosition,
                    rotation: Quat.cancelOutRollAndPitch(Quat.lookAtSimple(endPosition, Camera.position))
                };

                updateModelPosition(modelEndPosition);

                Script.setTimeout(function () {
                    scriptEnding();
                }, 1500);
            }

        }, 3000); // BASE_TIME + random?
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

        Entities.editEntity(lightID, { visible: true });
        Entities.editEntity(objectID, properties);
    }

    // function updateLightPosition (nextPlacement) {
    //     Entities.editEntity(lightID, {
    //         position: nextPlacement.position, // check closer to user?
    //         rotation: nextPlacement.rotation ? nextPlacement.rotation : Quat.getUp(Camera.orientation) // check
    //     });
    // }

    // function getInFrontOverlayProperties (positionInFront, dimensions, url) {
    //     var index = MyAvatar.getJointIndex("Head");

    //     return {
    //         position: Vec3.sum(Camera.position, Vec3.multiplyQbyV(Camera.orientation, positionInFront)),
    //         rotation: Camera.orientation,
    //         parentID: MyAvatar.sessionUUID,
    //         parentJointIndex: index,
    //         dimensions: dimensions,
    //         ignoreRayIntersection: false,
    //         drawInFront: true,
    //         visible: true,
    //         emissive: true
    // }

    function turnOn() {

        if (isRunning) {

            var nextPosition = getNextPosition(DELTA_DISTANCE);

            if (!endCondition) {
                updateModelPosition({ position: nextPosition });
                curPosition = nextPosition;

                Script.setTimeout(function () {
                    turnOff();
                }, DELTA_TIME);

            } else {
                turnOff();
                startEnd();
            }

            print(JSON.stringify(nextPosition));

        } else {
            scriptEnding();
        }
    }

    function turnOff() {

        if (isRunning) {

            setVisibleFalse(objectID);
            setVisibleFalse(lightID);

            Script.setTimeout(function () {

                if (!endCondition) {
                    turnOn();
                }

            }, DELTA_TIME);

        } else {
            scriptEnding();
        }

    }

    function setVisibleFalse(id) {
        Entities.editEntity(id, {
            visible: false
        });
    }

    function setVisibleTrue(id) {
        Entities.editEntity(id, {
            visible: true
        });
    }

    function getRandomTime(max) {
        return Math.floor(Math.random() * (max - BASE_TIME)) + BASE_TIME;
    }

    function start() {
        isRunning = true;
        endCondition = false;

        if (soundWhisper.downloaded) {
            injectorWhispher = Audio.playSound(soundWhisper, {
                position: curPosition,
                inputVolume: 0.3
            });

            var soundLength = soundWhisper.duration * SECS_TO_MS;

            Script.setTimeout(function () {
                if (injectorWhispher) {
                    injectorWhispher.stop();
                    injectorWhispher = null;

                    turnOff();
                }
            }, soundLength);
        }
    }

    function createObjectAndLight() {
        objectID = Entities.addEntity(modelProperties);
        lightProperties.parentID = objectID;
        lightID = Entities.addEntity(lightProperties);
    }

    var Zone = function () {
        this.objectID;
    };

    Zone.prototype = {

        preload: function (id) {
            entityID = id;

            soundWhisper = SoundCache.getSound(SOUND_WHISPER_URL);
            soundLaugh = SoundCache.getSound(SOUND_LAUGH_URL);

            var properties = Entities.getEntityProperties(entityID, ["userData", "position"]);
            var userData = properties.userData;
            var data;

            try {
                data = JSON.parse(userData);
            } catch (e) {
                console.error(e);
            }

            if (data) {
                DELTA_DISTANCE = data.deltaDistance;
            }

            modelProperties.position = properties.position;
            curPosition = properties.position;
        },

        enterEntity: function () {
            start();
        },

        leaveEntity: function () {
            this.unload();
        },
        unload: scriptEnding
    };

    function scriptEnding() {

        if (objectID && lightID) {
            Entities.deleteEntity(objectID);
            Entities.deleteEntity(lightID);

            objectID = null;
            lightID = null;
        }

        if (injectorWhispher) {
            injectorWhispher.stop();
            injectorWhispher = null;
        }

        if (injectorLaugh) {
            injectorLaugh.stop();
            injectorLaugh = null;
        }

        var properties = Entities.getEntityProperties(entityID, ["position"]);

        curPosition = properties.position;
        endCondition = false;
        isRunning = false;

        createObjectAndLight();
    }

    return new Zone();
});