//
// bingoCard_app.js
// Created by Liv Erickson on 10/24/2018
// Edited by Rebecca Stankus 01/03/19
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

/* globals AccountServices, Audio, AvatarList, Entities, JSON, Math, MyAvatar, Script, ScriptDiscoveryService, SoundCache */

(function() {

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
    function playSound(sound, volume, position, localOnly){
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
            }
            injector = Audio.playSound(sound, {
                position: position,
                volume: volume,
                localOnly: localOnly
            });
        }
    }

    /* DOES ARRAY CONTAIN A NUMBER: Search through an array for a specific number and return the result */
    function contains(array, number) {
        for (var i = 0 ; i < array.length; i++) {
            if (array[i] === number) {
                return true;
            }
        }
        return false;
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

    /* CREATE A GEM: Checks that gem does not already exist, then calculates position over avatar's head and 
    creates a gem there */
    var playingMarker;
    function createGem() {
        if (playingMarker) {
            return;
        }
        var entitySpawnPosition = MyAvatar.position;
        var yPositionOverHead = entitySpawnPosition.y + 0.5 * MyAvatar.getHeight() + 0.1;
        entitySpawnPosition.y = yPositionOverHead;
        playingMarker = Entities.addEntity({
            name: "Playing Bingo",
            collisionless: true,
            dimensions: {
                x: 0.1,
                y: 0.12,
                z: 0.1
            },
            position: entitySpawnPosition,
            grabbable: false,
            parentID: MyAvatar.sessionUUID,
            modelURL: Script.resolvePath("assets/models/gem-overlay.fbx"),
            type: "Model",
            userData: "{ \"grabbableKey\": { \"grabbable\": false } }"
        }, true);
    }

    /* GET RANDOM SOUND: Randomly selects one of the sounds in the 'headerSounds' array */
    var currentHeaderSounds = [];
    function getRandomSound() {
        var newSoundIndex = Math.floor(Math.random() * headerSounds.length);
        var newSound = headerSounds[newSoundIndex];
        if (!contains(currentHeaderSounds, newSound)) {
            currentHeaderSounds.push(newSound);
            return newSound;
        }
        return getRandomSound();
    }

    /* LOAD SOUNDS: Prepare each sound file for playback using Soundcache API */
    var BINGO_STRING = "BINGO";
    var headerSounds = [];
    function loadSounds() {
        headerSounds.push(SoundCache.getSound(Script.resolvePath("assets/sounds/bingoCat.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("assets/sounds/bingoDog.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("assets/sounds/bingoPlinks.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("assets/sounds/bingoPianoPlinks.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("assets/sounds/bingoBomb.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("assets/sounds/bingoSqueak.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("assets/sounds/bingoChatter.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("assets/sounds/bingoClang.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("assets/sounds/bingoGiggles.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("assets/sounds/bingoSplash.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("assets/sounds/bingoWaHaHa.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("assets/sounds/bingoFall.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("assets/sounds/bingoTwinkle.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("assets/sounds/bingoPopUp.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("assets/sounds/bingoWhistle.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("assets/sounds/bingoBubbles.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("assets/sounds/bingoHarp.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("assets/sounds/bingoKazoo.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("assets/sounds/bingoVibration.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("assets/sounds/bingoSpiral.wav")));
        
        for (var i = 0; i < BINGO_STRING.length; i++) {
            getRandomSound();
        }
    
    }

    /* STORE USER: Store the user's name and assigned bingo card numbers for future reference*/
    // -------------------------MOVE THIS TO EXTERNAL FILE--------------------------------------------------------------
    var SPREADSHEET_URL = Script.require(Script.resolvePath('../secrets/bingoSheetURL.json')).sheetURL;
    var PLAYER_COUNTER_TEXT = "{15d6a1a1-c361-4c8e-8b9a-f4cb4ae2dd83}";
    var request = Script.require('request').request;
    var userName = AccountServices.username;
    var userCardNumbers = [];
    function storeUser() {
        var addParamString = encodeURLParams({
            type: "add",
            username: userName,
            cardNumbers: JSON.stringify(userCardNumbers)
        });
        request({
            uri: SPREADSHEET_URL + "?" + addParamString
        }, function (error, response) {
            if (error || !response) {
                debugPrint("bingoCard_app.jss: ERROR when adding new Bingo user entry!" + error || response);
                return;
            }
            debugPrint("bingoCard_app.jss: Successfully stored Bingo user entry in spreadsheet!");
            Entities.callEntityServerMethod(PLAYER_COUNTER_TEXT, 'addOne');
        });
    }

    /* GET A RANDOM BINGO NUMBER: Selects a random number from the possible combinations for the current column. Each letter 
    column has 15 possible numbers, so possibilities are  B 1-15, I 16-30, N  31-45, G 46-60, and O 61-75. After a random 
    number is selected, checks that the number has not already been used and, if not, returns the new number */
    var COLUMN_RANGE = 15;
    var rowMinimum;
    function getRandomNumber() {
        var randomNumber = Math.floor(Math.random() * Number(COLUMN_RANGE) + Number(rowMinimum));
        if (!contains(userCardNumbers, randomNumber)) {
            userCardNumbers.push(randomNumber);
            return randomNumber;
        }
        return getRandomNumber();
    }

    /* ASSIGN BINGO CARD NUMBERs: Give the user 25 numbers, 5 for each letter column. */
    function assignCardNumbers() {
        userCardNumbers = [];
        rowMinimum = 1;
        for (var i = 0; i < BINGO_STRING.length; i++) {
            var rows = 5;
            for (var currentRow = 0; currentRow < rows; currentRow++) {
                if (!(i === 2 && currentRow === 2)) {
                    getRandomNumber();
                }
            } 
            rowMinimum += COLUMN_RANGE;
        }
        storeUser();
    }

    /* FIND OR CREATE BINGO CARD:  Search the google sheet for the user's name to see if they have already been assigned 
    numbers for this round. If they have numbers already, retrieve them. If they do not have numbers, get new ones. */
    var WAIT_TO_SEND_NUMBERS = 1000;
    function findOrCreateCard() {
        var searchParamString = encodeURLParams({
            type: "search",
            username: userName
        });
        request({
            uri: SPREADSHEET_URL + "?" + searchParamString
        }, function (error, response) {
            debugPrint("bingoCard_app.jss: Spreadsheet URL is " + SPREADSHEET_URL + "?" + searchParamString);
            if (error || !response) {
                debugPrint("bingoCard_app.jss: ERROR when searching for Bingo user!" + error || response);
                return;
            }
            debugPrint("bingoCard_app.jss: Successfully searched for Bingo user entry in spreadsheet!");
            if (response === "New username") {
                assignCardNumbers(true);
            } else if (response) {
                var userNumbersToSplit = response.substring(2, response.length - 2);
                userCardNumbers = userNumbersToSplit.split(",");
            }
            Script.setTimeout(function() {
                ui.tablet.emitScriptEvent(JSON.stringify({
                    type : 'displayNumbers',
                    numbers: userCardNumbers
                }));
            }, WAIT_TO_SEND_NUMBERS);
        });         
    }

    /* ON OPENING THE APP: Create the gem over the user's head to show that they are active in the game, preload the 
    sounds that will be used and populate a bingo card with previously used numbers or, if no numbers are found for 
    the user, get a new set of numbers */
    function onOpened() {
        createGem();
        loadSounds();
        findOrCreateCard();
    }

    /* ON CLOSING THE APP: Make sure the confetti and gem get deleted and their respective variables set back to null 
    if applicable. Search for any unreferenced gems and delete if found. */
    var confettiParticle;
    function onClosed() {
        if (playingMarker) {
            Entities.deleteEntity(playingMarker);
            playingMarker = null;
        }
        if (confettiParticle) {
            Entities.deleteEntity(confettiParticle);
            confettiParticle = null;
        }
        MyAvatar.getAvatarEntitiesVariant().forEach(function(avatarEntity) {
            var name = Entities.getEntityProperties(avatarEntity, 'name').name;
            if (name === "Playing Bingo") {
                Entities.deleteEntity(avatarEntity);
            }
        });
    }

    /* ON WEB EVENT: Respond to a web event from bingo.html by immediate action, calling another function, or printing 
    an error. If the event is a push on a button, determine which type of sound action is required. If the event was 
    pressing a header button or highlighting or clearing a number button, play the corresponding sound. If the event 
    was the user calling "Bingo", create the confetti and set a timeout to remove it. */
    var WIN_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoWin.wav"));
    var SELECT_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoSelect.wav"));
    var DESELECT_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoDeselect.wav"));
    var WAIT_TO_DELETE_PARTICLE_MS = 3000;
    var WAIT_TO_STOP_PARTICLE_MS = 1000;
    var WHEEL_POSITION = Entities.getEntityProperties("{57e5e385-3968-4ebf-8048-a7650423d83b}", 'position').position;
    var SCANNER_ENTRY_ZONE = "{0da9b717-bbc0-423e-9ad0-c2c97b9f741c}";
    function onWebEventReceived(event) {
        if (event.type === 'playSoundFromBingoButton') {
            if (event.index > -1) {
                playSound(currentHeaderSounds[event.index], 0.5, MyAvatar.position, false);
            } else if (event.index === -2) {
                playSound(SELECT_SOUND, 0.2, MyAvatar.position, false);
            } else if (event.index === -3) {
                playSound(DESELECT_SOUND, 0.2, MyAvatar.position, false);
            }
        }
        if (event.type === 'calledBingo') {
            playSound(WIN_SOUND, 1, WHEEL_POSITION, false);
            Entities.callEntityMethod(SCANNER_ENTRY_ZONE, 'callBingo');
            if (confettiParticle) {
                Entities.deleteEntity(confettiParticle);
            }
            playSound(WIN_SOUND, 1, MyAvatar.position, false);
            confettiParticle = Entities.addEntity({
                accelerationSpread: {
                    x: 0.10000000149011612,
                    y: 0,
                    z: 0.10000000149011612
                },
                alphaFinish: 1,
                alphaStart: 1,
                colorFinish: {
                    blue: 0,
                    green: 0,
                    red: 0
                },
                colorSpread: {
                    blue: 255,
                    green: 255,
                    red: 255
                },
                colorStart: {
                    blue: 200,
                    green: 200,
                    red: 200
                },
                dimensions: {
                    x: 50.30699920654297,
                    y: 50.30699920654297,
                    z: 50.30699920654297
                },
                emitAcceleration: {
                    x: -0.10000000149011612,
                    y: -2.5,
                    z: -0.10000000149011612
                },
                emitDimensions: {
                    x: 1,
                    y: 1,
                    z: 1
                },
                emitOrientation: {
                    w: 0.7068167924880981,
                    x: -0.7073966860771179,
                    y: -1.5258869098033756e-05,
                    z: -1.5258869098033756e-05
                },
                emitRate: 61,
                emitSpeed: 3.2699999809265137,
                emitterShouldTrail: true,
                ignoreForCollisions: true,
                isEmitting: true,
                maxParticles: 3200,
                name: "Bingo Confetti Particle",
                parentID: MyAvatar.sessionUUID,
                particleRadius: 0.25,
                polarFinish: 0.05235987901687622,
                localPosition: {
                    x: 0,
                    y: 0.5,
                    z: 0
                },
                radiusFinish: 0.23999999463558197,
                radiusStart: 0.009999999776482582,
                localRotation: Quat.fromVec3Degrees({
                    x: 0,
                    y: 0,
                    z: 0
                }),
                speedSpread: 0,
                spinFinish: 6.2831854820251465,
                spinSpread: 6.2831854820251465,
                spinStart: null,
                textures: Script.resolvePath("assets/particles/sprite-confetti.jpg"),
                type: "ParticleEffect",
                serverScripts: Script.resolvePath("../serverScripts/bingoScannerZone/bingoScannerParticleServer.js"),
                userData: "{\"grabbableKey\":{\"grabbable\":false}}"
            }, true);
            Script.setTimeout(function() {
                Entities.editEntity(confettiParticle, { emitRate: 0 });
                Script.setTimeout(function() {
                    Entities.deleteEntity(confettiParticle);
                    confettiParticle = null;
                }, WAIT_TO_DELETE_PARTICLE_MS);
            }, WAIT_TO_STOP_PARTICLE_MS);
        }
    }

    /* ON APP START: Setup app UI, button, and messaging between it's html page and this script */
    var ui;
    var AppUi = Script.require('appUi');
    var appPage = Script.resolvePath('bingoCard_ui.html');
    function startup() {
        ui = new AppUi({
            buttonName: "BINGO",
            home: appPage,
            graphicsDirectory: Script.resolvePath("assets/icons/"),
            onOpened: onOpened,
            onClosed: onClosed,
            onMessage: onWebEventReceived
        });
    }

    /* WHEN USER SESSION CHANGES: End this script so users will not be left with a card when leaving the domain*/
    function sessionChanged() {
        ScriptDiscoveryService.stopScript(Script.resolvePath('bingoCard_app.js'));
    }
    
    startup();
    ui.open();
    AvatarList.avatarSessionChangedEvent.connect(sessionChanged);
    Script.scriptEnding.connect(onClosed);
}());
