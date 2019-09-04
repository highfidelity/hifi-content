//
//  portal.js
//  Created by Zach Fox on 2019-05-23
//  Copyright 2019 High Fidelity, Inc.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function () {
    var NUM_PATTERN = "-?" + // Negative sign optional, but should be at the front.
        "[0-9]+" +           // Before the decimal point, we want to require at least one digit.
        "(?:" +              // Non-integers are contained within an optional capture group.
        "\." +               // Literal '.', the decimal point.
        "[0-9]+" +           // At least one digit must follow the decimal point (no "4.").
        ")?";                // The entire floating point non-integer is optional.
    var REGEX_LOCAL_COORDS_WITH_ORIENTATION = "^" + // Anchor to the beginning of the string
        "/" +                      // Forward slash always comes at the beginning
        "(" + NUM_PATTERN + ")," + // Capture group containing the `x` coordinate of feet position, followed by the `,` delimiter
        "(" + NUM_PATTERN + ")," + // Capture group containing the `y` coordinate of feet position, followed by the `,` delimiter
        "(" + NUM_PATTERN + ")" + // Capture group containing the `z` coordinate of feet position
        "/" +                      // Slash, after which orientation appears
        "(" + NUM_PATTERN + ")," + // Capture group containing the `x` component of avatar orientation quat, followed by the `,` delimiter
        "(" + NUM_PATTERN + ")," + // Capture group containing the `y` component of avatar orientation quat, followed by the `,` delimiter
        "(" + NUM_PATTERN + ")," + // Capture group containing the `z` component of avatar orientation quat, followed by the `,` delimiter
        "(" + NUM_PATTERN + ")";   // Capture group containing the `w` component of avatar orientation quat
    REGEX_LOCAL_COORDS_WITH_ORIENTATION = new RegExp(REGEX_LOCAL_COORDS_WITH_ORIENTATION);
    var REGEX_LOCAL_COORDS_WITHOUT_ORIENTATION = "^" + // Anchor to the beginning of the string
        "/" +                      // Forward slash always comes at the beginning
        "(" + NUM_PATTERN + ")," + // Capture group containing the `x` coordinate of feet position, followed by the `,` delimiter
        "(" + NUM_PATTERN + ")," + // Capture group containing the `y` coordinate of feet position, followed by the `,` delimiter
        "(" + NUM_PATTERN + ")";   // Capture group containing the `y` coordinate of feet position
    REGEX_LOCAL_COORDS_WITHOUT_ORIENTATION = new RegExp(REGEX_LOCAL_COORDS_WITHOUT_ORIENTATION);


    var Portal = function() {};


    Portal.prototype = {
        enterEntity: function (id) {
            var properties = Entities.getEntityProperties(id, ["userData"]);
            var userData;

            try {
                userData = JSON.parse(properties.userData);
            } catch (e) {
                console.error("Error parsing userData: ", e);
            }

            if (userData) {
                if (userData.destination) {
                    var destination = userData.destination;

                    if (destination.indexOf("bookmark:") > -1) {
                        var bookmarkName = destination.replace("bookmark:", "");
                        destination = LocationBookmarks.getAddress(bookmarkName);
                        Window.location = destination;
                    } else if (destination.match(REGEX_LOCAL_COORDS_WITH_ORIENTATION)) {
                        var matches = destination.match(REGEX_LOCAL_COORDS_WITH_ORIENTATION);
                        var newFeetPosition = {
                            "x": matches[1],
                            "y": matches[2],
                            "z": matches[3]
                        };
                        var newAvatarOrientation = {
                            "x": matches[4],
                            "y": matches[5],
                            "z": matches[6],
                            "w": matches[7]
                        };

                        MyAvatar.goToFeetLocation(newFeetPosition, true, newAvatarOrientation, false);
                    } else if (destination.match(REGEX_LOCAL_COORDS_WITHOUT_ORIENTATION)) {
                        var matches = destination.match(REGEX_LOCAL_COORDS_WITHOUT_ORIENTATION);
                        var newFeetPosition = {
                            "x": matches[1],
                            "y": matches[2],
                            "z": matches[3]
                        };

                        MyAvatar.feetPosition = newFeetPosition;
                    } else {
                        Window.location = destination;
                    }
                } else {
                    console.log("Please specify `destination` inside this entity's `userData`!");
                    return;
                }
            } else {
                console.log("Please specify this entity's `userData`! See README.md for instructions.");
                return;
            }
        }
    };

    
    return new Portal();
});
