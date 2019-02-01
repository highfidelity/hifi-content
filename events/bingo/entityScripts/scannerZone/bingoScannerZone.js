//
// bingoScannerZone.js
// Created by Rebecca Stankus on 10/24/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
/* global AccountServices, Entities, MyAvatar, Script */

(function() {
    var _this;

    var CONFETTI_PARTICLE_SEARCH_M = 2;
    var SEND_STILL_OCCUPIED_MS = 1000;

    var stillOccupiedInterval = null;

    var BingoScannerZone = function() {
        _this = this;
    };

    BingoScannerZone.prototype = {
        /* ON LOADING THE SCRIPT: Save a reference to this. */
        preload: function(entityID) {
            _this.entityID = entityID;
        },
        
        /* ON ENTERING THE ZONE: Remove confetti particles if necessary and call server to scan card. */
        enterEntity: function() {
            Entities.findEntities(MyAvatar.position, CONFETTI_PARTICLE_SEARCH_M).forEach(function(nearbyEntity) {
                var properties = Entities.getEntityProperties(nearbyEntity, ['parentID', 'name']);
                if (properties.name === "Bingo Confetti Particle" && properties.parentID === MyAvatar.sessionUUID) {
                    Entities.deleteEntity(nearbyEntity);
                }
            });
            Entities.callEntityServerMethod(_this.entityID, 'scanCard', [AccountServices.username]);
            if (stillOccupiedInterval) {
                Script.clearInterval(stillOccupiedInterval);
                stillOccupiedInterval = false;
            }
            stillOccupiedInterval = Script.setInterval(function() {
                Entities.callEntityServerMethod(_this.entityID, 'stillOccupied');
            }, SEND_STILL_OCCUPIED_MS);
        },

        /* ON LEAVING THE ZONE: Call the zone's server method that handles a user leaving the zone. */
        leaveEntity: function(entityID, mouseEvent) {
            Entities.callEntityServerMethod(_this.entityID, 'userLeftZone', [AccountServices.username]);
            if (stillOccupiedInterval) {
                Script.clearInterval(stillOccupiedInterval);
                stillOccupiedInterval = false;
            }
        },

        /* ON UNLOADING SCRIPT: Check that interval is cleared */
        unload: function() {
            if (stillOccupiedInterval) {
                Script.clearInterval(stillOccupiedInterval);
                stillOccupiedInterval = false;
            }
        }
    };
    
    return new BingoScannerZone();
});
