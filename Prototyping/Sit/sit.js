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

    var SETTING_KEY = "com.highfidelity.avatar.isSitting";

    var ANIMATION_URL = "http://hifi-content.s3.amazonaws.com/alexia/Sitting_Idle.fbx";
    var ANIMATION_FPS = 30;
    var ANIMATION_FIRST_FRAME = 1;
    var ANIMATION_LAST_FRAME = 350;

    var RELEASE_TIME = 800; // ms

    var IK_MAX_ERROR = 35;
    var IK_SETTLE_TIME = 250; // ms
    var DISTANCE_FROM_CHAIR_TO_STAND_AT = 0.1;

    var OVERLAY_CHECK_INTERVAL = 500;
    var OVERLAY_SITTABLE_FADE = 50; // "Click/Trigger to Sit" overlay fade after 50 ms
    var OVERLAY_URL_SITTABLE_HMD = "http://hifi-content.s3.amazonaws.com/alexia/TriggerToSit.png";
    var OVERLAY_URL_SITTABLE_DESKTOP = "http://hifi-content.s3.amazonaws.com/alexia/ClickToSit.png";
    var OVERLAY_URL_STANDUP = "https://hifi-production.s3.amazonaws.com/robin/sit/HoldToStandUp.png";
    var OVERLAY_SITTABLE_MIN_ALPHA = 0.075;

    var SITTABLE_DISTANCE_MAX = 5;
    var SIT_DELAY = 50; // ms

    var OVERLAY_SITTABLE_DISTANCE_SHOW = 3;
    var OVERLAY_SITTABLE_ALPHA_START = 0.7; // for overlayss

    var STANDUP_DELAY = 25;
    var SITTING_SEARCH_RADIUS = 0.01;

    var STANDUP_DISTANCE = 0.5; // meters

    var OVERRIDDEN_DRIVE_KEYS = [
        DriveKeys.TRANSLATE_X,
        DriveKeys.TRANSLATE_Y,
        DriveKeys.TRANSLATE_Z,
        DriveKeys.STEP_TRANSLATE_X,
        DriveKeys.STEP_TRANSLATE_Y,
        DriveKeys.STEP_TRANSLATE_Z
    ];

    var GENERIC_SEAT_Y_OFFSET = 0.1;

    var entityID = null;
    var that = this;

    var canStand = false;
    var lockChairOnStandUp = null;
    var seatCenterPosition = null;
    var chairOffsetRatio = 0.2;

    // for overlays
    var overlayIntervalTransparency = null;
    var overlaySittable = null;
    var overlayStandUp = null;
    var overlayCheckForHover = null;

    var animStateHandlerID = null;
    var sitDownSettlePeriod = null;
    var driveKeyPressedStart = null;
    var sittingDown = false;

    var getStartTriggerID = null;
    var END_TRIGGER_TIMEOUT = 500;

    var overlays = {

        createSittableOverlay: function () {

            // change the image based on what modality the user is in
            var url = HMD.active
                ? OVERLAY_URL_SITTABLE_HMD
                : OVERLAY_URL_SITTABLE_DESKTOP;

            var chairRotation = Entities.getEntityProperties(entityID, 'rotation').rotation;
            overlaySittable = Overlays.addOverlay("image3d", {
                position: { x: 0.0, y: 0.0, z: 0.0 },
                rotation: Quat.multiply(chairRotation, Quat.fromVec3Degrees({ x: -90, y: 180, z: 0 })),
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

            var properties = Entities.getEntityProperties(entityID,
                ["position", "registrationPoint", "dimensions", "rotation"]);

            var overlayPosition = Vec3.sum(properties.position, { x: 0, y: 0, z: 0 });

            Overlays.editOverlay(overlaySittable, {
                position: overlayPosition,
                dimensions: overlayDimensions
            });

        },

        cleanupSittableOverlay: function () {
            print("inside cleanup crew");
            if (overlaySittable !== null) {
                Overlays.deleteOverlay(overlaySittable);
                overlaySittable = null;
            }
        },

        shouldShowSittableOverlay: function () {
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

        showOverlays: function () { // Show overlays when I'm close to the seat

            if (isInEditMode()) {
                return;
            }

            if (overlaySittable === null) { // Make an overlay if there isn't one
                if (this.shouldShowSittableOverlay()) {
                    this.createSittableOverlay();
                    if (overlayIntervalTransparency === null) {
                        this.lerpTransparency();
                    }
                }
            } else if (!utils.canSitDesktop()) {
                this.cleanupSittableOverlay();
            }
        }
    };

    var utils = {

        // Is the seat used
        checkSeatForAvatar: function () {
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
        canSitDesktop: function () {
            var distanceFromSeat = Vec3.distance(MyAvatar.position, seatCenterPosition);
            return distanceFromSeat < SITTABLE_DISTANCE_MAX && !this.checkSeatForAvatar();
        }

    };

    // Preload the animation file
    this.animation = AnimationCache.prefetch(ANIMATION_URL);

    this.preload = function (id) {
        entityID = id;

        // get chairProperties to calculate middle of chair
        var chairProperties = Entities.getEntityProperties(entityID, ['dimensions', 'userData', 'position']);
        var userData = null;
        try {
            userData = JSON.parse(chairProperties.userData);
        } catch (e) {
            print("Error parsing userData");
        }

        if (userData && userData.seatCenterPosition) {
            seatCenterPosition = userData.seatCenterPosition;
        } else {
            seatCenterPosition = chairProperties.position;

            var yOffset = chairProperties.dimensions.y / 2 * chairOffsetRatio;
            seatCenterPosition = {
                x: chairProperties.position.x,
                y: chairProperties.position.y + yOffset,
                z: chairProperties.position.z
            };
        }
    };

    this.unload = function () {
        if (Settings.getValue(SETTING_KEY) === entityID) {
            this.standUp();
        }

        if (overlayIntervalTransparency !== null) {
            Script.clearInterval(overlayIntervalTransparency);
            overlayIntervalTransparency = null;
        }

        if (overlayCheckForHover !== null) {
            Script.clearInterval(overlayCheckForHover);
            overlayCheckForHover = null;
        }

        overlays.cleanupSittableOverlay();
    };

    this.sitDown = function () {

        if (utils.checkSeatForAvatar()) {
            print("Someone is already sitting in that chair.");
            return;
        }

        if (overlaySittable !== null) {
            overlays.cleanupSittableOverlay();
        }

        sittingDown = true;
        lockChairOnStandUp = Entities.getEntityProperties(entityID, 'locked').locked;
        Entities.editEntity(entityID, { locked: true });
        var now = Date.now();
        sitDownSettlePeriod = now + IK_SETTLE_TIME;

        var previousValue = Settings.getValue(SETTING_KEY);
        Settings.setValue(SETTING_KEY, entityID);
        if (previousValue === "") {
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
        }

        var index = MyAvatar.getJointIndex("Hips");
        var hipLocalRotation = MyAvatar.getJointRotation(index);
        var hipWorldRotation = Quat.multiply(MyAvatar.orientation, hipLocalRotation);
        var yawHipWorldRotation = Quat.cancelOutRollAndPitch(hipWorldRotation);

        Script.setTimeout(function () {
            MyAvatar.pinJoint(index, seatCenterPosition, yawHipWorldRotation);
            canStand = true;

        }, SIT_DELAY);
        animStateHandlerID = MyAvatar.addAnimationStateHandler(function (avatarProperties) {
            return { headType: 0 };
        }, ["headType"]);

        Script.update.connect(this, this.update);
        MyAvatar.scaleChanged.connect(this.standUp);
        location.hostChanged.connect(this.standUp);

    };

    this.standUp = function () {

        var avatarDistance = Vec3.distance(MyAvatar.position, seatCenterPosition);
        var properties = Entities.getEntityProperties(entityID, ['dimensions', 'registrationPoint', 'position', 'rotation']);

        // Move avatar in front of the chair to avoid getting stuck in collision hulls
        if (avatarDistance < STANDUP_DISTANCE) {
            var index = MyAvatar.getJointIndex("Hips");
            MyAvatar.clearPinOnJoint(index);
            var offset = { x: 0, y: 1.0, z: -1 / 2 - properties.dimensions.z * properties.registrationPoint.z };
            var position = Vec3.sum(properties.position, Vec3.multiplyQbyV(properties.rotation, offset));
            MyAvatar.position = position;
        }

        if (!lockChairOnStandUp) {
            Entities.editEntity(entityID, { locked: false });
        }
        driveKeyPressedStart = null;
        if (overlayStandUp) {
            Overlays.deleteOverlay(overlayStandUp);
            overlayStandUp = null;
        }

        Script.update.disconnect(this, this.update);
        MyAvatar.scaleChanged.disconnect(this.standUp);
        location.hostChanged.connect(this.standUp);
        
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
                // MyAvatar.centerBody();
                MyAvatar.resetSensorsAndBody();
            }, STANDUP_DELAY);

        }
        sittingDown = false;
    };

    // User can also click on overlay to sit down
    this.mouseReleaseOnOverlay = function (overlayID, pointerEvent) {
        if (overlayID === overlaySittable && pointerEvent.isLeftButton) {
            print("MOUSE RELEASE OVERLAY SIT");
            that.sitDown();
        }
    };

    this.update = function (dt) {
        var shouldStandUp = false;

        if (sittingDown === true && canStand) {

            if (overlaySittable !== null) {
                overlays.cleanupSittableOverlay();
            }

            var now = Date.now();

            // Check if a drive key is pressed
            var hasActiveDriveKey = false;
            for (var i in OVERRIDDEN_DRIVE_KEYS) {
                if (MyAvatar.getRawDriveKey(OVERRIDDEN_DRIVE_KEYS[i]) != 0.0) {
                    hasActiveDriveKey = true;

                    if (driveKeyPressedStart === null) {
                        driveKeyPressedStart = Date.now();
                    }

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
                    break;
                }
            }


            // Only standup if user has been pushing a drive key for RELEASE_TIME
            if (hasActiveDriveKey) {
                if (driveKeyPressedStart !== null) {

                    Overlays.editOverlay(overlayStandUp, { // too inefficient 
                        rotation: Camera.orientation,
                        position: Vec3.sum(Camera.position, Vec3.multiplyQbyV(Camera.orientation, { x: 0, y: 0, z: -1 }))
                    });

                    var elapsed = now - driveKeyPressedStart;
                    shouldStandUp = elapsed > RELEASE_TIME;

                }

            } else {
                this.ww = Date.now();
                if (overlayStandUp) {
                    driveKeyPressedStart = null;
                    Overlays.deleteOverlay(overlayStandUp);
                    overlayStandUp = null;
                }
            }

            var avatarDistance = Vec3.distance(MyAvatar.position, seatCenterPosition);
            if (avatarDistance > DISTANCE_FROM_CHAIR_TO_STAND_AT) {
                shouldStandUp = true;
            }
            var ikError = MyAvatar.getIKErrorOnLastSolve();
            // Allow some time for the IK to settle
            if (ikError > IK_MAX_ERROR && now > sitDownSettlePeriod) {
                shouldStandUp = true;
            }

            if (shouldStandUp) {
                this.standUp();
            }
        }
    };

    Overlays.mouseReleaseOnOverlay.connect(this.mouseReleaseOnOverlay);

    // Run my method to check if we've encountered a chair
    overlayCheckForHover = Script.setInterval(function () {
        overlays.showOverlays();
    }, OVERLAY_CHECK_INTERVAL);

});
