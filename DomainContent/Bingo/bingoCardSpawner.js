//
//  bingoCardSpawner.js
//
//  Created by Rebecca Stankus on 06/11/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* global EventBridge, AccountServices Script, Xform */

(function() {
    var GET_CARD_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoWish.wav"));
    var WAIT_TO_CLICK = 5000;

    var _this;

    var injector;
    var canClick = true;
    var appPage = Script.resolvePath('./card/card.html?010');

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
        preload: function(entityID){
            _this.entityID = entityID;
        },

        mousePressOnEntity: function(id, event) {
            if (event.isLeftButton && canClick) {
                canClick = false;
                _this.playSound(GET_CARD_SOUND, 0.2, true);
                if (!isRunningStandaloneBingoApp()) {
                    ScriptDiscoveryService.loadScript(Script.resolvePath('./card/card.js?010'));
                } else {
                    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
                    tablet.gotoWebScreen(appPage);
                }
                Script.setTimeout(function() {
                    canClick = true;
                }, WAIT_TO_CLICK);
            }
        },

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

        unload: function() {
            ScriptDiscoveryService.stopScript(Script.resolvePath('./card/card.js?010'));

        }
    };

    return new BingoCardSpawner();
});
