/* eslint-disable no-magic-numbers */
//
// spinabbleWheelServer.js
// 
// Created by Zach Fox on 2019-04-19
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
/* global console */

(function() {
    var that;
    var CHECK_SPINNING_TIMEOUT_MS = 100;
    var RAD_PER_DEG = Math.PI / 180;
    var SMALL_Z_ANGULAR_VELOCITY_RAD_PER_SEC = 15 * RAD_PER_DEG;
    var MIN_ANGULAR_VELOCITY_RAD_PER_SEC = 40;
    var MAX_ANGULAR_VELOCITY_RAD_PER_SEC = 100;

    // Called upon a timer callback. Checks if the wheel is spinning slowly enough to set
    // the `wheelIsSpinning` flag back to `false`. If it's not spinning slowly enough,
    // restarts the timeout that'll call this function upon expiry.
    function checkSpinning() {
        var props = Entities.getEntityProperties(that.entityID, ["angularVelocity"]);
        if (Math.abs(props.angularVelocity.z) < SMALL_Z_ANGULAR_VELOCITY_RAD_PER_SEC) {
            Entities.editEntity(that.entityID, {
                "angularVelocity": [0, 0, 0]
            });

            that.wheelIsSpinning = false;
            return;
        }

        that.checkSpinningTimeout = Script.setTimeout(checkSpinning, CHECK_SPINNING_TIMEOUT_MS);
    }


    // Populates the spinnable wheel with some text entities and separators according to the attached
    // entity's User Data.
    var TEXT_ENTITY_STATIC_PROPS = {
        "type": "Text",
        "dimensions": {
            "x": 0.6000000238418579,
            "y": 0.20000000298023224,
            "z": 0.009999999776482582
        },
        "canCastShadow": false,
        "grab": {
            "grabbable": false
        },
        "damping": 0,
        "angularDamping": 0,
        "collisionless": true,
        "ignoreForCollisions": true,
        "lineHeight": 0.06,
        "registrationPoint": [1, 0.5, 0.5],
        "triggerable": false
    };
    var SPINNER_RADIUS_M = 1.25;
    var TEXT_ENTITY_PADDING_M = 0.2;
    var BORDER_ENTITY_STATIC_PROPS = {
        "type": "Box",
        "dimensions": {
            "x": SPINNER_RADIUS_M,
            "y": 0.05,
            "z": 0.05
        },
        "color": [0, 0, 0],
        "canCastShadow": false,
        "grab": {
            "grabbable": false
        },
        "damping": 0,
        "angularDamping": 0,
        "collisionless": true,
        "ignoreForCollisions": true,
        "lineHeight": 0.06,
        "registrationPoint": [1, 0.5, 0.5],
        "triggerable": false
    };
    function populateWheel(data) {
        var numTextEntities = data.length;
        var angleBetweenTextEntities = 360 / numTextEntities;
        var currentAngle = 0;

        for (var i = 0; i < numTextEntities; i++) {
            var props = TEXT_ENTITY_STATIC_PROPS;
            props.text = data[i];
            props.parentID = that.entityID;
            props.localRotation = Quat.fromVec3Degrees([-90, -currentAngle, 0]);
            var x = Math.cos(currentAngle * RAD_PER_DEG) * (SPINNER_RADIUS_M - TEXT_ENTITY_PADDING_M);
            var z = Math.sin(currentAngle * RAD_PER_DEG) * (SPINNER_RADIUS_M - TEXT_ENTITY_PADDING_M);
            props.localPosition = [x, 0.0375, z];

            that.rezzedEntities.push(Entities.addEntity(props));

            currentAngle -= angleBetweenTextEntities / 2;

            props = BORDER_ENTITY_STATIC_PROPS;
            props.parentID = that.entityID;
            props.localRotation = Quat.fromVec3Degrees([-90, -currentAngle, 0]);
            x = Math.cos(currentAngle * RAD_PER_DEG) * (SPINNER_RADIUS_M);
            z = Math.sin(currentAngle * RAD_PER_DEG) * (SPINNER_RADIUS_M);
            props.localPosition = [x, 0.0375, z];

            that.rezzedEntities.push(Entities.addEntity(props));
            
            currentAngle -= angleBetweenTextEntities / 2;
        }
    }


    // It's a constructor for Spinnable Wheel Server.
    var SpinnableWheelServer = function() {
        that = this;
        that.entityID = false;
        that.wheelIsSpinning = false;
        that.checkSpinningTimeout = false;
        that.rezzedEntities = [];
    };


    SpinnableWheelServer.prototype = {
        remotelyCallable: ['spinWheel'],

        
        // On script preload, save a reference to this entity ID and initialize some variables.
        // Also, populate the spinnable wheel with some text entities and separators if the
        // user data is valid.
        preload: function(entityID) {
            that.entityID = entityID;
            that.wheelIsSpinning = false;
            that.checkSpinningTimeout = false;

            var properties = Entities.getEntityProperties(that.entityID, ["userData"]);

            var userData;

            try {
                userData = JSON.parse(properties.userData);
            } catch (e) {
                console.error("Error parsing userData: ", e);
            }

            if (userData) {
                if (userData.wheelText && userData.wheelText.length > 0) {
                    populateWheel(userData.wheelText);
                } else {
                    console.log("Please specify the `wheelText` array inside this entity's `userData`!");
                    return;
                }
            } else {
                console.log("Please specify this entity's `userData`! See README.md for instructions.");
                return;
            }
        },


        // On script unload, clear the timeout (if one exists), and delete all entities that we've rezzed.
        // Also make the wheel stop.
        unload: function() {
            if (that.checkSpinningTimeout) {
                Script.clearTimeout(that.checkSpinningTimeout);
                that.checkSpinningTimeout = false;
            }

            for (var i = 0; i < that.rezzedEntities.length; i++) {
                Entities.deleteEntity(that.rezzedEntities[i]);
            }
            
            Entities.editEntity(that.entityID, {
                "angularVelocity": [0, 0, 0]
            });
        },


        // Spin the wheel if it isn't already spinning! Wheeee!
        // Also start the timer used to determine when the wheel has stopped spinning.
        spinWheel: function(thisID, params) {
            if (!that.wheelIsSpinning) {
                that.wheelIsSpinning = true;

                Entities.editEntity(that.entityID, {
                    "angularVelocity": [0, 0,
                        -1 * (Math.random() * MAX_ANGULAR_VELOCITY_RAD_PER_SEC + MIN_ANGULAR_VELOCITY_RAD_PER_SEC)]
                });

                that.checkSpinningTimeout = Script.setTimeout(checkSpinning, CHECK_SPINNING_TIMEOUT_MS);
            }
        }
    };

    
    return new SpinnableWheelServer();
});
