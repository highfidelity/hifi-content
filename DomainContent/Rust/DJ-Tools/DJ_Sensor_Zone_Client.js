// DJ_Sensor_Zone_Client.js
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
    var getProps = Util.Entity.getProps;

    function grabEndPointIDsFromGroup(groupID) {
        return endPoints.filter(function(endPoint) {
            return endPoint.endPointGroupID === groupID;
        });
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
        debugCubeID = null,
        name = null,
        GENERATOR = "generator",       
        SENSOR = "sensor",
        ENDPOINT = "endPoint",
        DEBUG = false,
        self;

    // Collections
    var currentProperties = {},
        userData = {},
        userdataProperties = {},
        sensors = [],
        endPoints = [],
        generators = [];

    // Constructor Functions
    function EndPoint(id, endPointGroupID) {
        this.id = id;
        this.endPointGroupID = endPointGroupID;        
    }

    EndPoint.prototype = {
        updateDebugCubeID: function(id) {
            Entities.callEntityServerMethod(this.id, "updateDebugCubeID", [id]);
        }
    };
    function Generator(id) {
        this.id = id;
    }

    Generator.prototype = {
        turnOn: function() {
            Entities.callEntityMethod(this.id, "turnOn");
        },
        turnOff: function() {
            Entities.callEntityMethod(this.id, "turnOff");
        }
    };

    function Sensor(id, endPointGroups) {
        this.id = id;
        this.endPointGroups = endPointGroups;
        this.endPoints = [];
    }

    Sensor.prototype = {
        getEndPoints: function() {
            var allEndpoints = [];
            this.endPointGroups.forEach(function(endPointGroup) {
                allEndpoints = allEndpoints.concat(grabEndPointIDsFromGroup(endPointGroup));
            });
            this.endPoints = allEndpoints;
        },
        updateClientEndPoints: function() {
            var stringifiedEndPoints = JSON.stringify(this.endPoints);
            Entities.callEntityMethod(this.id, "updateEndPoints", [stringifiedEndPoints]);
        },
        updateDebugCubeID: function(id) {
            Entities.callEntityMethod(this.id, "updateDebugCubeID", [id]);
        },
        turnOn: function() {
            Entities.callEntityMethod(this.id, "turnOn");
        },
        turnOff: function() {
            Entities.callEntityMethod(this.id, "turnOff");
        }
    };

    // Procedural Functions
    function scan() {
        var foundSensors = [];
        var foundEndPoints = [];
        var foundGenerators = [];
        var searchRadius = 100;
        var entityList = Entities.findEntities(currentProperties.position, searchRadius);
        entityList.forEach(function(ent) {
            var userData = getProps(ent, ["userData"]).userData;
            try {
                userData = JSON.parse(userData);
                if (userData.performance) {
                    if (userData.performance.type === SENSOR) {
                        var sensorProps = getProps(ent);
                        var id = sensorProps.id;
                        var endPointGroups = userData.performance.endPointGroups; 
                        foundSensors.push(new Sensor(id, endPointGroups));
                    }
                    if (userData.performance.type === ENDPOINT) {
                        var endPointProps = getProps(ent);
                        var id = endPointProps.id;
                        var endPointGroupID = userData.performance.endPointGroupID; 
                        foundEndPoints.push(new EndPoint(id, endPointGroupID));
                    }
                    if (userData.performance.type === GENERATOR) {
                        var generatorProps = getProps(ent);
                        var id = generatorProps.id;
                        foundGenerators.push(new Generator(id));
                        if (generatorProps.name.indexOf("Debug-Cube") > -1) {
                            debugCubeID = id;
                        }
                    }
                }
            } catch (e) {
                log(LOG_ERROR, "PARSE ERROR LOOKING FOR USERDATA", e);
            }
        });
        sensors = foundSensors;
        endPoints = foundEndPoints;
        generators = foundGenerators;
    }

    function updateDebugCubeID(debugCubeID) {
        sensors.forEach(function(sensor) {
            sensor.updateDebugCubeID(debugCubeID);
        });
        endPoints.forEach(function(endPoint) {
            endPoint.updateDebugCubeID(debugCubeID);
        });
    }

    function updateDispatch() {
        sensors.forEach(function(sensor) {
            sensor.getEndPoints();
            sensor.updateClientEndPoints();
        });
    }

    function updateComponents() {
        scan();
        updateDispatch();
        if (DEBUG) {
            Script.setTimeout(function() { 
                updateDebugCubeID(debugCubeID);
            }, 1000);
        }
    }

    function turnOn() {
        sensors.forEach(function(sensor) {
            sensor.turnOn();
        });
        generators.forEach(function(generator) {
            generator.turnOn();
        });
    }

    function turnOff() {
        sensors.forEach(function(sensor) {
            sensor.turnOff();
        });
        generators.forEach(function(generator) {
            generator.turnOff();
        });
    }

    // Entity Definition
    function DJ_Sensor_Zone_Client() {
        self = this;
    }

    DJ_Sensor_Zone_Client.prototype = {
        remotelyCallable: [
        ],
        preload: function (id) {
            entityID = id;
            currentProperties = Entities.getEntityProperties(entityID);
            name = currentProperties.name;

            userData = currentProperties.userData;
            try {
                userdataProperties = JSON.parse(userData);
                DEBUG = userdataProperties.performance.DEBUG;
            } catch (e) {
                log(LOG_ERROR, "ERROR READING USERDATA", e);
            }
            updateComponents();
        },
        enterEntity: function () {
            turnOn();
        },
        leaveEntity: function () {
            turnOff();
        }
    };
    function onScriptEnding() {
    }

    Script.scriptEnding.connect(onScriptEnding);

    return new DJ_Sensor_Zone_Client();
});
