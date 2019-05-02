(function() {

    var _this;

    var DEBUG = true;

    // createZone, deleteZone
    var canSitZoneSpawner = Script.require("https://hifi-content.s3.amazonaws.com/robin/dev/marketplaceItems/sitv2/v1/canSitZoneSpawner.js?" + Math.random()); // ?" + Math.random()))
    
    // createSittableUI, deleteSittableUI
    var sittableUISpawner = Script.require("https://hifi-content.s3.amazonaws.com/robin/dev/marketplaceItems/sitv2/v1/sittableUISpawner.js?" + Math.random()); // ?" + Math.random()))
    
    // createPresit, deletePresit, prefetchPresitOverlayImages, getPresitDuration
    var presitSpawner = Script.require("https://hifi-content.s3.amazonaws.com/robin/dev/marketplaceItems/sitv2/v1/presitSpawner.js?" + Math.random()); // ?" + Math.random()))

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

        var presitIDList = presitSpawner.createPresit(presitEndUpdateIntervalCallback);
        _this.presitAnimationImageID = presitIDList[0];
        _this.presitTextID = presitIDList[1];
        _this.presitIntervalID = presitIDList[2];
    }

    function presitEndUpdateIntervalCallback() {
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
        if (_this.sittableUIID) {
            sittableUISpawner.deleteSittableUI(_this.sittableUIID);
            _this.sittableUIID = false;
        }
        if (_this.canSitZoneID) {
            canSitZoneSpawner.deleteZone(_this.canSitZoneID);
            _this.canSitZoneID = false;
        }
        presitEndUpdateIntervalCallback();
    }

    function setCanSitZoneID(argList) {
        console.log("setCanSitZoneID" + typeof argList + argList);
    }

    function onEnterCanSitZone() {
        console.log("onEnterCanSitZone");
        var entityProperties = Entities.getEntityProperties(_this.entityID);
        if (!_this.sittableUIID) {
            _this.sittableUIID = sittableUISpawner.createSittableUI(entityProperties.position, entityProperties.rotations, _this.entityID);
        }
    }

    function onLeaveCanSitZone() {
        console.log("onLeaveCanSitZone");
        if (_this.sittableUIID) {
            sittableUISpawner.deleteSittableUI(_this.sittableUIID);
            _this.sittableUIID = false;
        }
    }

    function SitClient() {
        _this = this;
        this.sittableUIID = false;
        this.canSitZoneID = false;

        this.presitIntervalID = false;
        this.presitTextID = false;
        this.presitAnimationImageID = false;
    }

    SitClient.prototype = {
        remotelyCallable: [
            "onEnterCanSitZone",
            "onLeaveCanSitZone",
            "setCanSitZoneID",
            "startSitDown"
        ],
        // Zone methods
        setCanSitZoneID: setCanSitZoneID,
        onEnterCanSitZone: onEnterCanSitZone,
        onLeaveCanSitZone: onLeaveCanSitZone,

        preload: function(id) {
            this.entityID = id;

            var entityProperties = Entities.getEntityProperties(id);
            if (!_this.canSitZoneID) {
                _this.canSitZoneID = canSitZoneSpawner.createZone(entityProperties.position, id);
            }

            // download sit animation
        },
        standUp: function() {

        },
        startSitDown: startSitDown,
        sitDown: function() {

        },
        whileSittingUpdate: function() {

        },
        unload: unload
    }

    return new SitClient();
});