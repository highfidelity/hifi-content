var UI_DEBUG = true;

var localEntityUtils = Script.require(Script.resolvePath("./localEntityUtils.js"))

// #region PRESIT OVERLAY - Overlay shown in HMD before sitting and after clicking sittable overlay
// Has the sitting animation and "Please Face Forward"

var PRESIT_FRAME_DURATION = 160; // ms time duration for HMD presit overlay
var PRESIT_URL_ROOT = "./resources/images/presit/sitConfirm";
var PRESIT_URL_POSTFIX = ".png";
var PRESIT_URL_NUM = 12;
var PRESIT_URL_TEXT = Script.resolvePath("./resources/images/presit/pleaseFaceForward.png");
var preSitLoadedImages = [];
var preSitTextLoadedImage = null;
// Prefetch all presit overlay images into user's client
function prefetchPresitOverlayImages() {
    var str;
    for (var i = 0; i < PRESIT_URL_NUM; i++) {
        str = i + 1;
        preSitLoadedImages[i] = TextureCache.prefetch(Script.resolvePath(PRESIT_URL_ROOT + str + PRESIT_URL_POSTFIX));
    }
    preSitTextLoadedImage = TextureCache.prefetch(PRESIT_URL_TEXT);
    return [preSitLoadedImages, preSitTextLoadedImage];
}

var SIT_ANIMATION_POSITION_IN_FRONT = { x: 0, y: 0.1, z: -1 };
var SIT_ANIMATION_DIMENSIONS = { x: 0.2, y: 0.2 };
var PLEASE_FACE_FORWARD_POSITION_IN_FRONT = { x: 0, y: -0.05, z: -1 };
var PLEASE_FACE_FORWARD_DIMENSIONS = { x: 0.425, y: 0.425 };
function createPresit(presitEndUpdateIntervalCallback) {
    if (overlayPreSit) {
        return;
    }

    var currentPresitAnimationFrame = 0;
    var presitAnimationImageID = Entities.addEntity(
        localEntityUtils.getEntityPropertiesForImageInFrontOfCamera(
            SIT_ANIMATION_POSITION_IN_FRONT,
            SIT_ANIMATION_DIMENSIONS,
            preSitLoadedImages[currentPresitAnimationFrame].url
        ), 
        "local"
    );

    var presitTextImageID = Entities.addEntity(
        localEntityUtils.getEntityPropertiesForImageInFrontOfCamera(
            PLEASE_FACE_FORWARD_POSITION_IN_FRONT,
            PLEASE_FACE_FORWARD_DIMENSIONS,
            preSitLoadedImages[currentPresitAnimationFrame].url
        ), 
        "local"
    );

    // Flash through the presit animation images via overlay for a smooth avatar sitting animation
    var presitAnimationIntervalID = Script.setInterval(function () {
        if (presitAnimationImageID) {
            if (currentPresitAnimationFrame >= preSitLoadedImages.length) {
                presitEndUpdateIntervalCallback();
            }
            currentPresitAnimationFrame = currentPresitAnimationFrame + 1;
            Entities.editEntity(presitAnimationImageID, { imageURL: preSitLoadedImages[currentPresitAnimationFrame].url });
        }
    }, PRESIT_FRAME_DURATION);

    return [presitAnimationImageID, presitTextImageID, presitAnimationIntervalID];
}

// function preSitEndUpdateInterval(presitAnimationIntervalID) {
//     if (presitAnimationIntervalID) {
//         Script.clearInterval(presitAnimationIntervalID);
//     }
// }

function deletePresit(presitAnimationImageID, presitTextImageID, presitEndUpdateIntervalCallback) {
    if (presitAnimationImageID) {
        presitEndUpdateIntervalCallback();
        Entities.deleteEntity(presitAnimationImageID);
    }
    if (presitTextImageID) {
        Entities.deleteEntity(that.overlayPreSitText);
    }
}

function getPresitDuration() {
    return PRESIT_FRAME_DURATION * PRESIT_URL_NUM;
}

// // Remove sittable local entity if it exists
// function deletePresit(sittableID) {
//     if (UI_DEBUG) {
//         print("deletePresit");
//     }

//     if (sittableID) {
//         Entities.deleteEntity(sittableID);
//     }
// }

module.exports = {
    createPresit: createPresit,
    deletePresit: deletePresit,
    prefetchPresitOverlayImages: prefetchPresitOverlayImages,
    getPresitDuration: getPresitDuration
};