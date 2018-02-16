//
//  markerTipEntityScript.js
//
//  Created by Eric Levin on 2/17/15.
//  Additions by James B. Pollack @imgntn 6/9/2016
//  Modifications by Thijs Wenker @thoys 1/19/2017
//  Modified by Daniela Fontes (Mimicry) 9/2/2018
//  Copyright 2018 High Fidelity, Inc.
//
//  This script provides the logic for an object to draw marker strokes on its associated whiteboard

//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {

    Script.include(Script.resolvePath('utils.js'));
    //var SPRING_ENTITY_SCRIPT_URL = Script.resolvePath('springentity.js');
    var MAX_POINTS_PER_STROKE = 40;
    var DEFAULT_COLOR = {
        red: 10,
        green: 10,
        blue: 10
    };
    // var LINEAR_TIMESCALE = 0.1;
    // var ANGULAR_TIMESCALE = 0.1;
    var _this;
    
    var isPainting = false;
    var isMouseDown = false;
    var isStartingStroke = false;

    var BEGIN_STROKE_SOUND = SoundCache.getSound(Script.resolvePath('sfx/markerBeginStroke.wav'));

    var STROKEL1_SOUND = SoundCache.getSound(Script.resolvePath('sfx/strokeL1.wav'));
    var STROKER1_SOUND = SoundCache.getSound(Script.resolvePath('sfx/strokeR1.wav'));
    var STROKER2_SOUND = SoundCache.getSound(Script.resolvePath('sfx/strokeR2.wav'));
    var STROKER3_SOUND = SoundCache.getSound(Script.resolvePath('sfx/strokeR3.wav'));
    
    var STROKE_SOUND_ARRAY = [STROKEL1_SOUND, STROKER1_SOUND, STROKER2_SOUND, STROKER3_SOUND];

    var timestamp = null;
    const SOUND_TIMESTAMP_LIMIT = {
        min: 100,
        max: 300
    };
    var SOUND_TIMESTAMP = 220;

    var t0 = null, t1 = null;

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
            volume: clamp(Math.random(), 0.4, 0.6)
        });
        SOUND_TIMESTAMP = Math.floor(Math.random() * SOUND_TIMESTAMP_LIMIT.max) + SOUND_TIMESTAMP_LIMIT.min;

    }

    // subscribe to channel 
    MarkerTip = function() {
        _this = this;
        _this.whiteboards = [];
        _this.colors = [];
        _this.STROKE_NAME = "hifi_polyline_markerStroke";
        _this.WHITEBOARD_SURFACE_NAME = "Whiteboard - Drawing Surface";
        _this.MARKER_COLOR_NAME = "hifi-whiteboardPaint";
    };

    function handleColorMessage(channel, message, senderID) {
        if (channel == "Ink-Color") {
            //setEntityCustomData('markerColor', _this.entityID, _this.markerColor);
            var auxMessage = JSON.parse(message);
            var data = getEntityUserData(_this.entityID);
            data.markerColor = auxMessage.markerColor;
            serverID = getServerID();
            // RPC - Call server change marker ink 
            Entities.callEntityServerMethod(serverID, 'serverSetEntityData', [_this.entityID, JSON.stringify(data)]);
        }
    };

    function getServerID() {
        if (_this.currentWhiteboard != null) {
            return Entities.getEntityProperties(_this.currentWhiteboard, "parentID").parentID;
        }
        if (_this.whiteboards.length >= 1) {
            return Entities.getEntityProperties(_this.whiteboards[0], "parentID").parentID;
        }
    }

    Messages.subscribe("Ink-Color");
    Messages.messageReceived.connect(handleColorMessage);

    MarkerTip.prototype = {
        springAction: null,
        springEntity: null,
        hand: null,
        preload: function(entityID) {
            this.entityID = entityID;

            Controller.mouseMoveEvent.connect(_this.mouseMoveEvent);
            Controller.mouseReleaseEvent.connect(_this.mouseReleaseEvent);
        },
        startNearGrab: function() {
            _this.whiteboards = [];
            _this.colors = [];
            var userData = getEntityUserData(_this.entityID);
            _this.markerColor = userData.markerColor;

            var markerProps = Entities.getEntityProperties(_this.entityID);
            _this.DRAW_ON_BOARD_DISTANCE = markerProps.dimensions.z / 2;
            var markerPosition = markerProps.position;
            var results = Entities.findEntities(markerPosition, 5);
            results.forEach(function(entity) {
                var entityName = Entities.getEntityProperties(entity, "name").name;
                if (entityName === _this.WHITEBOARD_SURFACE_NAME) {
                    _this.whiteboards.push(entity);
                } else if (entityName === _this.MARKER_COLOR_NAME) {
                    _this.colors.push(entity)
                }
            });
            
            var serverID = getServerID();

            Entities.callEntityServerMethod(serverID, 
                'spawnMarker', 
                [_this.entityID, JSON.stringify(markerProps.name), JSON.stringify(_this.markerColor)]
            );
        },
        releaseGrab: function() {
            _this.resetStroke();
        },
        continueNearGrab: function(ID, paramsArray) {
            // cast a ray from marker and see if it hits anything
            var markerProps = Entities.getEntityProperties(_this.entityID);

            //need to back up the ray to the back of the marker 
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
                    _this.markerColor = getEntityCustomData('markerColor', colorIntersection.entityID, DEFAULT_COLOR);
                    var data = getEntityUserData(_this.entityID);
                    data.markerColor = _this.markerColor;
                    serverID = getServerID();
                    // RPC - Call server change marker ink 
                    Entities.callEntityServerMethod(serverID, 'serverSetEntityData', [_this.entityID, JSON.stringify(data)]);
                } else {
                    // update color
                    _this.markerColor = getEntityCustomData('markerColor', _this.entityID, DEFAULT_COLOR);
                }
                
            } else {
                // update color
                _this.markerColor = getEntityCustomData('markerColor', _this.entityID, DEFAULT_COLOR);
            }

            var whiteBoardIntersection = Entities.findRayIntersection(pickRay, true, _this.whiteboards);
            if (whiteBoardIntersection.intersects && 
                Vec3.distance(whiteBoardIntersection.intersection, markerProps.position) <= _this.DRAW_ON_BOARD_DISTANCE) 
            {
                _this.currentWhiteboard = whiteBoardIntersection.entityID;
                var whiteboardRotation = Entities.getEntityProperties(_this.currentWhiteboard, "rotation").rotation;
                _this.whiteboardNormal = Quat.getFront(whiteboardRotation);
                _this.paint(whiteBoardIntersection.intersection);
                if (isPainting == false) {
                    Audio.playSound(BEGIN_STROKE_SOUND, {
                        position: whiteBoardIntersection.intersection,
                        volume: clamp(Math.random(), 0.45, 0.65)
                    });
                    timestamp = Date.now();
                    t0 = whiteBoardIntersection.intersection;
                    t1 = null;
                    
                } else if ((Date.now() - timestamp) > SOUND_TIMESTAMP) {
                    timestamp = Date.now();
                    playRandomStrokeSound(whiteBoardIntersection.intersection);
                } else {
                    if (t1 == null) {
                        t1 = whiteBoardIntersection.intersection;
                    } else {
                        var v1 = Vec3.normalize(Vec3.subtract(t1, t0));
                        var v2 = Vec3.normalize(Vec3.subtract(whiteBoardIntersection.intersection, t1));
                        var cosA = Vec3.dot(v1, v2);
                        if (cosA < 0.85 ) {
                            timestamp = Date.now();
                            playRandomStrokeSound(whiteBoardIntersection.intersection);
                        }
                        t0 = t1;
                        t1 = whiteBoardIntersection.intersection;
                    }
                }

                isPainting = true;
                hand = paramsArray[0] === 'left' ? 0 : 1;
                var vibrated = Controller.triggerHapticPulse(1, 70, hand);
            } else {
                _this.resetStroke();
            }
        },
        startEquip: function() {
            _this.equipped = true;
            _this.startEquipTime = Date.now();
            _this.startNearGrab();
        },
        continueEquip: function(ID, paramsArray) {
            _this.continueNearGrab(ID, paramsArray);
        },
        releaseEquip: function() {
            _this.equipped = false;
            _this.releaseGrab();
        },
        paint: function(position) {
            // whiteboard server ID
            var serverID = Entities.getEntityProperties(_this.currentWhiteboard, "parentID").parentID;
            // RPC - call server paint [position, markerColor, creatorMarker, parentID]
            Entities.callEntityServerMethod(serverID, 
                'paint', 
                [JSON.stringify(position), JSON.stringify(_this.markerColor), _this.entityID, _this.currentWhiteboard]
            );
        },
        resetStroke: function() {
            // reset stroke
            if (isPainting) {
                isPainting = false;
                var serverID = Entities.getEntityProperties(_this.currentWhiteboard, "parentID").parentID;
                // RPC - call server reset [creatorMarker, parentID]
                Entities.callEntityServerMethod(serverID, 'resetMarkerStroke', [_this.entityID, _this.currentWhiteboard]);
            }
        },

        // MOUSE DESKTOP COMPATIBILITY
        clickDownOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.isMiddleButton != true  || HMD.active) {
                return;
            }

            var args = "mouse";
            Entities.callEntityMethod(_this.entityID, "releaseGrab", args);

            Messages.sendMessage('Hifi-Object-Manipulation', JSON.stringify({
                action: 'release',
                grabbedEntity: _this.entityID,
                joint: "mouse"
            }));

            _this.whiteboards = [];
            _this.colors = [];
            var userData = getEntityUserData(_this.entityID);
            _this.markerColor = userData.markerColor;

            var markerProps = Entities.getEntityProperties(_this.entityID);
            _this.DRAW_ON_BOARD_DISTANCE = markerProps.dimensions.x / 2;
            var markerPosition = markerProps.position;
            var results = Entities.findEntities(markerPosition, 5);
            results.forEach(function(entity) {
                var entityName = Entities.getEntityProperties(entity, "name").name;
                if (entityName === _this.WHITEBOARD_SURFACE_NAME) {
                    _this.whiteboards.push(entity);
                } else if (entityName === _this.MARKER_COLOR_NAME) {
                    _this.colors.push(entity)
                }
            });
            
            // Server side
            var serverID = getServerID();
            Entities.callEntityServerMethod(serverID, 
                'spawnMarker', 
                [_this.entityID, JSON.stringify(markerProps.name), JSON.stringify(_this.markerColor)]
            );
            Entities.callEntityServerMethod(serverID, 
                'serverEditEntity', 
                [_this.entityID, JSON.stringify({collisionless: true, grabbable: false})]
            );
            
            isMouseDown = true;
        },
        mouseMoveEvent: function(event) {
            var serverID;

            if (isMouseDown && event.x != undefined && event.isMiddleButton == true) {
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
                        _this.markerColor = getEntityCustomData('markerColor', colorIntersection.entityID, DEFAULT_COLOR);
                        var data = getEntityUserData(_this.entityID);
                        data.markerColor = _this.markerColor;
                        serverID = getServerID();
                        // RPC - Call server change marker ink 
                        Entities.callEntityServerMethod(serverID, 'serverSetEntityData', [_this.entityID, JSON.stringify(data)]);
                    }
                } 
                var whiteBoardIntersection = Entities.findRayIntersection(pickRay, true, _this.whiteboards);
                
                if (whiteBoardIntersection.intersects ) {
                    var results = Entities.findEntities(whiteBoardIntersection.intersection, 0.01);

                    if (!event.isAlt && isPainting) {
                        _this.resetStroke();
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
                            })]
                        );

                        if (event.isAlt) {
                            _this.paint(whiteBoardIntersection.intersection);
                            if (!isStartingStroke) {
                                isStartingStroke = true;
                                
                                Audio.playSound(BEGIN_STROKE_SOUND, {
                                    position: whiteBoardIntersection.intersection,
                                    volume: clamp(Math.random(), 0.45, 0.65)
                                });
                                timestamp = Date.now();
                                t0 = whiteBoardIntersection.intersection;
                                t1 = null;
                                
                            } else if ((Date.now() - timestamp) > SOUND_TIMESTAMP) {
                                timestamp = Date.now();
                                playRandomStrokeSound(whiteBoardIntersection.intersection);
                            } else {
                                if (t1 == null) {
                                    t1 = whiteBoardIntersection.intersection;
                                } else {
                                    var v1 = Vec3.normalize(Vec3.subtract(t1, t0));
                                    var v2 = Vec3.normalize(Vec3.subtract(whiteBoardIntersection.intersection, t1));
                                    var cosA = Vec3.dot(v1, v2);
                                    if (cosA < 0.85 ) {
                                        timestamp = Date.now();
                                        playRandomStrokeSound(whiteBoardIntersection.intersection);
                                    }
                                    t0 = t1;
                                    t1 = whiteBoardIntersection.intersection;
                                }
                            }
                        } else {
                            isPainting = false;
                        }   
                    }  
                }
            }

        },
        mouseReleaseEvent: function(event) {
            if (isMouseDown) {
                // Server side
                var serverID = getServerID();
                Entities.callEntityServerMethod(serverID, 
                    'serverEditEntity', 
                    [_this.entityID, JSON.stringify({collisionless: false, grabbable: true})]
                );
                isMouseDown = false;
                _this.resetStroke();
            }
        },
        unload: function() {
            Controller.mouseMoveEvent.disconnect(_this.mouseMoveEvent);
            Controller.mouseReleaseEvent.disconnect(_this.mouseReleaseEvent);
        }
    };

    return new MarkerTip();
});

//  markerTipEntityScript.js
//
//  Created by Eric Levin on 2/17/15.
//  Additions by James B. Pollack @imgntn 6/9/2016
//  Modifications by Thijs Wenker @thoys 1/19/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  This script provides the logic for an object to draw marker strokes on its associated whiteboard

//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//  markerTipEntityScript.js
//
//  Created by Eric Levin on 2/17/15.
//  Additions by James B. Pollack @imgntn 6/9/2016
//  Modifications by Thijs Wenker @thoys 1/19/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  This script provides the logic for an object to draw marker strokes on its associated whiteboard

//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//  markerTipEntityScript.js
//
//  Created by Eric Levin on 2/17/15.
//  Additions by James B. Pollack @imgntn 6/9/2016
//  Modifications by Thijs Wenker @thoys 1/19/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  This script provides the logic for an object to draw marker strokes on its associated whiteboard

//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
