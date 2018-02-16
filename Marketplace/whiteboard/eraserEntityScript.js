//
//  eraserEntityScript.js
//
//  Created by Eric Levin on 2/17/15.
//  Additions by James B. Pollack @imgntn 6/9/2016
//  Modified by Daniela Fontes (Mimicry) 9/2/2018
//  Copyright 2018 High Fidelity, Inc.
//
//  This entity script provides logic for an object with attached script to erase nearby marker strokes
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    Script.include(Script.resolvePath('utils.js'));

    var _this;

    var isErasing = false;
    var isMouseDown = false;

    var ERASER_HIT_BOARD_SOUND = SoundCache.getSound(Script.resolvePath('sfx/eraserHitBoard.wav'));

    Eraser = function() {
        _this = this;
        _this.equipped = false;
        _this.STROKE_NAME = "hifi_polyline_markerStroke";
        _this.ERASER_TO_STROKE_SEARCH_RADIUS = 0.1;
        _this.WHITEBOARD_NAME = "Whiteboard";
        _this.WHITEBOARD_SURFACE_NAME = "Whiteboard - Drawing Surface";
        _this.WHITEBOARD_SEARCH_RADIUS = 2;
        _this.whiteboard = null;
        _this.whiteboardNormal = null;

    };

    Eraser.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
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
        continueNearGrab: function() {
            _this.eraserPosition = Entities.getEntityProperties(_this.entityID, "position").position;
            _this.continueHolding();
        },
        continueHolding: function() {
            var results = Entities.findEntities(_this.eraserPosition, _this.ERASER_TO_STROKE_SEARCH_RADIUS);
            // Create a map of stroke entities and their positions

            results.forEach(function(stroke) {
                var props = Entities.getEntityProperties(stroke, ["position", "name"]);
                if (props.name === _this.STROKE_NAME 
                    && Vec3.distance(_this.eraserPosition, props.position) < _this.ERASER_TO_STROKE_SEARCH_RADIUS) 
                {
                    if (_this.whiteboard == null) {
                        _this.findWhiteboard();
                    }
                    var serverID = _this.whiteboard;
                    // RPC - calling server to erase
                    Entities.callEntityServerMethod(serverID, 'erase', [stroke]);
                    
                    Audio.playSound(ERASER_HIT_BOARD_SOUND, {
                        position: _this.eraserPosition,
                        volume: 0.6
                    });

                    var vibrated = Controller.triggerHapticPulse(1, 70, 2);
                }
            });
        },
        startEquip: function() {
            _this.equipped = true;
            _this.startEquipTime = Date.now();
            _this.startNearGrab();
        },
        continueEquip: function() {
            _this.continueNearGrab();
        },
        releaseEquip: function() {
            _this.equipped = false;
        },
        // MOUSE DESKTOP COMPATIBILITY
        clickDownOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.isMiddleButton != true || HMD.active) {
                return;
            }
            
            var args = "mouse";
            Entities.callEntityMethod(_this.entityID, "releaseGrab", args);

            Messages.sendMessage('Hifi-Object-Manipulation', JSON.stringify({
                action: 'release',
                grabbedEntity: _this.entityID,
                joint: "mouse"
            }));
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
            var results = Entities.findEntities(eraserPosition, 5);
            results.forEach(function(entity) {
                var entityName = Entities.getEntityProperties(entity, "name").name;
                if (entityName === _this.WHITEBOARD_SURFACE_NAME) {
                    _this.whiteboards.push(entity);
                }
            });
            
            isMouseDown = true;         
        },
        mouseMoveEvent: function(event) {
            if (isMouseDown && event.x != undefined && event.isMiddleButton == true) {
                var pickRay = Camera.computePickRay(event.x, event.y);
                var whiteBoardIntersection = Entities.findRayIntersection(pickRay, true, _this.whiteboards);
                
                if (whiteBoardIntersection.intersects) {
                    var results = Entities.findEntities(whiteBoardIntersection.intersection, 0.01);

                    if (!event.isAlt && isErasing) {
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
                        if (e !== BreakException) throw e;
                    }
                    
                    if (isErasing) {
                        var whiteboardPosition = Entities.getEntityProperties(_this.whiteboard, "position").position;
                        var whiteboardRotation = Entities.getEntityProperties(_this.whiteboard, "rotation").rotation;
                        _this.whiteboardNormal = Quat.getFront(whiteboardRotation);

                        var serverID = Entities.getEntityProperties(_this.whiteboard, "parentID").parentID;
                        Entities.callEntityServerMethod(serverID, 'serverEditEntity', 
                            [_this.entityID, 
                            JSON.stringify({
                            position: whiteBoardIntersection.intersection,
                            rotation:  Quat.multiply(whiteboardRotation, Quat.fromPitchYawRollDegrees(90, 0, 45))
                        })]);
                        
                        if (event.isAlt) {
                            _this.eraserPosition = Entities.getEntityProperties(_this.entityID, "position").position;
                            var results1 = Entities.findEntities(_this.eraserPosition, _this.ERASER_TO_STROKE_SEARCH_RADIUS);
                            // Create a map of stroke entities and their positions
                            results1.forEach(function(stroke) {
                                var props = Entities.getEntityProperties(stroke, ["position", "name"]);
                                if (props.name === _this.STROKE_NAME && 
                                    Vec3.distance(_this.eraserPosition, props.position) < _this.ERASER_TO_STROKE_SEARCH_RADIUS)
                                {
                                    // RPC - calling server to erase
                                    Entities.callEntityServerMethod(serverID, 'erase', [stroke]);
                                    Audio.playSound(ERASER_HIT_BOARD_SOUND, {
                                        position: _this.eraserPosition,
                                        volume: 0.6
                                    });
                                }
                            });
                        } else {
                            isErasing = false;
                        }
                    }
                }
            }
        },
        mouseReleaseEvent: function(event) {
            if (isMouseDown) {
                // Edit entity in a server-sided way
                _this.findWhiteboard();
                var serverID = _this.whiteboard;
                Entities.callEntityServerMethod(serverID, 'serverEditEntity', 
                    [_this.entityID, JSON.stringify({collisionless: false, grabbable: true})
                ]);
                
                isMouseDown = false;
            }
        },
        unload: function() {
            Controller.mouseMoveEvent.disconnect(_this.mouseMoveEvent);
            Controller.mouseReleaseEvent.disconnect(_this.mouseReleaseEvent);
        }
    };

    return new Eraser();
});
