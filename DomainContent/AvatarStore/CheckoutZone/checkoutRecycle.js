//
//  checkoutRecycleClient.js
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
    var SCAN_RADIUS = 0.15; // meters
    var OVERLAY_PREFIX = 'MP';
    var SEARCH_RADIUS = 2;
    var LIST_NAME = "contextOverlayHighlightList2";
    
    var prevID = 0;
    var recyclePosition;
    var tableID;
    var recycleProperties;
    var checkoutOutlineConfig;
    var overlayInBin = null;
    var currentEntityMatch = null;
    var interval;
    

    var Recycle = function() {
        
    };

    Recycle.prototype = {
        preload: function(entityID) {
            Selection.clearSelectedItemsList(LIST_NAME);
            recycleProperties = Entities.getEntityProperties(entityID, ['position', 'parentID']);
            recyclePosition = recycleProperties.position;
            tableID = recycleProperties.parentID;
        },
        changeHighlight2: function() {
            checkoutOutlineConfig = Render.getConfig("RenderMainView.OutlineEffect2");
            checkoutOutlineConfig["glow"] = true;
            checkoutOutlineConfig["width"] = 7;
            checkoutOutlineConfig["intensity"] = 0.8;
            checkoutOutlineConfig["colorR"] = 0.92;
            checkoutOutlineConfig["colorG"] = 0.34;
            checkoutOutlineConfig["colorB"] = 0.34;
            checkoutOutlineConfig["unoccludedFillOpacity"] = 0;
             
        },
        enterCheckout: function() {
            interval = Script.setInterval(function() {
                var overlays = Overlays.findOverlays(recyclePosition, SCAN_RADIUS);
                if (overlays.length === 0 && overlayInBin) { // overlay removed from bin...no new one in bin
                    Selection.removeFromSelectedItemsList(LIST_NAME, "entity", currentEntityMatch);
                    Selection.removeFromSelectedItemsList(LIST_NAME, "overlay", overlayInBin);
                    prevID = 0;
                    currentEntityMatch = null;
                    overlayInBin = null;
                } else if ((overlays.length > 0) && (overlayInBin) && (overlays.toString().indexOf(overlayInBin) === -1)) { // overlay was taken out of bin...not deleted...new one is in bin
                    Selection.removeFromSelectedItemsList(LIST_NAME, "entity", currentEntityMatch);
                    Selection.removeFromSelectedItemsList(LIST_NAME, "overlay", overlayInBin);
                    prevID = 0;
                    currentEntityMatch = null;
                    overlayInBin = null;
                } else if (overlays.length > 0 && overlays.toString().indexOf(overlayInBin) !== -1) {
                    if (Overlays.getProperty(overlayInBin, 'parentID')) { // if overlay in bin is parented to table, it is not being held anymore
                        if (Overlays.getProperty(overlayInBin, 'parentID') === tableID) { // if item in bin is not being held 
                            Selection.removeFromSelectedItemsList(LIST_NAME, "entity", currentEntityMatch);
                            Selection.removeFromSelectedItemsList(LIST_NAME, "overlay", overlayInBin);
                            prevID = 0;
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
                                var userDataString = JSON.stringify(Entities.getEntityProperties(entityID, 'userData').userData);
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
            }, 1000);
        },
        exitCheckout: function() {
            Script.clearInterval(interval);
        }
    };
    var recycleClientScript = new Recycle();
    recycleClientScript.changeHighlight2();
    return recycleClientScript;
});