// pinSetterEntityServer.js
// Copyright 2016 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var _this;

    var TIMEOUT = 10000;
    var canReset = true;

    var WANT_DEBUG = true;
    var debugPrint = function(message) {};
    if (WANT_DEBUG) {
        debugPrint = function(message) {
            print('pinSetterEntityServer.js: ' + message);
        }
    }

    var BOWLING_ALLEY_PREFIX_URL = 'http://hifi-content.s3.amazonaws.com/caitlyn/production/bowlingAlley/';

    var BELL_SOUND_URL = BOWLING_ALLEY_PREFIX_URL + 'bell.wav';
    var RETURN_SOUND_URL = BOWLING_ALLEY_PREFIX_URL + 'caitlynMeeks_ball%20return%20mechanism.wav';

    var IMPORT_URL_PINSET = BOWLING_ALLEY_PREFIX_URL + 'bpins4.svo.json';
    var IMPORT_URL_BALL = BOWLING_ALLEY_PREFIX_URL + 'bowlingBall.svo.json';

    var SECONDS_IN_HOUR = 3600;
    var MAX_EQUIPMENT_LIFETIME = SECONDS_IN_HOUR;
    var SECOND_BALL_WAIT_MILLISECONDS = 2000;

    var TRIANGLE_NUMBER_OF_PINS = 4;
    var TRIANGLE_WIDTH = 1;

    var PIN_DIMENSIONS = {
        x: 0.1638,
        y: 0.3971,
        z: 0.1638
    };

    var BOWLING_BALLS = [
        {
            name: 'Bowling ball - Salmon',
            density: 5000,
            dimensions: {
                x: 0.245,
                y: 0.245,
                z: 0.245
            }
        },
        {
            name: 'Bowling ball - Purple',
            density: 6000,
            dimensions: {
                x: 0.265,
                y: 0.265,
                z: 0.265
            },
            textures: JSON.stringify({
                file4: BOWLING_ALLEY_PREFIX_URL + 'bowlingball_Base_Color_purple.png',
                file5: BOWLING_ALLEY_PREFIX_URL + 'ball_salmon.fbx/../../../../Downloads/bowlingball.fbm/bowlingball_Roughness.png'
            })
        },
        {
            name: 'Bowling ball - Yellow',
            density: 4000,
            dimensions: {
                x: 0.205,
                y: 0.205,
                z: 0.205
            },
            textures: JSON.stringify({
                file4: BOWLING_ALLEY_PREFIX_URL + 'bowlingball_Base_Color_yellow.png',
                file5: BOWLING_ALLEY_PREFIX_URL + 'ball_salmon.fbx/../../../../Downloads/bowlingball.fbm/bowlingball_Roughness.png'
            })
        },
        {
            name: 'Bowling ball - Blue',
            density: 5500,
            dimensions: {
                x: 0.255,
                y: 0.255,
                z: 0.255
            },
            textures: JSON.stringify({
                file4: BOWLING_ALLEY_PREFIX_URL + 'bowlingball_Base_Color_blue.png',
                file5: BOWLING_ALLEY_PREFIX_URL + 'ball_salmon.fbx/../../../../Downloads/bowlingball.fbm/bowlingball_Roughness.png'
            })
        }
    ];

    var returnSound, ringSound;
    var pinJointPosition, ballJointPosition, pinJointRotation;

    // See https://en.wikipedia.org/wiki/Triangular_number for Triangle numbers (T1 = 1, T2 = 3, T3 = 6 ... etc)
    var getPinPositions = function(maxWidth, triangleNumber) {
        var pinPositions = [];
        var gapSpace = maxWidth / triangleNumber;
        for (var row = 0; row < triangleNumber; row++) {
            var rowPins = triangleNumber - row;
            for (var rowPinIndex = 0; rowPinIndex < rowPins; rowPinIndex++) {
                pinPositions.push({
                    x: (-((rowPins - 1) / 2) + rowPinIndex) * gapSpace,
                    z: row * gapSpace
                })
            }
        }

        return pinPositions;
    };

     // Creates an entity and returns a mixed object of the creation properties and the assigned entityID
     var createEntity = function(entityProperties, parent) {
        if (parent.rotation !== undefined) {
            if (entityProperties.rotation !== undefined) {
                entityProperties.rotation = Quat.multiply(parent.rotation, entityProperties.rotation);
            } else {
                entityProperties.rotation = parent.rotation;
            }
        }
        if (parent.position !== undefined) {
            var localPosition = (parent.rotation !== undefined) ? Vec3.multiplyQbyV(parent.rotation, entityProperties.position) : entityProperties.position;
            entityProperties.position = Vec3.sum(localPosition, parent.position);
        }
        if (parent.id !== undefined) {
            entityProperties.parentID = parent.id;
        }
        entityProperties.id = Entities.addEntity(entityProperties);
        return entityProperties;
    };

    var createPin = function (transform, extraProperties, bowlingAlley) {
        var entityProperties = {
            compoundShapeURL: BOWLING_ALLEY_PREFIX_URL + 'bowlingpin_hull.obj',
            dimensions: PIN_DIMENSIONS,
            dynamic: true,
            gravity: {
                x: 0,
                y: -9.8,
                z: 0
            },
            modelURL: BOWLING_ALLEY_PREFIX_URL + 'bowlingpin.fbx',
            name: 'Bowling Pin',
            shapeType: 'compound',
            type: 'Model',
            userData: JSON.stringify({
                isBowlingPin: true,
                bowlingAlley: bowlingAlley,
                grabbableKey: {
                    grabbable: false
                }
            }),
            script: 'http://mpassets.highfidelity.com/f01af088-7410-40e2-a331-310e9a0d068e-v1/bowlingPinEntity.js',
            lifetime: MAX_EQUIPMENT_LIFETIME
        };
        for (var key in extraProperties) {
            if (extraProperties.hasOwnProperty(key)) {
                entityProperties[key] = extraProperties[key];
            }
        }
        return createEntity(entityProperties, transform);
    };

    var createBall = function (transform, extraProperties, bowlingAlley) {
        var entityProperties = {
            angularDamping: 0.3,
            collisionsWillMove: 1,
            damping: 0.01,
            density: 5000,
            dimensions: {
                x: 0.245,
                y: 0.245,
                z: 0.245
            },
            angularVelocity: {
                w: -0.12123292684555054,
                x: 0.97888147830963135,
                y: -0.075059115886688232,
                z: -0.14644080400466919
            },
            velocity: Vec3.multiplyQbyV(transform.rotation, {
                x: 0,
                y: 0,
                z: 1,
            }),
            collidesWith: 'static,dynamic,kinematic',
            dynamic: true,
            friction: 0.1,
            gravity: {
                x: 0,
                y: -9.8,
                z: 0
            },
            modelURL: BOWLING_ALLEY_PREFIX_URL + 'ball_salmon.fbx',
            restitution: 0.2,
            rotation: {
                w: -0.12123292684555054,
                x: 0.97888147830963135,
                y: -0.075059115886688232,
                z: -0.14644080400466919
            },
            shapeType: 'sphere',
            type: 'Model',
            userData: JSON.stringify({
                isBowlingBall: true,
                bowlingAlley: bowlingAlley,
                grabbableKey: {
                    grabbable: true
                }
            }),
            script: 'http://mpassets.highfidelity.com/f01af088-7410-40e2-a331-310e9a0d068e-v1/bowlingBallEntity.js',
            lifetime: MAX_EQUIPMENT_LIFETIME
        };
        for (var key in extraProperties) {
            if (extraProperties.hasOwnProperty(key)) {
                entityProperties[key] = extraProperties[key];
            }
        }

        Audio.playSound(returnSound, {
            position: transform.position,
            volume: 0.5
        });

        return createEntity(entityProperties, transform);
    };

    function ResetButton() {
        _this = this;
    }

    var messageHandler = function(channel, message, senderID){
        if (channel === "BowlingGameChannel") {
            message = JSON.parse(message);
            var type = message['type'];
            switch(type) {
                case 'reset-hit' :
                    _this.doTheRez();
                    break;
                case 'get-pin-location' : 
                    pinJointPosition = message['location'];
                    break;
                case 'get-ball-location' :
                    ballJointPosition = message['location'];
                    break;
                case 'get-pin-rotation' :
                    pinJointRotation = message['rotation'];
                    break;
                default :
                    print("Unknown message");
                    break;
            }
        }
    }

    ResetButton.prototype = {
        entityID: null,
        resetConsoleID: null,
        bowlingAlleyID: null,
        preload: function(entityID) {
            _this.entityID = entityID;
            _this.resetConsoleID  = Entities.getEntityProperties(_this.entityID, ['parentID']).parentID;
            _this.bowlingAlleyID = Entities.getEntityProperties(_this.resetConsoleID, ['parentID']).parentID; // get the bowling alley's parent ID     
            ringSound = SoundCache.getSound(BELL_SOUND_URL);
            returnSound = SoundCache.getSound(RETURN_SOUND_URL);
            Messages.subscribe("BowlingGameChannel");
            Messages.messageReceived.connect(messageHandler);
        }, 
        unload: function() {
            Messages.messageReceived.disconnect(messageHandler);
        },
        clearPins: function() {
            Entities.findEntities(Entities.getEntityProperties(_this.entityID, ['position']), 1000).forEach(function(entity) {
                try {
                    var userData = JSON.parse(Entities.getEntityProperties(entity, ['userData']).userData);
                    if (userData.isBowlingPin && userData.bowlingAlley === _this.bowlingAlleyID) {
                        print("Found pin, deleting it: " + entity);
                        Entities.deleteEntity(entity);
                    }
                } catch(e) {}
            }); 
        },
        createRandomBallInRetractor: function() {
            Entities.callEntityMethod(_this.entityID, 'getBallJointLocation');
            var entProperties = Entities.getEntityProperties(_this.bowlingAlleyID, ['position', 'rotation']);  
            createBall({
                position: ballJointPosition,
                rotation: entProperties.rotation
            }, BOWLING_BALLS[Math.floor(BOWLING_BALLS.length * Math.random())],  _this.bowlingAlleyID);
        },
        clearBalls: function() {
            Entities.findEntities(Entities.getEntityProperties(_this.entityID, ['position']), 1000).forEach(function(entity) {
                try {
                    var userData = JSON.parse(Entities.getEntityProperties(entity, ['userData']).userData);
                    if (userData.isBowlingBall && userData.bowlingAlley === _this.bowlingAlleyID) {
                        print("Found ball, deleting it: " + entity);
                        Entities.deleteEntity(entity);
                    }
                } catch(e) {}
            }); 
        },
        doTheRez: function() {
            if (!canReset) {
                return;
            }
            canReset = false;
            debugPrint("START BOWLING RESET TRIGGER");
            Messages.sendMessage("BowlingGameChannel", JSON.stringify({
                type: "resend-pin"
            }));
            Messages.sendMessage("BowlingGameChannel", JSON.stringify({
                type: "resend-ball"
            }));
            Messages.sendMessage("BowlingGameChannel", JSON.stringify({
                type: "send-rotation"
            }));
            // Reset pins
            var entProperties = Entities.getEntityProperties(_this.bowlingAlleyID);
            _this.clearPins();

            //print("ADDING NEW PINS");

            var pinHeightOffset = {y: PIN_DIMENSIONS.y / 2};
            getPinPositions(TRIANGLE_WIDTH, TRIANGLE_NUMBER_OF_PINS).forEach(function(pinPosition) {
                createPin({
                    position: Vec3.sum(pinJointPosition, pinHeightOffset),
                    rotation: pinJointRotation
                }, {
                    position: pinPosition
                }, _this.bowlingAlleyID);
            });

            //print("PINS ADDED");
            
            // Add new ball
            _this.createRandomBallInRetractor();

            Script.setTimeout(function() {
                _this.createRandomBallInRetractor();
            }, SECOND_BALL_WAIT_MILLISECONDS);

            //Clipboard.importEntities(IMPORT_URL_BALL);
            //Clipboard.pasteEntities(jointLocInWorld);
            //print("BALL ADDED");        
            
            // Completion sound
            Audio.playSound(ringSound, {
                position: Entities.getEntityProperties(_this.entityID, ['position']).position,
                volume: 0.5
            });

            // Set limit on triggering reset
            Script.setTimeout(function() {
                canReset = true;
            }, TIMEOUT);
        }
    }
    return new ResetButton();
});