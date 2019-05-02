var SITTABLE_DIMENSIONS = { x: 0.3, y: 0.3 };
var SITTABLE_IMAGE_URL_HMD = Script.resolvePath("../images/triggerToSit.png");
var SITTABLE_IMAGE_URL_DESKTOP = Script.resolvePath("../images/clickToSit.png");
var SITTABLE_Y_OFFSET = 0.01;
function createSittableUI(entityPosition, entityRotation, sitEntityID) {
    if (DEBUG) {
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
        visible: true,
        emissive: true
    },
        "local"
    );

    return sittableID;
}

// Fades the sittable local entity over time
var SITTABLE_START_ALPHA = 0.7;
var SITTABLE_END_ALPHA = 0.075; // fades to this alpha value
var SITTABLE_ALPHA_DELTA = 0.01;
var SITTABLE_FADE_MS = 50; // "Click/Trigger to Sit" local entity image fade after 50 ms
function startSittableLerpTransparency(sittableID, clearLerpIntervalCallback) {
    if (UI_DEBUG) {
        console.log("startSittableLerpTransparency");
    }

    var currentAlpha = SITTABLE_START_ALPHA;
    // Update the alpha value on the sittable overlay
    intervalLerpTransparencyID = Script.setInterval(function() {
        currentAlpha = currentAlpha - SITTABLE_ALPHA_DELTA;
        Entities.editEntity(sittableID, { alpha: currentAlpha });

        if (currentAlpha <= SITTABLE_END_ALPHA) {
            // Stop fading and keep overlay at the minimum alpha
            clearLerpIntervalCallback();
        }
    }, SITTABLE_FADE_MS);

    return intervalLerpTransparencyID;
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

function SittableClickableUI(sitEntityID) {
    this.entityID = null;
    this.intervalLerpTransparencyID = null;
    this.sitEntityID = sitEntityID;
}

SittableClickableUI.prototype = {
    preload: function(id) {
        this.entityID = id;

        this.intervalLerpTransparencyID = startSittableLerpTransparency(id, this.clearLerpInterval);
        var _this = this;
        this.displayModeChangedCallback = function() {
            if (_this && _this.entityID) {
                Entities.editEntity(
                    _this.entityID, 
                    { imageURL: HMD.active ? SITTABLE_IMAGE_URL_HMD : SITTABLE_IMAGE_URL_DESKTOP }
                );
            }
        }
        HMD.displayModeChanged.connect(this.displayModeChangedCallback);
    },
    clearLerpInterval: function() {
        Script.clearInterval(this.intervalLerpTransparencyID);
        this.intervalLerpTransparencyID = false;
    },
    mouseReleaseOnEntity: function(entityID, event) {
        if (event.isPrimaryButton) {
            Entities.callEntityClientMethod(this.sitEntityID, "startSit", [MyAvatar.sessionUUID]);
        }
    },
    unload: function() {
        if (this.intervalLerpTransparencyID) {
            this.clearLerpInterval();
        }
        HMD.displayModeChanged.disconnect(this.displayModeChangedCallback);
    }
}

module.exports = {
    createSittableUI: createSittableUI,
    deleteSittableUI: deleteSittableUI
};