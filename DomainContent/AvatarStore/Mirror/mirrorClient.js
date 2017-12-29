//
//  mirrorClient.js
//
//  Created by Patrick Manalich
//  Edited by Rebecca Stankus on 8/30/17.
//  Edited by David Back on 11/17/17.
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
    var RESOLUTION = 1024;          // The resolution of the mirror when turned on
    var ZERO_ROT = { w: 1, x: 0, y: 0, z: 0 };   // Constant quaternion for a rotation of 0
    var FAR_CLIP_DISTANCE = 16;     // The far clip distance for the spectator camera when the mirror is on
    var mirrorOverlayID;            // The entity ID of the overlay that displays the mirror reflection
    var mirrorOverlayRunning;       // True if mirror overlay is reflecting, false otherwise
    var mirrorOverlayOffset = 0.01; // The distance between the center of the mirror and the mirror overlay
    var spectatorCameraConfig = Render.getConfig("SecondaryCamera");    // Render configuration for the spectator camera
    var lastDimensions = { x: 0, y: 0 };        // The previous dimensions of the mirror
    var previousFarClipDistance;    // Store the specator camera's previous far clip distance that we override for the mirror

    // LOCAL FUNCTIONS    
    function isPositionInsideBox(position, boxProperties) {
        var localPosition = Vec3.multiplyQbyV(Quat.inverse(boxProperties.rotation), 
                                              Vec3.subtract(MyAvatar.position, boxProperties.position));
        var halfDimensions = Vec3.multiply(boxProperties.dimensions, 0.5);
        return -halfDimensions.x <= localPosition.x &&
                halfDimensions.x >= localPosition.x &&
               -halfDimensions.y <= localPosition.y &&
                halfDimensions.y >= localPosition.y &&
               -halfDimensions.z <= localPosition.z &&
                halfDimensions.z >= localPosition.z;
    }
    
    // When x or y dimensions of the mirror change - reset the resolution of the 
    // spectator camera and edit the mirror overlay to adjust for the new dimensions
    function updateMirrorDimensions(forceUpdate) {
        if (mirrorOverlayRunning) {
            var newDimensions = Entities.getEntityProperties(_this.entityID, 'dimensions').dimensions;
            if (forceUpdate === true || (newDimensions.x != lastDimensions.x || newDimensions.y != lastDimensions.y)) {
                spectatorCameraConfig.resetSizeSpectatorCamera(newDimensions.x * RESOLUTION, newDimensions.y * RESOLUTION);
                Overlays.editOverlay(mirrorOverlayID, {
                    dimensions: {
                        x: -(newDimensions.y > newDimensions.x ? newDimensions.y : newDimensions.x),
                        y: -(newDimensions.y > newDimensions.x ? newDimensions.y : newDimensions.x),
                        z: 0
                    }
                });
            }
            lastDimensions = newDimensions;
        }
    }

    // Takes in an mirror scaler number which is used for the index of "halfDimSigns" that is needed to adjust the mirror 
    // overlay's position. Deletes and re-adds the mirror overlay so the url and position is updated.
    function updateMirrorOverlay() {
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
                localRotation: ZERO_ROT,
                localPosition: { 
                    x: 0,
                    y: 0,
                    z: mirrorOverlayOffset
                }
            });
            updateMirrorDimensions(true);
        }
    }
    
    // Sets up spectator camera to render the mirror, calls 'updateMirrorOverlay' once to set up
    // mirror overlay, then connects 'updateMirrorDimensions' to update dimension changes
    _this.mirrorOverlayOn = function(onPreload) {
        if (!mirrorOverlayRunning) {
            if (!spectatorCameraConfig.attachedEntityId) {
                mirrorOverlayRunning = true;
                spectatorCameraConfig.mirrorProjection = true;
                spectatorCameraConfig.attachedEntityId = _this.entityID;
                previousFarClipDistance = spectatorCameraConfig.farClipPlaneDistance;
                spectatorCameraConfig.farClipPlaneDistance = FAR_CLIP_DISTANCE;
                Render.getConfig("SecondaryCameraJob.ToneMapping").curve = 0;
                var initialDimensions = Entities.getEntityProperties(_this.entityID, 'dimensions').dimensions;
                spectatorCameraConfig.resetSizeSpectatorCamera(initialDimensions.x * RESOLUTION, 
                                                               initialDimensions.y * RESOLUTION);
                spectatorCameraConfig.enableSecondaryCameraRenderConfigs(true);
                updateMirrorOverlay();
                Script.update.connect(updateMirrorDimensions);
            } else {
                print("Cannot turn on mirror if spectator camera is already in use");
            }
        }
    };
    
    // Resets spectator camera, deletes the mirror overlay, and disconnects 'updateMirrorDimensions' 
    _this.mirrorOverlayOff = function() {
        if (mirrorOverlayRunning) {
            spectatorCameraConfig.enableSecondaryCameraRenderConfigs(false);
            spectatorCameraConfig.mirrorProjection = false;
            spectatorCameraConfig.attachedEntityId = null;
            spectatorCameraConfig.farClipPlaneDistance = previousFarClipDistance;
            Render.getConfig("SecondaryCameraJob.ToneMapping").curve = 1;
            Overlays.deleteOverlay(mirrorOverlayID);
            Script.update.disconnect(updateMirrorDimensions);
            mirrorOverlayRunning = false;
        }
    };
    
    // ENTITY FUNCTIONS
    _this.preload = function(entityID) {
        _this.entityID = entityID;
        mirrorOverlayRunning = false;
    
        // If avatar is already inside the mirror zone at the time preload is called then turn on the mirror
        var children = Entities.getChildrenIDs(_this.entityID);
        var childZero = Entities.getEntityProperties(children[0]);
        if (isPositionInsideBox(MyAvatar.position, {
                position: childZero.position, 
                rotation: childZero.rotation, 
                dimensions: childZero.dimensions
            })) {
            _this.mirrorOverlayOn(true);
        }
    };
    
    // Turn off mirror on unload
    _this.unload = function(entityID) {
        _this.mirrorOverlayOff();
    };
});
