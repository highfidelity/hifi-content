//
// bingoScannerEntryZone.js
// Created by Rebecca Stankus on 10/24/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
/* global AccountServices, Entities, MyAvatar, Script */

(function() {
    var _this;

    var SCANNER_ENTRY_GATE = "{e47e5730-4aff-465e-bccc-9ed04c163f3b}";

    var scannerSpotlight;
    var hasCalledBingo = false;

    var BingoScannerZone = function() {
        _this = this;
    };

    BingoScannerZone.prototype = {
        remotelyCallable: ['callBingo'],

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

        /* ON LEAVING THE ZONE: Call the entry gate's server method that closes the gate. */
        leaveEntity: function(entityID, mouseEvent) {
            Entities.callEntityServerMethod(SCANNER_ENTRY_GATE, 'closeGate');
        }
    };
    
    return new BingoScannerZone();
});
