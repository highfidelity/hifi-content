(function () {
    var DISTANCE = 1.5;
    var FPS = 60;

    var overlay;
    var autoplay;

    var OVERLAY_PROPERTIES = {
        name: "Web Overlay",
        maxFPS: FPS,
        locked: true,
        alpha: 0.75
    };

            
var overlayProperties = OVERLAY_PROPERTIES;
// overlayProperties.position = Entities.getEntityProperties(entityID, 'position').position;
// overlayProperties.parentID = entityID;
// overlayProperties.dpi = JSON.parse(Entities.getEntityProperties(entityID, 'userData').userData).dpi;
// autoplay = JSON.parse(Entities.getEntityProperties(entityID, 'userData').userData).autoplay;
overlayProperties.dimensions = {
    "x": 1.55,
    "y": 0.45
};
overlayProperties.parentID = MyAvatar.sessionUUID;
overlayProperties.position = Vec3.sum(Vec3.sum(MyAvatar.position, [0,-0.05,0]), Vec3.multiply(Quat.getForward(MyAvatar.orientation), 1));
overlayProperties.url = "https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/Prototyping/Improv-Stage-Manager/Plasticland%20Show%20Ideas%20-%20Run%20of%20Show-page-001.jpg";
overlayProperties.rotation = Quat.multiply(MyAvatar.orientation,Quat.fromPitchYawRollDegrees(0,0,0));
overlay = Overlays.addOverlay('web3d', overlayProperties);
function scriptEnding() {
    Overlays.editOverlay(overlay, { 'url': 'https://highfidelity.com' });
    Script.setTimeout(function () {
        Overlays.deleteOverlay(overlay);
    }, 1000);
}

Script.scriptEnding.connect(scriptEnding);
})();