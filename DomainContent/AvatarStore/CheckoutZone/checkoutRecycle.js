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
    var highlightToggle = false;
  
    var SCAN_RADIUS = 0.15; // meters
    var OVERLAY_PREFIX = 'MP';
    var SEARCH_RADIUS = 2;
    var LIST_NAME = "highlightList2";
    var RECYLCE_CHECK_INTERVAL_MS = 500;
    var HIGHLIGHT = Script.require('./ExternalOutlineConfig.js');
    var SHARED = Script.require('../attachmentZoneShared.js');
    var RECYCLE_OVERLAY_SOUND = SoundCache.getSound(Script.resolvePath("../sounds/sound4.wav"));
    
    var prevID = 0;
    var recycleBin;
    var recyclePosition;
    var tableID;
    var overlayInBin = null;
    var currentEntityMatch = null;
    var interval;
    var highlightConfig = Render.getConfig("UpdateScene.HighlightStageSetup");

    var Recycle = function() {
    };

    Recycle.prototype = {
        preload: function(entityID) {
            recycleBin = entityID;
            if (highlightToggle) {
                highlightConfig["selectionName"] = LIST_NAME; 
                Selection.clearSelectedItemsList(LIST_NAME);
                HIGHLIGHT.changeHighlight2(highlightConfig);
            }
            tableID = Entities.getEntityProperties(entityID, 'parentID').parentID;
        },
        enterCheckout: function() {
            interval = Script.setInterval(function() {
                recyclePosition = Entities.getEntityProperties(recycleBin, 'position').position;
                var overlays = Overlays.findOverlays(recyclePosition, SCAN_RADIUS);
                if (overlays.length === 0 && overlayInBin) { // overlay removed from bin...no new one in bin
                    if (highlightToggle) {
                        Selection.removeFromSelectedItemsList(LIST_NAME, "entity", currentEntityMatch);
                        Selection.removeFromSelectedItemsList(LIST_NAME, "overlay", overlayInBin);
                        prevID = 0;
                    }
                    currentEntityMatch = null;
                    overlayInBin = null;
                } else if ((overlays.length > 0) && (overlayInBin) && (overlays.toString().indexOf(overlayInBin) === -1)) {
                    // overlay was taken out of bin...not deleted...new one is in bin
                    if (highlightToggle) {
                        Selection.removeFromSelectedItemsList(LIST_NAME, "entity", currentEntityMatch);
                        Selection.removeFromSelectedItemsList(LIST_NAME, "overlay", overlayInBin);
                        prevID = 0;
                    }
                    currentEntityMatch = null;
                    overlayInBin = null;
                } else if (overlays.length > 0 && overlays.toString().indexOf(overlayInBin) !== -1) {
                    if (Overlays.getProperty(overlayInBin, 'parentID')) {
                        // if overlay in bin is parented to table, it is not being held anymore
                        if (Overlays.getProperty(overlayInBin, 'parentID') === tableID) {
                            // if item in bin is not being held 
                            if (highlightToggle) {
                                Selection.removeFromSelectedItemsList(LIST_NAME, "entity", currentEntityMatch);
                                Selection.removeFromSelectedItemsList(LIST_NAME, "overlay", overlayInBin);
                                prevID = 0;
                            }
                          if (RECYCLE_OVERLAY_SOUND.downloaded) {
                            Audio.playSound(RECYCLE_OVERLAY_SOUND, {
                                position: MyAvatar.position,
                                volume: shared.AUDIO_VOLUME_LEVEL,
                                localOnly: true
                            });
                        }
                            Entities.deleteEntity(currentEntityMatch);
                            Overlays.deleteOverlay(overlayInBin);
                            overlayInBin = null;
                        }
                    }
                } else if (overlays.length > 0 && !overlayInBin) { // check new overlays in bin
                    overlays.forEach(function(overlayID) {
                        var name = Overlays.getProperty(overlayID, 'name');
                        if (name.indexOf(OVERLAY_PREFIX) !== -1) {
                            var nearbyEntities = Entities.findEntities(MyAvatar.position, SEARCH_RADIUS);
                            nearbyEntities.forEach(function(entityID) {
                                var userDataString = 
                                    JSON.stringify(Entities.getEntityProperties(entityID, 'userData').userData);
                                if (userDataString.indexOf(overlayID) !== -1) {
                                    overlayInBin = overlayID;
                                    currentEntityMatch = entityID;
                                    if (highlightToggle) {
                                        if (prevID !== entityID) {
                                            Selection.addToSelectedItemsList(LIST_NAME, "entity", currentEntityMatch);
                                            Selection.addToSelectedItemsList(LIST_NAME, "overlay", overlayInBin);
                                            prevID = entityID;
                                        }
                                    }
                                }
                            });
                        }
                    });
                }
            }, RECYLCE_CHECK_INTERVAL_MS);    
        },
        exitCheckout: function() {
            Script.clearInterval(interval);
        }
    };
    
    return new Recycle();
});
