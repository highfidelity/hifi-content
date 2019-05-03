(function () {

    var _this;

    var DEBUG = true;

    var localEntityUtils = Script.require("https://hifi-content.s3.amazonaws.com/robin/dev/marketplaceItems/sitv2/v1/localEntityUtils.js?" + Math.random());


    // String utility
    function startsWith(str, searchString, position) {
        position = position || 0;
        return str.substr(position, searchString.length) === searchString;
    }

    function rolesToOverride() {
        // Get all animation roles that sit will override
        return MyAvatar.getAnimationRoles().filter(function (role) {
            return !(startsWith(role, "right") || startsWith(role, "left"));
        });
    }

    var STANDUP_DISTANCE_M = 0.5; // m 
    var CHAIR_DISMOUNT_OFFSET_M = -0.5; // m in front of chair 
    var STANDUP_DELAY_MS = 25; // ms for timeout in standup
    function standUp() {
        if (DEBUG) {
            console.log("standup");
        }

        var avatarDistance = Vec3.distance(MyAvatar.position, _this.seatCenterPosition);
        var properties = Entities.getEntityProperties(_this.entityID);
        MyAvatar.clearPinOnJoint(MyAvatar.getJointIndex("Hips"));
        if (avatarDistance < STANDUP_DISTANCE_M) {
            // Avatar did not teleport far away from chair
            // Therefore apply previous position OR the default dismount position and orientation
            if (_this.previousAvatarOrientation && _this.previousAvatarPosition) {
                MyAvatar.position = _this.previousAvatarPosition;
                MyAvatar.orientation = _this.previousAvatarOrientation;
            } else {
                var offset = {
                    x: 0,
                    y: 1.0,
                    z: CHAIR_DISMOUNT_OFFSET_M - properties.dimensions.z * properties.registrationPoint.z
                };
                var position = Vec3.sum(properties.position, Vec3.multiplyQbyV(properties.rotation, offset));
                MyAvatar.position = position;
            }
        }

        if (!_this.locked) {
            Entities.editEntity(_this.entityID, { locked: false });
        }

        _this.driveKeyPressedStart = false;
        _this.sitDownSettlePeriod = false;
        _this.isSittingDown = false;
        deleteStandUp();

        // Entities.callEntityServerMethod(_this.entityID, "onStandUp");

        if (Settings.getValue(SETTING_KEY_AVATAR_SITTING) === _this.entityID) {
            // Check if avatar is getting out of this chair

            Settings.setValue(SETTING_KEY_AVATAR_SITTING, "");

            // enable drive keys
            for (var i in OVERRIDDEN_DRIVE_KEYS) {
                MyAvatar.enableDriveKey(OVERRIDDEN_DRIVE_KEYS[i]);
            }

            // enable roles
            var roles = rolesToOverride();
            for (var j in roles) {
                MyAvatar.restoreRoleAnimation(roles[j]);
            }
            MyAvatar.collisionsEnabled = true;
            MyAvatar.hmdLeanRecenterEnabled = true;

            Script.setTimeout(function () {
                MyAvatar.centerBody();
            }, STANDUP_DELAY_MS);

        } else {
            // Avatar switched to another chair, do not reapply the animation roles
        }

        stopUpdateInterval();

        MyAvatar.scaleChanged.disconnect(_this.standUp);
        MyAvatar.onLoadComplete.disconnect(_this.standUp);
        location.hostChanged.disconnect(_this.standUp);
        Script.scriptEnding.disconnect(_this.standUp);
        MyAvatar.skeletonModelURLChanged.disconnect(_this.standUp);
        MyAvatar.wentAway.disconnect(_this.standUp);
    }

    // Checks for Avatar Spine Error
    var NEG_ONE = -1;
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

    // function sendRequestToServerScriptToStartSitDown() {
    //     Entities.callEntityServerMethod(
    //         _this.entityID,
    //         "onSitDown",
    //         [MyAvatar.sessionUUID]
    //     );
    // }

    // Called from entity server script to begin sitting down sequence
    var SETTING_KEY_AVATAR_SITTING = "com.highfidelity.avatar.isSitting";
    var SIT_SETTLE_TIME_MS = 350; // Do not pop avatar out of chair immediates if there's an issue
    var STANDUP_DELAY_MS = 25; // ms for timeout in standup
    var SIT_DELAY_MS = 50; // ms for timeouts in sit
    function startSitDown() {
        console.log("startSitDown");

        _this.previousAvatarOrientation = MyAvatar.orientation;
        _this.previousAvatarPosition = MyAvatar.position;

        createPresit();
        deleteSittableUI();

        Script.setTimeout(function () {
            // Set the value of head to hips distance
            // If avatar deviates outside of the minimum and maximum, the avatar will pop out of the chair
            setHeadToHipsDistance();

            // Set isSitting value in Settings
            Settings.setValue(SETTING_KEY_AVATAR_SITTING, _this.entityID);

            // Lock chair and save old setting
            this.locked = Entities.getEntityProperties(_this.entityID, 'locked').locked;
            Entities.editEntity(_this.entityID, { locked: true });

            calculateSeatCenterPositionForPinningAvatarHips();

            sitDownAndPinAvatar();
        }, PRESIT_FRAME_DURATION * _this.preSitLoadedImages.length);
    }

    var ANIMATION_URL = "https://hifi-content.s3.amazonaws.com/robin/dev/marketplaceItems/sitv2/v1/animations/sittingIdle.fbx"; // Script.resolvePath("./resources/animations/sittingIdle.fbx");
    var ANIMATION_FPS = 30;
    var ANIMATION_FIRST_FRAME = 1;
    var ANIMATION_LAST_FRAME = 350;
    var UPDATE_INTERVAL_MS = 50;
    var OVERRIDDEN_DRIVE_KEYS = [
        DriveKeys.TRANSLATE_X,
        DriveKeys.TRANSLATE_Y,
        DriveKeys.TRANSLATE_Z,
        DriveKeys.STEP_TRANSLATE_X,
        DriveKeys.STEP_TRANSLATE_Y,
        DriveKeys.STEP_TRANSLATE_Z
    ];
    function sitDownAndPinAvatar() {
        MyAvatar.collisionsEnabled = false;
        MyAvatar.hmdLeanRecenterEnabled = false;

        var roles = rolesToOverride();
        for (var i in roles) { // restore roles to prevent overlap
            MyAvatar.restoreRoleAnimation(roles[i]);
            MyAvatar.overrideRoleAnimation(roles[i], ANIMATION_URL, ANIMATION_FPS, true,
                ANIMATION_FIRST_FRAME, ANIMATION_LAST_FRAME);
        }
        for (var j in OVERRIDDEN_DRIVE_KEYS) {
            MyAvatar.disableDriveKey(OVERRIDDEN_DRIVE_KEYS[j]);
        }

        MyAvatar.centerBody();
        var hipIndex = MyAvatar.getJointIndex("Hips");

        var properties = Entities.getEntityProperties(_this.entityID);

        Script.setTimeout(function () {

            // if (HMD.active && SHOW_PRESIT_IMAGE_IN_HMD) {
            //     preSitRemove();
            // }

            _this.isSittingDown = true;
            _this.sitDownSettlePeriod = Date.now() + SIT_SETTLE_TIME_MS;

            MyAvatar.pinJoint(hipIndex, _this.seatCenterPosition, properties.rotation);

            stopUpdateInterval();

            _this.whileSittingUpdateIntervalID = Script.setInterval(_this.whileSittingUpdate, UPDATE_INTERVAL_MS);

            deleteSittableUI();

            MyAvatar.scaleChanged.connect(_this.standUp);
            MyAvatar.onLoadComplete.connect(_this.standUp);
            location.hostChanged.connect(_this.standUp);
            Script.scriptEnding.connect(_this.standUp);
            MyAvatar.skeletonModelURLChanged.connect(_this.standUp);
            MyAvatar.wentAway.connect(_this.standUp);
        }, SIT_DELAY_MS);
    }

    function stopUpdateInterval() {
        if (_this.whileSittingUpdateIntervalID) {
            Script.clearInterval(_this.whileSittingUpdateIntervalID);
            _this.whileSittingUpdateIntervalID = false;
        }
    }

    var AVATAR_MOVED_TOO_FAR_DISTANCE_M = 0.5;
    var MAX_HEAD_DEVIATION_RATIO = 1.2;
    var MIN_HEAD_DEVIATION_RATIO = 0.8;
    var DRIVE_KEY_RELEASE_TIME_MS = 800; // ms
    var HEAD_DEVIATION_MAX_TIME_TO_STAND_MS = 1000;
    function whileSittingUpdate() {
        var now = Date.now();

        // ACTIVE DRIVE KEY
        // Check if a drive key is pressed
        var hasActiveDriveKey = false;
        for (var i in OVERRIDDEN_DRIVE_KEYS) {
            if (MyAvatar.getRawDriveKey(OVERRIDDEN_DRIVE_KEYS[i]) !== 0.0) {
                hasActiveDriveKey = true;
                if (!_this.driveKeyPressedStart) {
                    _this.driveKeyPressedStart = now;
                }
                if (!_this.standUpID) {
                    createStandUp();
                    if (DEBUG) {
                        console.log("active drive key pressed once");
                    }
                }
                break;
            }
        }

        // Only standup if user has been pushing a drive key for DRIVE_KEY_RELEASE_TIME_MS
        if (hasActiveDriveKey) {
            if (_this.driveKeyPressedStart && (now - _this.driveKeyPressedStart) > DRIVE_KEY_RELEASE_TIME_MS) {
                _this.standUp();
                if (DEBUG) {
                    console.log("active drive key pressed caused standup");
                }

            }
        } else {
            if (_this.standUpID) {
                _this.driveKeyPressedStart = false;
                deleteStandUp();
            }
        }

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
            var headDeviationRatio = headDeviation / headToHipsDistance;

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
        // if (SITTING_DEBUG) {
        //     print("update standup conditionals: ", hasAvatarSpineError, hasHeldDriveKey, hasAvatarMovedTooFar);
        // }

        // if (hasAvatarSpineError || hasHeldDriveKey || hasAvatarMovedTooFar) {
        //     standUp();
        // }
    }

    function unload() {
        deleteSittableUI();
        deleteCanSitZone();
        deletePresit();
    }

    function onEnterCanSitZone() {
        console.log("onEnterCanSitZone");
        if (!_this.sittableUIID) {
            createSittableUI();
        }
    }

    function onLeaveCanSitZone() {
        console.log("onLeaveCanSitZone");
        deleteSittableUI();
    }

    //#region PRESIT - LOCAL ENTITY shown in HMD before sitting and after clicking sittable overlay
    // Has the sitting animation and "Please Face Forward"

    var PRESIT_FRAME_DURATION = 160; // ms time duration for HMD presit overlay
    var PRESIT_URL_ROOT = "https://hifi-content.s3.amazonaws.com/robin/dev/marketplaceItems/sitv2/v1/images/presit/sitConfirm"// "./images/presit/sitConfirm"; 
    var PRESIT_URL_POSTFIX = ".png";
    var PRESIT_URL_NUM = 12;
    var PRESIT_URL_TEXT = "https://hifi-content.s3.amazonaws.com/robin/dev/marketplaceItems/sitv2/v1/images/presit/pleaseFaceForward.png"; // Script.resolvePath("./images/presit/pleaseFaceForward.png");
    // Prefetch all presit overlay images into user's client
    function prefetchPresitImages() {
        var str;
        for (var i = 0; i < PRESIT_URL_NUM; i++) {
            str = i + 1;
            _this.preSitLoadedImages[i] = TextureCache.prefetch(Script.resolvePath(PRESIT_URL_ROOT + str + PRESIT_URL_POSTFIX));
            console.log()
        }
        _this.preSitTextLoadedImage = TextureCache.prefetch(PRESIT_URL_TEXT);
    }

    var SIT_ANIMATION_POSITION_IN_FRONT = { x: 0, y: 0.1, z: -1 };
    var SIT_ANIMATION_DIMENSIONS = { x: 0.2, y: 0.2 };
    var PLEASE_FACE_FORWARD_POSITION_IN_FRONT = { x: 0, y: -0.05, z: -1 };
    var PLEASE_FACE_FORWARD_DIMENSIONS = { x: 0.425, y: 0.425 };
    function createPresit() {
        var currentPresitAnimationFrame = 0;
        _this.presitAnimationImageID = Entities.addEntity(
            localEntityUtils.getEntityPropertiesForImageInFrontOfCamera(
                SIT_ANIMATION_POSITION_IN_FRONT,
                SIT_ANIMATION_DIMENSIONS,
                _this.preSitLoadedImages[currentPresitAnimationFrame].url
            ),
            "local"
        );

        _this.presitTextID = Entities.addEntity(
            localEntityUtils.getEntityPropertiesForImageInFrontOfCamera(
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
                Entities.editEntity(_this.presitAnimationImageID, { imageURL: _this.preSitLoadedImages[currentPresitAnimationFrame].url });
            }
        }, PRESIT_FRAME_DURATION);
    }

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

    //#endregion PRESIT

    //#region HOLD TO STANDUP

    var OVERLAY_URL_STANDUP = "https://hifi-content.s3.amazonaws.com/robin/dev/marketplaceItems/sitv2/v1/images/holdToStandUp.png";// Script.resolvePath("./resources/images/holdToStandUp.png");
    var STAND_UP_POSITION_IN_FRONT = { x: 0, y: 0, z: -1 };
    var STAND_UP_DIMENSIONS = { x: 0.2, y: 0.2 };
    function createStandUp() {
        if (DEBUG) {
            console.log("creating standup")
        }

        _this.standUpID = Entities.addEntity(
            localEntityUtils.getEntityPropertiesForImageInFrontOfCamera(
                STAND_UP_POSITION_IN_FRONT,
                STAND_UP_DIMENSIONS,
                OVERLAY_URL_STANDUP
            ),
            "local"
        );
    }

    function deleteStandUp() {
        if (_this.standUpID) {
            Entities.deleteEntity(_this.standUpID);
            _this.standUpID = false;
        }
    }

    //#endregion HOLD TO STANDUP

    //#region SITTABLE 

    var UI_DEBUG = true;

    var SITTABLE_START_ALPHA = 0.7;
    var SITTABLE_DIMENSIONS = { x: 0.3, y: 0.3 };
    var SITTABLE_IMAGE_URL_HMD = "https://hifi-content.s3.amazonaws.com/robin/dev/marketplaceItems/sitv2/v1/images/triggerToSit.png"; // Script.resolvePath("./images/triggerToSit.png");
    var SITTABLE_IMAGE_URL_DESKTOP = "https://hifi-content.s3.amazonaws.com/robin/dev/marketplaceItems/sitv2/v1/images/clickToSit.png"; // Script.resolvePath("./images/clickToSit.png");
    var SITTABLE_Y_OFFSET = 0.01;
    function createSittableUI() {
        if (_this.sittableID) {
            // already created
            return;
        }

        if (UI_DEBUG) {
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
                grabbable: false,
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
            script: Script.resolvePath("https://hifi-content.s3.amazonaws.com/robin/dev/marketplaceItems/sitv2/v1/sittableUIClient.js?" + Math.random()),
            visible: true,
            emissive: true
        },
            "local"
        );
    }


    // Remove sittable local entity if it exists
    function deleteSittableUI() {
        if (UI_DEBUG) {
            print("deleteSittableUI");
        }

        if (_this.sittableID) {
            Entities.deleteEntity(_this.sittableID);
            _this.sittableID = false;
        }
    }

    //#endregion SITTABLE

    //#region CAN SIT ZONE
    var CAN_SIT_M = 5;
    function createCanSitZone() {
        var properties = Entities.getEntityProperties(_this.entityID);
        _this.canSitZoneID = Entities.addEntity({
            name: "canSitZone-" + _this.entityID,
            type: "Zone",
            shapeType: "sphere",
            position: properties.position,
            parentID: _this.entityID,
            script: "https://hifi-content.s3.amazonaws.com/robin/dev/marketplaceItems/sitv2/v1/canSitZoneClient.js?" + Math.random(),
            locked: false,
            dimensions: { x: CAN_SIT_M, y: CAN_SIT_M, z: CAN_SIT_M },
            keyLightMode: "enabled",
            keyLight: {
                "color": { "red": 255, "green": 0, "blue": 0 },
                "direction": { "x": 1, "y": 0, "z": 0 }
            }
        });
    }

    function deleteCanSitZone() {
        if (_this.canSitZoneID) {
            Entities.deleteEntity(_this.canSitZoneID);
            _this.canSitZoneID = null;
        }
    }
    //#endregion CAN SIT ZONE

    function preload(id) {
        _this.entityID = id;

        if (!_this.canSitZoneID) {
            createCanSitZone();
        }
        prefetchPresitImages();

        // download sit animation
        AnimationCache.prefetch(ANIMATION_URL);
    }

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
        this.isSittingDown = false;
        this.sitDownSettlePeriod = false;

        this.whileSittingUpdateIntervalID = false;

        this.standUpID = false;

        this.driveKeyPressedStart = false;

        this.deviationTimeStart = false;
    }

    SitClient.prototype = {
        remotelyCallable: [
            "onEnterCanSitZone",
            "onLeaveCanSitZone",
            "startSitDown"
        ],
        // Zone methods
        onEnterCanSitZone: onEnterCanSitZone,
        onLeaveCanSitZone: onLeaveCanSitZone,
        // Entity liftime methods
        preload: preload,
        unload: unload,
        // Sitting lifetime methods
        standUp: standUp,
        startSitDown: startSitDown,
        whileSittingUpdate: whileSittingUpdate
    }

    return new SitClient();
});