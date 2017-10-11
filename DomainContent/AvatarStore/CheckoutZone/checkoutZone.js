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
    
    var _this = this;
    var tableProperties, tableHeight, tableLength, tableID, spawnZ, spawnY, spawnX;
    var zoneID;
    var replicaList = [];
    var left = true;

    this.preload = function(entityID) {
        zoneID = entityID;
    };

    // Get info on checkout stand so we can place copies of items on it for purchasing
    // Find the position of the top of the stand at one end
    var getCheckoutStandPosition = (function(){
        var zoneChildren = Entities.getChildrenIDs(zoneID);
        zoneChildren.forEach(function (childID) {
            var name = Entities.getEntityProperties(childID, 'name').name;
            if (name === "Checkout Table") {
                tableProperties = Entities.getEntityProperties(childID, ['id','position', 'dimensions', 'rotation']);
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
    });

    // Spawn a copy of each attachment scaled down to fit the ITEM_HEIGHT and place it on the checkout table
    var spawnOverlayReplica = (function(entityID){
        var properties = Entities.getEntityProperties(entityID, ['name','modelURL','type','dimensions','marketplaceID', 'modelURL']);
        properties.url = properties.modelURL;
        properties.name = "MP" + properties.marketplaceID;
        properties.alpha = 1;
        properties.grabbable = true;
        properties.parentID = tableID;
        properties.localPosition = {"x":spawnX,"y":spawnY,"z":spawnZ};
        properties.localRotation = {"x":0,"y":0,"z":0};
        properties.userData = "{\"grabbableKey\":{\"cloneable\":false,\"grabbable\":true}}";
        var scale = (ITEM_HEIGHT / properties.dimensions.y);
        if ((properties.dimensions.x > ITEM_HEIGHT) || (properties.dimensions.y > ITEM_HEIGHT) || (properties.dimensions.y > ITEM_HEIGHT)) {
            properties.dimensions.y = ITEM_HEIGHT;
            properties.dimensions.x *= scale;
            properties.dimensions.z *= scale;
        }
        // check that the item is not too large
        var maxItemSize = 0.3;
        var scaleReduction;
        while (properties.dimensions.x > maxItemSize || properties.dimensions.z > maxItemSize) {
            scale *= scaleReduction;
            properties.dimensions.y *= scale;
            properties.dimensions.x *= scale;
            properties.dimensions.z *= scale;
        }
        var replica = Overlays.addOverlay("model", properties);
        replicaList.push(replica);
    });

    _this.enterEntity = (function (entityID) {
        left = true;
        getCheckoutStandPosition();
        SHARED.getAvatarChildEntities(MyAvatar).forEach(function (entityID) {
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
                    var moveBack = 0.75 *ITEM_HEIGHT;
                    var moveDown = 1.25 *ITEM_HEIGHT;
                    var moveLeft = 1.5 *ITEM_HEIGHT;
                    var moveForward = 0.75 *ITEM_HEIGHT;
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

            Overlays.mousePressOnOverlay.connect(function(overlayID, event){
                if (replicaList.indexOf(overlayID) !== -1) {
                    var name = Overlays.getProperty(overlayID, 'name');
                    var id = name.substr(2,37);
                    var goToURL = "https://metaverse.highfidelity.com/marketplace/items/" + id;
                    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
                    tablet.gotoWebScreen(goToURL);
                }
            });
        });
    });
    
    _this.leaveEntity = function(){
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
    };
});
