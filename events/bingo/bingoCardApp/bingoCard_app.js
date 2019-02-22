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

    // Takes a JSON object and translates that into URL query parameters
    function encodeURLParams(params) {
        var paramPairs = [];
        for (var key in params) {
            paramPairs.push(key + "=" + params[key]);
        }
        return paramPairs.join("&");
    }

    // Plays the specified sound at the specified position, volume, and localOnly
    // Only plays a sound if it is downloaded.
    // Only plays one sound at a time.
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

    // Checks that a Bingo gem does not already exist, then calculates the correct position
    // over the avatar's head and creates a gem there
    var playingMarker;
    var GEM_STATIC_PROPS = {
        "name": "Playing Bingo",
        "collisionless": true,
        "dimensions": {
            "x": 0.1,
            "y": 0.12,
            "z": 0.1
        },
        "grabbable": false,
        "modelURL": Script.resolvePath("assets/models/gem-overlay.fbx"),
        "type": "Model",
        "userData": "{ \"grabbableKey\": { \"grabbable\": false } }"
    };
    function createGem() {
        if (playingMarker) {
            return;
        }
        var entitySpawnPosition = MyAvatar.position;
        var yPositionOverHead = entitySpawnPosition.y + 0.5 * MyAvatar.getHeight() + 0.1;
        entitySpawnPosition.y = yPositionOverHead;
        var props = GEM_STATIC_PROPS;
        props.position = entitySpawnPosition;
        props.parentID = MyAvatar.sessionUUID;
        playingMarker = Entities.addEntity(props, 'avatar');
    }

    // Called on startup. Fills `currentHeaderSounds` with five random sounds from
    // `headerSounds`. Persists across app UI open/close.
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

    // Prepare each sound file for playback using SoundCache API, then call `fillRandomSoundsArray()`
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

    // Two main cases here:
    // 1. The user has previously filled their `userCardNumbers` array with a result from the backend.
    //     Send a message to the UI with those numbers, the selectedNumberIDs, and the cardColor
    // 2. The user doesn't have a cached `userCardNumbers` array. In that case:
    //     i. Request card numbers and card color from the server
    //     ii. If the response indicates success, send that data to the UI
    //         a. If the server indicates that the user is new, tell the player counter text to
    //             add one to its count.
    var REQUEST_URL = Script.require(Script.resolvePath('../config/config.json?' + Date.now())).requestURL;
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
            uri: REQUEST_URL + "?" + searchParamString
        }, function (error, response) {
            if (error || !response) {
                return;
            }
            if (response.status && response.status === "success") {
                if (response.userCardNumbers) {
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
                } else {
                    ui.sendMessage({
                        type: 'notLoggedIn'
                    });
                }
            }
        });         
    }

    // When the user opens the app, add the Bingo gem above their avatar's head
    function onOpened() {
        createGem();
    }

    
    // When the user closes the app, delete the bingo gem (if it exists),
    // and delete the confetti particle (if it exists)
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
                Entities.deleteEntity(avatarEntity.id);
            }
        });
    }

   
    // Handle EventBridge messages from bingoCard_ui.js.
    var WIN_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoWin.wav"));
    var SELECT_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoSelect.wav"));
    var DESELECT_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoDeselect.wav"));
    var WAIT_TO_DELETE_PARTICLE_MS = 3000;
    var WAIT_TO_STOP_PARTICLE_MS = 1000;
    var WHEEL_POSITION = Entities.getEntityProperties("{57e5e385-3968-4ebf-8048-a7650423d83b}", 'position').position;
    var SCANNER_ENTRY_ZONE = "{0da9b717-bbc0-423e-9ad0-c2c97b9f741c}";
    function onWebEventReceived(event) {
        if (event.type === 'eventBridgeReady') {
            findOrCreateCard();
        } else if (event.type === 'bingoNumberSelected') {
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
            Entities.callEntityServerMethod(SCANNER_ENTRY_ZONE, 'callBingo');
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
            }, 'avatar');
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

    // When the script starts up, setup AppUI and call `cacheSounds()`.
    // Also hook up necessary signals and open the app's UI.
    var ui;
    var AppUi = Script.require('appUi');
    var appPage = Script.resolvePath('ui/bingoCard_ui.html?13');
    function startup() {
        ui = new AppUi({
            buttonName: "BINGO",
            home: appPage,
            graphicsDirectory: Script.resolvePath("assets/icons/"),
            onOpened: onOpened,
            onClosed: onClosed,
            onMessage: onWebEventReceived,
            sortOrder: 1
        });
        cacheSounds();
        AvatarList.avatarSessionChangedEvent.connect(sessionChanged);
        ui.open();
    }

    // WHEN USER SESSION CHANGES: End this script so users will not be left with a card when leaving the domain
    function sessionChanged() {
        ScriptDiscoveryService.stopScript(Script.resolvePath('bingoCard_app.js?11'));
    }
    
    // When the script is shutting down, disconnect necessary signals and ensure onClosed() is called
    function onEnding() {
        AvatarList.avatarSessionChangedEvent.disconnect(sessionChanged);
        onClosed();
    }

    startup();
    Script.scriptEnding.connect(onEnding);
}());
