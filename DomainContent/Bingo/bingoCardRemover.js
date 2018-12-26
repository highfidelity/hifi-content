//
//  bingoCardRemover.js
//
//  Created by Rebecca Stankus on 06/11/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* global EventBridge, AccountServices Script, Xform */

(function() {

    var _this;

    var isRunningStandaloneBingoApp = function() {
        var isRunning = false;
        if (JSON.stringify(ScriptDiscoveryService.getRunning()).indexOf("card.js?000") !== -1) {
            isRunning = true;
        }
        return isRunning;
    };

    var BingoCardRemover = function() {
        _this = this;
    };

    BingoCardRemover.prototype = {
        preload: function(entityID){
            _this.entityID = entityID;
            if (isRunningStandaloneBingoApp) {
                ScriptDiscoveryService.stopScript(Script.resolvePath('./card/card.js?000'));
            }
        }
    };

    return new BingoCardRemover();
});
