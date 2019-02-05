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

    var LIGHT_BLINK_INTERVAL_MS = 500;
    var REMOVE_CARDS_SCRIPT = Script.resolvePath("../../entityScripts/cardRemover/bingoCardRemover.js");
    var CARD_SPAWNER_SCRIPT = Script.resolvePath("../../entityScripts/cardSpawner/bingoCardSpawner.js");
    var WAIT_FOR_ENTITIES_TO_LOAD_MS = 1000;
    var WAIT_WHILE_CARDS_ARE_DELETED_MS = 3000;
    var SPREADSHEET_URL = Script.require(Script.resolvePath('../../secrets/bingoSheetURL.json')).sheetURL;
    var BINGO_WALL = "{df198d93-a9b7-4619-9128-97a53fea2451}";
    var BINGO_WHEEL_TEXT = "{3a78b930-eba5-4f52-b906-f4fd78ad1ca9}";

    var GAME_AUDIO_POSITION = { x: -79, y: -14, z: 6 };
    var DRUMROLL_SOUND = SoundCache.getSound(Script.resolvePath("sounds/drumroll.wav"));
    var LOWER_DOORS_DELAY_MS = 1150;
    var POSSIBLE_PRIZES = ["Oculus Rift", "Vive", "HFC!", "All Players Win!!!"];
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

    var MAIN_STAGE_BOUNCER_ZONE = "{5ca26b63-c61b-447e-8985-b0269b33eed0}";
    
    var gameReady = false;
    var playerCounterText;
    var bingoWallLights = [];
    var gameOnLights = [];
    var registrationSign;
    var cardRemoverSign;
    var calledLettersAndNumbers = [];
    var lightBlinkInterval;
    var newRoundURLParams;
    var request = Script.require(Script.resolvePath('../../modules/request.js')).request;

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

    var injector;
    function playSound(sound, volume) {
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

    function lowerDoors() {
        Entities.callEntityMethod(BINGO_PRIZE_DOOR_1, 'openGate');
        Entities.callEntityMethod(BINGO_PRIZE_DOOR_2, 'openGate');
        Entities.callEntityMethod(BINGO_PRIZE_DOOR_3, 'openGate');
    }

    var Wheel = function() {
        _this = this;
    };

    Wheel.prototype = {
        remotelyCallable: ['requestAlreadyCalledNumbers', 'newRound', 'addCalledLetterAndNumber', 'lightsOn', 'lightsOut', 
            'openRegistration', 'closeRegistration', 'addCurrentRoundWinner', 'addOrRemovePrizeZoneAvatar', 'givePrizes'],
        
        /* ON LOADING THE APP: Save a reference to this entity ID and wait 1 second before getting lights and starting 
        a new round */
        preload: function(entityID) {
            _this.entityID = entityID;
            Script.setTimeout(function() {
                _this.getGameEntities();
                _this.newRound();
            }, WAIT_FOR_ENTITIES_TO_LOAD_MS);
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
        
        /* GAME ON: Double check that game set lights are on */
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
            5. Records valid winners and their prizes on the Google Sheet 
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

            while (roundPrizes.length < 3) {
                maybePushRandomPrize(POSSIBLE_PRIZES[Math.floor(Math.random() * (POSSIBLE_PRIZES.length - 1))]);
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
                uri: SPREADSHEET_URL,
                json: true,
                body: requestBody,
                method: "POST"
            }, function (error, response) {
                if (error || !response || response.status !== "success") {
                    print("ERROR when recording winners: ", error || JSON.stringify(response));
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

        /* NEW ROUND: Clear the list of called numbers and winners,
        turn on game set lights and turn off all bingo wall number lights. 
        Clear any lightBlinkInterval, close registration, and put up the card remover sign. */
        newRound: function() {
            newRoundURLParams = encodeURLParams({ 
                type: "newRound",
                calledLettersAndNumbers: JSON.stringify(calledLettersAndNumbers)
            });
            Entities.editEntity(registrationSign, {
                visible: false,
                script: ""
            });
            Entities.editEntity(cardRemoverSign, {
                visible: true,
                script: REMOVE_CARDS_SCRIPT
            });
            Entities.callEntityMethod(playerCounterText, 'reset');
            request({
                uri: SPREADSHEET_URL + "?" + newRoundURLParams
            }, function (error, response) {
                if (error || !response || response.status !== "success") {
                    print("ERROR: Could not reset round.", response);
                    return;
                }
                Entities.editEntity(BINGO_WHEEL_TEXT, {
                    text: "BINGO",
                    lineHeight: 1.1
                });

                gameReady = false;
                calledLettersAndNumbers = [];
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

        /* GAME OVER: Turn off all lights, take down card remover sign, and close registration. */
        lightsOut: function() {
            _this.newRound();
            gameOnLights.forEach(function(light) {
                Entities.editEntity(light, { visible: false });
            });
            // This is an extra check to be sure cards are deleted in case the "New Round" call is not processed.
            Entities.editEntity(cardRemoverSign, {
                visible: true,
                script: REMOVE_CARDS_SCRIPT
            });
            Entities.editEntity(registrationSign, {
                visible: false,
                script: ""
            });
            Script.setTimeout(function() {
                Entities.editEntity(cardRemoverSign, {
                    visible: false,
                    script: ""
                });
            }, WAIT_WHILE_CARDS_ARE_DELETED_MS);
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

        /* REQUEST CALLED NUMBERS: This is a remotely called function coming from either the client script of this entity 
        or server script of the scanner zone.. The list of called numbers will be returned to whichever 
        entity requested them. */
        requestAlreadyCalledNumbers: function(thisID, params) {
            var referrer = params[0];
            var requesterUsername;

            if (referrer === "bingoWheel") {
                var callerSessionUUID = params[1];
                requesterUsername = params[2];
                if (gameReady) {
                    Entities.callEntityClientMethod(callerSessionUUID, _this.entityID, 'alreadyCalledNumbersReply', 
                        [JSON.stringify(calledLettersAndNumbers), requesterUsername]);
                } else {
                    Entities.callEntityClientMethod(callerSessionUUID, _this.entityID, 'alreadyCalledNumbersReply', 
                        [JSON.stringify(calledLettersAndNumbers)]);
                }
            } else if (referrer === "bingoScanner") {
                var machineZoneID = params[1];
                requesterUsername = params[2];
                Entities.callEntityMethod(machineZoneID, 'alreadyCalledNumbersReply', 
                    [JSON.stringify(calledLettersAndNumbers), requesterUsername]);
            }
        },

        /* ADD A CALLED NUMBER TO LIST: Add the number to the list and set an lightBlinkInterval to toggle the light on and off 
        every 500MS. After 6 toggles, clear the lightBlinkInterval, leaving the light on. */
        addCalledLetterAndNumber: function(thisID, args) {
            calledLettersAndNumbers.push(args[0]);
            var callNumber = args[0].substring(2, args[0].length);
            var lightOn = false;
            var blinks = 0;

            // If we were already blinking lights when we got here...
            if (lightBlinkInterval) {
                // ...clear the light blink interval
                Script.clearInterval(lightBlinkInterval);
                lightBlinkInterval = false;

                // ...and also make sure that the light associated with the last number we called
                // is ON.
                if (calledLettersAndNumbers.length > 0) {
                    var lastCallNumber = calledLettersAndNumbers[calledLettersAndNumbers.length - 1];
                    _this.lightOn(lastCallNumber);
                }
            }

            lightBlinkInterval = Script.setInterval(function() {
                blinks++;
                if (lightOn) {
                    _this.lightOff(callNumber);
                    lightOn = false;
                } else {
                    _this.lightOn(callNumber);
                    lightOn = true;
                }
                if (blinks > 6) {
                    Script.clearInterval(lightBlinkInterval);
                    lightBlinkInterval = false;
                }
            }, LIGHT_BLINK_INTERVAL_MS);
        }
    };
    
    return new Wheel();
});
