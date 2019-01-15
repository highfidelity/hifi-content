//
// bingoScannerZoneServer.js
// Created by Rebecca Stankus on 11/06/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

/* global Audio, Entities, JSON, Math, Quat, Script, SoundCache */

(function() {
    var BINGO_WHEEL = "{57e5e385-3968-4ebf-8048-a7650423d83b}";
    var STAGE_ENTRY_GATE = "{d486f614-fd14-42c4-aefe-9b3b734cd60e}";
    var ENTER_ZONE_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoEnter.wav?0"));
    var COMPUTING_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoComputing.wav?0"));
    var SCANNER_WIN_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoScannerWin.wav"));
    var SCANNER_LOSE_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoLose.wav?0"));
    var SAD_TROMBONE_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoSadTrombone.wav?0"));
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
    var WAIT_TO_PROCESS_VALIDATION_MS = 1000;
    var OVERLAP_SOUNDS_TIME = 1000;
    var BINGO_STRING = "BINGO";
    var IMAGE_MODEL = Script.resolvePath("assets/images/default-image-model.fbx");
    var HEADER_IMAGE = Script.resolvePath("../../images/bingo-card-head.png");
    var WAIT_FOR_ENTITIES_TO_LOAD_MS = 2000;
    var SPREADSHEET_URL = Script.require(Script.resolvePath('../../secrets/bingoSheetURL.json?0')).sheetURL;

    var _this;
    
    var position;
    var interval = null;
    var userName;
    var userCardNumbers = [];
    var scannerSpotlight;
    var cardEntity = null;
    var bingoNumberSquares = [];
    var confettiParticleEffect;
    var bingoParticleEffect;
    var calledNumbers;
    var request = Script.require(Script.resolvePath('../../modules/request.js')).request;

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
        print("PLAYING SOUND ", JSON.stringify(sound));
        if (sound.downloaded) {
            print("SOUND IS DOWNLOADED");
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

    var BingoScannerZone = function() {
        _this = this;
    };

    BingoScannerZone.prototype = {

        remotelyCallable: ['receiveNumbersFromWheel', 'scanCard', 'userLeftZone'],

        /* ON LOADING THE SCRIPT: Save a reference to this entity ID. Set a timeout for 2 seconds to ensure that entities 
        have loaded and then find and save references to other necessary entities. */
        preload: function(entityID) {
            _this.entityID = entityID;
            Script.setTimeout(function() {
                var properties = Entities.getEntityProperties(_this.entityID, ['parentID', 'position']);
                position = properties.position;
                var zoneMarker = properties.parentID;
                Entities.getChildrenIDs(zoneMarker).forEach(function(childOfZoneMarker) {
                    var name = Entities.getEntityProperties(childOfZoneMarker, 'name').name;
                    if (name === "Bingo Scanner Spotlight") {
                        scannerSpotlight = childOfZoneMarker;
                    } else if (name === "Bingo Particle Bingo") {
                        bingoParticleEffect = childOfZoneMarker;
                    } else if (name === "Bingo Particle Confetti") {
                        confettiParticleEffect = childOfZoneMarker;
                    }
                });
            }, WAIT_FOR_ENTITIES_TO_LOAD_MS);
            
        },

        /* RECEIVE NUMBERS THAT HAVE BEEN CALLED THIS ROUND:  */
        receiveNumbersFromWheel: function(id, numbers) {
            print("RECEIVED THE NUMBERS");
            calledNumbers = JSON.parse(numbers[0]);
        },

        /* GET USER'S CARD NUMBERS: Get the Google sheet URL from a private text file, then search the sheet for the user. 
        If the user is found, save their card numbers. */
        getCardNumbers: function() {
            var searchParamString = encodeURLParams({
                type: "search",
                username: userName
            });
            request({
                uri: SPREADSHEET_URL + "?" + searchParamString
            }, function (error, response) {
                if (error || !response) {
                    debugPrint("bingoScannerZoneServer.js: ERROR when searching for Bingo user entry!" + error || response);
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
        (one for each letter in the word 'BINGO') and each row, creating an entity parented to the base card for 
        each number tile and filling in the numbers assigned to the user. Numbers are also checked against the 
        called numbers and if found, the background of the square will be black whereas uncalled numbers will 
        have a white background. */
        createCardReplica: function() {
            var cardEntityColor = _this.getRandomCardColor();
            cardEntity = Entities.addEntity({
                isSolid: true,
                color: cardEntityColor,
                parentID: _this.entityID,
                localPosition: { x: 0, y: 1.2, z: 0.25 },
                localRotation: Quat.fromVec3Degrees({ x: 0, y: 90, z: 0 }),
                name: "Bingo Scanner Card",
                dimensions: {
                    x: 0.02,
                    y: 1,
                    z: 0.7
                },
                shape: "Cube",
                type: "Box",
                userData: "{ \"grabbableKey\": { \"grabbable\": false } }",
                serverScripts: Script.resolvePath("../empty.js")
            });

            Entities.addEntity({
                parentID: cardEntity,
                localPosition: {
                    x: 0.01,
                    y: 0.375,
                    z: 0
                },
                localRotation: Quat.fromVec3Degrees({ x: 0, y: 90, z: 0 }),
                name: "Bingo Machine Card Image",
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

        /* VALIDATE A WIN: At this point, number squares have a background color that represents whether or not the 
        number was called during the bingo round. All possible winning lines are saved in 2 arrays of boolean digits 
        representing columns and rows and 2 variables representing the diagonals. All possible wins are set to 1 until 
        proven false and changed to 0. Each number square onthe user's card is checked and upon finding an uncalled 
        number, its row and column will both be marked as 0. The diagonal from left top corner to lower right corner 
        can be marked false if an uncalled number is found with a row equal to its column but the opposite diagonal 
        will need to have each square specifically checked. After beginning these checks, we set a timeout for 1 second 
        to allow the calculations to complete and then go over each possible win variable to see if any are still 
        marked true and record which one. If a winning line was found, all other squares on the card will be changed 
        to a white background to highlight the win and the proper win or lose function will be called. */
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
                }, WAIT_TO_PROCESS_VALIDATION_MS);
            }
        },

        /* WIN: Play the winning sound and turn on confettin and bingo particles. */
        win: function() {
            playSound(SCANNER_WIN_SOUND);
            Entities.callEntityMethod(bingoParticleEffect, 'turnOn');
            Entities.callEntityMethod(confettiParticleEffect, 'turnOn');
            // add to bouncer zone
            Entities.callEntityMethod(STAGE_ENTRY_GATE, 'openGate');
        },

        /* LOSE: Play the losing buzzer and set a timeout for after the buzzer sound has finished to play the sad sound */
        lose: function() {
            playSound(SCANNER_LOSE_SOUND);
            Script.setTimeout(function() {
                playSound(SAD_TROMBONE_SOUND);
            }, SCANNER_LOSE_SOUND.duration * 1000);
        },

        /* DELETE CARD ABOVE MACHINE: Delete the bingo card created by this script and any others found that 
        may have lost their referenece due to crash or errors. */
        deleteCard: function() {
            Entities.deleteEntity(cardEntity);
            Entities.getChildrenIDs(_this.entityID).forEach(function(entityNearMachine) {
                var name = Entities.getEntityProperties(entityNearMachine, 'name').name;
                if (name === "Bingo Scanner Card" || name === "No Card Found") {
                    Entities.deleteEntity(entityNearMachine);
                }
            });
        },

        /* SCAN USER'S CARD: Get the called numbers for this bingo round from the wheel's server script then get the 
        user's assigned card numbers and delete any cards already around the scanner. Turn the spotlight on and play 
        an enter sound then set a timeout for the duration of that sound. When the sound has finished, if the user's 
        numbers were found, play the computing sound, create a replica of their card, and set a timeout for part of 
        the duration of that sound after which we beging to validate their card winning. If the user's numbers were 
        not found, create a sign above the machine stating that. */
        scanCard: function(thisID, params) {
            playSound(ENTER_ZONE_SOUND);
            Entities.editEntity(scannerSpotlight, { visible: true });
            print("SCANCARD");
            userName = params[0];
            userCardNumbers = [];
            Entities.callEntityMethod(BINGO_WHEEL, 'getCalledNumbers', [-1, _this.entityID]);
            _this.getCardNumbers();
            _this.deleteCard();
            
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
                        parentID: _this.entityID,
                        localPosition: { x: 0, y: 1.2, z: 0.25 },
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

        /* WHEN USER LEAVES ZONE: Wait for 10 seconds to turn off the light to ensure card validation has finished. 
        This prevents others from entering before this user's script has had time to finish and clean up. Clear the 
        arrqy of squares attached to the user's card and delete the card. Turn off particles. */
        userLeftZone: function(thisID, userID) {
            Entities.callEntityMethod(STAGE_ENTRY_GATE, 'closeGate');
            Script.setTimeout(function() {
                Entities.editEntity(scannerSpotlight, { visible: false });
                bingoNumberSquares = [];
                _this.deleteCard();
                Entities.callEntityMethod(bingoParticleEffect, 'turnOff');
                Entities.callEntityMethod(confettiParticleEffect, 'turnOff');
            }, WAIT_TO_DELETE_CARD);
        },

        /* ON UNLOADING SCRIPT: Delete the card, clear the array of squares from the card, turn off particles and 
        spotlight and clear any interval if necessary. */
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
    
    return new BingoScannerZone();
});
