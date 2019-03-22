//
// bingoPrizeDoorZone.js
// Created by Zach Fox on 2019-01-21
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function() {
    var _this;
    var prizeDoorNumber = false;

    var BINGO_WHEEL_ID = "{57e5e385-3968-4ebf-8048-a7650423d83b}";

    var BingoPrizeDoorZone = function() {
        _this = this;
    };

    BingoPrizeDoorZone.prototype = {
        remotelyCallable: ['openWinnerApp'],

        /* ON LOADING THE SCRIPT: Save a reference to this. Also get `prizeDoorNumber`. */
        preload: function(entityID) {
            _this.entityID = entityID;

            // Properly setting `prizeDoorNumber` relies on the Zone names being:
            // Bingo Prize Door Zone <door number in single-digit format>
            var entityName = Entities.getEntityProperties(entityID, ['name']).name;
            prizeDoorNumber = parseInt(entityName.substr(-1));
        },
        
        /* ON ENTERING THE ZONE: Call the Bingo Wheel's server method to add the avatar's username
        to that prize zone's avatar list */
        enterEntity: function() {
            if (prizeDoorNumber) {
                var data = {
                    "username": AccountServices.username,
                    "sessionUUID": MyAvatar.sessionUUID,
                    "prizeDoorNumber": prizeDoorNumber,
                    "isAdding": true
                };

                Entities.callEntityServerMethod(BINGO_WHEEL_ID, 'addOrRemovePrizeZoneAvatar', [JSON.stringify(data)]);
            }
        },

        /* ON LEAVING THE ZONE: Call the Bingo Wheel's server method to remove the avatar's username
        from that prize zone's avatar list */
        leaveEntity: function(entityID, mouseEvent) {
            if (prizeDoorNumber) {
                var data = {
                    "username": AccountServices.username,
                    "sessionUUID": MyAvatar.sessionUUID,
                    "prizeDoorNumber": prizeDoorNumber,
                    "isAdding": false
                };

                Entities.callEntityServerMethod(BINGO_WHEEL_ID, 'addOrRemovePrizeZoneAvatar', [JSON.stringify(data)]);
            }
        },

        openWinnerApp: function(id, args) {
            var WINNER_APP_NAME = "bingoWinner_app.js";
            var WINNER_APP_URL = Script.resolvePath("../../bingoWinnerApp/" + WINNER_APP_NAME);
            var currentlyRunningScripts = ScriptDiscoveryService.getRunning();
            
            currentlyRunningScripts.forEach(function(scriptObject) {
                if (scriptObject.url.indexOf(WINNER_APP_NAME) > -1) {
                    ScriptDiscoveryService.stopScript(scriptObject.url);
                }
            });

            ScriptDiscoveryService.loadScript(WINNER_APP_URL);
        }
    };
    
    return new BingoPrizeDoorZone();
});
