//
//  checkoutZone.js
//
//  Created by Rebecca Stankus on 9/29/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  This zone will provide an area at which a user may purchase an item. When the avatar enters the zone wearing a marketplace item, 
//  the tablet will open to the marketplace home page for that item, allowing the user to quickly make the purchase.
(function () {
    print("Begin the checkout zone script take 3");
    print("myavatarid is " + MyAvatar.sessionUUID);
    var SHARED = Script.require('./attachmentZoneShared.js');
    var TABLE_PADDING = 0.3;
    var ITEM_HEIGHT = 0.2;
    
    var _this = this;
    var tableProperties, tableHeight, tableLength, spawnPosition;
    var zoneID, overlay;
    var overlayList = [];
    var replicaList = [];

    this.preload = function(entityID) {
        zoneID = entityID;
    };
    

    // Get info on checkout stand so we can place copies of items on it for purchasing
    // Find the position of the top of the stand at one end
    var getCheckoutStandPosition = (function(){
        var zoneChildren = Entities.getChildrenIDs(zoneID);
        zoneChildren.forEach(function (childID) {
            var name = Entities.getEntityProperties(childID, 'name').name;
            // print(name);
            if (name === "Checkout Table") {
                // print("Found the checkout table .......");
                tableProperties = Entities.getEntityProperties(childID, ['id','position', 'dimensions', 'rotation']);
                tableHeight = tableProperties.dimensions.y;
                tableLength = tableProperties.dimensions.x;
                spawnPosition = tableProperties.position;
                spawnPosition.y += ((0.5 * tableHeight) + (0.5 * ITEM_HEIGHT));
                spawnPosition.z += ((0.5 * tableLength) + TABLE_PADDING);
                // print("Returning spawn position for checkout item");
                return;
            }
        });
    });

    // Spawn a copy of each attachment scaled down to fit the ITEM_HEIGHT and place it on the checkout table
    var spawnItem = (function(entityID){
        // print("Making a copy for the checkout stand...");
        var properties = Entities.getEntityProperties(entityID, ['name','modelURL','type','dimensions','marketplaceID']);
        var oldName = properties.name;
        properties.name = "Checkout Item " + oldName;
        properties.position = spawnPosition;
        properties.rotation = tableProperties.rotation;
        properties.userData = "{\"grabbableKey\":{\"cloneable\":false,\"grabbable\":false}}";
        var scale = (ITEM_HEIGHT / properties.dimensions.y);
        if ((properties.dimensions.x > ITEM_HEIGHT) || (properties.dimensions.y > ITEM_HEIGHT) || (properties.dimensions.y > ITEM_HEIGHT)) {
            properties.dimensions.y = ITEM_HEIGHT;
            properties.dimensions.x *= scale;
            properties.dimensions.z *= scale;
        }
        // check that the item is not too large
        while (properties.dimensions.x > 0.3 || properties.dimensions.z > 0.3) {
            scale *= 0.8;
            properties.dimensions.y *= scale;
            properties.dimensions.x *= scale;
            properties.dimensions.z *= scale;
        }
        Entities.addEntity(properties);
    });

    _this.enterEntity = (function (entityID) {
        // print("You've entered the checkout zone");
        getCheckoutStandPosition();
        // print("got checkout stand position");
        SHARED.getAvatarChildEntities(MyAvatar).forEach(function (entityID) {
            // print("Getting avatar child entiites...");
            var childUserData = Entities.getEntityProperties(entityID, 'userData').userData;
            var isAttachment = childUserData.indexOf("Attachment");
            var marketplaceID = Entities.getEntityProperties(entityID, 'marketplaceID').marketplaceID;
            print("item #: " + marketplaceID);
            if (marketplaceID && (replicaList.indexOf(marketplaceID) === -1)) {
                replicaList.push(marketplaceID);
                
                // TODO check for already purchased 
                if (isAttachment !== -1) {
                // print("Found an attachment from the marketplace.");
                    spawnItem(entityID); // put a copy of the item on the table
                    spawnPosition.x += TABLE_PADDING; // move spawn position to in front of item
                    overlay = {
                        position: spawnPosition,
                        name: marketplaceID,
                        userData: "checkout",
                        color: {
                            red: 255,
                            green: 255,
                            blue: 255
                        },
                        alpha: 1,
                        dimensions: {
                            x: 0.01,
                            y: 0.06,
                            z: 0.12
                        },
                        solid: true,
                        visible: true,
                        lineWidth: 1.0,
                        borderSize: 1.4
                    };
                    var tempOverlay = Overlays.addOverlay("cube", overlay); // add an overlay price tag
                    overlayList.push(tempOverlay);
                    spawnPosition.x -= TABLE_PADDING; // move spawn position back to item and over to the next empty spot
                    spawnPosition.z -= TABLE_PADDING;
                }
            }

            Overlays.mousePressOnOverlay.connect(function(overlayID, event){
                var overlayTag = Overlays.getProperty(overlayID, 'userData');
                print("OverlayTag is " + overlayTag);
                if (overlayTag === "checkout") {
                    var goToURL = "https://metaverse.highfidelity.com/marketplace/items/" + Overlays.getProperty(overlayID, 'name');
                    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
                    tablet.gotoWebScreen(goToURL);
                }
            });
        });
    });
    
    /* _this.findRayIntersection = (function(pickRay) {
        var result = Overlays.findRayIntersection(pickRay);
        if (result.intersects) {
            var childOverlayID = result.overlayID;
            var childOverlay = childOverlayID.getOverlayObject;
            var selectedEntityID = childOverlay.parentID;
            var goToID = Entities.getEntityProperties(selectedEntityID, 'marketplaceID').marketplaceID;
            var goToURL = "https://metaverse.highfidelity.com/marketplace/items/" + goToID;
            var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
            tablet.gotoWebScreen(goToURL);
            if (result.entityID === null) {
                result.intersects = false;
            }
        }
        return result;
    });*/
    Controller.Standard.RT = (function() {
        print("You're getting warmer...");
    });
    
    _this.leaveEntity = function(){
        replicaList = [];
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
        overlayList.forEach(function (overlayItem) {
            Overlays.deleteOverlay(overlayItem);
        });
    };
});
