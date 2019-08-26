//  meetingRoomZone.js
//
//  Created by Mark Brosche on 4-2-2019
//  Handed off to Milad Nazeri on 5-15-2019
//  Copyright 2019 High Fidelity, Inc.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var CHANNEL = "HiFi.Calendar.Meeting.Occupants";
    var HALF = 0.5;
    var DEBUG = false;

    var _this;

    var MeetingZone = function() {  
        _this = this;     
    };


    MeetingZone.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            _this.occupantsListIDs = [];
            _this.entityProperties = Entities.getEntityProperties(_this.entityID, ['userData']);

            try {
                _this.userData = JSON.parse(_this.entityProperties.userData);
                _this.occupantsListIDs = _this.userData.roomOccupantsListID;
            } catch (e) {
                console.log("Error: ", e);
            }

            if (DEBUG) {
                console.log("meetingRoomZone.js: `_this.occupantsListIDs[0]` is now: " + _this.occupantsListIDs[0]);
            }
            
            Messages.subscribe(CHANNEL);
            Messages.messageReceived.connect(_this.messageListener);
            AvatarManager.avatarRemovedEvent.connect(_this.leaveDomain);
        },


        // Listen for messages from the occupants server to know when to refresh
        // This doesn't seem to currently be getting a message
        messageListener: function(channel, message, senderUUID, localOnly) {
            if (channel !== CHANNEL) {
                return;
            } else {
                try {
                    message = JSON.parse(message);
                } catch (e) {
                    console.log("meetingRoomZone.js: Could not parse message: " + e);
                    return;
                }
                if (DEBUG) {
                    console.log("meetingRoomZone.js: Received a message from `occupantsServer.js` to REFRESH OCCUPANTS for Entity ID: " + message.id + 
                    "\nThis entity's ID is: " + _this.entityID);
                }
                if (message.type === "REFRESH OCCUPANTS" && message.id === _this.entityID) {
                    _this.refreshOccupants();
                }
            }
        },


        // Check to see if you are inside the bounds
        refreshOccupants: function() {
            if (DEBUG) {
                console.log("meetingRoomZone.js: `refreshOccupants()` called.");
            }
            if (_this.positionIsInsideEntityBounds(_this.entityID, MyAvatar.position)) {
                if (DEBUG) {
                    console.log("meetingRoomZone.js: `refreshOccupants()` called - we are inside the entity bounds! Calling `enterEntity()`...");
                }
                _this.enterEntity();
            }
        },
        

        // Helper to see if the avatar is within a given bounds
        positionIsInsideEntityBounds: function(entityID, targetPosition) {
            targetPosition = targetPosition || MyAvatar.position;
    
            var properties = Entities.getEntityProperties(entityID, ["position", "dimensions", "rotation"]);
            var entityPosition = properties.position;
            var entityDimensions = properties.dimensions;
            var entityRotation = properties.rotation;
            
            var worldOffset = Vec3.subtract(targetPosition, entityPosition);
            targetPosition = Vec3.multiplyQbyV(Quat.inverse(entityRotation), worldOffset);
    
            var minX = -entityDimensions.x * HALF;
            var maxX = entityDimensions.x * HALF;
            var minY = -entityDimensions.y * HALF;
            var maxY = entityDimensions.y * HALF;
            var minZ = -entityDimensions.z * HALF;
            var maxZ = entityDimensions.z * HALF;
    
            return (targetPosition.x >= minX && targetPosition.x <= maxX
                && targetPosition.y >= minY && targetPosition.y <= maxY
                && targetPosition.z >= minZ && targetPosition.z <= maxZ);
        },


        // if an avatar enters, make sure they have a display name and send it to the subscribed occupants
        enterEntity: function() {
            var displayNameToUse = MyAvatar.sessionDisplayName;
            if (displayNameToUse === "") {
                displayNameToUse = MyAvatar.displayName;
            }
            if (_this.occupantsListIDs) {
                if (DEBUG) {
                    console.log("meetingRoomZone.js: Calling `enteredMeetingZone()` on the occupant lists with my Session UUID, display name, and this zone's Entity ID.");
                }
                _this.occupantsListIDs.forEach(function(occupantsListID){
                    Entities.callEntityServerMethod(occupantsListID, "enteredMeetingZone", [MyAvatar.sessionUUID, displayNameToUse, _this.entityID]);
                });
            }
        },


        // Remove the avatar from the occupants list
        leaveEntity: function() {
            if (_this.occupantsListIDs) {
                if (DEBUG) {
                    console.log("meetingRoomZone.js: Calling `leftMeetingZone()` on the occupant lists with my Session UUID.");
                }
                _this.occupantsListIDs.forEach(function(occupantsListID){
                    Entities.callEntityServerMethod(occupantsListID, "leftMeetingZone", [MyAvatar.sessionUUID]);
                });
                
            }
        },


        leaveDomain: function(uuid) {
            if (_this.occupantsListIDs) {
                if (DEBUG) {
                    console.log("meetingRoomZone.js: Calling `leftMeetingZone()` on the occupant lists with my Session UUID.");
                }
                _this.occupantsListIDs.forEach(function(occupantsListID){
                    Entities.callEntityServerMethod(occupantsListID, "leftMeetingZone", [uuid]);
                });
            }
        },


        unload: function() {
            if (DEBUG) {
                console.log("meetingRoomZone.js: Unloading script...");
            }
            AvatarManager.avatarRemovedEvent.disconnect(_this.leaveDomain);
            Messages.messageReceived.disconnect(_this.messageListener);
        },


        onHeartbeatRequestReceived: function(id, params) {
            if (DEBUG) {
                console.log("meetingRoomZone.js: Received a heartbeat request from the occupant list. Replying to the list with my Session UUID and this Entity ID...");
            }
            var heartbeatRequestFrom = params[0];
            Entities.callEntityServerMethod(heartbeatRequestFrom, "onHeartbeatRequestReplyReceived", [MyAvatar.sessionUUID, _this.entityID]);
        },


        remotelyCallable: ["onHeartbeatRequestReceived"]
    };
    return new MeetingZone;
});