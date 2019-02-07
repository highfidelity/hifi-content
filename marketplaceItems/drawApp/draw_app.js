//
//  draw_ app.js
//
//  Created by Rebecca Stankus on 01/31/19
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* global  */

(function() {
    var DESKTOP_LINE_DISTANCE_FROM_AVATAR_M = 1;
    
    
    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
    var button = tablet.addButton({
        text: 'DRAW',
        icon: Script.resolvePath('Assets/Icons/draw-i.svg'),
        activeIcon: Script.resolvePath('Assets/Icons/draw-a.svg')
    });
  
    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************

    /* PLAY A SOUND: Plays the specified sound at the position of the user's Avatar using the volume and playback 
    mode requested. */
    var injector;
    function playSound(sound, volume, position, localOnly){
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
            }
            injector = Audio.playSound(sound, {
                position: position,
                volume: volume,
                localOnly: localOnly
            });
        }
    }

    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    /* CREATE A MARKER: Checks that marker does not already exist, then calculate position of avatar's hand and 
    create a marker there */
    var marker;
    function createMarker() {
        if (marker) {
            return;
        }
        // print("You have a marker!");
        var parentJointIndex = MyAvatar.getJointIndex(dominantHandJoint);
        var localPosition = (dominantHandJoint === "RightHand") ? { x: -0.0011, y: 0.0458, z: 0.0195 } : 
            { x: -0.0011, y: 0.0458, z: 0.0195 };
        var localRotation = (dominantHandJoint === "RightHand") ? Quat.fromVec3Degrees({ x: -90, y: 0, z: 0 }) : 
            Quat.fromVec3Degrees({ x: -90, y: 0, z: 0 });
        // We'll need a better back up joint for avatars without the required joint in the future
        // get dimensions based on avatar height
        marker = Entities.addEntity({
            name: "Draw App Marker",
            type: "Model",
            entityHostType: "avatar",
            description: "CC_BY Poly by Google",
            modelURL: Script.resolvePath("Assets/Models/sharpie.obj"),
            parentID: MyAvatar.sessionUUID,
            parentJointName: dominantHandJoint,
            parentJointIndex: parentJointIndex,
            localPosition: localPosition,
            localRotation: localRotation,
            localDimensions: { x: 0.0447, y: 0.0281, z: 0.1788 },
            grab: "{\"grabbable\":false}"
        });
        // FIX THAT THIS IS STILL GRABBABLE!
    }

    /* REGISTER CONTROLLER MAPPING: Listen for controller trigger movements and act when the trigger is pressed or 
    released */
    var MINIMUM_TRIGGER_PRESS_VALUE = 0.97;
    var controllerMapping;
    var controllerMappingName = 'Hifi-MyControllerMappingName';
    var activeTriggerPress = false;
    function registerControllerMapping() {
        controllerMapping = Controller.newMapping(controllerMappingName);
        controllerMapping.from(Controller.Standard.RT).to(function (value) {
            if (dominantHand === "right" && value >= MINIMUM_TRIGGER_PRESS_VALUE && !activeTriggerPress) {
                // console.log("Right trigger press mapped");
                activeTriggerPress = true;
                triggerPressedDraw();
            } else if (value <= MINIMUM_TRIGGER_PRESS_VALUE && activeTriggerPress) {
                // console.log("Right trigger release mapped");
                activeTriggerPress = false;
                triggerReleasedDraw();
            }
            return;
        });
        controllerMapping.from(Controller.Standard.RightGrip).to(function (value) {
            if (dominantHand === "right" && value >= MINIMUM_TRIGGER_PRESS_VALUE && !activeTriggerPress) {
                // console.log("Right trigger press mapped");
                activeTriggerPress = true;
                triggerPressedErase();
            } else if (value <= MINIMUM_TRIGGER_PRESS_VALUE && activeTriggerPress) {
                // console.log("Right trigger release mapped");
                activeTriggerPress = false;
                triggerReleasedErase();
            }
            return;
        });
        controllerMapping.from(Controller.Standard.LT).to(function (value) {
            if (dominantHand === "left" && value >= MINIMUM_TRIGGER_PRESS_VALUE && !activeTriggerPress ) {
                console.log("Left trigger press mapped");
                activeTriggerPress = true;
                triggerPressed();
            } else if (value <= MINIMUM_TRIGGER_PRESS_VALUE && activeTriggerPress) {
                console.log("Left trigger release mapped");
                activeTriggerPress = false;
                triggerReleased;
            }
            return;
        });
        controllerMapping.from(Controller.Standard.LeftGrip).to(function (value) {
            if (dominantHand === "right" && value >= MINIMUM_TRIGGER_PRESS_VALUE && !activeTriggerPress) {
                // console.log("Right trigger press mapped");
                activeTriggerPress = true;
                gripPressed();
            } else if (value <= MINIMUM_TRIGGER_PRESS_VALUE && activeTriggerPress) {
                // console.log("Right trigger release mapped");
                activeTriggerPress = false;
                gripReleased();
            }
            return;
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
    var distanceCheckInterval = null;
    var polyLine = null;
    function triggerPressed() {
        // print("TRIGGER PRESSED");
        // if tablet open, return to prevent creating lines while user is in create mode or other apps
        var markerProperties = Entities.getEntityProperties(marker, ['dimensions', 'position', 'rotation']);
        var halfMarkerLength = markerProperties.dimensions.z * HALF;
        var markerTipLocalOffset = { x: 0, y: 0, z: halfMarkerLength};
        var markerTipLocalPosition = Vec3.multiplyQbyV(markerProperties.rotation, markerTipLocalOffset);
        var markerTipWorldPosition = Vec3.sum(markerProperties.position, markerTipLocalPosition);
        // print("halfMarkerLength: ", halfMarkerLength);
        var lineStartPosition = markerTipWorldPosition;
        var previousMarkerTipPosition = markerTipWorldPosition;
        var linePoints = [ {x: 0, y: 0, z: 0 } ];
        var lineNormals = [ DEFAULT_NORMAL, DEFAULT_NORMAL ];
        var lineStrokeWidths = [ DEFAULT_STROKE_WIDTH_M, DEFAULT_STROKE_WIDTH_M ];
        distanceCheckInterval = Script.setInterval(function() {
            markerProperties = Entities.getEntityProperties(marker, ['dimensions', 'position']);
            markerTipWorldPosition = Vec3.sum(markerProperties.position, markerTipLocalPosition);
            if (Vec3.distance(previousMarkerTipPosition, markerTipWorldPosition) > MINIMUM_MOVEMENT_TO_DRAW_M) {
                var displacementFromStart = Vec3.subtract(markerTipWorldPosition, lineStartPosition);
                linePoints.push(displacementFromStart);
                if (!polyLine) {
                    polyLine = Entities.addEntity({
                        type: "PolyLine",
                        entityHostType: "avatar",
                        name: "Draw App Polyline",
                        position: previousMarkerTipPosition,
                        linePoints: linePoints,
                        normals: lineNormals,
                        strokeWidths: lineStrokeWidths,
                        color: { red: 255, green: 255, blue: 255 },
                        isUVModeStretch: true,
                        lifetime: DECAY_TIME_S,
                        collisionless: true
                    });
                } else {
                    var lineProperties = Entities.getEntityProperties(polyLine, ['linePoints', 'normals', 
                        'strokeWidths', 'age']);
                    var linePointsCount = lineProperties.linePoints.length;
                    // print("ADDING ", JSON.stringify(displacementFromStart), " TO LINE");
                    if (linePointsCount > MAX_LINE_POINTS) {
                        // print("TOO MANY LINE POINTS, STARTING NEW LINE!");
                        var lastPointDisplacement = lineProperties.linePoints[linePointsCount - 1];
                        linePoints = [ lastPointDisplacement, displacementFromStart ];
                        lineNormals = [ DEFAULT_NORMAL, DEFAULT_NORMAL ];
                        lineStrokeWidths = [ DEFAULT_STROKE_WIDTH_M, DEFAULT_STROKE_WIDTH_M ];
                        polyLine = Entities.addEntity({
                            type: "PolyLine",
                            entityHostType: "avatar",
                            name: "Draw App Polyline",
                            position: previousMarkerTipPosition,
                            linePoints: linePoints,
                            normals: lineNormals,
                            strokeWidths: lineStrokeWidths,
                            color: { red: 255, green: 255, blue: 255 },
                            isUVModeStretch: true,
                            lifetime: DECAY_TIME_S,
                            collisionless: true
                        });
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
        // print("TRIGGER RELEASED");
        if (distanceCheckInterval) {
            Script.clearInterval(distanceCheckInterval);
        }
        polyLine = null;
    }

    /* ON GRIP PRESS ERASE: */
    function gripPressed() {

    }
   

    /* ON GRIP RELEASE ERASE: */
    function gripReleased() {
    }

    /* ON MOUSE PRESS: Store the initial point and begin checking distance cursor has moved on an interval. If cursor 
    has moved more than minimum distance, draw a polyline entity with a lifetime of 1 minute and at default distance in 
    front of avatar. Continue checking cursor distance. Every time cursor moves more than the minumum, update the 
    polyline with another node. */
    function mousePressed() {
        print("MOUSE PRESSED");
        // get cursor position
    }

    /* ON MOUSE RELEASE: Stop checking distance cursor has moved and update current polyline lifetime to decay in 1 
    minute. */
    function mouseReleased() {
        print("MOUSE RELEASED");
    }

    // On clicking the app button on the toolbar or tablet, if we are oopening the app, play a sound and get the marker. 
    // If we are closing the app, remove the marker
    var OPEN_SOUND = SoundCache.getSound(Script.resolvePath('Assets/Sounds/open.wav'));
    var OPEN_SOUND_VOLUME = 0.5;
    var CLOSE_SOUND = SoundCache.getSound(Script.resolvePath('Assets/Sounds/open.wav'));
    var CLOSE_SOUND_VOLUME = 0.5;
    function onClicked() {
        // print("CLICKED");
        if (marker) {
            button.editProperties({ isActive: false });
            if (HMD.active) {
                closeHMDMode();
            } else {
                closeDesktopMode();
            }
            // print("You do not have a marker!");
            Entities.deleteEntity(marker);
            marker = null;
            playSound(CLOSE_SOUND, CLOSE_SOUND_VOLUME, MyAvatar.position, true);
        } else {
            if (HMD.active) {
                setUpHMDMode();
            } else {
                setUpDesktopMode();
            }
            button.editProperties({ isActive: true });
            playSound(OPEN_SOUND, OPEN_SOUND_VOLUME, MyAvatar.position, true);
            createMarker();
            // close tablet so user will be left in state where they can draw
        }
    }

    /* ON STOPPING THE SCRIPT: Make sure the marker gets deleted and its variable set back to null 
    if applicable. Search for any unreferenced markers and delete if found. */
    function appEnding() {
        cleanUp();
        button.clicked.disconnect(onClicked);
        tablet.removeButton(button);
        if (controllerMapping) {
            controllerMapping.disable();
        }
    }

    /* CLEANUP: Remove marker, search for any unreferenced markers to clean up */
    function cleanUp() {
        print("cleanup");
        if (controllerMapping) {
            controllerMapping.disable();
        }
        if (marker) {
            print("deleting");
            Entities.deleteEntity(marker);
            marker = null;
        }
        button.editProperties({ isActive: false });
        MyAvatar.getAvatarEntitiesVariant().forEach(function(avatarEntity) {
            var name = Entities.getEntityProperties(avatarEntity.id, 'name').name;
            print("AVATAR HAS WEARABLE: ", name);
            if (name === "Draw App Marker") {
                Entities.deleteEntity(avatarEntity);
            }
        });
    }

    /* WHEN TOGGLING DISPLAY MODE: Set variable to track which method to use to draw lines */
    function displayModeChange() {
        if (HMD.active) {
            closeDesktopMode();
            setUpHMDMode();
        } else {
            closeHMDMode();
            setUpDesktopMode();
        }
    }

    /* SET UP HMD MODE: create controller mapping to listen for trigger presses */
    function setUpHMDMode() {
        if (controllerMapping) {
            controllerMapping.enable();
        }
    }

    /* SET UP DESKTOP MODE: Listen for mouse presses */
    function setUpDesktopMode() {
        Controller.mousePressEvent.connect(mousePressed);
        Controller.mouseReleaseEvent.connect(mouseReleased);
    }

    /* CLOSE HMD MODE: Remove controller mapping */
    function closeHMDMode() {
        if (controllerMapping) {
            controllerMapping.disable();
        }
    }

    /* CLOSE DESKTOP MODE: Stop listening for mouse presses */
    function closeDesktopMode() {
        try {
            Controller.mousePressEvent.disconnect(mousePressed);
            Controller.mouseReleaseEvent.disconnect(mouseReleased);
        } catch (err) {
            print("Could not disconnect mouse events");
        }
    }

    /* WHEN USER DOMAIN CHANGES: Close app to remove marker in hand when leaving the domain */
    function domainChanged() {
        print("domain changed");
        cleanUp();
    }

    /* WHEN USER CHANGES DOMINANT HAND: Switch default hand to place marker in */
    var WAIT_TO_REOPEN_APP_MS = 500;
    function handChanged() {
        // print("hand changed");
        dominantHand = MyAvatar.getDominantHand();
        dominantHandJoint = (dominantHand === "right") ? "RightHand" : "LeftHand";
        if (marker) {
            onClicked();
        }
        Script.setTimeout(function() {
            onClicked();
        }, WAIT_TO_REOPEN_APP_MS);
    }

    var dominantHand = MyAvatar.getDominantHand();
    var dominantHandJoint = (dominantHand === "right") ? "RightHand" : "LeftHand";
    MyAvatar.dominantHandChanged.connect(handChanged);
    registerControllerMapping();
    HMD.displayModeChanged.connect(displayModeChange);
    button.clicked.connect(onClicked); // listen for clicks on the tablet button
    Window.domainChanged.connect(domainChanged); // listen for when user leaves domain
    Script.scriptEnding.connect(appEnding); // listen for when the script is stopped
}());