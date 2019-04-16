//
//  drawSphereClient.js
//
//  Created by Rebecca Stankus 3/28/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var _this;

    var WHITEBOARD_SEARCH_RADIUS_M = 5;
    var MINIMUM_MOVEMENT_TO_DRAW_M = 0.0005;
    var MAXIMUM_MOVEMENT_TO_DRAW_M = 0.1;
    var MAXIMUM_DISTANCE_TO_SEARCH_M = 1;
    var MAXIMUM_DISTANCE_TO_DELETE_M = 0.03;
    var DISTANCE_TO_DRAW_IN_FRONT_OF_CAMERA_DESKTOP_M = 1.5;
    var DRAW_ON_BOARD_DISTANCE_HMD_M = 2;
    var DRAW_ON_BOARD_DISTANCE_DESKTOP_M = 3;
    var STROKE_FORWARD_OFFSET_M = 0.01;

    var WAIT_TO_CLEAN_UP_MS = 2000;
    var DELETE_AGAIN_MS = 100;
    var WAIT_FOR_ENTITIES_TO_LOAD_MS = 300;
    var REPEAT_DISTANCE_CHECK_MS = 60;
    var LASER_LIFETIME_S = 1;
    var DECAY_TIME_S = 60;

    var DRAW_SOUND = SoundCache.getSound(Script.resolvePath('../resources/sounds/draw.mp3'));
    var OPEN_SOUND = SoundCache.getSound(Script.resolvePath('../resources/sounds/open.mp3'));
    var CLOSE_SOUND = SoundCache.getSound(Script.resolvePath('../resources/sounds/close.mp3'));
    var DRAW_SOUND_VOLUME = 0.08;
    var OPEN_SOUND_VOLUME = 0.02;
    var CLOSE_SOUND_VOLUME = 0.02;
    
    var MINIMUM_TRIGGER_PRESS_VALUE = 0.97;
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
    var parentJointIndex;

    var whiteboard = null;
    var whiteboardParts = [];
    var whiteboardProperties;

    var mouseEventsConnected = false;
    var controllerMappingName = 'Hifi-DrawApp';
    var controllerMapping;

    var drawInterval = null;
    var deletingInterval;


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

    var laser = null;
    
    var readyToDraw = false;
    var initialLineStartDataReady = false;

    var PaintSphere = function() {
        _this = this;
    };

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
            MyAvatar.dominantHandChanged.connect(_this.handChanged);

            parentJointIndex = MyAvatar.getJointIndex(dominantHandJoint + "Index4");
            if (parentJointIndex === -1) {
                parentJointIndex = MyAvatar.getJointIndex(dominantHandJoint + "Index3");
            }
            if (parentJointIndex === -1) {
                parentJointIndex =MyAvatar.getJointIndex(dominantHandJoint);
                print("ERROR: Falling back to dominant hand joint as index finger tip could not be found");
            }
            tablet.tabletShownChanged.connect(_this.tabletShownChanged);
            HMD.displayModeChanged.connect(_this.displayModeChanged);
            Window.domainChanged.connect(_this.domainChanged);
            _this.registerControllerMapping();
            if (HMD.active) {
                _this.setUpHMDMode();
            } else {
                _this.setUpDesktopMode();
            }
            _this.playSound(OPEN_SOUND, OPEN_SOUND_VOLUME, MyAvatar.position, true, false);
        },

        /* PLAY A SOUND: Plays the specified sound at the position of the user's Avatar using the volume and playback 
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

        findWhiteboard: function() {
            Entities.findEntities(MyAvatar.position, WHITEBOARD_SEARCH_RADIUS_M).forEach(function(entity) {
                var properties = Entities.getEntityProperties(entity, ['position', "name"]);
                if (properties.name && properties.name === "Whiteboard") {
                    if (whiteboard) {
                        if (Vec3.distance(properties.position, MyAvatar.position) <
                            Vec3.distance(Entities.getEntityProperties(whiteboard, "position").position, MyAvatar.position)) {
                            whiteboard = entity;
                        }
                    } else {
                        whiteboard = entity;
                    }
                }
            });
            if (whiteboard) {
                whiteboardParts = Entities.getChildrenIDs(whiteboard);
                whiteboardParts.push(whiteboard);
            }
        },

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
                if (onBoard) {
                    lineProperties.lifetime = -1;
                    polyLine = Entities.addEntity(lineProperties);
                } else {
                    polyLine = Entities.addEntity(lineProperties, 'avatar');
                }
            }
        },

        /* Since polylines don't intersect, find mouse cursor intersection and then cycle through nearby lines to 
        find one with closest point to the intersection, then delete that line */
        deleteFromPoint: function(point) {
        // search because poly lines don't intersect
            var lineToDelete = null;
            Entities.findEntitiesByName("Whiteboard Polyline", point, 
                MAXIMUM_DISTANCE_TO_SEARCH_M).forEach(function(nearbyWhiteboardLine) {
                try {
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
                } catch (err) {
                    // this line has already been deleted (race condition) due to not being deleting on a longer 
                    // interval. Currently deleting search happens every mousePressContinue so we can use the event
                    // Ideally it only needs to happen every 200(?) ms
                }
            });
            if (lineToDelete) {
                Entities.deleteEntity(lineToDelete);
            }
        },

        /* */
        getCurrentStrokeWidth: function() {
            var paintSphereDimensions = Entities.getEntityProperties(_this.entityID, 'dimensions').dimensions;
            return paintSphereDimensions.x;
        },

        /* */
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

        /* ON MOUSE PRESS: Store the initial point to start line. */
        mousePressed: function(event) {
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
                    currentPoint = Vec3.sum(pickRay.origin, Vec3.multiply(pickRay.direction, 
                        DISTANCE_TO_DRAW_IN_FRONT_OF_CAMERA_DESKTOP_M));
                    currentNormal = DEFAULT_NORMAL;
                }
                currentStrokeWidth = _this.getCurrentStrokeWidth();
                _this.playSound(DRAW_SOUND, DRAW_SOUND_VOLUME, currentPoint, true, true);
                lineStartPosition = currentPoint;
            } else if (event.isMiddleButton) {
                _this.deleteFromPoint(currentPoint);
            }
        }, 

        /* ON MOUSE MOVE: Calculate the next line point and add it to the entity. If there are too many line points, 
    begin a new line. */
        mouseContinueLine: function(event) {
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
                    currentPoint = Vec3.sum(pickRay.origin, Vec3.multiply(pickRay.direction, 
                        DISTANCE_TO_DRAW_IN_FRONT_OF_CAMERA_DESKTOP_M));
                    currentNormal = DEFAULT_NORMAL;
                }
                displacementFromStart = Vec3.subtract(currentPoint, lineStartPosition);
                _this.draw(isCurrentPointOnBoard);
            } else if (event.isMiddleButton) {
                _this.deleteFromPoint(currentPoint);
            }
        },

        /* ON MOUSE RELEASE: Stop checking distance cursor has moved */
        mouseReleased: function(event) {
            if (event.isLeftButton) {
                if (drawingInDesktop) {
                    drawingInDesktop = false;
                    _this.stopDrawing();
                }
            }
        },

        /* */
        maybeProjectPointOntoBoard: function(whiteBoardIntersectionData, desktop) {
            if (whiteBoardIntersectionData.intersects) {
                currentPoint = whiteBoardIntersectionData.intersection;
                var currentWhiteboard = whiteBoardIntersectionData.entityID;
                whiteboardProperties = Entities.getEntityProperties(currentWhiteboard, ['position', 'rotation']);
                var distanceToBoard = Vec3.distance(whiteboardProperties.position, MyAvatar.position);
                var minimumDistance = desktop ? DRAW_ON_BOARD_DISTANCE_DESKTOP_M : DRAW_ON_BOARD_DISTANCE_HMD_M;
                if (distanceToBoard <= minimumDistance) {
                    var isCurrentPointOnBoard = true;
                    currentNormal = Vec3.multiply(-1, Quat.getFront(whiteboardProperties.rotation));
                    var distanceWhiteboardPlane = Vec3.dot(currentNormal, whiteboardProperties.position);
                    var distanceLocal = Vec3.dot(currentNormal, currentPoint) - distanceWhiteboardPlane;
                    currentPoint = Vec3.subtract(currentPoint, Vec3.multiply(distanceLocal, currentNormal));
                    currentPoint = Vec3.subtract(currentPoint, Vec3.multiply(currentNormal, STROKE_FORWARD_OFFSET_M));
                }
            } else {
                isCurrentPointOnBoard = false;
            }
            return isCurrentPointOnBoard;
        },

        /* */
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
                color: _this.color,
                name: "Whiteboard HMD Beam",
                parentID: _this.entityID
            }, 'avatar');
        },

        /* */
        updateLaser: function(whiteBoardIntersectionData) {
            var currentAge = Entities.getEntityProperties(laser, 'age').age;
            Entities.editEntity(laser, {
                lifetime: currentAge + LASER_LIFETIME_S,
                dimensions: {x: 0.005, y: whiteBoardIntersectionData.distance, z: 0.005 }
            });
        },

        /* */
        getHMDLinePointData: function(force) {
            if (!initialLineStartDataReady && !force) {
                isCurrentPointOnBoard = -1;
            }
            if (initialLineStartDataReady) {
                previousLinePoint = currentPoint;
                previousNormal = currentNormal;
                previousStrokeWidth = currentStrokeWidth;
            }
            var sphereProperties = Entities.getEntityProperties(_this.entityID, ['position', 'rotation', 'dimensions']);
            currentPoint = sphereProperties.position;
            currentStrokeWidth = sphereProperties.dimensions.x;
            var whiteBoardIntersectionData = _this.getHMDIntersectionData(currentPoint);
            if (whiteBoardIntersectionData === -1) {
                return;
            }
            var isCurrentPointOnBoard = _this.maybeProjectPointOntoBoard(whiteBoardIntersectionData, false);
            displacementFromStart = Vec3.subtract(currentPoint, lineStartPosition);
            if (!isCurrentPointOnBoard) {
                currentNormal = DEFAULT_NORMAL;
                displacementFromStart = Vec3.subtract(currentPoint, lineStartPosition);
            }
            if (!initialLineStartDataReady) {
                lineStartPosition = currentPoint;
                initialLineStartDataReady = true;
            } 
            wasLastPointOnBoard = isCurrentPointOnBoard;
            return isCurrentPointOnBoard;
        },

        /* */
        getHMDIntersectionData: function(origin) {
            var pickRay = {
                origin: origin,
                direction: Vec3.multiplyQbyV(Quat.multiply(MyAvatar.orientation, 
                    MyAvatar.getAbsoluteJointRotationInObjectFrame(parentJointIndex)), [0, 1, 0])
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

        /* ON TRIGGER PRESS DRAW: Store the initial point and begin checking distance hand has moved on an interval. If hand 
    has moved more than minimum distance, draw a polyline entity with a lifetime of 1 minute and continue checking 
    hand distance. Every time hand moves more than the minumum, update the polyline with another node. */
        triggerPressed: function() {
            if (tablet.tabletShown || activeGripPress) {
                return;
            }
            var isCurrentPointOnBoard = _this.getHMDLinePointData(true);
            if (isCurrentPointOnBoard === -1) {
                return;
            }
            _this.playSound(DRAW_SOUND, DRAW_SOUND_VOLUME, lineStartPosition, true, true);
            drawInterval = Script.setInterval(function() { // for trigger presses, check the position on an interval to draw
                if (initialLineStartDataReady) {
                    isCurrentPointOnBoard = _this.getHMDLinePointData(false);
                    if (isCurrentPointOnBoard === -1) {
                        return;
                    }
                    _this.draw(isCurrentPointOnBoard);
                }
            }, REPEAT_DISTANCE_CHECK_MS);
        },

        /* ON TRIGGER RELEASE DRAW: Stop checking distance hand has moved */
        triggerReleased: function() {
            _this.stopDrawing();
            if (laser) {
                Entities.deleteEntity(laser);
                laser = null;
            }
            if (drawInterval) {
                Script.clearInterval(drawInterval);
                drawInterval = null;
            }
        },

        /* ON GRIP PRESS ERASE: Set an interval that finds the nearest line within a maximum distance to paint 
sphere tip and erases it */
        gripPressed: function() {
            if (tablet.tabletShown || activeTriggerPress) {
                return;
            }
            deletingInterval = Script.setInterval(function() {
                var sphereProperties = Entities.getEntityProperties(_this.entityID, ['position', 'rotation', 'dimensions']);
                currentPoint = sphereProperties.position;
                var whiteBoardIntersectionData = _this.getHMDIntersectionData(currentPoint);
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
            }, DELETE_AGAIN_MS);
        },

        /* ON GRIP RELEASE ERASE: Stop the interval that is searching for lines to delete */
        gripReleased: function() {
            if (deletingInterval) {
                Script.clearInterval(deletingInterval);
                deletingInterval = null;
            }
            if (laser) {
                Entities.deleteEntity(laser);
                laser = null;
            }
        },

        /* STOP DRAWING THE CURRENT LINE: stop sound, reset current line variables */
        stopDrawing: function() {
            if (injector) {
                injector.stop();
                injector = null;
            }
            if (!polyLine) {
                return;
            }
            initialLineStartDataReady = false;
            polyLine = null;
            currentPoint = null;
            previousLinePoint = null;
        },

        /* GET ANIMATION DATA: Get correct overrides depending on dominant hand */  
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

        /* SET UP HMD MODE: create controller mapping to listen for trigger presses */
        setUpHMDMode: function() {
            if (controllerMapping) {
                controllerMapping.enable();
            }
            animationHandlerID = MyAvatar.addAnimationStateHandler(_this.getAnimationData, []);
            Messages.sendLocalMessage("Hifi-Hand-Disabler", dominantHand);
        },

        /* SET UP DESKTOP MODE: Listen for mouse presses */
        setUpDesktopMode: function() {
            if (!mouseEventsConnected) {
                mouseEventsConnected = true;
                Controller.mousePressEvent.connect(_this.mousePressed);
                Controller.mouseMoveEvent.connect(_this.mouseContinueLine);
                Controller.mouseReleaseEvent.connect(_this.mouseReleased);
            }
        },

        /* CLOSE HMD MODE: Remove controller mapping */
        closeHMDMode: function() {
            if (controllerMapping) {
                controllerMapping.disable();
            }
            Messages.sendLocalMessage("Hifi-Hand-Disabler", "none");
            if (animationHandlerID) {
                animationHandlerID = MyAvatar.removeAnimationStateHandler(animationHandlerID);
            }
        },

        /* CLOSE DESKTOP MODE: Stop listening for mouse presses */
        closeDesktopMode: function() {
            if (mouseEventsConnected) {
                mouseEventsConnected = false;
                Controller.mousePressEvent.disconnect(_this.mousePressed);
                Controller.mouseMoveEvent.disconnect(_this.mouseContinueLine);
                Controller.mouseReleaseEvent.disconnect(_this.mouseReleased);
            }
        },

        /* REGISTER CONTROLLER MAPPING: Listen for controller trigger movements and act when the trigger is pressed or 
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

        /* WHEN USER DOMAIN CHANGES: Close app to remove paint sphere in hand when leaving the domain */
        domainChanged: function() {
            Script.setTimeout(function() {
                Entities.deleteEntity(_this.entityID);
            }, WAIT_TO_CLEAN_UP_MS);
        },

        /* WHEN USER CHANGES DOMINANT HAND: Switch default hand to place paint sphere in */
        handChanged: function() {
            Entities.deleteEntity(_this.entityID);
        },

        /* TABLET SHOWN CHANGED: If draw app is open and tablet is shown, disable it. When the tablet closes while draw
        app is open, reenable it */
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

        /* WHEN TOGGLING DISPLAY MODE: Set variable to track which method to use to draw lines */
        displayModeChanged: function() {
            if (HMD.active) {
                _this.closeDesktopMode();
                _this.setUpHMDMode();
            } else {
                _this.closeHMDMode();
                _this.setUpDesktopMode();
            }
        },

        /* ON STOPPING THE SCRIPT: Make sure the paint sphere gets deleted and its variable set back to null 
    if applicable. Search for any unreferenced paint spheres and delete if found. */
        unload: function() {
            if (HMD.active) {
                _this.closeHMDMode();
            } else {
                _this.closeDesktopMode();
            }
            if (injector) {
                injector.stop();
                injector = null;
            }
            _this.playSound(CLOSE_SOUND, CLOSE_SOUND_VOLUME, MyAvatar.position, true, false);
            if (controllerMapping) {
                controllerMapping.disable();
            }
            Messages.sendLocalMessage("Hifi-Hand-Disabler", "none");
            if (animationHandlerID) {
                animationHandlerID = MyAvatar.removeAnimationStateHandler(animationHandlerID);
            }
            if (drawInterval) {
                Script.clearInterval(drawInterval);
                drawInterval = null;
            }
            if (deletingInterval) {
                Script.clearInterval(deletingInterval);
                deletingInterval = null;
            }
            tablet.tabletShownChanged.disconnect(_this.tabletShownChanged);
            MyAvatar.dominantHandChanged.disconnect(_this.handChanged);
            HMD.displayModeChanged.disconnect(_this.displayModeChanged);
            Window.domainChanged.disconnect(_this.domainChanged);
        }
    };

    return new PaintSphere();
});