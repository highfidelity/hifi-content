//  occupantsServer.js
//
//  Created by Mark Brosche on 4/18/2019
//  Handed off to Milad Nazeri on 5-15-2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var that;
    var CHANNEL = "HiFi.Calendar.Meeting.Occupants";
    var DEBUG = false;

    
    this.remotelyCallable = [
        "enteredMeetingZone",
        "leftMeetingZone",
        "onHeartbeatRequestReplyReceived"
    ];


    this.maybeDeleteHeartbeatTimer = function(uuid) {
        if (heartbeatTimers[uuid]) {
            if (DEBUG) {
                console.log("occupantsServer.js: Clearing heartbeat timeout for UUID " + uuid);
            }
            Script.clearTimeout(heartbeatTimers[uuid]);
            delete heartbeatTimers[uuid];
        }
    };


    var heartbeatTimers = {};
    var HEARTBEAT_TIMEOUT_MS = 10000;
    this.restartHeartbeatTimer = function(uuid, meetingRoomZoneID) {
        that.maybeDeleteHeartbeatTimer(uuid);

        if (DEBUG) {
            console.log("occupantsServer.js: Restarting heartbeat timeout for UUID " + uuid);
        }
        heartbeatTimers[uuid] = Script.setTimeout(function() {
            if (DEBUG) {
                console.log("occupantsServer.js: " + that.room.occupants[uuid] + " with UUID " + uuid + " didn't respond to the heartbeat in time!");
            }
            delete heartbeatTimers[uuid];
            that.leftMeetingZone(that.entityID, [uuid]);
        }, HEARTBEAT_TIMEOUT_MS);
        Entities.callEntityClientMethod(uuid, meetingRoomZoneID, "onHeartbeatRequestReceived", [that.entityID]);
    };


    var WAIT_BEFORE_NEXT_HEARTBEAT_TIMEOUT_MS = HEARTBEAT_TIMEOUT_MS;
    this.onHeartbeatRequestReplyReceived = function(id, params) {
        var uuid = params[0];
        var meetingRoomZoneID = params[1];

        that.maybeDeleteHeartbeatTimer(uuid);

        if (DEBUG) {
            console.log("occupantsServer.js: Heartbeat reply received for UUID " + uuid +
                "! Restarting heartbeat timeout in " + WAIT_BEFORE_NEXT_HEARTBEAT_TIMEOUT_MS + "ms...");
        }

        heartbeatTimers[uuid] = Script.setTimeout(function() {
            that.restartHeartbeatTimer(uuid, meetingRoomZoneID);
        }, WAIT_BEFORE_NEXT_HEARTBEAT_TIMEOUT_MS);
    };


    // Grab the correct room information from the config and send a message to the meeting room to refresh the occupants
    this.preload = function(entityID) {
        that = this;
        that.entityID = entityID;
        that.entityProperties = Entities.getEntityProperties(that.entityID, ['userData']);

        try {
            that.userData = JSON.parse(that.entityProperties.userData);
            that.meetingZoneID = that.userData.meetingZoneID;
        } catch (e) {
            console.log("Error: ", e);
        }

        that.room = {
            "occupants": {}
        };

        if (DEBUG) {
            console.log("occupantsServer.js: Sending message to Meeting Zone ID " + that.meetingZoneID + " to 'REFRESH OCCUPANTS'...");
        }
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
            var meetingRoomZoneID = params[2];
            that.room.occupants[uuid] = displayName;
            var text = Object.keys(that.room.occupants).map(function(key) {
                return that.room.occupants[key];
            });

            if (DEBUG) {
                console.log("occupantsServer.js: " + displayName + " with UUID " + uuid + " entered the Meeting Zone! Updating the occupants list text entity...");
            }

            Entities.editEntity(id, {
                "text": text.join("\n"), 
                "textColor": [255, 255, 255]
            });

            that.restartHeartbeatTimer(uuid, meetingRoomZoneID);
        }
    };  


    // Remove the name from our occupants list
    this.leftMeetingZone = function(id, params) {
        if (that.entityID === id) {
            var uuid = params[0];

            if (DEBUG) {
                console.log("occupantsServer.js: " + that.room.occupants[uuid] + " with UUID " + uuid + " left the Meeting Zone! Updating the occupants list text entity...");
            }

            if (uuid in that.room.occupants) {
                delete that.room.occupants[uuid];
            }
            that.maybeDeleteHeartbeatTimer(uuid);
            var text = Object.keys(that.room.occupants).map(function(key) {
                return that.room.occupants[key];
            });

            Entities.editEntity(id, {
                "text": text.join("\n"), 
                "textColor": [255, 255, 255]
            });
        }
    };

    this.unload = function() {
        if (DEBUG) {
            console.log("occupantsServer.js: Unloading script...");
        }

        Object.keys(heartbeatTimers).map(function(uuid) {
            that.maybeDeleteHeartbeatTimer(uuid);
        });
        
        Object.keys(that.room.occupants).map(function(uuid) {
            that.leftMeetingZone(that.entityID, [uuid]);
        });
    };
});