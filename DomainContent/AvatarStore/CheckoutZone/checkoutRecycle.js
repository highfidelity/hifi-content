//
//  checkoutRecycle.js
//
//  Created by Rebecca Stankus on 10/20/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  This script acts on the recycle zone to delete an item replica when it is placed in the bin.
(function() {
    
    var SCAN_RADIUS = 0.15; // meters
    var OVERLAY_PREFIX = 'MP';
    
    var properties;
    
    this.preload = function(entityID) {
        Script.setInterval(function() {
            var overlays = Overlays.findOverlays(properties.position, SCAN_RADIUS);
            if (overlays.length > 0) {
                overlays.forEach(function(overlay) {
                    var name = Overlays.getProperty(overlay, 'name');
                    if (name.indexOf(OVERLAY_PREFIX) !== -1) {
                        Overlays.deleteOverlay(overlay);
                    }
                });
            }
        }, 1000);
    };
});