//
//  bingoCardRemover.js
//
//  Created by Rebecca Stankus on 06/11/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* global ScriptDiscoveryService */

(function() {

    var _this;

    /* CHECK IF A USER IS RUNNING THE CARD APP: Get a list of running scripts usingg the script discovery service API. 
    Search that list for the card app script and return whether or not it was found */
    var isRunningStandaloneBingoApp = function() {
        var isRunning = false;
        if (JSON.stringify(ScriptDiscoveryService.getRunning()).indexOf("bingoCard_app.js?5") !== -1) {
            isRunning = true;
        }
        return isRunning;
    };

    var BingoCardRemover = function() {
        _this = this;
    };

    BingoCardRemover.prototype = {
        /* ON LOADING THE SCRIPT: If the user is running the card app, stop the card app script to stop/close the app. */
        preload: function(entityID){
            _this.entityID = entityID;
            if (isRunningStandaloneBingoApp) {
                ScriptDiscoveryService.stopScript(Script.resolvePath('../../bingoCardApp/bingoCard_app.js?5'));
            }
        }
    };

    return new BingoCardRemover();
});
