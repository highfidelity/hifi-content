//
//  draw_app.js
//
//  Created by Rebecca Stankus on 01/31/19
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* global  Audio, Camera, Controller, Entities, HMD, MyAvatar, Quat, Script, Settings, SoundCache, Tablet, Vec3, Window */

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

    /* CREATE A MARKER: Checks that marker does not already exist, then calculate position of avatar's hand and 
    create a marker there */
    var DEFAULT_RT_LOCAL_POSITION = { x: -0.0011, y: 0.0458, z: 0.0195 };
    var DEFAULT_LT_LOCAL_POSITION = { x: -0.0011, y: 0.0458, z: 0.0195 };
    var DEFAULT_RT_LOCAL_ROTATION = Quat.fromVec3Degrees({ x: -90, y: 0, z: 0 });
    var DEFAULT_LT_LOCAL_ROTATION = Quat.fromVec3Degrees({ x: -90, y: 0, z: 0 });
    print("DEFAULT LOCALROTATION IS ", JSON.stringify(Quat.fromVec3Degrees({ x: -90, y: 0, z: 0 })));
    var marker;
    function createMarker() {
        if (marker) {
            return;
        }
        var parentJointIndex = MyAvatar.getJointIndex(dominantHandJoint);
        var localPosition = (dominantHandJoint === "RightHand") ? DEFAULT_RT_LOCAL_POSITION : DEFAULT_LT_LOCAL_POSITION;
        var localRotation = (dominantHandJoint === "RightHand") ? DEFAULT_RT_LOCAL_ROTATION : DEFAULT_LT_LOCAL_ROTATION;
        var currentSavedData = Settings.getValue("DrawAppMarkerProperties");
        if (currentSavedData) {
            if (parentJointIndex === currentSavedData.parentJointIndex) {
                if (dominantHandJoint === "RightHand") {
                    localPosition = currentSavedData.localPositionRT;
                    localRotation = currentSavedData.localRotationRT;
                } else {
                    localPosition = currentSavedData.localPositionLT;
                    localRotation = currentSavedData.localRotationLT;
                }
            }
        }
        marker = Entities.addEntity({
            name: "Draw App Marker",
            type: "Model",
            description: "CC_BY Poly by Google",
            modelURL: Script.resolvePath("assets/models/marker-white.fbx"),
            parentID: MyAvatar.sessionUUID,
            parentJointIndex: parentJointIndex,
            localPosition: localPosition,
            localRotation: localRotation,
            localDimensions: { x: 0.03, y: 0.03, z: 0.18 }
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
    var DEFAULT_STROKE_WIDTH_M = 0.01;
    var DEFAULT_NORMAL = { x: 0, y: 0, z: 1 };
    var HALF = 0.5;
    var DECAY_TIME_S = 60;
    var MAX_LINE_POINTS = 100;
    var DRAW_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/markerDraw.mp3'));
    var DRAW_SOUND_VOLUME = 0.02;
    var distanceCheckInterval = null;
    var polyLine = null;
    var lineStartPosition;
    var previousLinePoint;
    var linePoints = [{x: 0, y: 0, z: 0 }];
    var lineNormals = [DEFAULT_NORMAL, DEFAULT_NORMAL];
    var lineStrokeWidths = [DEFAULT_STROKE_WIDTH_M, DEFAULT_STROKE_WIDTH_M];
    function triggerPressed() {
        if (tablet.tabletShown || activeGripPress) {
            return;
        }
        var markerProperties = Entities.getEntityProperties(marker, ['dimensions', 'position', 'rotation']);
        var halfMarkerLength = markerProperties.dimensions.z * HALF;
        var markerTipLocalOffset = { x: 0, y: 0, z: halfMarkerLength};
        var markerTipLocalPosition = Vec3.multiplyQbyV(markerProperties.rotation, markerTipLocalOffset);
        var markerTipWorldPosition = Vec3.sum(markerProperties.position, markerTipLocalPosition);
        lineStartPosition = markerTipWorldPosition;
        previousLinePoint = markerTipWorldPosition;
        distanceCheckInterval = Script.setInterval(function() {
            markerTipLocalPosition = Vec3.multiplyQbyV(markerProperties.rotation, markerTipLocalOffset);
            markerProperties = Entities.getEntityProperties(marker, ['dimensions', 'position', 'rotation']);
            markerTipWorldPosition = Vec3.sum(markerProperties.position, markerTipLocalPosition);
            if (Vec3.distance(previousLinePoint, markerTipWorldPosition) > MINIMUM_MOVEMENT_TO_DRAW_M) {
                var displacementFromStart = Vec3.subtract(markerTipWorldPosition, lineStartPosition);
                linePoints.push(displacementFromStart);
                if (!polyLine) {
                    playSound(DRAW_SOUND, DRAW_SOUND_VOLUME, MyAvatar.position, false, true);
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
            }
            polyLine = null;
            linePoints = [{x: 0, y: 0, z: 0 }];
            lineNormals = [DEFAULT_NORMAL, DEFAULT_NORMAL];
            lineStrokeWidths = [DEFAULT_STROKE_WIDTH_M, DEFAULT_STROKE_WIDTH_M];
        }
    }

    /* ON GRIP PRESS ERASE: Set an interval that finds the nearest line within a maximum distance to marker tip and erases it */
    var DELETE_AGAIN_MS = 100;
    var MAXIMUM_DISTANCE_TO_SEARCH_M = 1;
    var MAXIMUM_DISTANCE_TO_DELETE_M = 0.03;
    var deletingInterval;
    function gripPressed() {
        if (tablet.tabletShown || activeTriggerPress) {
            return;
        }
        deletingInterval = Script.setInterval(function() {
            var markerProperties = Entities.getEntityProperties(marker, ['dimensions', 'position', 'rotation']);
            var halfMarkerLength = markerProperties.dimensions.z * HALF;
            var markerTipLocalOffset = { x: 0, y: 0, z: halfMarkerLength};
            var markerTipLocalPosition = Vec3.multiplyQbyV(markerProperties.rotation, markerTipLocalOffset);
            var markerTipWorldPosition = Vec3.sum(markerProperties.position, markerTipLocalPosition);
            var foundANearbyLine = false;
            var lineToDelete;
            Entities.findEntitiesByName("Draw App Polyline", markerTipWorldPosition, MAXIMUM_DISTANCE_TO_SEARCH_M)
                .forEach(function(nearbyDrawAppLine) {
                    var lineProperties = Entities.getEntityProperties(nearbyDrawAppLine, ['position', 'linePoints']);
                    var lineBoundingBoxCenter = lineProperties.position;
                    var numberLinePoints = lineProperties.linePoints.length;
                    var shortestDistance = MAXIMUM_DISTANCE_TO_DELETE_M;
                    for (var i = 0; i < numberLinePoints; i++) {
                        var distanceFromMarkerTip = Vec3.distance(markerTipWorldPosition,
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
                    playSound(DRAW_SOUND, DRAW_SOUND_VOLUME, MyAvatar.position, false, true);
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
            }
            polyLine = null;
            linePoints = [{x: 0, y: 0, z: 0 }];
            lineNormals = [DEFAULT_NORMAL, DEFAULT_NORMAL];
            lineStrokeWidths = [DEFAULT_STROKE_WIDTH_M, DEFAULT_STROKE_WIDTH_M];
            desktopActionProgress= false;
        }
    }

    /* SAVE MARKER ROTATION AND POSITION IN HAND: Save the current data to setting */
    function saveDataToSettings() {
        var markerProperties = Entities.getEntityProperties(marker, ['parentJointIndex', 'localPosition', 'localRotation']);
        print("LOCAL ROTATION: ", JSON.stringify(markerProperties.localRotation));
        var currentJointName;
        if (MyAvatar.getJointIndex("RightHand") === markerProperties.parentJointIndex) {
            currentJointName = "RightHand";
        } else if (MyAvatar.getJointIndex("LeftHand") === markerProperties.parentJointIndex) {
            currentJointName = "LeftHand";
        } else {
            return;
        }
        var currentSavedData = Settings.getValue("DrawAppMarkerProperties");
        if (!currentSavedData) {
            Settings.setValue("DrawAppMarkerProperties", {
                parentJointIndex: markerProperties.parentJointIndex,
                localPositionRT: (currentJointName === "RightHand") ? markerProperties.localPosition 
                    : DEFAULT_RT_LOCAL_POSITION,
                localPositionLT: (currentJointName === "LeftHand") ? markerProperties.localPosition 
                    : DEFAULT_LT_LOCAL_POSITION,
                localRotationRT: (currentJointName === "RightHand") ? markerProperties.localRotation
                    : DEFAULT_RT_LOCAL_ROTATION,
                localRotationLT: (currentJointName === "LeftHand") ? markerProperties.localRotation
                    : DEFAULT_LT_LOCAL_ROTATION
            });
        } else {
            currentSavedData.parentJointIndex = markerProperties.parentJointIndex;
            if (currentJointName === "RightHand") {
                currentSavedData.localPositionRT = markerProperties.localPosition;
                currentSavedData.localRotationRT = markerProperties.localRotation;
            } else if (currentJointName === "LeftHand") {
                currentSavedData.localPositionLT = markerProperties.localPosition;
                currentSavedData.localRotationLT = markerProperties.localRotation;
            }
            Settings.setValue("DrawAppMarkerProperties", currentSavedData);
        }
    }

    /* ON CLICKING APP BUTTON: (on the toolbar or tablet) if we are opening the app, play a sound and get the marker.
    If we are closing the app, remove the marker */
    var OPEN_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/markerOpen.mp3?000'));
    var OPEN_SOUND_VOLUME = 0.2;
    var CLOSE_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/markerClose.mp3'));
    var CLOSE_SOUND_VOLUME = 0.3;
    function onClicked() {
        if (marker) {
            saveDataToSettings();
            button.editProperties({ isActive: false });
            if (HMD.active) {
                closeHMDMode();
            } else {
                closeDesktopMode();
            }
            Entities.deleteEntity(marker);
            marker = null;
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
            createMarker();
        }
    }

    /* ON STOPPING THE SCRIPT: Make sure the marker gets deleted and its variable set back to null 
    if applicable. Search for any unreferenced markers and delete if found. */
    function appEnding() {
        if (marker) {
            saveDataToSettings();
        }
        cleanUp();
        HMD.displayModeChanged.disconnect(displayModeChange);
        button.clicked.disconnect(onClicked);
        Window.domainChanged.disconnect(domainChanged);
        tablet.removeButton(button);
        if (controllerMapping) {
            controllerMapping.disable();
        }
    }

    /* CLEANUP: Remove marker, search for any unreferenced markers to clean up */
    function cleanUp() {
        if (injector) {
            injector.stop();
        }
        if (controllerMapping) {
            controllerMapping.disable();
        }
        if (marker) {
            Entities.deleteEntity(marker);
            marker = null;
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
            if (name === "Draw App Marker") {
                Entities.deleteEntity(avatarEntity.id);
            }
        });
    }

    /* WHEN TOGGLING DISPLAY MODE: Set variable to track which method to use to draw lines */
    function displayModeChange() {
        if (marker) {
            if (HMD.active) {
                closeDesktopMode();
                setUpHMDMode();
            } else {
                closeHMDMode();
                setUpDesktopMode();
            }
        }
    }

    /* SET UP HMD MODE: create controller mapping to listen for trigger presses */
    function setUpHMDMode() {
        if (controllerMapping) {
            controllerMapping.enable();
        }
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

    /* WHEN USER DOMAIN CHANGES: Close app to remove marker in hand when leaving the domain */
    var WAIT_TO_CLEAN_UP = 2000;
    function domainChanged() {
        if (marker) {
            saveDataToSettings();
        }
        Script.setTimeout(function() {
            cleanUp();
        }, WAIT_TO_CLEAN_UP);
    }

    /* WHEN USER CHANGES DOMINANT HAND: Switch default hand to place marker in */
    var WAIT_TO_REOPEN_APP_MS = 500;
    function handChanged() {
        dominantHand = MyAvatar.getDominantHand();
        dominantHandJoint = (dominantHand === "right") ? "RightHand" : "LeftHand";
        if (marker) {
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
        icon: Script.resolvePath('assets/icons/draw-i.svg'),
        activeIcon: Script.resolvePath('assets/icons/draw-a.svg')
    });
    var dominantHand = MyAvatar.getDominantHand();
    var dominantHandJoint = (dominantHand === "right") ? "RightHand" : "LeftHand";
    MyAvatar.dominantHandChanged.connect(handChanged);
    registerControllerMapping();
    HMD.displayModeChanged.connect(displayModeChange);
    button.clicked.connect(onClicked); // listen for clicks on the tablet button
    Window.domainChanged.connect(domainChanged); // listen for when user leaves domain
    Script.scriptEnding.connect(appEnding); // listen for when the script is stopped
}());