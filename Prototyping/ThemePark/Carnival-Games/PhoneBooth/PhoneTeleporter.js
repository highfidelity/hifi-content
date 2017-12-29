//
//  PhoneTeleporter.js
//
//  Created by Liv Erickson on 12/11/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
(function(){
    var MESSAGE_CHANNEL = "RingRingRingRingRingRingRingBananaPhone";
    var TELEPORTER_CHANNEL = "UnleashTheTeleporter";
    var TELEPORTER_LOCATION = "hifi://dev-content";
    var TIMEOUT = 10000;

    var _entityID;
    var numMessages = 0;
    var teleportZone;

    var TELEPORTER_ON = {href: TELEPORTER_LOCATION};
    var TELEPORTER_OFF = {href: "hifi://"};

    var PhoneTeleporter = function(){

    };

    PhoneTeleporter.prototype = {
        preload: function(entityID){
            _entityID = entityID;
            Messages.subscribe(MESSAGE_CHANNEL);
            Messages.subscribe(TELEPORTER_CHANNEL);
            Messages.messageReceived.connect(function(channel, message, sender){
                if (channel === MESSAGE_CHANNEL){
                    if (numMessages < 3) {
                        numMessages++; 
                    } else {
                        numMessages = 0;
                        tempPortal();
                    }
                }
            });
        },
        unload: function(){
            Messages.unsubscribe(MESSAGE_CHANNEL);
        }

    };

    var removePortal = function() {
        Entities.editEntity(_entityID, TELEPORTER_OFF);        
    };

    var tempPortal = function(){
        Entities.editEntity(teleportZone, TELEPORTER_ON);
        Messages.sendMessage(TELEPORTER_CHANNEL, "Enable Teleport Mode");
        Script.setTimeout(removePortal, TIMEOUT);
    };

    return new PhoneTeleporter();
});