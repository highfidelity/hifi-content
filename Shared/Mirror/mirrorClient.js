//
//  mirrorClient.js
//
//  Created by Patrick Manalich
//  Edited by Rebecca Stankus on 8/30/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

"use strict";

(function () { // BEGIN LOCAL SCOPE

    // VARIABLES
    /* globals utils, Render */
    var _this = this;
    var debug = false;	// If true then a spectator camera model and box entity will be rezzed
    var mobileSpectatorCamera = true;	// If true then the spectator camera will follow your avatar's position
    var resolution = 1024;	// The resolution of the mirror when turned on
    var mirrorOverlayID;	// The entity ID of the overlay that displays the mirror reflection
    var mirrorOverlayRunning;	// True if mirror overlay is reflecting, false otherwise
    var mirrorOverlayOffset = 0.01;	// The distance between the center of the mirror and the mirror overlay
    var zeroRot = { w: 1, x: 0, y: 0, z: 0 };	// Constant quaternion for a rotation of 0
    var mirrorToggleOverlayID;	// The entity ID of the mirror toggle overlay
    var intervalID;	// The ID of the interval timer used for clearing in unload
    var editorToClientChannel;	// The channel where mirrorScaler.js sends messages to mirrorClient.js
    var clientToServerChannel;	// The channel where mirrorClient.js sends messages to mirrorServer.js
    var serverToClientChannel;	// The channel where mirrorServer.js sends messages to mirrorClient.js
    var avatarDistanceThreshold = 2;	// The minimum distance the avatar must be from the mirror to reveal mirror editors
    var spectatorCameraConfig = Render.getConfig("SecondaryCamera");	// Render configuration for the spectator camera
    var debugSpectatorCameraID;	// The spectator camera entity ID that represents the spectator camera
    var debugNearClipPlaneID;	// The near clipping plane entity ID that represents the clipping plane of the spectator camera
    var mirrorToggleOverlayModelInactiveURL = "https://hifi-content.s3.amazonaws.com/patrickmanalich/mirrorFolder/models/mirrorToggleOverlayInactive.fbx";
    var halfDimSigns = [	// Array that holds objects with an x and y, which will be multiplied to the dimensions of the mirror
        // to find the new local position of the mirror scalers relative to the mirror, which is necessary after changing
        // the registration point since this will change the position
        { x: -0.5, y: 0.5 },	// Upper Left
        { x: 0.5, y: 0.5 },		// Upper Right
        { x: -0.5, y: -0.5 },	// Lower Left
        { x: 0.5, y: -0.5 },	// Lower Right
        { x: 0, y: 0 }			// Center
    ];
    var lastHalfDimSignUsed = halfDimSigns[4];	// Contains one of the five objects in halfDimSigns that was last used when updating the overlay

    // LOCAL FUNCTIONS
	
    // Checks the distance between the user and the mirror and reveal the mirror editors when the user is within the 'avatarDistanceThreshold' range
    var checkAvatarDistance = function() {
        var mirrorProps = Entities.getEntityProperties(_this.entityID, ["position"]);
        var avatarDistance = Math.abs(Vec3.distance(MyAvatar.position, mirrorProps.position));
        if (avatarDistance < avatarDistanceThreshold) {
            Messages.sendMessage(clientToServerChannel, JSON.stringify({ serverFunction: "updateHeartbeat", withinThreshold: true }));
        } else if (avatarDistance > avatarDistanceThreshold) {
            Messages.sendMessage(clientToServerChannel, JSON.stringify({ serverFunction: "updateHeartbeat", withinThreshold: false }));
        }
    };
	
    // Takes in the spectator camera position and creates an array of the front four vertices of the mirror. It then calculates
    // the distance between each vertex and the spectator camera position and returns the farthest distance.
    function findNearClipPlaneDistance(spectatorCameraPos) {		
        var mirrorProps = Entities.getEntityProperties(_this.entityID, ["position", "dimensions", "rotation"]);
        var mirrorFrontVertices = [];	// An array containing the positions of the front 4 vertices on the mirror, where 0 is the
        // Upper Right, 1 is the Lower Right, 2 is the Upper Left, and 3 is Lower Left
        var vertexPosX;
        var vertexPosY;
        var vertexPosZ;
        var handles = 2;

        for (var i = 0; i < handles; i++) {
            if (i === 0){
                vertexPosX = 0.5 * mirrorProps.dimensions.x;
            } else {
                vertexPosX = -0.5 * mirrorProps.dimensions.x;
            }
            for (var j = 0; j < 2; j++) {
                if (j === 0){
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
        for (var k = 0; k < 4; k++) {
            var distance = Math.abs(Vec3.distance(mirrorFrontVertices[k], spectatorCameraPos));
            if (distance > maxDistance) {
                maxDistance = distance;
            }
        }
        return maxDistance;
    }
	
    // Updates the spectator camera configuration to orient the view frustrum in such a way that it mimics
    // the way a mirror reflects what you percieve based on where you are standing relative to the mirror if 'mobileSpectatorCamera'
    // is true. Else it will place the spectator camera at the center of the mirror and will be immobile
    function updateSpectatorCamera() {
        if (mirrorOverlayRunning) {
            var mirrorProps = Entities.getEntityProperties(_this.entityID, ["dimensions", "position", "rotation"]);
            var headPos = Camera.getPosition();
            var adjustedPos = {	
                x: (mirrorProps.dimensions.x * lastHalfDimSignUsed.x),
                y: (mirrorProps.dimensions.y * lastHalfDimSignUsed.y),
                z: 0
            };
            var rotatedAdjustedPos = Vec3.multiplyQbyV(mirrorProps.rotation, adjustedPos);
            var rotatedAdjustedMirrorPos = Vec3.sum(mirrorProps.position, rotatedAdjustedPos);
            if (mobileSpectatorCamera) {	// mobile
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
			
            if (debug) {
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

    // Takes in an mirror scaler number which is used for the index of "halfDimSigns" that is needed to adjust the mirror 
    // overlay's position. Deletes and re-adds the mirror overlay so the url and position is updated, and resets the 
    // resolution of the spectator camera
    function updateMirrorOverlay(mirrorScalerNum) {
        if (mirrorOverlayRunning) {
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
                localPosition: { 
                    x: (dimX * halfDimSigns[mirrorScalerNum].x),
                    y: (dimY * halfDimSigns[mirrorScalerNum].y),
                    z: mirrorOverlayOffset
                },
                dimensions: {
                    x: -(dimY > dimX ? dimY : dimX),
                    y: -(dimY > dimX ? dimY : dimX),
                    z: 0
                }
            });
            spectatorCameraConfig.resetSizeSpectatorCamera(dimX * resolution, dimY * resolution);
            lastHalfDimSignUsed = halfDimSigns[mirrorScalerNum];
        }
    }
	
    // Calls 'updateMirrorOverlay' once to set up mirror overlay, then connects 'updateSpectatorCamera' and starts rendering
    function mirrorOverlayOn() {
        mirrorOverlayRunning = true;	// SHOULD THIS BE OUTSIDE IF STATEMENT
        if (!spectatorCameraConfig.attachedEntityId) {
            updateMirrorOverlay(4);
            Script.update.connect(updateSpectatorCamera);
            spectatorCameraConfig.enableSecondaryCameraRenderConfigs(true);
            if (debug) {
                Entities.editEntity(debugSpectatorCameraID, { visible: true });
                Entities.editEntity(debugNearClipPlaneID, { visible: true });
            }
        } else {
            print("Cannot turn on mirror if spectator camera is already in use");
        }
    }
	
    // Deletes the mirror overlay and disconnects 'updateSpectatorCamera' and rendering
    function mirrorOverlayOff() {
        if (!spectatorCameraConfig.attachedEntityId) {
            spectatorCameraConfig.enableSecondaryCameraRenderConfigs(false);
            if (mirrorOverlayRunning) {
                Overlays.editOverlay(mirrorToggleOverlayID, { url: mirrorToggleOverlayModelInactiveURL });
                Overlays.deleteOverlay(mirrorOverlayID);
                Script.update.disconnect(updateSpectatorCamera);
                if (debug) {
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
        Script.setTimeout(function() { // Timeout set so that server script can get be initialized
            print("preload mirror client");
            _this.entityID = entityID;
            mirrorOverlayRunning = false;
            editorToClientChannel = "editorToClientChannel".concat(_this.entityID);
            clientToServerChannel = "clientToServerChannel".concat(_this.entityID);
            serverToClientChannel = "serverToClientChannel".concat(_this.entityID);
            Messages.subscribe(editorToClientChannel);
            Messages.subscribe(serverToClientChannel);
            Messages.messageReceived.connect(_this, _this.onReceivedMessage);
            intervalID = Script.setInterval(checkAvatarDistance, 500);
			
            if (debug) {
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
        }, 1000);
    };
	
    // Toggle the mirror overlay on and off
    _this.toggleMirrorOverlay = function (entityID, data) {
        if (!mirrorOverlayRunning) {
            mirrorOverlayOn();
        } else {
            mirrorOverlayOff();
        }
    };
	
    _this.startNearGrab = function(entityID, data) {
        Messages.sendMessage(clientToServerChannel, JSON.stringify({ serverFunction: "setAllInvisible"}));
    };
    _this.releaseGrab = function(entityID, data) {	
        Messages.sendMessage(clientToServerChannel, JSON.stringify({ serverFunction: "setAllVisible", dimLength: -1}));
    };
	
    // Turns off mirror and deletes all mirror editors
    _this.unload = function(entityID) {
        print("unload mirror client");
        Script.clearInterval(intervalID);
        mirrorOverlayOff();
        Overlays.deleteOverlay(mirrorToggleOverlayID);	
        Messages.unsubscribe(editorToClientChannel);
        Messages.subscribe(serverToClientChannel);
        Messages.messageReceived.disconnect(_this, _this.onReceivedMessage);
        if (debug) {
            Entities.deleteEntity(debugSpectatorCameraID);
            Entities.deleteEntity(debugNearClipPlaneID);			
        }
    };

});
