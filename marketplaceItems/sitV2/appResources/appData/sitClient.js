(function() {

    var _this;

    var DEBUG = true;

    // createSittableUI, deleteSittableUI
    var sittableUISpawner = Script.require(Script.resolvePath("./resources/sitUIUtilities/sittableUI/sittableUISpawner.js")); // ?" + Math.random()))
    // createZone, deleteZone
    var canSitZoneSpawner = Script.require(Script.resolvePath("./resources/sitUIUtilities/canSitZone/canSitZoneSpawner.js")); // ?" + Math.random()))


    function rolesToOverride() {
        // Get all animation roles that sit will override
        return MyAvatar.getAnimationRoles().filter(function (role) {
            return !(startsWith(role, "right") || startsWith(role, "left"));
        });
    }

    function standUp() {

    }

    function startSitDown() {

    }

    // Called from entity server script to begin sitting down sequence
    function sitDown() {
        this.previousAvatarOrientation = MyAvatar.orientation;
        this.previousAvatarPosition = MyAvatar.position;

    }

    function whileSittingUpdate() {

    }

    function mousePressOnEntity() {
        
    }

    function unload() {
        sittableUISpawner.deleteSittableUI();
        canSitZoneSpawner.deleteZone(_this.canSitZoneID);
    }

    function setCanSitZoneID(argList) {
        console.log("setCanSitZoneID" + typeof argList + argList);
        _this.canSitZoneID = argList[0];
    }

    function onEnterCanSitZone() {
        console.log("onEnterCanSitZone");
    }

    function onLeaveCanSitZone() {
        console.log("onLeaveCanSitZone");
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
            "setCanSitZoneID"
        ],
        // Zone methods
        setCanSitZoneID: setCanSitZoneID,
        onEnterCanSitZone: onEnterCanSitZone,
        onLeaveCanSitZone: onLeaveCanSitZone,

        preload: function(id) {
            this.entityID = id;

            var entityProperties = Entities.getEntityProperties(id);
            canSitZoneSpawner.createZone(entityProperties.position, id);

            // download sit animation
        },
        standUp: function() {

        },
        startSitDown: function() {

        },
        sitDown: function() {

        },
        whileSittingUpdate: function() {

        },
        mousePressOnEntity: function() {
            // if can sit on entity mouse click or trigger, sit down()
        },
        unload: unload
    }

    return new SitClient();
});