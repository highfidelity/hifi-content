//  Created by Daniela Fontes (Mimicry) 1/17/2018
//  Copyright 2018 High Fidelity, Inc.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
// 
// 
(function() {
    var utils = Script.require('./utils.js');
    var whiteboardEntities = Script.require('./whiteboardEntities.js');
    var TEMPLATES = whiteboardEntities.WHITEBOARD_ENTITIES.Entities;

    /// TEMPLATES contains a dictionary of different named entity templates. An entity
    /// template is just a list of properties.
    /// 
    /// @param name Name of the template to get
    /// @return {object} The matching template, or null if not found
    function getTemplate(name) {
        for (var i = 0; i < TEMPLATES.length; ++i) {
            if (TEMPLATES[i].name === name) {
                return TEMPLATES[i];
            }
        }
        return null;
    }

    // Cleanup Whiteboard template data
    for (var i = 0; i < TEMPLATES.length; ++i) {
        var template = TEMPLATES[i];

        // Fixup model url
        if (template.type === "Model") {
            var urlParts = template.modelURL.split("/");
            var filename = urlParts[urlParts.length - 1];
            var newURL = Script.resolvePath("models/" + filename);
            template.modelURL = newURL;
        }
    }

    var BLUE_MARKER_NAME = "hifi_model_marker_blue";
    var GREEN_MARKER_NAME = "hifi_model_marker_green";
    var BLACK_MARKER_NAME = "hifi_model_marker_black";
    var RED_MARKER_NAME = "hifi_model_marker_red";
    var PINK_MARKER_NAME = "hifi_model_marker_pink";
    var YELLOW_MARKER_NAME = "hifi_model_marker_yellow";
    var ERASER_NAME = "hifi_model_whiteboardEraser";

    var BLUE_MARKER_COLOR = {red:0, green:13, blue: 255};
    var GREEN_MARKER_COLOR = {red:0, green:190, blue: 90};
    var BLACK_MARKER_COLOR = {red:0, green:0, blue: 0};
    var RED_MARKER_COLOR = {red:255, green:0, blue: 0};
    var PINK_MARKER_COLOR = {red:242, green:0, blue: 255};
    var YELLOW_MARKER_COLOR = {red:255, green:195, blue: 0};

    var blueMarkerID = null;
    var greenMarkerID = null;
    var blackMarkerID = null;
    var redMarkerID = null;
    var pinkMarkerID = null;
    var yellowMarkerID = null;
    var eraserID = null;

    var MARKER_ENTITY_SCRIPT = Script.resolvePath("markerEntityScript.js");
    var ERASER_ENTITY_SCRIPT = Script.resolvePath("eraserEntityScript.js");
    
    var _this;
    
    var strokes = [];
    var strokesInProgress = [];
    var linePointsInProgress = [];
    var normalsInProgress = [];
    var strokeBasePositionInProgress = [];
    var MAX_POINTS_PER_STROKE = 25;
    var MARKER_TEXTURE_URL = Script.resolvePath("markerStroke.png");
    var strokeForwardOffset = 0.01;
    var STROKE_WIDTH_RANGE = {
        min: 0.002,
        max: 0.005
    };
    var STROKE_LIFETIME = 5000;
    var STROKE_DIMENSIONS = {
        x: 10,
        y: 10,
        z: 10
    };

    var RESET_MARKERS_AND_ERASERS_RADIUS = 15;
    var SHORT_TOOL_LIFETIME = 300;
    var TOOL_LIFETIME = 3600;

    var MARKER_EQUIP_HIGHLIGHT_RADIUS = 0.32;
    var ERASER_EQUIP_HIGHLIGHT_RADIUS = 0.35;

    var Whiteboard = function() {
        _this = this;
    };

    Whiteboard.prototype = {
        remotelyCallable: [
            'paint', 
            'resetMarkerStroke', 
            'erase', 
            'clearBoard', 
            'serverAddEntity', 
            'serverEditEntity', 
            'serverSetEntityData', 
            'spawnMarker', 
            'spawnEraser'
        ],
        preload: function(entityID){
            _this.entityID = entityID;
            _this.MIN_DISTANCE_BETWEEN_POINTS = 0.002;
            _this.MAX_DISTANCE_BETWEEN_POINTS = 0.03;
            _this.strokes = [];
            _this.STROKE_NAME = "hifi_polyline_markerStroke";
            _this.WHITEBOARD_SURFACE_NAME = "Whiteboard - Drawing Surface";
            _this.MARKER_COLOR_NAME = "hifi-whiteboardPaint";
            _this.spawnOriginalMarkersAndErasers();
        },
        /// Remotely callable paint function
        /// 
        /// Creates and expand Polyline projected onto the "Whiteboard - Drawing Surface"
        /// 
        /// @param {string} entityID of the server
        /// @param {object} param parameters passed as an array of string 
        /// with the properties of the polyline [position, markerColor, creatorMarker, parentID]
        paint: function(entityID, params) {
            var currentIndex = -1;
            for (var i = 0; i < strokesInProgress.length; i++) {
                if (utils.getEntityUserData(strokesInProgress[i]).creatorMarker === params[2]) {
                    currentIndex = i;
                    break;
                }
            }
            
            // we haven't found the polyline
            if (currentIndex === -1) {
                // build new polyline by starting a new stroke
                _this.startMarkerStroke(params);
                return;
            }
            
            // add new points
            var linePoints = linePointsInProgress[currentIndex];
            var normals = normalsInProgress[currentIndex];
            var strokeWidths = [];
            var strokeBasePosition = strokeBasePositionInProgress[currentIndex];
            var localPoint = utils.parseJSON(params[0]);
            var whiteboardNormal = Entities.getEntityProperties(_this.entityID , "rotation").rotation;
            whiteboardNormal = Vec3.multiply(-1, Quat.getFront(whiteboardNormal));

            var whiteboardPosition = Entities.getEntityProperties(_this.entityID , "position").position;

            // Project localPoint on the Plane defined by whiteboardNormal
            // and whiteboardPosition
            var distanceWhiteboardPlane = Vec3.dot(whiteboardNormal, whiteboardPosition);
            var distanceLocal = Vec3.dot(whiteboardNormal, localPoint) - distanceWhiteboardPlane;
            
            // Projecting local point onto the whiteboard plane
            localPoint = Vec3.subtract(localPoint, Vec3.multiply(distanceLocal, whiteboardNormal));
            localPoint = Vec3.subtract(localPoint, strokeBasePosition);
            localPoint = Vec3.sum(localPoint, Vec3.multiply(whiteboardNormal, strokeForwardOffset));
            
            if (linePoints.length > 0) {
                var distance = Vec3.distance(localPoint, linePoints[linePoints.length - 1]);
                if (distance < _this.MIN_DISTANCE_BETWEEN_POINTS) {
                    return;
                }

                if (distance > _this.MAX_DISTANCE_BETWEEN_POINTS) {
                    strokes.push(strokesInProgress[currentIndex]);
                    strokesInProgress.splice(currentIndex, 1);
                    linePointsInProgress.splice(currentIndex, 1);
                    normalsInProgress.splice(currentIndex, 1);
                    strokeBasePositionInProgress.splice(currentIndex, 1);
                    _this.startMarkerStroke(params);
                    return;
                }
            }
            linePoints.push(localPoint);
            normals.push(whiteboardNormal);

            for (i = 0; i < linePoints.length; i++) {
                // Create a temp array of stroke widths for calligraphy effect - start and end should be less wide
                var pointsFromCenter = Math.abs(linePoints.length / 2 - i);
                var pointWidth = utils.map(pointsFromCenter, 
                    0, 
                    linePoints.length / 2, 
                    STROKE_WIDTH_RANGE.max, 
                    STROKE_WIDTH_RANGE.min
                );
                pointWidth = (STROKE_WIDTH_RANGE.min + STROKE_WIDTH_RANGE.max) / 2;
                strokeWidths.push(pointWidth);
            }
            
            // Edit entity
            Entities.editEntity(strokesInProgress[currentIndex], {
                linePoints: linePoints,
                normals: normals,
                strokeWidths: strokeWidths
            });
            linePointsInProgress[currentIndex] = linePoints;
            normalsInProgress[currentIndex] = normals;
            
            // if reached max number finish line
            if (linePoints.length > MAX_POINTS_PER_STROKE) {
                strokes.push(strokesInProgress[currentIndex]);
                strokesInProgress.splice(currentIndex, 1);
                linePointsInProgress.splice(currentIndex, 1);
                normalsInProgress.splice(currentIndex, 1);
                strokeBasePositionInProgress.splice(currentIndex, 1);
                _this.startMarkerStroke(params);
            }
        },
        /// Create a new stroke (Polyline)
        /// 
        /// Creates new Polyline entity and tries to expand it.
        /// 
        /// @param {object} param parameters passed as an array of string 
        /// with the properties of the polyline [position, markerColor, creatorMarker, parentID]
        startMarkerStroke: function(params) {
            var newStroke = Entities.addEntity({
                type: "PolyLine",
                name: _this.STROKE_NAME,
                dimensions: STROKE_DIMENSIONS,
                position: utils.parseJSON(params[0]),
                color: utils.parseJSON(params[1]),
                textures: MARKER_TEXTURE_URL,
                lifetime: -1,
                userData: JSON.stringify({
                    creatorMarker: params[2],
                    parentBoard: params[3]
                })
            });
            
            linePointsInProgress.push([]);
            normalsInProgress.push([]);
            strokesInProgress.push(newStroke);
            strokeBasePositionInProgress.push(utils.parseJSON(params[0]));
            // continue to expand newly created polyline
            _this.paint(_this.entityID, params);
        },
        /// Remotely callable reset marker stroke function
        /// 
        /// Attempts to stop an ongoing stroke being drawn by a specific marker.
        /// 
        /// @param {string}  entityID of the server
        /// @param {object}  param parameters passed as an array of string 
        /// with the id of the marker that stoped drawing and the drawing surface [creatorMarkerID, drawingSurfaceID]
        resetMarkerStroke: function(entityID, params) {
            var currentIndex = -1;
            for (var i = 0; i < strokesInProgress.length; i++) {
                if (utils.getEntityUserData(strokesInProgress[i]).creatorMarker === params[0]) {
                    currentIndex = i;
                    break;
                }
            }
            // we haven't found the polyline
            if (currentIndex === -1) {
                return;
            }
            // remove stroke information from the current active strokes
            strokes.push(strokesInProgress[currentIndex]);
            strokesInProgress.splice(currentIndex, 1);
            linePointsInProgress.splice(currentIndex, 1);
            normalsInProgress.splice(currentIndex, 1);
            strokeBasePositionInProgress.splice(currentIndex, 1);
        },
        /// Remotely callable erase stroke function
        /// 
        /// Attempts to delete a stroke entity passed in the parameters.
        /// 
        /// @param {string}  entityID of the server
        /// @param {object} param parameters passed as an array of string 
        /// with the id of the stroke to be deleted [strokeID]
        erase: function(entityID, params) {
            Entities.deleteEntity(params[0]);
        },
        /// Remotely callable function that clears the whiteboard
        /// 
        /// Attempts to delete all the spawned markers and erasers,
        /// and respawns the original markers and eraser in the correct positions
        /// 
        /// @param {string}  entityID of the server
        /// @param {object} params not used
        clearBoard: function(entityID, params) {
            _this.resetMarkersAndErasers(_this.entityID, [_this.entityID]);
            _this.spawnOriginalMarkersAndErasers();
        },
        /// Remotely callable function that creates an entity
        /// 
        /// @param {string}  entityID of the server
        /// @param {object} params [properties]
        serverAddEntity: function(entityID, params) {
            Entities.addEntity(utils.parseJSON(params[0]));
        },
        /// Remotely callable function that edits an entity
        /// 
        /// @param {string}  entityID of the server
        /// @param {object} params [entityID, properties]
        serverEditEntity: function(entityID, params) {
            Entities.editEntity(params[0], utils.parseJSON(params[1]));
        },
        /// Remotely callable function that edits an entity
        /// 
        /// @param {string}  entityID of the server
        /// @param {object} params [entityID, userData]
        serverSetEntityData: function(entityID, params) {
            utils.setEntityUserData(params[0], utils.parseJSON(params[1]));
        },
        resetMarkersAndErasers: function(entityID, params) {
            // delete all markers and erasers
            var results = Entities.findEntities(
                Entities.getEntityProperties(_this.entityID, "position").position, 
                RESET_MARKERS_AND_ERASERS_RADIUS
            );
            
            results.forEach(function(entity) {
                var entityName = Entities.getEntityProperties(entity, "name").name;
                if (entityName === ERASER_NAME || 
                    entityName === BLUE_MARKER_NAME || 
                    entityName === GREEN_MARKER_NAME || 
                    entityName === BLACK_MARKER_NAME || 
                    entityName === RED_MARKER_NAME || 
                    entityName === PINK_MARKER_NAME || 
                    entityName === YELLOW_MARKER_NAME) {
                    Entities.deleteEntity(entity);
                }
            });
        },
        spawnOriginalMarkersAndErasers: function() {
            // spawn original markers and erasers
            blueMarkerID = _this.spawnMarkerWithColor(BLUE_MARKER_NAME, BLUE_MARKER_COLOR);
            greenMarkerID = _this.spawnMarkerWithColor(GREEN_MARKER_NAME, GREEN_MARKER_COLOR);
            blackMarkerID = _this.spawnMarkerWithColor(BLACK_MARKER_NAME, BLACK_MARKER_COLOR);
            redMarkerID = _this.spawnMarkerWithColor(RED_MARKER_NAME, RED_MARKER_COLOR);
            pinkMarkerID = _this.spawnMarkerWithColor(PINK_MARKER_NAME, PINK_MARKER_COLOR);
            yellowMarkerID = _this.spawnMarkerWithColor(YELLOW_MARKER_NAME, YELLOW_MARKER_COLOR);
            
            eraserID = null;
            _this.spawnEraser(_this.entityID, [null]);
        },
        /// Remotely callable function that creates a new marker
        /// 
        /// Attempts to spawn a new marker.
        /// This function is called when an original marker is grabbed. 
        /// 
        /// @param {string}  entityID of the server
        /// @param  {object} params [grabbedMarkerID, markerName, markerColor]
        spawnMarker: function(entityID, params) {
            var markerName = utils.parseJSON(params[1]);
            var color = utils.parseJSON(params[2]);

            Entities.editEntity(params[0], {lifetime: SHORT_TOOL_LIFETIME});

            if ( markerName === "hifi_model_marker_blue" && 
                (blueMarkerID === null || params[0] === blueMarkerID)) {
                blueMarkerID = _this.spawnMarkerWithColor(markerName, color);
            } else if ( markerName === "hifi_model_marker_green" && 
                (greenMarkerID === null || params[0] === greenMarkerID)) {
                greenMarkerID = _this.spawnMarkerWithColor(markerName, color);
            } else if ( markerName === "hifi_model_marker_black" && 
                (blackMarkerID === null || params[0] === blackMarkerID)) {
                blackMarkerID = _this.spawnMarkerWithColor(markerName, color);
            } else if ( markerName === "hifi_model_marker_red" && 
                (redMarkerID === null || params[0] === redMarkerID)) {
                redMarkerID = _this.spawnMarkerWithColor(markerName, color);
            } else if ( markerName === "hifi_model_marker_pink" && 
                (pinkMarkerID === null || params[0] === pinkMarkerID)) {
                pinkMarkerID = _this.spawnMarkerWithColor(markerName, color);
            } else if ( markerName === "hifi_model_marker_yellow" && 
                (yellowMarkerID === null || params[0] === yellowMarkerID)) {
                yellowMarkerID = _this.spawnMarkerWithColor(markerName, color);
            }
        },
        /// Remotely callable function that creates a new eraser
        /// 
        /// Attempts to spawn a new eraser.
        /// This function is called when an original eraser is grabbed. 
        /// 
        /// @param {string} entityID of the server
        /// @param {object} params [grabbedEraserID]
        spawnEraser: function(entityID, params) {
            if (eraserID === null || params[0] === eraserID) {
                if (params[0] !== null) {
                    Entities.editEntity(params[0], {lifetime: SHORT_TOOL_LIFETIME});
                }

                var template = getTemplate(ERASER_NAME);
                var rootPosition = Entities.getEntityProperties(_this.entityID, "position").position;
                var currentRotation = Entities.getEntityProperties(_this.entityID, "rotation").rotation;
                var rootRot = getTemplate("Whiteboard")['rotation'];
                var localPos = template['localPosition'];
                var up = Vec3.multiply(Quat.getUp(rootRot), Vec3.dot(localPos, Quat.getUp(rootRot)));
                var front = Vec3.multiply(Quat.getFront(rootRot), Vec3.dot(localPos, Quat.getFront(rootRot)));
                var right = Vec3.multiply(Quat.getRight(rootRot), Vec3.dot(localPos, Quat.getRight(rootRot)));
                var relativePosInWorld = Vec3.sum(Vec3.sum(up, right), front);
                relativePosInWorld = Vec3.multiplyQbyV(currentRotation, relativePosInWorld);
                var finalPosition = Vec3.sum(relativePosInWorld, rootPosition);
                eraserID = Entities.addEntity( {
                    position: finalPosition,
                    rotation: Quat.multiply(
                        Entities.getEntityProperties(_this.entityID, "rotation").rotation,
                        Quat.fromPitchYawRollDegrees(-90, 0, 0)
                    ),
                    script: ERASER_ENTITY_SCRIPT,
                    dimensions: template['dimensions'],
                    gravity: template['gravity'],
                    name: ERASER_NAME,
                    type: "Model",
                    shapeType: "box",
                    collidesWith: "static,dynamic,kinematic",
                    lifetime: TOOL_LIFETIME,
                    queryAACube: template['queryAACube'],
                    modelURL: template['modelURL'],
                    userData: JSON.stringify({
                        grabbableKey: {
                            grabbable: true,
                            ignoreIK: false
                        },
                        equipHotspots: [{
                            position: Vec3.ZERO,
                            radius: ERASER_EQUIP_HIGHLIGHT_RADIUS,
                            joints: {
                                RightHand: [{
                                    x: 0.020,
                                    y: 0.120,
                                    z: 0.049
                                }, {
                                    x: 0.1004,
                                    y: 0.6424,
                                    z: 0.717,
                                    w: 0.250
                                }],
                                LeftHand: [{
                                    x: -0.005,
                                    y: 0.1101,
                                    z: 0.053
                                }, {
                                    x: 0.723,
                                    y: 0.289,
                                    z: 0.142,
                                    w: 0.610
                                }]
                            }
                        }]
                    })
                });
            }
        },
        spawnMarkerWithColor: function(markerName, color) {
            var template = getTemplate(markerName);
            var rootPosition = Entities.getEntityProperties(_this.entityID, "position").position;
            var currentRotation = Entities.getEntityProperties(_this.entityID, "rotation").rotation;
            
            var rootRot = getTemplate("Whiteboard")['rotation'];
            var localPos = template['localPosition'];
            var up = Vec3.multiply(Quat.getUp(rootRot), Vec3.dot(localPos, Quat.getUp(rootRot)));
            var front = Vec3.multiply(Quat.getFront(rootRot), Vec3.dot(localPos, Quat.getFront(rootRot)));
            var right = Vec3.multiply(Quat.getRight(rootRot), Vec3.dot(localPos, Quat.getRight(rootRot)));
            var relativePosInWorld = Vec3.sum(Vec3.sum(up, right), front);
            relativePosInWorld = Vec3.multiplyQbyV(currentRotation, relativePosInWorld);
            var finalPosition = Vec3.sum(relativePosInWorld, rootPosition);
            

            return Entities.addEntity( {
                position: finalPosition,
                rotation: Quat.multiply(
                    Entities.getEntityProperties(_this.entityID, "rotation").rotation,
                    template['rotation']
                ),
                script: MARKER_ENTITY_SCRIPT,
                collidesWith: "static,dynamic,kinematic",
                dimensions: template['dimensions'],
                gravity: template['gravity'],
                name: markerName,
                type: "Model",
                shapeType: "box",
                lifetime: TOOL_LIFETIME,
                queryAACube: template['queryAACube'],
                modelURL: template['modelURL'],
                userData: JSON.stringify({
                    grabbableKey: {
                        grabbable: true,
                        ignoreIK: false
                    },
                    markerColor: color,
                    equipHotspots: [{
                        position: Vec3.ZERO,
                        radius: MARKER_EQUIP_HIGHLIGHT_RADIUS,
                        joints: {
                            RightHand: [{
                                x: 0.001,
                                y: 0.139,
                                z: 0.050
                            },
                            {
                                x: -0.0432,
                                y: 0.7337,
                                z: 0.6693,
                                w: -0.1085
                            }],
                            LeftHand: [{
                                x: 0.007,
                                y: 0.151,
                                z: 0.061
                            },
                            {
                                x: 0.6313,
                                y: 0.4172,
                                z: 0.5253,
                                w: -0.3892
                            }]
                        }
                    }]
                })
            });
        },
        unload: function() {
            _this.resetMarkersAndErasers(_this.entityID, [_this.entityID]);
        }
    };
    return new Whiteboard();
});