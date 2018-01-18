"use strict";

(function () { // BEGIN LOCAL SCOPE

	// VARIABLES
	
	var _this = this;
	var mirrorID;	// The entityID of the mirror object that spawns the four mirror scalers
	var inactiveTexture = '{ "inactive": "' + "https://hifi-content.s3.amazonaws.com/patrickmanalich/mirrorFolder/models/mirrorScaler.fbx/mirrorScaler.fbm/scale-texture.png" + '"}';
	var activeTexture = '{ "inactive": "' + "https://hifi-content.s3.amazonaws.com/patrickmanalich/mirrorFolder/models/mirrorScaler.fbx/mirrorScaler.fbm/scale-texture-active.png" + '"}';
	var defaultRegPoint = { x: 0.5, y: 0.5, z: 0.5};	// Default registration point of entities, which is in the center
	var maxScalerDim = 0.2;	// The maximum dimension length the mirror scalers can grow to
	var minScalerDim = 0.0125;	// The minimum dimension length the mirror scalers can shrink to
	var maxMirrorDim = 1.6;		// The maximum dimension length the mirror can grow to
	var minMirrorDim = 0.1;	// The minimum dimension length the mirror can shrink to
	var defaultDimLength = 0.025;	// The default length of the dimensions for the mirror scalar and mirror toggle
	var newDimLength;	// The dimension of the mirror editors based on the size and aspect ratio of the mirror
	var regPointChanged = false;	// True if the registration point of the mirror has been changed from 0, 0, 0
	var mirrorToggleAdjusted;	// If the entity method 'adjustMirrorToggle' has been called, this will be true so it will only be called once
	var halfMultiplier = { x: 0.5, y: -0.5 };	//	Used for finding the local position of the mirror scaler
	var mirrorChannel;	// The channel where mScaler.js sends messages to mClient.js

	
	// LOCAL FUNCTIONS
	
	// When the mirror scaler is grabbed, change the texture and registration point of the mirror so its dimensions will only be
	// affected in the direction you're pulling the cube as opposed to changing the dimensions in both the direction you're
	// pulling the opposite direction. Then the position of the mirror is adjusted so that changing the registration point
	// doesn't appear to move the mirror. Then the dimensions of the mirror are changed to close the distance between the
	// mirror scaler and the mirror. Sends a message to 'mirrorServer.js' to hide all mirror editors except for this one. Also sends
	// a message to 'mirrorClient.js' to update the mirror overlay.
	var grabMirrorScaler = function(entityID, data) {
		var mirrorProps = Entities.getEntityProperties(mirrorID, ["dimensions", "position", "registrationPoint", "rotation"]);
		var mirrorScalerProps = Entities.getEntityProperties(_this.entityID, ["position"]);
		Entities.editEntity(_this.entityID, { textures: activeTexture });
		if(!mirrorToggleAdjusted) {
			Entities.editEntity(mirrorID, { userData: "{\"grabbableKey\":{\"grabbable\":false}}" });
			Messages.sendMessage(mirrorChannel, JSON.stringify({ clientFunction: "adjustMirrorToggle", dimLength: newDimLength}));
			mirrorToggleAdjusted = true;
		}

		if(mirrorProps.dimensions.y > 2.5 * mirrorProps.dimensions.x) {
			newDimLength = 0.0625 * (mirrorProps.dimensions.x + (mirrorProps.dimensions.y / 2.5));
		} else if(mirrorProps.dimensions.x > 2.5 * mirrorProps.dimensions.y) {
			newDimLength = 0.0625 * ((mirrorProps.dimensions.x / 2.5) + mirrorProps.dimensions.y);
		} else {
			newDimLength = 0.0625 * (mirrorProps.dimensions.x + mirrorProps.dimensions.y);
		}
		if(newDimLength > maxScalerDim) {
			newDimLength = maxScalerDim;
		} else if(newDimLength < minScalerDim) {
			newDimLength = minScalerDim;
		}
		
		Entities.editEntity(_this.entityID, { dimensions: {	x: newDimLength, y: newDimLength, z: newDimLength } });
		if(!regPointChanged){
			regPointChanged = true;
			Entities.editEntity(mirrorID, { registrationPoint: { x: 0, y: 1, z: 0.5 } } );
			var localAdjustedPos = { 
				x: (mirrorProps.dimensions.x * -1 * halfMultiplier.x),
				y: (mirrorProps.dimensions.y * -1 * halfMultiplier.y),
				z: 0
			};
			var localRotatedAdjustedPos = Vec3.multiplyQbyV(mirrorProps.rotation, localAdjustedPos);
			var worldRotatedAdjustedPos = Vec3.sum(mirrorProps.position, localRotatedAdjustedPos);
			Entities.editEntity(mirrorID, { position: worldRotatedAdjustedPos } );
		}
		
		var diagonalVec = Vec3.subtract(mirrorScalerProps.position,mirrorProps.position);
		var unrotatedDiagonalVec = Vec3.multiplyQbyV(Quat.inverse(mirrorProps.rotation),diagonalVec);
		var newDimX = Math.abs(unrotatedDiagonalVec.x);
		var newDimY = Math.abs(unrotatedDiagonalVec.y);
		if(newDimX > maxMirrorDim) {
			newDimX = maxMirrorDim;
		} else if(newDimX < minMirrorDim) {
			newDimX = minMirrorDim;
		}
		if(newDimY > maxMirrorDim) {
			newDimY = maxMirrorDim;
		} else if(newDimY < minMirrorDim) {
			newDimY = minMirrorDim;
		}
		var newMirrorDims = { x: newDimX, y: newDimY, z: mirrorProps.dimensions.z };
		Entities.editEntity(mirrorID, { dimensions: newMirrorDims} );
		Messages.sendMessage(mirrorChannel, JSON.stringify({ clientFunction: "updateMirrorOverlay"}));
	};
	
	// When the mirror scaler is released, reset the texture and registration point back to their default values, and 
	// re-adjust the position to account for the changed registration point. Sends a message to 'mirrorServer.js' to reveal 
	// all mirror editors. Also sends a message to 'mirrorClient.js' to update the mirror overlay.
	var releaseMirrorScaler = function(entityID, data) {
		var mirrorScalerProps = Entities.getEntityProperties(_this.entityID, ["textures"]);
		if(JSON.stringify(mirrorScalerProps.textures) !== JSON.stringify(inactiveTexture)) {
			var mirrorProps = Entities.getEntityProperties(mirrorID, ["dimensions", "position", "registrationPoint", "rotation"]);
			Entities.editEntity(_this.entityID, { textures: inactiveTexture });
			if(regPointChanged) {
				regPointChanged = false;
				Entities.editEntity(mirrorID, { registrationPoint: defaultRegPoint});
				var localAdjustedPos = { 
					x: (mirrorProps.dimensions.x * halfMultiplier.x),
					y: (mirrorProps.dimensions.y * halfMultiplier.y),
					z: 0
				};
				var localRotatedAdjustedPos = Vec3.multiplyQbyV(mirrorProps.rotation, localAdjustedPos);
				var worldRotatedAdjustedPos = Vec3.sum(mirrorProps.position, localRotatedAdjustedPos);
				Entities.editEntity(mirrorID, { position: worldRotatedAdjustedPos } );
			}
			
			Entities.editEntity(_this.entityID, { velocity: Vec3.ZERO });
			Entities.editEntity(_this.entityID, { angularVelocity: Vec3.ZERO });
			localAdjustedPos = { 
				x: (mirrorProps.dimensions.x * 2 * halfMultiplier.x),
				y: (mirrorProps.dimensions.y * 2 * halfMultiplier.y),
				z: 0
			};
			localRotatedAdjustedPos = Vec3.multiplyQbyV(mirrorProps.rotation, localAdjustedPos);
			worldRotatedAdjustedPos = Vec3.sum(mirrorProps.position, localRotatedAdjustedPos);
			Entities.editEntity(_this.entityID, { position: worldRotatedAdjustedPos } );
			Entities.editEntity(_this.entityID, { rotation: mirrorProps.rotation });
			Entities.editEntity(mirrorID, { userData: "{\"grabbableKey\":{\"grabbable\":true}}" });
			Messages.sendMessage(mirrorChannel, JSON.stringify({ clientFunction: "adjustMirrorToggle", dimLength: newDimLength}));
			mirrorToggleAdjusted = false;
			Messages.sendMessage(mirrorChannel, JSON.stringify({ clientFunction: "updateMirrorOverlay"}));
		}
	};
	
	// ENTITY FUNCTIONS
	
	// Called only once when the script is loaded in. Finds the mirror's entity ID and sets the mirror scaler number
	_this.preload = function(entityID) {
		Script.setTimeout(function() {  // Timeout set so that server script can get be initialized
			_this.entityID = entityID;
			var mirrorScalerProps = Entities.getEntityProperties(_this.entityID, ["position"]);
			var foundEntitiesArray = Entities.findEntities(mirrorScalerProps.position, 0.01);
			foundEntitiesArray.forEach(function(foundEntityID) {
				var foundEntityName = Entities.getEntityProperties(foundEntityID, ["name"]).name;
				if(foundEntityName === "mirror") {
					mirrorID = foundEntityID;
				}
			})
			Entities.editEntity(_this.entityID, { textures: inactiveTexture });
			mirrorToggleAdjusted = false;
			newDimLength = defaultDimLength;
			mirrorChannel = "mirrorChannel".concat(mirrorID);
			Controller.mouseReleaseEvent.connect(releaseMirrorScaler);
		}, 1500);
	}
	
	_this.continueNearGrab = grabMirrorScaler;
	_this.continueDistanceGrab = grabMirrorScaler;
	_this.holdingClickOnEntity = grabMirrorScaler;
	_this.releaseGrab = releaseMirrorScaler;
	
	// Called only once when the script is deleted and disconnects functions
	_this.unload = function(entityID) {
		Controller.mouseReleaseEvent.disconnect(releaseMirrorScaler);
	}
})