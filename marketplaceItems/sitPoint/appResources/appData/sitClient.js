//
// sitClient.js
//
// Updated by Robin Wilson 1/17/2019
// Modified by Robin Wilson, Rebecca Stankus, and Alexia Mandeville June 2018
// Originally created by Clement Brisset on 3/3/17
//
// Copyright 2019 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// Allows avatars to sit in High Fidelity after clicking on an overlay. Works with sitServer.js.
//
// Configurable variables are:
// - SHOW_PRESIT_IMAGE_IN_HMD
// - CHAIR_OFFSET_RATIO
// 

/* globals Entities, Script, AnimationCache, Settings, MyAvatar, DriveKeys, AvatarList,
 Vec3, HMD, Overlays, Camera, isInEditMode */

(function () {

    // #region CONFIGURABLE VARIABLES

    // true - shows "Face Forward Overlay" before sit; false - sits immediately with no overlay
    var SHOW_PRESIT_IMAGE_IN_HMD = true;

    // Used to calculate pin hip position. Adds CHAIR_OFFSET_RATIO * chair's y dimension to the y center of the seat.
    // Avatar sit position y = CHAIR_OFFSET_RATIO * height of chair
    var CHAIR_OFFSET_RATIO = 0.1;

    // Debug statements
    var SITTING_DEBUG = false; // turn on sitting debug print statements
    var UI_DEBUG = false; // turn on overlay debug print statements

    // #endregion CONFIGURABLE VARIABLES

    // #region DEPENDENCIES

    Script.include("/~/system/libraries/utils.js");

    // #endregion DEPENDENCIES

    // #region SITTABLE - Local entity image on chair "Click to Sit" or "Trigger to Sit"

    // Create sittable local entity
    var SITTABLE_FADE_MS = 50; // "Click/Trigger to Sit" local entity image fade after 50 ms
    var SITTABLE_DISTANCE_SHOW_M = 3; // m 
    var SITTABLE_DISTANCE_MAX_M = 5; // m
    var SITTABLE_START_ALPHA = 0.7;
    var SITTABLE_MIN_END_ALPHA = 0.075; // fades to this alpha value
    var SITTABLE_IMAGE_URL_HMD = Script.resolvePath("./resources/images/triggerToSit.png");
    var SITTABLE_IMAGE_URL_DESKTOP = Script.resolvePath("./resources/images/clickToSit.png");
    var sittableID = null;
    var intervalSittableTransparency = null;
    var sittable_y_offset = 0.01; // default 0.01
    function sittableCreate() {
        if (UI_DEBUG) {
            print("SittableCreate");
        }

        setChairProperties();

        // change the image based on what modality the user is in
        var url = HMD.active
            ? SITTABLE_IMAGE_URL_HMD
            : SITTABLE_IMAGE_URL_DESKTOP;

        var localOffset = {
            x: 0,
            y: sittable_y_offset,
            z: 0
        };
        var worldOffset = Vec3.multiplyQbyV(chairProperties.rotation, localOffset);
        var sittablePosition = Vec3.sum(chairProperties.position, worldOffset);

        sittableID = Entities.addEntity({
            type: "Image",
            grab: {
                grabbable: false,
            },
            dynamic: false,
            position: sittablePosition,
            rotation: Quat.multiply(chairProperties.rotation, Quat.fromVec3Degrees({ x: -90, y: 180, z: 0 })),
            dimensions: {
                x: 0.3,
                y: 0.3
            },
            imageURL: url,
            ignoreRayIntersection: false,
            alpha: SITTABLE_START_ALPHA,
            visible: true,
            emissive: true
        },
            "local"
        );

        HMD.displayModeChanged.connect(sittableSwitchHMDToDesktopText);
        sittableLerpTransparency();
    }

    // Fade's the sittable local entity over time
    function sittableLerpTransparency() {
        if (UI_DEBUG) {
            print("sittableLerpTransparency");
        }

        var startAlpha = SITTABLE_START_ALPHA;
        var changeAlpha = 0.01;

        // Update the alpha value on the sittable overlay
        intervalSittableTransparency = Script.setInterval(function () {
            startAlpha = startAlpha - changeAlpha;
            Entities.editEntity(sittableID, { alpha: startAlpha });

            if (startAlpha <= SITTABLE_MIN_END_ALPHA) {
                // Stop fading and keep overlay at the minimum alpha
                Script.clearInterval(intervalSittableTransparency);
                intervalSittableTransparency = null;
            }
        }, SITTABLE_FADE_MS);
    }

    // Switch sittable local entity text from desktop mode "Click to Sit" to HMD mode "Trigger to Sit"
    function sittableSwitchHMDToDesktopText() {
        if (sittableID) {
            var url = HMD.active
                ? SITTABLE_IMAGE_URL_HMD
                : SITTABLE_IMAGE_URL_DESKTOP;
            Entities.editEntity(sittableID, { imageURL: url });
        }
    }

    // Remove sittable local entity if it exists
    function sittableRemove() {
        if (UI_DEBUG) {
            print("sittableRemove");
        }

        if (sittableID) {
            Entities.deleteEntity(sittableID);
            sittableID = null;

            if (intervalSittableTransparency) {
                Script.clearInterval(intervalSittableTransparency);
                intervalSittableTransparency = null;
            }
            HMD.displayModeChanged.disconnect(sittableSwitchHMDToDesktopText);
        }
    }

    // Is avatar in range with available seat?
    // Return boolean to whether sittable local entity should be shown
    function shouldShowSittable() {
        var seatPosition = chairProperties.position;
        var distanceFromSeat = Vec3.distance(MyAvatar.position, seatPosition);

        return (distanceFromSeat < SITTABLE_DISTANCE_SHOW_M && !isAvatarSittingInSeat() && !overlayPreSit);
    }

    // #endregion SITTABLE LOCAL ENTITY


    // #region PRESIT OVERLAY - Overlay shown in HMD before sitting and after clicking sittable overlay
    // Has the sitting animation and "Please Face Forward"

    var OVERLAY_PRESIT_FRAME_DURATION = 160; // ms time duration for HMD presit overlay
    var OVERLAY_PRESIT_URL_ROOT = "./resources/images/presit/sitConfirm";
    var OVERLAY_PRESIT_URL_POSTFIX = ".png";
    var OVERLAY_PRESIT_URL_NUM = 12;
    var OVERLAY_PRESIT_URL_TEXT = Script.resolvePath("./resources/images/presit/pleaseFaceForward.png");
    var overlayPreSit = null;
    var overlayPreSitText = null;
    var overlayPreSitLoaded = [];
    var overlayPreSitTextLoaded = null;
    var intervalUpdatePreSitImage = null;
    var preSitLoadIndex = 0;
    // Prefetch all presit overlay images into user's client
    function prefetchPresitOverlayImages() {
        var str;
        for (var i = 0; i < OVERLAY_PRESIT_URL_NUM; i++) {
            str = i + 1;
            overlayPreSitLoaded[i] =
                TextureCache.prefetch(Script.resolvePath(OVERLAY_PRESIT_URL_ROOT + str + OVERLAY_PRESIT_URL_POSTFIX));
        }
        overlayPreSitTextLoaded = TextureCache.prefetch(OVERLAY_PRESIT_URL_TEXT);
    }

    function preSitCreate() {
        if (overlayPreSit) {
            return;
        }

        overlayPreSit = Overlays.addOverlay(
            "image3d",
            getInFrontOverlayProperties(
                { x: 0, y: 0.1, z: -1 },
                { x: 0.2, y: 0.2 },
                overlayPreSitLoaded[preSitLoadIndex].url
            )
        );

        overlayPreSitText = Overlays.addOverlay(
            "image3d",
            getInFrontOverlayProperties(
                { x: 0, y: -0.05, z: -1 },
                { x: 0.425, y: 0.425 },
                overlayPreSitTextLoaded.url
            )
        );

        // Flash through the presit animation images via overlay for a smooth avatar sitting animation
        intervalUpdatePreSitImage = Script.setInterval(function () {
            if (overlayPreSit) {
                if (preSitLoadIndex >= overlayPreSitLoaded.length) {
                    preSitEndUpdateInterval();
                }

                preSitLoadIndex = preSitLoadIndex + 1;
                Overlays.editOverlay(overlayPreSit, { url: overlayPreSitLoaded[preSitLoadIndex].url });
            }
        }, OVERLAY_PRESIT_FRAME_DURATION);
    }

    function preSitEndUpdateInterval() {
        if (intervalUpdatePreSitImage) {
            Script.clearInterval(intervalUpdatePreSitImage);
            intervalUpdatePreSitImage = null;
        }
    }

    function preSitRemove() {
        if (overlayPreSit) {
            preSitEndUpdateInterval();

            Overlays.deleteOverlay(overlayPreSit);
            overlayPreSit = null;
            preSitLoadIndex = 0;

            if (overlayPreSitText !== null) {
                Overlays.deleteOverlay(overlayPreSitText);
            }
        }
    }


    // #endregion PRESIT OVERLAY

    // #region STAND UP OVERLAY - Overlay shown when holding a drive key after sitting

    var OVERLAY_URL_STANDUP = Script.resolvePath("./resources/images/holdToStandUp.png");
    var overlayStandUp = null;
    function standUpCreate() {
        if (!overlayStandUp) {
            overlayStandUp = Overlays.addOverlay(
                "image3d",
                getInFrontOverlayProperties(
                    { x: 0, y: 0, z: -1 },
                    { x: 0.2, y: 0.2 },
                    OVERLAY_URL_STANDUP
                )
            );
        }
    }

    function standUpRemove() {
        if (overlayStandUp) {
            Overlays.deleteOverlay(overlayStandUp);
            overlayStandUp = null;
        }
    }

    // #endregion STAND UP OVERLAY

    // #region CREATE MODE OVERLAY

    // alpha value change during edit mode
    var MINIMUM_ALPHA = 0.3; // 50% alpha value
    var OVERLAY_ALPHA = 0.1; // 10% alpha value for createModeOverlay
    var CREATE_OVERLAY_DIMENSIONS_OFFSET = 0.02; // add 0.02 m to the sides of the cube to avoid z fighting

    var checkAlpha = false; // false if chair alpha is > MINIMUM_ALPHA, true if chair alpha is < MINIMUM_ALPHA
    var createModeOverlay = null; // overlay id for create mode overlay

    // Creates an overlay if the user is in create mode
    // Enabled only if the chair alpha value is <= MINIMUM_ALPHA
    function checkOrCreateCreateModeOverlay() {
        if (!checkAlpha) {
            return;
        }

        // check Alpha is enabled
        if (checkAlpha) {

            // is in Edit mode && alpha value has not changed
            if (isInEditMode() && !createModeOverlay) {

                setChairProperties();

                var position = chairProperties.position;
                var registrationPoint = chairProperties.registrationPoint;
                var dimensions = chairProperties.dimensions;
                var rotation = chairProperties.rotation;

                // Local position relative to cube
                // And adjust for registrationPoint to match the cube exactly
                var localOffset = {
                    x: NEG_ONE * (registrationPoint.x - HALF) * dimensions.x,
                    y: NEG_ONE * (registrationPoint.y - HALF) * dimensions.y,
                    z: NEG_ONE * (registrationPoint.z - HALF) * dimensions.z
                };

                var worldOffset = Vec3.multiplyQbyV(rotation, localOffset);
                var worldPosition = Vec3.sum(position, worldOffset);

                // Create visible cube
                createModeOverlay = Overlays.addOverlay("cube", {
                    position: {
                        x: worldPosition.x,
                        y: worldPosition.y,
                        z: worldPosition.z
                    },
                    rotation: rotation,
                    dimensions: {
                        x: dimensions.x + CREATE_OVERLAY_DIMENSIONS_OFFSET,
                        y: dimensions.y - CREATE_OVERLAY_DIMENSIONS_OFFSET * HALF, // Able to select from top in HMD create mode
                        z: dimensions.z + CREATE_OVERLAY_DIMENSIONS_OFFSET
                    },
                    solid: true,
                    alpha: OVERLAY_ALPHA,
                    parentID: entityID
                });

            }

            // Is in Edit mode && alpha value has changed
            if (!isInEditMode() && createModeOverlay) {
                // Set alpha back to 0
                if (createModeOverlay) {
                    Overlays.deleteOverlay(createModeOverlay);
                    createModeOverlay = null;
                }
            }

        }
    }

    // #endregion CREATE MODE OVERLAY

    // #region UTILS 

    // Constants
    var SITTING_SEARCH_RADIUS_M = 0.01; // m to check if avatar is sitting in chair
    var HALF = 0.5;
    var NEG_ONE = -1;

    // Dynamic variables
    var chairProperties = null;

    // Is another avatar sitting in the chair?
    function isAvatarSittingInSeat() {
        // Used canSit()
        var nearbyAvatars = AvatarList.getAvatarsInRange(seatCenterPosition, SITTING_SEARCH_RADIUS_M);
        if (nearbyAvatars.length === 0) {
            // chair is empty
            return null;
        } else {
            return nearbyAvatars[0];
        }
    }

    // String utility
    function startsWith(str, searchString, position) {
        position = position || 0;
        return str.substr(position, searchString.length) === searchString;
    }

    function canSit() {

        if (UI_DEBUG) {
            print("Sittable overlay id is: ", sittableID);
        }

        if (!chairProperties) {
            setChairProperties();
        }
        var distanceFromSeat = Vec3.distance(MyAvatar.position, chairProperties.position);
        var isWithinSitDistance = distanceFromSeat < SITTABLE_DISTANCE_MAX_M;

        var isOpenSeat = !isAvatarSittingInSeat();

        if (SITTING_DEBUG) {
            print("canSit(): ", isWithinSitDistance, isOpenSeat);
        }

        return isWithinSitDistance && isOpenSeat;
    }

    function rolesToOverride() {
        // Get all animation roles that sit will override
        return MyAvatar.getAnimationRoles().filter(function (role) {
            return !(startsWith(role, "right") || startsWith(role, "left"));
        });
    }

    // Overlay properties in front of Camera 
    // Arguments: position in front of Camera, overlay dimensions, overlay image url
    function getInFrontOverlayProperties(positionInFront, dimensions, url) {
        return {
            position: Vec3.sum(Camera.position, Vec3.multiplyQbyV(Camera.orientation, positionInFront)),
            rotation: Camera.orientation,
            parentID: MyAvatar.sessionUUID,
            parentJointIndex: MyAvatar.getJointIndex("_CAMERA_MATRIX"),
            dimensions: dimensions,
            url: url,
            ignoreRayIntersection: false,
            drawInFront: true,
            visible: true,
            emissive: true
        };
    }

    function setChairProperties() {
        chairProperties = Entities.getEntityProperties(
            entityID,
            [
                "dimensions",
                "registrationPoint",
                "position",
                "rotation",
                "alpha"
            ]
        );
    }

    // #endregion UTILS 


    // #region SIT ACTIONS 

    var SIT_SETTLE_TIME_MS = 350; // Do not pop avatar out of chair immediates if there's an issue
    var SETTING_KEY_AVATAR_SITTING = "com.highfidelity.avatar.isSitting";
    var STANDUP_DELAY_MS = 25; // ms for timeout in standup
    var SIT_DELAY_MS = 50; // ms for timeouts in sit
    var OVERRIDDEN_DRIVE_KEYS = [
        DriveKeys.TRANSLATE_X,
        DriveKeys.TRANSLATE_Y,
        DriveKeys.TRANSLATE_Z,
        DriveKeys.STEP_TRANSLATE_X,
        DriveKeys.STEP_TRANSLATE_Y,
        DriveKeys.STEP_TRANSLATE_Z
    ];
    var sittingDown = false;
    var canStand = false;
    var seatCenterPosition = null;
    var lockChairOnStandUp = null;
    // User can click on overlay to sit down
    function mouseReleaseOnSittableLocalEntity(overlayID, pointerEvent) {
        if (overlayID === sittableID && pointerEvent.isLeftButton) {

            // Server checks if seat is occupied
            // if not occupied will call startSitDown()
            Entities.callEntityServerMethod(
                entityID,
                "onSitDown",
                [MyAvatar.sessionUUID]
            );
        }
    }

    var ANIMATION_URL = Script.resolvePath("./resources/animations/sittingIdle.fbx");
    var ANIMATION_FPS = 30;
    var ANIMATION_FIRST_FRAME = 1;
    var ANIMATION_LAST_FRAME = 350;
    var UPDATE_INTERVAL_MS = 50;
    var updateInterval = false;
    function sitAndPinAvatar() {
        MyAvatar.characterControllerEnabled = false;
        MyAvatar.hmdLeanRecenterEnabled = false;

        var roles = rolesToOverride();

        for (i in roles) { // restore roles to prevent overlap
            MyAvatar.restoreRoleAnimation(roles[i]);
            MyAvatar.overrideRoleAnimation(roles[i], ANIMATION_URL, ANIMATION_FPS, true,
                ANIMATION_FIRST_FRAME, ANIMATION_LAST_FRAME);
        }
        for (var i in OVERRIDDEN_DRIVE_KEYS) {
            MyAvatar.disableDriveKey(OVERRIDDEN_DRIVE_KEYS[i]);
        }

        MyAvatar.centerBody();
        var index = MyAvatar.getJointIndex("Hips");

        Script.setTimeout(function () {

            if (HMD.active && SHOW_PRESIT_IMAGE_IN_HMD) {
                preSitRemove();
            }

            sittingDown = true;
            canStand = true;
            sitDownSettlePeriod = Date.now() + SIT_SETTLE_TIME_MS;

            MyAvatar.pinJoint(index, seatCenterPosition, chairProperties.rotation);

            if (updateInterval) {
                stopUpdateInterval();
            }

            updateInterval = Script.setInterval(update, UPDATE_INTERVAL_MS);
            MyAvatar.scaleChanged.connect(standUp);
            MyAvatar.onLoadComplete.connect(standUp);
            location.hostChanged.connect(standUp);
            Script.scriptEnding.connect(standUp);

        }, SIT_DELAY_MS);
    }

    function stopUpdateInterval() {
        if (updateInterval) {
            Script.clearInterval(updateInterval);
            updateInterval = false;
        }
    }

    function sitDown() {
        // Remove sittable overlay from chair
        sittableRemove();

        // Set isSitting value in Settings
        Settings.setValue(SETTING_KEY_AVATAR_SITTING, entityID);

        // Set the value of head to hips distance
        // If avatar deviates outside of the minimum and maximum, the avatar will pop out of the chair
        setHeadToHipsDistance();

        // Chair does not move when the avatar is about to sit
        lockChairOnStandUp = Entities.getEntityProperties(entityID, 'locked').locked;
        Entities.editEntity(entityID, { locked: true });

        // Get the place where 
        calculatePinHipPosition();

        Script.setTimeout(function () {
            // In HMD mode show presit overlay
            if (HMD.active && SHOW_PRESIT_IMAGE_IN_HMD) {
                preSitCreate();

                Script.setTimeout(function () {
                    sitAndPinAvatar();
                    preSitEndUpdateInterval();
                }, OVERLAY_PRESIT_FRAME_DURATION * overlayPreSitLoaded.length);
            } else {
            // No presit overlay in desktop mode
                 sitAndPinAvatar();
            }
        }, SIT_DELAY_MS);
    }


    // Checks for Avatar Spine Error
    function setHeadToHipsDistance() {
        // get hips world pos while sitting
        if ((MyAvatar.getJointIndex("Head") === NEG_ONE) || (MyAvatar.getJointIndex("Hips") === NEG_ONE)) {
            // this can probably be adjusted to be more accurate
            headToHipsDistance = MyAvatar.getHeight() * HALF;
        } else {
            var headIndex = MyAvatar.getJointIndex("Head");
            var hipsIndex = MyAvatar.getJointIndex("Hips");
            var headTranslation = MyAvatar.getAbsoluteDefaultJointTranslationInObjectFrame(headIndex);
            var hipsTranslation = MyAvatar.getAbsoluteDefaultJointTranslationInObjectFrame(hipsIndex);
            headToHipsDistance = Math.abs(headTranslation.y - hipsTranslation.y);
        }
    }

    // Calculates where the avatar's hips will seat 
    function calculatePinHipPosition() {
        if (!chairProperties) {
            setChairProperties();
        }

        // get chairProperties to calculate middle of chair
        seatCenterPosition = chairProperties.position;

        var yOffset = chairProperties.dimensions.y * CHAIR_OFFSET_RATIO;
        seatCenterPosition = {
            x: chairProperties.position.x,
            y: chairProperties.position.y + yOffset,
            z: chairProperties.position.z
        };
    }

    var STANDUP_DISTANCE_M = 0.5; // m 
    var CHAIR_DISMOUNT_OFFSET_M = -0.5; // m in front of chair 
    function standUp() {
        var avatarDistance = Vec3.distance(MyAvatar.position, seatCenterPosition);

        Script.setTimeout(function () {
            // Move avatar in front of the chair to avoid getting stuck in collision hulls
            if (avatarDistance < STANDUP_DISTANCE_M) {
                var index = MyAvatar.getJointIndex("Hips");
                MyAvatar.clearPinOnJoint(index);
                var offset = {
                    x: 0,
                    y: 1.0,
                    z: CHAIR_DISMOUNT_OFFSET_M - chairProperties.dimensions.z * chairProperties.registrationPoint.z
                };
                var position = Vec3.sum(chairProperties.position, Vec3.multiplyQbyV(chairProperties.rotation, offset));
                MyAvatar.position = position;
            }
        }, SIT_DELAY_MS);

        if (!lockChairOnStandUp) {
            Entities.editEntity(entityID, { locked: false });
        }

        driveKeyPressedStart = null;
        canStand = false;
        sitDownSettlePeriod = null;
        sittingDown = false;
        standUpRemove();

        Entities.callEntityServerMethod(entityID, "onStandUp");

        if (Settings.getValue(SETTING_KEY_AVATAR_SITTING) === entityID) {
            // Check if avatar is getting out of this chair

            Settings.setValue(SETTING_KEY_AVATAR_SITTING, "");

            for (var i in OVERRIDDEN_DRIVE_KEYS) {
                MyAvatar.enableDriveKey(OVERRIDDEN_DRIVE_KEYS[i]);
            }

            var roles = rolesToOverride();
            for (i in roles) {
                MyAvatar.restoreRoleAnimation(roles[i]);
            }
            MyAvatar.characterControllerEnabled = true;
            MyAvatar.hmdLeanRecenterEnabled = true;

            Script.setTimeout(function () {
                MyAvatar.centerBody();
            }, STANDUP_DELAY_MS);

        } else {
            // Avatar switched to another chair, do not reapply the animation roles
        }

        stopUpdateInterval();
        MyAvatar.scaleChanged.disconnect(standUp);
        MyAvatar.onLoadComplete.disconnect(standUp);
        location.hostChanged.disconnect(standUp);
        Script.scriptEnding.disconnect(standUp);
    }

    // #endregion SIT ACTIONS

    // #region UPDATE

    var DISTANCE_FROM_CHAIR_TO_STAND_AT_M = 0.5;
    var MAX_HEAD_DEVIATION_RATIO = 1.2;
    var MIN_HEAD_DEVIATION_RATIO = 0.8;
    var DRIVE_KEY_RELEASE_TIME_MS = 800; // ms
    var sitDownSettlePeriod = null;
    var driveKeyPressedStart = null;
    var deviationTimeStart = null;
    var headToHipsDistance = null;
    function update() {
        var hasAvatarSpineError = false;
        var hasHeldDriveKey = false;
        var hasAvatarMovedTooFar = false;

        if (sittingDown === true && canStand) {
            sittableRemove();
            var now = Date.now();

            // ACTIVE DRIVE KEY
            // Check if a drive key is pressed
            var hasActiveDriveKey = false;

            for (var i in OVERRIDDEN_DRIVE_KEYS) {
                if (MyAvatar.getRawDriveKey(OVERRIDDEN_DRIVE_KEYS[i]) !== 0.0) {
                    hasActiveDriveKey = true;

                    if (driveKeyPressedStart === null) {
                        driveKeyPressedStart = now;
                    }

                    if (overlayStandUp === null) {
                        standUpCreate();
                    }
                    break;
                }
            }

            // Only standup if user has been pushing a drive key for DRIVE_KEY_RELEASE_TIME_MS
            if (hasActiveDriveKey) {
                if (driveKeyPressedStart !== null) {
                    var elapsed = now - driveKeyPressedStart;
                    hasHeldDriveKey = elapsed > DRIVE_KEY_RELEASE_TIME_MS;
                }
            } else {
                if (overlayStandUp) {
                    driveKeyPressedStart = null;
                    standUpRemove();
                }
            }

            // AVATAR DISTANCE 
            var avatarDistance = Vec3.distance(MyAvatar.position, seatCenterPosition);
            if (avatarDistance > DISTANCE_FROM_CHAIR_TO_STAND_AT_M && sitDownSettlePeriod && now > sitDownSettlePeriod) {
                hasAvatarMovedTooFar = true;
            }

            // AVATAR SPINE ERROR
            if (HMD.active) {
                var headWorldPosition;

                // If head is more than certain distance from hips or less than certain distance, stand up
                var headPoseValue = Controller.getPoseValue(Controller.Standard.Head);
                headWorldPosition = Vec3.sum(Vec3.multiplyQbyV(MyAvatar.orientation, headPoseValue.translation),
                    MyAvatar.position);

                var headDeviation = Vec3.distance(headWorldPosition, seatCenterPosition);
                var headDeviationRatio = headDeviation / headToHipsDistance;

                if ((headDeviationRatio > MAX_HEAD_DEVIATION_RATIO || headDeviationRatio < MIN_HEAD_DEVIATION_RATIO)
                    && sitDownSettlePeriod && now > sitDownSettlePeriod) {

                    if (deviationTimeStart === null) {
                        deviationTimeStart = now;
                    }

                    var deviationTimeToStand = 1000;
                    if (now - deviationTimeStart > deviationTimeToStand) {
                        hasAvatarSpineError = true;
                        deviationTimeStart = null;
                    }
                }
            }

            if (SITTING_DEBUG) {
                print("update standup conditionals: ", hasAvatarSpineError, hasHeldDriveKey, hasAvatarMovedTooFar);
            }

            if (hasAvatarSpineError || hasHeldDriveKey || hasAvatarMovedTooFar) {
                standUp();
            }
        }
    }

    // #endregion UPDATE

    // #region ENTITY METHODS

    var ENCOUNTERED_CHAIR_CHECK_INTERVAL_MS = 500;
    var entityID = null;
    var intervalEncounteredChairCheck = null;
    function SitClient() {
        // blank
    }

    SitClient.prototype = {
        remotelyCallable: [
            "startSitDown",
            "check"
        ],

        preload: function (id) {
            entityID = id;

            AnimationCache.prefetch(ANIMATION_URL);
            prefetchPresitOverlayImages();
            setChairProperties();
            calculatePinHipPosition();

            // Set if chair alpha value is small enough to enable the create mode overlay
            checkAlpha = chairProperties.alpha <= MINIMUM_ALPHA;

            Entities.mouseReleaseOnEntity.connect(mouseReleaseOnSittableLocalEntity);

            // Check if we've encountered a chair
            intervalEncounteredChairCheck = Script.setInterval(function () {
                // Show or remove sittable local entity
                // Show sittable local entity when I'm close to the seat
                if (isInEditMode() || !canSit() || overlayPreSit) {
                    sittableRemove();
                } else if (canSit() && !sittableID && !overlayPreSit && shouldShowSittable()) {
                    // Make a sittable local entity if there isn't one
                    sittableCreate();
                }
                // if in create mode and the cube is invisible,
                // draw a visible cube to show where the sit cube is
                checkOrCreateCreateModeOverlay();
            }, ENCOUNTERED_CHAIR_CHECK_INTERVAL_MS);
        },

        // Called by entity server script
        // To ensure only 1 avatar sits in chair at a time
        startSitDown: function (id, param) {
            sitDown();
        },

        // Called by entity server script to ensure client is still sitting in chair
        // If client does not call "checkResolved" the entity server script will allow other avatars to sit
        check: function () {
            Entities.callEntityServerMethod(entityID, "checkResolved");
        },

        unload: function () {
            if (Settings.getValue(SETTING_KEY_AVATAR_SITTING) === entityID) {
                standUp();
            }

            Entities.callEntityServerMethod(entityID, "onStandUp");

            if (intervalSittableTransparency) {
                Script.clearInterval(intervalSittableTransparency);
                intervalSittableTransparency = null;
            }

            if (intervalEncounteredChairCheck) {
                Script.clearInterval(intervalEncounteredChairCheck);
                intervalEncounteredChairCheck = null;
            }

            stopUpdateInterval();
            sittableRemove();
            preSitRemove();
            standUpRemove();

            if (sittingDown) {
                MyAvatar.scaleChanged.disconnect(standUp);
                MyAvatar.onLoadComplete.disconnect(standUp);
                location.hostChanged.disconnect(standUp);
                Script.scriptEnding.disconnect(standUp);
            }
            if (createModeOverlay) {
                Overlays.deleteOverlay(createModeOverlay);
            }
            Entities.mouseReleaseOnEntity.disconnect(mouseReleaseOnSittableLocalEntity);
        }
    };

    // #endregion ENTITY METHODS

    return new SitClient();
});
