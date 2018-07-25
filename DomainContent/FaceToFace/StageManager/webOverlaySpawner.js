(function(){
    var FPS = 60;
    var overlay;
    
    var OVERLAY_PROPERTIES_BASE = {
        maxFPS: FPS,
        locked: true,
        dimensions: {x: 11.6894, y: 4.9342, z: 0.01},
        rotation: Quat.fromVec3Degrees({x: 0, y: -3, z: 0}),
        alpha: 1.0
    };

    var _entityID;
    var _url;

    function createOverlay() {
        var overlayProperties = OVERLAY_PROPERTIES_BASE;
        overlayProperties.position = {x: 98.5507, y: 6.56, z: 23.7452};
        overlayProperties.parentID = _entityID;
        overlayProperties.url = _url; 
        overlay = Overlays.addOverlay('web3d', overlayProperties);
    }

    var WebOverlaySpawner = function(){};

    WebOverlaySpawner.prototype = {
        preload: function(entityID) {
            _entityID = entityID;
            try {
                _url = JSON.parse(Entities.getEntityProperties(entityID, 'userData').userData).url;
                createOverlay();
            } catch (error) {
                print("No URL is available to create the overlay, will not create. Deleting spawner.");
                Entities.deleteEntity(entityID);
            }

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
