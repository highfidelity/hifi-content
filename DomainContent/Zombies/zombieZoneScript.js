//
//  zombieZoneScript.js
//
//  This script serves as a virtual bouncer depending on whether or not a client can validate
//  ownership of a particular specified avatar entity.
//
//  Copyright 2017 High Fidelity, Inc.
//
//  Usage: Set up userdata on the zone with the following structure:
//
//  { "marketplaceID" : marketplaceID1, "rejectTeleportLocation:" : hifiAddress }
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* globals Entities, Wallet, Window*/

(function(){
    var WEARABLE_SEARCH_RADIUS = 10;

    var _foundEntityID = -1;
    var _passMarketplaceID;
    var _userdataProperties;
    var _backupLocation;

    var foundValidTestable = false;

    var ProtectedZone = function() {
    };

    var verificationSuccess = function(entityID) {
        print ("You may enter - verification passed for entity: " + entityID);
        Wallet.ownershipVerificationSuccess.disconnect(verificationSuccess);
        Wallet.ownershipVerificationFailed.disconnect(verificationFailed);
    };

    var verificationFailed = function(entityID) {
        print ("You may not enter - verification failed for entity: " + entityID);
        Window.location.handleLookupString(_backupLocation);
        Wallet.ownershipVerificationSuccess.disconnect(verificationSuccess);
        Wallet.ownershipVerificationFailed.disconnect(verificationFailed);
    };

    var verifyAvatarOwnership = function(entityID) {
        Wallet.proveAvatarEntityOwnershipVerification(entityID);
    };

    var searchForMatchingMarketplaceItem = function() {
        Entities.findEntitiesByType('Model', MyAvatar.position, WEARABLE_SEARCH_RADIUS).forEach(function(entityID) {
            var properties = Entities.getEntityProperties(entityID, ['marketplaceID', 'certificateID', 'parentID']);
            if (properties.marketplaceID === _passMarketplaceID && properties.parentID === MyAvatar.sessionUUID){
                _foundEntityID = entityID;
                foundValidTestable = true;
                verifyAvatarOwnership(_foundEntityID);
                Wallet.ownershipVerificationSuccess.connect(verificationSuccess);
                Wallet.ownershipVerificationFailed.connect(verificationFailed);
            }
        });
        if (!foundValidTestable) {
            Window.location.handleLookupString(_backupLocation);
        }
    };

    ProtectedZone.prototype = {
        preload: function(entityID) {
            _userdataProperties = JSON.parse(Entities.getEntityProperties(entityID, 'userData').userData);
            _backupLocation = _userdataProperties.rejectTeleportLocation;
            _passMarketplaceID = _userdataProperties.marketplaceID; 
        },
        enterEntity: function(entityID) {
            _userdataProperties = JSON.parse(Entities.getEntityProperties(entityID, 'userData').userData);
            _passMarketplaceID = _userdataProperties.marketplaceID; 
            foundValidTestable = false;
            searchForMatchingMarketplaceItem();
        }
    };

    return new ProtectedZone();
});
