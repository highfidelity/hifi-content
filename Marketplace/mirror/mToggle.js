"use strict";

(function () { // BEGIN LOCAL SCOPE

	// VARIABLES
	
	var _this = this;
	var mirrorID;	// The entity ID of the mirror
	var triggered;	// Used to prevent double triggering, true if mirror toggle has been triggered
	
	// LOCAL FUNCTIONS
	
	// When the mirror toggle is clicked on by the mouse, call the "toggleMirrorOverlay" function
    var triggerMirrorToggle = function (entityID, data) {
		if(!triggered) {	// If triggered timeout hasn't completed, don't call "toggleMirrorOverlay" again
			Entities.callEntityMethod(mirrorID, 'toggleMirrorOverlay', []);
			triggered = true;
			Script.setTimeout(function() {
				triggered = false;
			}, 1000);
		}
    };
	
	// ENTITY FUNCTIONS
	
	// Called only once when the script is loaded in. Finds the mirror's entity ID
	_this.preload = function(entityID) {
		Script.setTimeout(function() {  // Timeout set so that server script can get be initialized
			_this.entityID = entityID;
			var mirrorToggleProps = Entities.getEntityProperties(_this.entityID, ["position"]);
			var foundEntitiesArray = Entities.findEntities(mirrorToggleProps.position, 0.01);
			foundEntitiesArray.forEach(function(foundEntityID) {
				var foundEntityName = Entities.getEntityProperties(foundEntityID, ["name"]).name;
				if(foundEntityName === "mirror") {
					mirrorID = foundEntityID;
				}
			})
			triggered = false;
		}, 1500);
	}

	_this.startNearTrigger = triggerMirrorToggle;
	_this.startFarTrigger = triggerMirrorToggle;
	_this.clickDownOnEntity = triggerMirrorToggle;

	// Called only once when the script is deleted and disconnects functions
	_this.unload = function(entityID) {	}
})