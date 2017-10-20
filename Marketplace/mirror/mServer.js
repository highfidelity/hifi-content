"use strict";

(function () { // BEGIN LOCAL SCOPE

	// VARIABLES

	var _this = this;
	var mirrorScalerID;
	var mirrorToggleID;
	var mirrorScalerScriptURL = "https://hifi-content.s3.amazonaws.com/patrickmanalich/mirrorFolder/mScaler.js";
	var mirrorToggleScriptURL = "https://hifi-content.s3.amazonaws.com/patrickmanalich/mirrorFolder/mToggle.js";
	var defaultDimLength = 0.025;
	var mirrorOverlayOffset = 0.01;	// The distance between the center of the mirror and the mirror overlay
	
	// ENTITY FUNCTIONS

	
	// Called only once when the script is loaded in. Creates mirror scalers and sets their names, IDs, and positions
    _this.preload = function(entityID) {
        print("preload mirror server");
		_this.entityID = entityID;
		
		var mirrorProps = Entities.getEntityProperties(_this.entityID, ["position", "rotation", "dimensions"]);
		mirrorScalerID = Entities.addEntity({
			name: "mirrorScaler",
			position: mirrorProps.position,
			rotation: mirrorProps.rotation,
			dimensions: {x: defaultDimLength, y: defaultDimLength, z: defaultDimLength},
			angularDamping: 0.98,
			damping: 0.98,
			visible: false,
			dynamic: true,
			collidesWith: "",
			collisionMask: 0,
			collisionsWillMove: 1,
			userData: "{\"grabbableKey\":{\"grabbable\":true}}",
			type: "Model",
			shapeType: "simple-hull",
			modelURL: "https://hifi-content.s3.amazonaws.com/patrickmanalich/mirrorFolder/models/mirrorScaler.fbx",
			script: mirrorScalerScriptURL
		});
		mirrorToggleID = Entities.addEntity({
			name: "mirrorToggle",
			position: mirrorProps.position,
			rotation: mirrorProps.rotation,
			dimensions: {x: defaultDimLength, y: defaultDimLength, z: defaultDimLength},
			angularDamping: 0.98,
			damping: 0.98,
			visible: true,
			dynamic: false,
			collidesWith: "",
			collisionMask: 0,
			collisionsWillMove: 1,
			userData: "{\"grabbableKey\":{\"wantsTrigger\":true}}",
			type: "Model",
			shapeType: "simple-hull",
			modelURL: "https://hifi-content.s3.amazonaws.com/patrickmanalich/mirrorFolder/models/mirrorToggle.fbx",
			script: mirrorToggleScriptURL
		});
    }
	
	// Turns off mirror and deletes all mirror editors
	_this.unload = function(entityID) {
		print("unload mirror server");
		Entities.deleteEntity(mirrorScalerID);
		Entities.deleteEntity(mirrorToggleID);
    };
})