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
    var SCANNER_SPOTLIGHT = "{c589869a-2a8d-4bc7-8ec7-2b353120ba61}";
    var CONFETTI_PARTICLE_EFFECT = "{82ca8364-628d-4e1d-8923-8df17f0aae43}";
    var BINGO_PARTICLE_EFFECT = "{cd06838a-d138-4f10-8796-fc5227019426}";
    var COMPUTING_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoComputing.wav"));
    var SCANNER_WIN_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoScannerWin.wav"));
    var SCANNER_LOSE_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoLose.wav"));
    var SAD_TROMBONE_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoSadTrombone.wav"));
    var WAIT_TO_CLOSE_TRAP_DOOR_MS = 1500;
    var WAIT_TO_CLOSE_WIN_GATE_MS = 2000;
    var REQUEST_URL = Script.require(Script.resolvePath('../../config/config.json?' + Date.now())).requestURL;

    var _this;
    
    var scannerZonePosition;
    var request = Script.require(Script.resolvePath('../../modules/request.js')).request;

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************

    // Takes a JSON object and translates that into URL query parameters
    function encodeURLParams(params) {
        var paramPairs = [];
        for (var key in params) {
            paramPairs.push(key + "=" + params[key]);
        }
        return paramPairs.join("&");
    }

    // PLAY A SOUND: Plays the specified sound at specified position and volume.
    // Only plays a sound if it's downloaded. Only plays one sound simultaneously.
    var injector;
    function playSound(sound, position, volume) {
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
            }
            injector = Audio.playSound(sound, {
                position: position,
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
        remotelyCallable: ['alreadyCalledNumbersReply', 'enterEntityServer', 'leaveEntityServer'],

        // ON LOADING THE SCRIPT: Save a reference to this entity ID.
        // Also store the position of this entity to use as an audio playback location
        // for certain sounds.
        preload: function(entityID) {
            _this.entityID = entityID;
            var properties = Entities.getEntityProperties(_this.entityID, ['position']);
            scannerZonePosition = properties.position;
        },

        // When the attached client script tells this server script that someone has entered this zone entity:
        // 1. Ensure the scanner trap door is closed.
        // 2. Play the "computing sound"
        // 3. Turn on the scanner spotlight
        // 4. Request the already-called numbers from the bingo wheel
        enterEntityServer: function(thisID, params) {
            Entities.editEntity(SCANNER_TRAP_DOOR, {localRotation: Quat.fromVec3Degrees({ x: 0, y: 0, z: 0 })});
            // eslint-disable-next-line no-magic-numbers
            playSound(COMPUTING_SOUND, scannerZonePosition, 0.5);
            Entities.editEntity(SCANNER_SPOTLIGHT, { visible: true });
            var usernameToScan = params[0];
            Entities.callEntityMethod(BINGO_WHEEL, 'requestAlreadyCalledNumbers', [_this.entityID, usernameToScan]);
            console.log("Requesting already called numbers from Bingo Wheel server script...");
        },

        // After this script calls `requestAlreadyCalledNumbers()`, the Bingo wheel will respond with 
        // `alreadyCalledNumbersReply()`. At that point, we want to get the card numbers of the user
        // who entered the scanner.
        alreadyCalledNumbersReply: function(id, args) {
            console.log("Received already called numbers from Bingo Wheel server script!");
            var calledNumbers = JSON.parse(args[0]);
            var username = args[1];
            _this.getUsersCardNumbers(username, calledNumbers);
        },

        // From the server, retrieve the numbers associated with a user's card.
        // If the user is a new user, automatically call lose().
        // Otherwise, go on to validate a win.
        getUsersCardNumbers: function(username, calledNumbers) {
            console.log("Requesting user's card numbers from server...");
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

                console.log("Retrieved user's card numbers from server!");

                if (response.newUser) {
                    _this.lose();
                } else {
                    _this.validateWin(username, response.userCardNumbers, calledNumbers);
                }
            });
        },

        // Validate a win:
        // 1. Translate the user's numbers into a 2D array of numbers that closely resemble a bingo card
        // 2. Check all rows, columns, and diagonals against the called numbers to determine a win
        validateWin: function(username, userNumbers, calledNumbers) {
            var rowIterator, colIterator;
            // -1 is the free space and was always "called"
            calledNumbers.push(-1);

            var userNumbers2D = [];
            var NUM_ROWS_COLS = 5;
            var CENTER_ROW_COL_IDX = 2;
            for (rowIterator = 0; rowIterator < NUM_ROWS_COLS; rowIterator++) {
                var currentColumn = [];

                for (colIterator = 0; colIterator < NUM_ROWS_COLS; colIterator++) {
                    // Handle free space
                    if (rowIterator === CENTER_ROW_COL_IDX && colIterator === CENTER_ROW_COL_IDX) {
                        currentColumn.push(-1);
                    } else {
                        currentColumn.push(userNumbers.shift());
                    }
                }
                userNumbers2D.push(currentColumn);
            }

            function checkRow(rowIndex) {
                for (colIterator = 0; colIterator < NUM_ROWS_COLS; colIterator++) {
                    if (calledNumbers.indexOf(userNumbers2D[colIterator][rowIndex]) === -1) {
                        return false;
                    }
                }

                return true;
            }

            function checkColumn(columnIndex) {
                for (rowIterator = 0; rowIterator < NUM_ROWS_COLS; rowIterator++) {
                    if (calledNumbers.indexOf(userNumbers2D[columnIndex][rowIterator]) === -1) {
                        return false;
                    }
                }

                return true;
            }

            function checkDiagonalTopLeftToBottomRight() {
                for (rowIterator = 0; rowIterator < NUM_ROWS_COLS; rowIterator++) {
                    if (calledNumbers.indexOf(userNumbers2D[rowIterator][rowIterator]) === -1) {
                        return false;
                    }
                }

                return true;
            }

            function checkDiagonalTopRightToBottomLeft() {
                for (rowIterator = 0; rowIterator < NUM_ROWS_COLS; rowIterator++) {
                    // eslint-disable-next-line no-magic-numbers
                    if (calledNumbers.indexOf(userNumbers2D[4 - rowIterator][rowIterator]) === -1) {
                        return false;
                    }
                }

                return true;
            }

            for (var i = 0; i < NUM_ROWS_COLS; i++) {
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

        // WIN! This is called after verifying the user's card numbers aganist the called numbers and
        // determining that the user did, in fact, win.
        win: function(username) {
            Entities.editEntity(WINNER_SIGN, { visible: true });
            // eslint-disable-next-line no-magic-numbers
            playSound(SCANNER_WIN_SOUND, scannerZonePosition, 0.5);
            Entities.callEntityMethod(BINGO_PARTICLE_EFFECT, 'turnOn');
            Entities.callEntityMethod(CONFETTI_PARTICLE_EFFECT, 'turnOn');
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
        },

        // LOSE! This is called after failing to verify that the user won.
        lose: function() {
            Entities.editEntity(LOSER_SIGN, { visible: true });
            // eslint-disable-next-line no-magic-numbers
            playSound(SCANNER_LOSE_SOUND, scannerZonePosition, 0.5);
            Script.setTimeout(function() {
                // eslint-disable-next-line no-magic-numbers
                playSound(SAD_TROMBONE_SOUND, scannerZonePosition, 0.5);
            // eslint-disable-next-line no-magic-numbers
            }, SCANNER_LOSE_SOUND.duration * 1000);
            Entities.editEntity(SCANNER_TRAP_DOOR, { localRotation: Quat.fromVec3Degrees({ x: 90, y: 0, z: 0 })});
        },

        // Hides the winner and loser signs above the scanner
        hideBanners: function() {
            Entities.editEntity(WINNER_SIGN, { visible: false });
            Entities.editEntity(LOSER_SIGN, { visible: false });
        },

        // Called when the client script attached to this entity reports that the user left the zone entity bounds.
        leaveEntityServer: function(thisID, userID) {
            Entities.editEntity(SCANNER_SPOTLIGHT, { visible: false });
            Entities.callEntityMethod(BINGO_PARTICLE_EFFECT, 'turnOff');
            Entities.callEntityMethod(CONFETTI_PARTICLE_EFFECT, 'turnOff');

            Script.setTimeout(function() {
                Entities.callEntityMethod(STAGE_ENTRY_GATE, 'closeGate');
            }, WAIT_TO_CLOSE_WIN_GATE_MS);

            Script.setTimeout(function() {
                _this.hideBanners();
                Entities.editEntity(SCANNER_TRAP_DOOR, { localRotation: Quat.fromVec3Degrees({ x: 0, y: 0, z: 0 })});
            }, WAIT_TO_CLOSE_TRAP_DOOR_MS);
        },

        // Called when unloading this script - reset all the things!
        unload: function(entityID) {
            _this.hideBanners();
            Entities.editEntity(SCANNER_SPOTLIGHT, { visible: false });
            Entities.editEntity(BINGO_PARTICLE_EFFECT, { emitRate: 0 });
            Entities.editEntity(CONFETTI_PARTICLE_EFFECT, { emitRate: 0 });
            Entities.editEntity(SCANNER_TRAP_DOOR, {
                angularVelocity: { x: 0, y: 0, z: 0 },
                localRotation: { x: 0, y: 0, z: 0 }
            });
        }
    };
    
    return new BingoScannerZone();
});
