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
    var LIGHT_BLINK_INTERVAL_MS = 500;
    var REMOVE_CARDS = Script.resolvePath("../../entityScripts/cardRemover/bingoCardRemover.js");
    var WAIT_FOR_ENTITIES_TO_LOAD_MS = 1000;
    var SPREADSHEET_URL = Script.require(Script.resolvePath('../../secrets/bingoSheetURL.json?0')).sheetURL;
    var BINGO_WALL = "{df198d93-a9b7-4619-9128-97a53fea2451}";
    var BINGO_WHEEL_TEXT = "{3a78b930-eba5-4f52-b906-f4fd78ad1ca9}";
    var NEW_ROUND_SOUND = SoundCache.getSound(Script.resolvePath("sounds/bingoOrgan.wav?0"));

    var _this;
    
    var playerCounterText;
    var bingoWallLights = [];
    var gameOnLights = [];
    var registrationSign;
    var cardRemoverSign;
    var calledNumbers = [];
    var interval;
    var newRoundURLParams;
    var roundNumber = 1;
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

    /* DEBUG PRINT: Enable or disable extra debugging messages */
    var DEBUG = 1;
    function debugPrint(msg) {
        if (DEBUG) {
            print(msg);
        }
    }

    /* PLAY SOUND: Plays the specified sound at the specified volume at the position of the game podium */
    var injector;
    function playSound(sound, volume) {
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
            }
            injector = Audio.playSound(sound, {
                position: Entities.getEntityProperties(_this.entityID, 'position').position,
                volume: volume
            });
        }
    }

    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    var Wheel = function() {
        _this = this;
    };

    Wheel.prototype = {
        remotelyCallable: ['getCalledNumbers', 'newRound', 'addCalledNumber', 'lightsOn', 'lightsOut', 
            'openRegistration', 'closeRegistration'],
        
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
                    // THIS IS PART OF THE OTHER COMMENTED OUT CODE FOR TEXTURE SWAPPING
                // } else if (name === "Bingo Wall Backboard") {
                //     backboard = childEntity;
                } else if (name === "Bingo Player Counter") {
                    print("FOUND PLAYER COUNTER");
                    playerCounterText = childEntity;
                } else if (name === "Bingo Player Counter Light") {
                    gameOnLights.push(childEntity);
                }
            });
        },
        
        /* GAME ON: Double check that game set lights are on, close registration, and put up the card remover sign */
        lightsOn: function() {
            gameOnLights.forEach(function(light) {
                Entities.editEntity(light, { visible: true });
            });
            // THIS IS NOT WORKING>>>TRY TO FIX IT!!!
            // Entities.editEntity(_this.entityID, {textures: JSON.stringify({
            //     "file2": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoardWheel2.fbx/Polychrome-D.png",
            //     "file3": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoardWheel2.fbx/Polychrome-M.jpg",
            //     "file4": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoardWheel2.fbx/Polychrome-R.jpg",
            //     "file5": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoardWheel2.fbx/Polychrome-E.jpg"
            // })});
            // Entities.editEntity(backboard, {textures: JSON.stringify({
            //     "file2": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoard2.fbx/Polychrome-D.png",
            //     "file3": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoard2.fbx/Polychrome-M.jpg",
            //     "file4": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoard2.fbx/Polychrome-R.jpg",
            //     "file5": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoard2.fbx/Polychrome-E.jpg"
            // })});
            _this.closeRegistration();
            Entities.editEntity(cardRemoverSign, {
                visible: true
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
            print("SERVER IS CLOSING REG");
            Entities.editEntity(registrationSign, { visible: false});
        },

        /* NEW ROUND: Clear the list of called numbers, turn on game set lights and turn off all bingo wall number lights. 
        Clear any interval, close registration, and put up the card remover sign. */
        newRound: function() {
            newRoundURLParams = encodeURLParams({ 
                type: "newRound",
                calledNumbers: JSON.stringify(calledNumbers),
                roundNumber: roundNumber
            });
            print(SPREADSHEET_URL + "?" + newRoundURLParams);
            request({
                uri: SPREADSHEET_URL + "?" + newRoundURLParams
            }, function (error, response) {
                debugPrint("bingoWheelServer.js: Spreadsheet URL is " + SPREADSHEET_URL + "?" + newRoundURLParams);
                if (error || !response) {
                    debugPrint("bingoWheelServer.js: ERROR when clearing Bingo entries!" + error || response);
                    return;
                }
                playSound(NEW_ROUND_SOUND, 1);
                debugPrint("bingoWheelServer.js: Successfully cleared Bingo entries from spreadsheet! " + response);
            
                debugPrint("bingoWheelServer.js: Resetting Bingo Wheel Number text (id: " + BINGO_WHEEL_TEXT + ")...");
                Entities.editEntity(BINGO_WHEEL_TEXT, {
                    text: "BINGO",
                    lineHeight: 1.1
                });
                debugPrint("bingoWheelServer.js: Calling reset on PLAYER_COUNTER_TEXT (id: " + playerCounterText + ")...");
                Entities.callEntityMethod(playerCounterText, 'reset');

                calledNumbers = [];
                gameOnLights.forEach(function(light) {
                    Entities.editEntity(light, { visible: true });
                });
                bingoWallLights.forEach(function(light) {
                    Entities.editEntity(light, { visible: false });
                });
                if (interval) {
                    Script.clearInterval(interval);
                }
                _this.closeRegistration();
                Entities.editEntity(cardRemoverSign, {
                    visible: true,
                    script: REMOVE_CARDS
                });
                roundNumber++;
            });
        },

        /* GAME OVER: Turn off all lights, take down card remover sign, and close registration. */
        lightsOut: function() {
            gameOnLights.forEach(function(light) {
                Entities.editEntity(light, { visible: false });
            });
            bingoWallLights.forEach(function(light) {
                Entities.editEntity(light, { visible: false });
            });
            // THIS IS NOT WORKING>>>TRY TO FIX IT!!!
            // Entities.editEntity(_this.entityID, {textures: JSON.stringify({
            //     "file2": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoardWheel2.fbx/Polychrome-D.png",
            //     "file3": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoardWheel2.fbx/Polychrome-M.jpg",
            //     "file4": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoardWheel2.fbx/Polychrome-R.jpg"
            // })});
            // Entities.editEntity(backboard, {textures: JSON.stringify({
            //     "file2": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoard2.fbx/Polychrome-D.png",
            //     "file3": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoard2.fbx/Polychrome-M.jpg",
            //     "file4": "https://hifi-content.s3.amazonaws.com/jimi/environment/bingo/BingoBoard2.fbx/Polychrome-R.jpg"
            // })});
            Entities.editEntity(cardRemoverSign, {
                visible: false
            });
            _this.closeRegistration();
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
        or server script of the scanner zone. If the call came from the wheel, it will only have one parameter. If it 
        came frm the zone, the first parameter will be -1. The list of called numbers will be returned to whichever 
        entity requested them. */
        getCalledNumbers: function(thisID, params) {
            if (!params[1]) {
                Entities.callEntityClientMethod(params[0], _this.entityID, 'receiveNumbersFromWheel', 
                    [JSON.stringify(calledNumbers)]);
            } else {
                var machineZoneID = params[1];
                Entities.callEntityMethod(machineZoneID, 'receiveNumbersFromWheel', 
                    [JSON.stringify(calledNumbers)]);
            }
        },

        /* CLEAR ALL CALLED NUMBERS: Clear the array. */
        clearCalledNumbers: function() {
            calledNumbers = [];
        },

        /* ADD A CALLED NUMBER TO LIST: Add the number to the list and set an interval to toggle the light onor off 
        every 500MS. After 6 toggles, clear teh interval, leaving the light on. */
        addCalledNumber: function(thisID, bingoNumber) {
            calledNumbers.push(bingoNumber[0]);
            var callNumber = bingoNumber[0].substring(2, bingoNumber[0].length);
            var lightOn = false;
            var blinks = 0;
            interval = Script.setInterval(function() {
                blinks++;
                if (lightOn) {
                    _this.lightOff(callNumber);
                    lightOn = false;
                } else {
                    _this.lightOn(callNumber);
                    lightOn = true;
                }
                if (blinks > 6) {
                    Script.clearInterval(interval);
                }
            }, LIGHT_BLINK_INTERVAL_MS);
        }
    };
    
    return new Wheel();
});
