/* eslint-disable no-magic-numbers */
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
    function fillRandomSoundsArray() {        
        for (var i = 0; i < BINGO_STRING.length; i++) {
            var newSoundIndex = Math.floor(Math.random() * headerSounds.length);
            var newSound = headerSounds[newSoundIndex];
            if (currentHeaderSounds.indexOf(newSound) === -1) {
                currentHeaderSounds.push(newSound);
            } else {
                i--;
            }
        }
    }

    /* LOAD SOUNDS: Prepare each sound file for playback using Soundcache API */
    var BINGO_STRING = "BINGO";
    var headerSounds = [];
    function cacheSounds() {
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

        fillRandomSoundsArray();
    }

    /* FIND OR CREATE BINGO CARD:  Search the google sheet for the user's name to see if they have already been assigned 
    numbers for this round. If they have numbers already, retrieve them. If they do not have numbers, get new ones
    and add one to the player counter text. */
    var SPREADSHEET_URL = Script.require(Script.resolvePath('../secrets/bingoSheetURL.json?0')).sheetURL;
    var PLAYER_COUNTER_TEXT = "{15d6a1a1-c361-4c8e-8b9a-f4cb4ae2dd83}";
    var request = Script.require('request').request;
    var userCardNumbers = [];
    var selectedNumberIDs = [];
    var cardColor = {"red": 43, "green": 43, "blue": 43};
    function findOrCreateCard() {
        // We don't need to make any requests if we already have our numbers.
        if (userCardNumbers.length > 0) {
            ui.sendMessage({
                type: 'initializeCard',
                allNumbers: userCardNumbers,
                selectedNumberIDs: selectedNumberIDs,
                cardColor: cardColor
            });
            return;
        }

        var searchParamString = encodeURLParams({
            type: "searchOrAdd",
            username: AccountServices.username
        });
        request({
            uri: SPREADSHEET_URL + "?" + searchParamString
        }, function (error, response) {
            if (error || !response) {
                return;
            }
            if (response.status && response.status === "success") {
                userCardNumbers = response.userCardNumbers;
                cardColor = response.userCardColor;
                ui.sendMessage({
                    type: 'initializeCard',
                    allNumbers: userCardNumbers,
                    selectedNumberIDs: selectedNumberIDs,
                    cardColor: cardColor
                });

                if (response.newUser) {
                    Entities.callEntityServerMethod(PLAYER_COUNTER_TEXT, 'addOne');
                }
            }
        });         
    }

    /* ON OPENING THE APP: Create the gem over the user's head to show that they are active in the game, preload the 
    sounds that will be used and populate a bingo card with previously used numbers or, if no numbers are found for 
    the user, get a new set of numbers */
    function onOpened() {
        createGem();
        // The delay shouldn't be necessary in RC78. this is currently necessary because of this bug:
        // eslint-disable-next-line max-len
        // https://highfidelity.manuscript.com/f/cases/20253/screenChanged-signal-is-emitted-before-the-screen-has-actually-changed
        Script.setTimeout(findOrCreateCard, 500);
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

    /* ON WEB EVENT: Respond to a web event from bingo.html by immediate action or calling another function. If 
    the event is a push on a button, determine which type of sound action is required. If the event was 
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
        if (event.type === 'bingoNumberSelected') {
            playSound(SELECT_SOUND, 0.1, MyAvatar.position, false);
            selectedNumberIDs.push(event.selectedID);
        } else if (event.type === 'bingoNumberDeselected') {
            playSound(DESELECT_SOUND, 0.1, MyAvatar.position, false);
            var currentIndex = selectedNumberIDs.indexOf(event.deselectedID);
            if (currentIndex > -1) {
                selectedNumberIDs.splice(currentIndex, 1);
            }
        } else if (event.type === 'playSoundFromBingoHeaderButton') {
            playSound(currentHeaderSounds[event.index], 0.05, MyAvatar.position, false);
        } else if (event.type === 'calledBingo') {
            playSound(WIN_SOUND, 1, WHEEL_POSITION, false);
            Entities.callEntityMethod(SCANNER_ENTRY_ZONE, 'callBingo');
            if (confettiParticle) {
                Entities.deleteEntity(confettiParticle);
            }
            playSound(WIN_SOUND, 0.3, MyAvatar.position, false);
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
                if (confettiParticle) {
                    Entities.editEntity(confettiParticle, { emitRate: 0 });
                    Script.setTimeout(function() {
                        if (confettiParticle) {
                            Entities.deleteEntity(confettiParticle);
                            confettiParticle = null;
                        }
                    }, WAIT_TO_DELETE_PARTICLE_MS);
                }
            }, WAIT_TO_STOP_PARTICLE_MS);
        }
    }

    /* ON APP START: Setup app UI, button, and messaging between it's html page and this script */
    var ui;
    var AppUi = Script.require('appUi');
    var appPage = Script.resolvePath('bingoCard_ui.html?9');
    function startup() {
        ui = new AppUi({
            buttonName: "BINGO",
            home: appPage,
            graphicsDirectory: Script.resolvePath("assets/icons/"),
            onOpened: onOpened,
            onClosed: onClosed,
            onMessage: onWebEventReceived
        });
        cacheSounds();
    }

    /* WHEN USER SESSION CHANGES: End this script so users will not be left with a card when leaving the domain */
    function sessionChanged() {
        ScriptDiscoveryService.stopScript(Script.resolvePath('bingoCard_app.js?10'));
    }
    
    startup();
    ui.open();
    AvatarList.avatarSessionChangedEvent.connect(sessionChanged);
    Script.scriptEnding.connect(onClosed);
}());
