// DJ_Dispatch_Zone_Server.js
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
    var getProps = Util.Entity.getProps,
        getUserData = Util.Entity.getUserData,
        searchForChildren = Util.Entity.searchForChildren;

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
        isOn = false,
        name = null,
        lastHeartBeat = null,
        loadedChildren = false,
        HEARTBEAT_CHECK_INTERVAL = 1500,
        HEARTBEAT_TIMEOUT = 2000,
        heartbeatCheck = null,
        lastEdit = 0,
        LAST_EDIT_TIMEOUT = 2500,
        SEARCH_FOR_CHILDREN_TIMEOUT = 5000,
        SEARCH_FOR_CHILDNAME_TIMEOUT = 1000,
        TURN_ON = "turnOn",
        TURN_OFF = "turnOff",
        EDIT = "edit",
        IN_BOX = "inBox",
        IN_MARGIN = "inMargin",
        GENERATOR = "generator",
        SENSOR = "sensor",
        ENDPOINT = "endPoint",
        DEBUG = false,
        self;

    // Collections
    var currentProperties = {},
        userData = {},
        userdataProperties = {},
        childrenIDS = {},
        avatarsInZone = {},
        childNames = [],
        sensors = [],
        endPoints = [],
        generators = [];

    // Constructor Functions
    function EndPoint(id, endPointGroupID) {
        this.id = id;
        this.endPointGroupID = endPointGroupID;
    }

    EndPoint.prototype = {
        updateDebugCubeID: function (id) {
            Entities.callEntityMethod(this.id, "updateDebugCubeID", [id]);
        },
        turnOn: function () {
            Entities.callEntityMethod(this.id, "turnOn");
        },
        turnOff: function () {
            Entities.callEntityMethod(this.id, "turnOff");
        }
    };

    function Generator(id) {
        this.id = id;
    }

    Generator.prototype = {
        clearDebugEndpointInfo: function () {
            for (var id in avatarsInZone) {
                Entities.callEntityClientMethod(id, this.id, "clearDebugEndpointInfo");
            }
        },
        storeDebugSensorInfo: function (event) {
            for (var id in avatarsInZone) {
                Entities.callEntityClientMethod(id, this.id, "storeDebugSensorInfo", [event]);
            }
        },
        storeDebugEndpointInfo: function (event, name) {
            for (var id in avatarsInZone) {
                Entities.callEntityClientMethod(id, this.id, "storeDebugEndpointInfo", [event, name]);
            }
        },
        turnOn: function () {
            for (var id in avatarsInZone) {
                Entities.callEntityClientMethod(id, this.id, "turnOn");
            }
        },
        turnOff: function () {
            for (var id in avatarsInZone) {
                Entities.callEntityClientMethod(id, this.id, "turnOff");
            }
        }
    };

    function Sensor(id, endPointGroups) {
        this.id = id;
        this.endPointGroups = endPointGroups;
        this.endPoints = [];
        this.currentGenerators = {};
        this.canEdit = false;
        this.activeGenerator = null;
        this.activeUUID = null;
        this.lastEdit = 0;
    }

    Sensor.prototype = {
        grabEndPointIDsFromGroup: function (groupID) {
            return endPoints.filter(function (endPoint) {
                return endPoint.endPointGroupID === groupID;
            });
        },
        getEndPoints: function () {
            var allEndpoints = [];
            this.endPointGroups.forEach(function (endPointGroup) {
                allEndpoints = allEndpoints.concat(this.grabEndPointIDsFromGroup(endPointGroup));
            }, this);
            this.endPoints = allEndpoints;
        },
        updateDebugCubeID: function (debugCubeID) {
            for (var id in avatarsInZone) {
                Entities.callEntityClientMethod(id, this.id, "updateDebugCubeID");
            }
        },
        turnOn: function () {
            for (var id in avatarsInZone) {
                Entities.callEntityClientMethod(id, this.id, "turnOn");
            }
        },
        turnOff: function () {
            for (var id in avatarsInZone) {
                Entities.callEntityClientMethod(id, this.id, "turnOff");
            }
        }
    };

    // Procedural Functions
    // Entity Definition
    function DJ_Dispatch_Zone_Server() {
        self = this;
    }

    DJ_Dispatch_Zone_Server.prototype = {
        remotelyCallable: [
            "clearDebugEndpointInfo",
            "receiveHeartBeat",
            "requestTurnOff",
            "scan",
            "sendEdit",
            "sendOff",
            "sendOn",
            "storeDebugEndpointInfo",
            "storeDebugSensorInfo",
            "submitEvent",
            "turnOff",
            "turnOn",
            "updateComponents"
        ],
        clearDebugEndpointInfo: function (id) {
            generators[0].clearDebugEndpointInfo();
        },
        heartBeatHelper: function () {
            var shouldKeepActive = false,
                now = Date.now(),
                avatars = Object.keys(avatarsInZone);

            avatars.forEach(function(avatar) {
                var timeToCheck = now - avatarsInZone[avatar];
                if (timeToCheck > HEARTBEAT_TIMEOUT) {
                    delete avatarsInZone[avatar];
                } else {
                    shouldKeepActive = true;
                }
            });
            if (!shouldKeepActive) {
                self.turnOff();
            }
        },

        preload: function (id) {
            entityID = id;
            currentProperties = Entities.getEntityProperties(entityID);
            name = currentProperties.name;

            userData = currentProperties.userData;
            try {
                userdataProperties = JSON.parse(userData);
                DEBUG = userdataProperties.performance.DEBUG;

                var childNameTimeOutFunction = function () {
                    userdataProperties = getUserData(entityID);
                    if (!userdataProperties.performance.childNamesUpdated) {
                        Script.setTimeout(childNameTimeOutFunction, SEARCH_FOR_CHILDNAME_TIMEOUT);
                    } else {
                        childNames = userdataProperties.performance.childNames;
                        var childNamesToSearch = Array.prototype.slice.call(childNames);
                        childNames.forEach(function (name) {
                            childrenIDS[name] = null;
                        });

                        var searchCallback = function (children, foundAllEntities, names) {
                            if (foundAllEntities) {
                                loadedChildren = true;
                                Object.keys(children).forEach(function (name) {
                                    childrenIDS[name] = children[name];
                                });
                                self.updateComponents();
                            } else {
                                searchForChildren(entityID, names, searchCallback, SEARCH_FOR_CHILDREN_TIMEOUT, true);
                            }
                        };

                        searchForChildren(entityID, childNamesToSearch, searchCallback, SEARCH_FOR_CHILDREN_TIMEOUT, true);
                    }
                };

                Script.setTimeout(childNameTimeOutFunction, SEARCH_FOR_CHILDNAME_TIMEOUT);


            } catch (e) {
                log(LOG_ERROR, "ERROR READING USERDATA", e);
            }

        },
        receiveHeartBeat: function (id, param) {
            var avatarID = param[0];
            avatarsInZone[avatarID] = Date.now();
            sensors.forEach(function(sensor) {
                if (sensor.canEdit && Date.now() - sensor.lastEdit > LAST_EDIT_TIMEOUT) {
                    var sensorEndpoints = sensor.endPoints;
                    sensor.activeUUID = null;
                    sensor.activeGenerator = null;
                    self.sendOff(sensorEndpoints);
                    sensor.canEdit = false;
                }
            });
        },
        requestTurnOff: function() {
            this.heartBeatHelper();
        },
        returnSensorIndex: function (id) {
            var foundIndex;
            sensors.forEach(function(sensor, index) {
                if (sensor.id === id) {
                    foundIndex = index;
                }
            });
            return foundIndex;
        },
        scan: function () {
            var foundSensors = [];
            var foundEndPoints = [];
            var foundGenerators = [];

            childNames.forEach(function (name) {
                var idToCheck = childrenIDS[name];
                var properties = getProps(idToCheck);
                try {
                    var userData = JSON.parse(properties.userData);
                    var id = properties.id;
                    if (userData.performance.type === SENSOR) {
                        var endPointGroups = userData.performance.endPointGroups;
                        foundSensors.push(new Sensor(id, endPointGroups));
                    }
                    if (userData.performance.type === ENDPOINT) {
                        var endPointGroupID = userData.performance.endPointGroupID;
                        foundEndPoints.push(new EndPoint(id, endPointGroupID));
                    }
                    if (userData.performance.type === GENERATOR) {
                        foundGenerators.push(new Generator(id));
                        if (properties.name.indexOf("Debug-Cube") > -1) {
                            debugCubeID = id;
                        }
                    }
                } catch (e) {
                    log(LOG_ERROR, "PARSE ERROR LOOKING FOR USERDATA", e);
                }
            });
            sensors = foundSensors;
            endPoints = foundEndPoints;
            generators = foundGenerators;
        },
        sendEdit: function (groupEndPoints, range, direction) {
            groupEndPoints.forEach(function(endPoint) {
                Entities.callEntityMethod(
                    endPoint.id, 
                    'edit', 
                    [range, direction]
                );
            });
            if (DEBUG) {
                this.storeDebugSensorInfo(range);
            }
        },
        sendOff: function (groupEndPoints) {
            groupEndPoints.forEach(function(endPoint) {
                Entities.callEntityMethod(endPoint.id, 'turnOff');
            });
            if (DEBUG) {
                this.clearDebugEndpointInfo();
            }
        },
        sendOn: function (groupEndPoints) {
            groupEndPoints.forEach(function(endPoint) {
                Entities.callEntityMethod(endPoint.id, 'turnOn');
            });
            if (DEBUG) {
                this.clearDebugEndpointInfo();
            }
        },
        storeDebugEndpointInfo: function (id, parm) {
            generators[0].storeDebugEndpointInfo(parm[0], parm[1]);
        },
        storeDebugSensorInfo: function (range) {
            generators[0].storeDebugSensorInfo(range);
        },
        submitEvent: function (id, param) {
            var range = param[0],
                direction = param[1],
                generator = param[2],
                box = param[3],
                sensorID = param[4],
                uuid = param[5];    
            
            var sensorIndex = this.returnSensorIndex(sensorID);
            var sensor = sensors[sensorIndex];
            var sensorEndpoints = sensors[sensorIndex].endPoints;

            if (box === IN_BOX) {
                if (!sensor.activeUUID && !sensor.activeGenerator) {
                    sensor.activeUUID = uuid;
                    sensor.activeGenerator = generator;
                    this.sendOn(sensorEndpoints);
                    sensors[sensorIndex].canEdit = true;
                    return;
                }
                if (sensor.activeGenerator === generator && 
                    sensor.activeUUID === uuid &&
                    sensor.canEdit) {
                    sensor.lastEdit = Date.now();
                    this.sendEdit(sensorEndpoints, range, direction);
                    return;
                }
            }

            if (box === IN_MARGIN) {
                if (sensor.activeUUID === uuid &&
                    sensor.activeGenerator === generator) {
                    sensor.activeUUID = null;
                    sensor.activeGenerator = null;
                    this.sendOff(sensorEndpoints);
                    sensor.canEdit = false;
                }
            }
        },
        turnOff: function () {

            isOn = false;
            if (heartbeatCheck) {
                Script.clearInterval(heartbeatCheck);
                heartbeatCheck = null;
            }
            sensors.forEach(function (sensor) {
                sensor.turnOff();
            });
            generators.forEach(function (generator) {
                generator.turnOff();
            });
            endPoints.forEach(function (endPoint) {
                endPoint.turnOff();
            });
        },
        turnOn: function (id, param) {
            var avatarID = param[0];
            avatarsInZone[avatarID] = Date.now();
            log(LOG_ENTER, "Turn on activated", avatarsInZone);

            if (isOn) {
                return;
            } else {
                isOn = true;
                sensors.forEach(function (sensor) {
                    sensor.turnOn();
                });
                generators.forEach(function (generator) {
                    generator.turnOn();
                });
                heartbeatCheck = Script.setInterval( function() {
                    self.heartBeatHelper();
                }, HEARTBEAT_CHECK_INTERVAL);
            }
        },
        unload: function () {
            if (heartbeatCheck) {
                Script.clearInterval(heartbeatCheck);
            }
            this.turnOff();
        },
        updateComponents: function () {
            this.scan();
            this.updateDispatch();
            if (DEBUG) {
                this.updateDebugCubeID(debugCubeID);
            }
        },
        updateDebugCubeID: function (debugCubeID) {
            sensors.forEach(function (sensor) {
                sensor.updateDebugCubeID(debugCubeID);
            });
        },
        updateDispatch: function () {
            sensors.forEach(function (sensor) {
                sensor.getEndPoints();
            });
        }
    };

    return new DJ_Dispatch_Zone_Server();
});
