"use strict";

(function () { // BEGIN LOCAL SCOPE

	// VARIABLES
	
	var _this = this;
	var mirrorID;	// The entityID of the mirror object that spawns the four mirror scalers
	var inactiveTexture = '{ "inactive": "' + "https://hifi-content.s3.amazonaws.com/patrickmanalich/mirrorFolder/models/mirrorScaler.fbx/mirrorScaler.fbm/scale-texture.png" + '"}';
	var activeTexture = '{ "inactive": "' + "https://hifi-content.s3.amazonaws.com/patrickmanalich/mirrorFolder/models/mirrorScaler.fbx/mirrorScaler.fbm/scale-texture-active.png" + '"}';
	var defaultRegPoint = { x: 0.5, y: 0.5, z: 0.5};	// Default registration point of entities, which is in the center
	var maxScalerDim = 0.05;	// The maximum dimension length the mirror scalers can grow to
	var minScalerDim = 0.0125;	// The minimum dimension length the mirror scalers can shrink to
	var maxMirrorDim = 1.6;		// The maximum dimension length the mirror can grow to
	var minMirrorDim = 0.06;	// The minimum dimension length the mirror can shrink to
	var minVerticalGap = 0.14;	// The minimum gap between two scalers in the local Y direction before they are restricted to 'minScalerDim'
	var defaultDimLength = 0.025;	// The default dimensions of the mirror editors
	var newDimLength;	// The dimension of the mirror editors based on the size and aspect ratio of the mirror
	var regPointChanged = false;	// True if the registration point of the mirror has been changed from 0, 0, 0
	var mirrorToggleAdjusted;	// If the entity method 'adjustMirrorToggle' has been called, this will be true (for efficiency)
	
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
			Entities.callEntityMethod(mirrorID, 'adjustMirrorToggle', [JSON.stringify(newDimLength)]);
			mirrorToggleAdjusted = true;
		}

		newDimLength = 0.125 * mirrorProps.dimensions.x;	// Magic numbers, I know. But I'm not sure how important changing these are though
		if(newDimLength > maxScalerDim) {
			newDimLength = maxScalerDim;
		} else if(newDimLength < minScalerDim) {
			newDimLength = minScalerDim;
		}
		if((mirrorProps.dimensions.y - newDimLength) < minVerticalGap) {
			newDimLength = newDimLength - ((0.18 - mirrorProps.dimensions.y) / 3);
			if(newDimLength < minScalerDim) {
				newDimLength = minScalerDim;
			}
		}
		
		Entities.editEntity(_this.entityID, { dimensions: {	x: newDimLength, y: newDimLength, z: newDimLength } });
		if(!regPointChanged){
			regPointChanged = true;
			Entities.editEntity(mirrorID, { registrationPoint: { x: 0, y: 1, z: 0.5 } } );
			var localAdjustedPos = { 
				x: (mirrorProps.dimensions.x * -0.5),
				y: (mirrorProps.dimensions.y * 0.5),
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
		Entities.callEntityMethod(mirrorID, 'updateMirrorOverlay', []);
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
					x: (mirrorProps.dimensions.x * 0.5),
					y: (mirrorProps.dimensions.y * -0.5),
					z: 0
				};
				var localRotatedAdjustedPos = Vec3.multiplyQbyV(mirrorProps.rotation, localAdjustedPos);
				var worldRotatedAdjustedPos = Vec3.sum(mirrorProps.position, localRotatedAdjustedPos);
				Entities.editEntity(mirrorID, { position: worldRotatedAdjustedPos } );
			}
			
			Entities.editEntity(_this.entityID, { velocity: Vec3.ZERO });
			Entities.editEntity(_this.entityID, { angularVelocity: Vec3.ZERO });
			localAdjustedPos = { 
				x: (mirrorProps.dimensions.x * 1),
				y: (mirrorProps.dimensions.y * -1),
				z: 0
			};
			localRotatedAdjustedPos = Vec3.multiplyQbyV(mirrorProps.rotation, localAdjustedPos);
			worldRotatedAdjustedPos = Vec3.sum(mirrorProps.position, localRotatedAdjustedPos);
			Entities.editEntity(_this.entityID, { position: worldRotatedAdjustedPos } );
			Entities.editEntity(_this.entityID, { rotation: mirrorProps.rotation });
			Entities.editEntity(mirrorID, { userData: "{\"grabbableKey\":{\"grabbable\":true}}" });
			Entities.callEntityMethod(mirrorID, 'adjustMirrorToggle', [JSON.stringify(newDimLength)]);
			mirrorToggleAdjusted = false;
			Entities.callEntityMethod(mirrorID, 'updateMirrorOverlay', []);
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
			Controller.mouseReleaseEvent.connect(releaseMirrorScaler);
		}, 1500);
	}
	
	_this.continueNearGrab = grabMirrorScaler;
	_this.continueDistantGrab = grabMirrorScaler;
	_this.holdingClickOnEntity = grabMirrorScaler;
	_this.releaseGrab = releaseMirrorScaler;
	
	// Called only once when the script is deleted and disconnects functions
	_this.unload = function(entityID) {
		Controller.mouseReleaseEvent.disconnect(releaseMirrorScaler);
	}
})