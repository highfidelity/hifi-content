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
    var request = Script.require("./modules/request.js").request;

    var _this;
    var REFRESH_LOCATION_INTERVAL_MS = 30000;
    var USER_API_BASE_URL = Account.metaverseServerURL + "/api/v1/users?filter=connections&search=";
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
        "script": Script.resolvePath("userLocationTextLocalEntity.js?6")
    };

    var UserLocationBanner = function() {
        _this = this;
    };

    UserLocationBanner.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            _this.targetUsername = false;
            _this.targetDisplayName = false;
            _this.refreshLocationInterval = false;
            _this.textLocalEntity = false;
            _this.canTeleportToTargetUser = false;
    
            var properties = Entities.getEntityProperties(entityID, ["userData"]);
            var userData;
    
            try {
                userData = JSON.parse(properties.userData);
            } catch (e) {
                console.error("Error parsing userData: ", e);
            }
    
            if (userData) {
                if (userData.targetUsername && userData.targetUsername.length > 0) {
                    _this.targetUsername = userData.targetUsername;
                } else {
                    console.log("Please specify `targetUsername` inside this entity's `userData`!");
                    return;
                }
    
                if (userData.targetDisplayName && userData.targetDisplayName.length > 0) {
                    _this.targetDisplayName = userData.targetDisplayName;
                } else {
                    console.log("Please specify `targetDisplayName` inside this entity's `userData`!");
                    return;
                }
            } else {
                console.log("Please specify this entity's `userData`! See README.md for instructions.");
                return;
            }
    
            _this.refreshLocationInterval = Script.setInterval(_this.refreshLocation, REFRESH_LOCATION_INTERVAL_MS);
            _this.refreshLocation();
        },


        mousePressOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.button !== "Primary" || !_this.canTeleportToTargetUser) {
                return;
            }

            Window.location = "@" + _this.targetUsername;
        },
        

        unload: function() {
            if (_this.textLocalEntity) {
                Entities.deleteEntity(_this.textLocalEntity);
            }
    
            if (_this.refreshLocationInterval) {
                Script.clearInterval(_this.refreshLocationInterval);
                _this.refreshLocationInterval = false;
            }
        },


        createTextLocalEntity: function() {
            var props = TEXT_LOCAL_ENTITY_PROPS;
            props.parentID = _this.entityID;
            _this.textLocalEntity = Entities.addEntity(props, "local");
        },
        

        refreshLocation: function() {
            if (Account.username === _this.targetUsername) {
                _this.targetIsYou();
                return;
            }

            request({
                uri: USER_API_BASE_URL + _this.targetUsername
            }, function (error, response) {
                if (error || !response || response.status !== "success") {
                    console.log("Error when getting user information!");
                    _this.targetUserNotAvailable();
                    return;
                }

                for (var i = 0; i < response.data.users.length; i++) {
                    if (response.data.users[i].username === _this.targetUsername) {
                        if (!response.data.users[i].online) {
                            _this.targetUserNotAvailable();
                            return;
                        }

                        var targetLocation = response.data.users[i].location;
                        if (!targetLocation || !targetLocation.root || !targetLocation.root.domain) {
                            _this.targetUserNotAvailable();
                            return;
                        }

                        var locationName = targetLocation.root.domain.default_place_name || targetLocation.root.name;
                        _this.targetUserAvailable(locationName);
                        return;
                    }
                }

                _this.targetUserNotAvailable();
            });
        },


        targetIsYou: function() {
            _this.canTeleportToTargetUser = false;
    
            if (!_this.textLocalEntity) {
                _this.createTextLocalEntity();
            }
    
            Entities.editEntity(_this.textLocalEntity, {
                "text": "Hello, " + _this.targetDisplayName + "! Others will see your location here."
            });
        },
    
    
        targetUserAvailable: function(locationName) {
            _this.canTeleportToTargetUser = true;
    
            if (!_this.textLocalEntity) {
                _this.createTextLocalEntity();
            }
    
            Entities.editEntity(_this.textLocalEntity, {
                "text": _this.targetDisplayName + " is in " + locationName + ".\nClick to teleport."
            });
        },
    
    
        targetUserNotAvailable: function() {
            _this.canTeleportToTargetUser = false;
    
            if (!_this.textLocalEntity) {
                _this.createTextLocalEntity();
            }
    
            Entities.editEntity(_this.textLocalEntity, {
                "text": _this.targetDisplayName + " isn't available to you."
            });
        },

        forwardMousePress: function(thisID, args) {
            _this.mousePressOnEntity(_this.entityID, JSON.parse(args[0]));
        }
    };

    return new UserLocationBanner();
});
