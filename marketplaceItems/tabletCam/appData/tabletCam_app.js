"use strict";
/*jslint vars:true, plusplus:true, forin:true*/
/*global Tablet, Script,  */
/* eslint indent: ["error", 4, { "outerIIFEBody": 1 }] */
//
// tabletCam_app.js
//
// Created by Zach Fox on 2019-04-14
//
// Distributed under the Apache License, Version 2.0
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function () { // BEGIN LOCAL_SCOPE
    var AppUi = Script.require('./modules/appUi.js');

    var secondaryCameraConfig = Render.getConfig("SecondaryCamera");
    var tabletCamAvatarEntity = false;
    var previousNearClipDistance = false;
    var previousFarClipDistance = false;
    var previousvFoV = false;
    var NEAR_CLIP_DISTANCE = 0.001;
    var FAR_CLIP_DISTANCE = 16384;
    var vFoV = Settings.getValue("tabletCam/vFoV", 60);
    var secondaryCameraResolutionWidth = 1000;
    var secondaryCameraResolutionHeight = secondaryCameraResolutionWidth / aspectRatio;

    var PREVIEW_SHORT_SIDE_RESOLUTION = 400;
    var secondaryCameraResolutionPreviewWidth = PREVIEW_SHORT_SIDE_RESOLUTION;
    var secondaryCameraResolutionPreviewHeight = PREVIEW_SHORT_SIDE_RESOLUTION / aspectRatio;

    var tabletCamRunning = false;

    var TABLET_CAM_ENTITY_PROPERTIES = {
        "type": "Model",
        // Digital camera by Nick Ladd: https://poly.google.com/view/4A3SYVh_smq
        "modelURL": Script.resolvePath("models/camera.fbx"),
        "shapeType": "simple-hull",
        "localSize": {
            "x": 0.02,
            "y": 0.02,
            "z": 0.02
        },
        "damping": 0,
        "angularDamping": 0,
        "shape": "Cube",
        "color": {
            "red": 0,
            "green": 0,
            "blue": 0
        },
        "queryAACube": {
            "x": -0.08660253882408142,
            "y": -0.08660253882408142,
            "z": -0.08660253882408142,
            "scale": 0.17320507764816284
        },
        "isVisibleInSecondaryCamera": false,
        "name": "Tablet Cam Camera Entity",
        "registrationPoint": {
            "x": 0.42,
            "y": 0.4,
            "z": 0
        }
    };

    function enableTabletCam() {
        if (!tabletCamRunning) {
            wireSignals(true);

            setTakePhotoControllerMappingStatus(true);
    
            secondaryCameraConfig.enableSecondaryCameraRenderConfigs(true);
            setSnapshotQuality(snapshotQuality);
            var props = TABLET_CAM_ENTITY_PROPERTIES;
            var dynamicProps = getDynamicTabletCamAvatarEntityProperties();
            for (var key in dynamicProps) {
                props[key] = dynamicProps[key];
            }
            tabletCamAvatarEntity = Entities.addEntity(props, "avatar");
            previousFarClipDistance = secondaryCameraConfig.farClipPlaneDistance;
            previousNearClipDistance = secondaryCameraConfig.nearClipPlaneDistance;
            previousvFoV = secondaryCameraConfig.vFoV;
            secondaryCameraConfig.nearClipPlaneDistance = NEAR_CLIP_DISTANCE;
            secondaryCameraConfig.farClipPlaneDistance = FAR_CLIP_DISTANCE;
            secondaryCameraConfig.vFoV = vFoV;
    
            secondaryCameraConfig.attachedEntityId = tabletCamAvatarEntity;
            tabletCamRunning = true;
        }

        updateTabletCamLocalEntity();

        // Remove the existing tabletCamAvatarEntity model from the domain if one exists.
        // It's easy for this to happen if the user crashes while the Tablet Cam is on.
        // We do this down here (after the new one is rezzed) so that we don't accidentally delete
        // the newly-rezzed model.
        var entityIDs = Entities.findEntitiesByName("Tablet Cam Camera Entity", MyAvatar.position, 100, false);
        entityIDs.forEach(function (currentEntityID) {
            var currentEntityOwner = Entities.getEntityProperties(currentEntityID, ['owningAvatarID']).owningAvatarID;
            if (currentEntityOwner === MyAvatar.sessionUUID && currentEntityID !== tabletCamAvatarEntity) {
                Entities.deleteEntity(currentEntityID);
            }
        });
    }

    var frontCamInUse = Settings.getValue("tabletCam/frontCamInUse", true);
    function switchCams(forceFrontCamValue) {
        if (!tabletCamAvatarEntity || (!!HMD.tabletID && !tabletCamLocalEntity)) {
            console.log("User tried to switch cams, but TabletCam wasn't ready!");
            return;
        }

        frontCamInUse = forceFrontCamValue || !frontCamInUse;
        Settings.setValue("tabletCam/frontCamInUse", frontCamInUse);

        var newTabletCamAvatarEntityProps = getDynamicTabletCamAvatarEntityProperties();
        Entities.editEntity(tabletCamAvatarEntity, newTabletCamAvatarEntityProps);

        updateTabletCamLocalEntity();
    }
    
    function disableTabletCam() {
        function deleteTabletCamAvatarEntity() {
            if (flash) {
                Entities.deleteEntity(flash);
                flash = false;
            }
            
            if (tabletCamAvatarEntity) {
                Entities.deleteEntity(tabletCamAvatarEntity);
                tabletCamAvatarEntity = false;
            }
        }

        wireSignals(false);

        setTakePhotoControllerMappingStatus(false);

        if (tabletCamRunning) {
            secondaryCameraConfig.farClipPlaneDistance = previousFarClipDistance;
            secondaryCameraConfig.nearClipPlaneDistance = previousNearClipDistance;
            secondaryCameraConfig.vFoV = previousvFoV;
            secondaryCameraConfig.attachedEntityId = false;
            secondaryCameraConfig.enableSecondaryCameraRenderConfigs(false);
        }

        deleteTabletCamAvatarEntity();

        if (tabletCamLocalEntity) {
            Entities.deleteEntity(tabletCamLocalEntity);
            tabletCamLocalEntity = false;
        }

        tabletCamRunning = false;
    }

    var tabletCamLocalEntityWidth = 0.282;
    var tabletCamLocalEntityHeight = 0.282;
    var tabletCamLocalEntityDim = { x: tabletCamLocalEntityWidth, y: tabletCamLocalEntityHeight };
    var tabletCamLocalEntity = false;
    var LOCAL_ENTITY_STATIC_PROPERTIES = {
        type: "Image",
        imageURL: "resource://spectatorCameraFrame",
        emissive: true,
        grab: {
            "grabbable": false
        },
        alpha: 1,
        triggerable: false
    };
    function updateTabletCamLocalEntity() {
        if (!HMD.tabletID) {
            return;
        }

        if (tabletCamLocalEntity) {
            Entities.deleteEntity(tabletCamLocalEntity);
            tabletCamLocalEntity = false;
        }
        var props = LOCAL_ENTITY_STATIC_PROPERTIES;
        props.dimensions = tabletCamLocalEntityDim;
        if (!!HMD.tabletID) {
            props.parentID = HMD.tabletID;
            props.localPosition = [0, 0.0225, -0.008];
            if (frontCamInUse) {
                props.localRotation = Quat.fromVec3Degrees([0, 180, 180]);
            } else {
                props.localRotation = Quat.fromVec3Degrees([0, 0, 180]);
            }
        } else {
            props.parentID = Uuid.NULL;
            props.localPosition = inFrontOf(0.5);
            props.localRotation = MyAvatar.orientation;
        }

        tabletCamLocalEntity = Entities.addEntity(props, "local");
    }

    function onDomainChanged() {
        if (tabletCamRunning) {
            disableTabletCam();
        }
    }

    function tabletVisibilityChanged() {
        if (!ui.tablet.tabletShown && ui.isOpen) {
            ui.close();
        }
    }

    var flash = Settings.getValue("tabletCam/flashEnabled", false);;
    function setFlashStatus(enabled) {
        if (!tabletCamAvatarEntity) {
            return;
        }
        
        Settings.setValue("tabletCam/flashEnabled", enabled);

        var cameraPosition = Entities.getEntityProperties(tabletCamAvatarEntity, ["positon"]).position;
        if (enabled) {
            Audio.playSound(SOUND_FLASH_ON, {
                position: cameraPosition,
                localOnly: true,
                volume: 0.8
            });
            flash = Entities.addEntity({
                "collisionless": true,
                "collidesWith": "",
                "collisionMask": 0,
                "color": {
                    "blue": 173,
                    "green": 252,
                    "red": 255
                },
                "cutoff": 90,
                "dimensions": {
                    "x": 4,
                    "y": 4,
                    "z": 4
                },
                "dynamic": false,
                "falloffRadius": 0.20000000298023224,
                "intensity": 27,
                "isSpotlight": true,
                "localRotation": { w: 1, x: 0, y: 0, z: 0 },
                "localPosition": { x: 0, y: 0, z: -0.005 },
                "name": "Tablet Camera Flash",
                "type": "Light",
                "parentID": tabletCamAvatarEntity,
            }, "avatar");
        } else {
            if (flash) {
                Audio.playSound(SOUND_FLASH_OFF, {
                    position: cameraPosition,
                    localOnly: true,
                    volume: 0.8
                });
                Entities.deleteEntity(flash);
                flash = false;
            }
        }
    }

    function takePhoto() {
        var tabletCamAvatarEntityPosition = Entities.getEntityProperties(tabletCamAvatarEntity, ["position"]).position;
        Audio.playSound(SOUND_SNAPSHOT, {
            position: { x: tabletCamAvatarEntityPosition.x, y: tabletCamAvatarEntityPosition.y, z: tabletCamAvatarEntityPosition.z },
            localOnly: true,
            volume: 0.2
        });
        Window.takeSecondaryCameraSnapshot();
    }

    function maybeTakePhoto() {
        if (tabletCamAvatarEntity) {
            secondaryCameraConfig.resetSizeSpectatorCamera(secondaryCameraResolutionWidth, secondaryCameraResolutionHeight);
            // Wait a moment before taking the photo for the resolution to update
            Script.setTimeout(function () {
                takePhoto();
            }, 250);
        }
    }

    var snapshotQuality = Settings.getValue("tabletCam/quality", "normal");
    function setSnapshotQuality(quality) {
        snapshotQuality = quality;
        Settings.setValue("tabletCam/quality", snapshotQuality);

        var shortSideTargetResolution = 1000;
        if (snapshotQuality === "low") {
            shortSideTargetResolution = 500;
        } else if (snapshotQuality === "normal") {
            shortSideTargetResolution = 1000;
        } else if (snapshotQuality === "high") {
            shortSideTargetResolution = 2160;
        } else if (snapshotQuality === "extreme") {
            shortSideTargetResolution = 4320;
        }

        if (tallOrientation && !HMD.active) {
            secondaryCameraResolutionWidth = shortSideTargetResolution;
            secondaryCameraResolutionHeight = secondaryCameraResolutionWidth / aspectRatio;

            secondaryCameraResolutionPreviewWidth = PREVIEW_SHORT_SIDE_RESOLUTION;
            secondaryCameraResolutionPreviewHeight = secondaryCameraResolutionPreviewWidth / aspectRatio;
        } else {
            secondaryCameraResolutionHeight = shortSideTargetResolution;
            secondaryCameraResolutionWidth = secondaryCameraResolutionHeight / aspectRatio;

            secondaryCameraResolutionPreviewHeight = PREVIEW_SHORT_SIDE_RESOLUTION;
            secondaryCameraResolutionPreviewWidth = secondaryCameraResolutionPreviewHeight / aspectRatio;
        }

        secondaryCameraConfig.resetSizeSpectatorCamera(secondaryCameraResolutionPreviewWidth, secondaryCameraResolutionPreviewHeight);
    }

    var aspectRatio = parseFloat(Settings.getValue("tabletCam/aspectRatio", "0.8"));
    function setAspectRatio(ratio) {
        aspectRatio = ratio;
        Settings.setValue("tabletCam/aspectRatio", aspectRatio);

        setSnapshotQuality(snapshotQuality);
    }

    var tallOrientation = Settings.getValue("tabletCam/tallOrientation", true);
    function setOrientation(orientation) {
        tallOrientation = orientation;
        Settings.setValue("tabletCam/tallOrientation", tallOrientation);

        setSnapshotQuality(snapshotQuality);
    }

    function photoDirChanged(snapshotPath) {
        Window.browseDirChanged.disconnect(photoDirChanged);
        if (snapshotPath !== "") { // not cancelled
            Snapshot.setSnapshotsLocation(snapshotPath);
            ui.sendMessage({
                method: "photoDirectoryChanged",
                photoDirectory: snapshotPath
            });
        }
    }

    function fromQml(message) {
        switch (message.method) {
        case 'switchCams':
            switchCams(message.frontCamInUse);
            break;
        case 'switchOrientation':
            setOrientation(!tallOrientation);
            break;
        case 'setFlashStatus':
            setFlashStatus(message.enabled);
            break;
        case 'takePhoto':
            maybeTakePhoto();
            break;
        case 'updateCameravFoV':
            vFoV = message.vFoV;
            secondaryCameraConfig.vFoV = vFoV;
            Settings.setValue("tabletCam/vFoV", vFoV);
            break;
        case 'setSnapshotQuality':
            setSnapshotQuality(message.quality);
            break;
        case 'setAspectRatio':
            setAspectRatio(message.aspectRatio);
            break;
        case 'activeViewChanged':
            if (message.activeView === "settingsView" || message.activeView === "reviewView") {
                disableTabletCam();
            } else {
                enableTabletCam();
            }
            break;
        case 'setPhotoDirectory':
            Window.browseDirChanged.connect(photoDirChanged);
            Window.browseDirAsync("Choose Photo Directory", "", "");
            break;
        case 'setDetached':
            detached = message.detached;
            Settings.setValue("tabletCam/detached", detached);
            var newTabletCamAvatarEntityProps = getDynamicTabletCamAvatarEntityProperties();
            Entities.editEntity(tabletCamAvatarEntity, newTabletCamAvatarEntityProps);
            break;
        default:
            print('Unrecognized message from TabletCam.qml.');
        }
    }

    function setTakePhotoControllerMappingStatus(status) {
        if (!takePhotoControllerMapping) {
            return;
        }
        if (status) {
            takePhotoControllerMapping.enable();
        } else {
            takePhotoControllerMapping.disable();
        }
    }

    var takePhotoControllerMapping;
    var takePhotoControllerMappingName = 'Hifi-TabletCam-Mapping-TakePhoto';
    function registerTakePhotoControllerMapping() {
        takePhotoControllerMapping = Controller.newMapping(takePhotoControllerMappingName);
        if (controllerType === "OculusTouch") {
            takePhotoControllerMapping.from(Controller.Standard.RS).to(function (value) {
                if (value === 1.0) {
                    maybeTakePhoto();
                }
                return;
            });
        } else if (controllerType === "Vive") {
            takePhotoControllerMapping.from(Controller.Standard.RightPrimaryThumb).to(function (value) {
                if (value === 1.0) {
                    maybeTakePhoto();
                }
                return;
            });
        }
    }

    var controllerType = "Other";
    function registerButtonMappings() {
        var VRDevices = Controller.getDeviceNames().toString();
        if (VRDevices) {
            if (VRDevices.indexOf("Vive") !== -1) {
                controllerType = "Vive";
            } else if (VRDevices.indexOf("OculusTouch") !== -1) {
                controllerType = "OculusTouch";
            } else {
                return; // Neither Vive nor Touch detected
            }
        }

        if (!takePhotoControllerMapping) {
            registerTakePhotoControllerMapping();
        }
    }

    function onHMDChanged(isHMDMode) {
        registerButtonMappings();
        disableTabletCam();
    }

    var cameraRollPaths = JSON.parse(Settings.getValue("tabletCam/cameraRollPaths", '{"paths": []}'));
    function onStillSnapshotTaken(path) {
        var tempObject = {};
        tempObject.imagePath = "file:///" + path;

        cameraRollPaths.paths.unshift(tempObject);
        if (cameraRollPaths.paths.length > 15) {
            cameraRollPaths.paths.pop();
        }
        Settings.setValue("tabletCam/cameraRollPaths", JSON.stringify(cameraRollPaths));

        secondaryCameraConfig.resetSizeSpectatorCamera(secondaryCameraResolutionPreviewWidth, secondaryCameraResolutionPreviewHeight);
        ui.sendMessage({
            method: 'stillSnapshotTaken',
            lastStillSnapshotPath: tempObject.imagePath
        });
    }

    var signalsWired = false;
    function wireSignals(shouldWire) {
        if (signalsWired === shouldWire) {
            return;
        }

        signalsWired = shouldWire;

        if (shouldWire) {
            Window.stillSnapshotTaken.connect(onStillSnapshotTaken);
        } else {
            Window.stillSnapshotTaken.disconnect(onStillSnapshotTaken);
        }
    }
    
    function inFrontOf(distance, position, orientation) {
        return Vec3.sum(position || MyAvatar.position,
                        Vec3.multiply(distance, Quat.getForward(orientation || MyAvatar.orientation)));
    }

    var detached = false;
    Settings.setValue("tabletCam/detached", detached);
    function getDynamicTabletCamAvatarEntityProperties() {
        var dynamicProps = {
            dimensions: [0.2, 0.2, 0.2]
        };

        if (detached) {
            dynamicProps.collisionless = false;
            dynamicProps.ignoreForCollisions = false;
            dynamicProps.grab = {
                "grabbable": true,
                "equippableLeftRotation": {
                    "x": -0.0000152587890625,
                    "y": -0.0000152587890625,
                    "z": -0.0000152587890625,
                    "w": 1
                },
                "equippableRightRotation": {
                    "x": -0.0000152587890625,
                    "y": -0.0000152587890625,
                    "z": -0.0000152587890625,
                    "w": 1
                }
            };
            dynamicProps.visible = true;
            dynamicProps.parentID = Uuid.NULL;
            dynamicProps.parentJointIndex = 65535;
            dynamicProps.triggerable = true;
            if (tabletCamAvatarEntity) {
                var currentProps = Entities.getEntityProperties(tabletCamAvatarEntity, ["position", "rotation"]);
                if (!!HMD.tabletID) {
                    dynamicProps.position = inFrontOf(0.2, currentProps.position, currentProps.rotation);
                } else {
                    dynamicProps.position = currentProps.position;
                }
                dynamicProps.rotation = currentProps.rotation;
            } else {
                dynamicProps.position = inFrontOf(0.5);
                dynamicProps.rotation = MyAvatar.orientation;
            }
            dynamicProps.velocity = [0, 0, 0];
            dynamicProps.angularVelocity = [0, 0, 0];
        } else {
            dynamicProps.triggerable = false;
            dynamicProps.collisionless = true;
            dynamicProps.ignoreForCollisions = true;
            dynamicProps.grab = {
                "grabbable": false
            };
            dynamicProps.visible = false;

            if (!!HMD.tabletID) {
                dynamicProps.parentID = HMD.tabletID;
                dynamicProps.parentJointIndex = 65535;
                dynamicProps.dimensions = [0.01, 0.01, 0.01];
            } else {
                var cameraMode = Camera.mode;
                // If:
                // - User is in third person mode
                // - User is using the rear-facing camera
                if (cameraMode !== "first person" && !frontCamInUse) {
                    dynamicProps.parentID = MyAvatar.sessionUUID;
                    dynamicProps.parentJointIndex = MyAvatar.getJointIndex("_CAMERA_MATRIX");
                } else {
                    dynamicProps.parentID = MyAvatar.sessionUUID;
                    var jointIndex = MyAvatar.getJointIndex("HeadTop_End");
                    if (jointIndex === -1) {
                        jointIndex = MyAvatar.getJointIndex("Head");
                    }
                    dynamicProps.parentJointIndex = jointIndex;
                }
            }
    
            dynamicProps.localPosition = {
                "x": 0,
                "y": !!HMD.tabletID ? 0.215 : (frontCamInUse ? -0.03 : (Camera.mode !== "first person" ? 0 : -0.02)),
                "z": !!HMD.tabletID ? (frontCamInUse ? -0.02 : 0.1) : (frontCamInUse ? 1 : (Camera.mode !== "first person" ? 0 : 0.05))
            },
            dynamicProps.localRotation = {
                "x": 0,
                "y": frontCamInUse || (!frontCamInUse && Camera.mode !== "first person") ? 0 : 1,
                "z": 0,
                "w": frontCamInUse || (!frontCamInUse && Camera.mode !== "first person") ? 1 : 0
            }
        }

        return dynamicProps;
    }

    function onModeUpdated(newMode) {
        if (tabletCamAvatarEntity) {
            var newTabletCamAvatarEntityProps = getDynamicTabletCamAvatarEntityProperties();
            Entities.editEntity(tabletCamAvatarEntity, newTabletCamAvatarEntityProps);
        }
    }

    function onClosed() {
        if (!detached) {
            disableTabletCam();
        }

        if (tabletCamLocalEntity) {
            Entities.deleteEntity(tabletCamLocalEntity);
            tabletCamLocalEntity = false;
        }
    }

    function buttonActive(isActive) {
        ui.button.editProperties({isActive: isActive || tabletCamRunning});
    }

    var ui;
    function startup() {
        ui = new AppUi({
            buttonName: "CAMERA",
            home: Script.resolvePath("./ui/TabletCam.qml"),
            // Selfie by Path Lord from the Noun Project
            graphicsDirectory: Script.resolvePath("appIcons/"),
            onOpened: enableTabletCam,
            onClosed: onClosed,
            onMessage: fromQml,
            buttonActive: buttonActive
        });
        
        Window.domainChanged.connect(onDomainChanged);
        ui.tablet.tabletShownChanged.connect(tabletVisibilityChanged);
        HMD.displayModeChanged.connect(onHMDChanged);
        Camera.modeUpdated.connect(onModeUpdated);

        registerButtonMappings();
    }
    startup();
    
    function shutdown() {
        disableTabletCam();
        Window.domainChanged.disconnect(onDomainChanged);
        ui.tablet.tabletShownChanged.disconnect(tabletVisibilityChanged);
        HMD.displayModeChanged.disconnect(onHMDChanged);
        Camera.modeUpdated.disconnect(onModeUpdated);
        if (takePhotoControllerMapping) {
            takePhotoControllerMapping.disable();
        }
        wireSignals(false);
    }
    Script.scriptEnding.connect(shutdown);
    
    // "Camera Shutter, Fast, A.wav" by InspectorJ (www.jshaw.co.uk) of Freesound.org
    var SOUND_SNAPSHOT = SoundCache.getSound(Script.resolvePath("sounds/snap.wav"));
    var SOUND_FLASH_ON = SoundCache.getSound(Script.resolvePath("sounds/flashOn.wav"));
    var SOUND_FLASH_OFF = SoundCache.getSound(Script.resolvePath("sounds/flashOff.wav"));
}()); // END LOCAL_SCOPE
