//
//  eraserEntityScript.js
//
//  Created by Eric Levin on 2/17/15.
//  Additions by James B. Pollack @imgntn 6/9/2016
//  Modified by Daniela Fontes (Mimicry) 2/9/2018
//  Copyright 2018 High Fidelity, Inc.
//
//  This entity script provides logic for an object with attached script to erase nearby marker strokes
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {

    var wantDebug = false;
    
    var _this;

    var isErasing = false;
    var isMouseDown = false;

    var ERASER_HIT_BOARD_SOUND = SoundCache.getSound(Script.resolvePath('sfx/eraserHitBoard.wav'));

    var ERASER_SOUND_VOLUME = 0.6;

    var HAPTIC_PARAMETERS = {
        strength: 1,
        duration: 70,
        hand: 2
    };
    
    var SURFACE_OFFSET = 0.01;
    var hand = 2;

    var lineResolution = 0.008;

    var BLUE_MARKER_NAME = "hifi_model_marker_blue";
    var GREEN_MARKER_NAME = "hifi_model_marker_green";
    var BLACK_MARKER_NAME = "hifi_model_marker_black";
    var RED_MARKER_NAME = "hifi_model_marker_red";
    var PINK_MARKER_NAME = "hifi_model_marker_pink";
    var YELLOW_MARKER_NAME = "hifi_model_marker_yellow";
    var ERASER_NAME = "hifi_model_whiteboardEraser";

    var Eraser = function() {
        _this = this;
        _this.equipped = false;
        _this.desktopEquipped = false;
        _this.STROKE_NAME = "hifi_polyline_markerStroke";
        _this.ERASER_TO_STROKE_SEARCH_RADIUS = 0.0032;
        _this.WHITEBOARD_NAME = "Whiteboard";
        _this.WHITEBOARD_SURFACE_NAME = "Whiteboard - Drawing Surface";
        _this.WHITEBOARD_SEARCH_RADIUS = 5;
        _this.whiteboard = null;
        _this.whiteboardNormal = null;

    };
    
    // UUID: {numberPoints: 12, highResolution: [], pointIndex: []}
    var strokeHighResolutionCache = {};
    var lastEraserPosition;

    var throttleLockFindPoints = true;
    var throttleLockUpdatePosition = true; 
    // Performance Debug
    var totalThrottled = 0;
    var totalCalled = 0.00001;
    // 2 / 60.0 *1000
    var throttleTimeoutMSFindPoints = 33.3;
    function throttle(callback , throttleLock, throttleTimeoutMS) {
        if (wantDebug) {
            totalCalled += 1;
        }
        if (throttleLock) {
            throttleLock = false;
            Script.setTimeout(function () {
                throttleLock = true;
            }, throttleTimeoutMS);
            if (callback !== undefined) {
                callback();
            }
            if (wantDebug) {
                totalThrottled += 1;
                print("Throttle percentage : " + totalThrottled/totalCalled);
            }
        }
    }

    Eraser.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            lastEraserPosition = Entities.getEntityProperties(_this.entityID, "position").position;
            Controller.mousePressEvent.connect(_this.mousePressEvent);
            Controller.mouseMoveEvent.connect(_this.mouseMoveEvent);
            Controller.mouseReleaseEvent.connect(_this.mouseReleaseEvent);
        },
        startNearGrab: function() {
            if (!HMD.active) {
                return;
            }
            _this.findWhiteboard();
            var serverID = _this.whiteboard;
            Entities.callEntityServerMethod(serverID, 'spawnEraser', [_this.entityID]);
        },
        findWhiteboard: function() {
            var results = Entities.findEntities(
                Entities.getEntityProperties(_this.entityID, "position").position,
                _this.WHITEBOARD_SEARCH_RADIUS
            );
            results.forEach(function(entity) {
                var entityName = Entities.getEntityProperties(entity, "name").name;
                if (entityName === _this.WHITEBOARD_NAME) {
                    _this.whiteboard = entity;
                    return;
                }
            });
        },
        continueNearGrab: function(entityID, paramsArray) {
            _this.eraserPosition = Entities.getEntityProperties(_this.entityID, "position").position;
            hand = paramsArray[0] === 'left' ? 0 : 1;
            _this.continueHolding();
        },
        continueHolding: function() {
            // var results = Entities.findEntities(_this.eraserPosition, _this.ERASER_TO_STROKE_SEARCH_RADIUS);
            // Create a map of stroke entities and their positions
            if (_this.whiteboard === null) {
                _this.findWhiteboard();
            }
            
            // RPC - calling server to erase
            _this.eraserPosition = Entities.getEntityProperties(_this.entityID, "position").position;
           
            if (Vec3.distance(lastEraserPosition, _this.eraserPosition) > lineResolution * 2) {
                lastEraserPosition = _this.eraserPosition;
                throttle(_this.pointsWithInBoundsOfEraser, throttleLockFindPoints, throttleTimeoutMSFindPoints);
            }
            
        },
        startEquip: function() {
            if (!HMD.active) {
                return;
            }
            _this.equipped = true;
            _this.startEquipTime = Date.now();
            _this.startNearGrab();
        },
        continueEquip: function(entityID, paramsArray) {
            if (!HMD.active) {
                return;
            }
            _this.continueNearGrab(entityID, paramsArray);
        },
        releaseEquip: function() {
            if (!HMD.active) {
                return;
            }
            _this.equipped = false;
        },
        // MOUSE DESKTOP COMPATIBILITY
        clickDownOnEntity: function(entityID, mouseEvent) {
            if (HMD.active) {
                return;
            }
            
            _this.findWhiteboard();
            
            // Edit entity in a server-sided way and create a new eraser if this is the original one
            var serverID = _this.whiteboard;
            Entities.callEntityServerMethod(serverID, 'serverEditEntity', 
                [_this.entityID, JSON.stringify({collisionless: true, grabbable: false})]
            );
            Entities.callEntityServerMethod(serverID, 'spawnEraser', [_this.entityID]);

            _this.whiteboards = [];
            
            var eraserProps = Entities.getEntityProperties(_this.entityID);
            var eraserPosition = eraserProps.position;
            var results = Entities.findEntities(eraserPosition, _this.WHITEBOARD_SEARCH_RADIUS);
            results.forEach(function(entity) {
                var entityName = Entities.getEntityProperties(entity, "name").name;
                if (entityName === _this.WHITEBOARD_SURFACE_NAME) {
                    _this.whiteboards.push(entity);
                }
            });
            
            if (_this.desktopEquipped) {
                isMouseDown = true;
            }
            _this.desktopEquipped = true;
            Settings.setValue('io.highfidelity.isEditing', true);

        },
        mousePressEvent: function(event) {
            if (_this.desktopEquipped) {
                isMouseDown = true;

                var pickRay = Camera.computePickRay(event.x, event.y);
                var toolIntersection = Entities.findRayIntersection(pickRay, true, [], [_this.entityID], true, true);
                if (toolIntersection.intersects) {
                    var entityName = Entities.getEntityProperties(toolIntersection.entityID, "name").name;
                    
                    if (entityName === ERASER_NAME || 
                        entityName === BLUE_MARKER_NAME || 
                        entityName === GREEN_MARKER_NAME || 
                        entityName === BLACK_MARKER_NAME || 
                        entityName === RED_MARKER_NAME || 
                        entityName === PINK_MARKER_NAME || 
                        entityName === YELLOW_MARKER_NAME) {
                        // unequip and delete
                        _this.desktopEquipped = false;
                        _this.findWhiteboard();
                        var serverID = _this.whiteboard;
                        isMouseDown = false;
                        Settings.setValue('io.highfidelity.isEditing', false);
                        // delete marker
                        Entities.callEntityServerMethod(serverID, 
                            'erase', 
                            [_this.entityID]
                        );
                    }
                }
            }
        },
        mouseMoveEvent: function(event) {
            var serverID;
            if (_this.desktopEquipped && event.x !== undefined) {
                var pickRay = Camera.computePickRay(event.x, event.y);
                var whiteBoardIntersection = Entities.findRayIntersection(pickRay, true, _this.whiteboards);
                
                if (whiteBoardIntersection.intersects) {
                    var results = Entities.findEntities(whiteBoardIntersection.intersection, SURFACE_OFFSET);

                    if (!isMouseDown && isErasing) {
                        isErasing = false;
                    }
                    
                    var BreakException = {};
                    try {
                        results.forEach(function(entity) {
                            var entityName = Entities.getEntityProperties(entity, "name").name;
                            if (entityName === _this.WHITEBOARD_SURFACE_NAME) {
                                _this.whiteboard = entity;
                                isErasing = true;
                                throw BreakException;
                            }
                        });
                    } catch (e) {
                        if (e !== BreakException) {
                            throw e;
                        }
                    }
                    
                    if (isErasing) {
                        var whiteboardRotation = Entities.getEntityProperties(_this.whiteboard, "rotation").rotation;
                        _this.whiteboardNormal = Quat.getFront(whiteboardRotation);

                        serverID = Entities.getEntityProperties(_this.whiteboard, "parentID").parentID;
                        
                        if (throttleLockUpdatePosition) {
                            Entities.callEntityServerMethod(
                                serverID, 
                                'serverEditEntity', 
                                [_this.entityID, 
                                    JSON.stringify({
                                        position: whiteBoardIntersection.intersection,
                                        rotation:  Quat.multiply(whiteboardRotation, Quat.fromPitchYawRollDegrees(90, 0, 45))
                                    })]
                            );
                        }
                        throttle(undefined, throttleLockUpdatePosition, throttleTimeoutMSFindPoints);
                        
                        if (isMouseDown) {
                            _this.eraserPosition = Entities.getEntityProperties(_this.entityID, "position").position;
                            if (Vec3.distance(lastEraserPosition, _this.eraserPosition) > lineResolution * 2) {
                                lastEraserPosition = _this.eraserPosition;
                                throttle(_this.pointsWithInBoundsOfEraser, throttleLockFindPoints, throttleTimeoutMSFindPoints);
                            }
                        } else {
                            isErasing = false;
                        }
                    }
                } else {
                    _this.desktopEquipped = false;
                    _this.findWhiteboard();
                    serverID = _this.whiteboard;
                    isMouseDown = false;
                    Settings.setValue('io.highfidelity.isEditing', false);
                    // delete marker
                    Entities.callEntityServerMethod(serverID, 
                        'erase', 
                        [_this.entityID]
                    );
                }
            }
        },
        mouseReleaseEvent: function(serverID, position) {
            if (isMouseDown) {              
                isMouseDown = false;
            }
        },
        pointsWithInBoundsOfEraser: function() {
            
            // find nearby strokes with a big margin
            var nearbyStrokes = Entities.findEntitiesByName("hifi_polyline_markerStroke", 
                _this.eraserPosition, 
                Entities.getEntityProperties(_this.whiteboard, "dimensions").dimensions.x / 2.0, 
                true
            );
        
            
            var serverID = _this.whiteboard;
            
            
            // Get projection vectors taking into account the eraser position and rotation
            var rotation = Quat.normalize(Entities.getEntityProperties(_this.entityID, "rotation").rotation);
            
            var eraserUp = Quat.getRight(rotation);
            var eraserRight = Quat.getFront(rotation);
            // var eraserDepth = Quat.getUp(rotation);
            var eraserHalfDimensionUp = Entities.getEntityProperties(_this.entityID, "dimensions").dimensions.x / 4.0;
            var eraserHalfDimensionRight = Entities.getEntityProperties(_this.entityID, "dimensions").dimensions.z / 2.0;
            // var eraserHalfDimensionDepth = Entities.getEntityProperties(_this.entityID, "dimensions").dimensions.y / 2.0;
            if (_this.desktopEquipped) {
                serverID = Entities.getEntityProperties(_this.whiteboard, "parentID").parentID;
            } 
           
            eraserUp = Vec3.sum(eraserUp, _this.eraserPosition);
            eraserRight = Vec3.sum(eraserRight, _this.eraserPosition);
            // eraserDepth = Vec3.sum(eraserDepth, _this.eraserPosition);
            var lengthEraserUp = Vec3.dot(eraserUp, eraserUp);
            var lengthEraserRight = Vec3.dot(eraserRight, eraserRight);
            // lengthEraserDepth = Vec3.dot(eraserDepth, eraserDepth);
            
            nearbyStrokes.forEach(function(stroke) {
                // get highResolutionCache
                var points = _this.getHighResolutionPointCache(stroke);
                // get strokeBasePosition in order to convert the local polyline points into world coordinates
                var strokeBasePosition = Entities.getEntityProperties(stroke, "position").position;
                
                var i, j, k;
                var pointSegments = [];
                
                if (points !== undefined){
                    // segments contains arrays with the begining and ending of line segments 
                    // that won't be deleted [[0,10], [20,35]]
                    var segments = [];
                    // for each point check whether it's outside the eraser volume/area
                    for (i = 0; i < points.length; i++) {
                        var point = Vec3.subtract(Vec3.sum(points[i], strokeBasePosition), _this.eraserPosition);
                        var keepPoint = false;
                        if (Vec3.length(point) < eraserHalfDimensionRight) {
                            var projectionUp = Vec3.length(Vec3.multiply(
                                (Vec3.dot(point, eraserUp) / lengthEraserUp), 
                                eraserUp
                            ));
                            if (projectionUp < eraserHalfDimensionUp) {
                                var projectionRight = Vec3.length(Vec3.multiply(
                                    (Vec3.dot(point, eraserRight) / lengthEraserRight), 
                                    eraserRight
                                ));
                                if (!(projectionRight < eraserHalfDimensionRight)) {
                                    keepPoint = true;
                                }
                            } else {
                                keepPoint = true;
                            }
                        } else {
                            keepPoint = true;
                        }
                        
                        var currentSegment = segments[segments.length - 1];
                        if (keepPoint) {
                            if (segments.length === 0) {
                                segments.push([i]);
                            } else if (currentSegment.length === 2) {
                                segments.push([i]);
                            } else if ( i === points.length - 1) {
                                currentSegment.push(i);
                            }
                        } else if (segments.length > 0) {
                            if (currentSegment.length === 1) {
                                currentSegment.push(i-1);
                            }
                        }
                    }
                    
                    var keepLinePointIndexes = [];
                    var keepInclusivePointIndexes = [];
                    var startingCount = keepLinePointIndexes.length;
                    var lastInclusive = 0;
                    var linePointsIndex;
                    if (segments.length === 0) {
                        // delete entire line segment
                        // RPC - calling server to erase
                        Entities.callEntityServerMethod(serverID, 'erase', [stroke]);
                        Audio.playSound(ERASER_HIT_BOARD_SOUND, {
                            position: _this.eraserPosition,
                            volume: ERASER_SOUND_VOLUME
                        });
                        if (!_this.desktopEquipped) {
                            Controller.triggerHapticPulse(
                                HAPTIC_PARAMETERS.strength, 
                                HAPTIC_PARAMETERS.duration, 
                                hand
                            );
                        }
                    } else if (segments.length === 1){
                        if (!(segments[0][0] === 0 && segments[0][1] === points.length - 1)) {
                            linePointsIndex = strokeHighResolutionCache[stroke].pointIndex;
                            keepLinePointIndexes = [];
                            keepInclusivePointIndexes = [];
                            startingCount = keepLinePointIndexes.length;
                            lastInclusive = 0;
                            for (j = segments[0][0] ; j <= segments[0][1] ; j++) {
                                if (linePointsIndex[j] !== undefined) {
                                    if (startingCount === keepLinePointIndexes.length) {
                                        keepLinePointIndexes.push(linePointsIndex[j]);
                                        if (j === segments[0][0]) {
                                            keepInclusivePointIndexes.push(true);
                                        } else {
                                            keepInclusivePointIndexes.push(false);
                                        }
                                    } else if (startingCount < keepLinePointIndexes.length) {
                                        lastInclusive = j;
                                    }
                                }
                            }
                            if (lastInclusive === segments[0][1]) {
                                keepLinePointIndexes.push(linePointsIndex[lastInclusive]);
                                keepInclusivePointIndexes.push(true);
                            } else {
                                keepLinePointIndexes.push(linePointsIndex[lastInclusive]);
                                keepInclusivePointIndexes.push(false);
                            }
                            
                            // get new line points from segments
                            pointSegments = [];
                            for (i = 0 ; i < segments.length; i++) {
                                pointSegments[i] = [];
                                pointSegments[i][0] = points[segments[i][0]];
                                pointSegments[i][1] = points[segments[i][1]];
                            }
                            
                            // RPC - calling server to delete and split the lines
                            Entities.callEntityServerMethod(serverID, 
                                'reeditStroke', 
                                [stroke, 
                                    JSON.stringify(pointSegments), 
                                    JSON.stringify(keepLinePointIndexes), 
                                    JSON.stringify(keepInclusivePointIndexes)
                                ]
                            );
                            
                        }
                    } else {
                        linePointsIndex = strokeHighResolutionCache[stroke].pointIndex;
                        for (k = 0 ; k < segments.length ; k++) {
                            startingCount = keepLinePointIndexes.length;
                            lastInclusive = 0;
                            for (j = segments[k][0] ; j <= segments[k][1] ; j++) {
                                if (linePointsIndex[j] !== undefined) {
                                    if (startingCount === keepLinePointIndexes.length) {
                                        keepLinePointIndexes.push(linePointsIndex[j]);
                                        lastInclusive = j;
                                        if (j === segments[k][0]) {
                                            keepInclusivePointIndexes.push(true);
                                        } else {
                                            keepInclusivePointIndexes.push(false);
                                        }
                                    } else if (startingCount < keepLinePointIndexes.length) {
                                        lastInclusive = j;
                                    }
                                }
                            }
                            
                            if (lastInclusive === segments[k][1]) {
                                keepLinePointIndexes.push(linePointsIndex[lastInclusive]);
                                keepInclusivePointIndexes.push(true);
                            } else {
                                keepLinePointIndexes.push(linePointsIndex[lastInclusive]);
                                keepInclusivePointIndexes.push(false);
                            }
                        }
                        
                        // get new line points from segments
                        pointSegments = [];
                        for (i = 0 ; i < segments.length; i++) {
                            pointSegments[i] = [];
                            pointSegments[i][0] = points[segments[i][0]];
                            pointSegments[i][1] = points[segments[i][1]];
                        }
                        
                        // RPC - calling server to delete and split the lines
                        Entities.callEntityServerMethod(serverID, 
                            'reeditStroke',
                            [stroke, 
                                JSON.stringify(pointSegments), 
                                JSON.stringify(keepLinePointIndexes), 
                                JSON.stringify(keepInclusivePointIndexes)
                            ]
                        );
                    }
                } else {
                    // line has less than 1 point
                    // RPC - calling server to erase
                    Entities.callEntityServerMethod(serverID, 'erase', [stroke]);
                }
            });    
        },
        getHighResolutionPointCache: function(strokeID) {
            var hires;
            if (strokeHighResolutionCache[strokeID] === undefined) {
                hires = _this.createHighResolutionPointCache(strokeID);
            } else {
                var currentNumberPoints = Entities.getEntityProperties(strokeID, "linePoints").linePoints;
                if (currentNumberPoints === undefined) {
                    return undefined;
                } else {
                    currentNumberPoints = currentNumberPoints.length;
                }
                var cachedNumberPoints = strokeHighResolutionCache[strokeID].numberPoints;
                hires = strokeHighResolutionCache[strokeID].highResolutionLinePoints;
                if (currentNumberPoints !== cachedNumberPoints) {
                    hires = _this.createHighResolutionPointCache(strokeID);
                }
            }
            return hires;
        },
        createHighResolutionPointCache: function (lineID) {
            var linePoints = Entities.getEntityProperties(lineID, "linePoints").linePoints;
            if (linePoints === undefined) {
                return undefined;
            }
            var highResolutionLinePoints = [linePoints[0]];
            var pointIndex = {};
            if (linePoints.length <= 1) {
                return undefined;
            } 
            pointIndex[0] = 0;
            for (var i = 1; i < linePoints.length; i++) {
                var lineGenerator = Vec3.normalize(Vec3.subtract(linePoints[i], linePoints[i-1]));
                var segmentSize = Vec3.distance(linePoints[i], linePoints[i-1]);
                
                var highResolutionIncrement = lineResolution;
                var nextPoint = Vec3.sum(linePoints[i-1], Vec3.multiply(highResolutionIncrement, lineGenerator));
                while (Vec3.distance(nextPoint, linePoints[i-1]) < segmentSize){
                    highResolutionLinePoints.push(nextPoint);
                    highResolutionIncrement += lineResolution;
                    nextPoint = Vec3.sum(linePoints[i-1], Vec3.multiply(highResolutionIncrement, lineGenerator));
                }
                
                highResolutionLinePoints.push(linePoints[i]);
                pointIndex[highResolutionLinePoints.length -1] = i;
            }
            
            if (strokeHighResolutionCache[lineID] === undefined) {
                strokeHighResolutionCache[lineID] = {
                    numberPoints: Entities.getEntityProperties(lineID, "linePoints").linePoints.length,
                    highResolutionLinePoints: highResolutionLinePoints,
                    pointIndex: pointIndex
                };
            } else {
                strokeHighResolutionCache[lineID].numberPoints = Entities.getEntityProperties(
                    lineID, 
                    "linePoints"
                ).linePoints.length;
                strokeHighResolutionCache[lineID].pointIndex = pointIndex;
                strokeHighResolutionCache[lineID].highResolutionLinePoints = highResolutionLinePoints;
            }

            return highResolutionLinePoints;
        },
        unload: function() {
            Controller.mousePressEvent.disconnect(_this.mousePressEvent);
            Controller.mouseMoveEvent.disconnect(_this.mouseMoveEvent);
            Controller.mouseReleaseEvent.disconnect(_this.mouseReleaseEvent);
        }
    };

    return new Eraser();
});
