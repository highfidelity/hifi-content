//
// sitClient.js
//
// Created by Robin Wilson 5/7/2019
// 
// Original sit script created by Clement Brisset on 3/3/17
// Previous script modified by Robin Wilson, Rebecca Stankus, and Alexia Mandeville June 2018
//
// Copyright 2019 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// Allows avatars to sit in High Fidelity after clicking on a local entity or on the chair. Works with sitServer.js.
//

/* global DriveKeys */

(function () {
    var DEBUG = true;
    // #region UTILITIES

    // Returns entity properties for an overlay in front of user's camera in desktop and VR
    function getEntityPropertiesForImageInFrontOfCamera(positionInFront, dimensions, url) {
        return {
            type: "Image",
            grab: { grabbable: false },
            dynamic: false,
            parentJointIndex: MyAvatar.getJointIndex("_CAMERA_MATRIX"),
            imageURL: url,
            position: Vec3.sum(Camera.position, Vec3.multiplyQbyV(Camera.orientation, positionInFront)),
            dimensions: dimensions,
            rotation: Camera.rotation,
            parentID: MyAvatar.sessionUUID,
            ignoreRayIntersection: false,
            visible: true,
            emissive: true,
            renderLayer: "front"
        };
    }

    // Checks for Avatar Spine Error in VR to avoid uncomfortable looking avatar position
    var NEG_ONE = -1;
    var HALF = 0.5;
    function setHeadToHipsDistance() {
        // get hips world pos while sitting
        if (MyAvatar.getJointIndex("Head") === NEG_ONE) {
            // this can probably be adjusted to be more accurate
            _this.headToHipsDistance = MyAvatar.getHeight() * HALF;
        } else {
            var headTranslation = MyAvatar.getAbsoluteDefaultJointTranslationInObjectFrame(MyAvatar.getJointIndex("Head"));
            var hipsTranslation = MyAvatar.getAbsoluteDefaultJointTranslationInObjectFrame(MyAvatar.getJointIndex("Hips"));
            _this.headToHipsDistance = Math.abs(headTranslation.y - hipsTranslation.y);
        }
    }


    // Calculates where the avatar's hips will seat 
    // Used to calculate pin hip position. Adds CHAIR_OFFSET_RATIO * chair's y dimension to the y center of the seat.
    // Avatar sit position y = CHAIR_OFFSET_RATIO * height of chair
    var CHAIR_OFFSET_RATIO = 0.1;
    function calculateSeatCenterPositionForPinningAvatarHips() {
        var properties = Entities.getEntityProperties(_this.entityID);

        var yOffset = properties.dimensions.y * CHAIR_OFFSET_RATIO;
        _this.seatCenterPosition = properties.position;
        _this.seatCenterPosition.y = properties.position.y + yOffset;
    }

    // #endregion UTILITIES

    // #region SIT DOWN / STAND UP SEQUENCE

    // 1st of sit down sequence
    // Called from entity server script to begin sitting down sequence
    var SETTING_KEY_AVATAR_SITTING = "Avatar/isSitting";
    var SIT_SETTLE_TIME_MS = 350; // Do not pop avatar out of chair immediately if there's an issue
    function checkBeforeSitDown() {
        if (DEBUG) {
            console.log("sitClient.js: checkBeforeSitDown() for seat ID: ", _this.entityID);
        }

        var currentSeatEntityID = Settings.getValue(SETTING_KEY_AVATAR_SITTING, false);
        if (currentSeatEntityID && currentSeatEntityID !== _this.entityID) {
            if (DEBUG) {
                console.log("sitClient.js: calling standUp with callback for seat ID: " + _this.entityID);
            }
            Entities.callEntityMethod(currentSeatEntityID, "standUp", [_this.entityID]);
        } else {
            startSitDown();
        }
    }

    function startSitDown() {
        if (DEBUG) {
            console.log("sitClient.js: startSitDown() for seat ID: ", _this.entityID);
        }

        Entities.callEntityServerMethod(
            _this.entityID,
            "removeThisSittableOverlayForEveryoneElse",
            AvatarList.getAvatarIdentifiers()
        );
        deleteClickToSitOverlay();

        if (HMD.active) {
            showVRPresitInstructions();
            Script.setTimeout(function () {
                prepareSitThenSit();
            }, PRESIT_FRAME_DURATION * _this.preSitLoadedImages.length);
        } else {
            prepareSitThenSit();
        }
    }

    // 3rd of sit down sequence (callback for inside 2nd)
    // Used before pinning hips, calculate the math required and lock the chair
    function prepareSitThenSit() {
        // Set the value of head to hips distance
        // If avatar deviates outside of the minimum and maximum, the avatar will pop out of the chair
        setHeadToHipsDistance();
        calculateSeatCenterPositionForPinningAvatarHips();

        // Lock chair and save old lock property
        _this.locked = Entities.getEntityProperties(_this.entityID, 'locked').locked;
        Entities.editEntity(_this.entityID, { locked: true });

        sitDownAndPinAvatar();
    }

    // Listen to action events. If jump is pressed, the user will stand up
    var JUMP_ACTION_ID = 50;
    function onActionEvent(actionID, value) {
        if (actionID === JUMP_ACTION_ID) {
            standUp();
        }
    }

    var UPDATE_INTERVAL_MS = 400;
    var isActionEventConnected = false;
    var isSittingInThisChair = false;
    function sitDownAndPinAvatar() {
        if (HMD.active) {
            deletePresit();
        }
        if (!isActionEventConnected) {
            Controller.actionEvent.connect(onActionEvent);
            isActionEventConnected = true;
        }

        var properties = Entities.getEntityProperties(_this.entityID);
        MyAvatar.beginSit(_this.seatCenterPosition, properties.rotation);
        
        _this.sitDownSettlePeriod = Date.now() + SIT_SETTLE_TIME_MS;
        stopUpdateInterval();
        _this.whileSittingUpdateIntervalID = Script.setInterval(_this.whileSittingUpdate, UPDATE_INTERVAL_MS);

        // Set sit value in Settings `Interface.json`
        Settings.setValue(SETTING_KEY_AVATAR_SITTING, _this.entityID);
        isSittingInThisChair = true;

        if (!_this.connectedStandUpSignals) {
            MyAvatar.scaleChanged.connect(_this.standUp);
            MyAvatar.onLoadComplete.connect(_this.standUp);
            location.hostChanged.connect(_this.standUp);
            Script.scriptEnding.connect(_this.standUp);
            MyAvatar.wentAway.connect(_this.standUp);
            HMD.displayModeChanged.connect(_this.standUp);
            _this.connectedStandUpSignals = true;
        }
    }

    // 5th of sit down sequence
    // Handles stand up conditions
    // Update interval while the avatar is sitting
    // Listens for drive keys held, spine error (in VR), and if avatar teleported away from chair
    var AVATAR_MOVED_TOO_FAR_DISTANCE_M = 0.5;
    var MAX_HEAD_DEVIATION_RATIO = 1.2;
    var MIN_HEAD_DEVIATION_RATIO = 0.8;
    var HEAD_DEVIATION_MAX_TIME_TO_STAND_MS = 1000;
    function whileSittingUpdate() {
        var now = Date.now();

        if (_this.sitDownSettlePeriod && now < _this.sitDownSettlePeriod) {
            // below considerations only apply if sit down settle period has passed
            return;
        } else {
            _this.sitDownSettlePeriod = false;
        }

        // AVATAR DISTANCE
        if (Vec3.distance(MyAvatar.position, _this.seatCenterPosition) > AVATAR_MOVED_TOO_FAR_DISTANCE_M) {
            _this.standUp();
            if (DEBUG) {
                console.log("sitClient.js: avatar distance caused standup");
            }
            return;
        }

        // AVATAR SPINE ERROR
        if (HMD.active) {
            // If head is more than certain distance from hips or less than certain distance, stand up
            var headPoseValue = Controller.getPoseValue(Controller.Standard.Head);
            var headWorldPosition = Vec3.sum(
                Vec3.multiplyQbyV(MyAvatar.orientation, headPoseValue.translation),
                MyAvatar.position
            );
            var headDeviation = Vec3.distance(headWorldPosition, _this.seatCenterPosition);
            var headDeviationRatio = headDeviation / _this.headToHipsDistance;

            if (headDeviationRatio < MIN_HEAD_DEVIATION_RATIO || headDeviationRatio > MAX_HEAD_DEVIATION_RATIO) {
                if (!_this.deviationTimeStart) {
                    _this.deviationTimeStart = now;
                }
                if (now - _this.deviationTimeStart > HEAD_DEVIATION_MAX_TIME_TO_STAND_MS) {
                    _this.deviationTimeStart = false;
                    _this.standUp();
                    if (DEBUG) {
                        console.log("sitClient.js: avatar spine error caused standup");
                    }
                }
            } else {
                _this.deviationTimeStart = false;
            }
        }
    }

    // Clear whileSitting update interval
    function stopUpdateInterval() {
        if (_this.whileSittingUpdateIntervalID) {
            Script.clearInterval(_this.whileSittingUpdateIntervalID);
            _this.whileSittingUpdateIntervalID = false;
        }
    }

    // Standup functionality
    var alreadyCalledStandUp = false;
    function standUp(id, args) {
        if (DEBUG) {
            console.log("sitClient.js: standup from seat ID: " + _this.entityID + "\nCall has args: " + (args && args[0]));
        }

        if (isSittingInThisChair) {
            if (DEBUG) {
                console.log("sitClient.js: we are indeed sitting in this chair.");
            }

            if (alreadyCalledStandUp) {
                if (DEBUG) {
                    console.log("sitClient.js: we already called standup for: " + _this.entityID + "; no action taken");
                }
                return;
            }

            alreadyCalledStandUp = true;
            
            stopUpdateInterval();
            _this.sitDownSettlePeriod = false;

            if (isActionEventConnected) {
                Controller.actionEvent.disconnect(onActionEvent);
                isActionEventConnected = false;
            }
            MyAvatar.endSit(MyAvatar.position, MyAvatar.orientation);
            
            Settings.setValue(SETTING_KEY_AVATAR_SITTING, null);
            isSittingInThisChair = false;

            // RESET SETTINGS FOR THIS CHAIR
            // Could have changed seats, keep avatar sitting if did not go through above procedure
            if (!_this.locked) {
                Entities.editEntity(_this.entityID, { locked: false });
            }

            Entities.callEntityServerMethod(_this.entityID, "onStandUp", AvatarList.getAvatarIdentifiers());
            createClickToSitOverlay();

            if (_this.connectedStandUpSignals) {
                MyAvatar.scaleChanged.disconnect(_this.standUp);
                MyAvatar.onLoadComplete.disconnect(_this.standUp);
                location.hostChanged.disconnect(_this.standUp);
                Script.scriptEnding.disconnect(_this.standUp);
                MyAvatar.wentAway.disconnect(_this.standUp);
                HMD.displayModeChanged.disconnect(_this.standUp);
                _this.connectedStandUpSignals = false;
            }

            alreadyCalledStandUp = false;
        }

        if (args) {
            if (DEBUG) {
                console.log("sitClient.js: standUp callback requested. starting sit down for: " + args[0]);
            }

            Entities.callEntityMethod(args[0], "startSitDown");
        }
    }

    // #region PRESIT - LOCAL ENTITY shown in HMD before sitting and after clicking sittable overlay
    // Has the sitting animation and "Please Face Forward"

    // Prefetch all presit overlay images into user's client
    var PRESIT_FRAME_DURATION = 160; // ms time duration for HMD presit overlay
    var PRESIT_URL_ROOT = Script.resolvePath("./resources/images/presit/sitConfirm");
    var PRESIT_URL_POSTFIX = ".png";
    var PRESIT_URL_NUM = 12;
    var PRESIT_URL_TEXT = Script.resolvePath("./resources/images/presit/pleaseFaceForward.png");
    function prefetchPresitImages() {
        var str;
        for (var i = 0; i < PRESIT_URL_NUM; i++) {
            str = i + 1;
            _this.preSitLoadedImages[i] = TextureCache.prefetch(Script.resolvePath(PRESIT_URL_ROOT + str + PRESIT_URL_POSTFIX));
        }
        _this.preSitTextLoadedImage = TextureCache.prefetch(PRESIT_URL_TEXT);
    }

    // Create the VR presit animation local entity in front of user's screen
    var SIT_ANIMATION_POSITION_IN_FRONT = { x: 0, y: 0.1, z: -1 };
    var SIT_ANIMATION_DIMENSIONS = { x: 0.2, y: 0.2 };
    var PLEASE_FACE_FORWARD_POSITION_IN_FRONT = { x: 0, y: -0.05, z: -1 };
    var PLEASE_FACE_FORWARD_DIMENSIONS = { x: 0.425, y: 0.425 };
    function showVRPresitInstructions() {
        var currentPresitAnimationFrame = 0;
        _this.presitAnimationImageID = Entities.addEntity(
            getEntityPropertiesForImageInFrontOfCamera(
                SIT_ANIMATION_POSITION_IN_FRONT,
                SIT_ANIMATION_DIMENSIONS,
                _this.preSitLoadedImages[currentPresitAnimationFrame].url
            ),
            "local"
        );

        _this.presitTextID = Entities.addEntity(
            getEntityPropertiesForImageInFrontOfCamera(
                PLEASE_FACE_FORWARD_POSITION_IN_FRONT,
                PLEASE_FACE_FORWARD_DIMENSIONS,
                _this.preSitTextLoadedImage.url
            ),
            "local"
        );

        // Flash through the presit animation images via overlay for a smooth avatar sitting animation
        _this.presitIntervalID = Script.setInterval(function () {
            if (_this.presitAnimationImageID) {
                currentPresitAnimationFrame = currentPresitAnimationFrame + 1;
                if (currentPresitAnimationFrame >= _this.preSitLoadedImages.length - 1) {
                    deletePresit();
                }
                Entities.editEntity(_this.presitAnimationImageID, { imageURL: 
                        _this.preSitLoadedImages[currentPresitAnimationFrame].url });
            }
        }, PRESIT_FRAME_DURATION);
    }

    // Delete presit local entity in user's screen
    function deletePresit() {
        if (_this.presitAnimationImageID) {
            Entities.deleteEntity(_this.presitAnimationImageID);
            _this.presitAnimationImageID = false;
        }
        if (_this.presitTextID) {
            Entities.deleteEntity(_this.presitTextID);
            _this.presitTextID = false;
        }
        if (_this.presitIntervalID) {
            Script.clearInterval(_this.presitIntervalID);
            _this.presitIntervalID = false;
        }
    }

    // #endregion PRESIT

    // #region SITTABLE LOCAL ENTITY

    // Create "Click to Sit" overlay on the chair
    var SITTABLE_START_ALPHA = 0.7;
    var SITTABLE_DIMENSIONS = { x: 0.3, y: 0.3 };
    var SITTABLE_IMAGE_URL_HMD = Script.resolvePath("./resources/images/triggerToSit.png");
    var SITTABLE_IMAGE_URL_DESKTOP = Script.resolvePath("./resources/images/clickToSit.png");
    var SITTABLE_Y_OFFSET = 0.01;
    function createClickToSitOverlay() {
        if (_this.clickToSitOverlay) {
            // already created
            return;
        }

        if (DEBUG) {
            console.log("sitClient.js: createClickToSitOverlay()");
        }
        var properties = Entities.getEntityProperties(_this.entityID);

        // calculate 
        var localOffset = { x: 0, y: SITTABLE_Y_OFFSET, z: 0 };
        var worldOffset = Vec3.multiplyQbyV(properties.rotation, localOffset);
        var sittablePosition = Vec3.sum(properties.position, worldOffset);

        _this.clickToSitOverlay = Entities.addEntity({
            type: "Image",
            name: "Click to Sit Local Entity",
            grab: {
                grabbable: false
            },
            dynamic: false,
            position: sittablePosition,
            rotation: Quat.multiply(
                properties.rotation,
                Quat.fromVec3Degrees({ x: -90, y: 180, z: 0 })
            ),
            parentID: _this.entityID,
            dimensions: SITTABLE_DIMENSIONS,
            imageURL: HMD.active ? SITTABLE_IMAGE_URL_HMD : SITTABLE_IMAGE_URL_DESKTOP,
            ignoreRayIntersection: false,
            alpha: SITTABLE_START_ALPHA,
            script: Script.resolvePath("./resources/sittableUIClient.js"),
            visible: true,
            emissive: true
        }, "local");
    }

    // Remove sittable local entity if it exists
    function deleteClickToSitOverlay() {
        if (DEBUG) {
            print("deleteClickToSitOverlay");
        }

        if (_this.clickToSitOverlay) {
            Entities.deleteEntity(_this.clickToSitOverlay);
            _this.clickToSitOverlay = false;
        }
    }
    // #endregion SITTABLE

    // #region ENTITY LIFETIME FUNCTIONS

    // Check userData for configurable settings
    // If userData is not configured with the right keys update with defaults
    var DEFAULT_SIT_USER_DATA_WITH_CUSTOM_SETTINGS = {
        canClickOnModelToSit: false
    };
    function updateUserData() {
        var userData = Entities.getEntityProperties(_this.entityID).userData;

        if (!userData || _this.userData.canClickOnModelToSit) {
            Entities.editEntity(_this.entityID, { userData: JSON.stringify(DEFAULT_SIT_USER_DATA_WITH_CUSTOM_SETTINGS) });
            _this.userData = DEFAULT_SIT_USER_DATA_WITH_CUSTOM_SETTINGS;
            return;
        }
        
        try {
            _this.userData = JSON.parse(userData);
        } catch (e) {
            console.log("sitClient.js: Issue parsing userData: " + e);
        }
    }

    // Preload entity method
    function preload(id) {
        _this.entityID = id;
        createClickToSitOverlay();
        prefetchPresitImages();
        updateUserData();
    }

    // Unload entity method
    function unload() {
        if (DEBUG) {
            console.log("sitClient.js: Unloading Sit client script...");
        }

        deleteClickToSitOverlay();
        deletePresit();
        standUp();

        if (_this.connectedStandUpSignals) {
            MyAvatar.scaleChanged.disconnect(_this.standUp);
            MyAvatar.onLoadComplete.disconnect(_this.standUp);
            location.hostChanged.disconnect(_this.standUp);
            Script.scriptEnding.disconnect(_this.standUp);
            MyAvatar.wentAway.disconnect(_this.standUp);
            HMD.displayModeChanged.disconnect(_this.standUp);
            _this.connectedStandUpSignals = false;
        }
    }


    // Called by server script in heartbeat to ensure avatar is still sitting in chair
    function heartbeatRequest() {
        Entities.callEntityServerMethod(_this.entityID, "heartbeatResponse");
    }

    
    // Can sit when clicking on chair when enabled via userData
    var MAX_SIT_DISTANCE_M = 5;
    EDIT_SETTING = "io.highfidelity.isEditing";
    function mousePressOnEntity(id, event) {
        if (event.isPrimaryButton && !Settings.getValue(EDIT_SETTING, false)) {
            updateUserData();
            if (_this.userData && _this.userData.canClickOnModelToSit &&
                Vec3.distance(MyAvatar.position, Entities.getEntityProperties(id, ["position"]).position) <= MAX_SIT_DISTANCE_M) {
                Entities.callEntityServerMethod(_this.entityID, "onMousePressOnEntity", [MyAvatar.sessionUUID]);
            }
        }
    }
    // #endregion ENTITY LIFETIME FUNCTIONS

    // Constructor
    var _this = null;
    function SitClient() {
        _this = this;
        this.sittableUIID = false;
        this.canSitZoneID = false;

        // for presit local entity and animation
        this.presitIntervalID = false;
        this.presitTextID = false;
        this.presitAnimationImageID = false;

        // for prefetch on presit
        this.preSitLoadedImages = [];
        this.preSitTextLoadedImage = null;

        this.locked = null;

        this.seatCenterPosition = null;
        this.headToHipsDistance = null;
        this.sitDownSettlePeriod = false;

        this.whileSittingUpdateIntervalID = false;

        this.standUpID = false;

        this.deviationTimeStart = false;
        this.zoneID = false;

        this.connectedStandUpSignals = false;

        // CUSTOMIZATIONS 
        this.userData = {};
        this.canClickOnModelToSit = false;
    }

    // Entity methods
    SitClient.prototype = {
        remotelyCallable: [
            "createClickToSitOverlay",
            "deleteClickToSitOverlay",
            "checkBeforeSitDown",
            "heartbeatRequest",
            "startSitDown"
        ],
        // Zone methods
        createClickToSitOverlay: createClickToSitOverlay,
        deleteClickToSitOverlay: deleteClickToSitOverlay,
        // Entity liftime methods
        preload: preload,
        unload: unload,
        // Sitting lifetime methods
        mousePressOnEntity: mousePressOnEntity,
        checkBeforeSitDown: checkBeforeSitDown,
        whileSittingUpdate: whileSittingUpdate,
        heartbeatRequest: heartbeatRequest,
        standUp: standUp,
        startSitDown: startSitDown
    };

    return new SitClient();
});