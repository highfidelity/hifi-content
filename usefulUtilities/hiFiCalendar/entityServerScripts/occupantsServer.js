//  occupantsServer.js
//
//  Created by Mark Brosche on 4/18/2019
//  Handed off to Milad Nazeri on 5-15-2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var CONFIG = Script.require("../calendarConfig.json?" + Date.now());
    var that;
    var CHANNEL = "HiFi.Calendar.Meeting.Occupants";
    
    this.remotelyCallable = [
        "enteredMeetingZone",
        "leftMeetingZone"
    ];


    // Grab the correct room information from the config and send a message to the meeting room to refresh the occupants
    this.preload = function(entityID) {
        that = this;
        that.entityID = entityID;
        that.entityProperties = Entities.getEntityProperties(that.entityID, ['userData']);

        try {
            that.userData = JSON.parse(that.entityProperties.userData);
            that.roomOccupantsListID = that.userData.roomOccupantsListID;
            that.meetingZoneID = that.userData.meetingZoneID;
        } catch (e) {
            console.log("Error: ", e);
        }

        that.room = {
            "occupants": {}
        };

        Entities.editEntity(that.entityID, {
            text: 'loading'
        });
        Messages.sendMessage(CHANNEL, JSON.stringify({
            type: "REFRESH OCCUPANTS",
            id: that.meetingZoneID
        }));
    };


    // Add the new name to our occupants list
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


    // Remove the name from our occupants list
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