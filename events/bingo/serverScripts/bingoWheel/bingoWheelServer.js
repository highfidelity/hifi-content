/* eslint-disable no-magic-numbers */
//
// bingoWheelServer.js
// 
// Created by Rebecca Stankus on 10/16/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
/* global console */

(function() {
    var _this;
    
    // START EXTERNAL INCLUDES
    var request = Script.require(Script.resolvePath('../../modules/request.js')).request;
    // END EXTERNAL INCLUDES

    var LIGHT_BLINK_INTERVAL_MS = 500;
    var REMOVE_CARDS_SCRIPT = Script.resolvePath("../../entityScripts/cardRemover/bingoCardRemover.js");
    var CARD_SPAWNER_SCRIPT = Script.resolvePath("../../entityScripts/cardSpawner/bingoCardSpawner.js");
    var WAIT_FOR_ENTITIES_TO_LOAD_MS = 1000;
    var REQUEST_URL = Script.require(Script.resolvePath('../../config/config.json?' + Date.now())).requestURL;
    var DB_TABLE_PREFIX = Script.require(Script.resolvePath('../../config/config.json?' + Date.now())).dbTablePrefix;
    var BINGO_WALL = "{df198d93-a9b7-4619-9128-97a53fea2451}";
    var BINGO_WHEEL_TEXT = "{3a78b930-eba5-4f52-b906-f4fd78ad1ca9}";
    var USERS_ALLOWED_TO_SPIN_WHEEL =
        Script.require(Script.resolvePath('../../config/config.json?' + Date.now())).usersAllowedToSpinWheel;

    // START PRIZE VARS
    var GAME_AUDIO_POSITION = Script.require(Script.resolvePath('../../config/config.json?' + Date.now())).gameAudioPosition;
    var DRUMROLL_SOUND = SoundCache.getSound(Script.resolvePath("sounds/drumroll.wav"));
    var LOWER_DOORS_DELAY_MS = 1150;
    var currentRoundWinners = [];
    var BINGO_PRIZE_DOOR_1_TEXT = "{ff7674bb-5569-4381-b370-1dfa1d2a9723}";
    var BINGO_PRIZE_DOOR_1 = "{8724dc08-c0fb-4feb-bda1-8686023f8355}";
    var avatarsInDoor1Zone = [];
    var BINGO_PRIZE_DOOR_2_TEXT = "{7c80210b-8554-4ed4-8c3f-bade78aa074b}";
    var BINGO_PRIZE_DOOR_2 = "{26cb7c69-40e0-44d6-8a10-b3a261ef0abc}";
    var avatarsInDoor2Zone = [];
    var BINGO_PRIZE_DOOR_3_TEXT = "{ec35d3dd-b99a-450c-bd90-5665adfaf9f2}";
    var BINGO_PRIZE_DOOR_3 = "{a3843b9d-70d7-407b-b7ca-378a31fac21f}";
    var avatarsInDoor3Zone = [];
    // END PRIZE VARS

    var MAIN_STAGE_BOUNCER_ZONE = "{5ca26b63-c61b-447e-8985-b0269b33eed0}";
    
    var possibleBingoCalls = [];
    var wheelSpinning = false;
    var BINGO_WHEEL_EDIT_TIMEOUT_DEFAULT_MS = 80;
    var TIME_BETWEEN_EDITS_STEP_MULTIPLIER = 1.2;
    var bingoWheelEditTimeout;
    var currentTimeBetweenEdits;
    var BLIP_SOUND = SoundCache.getSound(Script.resolvePath('sounds/blip.wav'));
    var SPIN_SOUND = SoundCache.getSound(Script.resolvePath('sounds/wheelSpin.mp3'));
    var BINGO_TEXT_ENTITY_ID = "{3a78b930-eba5-4f52-b906-f4fd78ad1ca9}";
    var WHEELSPIN_ANGULAR_VELOCITY = { x: 0, y: 0, z: -10 };
    var SLOWEST_ANGVEL_Z = -0.1;
    
    var gameReady = false;
    var playerCounterText;
    var bingoWallLights = [];
    var gameOnLights = [];
    var registrationSign;
    var cardRemoverSign;
    var calledNumbers = [];
    var lightBlinkInterval;
    var newRoundURLParams;

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************

    /* ENCODE URL PARAMETERS: Formats data to send to Google sheet */
    function encodeURLParams(params) {
        var paramPairs = [];
        for (var key in params) {
            paramPairs.push(key + "=" + params[key]);
        }
        return paramPairs.join("&");
    }


    // Plays a sound a specified volume and position.
    // If no position is specified, will use `GAME_AUDIO_POSITION`
    // Only plays a sound if it's downloaded. Only plays one sound simultaneously.
    var injector;
    function playSound(sound, volume, position) {
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
            }

            injector = Audio.playSound(sound, {
                position: position || GAME_AUDIO_POSITION,
                volume: volume
            });
        }
    }

    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    // Lowers all prize doors
    function lowerDoors() {
        Entities.callEntityMethod(BINGO_PRIZE_DOOR_1, 'openGate');
        Entities.callEntityMethod(BINGO_PRIZE_DOOR_2, 'openGate');
        Entities.callEntityMethod(BINGO_PRIZE_DOOR_3, 'openGate');
    }

    var Wheel = function() {
        _this = this;
    };

    Wheel.prototype = {
        remotelyCallable: ['requestAlreadyCalledNumbers', 'newRound', 'lightsOn', 'lightsOut', 'spinBingoWheel',
            'openRegistration', 'closeRegistration', 'addCurrentRoundWinner', 'addOrRemovePrizeZoneAvatar', 'givePrizes',
            'callAllNumbers'],
        
        // On script preload, save a reference to this entity ID and wait 1 second before getting 
        // relevant entity IDs and starting a new round.
        preload: function(entityID) {
            _this.entityID = entityID;
            Script.setTimeout(function() {
                _this.getGameEntities();
                _this.newRound();
            }, WAIT_FOR_ENTITIES_TO_LOAD_MS);
        },

        /* ON UNLOADING THE APP: Clear any bingoWheelEditTimeout */
        unload: function(entityID) {
            if (bingoWheelEditTimeout) {
                Script.clearTimeout(bingoWheelEditTimeout);
                bingoWheelEditTimeout = false;
            }
        },

        /* GET PARTS OF GAME: Get references to all lights and signs that will need to be edited. They are all 
        parented to the wall. */
        getGameEntities: function() {
            bingoWallLights = [];
            Entities.getChildrenIDs(BINGO_WALL).forEach(function(childEntity) {
                var name = Entities.getEntityProperties(childEntity, 'name').name;
                if (name.indexOf("Bingo Wall Light ") !== -1) {
                    var lightNumber = name.substring(17, name.length);
                    bingoWallLights[lightNumber] = childEntity;
                } else if (name === "Bingo Wall Header Light") {
                    gameOnLights.push(childEntity);
                } else if (name === "Bingo Click To Play Sign") {
                    registrationSign = childEntity;
                } else if (name === "Bingo Remove Cards Sign") {
                    cardRemoverSign = childEntity;
                } else if (name === "Bingo Wheel Light") {
                    gameOnLights.push(childEntity);
                } else if (name === "Bingo Player Counter") {
                    playerCounterText = childEntity;
                } else if (name === "Bingo Player Counter Light") {
                    gameOnLights.push(childEntity);
                }
            });
        },
        
        // Ensure that all gameOnLights are turned on.
        lightsOn: function() {
            gameOnLights.forEach(function(light) {
                Entities.editEntity(light, { visible: true });
            });
        },

        /* Adds the specified username to the Winners array. That array is cleared
        when a new round is started via the NEW ROUND button */
        addCurrentRoundWinner: function(thisID, params) {
            var winnerUsername = params[0];

            if (currentRoundWinners.indexOf(winnerUsername) === -1) {
                currentRoundWinners.push(winnerUsername);
            }
        },

        // Add or remove a username from the array that contains presence data
        // for each prize door zone
        addOrRemovePrizeZoneAvatar: function(senderID, params) {
            var data = JSON.parse(params);
            var username = data.username;
            var zoneNumber = data.prizeDoorNumber;
            var isAdding = data.isAdding;

            function addOrRemove(array, username, isAdding) {
                var idx = array.indexOf(username);

                if (idx > -1 && !isAdding) {
                    console.log("Removing " + username + " from list of avatars currently in Prize Zone " + zoneNumber + "!");
                    array.splice(idx, 1);
                } else if (idx === -1 && isAdding) {
                    console.log("Adding " + username + " to list of avatars currently in Prize Zone " + zoneNumber + "!");
                    array.push(username);
                }
            }

            if (zoneNumber === 1) {
                addOrRemove(avatarsInDoor1Zone, username, isAdding);
            } else if (zoneNumber === 2) {
                addOrRemove(avatarsInDoor2Zone, username, isAdding);
            } else if (zoneNumber === 3) {
                addOrRemove(avatarsInDoor3Zone, username, isAdding);
            }
        },

        /* GIVE PRIZES:
            1. Ensures we're ready to give prizes (no action taken if no winners)
            2. Randomizes the prizes, ensuring no duplicates
            3. Updates the text entities behind the doors
            4. Moves the doors to reveal the text entities
            5. Records valid winners and their prizes on the server 
        */
        givePrizes: function() {
            if (currentRoundWinners.length === 0) {
                console.log("Bingo Boss pressed 'Give Prizes', but there are no recorded current round winners!");
                return;
            }

            if (avatarsInDoor1Zone.length === 0 &&
                avatarsInDoor2Zone.length === 0 &&
                avatarsInDoor3Zone.length === 0) {
                console.log("Bingo Boss pressed 'Give Prizes', but there are no avatars in the prize zones!");
                return;
            }

            var roundPrizes = [];
            function maybePushRandomPrize(prizeString) {
                if (roundPrizes.indexOf(prizeString) === -1) {
                    roundPrizes.push(prizeString);
                }
            }

            var possiblePrizes = Script.require(Script.resolvePath('../../config/config.json?' + Date.now())).possiblePrizes;
            while (roundPrizes.length < 3) {
                maybePushRandomPrize(possiblePrizes[Math.floor(Math.random() * possiblePrizes.length)]);
            }

            Entities.editEntity(BINGO_PRIZE_DOOR_1_TEXT, {text: roundPrizes[0]});
            Entities.editEntity(BINGO_PRIZE_DOOR_2_TEXT, {text: roundPrizes[1]});
            Entities.editEntity(BINGO_PRIZE_DOOR_3_TEXT, {text: roundPrizes[2]});

            playSound(DRUMROLL_SOUND, 1);
            Script.setTimeout(lowerDoors, LOWER_DOORS_DELAY_MS);
            
            var requestBody = {
                type: "recordPrizes",
                winners: []
            };
            var i = 0;

            for (i = 0; i < avatarsInDoor1Zone.length; i++) {
                if (currentRoundWinners.indexOf(avatarsInDoor1Zone[i]) > -1) {
                    requestBody.winners.push({
                        username: avatarsInDoor1Zone[i],
                        prizeWon: roundPrizes[0]
                    });
                }
            }

            for (i = 0; i < avatarsInDoor2Zone.length; i++) {
                if (currentRoundWinners.indexOf(avatarsInDoor2Zone[i]) > -1) {
                    requestBody.winners.push({
                        username: avatarsInDoor2Zone[i],
                        prizeWon: roundPrizes[1]
                    });
                }
            }

            for (i = 0; i < avatarsInDoor3Zone.length; i++) {
                if (currentRoundWinners.indexOf(avatarsInDoor3Zone[i]) > -1) {
                    requestBody.winners.push({
                        username: avatarsInDoor3Zone[i],
                        prizeWon: roundPrizes[2]
                    });
                }
            }
            
            request({
                uri: REQUEST_URL,
                json: true,
                body: requestBody,
                method: "POST"
            }, function (error, response) {
                if (error || !response || response.status !== "success") {
                    print("ERROR when recording winners: ", error, JSON.stringify(response));
                    return;
                }
            });
        },

        /* OPEN REGISTRATION: Take down card remover sign and put up card spawner sign. */
        openRegistration: function() {
            Entities.editEntity(cardRemoverSign, {
                script: "",
                visible: false
            });
            Entities.editEntity(registrationSign, {
                visible: true,
                script: CARD_SPAWNER_SCRIPT
            });
        },

        /* CLOSE REGISTRATION: Take down card remover sign and mark the game as Ready to Play */
        closeRegistration: function() {
            Entities.editEntity(registrationSign, {
                visible: false,
                script: ""
            });
            Entities.editEntity(cardRemoverSign, {
                script: "",
                visible: true
            });
            gameReady = true;
        },

        // When a new round is requested:
        // 1. Ensure the card spawner sign is invisible
        // 2. Ensure the card remover sign is visible
        // 3. Reset the player counter text
        // 4. Send a request to the server to start a new round. If that request succeeds:
        //     i. Change the Bingo wheel text to read "BINGO"
        //     ii. Mark the game as "not ready"
        //     iii. Clear the calledNumbers, winners, and avatars-in-prize-zones arrays
        //     iv. Close the prize door gates and clear the prize door text entities
        //     v. Clear the userData whitelist on the stage bouncer zone
        //     vi. Turn off all of the bingo wall lights
        newRound: function() {
            Entities.editEntity(registrationSign, {
                visible: false,
                script: ""
            });
            Entities.editEntity(cardRemoverSign, {
                visible: true,
                script: REMOVE_CARDS_SCRIPT
            });

            Entities.callEntityMethod(playerCounterText, 'reset');

            newRoundURLParams = encodeURLParams({ 
                type: "newRound",
                newTablePrefix: DB_TABLE_PREFIX
            });
            request({
                uri: REQUEST_URL + "?" + newRoundURLParams
            }, function (error, response) {
                if (error || !response || response.status !== "success") {
                    print("ERROR: Could not reset round.", error, JSON.stringify(response));
                    return;
                }
                Entities.editEntity(BINGO_WHEEL_TEXT, {
                    text: "BINGO",
                    lineHeight: 1.1
                });

                gameReady = false;
                calledNumbers = [];
                currentRoundWinners = [];
                avatarsInDoor1Zone = [];
                avatarsInDoor2Zone = [];
                avatarsInDoor3Zone = [];
                Entities.callEntityMethod(BINGO_PRIZE_DOOR_1, 'closeGate');
                Entities.callEntityMethod(BINGO_PRIZE_DOOR_2, 'closeGate');
                Entities.callEntityMethod(BINGO_PRIZE_DOOR_3, 'closeGate');
                Entities.editEntity(BINGO_PRIZE_DOOR_1_TEXT, {text: ""});
                Entities.editEntity(BINGO_PRIZE_DOOR_2_TEXT, {text: ""});
                Entities.editEntity(BINGO_PRIZE_DOOR_3_TEXT, {text: ""});

                var bouncerZoneUserData = JSON.parse(
                    Entities.getEntityProperties(MAIN_STAGE_BOUNCER_ZONE, 'userData').userData);
                bouncerZoneUserData.whitelist.usernames = [];
                Entities.editEntity(MAIN_STAGE_BOUNCER_ZONE, { userData: JSON.stringify(bouncerZoneUserData) });

                bingoWallLights.forEach(function(light) {
                    Entities.editEntity(light, { visible: false });
                });
                if (lightBlinkInterval) {
                    Script.clearInterval(lightBlinkInterval);
                    lightBlinkInterval = false;
                }
            });
        },

        // If the Bingo boss requests "lights out":
        // 1. Call `newRound()`
        // 2. Turn off the `gameOnLights`
        lightsOut: function() {
            _this.newRound();
            gameOnLights.forEach(function(light) {
                Entities.editEntity(light, { visible: false });
            });
        },

        /* TURN ON A WALL LIGHT : Edit the visibilty to turn on a light. */
        lightOn: function(lightNumber) {
            Entities.editEntity(bingoWallLights[lightNumber], {
                visible: true
            });
        },

        /* TURN OFF A WALL LIGHT: Edit the visibilty to turn off a light. */
        lightOff: function(lightNumber) {
            Entities.editEntity(bingoWallLights[lightNumber], {
                visible: false
            });
        },

        /* REQUEST CALLED NUMBERS: This is a remotely called function coming from the scanner zone.
        The list of called numbers will be returned to the scanner zone for determining a winner. */
        requestAlreadyCalledNumbers: function(thisID, params) {
            var scannerZoneID = params[0];
            var requesterUsername = params[1];
            Entities.callEntityMethod(scannerZoneID, 'alreadyCalledNumbersReply', 
                [JSON.stringify(calledNumbers), requesterUsername]);
        },
        
        // Edits the bingo wheel text based on the bingo wheel's current velocity.
        // Calls `addCalledNumber()` if the wheel has stopped.
        editBingoWheel: function() {
            var currentAngularVelocity = Entities.getEntityProperties(
                _this.entityID, 'angularVelocity').angularVelocity;

            if (currentAngularVelocity.z < SLOWEST_ANGVEL_Z) {
                Entities.editEntity(BINGO_TEXT_ENTITY_ID, {
                    text: possibleBingoCalls[Math.floor(Math.random() * possibleBingoCalls.length)],
                    lineHeight: 1.58
                });
                currentTimeBetweenEdits *= TIME_BETWEEN_EDITS_STEP_MULTIPLIER;
                bingoWheelEditTimeout = Script.setTimeout(_this.editBingoWheel, currentTimeBetweenEdits);
            } else {
                var bingoCall = possibleBingoCalls[Math.floor(Math.random() * possibleBingoCalls.length)];
                Entities.editEntity(BINGO_TEXT_ENTITY_ID, {
                    text: bingoCall
                });

                // Remove the BINGO letter from the call
                bingoCall = bingoCall.substring(2, bingoCall.length);
                _this.addCalledNumber(parseInt(bingoCall));

                bingoWheelEditTimeout = false;
                wheelSpinning = false;

                playSound(BLIP_SOUND, 0.5, GAME_AUDIO_POSITION);
            }
        },

        // Starts the Bingo wheel if the user who clicked the wheel is allowed to spin it.
        // Fills in `possibleBingoCalls` letter/number array based on already-called numbers.
        spinBingoWheel: function(thisID, params) {
            var spinnerUsername = params[0];

            if (USERS_ALLOWED_TO_SPIN_WHEEL.indexOf(spinnerUsername) > -1) {
                if (!gameReady) {
                    console.log("User attempted to spin wheel, but game is not ready!");
                    return;
                }

                if (wheelSpinning) {
                    return;
                }

                wheelSpinning = true;

                var i = 1;
                var currentGeneratedBingoCall;
                possibleBingoCalls = [];

                while (i < 16) {
                    currentGeneratedBingoCall = "B " + String(i);
                    if (calledNumbers.indexOf(i) === -1) {
                        possibleBingoCalls.push(currentGeneratedBingoCall);
                    }
                    i++;
                }
                while (i < 31) {
                    currentGeneratedBingoCall = "I " + String(i);
                    if (calledNumbers.indexOf(i) === -1) {
                        possibleBingoCalls.push(currentGeneratedBingoCall);
                    }
                    i++;
                }
                while (i < 46) {
                    currentGeneratedBingoCall = "N " + String(i);
                    if (calledNumbers.indexOf(i) === -1) {
                        possibleBingoCalls.push(currentGeneratedBingoCall);
                    }
                    i++;
                }
                while (i < 61) {
                    currentGeneratedBingoCall = "G " + String(i);
                    if (calledNumbers.indexOf(i) === -1) {
                        possibleBingoCalls.push(currentGeneratedBingoCall);
                    }
                    i++;
                }
                while (i < 76) {
                    currentGeneratedBingoCall = "O " + String(i);
                    if (calledNumbers.indexOf(i) === -1) {
                        possibleBingoCalls.push(currentGeneratedBingoCall);
                    }
                    i++;
                }

                if (possibleBingoCalls.length === 0) {
                    return;
                }
                
                Entities.editEntity(_this.entityID, {
                    angularVelocity: WHEELSPIN_ANGULAR_VELOCITY
                });
                playSound(SPIN_SOUND, 0.8, GAME_AUDIO_POSITION);

                if (bingoWheelEditTimeout) {
                    Script.clearTimeout(bingoWheelEditTimeout);
                    bingoWheelEditTimeout = false;
                }

                currentTimeBetweenEdits = BINGO_WHEEL_EDIT_TIMEOUT_DEFAULT_MS;
                _this.editBingoWheel();
            }   
        },

        sendCalledNumbersToServer: function() {
            var requestBody = {
                "type": "replaceCalledNumbers",
                "calledNumbers": calledNumbers
            };
            request({
                uri: REQUEST_URL,
                json: true,
                body: requestBody,
                method: "POST"
            }, function (error, response) {
                if (error || !response || response.status !== "success") {
                    print("ERROR when sending called numbers array to server: ", error, JSON.stringify(response));
                    return;
                } else {
                    print("Called numbers successfully stored on server.");
                }
            });
        },

        /* ADD A CALLED NUMBER TO LIST: Add the number to the list and set an lightBlinkInterval to toggle the light on and off 
        every 500MS. After 6 toggles, clear the lightBlinkInterval, leaving the light on. */
        addCalledNumber: function(calledNumber) {
            calledNumbers.push(calledNumber);
            var lightOn = false;
            var blinks = 0;

            // If we were already blinking lights when we got here...
            if (lightBlinkInterval) {
                // ...clear the light blink interval
                Script.clearInterval(lightBlinkInterval);
                lightBlinkInterval = false;

                // ...and also make sure that the light associated with the last number we called
                // is ON.
                if (calledNumbers.length > 0) {
                    var lastCallNumber = calledNumbers[calledNumbers.length - 2];
                    _this.lightOn(lastCallNumber);
                }
            }

            lightBlinkInterval = Script.setInterval(function() {
                blinks++;
                if (lightOn) {
                    _this.lightOff(calledNumber);
                    lightOn = false;
                } else {
                    _this.lightOn(calledNumber);
                    lightOn = true;
                }
                if (blinks > 6) {
                    Script.clearInterval(lightBlinkInterval);
                    lightBlinkInterval = false;
                }
            }, LIGHT_BLINK_INTERVAL_MS);

            _this.sendCalledNumbersToServer();
        }, 

        // A debug method used to immediately call all numbers
        // Relies on `config.json` containing `"debugMode": true`
        callAllNumbers: function(thisID, params) {
            var debugMode = Script.require(Script.resolvePath('../../config/config.json?' + Date.now())).debugMode;
            if (!debugMode) {
                return;
            }

            if (USERS_ALLOWED_TO_SPIN_WHEEL.indexOf(params[0]) > -1) {
                for (var i = 0; i < 76; i++) {
                    _this.addCalledNumber(i);
                }
            }
        }
    };
    
    return new Wheel();
});
