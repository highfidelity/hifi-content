(function(){

    var BASE_URL_YOUTUBE = "https://www.youtube.com/tv#/watch?v=zb2NUs0IDm4";
    var BASE_URL_SCREENLEAP= "https://www.screenleap.com/535356234";

    var FPS = 60;
    var overlayYoutube;
    var overlayScreenLeap;
    
    var OVERLAY_PROPERTIES_BASE = {
        maxFPS: FPS,
        locked: true,
        dimensions: {x: 1.6, y: 0.9, z: 0.01},
        rotation: Quat.fromVec3Degrees({x: 0, y: -109, z: 0}),
        alpha: 1.0
    };

    var _entityID;

    function createYoutubeDirectOverlay() {
        var overlayProperties = OVERLAY_PROPERTIES_BASE;
        overlayProperties.position = {x: -0.6, y: -10.2, z: -1.9};
        overlayProperties.parentID = _entityID;
        overlayProperties.url = BASE_URL_YOUTUBE; 
        overlayYoutube = Overlays.addOverlay('web3d', overlayProperties);
    }

    function createScreenLeapOverlay() {
        var overlayProperties = OVERLAY_PROPERTIES_BASE;
        overlayProperties.position = {x: -1.29, y: -10.2, z: 0.07};
        overlayProperties.parentID = _entityID;
        overlayProperties.url = BASE_URL_SCREENLEAP;
        overlayProperties.dpi = 10;
        overlayScreenLeap = Overlays.addOverlay('web3d', overlayProperties);
    }
    
    var WebOverlaySpawner = function(){};

    WebOverlaySpawner.prototype = {
        preload: function(entityID) {
            _entityID = entityID;
            createYoutubeDirectOverlay();
            createScreenLeapOverlay();
        },
        unload: function() {
            Overlays.editOverlay(overlayYoutube, {'url': 'https://highfidelity.com'});
            Overlays.editOverlay(overlayScreenLeap, {'url' : 'https://highfidelity.com'});
            Script.setTimeout(function(){ 
                Overlays.deleteOverlay(overlayScreenLeap);
                Overlays.deleteOverlay(overlayYoutube);
            }, 1000);
        }
    };

    return new WebOverlaySpawner();
});