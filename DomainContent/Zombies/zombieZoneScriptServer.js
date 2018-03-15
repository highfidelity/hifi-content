//
//  zombieZoneScriptServer.js
//
//  This script serves as a virtual bouncer depending on whether or not a client can validate
//  ownership of a particular specified avatar entity.
//
//  Copyright 2017 High Fidelity, Inc.
//
//  Usage: Set up userdata on the zone with the following structure:
//
//  { "marketplaceID" : marketplaceID1, "rejectTeleportLocation:" : hifiAddress }
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* globals Entities, Wallet, Window*/

(function(){
    var TEAM_CONTROL_CHANNEL = "TEAM_CONTROL_CHANNEL";
    
    var _this; 
    
    var ProtectedZone = function() {
        _this = this;
    };
    
    var updateTeamControl = function (channel, message, senderID)  {
        var messageData = JSON.parse(message);
        var userDataProperties = JSON.parse(Entities.getEntityProperties(_this.entityID, 'userData').userData);
        userDataProperties.marketplaceID = messageData['marketplaceID'];
        Entities.editEntity(_this.entityID, {locked: false});
        Entities.editEntity(_this.entityID, {
            userData: JSON.stringify(userDataProperties)
        });
        Entities.editEntity(_this.entityID, {locked: true});
        print("updateTeamControl - marketplaceID updated to " + userDataProperties.marketplaceID);
    };

    ProtectedZone.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            Messages.subscribe(TEAM_CONTROL_CHANNEL);
            Messages.messageReceived.connect(updateTeamControl);
        },
        unload: function() {
            Messages.unsubscribe(TEAM_CONTROL_CHANNEL);
            Messages.messageReceived.disconnect(updateTeamControl);
        }
    };

    return new ProtectedZone();
});
