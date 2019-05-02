var UI_DEBUG = true;

var SITTABLE_START_ALPHA = 0.7;
var SITTABLE_DIMENSIONS = { x: 0.3, y: 0.3 };
var SITTABLE_IMAGE_URL_HMD = Script.resolvePath("./images/triggerToSit.png");
var SITTABLE_IMAGE_URL_DESKTOP = Script.resolvePath("./images/clickToSit.png");
var SITTABLE_Y_OFFSET = 0.01;
function createSittableUI(entityPosition, entityRotation, sitEntityID) {
    if (UI_DEBUG) {
        console.log("createSittableUI()");
    }
    // calculate 
    var localOffset = { x: 0, y: SITTABLE_Y_OFFSET, z: 0 };
    var worldOffset = Vec3.multiplyQbyV(entityRotation, localOffset);
    var sittablePosition = Vec3.sum(entityPosition, worldOffset);

    var sittableID = Entities.addEntity({
        type: "Image",
        grab: {
            grabbable: false,
        },
        dynamic: false,
        position: sittablePosition,
        rotation: Quat.multiply(
            entityRotation,
            Quat.fromVec3Degrees({ x: -90, y: 180, z: 0 })
        ),
        parentID: sitEntityID,
        dimensions: SITTABLE_DIMENSIONS,
        imageURL: HMD.active ? SITTABLE_IMAGE_URL_HMD : SITTABLE_IMAGE_URL_DESKTOP,
        ignoreRayIntersection: false,
        alpha: SITTABLE_START_ALPHA,
        script: Script.resolvePath("./sittableUIClient.js?" + Math.random()),
        visible: true,
        emissive: true
    }
    // ,    "local"
    );
    return sittableID;
}


// Remove sittable local entity if it exists
function deleteSittableUI(sittableID) {
    if (UI_DEBUG) {
        print("deleteSittableUI");
    }
    
    if (sittableID) {
        Entities.deleteEntity(sittableID);
    }
}

module.exports = {
    createSittableUI: createSittableUI,
    deleteSittableUI: deleteSittableUI
};