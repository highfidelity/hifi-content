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
    var TRANSFORMS_SETTINGS = 'io.highfidelity.avatarStore.checkOut.tranforms';
    var SEARCH_RADIUS = 2;
    var MAKING_SURE_INTERVAL = 100; // Milliseconds
    var STOP_MAKING_SURE_TIMEOUT = 5000; // Milliseconds
    var TABLE_ID;
    var SCANNED_LOCAL_ROTATION = Quat.fromVec3Degrees({ x: 10, y: 140, z: 0 });
    // var CHECKOUT_ZONE_ID;
    var SCANNED_LOCAL_HEIGHT = 0.25;

    var interval;
    var properties;
    // var prevID = 0;
    var scannedMPOverlays = {};
    var matchingEntity;
    var overlayInScanner;
    var name;
    var replicaStoredTransforms = {};
    var lastScannedOverlay;
    var lastScannedMPItem;
    // var scannedOverlays = {};

    var Scanner = function() {

    };

    Scanner.prototype = {
        preload: function(entityID) {
            TABLE_ID = Entities.getEntityProperties(entityID, 'parentID').parentID;
            print("table is " + TABLE_ID);
            // CHECKOUT_ZONE_ID = Entities.getEntityProperties(TABLE_ID, 'parentID').parentID;
        },
        getTransformForMarketplaceItems: function() {
            return Settings.getValue(TRANSFORMS_SETTINGS, {});
        },

        // TODO test transforms again
        onEntityAdded: function(entityID) {
            // print("new entity added");
            print("NEW ITEM    NEW ITEM    " + JSON.stringify(Entities.getEntityProperties(entityID)));
            // new item doesn't have matching overlay...need to find it somehow...???
            // going with last overlay scanned for now
            var newItemProperties = Entities.getEntityProperties(entityID, ['marketplaceID', 'clientOnly', 
                'owningAvatarID', 'lastEditedBy']);
            if ((newItemProperties.lastEditedBy === MyAvatar.sessionUUID || newItemProperties.lastEditedBy === undefined) &&
                newItemProperties.marketplaceID !== "") {
                // print("looks like it's rezzed");
                // can users rez random Mp items in checkout or only wearables?
                // compare new entity's mp id with last item on avatar that was scanned
                if (lastScannedMPItem === newItemProperties.marketplaceID) {
                    scannerScript.replicaCheckedOut(lastScannedOverlay, entityID);
                }
            }
        },
        
        getTransformsForMarketplaceItem: function(marketplaceID) {
            var transformItems = scannerScript.getTransformForMarketplaceItems();
            if (transformItems[marketplaceID] === undefined) {
                return {
                    certificateTransforms: {},
                    unsortedTransforms: [],
                    lastUsedUnsortedTransformIndex: -1
                };
            }
            return transformItems[marketplaceID];
        },
        
        addTransformForMarketplaceItem: function(marketplaceID, certificateID, transform) {
            if (marketplaceID === undefined) {
                return;
            }
            var marketplaceItemTransforms = scannerScript.getTransformForMarketplaceItems();
            var marketplaceItemTransform = scannerScript.getTransformsForMarketplaceItem(marketplaceID);
            if (certificateID !== undefined) {
                marketplaceItemTransform.certificateTransforms[certificateID] = transform;
            } else {
                marketplaceItemTransform.unsortedTransforms.push(transform);
            }
            marketplaceItemTransforms[marketplaceID] = marketplaceItemTransform;
            Settings.setValue(TRANSFORMS_SETTINGS, marketplaceItemTransforms);
        },

        // TODO FIX DEMO ENTITY ID
        replicaCheckedOut: function(replicaOverlayID, newEntityID) {
            print("you made into replicacheckedout...Looking for " + replicaOverlayID);
            print(JSON.stringify(replicaStoredTransforms));
            if (replicaStoredTransforms[replicaOverlayID] === undefined) {
                print("it has no stored transform");
                Entities.deleteEntity(newEntityID);
                return;
            }
            print("getting transform");
            var transform = replicaStoredTransforms[replicaOverlayID];
            var transformProperties = {
                parentID: MyAvatar.sessionUUID,
                parentJointIndex: MyAvatar.getJointIndex(transform.jointName),
                localPosition: transform.position,
                localRotation: transform.rotation,
                dimensions: transform.dimensions,
                velocity: {x: 0, y: 0, z: 0},
                dynamic: false
            };
            replicaStoredTransforms[replicaOverlayID] = transformProperties;

            Entities.editEntity(newEntityID, transformProperties);
            
            // Make really sure that the translations are set properly
            var makeSureInterval = Script.setInterval(function() {
                Entities.editEntity(newEntityID, transformProperties);
            }, MAKING_SURE_INTERVAL);
    
            // Five seconds should be enough to be sure, otherwise we have a problem
            Script.setTimeout(function() {
                makeSureInterval.stop();
            }, STOP_MAKING_SURE_TIMEOUT);
    
            var newEntityProperties = Entities.getEntityProperties(newEntityID, ['marketplaceID', 'certificateID']);
            var certificateID = undefined;
            if (newEntityProperties.certificateID !== "" && newEntityProperties.certificateID !== undefined) {
                certificateID = newEntityProperties.certificateID;
            }
            scannerScript.addTransformForMarketplaceItem(newEntityProperties.marketplaceID, certificateID, 
                transformProperties);
    
            Entities.deleteEntity(matchingEntity);
        },

        enterCheckout: function(entityID) {
            scannedMPOverlays = {};
            // new local position for scanned overlays
            var newX = 0.05;
            var newZ = -0.5; 
            var position1 = true;
            var position2 = false;
            var position3 = false;

            properties = Entities.getEntityProperties(entityID, ['position', 'parentID']);
            // checkoutZoneID = properties.parentID;
            interval = Script.setInterval(function() {
                print("Scanner is searching");
                var overlays = Overlays.findOverlays(properties.position, SCAN_RADIUS);
                /* if (overlays.length > 0) {
                    overlays.forEach(function(overlayID) {
                        var name = Overlays.getProperty(overlayID, 'name');
                        if (name.indexOf(OVERLAY_PREFIX) !== -1) {
                            var marketplaceID = name.substr(OVERLAY_PREFIX.length, OVERLAY_PREFIX.length + 35);
                            var goToURL = MARKET_PLACE_ITEM_URL_PREFIX + "/items/" + marketplaceID;
                            var nearbyEntities = Entities.findEntities(MyAvatar.position, SEARCH_RADIUS);
                            nearbyEntities.forEach(function(entityID) {
                                var userDataString = 
                                    JSON.stringify(Entities.getEntityProperties(entityID, 'userData').userData);
                                if (userDataString.indexOf(overlayID) !== -1) {
                                    matchingEntity = entityID;
                                    return;
                                }*/
                if (overlays.length === 0 && overlayInScanner) { // overlay removed from scanner...no new one in Scanner
                    matchingEntity = null;
                    overlayInScanner = null;
                    // overlay was taken out of Scanner...new one is in Scanner
                } else if ((overlays.length > 0) && (overlayInScanner) && 
                                (overlays.toString().indexOf(overlayInScanner) === -1)) {
                    matchingEntity = null;
                    overlayInScanner = null;
                    // ready to process overlayin scanner
                } else if (overlays.length > 0 && overlays.toString().indexOf(overlayInScanner) !== -1) {
                    if (Overlays.getProperty(overlayInScanner, 'parentID')) { // if item has parentID
                        if (Overlays.getProperty(overlayInScanner, 'parentID') === TABLE_ID) { 
                            // if item in Scanner is not being held 
                            name = Overlays.getProperty(overlayInScanner, 'name');
                            var marketplaceID = name.substr(OVERLAY_PREFIX.length, OVERLAY_PREFIX.length + 35);
                            var goToURL = MARKET_PLACE_ITEM_URL_PREFIX + "/items/" + marketplaceID;
                            
                            var entityProperties = Entities.getEntityProperties(matchingEntity, 
                                ['localPosition', 'localRotation', 'dimensions', 
                                    'parentJointIndex', 'marketplaceID']);
                            var replicaStoredTransform = {
                                position: entityProperties.localPosition,
                                rotation: entityProperties.localRotation,
                                dimensions: entityProperties.dimensions,
                                jointName: MyAvatar.jointNames[entityProperties.parentJointIndex],
                                demoEntityID: entityID
                            };
                            replicaStoredTransforms[overlayInScanner] = replicaStoredTransform;
                            print("lllllllllllllllllll    " + JSON.stringify(replicaStoredTransforms));
                            print("moving overlay");
                            // print("overlay's local pos is " + JSON.stringify(Overlays.getProperty(overlayInScanner, 'localPosition')));
                            // print(JSON.stringify(scannedMPOverlays));
                            if (JSON.stringify(scannedMPOverlays).indexOf(overlayInScanner) === -1){
                                print("overlay was not found in array of scanned");
                                Overlays.editOverlay(overlayInScanner, {
                                    localPosition: {x: newX, y: SCANNED_LOCAL_HEIGHT, z: newZ},
                                    localRotation: SCANNED_LOCAL_ROTATION
                                });
                                scannedMPOverlays[overlayInScanner] = {x: newX, y: SCANNED_LOCAL_HEIGHT, z: newZ};
                                // print(JSON.stringify(scannedMPOverlays));
                                if (position1) {
                                    print("position1");
                                    newX -=0.09;
                                    position1 = false;
                                    position2 = true;
                                } else if (position2) {
                                    print("position2");
                                    newX -=0.09;
                                    position2 = false;
                                    position3 = true;
                                } else if (position3) {
                                    print("position3");
                                    newX -=0.09;
                                    position3 = false;
                                } else {
                                    print("position4");
                                    newX +=0.09;
                                    newX +=0.09;
                                    newX +=0.09;
                                    newZ +=0.09;
                                    position1 = true;
                                }
                            } else {
                                print("overlay is old");
                                Overlays.editOverlay(overlayInScanner, {
                                    localPosition: scannedMPOverlays[overlayInScanner],
                                    localRotation: SCANNED_LOCAL_ROTATION
                                });
                            }
                            TABLET.gotoWebScreen(goToURL, MARKETPLACES_INJECT_SCRIPT_URL);
                            lastScannedOverlay = overlayInScanner;
                            lastScannedMPItem = entityProperties.marketplaceID;
                            print("lastscannedmpitem = " + lastScannedMPItem);
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
                                }
                            });
                        }
                    });
                } 
            }, CHECKOUT_INTERVAL_MS);
            Entities.addingEntity.connect(scannerScript.onEntityAdded);
        },

        exitCheckout: function() {
            replicaStoredTransforms = {};
            Script.clearInterval(interval);
            Entities.addingEntity.disconnect(scannerScript.onEntityAdded);
        }
    };
    var scannerScript = new Scanner();
    return scannerScript;
});
