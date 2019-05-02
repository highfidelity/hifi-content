var UI_DEBUG = true;

    // #region PRESIT OVERLAY - Overlay shown in HMD before sitting and after clicking sittable overlay
    // Has the sitting animation and "Please Face Forward"

    var PRESIT_FRAME_DURATION = 160; // ms time duration for HMD presit overlay
    var PRESIT_URL_ROOT = "./resources/images/presit/sitConfirm";
    var PRESIT_URL_POSTFIX = ".png";
    var PRESIT_URL_NUM = 12;
    var PRESIT_URL_TEXT = Script.resolvePath("./resources/images/presit/pleaseFaceForward.png");
    var overlayPreSitLoaded = [];
    var overlayPreSitTextLoaded = null;
    var preSitLoadIndex = 0;
    // Prefetch all presit overlay images into user's client
    function prefetchPresitOverlayImages() {
        var str;
        for (var i = 0; i < PRESIT_URL_NUM; i++) {
            str = i + 1;
            overlayPreSitLoaded[i] =
                TextureCache.prefetch(Script.resolvePath(PRESIT_URL_ROOT + str + PRESIT_URL_POSTFIX));
        }
        overlayPreSitTextLoaded = TextureCache.prefetch(PRESIT_URL_TEXT);
        return [overlayPreSitLoaded, overlayPreSitTextLoaded];
    }

    function preSitCreate() {
        if (that.overlayPreSit) {
            return;
        }

        that.overlayPreSit = Overlays.addOverlay(
            "image3d",
            getInFrontOverlayProperties(
                { x: 0, y: 0.1, z: -1 },
                { x: 0.2, y: 0.2 },
                overlayPreSitLoaded[preSitLoadIndex].url
            )
        );

        that.overlayPreSitText = Overlays.addOverlay(
            "image3d",
            getInFrontOverlayProperties(
                { x: 0, y: -0.05, z: -1 },
                { x: 0.425, y: 0.425 },
                overlayPreSitTextLoaded.url
            )
        );

        // Flash through the presit animation images via overlay for a smooth avatar sitting animation
        that.intervalUpdatePreSitImage = Script.setInterval(function () {
            if (that.overlayPreSit) {
                if (preSitLoadIndex >= overlayPreSitLoaded.length) {
                    preSitEndUpdateInterval();
                }

                preSitLoadIndex = preSitLoadIndex + 1;
                Overlays.editOverlay(that.overlayPreSit, { url: overlayPreSitLoaded[preSitLoadIndex].url });
            }
        }, PRESIT_FRAME_DURATION);
    }

    function preSitEndUpdateInterval() {
        if (that.intervalUpdatePreSitImage) {
            Script.clearInterval(that.intervalUpdatePreSitImage);
            that.intervalUpdatePreSitImage = null;
        }
    }

    function preSitRemove() {
        if (that.overlayPreSit) {
            preSitEndUpdateInterval();

            Overlays.deleteOverlay(that.overlayPreSit);
            that.overlayPreSit = null;
            preSitLoadIndex = 0;

            if (that.overlayPreSitText !== null) {
                Overlays.deleteOverlay(that.overlayPreSitText);
            }
        }
    }

function createPresit(entityPosition, entityRotation, sitEntityID) {
    if (UI_DEBUG) {
        console.log("createPresit()");
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
function deletePresit(sittableID) {
    if (UI_DEBUG) {
        print("deletePresit");
    }
    
    if (sittableID) {
        Entities.deleteEntity(sittableID);
    }
}

module.exports = {
    createPresit: createPresit,
    deletePresit: deletePresit
};