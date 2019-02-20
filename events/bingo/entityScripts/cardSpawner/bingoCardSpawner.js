//
//  bingoCardSpawner.js
//
//  Created by Rebecca Stankus on 06/11/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* global Audio, Script, ScriptDiscoveryService, SoundCache */

(function() {
    var GET_CARD_SOUND = SoundCache.getSound(Script.resolvePath("sounds/bingoWish.wav"));
    var WAIT_TO_CLICK_MS = 5000;

    var _this;

    var debounceTimer = false;
    var appPage = Script.resolvePath('../../bingoCardApp/ui/bingoCard_ui.html?12');
    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************

    /* PLAY A SOUND: Plays the specified sound at the position of the user's Avatar using the specified volume */
    var injector;
    var audioVolume = 0.2;
    function playSound(sound) {
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
            }
            injector = Audio.playSound(sound, {
                position: MyAvatar.position,
                volume: audioVolume,
                localOnly: true
            });
        }
    }

    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    /* CHECK IF A USER IS RUNNING THE CARD APP: Get a list of running scripts using the script discovery service API. 
    Search that list for the card app script and return whether or not it was found */
    var isRunningStandaloneBingoApp = function() {
        var isRunning = false;
        if (JSON.stringify(ScriptDiscoveryService.getRunning()).indexOf("bingoCard_app.js?11") !== -1) {
            isRunning = true;
        }
        return isRunning;
    };

    var BingoCardSpawner = function() {
        _this = this;
    };

    BingoCardSpawner.prototype = {
        /* ON LOADING THE SCRIPT: Save a reference to this entity ID */
        preload: function(entityID) {
            _this.entityID = entityID;
        },

        /* WHEN THE SCRIPT IS STOPPED: If `debounceTimer` is defined, stop that timer. */
        unload: function() {
            if (debounceTimer) {
                Script.clearTimeout(debounceTimer);
                debounceTimer = false;
            }
        },

        // When a user left-clicks this entity, AND they haven't clicked it recently:
        // - Play a sound
        // - Check if the user is running the Bingo card script
        //     - If they are, load the app's UI
        //     - If they aren't, load the Bingo card script
        // - Start the debounce timer to prevent a user from clicking on the sign too quickly
        mousePressOnEntity: function(id, event) {
            if (event.isLeftButton && !debounceTimer) {
                playSound(GET_CARD_SOUND);
                if (!isRunningStandaloneBingoApp()) {
                    ScriptDiscoveryService.loadScript(Script.resolvePath('../../bingoCardApp/bingoCard_app.js?11'));
                } else {
                    var cardAppIsOpen = tablet.isPathLoaded(appPage);
                    if (!cardAppIsOpen) {
                        tablet.gotoWebScreen(appPage);
                    }
                }
                debounceTimer = Script.setTimeout(function() {
                    debounceTimer = false;
                }, WAIT_TO_CLICK_MS);
            }
        }
    };

    return new BingoCardSpawner();
});
