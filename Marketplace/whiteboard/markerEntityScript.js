//
//  markerTipEntityScript.js
//
//  Created by Eric Levin on 2/17/15.
//  Additions by James B. Pollack @imgntn 6/9/2016
//  Modifications by Thijs Wenker @thoys 1/19/2017
//  Modified by Daniela Fontes (Mimicry) 2/9/2018
//  Copyright 2018 High Fidelity, Inc.
//
//  This script provides the logic for an object to draw marker strokes on its associated whiteboard

//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var utils = Script.require('./utils.js');
    var DEFAULT_COLOR = {
        red: 10,
        green: 10,
        blue: 10
    };
    var _this;
    
    var isPainting = false;
    var isMouseDown = false;
    var isStartingStroke = false;

    var lastIntersectionPoint = undefined;
    var lineResolution = 0.01;

    var BEGIN_STROKE_SOUND = SoundCache.getSound(Script.resolvePath('sfx/markerBeginStroke.wav'));

    var EQUIP_SOUND = SoundCache.getSound(Script.resolvePath('sfx/equip_marker.wav'));
    var UNEQUIP_SOUND = SoundCache.getSound(Script.resolvePath('sfx/unequip_marker.wav'));

    var STROKEL1_SOUND = SoundCache.getSound(Script.resolvePath('sfx/strokeL1.wav'));
    var STROKER1_SOUND = SoundCache.getSound(Script.resolvePath('sfx/strokeR1.wav'));
    var STROKER2_SOUND = SoundCache.getSound(Script.resolvePath('sfx/strokeR2.wav'));
    var STROKER3_SOUND = SoundCache.getSound(Script.resolvePath('sfx/strokeR3.wav'));
    
    var STROKE_SOUND_ARRAY = [STROKEL1_SOUND, STROKER1_SOUND, STROKER2_SOUND, STROKER3_SOUND];

    var timestamp = null;
    var SOUND_TIMESTAMP_LIMIT = {
        min: 100,
        max: 300
    };
    var SOUND_TIMESTAMP = 220;

    var STROKE_SOUND_VOLUME = {
        min: 0.4,
        max: 0.6
    };

    var HAPTIC_PARAMETERS = {
        strength: 1,
        duration: 70,
        hand: 2
    };

    var strokeSoundTimestamp0 = null, strokeSoundTimestamp1 = null;
    var STROKE_SOUND_THRESHOLD_DIRECTION = 0.85;

    var WHITEBOARD_SEARCH_RADIUS = 5;

    var BLUE_MARKER_NAME = "hifi_model_marker_blue";
    var GREEN_MARKER_NAME = "hifi_model_marker_green";
    var BLACK_MARKER_NAME = "hifi_model_marker_black";
    var RED_MARKER_NAME = "hifi_model_marker_red";
    var PINK_MARKER_NAME = "hifi_model_marker_pink";
    var YELLOW_MARKER_NAME = "hifi_model_marker_yellow";
    var ERASER_NAME = "hifi_model_whiteboardEraser";

    function clamp(value, min, max) {
        if (value < min) {
            return min;
        } else if (value > max) {
            return max;
        }
        return value;
    }

    function playRandomStrokeSound(position) {
        
        Audio.playSound(STROKE_SOUND_ARRAY[Math.floor(Math.random() * STROKE_SOUND_ARRAY.length)], {
            position: position,
            volume: clamp(Math.random(), STROKE_SOUND_VOLUME.min , STROKE_SOUND_VOLUME.max)
        });
        SOUND_TIMESTAMP = Math.floor(Math.random() * SOUND_TIMESTAMP_LIMIT.max) + SOUND_TIMESTAMP_LIMIT.min;

    }

    var throttleLockPaint = true;
    var throttleLockUpdatePosition = true; 
    // Performance Debug
    // 2 / 60.0 *1000
    var throttleTimeoutMS = 33.3;
    function throttle(callback , throttleLock, throttleTimeoutMS) {
        if (throttleLock) {
            throttleLock = false;
            Script.setTimeout(function () {
                throttleLock = true;
            }, throttleTimeoutMS);
            if (callback !== undefined) {
                callback();
            }
        }
    }

    // subscribe to channel 
    var MarkerTip = function() {
        _this = this;
        _this.whiteboards = [];
        _this.colors = [];
        _this.STROKE_NAME = "hifi_polyline_markerStroke";
        _this.WHITEBOARD_SURFACE_NAME = "Whiteboard - Drawing Surface";
        _this.MARKER_COLOR_NAME = "hifi-whiteboardPaint";
    };

    function handleColorMessage(channel, message, senderID) {
        if (channel === "Ink-Color") {
            var auxMessage = JSON.parse(message);
            var data = utils.getEntityUserData(_this.entityID);
            data.markerColor = auxMessage.markerColor;
            var serverID = getServerID();
            // RPC - Call server change marker ink 
            Entities.callEntityServerMethod(serverID, 'serverSetEntityData', [_this.entityID, JSON.stringify(data)]);
        }
    }

    function getServerID() {
        if (_this.currentWhiteboard !== null) {
            return Entities.getEntityProperties(_this.currentWhiteboard, "parentID").parentID;
        }
        if (_this.whiteboards.length >= 1) {
            return Entities.getEntityProperties(_this.whiteboards[0], "parentID").parentID;
        }
    }

    Messages.subscribe("Ink-Color");
    Messages.messageReceived.connect(handleColorMessage);

    MarkerTip.prototype = {
        preload: function(entityID) {
            this.entityID = entityID;
            _this.WHITEBOARD_NAME = "Whiteboard";
            _this.wb = null;
            Controller.mousePressEvent.connect(_this.mousePressEvent);
            Controller.mouseMoveEvent.connect(_this.mouseMoveEvent);
            Controller.mouseReleaseEvent.connect(_this.mouseReleaseEvent);
        },
        findWhiteboard: function() {
            var markerPos = Entities.getEntityProperties(_this.entityID, "position").position;
            var results = Entities.findEntities(
                markerPos,
                WHITEBOARD_SEARCH_RADIUS
            );
            results.forEach(function(entity) {
                var entityName = Entities.getEntityProperties(entity, "name").name;
                if (entityName === _this.WHITEBOARD_NAME) {
                    if (_this.wb !== null) {
                        if (Vec3.distance(Entities.getEntityProperties(entity, "position").position, markerPos) <
                            Vec3.distance(Entities.getEntityProperties(_this.wb, "position").position, markerPos)
                        ) {
                            _this.wb = entity;
                        }
                    } else {
                        _this.wb = entity;
                    }
                }
            });
        },
        startNearGrab: function() {
            _this.whiteboards = [];
            _this.colors = [];
            var userData = utils.getEntityUserData(_this.entityID);
            _this.markerColor = userData.markerColor;

            var markerProps = Entities.getEntityProperties(_this.entityID);
            _this.DRAW_ON_BOARD_DISTANCE = markerProps.dimensions.z / 2;
            var markerPosition = markerProps.position;
            var results = Entities.findEntities(markerPosition, WHITEBOARD_SEARCH_RADIUS);
            results.forEach(function(entity) {
                var entityName = Entities.getEntityProperties(entity, "name").name;
                if (entityName === _this.WHITEBOARD_SURFACE_NAME) {
                    _this.whiteboards.push(entity);
                } else if (entityName === _this.MARKER_COLOR_NAME) {
                    _this.colors.push(entity);
                }
            });
            _this.findWhiteboard();
            var serverID = _this.wb;

            Entities.callEntityServerMethod(serverID, 
                'spawnMarker', 
                [_this.entityID, JSON.stringify(markerProps.name), JSON.stringify(_this.markerColor)]
            );
        },
        releaseGrab: function() {
            _this.resetStroke(false);
        },
        continueNearGrab: function(entityID, paramsArray) {
            // cast a ray from marker and see if it hits anything
            var markerProps = Entities.getEntityProperties(_this.entityID);
            var serverID = null;
            // need to back up the ray to the back of the marker 
            var markerFront = Quat.getFront(markerProps.rotation);
            var howFarBack = markerProps.dimensions.z / 2;
            var pulledBack = Vec3.multiply(markerFront, -howFarBack);
            var backedOrigin = Vec3.sum(markerProps.position, pulledBack);

            var pickRay = {
                origin: backedOrigin,
                direction: Quat.getFront(markerProps.rotation)
            };

            var colorIntersection = Entities.findRayIntersection(pickRay, true, _this.colors);

            var isIntersectingColorWell = false;
            
            if (colorIntersection.intersects) {
                
                _this.colors.forEach(function(entity) {
                    if (entity === colorIntersection.entityID) {
                        isIntersectingColorWell = true;
                    }
                });
                if (isIntersectingColorWell) {
                    _this.markerColor = utils.getEntityCustomData('markerColor', colorIntersection.entityID, DEFAULT_COLOR);
                    var data = utils.getEntityUserData(_this.entityID);
                    data.markerColor = _this.markerColor;
                    serverID = getServerID();
                    // RPC - Call server change marker ink 
                    Entities.callEntityServerMethod(serverID, 'serverSetEntityData', [_this.entityID, JSON.stringify(data)]);
                } else {
                    // update color
                    _this.markerColor = utils.getEntityCustomData('markerColor', _this.entityID, DEFAULT_COLOR);
                }
                
            } else {
                // update color
                _this.markerColor = utils.getEntityCustomData('markerColor', _this.entityID, DEFAULT_COLOR);
            }

            var whiteBoardIntersection = Entities.findRayIntersection(pickRay, true, _this.whiteboards);
            var distance = Vec3.distance(whiteBoardIntersection.intersection, markerProps.position);
            if (whiteBoardIntersection.intersects && distance <= _this.DRAW_ON_BOARD_DISTANCE) {
                _this.currentWhiteboard = whiteBoardIntersection.entityID;
                var whiteboardRotation = Entities.getEntityProperties(_this.currentWhiteboard, "rotation").rotation;
                _this.whiteboardNormal = Quat.getFront(whiteboardRotation);
                _this.paint(whiteBoardIntersection.intersection, false);
                if (isPainting === false) {
                    Audio.playSound(BEGIN_STROKE_SOUND, {
                        position: whiteBoardIntersection.intersection,
                        volume: clamp(Math.random(), STROKE_SOUND_VOLUME.min, STROKE_SOUND_VOLUME.max)
                    });
                    timestamp = Date.now();
                    strokeSoundTimestamp0 = whiteBoardIntersection.intersection;
                    strokeSoundTimestamp1 = null;
                    
                } else if ((Date.now() - timestamp) > SOUND_TIMESTAMP) {
                    timestamp = Date.now();
                    playRandomStrokeSound(whiteBoardIntersection.intersection);
                } else {
                    if (strokeSoundTimestamp1 === null) {
                        strokeSoundTimestamp1 = whiteBoardIntersection.intersection;
                    } else {
                        var strokeSoundDirection1 = Vec3.normalize(
                            Vec3.subtract(strokeSoundTimestamp1, strokeSoundTimestamp0)
                        );
                        var strokeSoundDirection2 = Vec3.normalize(
                            Vec3.subtract(whiteBoardIntersection.intersection, strokeSoundTimestamp1)
                        );
                        var cosA = Vec3.dot(strokeSoundDirection1, strokeSoundDirection2);
                        if (cosA < STROKE_SOUND_THRESHOLD_DIRECTION) {
                            timestamp = Date.now();
                            playRandomStrokeSound(whiteBoardIntersection.intersection);
                        }
                        strokeSoundTimestamp0 = strokeSoundTimestamp1;
                        strokeSoundTimestamp1 = whiteBoardIntersection.intersection;
                    }
                }

                isPainting = true;
                var hand = paramsArray[0] === 'left' ? 0 : 1;
                Controller.triggerHapticPulse(
                    HAPTIC_PARAMETERS.strength, 
                    HAPTIC_PARAMETERS.duration, 
                    hand
                );
            } else {
                _this.resetStroke(false);
            }
        },
        startEquip: function() {
            if (!HMD.active) {
                return;
            }
            Audio.playSound(EQUIP_SOUND, {
                position: Entities.getEntityProperties(_this.entityID, "position").position,
                volume: 1
            });
            lastIntersectionPoint = undefined;
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
            Audio.playSound(UNEQUIP_SOUND, {
                position: Entities.getEntityProperties(_this.entityID, "position").position,
                volume: 1
            });
            _this.equipped = false;
            _this.releaseGrab();
        },
        paint: function(position, isDesktopMode) {
            if (throttleLockPaint) {
                // whiteboard server ID
                var serverID = Entities.getEntityProperties(_this.currentWhiteboard, "parentID").parentID;
                // RPC - call server paint [position, markerColor, creatorMarker, parentID]
                if (isDesktopMode) {
                    Entities.callEntityServerMethod(serverID, 
                        'paintDesktop', 
                        [JSON.stringify(position), JSON.stringify(_this.markerColor), _this.entityID, _this.currentWhiteboard]
                    );
                } else {
                    Entities.callEntityServerMethod(serverID, 
                        'paint', 
                        [JSON.stringify(position), JSON.stringify(_this.markerColor), _this.entityID, _this.currentWhiteboard]
                    );
                }
            }
            throttle(undefined, throttleLockPaint, throttleTimeoutMS); 
        },
        resetStroke: function(isDesktopMode) {
            // reset stroke
            if (isPainting) {
                isPainting = false;
                var serverID = Entities.getEntityProperties(_this.currentWhiteboard, "parentID").parentID;
                // RPC - call server reset [creatorMarker, parentID]
                if (isDesktopMode) {
                    Entities.callEntityServerMethod(serverID, 
                        'resetMarkerStrokeDesktop', 
                        [_this.entityID, _this.currentWhiteboard]
                    );
                } else {
                    Entities.callEntityServerMethod(serverID, 
                        'resetMarkerStroke', 
                        [_this.entityID, _this.currentWhiteboard]
                    );
                }
            }
        },

        // MOUSE DESKTOP COMPATIBILITY
        clickDownOnEntity: function(entityID, mouseEvent) {
            if (HMD.active || _this.equipped) {
                return;
            }
            Settings.setValue('io.highfidelity.isEditing', true);

            _this.whiteboards = [];
            _this.colors = [];
            var userData = utils.getEntityUserData(_this.entityID);
            _this.markerColor = userData.markerColor;

            var markerProps = Entities.getEntityProperties(_this.entityID);
            _this.DRAW_ON_BOARD_DISTANCE = markerProps.dimensions.x / 2;
            var markerPosition = markerProps.position;
            var results = Entities.findEntities(markerPosition, WHITEBOARD_SEARCH_RADIUS);
            results.forEach(function(entity) {
                var entityName = Entities.getEntityProperties(entity, "name").name;
                if (entityName === _this.WHITEBOARD_SURFACE_NAME) {
                    _this.whiteboards.push(entity);
                } else if (entityName === _this.MARKER_COLOR_NAME) {
                    _this.colors.push(entity);
                }
            });

            lastIntersectionPoint = undefined;
            
            // Server side
            _this.findWhiteboard();
            var serverID = _this.wb;
            Entities.callEntityServerMethod(serverID, 
                'spawnMarker', 
                [_this.entityID, JSON.stringify(markerProps.name), JSON.stringify(_this.markerColor)]
            );
            Entities.callEntityServerMethod(serverID, 
                'serverEditEntity', 
                [_this.entityID, JSON.stringify({collisionless: true, grabbable: false})]
            );
            Audio.playSound(EQUIP_SOUND, {
                position: Entities.getEntityProperties(_this.entityID, "position").position,
                volume: 1
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
                        lastIntersectionPoint = undefined;
                        Settings.setValue('io.highfidelity.isEditing', false);
                        var serverID = getServerID();
                        isMouseDown = false;
                        _this.resetStroke(true);
                        // delete marker
                        Entities.callEntityServerMethod(serverID, 
                            'erase', 
                            [_this.entityID]
                        );
                        Audio.playSound(UNEQUIP_SOUND, {
                            position: Entities.getEntityProperties(_this.entityID, "position").position,
                            volume: 1
                        });
                    }
                }
            }
        },
        mouseMoveEvent: function(event) {
            if (throttleLockUpdatePosition) {
                throttle(undefined, throttleLockUpdatePosition, throttleTimeoutMS);
            } else {
                return;
            }
            var serverID;
            if (_this.equipped && event.x !== undefined) {
                var pickRay = Camera.computePickRay(event.x, event.y);
                var colorIntersection = Entities.findRayIntersection(pickRay, true, _this.colors);
                var isIntersectingColorWell = false;
                
                if (colorIntersection.intersects) {
                    _this.colors.forEach(function(entity) {
                        if (entity === colorIntersection.entityID) {
                            isIntersectingColorWell = true;
                        }
                    });
                    if (isIntersectingColorWell) {
                        _this.markerColor = utils.getEntityCustomData('markerColor', colorIntersection.entityID, DEFAULT_COLOR);
                        var data = utils.getEntityUserData(_this.entityID);
                        data.markerColor = _this.markerColor;
                        serverID = getServerID();
                        // RPC - Call server change marker ink 
                        Entities.callEntityServerMethod(serverID, 
                            'serverSetEntityData', 
                            [_this.entityID, JSON.stringify(data)]
                        );

                    }
                } 
                var whiteBoardIntersection = Entities.findRayIntersection(pickRay, true, _this.whiteboards);

                
                if (whiteBoardIntersection.intersects) {
                    if (!isMouseDown && isPainting) {
                        _this.resetStroke(true);
                        isPainting = false;
                        isStartingStroke = false;
                    } else {
                        _this.currentWhiteboard = whiteBoardIntersection.entityID;
                        
                        isPainting = true;
                    }
      
                    if (isPainting) {
                        var whiteboardRotation = Entities.getEntityProperties(_this.currentWhiteboard, "rotation").rotation;
                        _this.whiteboardNormal = Quat.getFront(whiteboardRotation);

                        // my marker offset
                        var markerZOffset = Vec3.multiply(
                            Entities.getEntityProperties(_this.entityID, "dimensions").dimensions.z / 2, 
                            _this.whiteboardNormal
                        );
                        
                        var shouldPaint = lastIntersectionPoint === undefined;

                        if (!shouldPaint) {
                            var distanceFromLastIntersection = Vec3.distance(
                                lastIntersectionPoint, 
                                whiteBoardIntersection.intersection
                            );
                            shouldPaint = distanceFromLastIntersection > lineResolution;
                            lastIntersectionPoint = whiteBoardIntersection.intersection;
                        }

                        // Server Side
                        serverID = getServerID();
                        Entities.callEntityServerMethod(serverID, 
                            'serverEditEntity', 
                            [_this.entityID, 
                                JSON.stringify({
                                    position: Vec3.sum(whiteBoardIntersection.intersection, markerZOffset),
                                    rotation:  whiteboardRotation,
                                    collisionless: true, 
                                    grabbable: false
                                })
                            ]
                        );
                        
                        if (isMouseDown && event.isLeftButton) {
                            if (shouldPaint) {
                                _this.paint(whiteBoardIntersection.intersection, true);
                                if (!isStartingStroke) {
                                    isStartingStroke = true;
                                    
                                    Audio.playSound(BEGIN_STROKE_SOUND, {
                                        position: whiteBoardIntersection.intersection,
                                        volume: clamp(Math.random(), STROKE_SOUND_VOLUME.min, STROKE_SOUND_VOLUME.max)
                                    });
                                    timestamp = Date.now();
                                    strokeSoundTimestamp0 = whiteBoardIntersection.intersection;
                                    strokeSoundTimestamp1 = null;
                                    
                                } else if ((Date.now() - timestamp) > SOUND_TIMESTAMP) {
                                    timestamp = Date.now();
                                    playRandomStrokeSound(whiteBoardIntersection.intersection);
                                } else {
                                    if (strokeSoundTimestamp1 === null) {
                                        strokeSoundTimestamp1 = whiteBoardIntersection.intersection;
                                    } else {
                                        var strokeSoundDirection1 = Vec3.normalize(
                                            Vec3.subtract(strokeSoundTimestamp1, strokeSoundTimestamp0)
                                        );
                                        var strokeSoundDirection2 = Vec3.normalize(
                                            Vec3.subtract(whiteBoardIntersection.intersection, strokeSoundTimestamp1)
                                        );
                                        var cosA = Vec3.dot(strokeSoundDirection1, strokeSoundDirection2);
                                        if (cosA < STROKE_SOUND_THRESHOLD_DIRECTION) {
                                            timestamp = Date.now();
                                            playRandomStrokeSound(whiteBoardIntersection.intersection);
                                        }
                                        strokeSoundTimestamp0 = strokeSoundTimestamp1;
                                        strokeSoundTimestamp1 = whiteBoardIntersection.intersection;
                                    }
                                }
                            }
                        } else {
                            isPainting = false;
                        }   
                    }  
                } else {
                    _this.equipped = false;
                    serverID = getServerID();
                    isMouseDown = false;
                    Settings.setValue('io.highfidelity.isEditing', false);
                    _this.resetStroke(true);
                    Audio.playSound(UNEQUIP_SOUND, {
                        position: Entities.getEntityProperties(_this.entityID, "position").position,
                        volume: 1
                    });
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
                _this.resetStroke(true);
                isStartingStroke = false;
            }
        },
        unload: function() {
            Controller.mousePressEvent.disconnect(_this.mousePressEvent);
            Controller.mouseMoveEvent.disconnect(_this.mouseMoveEvent);
            Controller.mouseReleaseEvent.disconnect(_this.mouseReleaseEvent);
        }
    };

    return new MarkerTip();
});