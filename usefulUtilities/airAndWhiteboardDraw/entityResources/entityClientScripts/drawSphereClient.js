//
//  drawSphereClient.js
//
//  Created by Rebecca Stankus 3/28/2019
//  Additional code by Milad Nazeri 6/6/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var _this;

    var WHITEBOARD_ZONE_SEARCH_RADIUS_M = 100;
    var MINIMUM_MOVEMENT_TO_DRAW_M = 0.0005;
    var MAXIMUM_MOVEMENT_TO_DRAW_M = 0.1;
    var MAXIMUM_DISTANCE_TO_SEARCH_M = 1;
    var MAXIMUM_DISTANCE_TO_DELETE_M = 0.03;
    var STROKE_FORWARD_OFFSET_M = 0.01;

    var WAIT_TO_CLEAN_UP_MS = 2000;
    var WAIT_FOR_ENTITIES_TO_LOAD_MS = 300;
    var LASER_LIFETIME_S = 1;
    var DECAY_TIME_S = 60;

    var DRAW_SOUND = SoundCache.getSound(Script.resolvePath('../resources/sounds/draw.mp3'));
    var OPEN_SOUND = SoundCache.getSound(Script.resolvePath('../resources/sounds/open.mp3'));
    var CLOSE_SOUND = SoundCache.getSound(Script.resolvePath('../resources/sounds/close.mp3'));
    var DRAW_SOUND_VOLUME = 0.08;
    var OPEN_SOUND_VOLUME = 0.02;
    var CLOSE_SOUND_VOLUME = 0.02;
    var SOUND_DELAY_TIME = 40;
    
    var MINIMUM_TRIGGER_PRESS_VALUE = 0.97;

    var HALF = 0.5;

    var DEFAULT_STROKE_WIDTH = 0.015;
    var DEFAULT_NORMAL = { x: 0, y: 0, z: 1 };
    var MAX_LINE_POINTS = 100;
    var DEFAULT_LINE_PROPERTIES = {
        type: "PolyLine",
        name: "Whiteboard Polyline",
        isUVModeStretch: true,
        lifetime: DECAY_TIME_S,
        collisionless: true,
        grab: { grabbable: false }
    };
    
    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');

    var dominantHandJoint;
    var dominantHand;
    var controllerHandNumber;
    var parentJointIndex;

    var whiteboard = null;
    var whiteboardZone = null;
    var whiteboardParts = [];
    var whiteboardProperties;

    var mouseEventsConnected = false;
    var controllerMappingName = 'Hifi-DrawApp';
    var controllerMapping;

    var activeTriggerPress = false;
    var activeGripPress = false;
    var drawingInDesktop;
    
    var animationData = {};
    var animationHandlerID;

    var injector;
    
    var pickRay;

    var polyLine = null;
    var lineStartPosition;
    var previousLinePoint;
    var previousNormal;
    var previousStrokeWidth;
    var currentPoint;
    var currentNormal;
    var currentStrokeWidth;
    var wasLastPointOnBoard;
    var displacementFromStart;

    var isTheTriggerUpdateRunning = false;
    var isTheGripUpdateRunning = false;

    var laser = null;
    
    var readyToDraw = false;
    var initialLineStartDataReady = false;

    var PaintSphere = function() {
        _this = this;
    };

    /* When a paint sphere is created, collect data for later use. Find the correct joint to use parent the sphere 
    to and connect signals. Set up mapping, and enter enter correct view mode. Play a sound to signal getting a new 
    paint sphere. */
    PaintSphere.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            Script.setTimeout(function() {
                var properties = Entities.getEntityProperties(_this.entityID, ['userData','color']);
                _this.color = properties.color;
                _this.texture = JSON.parse(properties.userData).textureURL;
                _this.findWhiteboard();
                readyToDraw = true;
            }, WAIT_FOR_ENTITIES_TO_LOAD_MS);
            dominantHand = MyAvatar.getDominantHand();
            dominantHandJoint = (dominantHand === "right") ? "RightHand" : "LeftHand";
            controllerHandNumber = (dominantHand === "right") ? Controller.Standard.RightHand : Controller.Standard.LeftHand;
            MyAvatar.dominantHandChanged.connect(_this.handChanged);

            parentJointIndex = MyAvatar.getJointIndex(dominantHandJoint + "Index4");
            if (parentJointIndex === -1) {
                parentJointIndex = MyAvatar.getJointIndex(dominantHandJoint + "Index3");
            }
            if (parentJointIndex === -1) {
                parentJointIndex =MyAvatar.getJointIndex(dominantHandJoint);
                print("ERROR: Falling back to dominant hand joint as index finger tip could not be found");
            }
            currentStrokeWidth = _this.getCurrentStrokeWidth();
            tablet.tabletShownChanged.connect(_this.tabletShownChanged);
            HMD.displayModeChanged.connect(_this.displayModeChanged);
            Window.domainChanged.connect(_this.domainChanged);
            MyAvatar.scaleChanged.connect(_this.onScaleChanged);
            _this.registerControllerMapping();
            if (HMD.active) {
                _this.setUpHMDMode();
            } else {
                _this.setUpDesktopMode();
            }
            _this.playSound(OPEN_SOUND, OPEN_SOUND_VOLUME, MyAvatar.position, true, false);
        },

        /* PLAY A SOUND: Plays a sound at the specified position, volume, local mode, and playback 
        mode requested. */
        playSound: function(sound, volume, position, localOnly, loop){
            if (sound.downloaded) {
                if (injector) {
                    injector.stop();
                    injector = null;
                }
                injector = Audio.playSound(sound, {
                    position: position,
                    volume: volume,
                    localOnly: localOnly,
                    loop: loop
                });
            }
        },

        /* Determine is my avatar is inside the boundaries of a zone */
        isUserInZone: function(zoneID) {
            var zoneProperties = Entities.getEntityProperties(zoneID, ['position', 'rotation', 'dimensions']);
            var localPosition = Vec3.multiplyQbyV(Quat.inverse(zoneProperties.rotation),
                Vec3.subtract(MyAvatar.position, zoneProperties.position));
            var halfDimensions = Vec3.multiply(zoneProperties.dimensions, HALF);
            return -halfDimensions.x <= localPosition.x &&
                    halfDimensions.x >= localPosition.x &&
                   -halfDimensions.y <= localPosition.y &&
                    halfDimensions.y >= localPosition.y &&
                   -halfDimensions.z <= localPosition.z &&
                    halfDimensions.z >= localPosition.z;
        },

        /* Scroll through whiteboard zones to find the one whose zone you are in. If not found, delete this sphere, 
        ending this script */
        findWhiteboard: function() {
            Entities.findEntitiesByName("Whiteboard Zone", MyAvatar.position, WHITEBOARD_ZONE_SEARCH_RADIUS_M).
                forEach(function(foundWhiteboardZone) {
                    if (_this.isUserInZone(foundWhiteboardZone)) {
                        whiteboardZone = foundWhiteboardZone;
                        whiteboard = Entities.getEntityProperties(whiteboardZone, 'parentID').parentID;
                    }
                });
            if (whiteboard) {
                whiteboardParts = Entities.getChildrenIDs(whiteboard);
                whiteboardParts.push(whiteboard);
            } else {
                Entities.deleteEntity(_this.entityID);
            }
        },

        /* If current point is in range, and on same surface as last point, get ready to draw. If this is not a new 
        line, check that the current line has room to add more points and start a new line if necessary. Otherwise, 
        update the position of the draw sound and edit the current line to add the current point. If not editing the 
        current line, draw a new one. */
        draw: function(onBoard) {
            if (!readyToDraw) {
                return;
            }
            if (Vec3.distance(previousLinePoint, currentPoint) < MINIMUM_MOVEMENT_TO_DRAW_M ||
            Vec3.distance(previousLinePoint, currentPoint) > MAXIMUM_MOVEMENT_TO_DRAW_M) {
                return;
            }
            if (onBoard !== wasLastPointOnBoard) { // toggle between on board and air, stop drawing
                _this.stopDrawing();
                wasLastPointOnBoard = null;
                return;
            }
            wasLastPointOnBoard = onBoard;
            var newLine = !polyLine;
            var lineProperties = DEFAULT_LINE_PROPERTIES;
            var linePointsCount;
            if (!newLine) { // maybe editing existing line
                var previousLineProperties = Entities.getEntityProperties(polyLine, ['linePoints', 'normals', 
                    'strokeWidths', 'age']);
                if (!(previousLineProperties.linePoints && previousLineProperties.normals && 
                    previousLineProperties.strokeWidths && previousLineProperties.age)) {
                    _this.stopDrawing();
                    return;
                }
                linePointsCount = previousLineProperties.linePoints.length;
                if (linePointsCount > MAX_LINE_POINTS) { // too many line points, start new line connected to previous point
                    newLine = true;
                    lineStartPosition = previousLinePoint;
                    displacementFromStart = Vec3.subtract(currentPoint, lineStartPosition);
                } else { // actually editing the previous line
                    if (injector) {
                        injector.options = {
                            position: currentPoint,
                            volume: DRAW_SOUND_VOLUME
                        };
                    }
                    lineProperties.linePoints.push(displacementFromStart);
                    lineProperties.normals.push(currentNormal);
                    lineProperties.strokeWidths.push(currentStrokeWidth);
                    if (!onBoard) {
                        lineProperties.lifetime = previousLineProperties.age + DECAY_TIME_S;
                    }
                    Entities.editEntity(polyLine, {
                        linePoints: lineProperties.linePoints,
                        normals: lineProperties.normals,
                        strokeWidths: lineProperties.strokeWidths,
                        lifetime: lineProperties.lifetime,
                        faceCamera: !onBoard
                    });
                }
            }
            // new line due to just beginning to draw or starting new to continue line with too many points. 
            // All lines have some previous data saved from the initial point, actual new lines have no line points yet
            if (newLine) {
                lineProperties.position = lineStartPosition;
                lineProperties.linePoints = [{x: 0, y: 0, z: 0 }, displacementFromStart];
                lineProperties.normals = [previousNormal, currentNormal];
                lineProperties.strokeWidths = [previousStrokeWidth, currentStrokeWidth];
                lineProperties.color = _this.color;
                lineProperties.textures = _this.texture;
                lineProperties.faceCamera = !onBoard;
                if (polyLine && whiteboard) {
                    Entities.editEntity(polyLine, { parentID: whiteboard });
                }
                if (onBoard) {
                    lineProperties.lifetime = -1;
                    polyLine = Entities.addEntity(lineProperties);
                } else {
                    polyLine = Entities.addEntity(lineProperties, 'avatar');
                }
            }
        },

        /* Since polylines don't intersect, we delete by finding the line with a point closest to the current 
        position where we want to delete. */
        deleteFromPoint: function(point) {
            var lineToDelete = null;
            Entities.findEntitiesByName("Whiteboard Polyline", point, 
                MAXIMUM_DISTANCE_TO_SEARCH_M).forEach(function(nearbyWhiteboardLine) {
                var lineProperties = Entities.getEntityProperties(nearbyWhiteboardLine, 
                    ['position', 'linePoints']);
                if (!(lineProperties.linePoints && lineProperties.position)) {
                    return;
                }
                var lineBoundingBoxCenter = lineProperties.position;
                var numberLinePoints = lineProperties.linePoints.length;
                var shortestDistance = MAXIMUM_DISTANCE_TO_DELETE_M;
                for (var i = 0; i < numberLinePoints; i++) {
                    var distanceFromPoint = Vec3.distance(point,
                        Vec3.sum(lineBoundingBoxCenter, lineProperties.linePoints[i]));
                    if (distanceFromPoint <= shortestDistance) {
                        lineToDelete = nearbyWhiteboardLine;
                        shortestDistance = distanceFromPoint;
                    }
                }
            });
            if (lineToDelete) {
                Entities.deleteEntity(lineToDelete);
            }
        },

        /* Use the dimensions of the paint sphere in order to handle avatar resizing */
        getCurrentStrokeWidth: function() {
            var paintSphereDimensions = Entities.getEntityProperties(_this.entityID, 'dimensions').dimensions;
            return paintSphereDimensions ? paintSphereDimensions.x : DEFAULT_STROKE_WIDTH;
        },

        /* Create a ray from the mouse position to the white board to get intersection data. If it intersects 
        a selection button, we are not drawing */
        getDesktopIntersectionData: function(event) {
            pickRay = Camera.computePickRay(event.x, event.y);
            var whiteBoardIntersectionData = Entities.findRayIntersection(pickRay, true, whiteboardParts);
            if (whiteBoardIntersectionData.intersects) {
                var intersectedWhiteboardPartName = Entities.getEntityProperties(whiteBoardIntersectionData.entityID, 
                    'name').name;
                if (intersectedWhiteboardPartName !== "Whiteboard") {
                    if (drawingInDesktop) {
                        _this.stopDrawing();
                    }
                    return -1;
                }
            }
            return whiteBoardIntersectionData;
        },

        /* On mouse press, if the user is not in the whiteboard zone or is using tablet or create, ignore. Check for 
        an intersection, and project point onto board if necessary. If drawing in air, project point forward 1M in 
        front of camera. Begin drawing sound and store initial data. If deleting, begin at current point. */
        mousePressed: function(event) {
            if (!whiteboardZone) {
                return;
            }
            if (!_this.isUserInZone(whiteboardZone)) {
                Entities.deleteEntity(_this.entityID);
            }
            if (Settings.getValue("io.highfidelity.isEditing", false) || tablet.tabletShown) {
                return;
            }
            var whiteBoardIntersectionData = _this.getDesktopIntersectionData(event);
            if (whiteBoardIntersectionData === -1) {
                return;
            }
            var isCurrentPointOnBoard = _this.maybeProjectPointOntoBoard(whiteBoardIntersectionData, true);
            wasLastPointOnBoard = isCurrentPointOnBoard;
            if (event.isLeftButton) {
                drawingInDesktop = true;
                if (!isCurrentPointOnBoard) {
                    return;
                }
                currentStrokeWidth = _this.getCurrentStrokeWidth();
                _this.playSound(DRAW_SOUND, DRAW_SOUND_VOLUME, currentPoint, true, true);
                lineStartPosition = currentPoint;
            } else if (event.isMiddleButton) {
                _this.deleteFromPoint(currentPoint);
            }
        }, 

        /* While holding mouse button, continue getting new intersection data, and updating line data to draw 
        or delete with. */
        mouseContinueLine: function(event) {
            if (!drawingInDesktop) {
                return;
            }
            var whiteBoardIntersectionData = _this.getDesktopIntersectionData(event);
            if (whiteBoardIntersectionData === -1) {
                return;
            }
            previousLinePoint = currentPoint;
            previousNormal = currentNormal;
            previousStrokeWidth = currentStrokeWidth;
            currentStrokeWidth = _this.getCurrentStrokeWidth();
            var isCurrentPointOnBoard = _this.maybeProjectPointOntoBoard(whiteBoardIntersectionData, true);
            if (event.isLeftButton) {
                if (!isCurrentPointOnBoard) {
                    return;
                }
                displacementFromStart = Vec3.subtract(currentPoint, lineStartPosition);
                _this.draw(isCurrentPointOnBoard);
            } else if (event.isMiddleButton) {
                _this.deleteFromPoint(currentPoint);
            }
        },

        /* On mouse release stop drawing if necessary */
        mouseReleased: function(event) {
            if (event.isLeftButton) {
                if (drawingInDesktop) {
                    drawingInDesktop = false;
                    _this.stopDrawing();
                }
            }
        },

        /* If there is an intersection with the whiteboard, project the point onto the surface, set its normals to match, 
        and then move it slightly in front of the board. */
        maybeProjectPointOntoBoard: function(whiteBoardIntersectionData, desktop) {
            if (whiteBoardIntersectionData.intersects) {
                currentPoint = whiteBoardIntersectionData.intersection;
                whiteboardProperties = Entities.getEntityProperties(whiteboard, ['position', 'rotation']);
                var isCurrentPointOnBoard = true;
                currentNormal = Vec3.multiply(-1, Quat.getFront(whiteboardProperties.rotation));
                var distanceWhiteboardPlane = Vec3.dot(currentNormal, whiteboardProperties.position);
                var distanceLocal = Vec3.dot(currentNormal, currentPoint) - distanceWhiteboardPlane;
                currentPoint = Vec3.subtract(currentPoint, Vec3.multiply(distanceLocal, currentNormal));
                currentPoint = Vec3.subtract(currentPoint, Vec3.multiply(currentNormal, STROKE_FORWARD_OFFSET_M));
            } else {
                isCurrentPointOnBoard = false;
            }
            return isCurrentPointOnBoard;
        },

        /* Create a laser to show where the user is drawing or deleting */
        beginLaser: function() {
            laser = Entities.addEntity({
                type: "Shape",
                shape: "Cylinder",
                registrationPoint: {x: 0.5, y: 0, z: 0.5 },
                dimensions: {x: 0.01, y: 1, z: 0.01 },
                lifetime: LASER_LIFETIME_S,
                collisionless: true,
                grab: { grabbable: false },
                localPosition: {x: 0, y: 0, z: 0 },
                localRotation: Quat.fromVec3Degrees({x:0,y:0,z:0}),
                color: _this.color,
                name: "Whiteboard HMD Beam",
                parentID: _this.entityID
            }, 'avatar');
        },

        /* Set the length of the laser to match the distance from the user's paint sphere to the whiteboard intersection */
        updateLaser: function(whiteBoardIntersectionData) {
            var currentAge = Entities.getEntityProperties(laser, 'age').age;
            Entities.editEntity(laser, {
                lifetime: currentAge + LASER_LIFETIME_S,
                dimensions: {x: 0.005, y: whiteBoardIntersectionData.distance, z: 0.005 },
                localPosition: {x: 0, y: 0, z: 0 },
                localRotation: Quat.fromVec3Degrees({x:0,y:0,z:0})
            });
        },

        /* Save previous point data, get intersection data, and project point if necessary. Calculate displacement 
        of point from line start and if the point is in air, set the normal to default. If collecting initial line data, 
        set start position. Store and return onBoard data for comparison with next point. */
        getHMDLinePointData: function(force) {
            // forced on initial run through to collect line start data
            if (!initialLineStartDataReady && !force) {
                isCurrentPointOnBoard = -1;
            }
            if (initialLineStartDataReady) {
                previousLinePoint = currentPoint;
                previousNormal = currentNormal;
                previousStrokeWidth = currentStrokeWidth;
            }

            var pose = _this.getControllerWorldLocation(controllerHandNumber);
            currentPoint = pose.position;

            var direction = Vec3.multiplyQbyV(pose.orientation, [0, 1, 0]);

            var whiteBoardIntersectionData = _this.getHMDIntersectionData(currentPoint, direction);
            if (whiteBoardIntersectionData === -1) {
                return;
            }
            var isCurrentPointOnBoard = _this.maybeProjectPointOntoBoard(whiteBoardIntersectionData, false);
            displacementFromStart = Vec3.subtract(currentPoint, lineStartPosition);
            if (!isCurrentPointOnBoard) {
                currentNormal = DEFAULT_NORMAL;
            }
            if (!initialLineStartDataReady) {
                wasLastPointOnBoard = isCurrentPointOnBoard;
                lineStartPosition = currentPoint;
                initialLineStartDataReady = true;
            } 
            return isCurrentPointOnBoard;
        },

        /* Create ray from paint sphere away from hand along outstretched finger. If it intersects the whiteboard, 
        check if this is only a selection and return if so. Draw laser if none exists yet. */
        getHMDIntersectionData: function(origin, direction) {
            var pickRay = {
                origin: origin,
                direction: direction
            };
            var whiteBoardIntersectionData = Entities.findRayIntersection(pickRay, true, whiteboardParts);
            if (whiteBoardIntersectionData.intersects) {
                var intersectedWhiteboardPartName = Entities.getEntityProperties(whiteBoardIntersectionData.entityID, 
                    'name').name;
                if (intersectedWhiteboardPartName !== "Whiteboard") {
                    if (initialLineStartDataReady) {
                        _this.stopDrawing();
                    }
                    return -1;
                }
                if (!laser) {
                    _this.beginLaser();
                } else {
                    _this.updateLaser(whiteBoardIntersectionData);
                }
            }
            return whiteBoardIntersectionData;
        },

        /* On trigger press, if the user is not in whiteboard zone, delete this sphere. If the user is using tablet or grip 
        button, ignore. Get line point data and begin draw sound then start an interval to continue collecting data 
        and drawing */
        triggerPressed: function() {
            if (!readyToDraw) {
                return;
            }
            if (!_this.isUserInZone(whiteboardZone)) {
                Entities.deleteEntity(_this.entityID);
            }
            if (tablet.tabletShown || activeGripPress) {
                return;
            }
            var isCurrentPointOnBoard = _this.getHMDLinePointData(true);
            if (isCurrentPointOnBoard === -1) {
                return;
            }
            // Adding a small delay helps make sure the audio always plays using the new controller method
            Script.setTimeout(function(){
                _this.playSound(DRAW_SOUND, DRAW_SOUND_VOLUME, lineStartPosition, true, true);
            }, SOUND_DELAY_TIME);

            isTheTriggerUpdateRunning = true;
            Script.update.connect(_this.onTriggerPressedScriptUpdate);
        },
        
        onTriggerPressedScriptUpdate: function(){
            if (initialLineStartDataReady) {
                var isCurrentPointOnBoard = _this.getHMDLinePointData(false);
                if (isCurrentPointOnBoard === -1) {
                    return;
                }
                _this.draw(isCurrentPointOnBoard);
            }
        },

        /* On releasing trigger, if the user is not in whiteboard zone, delete this sphere. If laser or drawing interval 
        exists, delete it.*/
        triggerReleased: function() {
            if (!_this.isUserInZone(whiteboardZone)) {
                Entities.deleteEntity(_this.entityID);
            }
            _this.stopDrawing();
            if (laser) {
                Entities.deleteEntity(laser);
                laser = null;
            }
            if (isTheTriggerUpdateRunning) {
                Script.update.disconnect(_this.onTriggerPressedScriptUpdate);
                isTheTriggerUpdateRunning = false;
            }
        },

        /* On grip press, if the user is not in whiteboard zone, delete this sphere. If the user is using tablet or trigger 
        button, ignore. Begin a deleting interval that gets intersection data, updates laser, and deletes from the 
        current point. */
        gripPressed: function() {
            if (!_this.isUserInZone(whiteboardZone)) {
                Entities.deleteEntity(_this.entityID);
            }
            if (tablet.tabletShown || activeTriggerPress) {
                return;
            }
            isTheGripUpdateRunning = true;
            Script.update.connect(_this.onGripPressedScriptUpdate);
        },

        /* On releasing grip, stop the interval that is searching for lines to delete */
        gripReleased: function() {
            if (!_this.isUserInZone(whiteboardZone)) {
                Entities.deleteEntity(_this.entityID);
            }
            if (isTheGripUpdateRunning) {
                Script.update.disconnect(_this.onGripPressedScriptUpdate);
                isTheGripUpdateRunning = false;
            }
            if (laser) {
                Entities.deleteEntity(laser);
                laser = null;
            }
        },

        onGripPressedScriptUpdate: function() {
            var pose = _this.getControllerWorldLocation(controllerHandNumber);
            currentPoint = pose.position;
            // Get the direction that the hand is facing in the world
            var direction = Vec3.multiplyQbyV(pose.orientation, [0, 1, 0]);

            var whiteBoardIntersectionData = _this.getHMDIntersectionData(currentPoint, direction);
            var isCurrentPointOnBoard = _this.maybeProjectPointOntoBoard(whiteBoardIntersectionData, false);
            if (isCurrentPointOnBoard) {
                // delete on board
                if (!laser) {
                    _this.beginLaser();
                } else {
                    _this.updateLaser(whiteBoardIntersectionData);
                }
            }
            _this.deleteFromPoint(currentPoint);
        },

        /* Stop drawing sound, reset line data */
        stopDrawing: function() {
            if (injector) {
                injector.stop();
                injector = null;
            }
            if (!polyLine) {
                return;
            }
            if (whiteboard) {
                Entities.editEntity(polyLine, { parentID: whiteboard });
            }
            initialLineStartDataReady = false;
            polyLine = null;
            currentPoint = null;
            previousLinePoint = null;
            if (drawingInDesktop) {
                drawingInDesktop = false;
            }
        },

        /* Get correct animation overrides depending on dominant hand */  
        getAnimationData: function() {
            if (dominantHand === "right") {
                animationData.rightHandType = 0;
                animationData.isRightHandGrasp = false;
                animationData.isRightIndexPoint = true;
                animationData.isRightThumbRaise = false;
                animationData.isRightIndexPointAndThumbRaise = false;
            } else {
                animationData.leftHandType = 0;
                animationData.isLeftHandGrasp = false;
                animationData.isLeftIndexPoint = true;
                animationData.isLeftThumbRaise = false;
                animationData.isLeftIndexPointAndThumbRaise = false;
            }
            return animationData;
        },

        /* Create controller mapping to listen for trigger presses */
        setUpHMDMode: function() {
            if (controllerMapping) {
                controllerMapping.enable();
            }
            animationHandlerID = MyAvatar.addAnimationStateHandler(_this.getAnimationData, []);
            Messages.sendLocalMessage("Hifi-Hand-Disabler", dominantHand);
        },

        /* Listen for mouse presses */
        setUpDesktopMode: function() {
            if (!mouseEventsConnected) {
                mouseEventsConnected = true;
                Controller.mousePressEvent.connect(_this.mousePressed);
                Controller.mouseMoveEvent.connect(_this.mouseContinueLine);
                Controller.mouseReleaseEvent.connect(_this.mouseReleased);
            }
        },

        /* Remove controller mapping */
        closeHMDMode: function() {
            if (controllerMapping) {
                controllerMapping.disable();
            }
            Messages.sendLocalMessage("Hifi-Hand-Disabler", "none");
            if (animationHandlerID) {
                animationHandlerID = MyAvatar.removeAnimationStateHandler(animationHandlerID);
            }
        },

        /* Stop listening for mouse presses */
        closeDesktopMode: function() {
            if (mouseEventsConnected) {
                mouseEventsConnected = false;
                Controller.mousePressEvent.disconnect(_this.mousePressed);
                Controller.mouseMoveEvent.disconnect(_this.mouseContinueLine);
                Controller.mouseReleaseEvent.disconnect(_this.mouseReleased);
            }
        },

        /* Listen for controller trigger movements and act when the trigger is pressed or 
        released */
        registerControllerMapping: function() {
            controllerMapping = Controller.newMapping(controllerMappingName);
            controllerMapping.from(Controller.Standard.RT).to(function (value) {
                if (dominantHand === "right") {
                    if (value >= MINIMUM_TRIGGER_PRESS_VALUE && !activeTriggerPress) {
                        activeTriggerPress = true;
                        _this.triggerPressed();
                    } else if (value <= MINIMUM_TRIGGER_PRESS_VALUE && activeTriggerPress) {
                        activeTriggerPress = false;
                        _this.triggerReleased();
                    }
                }
            });
            controllerMapping.from(Controller.Standard.RightGrip).to(function (value) {
                if (dominantHand === "right") {
                    if (value >= MINIMUM_TRIGGER_PRESS_VALUE && !activeGripPress) {
                        activeGripPress = true;
                        _this.gripPressed();
                    } else if (value <= MINIMUM_TRIGGER_PRESS_VALUE && activeGripPress) {
                        activeGripPress = false;
                        _this.gripReleased();
                    }
                }
            });
            controllerMapping.from(Controller.Standard.LT).to(function (value) {
                if (dominantHand === "left") {
                    if (value >= MINIMUM_TRIGGER_PRESS_VALUE && !activeTriggerPress ) {
                        activeTriggerPress = true;
                        _this.triggerPressed();
                    } else if (value <= MINIMUM_TRIGGER_PRESS_VALUE && activeTriggerPress) {
                        activeTriggerPress = false;
                        _this.triggerReleased();
                    }
                }
            });
            controllerMapping.from(Controller.Standard.LeftGrip).to(function (value) {
                if (dominantHand === "left") {
                    if (value >= MINIMUM_TRIGGER_PRESS_VALUE && !activeGripPress) {
                        activeGripPress = true;
                        _this.gripPressed();
                    } else if (value <= MINIMUM_TRIGGER_PRESS_VALUE && activeGripPress) {
                        activeGripPress = false;
                        _this.gripReleased();
                    }
                }
            });
        },

        /* Delete paint sphere in hand when leaving the domain */
        domainChanged: function() {
            Script.setTimeout(function() {
                Entities.deleteEntity(_this.entityID);
            }, WAIT_TO_CLEAN_UP_MS);
        },

        /* Delete paint sphere in hand when switching dominant hand */
        handChanged: function() {
            Entities.deleteEntity(_this.entityID);
        },

        /* If opening tablet, stop action and close drawing view mode. When the tablet closes, set up correct drawing mode. */
        tabletShownChanged: function() {
            if (tablet.tabletShown) {
                if (HMD.active) {
                    if (activeTriggerPress) {
                        _this.triggerReleased();
                    } else if (activeGripPress) {
                        _this.gripReleased();
                    }
                    _this.closeHMDMode();
                } else {
                    _this.mouseReleased();
                    _this.closeDesktopMode();
                }
            } else {
                if (HMD.active) {
                    _this.setUpHMDMode();
                } else {
                    _this.setUpDesktopMode();
                }
            }
        },

        /* Set variable to track which mode to use to draw lines */
        displayModeChanged: function() {
            if (HMD.active) {
                _this.closeDesktopMode();
                _this.setUpHMDMode();
            } else {
                _this.closeHMDMode();
                _this.setUpDesktopMode();
            }
        },


        /* The following two functions are from scripts/system/libraries/controllers.js to help with getting the pose infromation from the controllers */
        getGrabPointSphereOffset: function (handController) {
            // These values must match what's in scripts/system/libraries/controllers.js
            // x = upward, y = forward, z = lateral
            var GRAB_POINT_SPHERE_OFFSET = { x: 0.04, y: 0.13, z: 0.039 };
            var offset = GRAB_POINT_SPHERE_OFFSET;
            if (handController === Controller.Standard.LeftHand) {
                offset = {
                    x: -GRAB_POINT_SPHERE_OFFSET.x,
                    y: GRAB_POINT_SPHERE_OFFSET.y,
                    z: GRAB_POINT_SPHERE_OFFSET.z
                };
            }
        
            return Vec3.multiply(MyAvatar.sensorToWorldScale, offset);
        },

        getControllerWorldLocation: function (handController, doOffset) {
            var orientation;
            var position;
            var valid = false;
        
            if (handController >= 0) {
                var pose = Controller.getPoseValue(handController);
                valid = pose.valid;
                var controllerJointIndex;
                if (pose.valid) {
                    controllerJointIndex = parentJointIndex;
                    orientation = Quat.multiply(MyAvatar.orientation, MyAvatar.getAbsoluteJointRotationInObjectFrame(controllerJointIndex));
                    position = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, MyAvatar.getAbsoluteJointTranslationInObjectFrame(controllerJointIndex)));
        
                    // add to the real position so the grab-point is out in front of the hand, a bit
                    if (doOffset) {
                        var offset = _this.getGrabPointSphereOffset(handController);
                        position = Vec3.sum(position, Vec3.multiplyQbyV(orientation, offset));
                    }
        
                } else if (!HMD.isHandControllerAvailable()) {
                    // NOTE: keep _this offset in sync with scripts/system/controllers/handControllerPointer.js:493
                    var VERTICAL_HEAD_LASER_OFFSET = 0.1 * MyAvatar.sensorToWorldScale;
                    position = Vec3.sum(Camera.position, Vec3.multiplyQbyV(Camera.orientation, 
                        { x: 0, y: VERTICAL_HEAD_LASER_OFFSET, z: 0 }));
                    orientation = Quat.multiply(Camera.orientation, Quat.angleAxis(-90, { x: 1, y: 0, z: 0 }));
                    valid = true;
                }
            }
        
            return {
                position: position,
                translation: position,
                orientation: orientation,
                rotation: orientation,
                valid: valid
            };
        
        },

        onScaleChanged: function(){
            var sphereProperties = Entities.getEntityProperties(_this.entityID, ['dimensions']);
        
            currentStrokeWidth = sphereProperties.dimensions.x;
        },

        /* Close drawing view mode, stop injector, play closing sound, disable hand mapping and overrides. Remove 
        animation handlers, delete all intervals, and disconnect signals. */
        unload: function() {
            if (HMD.active) {
                _this.closeHMDMode();
            } else {
                _this.closeDesktopMode();
            }
            _this.stopDrawing();
            _this.playSound(CLOSE_SOUND, CLOSE_SOUND_VOLUME, MyAvatar.position, true, false);
            if (controllerMapping) {
                controllerMapping.disable();
            }
            Messages.sendLocalMessage("Hifi-Hand-Disabler", "none");
            if (animationHandlerID) {
                animationHandlerID = MyAvatar.removeAnimationStateHandler(animationHandlerID);
            }
            if (isTheTriggerUpdateRunning) {
                Script.update.disconnect(_this.onTriggerPressedScriptUpdate);
            }
            if (isTheGripUpdateRunning) {
                Script.update.disconnect(_this.onGripPressedScriptUpdate);
            }
            tablet.tabletShownChanged.disconnect(_this.tabletShownChanged);
            MyAvatar.dominantHandChanged.disconnect(_this.handChanged);
            HMD.displayModeChanged.disconnect(_this.displayModeChanged);
            Window.domainChanged.disconnect(_this.domainChanged);
            MyAvatar.scaleChanged.disconnect(_this.onScaleChanged); 
        }
    };

    return new PaintSphere();
});