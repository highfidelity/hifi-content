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
        _this.STROKE_NAME = "hifi_polyline_markerStroke";
        _this.ERASER_TO_STROKE_SEARCH_RADIUS = 0.0032;
        _this.WHITEBOARD_NAME = "Whiteboard";
        _this.WHITEBOARD_SURFACE_NAME = "Whiteboard - Drawing Surface";
        _this.WHITEBOARD_SEARCH_RADIUS = 5;
        _this.whiteboard = null;
        _this.whiteboardNormal = null;

    };

    Eraser.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            Controller.mousePressEvent.connect(_this.mousePressEvent);
            Controller.mouseMoveEvent.connect(_this.mouseMoveEvent);
            Controller.mouseReleaseEvent.connect(_this.mouseReleaseEvent);
        },
        startNearGrab: function() {
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
            var results = Entities.findEntities(_this.eraserPosition, _this.ERASER_TO_STROKE_SEARCH_RADIUS);
            // Create a map of stroke entities and their positions

            results.forEach(function(stroke) {
                var props = Entities.getEntityProperties(stroke, ["position", "name"]);
                if (props.name === _this.STROKE_NAME) {
                    if (_this.whiteboard === null) {
                        _this.findWhiteboard();
                    }
                    var serverID = _this.whiteboard;
                    // RPC - calling server to erase
                    Entities.callEntityServerMethod(serverID, 'erase', [stroke]);
                    
                    Audio.playSound(ERASER_HIT_BOARD_SOUND, {
                        position: _this.eraserPosition,
                        volume: ERASER_SOUND_VOLUME
                    });
                    
                    Controller.triggerHapticPulse(
                        HAPTIC_PARAMETERS.strength, 
                        HAPTIC_PARAMETERS.duration, 
                        hand
                    );
                }
            });
        },
        startEquip: function() {
            _this.equipped = true;
            _this.startEquipTime = Date.now();
            _this.startNearGrab();
        },
        continueEquip: function(entityID, paramsArray) {
            _this.continueNearGrab(entityID, paramsArray);
        },
        releaseEquip: function() {
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
            
            if (_this.equipped) {
                isMouseDown = true;
            }
            _this.equipped = true;

        },
        mousePressEvent: function(event) {
            if (_this.equipped) {
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
                        _this.equipped = false;
                        _this.findWhiteboard();
                        var serverID = _this.whiteboard;
                        isMouseDown = false;
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
            if (_this.equipped && event.x !== undefined) {
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
                        Entities.callEntityServerMethod(
                            serverID, 
                            'serverEditEntity', 
                            [_this.entityID, 
                                JSON.stringify({
                                    position: whiteBoardIntersection.intersection,
                                    rotation:  Quat.multiply(whiteboardRotation, Quat.fromPitchYawRollDegrees(90, 0, 45))
                                })]
                        );
                        
                        if (isMouseDown) {
                            _this.eraserPosition = Entities.getEntityProperties(_this.entityID, "position").position;
                            var nearbyEntities = Entities.findEntities(
                                _this.eraserPosition, 
                                _this.ERASER_TO_STROKE_SEARCH_RADIUS
                            );
                            // Create a map of stroke entities and their positions
                            nearbyEntities.forEach(function(stroke) {
                                var props = Entities.getEntityProperties(stroke, ["position", "name"]);
                                
                                if (props.name === _this.STROKE_NAME) {
                                    // RPC - calling server to erase
                                    Entities.callEntityServerMethod(serverID, 'erase', [stroke]);
                                    Audio.playSound(ERASER_HIT_BOARD_SOUND, {
                                        position: _this.eraserPosition,
                                        volume: ERASER_SOUND_VOLUME
                                    });
                                }
                            });
                        } else {
                            isErasing = false;
                        }
                    }
                } else {
                    _this.equipped = false;
                    _this.findWhiteboard();
                    serverID = _this.whiteboard;
                    isMouseDown = false;
                    // delete marker
                    Entities.callEntityServerMethod(serverID, 
                        'erase', 
                        [_this.entityID]
                    );
                }
            }
        },
        mouseReleaseEvent: function(event) {
            if (isMouseDown) {              
                isMouseDown = false;
            }
        },
        unload: function() {
            Controller.mousePressEvent.disconnect(_this.mousePressEvent);
            Controller.mouseMoveEvent.disconnect(_this.mouseMoveEvent);
            Controller.mouseReleaseEvent.disconnect(_this.mouseReleaseEvent);
        }
    };

    return new Eraser();
});
