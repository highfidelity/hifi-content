// hiFiMeetingZone.js
//
//  Created by Mark Brosche on 4-2-2019
//  Copyright 2019 High Fidelity, Inc.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var HALF = 0.5;

    var _this;

    var MeetingZone = function() {  
        _this = this;     
    };


    MeetingZone.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            _this.userData = Entities.getEntityProperties(_this.entityID, ['userData']).userData;
            AvatarManager.avatarRemovedEvent.connect(_this.leaveDomain);
            if (_this.userData.length !== 0) {
                try {
                    _this.userData = JSON.parse(_this.userData);
                } catch (e) {
                    console.log(e, "Could not parse userData");
                    return;
                }
                _this.occupantsListID = _this.userData.occupantsListID;
            } else {
                console.log("No userData found");
                return;
            }
            if (_this.positionIsInsideEntityBounds(_this.entityID, MyAvatar.position)) {
                _this.enterEntity();
            }
        },
        
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

        enterEntity: function() {
            if (_this.occupantsListID) {
                Entities.callEntityServerMethod(_this.occupantsListID, "enteredMeetingZone", [MyAvatar.sessionUUID, MyAvatar.sessionDisplayName]);
            }
        },


        leaveEntity: function() {
            if (_this.occupantsListID) {
                Entities.callEntityServerMethod(_this.occupantsListID, "leftMeetingZone", [MyAvatar.sessionUUID]);
            }
        },


        leaveDomain: function(uuid) {
            if (_this.occupantsListID) {
                Entities.callEntityServerMethod(_this.occupantsListID, "leftMeetingZone", [uuid]);
            }
        },


        unload: function() {
            AvatarManager.avatarRemovedEvent.disconnect(_this.leaveDomain);
        }
    };
    return new MeetingZone;
});