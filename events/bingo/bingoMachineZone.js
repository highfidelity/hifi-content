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
    var WAIT_TO_DELETE_CARD_MS = 10000;

    var _this;
    var machineSpotlight;
    var mayEnterZone = true;
    var userName;

    var BingoMachineZone = function() {
        _this = this;
    };

    BingoMachineZone.prototype = {
        remotelyCallable: ['getNumbersFromServer'],

        /* ON LOADING THE SCRIPT: If the user is running the card app, stop the card app script to stop/close the app. */
        preload: function(entityID) {
            _this.entityID = entityID;
            userName = AccountServices.username;
            var machineZoneMarker = Entities.getEntityProperties(_this.entityID, 'parentID').parentID;
            Entities.getChildrenIDs(machineZoneMarker).forEach(function(child) {
                var name = Entities.getEntityProperties(child, 'name').name;
                if (name === "Bingo Machine Spotlight") {
                    machineSpotlight = child;
                }
            });
        },
        
        /* ON LOADING THE SCRIPT: If the user is running the card app, stop the card app script to stop/close the app. */
        enterEntity: function() {
            if (mayEnterZone) {
                mayEnterZone = false;
                Entities.findEntities(MyAvatar.position, 2).forEach(function(nearbyEntity) {
                    var properties = Entities.getEntityProperties(nearbyEntity, ['parentID', 'name']);
                    if (properties.name === "Bingo Confetti Particle" && properties.parentID === MyAvatar.sessionUUID) {
                        Entities.deleteEntity(nearbyEntity);
                    }
                });
                if (!Entities.getEntityProperties(machineSpotlight, 'visible').visible) {
                    Entities.callEntityServerMethod(_this.entityID, 'scanCard', [userName]);    
                }
            }
        },

        /* ON LEAVING THE ZONE: Call the zone's server method that handles a user leaving the zone and set a timeout to 
        delete the card in 10 seconds. This is to be sure there is enough time for the card to actually be created and 
        seen by others in the case of a user quickly entering the zone and stepping back out.  */
        leaveEntity: function(entityID, mouseEvent) {
            Entities.callEntityServerMethod(_this.entityID, 'userLeftZone', [userName]);
            Script.setTimeout(function() {
                mayEnterZone = true;
            }, WAIT_TO_DELETE_CARD_MS);
        }
    };
    
    return new BingoMachineZone();
});
