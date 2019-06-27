"use strict";
/*jslint vars:true, plusplus:true, forin:true*/
/*global Tablet, Script,  */
/* eslint indent: ["error", 4, { "outerIIFEBody": 0 }] */
//
// RPO360.js
//
//  Created by Zach Fox on 2018-10-26
//  Copyright 2018 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function () { // BEGIN LOCAL_SCOPE
var AppUi = Script.require('appUi');

// Function Name: inFrontOf()
//
// Description:
//   - Returns the position in front of the given "position" argument, where the forward vector is based off
//    the "orientation" argument and the amount in front is based off the "distance" argument.
function inFrontOf(distance, position, orientation) {
    return Vec3.sum(position || MyAvatar.position,
        Vec3.multiply(distance, Quat.getForward(orientation || MyAvatar.orientation)));
}

// Function Name: rpo360On()
var secondaryCameraConfig = Render.getConfig("SecondaryCamera");
var camera = false;
var cameraRotation;
var cameraPosition;
var cameraGravity = {x: 0, y: -5, z: 0};
var velocityLoopInterval = false;
function rpo360On() {
    // Rez the camera model, and attach
    // the secondary camera to the rezzed model.
    cameraRotation = MyAvatar.orientation;
    cameraPosition = inFrontOf(1.0, Vec3.sum(MyAvatar.position, { x: 0, y: 0.3, z: 0 }));
    camera = Entities.addEntity({
        "angularDamping": 0.08,
        "canCastShadow": false,
        "damping": 0.01,
        "collidesWith": "static,dynamic,kinematic,",
        "collisionMask": 7,
        "modelURL": Script.resolvePath("resources/models/rpo360.fbx"),
        "name": "RPO360 Camera",
        "rotation": cameraRotation,
        "position": cameraPosition,
        "shapeType": "simple-compound",
        "type": "Model",
        "userData": '{"grabbableKey":{"grabbable":true}}',
        "isVisibleInSecondaryCamera": false,
        "gravity": cameraGravity,
        "dynamic": true
    }, true);
    secondaryCameraConfig.attachedEntityId = camera;

    // Make the button go active if the UI is open OR the camera is on
    // (in this case it'll be both)
    buttonActive(ui.isOpen);

    // Play a little sound to let the user know we've rezzed the camera
    Audio.playSound(SOUND_CAMERA_ON, {
        volume: 0.15,
        position: cameraPosition,
        localOnly: true
    });

    // Remove the existing camera model from the domain if one exists.
    // It's easy for this to happen if the user crashes while the RPO360 Camera is on.
    // We do this down here (after the new one is rezzed) so that we don't accidentally delete
    // the newly-rezzed model.
    var entityIDs = Entities.findEntitiesByName("RPO360 Camera", MyAvatar.position, 100, false);
    entityIDs.forEach(function (currentEntityID) {
        var currentEntityOwner = Entities.getEntityProperties(currentEntityID, ['owningAvatarID']).owningAvatarID;
        if (currentEntityOwner === MyAvatar.sessionUUID && currentEntityID !== camera) {
            Entities.deleteEntity(currentEntityID);
        }
    });

    // Start the velocity loop interval at 70ms
    // This is used to determine when the 360 photo should be snapped
    velocityLoopInterval = Script.setInterval(velocityLoop, 70);
}

