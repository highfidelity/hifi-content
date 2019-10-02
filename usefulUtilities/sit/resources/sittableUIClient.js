//
// sittableUIClient.js
//
// Created by Robin Wilson 5/7/2019
//
// Copyright 2019 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {

    var DEBUG = true;

    var MAX_SIT_DISTANCE_M = 5;

    // Constructor
    var _this = null;
    var SITTABLE_IMAGE_URL_HMD = Script.resolvePath("./images/triggerToSit.png");
    var SITTABLE_IMAGE_URL_DESKTOP = Script.resolvePath("./images/clickToSit.png");
    function SittableClickableUI() {
        _this = this;
        this.entityID = null;
        this.sitEntityID = null;
    }


    // Entity methods
    SittableClickableUI.prototype = {
        preload: function (id) {
            _this.entityID = id;

            var properties = Entities.getEntityProperties(id);
            this.sitEntityID = properties.parentID;
            HMD.displayModeChanged.connect(this.displayModeChangedCallback);
        },

        displayModeChangedCallback: function() {
            if (_this && _this.entityID) {
                Entities.editEntity(
                    _this.entityID,
                    { imageURL: HMD.active ? SITTABLE_IMAGE_URL_HMD : SITTABLE_IMAGE_URL_DESKTOP }
                );
            }
        },

        mousePressOnEntity: function (entityID, event) {
            if (DEBUG) {
                console.log("sittableUIClient.js: " + _this.entityID + ": `mousePressOnEntity()`");
            }
            if (event.isPrimaryButton && 
                Vec3.distance(MyAvatar.position, Entities.getEntityProperties(_this.entityID, ["position"]).position) <= MAX_SIT_DISTANCE_M) {
                Entities.callEntityServerMethod(_this.sitEntityID, "onMousePressOnEntity", [MyAvatar.sessionUUID]);
            }
        },

        unload: function () {
            HMD.displayModeChanged.disconnect(this.displayModeChangedCallback);
        }
    };

    
    return new SittableClickableUI();
});
