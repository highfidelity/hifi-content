// Sounds from:
// Laugh : https://freesound.org/people/RaspberryTickle/sounds/203230/
// Whispher: https://freesound.org/people/DRFX/sounds/350763/

(function () {

    var overlayID;
    var entityID;
    var flickerInterval;

    var DELTA_DISTANCE;

    var endCondition = false;

    var startPosition;

    var distances = [8, 6, 3, 1.5];
    var count = 0;

    var MIN_DELTA_MOVE = 750;
    var MAX_DELTA_INVISIBLE = 1750;
    var MAX_DELTA_VISIBLE = 1750;

    var MIN_DELTA_END = 2000;
    var MAX_DELTA_END = 5000;

    var END_VISIBLE = 1250;

    var SECS_TO_MS = 1000;

    var isRunning = false;

    var SOUND_WHISPER_URL = "http://hifi-content.s3-us-west-1.amazonaws.com/robin/dev/domains/halloween/flashingLight/whisper1.wav";
    var SOUND_LAUGH_URL = "http://hifi-content.s3-us-west-1.amazonaws.com/robin/dev/domains/halloween/flashingLight/childlaugh.wav";
    var SOUND_THUMP_URL = "https://hifi-content.s3.amazonaws.com/alan/dev/Audio/thud1.wav";

    var soundWhisper;
    var soundLaugh;
    var soundThump;

    var injectorWhispher;
    var injectorLaugh;
    var injectorThump;

    var overlayProperties = {
        type: "model",
        name: "test_hello", // https://hifi-content.s3.amazonaws.com/alan/dev/Statue-Scary.fbx
        url: "https://hifi-content.s3.amazonaws.com/alan/dev/Statue-Scary2.fbx",
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

        // use distances array
        if (count >= distances.length) {
            endCondition = true;
            return null;
        }

        var deltaMove = Vec3.multiply(distances[count], Vec3.normalize(Quat.getForward(MyAvatar.orientation)));

        count++;
        print(JSON.stringify(deltaMove));

        print("count is :", count, JSON.stringify(deltaMove));

        /*

        // follow Avatar
        var moveTowards = MyAvatar.position;

        // END CONDITION
        // model current position is within deltaDistance
        if (Vec3.distance(curPosition, MyAvatar.position) < deltaDistance) {
            endCondition = true;
            return null;
        }

        // calculate next closer position to user
        var deltaMove = Vec3.multiply(deltaDistance, Vec3.normalize(Vec3.subtract(moveTowards, curPosition)));

        */


        var newPos = {
            x: MyAvatar.position.x + deltaMove.x, // was curPosition
            y: MyAvatar.position.y + 2,
            z: MyAvatar.position.z + deltaMove.z
        };

        print("1  :", JSON.stringify(newPos));

        var surfacePos = findSurfaceBelowPosition(newPos);

        print("2 new Pos  :", JSON.stringify(surfacePos));

        newPos.y = surfacePos.y + (overlayProperties.dimensions.y / 2);

        print("3 new Pos  :", JSON.stringify(newPos));

        return newPos;
    }

    function getStartPosition(position) {
        var surfacePos = findSurfaceBelowPosition(position);
        var startPos = {
            x: surfacePos.x, // was curPosition
            y: surfacePos.y + (overlayProperties.dimensions.y / 2),
            z: surfacePos.z
        };

        return startPos;
    }

    function startEnd() {

        Script.setTimeout(function () {

            if (soundLaugh.downloaded) {

                injectorLaugh = Audio.playSound(soundLaugh, {
                    position: MyAvatar.position,
                    volume: 0.6,
                    localOnly: true
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
                }, END_VISIBLE); // 1500);
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

        // Entities.editEntity(lightID, { visible: true });
        Overlays.editOverlay(overlayID, properties); // Overlays.editOverlay
    }

    function flickerModel() {

        // flickerInterval = Script.setInterval(function () {
        //     Overlays.editOverlay(overlayID, {
        //         alpha: Math.abs(Math.sin(Date.now())) // Math.random() * (1 - 0.2) + 0.2 // Math.abs(Math.sin(Date.now()))
        //     });
        // }, 150);

    }

    function turnOn() {

        if (isRunning) {

            var nextPosition = getNextPosition(DELTA_DISTANCE);

            if (!endCondition) {

                updateModelPosition({ position: nextPosition });

                var soundPosition = getPositionFromObject(nextPosition);


                if (soundThump.downloaded) {
                    injectorThump = Audio.playSound(soundThump, {
                        position: soundPosition,
                        localOnly: true
                    });
        
                    var soundLength = soundThump.duration * SECS_TO_MS;
        
                    Script.setTimeout(function () {
                        if (injectorThump) {
                            injectorThump.stop();
                            injectorThump = null;
        
                            turnOff();
                        }
                    }, soundLength);
                }

                // curPosition = nextPosition;

                Script.setTimeout(function () {
                    turnOff();
                }, getRandomDeltaTime(MIN_DELTA_MOVE, MAX_DELTA_VISIBLE)); // DELTA_TIME);

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

            setVisibleFalse(overlayID);

            Script.setTimeout(function () {

                if (!endCondition) {
                    turnOn();
                }

            }, getRandomDeltaTime(MIN_DELTA_MOVE, MAX_DELTA_INVISIBLE)); // DELTA_TIME);

        } else {
            scriptEnding();
        }

    }

    function setVisibleFalse(id) {
        Overlays.editOverlay(id, {
            visible: false
        });
    }

    // function setVisibleFalse(id) {
    //     Entities.editEntity(id, {
    //         visible: false
    //     });
    // }

    // function setVisibleTrue(id) {
    //     Entities.editEntity(id, {
    //         visible: true
    //     });
    // }


    function getPositionFromObject(position) {

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

        if (soundWhisper.downloaded) {
            injectorWhispher = Audio.playSound(soundWhisper, {
                position: MyAvatar.position,
                localOnly: true
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

    function createStatue() {

        if (!overlayID) {
            overlayID = Overlays.addOverlay("model", overlayProperties);
        }

        flickerModel();

    }

    var Zone = function () {
        this.overlayID;
    };

    Zone.prototype = {

        preload: function (id) {
            entityID = id;

            soundWhisper = SoundCache.getSound(SOUND_WHISPER_URL);
            soundLaugh = SoundCache.getSound(SOUND_LAUGH_URL);
            soundThump = SoundCache.getSound(SOUND_THUMP_URL);

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

            print("POSITION IS", JSON.stringify(properties.position));

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

        if (flickerInterval) {
            Script.clearInterval(flickerInterval);
        }

        if (overlayID) {
            Overlays.deleteOverlay(overlayID);
            overlayID = null;
        }

        if (injectorWhispher) {
            injectorWhispher.stop();
            injectorWhispher = null;
        }

        if (injectorLaugh) {
            injectorLaugh.stop();
            injectorLaugh = null;
        }

        if (injectorThump) {
            injectorThump.stop();
            injectorThump = null;
        }

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


// function Sound(url) {
//     this.url = url;
//     this.sound;
//     this.injector;
//     this.SECS_TO_MS = 1000;
// }

// Sound.prototype = {
//     prefetch: function () {
//         this.sound = SoundCache.getSound(this.url);
//     },
//     isLoaded: function() {
//         return this.sound.downloaded;
//     },
//     getDurationSeconds: function () {
//         if (this.sound.downloaded) {
//             return this.sound.length;
//         }
//     },
//     getDurationMS: function () {
//         if (this.sound.downloaded) {
//             return this.sound.length;
//         }
//     },
//     playSoundStaticPosition: function(position, inputVolume, callback, args) {
//         if (this.sound.downloaded) {
//             this.injector = Audio.playSound(this.sound, {
//                 position: position,
//                 volume: inputVolume
//             });

//             var soundLength = this.getDurationMS();
//             var injector;

//             Script.setTimeout(function () {
//                 if (this.injector) {
//                     this.injector.stop();
//                     this.injector = null;
//                 }
//                 callback(args);
//             }, soundLength);
//         }
//     },
//     playSoundUpdateEntityPositon: function(inputVolume, entityID, callback, args) {
//         if (this.sound.downloaded) {
//             this.injector = Audio.playSound(this.sound, {
//                 position: position,
//                 volume: inputVolume
//             });

//             var soundLength = this.getDurationMS();
//             var injector;

//             Script.setTimeout(function () {
//                 if (this.injector) {
//                     this.injector.stop();
//                     this.injector = null;
//                 }
//                 callback(args);
//             }, soundLength);
//         }
//     }
// };