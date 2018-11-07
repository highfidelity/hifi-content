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

    function onClicked() { 
        if (open) {
            tablet.gotoHomeScreen();
            Entities.deleteEntity(playingMarker);
        } else {
            tablet.gotoWebScreen(appPage);
            var entitySpawnPosition = MyAvatar.position;
            var yPositionOverHead = entitySpawnPosition.y + 0.5 * MyAvatar.getHeight() + 0.1;
            entitySpawnPosition.y = yPositionOverHead;
            if (playingMarker) {
                Entities.deleteEntity(playingMarker);
            }
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
            print("Searching...");
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
                    if (searchRequest.response) {
                        var userNumbersToSplit = searchRequest.response.substring(2, searchRequest.response.length - 2);
                        userCardNumbers = userNumbersToSplit.split(",");
                        tablet.emitScriptEvent(JSON.stringify({
                            type : 'displayNumbers',
                            numbers: userCardNumbers
                        }));
                    }
                }
            };
            searchRequest.send();
        } else {
            Entities.deleteEntity(playingMarker);
        }
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
            }
        }
    }

    function appEnding() {
        Entities.deleteEntity(playingMarker);
        button.clicked.disconnect(onClicked);
        tablet.screenChanged.disconnect(onScreenChanged);
        tablet.webEventReceived.disconnect(onWebEventReceived);
        tablet.removeButton(button);
    }

    function sessionChanged() {
        ScriptDiscoveryService.stopScript(Script.resolvePath('card.js'));
    }

    button.clicked.connect(onClicked);
    tablet.screenChanged.connect(onScreenChanged);
    tablet.webEventReceived.connect(onWebEventReceived);
    Script.scriptEnding.connect(appEnding);
    AvatarList.avatarSessionChangedEvent.connect(sessionChanged);
}());
