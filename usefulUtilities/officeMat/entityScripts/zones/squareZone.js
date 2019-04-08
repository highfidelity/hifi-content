//
// squareZone.js
// 
// Created by Zach Fox on 2019-04-03
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function () {
    var _this;
    var request = Script.require("https://hifi-content.s3.amazonaws.com/Experiences/Releases/modules/request/v1.0/request.js").request;
    var REQUEST_URL = Script.require("../../config/config.json").requestURL;

    var SquareZone = function() {
        _this = this;
    };

    SquareZone.prototype = {
        // Called when the script starts up. Pulls data from user data and does some error handling.
        preload: function (entityID) {
            _this.entityID = entityID;
            _this.squareType = false;
            _this.usernameWhitelist = [];

            var properties = Entities.getEntityProperties(entityID, ["userData"]);
            var userData;

            try {
                userData = JSON.parse(properties.userData);
            } catch (e) {
                console.error("Error parsing userData: ", e);
            }

            if (userData) {
                if (userData.usernameWhitelist && userData.usernameWhitelist.length > 0) {
                    _this.usernameWhitelist = userData.usernameWhitelist;
                } else {
                    console.log("Please specify `usernameWhitelist` inside this entity's `userData`!");
                    return;
                }

                if (userData.squareType && userData.squareType.length > 0) {
                    _this.squareType = userData.squareType;
                }
            } else {
                console.log("Please specify this entity's `userData`! See README.md for instructions.");
                return;
            }
        },


        // Called when a user enters the bounding box of the entity.
        // 1. Does nothing if the user isn't on the username whitelist
        // 2. Sends a status update to the backend depending on which 
        //     Mat Square Zone the user stepped into.
        enterEntity: function(entityID) {
            if (_this.usernameWhitelist.length === 0) {
                return;
            }

            var myUsername = AccountServices.username;

            if (_this.usernameWhitelist.indexOf(myUsername) === -1) {
                return;
            }

            var queryParamString = "type=updateEmployee";
            queryParamString += "&username=" + myUsername;
            queryParamString += "&displayName=" + MyAvatar.displayName;
            queryParamString += "&status=";

            var statusText = "busy";

            var parentID = Entities.getEntityProperties(entityID, ["parentID"]).parentID;
            var childrenIDs = Entities.getChildrenIDs(parentID);
            var customStatusTextEntity = false;
            for (var i = 0; i < childrenIDs.length; i++) {
                if (Entities.getEntityProperties(childrenIDs[i], ["type"]).type === "Text") {
                    customStatusTextEntity = childrenIDs[i];
                    statusText = Entities.getEntityProperties(customStatusTextEntity, ["text"]).text;
                    break;
                }
            }

            if (!customStatusTextEntity) {
                if (_this.squareType === "green") {
                    statusText = "available";
                } else if (_this.squareType === "yellow") {
                    statusText = "busy";
                } else if (_this.squareType === "red") {
                    statusText = "busy";
                } else if (_this.squareType === "grey") {
                    statusText = "busy";
                }
            }

            queryParamString += statusText;

            request({
                uri: REQUEST_URL + "?" + queryParamString
            }, function (error, response) {
                if (error || !response || response.status !== "success") {
                    console.error("Error when sending status update to server: " + JSON.stringify(response));
                    return;
                }
            });
        }
    };

    return new SquareZone();
});
