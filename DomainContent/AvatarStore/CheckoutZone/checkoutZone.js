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
(function () {
    var SHARED = Script.require('./attachmentZoneShared.js');
    var ITEM_HEIGHT = 0.1;
    var OVERLAY_PREFIX = 'MP';
    var TRANSFORMS_SETTINGS = 'io.highfidelity.avatarStore.checkOut.tranforms';
    var APP_NAME = "CHECKOUT";
    var APP_URL = "https://hifi-content.s3.amazonaws.com/rebecca/CheckoutZone/CheckoutWelcome.html";
    
    var APP_ICON = "https://hifi-content.s3.amazonaws.com/rebecca/CheckoutZone/shoppingCart.svg";
    var TABLET = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    
    var _this = this;
    var isInZone = false;
    var tableProperties, tableHeight, tableLength, tableID, spawnZ, spawnY, spawnX;
    var zoneID;
    var replicaList = [];
    var replicaStoredTransforms = {};
    var left = true;
    var button;
    var checkoutOutlineConfig;
    var recycleBinID;

    this.preload = function(entityID) {
        print("preloading checkout zone");
        zoneID = entityID;
        changeHighlight1();
    };

    var changeHighlight1 = (function() {
        checkoutOutlineConfig = Render.getConfig("RenderMainView.OutlineEffect1");
        checkoutOutlineConfig["glow"] = true;
        checkoutOutlineConfig["width"] = 7;
        checkoutOutlineConfig["intensity"] = 0.8;
        checkoutOutlineConfig["colorR"] = 0.18;
        checkoutOutlineConfig["colorG"] = 0.61;
        checkoutOutlineConfig["colorB"] = 0.86;
        checkoutOutlineConfig["unoccludedFillOpacity"] = 0;
        checkoutOutlineConfig["occludedFillOpacity"] = 0;      
    });

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

    // Get info on checkout stand so we can place copies of items on it for purchasing
    // Find the position of the top of the stand at one end
    var collectZoneData = (function(){
        var zoneChildren = Entities.getChildrenIDs(zoneID);
        zoneChildren.forEach(function (childID) {
            var name = Entities.getEntityProperties(childID, 'name').name;
            if (name === "Checkout Table") {
                tableProperties = Entities.getEntityProperties(childID, ['id', 'position', 'dimensions', 'rotation']);
                tableID = tableProperties.id;
                tableHeight = tableProperties.dimensions.y;
                tableLength = tableProperties.dimensions.x;
                var halfTableHeight = 0.5 * tableHeight;
                var verticalSpace = 6 * ITEM_HEIGHT;
                spawnY = halfTableHeight + verticalSpace;
                var halfTableLength = 0.5 * tableLength;
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
            localRotation: Quat.fromVec3Degrees({ x: 10, y: 140, z: 0 }),
            // clone dimensions so we can alter it without messing up the original entities dimensions
            dimensions: entityProperties.dimensions
        };
        var scale = (ITEM_HEIGHT / overlayProperties.dimensions.y);
        if ((overlayProperties.dimensions.x > ITEM_HEIGHT) || (overlayProperties.dimensions.y > ITEM_HEIGHT) || (overlayProperties.dimensions.y > ITEM_HEIGHT)) {
            // print("size was too big...scaling to ITEM-HEIGHT");
            overlayProperties.dimensions.y = ITEM_HEIGHT;
            overlayProperties.dimensions.x *= scale;
            overlayProperties.dimensions.z *= scale;
        }
        // check that the item is not too large
        var maxItemSize = 0.175;
        var scaleReduction = 0.95;
        while (overlayProperties.dimensions.x > maxItemSize || overlayProperties.dimensions.z > maxItemSize || overlayProperties.dimensions.y > maxItemSize) {
            scale *= scaleReduction;
            overlayProperties.dimensions.y *= scale;
            overlayProperties.dimensions.x *= scale;
            overlayProperties.dimensions.z *= scale;
        }
        var replica = Overlays.addOverlay("model", overlayProperties);
        Selection.addToSelectedItemsList("contextOverlayHighlightList1", "overlay", replica);
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
        }, 100);

        // Five seconds should be enough to be sure, otherwise we have a problem
        Script.setTimeout(function() {
            makeSureInterval.stop();
        }, 5000);

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
        TABLET.gotoWebScreen(APP_URL);
    });

    _this.enterEntity = (function (entityID) {
        collectZoneData();
        Entities.callEntityMethod(recycleBinID, 'enterCheckout');
        setupApp();
        isInZone = true; 
        left = true;
        var avatarChildEntities = [];
        avatarChildEntities = SHARED.getAvatarChildEntities(MyAvatar);
        avatarChildEntities.forEach(function (entityID) {
            var maxItems = 10;
            if (replicaList.length < maxItems){
                var childUserData = Entities.getEntityProperties(entityID, 'userData').userData;
                var isAttachment = childUserData.indexOf("attached\":true");
                var marketplaceID = Entities.getEntityProperties(entityID, 'marketplaceID').marketplaceID;
                if (marketplaceID && (isAttachment !== -1)) {
                
                    // TODO check for already purchased 
                    spawnOverlayReplica(entityID); // put a copy of the item on the table
                    // move spawn position over to the next empty spot
                    var moveRight = 1.5 * ITEM_HEIGHT;
                    var moveBack = 0.75 * ITEM_HEIGHT;
                    var moveDown = 1.25 * ITEM_HEIGHT;
                    var moveLeft = 1.5 * ITEM_HEIGHT;
                    var moveForward = 0.75 * ITEM_HEIGHT;
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
        Overlays.editOverlay(HMD.tabletID, tabletTransform);
        var tabletTransform = {
            parentID: tableID,
            localPosition: { x: 0.01, y: 0.9, z: -0.6 },
            localRotation: Quat.fromVec3Degrees({ x: 10, y: 240, z: 0 })
        };
        var tabletTransformInterval = Script.setInterval(function() {
            Overlays.editOverlay(HMD.tabletID, tabletTransform);
        }, 100);
        Script.setTimeout(function() {
            tabletTransformInterval.stop();
        }, 1000);
    });
    
    _this.leaveEntity = function() {
        Entities.callEntityMethod(recycleBinID, 'exitCheckout');
        isInZone = false;
        Entities.findEntities(MyAvatar.position, 1000).forEach(function(entity) {
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
        // sure you leave the entity if you're still in there
        if (isInZone) {
            _this.leaveEntity();
        }
    };
});
