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

    var DEBUG = 0;

    // Fades the sittable local entity over time
    var SITTABLE_START_ALPHA = 0.7;
    var SITTABLE_END_ALPHA = 0.075; // fades to this alpha value
    var SITTABLE_ALPHA_DELTA = 0.009;
    var SITTABLE_FADE_MS = 40; // "Click/Trigger to Sit" local entity image fade after 50 ms
    var TIMEOUT_BEFORE_FADE_MS = 1000;
    var MAX_SIT_DISTANCE_M = 5;
    function startSittableLerpTransparency(sittableID, clearLerpIntervalCallback) {
        if (DEBUG) {
            console.log("startSittableLerpTransparency");
        }

        var currentAlpha = SITTABLE_START_ALPHA;
        // Update the alpha value on the sittable overlay
        var intervalLerpTransparencyID = Script.setInterval(function () {

            currentAlpha = currentAlpha - SITTABLE_ALPHA_DELTA;
            Entities.editEntity(sittableID, { alpha: currentAlpha });

            if (currentAlpha <= SITTABLE_END_ALPHA) {
                // Stop fading and keep overlay at the minimum alpha
                clearLerpIntervalCallback();
            }
        }, SITTABLE_FADE_MS);

        return intervalLerpTransparencyID;
    }

    // Constructor
    var _this = null;
    var SITTABLE_IMAGE_URL_HMD = Script.resolvePath("./resources/images/triggerToSit.png");
    var SITTABLE_IMAGE_URL_DESKTOP = Script.resolvePath("./resources/images/clickToSit.png");
    function SittableClickableUI() {
        _this = this;
        this.entityID = null;
        this.intervalLerpTransparencyID = null;
        this.sitEntityID = null;
    }


    // Entity methods
    SittableClickableUI.prototype = {
        preload: function (id) {
            _this.entityID = id;

            var properties = Entities.getEntityProperties(id);
            this.sitEntityID = properties.parentID;

            if (!_this.intervalLerpTransparencyID) {
                Script.setTimeout(function() {
                    _this.intervalLerpTransparencyID = startSittableLerpTransparency(id, _this.clearLerpInterval);
                }, TIMEOUT_BEFORE_FADE_MS);
            }
            this.displayModeChangedCallback = function () {
                if (_this && _this.entityID) {
                    Entities.editEntity(
                        _this.entityID,
                        { imageURL: HMD.active ? SITTABLE_IMAGE_URL_HMD : SITTABLE_IMAGE_URL_DESKTOP }
                    );
                }
            };
            HMD.displayModeChanged.connect(this.displayModeChangedCallback);
        },

        clearLerpInterval: function () {
            if (DEBUG) {
                console.log("sit ui clear lerp interval called");
            }
            if (_this.intervalLerpTransparencyID) {
                if (DEBUG) {
                    console.log("sit ui clearing lerp interval");
                }
                Script.clearInterval(_this.intervalLerpTransparencyID);
                _this.intervalLerpTransparencyID = false;
            }
        },

        mousePressOnEntity: function (entityID, event) {
            if (DEBUG) {
                console.log("MOUSE RELEASE");
            }
            if (event.isPrimaryButton && 
                Vec3.distance(MyAvatar.position,Entities.getEntityProperties(_this.entityID,["position"]).position) <= MAX_SIT_DISTANCE_M) {
                Entities.callEntityServerMethod(_this.sitEntityID, "onSitDown", [MyAvatar.sessionUUID]);
            }
        },

        unload: function () {
            _this.clearLerpInterval(); 
            HMD.displayModeChanged.disconnect(this.displayModeChangedCallback);
        }
    };

    
    return new SittableClickableUI();
});