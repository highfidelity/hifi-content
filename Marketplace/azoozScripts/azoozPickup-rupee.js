//
//  azoozPickup.js
//
//  Created by Caitlyn Meeks on 9/3/17
//  Copyright 2017 High Fidelity, Inc.
//  Derived by BoppoScript.js from Thoys 
//
//	An entity script for a Zone to track and display the scores from a system of pickup and trigger volume entities
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function(){ 

    var COLLECT_CHANNEL = "collect";
    var REGISTER_CHANNEL = "register";
    var _entityID;
    var _this = this;
    var OVERLAYURL_NORMY = "http://hifi-content.s3.amazonaws.com/DomainContent/production/azooz/pickup/newRupee-green.fbx";
    var OVERLAYURL_GHOSTY = "http://hifi-content.s3.amazonaws.com/DomainContent/production/azooz/pickup/rupee-ghost.fbx";
    var collectableOverlay = null;
	
    this.preload = function(entityID) {
        collectableOverlay = Overlays.addOverlay('model', {
            url: OVERLAYURL_NORMY,
            localPosition: {x: 0, y: 0, z: 0},
            localRotation: {x: 0, y: 0, z: 0, w: 1},
            dimensions: {x: 0.2355, y: 0.943, z: 0.5216},
            parentID: entityID
        });    
        _entityID = entityID;
        _this.entityID = entityID;
    };

  
    _this.enterEntity = function(entityID) { 
        Messages.sendLocalMessage(COLLECT_CHANNEL, _this.entityID); // Inform the game manager that the avatar entered this pickup
        Overlays.editOverlay(collectableOverlay, { // Ghost the pickup locally so only the player sees it ghosted, other players see it normal
            url: OVERLAYURL_GHOSTY
        });
    }; 
    
    _this.unload = function() {		
        Script.clearInterval(messageInterval);
        if (collectableOverlay !== null) {
            Overlays.deleteOverlay(collectableOverlay);
        }
    };
	
    var messageInterval = Script.setInterval(function(){ // Inform the game manager that this pickup exists, to add it to the total tally of pickups
        Messages.sendLocalMessage(REGISTER_CHANNEL, _entityID);
    }, 10000);
		
});
