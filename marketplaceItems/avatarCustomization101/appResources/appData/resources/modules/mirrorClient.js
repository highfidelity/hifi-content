//
//  mirrorClient.js
//
//  Created by Patrick Manalich
//  Edited by Rebecca Stankus on 8/30/17.
//  Edited by David Back on 11/17/17.
//  Edited by Mark Brosche on 2/8/19.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// Attach `mirrorClient.js` to a box entity whose z dimension is very small,
// and whose x and y dimensions are up to you. See comments in `mirrorReflection.js`
// for more information about the mirror on/off zone.

"use strict";

(function () { // BEGIN LOCAL SCOPE

    // VARIABLES
    /* globals utils, Render */
    var _this = this;
    var MAX_MIRROR_RESOLUTION_SIDE_PX = 1500;        // The max pixel resolution of the long side of the mirror
    var ZERO_ROT = { w: 1, x: 0, y: 0, z: 0 };   // Constant quaternion for a rotation of 0
    var FAR_CLIP_DISTANCE = 5;     // The far clip distance for the spectator camera when the mirror is on
    var mirrorOverlayID;            // The entity ID of the overlay that displays the mirror reflection
    var mirrorOverlayRunning;       // True if mirror overlay is reflecting, false otherwise
    var mirrorOverlayOffset = 0.01; // The distance between the center of the mirror and the mirror overlay
    var spectatorCameraConfig = Render.getConfig("SecondaryCamera");    // Render configuration for the spectator camera
    var lastDimensions = { x: 0, y: 0 };        // The previous dimensions of the mirror
    var previousFarClipDistance;    // Store the specator camera's previous far clip distance that we override for the mirror
    var owningAvatarID;

    // LOCAL FUNCTIONS    

    // If owning avatar crashes or leaves domain, mirror will delete itself
    function avatarRemovedDeleteMirror(avatarID) {
        if (owningAvatarID === avatarID) {
            _this.mirrorOverlayOff();
        }
    }
    
    // When x or y dimensions of the mirror change - reset the resolution of the 
    // spectator camera and edit the mirror overlay to adjust for the new dimensions
    function updateMirrorDimensions(forceUpdate) {
        if (mirrorOverlayRunning) {
            var newDimensions = Entities.getEntityProperties(_this.entityID, 'dimensions').dimensions;

            if (forceUpdate === true || (newDimensions.x !== lastDimensions.x || newDimensions.y !== lastDimensions.y)) {
                var mirrorResolution = _this.calculateMirrorResolution(newDimensions);
                spectatorCameraConfig.resetSizeSpectatorCamera(mirrorResolution.x, mirrorResolution.y);
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

    _this.calculateMirrorResolution = function(entityDimensions) {
        var mirrorResolutionX, mirrorResolutionY;
        if (entityDimensions.x > entityDimensions.y) {
            mirrorResolutionX = MAX_MIRROR_RESOLUTION_SIDE_PX;
            mirrorResolutionY = Math.round(mirrorResolutionX * entityDimensions.y / entityDimensions.x);
        } else {
            mirrorResolutionY = MAX_MIRROR_RESOLUTION_SIDE_PX;
            mirrorResolutionX = Math.round(mirrorResolutionY * entityDimensions.x / entityDimensions.y);
        }

        var resolution = {
            "x": mirrorResolutionX,
            "y": mirrorResolutionY
        };

        return resolution;
    };
    
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
                var entityProperties = Entities.getEntityProperties(_this.entityID, ['dimensions', 'owningAvatarID']);
                var mirrorEntityDimensions = entityProperties.dimensions;
                owningAvatarID = entityProperties.owningAvatarID;
                var initialResolution = _this.calculateMirrorResolution(mirrorEntityDimensions);
                spectatorCameraConfig.resetSizeSpectatorCamera(initialResolution.x, initialResolution.y);
                spectatorCameraConfig.enableSecondaryCameraRenderConfigs(true);
                AvatarList.avatarRemovedEvent.connect(avatarRemovedDeleteMirror);
                updateMirrorOverlay();
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
            mirrorOverlayRunning = false;
            AvatarList.avatarRemovedEvent.disconnect(avatarRemovedDeleteMirror);
        }
    };
    
    // ENTITY FUNCTIONS
    _this.preload = function(entityID) {
        _this.entityID = entityID;
        mirrorOverlayRunning = false;
    
        _this.mirrorOverlayOn(true);
    };
    
    // Turn off mirror on unload
    _this.unload = function(entityID) {
        _this.mirrorOverlayOff();
    };
});
