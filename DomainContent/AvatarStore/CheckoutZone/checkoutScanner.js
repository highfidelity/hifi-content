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
    var MARKET_PLACE_ITEM_URL_PREFIX = 'https://metaverse.highfidelity.com/marketplace/items/';
    var SCAN_RADIUS = 0.15; // meters
    var OVERLAY_PREFIX = 'MP';
    
    var interval;
    var properties;
    var checkoutZoneID;

    var scannedMPOverlays = {};

    var onEntityAdded = function(entityID) {
        print('entity added: ' + entityID);
        var newItemProperties = Entities.getEntityProperties(entityID, ['marketplaceID', 'clientOnly', 'owningAvatarID', 'lastEditedBy']);
        print(MyAvatar.sessionUUID);
        print(newItemProperties.lastEditedBy);
        if (/* newItemProperties.clientOnly && newItemProperties.owningAvatarID === MyAvatar.sessionUUID && */
            (newItemProperties.lastEditedBy === MyAvatar.sessionUUID || newItemProperties.lastEditedBy === undefined) &&
            newItemProperties.marketplaceID !== "") {
            
            print('Entity of interest added.');
            if (scannedMPOverlays[newItemProperties.marketplaceID] !== undefined) {
                print('scannedMPOverlays contains entity of interest.');
                var overlayID = scannedMPOverlays[newItemProperties.marketplaceID];
                Entities.callEntityMethod(checkoutZoneID, 'replicaCheckedOut', [overlayID, entityID]);
                print('called the entity method.');
                delete scannedMPOverlays[newItemProperties.marketplaceID];
            }
        }
    };
    
    this.preload = function(entityID) {
        properties = Entities.getEntityProperties(entityID, ['position', 'userData']);
        try {
            checkoutZoneID = JSON.parse(properties.userData).avatarStore.checkoutZoneID;
            print('Checkout zone ID found: ' + checkoutZoneID);
        } catch (e) {
            print('Something went wrong trying to fetch the avatarStore.checkoutZoneID from the scanners userData.');
        }
        interval = Script.setInterval(function() {
            var overlays = Overlays.findOverlays(properties.position, SCAN_RADIUS);
            if (overlays.length > 0) {
                overlays.forEach(function(overlay) {
                    var name = Overlays.getProperty(overlay, 'name');
                    if (name.indexOf(OVERLAY_PREFIX) !== -1) {
                        print("this one is MP!");
                        var marketplaceID = name.substr(OVERLAY_PREFIX.length, OVERLAY_PREFIX.length + 35);
                        print("ID is " + marketplaceID);
                        var goToURL = MARKET_PLACE_ITEM_URL_PREFIX + marketplaceID;
                        scannedMPOverlays[marketplaceID] = overlay;
                        TABLET.gotoWebScreen(goToURL);
                        Overlays.deleteOverlay(overlay);
                    }
                });
            }
        }, 1000);
        Entities.addingEntity.connect(onEntityAdded);
    };
    
    this.unload = function() {
        Script.clearInterval(interval);
        Entities.addingEntity.disconnect(onEntityAdded);
    };
});
