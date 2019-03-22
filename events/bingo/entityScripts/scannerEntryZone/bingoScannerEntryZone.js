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

    var BingoScannerZone = function() {
        _this = this;
    };

    BingoScannerZone.prototype = {
        // Record the entity's ID
        preload: function(entityID) {
            _this.entityID = entityID;
        },
        
        // When the user enters the entry zone, tell the server script attached to this entity
        // someone has entered the entry zone.
        enterEntity: function() {
            Entities.callEntityServerMethod(_this.entityID, 'serverEnterEntity');
        },

        // When the user leaves the entry zone, tell the server script attached to this entity
        // someone has left the entry zone.
        leaveEntity: function(entityID, mouseEvent) {
            Entities.callEntityServerMethod(_this.entityID, 'serverLeaveEntity');
        }
    };
    
    return new BingoScannerZone();
});
