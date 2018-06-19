// DJ_Input_Zone_Client.js
//
// Created by Milad Nazeri on 2018-06-19
//
// Copyright 2018 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// Input Zone Server Script

(function () {
    // Init 
    var _entityId,
        currentProps,
        userData,
        userdataProperties,
        targetPosition,
        deltaTotal = 0,
        result,
        check,
        DELTA_UPDATE_INTERVAL = 0.01,
        DEBUG_CUBE = "debugCube",       
        INPUT = "input",
        ENDPOINT = "endPoint",
        LEFT_HAND = "LeftHand",
        RIGHT_HAND = "RightHand",
        IN_BOX_LEFT_HAND = "inBoxLeftHand",
        IN_BOX_RIGHT_HAND = "inBoxRightHand",
        IN_BOX_DEBUG = "inBoxDebug",
        DEBUG = true,        
        NORMAL = 0,
        REVERSE = 1;

    // Polyfill
    Script.require(Script.resolvePath("./Polyfills.js"))();

    // Collections
    var inputs = [],
        endPoints = [],
        debugs = [],
        debugInfo = {};


    // Helper Functions
    function vec(x, y, z) {
        var obj = {};
        obj.x = x;
        obj.y = y;
        obj.z = z;
        return obj;
    }

    function checkIfIn(currentPosition, input) {

        var box = input.minMax;
        var margin = 0.05;
        return (
            (currentPosition.x >= box.xMin - margin && currentPosition.x <= box.xMax + margin) &&
            (currentPosition.y >= box.yMin - margin && currentPosition.y <= box.yMax + margin) &&
            (currentPosition.z >= box.zMin - margin && currentPosition.z <= box.zMax + margin)
        );
    }

    function whereOnRange(currentPosition, minMax) {
        var whereOnRange = {
            x: 0,
            y: 0,
            z: 0
        };
        for (var key in whereOnRange) {
            var minKey = key + "Min";
            var maxKey = key + "Max";
            var min = minMax[minKey];
            var max = minMax[maxKey];
            var maxMinusMin = max - min;
            var currentMinusMin = currentPosition[key] - min;
            var normalizedTotal = currentMinusMin / maxMinusMin;
            whereOnRange[key] = normalizedTotal;
        }
        return whereOnRange;
    }

    function largestAxisVec(dimensions) {
        var dimensionArray = [];
        for (var key in dimensions) {
            dimensionArray.push(dimensions[key]);
        }
        return Math.max.apply(null, dimensionArray);
    }

    function gProps(id, props) {
        if (props) {
            return Entities.getEntityProperties(id, props);
        } else {
            return Entities.getEntityProperties(id);
        }
    }

    function grabEndPointIDsFromGroup(groupID) {
        return endPoints.filter(function(ep) {
            return ep.endPointGroupID === groupID;
        });
    }

    function returnCheck(target) {
        switch (target) {
            case LEFT_HAND:
                return IN_BOX_LEFT_HAND;
                break;
            case RIGHT_HAND:
                return IN_BOX_RIGHT_HAND;
                break;
            case DEBUG_CUBE:
                return IN_BOX_DEBUG;
                break;
        }
    }
    
    function getTargetPosition(target) {
        var targetPosition;
        if (target === LEFT_HAND) {
            targetPosition = MyAvatar.getLeftPalmPosition();
        } else if (target === RIGHT_HAND) {
            targetPosition = MyAvatar.getRightPalmPosition();
        } else {
            targetPosition = debugs[0].getPosition();
        }
        return targetPosition;
    }
    
    // Constructor Functions
    function Input(name, id, position, dimensions, directionArray, endPointGroups) {
        this.name = name;
        this.id = id;
        this.position = position;  
        this.dimensions = dimensions;
        this.directionArray = directionArray;        
        this.endPointGroups = endPointGroups;
        this.endPoints = [];
        this.inBoxLeftHand = false;
        this.inBoxRightRight = false;
        this.minMax = {
            xMin: this.position.x - dimensions.x / 2,
            xMax: this.position.x + dimensions.x / 2,
            yMin: this.position.y - dimensions.y / 2,
            yMax: this.position.y + dimensions.y / 2,
            zMin: this.position.z - dimensions.z / 2,
            zMax: this.position.z + dimensions.z / 2
        };          
    }

    Input.prototype = {
        getEndPoints: function() {
            var allEndpoints = [];
            this.endPointGroups.forEach(function(epg) {
                allEndpoints = allEndpoints.concat(grabEndPointIDsFromGroup(epg));
            });
            this.endPoints = allEndpoints;
            return allEndpoints;
        },
        sendOn: function() {
            this.endPoints.forEach(function(endPoint) {
                Entities.callEntityServerMethod(endPoint.id, 'turnOn');
            });
        },
        sendOff: function() {
            this.endPoints.forEach(function(endPoint) {
                Entities.callEntityServerMethod(endPoint.id, 'turnOff');
            });
        },
        sendEdit: function(currentHandPosition) {
            var range = whereOnRange(currentHandPosition, this.minMax);
            var stringifiedRange = JSON.stringify(range);
            var stringifiedDirections = JSON.stringify(this.directionArray);
            if (DEBUG) {
                debugInfo.range = range;
                debugInfo.position = debugs[0].position;                
                debugs[0].updateOverlay();
            }
            this.endPoints.forEach(function(endPoint) {
                Entities.callEntityServerMethod(
                    endPoint.id, 
                    'edit', 
                    [stringifiedRange, stringifiedDirections]
                );
            });
        }
    };

    function EndPoint(name, id, position, endPointGroupID) {
        this.name = name;
        this.id = id;
        this.position = position;    
        this.endPointGroupID = endPointGroupID;        
    }

    function Debug(name, id) {
        this.name = name;
        this.id = id;
        this.position = Entities.getEntityProperties(this.id, ['position']).position;
        this.overlay = Overlays.addOverlay("text3d", {
            position: Vec3.sum(this.position, vec(0,1,0)),
            parentID: this.id,
            isFacingAvatar: true,
            lineHeight: 0.09,
            text: "test"
        });
    }

    Debug.prototype = {
        getPosition: function() {
            this.position = Entities.getEntityProperties(this.id, ['position']).position;
            return this.position;
        },
        updateOverlay: function() {
            var text = JSON.stringify(debugInfo).split(",").join("\n");
            var props = {
                text: text
            };
            Overlays.editOverlay(this.overlay, props);
        }
    };

    // Procedural Functions
    function scanForInputs() {
        var matchedEnts = [];
        var searchRadius = largestAxisVec(currentProps.dimensions);
        var entList = Entities.findEntities(currentProps.position,searchRadius);
        entList.forEach(function(ent) {
            var userData = gProps(ent, ["userData"]).userData;
            try {
                userData = JSON.parse(userData);
                if (userData.performance) {
                    if (userData.performance.type === INPUT) {
                        var inputProps = gProps(ent);
                        var name = inputProps.name;
                        var id = inputProps.id;
                        var position = inputProps.position;
                        var dimensions = inputProps.dimensions;
                        var endPointGroups = userData.performance.endPointGroups; 
                        var directionArray = userData.performance.directionArray; 
                        matchedEnts.push(
                            new Input(
                                name, 
                                id, 
                                position, 
                                dimensions, 
                                directionArray, 
                                endPointGroups
                            )
                        );
                    }
                }
            } catch (e) {
                console.log(e);
            }
        });
        return matchedEnts;
    }

    function scanForEndpoints() {
        var matchedEnts = [];
        var searchRadius = 100;
        var entList = Entities.findEntities(currentProps.position, searchRadius);
        entList.forEach(function(ent) {
            var userData = gProps(ent, ["userData"]).userData;
            try {
                userData = JSON.parse(userData);
                if (userData.performance) {
                    if (userData.performance.type === ENDPOINT) {
                        var endPointProps = gProps(ent);
                        var name = endPointProps.name;
                        var id = endPointProps.id;
                        var position = endPointProps.position;
                        var endPointGroupID = userData.performance.endPointGroupID; 
                        matchedEnts.push(
                            new EndPoint(name, id, position, endPointGroupID)
                        );
                    }
                }
            } catch (e) {
                console.log(e);
            }
        });
        return matchedEnts;
    }

    function scanForDebugs() {
        var matchedEnts = [];
        var searchRadius = largestAxisVec(currentProps.dimensions);
        var entList = Entities.findEntities(currentProps.position,searchRadius);
        entList.forEach(function(ent) {
            var userData = gProps(ent, ["userData"]).userData;
            try {
                userData = JSON.parse(userData);
                if (userData.performance) {
                    if (userData.performance.type === DEBUG_CUBE) {
                        var inputProps = gProps(ent);
                        var name = inputProps.name;
                        var id = inputProps.id;
                        matchedEnts.push(
                            new Debug(
                                name, 
                                id
                            )
                        );
                    }
                }
            } catch (e) {
                console.log(e);
            }
        });
        return matchedEnts;
    }

    function updateInputsEndPoints() {
        inputs.forEach(function(input) {
            input.getEndPoints();
        });
    }

    function updateInputsAndEndPoints() {
        inputs = scanForInputs();
        endPoints = scanForEndpoints();
        debugs = scanForDebugs();
        updateInputsEndPoints();
    }

    function onUpdate(delta) {
        deltaTotal += delta;
        if (deltaTotal > DELTA_UPDATE_INTERVAL) {
            inputs.forEach(function (input) {
                [LEFT_HAND, RIGHT_HAND, DEBUG_CUBE].forEach(function (target) {
                    targetPosition = getTargetPosition(target);
                    result = checkIfIn(targetPosition, input);
                    check = returnCheck(target);
                    if (target === DEBUG_CUBE) {
                        debugInfo.result = result;
                        debugInfo.check = check;
                    }
                    if (result) {
                        if (!input[check]) {
                            input[check] = true;
                            input.sendOn();
                            
                        } else {
                            input.sendEdit(targetPosition);
                        }
                    } else {
                        if (input[check]) {
                            input.sendOff();
                            input[check] = false;
                        }
                    }
                });
            });
        }

        deltaTotal = 0;
    }

    // Entity Definition
    function DJ_Input_Zone_Client() {
    }

    DJ_Input_Zone_Client.prototype = {
        preload: function (id) {
            _entityId = id;
            currentProps = Entities.getEntityProperties(id);
            userData = currentProps.userData;
            userdataProperties = JSON.parse(userData);
            updateInputsAndEndPoints();
        },
        enterEntity: function () {
            console.log("ENTERING ZONE");
            Script.update.connect(onUpdate);

        },
        leaveEntity: function () {
            console.log("LEAVING ZONE");
            Script.update.disconnect(onUpdate);
        }
    };

    function onScriptEnding() {
        Script.update.disconnect(onUpdate);
    }

    Script.scriptEnding.connect(onScriptEnding);

    return new DJ_Input_Zone_Client();
});