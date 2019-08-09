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
    var DEBUG = 0;
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
    var SETTING_KEY_AVATAR_SITTING = "com.highfidelity.avatar.isSitting";
    var SIT_SETTLE_TIME_MS = 350; // Do not pop avatar out of chair immediately if there's an issue
    var SIT_DELAY_MS = 50; // ms for timeouts in sit
    var CAN_SIT_M = 5; // zone radius
    var changedSeats = false;
    function startSitDown() {
        var sitEntity = Settings.getValue(SETTING_KEY_AVATAR_SITTING, false);
        if (sitEntity && sitEntity !== _this.entityID) {
            changedSeats = true;
        }
        
        if (DEBUG) {
            console.log("startSitDown in ", _this.entityID);
        }

        Entities.callEntityServerMethod(
            _this.entityID,
            "removeAllOtherSittableOverlays",
            AvatarList.getAvatarsInRange(_this.seatCenterPosition, CAN_SIT_M)
        );

        deleteSittableUI();

        // Set isSitting value in Settings
        var sitNewSettings = _this.entityID;
        Settings.setValue(SETTING_KEY_AVATAR_SITTING, sitNewSettings);

        if (HMD.active) {
            createPresit();
            Script.setTimeout(function () {
                beforeSitDown();
            }, PRESIT_FRAME_DURATION * _this.preSitLoadedImages.length);
        } else {
            beforeSitDown();
        }
    }

    // 3rd of sit down sequence (callback for inside 2nd)
    // Used before pinning hips, calculate the math required and lock the chair
    function beforeSitDown() {
        // Set the value of head to hips distance
        // If avatar deviates outside of the minimum and maximum, the avatar will pop out of the chair
        setHeadToHipsDistance();

        // Lock chair and save old setting
        _this.locked = Entities.getEntityProperties(_this.entityID, 'locked').locked;
        Entities.editEntity(_this.entityID, { locked: true });

        calculateSeatCenterPositionForPinningAvatarHips();
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
    var isConnected = false;
    function sitDownAndPinAvatar() {
        if (HMD.active) {
            deletePresit();
        }
        if (!isConnected) {
            Controller.actionEvent.connect(onActionEvent);
            isConnected = true;
        }
        Script.setTimeout(function () {            
            var properties = Entities.getEntityProperties(_this.entityID);
            MyAvatar.beginSit(_this.seatCenterPosition, properties.rotation);
            
            _this.sitDownSettlePeriod = Date.now() + SIT_SETTLE_TIME_MS;
            stopUpdateInterval();

            _this.whileSittingUpdateIntervalID = Script.setInterval(_this.whileSittingUpdate, UPDATE_INTERVAL_MS);

            deleteSittableUI();

            if (!_this.connectedSignals) {
                MyAvatar.scaleChanged.connect(_this.standUp);
                MyAvatar.onLoadComplete.connect(_this.standUp);
                location.hostChanged.connect(_this.standUp);
                Script.scriptEnding.connect(_this.standUp);
                MyAvatar.wentAway.connect(_this.standUpWrapper);
                HMD.displayModeChanged.connect(_this.standUpWrapper);
                _this.connectedSignals = true;
            }  
        }, SIT_DELAY_MS);
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
                console.log("avatar distance caused standup");
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
                        console.log("avatar spine error caused standup");
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

    // To help with the clashing HMD and My Avatar away signals.
    // A timeout here seems to be the only thing to prevent the default animation not being restored
    var standUpWrapperCalled = false;
    var STAND_UP_WRAPPER_WAIT_MS = 500;
    function standUpWrapper(){
        if (standUpWrapperCalled) {
            return;
        }
        standUpWrapperCalled = true;
        Script.setTimeout(function(){
            standUp();
        }, STAND_UP_WRAPPER_WAIT_MS);
    }

    // Standup functionality
    var STANDUP_BUMP = 0.225;
    var roles = [];
    function standUp() {
        
        if (DEBUG) {
            console.log("standup from ", _this.entityID);
        }
        if (standUpWrapperCalled) {
            standUpWrapperCalled = false;
        }

        // get the entityID, previous position and orientation 
        var settingsEntityID = Settings.getValue(SETTING_KEY_AVATAR_SITTING);
        changedSeats = false;
        // STANDING FROM THIS CHAIR
        // Make avatar stand up (if changed seat do not do this)
        if (settingsEntityID === _this.entityID) { // POSSIBLE RACE CONDITION WITH SETTINGS BEING CHANGED BY NEW SEAT
            Settings.setValue(SETTING_KEY_AVATAR_SITTING, null);
            standAvatarUp();
        }

        // RESET SETTINGS FOR THIS CHAIR
        // Could have changed seats, keep avatar sitting if did not go through above procedure
        if (!_this.locked) {
            Entities.editEntity(_this.entityID, { locked: false });
        }

        _this.driveKeyPressedStart = false;
        _this.sitDownSettlePeriod = false;

        Entities.callEntityServerMethod(_this.entityID, "onStandUp");

        Entities.callEntityServerMethod(
            _this.entityID,
            "addAllOtherSittableOverlays",
            AvatarList.getAvatarsInRange(_this.seatCenterPosition, CAN_SIT_M)
        );

        stopUpdateInterval();

        if (_this.connectedSignals) {
            MyAvatar.scaleChanged.disconnect(_this.standUp);
            MyAvatar.onLoadComplete.disconnect(_this.standUp);
            location.hostChanged.disconnect(_this.standUp);
            Script.scriptEnding.disconnect(_this.standUp);
            MyAvatar.wentAway.disconnect(_this.standUpWrapper);
            HMD.displayModeChanged.disconnect(_this.standUpWrapper);
            _this.connectedSignals = false;
        }
    }

    function standAvatarUp(){
        if (isConnected) {
            Controller.actionEvent.disconnect(onActionEvent);
            isConnected = false;
        }
        MyAvatar.endSit(MyAvatar.position, MyAvatar.orientation);
        createSittableUI();
    }
    // Remotely called from canSitZone
    var AVATAR_SITTING_IN_CHAIR_RANGE = 0.01;
    var EDIT_SETTING = "io.highfidelity.isEditing";
    function onEnterCanSitZone(id, params) {
        if (params && params.length > 0) {
            _this.zoneID = params[0];
        }

        if (!Settings.getValue(EDIT_SETTING, false)) {
            calculateSeatCenterPositionForPinningAvatarHips();
            var isSittingInChair = AvatarList.isAvatarInRange(_this.seatCenterPosition, AVATAR_SITTING_IN_CHAIR_RANGE);
            if (DEBUG) {
                console.log("onEnterCanSitZone" + !_this.sittableUIID + !isSittingInChair);
            }
            if (!_this.sittableUIID && !isSittingInChair) {
                createSittableUI();
            }
        } else {
            if (DEBUG) {
                console.log("entered zone and isInEditMode");
            }
            // is in edit mode do not create sittable
        }
    }

    // Remotely called by the canSitZone
    function onLeaveCanSitZone() {
        deleteSittableUI();
    }

    // #endregion SIT DOWN / STAND UP SEQUENCE


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
    function createPresit() {
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

    // Create sittable UI on the chair
    var SITTABLE_START_ALPHA = 0.7;
    var SITTABLE_DIMENSIONS = { x: 0.3, y: 0.3 };
    var SITTABLE_IMAGE_URL_HMD = Script.resolvePath("./resources/images/triggerToSit.png");
    var SITTABLE_IMAGE_URL_DESKTOP = Script.resolvePath("./resources/images/clickToSit.png");
    var SITTABLE_Y_OFFSET = 0.01;
    function createSittableUI() {
        if (_this.sittableID) {
            // already created
            return;
        }

        if (DEBUG) {
            console.log("createSittableUI()");
        }
        var properties = Entities.getEntityProperties(_this.entityID);

        // calculate 
        var localOffset = { x: 0, y: SITTABLE_Y_OFFSET, z: 0 };
        var worldOffset = Vec3.multiplyQbyV(properties.rotation, localOffset);
        var sittablePosition = Vec3.sum(properties.position, worldOffset);

        _this.sittableID = Entities.addEntity({
            type: "Image",
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
        },
        "local"
        );
    }

    // Remove sittable local entity if it exists
    function deleteSittableUI() {
        if (DEBUG) {
            print("deleteSittableUI");
        }

        if (_this.sittableID) {
            Entities.deleteEntity(_this.sittableID);
            _this.sittableID = false;
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
        var properties = Entities.getEntityProperties(_this.entityID);
        try {
            _this.userData = JSON.parse(properties.userData);
        } catch (e) {
            console.log("Issue parsing userData" + e);
        }

        if (!_this.userData || _this.userData.canClickOnModelToSit === undefined) {
            Entities.editEntity(_this.entityID, { userData: JSON.stringify(DEFAULT_SIT_USER_DATA_WITH_CUSTOM_SETTINGS) });
        }
    }

    // Preload entity method
    function preload(id) {
        _this.entityID = id;
        createSittableUI();
        prefetchPresitImages();
        updateUserData();
    }

    // Unload entity method
    function unload() {
        var sitCurrentSettings = Settings.getValue(SETTING_KEY_AVATAR_SITTING);
        deleteSittableUI();
        deletePresit();
        standUp();

        if (_this.connectedSignals) {
            MyAvatar.scaleChanged.disconnect(_this.standUp);
            MyAvatar.onLoadComplete.disconnect(_this.standUp);
            location.hostChanged.disconnect(_this.standUp);
            Script.scriptEnding.disconnect(_this.standUp);
            MyAvatar.wentAway.disconnect(_this.standUpWrapper);
            HMD.displayModeChanged.disconnect(_this.standUpWrapper);
            _this.connectedSignals = false;
        }
    }


    // Called by server script in heartbeat to ensure avatar is still sitting in chair
    function check() {
        Entities.callEntityServerMethod(_this.entityID, "checkResolved");
    }

    
    // Can sit when clicking on chair when enabled via userData
    function mousePressOnEntity(id, event) {
        if (event.isPrimaryButton && !Settings.getValue(EDIT_SETTING, false)) {
            updateUserData();
            if (_this.userData && _this.userData.canClickOnModelToSit) {
                Entities.callEntityServerMethod(_this.entityID, "onSitDown", [MyAvatar.sessionUUID]);
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

        this.driveKeyPressedStart = false;

        this.deviationTimeStart = false;
        this.zoneID = false;

        this.connectedSignals = false;

        // CUSTOMIZATIONS 
        this.userData = {};
        this.canClickOnModelToSit = false;
    }

    // Entity methods
    SitClient.prototype = {
        remotelyCallable: [
            "onEnterCanSitZone",
            "onLeaveCanSitZone",
            "startSitDown",
            "check"
        ],
        // Zone methods
        onEnterCanSitZone: onEnterCanSitZone,
        onLeaveCanSitZone: onLeaveCanSitZone,
        // Entity liftime methods
        preload: preload,
        unload: unload,
        // Sitting lifetime methods
        mousePressOnEntity: mousePressOnEntity,
        startSitDown: startSitDown,
        whileSittingUpdate: whileSittingUpdate,
        check: check,
        standUp: standUp,
        standUpWrapper: standUpWrapper
    };

    return new SitClient();
});