//
// lightCandlesOnApproach.js
// A script to turn on the candle lights when someone walks near them
// 
// Author: Elisa Lupin-Jimenez
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// All assets are under CC Attribution Non-Commerical
// http://creativecommons.org/licenses/
//

(function() {

    var candleArray;
    var HALF_MULTIPLIER = 0.5;

    function isPositionInsideBox(position, boxProperties) {
        var localPosition = Vec3.multiplyQbyV(Quat.inverse(boxProperties.rotation),
            Vec3.subtract(position, boxProperties.position));
        var halfDimensions = Vec3.multiply(boxProperties.dimensions, HALF_MULTIPLIER);
        return -halfDimensions.x <= localPosition.x &&
                halfDimensions.x >= localPosition.x &&
               -halfDimensions.y <= localPosition.y &&
                halfDimensions.y >= localPosition.y &&
               -halfDimensions.z <= localPosition.z &&
                halfDimensions.z >= localPosition.z;
    }

    function isSomeAvatarOtherThanMeStillInsideTheObject(objectProperties) {
        var result = false;
        AvatarList.getAvatarIdentifiers().forEach(function(avatarID) {
            var avatar = AvatarList.getAvatar(avatarID);
            if (avatar.sessionUUID !== MyAvatar.sessionUUID) {
                if (isPositionInsideBox(avatar.position, objectProperties)) {
                    result = true;
                }
            }
        });
        return result;
    }

    this.enterEntity = function(entityID) {
        candleArray = Entities.getChildrenIDs(entityID);
        candleArray.forEach(function(candleID) {
            var properties = Entities.getEntityProperties(candleID, "isEmitting");
            properties.isEmitting = true;
            Entities.editEntity(candleID, properties);  
        });
    };

    this.leaveEntity = function(entityID) {
        var zoneProperties = Entities.getEntityProperties(entityID, ["position", "dimensions", "rotation"]);
        if (!isSomeAvatarOtherThanMeStillInsideTheObject(zoneProperties)) {
            candleArray.forEach(function(candleID) {
                var properties = Entities.getEntityProperties(candleID, "isEmitting");
                properties.isEmitting = false;
                Entities.editEntity(candleID, properties);  
            });
        }
    };

});