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
    var GET_CARD_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoWish.wav"));
    var WAIT_TO_CLICK_MS = 5000;

    var _this;

    var canClick = true;
    var appPage = Script.resolvePath('../../bingoCardApp/bingoCard_ui.html');
    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************

    /* PLAY A SOUND: Plays the specified sound at the position of the user's Avatar using the volume and playback 
    mode requested. */
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

    /* CHECK IF A USER IS RUNNING THE CARD APP: Get a list of running scripts usingg the script discovery service API. 
    Search that list for the card app script and return whether or not it was found */
    var isRunningStandaloneBingoApp = function() {
        var isRunning = false;
        if (JSON.stringify(ScriptDiscoveryService.getRunning()).indexOf("bingoCard_app.js?0") !== -1) {
            isRunning = true;
        }
        return isRunning;
    };

    var BingoCardSpawner = function() {
        _this = this;
    };

    BingoCardSpawner.prototype = {

        /* ON LOADING THE APP: Save a reference to this entity ID */
        preload: function(entityID){
            _this.entityID = entityID;
        },

        /* WHEN A USER MOUSE CLICKS THIS ENTITY:  If it was left click and the user has not clicked it within the last 
        5 seconds, play the sound for getting a card, and if the user is not running the card script, load it. If they 
        are already running the script, go to the app page on the tablet. */
        mousePressOnEntity: function(id, event) {
            if (event.isLeftButton && canClick) {
                canClick = false;
                playSound(GET_CARD_SOUND);
                if (!isRunningStandaloneBingoApp()) {
                    ScriptDiscoveryService.loadScript(Script.resolvePath('../../bingoCardApp/bingoCard_app.js?0'));
                } else {
                    var cardAppIsOpen = tablet.isPathLoaded(appPage);
                    if (!cardAppIsOpen) {
                        tablet.gotoWebScreen(appPage);
                    }
                }
                Script.setTimeout(function() {
                    canClick = true;
                }, WAIT_TO_CLICK_MS);
            }
        },

        /* ON UNLOADING THE APP:  Close the card app by stopping its script. */
        unload: function() {
            ScriptDiscoveryService.stopScript(Script.resolvePath('../../bingoCardApp/bingoCard_app.js?0'));
        }
    };

    return new BingoCardSpawner();
});
