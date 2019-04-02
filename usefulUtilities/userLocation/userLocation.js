//
//  userLocation.js
//
//  Created by Zach Fox on 2019-04-02
//  Copyright 2019 High Fidelity, Inc.
//
//  See accompanying README.md for usage instructions.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function () {
    var TEXT_LOCAL_ENTITY_PROPS = {
        "type": "Text",
        // eslint-disable-next-line no-magic-numbers
        "localPosition": [0, 0, 0.05],
        // eslint-disable-next-line no-magic-numbers
        "localRotation": Quat.fromVec3Degrees([0, 0, 0]),
        "lineHeight": 0.08,
        // eslint-disable-next-line no-magic-numbers
        "dimensions": [1.5, 0.2, 0.05],
        "topMargin": 0,
        "rightMargin": 0,
        "bottomMargin": 0,
        "leftMargin": 0,
        "grab": {
            "grabbable": false,
            "equippableLeftRotation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            },
            "equippableRightRotation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            }
        },
        "canCastShadow": false,
        "script": Script.resolvePath("userLocationTextLocalEntity.js?2")
    };
    var textLocalEntity = false;
    function createTextLocalEntity() {
        var props = TEXT_LOCAL_ENTITY_PROPS;
        props.parentID = thisEntityID;
        textLocalEntity = Entities.addEntity(props, "local");
    }


    function targetIsYou() {
        canTeleportToTargetUser = false;

        if (!textLocalEntity) {
            createTextLocalEntity();
        }

        Entities.editEntity(textLocalEntity, {
            "text": "Hello, " + targetDisplayName + "! Others will see your location here."
        });
    }


    function targetUserAvailable(locationName) {
        canTeleportToTargetUser = true;

        if (!textLocalEntity) {
            createTextLocalEntity();
        }

        Entities.editEntity(textLocalEntity, {
            "text": targetDisplayName + " is in " + locationName + ".\nClick to teleport."
        });
    }


    function targetUserNotAvailable() {
        canTeleportToTargetUser = false;

        if (!textLocalEntity) {
            createTextLocalEntity();
        }

        Entities.editEntity(textLocalEntity, {
            "text": targetDisplayName + " isn't available to you."
        });
    }


    var request = Script.require("./modules/request.js").request;
    var USER_API_BASE_URL = Account.metaverseServerURL + "/api/v1/users?filter=connections&search=";
    function refreshLocation() {
        if (Account.username === targetUsername) {
            targetIsYou();
            return;
        }

        request({
            uri: USER_API_BASE_URL + targetUsername
        }, function (error, response) {
            if (error || !response || response.status !== "success") {
                console.log("Error when getting user information!");
                targetUserNotAvailable();
                return;
            }

            for (var i = 0; i < response.data.users.length; i++) {
                if (response.data.users[i].username === targetUsername) {
                    if (!response.data.users[i].online) {
                        targetUserNotAvailable();
                    }

                    var targetLocation = response.data.users[i].location;
                    var locationName = targetLocation.root.domain.default_place_name || targetLocation.root.name;
                    targetUserAvailable(locationName);
                    return;
                }
            }

            targetUserNotAvailable();
        });
    }


    var thisEntityID = false;
    var refreshLocationInterval = false;
    var targetUsername = false;
    var REFRESH_LOCATION_INTERVAL_MS = 30000;
    this.preload = function(entityID) {
        thisEntityID = entityID;

        var properties = Entities.getEntityProperties(entityID, ["userData"]);
        var userData;

        try {
            userData = JSON.parse(properties.userData);
        } catch (e) {
            console.error("Error parsing userData: ", e);
        }

        if (userData) {
            if (userData.targetUsername && userData.targetUsername.length > 0) {
                targetUsername = userData.targetUsername;
            } else {
                console.log("Please specify `targetUsername` inside this entity's `userData`!");
                return;
            }

            if (userData.targetDisplayName && userData.targetDisplayName.length > 0) {
                targetDisplayName = userData.targetDisplayName;
            } else {
                console.log("Please specify `targetDisplayName` inside this entity's `userData`!");
                return;
            }
        } else {
            console.log("Please specify this entity's `userData`! See README.md for instructions.");
            return;
        }

        refreshLocationInterval = Script.setInterval(refreshLocation, REFRESH_LOCATION_INTERVAL_MS);
        refreshLocation();
    }

    function goToTargetAvatar() {
        Window.location = "@" + targetUsername;
    }

    this.remotelyCallable = ["mousePressOnEntity"];

    this.mousePressOnEntity = function(entityID, mouseEvent) {
        if (!mouseEvent.button === "Primary" || !canTeleportToTargetUser) {
            return;
        }

        goToTargetAvatar();
    };


    this.unload = function() {
        if (textLocalEntity) {
            Entities.deleteEntity(textLocalEntity);
        }

        if (refreshLocationInterval) {
            Script.clearInterval(refreshLocationInterval);
            refreshLocationInterval = false;
        }
    }
});
