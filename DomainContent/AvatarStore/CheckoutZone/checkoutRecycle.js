//  checkoutRecycle.js
//
//  Created by Rebecca Stankus on 10/20/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  This script acts on the recycle zone to delete an item replica when it is placed in the bin..
/* global Selection, Render */

(function() {
    var mini = false;
  
    var SCAN_RADIUS = 0.15; // meters
    var SCAN_RADIUS_MINI = 0.05; // meters
    var OVERLAY_PREFIX = 'MP';
    var SEARCH_RADIUS = 2;
    var SEARCH_RADIUS_MINI = 1;
    var LIST_NAME = "recycleList";
    var RECYCLE_CHECK_INTERVAL_MS = 500;
    var SHARED = Script.require('../attachmentZoneShared.js');
    var RECYCLE_OVERLAY_SOUND = SoundCache.getSound(Script.resolvePath("../sounds/sound4.wav"));
    
    var prevID = 0;
    var recycleBin;
    var recyclePosition;
    var tableID;
    var overlayInBin = null;
    var currentEntityMatch = null;
    var interval;
    var recycleOutlineStyle = {
        outlineUnoccludedColor: { red: 235, green: 87, blue: 87 },
        outlineOccludedColor: { red: 235, green: 87, blue: 87 },
        fillUnoccludedColor: { red: 235, green: 87, blue: 87 },
        fillOccludedColor: { red: 235, green: 87, blue: 87 },
        outlineUnoccludedAlpha: 1,
        outlineOccludedAlpha: 0,
        fillUnoccludedAlpha: 0,
        fillOccludedAlpha: 0,
        outlineWidth: 3,
        isOutlineSmooth: true
    };

    var Recycle = function() {
    };

    Recycle.prototype = {
        preload: function(entityID) {
            recycleBin = entityID;
            var sizeLimit = 0.2;
            if (Entities.getEntityProperties(recycleBin, 'dimensions.x').dimensions.x < sizeLimit) {
                mini = true;
            }  
            Selection.enableListHighlight(LIST_NAME, recycleOutlineStyle);
            Selection.clearSelectedItemsList(LIST_NAME);
            tableID = Entities.getEntityProperties(entityID, 'parentID').parentID;
        },
        enterCheckout: function() {
            interval = Script.setInterval(function() {
                recyclePosition = Entities.getEntityProperties(recycleBin, 'position').position;
                var overlays;
                if (mini) {
                    overlays = Overlays.findOverlays(recyclePosition, SCAN_RADIUS_MINI);
                } else {
                    overlays = Overlays.findOverlays(recyclePosition, SCAN_RADIUS);
                }
                if (overlays.length === 0 && overlayInBin) {
                    Selection.removeFromSelectedItemsList(LIST_NAME, "entity", currentEntityMatch);
                    Selection.removeFromSelectedItemsList(LIST_NAME, "overlay", overlayInBin);
                    prevID = 0;
                    currentEntityMatch = null;
                    overlayInBin = null;
                } else if ((overlays.length > 0) && (overlayInBin) && (overlays.toString().indexOf(overlayInBin) === -1)) {
                    Selection.removeFromSelectedItemsList(LIST_NAME, "entity", currentEntityMatch);
                    Selection.removeFromSelectedItemsList(LIST_NAME, "overlay", overlayInBin);
                    prevID = 0;
                    currentEntityMatch = null;
                    overlayInBin = null;
                } else if (overlays.length > 0 && overlays.toString().indexOf(overlayInBin) !== -1) {
                    if (Overlays.getProperty(overlayInBin, 'parentID')) {
                        if (Overlays.getProperty(overlayInBin, 'parentID') === tableID) {
                            Selection.removeFromSelectedItemsList(LIST_NAME, "entity", currentEntityMatch);
                            Selection.removeFromSelectedItemsList(LIST_NAME, "overlay", overlayInBin);
                            prevID = 0;
                            if (RECYCLE_OVERLAY_SOUND.downloaded) {
                                Audio.playSound(RECYCLE_OVERLAY_SOUND, {
                                    position: MyAvatar.position,
                                    volume: SHARED.AUDIO_VOLUME_LEVEL,
                                    localOnly: true
                                });
                            }
                            Entities.deleteEntity(currentEntityMatch);
                            Overlays.deleteOverlay(overlayInBin);
                            overlayInBin = null;
                        }
                    }
                } else if (overlays.length > 0 && !overlayInBin) {
                    overlays.forEach(function(overlayID) {
                        var name = Overlays.getProperty(overlayID, 'name');
                        if (name.indexOf(OVERLAY_PREFIX) !== -1) {
                            var nearbyEntities;
                            if (mini) {
                                nearbyEntities = Entities.findEntities(MyAvatar.position, SEARCH_RADIUS_MINI);
                            } else {
                                nearbyEntities = Entities.findEntities(MyAvatar.position, SEARCH_RADIUS);
                            }
                            nearbyEntities.forEach(function(entityID) {
                                var userDataString = 
                                    JSON.stringify(Entities.getEntityProperties(entityID, 'userData').userData);
                                if (userDataString.indexOf(overlayID) !== -1) {
                                    overlayInBin = overlayID;
                                    currentEntityMatch = entityID;
                                    if (prevID !== entityID) {
                                        Selection.addToSelectedItemsList(LIST_NAME, "entity", currentEntityMatch);
                                        Selection.addToSelectedItemsList(LIST_NAME, "overlay", overlayInBin);
                                        prevID = entityID;
                                    }
                                }
                            });
                        }
                    });
                }
            }, RECYCLE_CHECK_INTERVAL_MS);    
        },
        exitCheckout: function() {
            Script.clearInterval(interval);
        }
    };
    
    return new Recycle();
});
