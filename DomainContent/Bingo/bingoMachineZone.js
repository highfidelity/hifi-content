//
// bingoMachineZone.js
// Created by Rebecca Stankus on 10/24/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
/* global AccountServices */

(function() {
    var WAIT_TO_DELETE_CARD = 10000;
    var SEARCH_RADIUS = 200;

    var _this;
    var machineSpotlight;
    var mayEnterZone = true;
    var userName;
    var wheel;
    var BingoMachineZone = function() {
        _this = this;
    };

    BingoMachineZone.prototype = {
        remotelyCallable: ['getNumbersFromServer'],
        preload: function(entityID) {
            _this.entityID = entityID;
            userName = AccountServices.username;
            var properties = Entities.getEntityProperties(_this.entityID, ['userData', 'parentID', 'position']);
            var position = properties.position;
            Entities.findEntities(position, SEARCH_RADIUS).forEach(function(nearbyEntity) {
                var name = Entities.getEntityProperties(nearbyEntity, 'name').name;
                if (name === "Bingo Wheel") {
                    wheel = nearbyEntity;
                }
            });
        },
        
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
                    Entities.callEntityServerMethod(_this.entityID, 'scanCard', [userName, wheel]);    
                }
            }
        },

        leaveEntity: function(entityID, mouseEvent) {
            Entities.callEntityServerMethod(_this.entityID, 'userLeftZone', [userName]);
            Script.setTimeout(function() {
                mayEnterZone = true;
            }, WAIT_TO_DELETE_CARD);
        },

        unload: function(entityID) {
        }
    };
    
    return new BingoMachineZone();
});
