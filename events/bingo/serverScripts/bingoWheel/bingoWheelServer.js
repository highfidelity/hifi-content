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

(function() {
    var _this;

    var LIGHT_BLINK_INTERVAL_MS = 500;
    var REMOVE_CARDS = Script.resolvePath("../../entityScripts/cardRemover/bingoCardRemover.js");
    var WAIT_FOR_ENTITIES_TO_LOAD_MS = 1000;
    var WAIT_WHILE_CARDS_ARE_DELETED_MS = 3000;
    var SPREADSHEET_URL = Script.require(Script.resolvePath('../../secrets/bingoSheetURL.json?109')).sheetURL;
    var BINGO_WALL = "{df198d93-a9b7-4619-9128-97a53fea2451}";
    var BINGO_WHEEL_TEXT = "{3a78b930-eba5-4f52-b906-f4fd78ad1ca9}";

    var POSSIBLE_PRIZES = ["Oculus Quest", "Vive Pro", "1,000 HFC", "Nothing!", "Three Sheep", "500 HFC"];
    var currentRoundWinners = [];
    var BINGO_PRIZE_DOOR_1_TEXT = "{ff7674bb-5569-4381-b370-1dfa1d2a9723}";
    var avatarsInDoor1Zone = [];
    var BINGO_PRIZE_DOOR_2_TEXT = "{7c80210b-8554-4ed4-8c3f-bade78aa074b}";
    var avatarsInDoor2Zone = [];
    var BINGO_PRIZE_DOOR_3_TEXT = "{ec35d3dd-b99a-450c-bd90-5665adfaf9f2}";
    var avatarsInDoor3Zone = [];
    
    var playerCounterText;
    var bingoWallLights = [];
    var gameOnLights = [];
    var registrationSign;
    var cardRemoverSign;
    var backboard;
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

    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

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
                    print("FOUND CARD REMOVER SIGN");
                    cardRemoverSign = childEntity;
                } else if (name === "Bingo Wheel Light") {
                    gameOnLights.push(childEntity);
                } else if (name === "Bingo Wall Backboard") {
                    backboard = childEntity;
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
            Entities.editEntity(_this.entityID, {textures: JSON.stringify({
                "file2": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoardWheel2.fbx/Polychrome-D.png",
                "file3": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoardWheel2.fbx/Polychrome-M.jpg",
                "file4": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoardWheel2.fbx/Polychrome-R.jpg",
                "file5": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoardWheel2.fbx/Polychrome-E.jpg"
            })});
            Entities.editEntity(backboard, {textures: JSON.stringify({
                "file2": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoard2.fbx/Polychrome-D.png",
                "file3": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoard2.fbx/Polychrome-M.jpg",
                "file4": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoard2.fbx/Polychrome-R.jpg",
                "file5": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoard2.fbx/Polychrome-E.jpg"
            })});
        },

        /* Adds the specified username to the Winners array. That array is cleared
        when a new round is started via the NEW ROUND button */
        addCurrentRoundWinner: function(thisID, params) {
            var winnerUsername = params[0];

            if (currentRoundWinners.indexOf(winnerUsername) === -1) {
                console.log("Adding " + winnerUsername + " to currentRoundWinners!");
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
        0. Ensures we're ready to give prizes (no action taken if no winners)
        1. Randomizes the prizes, ensuring no duplicates
        2. Updates the text entities behind the doors
        3. TODO: Moves the doors to reveal the text entities
        4. Records valid winners and their prizes on the Google Sheet 
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

            // INSERT CODE TO OPEN DOORS HERE

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
            Entities.editEntity(registrationSign, { visible: true });
        },

        /* CLOSE REGISTRATION: Take down card remover sign. */
        closeRegistration: function() {
            Entities.editEntity(registrationSign, { visible: false});
        },

        /* NEW ROUND: Clear the list of called numbers and winners,
        turn on game set lights and turn off all bingo wall number lights. 
        Clear any lightBlinkInterval, close registration, and put up the card remover sign. */
        newRound: function() {
            newRoundURLParams = encodeURLParams({ 
                type: "newRound",
                calledLettersAndNumbers: JSON.stringify(calledLettersAndNumbers)
            });
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
                Entities.callEntityMethod(playerCounterText, 'reset');
                calledLettersAndNumbers = [];
                currentRoundWinners = [];
                avatarsInDoor1Zone = [];
                avatarsInDoor2Zone = [];
                avatarsInDoor3Zone = [];
                bingoWallLights.forEach(function(light) {
                    Entities.editEntity(light, { visible: false });
                });
                if (lightBlinkInterval) {
                    Script.clearInterval(lightBlinkInterval);
                    lightBlinkInterval = false;
                }
                _this.closeRegistration();
                Entities.editEntity(cardRemoverSign, {
                    visible: true,
                    script: REMOVE_CARDS
                });
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
                script: REMOVE_CARDS
            });
            Entities.editEntity(_this.entityID, {textures: JSON.stringify({
                "file2": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoardWheel2.fbx/Polychrome-D.png",
                "file3": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoardWheel2.fbx/Polychrome-M.jpg",
                "file4": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoardWheel2.fbx/Polychrome-R.jpg"
            })});
            Entities.editEntity(backboard, {textures: JSON.stringify({
                "file2": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoard2.fbx/Polychrome-D.png",
                "file3": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoard2.fbx/Polychrome-M.jpg",
                "file4": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoard2.fbx/Polychrome-R.jpg"
            })});
            Script.setTimeout(function() {
                Entities.editEntity(cardRemoverSign, {
                    visible: false
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

        /* GET CALLED NUMBERS: This is a remotely called function coming from either the client script of this entity 
        or server script of the scanner zone.. The list of called numbers will be returned to whichever 
        entity requested them. */
        requestAlreadyCalledNumbers: function(thisID, params) {
            var referrer = params[0];
            var requesterUsername;

            if (referrer === "bingoWheel") {
                var callerSessionUUID = params[1];
                requesterUsername = params[2];
                Entities.callEntityClientMethod(callerSessionUUID, _this.entityID, 'alreadyCalledNumbersReply', 
                    [JSON.stringify(calledLettersAndNumbers), requesterUsername]);
            } else if (referrer === "bingoScanner") {
                var machineZoneID = params[1];
                requesterUsername = params[2];
                Entities.callEntityMethod(machineZoneID, 'alreadyCalledNumbersReply', 
                    [JSON.stringify(calledLettersAndNumbers), requesterUsername]);
            }
        },

        /* CLEAR ALL CALLED NUMBERS: Clear the array. */
        clearCalledNumbers: function() {
            calledLettersAndNumbers = [];
        },

        /* ADD A CALLED NUMBER TO LIST: Add the number to the list and set an lightBlinkInterval to toggle the light on and off 
        every 500MS. After 6 toggles, clear teh lightBlinkInterval, leaving the light on. */
        addCalledLetterAndNumber: function(thisID, args) {
            calledLettersAndNumbers.push(args[0]);
            var callNumber = args[0].substring(2, args[0].length);
            var lightOn = false;
            var blinks = 0;
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
