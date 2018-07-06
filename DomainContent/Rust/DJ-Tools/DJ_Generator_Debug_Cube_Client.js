// DJ_Generator_Debug_Cube_Client.js
//
// Created by Milad Nazeri on 2018-06-19
//
// Copyright 2018 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function () {
    // Polyfill
    Script.require("./Polyfills.js?" + Date.now())();

    // Helper Functions
    var Util = Script.require("./Helper.js?" + Date.now());
    var formatObj = Util.Debug.formatObj,
        vec = Util.Maths.vec;

    // Log Setup
    var LOG_CONFIG = {},
        LOG_ENTER = Util.Debug.LOG_ENTER,
        LOG_UPDATE = Util.Debug.LOG_UPDATE,
        LOG_ERROR = Util.Debug.LOG_ERROR,
        LOG_VALUE = Util.Debug.LOG_VALUE,
        LOG_ARCHIVE = Util.Debug.LOG_ARCHIVE;

    LOG_CONFIG[LOG_ENTER] = false;
    LOG_CONFIG[LOG_UPDATE] = false;
    LOG_CONFIG[LOG_ERROR] = true;
    LOG_CONFIG[LOG_VALUE] = false;
    LOG_CONFIG[LOG_ARCHIVE] = false;
    var log = Util.Debug.log(LOG_CONFIG);

    // Init 
    var entityID = null,
        moveLarge = false,
        overlay,
        DEBUG_HEIGHT = 0.8,
        AXIS = 0,
        SIGN = 1,
        self;

    // Collections
    var currentProperties = {},
        userData = {},
        userdataProperties = {},
        position = {},
        debugInfo = {
            range: {},
            endPoint: {}
        },
        moves = {
            moveAmountLarge: 0.2,
            moveAmountSmall: 0.02,
            moveAmount: 0.2
        },
        MAPPING = {
            "i": ["y", 1],
            "k": ["y", -1],
            "j": ["x", 1],
            "l": ["x", -1],
            "n": ["z", -1],
            "m": ["z", 1]
        };
    
    // Constructor Functions
    // Procedural Functions
    // Entity Definition
    function DJ_Generator_Debug_Cube() {
        self = this;
    }

    DJ_Generator_Debug_Cube.prototype = {
        remotelyCallable: [
            "storeDebugEndpointInfo",
            "storeDebugSensorInfo",
            "clearDebugEndpointInfo",
            "turnOn",
            "turnOff"
        ],
        preload: function (id) {
            entityID = id;
            currentProperties = Entities.getEntityProperties(entityID);
            userData = currentProperties.userData;
            try {
                userdataProperties = JSON.parse(userData);
            } catch (e) {
                log(LOG_ERROR, "ERROR READING USERDATA", e);
            }

            position = currentProperties.position;
            overlay = Overlays.addOverlay("text3d", {
                position: Vec3.sum(position, vec(0, DEBUG_HEIGHT, 0)),
                rotation: Quat.fromPitchYawRollDegrees(0, 180, 0),
                parentID: entityID,
                isFacingAvatar: false,
                lineHeight: 0.030,
                backgroundAlpha: 0.85,
                text: "test"
            });
        },
        debugKeys: function(event) {
            if (MAPPING[event.text]) {
                var array = MAPPING[event.text];
                self.moveEntity(array[AXIS], array[SIGN]);
            }
            if (event.text === "b") {
                moveLarge = !moveLarge;
                if (moveLarge) {
                    moves.moveAmount = moves.moveAmountLarge;
                } else {
                    moves.moveAmount = moves.moveAmountSmall;
                }
            }
        },
        getPosition: function() {
            return Entities.getEntityProperties(entityID, ['position']).position;
        },
        moveEntity: function(axis, sign) {
            try {
                var position = this.getPosition();
                position[axis] = position[axis] + moves.moveAmount * sign;
                var properties = {
                    position: position
                };
                Entities.editEntity(entityID, properties);
            } catch (e) {
                log(LOG_ERROR, "ERROR MOVING DEBUG ENTITY", e);
            }
        },
        updateOverlay: function() {
            var text = formatObj(debugInfo);
            text = JSON.stringify(text)
                .split(",").join("__")
                .split("{").join("\n")
                .split("}").join("\n");
            var properties = {
                text: text
            };
            Overlays.editOverlay(overlay, properties);
        },
        storeDebugEndpointInfo: function (id, parm) {
            var eventInfo = JSON.parse(parm[0]);
            var name = parm[1];
            debugInfo.endPoint[name] = eventInfo;
            this.updateOverlay();
        },
        clearDebugEndpointInfo: function (id) {
            debugInfo.endPoint = {};
            this.updateOverlay();
        },
        storeDebugSensorInfo: function (id, parm) {
            var eventInfo = JSON.parse(parm[0]);
            debugInfo.range = eventInfo;
            this.updateOverlay();
        },
        turnOn: function() {
            Controller.keyPressEvent.connect(this.debugKeys);
        },
        turnOff: function() {
            Controller.keyPressEvent.disconnect(this.debugKeys); 
        }
    };

    function onScriptEnding() {
        // Script.update.disconnect(onUpdate);
    }

    Script.scriptEnding.connect(onScriptEnding);

    return new DJ_Generator_Debug_Cube();
});

