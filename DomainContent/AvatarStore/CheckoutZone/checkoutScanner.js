//
//  checkoutScanner.js
//
//  Created by Rebecca Stankus on 10/10/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  This script acts on the scanner zone to pull up an item's marketplace page to enable purchasing.
(function(){
    var TABLET = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    var interval;
    var properties;
    this.preload = function(entityID){
        properties = Entities.getEntityProperties(entityID, 'position');
        interval = Script.setInterval(function(){
            var overlays = Overlays.findOverlays(properties.position, 0.15);
            if (overlays.length > 0) {
                overlays.forEach(function(overlay){
                    var name = Overlays.getProperty(overlay, 'name');
                    if (name.indexOf("MP") !== -1) {
                        print("this one is MP!");
                        var id = name.substr(2,37);
                        print("ID is " + id);
                        var goToURL = "https://metaverse.highfidelity.com/marketplace/items/" + id;
                        TABLET.gotoWebScreen(goToURL);
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
