//
//  drawZoneClient.js
//
//  created by Rebecca Stankus on 03/27/19
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var _this;

    var RGB_MAX_VALUE = 255;
    var DECIMAL_PLACES = 2;
    var HIFI_COLORS = [
        { red: 0, green: 0, blue: 0 }, // black
        { red: 255, green: 0, blue: 26 }, // red
        { red: 255, green: 66, blue: 167 }, // Magenta
        { red: 126, green: 140, blue: 129 }, // Neutral 4
        { red: 183, green: 200, blue: 185 }, // Neutral 3
        { red: 216, green: 225, blue: 217 }, // Neutral 2
        { red: 241, green: 243, blue: 238 }, // Neutral 1
        { red: 23, green: 41, blue: 131 }, // Blue
        { red: 0, green: 158, blue: 224 }, // Cyan
        { red: 0, green: 144, blue: 54 }, // Green
        { red: 255, green: 237, blue: 0 } // Yellow
    ];
    var HIFI_COLORS_URLS = [
        Script.resolvePath("../resources/textures/black.png"),
        Script.resolvePath("../resources/textures/red.png"),
        Script.resolvePath("../resources/textures/magenta.png"),
        Script.resolvePath("../resources/textures/neutral4.png"),
        Script.resolvePath("../resources/textures/neutral3.png"),
        Script.resolvePath("../resources/textures/neutral2.png"),
        Script.resolvePath("../resources/textures/neutral1.png"),
        Script.resolvePath("../resources/textures/blue.png"),
        Script.resolvePath("../resources/textures/cyan.png"),
        Script.resolvePath("../resources/textures/green.png"),
        Script.resolvePath("../resources/textures/yellow.png")
    ];
    var MINIMUM_TRIGGER_PRESS_VALUE = 0.97;
    var REPEAT_DISTANCE_CHECK_MS = 60;
    var MINIMUM_MOVEMENT_TO_DRAW_M = 0.0005;
    var DEFAULT_NORMAL = { x: 0, y: 0, z: 1 };
    var DECAY_TIME_S = 60;
    var MAX_LINE_POINTS = 100;
    var DRAW_SOUND = SoundCache.getSound(Script.resolvePath('../resources/sounds/draw.mp3'));
    var DRAW_SOUND_VOLUME = 0.01;
    var DELETE_AGAIN_MS = 100;
    var MAXIMUM_DISTANCE_TO_SEARCH_M = 1;
    var MAXIMUM_DISTANCE_TO_DELETE_M = 0.03;
    var DISTANCE_TO_DRAW_IN_FRONT_OF_CAMERA_DESKTOP_M = 1.5;
    var OPEN_SOUND = SoundCache.getSound(Script.resolvePath('../resources/sounds/open.mp3'));
    var OPEN_SOUND_VOLUME = 0.2;
    var CLOSE_SOUND = SoundCache.getSound(Script.resolvePath('../resources/sounds/close.mp3'));
    var CLOSE_SOUND_VOLUME = 0.3;
    var WAIT_TO_CLEAN_UP_MS = 2000;
    var WAIT_TO_REOPEN_APP_MS = 500;


    var scannerZoneMarker;
    var injector;
    var paintSphere;
    var paintSphereMaterial;
    var parentJointIndex;
    var randomHiFiColorIndex;
    var controllerMapping;
    var controllerMappingName = 'Hifi-DrawApp';
    var activeTriggerPress = false;
    var activeGripPress = false;
    var distanceCheckInterval = null;
    var polyLine = null;
    var lineStartPosition;
    var previousLinePoint;
    var linePoints = [{x: 0, y: 0, z: 0 }];
    var lineNormals = [DEFAULT_NORMAL, DEFAULT_NORMAL];
    var lineStrokeWidths = [];
    var paintSphereDimensions;
    var deletingInterval;
    var previousLinePointDesktop;
    var pickRay;
    var desktopActionProgress = false;
    var animationData = {};
    var animationHandlerID;
    var mouseEventsConnected = false;
    var dominantHandJoint;
    var dominantHand;
    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
    var button;

    var DrawingZone = function() {
        _this = this;
    };

    DrawingZone.prototype = {

        /* ON PRELOAD: Save a reference to this */
        preload: function(entityID) {
            _this.entityID = entityID;
            scannerZoneMarker = Entities.getEntityProperties(_this.entityID, 'parentID').parentID;
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

        /* Convert RGB value to 0-1 scale */
        rgbConversion: function(rgbColorValue) {
            return (rgbColorValue/RGB_MAX_VALUE).toFixed(DECIMAL_PLACES);
        },

        /* GET RANDOM HIFI COLOR: Choose one of HiFi's brand colors at random and return it's index # */
    
        getRandomHiFiColorIndex: function() {
            var numberOfHifiColors = HIFI_COLORS.length;
            return Math.floor(Math.random() * numberOfHifiColors);
        },

        /* CREATE A PAINTBALL: Checks that paint sphere does not already exist, then calculate position of avatar's hand and 
        create a paint sphere there */
        createPaintSphere: function() {
            if (paintSphere) {
                return;
            }
            parentJointIndex = MyAvatar.getJointIndex(dominantHandJoint + "Index4");
            if (parentJointIndex === -1) {
                MyAvatar.getJointIndex(dominantHandJoint + "Index3");
            }
            if (parentJointIndex === -1) {
                MyAvatar.getJointIndex(dominantHandJoint);
                print("ERROR: Falling back to dominant hand joint as index finger tip could not be found");
            }
            randomHiFiColorIndex = _this.getRandomHiFiColorIndex();
            paintSphere = Entities.addEntity({
                name: "Draw App Sphere",
                type: "Model",
                modelURL: Script.resolvePath("../resources/models/sphere-white-emissive.fbx"),
                parentID: MyAvatar.sessionUUID,
                parentJointIndex: parentJointIndex,
                localPosition: { x: 0, y: 0, z: 0 },
                localDimensions: { x: 0.015, y: 0.015, z: 0.015 },
                grab: { grabbable: false },
                collisionless: true
            }, 'avatar');
            var hifiColorRescaled = {};
            hifiColorRescaled.red = _this.rgbConversion(HIFI_COLORS[randomHiFiColorIndex].red);
            hifiColorRescaled.green = _this.rgbConversion(HIFI_COLORS[randomHiFiColorIndex].green);
            hifiColorRescaled.blue = _this.rgbConversion(HIFI_COLORS[randomHiFiColorIndex].blue);
            paintSphereMaterial = Entities.addEntity({
                type: "Material",
                name: "Draw App Material",
                materialURL: "materialData",
                priority: 1,
                parentID: paintSphere,
                materialData: JSON.stringify({
                    materials: {
                        albedo: hifiColorRescaled,
                        emissive: hifiColorRescaled
                    }
                })
            }, 'avatar');
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
                        _this.gripReleased();
                    }
                }
            });
        },

        /* ON TRIGGER PRESS DRAW: Store the initial point and begin checking distance hand has moved on an interval. If hand 
    has moved more than minimum distance, draw a polyline entity with a lifetime of 1 minute and continue checking 
    hand distance. Every time hand moves more than the minumum, update the polyline with another node. */
        triggerPressed: function() {
            if (tablet.tabletShown || activeGripPress) {
                return;
            }
            lineStartPosition = MyAvatar.getJointPosition(parentJointIndex);
            previousLinePoint = MyAvatar.getJointPosition(parentJointIndex);
            distanceCheckInterval = Script.setInterval(function() {
                var currentLinePoint = MyAvatar.getJointPosition(parentJointIndex);
                if (Vec3.distance(previousLinePoint, currentLinePoint) > MINIMUM_MOVEMENT_TO_DRAW_M) {
                    var displacementFromStart = Vec3.subtract(currentLinePoint, lineStartPosition);
                    linePoints.push(displacementFromStart);
                    if (!polyLine) {
                        _this.playSound(DRAW_SOUND, DRAW_SOUND_VOLUME, currentLinePoint, false, true);
                        if (paintSphere) {
                            paintSphereDimensions = Entities.getEntityProperties(paintSphere, 'dimensions').dimensions;
                        }
                        lineStrokeWidths = [paintSphereDimensions.x, paintSphereDimensions.x];
                        polyLine = Entities.addEntity({
                            type: "PolyLine",
                            name: "Draw App Polyline",
                            position: previousLinePoint,
                            linePoints: linePoints,
                            normals: lineNormals,
                            strokeWidths: lineStrokeWidths,
                            color: HIFI_COLORS[randomHiFiColorIndex],
                            textures: HIFI_COLORS_URLS[randomHiFiColorIndex],
                            isUVModeStretch: true,
                            lifetime: DECAY_TIME_S,
                            collisionless: true,
                            faceCamera: true
                        }, 'avatar');
                    } else {
                        if (injector) {
                            injector.options = { position: currentLinePoint };
                        }
                        var lineProperties = Entities.getEntityProperties(polyLine, ['linePoints', 'normals', 
                            'strokeWidths', 'age']);
                        var linePointsCount = lineProperties.linePoints.length;
                        if (linePointsCount > MAX_LINE_POINTS) {
                            var lastPointDisplacement = lineProperties.linePoints[linePointsCount - 1];
                            linePoints = [lastPointDisplacement, displacementFromStart];
                            lineNormals = [DEFAULT_NORMAL, DEFAULT_NORMAL];
                            if (paintSphere) {
                                paintSphereDimensions = Entities.getEntityProperties(paintSphere, 'dimensions').dimensions;
                            }
                            lineStrokeWidths = [paintSphereDimensions.x, paintSphereDimensions.x];
                            polyLine = Entities.addEntity({
                                type: "PolyLine",
                                name: "Draw App Polyline",
                                position: previousLinePoint,
                                linePoints: linePoints,
                                normals: lineNormals,
                                strokeWidths: lineStrokeWidths,
                                color: HIFI_COLORS[randomHiFiColorIndex],
                                textures: HIFI_COLORS_URLS[randomHiFiColorIndex],
                                isUVModeStretch: true,
                                lifetime: DECAY_TIME_S,
                                collisionless: true,
                                faceCamera: true
                            }, 'avatar');
                        } else {
                            if (paintSphere) {
                                paintSphereDimensions = Entities.getEntityProperties(paintSphere, 'dimensions').dimensions;
                            }
                            lineProperties.linePoints.push(displacementFromStart);
                            lineProperties.normals.push(DEFAULT_NORMAL);
                            lineProperties.strokeWidths.push(paintSphereDimensions.x);
                            Entities.editEntity(polyLine, {
                                linePoints: lineProperties.linePoints,
                                normals: lineProperties.normals,
                                strokeWidths: lineProperties.strokeWidths,
                                lifetime: lineProperties.age + DECAY_TIME_S
                            });
                        }
                    }
                }
            }, REPEAT_DISTANCE_CHECK_MS);
        },

        /* STOP DRAWING THE CURRENT LINE: stop sound, reset current line variables */
        stopDrawing: function() {
            if (injector) {
                injector.stop();
                injector = null;
            }
            polyLine = null;
            linePoints = [{x: 0, y: 0, z: 0 }];
            lineNormals = [DEFAULT_NORMAL, DEFAULT_NORMAL];
            lineStrokeWidths = [];
            desktopActionProgress = false;
        },
   

        /* ON TRIGGER RELEASE DRAW: Stop checking distance hand has moved */
        triggerReleased: function() {
            if (activeTriggerPress) {
                activeTriggerPress = false;
                if (distanceCheckInterval) {
                    Script.clearInterval(distanceCheckInterval);
                    distanceCheckInterval = null;
                }
                _this.stopDrawing();
            }
        },

        /* ON GRIP PRESS ERASE: Set an interval that finds the nearest line within a maximum distance to paint 
    sphere tip and erases it */
        gripPressed: function() {
            if (tablet.tabletShown || activeTriggerPress) {
                return;
            }
            deletingInterval = Script.setInterval(function() {
                var fingerTipPosition = MyAvatar.getJointPosition(parentJointIndex);
                var foundANearbyLine = false;
                var lineToDelete;
                Entities.findEntitiesByName("Draw App Polyline", fingerTipPosition, MAXIMUM_DISTANCE_TO_SEARCH_M)
                    .forEach(function(nearbyDrawAppLine) {
                        var lineProperties = Entities.getEntityProperties(nearbyDrawAppLine, ['position', 'linePoints']);
                        var lineBoundingBoxCenter = lineProperties.position;
                        var numberLinePoints = lineProperties.linePoints.length;
                        var shortestDistance = MAXIMUM_DISTANCE_TO_DELETE_M;
                        for (var i = 0; i < numberLinePoints; i++) {
                            var distanceFromMarkerTip = Vec3.distance(fingerTipPosition,
                                Vec3.sum(lineBoundingBoxCenter, lineProperties.linePoints[i]));
                            if (distanceFromMarkerTip <= shortestDistance) {
                                foundANearbyLine = true;
                                lineToDelete = nearbyDrawAppLine;
                                shortestDistance = DISTANCE_TO_DRAW_IN_FRONT_OF_CAMERA_DESKTOP_M;
                            }
                        }
                    });
                if (foundANearbyLine) {
                    Entities.deleteEntity(lineToDelete);
                }
            }, DELETE_AGAIN_MS);
        },

        /* ON GRIP RELEASE ERASE: Stop the interval that is searching for lines to delete */
        gripReleased: function() {
            if (activeGripPress) {
                activeGripPress = false;
                if (deletingInterval) {
                    Script.clearInterval(deletingInterval);
                    deletingInterval = null;
                }
            }
        },

        /* ON MOUSE PRESS: Store the initial point to start line. */
    
        mousePressed: function(event) {
            if (Settings.getValue("io.highfidelity.isEditing", false) || tablet.tabletShown) {
                return;
            }
            if (event.isLeftButton) {
                pickRay = Camera.computePickRay(event.x, event.y);
                desktopActionProgress = true;
                lineStartPosition = Vec3.sum(pickRay.origin, Vec3.multiply(pickRay.direction, 
                    DISTANCE_TO_DRAW_IN_FRONT_OF_CAMERA_DESKTOP_M));
                previousLinePoint = Vec3.sum(pickRay.origin, Vec3.multiply(pickRay.direction, 
                    DISTANCE_TO_DRAW_IN_FRONT_OF_CAMERA_DESKTOP_M));
            }
        },

        /* ON MOUSE MOVE: Calculate the next line poi8nt and add it to the entity. If there are too many line points, 
    begin a new line. */
        mouseContinueLine: function(event) {
            if (tablet.tabletShown) {
                return;
            }
            if (!desktopActionProgress) {
                return;
            }
            if (event.isLeftButton) {
                pickRay = Camera.computePickRay(event.x, event.y);
                var currentLinePoint = Vec3.sum(pickRay.origin, Vec3.multiply(pickRay.direction, 
                    DISTANCE_TO_DRAW_IN_FRONT_OF_CAMERA_DESKTOP_M));
                if (Vec3.distance(previousLinePointDesktop, currentLinePoint) > MINIMUM_MOVEMENT_TO_DRAW_M) {
                    var displacementFromStart = Vec3.subtract(currentLinePoint, lineStartPosition);
                    linePoints.push(displacementFromStart);
                    if (!polyLine) {
                        _this.playSound(DRAW_SOUND, 1, currentLinePoint, false, true);
                        if (paintSphere) {
                            paintSphereDimensions = Entities.getEntityProperties(paintSphere, 'dimensions').dimensions;
                        }
                        lineStrokeWidths = [paintSphereDimensions.x, paintSphereDimensions.x];
                        polyLine = Entities.addEntity({
                            type: "PolyLine",
                            name: "Draw App Polyline",
                            position: lineStartPosition,
                            linePoints: linePoints,
                            normals: lineNormals,
                            strokeWidths: lineStrokeWidths,
                            color: HIFI_COLORS[randomHiFiColorIndex],
                            textures: HIFI_COLORS_URLS[randomHiFiColorIndex],
                            isUVModeStretch: true,
                            lifetime: DECAY_TIME_S,
                            collisionless: true,
                            faceCamera: true
                        }, 'avatar');
                    } else {
                        if (injector) {
                            injector.options = { position: currentLinePoint };
                        }
                        var lineProperties = Entities.getEntityProperties(polyLine, ['linePoints', 'normals', 
                            'strokeWidths', 'age']);
                        var linePointsCount = lineProperties.linePoints.length;
                        if (linePointsCount > MAX_LINE_POINTS) {
                            var lastPointDisplacement = lineProperties.linePoints[linePointsCount - 1];
                            linePoints = [lastPointDisplacement, displacementFromStart];
                            lineNormals = [DEFAULT_NORMAL, DEFAULT_NORMAL];
                            if (paintSphere) {
                                paintSphereDimensions = Entities.getEntityProperties(paintSphere, 'dimensions').dimensions;
                            }
                            lineStrokeWidths = [paintSphereDimensions.x, paintSphereDimensions.x];
                            polyLine = Entities.addEntity({
                                type: "PolyLine",
                                name: "Draw App Polyline",
                                position: previousLinePoint,
                                linePoints: linePoints,
                                normals: lineNormals,
                                strokeWidths: lineStrokeWidths,
                                color: HIFI_COLORS[randomHiFiColorIndex],
                                textures: HIFI_COLORS_URLS[randomHiFiColorIndex],
                                isUVModeStretch: true,
                                lifetime: DECAY_TIME_S,
                                collisionless: true,
                                faceCamera: true
                            }, 'avatar');
                        } else {
                            lineProperties.linePoints.push(displacementFromStart);
                            lineProperties.normals.push(DEFAULT_NORMAL);
                            if (paintSphere) {
                                paintSphereDimensions = Entities.getEntityProperties(paintSphere, 'dimensions').dimensions;
                            }
                            lineProperties.strokeWidths.push(paintSphereDimensions.x);
                            Entities.editEntity(polyLine, {
                                linePoints: lineProperties.linePoints,
                                normals: lineProperties.normals,
                                strokeWidths: lineProperties.strokeWidths,
                                lifetime: lineProperties.age + DECAY_TIME_S
                            });
                        }
                    }
                }
            }
        },

        /* ON MOUSE RELEASE: Stop checking distance cursor has moved */
        mouseReleased: function(event) {
            if (event.button === "LEFT") {
                _this.stopDrawing();
                desktopActionProgress= false;
            }
        },

        /* ON CLICKING APP BUTTON: (on the toolbar or tablet) if we are opening the app, play a sound and get the paint sphere.
    If we are closing the app, remove the paint sphere */
        onClicked: function() {
            if (paintSphere) {
                button.editProperties({ isActive: false });
                if (HMD.active) {
                    _this.closeHMDMode();
                } else {
                    _this.closeDesktopMode();
                }
                Entities.deleteEntity(paintSphere);
                paintSphere = null;
                _this.playSound(CLOSE_SOUND, CLOSE_SOUND_VOLUME, MyAvatar.position, true, false);
            } else {
                if (HMD.active) {
                    HMD.closeTablet();
                    _this.setUpHMDMode();
                } else {
                    _this.setUpDesktopMode();
                }
                button.editProperties({ isActive: true });
                _this.playSound(OPEN_SOUND, OPEN_SOUND_VOLUME, MyAvatar.position, true, false);
                _this.createPaintSphere();
            }
        },

        /* ON STOPPING THE SCRIPT: Make sure the paint sphere gets deleted and its variable set back to null 
    if applicable. Search for any unreferenced paint spheres and delete if found. */
        appEnding: function() {
            _this.cleanUp();
            tablet.tabletShownChanged.disconnect(_this.tabletShownChanged);
            MyAvatar.dominantHandChanged.disconnect(_this.handChanged);
            HMD.displayModeChanged.disconnect(_this.displayModeChange);
            button.clicked.disconnect(_this.onClicked);
            Window.domainChanged.disconnect(_this.domainChanged);
            tablet.removeButton(button);
            if (controllerMapping) {
                controllerMapping.disable();
            }
        },

        /* CLEANUP: Remove paint sphere, search for any unreferenced paint spheres to clean up */
        cleanUp: function() {
            if (injector) {
                injector.stop();
                injector = null;
            }
            if (controllerMapping) {
                controllerMapping.disable();
            }
            Messages.sendLocalMessage("Hifi-Hand-Disabler", "none");
            if (animationHandlerID) {
                animationHandlerID = MyAvatar.removeAnimationStateHandler(animationHandlerID);
            }
            if (paintSphere) {
                Entities.deleteEntity(paintSphere);
                paintSphere = null;
            }
            if (distanceCheckInterval) {
                Script.clearInterval(distanceCheckInterval);
                distanceCheckInterval = null;
            }
            if (deletingInterval) {
                Script.clearInterval(deletingInterval);
                deletingInterval = null;
            }
            button.editProperties({ isActive: false });
            MyAvatar.getAvatarEntitiesVariant().forEach(function(avatarEntity) {
                var name = Entities.getEntityProperties(avatarEntity.id, 'name').name;
                if (name === "Draw App Sphere") {
                    Entities.deleteEntity(avatarEntity.id);
                    paintSphere = null;
                }
            });
        },

        /* WHEN TOGGLING DISPLAY MODE: Set variable to track which method to use to draw lines */
        displayModeChange: function() {
            if (paintSphere) {
                if (HMD.active) {
                    _this.closeDesktopMode();
                    _this.setUpHMDMode();
                } else {
                    _this.closeHMDMode();
                    _this.setUpDesktopMode();
                }
            }
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

        /* WHEN USER DOMAIN CHANGES: Close app to remove paint sphere in hand when leaving the domain */
        domainChanged: function() {
            Script.setTimeout(function() {
                _this.cleanUp();
            }, WAIT_TO_CLEAN_UP_MS);
        },

        /* WHEN USER CHANGES DOMINANT HAND: Switch default hand to place paint sphere in */
    
        handChanged: function() {
            if (MyAvatar.getDominantHand() === dominantHand) {
                return;
            }
            dominantHand = MyAvatar.getDominantHand();
            dominantHandJoint = (dominantHand === "right") ? "RightHand" : "LeftHand";
            if (distanceCheckInterval) {
                Script.clearInterval(distanceCheckInterval);
                distanceCheckInterval = null;
            }
            if (deletingInterval) {
                Script.clearInterval(deletingInterval);
                deletingInterval = null;
            }
            if (paintSphere) {
                _this.onClicked();
                Script.setTimeout(function() {
                    _this.onClicked();
                }, WAIT_TO_REOPEN_APP_MS);
            }  
        },

        /* TABLET SHOWN CHANGED: If draw app is open and tablet is shown, disable it. When the tablet closes while draw
    app is open, reenable it */
        tabletShownChanged: function() {
            if (!paintSphere) {
                return;
            }
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

        /* ENTER ENTITY: Upon entering this zone  */
        enterEntity: function() {
            Entities.getChildrenIDs(scannerZoneMarker).forEach(function(childOfZoneMarker) {
                var name = Entities.getEntityProperties(childOfZoneMarker, 'name').name;
                if (name.indexOf("") !== -1) {
                    //
                }
            });
            button = tablet.addButton({
                text: 'DRAW',
                icon: Script.resolvePath('../resources/icons/draw-i.png'),
                activeIcon: Script.resolvePath('../resources/icons/draw-a.png'),
                sortOrder: 1
            });
            dominantHand = MyAvatar.getDominantHand();
            dominantHandJoint = (dominantHand === "right") ? "RightHand" : "LeftHand";
            MyAvatar.dominantHandChanged.connect(_this.handChanged);
            tablet.tabletShownChanged.connect(_this.tabletShownChanged);
            _this.registerControllerMapping();
            HMD.displayModeChanged.connect(_this.displayModeChange);
            button.clicked.connect(_this.onClicked);
            Window.domainChanged.connect(_this.domainChanged);
            Script.scriptEnding.connect(_this.appEnding);
            _this.loadApp();
        },

        /* LEAVE ENTITY: Upon leaving this zone  */
        leaveEntity: function() {
            _this.appEnding();
        },

        /* ON UNLOADING THE SCRIPT: Make sure the avatar leaves the zone so extra entities are deleted and intervals ended */
        unload: function(){
            _this.leaveEntity();
        }
    };
    return new DrawingZone();
});
