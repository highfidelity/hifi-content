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
            
            Messages.subscribe(_this.channel);
            Messages.messageReceived.connect(_this.messageListener);
            AvatarManager.avatarRemovedEvent.connect(_this.leaveDomain);

            if (_this.positionIsInsideEntityBounds(_this.entityID, MyAvatar.position)) {
                _this.enterEntity();
            }
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
                    console.log(e, "Could not parse message");
                    return;
                }
                if (message.type === "REFRESH OCCUPANTS" && message.id === _this.entityID) {
                    _this.refreshOccupants();
                }
            }
        },


        // Check to see if you are inside the bounds
        refreshOccupants: function() {
            if (_this.positionIsInsideEntityBounds(_this.entityID, MyAvatar.position)) {
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
                _this.occupantsListIDs.forEach(function(occupantsListID){
                    Entities.callEntityServerMethod(occupantsListID, "enteredMeetingZone", [MyAvatar.sessionUUID, displayNameToUse]);
                });
            }
        },


        // Remove the avatar from the occupants list
        leaveEntity: function() {
            if (_this.occupantsListIDs) {
                _this.occupantsListIDs.forEach(function(occupantsListID){
                    Entities.callEntityServerMethod(occupantsListID, "leftMeetingZone", [MyAvatar.sessionUUID]);
                });
                
            }
        },


        leaveDomain: function(uuid) {
            if (_this.occupantsListIDs) {
                _this.occupantsListIDs.forEach(function(occupantsListID){
                    Entities.callEntityServerMethod(occupantsListID, "leftMeetingZone", [uuid]);
                });
            }
        },


        unload: function() {
            AvatarManager.avatarRemovedEvent.disconnect(_this.leaveDomain);
            Messages.messageReceived.disconnect(_this.messageListener);
        }
    };
    return new MeetingZone;
});