//
// bingoMachineZoneServer.js
// Created by Rebecca Stankus on 11/06/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

/* global Audio, Entities, JSON, Math, Quat, Script, SoundCache */

(function() {
    var BINGO_WHEEL = "{57e5e385-3968-4ebf-8048-a7650423d83b}";
    var ENTER_ZONE_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoEnter.wav"));
    var COMPUTING_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoComputing.wav"));
    var MACHINE_WIN_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoMachineWin.wav"));
    var MACHINE_LOSE_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoLose.wav"));
    var SAD_TROMBONE_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoSadTrombone.wav"));
    var WHITE = {red:255,green:255,blue:255};
    var WHITE_STRING = JSON.stringify(WHITE);
    var BLACK = { blue: 0, green: 0, red: 0 };
    var CARD_YELLOW = { blue: 66, green: 255, red: 227 };
    var CARD_BLUE = { blue: 247, green: 196, red: 0 };
    var CARD_GREEN = { blue: 0, green: 255, red: 30 };
    var CARD_PINK = { blue: 119, green: 0, red: 255 };
    var WAIT_TO_DELETE_CARD = 10000;
    var ROW_INDEX = 13;
    var COLUMN_INDEX = 15;
    var WAIT_TO_PROCESS_VALIDATION = 1000;
    var OVERLAP_SOUNDS_TIME = 1000;
    var BINGO_STRING = "BINGO";
    var IMAGE_MODEL = "https://hifi-content.s3.amazonaws.com/DomainContent/production/default-image-model.fbx";
    var HEADER_IMAGE = Script.resolvePath("assets/images/bingo-card-head.png");
    var WAIT_FOR_ENTITIES_TO_LOAD = 2000;
    var SPREADSHEET_URL = Script.require(Script.resolvePath('bingoSheetURL.json')).sheetURL;

    var _this;
    
    var position;
    var interval = null;
    var userName;
    var userCardNumbers = [];
    var bingoMachine;
    var machineSpotlight;
    var cardEntity = null;
    var bingoNumberSquares = [];
    var confettiParticleEffect;
    var bingoParticleEffect;
    var calledNumbers;
    var request = Script.resolvePath('modules/request').request;
    // var white;

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************

    /* ENCODE URL PARAMETERS: Formats data to send to Google sheet*/
    function encodeURLParams(params) {
        var paramPairs = [];
        for (var key in params) {
            paramPairs.push(key + "=" + params[key]);
        }
        return paramPairs.join("&");
    }

    /* PLAY A SOUND: Plays the specified sound at the position of the user's Avatar using the volume and playback 
    mode requested. */
    var injector;
    var audioVolume = 0.05;
    function playSound(sound) {
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
            }
            injector = Audio.playSound(sound, {
                position: position,
                volume: audioVolume
            });
        }
    }

    /* DEBUG PRINT: Enable or disable extra debugging messages */
    var DEBUG = 1;
    function debugPrint(msg) {
        if (DEBUG) {
            print(msg);
        }
    }

    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    var BingoMachineZone = function() {
        _this = this;
    };

    BingoMachineZone.prototype = {

        remotelyCallable: ['scanCard', 'userLeftZone'],

        /* ON LOADING THE SCRIPT: Save a reference to this entity ID. Set a timeout for 2 seconds to ensure that entities 
        have loaded and then find and save references to other necessary entities. */
        preload: function(entityID) {
            _this.entityID = entityID;
            Script.setTimeout(function() {
                var properties = Entities.getEntityProperties(_this.entityID, ['parentID', 'position']);
                position = properties.position;
                var zoneMarker = properties.parentID;
                bingoMachine = Entities.getEntityProperties(zoneMarker, 'parentID').parentID;
                Entities.getChildrenIDs(zoneMarker).forEach(function(childOfZoneMarker) {
                    var name = Entities.getEntityProperties(childOfZoneMarker, 'name').name;
                    if (name === "Bingo Machine Spotlight") {
                        machineSpotlight = childOfZoneMarker;
                    }
                });
                Entities.getChildrenIDs(bingoMachine).forEach(function(entityNearMachine) {
                    var name = Entities.getEntityProperties(entityNearMachine, 'name').name;
                    if (name === "Bingo Particle Bingo") {
                        bingoParticleEffect = entityNearMachine;
                    } else if (name === "Bingo Particle Confetti") {
                        confettiParticleEffect = entityNearMachine;
                    }
                });
            }, WAIT_FOR_ENTITIES_TO_LOAD);
            
        },

        /* GET USER'S CARD NUMBERS: Get the Google sheet URL from a private text file, then search the sheet for the user. 
        If the user is found, save their card numbers. */
        getCardNumbers: function() {
            var searchParamString = encodeURLParams({
                type: "search",
                username: userName
            });
            print("REQUEST_IS: ", request);
            request({
                uri: SPREADSHEET_URL + "?" + searchParamString
            }, function (error, response) {
                if (error || !response) {
                    debugPrint("bingoMachineZoneServer.js: ERROR when searching for Bingo user entry!" + error || response);
                    return;
                }
                if (response === "New username") {
                    print("Error...user not found in bingo players list");
                } else if (response) {
                    var userNumbersToSplit = response.substring(2, response.length - 2);
                    userCardNumbers = userNumbersToSplit.split(",");
                }
            });
        },

        /* GET A RANDOM COLOR FOR CARD:  Select one of 4 preset colors to use for the card base */
        getRandomCardColor: function() {
            var colorChange = Math.floor(Math.random() * 4);
            var newColor;
            switch (colorChange) {
                case 0:
                    newColor = CARD_YELLOW;
                    break;
                case 1:
                    newColor = CARD_BLUE;
                    break;
                case 2:
                    newColor = CARD_GREEN;
                    break;
                case 3:
                    newColor = CARD_PINK;
                    break;
                default:
                    newColor = CARD_PINK;
            }
            return newColor;
        },

        /* CREATE A REPLICA OF USER'S CARD: Create a base entity for the card and then iterate over each column 
        (one for each letter in the word 'BINGO')  */
        createCardReplica: function() {
            var cardEntityColor = _this.getRandomCardColor();
            cardEntity = Entities.addEntity({
                isSolid: true,
                color: cardEntityColor,
                parentID: bingoMachine,
                localPosition: { x: 0, y: 1.025, z: 0.25 },
                localRotation: Quat.fromVec3Degrees({ x: 0, y: 90, z: 0 }),
                name: "Bingo Machine Card",
                dimensions: {
                    x: 0.02,
                    y: 1,
                    z: 0.7
                },
                shape: "Cube",
                type: "Box",
                userData: "{ \"grabbableKey\": { \"grabbable\": false } }",
                serverScripts: Script.resolvePath("empty.js")
            });

            Entities.addEntity({
                parentID: cardEntity,
                localPosition: {
                    x: 0.01,
                    y: 0.375,
                    z: 0
                },
                localRotation: Quat.fromVec3Degrees({ x: 0, y: 90, z: 0 }),
                name: "Bingo Machine Card",
                dimensions: {
                    x: 0.65,
                    y: 0.2,
                    z: 0.001
                },
                type: "Model",
                shapeType: "box",
                collisionless: true,
                modelURL: IMAGE_MODEL,
                textures: JSON.stringify({ "tex.picture": HEADER_IMAGE }),
                userData: "{ \"grabbableKey\": { \"grabbable\": false } }"
            });

            var localPosition = {
                x: 0.018,
                y: 0.2,
                z: 0.263
            };
            var positionOffsetZ = 0.13;
            var positionOffsetY = 0.15;
            var squareDimensions = {
                x: 0.11,
                y: 0.1275,
                z: 0.001
            };
            var numberIterator = 0;
            var backgroundColor = WHITE;
            var textColor = BLACK;
            for (var i = 0; i < BINGO_STRING.length; i++) {
                var rows = 5;
                for (var currentRow = 0; currentRow < rows; currentRow++) {
                    var number;
                    var lineHeight = 0.09;
                    if (currentRow === 2 && i === 2) {
                        number = "FREE";
                        lineHeight = 0.0450;
                        backgroundColor = BLACK;
                        textColor = WHITE;
                    } else {
                        number = userCardNumbers[numberIterator];
                        numberIterator++;
                        var bingoCall = BINGO_STRING[i] + " " + number;
                        if (calledNumbers.indexOf(bingoCall) !== -1) {
                            backgroundColor = BLACK;
                            textColor = WHITE;
                        }
                    }
                    bingoNumberSquares.push(Entities.addEntity({
                        backgroundColor: backgroundColor,
                        dimensions: squareDimensions,
                        lineHeight: lineHeight,
                        parentID: cardEntity,
                        name: "Bingo Square " + (currentRow + 1) + " " + (i + 1),
                        localPosition: localPosition,
                        localRotation: Quat.fromVec3Degrees({ x: 0, y: 90, z: 0 }),
                        text: number,
                        textColor: textColor,
                        type: "Text",
                        userData: "{ \"grabbableKey\": { \"grabbable\": false } }"
                    }));
                    localPosition.y -= positionOffsetY;
                    backgroundColor = WHITE;
                    textColor = BLACK;
                }
                localPosition.z -= positionOffsetZ;
                localPosition.y += rows * positionOffsetY;
            }
        },

        /* VALIDATE A WIN:  */
        validateWin: function() {
            var rows = [1,1,1,1,1];
            var columns = [1,1,1,1,1];
            var diagonalLtoR = 1;
            var diagonalRtoL = 1;
            var fail;
            if (bingoNumberSquares.length === 25) {
                bingoNumberSquares.forEach(function(square) {
                    var properties = Entities.getEntityProperties(square, ['name', 'backgroundColor']);
                    if (!properties.name) {
                        fail = true;
                        return;
                    }
                    if (properties.name) {
                        var row = properties.name.charAt(ROW_INDEX);
                        var column = properties.name.charAt(COLUMN_INDEX);
                        if (JSON.stringify(properties.backgroundColor) === WHITE_STRING) {
                            rows[row - 1] = 0;
                            columns[column - 1] = 0;
                            if (diagonalLtoR && row === column) {
                                diagonalLtoR = 0;
                            }
                            if (diagonalRtoL) {
                                var rowAndColumn = row + " " + column;
                                if (rowAndColumn === "1 5" || rowAndColumn === "2 4" || rowAndColumn === "4 2" || 
                            rowAndColumn === "5 1") {
                                    diagonalRtoL = 0;
                                }
                            }
                        }
                    }
                });
                Script.setTimeout(function(){
                    if (fail) {
                        return;
                    }
                    var winningRow = null;
                    var winningColumn = null;
                    for (var row = 1; row < 6; row++) {
                        if (rows[row -1] === 1) {
                            winningRow = row;
                        }
                    }
                    for (var column = 1; column < 6; column++) {
                        if (columns[column - 1] === 1) {
                            winningColumn = column;
                        }
                    }
                    if (winningRow) {
                        bingoNumberSquares.forEach(function(square) {
                            var name = Entities.getEntityProperties(square, 'name').name;
                            var row = name.charAt(ROW_INDEX);
                            if (row != winningRow) {
                                Entities.editEntity(square, { 
                                    backgroundColor: WHITE,
                                    textColor: BLACK
                                });
                            }
                        });
                        _this.win();
                    } else if (winningColumn) {
                        bingoNumberSquares.forEach(function(square) {
                            var name = Entities.getEntityProperties(square, 'name').name;
                            if (name) {
                                var column = name.charAt(COLUMN_INDEX);
                                if (column != winningColumn) {
                                    Entities.editEntity(square, { 
                                        backgroundColor: WHITE,
                                        textColor: BLACK
                                    });
                                }
                            }
                        });
                        _this.win();
                    } else if (diagonalLtoR) {
                        bingoNumberSquares.forEach(function(square) {
                            var name = Entities.getEntityProperties(square, 'name').name;
                            var row = name.charAt(ROW_INDEX);
                            var column = name.charAt(COLUMN_INDEX);
                            if (column != row) {
                                Entities.editEntity(square, { 
                                    backgroundColor: WHITE,
                                    textColor: BLACK
                                });
                            }
                        });
                        _this.win();
                    } else if (diagonalRtoL) {
                        bingoNumberSquares.forEach(function(square) {
                            var name = Entities.getEntityProperties(square, 'name').name;
                            var rowAndColumn = name.charAt(ROW_INDEX) + " " + name.charAt(COLUMN_INDEX);
                            if (!(rowAndColumn === "1 5" || rowAndColumn === "2 4" || rowAndColumn === "3 3" || 
                        rowAndColumn === "4 2" || rowAndColumn === "5 1")) {
                                Entities.editEntity(square, { 
                                    backgroundColor: WHITE,
                                    textColor: BLACK
                                });
                            }
                        });
                        _this.win();
                    } else {
                        _this.lose();
                    }
                }, WAIT_TO_PROCESS_VALIDATION);
            }
        },

        /* WIN:  */
        win: function() {
            playSound(MACHINE_WIN_SOUND);
            Entities.callEntityMethod(bingoParticleEffect, 'turnOn');
            Entities.callEntityMethod(confettiParticleEffect, 'turnOn');
        },

        /* LOSE:  */
        lose: function() {
            playSound(MACHINE_LOSE_SOUND);
            Script.setTimeout(function() {
                playSound(SAD_TROMBONE_SOUND);
            }, MACHINE_LOSE_SOUND.duration * 1000);
        },

        /* DELETE CARD ABOVE MACHINE:  */
        deleteCard: function() {
            Entities.deleteEntity(cardEntity);
            Entities.getChildrenIDs(bingoMachine).forEach(function(entityNearMachine) {
                var name = Entities.getEntityProperties(entityNearMachine, 'name').name;
                if (name === "Bingo Machine Card") {
                    Entities.deleteEntity(entityNearMachine);
                }
            });
        },

        /* SCAN USER'S CARD:  */
        scanCard: function(thisID, params) {
            userName = params[0];
            userCardNumbers = [];
            Entities.callEntityMethod(BINGO_WHEEL, 'getCalledNumbers', [-1, _this.entityID]);
            _this.getCardNumbers();
            _this.deleteCard();
            Entities.editEntity(machineSpotlight, { visible: true });
            playSound(ENTER_ZONE_SOUND);
            Script.setTimeout(function() {
                if (userCardNumbers.length !== 0) {
                    playSound(COMPUTING_SOUND);
                    _this.createCardReplica();
                    Script.setTimeout(function() {
                        _this.validateWin();
                    }, ENTER_ZONE_SOUND.duration * 1000 - OVERLAP_SOUNDS_TIME);
                } else {
                    cardEntity = Entities.addEntity({
                        backgroundColor: WHITE,
                        dimensions: {
                            x: 1.5,
                            y: 0.3409,
                            z: 0.7
                        },
                        parentID: bingoMachine,
                        localPosition: { x: 0, y: 1.025, z: 0.25 },
                        localRotation: Quat.fromVec3Degrees({ x: 0, y: 180, z: 0 }),
                        lineHeight: 0.24,
                        name: "Bingo Card",
                        text: "No Card Found",
                        textColor: BLACK,
                        type: "Text",
                        userData: "{ \"grabbableKey\": { \"grabbable\": false } }"
                    });
                }
            }, ENTER_ZONE_SOUND.duration * 1000);
        },

        /* WHEN USER LEAVES ZONE:  */
        userLeftZone: function(thisID, userID) {
            Script.setTimeout(function() {
                Entities.editEntity(machineSpotlight, { visible: false });
                bingoNumberSquares = [];
                _this.deleteCard();
                Entities.callEntityMethod(bingoParticleEffect, 'turnOff');
                Entities.callEntityMethod(confettiParticleEffect, 'turnOff');
            }, WAIT_TO_DELETE_CARD);
        },

        /* ON UNLOADING SCRIPT:  */
        unload: function(entityID) {
            _this.deleteCard();
            bingoNumberSquares = [];
            Entities.editEntity(machineSpotlight, { visible: false });
            Entities.editEntity(bingoParticleEffect, { emitRate: 0 });
            Entities.editEntity(confettiParticleEffect, { emitRate: 0 });
            if (interval) {
                Script.clearInterval(interval);
            }
        }
    };
    
    return new BingoMachineZone();
});
