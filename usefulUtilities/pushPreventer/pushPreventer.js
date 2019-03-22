//
//  pushPreventer.js
//
//  Created by Zach Fox on 2019-03-15
//  Copyright 2019 High Fidelity, Inc.
//
//  See accompanying README.md for usage instructions.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function () {
    var recordLocationInterval = false;
    var RECORD_LOCATION_INTERVAL_MS = 1000;

    var maxMovementAllowedM = 100;
    var contentBoundaryCorners = [{"x": 0, "y": 0, "z": 0}, {"x": 0, "y": 0, "z": 0}];


    // Returns true if a given location is within a given box
    function isLocationInBox(location, cornerA, cornerB) {
        return (location.x >= cornerA.x && location.y >= cornerA.y && location.z >= cornerA.z &&
            location.x <= cornerB.x && location.y <= cornerB.y && location.z <= cornerB.z);
    }


    // 1. Gets the avatar's current location
    // 2. If we've previously stored a location, and the avatar has moved more than they're allowed to,
    //     and they've moved outside the configurable boundaries, move the user back to the previously
    //     recorded location.
    // 3. Records the current location as the previous location.
    var previousLocation = false;
    function recordLocation() {
        var currentLocation = MyAvatar.position;

        if (previousLocation) {
            if (Vec3.distance(previousLocation, currentLocation) > maxMovementAllowedM &&
                !isLocationInBox(currentLocation, contentBoundaryCorners[0], contentBoundaryCorners[1])) {
                MyAvatar.position = previousLocation;
                return;
            }
        }

        previousLocation = currentLocation;
    }


    // A utility function used to ensure that all of the values in "box corner 1" are less than
    // those in "box corner 2"
    function maybeSwapCorners(dimension) {
        var temp;
        if (contentBoundaryCorners[0][dimension] > contentBoundaryCorners[1][dimension]) {
            temp = contentBoundaryCorners[0][dimension];
            contentBoundaryCorners[0][dimension] = contentBoundaryCorners[1][dimension];
            contentBoundaryCorners[1][dimension] = temp;
        }
    }


    // Ensures that all of the values in "box corner 1" are less than those in "box corner 2".
    function fixupContentBoundaryCorners() {
        maybeSwapCorners("x");
        maybeSwapCorners("y");
        maybeSwapCorners("z");
    }
    

    var PushPreventer = function() {};

    PushPreventer.prototype = {
        // Sets some configuration options based on `userData`, and ensures that data is valid and usable.
        // Then, sets up the main logic interval.
        preload: function (id) {
            var properties = Entities.getEntityProperties(id, ["userData"]);
            var userData;

            try {
                userData = JSON.parse(properties.userData);
            } catch (e) {
                console.error("Error parsing userData: ", e);
            }

            if (userData) {
                if (userData.maxMovementAllowedM) {
                    maxMovementAllowedM = userData.maxMovementAllowedM;
                }

                if (userData.contentBoundaryCorner1) {
                    contentBoundaryCorners[0] = userData.contentBoundaryCorner1;
                } else {
                    console.log("Please specify `contentBoundaryCorner1` inside this entity's `userData`!");
                    return;
                }

                if (userData.contentBoundaryCorner2) {
                    contentBoundaryCorners[1] = userData.contentBoundaryCorner2;
                } else {
                    console.log("Please specify `contentBoundaryCorner2` inside this entity's `userData`!");
                    return;
                }
            } else {
                console.log("Please specify this entity's `userData`! See README.md for instructions.");
                return;
            }

            fixupContentBoundaryCorners();

            recordLocationInterval = Script.setInterval(recordLocation, RECORD_LOCATION_INTERVAL_MS);
        },

        // Clears the main logic interval.
        unload: function() {
            if (recordLocationInterval) {
                Script.clearInterval(recordLocationInterval);
                recordLocationInterval = false;
            }
        }
    };

    return new PushPreventer();
});
