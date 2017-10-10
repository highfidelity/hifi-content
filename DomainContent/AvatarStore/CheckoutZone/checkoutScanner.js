(function(){
    
    var _entityID;
    var interval;
    var properties;
    this.preload = function(entityID){
        _entityID = entityID;
        properties = Entities.getEntityProperties(_entityID, 'position');
        interval = Script.setInterval(function(){
            var overlays = Overlays.findOverlays(properties.position, 0.25);
            if (overlays.length > 0) {
                print("I found you...");
                overlays.forEach(function(overlay){
                    var name = Overlays.getProperty(overlay, 'name');
                    if (name.indexOf("MP") !== -1) {
                        var id = name.substr(2,37);
                        var goToURL = "https://metaverse.highfidelity.com/marketplace/items/" + id;
                        var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
                        tablet.gotoWebScreen(goToURL);
                        Overlays.deleteOverlay(overlay);
                    }
                        
                });
            }
        }, 1000);
    };
    
    this.unload = function() {
        Script.clearInterface(interval);
    };
        
});