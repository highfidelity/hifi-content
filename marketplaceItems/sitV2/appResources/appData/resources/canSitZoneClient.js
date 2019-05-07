(function () {

    var DEBUG = false;

    var HALF = 0.5;
    function avatarIsInsideZone(entityID) {
        var properties = Entities.getEntityProperties(entityID, ["position", "dimensions", "rotation"]);
        var position = properties.position;
        var dimensions = properties.dimensions;

        var avatarPosition = MyAvatar.position;
        var worldOffset = Vec3.subtract(avatarPosition, position);

        avatarPosition = Vec3.multiplyQbyV(Quat.inverse(properties.rotation), worldOffset);

        var minX = 0 - dimensions.x * HALF;
        var maxX = 0 + dimensions.x * HALF;
        var minY = 0 - dimensions.y * HALF;
        var maxY = 0 + dimensions.y * HALF;
        var minZ = 0 - dimensions.z * HALF;
        var maxZ = 0 + dimensions.z * HALF;

        if (avatarPosition.x >= minX && avatarPosition.x <= maxX
            && avatarPosition.y >= minY && avatarPosition.y <= maxY
            && avatarPosition.z >= minZ && avatarPosition.z <= maxZ) {

            if (DEBUG) {
                print("Avatar IS inside zone");
            }
            return true;

        } else {
            if (DEBUG) {
                print("Avatar IS NOT in zone");
            }
            return false;
        }
    }

    function CanSitZone() {
        this.entityID = null;
        this.sitEntityID = null;
    }

    CanSitZone.prototype = {
        remotelyCallable: [
            "checkIfAvatarIsInsideZone"
        ],
        preload: function (zoneID) {
            var properties = Entities.getEntityProperties(zoneID);
            this.entityID = zoneID;

            this.sitEntityID = properties.parentID;
        },
        checkIfAvatarIsInsideZone: function () {
            if (avatarIsInsideZone(this.entityID)) {
                this.enterEntity();
            }
        },
        enterEntity: function () {
            Entities.callEntityMethod(this.sitEntityID, "onEnterCanSitZone", [this.entityID])
        },
        leaveEntity: function () {
            Entities.callEntityMethod(this.sitEntityID, "onLeaveCanSitZone")
        }
    }

    return new CanSitZone();
});