(function () {

    var _this;

    var DEBUG = true;

    var localEntityUtils = Script.require("https://hifi-content.s3.amazonaws.com/robin/dev/marketplaceItems/sitv2/v1/localEntityUtils.js?" + Math.random());

    function rolesToOverride() {
        // Get all animation roles that sit will override
        return MyAvatar.getAnimationRoles().filter(function (role) {
            return !(startsWith(role, "right") || startsWith(role, "left"));
        });
    }

    function standUp() {

    }

    function startSitDown() {
        console.log("startSitDown");
        createPresit();
    }

    // Called from entity server script to begin sitting down sequence
    function sitDown() {
        _this.previousAvatarOrientation = MyAvatar.orientation;
        _this.previousAvatarPosition = MyAvatar.position;
    }

    function whileSittingUpdate() {
        // listen for drive button press
        // listen for head to be too far away
        // listen for avatar position to be too far away
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
                if (currentPresitAnimationFrame >= _this.preSitLoadedImages.length - 1) {
                    deletePresit();
                }
                currentPresitAnimationFrame = currentPresitAnimationFrame + 1;
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
            locked: true,
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

        preload: function (id) {
            this.entityID = id;

            if (!_this.canSitZoneID) {
                createCanSitZone();
            }
            prefetchPresitImages();

            // download sit animation
        },
        standUp: function () {

        },
        startSitDown: startSitDown,
        sitDown: function () {

        },
        whileSittingUpdate: function () {

        },
        unload: unload
    }

    return new SitClient();
});