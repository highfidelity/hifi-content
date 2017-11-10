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
/* global Wallet */
(function () {
    var SHARED = Script.require('../attachmentZoneShared.js');
    var ITEM_HEIGHT = 0.1;
    var HALF = 0.5;
    var ITEM_OFFSET = {x: 1.5, y: 1.25, z: 0.75};
    var VERTICAL_SPACING = 6;
    var OVERLAY_PREFIX = 'MP';
    var APP_NAME = "CHECKOUT";
    var APP_URL = "https://hifi-content.s3.amazonaws.com/rebecca/CheckoutZone/CheckoutWelcome.html";
    var OVERLAY_ROTATIONAL_OFFSET = { x: 10, y: 140, z: 0 };
    var TABLET_LOCAL_POSITION_OFFSET = { x: 0.01, y: 0.9, z: -0.6 };
    var APP_ICON = "https://hifi-content.s3.amazonaws.com/rebecca/CheckoutZone/shoppingCart.svg";
    var TABLET = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    var TABLET_ROTATIONAL_OFFSET = { x: 10, y: 240, z: 0 };
    var MARKETPLACE_WALLET_QML_PATH = Script.resourcesPath() + "qml/hifi/commerce/wallet/Wallet.qml";
    // Milliseconds
    var MAKING_SURE_INTERVAL = 100;
    var SHORTER_STOP_INTERVAL = 1000;

    var _this = this;
    var isInZone = false;
    var tableProperties, tableHeight, tableLength, tableID, spawnZ, spawnY, spawnX;
    var zoneID;
    var replicaList = [];
    
    var left = true;
    var button;
    var recycleBinID;
    var scannerZone;

    this.preload = function(entityID) {
        zoneID = entityID;
    };

    // Get info on checkout stand so we can place copies of items on it for purchasing
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
                var verticalSpace = VERTICAL_SPACING * ITEM_HEIGHT;
                spawnY = halfTableHeight + verticalSpace;
                var halfTableLength = HALF * tableLength;
                spawnZ = (halfTableLength);
                spawnX = 0;
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
            dimensions: JSON.parse(JSON.stringify(entityProperties.dimensions))
        };
        var scale = (ITEM_HEIGHT / overlayProperties.dimensions.y);
        if ((overlayProperties.dimensions.x > ITEM_HEIGHT) || (overlayProperties.dimensions.y > ITEM_HEIGHT) || 
        (overlayProperties.dimensions.y > ITEM_HEIGHT)) {
            overlayProperties.dimensions.y = ITEM_HEIGHT;
            overlayProperties.dimensions.x *= scale;
            overlayProperties.dimensions.z *= scale;
        }
        // check that the item is not too large
        var maxItemSize = 0.175;
        var scaleReduction = 0.95;
        while (overlayProperties.dimensions.x > maxItemSize || overlayProperties.dimensions.z > maxItemSize || 
            overlayProperties.dimensions.y > maxItemSize) {
            scale *= scaleReduction;
            overlayProperties.dimensions.y *= scale;
            overlayProperties.dimensions.x *= scale;
            overlayProperties.dimensions.z *= scale;
        }
        var replica = Overlays.addOverlay("model", overlayProperties);
        var userDataObject = JSON.parse(entityProperties.userData);
        userDataObject.replicaOverlayID = replica;
        Entities.editEntity(entityID, {userData: JSON.stringify(userDataObject)});
        replicaList.push(replica);
    });

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
        if (Wallet.walletStatus === 3) {
            TABLET.gotoWebScreen(APP_URL); 
        } else {
            TABLET.pushOntoStack(APP_URL);
            TABLET.loadQMLSource(MARKETPLACE_WALLET_QML_PATH);
        }
    
    });

    _this.enterEntity = (function (entityID) {
        collectZoneData();
        Entities.callEntityMethod(recycleBinID, 'enterCheckout');
        Entities.callEntityMethod(scannerZone, 'enterCheckout');
        setupApp();
        isInZone = true; 
        left = true;
        var avatarChildEntities = [];
        avatarChildEntities = SHARED.getAvatarChildEntities(MyAvatar);
        avatarChildEntities.forEach(function (entityID) {
            var MAX_ITEMS = 10;
            if (replicaList.length < MAX_ITEMS){
                var childUserData = Entities.getEntityProperties(entityID, 'userData').userData;
                var isAttachment = childUserData.indexOf("attached\":true");
                var marketplaceID = Entities.getEntityProperties(entityID, 'marketplaceID').marketplaceID;
                if (marketplaceID && (isAttachment !== -1)) {
                
                    // TODO check for already purchased 
                    
                    // move spawn position over to the next empty spot
                    var moveRight = ITEM_OFFSET.x * ITEM_HEIGHT;
                    var moveBack = ITEM_OFFSET.z * ITEM_HEIGHT;
                    var moveDown = ITEM_OFFSET.y * ITEM_HEIGHT;
                    var moveLeft = ITEM_OFFSET.x * ITEM_HEIGHT;
                    var moveForward = ITEM_OFFSET.z * ITEM_HEIGHT;
                    if (left) {
                        spawnZ += moveRight;
                        spawnX += moveBack;
                        left = false;
                    } else {
                        spawnY -= moveDown;
                        spawnZ -= moveLeft;
                        spawnX -= moveForward;
                        left = true;
                    }
                }
            }
        });
        
        var tabletTransform = {
            parentID: tableID,
            localPosition: TABLET_LOCAL_POSITION_OFFSET,
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
        TABLET.removeButton(button);
        TABLET.gotoHomeScreen();
        Overlays.editOverlay(HMD.tabletID, {parentID: MyAvatar.sessionUUID});
        HMD.closeTablet();
    };

    _this.unload = function() {
        // sure you leave the entity if you're still in there
        if (isInZone) {
            _this.leaveEntity();
        }
    };
});