// Function Name: velocityLoop()
var hasBeenThrown = false;
var hasBeenGrabbed = false;
var snapshotVelocity = false;
var snapshotAngularVelocity = false;
var velocityWasPositive = false;
var cameraReleaseTime = false;
var MIN_AIRTIME_MS = 500;
var flash = false;
function velocityLoop() {
    // Get the velocity and angular velocity of the camera model
    var properties = Entities.getEntityProperties(camera, [
        'velocity',
        'angularVelocity'
    ]);
    var velocity = properties.velocity;
    var angularVelocity = properties.angularVelocity;

    // ActionIDs refer to the actions on the entity
    // Actions can be things like: NearGrab, FarGrab, Equip, etc.
    var actionIDs = Entities.getActionIDs(camera);

    // If there's an action on the entity...
    if (actionIDs.length > 0) {
        // Set the "hasBeenGrabbed" flag to "true"
        hasBeenGrabbed = true;
        // Make sure we record that we haven't yet been thrown
        hasBeenThrown = false;
    // If we've previously been grabbed, and there are currently no actions
    // on the camera model...
    } else if (hasBeenGrabbed) {
        // Reset this flag to false
        hasBeenGrabbed = false;
        // We've been thrown now!
        hasBeenThrown = true;
        // Record the time at which a user has thrown the camera
        cameraReleaseTime = Date.now();
    }

    // If we've been thrown UP...
    if (hasBeenThrown && velocity.y > 0) {
        // Set this flag to true
        velocityWasPositive = true;
    }

    // If we've been thrown UP in the past, but now we're coming DOWN...
    if (hasBeenThrown && velocityWasPositive && velocity.y < 0) {
        // Reset the state machine
        hasBeenThrown = false;
        velocityWasPositive = false;
        // Don't take a snapshot if the camera hasn't been in the air for very long
        if (Date.now() - cameraReleaseTime <= MIN_AIRTIME_MS) {
            return;
        }
        // Save these properties so that the camera falls realistically
        // after it's taken the 360 snapshot
        snapshotVelocity = velocity;
        snapshotAngularVelocity = angularVelocity;
        // Freeze the camera model and make it not grabbable
        Entities.editEntity(camera, {
            velocity: {x: 0, y: 0, z: 0},
            angularVelocity: {x: 0, y: 0, z: 0},
            gravity: {x: 0, y: 0, z: 0},
            "userData": '{"grabbableKey":{"grabbable":false}}',
        });
        // Add a "flash" to the camera that illuminates the ground below the camera
        flash = Entities.addEntity({
            "collidesWith": "",
            "collisionMask": 0,
            "color": {
                "blue": 173,
                "green": 252,
                "red": 255
            },
            "dimensions": {
                "x": 100,
                "y": 100,
                "z": 100
            },
            "dynamic": false,
            "falloffRadius": 10,
            "intensity": 1,
            "isSpotlight": false,
            "localRotation": { w: 1, x: 0, y: 0, z: 0 },
            "name": "RPO360 Camera Flash",
            "type": "Light",
            "parentID": camera
        });
        // Take the snapshot!
        maybeTake360Snapshot();
    }
}

// Function Name: rpo360Off()
var WAIT_AFTER_DOMAIN_SWITCH_BEFORE_CAMERA_DELETE_MS = 1 * 1000;
function rpo360Off(isChangingDomains) {
    if (velocityLoopInterval) {
        Script.clearInterval(velocityLoopInterval);
        velocityLoopInterval = false;
    }

    function deleteCamera() {
        if (flash) {
            Entities.deleteEntity(flash);
            flash = false;
        }
        if (camera) {
            Entities.deleteEntity(camera);
            camera = false;
        }
        buttonActive(ui.isOpen);
    }

    secondaryCameraConfig.attachedEntityId = false;
    if (camera) {
        // Workaround for Avatar Entities not immediately having properties after
        // the "Window.domainChanged()" signal is emitted.
        // May no longer be necessary; untested...
        if (isChangingDomains) {
            Script.setTimeout(function () {
                deleteCamera();
                rpo360On();
            }, WAIT_AFTER_DOMAIN_SWITCH_BEFORE_CAMERA_DELETE_MS);
        } else {
            deleteCamera();
        }
    }
}

var isCurrentlyTaking360Snapshot = false;
var processing360Snapshot = false;
function maybeTake360Snapshot() {
    // Don't take a snapshot if we're currently in the middle of taking one
    // or if the camera entity doesn't exist
    if (!isCurrentlyTaking360Snapshot && camera) {
        isCurrentlyTaking360Snapshot = true;
        var currentCameraPosition = Entities.getEntityProperties(camera, ['position']).position;
        // Play a sound at the current camera position
        Audio.playSound(SOUND_SNAPSHOT, {
            position: { x: currentCameraPosition.x, y: currentCameraPosition.y, z: currentCameraPosition.z },
            localOnly: false,
            volume: 0.8
        });
        Window.takeSecondaryCamera360Snapshot(currentCameraPosition);
        used360AppToTakeThisSnapshot = true;
        processing360Snapshot = true;

        // Let the QML know we're processing a 360 snapshot now
        ui.sendMessage({
            method: 'startedProcessing360Snapshot'
        });
    }
}

function on360SnapshotTaken(path) {
    isCurrentlyTaking360Snapshot = false;
    // Make the camera fall back to the ground with the same
    // physical properties as when it froze in the air
    Entities.editEntity(camera, {
        velocity: snapshotVelocity,
        angularVelocity: snapshotAngularVelocity,
        gravity: cameraGravity,
        "userData": '{"grabbableKey":{"grabbable":true}}',
    });
    // Delete the flash entity
    if (flash) {
        Entities.deleteEntity(flash);
        flash = false;
    }
    console.log('360 Snapshot taken. Path: ' + path + "\nUploading now...");
    // Upload the 360 snapshot to our S3
    Window.shareSnapshot(path);
}

