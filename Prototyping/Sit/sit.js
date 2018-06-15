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
 Vec3, HMD, Overlays, Camera, isInEditMode*/

 (function () {
    Script.include("/~/system/libraries/utils.js");
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.substr(position, searchString.length) === searchString;
        };
    }

    var showsPresitOverlay = true;

    var entityID = null;

    var SETTING_KEY = "com.highfidelity.avatar.isSitting";

    var ANIMATION_URL = "http://hifi-content.s3.amazonaws.com/alexia/Sitting_Idle.fbx";
    var ANIMATION_FPS = 30;
    var ANIMATION_FIRST_FRAME = 1;
    var ANIMATION_LAST_FRAME = 350;

    var RELEASE_TIME = 800; // ms

    var IK_SETTLE_TIME = 300; // ms
    var DISTANCE_FROM_CHAIR_TO_STAND_AT = 0.1;

    var OVERLAY_CHECK_INTERVAL = 500;
    var OVERLAY_SITTABLE_FADE = 50; // "Click/Trigger to Sit" overlay fade after 50 ms
    var OVERLAY_URL_SITTABLE_HMD = "http://hifi-content.s3.amazonaws.com/alexia/TriggerToSit.png";
    var OVERLAY_URL_SITTABLE_DESKTOP = "http://hifi-content.s3.amazonaws.com/alexia/ClickToSit.png";
    var OVERLAY_URL_STANDUP = "https://hifi-production.s3.amazonaws.com/robin/sit/HoldToStandUp.png";
    var OVERLAY_SITTABLE_MIN_ALPHA = 0.075;

    var OVERLAY_PRESIT_FRAME_DURATION = 160;
    var index = 0;

    var SITTABLE_DISTANCE_MAX = 5;
    var SIT_DELAY = 50; // ms

    var OVERLAY_SITTABLE_DISTANCE_SHOW = 3;
    var OVERLAY_SITTABLE_ALPHA_START = 0.7; // for overlayss

    var STANDUP_DELAY = 25;
    var SITTING_SEARCH_RADIUS = 0.01;

    var STANDUP_DISTANCE = 0.5; // meters

    var ONE_HUNDRED_AND_TEN_PERCENT = 1.1;
    var EIGHTY_PERCENT = 0.8;
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
    var chairOffsetRatio = 0.2;

    // for overlays
    var overlayIntervalTransparency = null;
    var overlaySittable = null;
    var overlayStandUp = null;
    var overlayPreSit = null;
    var overlayPreSitText = null;
    var overlayPreSitStart = null;
    var overlayPreSitLoaded = [];

    var OVERLAY_PRESIT_URL_ROOT = "https://hifi-production.s3.amazonaws.com/robin/sit/sitOverlayConfirm/sit-overlay-confirm-";
    var OVERLAY_PRESIT_URL_POSTFIX = ".png";
    var OVERLAY_PRESIT_URL_NUM = 12;
    var OVERLAY_PRESIT_URL_TEXT = "https://hifi-production.s3.amazonaws.com/robin/sit/sitOverlayConfirm/please-face-forward.png"
    var overlayCheckForHover = null;

    var animStateHandlerID = null;
    var sitDownSettlePeriod = null;
    var driveKeyPressedStart = null;
    var sittingDown = false;

    var headToHipsDistance = null;

    var chairProperties = null;
    var deadlockGate = false; // locks chair if someone has intent to sit

    var testing = true;

    var overlays = {

        sittable: {
            create: function () {
                utils.setChairProperties();

                // change the image based on what modality the user is in
                var url = HMD.active
                    ? OVERLAY_URL_SITTABLE_HMD
                    : OVERLAY_URL_SITTABLE_DESKTOP;

                overlaySittable = Overlays.addOverlay("image3d", {
                    position: { x: 0.0, y: 0.0, z: 0.0 },
                    rotation: Quat.multiply(chairProperties.rotation, Quat.fromVec3Degrees({ x: -90, y: 180, z: 0 })),
                    dimensions: {
                        x: 0.1,
                        y: 0.1
                    },
                    url: url,
                    ignoreRayIntersection: false,
                    alpha: OVERLAY_SITTABLE_ALPHA_START,
                    visible: true,
                    emissive: true
                });

                var overlayDimensions = {
                    x: 0.3,
                    y: 0.3
                };

                var overlayPosition = Vec3.sum(chairProperties.position, { x: 0, y: 0, z: 0 });

                Overlays.editOverlay(overlaySittable, {
                    position: overlayPosition,
                    dimensions: overlayDimensions
                });

            },
            remove: function () {
                if (overlaySittable !== null) {
                    Overlays.deleteOverlay(overlaySittable);
                    overlaySittable = null;
                }
            },
            shouldShow: function () {
                var seatPosition = Entities.getEntityProperties(entityID, ["position"]).position;
                var distanceFromSeat = Vec3.distance(MyAvatar.position, seatPosition);
                return distanceFromSeat < OVERLAY_SITTABLE_DISTANCE_SHOW && !utils.checkSeatForAvatar();
            },
            // This part is used to fade out the overlay over time
            lerpTransparency: function () {
                var startAlpha = OVERLAY_SITTABLE_ALPHA_START;
                var changeAlpha = 0.01;
                overlayIntervalTransparency = Script.setInterval(function () {
                    startAlpha = startAlpha - changeAlpha; // My new alpha
                    Overlays.editOverlay(overlaySittable, { alpha: startAlpha }); // Edit the existing overlay
                    if (startAlpha <= OVERLAY_SITTABLE_MIN_ALPHA) {
                        Script.clearInterval(overlayIntervalTransparency); // Stop my interval when it's faded out
                        overlayIntervalTransparency = null;
                    }
                }, OVERLAY_SITTABLE_FADE);
            },
        },

        preSit: {
            preload: function () {
                var str;
                for (var i = 0; i < OVERLAY_PRESIT_URL_NUM; i++) {
                    str = i + 1;
                    overlayPreSitLoaded[i] = TextureCache.prefetch(OVERLAY_PRESIT_URL_ROOT + str + OVERLAY_PRESIT_URL_POSTFIX);
                }
                OVERLAY_PRESIT_URL_TEXT = TextureCache.prefetch(OVERLAY_PRESIT_URL_TEXT);
            },
            create: function () {
                if (overlayPreSit) {
                    return;
                }

                overlayPreSit = Overlays.addOverlay("image3d", {
                    position: Vec3.sum(Camera.position, Vec3.multiplyQbyV(Camera.orientation, { x: 0, y: 0.1, z: -1 })),
                    rotation: Camera.orientation,
                    parentId: MyAvatar.sessionUUID,
                    parentJoint: "Head",
                    dimensions: { x: 0.2, y: 0.2 },
                    url: overlayPreSitLoaded[index].url,
                    ignoreRayIntersection: false,
                    drawInFront: true,
                    visible: true,
                    emissive: true
                });

                overlayPreSitText = Overlays.addOverlay("image3d", {
                    position: Vec3.sum(Camera.position, Vec3.multiplyQbyV(Camera.orientation, { x: 0, y: -0.05, z: -1 })),
                    rotation: Camera.orientation,
                    parentId: MyAvatar.sessionUUID,
                    parentJoint: "Head",
                    dimensions: { x: 0.425, y: 0.3 },
                    url: OVERLAY_PRESIT_URL_TEXT.url,
                    ignoreRayIntersection: false,
                    drawInFront: true,
                    visible: true,
                    emissive: true
                });

                overlayPreSitStart = Date.now();
            },
            remove: function () {
                if (overlayPreSit !== null) {
                    Overlays.deleteOverlay(overlayPreSit);
                    overlayPreSit = null;
                    overlayPreSitStart = 0;
                    index = 0;

                    if (overlayPreSitText !== null) {
                        Overlays.deleteOverlay(overlayPreSitText);
                    }
                }
            },
            update: function () {

                var now = Date.now();

                if (index >= overlayPreSitLoaded.length) {
                    return;
                }

                var cameraRotation = Camera.orientation;

                if (overlayPreSit) {

                    var updateObj = {
                        rotation: cameraRotation,
                        position: Vec3.sum(Camera.position, Vec3.multiplyQbyV(Camera.orientation, { x: 0, y: 0.1, z: -1 })),
                    }

                    var timePassed = now - overlayPreSitStart;
                    if (timePassed >= OVERLAY_PRESIT_FRAME_DURATION) {
                        overlayPreSitStart = now;
                        index = index + 1;
                        updateObj.url = overlayPreSitLoaded[index].url;
                    }

                    Overlays.editOverlay(overlayPreSit, updateObj);
                    Overlays.editOverlay(overlayPreSitText, {
                        rotation: cameraRotation,
                        position: Vec3.sum(Camera.position, Vec3.multiplyQbyV(Camera.orientation, { x: 0, y: -0.05, z: -1 })),
                    });
                }
            },

        },

        standUp: {
            create: function () {
                if (overlayStandUp === null) {
                    overlayStandUp = Overlays.addOverlay("image3d", {
                        position: Vec3.sum(Camera.position, Vec3.multiplyQbyV(Camera.orientation, { x: 0, y: 0, z: -1 })),
                        rotation: Camera.orientation,
                        parentId: MyAvatar.sessionUUID,
                        parentJoint: "Head",
                        dimensions: { x: 0.2, y: 0.2 },
                        url: OVERLAY_URL_STANDUP,
                        ignoreRayIntersection: false,
                        drawInFront: true,
                        visible: true,
                        emissive: true
                    });
                }
            },
            remove: function () {
                if (overlayStandUp) {
                    Overlays.deleteOverlay(overlayStandUp);
                    overlayStandUp = null;
                }
            },
            update: function () {
                if (overlayStandUp) {
                    Overlays.editOverlay(overlayStandUp, { // too inefficient
                        rotation: Camera.orientation,
                        position: Vec3.sum(Camera.position, Vec3.multiplyQbyV(Camera.orientation, { x: 0, y: 0, z: -1 }))
                    });
                }
            }
        },

        showSittable: function () { // Show overlays when I'm close to the seat

            if (isInEditMode()) {
                return;
            }

            if (overlaySittable === null) { // Make an overlay if there isn't one
                if (this.sittable.shouldShow()) {
                    this.sittable.create();
                    if (overlayIntervalTransparency === null) {
                        this.sittable.lerpTransparency();
                    }
                }
            } else if (!utils.canSitDesktop()) {
                this.sittable.remove();
            }
        }
    };

    var utils = {

        // Is the seat used
        checkSeatForAvatar: function () {
            return deadlockGate;

            // var isOccupied = false;

            // if(deadlockGate) {
            // return true;
            // }

            // var nearbyAvatars = AvatarList.getAvatarsInRange(seatCenterPosition, SITTING_SEARCH_RADIUS);

            // if (nearbyAvatars.length > 0) {
            // isOccupied = true;
            // }

            // if(deadlockGate){
            // isOccupied = true;
            // }

            // return isOccupied;
        },
        rolesToOverride: function () {
            return MyAvatar.getAnimationRoles().filter(function (role) {
                return !(role.startsWith("right") || role.startsWith("left"));
            });
        },
        canSitDesktop: function () {
            if (!chairProperties) this.setChairProperties();
            var distanceFromSeat = Vec3.distance(MyAvatar.position, chairProperties.position);
            return distanceFromSeat < SITTABLE_DISTANCE_MAX && !this.checkSeatForAvatar();
        },

        calculatePinHipPosition: function () {
            if (!chairProperties) this.setChairProperties();

            // get chairProperties to calculate middle of chair
            seatCenterPosition = chairProperties.position;

            var yOffset = chairProperties.dimensions.y / 2 * chairOffsetRatio;
            seatCenterPosition = {
                x: chairProperties.position.x,
                y: chairProperties.position.y + yOffset,
                z: chairProperties.position.z
            };
        },

        setHeadToHipsDistance: function () { // used in update checks for Avatar Spine Error
            // get hips world pos while sitting
            if ((MyAvatar.getJointIndex("Head") === -1) || (MyAvatar.getJointIndex("Hips") === -1)) {
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
            chairProperties = Entities.getEntityProperties(entityID, ["dimensions", "registrationPoint", "position", "rotation"]);
        }

    };

    // Preload the animation file
    this.animation = AnimationCache.prefetch(ANIMATION_URL);

    this.preload = function (id) {
        entityID = id;

        overlays.preSit.preload();
        utils.setChairProperties();
    };

    this.unload = function () {
        if (Settings.getValue(SETTING_KEY) === entityID) {
            standUp();
        }

        if (overlayIntervalTransparency !== null) {
            Script.clearInterval(overlayIntervalTransparency);
            overlayIntervalTransparency = null;
        }

        if (overlayCheckForHover !== null) {
            Script.clearInterval(overlayCheckForHover);
            overlayCheckForHover = null;
        }

        if (overlaySittable) overlays.sittable.remove();
        if (overlayPreSit) overlays.preSit.remove();
        if (overlayStandUp) overlays.standUp.remove();

    };

    function sitAndPinAvatar() {

        Settings.setValue(SETTING_KEY, entityID);
        sitDownSettlePeriod = Date.now() + IK_SETTLE_TIME;

        print(4);

        // MyAvatar.resetSensorsAndBody();

        print(5);
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

        // var hipLocalRotation = MyAvatar.getJointRotation(index);
        // var hipWorldRotation = Quat.multiply(MyAvatar.orientation, hipLocalRotation);
        // var yawHipWorldRotation = Quat.cancelOutRollAndPitch(hipWorldRotation);

        Script.setTimeout(function () {

            print(6, JSON.stringify(chairProperties.rotation));

            if ((HMD.active || testing) && showsPresitOverlay) {
                Script.update.disconnect(overlays.preSit.update);
                overlays.preSit.remove();
            }


            MyAvatar.pinJoint(index, seatCenterPosition, chairProperties.rotation);
            canStand = true;

            Script.update.connect(update);
            MyAvatar.scaleChanged.connect(standUp);
            location.hostChanged.connect(standUp);

        }, SIT_DELAY);

        animStateHandlerID = MyAvatar.addAnimationStateHandler(function (avatarProperties) {
            return { headType: 0 };
        }, ["headType"]);

    }

    function sitDown() {
        print("SIT DOWN");

        // if (utils.checkSeatForAvatar()) {
        //     print("Someone is already sitting in that chair.");
        //     return;
        // }

        if (overlaySittable !== null) {
            overlays.sittable.remove();
        }

        utils.setHeadToHipsDistance();

        sittingDown = true;

        lockChairOnStandUp = Entities.getEntityProperties(entityID, 'locked').locked;
        Entities.editEntity(entityID, { locked: true });

        utils.calculatePinHipPosition();

        Script.setTimeout(function () {

            if ((HMD.active || testing) && showsPresitOverlay) {

                overlays.preSit.create();
                Script.update.connect(overlays.preSit.update);

                Script.setTimeout(function () {
                    sitAndPinAvatar();
                }, OVERLAY_PRESIT_FRAME_DURATION * overlayPreSitLoaded.length);

            } else {
                sitAndPinAvatar();
            }

        }, SIT_DELAY);

    };

    function standUp() {

        var avatarDistance = Vec3.distance(MyAvatar.position, seatCenterPosition);


        Script.setTimeout(function () {
            // Move avatar in front of the chair to avoid getting stuck in collision hulls
            if (avatarDistance < STANDUP_DISTANCE) {
                var index = MyAvatar.getJointIndex("Hips");
                MyAvatar.clearPinOnJoint(index);
                var offset = { x: 0, y: 1.0, z: -1 / 2 - chairProperties.dimensions.z * chairProperties.registrationPoint.z };
                var position = Vec3.sum(chairProperties.position, Vec3.multiplyQbyV(chairProperties.rotation, offset));
                MyAvatar.position = position;
            }
        }, 50);

        if (!lockChairOnStandUp) {
            Entities.editEntity(entityID, { locked: false });
        }
        driveKeyPressedStart = null;
        overlays.standUp.remove();

        Script.update.disconnect(update);
        MyAvatar.scaleChanged.disconnect(standUp);
        location.hostChanged.disconnect(standUp);

        canStand = false;
        MyAvatar.removeAnimationStateHandler(animStateHandlerID);

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

        }
        sittingDown = false;
        deadlockGate = false;
    };

    // User can also click on overlay to sit down
    this.mouseReleaseOnOverlay = function (overlayID, pointerEvent) {
        print("Mouse release");
        if (overlayID === overlaySittable && pointerEvent.isLeftButton) {
            print("CAN SIT", deadlockGate, Settings.getValue(SETTING_KEY));
            deadlockGate = true;
            if (Settings.getValue(SETTING_KEY) === "") {
                sitDown();
            } else {
                deadlockGate = false;
            }
        }
    };

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
                if (MyAvatar.getRawDriveKey(OVERRIDDEN_DRIVE_KEYS[i]) != 0.0) {
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
                    overlays.standUp.update();
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
            if (avatarDistance > DISTANCE_FROM_CHAIR_TO_STAND_AT && now > sitDownSettlePeriod) {
                hasAvatarMovedTooFar = true;
            }

            // AVATAR SPINE ERROR
            if (HMD.active) {

                var headWorldPosition;
                if (MyAvatar.getJointIndex("Head") !== -1) {

                    // if head is more than certain distance from hips or less than certain distance, stand up
                    var headPoseValue = Controller.getPoseValue(Controller.Standard.Head);
                    headWorldPosition = Vec3.sum(Vec3.multiplyQbyV(MyAvatar.orientation, headPoseValue.translation), 
                        MyAvatar.position);
                } else {

                    // Avatar has no head joint
                    print("I haz no head!!!");
                    var tempPosition = MyAvatar.position;
                    tempPosition.y += headToHipsDistance;
                    headWorldPosition = tempPosition; // this is just sitting up straight, not calculating head position
                }

                var headDeviation = Vec3.distance(headWorldPosition, seatCenterPosition);
                // print("headDeviation is ", headDeviation);
                // print("headToHipsDistance: ", headToHipsDistance);
                var deviationRatio = headDeviation/headToHipsDistance;

                if ((deviationRatio > ONE_HUNDRED_AND_TEN_PERCENT || deviationRatio < EIGHTY_PERCENT) && 
                    now > sitDownSettlePeriod) {

                    // print("large deviation");
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

            if (hasAvatarSpineError || hasHeldDriveKey || hasAvatarMovedTooFar) {
                standUp();
                print("ROBIN ", hasAvatarSpineError, hasHeldDriveKey, hasAvatarMovedTooFar);
            }
        }
    };

    Overlays.mouseReleaseOnOverlay.connect(this.mouseReleaseOnOverlay);

    // Run my method to check if we've encountered a chair
    overlayCheckForHover = Script.setInterval(function () {

        if (isInEditMode()) {
            if (overlaySittable) {
                overlays.sittable.remove();
            }
        } else {
            overlays.showSittable();
        }
    }, OVERLAY_CHECK_INTERVAL);

});