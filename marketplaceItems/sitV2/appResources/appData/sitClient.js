(function() {

    var _this;

    var DEBUG = true;

    // createZone, deleteZone
    var canSitZoneSpawner = Script.require("https://hifi-content.s3.amazonaws.com/robin/dev/marketplaceItems/sitv2/v1/canSitZoneSpawner.js?" + Math.random()); // ?" + Math.random()))
    // createSittableUI, deleteSittableUI
    var sittableUISpawner = Script.require("https://hifi-content.s3.amazonaws.com/robin/dev/marketplaceItems/sitv2/v1/sittableUISpawner.js?" + Math.random()); // ?" + Math.random()))


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

    }

    // Called from entity server script to begin sitting down sequence
    function sitDown() {
        this.previousAvatarOrientation = MyAvatar.orientation;
        this.previousAvatarPosition = MyAvatar.position;

    }

    function whileSittingUpdate() {
        // listen for drive button press

    }

    function mousePressOnEntity() {
        
    }

    function unload() {
        sittableUISpawner.deleteSittableUI(_this.sittableUIID);
        canSitZoneSpawner.deleteZone(_this.canSitZoneID);
    }

    function setCanSitZoneID(argList) {
        console.log("setCanSitZoneID" + typeof argList + argList);
    }

    function onEnterCanSitZone() {
        console.log("onEnterCanSitZone");
        var entityProperties = Entities.getEntityProperties(_this.entityID);
        this.sittableUIID = sittableUISpawner.createSittableUI(entityProperties.position, entityProperties.rotations, _this.entityID);
    }

    function onLeaveCanSitZone() {
        console.log("onLeaveCanSitZone");
        sittableUISpawner.deleteSittableUI(_this.sittableUIID);
    }

    function SitClient() {
        _this = this;
        this.sittableUIID = null;
        this.canSitZoneID = null;
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
            this.canSitZoneID = canSitZoneSpawner.createZone(entityProperties.position, id);

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