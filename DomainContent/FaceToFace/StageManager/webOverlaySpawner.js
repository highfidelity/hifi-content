(function(){
    var FPS = 60;
    var overlay;
    
    var OVERLAY_PROPERTIES_BASE = {
        maxFPS: FPS,
        locked: true,
        dimensions: {x: 1.6, y: 0.9, z: 0.01},
        rotation: Quat.fromVec3Degrees({x: 0, y: -109, z: 0}),
        alpha: 1.0
    };

    var _entityID;
    var _url;

    function createOverlay() {
        var overlayProperties = OVERLAY_PROPERTIES_BASE;
        overlayProperties.position = {x: -0.6, y: -10.2, z: -1.9};
        overlayProperties.parentID = _entityID;
        overlayProperties.url = _url; 
        overlay = Overlays.addOverlay('web3d', overlayProperties);
    }

    var WebOverlaySpawner = function(){};

    WebOverlaySpawner.prototype = {
        preload: function(entityID) {
            _entityID = entityID;
            _url = JSON.parse(Entities.getEntityProperties(entityID, 'userData').userData).url;
            createOverlay();
        },
        unload: function() {
            Overlays.editOverlay(overlay, {'url': 'https://highfidelity.com'});
            Script.setTimeout(function(){ 
                Overlays.deleteOverlay(overlay);
            }, 1000);
        }
    };

    return new WebOverlaySpawner();
});