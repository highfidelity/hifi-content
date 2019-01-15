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

    var SCANNER_ENTRY_GATE = "{2d426ca6-d335-4b1f-a430-8f2b02896a5e}";

    var scannerSpotlight;
    var hasCalledBingo = false;

    var BingoScannerZone = function() {
        _this = this;
    };

    BingoScannerZone.prototype = {
        remotelyCallable: ['getNumbersFromServer', 'callBingo'],

        /* ON LOADING THE SCRIPT: If the user is running the card app, stop the card app script to stop/close the app. */
        preload: function(entityID) {
            _this.entityID = entityID;
            var scannerEntryZoneMarker = Entities.getEntityProperties(_this.entityID, 'parentID').parentID;
            var scannerZoneMarker = Entities.getEntityProperties(scannerEntryZoneMarker, 'parentID').parentID;
            Entities.getChildrenIDs(scannerZoneMarker).forEach(function(child) {
                var name = Entities.getEntityProperties(child, 'name').name;
                if (name === "Bingo Scanner Spotlight") {
                    scannerSpotlight = child;
                }
            });
        },

        callBingo: function() {
            hasCalledBingo = true;
        },
        
        /* ON ENTERING THE ZONE: If the user is running the card app, stop the card app script to stop/close the app. */
        enterEntity: function() {
            var scannerIsOccupied = Entities.getEntityProperties(scannerSpotlight, 'visible').visible;
            if (hasCalledBingo && !scannerIsOccupied) {
                hasCalledBingo = false;
                Entities.callEntityServerMethod(SCANNER_ENTRY_GATE, 'openGate');
            }
        },

        /* ON LEAVING THE ZONE: Call the zone's server method that handles a user leaving the zone and set a timeout to 
        delete the card in 10 seconds. This is to be sure there is enough time for the card to actually be created and 
        seen by others in the case of a user quickly entering the zone and stepping back out.  */
        leaveEntity: function(entityID, mouseEvent) {
            Entities.callEntityServerMethod(SCANNER_ENTRY_GATE, 'closeGate');
        }
    };
    
    return new BingoScannerZone();
});
