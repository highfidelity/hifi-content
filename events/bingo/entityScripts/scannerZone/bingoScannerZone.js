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


    var BingoScannerZone = function() {
        _this = this;
    };

    BingoScannerZone.prototype = {
        // On load, save a reference to this entity's ID.
        preload: function(entityID) {
            _this.entityID = entityID;
        },
        
        // When a user enters this zone entity, clear the user's bingo confetti particles (if any)
        // and call the `enterEntityServer` server method on this entity.
        enterEntity: function() {
            MyAvatar.getAvatarEntitiesVariant().forEach(function(avatarEntity) {
                var name = Entities.getEntityProperties(avatarEntity, 'name').name;
                if (name === "Bingo Confetti Particle") {
                    Entities.deleteEntity(avatarEntity.id);
                }
            });
            Entities.callEntityServerMethod(_this.entityID, 'enterEntityServer', [AccountServices.username]);
        },

        // When a user leaves this zone entity, call the `leaveEntityServer` server method on this entity.
        leaveEntity: function(entityID, mouseEvent) {
            Entities.callEntityServerMethod(_this.entityID, 'leaveEntityServer', [AccountServices.username]);
        }
    };
    
    return new BingoScannerZone();
});
