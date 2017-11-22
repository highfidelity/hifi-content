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
    var highlightToggle = false;
    
    var TABLET = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    var SHARED = Script.require('../attachmentZoneShared.js');
    var MARKET_PLACE_ITEM_URL_PREFIX = 'https://metaverse.highfidelity.com/marketplace';
    var MARKETPLACES_INJECT_SCRIPT_URL = ScriptDiscoveryService.defaultScriptsPath + 
        "/system/html/js/marketplacesInject.js";
    var SCAN_RADIUS = 0.15; // meters
    var OVERLAY_PREFIX = 'MP';
    var CHECKOUT_INTERVAL_MS = 500;
    var LIST_NAME = "highlightList3";
    var TRANSFORMS_SETTINGS = 'io.highfidelity.avatarStore.checkOut.tranforms';
    var SEARCH_RADIUS = 2;
    var HIGHLIGHT = Script.require('../ExternalOutlineConfig.js');
    var SCANNED_LOCAL_ROTATION = Quat.fromVec3Degrees({ x: 10, y: 140, z: 0 });
    var SCANNED_LOCAL_HEIGHT = 0.29;
    var OVERLAY_SPACING = 0.09;
    var MAKING_SURE_INTERVAL = 100; // Milliseconds
    var STOP_MAKING_SURE_TIMEOUT = 5000; // Milliseconds
    var PURCHASED_ITEM_SOUND = SoundCache.getSound(Script.resolvePath("../sounds/sound6.wav"));
    var SCANNED_ITEM_SOUND = SoundCache.getSound(Script.resolvePath("../sounds/sound8.wav"));
  
    var tableID;
    var interval;
    var scanPosition;
    var scannedMPOverlays = {};
    var prevID = 0;
    var matchingEntity;
    var overlayInScanner;
    var name;
    var highlightConfig = Render.getConfig("UpdateScene.HighlightStageSetup");
    var replicaStoredTransforms = {};
    var lastScannedOverlay;
    var lastScannedMPItem;
    var scanner;
  
    var Scanner = function() {
    };


    Scanner.prototype = {
        preload: function(entityID) {

            scanner = entityID;
            if (highlightToggle) {
                highlightConfig["selectionName"] = LIST_NAME; 
                Selection.clearSelectedItemsList(LIST_NAME);
                HIGHLIGHT.changeHighlight3(highlightConfig);
            }
        },
      
        getTransformForMarketplaceItems: function() {
            return Settings.getValue(TRANSFORMS_SETTINGS, {});
        },

        onEntityAdded: function(entityID) {
            var newItemProperties = Entities.getEntityProperties(entityID, ['marketplaceID', 'clientOnly', 
                'owningAvatarID', 'lastEditedBy']);
            if ((newItemProperties.lastEditedBy === MyAvatar.sessionUUID || newItemProperties.lastEditedBy === 
                undefined) && newItemProperties.marketplaceID !== "") {
                if (lastScannedMPItem === newItemProperties.marketplaceID) {
                    scannerScript.replicaCheckedOut(lastScannedOverlay, entityID);
                    if (PURCHASED_ITEM_SOUND.downloaded) {
                        Audio.playSound(PURCHASED_ITEM_SOUND, {
                            position: MyAvatar.position,
                            volume: SHARED.AUDIO_VOLUME_LEVEL,
                            localOnly: true
                        });
                    }
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

        replicaCheckedOut: function(replicaOverlayID, newEntityID) {
            if (replicaStoredTransforms[replicaOverlayID] === undefined) {
                Entities.deleteEntity(newEntityID);
                return;

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
            // new local position for scanned overlays after they are scanned
            var newX = 0.04;
            var newZ = -0.35; 
            var position1 = true;
            var position2 = false;
          
            interval = Script.setInterval(function() {
                print("scanner is searching");
                scanPosition = Entities.getEntityProperties(scanner, 'position').position;
                var overlays = Overlays.findOverlays(scanPosition, SCAN_RADIUS);
                // overlay removed from scanner...no new one in Scanner
                if (overlays.length === 0 && overlayInScanner) {
                    if (highlightToggle) {
                        Selection.removeFromSelectedItemsList(LIST_NAME, "entity", matchingEntity);
                        Selection.removeFromSelectedItemsList(LIST_NAME, "overlay", overlayInScanner);
                        prevID = 0;
                    }

                    matchingEntity = null;
                    overlayInScanner = null;
                    // overlay was taken out of Scanner...new one is in Scanner
                } else if ((overlays.length > 0) && (overlayInScanner) && 
                (overlays.toString().indexOf(overlayInScanner) === -1)) {
                    if (highlightToggle) {
                        Selection.removeFromSelectedItemsList(LIST_NAME, "entity", matchingEntity);
                        Selection.removeFromSelectedItemsList(LIST_NAME, "overlay", overlayInScanner);
                        prevID = 0;
                    }
                    matchingEntity = null;
                    overlayInScanner = null;
                    // ready to process overlayin scanner
                } else if (overlays.length > 0 && overlays.toString().indexOf(overlayInScanner) !== -1) {
                    if (Overlays.getProperty(overlayInScanner, 'parentID')) {

                        tableID = Entities.getEntityProperties(scanner, 'parentID').parentID;
                        if (Overlays.getProperty(overlayInScanner, 'parentID') === tableID) { 
                            // if item in Scanner is not being grabbed anymore
                            name = Overlays.getProperty(overlayInScanner, 'name');
                            if (highlightToggle) {
                                Selection.removeFromSelectedItemsList(LIST_NAME, "entity", matchingEntity);
                                Selection.removeFromSelectedItemsList(LIST_NAME, "overlay", overlayInScanner);
                                prevID = 0;
                            }
                            var MPIDLengthMinusOne = 35;
                            var marketplaceID = name.substr(OVERLAY_PREFIX.length, OVERLAY_PREFIX.length + MPIDLengthMinusOne);
                            print("mp id " + marketplaceID);
                            var goToURL = MARKET_PLACE_ITEM_URL_PREFIX + "/items/" + marketplaceID;
                            var entityProperties = Entities.getEntityProperties(matchingEntity, 
                                ['localPosition', 'localRotation', 'dimensions', 'parentJointIndex', 'marketplaceID']);
                            var replicaStoredTransform = {
                                position: entityProperties.localPosition,
                                rotation: entityProperties.localRotation,
                                dimensions: entityProperties.dimensions,
                                jointName: MyAvatar.jointNames[entityProperties.parentJointIndex],
                                demoEntityID: entityID
                            };

                            replicaStoredTransforms[overlayInScanner] = replicaStoredTransform;
                            if (JSON.stringify(scannedMPOverlays).indexOf(overlayInScanner) === -1){
                                Overlays.editOverlay(overlayInScanner, {
                                    localPosition: {x: newX, y: SCANNED_LOCAL_HEIGHT, z: newZ},
                                    localRotation: SCANNED_LOCAL_ROTATION
                                });
                                scannedMPOverlays[overlayInScanner] = {x: newX, y: SCANNED_LOCAL_HEIGHT, z: newZ};
                                if (position1) {
                                    newZ -=OVERLAY_SPACING;
                                    position1 = false;
                                    position2 = true;
                                } else if (position2) {
                                    newZ -=OVERLAY_SPACING;
                                    position2 = false;
                                } else {
                                    newZ +=OVERLAY_SPACING;
                                    newZ +=OVERLAY_SPACING;
                                    newX -=OVERLAY_SPACING;
                                    position1 = true;
                                }
                            } else {
                                Overlays.editOverlay(overlayInScanner, {
                                    localPosition: scannedMPOverlays[overlayInScanner],
                                    localRotation: SCANNED_LOCAL_ROTATION
                                });
                            }
            
                    
                            TABLET.gotoWebScreen(goToURL, MARKETPLACES_INJECT_SCRIPT_URL);
                            if (SCANNED_ITEM_SOUND.downloaded) {
                                Audio.playSound(SCANNED_ITEM_SOUND, {
                                    position: MyAvatar.position,
                                    volume: SHARED.AUDIO_VOLUME_LEVEL,
                                    localOnly: true
                                });
                            }
                            if (highlightToggle) {
                                Selection.removeFromSelectedItemsList(LIST_NAME, "entity", matchingEntity);
                                Selection.removeFromSelectedItemsList(LIST_NAME, "overlay", overlayInScanner);
                            }

                            lastScannedOverlay = overlayInScanner;
                            lastScannedMPItem = entityProperties.marketplaceID;
                            overlayInScanner = null;
                        }
                    }

                } else if (overlays.length > 0 && !overlayInScanner) {
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
                                    if (highlightToggle) {
                                        if (prevID !== entityID) {
                                            Selection.addToSelectedItemsList(LIST_NAME, "entity", matchingEntity);
                                            Selection.addToSelectedItemsList(LIST_NAME, "overlay", overlayInScanner);
                                            prevID = entityID;
                                        }
                                    }
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
