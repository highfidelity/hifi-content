//
//  checkoutZone.js
//
//  Created by Rebecca Stankus on 9/29/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  This zone will provide an area at which a user may purchase an item. When the avatar enters the zone wearing a 
//  marketplace item, the item will appear as a small overlay. Scanning the overlay will cause the 
//  the tablet to open to the marketplace home page for that item, allowing the user to quickly make the purchase.
/* global Render, Wallet */

(function () {
    var mini = false;

    var SHARED = Script.require('../attachmentZoneShared.js');
    var MAX_ITEMS = 12;
    var HALF = 0.5;
    var OVERLAY_PREFIX = 'MP';
    var TRANSFORMS_SETTINGS = 'io.highfidelity.avatarStore.checkOut.tranforms';
    var ENTER_ZONE_SOUND = SoundCache.getSound(Script.resolvePath("../sounds/sound5.wav"));
    var APP_NAME = "CHECKOUT";
    var APP_URL = "https://hifi-content.s3.amazonaws.com/rebecca/CheckoutZone/CheckoutWelcome.html";
    var APP_ICON = "https://hifi-content.s3.amazonaws.com/rebecca/CheckoutZone/shoppingCart.svg";
    var OVERLAY_ROTATIONAL_OFFSET = { x: 10, y: 140, z: 0 };
    
    var TABLET = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    var TABLET_ROTATIONAL_OFFSET = { x: 10, y: 220, z: 0 };
    var MARKETPLACE_WALLET_QML_PATH = Script.resourcesPath() + "qml/hifi/commerce/wallet/Wallet.qml";
    // Milliseconds
    var MAKING_SURE_INTERVAL = 100;
    var SHORTER_STOP_INTERVAL = 1000;
    var STOP_MAKING_SURE_TIMEOUT = 5000;
    
    var itemHeight;
    var tabletLocalOffset;
    var _this = this;
    var isInZone = false;
    var tableProperties, tableHeight, tableLength, tableID, spawnZ, spawnY, spawnX;
    var zoneID;
    var replicaList = [];
    var button;
    var recycleBinID;
    var scannerZone;
    var replicaStoredTransforms = {};
    var yOffset, zOffset, xOffset;
    
    this.preload = function(entityID) {
        zoneID = entityID;
        var sizeLimit = 1;
        if (Entities.getEntityProperties(zoneID, 'dimensions.x') < sizeLimit) {
            mini = true;
        }
        if (mini) {
            itemHeight = 0.04;
            tabletLocalOffset = { x: -0.01, y: 0.53, z: -0.4 };
        } else {
            itemHeight = 0.07;
            tabletLocalOffset = { x: -0.1, y: 0.74, z: -0.35 };
        }
    };
    
    var getTransformForMarketplaceItems = function() {
        return Settings.getValue(TRANSFORMS_SETTINGS, {});
    };
      
    var getTransformsForMarketplaceItem = function(marketplaceID) {
        var transformItems = getTransformForMarketplaceItems();
        if (transformItems[marketplaceID] === undefined) {
            return {
                certificateTransforms: {},
                unsortedTransforms: [],
                lastUsedUnsortedTransformIndex: -1
            };
        }
        return transformItems[marketplaceID];
    };
      
    var addTransformForMarketplaceItem = function(marketplaceID, certificateID, transform) {
        if (marketplaceID === undefined) {
            return;
        }
        var marketplaceItemTransforms = getTransformForMarketplaceItems();
        var marketplaceItemTransform = getTransformsForMarketplaceItem(marketplaceID);
        if (certificateID !== undefined) {
            marketplaceItemTransform.certificateTransforms[certificateID] = transform;
        } else {
            marketplaceItemTransform.unsortedTransforms.push(transform);
        }
        marketplaceItemTransforms[marketplaceID] = marketplaceItemTransform;
        Settings.setValue(TRANSFORMS_SETTINGS, marketplaceItemTransforms);
    };
  
    var collectZoneData = (function(){
        var zoneChildren = Entities.getChildrenIDs(zoneID);
        zoneChildren.forEach(function (childID) {
            var name = Entities.getEntityProperties(childID, 'name').name;
            if (name === "Checkout Table") {
                tableProperties = Entities.getEntityProperties(childID, ['id', 'position', 'dimensions', 'rotation']);
                tableID = tableProperties.id;
                tableHeight = tableProperties.dimensions.y;
                tableLength = tableProperties.dimensions.x;
                var halfTableHeight = HALF * tableHeight;
                if (mini) {
                    yOffset = -0.015;
                    zOffset = 0;
                    xOffset = 0;
                } else {
                    yOffset = 0;
                    zOffset = 0.3;
                    xOffset = -0.05;
                }
                spawnY = halfTableHeight + yOffset;
                var halfTableLength = HALF * tableLength;
                spawnZ = (halfTableLength - itemHeight + zOffset);
                spawnX = xOffset;
                return;
            }
        });
        var tableChildren = Entities.getChildrenIDs(tableID);
        tableChildren.forEach(function (childID) {
            var tableChildName = Entities.getEntityProperties(childID, 'name').name;
            if (tableChildName === "Checkout Recycle") {
                recycleBinID = childID;
                return;
            } else if (tableChildName === "Checkout Scan Zone") {
                scannerZone = childID;
                return;
            }
        });
    });
  
    // Spawn a copy of each attachment scaled down to fit the ITEM_HEIGHT and place it on the checkout table
    var spawnOverlayReplica = (function(entityID) {
        var entityProperties = Entities.getEntityProperties(entityID, [
            'name', 'modelURL', 'type', 'dimensions', 'marketplaceID',
            'localPosition', 'localRotation', 'parentJointIndex', 'userData'
        ]);
        var overlayProperties = {
            url: entityProperties.modelURL,
            name: OVERLAY_PREFIX + entityProperties.marketplaceID,
            alpha: true,
            grabbable: true,
            parentID: tableID,
            localPosition: {x: spawnX, y: spawnY, z: spawnZ},
            localRotation: Quat.fromVec3Degrees(OVERLAY_ROTATIONAL_OFFSET),
            // clone dimensions so we can alter it without messing up the original entities dimensions
            dimensions: entityProperties.dimensions
        };
        var scale = (itemHeight / overlayProperties.dimensions.y);
        if ((overlayProperties.dimensions.x > itemHeight) || (overlayProperties.dimensions.y > itemHeight) || 
              (overlayProperties.dimensions.y > itemHeight)) {
            overlayProperties.dimensions.y = itemHeight;
            overlayProperties.dimensions.x *= scale;
            overlayProperties.dimensions.z *= scale;
        }
        // check that the item is not too large
        var maxItemSize;
        if (mini) {
            maxItemSize = 0.06;
        } else {
            maxItemSize = 0.1;
        }
        var scaleReduction = 0.95;
        while (overlayProperties.dimensions.x > maxItemSize || overlayProperties.dimensions.z > maxItemSize || 
                  overlayProperties.dimensions.y > maxItemSize) {
            overlayProperties.dimensions.y *= scaleReduction;
            overlayProperties.dimensions.x *= scaleReduction;
            overlayProperties.dimensions.z *= scaleReduction;
        }
        var replica = Overlays.addOverlay("model", overlayProperties);
        var userDataObject = JSON.parse(entityProperties.userData);
        userDataObject.replicaOverlayID = replica;
        Entities.editEntity(entityID, {userData: JSON.stringify(userDataObject)});
        var replicaStoredTransform = {
            position: entityProperties.localPosition,
            rotation: entityProperties.localRotation,
            dimensions: entityProperties.dimensions,
            jointName: MyAvatar.jointNames[entityProperties.parentJointIndex],
            demoEntityID: entityID
        };
  
        replicaStoredTransforms[replica] = replicaStoredTransform;
        replicaList.push(replica);
    });
  
    _this.replicaCheckedOut = function(entityID, args) {
        var ARGS_INDEX = {
            REPLICA_OVERLAY: 0,
            NEW_ENTITY: 1
        };
        var replicaOverlayID = args[ARGS_INDEX.REPLICA_OVERLAY];
        var newEntityID = args[ARGS_INDEX.NEW_ENTITY];
          
        // Delete the new entity when the transforms are not found.
        if (replicaStoredTransforms[replicaOverlayID] === undefined) {
            print('Could not find transform data, deleting purchased entity.');
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
        addTransformForMarketplaceItem(newEntityProperties.marketplaceID, certificateID, transform);
  
        // Remove the demo object, to prevent overlapping objects
        Entities.deleteEntity(transform.demoEntityID);
    };
  
    var setupApp = (function() {
        button = TABLET.addButton({
            icon: APP_ICON,
            text: APP_NAME
        });
        HMD.openTablet(true);
        function onClicked() {
            TABLET.gotoWebScreen(APP_URL); 
        }
        button.clicked.connect(onClicked);
        var walletReady = 3;
        if (Wallet.walletStatus === walletReady) {
            TABLET.gotoWebScreen(APP_URL); 
        } else {
            TABLET.pushOntoStack(APP_URL);
            TABLET.loadQMLSource(MARKETPLACE_WALLET_QML_PATH);
        }
    });
  
    _this.enterEntity = (function (entityID) {
        
        replicaList = [];
        collectZoneData();
        if (ENTER_ZONE_SOUND.downloaded) {
            Audio.playSound(ENTER_ZONE_SOUND, {
                position: MyAvatar.position,
                volume: SHARED.AUDIO_VOLUME_LEVEL,
                localOnly: true
            });
        }
        Entities.callEntityMethod(recycleBinID, 'enterCheckout');
        Entities.callEntityMethod(scannerZone, 'enterCheckout');
        setupApp();
        isInZone = true;
        var avatarChildEntities = [];
        avatarChildEntities = SHARED.getAvatarChildEntities(MyAvatar);
        var left = true;
        var middle = false;
        avatarChildEntities.forEach(function (entityID) {
            if (replicaList.length < MAX_ITEMS){
                var childUserData = Entities.getEntityProperties(entityID, 'userData').userData;
                var isAttachment = childUserData.indexOf("attached\":true");
                var marketplaceID = Entities.getEntityProperties(entityID, 'marketplaceID').marketplaceID;
                if (marketplaceID && (isAttachment !== -1)) {
                    spawnOverlayReplica(entityID);
                    if (mini) {
                        xOffset = 0;
                        yOffset = 0.06;
                    } else {
                        xOffset = 0.005;
                        yOffset = 0.1;
                    }
                    if (left) {
                        spawnX -= itemHeight + xOffset;
                        spawnZ -= itemHeight;
                        left = false;
                        middle = true;
                    } else if (middle){
                        spawnX -= itemHeight + xOffset;
                        spawnZ -= itemHeight;
                        middle = false;
                    } else {
                        spawnY += yOffset;
                        spawnX += itemHeight;
                        spawnX += itemHeight;
                        spawnZ += itemHeight;
                        spawnZ += itemHeight;
                        left = true;
                    }
                }
            }
        });
        var tabletTransform = {
            parentID: tableID,
            localPosition: tabletLocalOffset,
            localRotation: Quat.fromVec3Degrees(TABLET_ROTATIONAL_OFFSET)
        };
        Overlays.editOverlay(HMD.tabletID, tabletTransform);
        var tabletTransformInterval = Script.setInterval(function() {
            Overlays.editOverlay(HMD.tabletID, tabletTransform);
        }, MAKING_SURE_INTERVAL);
        Script.setTimeout(function() {
            tabletTransformInterval.stop();
        }, SHORTER_STOP_INTERVAL);
    });
      
    _this.leaveEntity = function() {
        Entities.callEntityMethod(recycleBinID, 'exitCheckout');
        Entities.callEntityMethod(scannerZone, 'exitCheckout');
        isInZone = false;
        var SCANNER_RANGE_METERS = 1000;
        Entities.findEntities(MyAvatar.position, SCANNER_RANGE_METERS).forEach(function(entity) {
            try {
                var name = Entities.getEntityProperties(entity).name;
                if (name.indexOf("Checkout Item") !== -1) {
                    Entities.deleteEntity(entity);
                }
            } catch (e) {
                print("Error cleaning up.");
            }
        }); 
        replicaList.forEach(function (overlayItem) {
            Overlays.deleteOverlay(overlayItem);
        });
        replicaList = [];
        replicaStoredTransforms = {};
        TABLET.removeButton(button);
        TABLET.gotoHomeScreen();
        Overlays.editOverlay(HMD.tabletID, {parentID: MyAvatar.sessionUUID});
        HMD.closeTablet();
    };
  
    _this.unload = function() {
        // make sure you leave the entity if you're still in there
        if (isInZone) {
            _this.leaveEntity();
        }
    };
});
