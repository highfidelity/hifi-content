//
//  draw_app.js
//
//  Created by Rebecca Stankus on 01/31/19
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* global  Audio, Camera, Controller, Entities, HMD, Messages, MyAvatar, Quat, Script, Settings, SoundCache, 
Tablet, Vec3, Window */

(function() {

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************

    /* PLAY A SOUND: Plays the specified sound at the position of the user's Avatar using the volume and playback 
    mode requested. */
    var injector;
    function playSound(sound, volume, position, localOnly, loop){
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
    }

    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    /* GET RANDOM HIFI COLOR: Choose one of HiFi's brand colors at random and return it's index # */
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
        Script.resolvePath("assets/textures/black.png"),
        Script.resolvePath("assets/textures/red.png"),
        Script.resolvePath("assets/textures/magenta.png"),
        Script.resolvePath("assets/textures/neutral4.png"),
        Script.resolvePath("assets/textures/neutral3.png"),
        Script.resolvePath("assets/textures/neutral2.png"),
        Script.resolvePath("assets/textures/neutral1.png"),
        Script.resolvePath("assets/textures/blue.png"),
        Script.resolvePath("assets/textures/cyan.png"),
        Script.resolvePath("assets/textures/green.png"),
        Script.resolvePath("assets/textures/yellow.png")
    ];
    function getRandomHiFiColorIndex() {
        var numberOfHifiColors = HIFI_COLORS.length;
        return Math.floor(Math.random() * numberOfHifiColors);
    }

    /* CREATE A PAINTBALL: Checks that paint sphere does not already exist, then calculate position of avatar's hand and 
    create a paint sphere there */
    var paintSphere;
    var paintSphereMaterial;
    var parentJointIndex;
    var randomHiFiColorIndex;
    function createPaintSphere() {
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
        randomHiFiColorIndex = getRandomHiFiColorIndex();
        paintSphere = Entities.addEntity({
            name: "Draw App Sphere",
            type: "Model",
            modelURL: Script.resolvePath("assets/models/sphere-white-emissive.fbx"),
            parentID: MyAvatar.sessionUUID,
            parentJointIndex: parentJointIndex,
            localPosition: { x: 0, y: 0, z: 0 },
            localDimensions: { x: 0.015, y: 0.015, z: 0.015 },
            grab: { grabbable: false },
            collisionless: true
        }, 'avatar');
        paintSphereMaterial = Entities.addEntity({
            type: "Material",
            name: "Draw App Material",
            materialURL: "materialData",
            priority: 1,
            parentID: paintSphere,
            materialData: JSON.stringify({
                materials: {
                    albedo: HIFI_COLORS[randomHiFiColorIndex],
                    emissiveMap: HIFI_COLORS_URLS[randomHiFiColorIndex]
                }
            })
        }, 'avatar');
    }

    /* REGISTER CONTROLLER MAPPING: Listen for controller trigger movements and act when the trigger is pressed or 
    released */
    var MINIMUM_TRIGGER_PRESS_VALUE = 0.97;
    var controllerMapping;
    var controllerMappingName = 'Hifi-DrawApp';
    var activeTriggerPress = false;
    var activeGripPress = false;
    function registerControllerMapping() {
        controllerMapping = Controller.newMapping(controllerMappingName);
        controllerMapping.from(Controller.Standard.RT).to(function (value) {
            if (dominantHand === "right") {
                if (value >= MINIMUM_TRIGGER_PRESS_VALUE && !activeTriggerPress) {
                    activeTriggerPress = true;
                    triggerPressed();
                } else if (value <= MINIMUM_TRIGGER_PRESS_VALUE && activeTriggerPress) {
                    triggerReleased();
                }
            }
        });
        controllerMapping.from(Controller.Standard.RightGrip).to(function (value) {
            if (dominantHand === "right") {
                if (value >= MINIMUM_TRIGGER_PRESS_VALUE && !activeGripPress) {
                    activeGripPress = true;
                    gripPressed();
                } else if (value <= MINIMUM_TRIGGER_PRESS_VALUE && activeGripPress) {
                    gripReleased();
                }
            }
        });
        controllerMapping.from(Controller.Standard.LT).to(function (value) {
            if (dominantHand === "left") {
                if (value >= MINIMUM_TRIGGER_PRESS_VALUE && !activeTriggerPress ) {
                    activeTriggerPress = true;
                    triggerPressed();
                } else if (value <= MINIMUM_TRIGGER_PRESS_VALUE && activeTriggerPress) {
                    triggerReleased();
                }
            }
        });
        controllerMapping.from(Controller.Standard.LeftGrip).to(function (value) {
            if (dominantHand === "left") {
                if (value >= MINIMUM_TRIGGER_PRESS_VALUE && !activeGripPress) {
                    activeGripPress = true;
                    gripPressed();
                } else if (value <= MINIMUM_TRIGGER_PRESS_VALUE && activeGripPress) {
                    gripReleased();
                }
            }
        });
    }

    /* ON TRIGGER PRESS DRAW: Store the initial point and begin checking distance hand has moved on an interval. If hand 
    has moved more than minimum distance, draw a polyline entity with a lifetime of 1 minute and continue checking 
    hand distance. Every time hand moves more than the minumum, update the polyline with another node. */
    var REPEAT_DISTANCE_CHECK_MS = 60;
    var MINIMUM_MOVEMENT_TO_DRAW_M = 0.0005;
    var DEFAULT_NORMAL = { x: 0, y: 0, z: 1 };
    var DECAY_TIME_S = 60;
    var MAX_LINE_POINTS = 100;
    var DRAW_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/draw.mp3'));
    var DRAW_SOUND_VOLUME = 0.01;
    var distanceCheckInterval = null;
    var polyLine = null;
    var lineStartPosition;
    var previousLinePoint;
    var linePoints = [{x: 0, y: 0, z: 0 }];
    var lineNormals = [DEFAULT_NORMAL, DEFAULT_NORMAL];
    var lineStrokeWidths = [];
    var paintSphereDimensions;
    function triggerPressed() {
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
                    playSound(DRAW_SOUND, DRAW_SOUND_VOLUME, currentLinePoint, false, true);
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
    }

    /* STOP DRAWING THE CURRENT LINE: stop sound, reset current line variables */
    function stopDrawing() {
        if (injector) {
            injector.stop();
            injector = null;
        }
        polyLine = null;
        linePoints = [{x: 0, y: 0, z: 0 }];
        lineNormals = [DEFAULT_NORMAL, DEFAULT_NORMAL];
        lineStrokeWidths = [];
        desktopActionProgress = false;
    }
   

    /* ON TRIGGER RELEASE DRAW: Stop checking distance hand has moved */
    function triggerReleased() {
        if (activeTriggerPress) {
            activeTriggerPress = false;
            if (distanceCheckInterval) {
                Script.clearInterval(distanceCheckInterval);
                distanceCheckInterval = null;
            }
            stopDrawing();
        }
    }

    /* ON GRIP PRESS ERASE: Set an interval that finds the nearest line within a maximum distance to paint 
    sphere tip and erases it */
    var DELETE_AGAIN_MS = 100;
    var MAXIMUM_DISTANCE_TO_SEARCH_M = 1;
    var MAXIMUM_DISTANCE_TO_DELETE_M = 0.03;
    var DISTANCE_TO_DRAW_IN_FRONT_OF_CAMERA_DESKTOP_M = 1.5;
    var deletingInterval;
    function gripPressed() {
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
    }

    /* ON GRIP RELEASE ERASE: Stop the interval that is searching for lines to delete */
    function gripReleased() {
        if (activeGripPress) {
            activeGripPress = false;
            if (deletingInterval) {
                Script.clearInterval(deletingInterval);
                deletingInterval = null;
            }
        }
    }

    /* ON MOUSE PRESS: Store the initial point to start line. */
    var previousLinePointDesktop;
    var pickRay;
    var desktopActionProgress = false;
    function mousePressed(event) {
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
    }

    /* ON MOUSE MOVE: Calculate the next line poi8nt and add it to the entity. If there are too many line points, 
    begin a new line. */
    function mouseContinueLine(event) {
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
                    playSound(DRAW_SOUND, 1, currentLinePoint, false, true);
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
    }

    /* ON MOUSE RELEASE: Stop checking distance cursor has moved */
    function mouseReleased(event) {
        if (event.button === "LEFT") {
            stopDrawing();
            desktopActionProgress= false;
        }
    }

    /* ON CLICKING APP BUTTON: (on the toolbar or tablet) if we are opening the app, play a sound and get the paint sphere.
    If we are closing the app, remove the paint sphere */
    var OPEN_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/open.mp3'));
    var OPEN_SOUND_VOLUME = 0.2;
    var CLOSE_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/close.mp3'));
    var CLOSE_SOUND_VOLUME = 0.3;
    function onClicked() {
        if (paintSphere) {
            button.editProperties({ isActive: false });
            if (HMD.active) {
                closeHMDMode();
            } else {
                closeDesktopMode();
            }
            Entities.deleteEntity(paintSphere);
            paintSphere = null;
            playSound(CLOSE_SOUND, CLOSE_SOUND_VOLUME, MyAvatar.position, true, false);
        } else {
            if (HMD.active) {
                HMD.closeTablet();
                setUpHMDMode();
            } else {
                setUpDesktopMode();
            }
            button.editProperties({ isActive: true });
            playSound(OPEN_SOUND, OPEN_SOUND_VOLUME, MyAvatar.position, true, false);
            createPaintSphere();
        }
    }

    /* ON STOPPING THE SCRIPT: Make sure the paint sphere gets deleted and its variable set back to null 
    if applicable. Search for any unreferenced paint spheres and delete if found. */
    function appEnding() {
        cleanUp();
        tablet.tabletShownChanged.disconnect(tabletShownChanged);
        MyAvatar.dominantHandChanged.disconnect(handChanged);
        HMD.displayModeChanged.disconnect(displayModeChange);
        button.clicked.disconnect(onClicked);
        Window.domainChanged.disconnect(domainChanged);
        tablet.removeButton(button);
        if (controllerMapping) {
            controllerMapping.disable();
        }
    }

    /* CLEANUP: Remove paint sphere, search for any unreferenced paint spheres to clean up */
    function cleanUp() {
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
    }

    /* WHEN TOGGLING DISPLAY MODE: Set variable to track which method to use to draw lines */
    function displayModeChange() {
        if (paintSphere) {
            if (HMD.active) {
                closeDesktopMode();
                setUpHMDMode();
            } else {
                closeHMDMode();
                setUpDesktopMode();
            }
        }
    }

    /* GET ANIMATION DATA: Get correct overrides depending on dominant hand */
    var animationData = {};
    function getAnimationData() {
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
    }

    /* SET UP HMD MODE: create controller mapping to listen for trigger presses */
    var animationHandlerID;
    function setUpHMDMode() {
        if (controllerMapping) {
            controllerMapping.enable();
        }
        animationHandlerID = MyAvatar.addAnimationStateHandler(getAnimationData, []);
        Messages.sendLocalMessage("Hifi-Hand-Disabler", dominantHand);
    }

    /* SET UP DESKTOP MODE: Listen for mouse presses */
    var mouseEventsConnected = false;
    function setUpDesktopMode() {
        if (!mouseEventsConnected) {
            mouseEventsConnected = true;
            Controller.mousePressEvent.connect(mousePressed);
            Controller.mouseMoveEvent.connect(mouseContinueLine);
            Controller.mouseReleaseEvent.connect(mouseReleased);
        }
    }

    /* CLOSE HMD MODE: Remove controller mapping */
    function closeHMDMode() {
        if (controllerMapping) {
            controllerMapping.disable();
        }
        Messages.sendLocalMessage("Hifi-Hand-Disabler", "none");
        if (animationHandlerID) {
            animationHandlerID = MyAvatar.removeAnimationStateHandler(animationHandlerID);
        }
    }

    /* CLOSE DESKTOP MODE: Stop listening for mouse presses */
    function closeDesktopMode() {
        if (mouseEventsConnected) {
            mouseEventsConnected = false;
            Controller.mousePressEvent.disconnect(mousePressed);
            Controller.mouseMoveEvent.disconnect(mouseContinueLine);
            Controller.mouseReleaseEvent.disconnect(mouseReleased);
        }
    }

    /* WHEN USER DOMAIN CHANGES: Close app to remove paint sphere in hand when leaving the domain */
    var WAIT_TO_CLEAN_UP_MS = 2000;
    function domainChanged() {
        Script.setTimeout(function() {
            cleanUp();
        }, WAIT_TO_CLEAN_UP_MS);
    }

    /* WHEN USER CHANGES DOMINANT HAND: Switch default hand to place paint sphere in */
    var WAIT_TO_REOPEN_APP_MS = 500;
    function handChanged() {
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
            onClicked();
            Script.setTimeout(function() {
                onClicked();
            }, WAIT_TO_REOPEN_APP_MS);
        }  
    }

    /* TABLET SHOWN CHANGED: If draw app is open and tablet is shown, disable it. When the tablet closes while draw
    app is open, reenable it */
    function tabletShownChanged() {
        if (!paintSphere) {
            return;
        }
        if (tablet.tabletShown) {
            if (HMD.active) {
                if (activeTriggerPress) {
                    triggerReleased();
                } else if (activeGripPress) {
                    gripReleased();
                }
                closeHMDMode();
            } else {
                mouseReleased();
                closeDesktopMode();
            }
        } else {
            if (HMD.active) {
                setUpHMDMode();
            } else {
                setUpDesktopMode();
            }
        }
    }

    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
    var button = tablet.addButton({
        text: 'DRAW',
        icon: Script.resolvePath('assets/icons/draw-i.png'),
        activeIcon: Script.resolvePath('assets/icons/draw-a.png')
    });
    var dominantHand = MyAvatar.getDominantHand();
    var dominantHandJoint = (dominantHand === "right") ? "RightHand" : "LeftHand";
    MyAvatar.dominantHandChanged.connect(handChanged);
    tablet.tabletShownChanged.connect(tabletShownChanged);
    registerControllerMapping();
    HMD.displayModeChanged.connect(displayModeChange);
    button.clicked.connect(onClicked);
    Window.domainChanged.connect(domainChanged);
    Script.scriptEnding.connect(appEnding);
}());