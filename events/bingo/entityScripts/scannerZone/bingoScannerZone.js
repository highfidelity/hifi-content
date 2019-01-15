//
// bingoMachineZone.js
// Created by Rebecca Stankus on 10/24/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
/* global AccountServices, Entities, MyAvatar, Script */

(function() {
    var _this;
    var userName;

    var BingoScannerZone = function() {
        _this = this;
    };

    BingoScannerZone.prototype = {
        remotelyCallable: ['getNumbersFromServer', 'callBingo'],

        /* ON LOADING THE SCRIPT: If the user is running the card app, stop the card app script to stop/close the app. */
        preload: function(entityID) {
            _this.entityID = entityID;
            userName = AccountServices.username;
        },
        
        /* ON ENTERING THE ZONE: If the user is running the card app, stop the card app script to stop/close the app. */
        enterEntity: function() {
            Entities.findEntities(MyAvatar.position, 2).forEach(function(nearbyEntity) {
                var properties = Entities.getEntityProperties(nearbyEntity, ['parentID', 'name']);
                if (properties.name === "Bingo Confetti Particle" && properties.parentID === MyAvatar.sessionUUID) {
                    Entities.deleteEntity(nearbyEntity);
                }
            });
            Entities.callEntityServerMethod(_this.entityID, 'scanCard', [userName]);
        },

        /* ON LEAVING THE ZONE: Call the zone's server method that handles a user leaving the zone and set a timeout to 
        delete the card in 10 seconds. This is to be sure there is enough time for the card to actually be created and 
        seen by others in the case of a user quickly entering the zone and stepping back out.  */
        leaveEntity: function(entityID, mouseEvent) {
            Entities.callEntityServerMethod(_this.entityID, 'userLeftZone', [userName]);
        }
    };
    
    return new BingoScannerZone();
});
