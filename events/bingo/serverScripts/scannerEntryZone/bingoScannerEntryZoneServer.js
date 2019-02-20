//
// bingoScannerEntryZoneServer.js
// Created by Zach Fox on 2019-02-20
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
/* global AccountServices, Entities, MyAvatar, Script */

(function() {
    var _this;

    var SCANNER_ENTRY_GATE = "{e47e5730-4aff-465e-bccc-9ed04c163f3b}";

    var someoneHasCalledBingo = false;

    var BingoScannerZone = function() {
        _this = this;
    };

    BingoScannerZone.prototype = {
        remotelyCallable: ['callBingo', 'serverEnterEntity', 'serverLeaveEntity'],

        // Record the entity's ID
        preload: function(entityID) {
            _this.entityID = entityID;
        },

        // Set the flag that someone has called Bingo to TRUE
        callBingo: function() {
            someoneHasCalledBingo = true;
        },
        
        // When a user enters the scanner entry zone:
        // If the `someoneHasCalledBingo` flag is true and nobody else is in the scanner,
        // let the player in and set `someoneHasCalledBingo` to `false`
        serverEnterEntity: function() {
            if (someoneHasCalledBingo) {
                Entities.callEntityServerMethod(SCANNER_ENTRY_GATE, 'openGate');
                someoneHasCalledBingo = false;
            }
        },

        // When a user leaves the entry zone, close the gate that allows entry into the scanner.
        serverLeaveEntity: function(entityID, mouseEvent) {
            Entities.callEntityServerMethod(SCANNER_ENTRY_GATE, 'closeGate');
        }
    };
    
    return new BingoScannerZone();
});
