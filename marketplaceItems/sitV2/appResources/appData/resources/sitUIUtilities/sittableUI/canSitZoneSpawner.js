var CAN_SIT_M = 5;
function createZone(position, sitEntityID) {
    var zoneID = Entities.addEntity({
        name: "canSitZone-" + sitEntityID,
        type: "Zone",
        shapeType: "sphere",
        position: position,
        parentID: sitEntityID,
        script: Script.resolvePath("./canSitZoneClient.js?" + Math.random()),
        locked: true,
        dimensions: { x: CAN_SIT_M, y: CAN_SIT_M, z: CAN_SIT_M },
        keyLightMode: "enabled",
        keyLight: {
            "color": { "red": 255, "green": 0, "blue": 0 },
            "direction": { "x": 1, "y": 0, "z": 0 }
        }
    });
    return zoneID;
}

function deleteZone(zoneID) {
    if (zoneID) {
        Entities.deleteEntity(zoneID);
    }
}

module.exports = {
    createZone: createZone,
    deleteZone: deleteZone
}