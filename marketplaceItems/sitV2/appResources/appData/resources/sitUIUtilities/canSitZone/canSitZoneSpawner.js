var CAN_SIT_M = 5;
function createZone(position, sitEntityID) {
    var zoneID = Entities.addEntity({
        name: "canSitZone-" + sitEntityID,
        type: "Zone",
        shapeType: "sphere",
        position: position,
        parentID: sitEntityID,
        script: new CanSitZone(sitEntityID),
        locked: true,
        dimensions: { x: CAN_SIT_M, y: CAN_SIT_M, z: CAN_SIT_M },
    });
    return zoneID;
}

function deleteZone(zoneID) {
    if (zoneID) {
        Entities.deleteEntity(zoneID);
    }
}

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

function CanSitZone(sitEntityID) {
    this.entityID = null;
    this.sitEntityID = sitEntityID;
}

CanSitZone.prototype = {
    preload: function(zoneID) {
        Entities.callEntityClientMethod(this.sitEntityID, "setCanSitZoneID", [zoneID]);
        if (avatarIsInsideZone(zoneID)) {
            this.enterEntity();
        }
    },
    enterEntity: function() {
        Entities.callEntityClientMethod(this.sitEntityID, "onEnterCanSitZone")
    },
    leaveEntity: function() {
        Entities.callEntityClientMethod(this.sitEntityID, "onLeaveCanSitZone")
    }
}

module.exports = {
    createZone: createZone,
    deleteZone: deleteZone
}