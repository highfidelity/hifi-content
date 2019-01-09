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

    var injector;
    var canClick = true;
    var appPage = Script.resolvePath('./card/card.html');

    /* CHECK IF A USER IS RUNNING THE CARD APP: Get a list of running scripts usingg the script discovery service API. 
    Search that list for the card app script and return whether or not it was found */
    var isRunningStandaloneBingoApp = function() {
        var isRunning = false;
        if (JSON.stringify(ScriptDiscoveryService.getRunning()).indexOf("card.js") !== -1) {
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
                _this.playSound(GET_CARD_SOUND, 0.2, true);
                if (!isRunningStandaloneBingoApp()) {
                    ScriptDiscoveryService.loadScript(Script.resolvePath('./card/card.js'));
                } else {
                    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
                    tablet.gotoWebScreen(appPage);
                }
                Script.setTimeout(function() {
                    canClick = true;
                }, WAIT_TO_CLICK_MS);
            }
        },

        /* PLAY A SOUND: If a sound is already playing via this script injector, stop it. Then, play the specified 
        sound at specified volume and localOnly attributes. */
        playSound: function(sound, volume, localOnly) {
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
        },

        /* ON UNLOADING THE APP:  Close the card app by stopping its script. */
        unload: function() {
            ScriptDiscoveryService.stopScript(Script.resolvePath('./card/card.js'));
        }
    };

    return new BingoCardSpawner();
});
