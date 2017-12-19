//
//  wrench.js
//
//  Created by David Back on 12/15/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() { 
    var invasionUtils = Script.require('./invasionUtils.js');
    
    var SEARCH_RADIUS = 0.3;

    Wrench = function() {
    };

    Wrench.prototype = {
        releaseGrab: function() {
            var properties = Entities.getEntityProperties(this.entityID);
            var nearbyEntities = Entities.findEntities(properties.position, SEARCH_RADIUS);
            for (var i = 0; i < nearbyEntities.length; i++) {
                var name = Entities.getEntityProperties(nearbyEntities[i], ["name"]).name;
                if (name === "PowerSource") {
                    Messages.sendMessage(invasionUtils.REPAIR_CHANNEL, 
                                         JSON.stringify({type: "RepairPowerSource", powerSourceID: nearbyEntities[i]}));
                    Entities.deleteEntity(this.entityID);
                    return;
                }
            }
        },
        
        unload: function() {
        },
    
        preload: function(entityID) {
            this.entityID = entityID;   
        }
    };

    return new Wrench();
});
