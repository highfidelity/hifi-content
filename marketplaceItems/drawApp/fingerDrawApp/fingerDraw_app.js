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
    var REPEAT_DISTANCE_CHECK_MS = 60;
    var MINIMUM_MOVEMENT_TO_DRAW_M = 0.0005;
    var DEFAULT_STROKE_WIDTH_M = 0.01;
    var DEFAULT_NORMAL = { x: 0, y: 0, z: 1 };
    var DECAY_TIME_S = 60;
    var MAX_LINE_POINTS = 100;
    var DRAW_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/markerDraw.mp3'));
    var DRAW_SOUND_VOLUME = 0.01;
    var distanceCheckInterval = null;
    var polyLine = null;
    var lineStartPosition;
    var previousLinePoint;
    var linePoints = [{x: 0, y: 0, z: 0 }];
    var lineNormals = [DEFAULT_NORMAL, DEFAULT_NORMAL];
    var lineStrokeWidths = [DEFAULT_STROKE_WIDTH_M, DEFAULT_STROKE_WIDTH_M];
    var paintSphere;
    var parentJointIndex;
    var activeTriggerPress = false;
    var activeGripPress = false;

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************

    /* PLAY A SOUND: Plays the specified sound at the position of the user's Avatar using the volume and playback 
    mode requested. */
    var injector;
    function playSound(sound, volume, position, localOnly, loop){
        print("SOUND: ", sound, "     VOLUME: ", volume, "     POSITION: ", JSON.stringify(position), "     LOCAL ONLY: ", 
            localOnly, "     LOOP: ", loop);
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

    /* CREATE A PAINTBALL: Checks that paint sphere does not already exist, then calculate position of avatar's hand and 
    create a paint sphere there */
    function createPaintSphere() {
        if (paintSphere) {
            return;
        }
        var fingertipJointName = dominantHandJoint + "Index4";
        parentJointIndex = MyAvatar.getJointIndex(fingertipJointName);
        if (parentJointIndex === -1) {
            fingertipJointName = dominantHandJoint + "Index3";
            parentJointIndex = MyAvatar.getJointIndex(fingertipJointName);
        }
        paintSphere = Entities.addEntity({
            name: "Draw App Sphere",
            type: "Model",
            modelURL: Script.resolvePath("assets/models/sphere-white-emissive.fbx"),
            parentID: MyAvatar.sessionUUID,
            parentJointIndex: parentJointIndex,
            localPosition: { x: 0, y: 0, z: 0 },
            dimensions: { x: 0.015, y: 0.015, z: 0.015 },
            grab: { grabbable: false },
            collisionless: true
        }, 'avatar');
    }

    /* REGISTER CONTROLLER MAPPING: Listen for controller trigger movements and act when the trigger is pressed or 
    released */
    var MINIMUM_TRIGGER_PRESS_VALUE = 0.97;
    var controllerMapping;
    var controllerMappingName = 'Hifi-DrawApp';
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
                    polyLine = Entities.addEntity({
                        type: "PolyLine",
                        name: "Draw App Polyline",
                        position: previousLinePoint,
                        linePoints: linePoints,
                        normals: lineNormals,
                        strokeWidths: lineStrokeWidths,
                        color: { red: 255, green: 255, blue: 255 },
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
                        lineStrokeWidths = [DEFAULT_STROKE_WIDTH_M, DEFAULT_STROKE_WIDTH_M];
                        polyLine = Entities.addEntity({
                            type: "PolyLine",
                            name: "Draw App Polyline",
                            position: previousLinePoint,
                            linePoints: linePoints,
                            normals: lineNormals,
                            strokeWidths: lineStrokeWidths,
                            color: { red: 255, green: 255, blue: 255 },
                            isUVModeStretch: true,
                            lifetime: DECAY_TIME_S,
                            collisionless: true,
                            faceCamera: true
                        }, 'avatar');
                    } else {
                        lineProperties.linePoints.push(displacementFromStart);
                        lineProperties.normals.push(DEFAULT_NORMAL);
                        lineProperties.strokeWidths.push(DEFAULT_STROKE_WIDTH_M);
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
   

    /* ON TRIGGER RELEASE DRAW: Stop checking distance hand has moved and update current polyline lifetime to decay in 1 
    minute. */
    function triggerReleased() {
        if (activeTriggerPress) {
            activeTriggerPress = false;
            if (distanceCheckInterval) {
                Script.clearInterval(distanceCheckInterval);
                distanceCheckInterval = null;
            }
            if (injector) {
                injector.stop();
                injector = null;
            }
            polyLine = null;
            linePoints = [{x: 0, y: 0, z: 0 }];
            lineNormals = [DEFAULT_NORMAL, DEFAULT_NORMAL];
            lineStrokeWidths = [DEFAULT_STROKE_WIDTH_M, DEFAULT_STROKE_WIDTH_M];
        }
    }

    /* ON GRIP PRESS ERASE: Set an interval that finds the nearest line within a maximum distance to paint 
    sphere tip and erases it */
    var DELETE_AGAIN_MS = 100;
    var MAXIMUM_DISTANCE_TO_SEARCH_M = 1;
    var MAXIMUM_DISTANCE_TO_DELETE_M = 0.03;
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
                        if (distanceFromMarkerTip <= shortestDistance ) {
                            foundANearbyLine = true;
                            lineToDelete = nearbyDrawAppLine;
                            shortestDistance = distance;
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
    var distance = 1.5;
    function mousePressed(event) {
        if (tablet.tabletShown) {
            return;
        }
        if (event.button === "LEFT") {
            pickRay = Camera.computePickRay(event.x, event.y);
            desktopActionProgress = true;
            lineStartPosition = Vec3.sum(pickRay.origin, Vec3.multiply(pickRay.direction, distance));
            previousLinePoint = Vec3.sum(pickRay.origin, Vec3.multiply(pickRay.direction, distance));
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
            var currentLinePoint = Vec3.sum(pickRay.origin, Vec3.multiply(pickRay.direction, distance));
            if (Vec3.distance(previousLinePointDesktop, currentLinePoint) > MINIMUM_MOVEMENT_TO_DRAW_M) {
                var displacementFromStart = Vec3.subtract(currentLinePoint, lineStartPosition);
                linePoints.push(displacementFromStart);
                if (!polyLine) {
                    playSound(DRAW_SOUND, DRAW_SOUND_VOLUME, MyAvatar.position, true, false);
                    playSound(CLOSE_SOUND, CLOSE_SOUND_VOLUME, MyAvatar.position, true, false);
                    polyLine = Entities.addEntity({
                        type: "PolyLine",
                        name: "Draw App Polyline",
                        position: lineStartPosition,
                        linePoints: linePoints,
                        normals: lineNormals,
                        strokeWidths: lineStrokeWidths,
                        color: { red: 255, green: 255, blue: 255 },
                        isUVModeStretch: true,
                        lifetime: DECAY_TIME_S,
                        collisionless: true,
                        faceCamera: true
                    }, 'avatar');
                } else {
                    var lineProperties = Entities.getEntityProperties(polyLine, ['linePoints', 'normals', 
                        'strokeWidths', 'age']);
                    var linePointsCount = lineProperties.linePoints.length;
                    if (linePointsCount > MAX_LINE_POINTS) {
                        var lastPointDisplacement = lineProperties.linePoints[linePointsCount - 1];
                        linePoints = [lastPointDisplacement, displacementFromStart];
                        lineNormals = [DEFAULT_NORMAL, DEFAULT_NORMAL];
                        lineStrokeWidths = [DEFAULT_STROKE_WIDTH_M, DEFAULT_STROKE_WIDTH_M];
                        polyLine = Entities.addEntity({
                            type: "PolyLine",
                            name: "Draw App Polyline",
                            position: previousLinePoint,
                            linePoints: linePoints,
                            normals: lineNormals,
                            strokeWidths: lineStrokeWidths,
                            color: { red: 255, green: 255, blue: 255 },
                            isUVModeStretch: true,
                            lifetime: DECAY_TIME_S,
                            collisionless: true,
                            faceCamera: true
                        }, 'avatar');
                    } else {
                        lineProperties.linePoints.push(displacementFromStart);
                        lineProperties.normals.push(DEFAULT_NORMAL);
                        lineProperties.strokeWidths.push(DEFAULT_STROKE_WIDTH_M);
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

    /* ON MOUSE RELEASE: Stop checking distance cursor has moved and update current polyline lifetime to decay in 1 
    minute. */
    function mouseReleased(event) {
        if (event.button === "LEFT") {
            if (injector) {
                injector.stop();
                injector = null;
            }
            polyLine = null;
            linePoints = [{x: 0, y: 0, z: 0 }];
            lineNormals = [DEFAULT_NORMAL, DEFAULT_NORMAL];
            lineStrokeWidths = [DEFAULT_STROKE_WIDTH_M, DEFAULT_STROKE_WIDTH_M];
            desktopActionProgress= false;
        }
    }

    /* ON CLICKING APP BUTTON: (on the toolbar or tablet) if we are opening the app, play a sound and get the paint sphere.
    If we are closing the app, remove the paint sphere */
    var OPEN_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/markerOpen.mp3'));
    var OPEN_SOUND_VOLUME = 0.2;
    var CLOSE_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/markerClose.mp3'));
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
    var WAIT_TO_CLEAN_UP = 2000;
    function domainChanged() {
        Script.setTimeout(function() {
            cleanUp();
        }, WAIT_TO_CLEAN_UP);
    }

    /* WHEN USER CHANGES DOMINANT HAND: Switch default hand to place paint sphere in */
    var WAIT_TO_REOPEN_APP_MS = 500;
    function handChanged() {
        dominantHand = MyAvatar.getDominantHand();
        dominantHandJoint = (dominantHand === "right") ? "RightHand" : "LeftHand";
        if (paintSphere) {
            onClicked();
        }
        if (distanceCheckInterval) {
            Script.clearInterval(distanceCheckInterval);
            distanceCheckInterval = null;
        }
        if (deletingInterval) {
            Script.clearInterval(deletingInterval);
            deletingInterval = null;
        }
        Script.setTimeout(function() {
            onClicked();
        }, WAIT_TO_REOPEN_APP_MS);
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
    registerControllerMapping();
    HMD.displayModeChanged.connect(displayModeChange);
    button.clicked.connect(onClicked);
    Window.domainChanged.connect(domainChanged);
    Script.scriptEnding.connect(appEnding);
}());