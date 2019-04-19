//  meetingRoomOccupantsServer.js
//
//  Created by Mark Brosche on 4/18/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var that;
    var CHANNEL = "HiFi.Meeting.Occupants";

    this.remotelyCallable = [
        "enteredMeetingZone",
        "leftMeetingZone"
    ];


    this.preload = function(entityID) {
        that = this;
        that.entityID = entityID;
        that.entityProperties = Entities.getEntityProperties(that.entityID, ['userData', 'name']);
        var userData;
        if (that.entityProperties.userData.length !== 0) {
            try {
                userData = JSON.parse(that.entityProperties.userData);
            } catch (e) {
                console.log(e, "Could not parse userData");
                return;
            }
        } else {
            console.log("Please enter appropriate userData to enable functionality of this server script.");
            return;
        }
        that.meetingZoneID = userData.meetingZoneID;
        that.roomOccupantListID = userData.roomOccupantListID; 
        that.room = {
            "occupants": []
        };
        Entities.editEntity(that.entityID, {
            text: 'loading'
        });
        Messages.sendMessage(CHANNEL, JSON.stringify({
            type: "REFRESH OCCUPANTS",
            id: that.meetingZoneID
        }));
    };


    this.enteredMeetingZone = function(id, params) {
        if (that.entityID === id) {    
            var uuid = params[0];
            var displayName = params[1];

            that.room.occupants[uuid] = displayName;
            var text = Object.keys(that.room.occupants).map(function(key) {
                return that.room.occupants[key];
            });
            Entities.editEntity(id, {
                "text": text.join("\n"), 
                "textColor": [255, 255, 255]
            });
        }
    };  


    this.leftMeetingZone = function(id, params) {
        if (that.entityID === id) {    

            var uuid = params[0];

            if (uuid in that.room.occupants) {
                delete that.room.occupants[uuid];
            }
            var text = Object.keys(that.room.occupants).map(function(key) {
                return that.room.occupants[key];
            });
            Entities.editEntity(id, {
                "text": text.join("\n"), 
                "textColor": [255, 255, 255]
            });
        }
    };  
    

});