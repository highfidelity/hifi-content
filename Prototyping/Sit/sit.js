//
// sit.js
//
// Created by Clement Brisset on 3/3/17
// Modified by Rebecca Rebecca Stankus, Robin Wilson, and Alexia Mandeville June 2018
//
// Copyright 2017 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// Chair should be triggerable and not collisionless or grabbable for script to work properly

/* globals Entities, Script, AnimationCache, Settings, MyAvatar, DriveKeys, AvatarList,
 Vec3, HMD, Overlays, Camera, isInEditMode */

(function () {
    Script.include("/~/system/libraries/utils.js");
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.substr(position, searchString.length) === searchString;
        };
    }

    var showsPresitOverlay = true;
    var SITTING_DEBUG = false;

    var entityID = null;

    var ANIMATION_URL = "http://hifi-content.s3.amazonaws.com/alexia/Sitting_Idle.fbx";
    var ANIMATION_FPS = 30;
    var ANIMATION_FIRST_FRAME = 1;
    var ANIMATION_LAST_FRAME = 350;

    var RELEASE_TIME = 800; // ms

    var SETTING_KEY = "com.highfidelity.avatar.isSitting";

    var SIT_SETTLE_TIME = 300; // ms
    var DISTANCE_FROM_CHAIR_TO_STAND_AT = 0.1;

    var OVERLAY_CHECK_INTERVAL = 500;
    var OVERLAY_SITTABLE_FADE = 50; // "Click/Trigger to Sit" overlay fade after 50 ms
    var OVERLAY_URL_SITTABLE_HMD = "http://hifi-content.s3.amazonaws.com/alexia/TriggerToSit.png";
    var OVERLAY_URL_SITTABLE_DESKTOP = "http://hifi-content.s3.amazonaws.com/alexia/ClickToSit.png";
    var OVERLAY_URL_STANDUP = "https://hifi-production.s3.amazonaws.com/robin/sit/HoldToStandUp.png";
    var OVERLAY_SITTABLE_MIN_ALPHA = 0.075;

    var OVERLAY_PRESIT_FRAME_DURATION = 160;

    var SITTABLE_DISTANCE_MAX = 5;
    var SIT_DELAY = 50; // ms

    var OVERLAY_SITTABLE_DISTANCE_SHOW = 3;
    var OVERLAY_SITTABLE_ALPHA_START = 0.7; // for overlayss

    var STANDUP_DELAY = 25;

    var STANDUP_DISTANCE = 0.5; // meters

    var ONE_HUNDRED_AND_TEN_PERCENT = 1.1;
    var EIGHTY_PERCENT = 0.8;
    var HALF = 0.5;
    var NEG_ONE = -1;

    var deviationTimeStart = null;

    var OVERRIDDEN_DRIVE_KEYS = [
        DriveKeys.TRANSLATE_X,
        DriveKeys.TRANSLATE_Y,
        DriveKeys.TRANSLATE_Z,
        DriveKeys.STEP_TRANSLATE_X,
        DriveKeys.STEP_TRANSLATE_Y,
        DriveKeys.STEP_TRANSLATE_Z
    ];

    var canStand = false;
    var lockChairOnStandUp = null;
    var seatCenterPosition = null;
    var CHAIR_DISMOUNT_OFFSET = -0.5;
    var chairOffsetRatio = 0.2;

    var SITTING_SEARCH_RADIUS = 0.01;

    // for overlays
    var overlayIntervalTransparency = null;
    var overlaySittable = null;
    var overlayStandUp = null;
    var overlayPreSit = null;
    var overlayPreSitText = null;
    var overlayPreSitStart = null;
    var overlayPreSitLoaded = [];
    var overlayPreSitTextLoaded = null;
    var preSitLoadIndex = 0;

    var OVERLAY_PRESIT_URL_ROOT = "https://hifi-production.s3.amazonaws.com/robin/sit/sitOverlayConfirm/sit-overlay-confirm-";
    var OVERLAY_PRESIT_URL_POSTFIX = ".png";
    var OVERLAY_PRESIT_URL_NUM = 12;
    var OVERLAY_PRESIT_URL_TEXT = "https://hifi-production.s3.amazonaws.com/robin/sit/sitOverlayConfirm/please-face-forward.png";
    var overlayCheckForHover = null;

    var sitDownSettlePeriod = null;
    var driveKeyPressedStart = null;
    var sittingDown = false;

    var headToHipsDistance = null;

    var chairProperties = null;

    var overlays = {

        sittable: {
            create: function () {
                utils.setChairProperties();

                // change the image based on what modality the user is in
                var url = HMD.active
                    ? OVERLAY_URL_SITTABLE_HMD
                    : OVERLAY_URL_SITTABLE_DESKTOP;

                var overlayPosition = Vec3.sum(chairProperties.position, { x: 0, y: 0, z: 0 });

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

                HMD.displayModeChanged.connect(this.switchHMDToDesktopText);

                this.lerpTransparency();
            },
            remove: function () {
                if (overlaySittable) {
                    Overlays.deleteOverlay(overlaySittable);
                    overlaySittable = null;

                    if (overlayIntervalTransparency) {
                        Script.clearInterval(overlayIntervalTransparency); // Stop my interval when it's faded out
                        overlayIntervalTransparency = null;
                    }
                }

                HMD.displayModeChanged.disconnect(this.switchHMDToDesktopText);
            },
            shouldShow: function () {
                var seatPosition = chairProperties.position;
                var distanceFromSeat = Vec3.distance(MyAvatar.position, seatPosition);
                return (distanceFromSeat < OVERLAY_SITTABLE_DISTANCE_SHOW && !utils.isAvatarSittingInSeat() && !overlayPreSit);
            },

            // This part is used to fade out the overlay over time
            lerpTransparency: function () {
                var startAlpha = OVERLAY_SITTABLE_ALPHA_START;
                var changeAlpha = 0.01;
                overlayIntervalTransparency = Script.setInterval(function () {
                    startAlpha = startAlpha - changeAlpha; // My new alpha
                    Overlays.editOverlay(overlaySittable, { alpha: startAlpha });

                    if (startAlpha <= OVERLAY_SITTABLE_MIN_ALPHA) {
                        Script.clearInterval(overlayIntervalTransparency); // Stop my interval when it's faded out
                        overlayIntervalTransparency = null;
                    }
                }, OVERLAY_SITTABLE_FADE);
            },

            switchHMDToDesktopText: function () {
                if (overlaySittable) {
                    var url = HMD.active
                        ? OVERLAY_URL_SITTABLE_HMD
                        : OVERLAY_URL_SITTABLE_DESKTOP;

                    Overlays.editOverlay(overlaySittable, { url: url });
                }
            }
        },

        preSit: {
            preload: function () {
                var str;
                for (var i = 0; i < OVERLAY_PRESIT_URL_NUM; i++) {
                    str = i + 1;
                    overlayPreSitLoaded[i] = TextureCache.prefetch(OVERLAY_PRESIT_URL_ROOT + str + OVERLAY_PRESIT_URL_POSTFIX);
                }
                overlayPreSitTextLoaded = TextureCache.prefetch(OVERLAY_PRESIT_URL_TEXT);
            },
            create: function () {

                if (overlayPreSit) {
                    return;
                }

                overlayPreSit = Overlays.addOverlay(
                    "image3d",
                    utils.getInFrontOverlayProperties(
                        { x: 0, y: 0.1, z: -1 },
                        { x: 0.2, y: 0.2 },
                        overlayPreSitLoaded[preSitLoadIndex].url
                    )
                );

                overlayPreSitText = Overlays.addOverlay(
                    "image3d",
                    utils.getInFrontOverlayProperties(
                        { x: 0, y: -0.05, z: -1 },
                        { x: 0.425, y: 0.425 },
                        overlayPreSitTextLoaded.url
                    )
                );

                overlayPreSitStart = Date.now();
                Script.update.connect(this.update);

            },
            remove: function () {
                if (overlayPreSit !== null) {
                    Overlays.deleteOverlay(overlayPreSit);
                    overlayPreSit = null;
                    overlayPreSitStart = 0;
                    preSitLoadIndex = 0;

                    if (overlayPreSitText !== null) {
                        Overlays.deleteOverlay(overlayPreSitText);
                    }

                    Script.update.disconnect(this.update);
                }
            },
            update: function () {

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
        },

        standUp: {
            create: function () {
                if (overlayStandUp === null) {
                    overlayStandUp = Overlays.addOverlay(
                        "image3d",
                        utils.getInFrontOverlayProperties(
                            { x: 0, y: 0, z: -1 },
                            { x: 0.2, y: 0.2 },
                            OVERLAY_URL_STANDUP
                        )
                    );
                }
            },
            remove: function () {
                if (overlayStandUp) {
                    Overlays.deleteOverlay(overlayStandUp);
                    overlayStandUp = null;
                }
            }
        },

        showOrRemoveSittable: function () { // Show overlays when I'm close to the seat

            var canSit = utils.canSit();

            if (isInEditMode() || !canSit || overlayPreSit) {
                if (overlaySittable) {
                    this.sittable.remove();
                }
            } else if (canSit && !overlaySittable && !overlayPreSit && this.sittable.shouldShow()) {
                // Make an overlay if there isn't one
                this.sittable.create();
            }
        }
    };

    var utils = {

        // Used in utils.canSit()
        isAvatarSittingInSeat: function () {
            var nearbyAvatars = AvatarList.getAvatarsInRange(seatCenterPosition, SITTING_SEARCH_RADIUS);
            if (nearbyAvatars.length === 0) {
                // chair is empty
                return null;
            } else {
                return nearbyAvatars[0];
            }
        },

        rolesToOverride: function () {
            return MyAvatar.getAnimationRoles().filter(function (role) {
                return !(role.startsWith("right") || role.startsWith("left"));
            });
        },

        canSit: function () {
            if (!chairProperties) {
                this.setChairProperties();
            }
            var distanceFromSeat = Vec3.distance(MyAvatar.position, chairProperties.position);
            var isWithinSitDistance = distanceFromSeat < SITTABLE_DISTANCE_MAX;

            var isOpenSeat = !this.isAvatarSittingInSeat();

            if (SITTING_DEBUG){
                print("Utils.canSit(): ", isWithinSitDistance, isOpenSeat);
            }

            return isWithinSitDistance && isOpenSeat;
        },

        getInFrontOverlayProperties: function (positionInFront, dimensions, url) {
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
        },

        calculatePinHipPosition: function () {
            if (!chairProperties) {
                this.setChairProperties();
            }

            // get chairProperties to calculate middle of chair
            seatCenterPosition = chairProperties.position;

            var yOffset = chairProperties.dimensions.y * HALF * chairOffsetRatio;
            seatCenterPosition = {
                x: chairProperties.position.x,
                y: chairProperties.position.y + yOffset,
                z: chairProperties.position.z
            };
        },

        setHeadToHipsDistance: function () { // used in update checks for Avatar Spine Error
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
        },

        setChairProperties: function () {
            chairProperties = Entities.getEntityProperties(
                entityID,
                [
                    "dimensions",
                    "registrationPoint",
                    "position",
                    "rotation"
                ]
            );
        }

    };

    // Preload the animation file
    this.animation = AnimationCache.prefetch(ANIMATION_URL);

    this.preload = function (id) {
        entityID = id;

        overlays.preSit.preload();
        utils.setChairProperties();
    };

    this.startSitDown = function (id, param) {
        sitDown();
    };

    this.check = function() {
        Entities.callEntityServerMethod(entityID, "checkResolved");
    };

    this.remotelyCallable = [
        "startSitDown",
        "check"
    ];

    this.unload = function () {

        if (Settings.getValue(SETTING_KEY) === entityID) {
            standUp();
        }

        Entities.callEntityServerMethod(entityID, "onStandUp");

        if (overlayIntervalTransparency !== null) {
            Script.clearInterval(overlayIntervalTransparency);
            overlayIntervalTransparency = null;
        }

        if (overlayCheckForHover !== null) {
            Script.clearInterval(overlayCheckForHover);
            overlayCheckForHover = null;
        }

        if (overlaySittable) {
            overlays.sittable.remove();
        }
        if (overlayPreSit) {
            overlays.preSit.remove();
        }
        if (overlayStandUp) {
            overlays.standUp.remove();
        }

    };

    // User can click on overlay to sit down
    this.mouseReleaseOnOverlay = function (overlayID, pointerEvent) {
        if (overlayID === overlaySittable && pointerEvent.isLeftButton) {

            // Server checks if seat is occupied
            // if not occupied will call startSitDown()
            Entities.callEntityServerMethod(
                entityID, 
                "onSitDown",
                [MyAvatar.sessionUUID]
            );
        }
    };

    function sitAndPinAvatar() {

        sitDownSettlePeriod = Date.now() + SIT_SETTLE_TIME;

        MyAvatar.characterControllerEnabled = false;
        MyAvatar.hmdLeanRecenterEnabled = false;

        var roles = utils.rolesToOverride();

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

            if (HMD.active && showsPresitOverlay) {
                overlays.preSit.remove();
            }

            sittingDown = true;

            MyAvatar.pinJoint(index, seatCenterPosition, chairProperties.rotation);
            canStand = true;

            Script.update.connect(update);
            MyAvatar.scaleChanged.connect(standUp);
            location.hostChanged.connect(standUp);
            Script.scriptEnding.connect(standUp);

        }, SIT_DELAY);

    }

    function sitDown() {

        if (overlaySittable) {
            overlays.sittable.remove(); 
        }

        Settings.setValue(SETTING_KEY, entityID);

        utils.setHeadToHipsDistance();

        lockChairOnStandUp = Entities.getEntityProperties(entityID, 'locked').locked;
        Entities.editEntity(entityID, { locked: true });

        utils.calculatePinHipPosition();

        Script.setTimeout(function () {

            if (HMD.active && showsPresitOverlay) {

                overlays.preSit.create();

                Script.setTimeout(function () {
                    sitAndPinAvatar();
                }, OVERLAY_PRESIT_FRAME_DURATION * overlayPreSitLoaded.length);

            } else {
                sitAndPinAvatar();
            }

        }, SIT_DELAY);

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
        overlays.standUp.remove();

        canStand = false;

        Entities.callEntityServerMethod(entityID, "onStandUp");

        if (Settings.getValue(SETTING_KEY) === entityID) {

            Settings.setValue(SETTING_KEY, "");

            for (var i in OVERRIDDEN_DRIVE_KEYS) {
                MyAvatar.enableDriveKey(OVERRIDDEN_DRIVE_KEYS[i]);
            }

            var roles = utils.rolesToOverride();
            for (i in roles) {
                MyAvatar.restoreRoleAnimation(roles[i]);
            }
            MyAvatar.characterControllerEnabled = true;
            MyAvatar.hmdLeanRecenterEnabled = true;

            Script.setTimeout(function () {
                MyAvatar.centerBody();
            }, STANDUP_DELAY);

            sittingDown = false;
            sitDownSettlePeriod = null;
        
        }

        Script.update.disconnect(update);
        MyAvatar.scaleChanged.disconnect(standUp);
        location.hostChanged.disconnect(standUp);
        Script.scriptEnding.disconnect(standUp);
    }

    function update(dt) {

        var hasAvatarSpineError = false;
        var hasHeldDriveKey = false;
        var hasAvatarMovedTooFar = false;

        if (sittingDown === true && canStand) {

            if (overlaySittable !== null) {
                overlays.sittable.remove();
            }

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
                        overlays.standUp.create();
                    }

                    break;
                }
            }

            // Only standup if user has been pushing a drive key for RELEASE_TIME
            if (hasActiveDriveKey) {

                if (driveKeyPressedStart !== null) {
                    var elapsed = now - driveKeyPressedStart;
                    hasHeldDriveKey = elapsed > RELEASE_TIME;
                }

            } else {
                if (overlayStandUp) {
                    driveKeyPressedStart = null;
                    overlays.standUp.remove();
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

                // if head is more than certain distance from hips or less than certain distance, stand up
                var headPoseValue = Controller.getPoseValue(Controller.Standard.Head);
                headWorldPosition = Vec3.sum(Vec3.multiplyQbyV(MyAvatar.orientation, headPoseValue.translation),
                    MyAvatar.position);

                var headDeviation = Vec3.distance(headWorldPosition, seatCenterPosition);
                var headDeviationRatio = headDeviation / headToHipsDistance;

                if ((headDeviationRatio > ONE_HUNDRED_AND_TEN_PERCENT || headDeviationRatio < EIGHTY_PERCENT) &&
                    sitDownSettlePeriod && now > sitDownSettlePeriod) {

                    if (deviationTimeStart === null) {
                        deviationTimeStart = now;
                    }

                    var deviationTimeToStand = 500;
                    if (now - deviationTimeStart > deviationTimeToStand) {
                        hasAvatarSpineError = true;
                        deviationTimeStart = null;
                    }
                }
            }

            if (SITTING_DEBUG){
                print("update standup conditionals: ", hasAvatarSpineError, hasHeldDriveKey, hasAvatarMovedTooFar);
            }

            if (hasAvatarSpineError || hasHeldDriveKey || hasAvatarMovedTooFar) {
                standUp();
            }
        }
    }

    Overlays.mouseReleaseOnOverlay.connect(this.mouseReleaseOnOverlay);

    // Check if we've encountered a chair
    overlayCheckForHover = Script.setInterval(function () {

        overlays.showOrRemoveSittable();

    }, OVERLAY_CHECK_INTERVAL);

});