var last360SnapshotUrl = false;
var last360ThumbnailURL = false;
var used360AppToTakeThisSnapshot = false;
// We process this signal after any snapshot is uploaded to the HiFi website
function snapshotUploaded(isError, reply) {
    if (!isError) {
        // This isn't foolproof - there's a race condition here. A user could 
        // take a snapshot using the Snap app or some other method, upload it,
        // just before using this app to take a snapshot. At that point,
        // it'd be possible to enter this conditional accidentally.
        // But the likelihood of that happening is very low.
        if (used360AppToTakeThisSnapshot) {
            var replyJson = JSON.parse(reply),
                storyID = replyJson.user_story.id,
                imageURL = replyJson.user_story.details.image_url,
                thumbnailURL = replyJson.user_story.thumbnail_url;

            used360AppToTakeThisSnapshot = false;
            last360SnapshotUrl = imageURL;
            last360ThumbnailURL = thumbnailURL;
            console.log('SUCCESS: Snapshot uploaded! Story with audience:for_url created! ID:', storyID);
            console.log("Image URL: " + last360SnapshotUrl);
            console.log("Thumbnail URL: " + last360ThumbnailURL);
            ui.sendMessage({
                method: 'last360ThumbnailURL',
                last360ThumbnailURL: last360ThumbnailURL
            });
            processing360Snapshot = false;
            ui.sendMessage({
                method: 'finishedProcessing360Snapshot'
            });
        }
    }
}

// This is the globe with the 360 image printed on the OUTSIDE.
var globe = false;
function rez360Globe() {
    var properties = {                                
        "type": 'Sphere',

        "name": "Globe by " + MyAvatar.sessionDisplayName,
        "description": "Created with RPO360 Cam",

        "dimensions": { "x": 1.0, "y": 1.0, "z": 1.0 },
        "position": inFrontOf(2.0, Vec3.sum(MyAvatar.position, { x: 0, y: 0.3, z: 0 })),

        "density": 200,
        "restitution": 0.15,                            
        "gravity": { "x": 0, "y": -0.5, "z": 0 },
        "damping": 0.45,

        "dynamic": true, 
        "collisionsWillMove": true,

        "grab": { "grabbable": true }
    };
        
    globe = Entities.addEntity(properties);

    var globeMaterial = Entities.addEntity({
        type: "Material",
        name: "Globe Texture",
        parentID: globe,
        materialURL: "materialData",
        priority: 1,
        materialData: JSON.stringify({
            materialVersion: 1,
            materials: {
                "model": "hifi_pbr",
                "albedoMap": last360SnapshotUrl,
                "emissiveMap": last360SnapshotUrl
            }
        })
    });
}

// This is the globe with the 360 image printed on the INSIDE.
var streetViewGlobe = false;
function rezStreetViewGlobe() {
    var properties = {                                
        "type": 'Model',
        "shapeType": "simple-compound",

        "name": "Street View Globe by " + MyAvatar.sessionDisplayName,
        "description": "Created with RPO360 Cam",

        "dimensions": { "x": 3.0, "y": 3.0, "z": 3.0 },
        "modelURL": Script.resolvePath("resources/models/invertedSphere.fbx"),
        "position": inFrontOf(3.0, Vec3.sum(MyAvatar.position, { x: 0, y: 0.55, z: 0 })),

        "density": 200,
        "restitution": 0.15,                            
        "gravity": { "x": 0, "y": -0.5, "z": 0 },
        "damping": 0.45,

        "dynamic": true, 

        "collidesWith": "static,dynamic,kinematic,",
        "collisionMask": 7,
        "collisionsWillMove": true,

        "userData": "{\"grabbableKey\":{\"grabbable\":true}}"
    };
        
    streetViewGlobe = Entities.addEntity(properties);

    var globeMaterial = Entities.addEntity({
        type: "Material",
        name: "Globe Texture",
        parentID: streetViewGlobe,
        materialURL: "materialData",
        priority: 1,
        materialData: JSON.stringify({
            materialVersion: 1,
            materials: {
                "model": "hifi_pbr",
                "albedoMap": last360SnapshotUrl,
                "emissiveMap": last360SnapshotUrl
            }
        })
    });
}

