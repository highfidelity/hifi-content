//
//  VerifyVisitedZone.js
//
//  Created by Robin Wilson 12/17/2018
//  Adapted from BouncerZone.js
//
//  Script uses values set in userData to set values in a user's Settings.setValue.
//
//  Verify Visited Zone is a optional zone to be used with the Vote App. 
//  When a user enters the zone, it writes to a user's Settings signalling to the Vote App that the user visited the zone before voting.
//
//  Copyright 2018 High Fidelity, Inc.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* globals Entities */

(function () {
    
    var _entityID;
    var LOAD_TIME = 50;
    var HALF = 0.5;

    var DEBUG = false;

    var SETTINGS = "settings";
    var NAME = "name";
    var SET_IF_PRESENT = "setIfPresent";
    var SET_IF_NOT_PRESENT = "setIfNotPresent";

    // App settings
    // Set from userData on zone
    var settingName;
    var setIfPresent;
    var setIfNotPresent;

    /*

    USERDATA EXAMPLE

    {
        "settings": {
            "name": "test",
            "setIfPresent": { "visited": true },
            "setIfNotPresent": { "visited": true }
        }
    }

    */

    var utils = {

        // Returns userData from entity
        getUserData: function () {

            var properties = Entities.getEntityProperties(_entityID, ["userData"]);

            try {
                var userData = JSON.parse(properties.userData);
            } catch (err) {
                console.error("Error parsing userData: ", err);
            }

            return userData;
        },

        // Sets variables from zone entity
        setup: function () {
            var userData = this.getUserData();
            
            if (userData[SETTINGS]) {
                var settings = userData[SETTINGS];

                settingName = settings[NAME];
                setIfNotPresent = settings[SET_IF_NOT_PRESENT];
                setIfPresent = settings[SET_IF_PRESENT];
            }
        },

        // On enter callback
        // Updates user's Settings to flag that they've visited the zone
        onEnter: function () {
            var currentSettings = Settings.getValue(settingName);
            
            var isPresent = currentSettings && true;

            var toSet;

            if (isPresent) {

                // got through each key inside setIfPresent and set to currentSettings
                var keys = Object.keys(setIfPresent);

                for (var i = 0; i < keys.length; i++) {
                    var currentKey = keys[i];
                    var currentValue = setIfPresent[currentKey];

                    currentSettings[currentKey] = currentValue;
                }

                toSet = currentSettings;

            } else {

                toSet = setIfNotPresent;

            }

            Settings.setValue(settingName, toSet);

        },

        // Get the largest axis
        largestAxisVec: function (dimensions) {
            var max = Math.max(dimensions.x, dimensions.y, dimensions.z);
            return max;
        },

        // Checks if user is inside the Zone
        isInEntity: function () {
            var properties = Entities.getEntityProperties(_entityID, ["position", "dimensions", "rotation"]);
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
                    print("Avatar is inside zone");
                }
                return true;

            } else {

                if (DEBUG) {
                    print("Avatar is NOT in zone");
                }
                return false;
            }
        }

    };

    var VerifyVisitedZone = function () {

    };

    VerifyVisitedZone.prototype = {

        preload: function (entityID) {
            _entityID = entityID;
            var _this = this;

            utils.setup();
            
            Script.setTimeout(function () {

                _this.insideEntityCheck();

            }, LOAD_TIME);

        },

        // Used if user spawned inside the entity and the enterEntity() 
        // callback is not triggered
        insideEntityCheck: function () {
            // ensures every avatar experiences the enterEntity method
            var properties = Entities.getEntityProperties(_entityID, ["position", "dimensions"]);
            var largestDimension = utils.largestAxisVec(properties.dimensions);
            var avatarsInRange = AvatarList.getAvatarsInRange(properties.position, largestDimension).filter(function(id) {
                return id === MyAvatar.sessionUUID;
            });
    
            if (avatarsInRange.length > 0) {
                if (DEBUG) {
                    print("Found avatar near zone");
                }
                // do isInZone check
                if (utils.isInEntity()) {
                    this.enterEntity();
                }
            }
        },

        // Signals user entered the entity 
        enterEntity: function () {
            
            utils.setup();

            Script.setTimeout(function () { 

                utils.onEnter();

            }, LOAD_TIME);

        }
    };

    return new VerifyVisitedZone();

});