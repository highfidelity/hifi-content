//
// card.js
// Created by Liv Erickson on 10/24/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
/* globals AccountServices */

(function(){
    var TABLET_BUTTON_IMAGE = Script.resolvePath('../assets/icons/bingo-i.svg');
    var TABLET_BUTTON_PRESSED = Script.resolvePath('../assets/icons/bingo-a.svg');
    var WIN_SOUND = SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoWin.wav"));
    var SELECT_SOUND = SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoSelect.wav"));
    var DESELECT_SOUND = SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoDeselect.wav"));
    var WINNER_AUDIO_VOLUME = 0.2;
    var BINGO_STRING = "BINGO";
    var WAIT_TO_DELETE_PARTICLE = 3000;
    var WAIT_TO_STOP_PARTICLE = 1000;
    var COLUMN_RANGE = 15;
    var WAIT_TO_SEND_NUMBERS = 1000;

    var headerSounds = [];
    var currentHeaderSounds = [];
    var injector;
    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
    var appPage = Script.resolvePath('card.html?010');
    var button = tablet.addButton({
        text: 'BINGO',
        icon: TABLET_BUTTON_IMAGE,
        activeIcon: TABLET_BUTTON_PRESSED
    });
    var open = false;
    var playingMarker;
    var userName = AccountServices.username;
    var userCardNumbers = [];
    var spreadsheetURL = "https://script.google.com/macros/s/AKfycbzFuuJ30c_qUZmBB8PnjLtunaJx1VbhSRFjsy_6wocR2_p7wohJ/exec";
    var confettiParticle;
    var rowMinimum;

    function onClicked() { 
        if (open) {
            tablet.gotoHomeScreen();
            if (playingMarker) {
                Entities.deleteEntity(playingMarker);
                playingMarker = null;
            }
            if (confettiParticle) {
                Entities.deleteEntity(confettiParticle);
                confettiParticle = null;
            }
        } else {
            tablet.gotoWebScreen(appPage);
            createGem();
        }
    }

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
            modelURL: "https://hifi-content.s3.amazonaws.com/alan/dev/gem-overlay.fbx",
            type: "Model",
            userData: "{ \"grabbableKey\": { \"grabbable\": false } }"
        }, true);
    }

    function contains(array, number) {
        for (var i = 0 ; i < array.length; i++) {
            if (array[i] === number) {
                return true;
            }
        }
        return false;
    }

    function getRandomSound() {
        var newSoundIndex = Math.floor(Math.random() * headerSounds.length);
        var newSound = headerSounds[newSoundIndex];
        if (!contains(currentHeaderSounds, newSound)) {
            currentHeaderSounds.push(newSound);
            return newSound;
        }
        return getRandomSound();
    }

    function loadSounds() {
        headerSounds.push(SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoCat.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoDog.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoPlinks.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoPianoPlinks.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoBomb.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoSqueak.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoChatter.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoClang.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoGiggles.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoSplash.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoWaHaHa.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoFall.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoTwinkle.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoPopUp.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoWhistle.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoBubbles.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoHarp.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoKazoo.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoVibration.wav")));
        headerSounds.push(SoundCache.getSound(Script.resolvePath("../assets/sounds/bingoSpiral.wav")));
        
        for (var i = 0; i < BINGO_STRING.length; i++) {
            getRandomSound();
        }
    
    }

    function encodeURLParams(params) {
        var paramPairs = [];
        for (var key in params) {
            paramPairs.push(key + "=" + params[key]);
        }
        return paramPairs.join("&");
    }

    function onScreenChanged(type, url) {
        open = (url === appPage);
        button.editProperties({isActive: open});

        if (open) {
            loadSounds();
            findOrCreateCard();
        } else {
            if (playingMarker) {
                Entities.deleteEntity(playingMarker);
                playingMarker = null;
            }
            if (confettiParticle) {
                Entities.deleteEntity(confettiParticle);
                confettiParticle = null;
            }
        }
    }

    function findOrCreateCard() {
        var searchParamString = encodeURLParams({
            type: "search",
            username: userName
        });
        var searchRequest = new XMLHttpRequest();
        searchRequest.open('GET', spreadsheetURL + "?" + searchParamString);
        searchRequest.timeout = 10000;
        searchRequest.ontimeout = function() {
            print("bingo: request timed out");
        };
        searchRequest.onreadystatechange = function() { 
            if (searchRequest.readyState === 4) {
                if (searchRequest.response === "New username") {
                    createCard(true);
                } else if (searchRequest.response) {
                    var userNumbersToSplit = searchRequest.response.substring(2, searchRequest.response.length - 2);
                    userCardNumbers = userNumbersToSplit.split(",");
                }
                Script.setTimeout(function() {
                    tablet.emitScriptEvent(JSON.stringify({
                        type : 'displayNumbers',
                        numbers: userCardNumbers
                    }));
                }, WAIT_TO_SEND_NUMBERS);
            }
        };
        searchRequest.send();
    }

    function playSound(sound, volume, localOnly){
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
            }
            injector = Audio.playSound(sound, {
                position: MyAvatar.position,
                volume: volume,
                localOnly: localOnly
            });
        }
    }

    function onWebEventReceived(event) {
        if (typeof event === 'string') {
            event = JSON.parse(event);
            if (event.type === 'playSoundFromBingoButton') {
                if (event.index > -1) {
                    playSound(currentHeaderSounds[event.index], 0.1, false);
                } else if (event.index === -2) {
                    playSound(SELECT_SOUND, 0.1, false);
                } else if (event.index === -3) {
                    playSound(DESELECT_SOUND, 0.1, false);
                }
            }
            if (event.type === 'calledBingo') {
                playSound(WIN_SOUND, WINNER_AUDIO_VOLUME, false);
                if (confettiParticle) {
                    Entities.deleteEntity(confettiParticle);
                }
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
                    textures: "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/sprite-confetti.jpg",
                    type: "ParticleEffect",
                    serverScripts: "http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/BongoBingo/particleServer.js",
                    userData: "{\"grabbableKey\":{\"grabbable\":false}}"
                }, true);
                Script.setTimeout(function() {
                    Entities.editEntity(confettiParticle, { emitRate: 0 });
                    Script.setTimeout(function() {
                        Entities.deleteEntity(confettiParticle);
                        confettiParticle = null;
                    }, WAIT_TO_DELETE_PARTICLE);
                }, WAIT_TO_STOP_PARTICLE);
            }
        }
    }

    function appEnding() {
        if (playingMarker) {
            Entities.deleteEntity(playingMarker);
            playingMarker = null;
        }
        if (confettiParticle) {
            Entities.deleteEntity(confettiParticle);
            confettiParticle = null;
        }
        button.clicked.disconnect(onClicked);
        tablet.screenChanged.disconnect(onScreenChanged);
        tablet.webEventReceived.disconnect(onWebEventReceived);
        tablet.removeButton(button);
        tablet.gotoHomeScreen();
    }

    function sessionChanged() {
        ScriptDiscoveryService.stopScript(Script.resolvePath('card.js?010'));
        tablet.gotoHomeScreen();
    }

    function createCard() {
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

    function getRandomNumber() {
        var randomNumber = Math.floor(Math.random() * Number(COLUMN_RANGE) + Number(rowMinimum));
        if (!contains(userCardNumbers, randomNumber)) {
            userCardNumbers.push(randomNumber);
            return randomNumber;
        }
        return getRandomNumber();
    }

    function storeUser() {
        var addParamString = encodeURLParams({
            type: "add",
            username: userName,
            cardNumbers: JSON.stringify(userCardNumbers)
        });
        var addRequest = new XMLHttpRequest();
        addRequest.open('GET', spreadsheetURL + "?" + addParamString);
        addRequest.timeout = 10000;
        addRequest.ontimeout = function() {
            print("bingo: request timed out");
        };
        addRequest.send();
    }

    tablet.gotoWebScreen(appPage);
    createGem();
    button.clicked.connect(onClicked);
    tablet.screenChanged.connect(onScreenChanged);
    tablet.webEventReceived.connect(onWebEventReceived);
    Script.scriptEnding.connect(appEnding);
    AvatarList.avatarSessionChangedEvent.connect(sessionChanged);
}());
