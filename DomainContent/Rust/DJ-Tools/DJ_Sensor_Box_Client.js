// DJ_Sensor_Box_Client.js
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
    var checkIfIn = Util.Maths.checkIfIn,
        checkIfInNonAligned = Util.Maths.checkIfInNonAligned,
        fireEvery = Util.Maths.fireEvery(),
        makeMinMax = Util.Maths.makeMinMax,
        makeOriginMinMax = Util.Maths.makeOriginMinMax,
        smoothing = Util.Maths.smoothing,
        SMOOTHING_AMOUNT = 15,
        smoothRange = Util.Maths.smoothRange({ x: 0, y: 0, z: 0 }, SMOOTHING_AMOUNT, smoothing),
        vec = Util.Maths.vec,
        withinDistance = Util.Maths.withinDistance,
        whereOnRange = Util.Maths.whereOnRange;

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
        resultInBox = false,
        resultInMargin = false,
        check = null,
        name = null,
        initalized = false,
        dispatchZoneID = null,
        STARTUP_TIME = 2000,
        DELTA_UPDATE_INTERVAL = 0.01,
        STEPS_BEFORE_FIRE = 1,
        DISTANCE_TO_IGNORE = 0.0001,
        POSITION_DISTANCE_TO_IGNORE = 0.2,
        MARGIN_CHECK = 0.3,
        IN_BOX = "inBox",
        IN_MARGIN = "inMargin",
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
        originMinMax = {},
        minMaxOffMargin = {},
        originMinMaxOffMargin = {},
        position = {},
        rotation = {},
        positionToCheck = {},
        lastPositionToCheck = {},
        dimensions = {},
        newRange = {},
        oldRange = {},
        smoothedRange = {},
        generatorAccepts = [],
        endPoints = [],
        directionArray = [];

    // Entity Definition
    function DJ_Sensor_Box_Client() {
        self = this;
    }

    DJ_Sensor_Box_Client.prototype = {
        remotelyCallable: [
            'turnOn',
            'turnOff',
            "updateEndPoints",
            'updateDebugCubeID'
        ],
        preload: function (id) {
            entityID = id;
            currentProperties = Entities.getEntityProperties(entityID);
            name = currentProperties.name;
            position = currentProperties.position;
            rotation = currentProperties.rotation;
            dimensions = currentProperties.dimensions;
            dispatchZoneID = currentProperties.parentID;

            userData = currentProperties.userData;
            try {
                userdataProperties = JSON.parse(userData);
                directionArray = userdataProperties.performance.directionArray;
                generatorAccepts = userdataProperties.performance.generatorAccepts;
                DEBUG = userdataProperties.performance.DEBUG;
                if (DEBUG) {
                    debugCubeID = Entities.findEntitiesByName("Set_Phlash_Debug-Cube", position, 10)[0];
                }
            } catch (e) {
                log(LOG_ERROR, "ERROR READING USERDATA", e);
            }

            minMax = makeMinMax(dimensions, position);
            originMinMax = makeOriginMinMax(dimensions);
            minMaxOffMargin = makeMinMax(Vec3.sum(dimensions, vec(MARGIN_CHECK, MARGIN_CHECK, MARGIN_CHECK)), position);
            originMinMaxOffMargin = makeOriginMinMax(Vec3.sum(dimensions, vec(MARGIN_CHECK, MARGIN_CHECK, MARGIN_CHECK)));

        },
        turnOn: function () {
            Script.update.connect(self.onUpdate);
        },
        turnOff: function () {
            Script.update.disconnect(this.onUpdate);
        },
        submitEvent: function (positionToCheck, generator, box) {
            newRange = whereOnRange(positionToCheck, minMax);
            var stringifiedRange = JSON.stringify(newRange);
            var stringifiedDirections = JSON.stringify(directionArray);
            Entities.callEntityServerMethod(dispatchZoneID, "submitEvent",
                [stringifiedRange, stringifiedDirections, generator, box, entityID]
            );
        },
        getGeneratorPosition: function (generator) {
            var generatorPosition;

            switch (generator) {
                case LEFT_HAND:
                    generatorPosition = MyAvatar.getLeftPalmPosition();
                    break;
                case RIGHT_HAND:
                    generatorPosition = MyAvatar.getRightPalmPosition();
                    break;
                case DEBUG_CUBE:
                    generatorPosition = Entities.getEntityProperties(debugCubeID, ['position']).position;
                    break;
                default:
            }
            return generatorPosition;
        },
        onUpdate: function (delta) {
            generatorAccepts.forEach(function (generator) {
                try {
                    positionToCheck = self.getGeneratorPosition(generator);
                    resultInMargin = checkIfInNonAligned(positionToCheck, position, rotation, originMinMaxOffMargin);
                    resultInBox = checkIfInNonAligned(positionToCheck, position, rotation, originMinMax);
                } catch (e) {
                    log(LOG_ERROR, "ERROR TRYING TO GET TARGET POSITION FOR " + generator, e, 1000);
                }
                if (resultInBox) {
                    self.submitEvent(positionToCheck, generator, IN_BOX);
                }
                if (resultInMargin && !resultInBox) {
                    self.submitEvent(positionToCheck, generator, IN_MARGIN);
                }
            });
        },
        unload: function () {
            try {
                Script.update.disconnect(this.onUpdate);
            } catch (e) {
                log(LOG_ERROR, "NO UPDATE TO DISCONNECT");
            }
        },
        updateDebugCubeID: function (id, param) {
            var newDebugCubeID = param[0];
            debugCubeID = newDebugCubeID;
        }
    };

    return new DJ_Sensor_Box_Client();
});
