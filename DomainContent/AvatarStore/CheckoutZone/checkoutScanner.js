//
//  checkoutScanner.js
//
//  Created by Rebecca Stankus on 10/10/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  This script acts on the scanner zone to pull up an item's marketplace page to enable purchasing.
/* global Selection, Render */
(function() {
    
    var TABLET = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    var MARKET_PLACE_ITEM_URL_PREFIX = 'https://metaverse.highfidelity.com/marketplace';
    var MARKETPLACES_INJECT_SCRIPT_URL = ScriptDiscoveryService.defaultScriptsPath + 
        "/system/html/js/marketplacesInject.js";
    var SCAN_RADIUS = 0.15; // meters
    var OVERLAY_PREFIX = 'MP';
    var CHECKOUT_INTERVAL_MS = 1000;
    var LIST_NAME = "highlightList3";
    var SEARCH_RADIUS = 2;
    var HIGHLIGHT = Script.require('./ExternalOutlineConfig.js');

    var interval;
    var properties;
    var checkoutZoneID;
    var scannedMPOverlays = {};
    var prevID = 0;
    var matchingEntity;
    var overlayInScanner;
    var tableID;
    var name;
    var highlightConfig = Render.getConfig("UpdateScene.HighlightStageSetup");
    var Scanner = function() {
        
    };

    Scanner.prototype = {
        preload: function(entityID) {
            highlightConfig["selectionName"] = LIST_NAME; 
            Selection.clearSelectedItemsList(LIST_NAME);
            HIGHLIGHT.changeHighlight3(highlightConfig);
            properties = Entities.getEntityProperties(entityID, ['position', 'parentID']);
            tableID = properties.parentID;
            checkoutZoneID = Entities.getEntityProperties(tableID, 'parentID').parentID;
        },
        onEntityAdded: function(entityID) {
            var newItemProperties = Entities.getEntityProperties(entityID, ['marketplaceID', 'clientOnly', 
                'owningAvatarID', 'lastEditedBy']);
            if ((newItemProperties.lastEditedBy === MyAvatar.sessionUUID || newItemProperties.lastEditedBy === 
                undefined) && newItemProperties.marketplaceID !== "") {
                if (scannedMPOverlays[newItemProperties.marketplaceID] !== undefined) {
                    var overlayID = scannedMPOverlays[newItemProperties.marketplaceID];
                    Entities.callEntityMethod(checkoutZoneID, 'replicaCheckedOut', [overlayID, entityID]);
                    delete scannedMPOverlays[newItemProperties.marketplaceID];
                }
            }
        },
        enterCheckout: function(entityID) {
            interval = Script.setInterval(function() {
                var overlays = Overlays.findOverlays(properties.position, SCAN_RADIUS);
                if (overlays.length === 0 && overlayInScanner) { // overlay removed from scanner...no new one in Scanner
                    Selection.removeFromSelectedItemsList(LIST_NAME, "entity", matchingEntity);
                    Selection.removeFromSelectedItemsList(LIST_NAME, "overlay", overlayInScanner);
                    prevID = 0;
                    matchingEntity = null;
                    overlayInScanner = null;
                    // overlay was taken out of Scanner...new one is in Scanner
                } else if ((overlays.length > 0) && (overlayInScanner) && 
                (overlays.toString().indexOf(overlayInScanner) === -1)) {
                    Selection.removeFromSelectedItemsList(LIST_NAME, "entity", matchingEntity);
                    Selection.removeFromSelectedItemsList(LIST_NAME, "overlay", overlayInScanner);
                    prevID = 0;
                    matchingEntity = null;
                    overlayInScanner = null;
                    // ready to process overlayin scanner
                } else if (overlays.length > 0 && overlays.toString().indexOf(overlayInScanner) !== -1) {
                    if (Overlays.getProperty(overlayInScanner, 'parentID')) { // if item has parentID
                        if (Overlays.getProperty(overlayInScanner, 'parentID') === tableID) { 
                            // if item in Scanner is not being grabbed anymore
                            name = Overlays.getProperty(overlayInScanner, 'name');
                            Selection.removeFromSelectedItemsList(LIST_NAME, "entity", matchingEntity);
                            Selection.removeFromSelectedItemsList(LIST_NAME, "overlay", overlayInScanner);
                            prevID = 0;
                            var marketplaceID = name.substr(OVERLAY_PREFIX.length, OVERLAY_PREFIX.length + 35);
                            var goToURL = MARKET_PLACE_ITEM_URL_PREFIX + "/items/" + marketplaceID;
                            scannedMPOverlays[marketplaceID] = overlayInScanner;
                            TABLET.gotoWebScreen(goToURL, MARKETPLACES_INJECT_SCRIPT_URL);
                            Selection.removeFromSelectedItemsList(LIST_NAME, "entity", matchingEntity);
                            Selection.removeFromSelectedItemsList(LIST_NAME, "overlay", overlayInScanner);
                            Overlays.deleteOverlay(overlayInScanner);
                            overlayInScanner = null;
                        }
                    }
                } else if (overlays.length > 0 && !overlayInScanner) { // check for new overlays in Scanner
                    overlays.forEach(function(overlayID) {
                        name = Overlays.getProperty(overlayID, 'name');
                        if (name.indexOf(OVERLAY_PREFIX) !== -1) {
                            var nearbyEntities = Entities.findEntities(MyAvatar.position, SEARCH_RADIUS);
                            nearbyEntities.forEach(function(entityID) {
                                var userDataString = 
                                    JSON.stringify(Entities.getEntityProperties(entityID, 'userData').userData);
                                if (userDataString.indexOf(overlayID) !== -1) {
                                    overlayInScanner = overlayID;
                                    matchingEntity = entityID;
                                    if (prevID !== entityID) {
                                        Selection.addToSelectedItemsList(LIST_NAME, "entity", matchingEntity);
                                        Selection.addToSelectedItemsList(LIST_NAME, "overlay", overlayInScanner);
                                        prevID = entityID;
                                    }
                                }
                            });
                        }
                    });
                }
            }, CHECKOUT_INTERVAL_MS);
            Entities.addingEntity.connect(this.onEntityAdded);
        },
        exitCheckout: function() {
            Script.clearInterval(interval);
            Entities.addingEntity.disconnect(this.onEntityAdded);
        }
    };
    
    return new Scanner();
});
