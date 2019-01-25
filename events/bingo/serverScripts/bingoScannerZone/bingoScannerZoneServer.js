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
    var MAIN_STAGE_BOUNCER_ZONE = "{5ca26b63-c61b-447e-8985-b0269b33eed0}";
    var SCANNER_TRAP_DOOR = "{ab82d854-98da-44bf-8545-0544227bc56c}";
    var GAME_AUDIO_POSITION = { x: -79, y: -14, z: 6 };
    var COMPUTING_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoComputing.wav?0"));
    var SCANNER_WIN_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoScannerWin.wav"));
    var SCANNER_LOSE_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoLose.wav?0"));
    var SAD_TROMBONE_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoSadTrombone.wav?0"));
    var WHITE = {red:255,green:255,blue:255};
    var BLACK = { blue: 0, green: 0, red: 0 };
    var WAIT_TO_CLOSE_TRAP_DOOR_MS = 1500;
    var CHECK_DOOR_ROTATION_MS = 50;
    var WAIT_TO_CLOSE_WIN_GATE_MS = 2000;
    var WAIT_FOR_ENTITIES_TO_LOAD_MS = 2000;
    var SPREADSHEET_URL = Script.require(Script.resolvePath('../../secrets/bingoSheetURL.json')).sheetURL;

    var _this;
    
    var zonePosition;
    var trapDoorOpenCheckInterval = null;
    var trapDoorCloseCheckInterval = null;
    var scannerSpotlight;
    var winnerLoserBanner = null;
    var confettiParticleEffect;
    var bingoParticleEffect;
    var currentlyScanningCard = false;
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

    /* PLAY A SOUND: Plays the specified sound at specified position  and volume */
    var injector;
    function playSound(sound, position, volume) {
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
            }
            injector = Audio.playSound(sound, {
                position: GAME_AUDIO_POSITION,
                volume: volume
            });
        }
    }

    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    var BingoScannerZone = function() {
        _this = this;
    };

    BingoScannerZone.prototype = {

        remotelyCallable: ['alreadyCalledNumbersReply', 'scanCard', 'userLeftZone'],

        /* ON LOADING THE SCRIPT: Save a reference to this entity ID. Set a timeout for 2 seconds to ensure that entities 
        have loaded and then find and save references to other necessary entities. */
        preload: function(entityID) {
            _this.entityID = entityID;
            Script.setTimeout(function() {
                var properties = Entities.getEntityProperties(_this.entityID, ['parentID', 'position']);
                zonePosition = properties.position;
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

        /* SCAN USER'S CARD: Get the called numbers for this bingo round from the wheel's server script then get the 
        user's assigned card numbers and delete any cards already around the scanner. Turn the spotlight on and play 
        an enter sound then set a timeout for the duration of that sound. When the sound has finished, if the user's 
        numbers were found, play the computing sound, and set a timeout for part of 
        the duration of that sound after which we beging to validate their card winning. If the user's numbers were 
        not found, create a sign above the machine stating that. */
        scanCard: function(thisID, params) {
            if (currentlyScanningCard) {
                return;
            }

            currentlyScanningCard = true;
            Entities.editEntity(SCANNER_TRAP_DOOR, { localRotation: Quat.fromVec3Degrees({ x: 0, y: 0, z: 0 })});
            playSound(COMPUTING_SOUND, GAME_AUDIO_POSITION, 1);
            // eslint-disable-next-line no-magic-numbers
            playSound(COMPUTING_SOUND, zonePosition, 0.5);

            Entities.editEntity(scannerSpotlight, { visible: true });
            Entities.callEntityMethod(BINGO_WHEEL, 'requestAlreadyCalledNumbers', ["bingoScanner", _this.entityID, params[0]]);
        },

        /* RECEIVE NUMBERS THAT HAVE BEEN CALLED THIS ROUND */
        alreadyCalledNumbersReply: function(id, args) {
            _this.deleteWinnerLoserBanner();

            var calledLettersAndNumbers = JSON.parse(args[0]);
            var username = args[1];
            _this.getUsersCardNumbers(username, calledLettersAndNumbers);
        },

        /* GET USER'S CARD NUMBERS: Get the Google sheet URL from a private text file, then search the sheet for the user. 
        If the user is found, save their card numbers. */
        getUsersCardNumbers: function(username, calledLettersAndNumbers) {
            var searchParamString = encodeURLParams({
                type: "searchOnly",
                username: username
            });
            request({
                uri: SPREADSHEET_URL + "?" + searchParamString
            }, function (error, response) {
                if (error || !response || response.status !== "success") {
                    return;
                }

                if (response.newUser) {
                    winnerLoserBanner = Entities.addEntity({
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
                    _this.lose();
                } else {
                    _this.validateWin(username, response.userCardNumbers, calledLettersAndNumbers);
                }
            });
        },

        /* VALIDATE A WIN */
        validateWin: function(username, userNumbers, calledLettersAndNumbers) {
            var rowIterator, colIterator;
            // Strip away the letter and space from every element in calledLettersAndNumbers
            // -1 is the free space and was always "called"
            var calledNumbers = [-1];
            for (var i = 0; i < calledLettersAndNumbers.length; i++) {
                calledNumbers.push(parseInt(calledLettersAndNumbers[i].substring(2)));
            }

            var userNumbers2D = [];
            for (rowIterator = 0; rowIterator < 5; rowIterator++) {
                var currentColumn = [];

                for (colIterator = 0; colIterator < 5; colIterator++) {
                    // Handle free space
                    if (rowIterator === 2 && colIterator === 2) {
                        currentColumn.push(-1);
                    } else {
                        currentColumn.push(userNumbers.shift());
                    }
                }
                userNumbers2D.push(currentColumn);
            }

            function checkRow(rowIndex) {
                for (colIterator = 0; colIterator < 5; colIterator++) {
                    if (calledNumbers.indexOf(userNumbers2D[rowIndex][colIterator]) === -1) {
                        return false;
                    }
                }

                return true;
            }

            function checkColumn(columnIndex) {
                for (rowIterator = 0; rowIterator < 5; rowIterator++) {
                    if (calledNumbers.indexOf(userNumbers2D[rowIterator][columnIndex]) === -1) {
                        return false;
                    }
                }

                return true;
            }

            function checkDiagonals() {
                for (rowIterator = 0; rowIterator < 5; rowIterator++) {
                    if (calledNumbers.indexOf(userNumbers2D[rowIterator][rowIterator]) === -1) {
                        return false;
                    }
                }
                for (rowIterator = 0; rowIterator < 5; rowIterator++) {
                    if (calledNumbers.indexOf(userNumbers2D[4 - rowIterator][rowIterator]) === -1) {
                        return false;
                    }
                }

                return true;
            }

            for (i = 0; i < 5; i++) {
                if (checkRow(i)) {
                    _this.win(username);
                    return;
                }

                if (checkColumn(i)) {
                    _this.win(username);
                    return;
                }
            }

            if (checkDiagonals()) {
                _this.win(username);
                return;
            }
            
            _this.lose();
        },

        /* WIN: Play the winning sound and turn on confetti and bingo particles. */
        win: function(username) {
            playSound(SCANNER_WIN_SOUND, GAME_AUDIO_POSITION, 1);
            // eslint-disable-next-line no-magic-numbers
            playSound(SCANNER_WIN_SOUND, zonePosition, 0.5);
            Entities.callEntityMethod(bingoParticleEffect, 'turnOn');
            Entities.callEntityMethod(confettiParticleEffect, 'turnOn');
            try {
                var bouncerZoneUserData = JSON.parse(
                    Entities.getEntityProperties(MAIN_STAGE_BOUNCER_ZONE, 'userData').userData);
                if (bouncerZoneUserData.whitelist.usernames.indexOf(username) === -1) {
                    bouncerZoneUserData.whitelist.usernames.push(username);
                    Entities.editEntity(MAIN_STAGE_BOUNCER_ZONE, { userData: JSON.stringify(bouncerZoneUserData) });
                }
            } catch (err) {
                print("Error adding winner to bouncer zone userData");
            }
            Entities.callEntityMethod(STAGE_ENTRY_GATE, 'openGate');
            Entities.callEntityMethod(BINGO_WHEEL, 'addCurrentRoundWinner', [username]);
            currentlyScanningCard = false;
        },

        /* LOSE: Play the losing buzzer and lower the trap door. Set a timeout for after the buzzer sound has 
        finished to play the sad sound */
        lose: function() {
            playSound(SCANNER_LOSE_SOUND, GAME_AUDIO_POSITION, 1);
            // eslint-disable-next-line no-magic-numbers
            playSound(SCANNER_LOSE_SOUND, zonePosition, 0.5);
            Script.setTimeout(function() {
                playSound(SAD_TROMBONE_SOUND, GAME_AUDIO_POSITION, 1);
                // eslint-disable-next-line no-magic-numbers
                playSound(SAD_TROMBONE_SOUND, zonePosition, 0.5);
            // eslint-disable-next-line no-magic-numbers
            }, SCANNER_LOSE_SOUND.duration * 1000);
            
            Entities.editEntity(SCANNER_TRAP_DOOR, { angularVelocity: Quat.fromVec3Degrees({ x: 100, y: 0, z: 0 })});

            if (trapDoorOpenCheckInterval) {
                Script.clearInterval(trapDoorOpenCheckInterval);
                trapDoorOpenCheckInterval = false;
                Entities.editEntity(SCANNER_TRAP_DOOR, { 
                    angularVelocity: { x: 0, y: 0, z: 0 },
                    localRotation: Quat.fromVec3Degrees({ x: 90, y: 0, z: 0 })
                });
            }

            trapDoorOpenCheckInterval = Script.setInterval(function() {
                var trapDoorLocalRotationX = Entities.getEntityProperties(SCANNER_TRAP_DOOR, 'localRotation').localRotation.x;
                var quatValueForOpenRotation = 0.707;
                if (trapDoorLocalRotationX > quatValueForOpenRotation) {
                    Entities.editEntity(SCANNER_TRAP_DOOR, { 
                        angularVelocity: { x: 0, y: 0, z: 0 },
                        localRotation: Quat.fromVec3Degrees({ x: 90, y: 0, z: 0 })
                    });
                    Script.clearInterval(trapDoorOpenCheckInterval);
                    trapDoorOpenCheckInterval = false;
                }
            }, CHECK_DOOR_ROTATION_MS);

            currentlyScanningCard = false;
        },

        /* DELETE CARD ABOVE MACHINE: Delete the bingo card created by this script and any others found that 
        may have lost their referenece due to crash or errors. */
        deleteWinnerLoserBanner: function() {
            if (winnerLoserBanner) {
                Entities.deleteEntity(winnerLoserBanner);
                winnerLoserBanner = false;
            }
            Entities.getChildrenIDs(_this.entityID).forEach(function(entityNearMachine) {
                var name = Entities.getEntityProperties(entityNearMachine, 'name').name;
                if (name === "Bingo Scanner Card" || name === "No Card Found") {
                    Entities.deleteEntity(entityNearMachine);
                }
            });
        },

        /* WHEN USER LEAVES ZONE: Clear any open gates or trap door. Clear the 
        array of squares attached to the user's card and delete the card. Turn off particles. */
        userLeftZone: function(thisID, userID) {
            Script.setTimeout(function() {
                Entities.callEntityMethod(STAGE_ENTRY_GATE, 'closeGate');
            }, WAIT_TO_CLOSE_WIN_GATE_MS);

            Entities.editEntity(scannerSpotlight, { visible: false });
            _this.deleteWinnerLoserBanner();
            Entities.callEntityMethod(bingoParticleEffect, 'turnOff');
            Entities.callEntityMethod(confettiParticleEffect, 'turnOff');

            Script.setTimeout(function() {
                Entities.editEntity(SCANNER_TRAP_DOOR, { angularVelocity: Quat.fromVec3Degrees({ x: -100, y: 0, z: 0 })});

                if (trapDoorCloseCheckInterval) {
                    Script.clearInterval(trapDoorCloseCheckInterval);
                    trapDoorCloseCheckInterval = false;
                    Entities.editEntity(SCANNER_TRAP_DOOR, {
                        angularVelocity: { x: 0, y: 0, z: 0 },
                        localRotation: { x: 0, y: 0, z: 0 }
                    });
                }

                trapDoorCloseCheckInterval = Script.setInterval(function() {
                    var trapDoorLocalRotationX = Entities.getEntityProperties(
                        SCANNER_TRAP_DOOR, 'localRotation').localRotation.x;
                    if (trapDoorLocalRotationX < 0) {
                        Entities.editEntity(SCANNER_TRAP_DOOR, {
                            angularVelocity: { x: 0, y: 0, z: 0 },
                            localRotation: { x: 0, y: 0, z: 0 }
                        });
                        Script.clearInterval(trapDoorCloseCheckInterval);
                        trapDoorCloseCheckInterval = false;
                    }
                }, CHECK_DOOR_ROTATION_MS);
            }, WAIT_TO_CLOSE_TRAP_DOOR_MS);
        },

        /* ON UNLOADING SCRIPT: Delete the card, clear the array of squares from the card, turn off particles and 
        spotlight and clear any interval if necessary. */
        unload: function(entityID) {
            _this.deleteWinnerLoserBanner();
            Entities.editEntity(scannerSpotlight, { visible: false });
            Entities.editEntity(bingoParticleEffect, { emitRate: 0 });
            Entities.editEntity(confettiParticleEffect, { emitRate: 0 });
            Entities.editEntity(SCANNER_TRAP_DOOR, {
                angularVelocity: { x: 0, y: 0, z: 0 },
                localRotation: { x: 0, y: 0, z: 0 }
            });
            if (trapDoorOpenCheckInterval) {
                Script.clearInterval(trapDoorOpenCheckInterval);
                trapDoorOpenCheckInterval = false;
            }
            if (trapDoorCloseCheckInterval) {
                Script.clearInterval(trapDoorCloseCheckInterval);
                trapDoorCloseCheckInterval = false;
            }
        }
    };
    
    return new BingoScannerZone();
});