// Stolen from `controllerDispatcherUtils.js`
// The client team probably wouldn't like the "disable/enable grab highlighting"
// feature that this app implements :)
const DISPATCHER_HOVERING_LIST = "dispactherHoveringList";
const DISPATCHER_HOVERING_STYLE = {
    isOutlineSmooth: true,
    outlineWidth: 0,
    outlineUnoccludedColor: {red: 255, green: 128, blue: 128},
    outlineUnoccludedAlpha: 0.0,
    outlineOccludedColor: {red: 255, green: 128, blue: 128},
    outlineOccludedAlpha:0.0,
    fillUnoccludedColor: {red: 255, green: 255, blue: 255},
    fillUnoccludedAlpha: 0.12,
    fillOccludedColor: {red: 255, green: 255, blue: 255},
    fillOccludedAlpha: 0.0
};

// Function Name: fromQml()
function fromQml(message) {
    switch (message.method) {
    case 'rpo360On':
        rpo360On();
        break;
    case 'rpo360Off':
        rpo360Off();
        break;
    case 'openSettings':
        if ((HMD.active && Settings.getValue("hmdTabletBecomesToolbar", false))
            || (!HMD.active && Settings.getValue("desktopTabletBecomesToolbar", true))) {
            Desktop.show("hifi/dialogs/GeneralPreferencesDialog.qml", "GeneralPreferencesDialog");
        } else {
            tablet.pushOntoStack("hifi/tablet/TabletGeneralPreferences.qml");
        }
        break;
    case 'rezGlobe':
        rez360Globe();
        break;
    case 'rezStreetViewGlobe':
        rezStreetViewGlobe();
        break;
    case 'disableGrabHighlighting':
        Selection.disableListHighlight(DISPATCHER_HOVERING_LIST);
        break;
    case 'enableGrabHighlighting':
        Selection.enableListHighlight(DISPATCHER_HOVERING_LIST, DISPATCHER_HOVERING_STYLE);
        break;
    default:
        print('Unrecognized message from RPO360.qml:', JSON.stringify(message));
    }
}

// Function Name: shutdown()
//
// Description:
//   -shutdown() will be called when the script ends (i.e. is stopped).
function shutdown() {
    rpo360Off();
    Window.domainChanged.disconnect(onDomainChanged);
    Window.snapshot360Taken.disconnect(on360SnapshotTaken);
    Window.snapshotShared.disconnect(snapshotUploaded);
    ui.tablet.tabletShownChanged.disconnect(tabletVisibilityChanged);
}

// Function Name: onDomainChanged()
//
// Description:
//   -A small utility function used when the Window.domainChanged() signal is fired.
function onDomainChanged() {
    rpo360Off(true);
}

// These functions will be called when the script is loaded.
var SOUND_CAMERA_ON = SoundCache.getSound(Script.resolvePath("resources/sounds/cameraOn.wav"));
var SOUND_SNAPSHOT = SoundCache.getSound(Script.resolvePath("resources/sounds/snap.wav"));

function buttonActive(isActive) {
    ui.button.editProperties({isActive: isActive || camera});
}

function onOpened() {
    // In the case of a remote QML app, it takes a bit of time
    // for the event bridge to actually connect, so we have to wait...
    Script.setTimeout(function () {
        if (ui.isOpen) {
            ui.sendMessage({
                method: 'initializeUI',
                masterSwitchOn: !!camera,
                last360ThumbnailURL: last360ThumbnailURL || "",
                processing360Snapshot: processing360Snapshot
            });
        }
    }, 700);
}

function tabletVisibilityChanged() {
    if (!ui.tablet.tabletShown && ui.isOpen) {
        ui.close();
    }
}

// Function Name: startup()
var ui;
var RPO_360_QML_SOURCE = Script.resolvePath("RPO360.qml");
function startup() {
    ui = new AppUi({
        buttonName: "RPO360",
        home: RPO_360_QML_SOURCE,
        onMessage: fromQml,
        buttonActive: buttonActive,
        onOpened: onOpened,
        graphicsDirectory: Script.resolvePath("./resources/images/icons/")
    });

    Window.domainChanged.connect(onDomainChanged);
    Window.snapshot360Taken.connect(on360SnapshotTaken);
    Window.snapshotShared.connect(snapshotUploaded);
    ui.tablet.tabletShownChanged.connect(tabletVisibilityChanged);
    camera = false;
}

startup();
Script.scriptEnding.connect(shutdown);
}()); // END LOCAL_SCOPE
