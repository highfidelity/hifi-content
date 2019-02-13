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
    var STAGE_ENTRY_GATE = "{79ebf800-d2bb-4c20-b046-75e5f4f1553a}";
    var MAIN_STAGE_BOUNCER_ZONE = "{5ca26b63-c61b-447e-8985-b0269b33eed0}";
    var SCANNER_TRAP_DOOR = "{ab82d854-98da-44bf-8545-0544227bc56c}";
    var WINNER_SIGN = "{2bba449a-c8a2-484a-825c-3f6823882023}";
    var LOSER_SIGN = "{9500318e-bc57-40f5-b8c4-3b3919372521}";
    var GAME_AUDIO_POSITION = { x: -79, y: -14, z: 6 };
    var COMPUTING_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoComputing.wav"));
    var SCANNER_WIN_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoScannerWin.wav"));
    var SCANNER_LOSE_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoLose.wav"));
    var SAD_TROMBONE_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoSadTrombone.wav"));
    var WAIT_TO_CLOSE_TRAP_DOOR_MS = 1500;
    var WAIT_TO_CLOSE_WIN_GATE_MS = 2000;
    var WAIT_FOR_ENTITIES_TO_LOAD_MS = 2000;
    var REQUEST_URL = Script.require(Script.resolvePath('../secrets/secrets.json?0')).requestURL;

    var _this;
    
    var zonePosition;
    var scannerSpotlight;
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
                uri: REQUEST_URL + "?" + searchParamString
            }, function (error, response) {
                if (error || !response || response.status !== "success") {
                    return;
                }

                if (response.newUser) {
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
                // eslint-disable-next-line no-magic-numbers
                calledNumbers.push(parseInt(calledLettersAndNumbers[i].substring(2)));
            }

            var userNumbers2D = [];
            var numberOfRowsAndColumns = 5;
            var centerRowAndColumnIndex = 2;
            for (rowIterator = 0; rowIterator < numberOfRowsAndColumns; rowIterator++) {
                var currentColumn = [];

                for (colIterator = 0; colIterator < numberOfRowsAndColumns; colIterator++) {
                    // Handle free space
                    if (rowIterator === centerRowAndColumnIndex && colIterator === centerRowAndColumnIndex) {
                        currentColumn.push(-1);
                    } else {
                        currentColumn.push(userNumbers.shift());
                    }
                }
                userNumbers2D.push(currentColumn);
            }

            function checkRow(rowIndex) {
                for (colIterator = 0; colIterator < numberOfRowsAndColumns; colIterator++) {
                    if (calledNumbers.indexOf(userNumbers2D[rowIndex][colIterator]) === -1) {
                        return false;
                    }
                }

                return true;
            }

            function checkColumn(columnIndex) {
                for (rowIterator = 0; rowIterator < numberOfRowsAndColumns; rowIterator++) {
                    if (calledNumbers.indexOf(userNumbers2D[rowIterator][columnIndex]) === -1) {
                        return false;
                    }
                }

                return true;
            }

            function checkDiagonalTopLeftToBottomRight() {
                for (rowIterator = 0; rowIterator < numberOfRowsAndColumns; rowIterator++) {
                    if (calledNumbers.indexOf(userNumbers2D[rowIterator][rowIterator]) === -1) {
                        return false;
                    }
                }

                return true;
            }

            function checkDiagonalTopRightToBottomLeft() {
                for (rowIterator = 0; rowIterator < numberOfRowsAndColumns; rowIterator++) {
                    // eslint-disable-next-line no-magic-numbers
                    if (calledNumbers.indexOf(userNumbers2D[4 - rowIterator][rowIterator]) === -1) {
                        return false;
                    }
                }

                return true;
            }

            for (i = 0; i < numberOfRowsAndColumns; i++) {
                if (checkRow(i)) {
                    _this.win(username);
                    return;
                }

                if (checkColumn(i)) {
                    _this.win(username);
                    return;
                }
            }

            if (checkDiagonalTopLeftToBottomRight() || checkDiagonalTopRightToBottomLeft()) {
                _this.win(username);
                return;
            }
            
            _this.lose();
        },

        /* WIN: Play the winning sound and turn on confetti and bingo particles. */
        win: function(username) {
            Entities.editEntity(WINNER_SIGN, { visible: true });
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
            Entities.editEntity(LOSER_SIGN, { visible: true });
            playSound(SCANNER_LOSE_SOUND, GAME_AUDIO_POSITION, 1);
            // eslint-disable-next-line no-magic-numbers
            playSound(SCANNER_LOSE_SOUND, zonePosition, 0.5);
            Script.setTimeout(function() {
                playSound(SAD_TROMBONE_SOUND, GAME_AUDIO_POSITION, 1);
                // eslint-disable-next-line no-magic-numbers
                playSound(SAD_TROMBONE_SOUND, zonePosition, 0.5);
            // eslint-disable-next-line no-magic-numbers
            }, SCANNER_LOSE_SOUND.duration * 1000);
            Entities.editEntity(SCANNER_TRAP_DOOR, { localRotation: Quat.fromVec3Degrees({ x: 90, y: 0, z: 0 })});
            currentlyScanningCard = false;
        },

        /* HIDE BANNERS ABOVE MACHINE: Delete the bingo card created by this script and any others found that 
        may have lost their referenece due to crash or errors. */
        hideBanners: function() {
            Entities.editEntity(WINNER_SIGN, { visible: false });
            Entities.editEntity(LOSER_SIGN, { visible: false });
        },

        /* WHEN USER LEAVES ZONE: Clear any open gates or trap door. Clear the 
        array of squares attached to the user's card and delete the card. Turn off particles. */
        userLeftZone: function(thisID, userID) {
            Script.setTimeout(function() {
                _this.hideBanners();
                Entities.callEntityMethod(STAGE_ENTRY_GATE, 'closeGate');
            }, WAIT_TO_CLOSE_WIN_GATE_MS);

            Entities.editEntity(scannerSpotlight, { visible: false });
            Entities.callEntityMethod(bingoParticleEffect, 'turnOff');
            Entities.callEntityMethod(confettiParticleEffect, 'turnOff');

            Script.setTimeout(function() {
                Entities.editEntity(SCANNER_TRAP_DOOR, { localRotation: Quat.fromVec3Degrees({ x: 0, y: 0, z: 0 })});
            }, WAIT_TO_CLOSE_TRAP_DOOR_MS);
        },

        /* ON UNLOADING SCRIPT: Delete the card, clear the array of squares from the card, turn off particles and 
        spotlight and clear any interval if necessary. */
        unload: function(entityID) {
            _this.hideBanners();
            Entities.editEntity(scannerSpotlight, { visible: false });
            Entities.editEntity(bingoParticleEffect, { emitRate: 0 });
            Entities.editEntity(confettiParticleEffect, { emitRate: 0 });
            Entities.editEntity(SCANNER_TRAP_DOOR, {
                angularVelocity: { x: 0, y: 0, z: 0 },
                localRotation: { x: 0, y: 0, z: 0 }
            });
        }
    };
    
    return new BingoScannerZone();
});
