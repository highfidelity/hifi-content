//
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

    // subscribe to channel 
    MarkerTip = function() {
        _this = this;
        _this.MARKER_TEXTURE_URL = Script.resolvePath("markerStroke.png");
        _this.strokeForwardOffset = 0.0001;
        _this.STROKE_WIDTH_RANGE = {
            min: 0.002,
            max: 0.01
        };
        _this.MIN_DISTANCE_BETWEEN_POINTS = 0.002;
        _this.MAX_DISTANCE_BETWEEN_POINTS = 0.1;
        _this.strokes = [];
        _this.STROKE_NAME = "hifi_polyline_markerStroke";
        _this.WHITEBOARD_SURFACE_NAME = "Whiteboard - Drawing Surface";
        _this.MARKER_COLOR_NAME = "hifi-whiteboardPaint";
    };


    function handleColorMessage(channel, message, senderID) {
        if(channel == "Ink-Color") {
            setEntityCustomData("markerColor", _this.entityID, JSON.parse(message))
        }
    };

    Messages.subscribe("Ink-Color");
    Messages.messageReceived.connect(handleColorMessage);

    MarkerTip.prototype = {

        springAction: null,
        springEntity: null,
        hand: null,

        preload: function(entityID) {
            this.entityID = entityID;
        },

        startNearGrab: function() {
            _this.whiteboards = [];
            _this.colors = [];

            _this.markerColor = getEntityUserData(_this.entityID).markerColor;

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
            print("Daantje Debug My Marker Color " + JSON.stringify(_this.markerColor));
			var isIntersectingColorWell = false;
			
            if (colorIntersection.intersects) {
				
				_this.colors.forEach(function(entity) {
					if (entity === colorIntersection.entityID) {
						isIntersectingColorWell = true;
					}
				});
				if (isIntersectingColorWell) {
					_this.markerColor = getEntityCustomData('markerColor', colorIntersection.entityID, DEFAULT_COLOR);
					setEntityCustomData('markerColor', _this.entityID, _this.markerColor);
				} else {
					// update color
                    _this.markerColor = getEntityCustomData('markerColor', _this.entityID, DEFAULT_COLOR);
				}
				
            } else {
                // update color
                _this.markerColor = getEntityCustomData('markerColor', _this.entityID, DEFAULT_COLOR);
            }

            var whiteBoardIntersection = Entities.findRayIntersection(pickRay, true, _this.whiteboards);
            if (whiteBoardIntersection.intersects && Vec3.distance(whiteBoardIntersection.intersection, markerProps.position) <= _this.DRAW_ON_BOARD_DISTANCE) {
                _this.currentWhiteboard = whiteBoardIntersection.entityID;
                var whiteboardRotation = Entities.getEntityProperties(_this.currentWhiteboard, "rotation").rotation;
                _this.whiteboardNormal = Quat.getFront(whiteboardRotation);

                _this.paint(whiteBoardIntersection.intersection)
            
                hand = paramsArray[0] === 'left' ? 0 : 1;
                var vibrated = Controller.triggerHapticPulse(1, 70, hand);
            } else if (_this.currentStroke) {
                _this.resetStroke();
            }
        },

        startEquip: function() {
            _this.startNearGrab();
        },

        continueEquip: function(ID, paramsArray) {
            _this.continueNearGrab(ID, paramsArray);
        },

        releaseEquip: function() {
             _this.releaseGrab();
        },

        newStroke: function(position) {
            _this.strokeBasePosition = position;
            _this.currentStroke = Entities.addEntity({
                type: "PolyLine",
                name: _this.STROKE_NAME,
                dimensions: {
                    x: 10,
                    y: 10,
                    z: 10
                },
                position: position,
				color: _this.markerColor,
                textures: _this.MARKER_TEXTURE_URL,
                
                lifetime: 5000
            });

            _this.linePoints = [];
            _this.normals = [];
            _this.strokes.push(_this.currentStroke);
            // Test start new stroke
			var serverID = Entities.getEntityProperties(_this.currentWhiteboard, "parentID").parentID;
			print("Daantje Debug + call server newStroke " + serverID);
            Entities.callEntityServerMethod(serverID, 'startMarkerStroke', []);
        },

        paint: function(position) {
            var basePosition = position;
            if (!_this.currentStroke) {
                if (_this.oldPosition) {
                    basePosition = _this.oldPosition;
                }
                _this.newStroke(basePosition);
            }

            var localPoint = Vec3.subtract(basePosition, _this.strokeBasePosition);
            localPoint = Vec3.sum(localPoint, Vec3.multiply(_this.whiteboardNormal, _this.strokeForwardOffset));

            if (_this.linePoints.length > 0) {
                var distance = Vec3.distance(localPoint, _this.linePoints[_this.linePoints.length - 1]);
                if (distance < _this.MIN_DISTANCE_BETWEEN_POINTS) {
                    return;
                }
            }
            _this.linePoints.push(localPoint);
            _this.normals.push(_this.whiteboardNormal);

            var strokeWidths = [];
            var i;
            for (i = 0; i < _this.linePoints.length; i++) {
                // Create a temp array of stroke widths for calligraphy effect - start and end should be less wide
                var pointsFromCenter = Math.abs(_this.linePoints.length / 2 - i);
                var pointWidth = map(pointsFromCenter, 0, this.linePoints.length / 2, _this.STROKE_WIDTH_RANGE.max, this.STROKE_WIDTH_RANGE.min);
                strokeWidths.push(pointWidth);
            }

            Entities.editEntity(_this.currentStroke, {
                linePoints: _this.linePoints,
                normals: _this.normals,
                strokeWidths: strokeWidths
            });

            if (_this.linePoints.length > MAX_POINTS_PER_STROKE) {
                Entities.editEntity(_this.currentStroke, {
                    parentID: _this.currentWhiteboard
                });
                _this.currentStroke = null;
                _this.oldPosition = position;
            }
            
            // Test continue new stroke
			// whiteboard server ID
			var serverID = Entities.getEntityProperties(_this.currentWhiteboard, "parentID").parentID;
			print("Daantje Debug + call server paint " + serverID);
            Entities.callEntityServerMethod(serverID, 'continueMarkerStroke', []);
        },

        resetStroke: function() {
            Entities.editEntity(_this.currentStroke, {
                parentID: _this.currentWhiteboard
            });
            _this.currentStroke = null;

            _this.oldPosition = null;

            // Test reset stroke
			var serverID = Entities.getEntityProperties(_this.currentWhiteboard, "parentID").parentID;
			print("Daantje Debug + call server reset " + serverID);
            Entities.callEntityServerMethod(serverID, 'resetMarkerStroke', []);
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
