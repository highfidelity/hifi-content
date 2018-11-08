//
// bingoMachineZoneServer.js
// Created by Rebecca Stankus on 11/06/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function() {
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

    var _this;
    var audioVolume = 0.05;
    var injector;
    var position;
    var interval = null;
    var userName;
    var userCardNumbers = [];
    var spreadsheetURL;
    var bingoMachine;
    var machineSpotlight;
    var cardEntity = null;
    var bingoNumberSquares = [];
    var confettiParticleEffect;
    var bingoParticleEffect;
    var wheel;
    var calledNumbers;
    // var white;

    var BingoMachineZone = function() {
        _this = this;
    };

    BingoMachineZone.prototype = {
        remotelyCallable: ['createCard', 'scanCard', 'userLeftZone'],
        preload: function(entityID) {
            _this.entityID = entityID;
            var properties = Entities.getEntityProperties(_this.entityID, ['userData', 'parentID', 'position']);
            position = properties.position;
            // print("BINGO USERDATA IS ", userData);
            try {
                // set properties from the userData
                var userdataProperties = JSON.parse(properties.userData);
                spreadsheetURL = userdataProperties.bingoURL;
            } catch (e) {
                print("Could not get URL for bingo users spreadsheet");
            }
            var zoneMarker = properties.parentID;
            bingoMachine = Entities.getEntityProperties(zoneMarker, 'parentID').parentID;
            Entities.getChildrenIDs(zoneMarker).forEach(function(childOfZoneMarker) {
                var name = Entities.getEntityProperties(childOfZoneMarker, 'name').name;
                if (name === "Bingo Machine Spotlight") {
                    // print("found the spot light");
                    machineSpotlight = childOfZoneMarker;
                }
            });
            Entities.getChildrenIDs(bingoMachine).forEach(function(entityNearMachine) {
                var name = Entities.getEntityProperties(entityNearMachine, 'name').name;
                if (name === "Bingo Particle Bingo") {
                    bingoParticleEffect = entityNearMachine;
                } else if (name === "Bingo Particle Confetti") {
                    print("FOUND CONFETTI PARTICLE");
                    confettiParticleEffect = entityNearMachine;
                }
            });
        },

        encodeURLParams: function (params) {
            var paramPairs = [];
            for (var key in params) {
                paramPairs.push(key + "=" + params[key]);
            }
            return paramPairs.join("&");
        },

        getCardNumbers: function() {
            var searchParamString = _this.encodeURLParams({
                type: "search",
                username: userName
            });
            // print(spreadsheetURL + "?" + paramString);
            var searchRequest = new XMLHttpRequest();
            searchRequest.open('GET', spreadsheetURL + "?" + searchParamString);
            searchRequest.timeout = 10000;
            searchRequest.ontimeout = function() {
                print("bingo: request timed out");
            };
            searchRequest.onreadystatechange = function() { // called after load when readyState = 4
            // print("STATE CHANGED");
                if (searchRequest.readyState === 4) {
                // print("request ready state is 4. response is ", searchRequest.response);
                    if (searchRequest.response === "New username") {
                        print("Error...user not found in bingo players list");
                    } else if (searchRequest.response) {
                        var userNumbersToSplit = searchRequest.response.substring(2, searchRequest.response.length - 2);
                        userCardNumbers = userNumbersToSplit.split(",");
                        // print("userCardNumbers is ", userCardNumbers);
                        // print("userCardNumbers[0] is ", userCardNumbers[24]);
                    // print("user is in database");
                    }
                }
            };
            searchRequest.send();
            // check that they are the same as the ones on their card
            // if not, print error
        },

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

        getNumbersFromServer: function(id, numbers) {
            print("THANK YOU WHEEL...I'VE GOT THOSE NUMBERS FOR THE MACHINE TO VALIDATE!!! ", numbers[0]);
            calledNumbers = JSON.parse(numbers[0]);
        },

        createCard: function() {
            // print("creating card above machine");
            print("user card numbers are  ", JSON.stringify(userCardNumbers));
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
            // bingoWallLights.forEach(function(light) {
            //     print(Entities.getEntityProperties(light, 'name').name);
            // });
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
                        // print("checking light ", number, " and it is visible? ", 
                        // Entities.getEntityProperties(bingoWallLights[number], 'visible').visible);
                        var bingoCall = BINGO_STRING[i] + " " + number;
                        // print("searching for call: ", bingoCall);
                        if (calledNumbers.indexOf(bingoCall) !== -1) {
                            // print(bingoCall, " is highlighted");
                            backgroundColor = BLACK;
                            textColor = WHITE;
                        }
                    }
                    // print("creating square for ", userCardNumbers[numberIterator]);
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

        validateWin: function() {
            print("OK...CHECKING CARD");
            var rows = [1,1,1,1,1];
            var columns = [1,1,1,1,1];
            var diagonalLtoR = 1;
            var diagonalRtoL = 1;
            var fail;
            // print(bingoNumberSquares.length, " BINGO NUMBER SQUARES: ", JSON.stringify(bingoNumberSquares));
            if (bingoNumberSquares.length === 25) {
                bingoNumberSquares.forEach(function(square) {
                    var properties = Entities.getEntityProperties(square, ['name', 'backgroundColor']);
                    if (!properties.name) {
                        // print("properties.name is ", properties.name, " and bingoNumberSquares is ", bingoNumberSquares);
                        // print("ERROR GETTING PROPERTIES OF CARD SQUARE...RETURNING");
                        // fail sound
                        fail = true;
                        return;
                    }
                    // print("validating ", properties.name);
                    if (properties.name) {
                        var row = properties.name.charAt(ROW_INDEX);
                        // print("row: ", row);
                        var column = properties.name.charAt(COLUMN_INDEX);
                        // print("checking square ", row, " ", column, "with number ", 
                        // Entities.getEntityProperties(square, 'text').text, " and background color ", 
                        // JSON.stringify(properties.backgroundColor)); 
                        if (JSON.stringify(properties.backgroundColor) === WHITE_STRING) {
                            // print("and it has not been called");
                            rows[row - 1] = 0;
                            columns[column - 1] = 0;
                            if (diagonalLtoR && row === column) {
                                diagonalLtoR = 0;
                                // print("diag LtoR is false");
                            }
                            if (diagonalRtoL) {
                                var rowAndColumn = row + " " + column;
                                if (rowAndColumn === "1 5" || rowAndColumn === "2 4" || rowAndColumn === "4 2" || 
                            rowAndColumn === "5 1") {
                                    diagonalRtoL = 0;
                                    // print("diag RtoL is false");
                                }
                            }
                        }
                    }
                });
                Script.setTimeout(function(){
                    if (fail) {
                        return;
                    }
                    print("MAKING THE DECISION");
                    var winningRow = null;
                    var winningColumn = null;
                    for (var row = 1; row < 6; row++) {
                        if (rows[row -1] === 1) {
                            winningRow = row;
                            print("winning row is ", winningRow);
                        }
                    }
                    for (var column = 1; column < 6; column++) {
                        if (columns[column - 1] === 1) {
                            winningColumn = column;
                        // print("winning column is ", winningColumn);
                        }
                    }
                    // print("winning row is: ", winningRow, " and winning column is: ", winningColumn, " and diag LtoR is: ", 
                    // diagonalLtoR, " and diag RtoL is: ", diagonalRtoL);
                    if (winningRow) {
                        print("we have a winning row ", winningRow);
                        bingoNumberSquares.forEach(function(square) {
                            var name = Entities.getEntityProperties(square, 'name').name;
                            var row = name.charAt(ROW_INDEX);
                            // print("checking ", name, " where row is ", row);
                            if (row != winningRow) {
                            // print("unhighlighting square that is not in winning row");
                                Entities.editEntity(square, { 
                                    backgroundColor: WHITE,
                                    textColor: BLACK
                                });
                            }
                        });
                        _this.win();
                    } else if (winningColumn) {
                        print("we have a winning column ", winningColumn);
                        bingoNumberSquares.forEach(function(square) {
                            var name = Entities.getEntityProperties(square, 'name').name;
                            if (name) {
                                var column = name.charAt(COLUMN_INDEX);
                                // print("checking ", name, " where column is ", column);
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
                        print("we have a winning diag LtoR");
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
                        print("we have a winning diag RtoL");
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
            // if win flashing
        },

        win: function() {
            _this.playSound(MACHINE_WIN_SOUND);
            Entities.editEntity(bingoParticleEffect, { emitRate: 19 });
            Entities.editEntity(confettiParticleEffect, { emitRate: 61 });
        },

        lose: function() {
            _this.playSound(MACHINE_LOSE_SOUND);
            Script.setTimeout(function() {
                _this.playSound(SAD_TROMBONE_SOUND);
            }, MACHINE_LOSE_SOUND.duration * 1000);
        },

        deleteCard: function() {
            Entities.deleteEntity(cardEntity);
            Entities.getChildrenIDs(bingoMachine).forEach(function(entityNearMachine) {
                var name = Entities.getEntityProperties(entityNearMachine, 'name').name;
                if (name === "Bingo Machine Card") {
                    Entities.deleteEntity(entityNearMachine);
                }
            });
        },

        scanCard: function(thisID, params) {
            userName = params[0];
            wheel = params[1];
            userCardNumbers = [];
            print("THANKS CLIENT, I'LL GET THE USER'S NUMBERS, GET THE CALLED NUMBERS, AND CREATE A CARD");
            // the zero is because when the wheel client uses this function of the wheel server script, 
            // it needs to send an avatar id to return the data back, but when the scanner zone server 
            // calls the wheel server script, it only needs to send the zone ID to return data back
            // this lets me differentiate between the two
            Entities.callEntityMethod(wheel, 'getCalledNumbers', [-1, _this.entityID]);
            _this.getCardNumbers();
            _this.deleteCard();
            Entities.editEntity(machineSpotlight, { visible: true });
            _this.playSound(ENTER_ZONE_SOUND);
            // print("playing enter sound of duration: ", ENTER_ZONE_SOUND.duration);
            Script.setTimeout(function() {
                if (userCardNumbers.length !== 0) {
                    _this.playSound(COMPUTING_SOUND);
                    _this.createCard();
                    Script.setTimeout(function() {
                        _this.validateWin();
                    }, ENTER_ZONE_SOUND.duration * 1000 - OVERLAP_SOUNDS_TIME);
                } else {
                    // print("creating message");
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

        userLeftZone: function(thisID, userID) {
            print("TURNING OFF PARTICLE ", bingoParticleEffect);
            Entities.editEntity(bingoParticleEffect, { emitRate: 0 });
            print("TURNING OFF PARTICLE ", confettiParticleEffect);
            Entities.editEntity(confettiParticleEffect, { emitRate: 0 });
            Script.setTimeout(function() {
                Entities.editEntity(machineSpotlight, { visible: false });
                bingoNumberSquares = [];
                _this.deleteCard();
                print("TURNING OFF PARTICLE ", bingoParticleEffect);
                Entities.editEntity(bingoParticleEffect, { emitRate: 0 });
                print("TURNING OFF PARTICLE ", confettiParticleEffect);
                Entities.editEntity(confettiParticleEffect, { emitRate: 0 });
            }, WAIT_TO_DELETE_CARD);
        },

        playSound: function(sound) {
            // print("playing sound: ", JSON.stringify(sound));
            if (sound.downloaded) {
                // print("sound");
                if (injector) {
                    injector.stop();
                }
                injector = Audio.playSound(sound, {
                    position: position,
                    volume: audioVolume
                });
            }
        },

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
