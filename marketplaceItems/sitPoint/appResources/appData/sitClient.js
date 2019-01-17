//
// sit.js
//
// Created by Clement Brisset on 3/3/17
// Modified by Robin Wilson, Rebecca Stankus, and Alexia Mandeville January 2019
//
// Copyright 2019 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// Sit setup:
// 
// Best added to a stationary chair or entity. Center of seat is indicated by the entity's registration point.
// Ex: a stool for an avatar to sit in the middle on top, registrationPoint = { x: 0.5, y: 1.0, z: 0.5 }.
// 
// Add sit.js and sitServer.js to an entity
// Ensure both are running.
//
// Configurable variables are:
// - SHOW_PRESIT_OVERLAY_IN_HMD
// - CHAIR_OFFSET_RATIO
// 

/* globals Entities, Script, AnimationCache, Settings, MyAvatar, DriveKeys, AvatarList,
 Vec3, HMD, Overlays, Camera, isInEditMode */

(function () {

    // Configurable Variables

    // true - shows "Face Forward Overlay" before sit; false - sits immediately with no overlay
    var SHOW_PRESIT_OVERLAY_IN_HMD = true;

    // Used to calculate pin hip position. Adds CHAIR_OFFSET_RATIO * chair's y dimension to the y center of the seat.
    // Avatar sit position y = CHAIR_OFFSET_RATIO * height of chair
    var CHAIR_OFFSET_RATIO = 0.1;

    Script.include("/~/system/libraries/utils.js");

    var entityID = null;

    var SETTING_KEY = "com.highfidelity.avatar.isSitting";

    var SIT_SETTLE_TIME = 350; // ms

    var SITTING_DEBUG = true; // turn on sitting debug print statements
    var OVERLAY_DEBUG = true;

    var ONE_HUNDRED_AND_TWENTY_PERCENT = 1.2;
    var EIGHTY_PERCENT = 0.8;
    var HALF = 0.5;
    var NEG_ONE = -1;

    var SIT_DELAY = 50; // ms for timeouts in sit
    var STANDUP_DELAY = 25; // ms for timeout in standup

    var OVERRIDDEN_DRIVE_KEYS = [
        DriveKeys.TRANSLATE_X,
        DriveKeys.TRANSLATE_Y,
        DriveKeys.TRANSLATE_Z,
        DriveKeys.STEP_TRANSLATE_X,
        DriveKeys.STEP_TRANSLATE_Y,
        DriveKeys.STEP_TRANSLATE_Z
    ];

    var chairProperties = null;
    var lockChairOnStandUp = null;
    var seatCenterPosition = null;
    var CHAIR_DISMOUNT_OFFSET = -0.5; // m in front of chair 

    var SITTING_SEARCH_RADIUS = 0.01; // m to check if avatar is sitting in chair

    // for overlays

    var overlayStandUp = null;


    // alpha value change during edit mode
    var checkAlpha = false;
    var createModeOverlay = null;
    var MINIMUM_ALPHA = 0.3; // 50% alpha value
    var OVERLAY_ALPHA = 0.1; // 10% alpha value
    var CREATE_OVERLAY_DIMENSIONS_OFFSET = 0.02; // add 0.02 m to the sides of the cube to avoid z fighting

    // sit/stand variables
    var sittingDown = false;
    var canStand = false;
    var STANDUP_DISTANCE = 0.5; // m 

    // used in standup conditions
    var DRIVE_KEY_RELEASE_TIME = 800; // ms
    var sitDownSettlePeriod = null;
    var driveKeyPressedStart = null;
    var deviationTimeStart = null;
    var headToHipsDistance = null;

    // #region SITTABLE OVERLAY - Overlay on chair "Click to Sit" or "Trigger to Sit"

    // Constants
    var OVERLAY_SITTABLE_FADE = 50; // "Click/Trigger to Sit" overlay fade after 50 ms
    var OVERLAY_SITTABLE_DISTANCE_SHOW = 3; // m 
    var OVERLAY_SITTABLE_DISTANCE_MAX = 5; // m
    var OVERLAY_SITTABLE_ALPHA_START = 0.7;
    var OVERLAY_SITTABLE_MIN_ALPHA = 0.075; // fades to this alpha value
    var OVERLAY_URL_SITTABLE_HMD = Script.resolvePath("./resources/images/triggerToSit.png");
    var OVERLAY_URL_SITTABLE_DESKTOP = Script.resolvePath("./resources/images/clickToSit.png");

    // Dynamic variables
    var overlaySittable = null;
    var overlaySittableIntervalTransparency = null;

    // Create sittable overlay
    function sittableCreate() {

        if (OVERLAY_DEBUG) {
            print("SittableCreate");
        }

        setChairProperties();

        // change the image based on what modality the user is in
        var url = HMD.active
            ? OVERLAY_URL_SITTABLE_HMD
            : OVERLAY_URL_SITTABLE_DESKTOP;

        var overlayPosition = Vec3.sum(chairProperties.position, { x: 0, y: 0.01, z: 0 });

        overlaySittable = Overlays.addOverlay("image3d", {
            position: overlayPosition,
            rotation: Quat.multiply(chairProperties.rotation, Quat.fromVec3Degrees({ x: -90, y: 180, z: 0 })),
            dimensions: {
                x: 0.3,
                y: 0.3
            },
            url: url,
            ignoreRayIntersection: false,
            alpha: OVERLAY_SITTABLE_ALPHA_START,
            visible: true,
            emissive: true
        });

        HMD.displayModeChanged.connect(sittableSwitchHMDToDesktopText);

        sittableLerpTransparency();

    }

    // Fade's the sittable overlay over time
    function sittableLerpTransparency() {

        if (OVERLAY_DEBUG) {
            print("sittableLerpTransparency");
        }

        var startAlpha = OVERLAY_SITTABLE_ALPHA_START;
        var changeAlpha = 0.01;

        overlaySittableIntervalTransparency = Script.setInterval(function () {

            startAlpha = startAlpha - changeAlpha; // My new alpha
            Overlays.editOverlay(overlaySittable, { alpha: startAlpha });

            if (startAlpha <= OVERLAY_SITTABLE_MIN_ALPHA) {
                // Stop fading and keep overlay at the minimum alpha
                Script.clearInterval(overlaySittableIntervalTransparency);
                overlaySittableIntervalTransparency = null;
            }

        }, OVERLAY_SITTABLE_FADE);

    }

    // Switch sittable overlay text from desktop mode "Click to Sit" to HMD mode "Trigger to Sit"
    function sittableSwitchHMDToDesktopText() {
        if (overlaySittable) {
            var url = HMD.active
                ? OVERLAY_URL_SITTABLE_HMD
                : OVERLAY_URL_SITTABLE_DESKTOP;

            Overlays.editOverlay(overlaySittable, { url: url });
        }
    }

    // Remove sittable overlay if it exists
    function sittableRemove() {

        if (OVERLAY_DEBUG) {
            print("sittableRemove");
        }

        if (overlaySittable) {
            Overlays.deleteOverlay(overlaySittable);
            overlaySittable = null;

            if (overlaySittableIntervalTransparency) {
                Script.clearInterval(overlaySittableIntervalTransparency);
                overlaySittableIntervalTransparency = null;
            }
            
            HMD.displayModeChanged.disconnect(sittableSwitchHMDToDesktopText);
        }

    }

    // Show or remove sittable overlay
    // Show overlays when I'm close to the seat
    function sittableShowOrRemove() {

        var ableToSit = canSit();

        if (isInEditMode() || !ableToSit || overlayPreSit) {

            if (OVERLAY_DEBUG) {
                print("sittableShowOrRemove calling sittableRemove");
            }
    
            sittableRemove();

        } else if (ableToSit && !overlaySittable && !overlayPreSit && shouldShowSittable()) {

            if (OVERLAY_DEBUG) {
                print("sittableShowOrRemove calling sittableCreate");
            }

            // Make an overlay if there isn't one
            sittableCreate();
        }
    }

    // Is avatar in range with available seat?
    // Return boolean to whether sittable overlay should be shown
    function shouldShowSittable() {
        var seatPosition = chairProperties.position;
        var distanceFromSeat = Vec3.distance(MyAvatar.position, seatPosition);
        return (distanceFromSeat < OVERLAY_SITTABLE_DISTANCE_SHOW && !isAvatarSittingInSeat() && !overlayPreSit);
    }

    // #endregion Sittable Overlay

    // #region PRESIT OVERLAY - Overlay shown in HMD before sitting and after clicking sittable overlay
    // Has the sitting animation and "Please Face Forward"

    // Constants
    var OVERLAY_PRESIT_FRAME_DURATION = 160; // ms time duration for HMD presit overlay
    var OVERLAY_PRESIT_URL_ROOT = "./resources/images/presit/sitConfirm";
    var OVERLAY_PRESIT_URL_POSTFIX = ".png";
    var OVERLAY_PRESIT_URL_NUM = 12;
    var OVERLAY_PRESIT_URL_TEXT = Script.resolvePath("./resources/images/presit/pleaseFaceForward.png");

    // Dynamic variables
    var overlayPreSit = null;
    var overlayPreSitText = null;
    var overlayPreSitStart = null;
    var overlayPreSitLoaded = [];
    var overlayPreSitTextLoaded = null;
    var preSitLoadIndex = 0;

    // Prefetch all presit overlay images onto user's client
    function prefetchPresitOverlayImages() {
        var str;
        for (var i = 0; i < OVERLAY_PRESIT_URL_NUM; i++) {
            str = i + 1;
            overlayPreSitLoaded[i] = TextureCache.prefetch(Script.resolvePath(OVERLAY_PRESIT_URL_ROOT + str + OVERLAY_PRESIT_URL_POSTFIX));
        }
        overlayPreSitTextLoaded = TextureCache.prefetch(OVERLAY_PRESIT_URL_TEXT);
    }

    function presitCreate() {
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

        overlayPreSitStart = Date.now();
        Script.update.connect(presitUpdate);
    }

    function presitRemove() {

        if (overlayPreSit) {
            Overlays.deleteOverlay(overlayPreSit);
            overlayPreSit = null;
            overlayPreSitStart = 0;
            preSitLoadIndex = 0;

            if (overlayPreSitText !== null) {
                Overlays.deleteOverlay(overlayPreSitText);
            }

            Script.update.disconnect(presitUpdate);
        }

    }

    // Flash through the presit animation images via overlay for a smooth avatar sitting animation
    function presitUpdate() {

        var now = Date.now();

        if (preSitLoadIndex >= overlayPreSitLoaded.length) {
            return;
        }

        if (overlayPreSit) {
            var timePassed = now - overlayPreSitStart;
            if (timePassed >= OVERLAY_PRESIT_FRAME_DURATION) {
                overlayPreSitStart = now;
                preSitLoadIndex = preSitLoadIndex + 1;
                Overlays.editOverlay(overlayPreSit, { url: overlayPreSitLoaded[preSitLoadIndex].url });
            }
        }

    }

    // #endregion PRESIT OVERLAY

    // #region STAND UP OVERLAY - Overlay shown when holding a drive key after sitting

    var OVERLAY_URL_STANDUP = Script.resolvePath("./resources/images/holdToStandUp.png");

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

    // #region UTILS 

    // Is another avatar sitting in the chair?
    function isAvatarSittingInSeat() {
        // Used canSit()
        var nearbyAvatars = AvatarList.getAvatarsInRange(seatCenterPosition, SITTING_SEARCH_RADIUS);
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

        if (OVERLAY_DEBUG) {
            print("Sittable overlay id is: ", overlaySittable);
        }

        if (!chairProperties) {
            setChairProperties();
        }
        var distanceFromSeat = Vec3.distance(MyAvatar.position, chairProperties.position);
        var isWithinSitDistance = distanceFromSeat < OVERLAY_SITTABLE_DISTANCE_MAX;

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

        var index = MyAvatar.getJointIndex("Head");

        return {
            position: Vec3.sum(Camera.position, Vec3.multiplyQbyV(Camera.orientation, positionInFront)),
            rotation: Camera.orientation,
            parentID: MyAvatar.sessionUUID,
            parentJointIndex: index,
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

                // create visible cube
                createModeOverlay = Overlays.addOverlay("cube", {
                    position: {
                        x: worldPosition.x,
                        y: worldPosition.y,
                        z: worldPosition.z
                    },
                    rotation: rotation,
                    dimensions: {
                        x: dimensions.x + CREATE_OVERLAY_DIMENSIONS_OFFSET,
                        y: dimensions.y + CREATE_OVERLAY_DIMENSIONS_OFFSET,
                        z: dimensions.z + CREATE_OVERLAY_DIMENSIONS_OFFSET
                    },
                    solid: true,
                    alpha: OVERLAY_ALPHA,
                    parentID: entityID
                });

            }

            // is in Edit mode && alpha value has changed
            if (!isInEditMode() && createModeOverlay) {
                // set alpha back to 0
                if (createModeOverlay) {
                    Overlays.deleteOverlay(createModeOverlay);
                    createModeOverlay = null;
                }
            }

        }
    }

    // #endregion UTILS 

    // #region SIT ACTIONS 

    var ANIMATION_URL = Script.resolvePath("./resources/animations/sittingIdle.fbx");
    var ANIMATION_FPS = 30;
    var ANIMATION_FIRST_FRAME = 1;
    var ANIMATION_LAST_FRAME = 350;

    // User can click on overlay to sit down
    // function mouseReleaseOnOverlay (overlayID, pointerEvent) {
    //     if (overlayID === overlaySittable && pointerEvent.isLeftButton) {

    //         // Server checks if seat is occupied
    //         // if not occupied will call startSitDown()
    //         Entities.callEntityServerMethod(
    //             entityID,
    //             "onSitDown",
    //             [MyAvatar.sessionUUID]
    //         );
    //     }
    // }

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

            if (HMD.active && SHOW_PRESIT_OVERLAY_IN_HMD) {
                presitRemove();
            }

            sittingDown = true;
            canStand = true;
            sitDownSettlePeriod = Date.now() + SIT_SETTLE_TIME;

            MyAvatar.pinJoint(index, seatCenterPosition, chairProperties.rotation);


            Script.update.connect(update);
            MyAvatar.scaleChanged.connect(standUp);
            MyAvatar.onLoadComplete.connect(standUp);
            location.hostChanged.connect(standUp);
            Script.scriptEnding.connect(standUp);

        }, SIT_DELAY);

    }

    function sitDown() {

        // Remove sittable overlay from chair
        sittableRemove();

        // Set isSitting value in Settings
        Settings.setValue(SETTING_KEY, entityID);

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
            if (HMD.active && SHOW_PRESIT_OVERLAY_IN_HMD) {

                presitCreate();

                Script.setTimeout(function () {
                    sitAndPinAvatar();
                }, OVERLAY_PRESIT_FRAME_DURATION * overlayPreSitLoaded.length);

            } else {
                // No presit overlay in desktop mode
                sitAndPinAvatar();
            }

        }, SIT_DELAY);

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

    }

    function standUp() {

        var avatarDistance = Vec3.distance(MyAvatar.position, seatCenterPosition);

        Script.setTimeout(function () {
            // Move avatar in front of the chair to avoid getting stuck in collision hulls
            if (avatarDistance < STANDUP_DISTANCE) {
                var index = MyAvatar.getJointIndex("Hips");
                MyAvatar.clearPinOnJoint(index);
                var offset = {
                    x: 0,
                    y: 1.0,
                    z: CHAIR_DISMOUNT_OFFSET - chairProperties.dimensions.z * chairProperties.registrationPoint.z
                };
                var position = Vec3.sum(chairProperties.position, Vec3.multiplyQbyV(chairProperties.rotation, offset));
                MyAvatar.position = position;
            }
        }, SIT_DELAY);

        if (!lockChairOnStandUp) {
            Entities.editEntity(entityID, { locked: false });
        }

        driveKeyPressedStart = null;
        canStand = false;
        sitDownSettlePeriod = null;
        sittingDown = false;
        standUpRemove();

        Entities.callEntityServerMethod(entityID, "onStandUp");

        if (Settings.getValue(SETTING_KEY) === entityID) {
            // Check if avatar is getting out of this chair

            Settings.setValue(SETTING_KEY, "");

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
            }, STANDUP_DELAY);

        } else {
            // Avatar switched to another chair, do not reapply the animation roles
        }

        Script.update.disconnect(update);
        MyAvatar.scaleChanged.disconnect(standUp);
        MyAvatar.onLoadComplete.disconnect(standUp);
        location.hostChanged.disconnect(standUp);
        Script.scriptEnding.disconnect(standUp);
    }

    // #endregion SIT ACTIONS

    // #region UPDATE

    var DISTANCE_FROM_CHAIR_TO_STAND_AT = 0.5;

    function update(dt) {

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

            // Only standup if user has been pushing a drive key for DRIVE_KEY_RELEASE_TIME
            if (hasActiveDriveKey) {

                if (driveKeyPressedStart !== null) {
                    var elapsed = now - driveKeyPressedStart;
                    hasHeldDriveKey = elapsed > DRIVE_KEY_RELEASE_TIME;
                }

            } else {
                if (overlayStandUp) {
                    driveKeyPressedStart = null;
                    standUpRemove();
                }
            }

            // AVATAR DISTANCE 
            var avatarDistance = Vec3.distance(MyAvatar.position, seatCenterPosition);
            if (avatarDistance > DISTANCE_FROM_CHAIR_TO_STAND_AT && sitDownSettlePeriod && now > sitDownSettlePeriod) {
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

                if ((headDeviationRatio > ONE_HUNDRED_AND_TWENTY_PERCENT || headDeviationRatio < EIGHTY_PERCENT)
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

    // Constants
    var ENCOUNTERED_CHAIR_CHECK_INTERVAL = 500; // ms

    // Dynamic variables
    var intervalEncounteredChairCheck = null;

    function sitClient () {}

    sitClient.prototype = {
        
        remotelyCallable: [
            "startSitDown",
            "check"
        ],

        preload: function (id) {
            entityID = id;

            prefetchAnimation();
            prefetchPresitOverlayImages();
            setChairProperties();
    
            // Set if chair alpha value is small enough to enable the create mode overlay
            checkAlpha = chairProperties.alpha <= MINIMUM_ALPHA; 
            
            // Overlays.mouseReleaseOnOverlay.connect(mouseReleaseOnOverlay);

            // Check if we've encountered a chair
            intervalEncounteredChairCheck = Script.setInterval(function () {

                sittableShowOrRemove();
                checkOrCreateCreateModeOverlay();

            }, ENCOUNTERED_CHAIR_CHECK_INTERVAL);

            function prefetchAnimation () {
                AnimationCache.prefetch(ANIMATION_URL);
            }

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

            if (Settings.getValue(SETTING_KEY) === entityID) {
                standUp();
            }
    
            Entities.callEntityServerMethod(entityID, "onStandUp");
    
            if (overlaySittableIntervalTransparency) {
                Script.clearInterval(overlaySittableIntervalTransparency);
                overlaySittableIntervalTransparency = null;
            }
    
            if (intervalEncounteredChairCheck) {
                Script.clearInterval(intervalEncounteredChairCheck);
                intervalEncounteredChairCheck = null;
            }
    
            sittableRemove();
    
            presitRemove();
    
            standUpRemove();
    
            if (createModeOverlay) {
                Overlays.deleteOverlay(createModeOverlay);
            }

            // Overlays.mouseReleaseOnOverlay.disconnect(mouseReleaseOnOverlay);
        }

    }

    // #endregion ENTITY METHODS

    return new sitClient();

});