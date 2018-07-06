// DJ_Sensor_Box_Client.js
//
// Created by Milad Nazeri on 2018-06-19
//
// Copyright 2018 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    // Polyfill
    Script.require("./Polyfills.js?" + Date.now())();

    // Helper Functions
    var Util = Script.require("./Helper.js?" + Date.now());
    var checkIfIn = Util.Maths.checkIfIn,
        makeMinMax = Util.Maths.makeMinMax,
        whereOnRange = Util.Maths.whereOnRange;

    function getGeneratorPosition(generator) {
        var generatorPosition;

        switch (generator) {
            case LEFT_HAND :
                generatorPosition = MyAvatar.getLeftPalmPosition();
                break;
            case RIGHT_HAND :
                generatorPosition = MyAvatar.getRightPalmPosition();
                break;
            case DEBUG_CUBE :
                generatorPosition = Entities.getEntityProperties(debugCubeID, ['position']).position;
                break;
            default :
        }

        return generatorPosition;
    }

    function returnCheck(generator) {
        switch (generator) {
            case LEFT_HAND:
                return IN_BOX_LEFT_HAND;
            case RIGHT_HAND:
                return IN_BOX_RIGHT_HAND;
            case DEBUG_CUBE:
                return IN_BOX_DEBUG;
        }
    }

    // Log Setup
    var LOG_CONFIG = {},
        LOG_ENTER = Util.Debug.LOG_ENTER,
        LOG_UPDATE = Util.Debug.LOG_UPDATE,
        LOG_ERROR = Util.Debug.LOG_ERROR,
        LOG_VALUE = Util.Debug.LOG_VALUE,
        LOG_ARCHIVE = Util.Debug.LOG_ARCHIVE;

    LOG_CONFIG[LOG_ENTER] = true;
    LOG_CONFIG[LOG_UPDATE] = true;
    LOG_CONFIG[LOG_ERROR] = true;
    LOG_CONFIG[LOG_VALUE] = true;
    LOG_CONFIG[LOG_ARCHIVE] = false;
    var log = Util.Debug.log(LOG_CONFIG);

    // Init 
    var entityID,
        DEBUG = false,
        debugCubeID = null,
        deltaTotal = 0,
        DELTA_UPDATE_INTERVAL = 0.01,
        result = false,
        check = null,
        LEFT_HAND = "LeftHand",
        RIGHT_HAND = "RightHand",
        DEBUG_CUBE = "debugCube",
        IN_BOX_LEFT_HAND = "inBoxLeftHand",
        IN_BOX_RIGHT_HAND = "inBoxRightHand",
        IN_BOX_DEBUG = "inBoxDebug",
        self;
        
    // Collections
    var currentProperties = {},
        userData = {},
        userdataProperties = {},
        minMax = {},
        position = {},
        positionToCheck = {},
        dimensions = {},
        inBox = {
            inBoxLeftHand: false,
            inBoxRightHand: false,
            inBoxDebug: false
        },
        generatorAccepts = [],
        endPoints = [],
        directionArray = [];
           
    // Constructor Functions
    // Procedural Functions
    // Entity Definition
    function DJ_Sensor_Box_Client() {
        self = this;
    }

    DJ_Sensor_Box_Client.prototype = {
        remotelyCallable: [
            "updateEndPoints",
            'updateDebugCubeID',
            'turnOn',
            'turnOff'
        ],
        preload: function (id) {
            entityID = id;
            currentProperties = Entities.getEntityProperties(entityID);
            userData = currentProperties.userData;
            try {
                userdataProperties = JSON.parse(userData);
                directionArray = userdataProperties.performance.directionArray;
                endPointGroups = userdataProperties.performance.endPointGroups;
                generatorAccepts = userdataProperties.performance.generatorAccepts;
                DEBUG = userdataProperties.performance.DEBUG;
            } catch (e) {
                log(LOG_ERROR, "ERROR READING USERDATA", e);
            }

            name = currentProperties.name;
            position = currentProperties.position;
            dimensions = currentProperties.dimensions;

            minMax = makeMinMax(dimensions, position);
        },
        updateEndPoints: function(id, param) {
            var newEndPoints = JSON.parse(param[0]);
            endPoints = newEndPoints;
        },
        updateDebugCubeID: function(id, param) {
            var newDebugCubeID = param[0];
            debugCubeID = newDebugCubeID;
        },
        turnOn: function() {
            Script.update.connect(this.onUpdate);
        },
        turnOff: function() {
            Script.update.disconnect(this.onUpdate);
        },
        sendOn: function() {
            endPoints.forEach(function(endPoint) {
                Entities.callEntityServerMethod(endPoint.id, 'turnOn');
            });
            if (DEBUG) {
                Entities.callEntityMethod(
                    debugCubeID, 
                    'clearDebugEndpointInfo'
                );
            }
        },
        sendOff: function() {
            endPoints.forEach(function(endPoint) {
                Entities.callEntityServerMethod(endPoint.id, 'turnOff');
            });
            if (DEBUG) {
                Entities.callEntityMethod(
                    debugCubeID, 
                    'clearDebugEndpointInfo'
                );
            }
        },
        sendEdit: function(positionToCheck) {
            var range = whereOnRange(positionToCheck, minMax);
            var stringifiedRange = JSON.stringify(range);
            var stringifiedDirections = JSON.stringify(directionArray);
            endPoints.forEach(function(endPoint) {
                Entities.callEntityServerMethod(
                    endPoint.id, 
                    'edit', 
                    [stringifiedRange, stringifiedDirections, MyAvatar.sessionUUID]
                );
            });
            if (DEBUG) {
                Entities.callEntityMethod(
                    debugCubeID, 
                    'storeDebugSensorInfo', 
                    [stringifiedRange]
                );
            }
        },
        onUpdate: function(delta) {
            deltaTotal += delta;
            if (deltaTotal > DELTA_UPDATE_INTERVAL) {
                generatorAccepts.forEach(function (generator) {
                    try {
                        positionToCheck = getGeneratorPosition(generator);
                        result = checkIfIn(positionToCheck, minMax);
                        check = returnCheck(generator);
                    } catch (e) {
                        log(LOG_ERROR, "error trying to get target position", e, 1000);
                    }
                    if (result) {
                        if (!inBox[check]) {
                            inBox[check] = true;
                            self.sendOn();
                            
                        } else {
                            self.sendEdit(positionToCheck);
                        }
                    } else {
                        if (inBox[check]) {
                            self.sendOff();
                            inBox[check] = false;
                        }
                    }
                });
            }
            deltaTotal = 0;
        }
    };

    function onScriptEnding() {
        Script.update.disconnect(DJ_Sensor_Box_Client.onUpdate);
    }

    Script.scriptEnding.connect(onScriptEnding);

    return new DJ_Sensor_Box_Client();
});
