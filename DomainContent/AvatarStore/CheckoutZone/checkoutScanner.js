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

(function() {
    
    var TABLET = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    var MARKET_PLACE_ITEM_URL_PREFIX = 'https://metaverse.highfidelity.com/marketplace';
    var MARKETPLACES_INJECT_SCRIPT_URL = ScriptDiscoveryService.defaultScriptsPath + "/system/html/js/marketplacesInject.js";
    var SCAN_RADIUS = 0.15; // meters
    var OVERLAY_PREFIX = 'MP';
    var CHECKOUT_INTERVAL_MS = 1000;
    var TRANSFORMS_SETTINGS = 'io.highfidelity.avatarStore.checkOut.tranforms';
    // var _THIS = this;
    var SEARCH_RADIUS = 2;
    var MAKING_SURE_INTERVAL = 100; // Milliseconds
    var STOP_MAKING_SURE_TIMEOUT = 5000; // Milliseconds

    var interval;
    var checkoutZoneID;
    var properties;
    // var checkoutZoneID;
    var scannedMPOverlays = {};
    var matchingEntity;
    var replicaStoredTransforms = {};
    var Scanner = function() {

    };

    Scanner.prototype = {
        getTransformForMarketplaceItems: function() {
            return Settings.getValue(TRANSFORMS_SETTINGS, {});
        },

        onEntityAdded: function(entityID) {
            print("there's a new entity on the scene!!!");
            var newItemProperties = Entities.getEntityProperties(entityID, ['marketplaceID', 'clientOnly', 
                'owningAvatarID', 'lastEditedBy']);
            // if item was made by current avatar and has a marketplace ID
            if (
                (newItemProperties.lastEditedBy === MyAvatar.sessionUUID || newItemProperties.lastEditedBy === undefined) &&
                newItemProperties.marketplaceID !== "") {
                print("item was made by current avatar and has a marketplace ID");
                // if the item matches an overlay that was scanned
                if (scannedMPOverlays[newItemProperties.marketplaceID] !== undefined) {
                    print("item matches an overlay that was scanned");
                    var overlayID = scannedMPOverlays[newItemProperties.marketplaceID];
                    scannerScript.replicaCheckedOut(overlayID, entityID);
                    delete scannedMPOverlays[newItemProperties.marketplaceID];
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
            print("you made it to the inside of savetranforms!!! YAY!!!");
            // Delete the new entity when the transforms are not found.
            if (replicaStoredTransforms[replicaOverlayID] === undefined) {
                print('Could not find transform data, deleting purchased entity.');
                Entities.deleteEntity(newEntityID);
                return;
            } else {
                print("I have the stored transform data...");
            }
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
            print("stored transforms:  " + JSON.stringify(replicaStoredTransforms));

            Entities.editEntity(newEntityID, transformProperties);
    
            
            // Make really sure that the translations are set properly
            var makeSureInterval = Script.setInterval(function() {
                Entities.editEntity(newEntityID, transformProperties);
            }, MAKING_SURE_INTERVAL);
    
            // Five seconds should be enough to be sure, otherwise we have a problem
            Script.setTimeout(function() {
                makeSureInterval.stop();
            }, STOP_MAKING_SURE_TIMEOUT);
    
            print("stored transforms again:  " + JSON.stringify(replicaStoredTransforms));
            var newEntityProperties = Entities.getEntityProperties(newEntityID, ['marketplaceID', 'certificateID']);
            print("MP ID: " + JSON.stringify(newEntityProperties.marketplaceID));
            print("cert ID: " + JSON.stringify(newEntityProperties.certificateID));
            var certificateID = undefined;
            // if transformed item has certificate id
            if (newEntityProperties.certificateID !== "" && newEntityProperties.certificateID !== undefined) {
                print("transferring certificate id");
                certificateID = newEntityProperties.certificateID;
            }
            scannerScript.addTransformForMarketplaceItem(newEntityProperties.marketplaceID, certificateID, 
                transformProperties);
    
            // Remove the demo object, to prevent overlapping objects
            Entities.deleteEntity(matchingEntity);
        },

        enterCheckout: function(entityID) {
            properties = Entities.getEntityProperties(entityID, ['position', 'parentID']);
            checkoutZoneID = properties.parentID;
            interval = Script.setInterval(function() {
                // scanner is searching
                print("Scanner is searching for overlays");
                var overlays = Overlays.findOverlays(properties.position, SCAN_RADIUS);
                if (overlays.length > 0) {
                    overlays.forEach(function(overlayID) {
                        var name = Overlays.getProperty(overlayID, 'name');
                        // if item is a marketplace item
                        if (name.indexOf(OVERLAY_PREFIX) !== -1) {
                            var marketplaceID = name.substr(OVERLAY_PREFIX.length, OVERLAY_PREFIX.length + 35);
                            var goToURL = MARKET_PLACE_ITEM_URL_PREFIX + "/items/" + marketplaceID;
                            // get matching entityID
                            var nearbyEntities = Entities.findEntities(MyAvatar.position, SEARCH_RADIUS);
                            nearbyEntities.forEach(function(entityID) {
                                var userDataString = 
                                    JSON.stringify(Entities.getEntityProperties(entityID, 'userData').userData);
                                if (userDataString.indexOf(overlayID) !== -1) {
                                    matchingEntity = entityID;
                                    print("matching entity id is " + matchingEntity);
                                    return;
                                }
                                
                            });
                            // save position, size, etc
                            print("saving transforms...");
                            var entityProperties = Entities.getEntityProperties(matchingEntity, 
                                ['localPosition', 'localRotation', 'dimensions', 'parentJointIndex']);
                            var replicaStoredTransform = {
                                position: entityProperties.localPosition,
                                rotation: entityProperties.localRotation,
                                dimensions: entityProperties.dimensions,
                                jointName: MyAvatar.jointNames[entityProperties.parentJointIndex],
                                demoEntityID: entityID
                            };
                    
                            replicaStoredTransforms[overlayID] = replicaStoredTransform;
                            print("overlay is saved " + overlayID);
                            scannedMPOverlays[marketplaceID] = overlayID;
                            TABLET.gotoWebScreen(goToURL, MARKETPLACES_INJECT_SCRIPT_URL);
                            Overlays.deleteOverlay(overlayID);
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
