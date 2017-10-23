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
    
    var interval;
    var properties;
    var checkoutZoneID;

    var scannedMPOverlays = {};

    var onEntityAdded = function(entityID) {
        var newItemProperties = Entities.getEntityProperties(entityID, ['marketplaceID', 'clientOnly', 'owningAvatarID', 'lastEditedBy']);
        if (/* newItemProperties.clientOnly && newItemProperties.owningAvatarID === MyAvatar.sessionUUID && */
            (newItemProperties.lastEditedBy === MyAvatar.sessionUUID || newItemProperties.lastEditedBy === undefined) &&
            newItemProperties.marketplaceID !== "") {

            if (scannedMPOverlays[newItemProperties.marketplaceID] !== undefined) {
                var overlayID = scannedMPOverlays[newItemProperties.marketplaceID];
                Entities.callEntityMethod(checkoutZoneID, 'replicaCheckedOut', [overlayID, entityID]);
                delete scannedMPOverlays[newItemProperties.marketplaceID];
            }
        }
    };
    
    this.preload = function(entityID) {
        properties = Entities.getEntityProperties(entityID, ['position', 'userData']);
        try {
            checkoutZoneID = JSON.parse(properties.userData).avatarStore.checkoutZoneID;
        } catch (e) {
            print('Something went wrong trying to fetch the avatarStore.checkoutZoneID from the scanners userData.');
        }
        interval = Script.setInterval(function() {
            var overlays = Overlays.findOverlays(properties.position, SCAN_RADIUS);
            if (overlays.length > 0) {
                overlays.forEach(function(overlay) {
                    var name = Overlays.getProperty(overlay, 'name');
                    if (name.indexOf(OVERLAY_PREFIX) !== -1) {
                        var marketplaceID = name.substr(OVERLAY_PREFIX.length, OVERLAY_PREFIX.length + 35);
                        var goToURL = MARKET_PLACE_ITEM_URL_PREFIX + "/items/" + marketplaceID;
                        scannedMPOverlays[marketplaceID] = overlay;
                        TABLET.gotoWebScreen(goToURL, MARKETPLACES_INJECT_SCRIPT_URL);
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
