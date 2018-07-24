(function(){

    var DISTANCE = 0.5;
    var FPS = 60;
    var URL = 'https://www.youtube.com/tv#/watch?v=zb2NUs0IDm4';
    
    var overlay;
    
    var OVERLAY_PROPERTIES = {
        position: Vec3.sum(MyAvatar.position, Vec3.multiply(Quat.getFront(MyAvatar.orientation), DISTANCE)),
        maxFPS: FPS,
        url: URL
    };
    
    var WebOverlaySpawner = function(){};

    WebOverlaySpawner.prototype = {
        preload: function(entityID) {
            overlay = Overlays.addOverlay('web3d', OVERLAY_PROPERTIES);
        },
        unload: function() {
            Overlays.deleteOverlay(overlay);
        }
    };

    return new WebOverlaySpawner();
});