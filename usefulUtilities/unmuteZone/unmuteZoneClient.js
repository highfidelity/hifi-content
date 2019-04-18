//
//  unmuteZoneClient.js
//
//  Created by Robin Wilson on 2019-04-08
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    
    function onMuteSettingChanged() {
        // if user mutes themselves in the zone, 
        // do not apply the previous mute setting
        that.usePreviousMuteSetting = false;
    }

    
    // Returns true if my avatar is inside the zone, false otherwise.
    function positionIsInsideEntityBounds(entityID, targetPosition) {
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
    }
    

    var that = null;
    function UnmuteZoneClient() {
        that = this;
        this.entityID = null;
        this.previousMuteSetting = false,
        this.usePreviousMuteSetting = true,
        this.isMutedSignalConnected = false;
    }


    UnmuteZoneClient.prototype = {
        preload: function(id) {
            that.entityID = id;
            if (positionIsInsideEntityBounds(that.entityID, MyAvatar.position)) {
                that.enterEntity();
            }
        },
        enterEntity: function() {
            // if push to talk is enabled
            // exit
            if (Audio.pushToTalk) {
                return;
            }

            // save previous muted setting
            that.previousMuteSetting = Audio.muted;
            Audio.muted = false;            
            that.usePreviousMuteSetting = true;

            Audio.mutedChanged.connect(onMuteSettingChanged);
            that.isMutedSignalConnected = true;
        },
        leaveEntity: function() {
            if (that.usePreviousMuteSetting) {
                // did not change muted status while inside the zone
                // apply previous setting
                Audio.muted = that.previousMuteSetting;
            }

            if (that.isMutedSignalConnected) {
                // only disconnect once
                Audio.mutedChanged.disconnect(onMuteSettingChanged);
                that.isMutedSignalConnected = false;
            }
        },
        unload: function() {
            if (that.isMutedSignalConnected) {
                // only disconnect once
                Audio.mutedChanged.disconnect(onMuteSettingChanged);
                that.isMutedSignalConnected = false;
            }
        }
    };

    
    return new UnmuteZoneClient();
});
