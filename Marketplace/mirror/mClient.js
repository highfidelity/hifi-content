"use strict";

(function () { // BEGIN LOCAL SCOPE

    // VARIABLES
	
    var _this = this;
	var debug = false;	// If true then a spectator camera model and box entity will be rezzed
	var mobileSpectatorCamera = true;	// If true then the spectator camera will follow your avatar's position
	var resolution = 1024;	// The resolution of the mirror when turned on
	var defaultDimLength = 0.025;
    var mirrorOverlayID;	// The entity ID of the overlay that displays the mirror reflection
	var mirrorOverlayRunning;	// True if mirror overlay is reflecting, false otherwise
	var mirrorScalerGrabbed;
	var mirrorOverlayOffset = 0.01;	// The distance between the center of the mirror and the mirror overlay
	var mirrorScalerID; // The entity ID of the mirror scaler
	var mirrorToggleID;	// The entity ID of the mirror toggle
	var mirrorToggleOverlayID;	// The entity ID of the mirror toggle overlay
	var spectatorCameraConfig = Render.getConfig("SecondaryCamera");	// Render configuration for the spectator camera
	var debugSpectatorCameraID;	// The spectator camera entity ID that represents the spectator camera
	var debugNearClipPlaneID;	// The near clipping plane entity ID that represents the clipping plane of the spectator camera
	var mirrorToggleOverlayModelInactiveURL = "https://hifi-content.s3.amazonaws.com/patrickmanalich/mirrorFolder/models/mirrorToggleOverlayInactive.fbx";
	var mirrorToggleOverlayModelActiveURL = "https://hifi-content.s3.amazonaws.com/patrickmanalich/mirrorFolder/models/mirrorToggleOverlayActive.fbx";
    var zeroRot = { w: 1, x: 0, y: 0, z: 0 };	// Constant quaternion for a rotation of 0

	// LOCAL FUNCTIONS
	
	// Takes in the spectator camera position and creates an array of the front four vertices of the mirror. It then calculates
	// the distance between each vertex and the spectator camera position and returns the farthest distance.
	function findNearClipPlaneDistance(spectatorCameraPos) {		
		var mirrorProps = Entities.getEntityProperties(_this.entityID, ["position", "dimensions", "rotation"]);
		var mirrorFrontVertices = [];	// An array containing the positions of the front 4 vertices on the mirror, where 0 is the
										// Upper Right, 1 is the Lower Right, 2 is the Upper Left, and 3 is Lower Left
		var vertexPosX;
		var vertexPosY;
		var vertexPosZ;

		for(var i = 0; i < 2; i++) {
			if(i === 0){
				vertexPosX = 0.5 * mirrorProps.dimensions.x;
			} else {
				vertexPosX = -0.5 * mirrorProps.dimensions.x;
			}
			for(var j = 0; j < 2; j++) {
				if(j === 0){
					vertexPosY = 0.5 * mirrorProps.dimensions.y;
				} else {
					vertexPosY = -0.5 * mirrorProps.dimensions.y;
				}
				vertexPosZ = 0.5 * mirrorProps.dimensions.z;
				var localPos = { x: vertexPosX, y: vertexPosY, z: vertexPosZ };
				mirrorFrontVertices[j+i*2] = Vec3.sum(Vec3.multiplyQbyV(mirrorProps.rotation, localPos), mirrorProps.position);			
			}
		}
		var maxDistance = 0;
		for(var i = 0; i < 4; i++) {
			var distance = Math.abs(Vec3.distance(mirrorFrontVertices[i], spectatorCameraPos));
			if(distance > maxDistance) {
				maxDistance = distance;
			}
		}
		return maxDistance;
	}
	
	// Updates the spectator camera configuration to orient the view frustrum in such a way that it mimics
	// the way a mirror reflects what you percieve based on where you are standing relative to the mirror if 'mobileSpectatorCamera'
	// is true. Else it will place the spectator camera at the center of the mirror and will be immobile
    function updateSpectatorCamera() {
		if(mirrorOverlayRunning) {
			var mirrorProps = Entities.getEntityProperties(_this.entityID, ["dimensions", "position", "rotation"]);
			var headPos = Camera.getPosition();
			var adjustedPos;
			if(!mirrorScalerGrabbed) {
				adjustedPos = {	x: 0, y: 0,	z: 0};
			} else {
				adjustedPos = {	x: (mirrorProps.dimensions.x * 0.5), y: (mirrorProps.dimensions.y * -0.5), z: 0 };
			}
			var rotatedAdjustedPos = Vec3.multiplyQbyV(mirrorProps.rotation, adjustedPos);
			var rotatedAdjustedMirrorPos = Vec3.sum(mirrorProps.position, rotatedAdjustedPos);
			if(mobileSpectatorCamera) {	// mobile
				var mirrorToHeadVec = Vec3.subtract(headPos, rotatedAdjustedMirrorPos);
				var zLocalVecNormalized = Vec3.multiplyQbyV(mirrorProps.rotation, Vec3.UNIT_Z);
				var distanceFromMirror = (Vec3.dot(zLocalVecNormalized, mirrorToHeadVec));
				var oppositeSideMirrorPos = Vec3.subtract(headPos, Vec3.multiply(2 * distanceFromMirror, zLocalVecNormalized));
				spectatorCameraConfig.orientation = Quat.lookAt(oppositeSideMirrorPos, rotatedAdjustedMirrorPos, Vec3.multiplyQbyV(mirrorProps.rotation, Vec3.UP));
				spectatorCameraConfig.position = oppositeSideMirrorPos;
				spectatorCameraConfig.nearClipPlaneDistance = findNearClipPlaneDistance(spectatorCameraConfig.position);
				var distanceAway = Vec3.distance(rotatedAdjustedMirrorPos, headPos);
				var halfHeight = mirrorProps.dimensions.y / 2;
				var halfAngle = Math.atan(halfHeight/distanceAway) / (Math.PI / 180);
				spectatorCameraConfig.vFoV = halfAngle * 2;
			} else {	// immobile
				spectatorCameraConfig.orientation = Quat.multiply(mirrorProps.rotation, Quat.fromPitchYawRollDegrees(0,180,0));
				spectatorCameraConfig.position = rotatedAdjustedMirrorPos;
				spectatorCameraConfig.nearClipPlaneDistance = (mirrorProps.dimensions.z / 2) + mirrorOverlayOffset;
				spectatorCameraConfig.vFoV = 45;
			}
			
			if(debug) {
				Entities.editEntity(debugSpectatorCameraID, {position: oppositeSideMirrorPos});
				Entities.editEntity(debugSpectatorCameraID, {rotation: spectatorCameraConfig.orientation});
				var offsetVector = Vec3.multiply(Vec3.FRONT, findNearClipPlaneDistance(spectatorCameraConfig.position));
				var relativeOffset = Vec3.multiplyQbyV(spectatorCameraConfig.orientation, offsetVector);
				var worldPosition = Vec3.sum(spectatorCameraConfig.position, relativeOffset);
				Entities.editEntity(debugNearClipPlaneID, {position: worldPosition});
				Entities.editEntity(debugNearClipPlaneID, {rotation: spectatorCameraConfig.orientation});
			}
		}
    }
	
	// Calls 'updateMirrorOverlay' once to set up mirror overlay, then connects 'updateSpectatorCamera' and starts rendering
    function mirrorOverlayOn() {
		mirrorOverlayRunning = true;	// SHOULD THIS BE OUTSIDE IF STATEMENT
		if(!spectatorCameraConfig.attachedEntityId) {
			Overlays.editOverlay(mirrorToggleOverlayID, { url: mirrorToggleOverlayModelActiveURL });
			Entities.callEntityMethod(_this.entityID, 'updateMirrorOverlay', []);
			Script.update.connect(updateSpectatorCamera);
			spectatorCameraConfig.enableSecondaryCameraRenderConfigs(true);
			if(debug) {
				Entities.editEntity(debugSpectatorCameraID, { visible: true });
				Entities.editEntity(debugNearClipPlaneID, { visible: true });
			}
		} else {
			print("Cannot turn on mirror if spectator camera is already in use");
		}
    }
	
	// Deletes the mirror overlay and disconnects 'updateSpectatorCamera' and rendering
    function mirrorOverlayOff() {
		if(!spectatorCameraConfig.attachedEntityId) {
			spectatorCameraConfig.enableSecondaryCameraRenderConfigs(false);
			if (mirrorOverlayRunning) {
				Overlays.editOverlay(mirrorToggleOverlayID, { url: mirrorToggleOverlayModelInactiveURL });
				Overlays.deleteOverlay(mirrorOverlayID);
				Script.update.disconnect(updateSpectatorCamera);
				if(debug) {
					Entities.editEntity(debugSpectatorCameraID, { visible: false });
					Entities.editEntity(debugNearClipPlaneID, { visible: false });
				}
			}
		} else {
			print("Cannot turn off mirror if spectator camera is already in use");
		}
		mirrorOverlayRunning = false;	// SHOULD THIS BE OUTSIDE IF STATEMENT
    }
	
	// ENTITY FUNCTIONS
	
	// Called only once when the script is loaded in. Creates mirror scalers and sets their names, IDs, and positions
    _this.preload = function(entityID) {
		Script.setTimeout(function() {  // Timeout set so that server script can get be initialized
			print("preload mirror client");
			_this.entityID = entityID;

			var mirrorProps = Entities.getEntityProperties(_this.entityID, ["position", "rotation", "dimensions"]);
			var foundEntitiesArray = Entities.findEntities(mirrorProps.position, 0.01);
			foundEntitiesArray.forEach(function(foundEntityID) {
				var foundEntityName = Entities.getEntityProperties(foundEntityID, ["name"]).name;
				if(foundEntityName === "mirrorToggle") {
					mirrorToggleID = foundEntityID;
				} else if(foundEntityName === "mirrorScaler") {
					mirrorScalerID = foundEntityID;
				}
			})
			
			var localAdjustedPos = { 
				x: (mirrorProps.dimensions.x * 0.5),
				y: (mirrorProps.dimensions.y * -0.5),
				z: 0
			};
			var localRotatedAdjustedPos = Vec3.multiplyQbyV(mirrorProps.rotation, localAdjustedPos);
			var worldRotatedAdjustedPos = Vec3.sum(mirrorProps.position, localRotatedAdjustedPos);
			Entities.editEntity(mirrorScalerID, { position: worldRotatedAdjustedPos } );
			Entities.editEntity(mirrorScalerID, { visible: true } );
		
			localAdjustedPos = { 
				x: (mirrorProps.dimensions.x * 0.4),
				y: (mirrorProps.dimensions.y * 0.4),
				z: mirrorOverlayOffset
			};
			localRotatedAdjustedPos = Vec3.multiplyQbyV(mirrorProps.rotation, localAdjustedPos);
			worldRotatedAdjustedPos = Vec3.sum(mirrorProps.position, localRotatedAdjustedPos);
			Entities.editEntity(mirrorToggleID, { position: worldRotatedAdjustedPos } );
			
			var mirrorToggleProps = Entities.getEntityProperties(mirrorToggleID, ["position","rotation"]);
			mirrorToggleOverlayID = Overlays.addOverlay("model", {
				name: "mirrorToggleOverlay",
				url: mirrorToggleOverlayModelInactiveURL,
				position: mirrorToggleProps.position,
				rotation: Quat.multiply(mirrorToggleProps.rotation, { w: 0, x: -0.707, y: 0, z: -0.707}),
				dimensions: { x: defaultDimLength / 3, y: defaultDimLength, z: defaultDimLength },
				visible: true
			});

			mirrorOverlayRunning = false;
			mirrorScalerGrabbed = false;
			
			if(debug) {
				debugSpectatorCameraID = Entities.addEntity({
					name: "debugSpectatorCamera",
					dimensions: {
						x: 0.1,
						y: 0.1,
						z: 0.1
					},
					collisionless: true,
					visible: false,
					type: "Model",
					modelURL: "https://hifi-content.s3.amazonaws.com/patrickmanalich/mirrorFolder/models/spectatorCamera.fbx"
				});
				debugNearClipPlaneID = Entities.addEntity({
					name: "debugNearClipPlane",
					color: {
						red: 0,
						blue: 255,
						green: 255
					},
					dimensions: {
						x: 0.1,
						y: 0.2,
						z: 0.005
					},
					collisionless: true,
					visible: false,
					type: "Box"
				});
			}
		}, 1500);
    }

	// Takes in an mirror scaler number which is used for the index of "halfDimSigns" that is needed to adjust the mirror 
	// overlay's position. Deletes and re-adds the mirror overlay so the url and position is updated, and resets the 
	// resolution of the spectator camera
	_this.updateMirrorOverlay = function (entityID, data) {
		if(mirrorOverlayRunning) {
			var mirrorProps = Entities.getEntityProperties(_this.entityID, ["rotation", "dimensions", "position"]);
			var dimX = mirrorProps.dimensions.x;
			var dimY = mirrorProps.dimensions.y;
			
			Overlays.deleteOverlay(mirrorOverlayID);
			mirrorOverlayID = Overlays.addOverlay("image3d", {
				name: "mirrorOverlay",
				url: "resource://spectatorCameraFrame",
				emissive: true,
				parentID: _this.entityID,
				alpha: 1,
				localRotation: zeroRot,
				dimensions: {
					x: -(dimY > dimX ? dimY : dimX),
					y: -(dimY > dimX ? dimY : dimX),
					z: 0
				}
			});
			if(!mirrorScalerGrabbed) {
				Overlays.editOverlay(mirrorOverlayID, {localPosition: { x: 0, y: 0, z: mirrorOverlayOffset }});
			} else {
				Overlays.editOverlay(mirrorOverlayID, {localPosition: { x: (dimX * 0.5), y: (dimY * -0.5), z: mirrorOverlayOffset} });
			}
			spectatorCameraConfig.resetSizeSpectatorCamera(dimX * resolution, dimY * resolution);
		}
	}
	
	// Toggle the mirror overlay on and off
    _this.toggleMirrorOverlay = function (entityID, data) {	// TODO: convert this into one function like adjustMirrorToggle
        if(!mirrorOverlayRunning) {
            mirrorOverlayOn();
        } else {
            mirrorOverlayOff();
        }
    };
	
	// Toggle the mirror overlay on and off
    _this.adjustMirrorToggle = function (entityID, data) {
        if(!mirrorScalerGrabbed) {
            mirrorScalerGrabbed = true;
			Overlays.editOverlay(mirrorToggleOverlayID, {visible: false});
			Entities.editEntity(mirrorToggleID, {userData: "{\"grabbableKey\":{\"wantsTrigger\":false}}"});
        } else {
			var mirrorProps = Entities.getEntityProperties(_this.entityID, ["position", "rotation", "dimensions"]);
			var localAdjustedPos = { 
				x: (mirrorProps.dimensions.x * 0.4),
				y: (mirrorProps.dimensions.y * 0.4),
				z: mirrorOverlayOffset
			};
			var localRotatedAdjustedPos = Vec3.multiplyQbyV(mirrorProps.rotation, localAdjustedPos);
			var worldRotatedAdjustedPos = Vec3.sum(mirrorProps.position, localRotatedAdjustedPos);
			Entities.editEntity(mirrorToggleID, { position: worldRotatedAdjustedPos } );
			Entities.editEntity(mirrorToggleID, { rotation: mirrorProps.rotation } );
			Entities.editEntity(mirrorToggleID, { dimensions: {x: JSON.parse(data), y: JSON.parse(data), z: JSON.parse(data)} } );
			Entities.editEntity(mirrorToggleID, {userData: "{\"grabbableKey\":{\"wantsTrigger\":true}}"});

			
			var mirrorToggleProps = Entities.getEntityProperties(mirrorToggleID, ["position", "rotation", "dimensions"]);
			Overlays.editOverlay(mirrorToggleOverlayID, { position: mirrorToggleProps.position } );
			Overlays.editOverlay(mirrorToggleOverlayID, { rotation: Quat.multiply(mirrorToggleProps.rotation, { w: 0, x: -0.707, y: 0, z: -0.707}) } );
			Overlays.editOverlay(mirrorToggleOverlayID, { dimensions: { x: JSON.parse(data) / 3, y: JSON.parse(data), z: JSON.parse(data) } } );
			Overlays.editOverlay(mirrorToggleOverlayID, { visible: true});
			
			mirrorScalerGrabbed = false;
        }
    };
	
	_this.startNearGrab = function(entityID, data) {
		Entities.editEntity(mirrorScalerID, { userData: "{\"grabbableKey\":{\"grabbable\":false}}" });
		Entities.editEntity(mirrorScalerID, { visible: false } );
		Entities.editEntity(mirrorToggleID, {userData: "{\"grabbableKey\":{\"wantsTrigger\":false}}"});
		Overlays.editOverlay(mirrorToggleOverlayID, { visible: false});
	};
	_this.releaseGrab = function(entityID, data) {
		var mirrorProps = Entities.getEntityProperties(_this.entityID, ["position", "rotation", "dimensions"]);
			// adjust mirror scaler
		var localAdjustedPos = { 
				x: (mirrorProps.dimensions.x * 0.5),
				y: (mirrorProps.dimensions.y * -0.5),
				z: 0
		};
		var localRotatedAdjustedPos = Vec3.multiplyQbyV(mirrorProps.rotation, localAdjustedPos);
		var worldRotatedAdjustedPos = Vec3.sum(mirrorProps.position, localRotatedAdjustedPos);
		Entities.editEntity(mirrorScalerID, { position: worldRotatedAdjustedPos } );
		Entities.editEntity(mirrorScalerID, { rotation: mirrorProps.rotation } );
		Entities.editEntity(mirrorScalerID, { userData: "{\"grabbableKey\":{\"grabbable\":true}}" });
		Entities.editEntity(mirrorScalerID, { visible: true } );
			// adjust mirror toggle
		localAdjustedPos = { 
			x: (mirrorProps.dimensions.x * 0.4),
			y: (mirrorProps.dimensions.y * 0.4),
			z: mirrorOverlayOffset
		};
		localRotatedAdjustedPos = Vec3.multiplyQbyV(mirrorProps.rotation, localAdjustedPos);
		worldRotatedAdjustedPos = Vec3.sum(mirrorProps.position, localRotatedAdjustedPos);
		Entities.editEntity(mirrorToggleID, { position: worldRotatedAdjustedPos } );
		Entities.editEntity(mirrorToggleID, { rotation: mirrorProps.rotation } );
		Entities.editEntity(mirrorToggleID, {userData: "{\"grabbableKey\":{\"wantsTrigger\":true}}"});
			// adjust mirror toggle overlay
		var mirrorToggleProps = Entities.getEntityProperties(mirrorToggleID, ["position", "rotation", "dimensions"]);
		Overlays.editOverlay(mirrorToggleOverlayID, { position: mirrorToggleProps.position } );
		Overlays.editOverlay(mirrorToggleOverlayID, { rotation: Quat.multiply(mirrorToggleProps.rotation, { w: 0, x: -0.707, y: 0, z: -0.707}) } );
		Overlays.editOverlay(mirrorToggleOverlayID, { visible: true});
	};
	
	// Turns off mirror and deletes all mirror editors
	_this.unload = function(entityID) {
        print("unload mirror client");
        mirrorOverlayOff();
		Overlays.deleteOverlay(mirrorToggleOverlayID);
		Entities.deleteEntity(mirrorToggleID);
		if(debug) {
			Entities.deleteEntity(debugSpectatorCameraID);
			Entities.deleteEntity(debugNearClipPlaneID);			
		}
    };

})