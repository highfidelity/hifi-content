//
//  locationZoneClient.js
//
//  Created by Robin Wilson on 2019-04-04
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var request = Script.require(Script.resolvePath('https://hifi-content.s3.amazonaws.com/Experiences/Releases/modules/request/v1.0/request.js')).request,
        REQUEST_URL = Script.require("../secrets.json").REQUEST_URL,
        DEBUG = 0;


    // Called when user enters entity, will send request to server to update user location
    function setUserLocation(newLocation) {
        var queryParamString = "type=updateEmployee";
        queryParamString += "&username=" + AccountServices.username;
        queryParamString += "&location=" + newLocation;

        var uri = REQUEST_URL + "?" + queryParamString;

        if (DEBUG) {
            console.log("statusIndicator onEnterEntity: " + uri);
        }

        request({
            uri: uri
        }, function (error, response) {
            if (error || !response || response.status !== "success") {
                console.error("Error with onEnterEntity: " + JSON.stringify(response));
            } else {
                // successfully sent updateEmployee
                if (DEBUG) {
                    console.log("Sent request successfully and entered statusIndicatorZone called: " + newLocation);
                }
            }
        });
    }
    

    // Returns true if my avatar is inside the zone, false otherwise
    var HALF = 0.5;
    function avatarIsInsideZone() {
        var properties = Entities.getEntityProperties(entityID, ["position", "dimensions", "rotation"]);
        var position = properties.position;
        var dimensions = properties.dimensions;
        
        var avatarPosition = MyAvatar.position;
        var worldOffset = Vec3.subtract(avatarPosition, position);

        avatarPosition = Vec3.multiplyQbyV(Quat.inverse(properties.rotation), worldOffset);

        var minX = 0 - dimensions.x * HALF;
        var maxX = 0 + dimensions.x * HALF;
        var minY = 0 - dimensions.y * HALF;
        var maxY = 0 + dimensions.y * HALF;
        var minZ = 0 - dimensions.z * HALF;
        var maxZ = 0 + dimensions.z * HALF;

        if (avatarPosition.x >= minX && avatarPosition.x <= maxX
            && avatarPosition.y >= minY && avatarPosition.y <= maxY
            && avatarPosition.z >= minZ && avatarPosition.z <= maxZ) {
            
            if (DEBUG) {
                print("Avatar IS inside zone");
            }
            return true;

        } else {
            if (DEBUG) {
                print("Avatar IS NOT in zone");
            }
            return false;
        }
    }

        
    // Ensures that every avatar experiences the onEnterEntity method, even if they were already in the entity
    // when the script started
    function avatarLoadedInsideZoneCheck() {
        function largestAxisVec(dimensions) {
            var max = Math.max(dimensions.x, dimensions.y, dimensions.z);
            return max;
        }
        var properties = Entities.getEntityProperties(entityID, ["position", "dimensions"]);
        var largestDimension = largestAxisVec(properties.dimensions);
        var avatarsInRange = AvatarList.getAvatarsInRange(properties.position, largestDimension).filter(function(id) {
            return id === MyAvatar.sessionUUID;
        });

        if (avatarsInRange.length > 0) {
            if (DEBUG) {
                print("Found avatar near zone");
            }
            // do isInZone check
            if (avatarIsInsideZone()) {
                onEnterEntity();
            }
        }
    }


    // Sets user's location to zone name
    function onEnterEntity() {
        setZoneName();
        if (DEBUG) {
            console.log(AccountServices.username + " entered the zone " + zoneName);
        }
        setUserLocation(zoneName);
    }

    
    // Updates the name of the zone
    function setZoneName() {
        zoneName = Entities.getEntityProperties(entityID, ["name"]).name;
    }


    // Zone Methods
    function LocationZoneClient() {
        // blank
    }
    
    // Zone prototype
    var entityID,
        zoneName; 
    LocationZoneClient.prototype = {
        preload: function(id) {
            entityID = id;
            setZoneName();
            avatarLoadedInsideZoneCheck();
        },
        enterEntity: function () {
            onEnterEntity();
        },
        leaveEntity: function () {
            if (DEBUG) {
                console.log("Left statusIndicatorZone called: " + zoneName);
            }
            setUserLocation("unknown");
        },
        unload: function() {
            // blank
        }
    };


    return new LocationZoneClient();
});