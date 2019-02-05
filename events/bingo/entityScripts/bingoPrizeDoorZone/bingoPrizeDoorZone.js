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
                    "prizeDoorNumber": prizeDoorNumber,
                    "isAdding": false
                };

                Entities.callEntityServerMethod(BINGO_WHEEL_ID, 'addOrRemovePrizeZoneAvatar', [JSON.stringify(data)]);
            }
        }
    };
    
    return new BingoPrizeDoorZone();
});
