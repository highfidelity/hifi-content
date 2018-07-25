//
//  ZoneScript.js
//
//  This script serves as a virtual bouncer depending on username or whether or not a client can validate
//  ownership of a particular specified avatar entity.
//
//  Copyright 2017 High Fidelity, Inc.
//
//  Set Up: 
//     1. Add below userData object to zone entity userData
//          1. Fill in rejectTeleportLocation, example "/13.9828,-10.5277,0.0609192/0,0.460983,0,0.887409"
//          2. Optional: add marketplaceID of the item to verify
//          3. Optional (can update while script is running): each username to add to whitelist
//     2. Add approved users to APPROVED_USERNAMES below
//     3. Add script to zone entity
//     4. Update userData at anytime to add more to your whitelist
// 
// Add this to the zone userData : 
// {
//     "whitelist" : {
//         "rejectTeleportLocation" : <<INSERT HIFI ADDRESS>>
//         "marketplaceID" : <<INSERT MARKETPLACE ITEM ID>>,
//         "usernames" : []
//     },
//    "grabbableKey": {
//       "grabbable": false
//     }
// }
//
// whitelist - (required) contains variables for the zone
//     rejectTeleportLocation - (required) rejected avatars are sent to these domain coordinates
//     marketplaceID - (optional) marketplace item id for marketplace item verification
//     usernames - (optional) array for usernames to be added while script is running
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* globals Entities, Wallet, Window, AccountServices */

(function () {

    // username lookup variables
    var APPROVED_USERNAMES = ["philip", "ryan", "alan_"]; // hardcoded
    var whitelist = []; // stores lowercase usernames from APPROVED_USERNAMES

    // usernames inside userData
    var CHECK_USERDATA_INTERVAL = 5000; // updates usernames on userData every 5 seconds
    var _usernames; // userData names
    var checkUserDataInterval;
    
    
    // marketplace lookup variables
    var WEARABLE_SEARCH_RADIUS = 10;
    var foundValidTestable = false;
    var _foundEntityID = -1;
    var _passMarketplaceID;
    var _userDataProperties;
    var _backupLocation;
    
    var _entityID;
    var LOAD_TIME = 50;
    var DEBUG = false;

    var marketplaceItem = {
        verificationSuccess: function (entityID) {
            if (DEBUG) {
                print("You may enter - verification passed for entity: " + entityID);
            }
            Wallet.ownershipVerificationSuccess.disconnect(this.verificationSuccess);
            Wallet.ownershipVerificationFailed.disconnect(this.verificationFailed);
        },
        verificationFailed: function (entityID) {
            if (DEBUG) {
                print("You may not enter - verification failed for entity: " + entityID);
            }
            rejectTeleportAvatar();
            Wallet.ownershipVerificationSuccess.disconnect(this.verificationSuccess);
            Wallet.ownershipVerificationFailed.disconnect(this.verificationFailed);
        },
        verifyAvatarOwnership: function (entityID) {
            Wallet.proveAvatarEntityOwnershipVerification(entityID);
        },
        searchForMatchingItem: function () {
            Entities.findEntitiesByType('Model', MyAvatar.position, WEARABLE_SEARCH_RADIUS).forEach(function (entityID) {
                var properties = Entities.getEntityProperties(entityID, ['marketplaceID', 'certificateID', 'parentID']);
                if (properties.marketplaceID === _passMarketplaceID && properties.parentID === MyAvatar.sessionUUID) {
                    _foundEntityID = entityID;
                    foundValidTestable = true;
                    this.verifyAvatarOwnership(_foundEntityID);
                    Wallet.ownershipVerificationSuccess.connect(this.verificationSuccess);
                    Wallet.ownershipVerificationFailed.connect(this.verificationFailed);
                }
            });
            if (!foundValidTestable) {
                rejectTeleportAvatar();
            }
        }
    };

    var avatarUserName = {
        isOnWhitelist: function () {
            var username = AccountServices.username.toLowerCase();
            if (whitelist.indexOf(username) >= 0) {
                if (DEBUG) {
                    print("Username is on hardcoded whitelist");
                }
                return true;
            } else {
                return false;
            }
        },
        isInUserData: function () {
            var username = AccountServices.username;
            if (_usernames.indexOf(username) >= 0) {
                if (DEBUG) {
                    print("Username is on userData whitelist");
                }
                return true;
            } else {
                return false;
            }
        }
    };

    var updateUserData = function () {
        try {
            _userDataProperties = JSON.parse(Entities.getEntityProperties(_entityID, 'userData').userData);
        } catch (err) {
            console.error("Error parsing userData: ", err);
        }
    };

    var rejectTeleportAvatar = function () {
        print("REJECTED", _backupLocation);
        Window.location.handleLookupString(_backupLocation);
    };

    var update = function (dt) {
        updateUserData();
        _usernames = _userDataProperties.whitelist && _userDataProperties.whitelist.usernames || [];
    };

    var ProtectedZone = function () {

    };

    ProtectedZone.prototype = {

        preload: function (entityID) {
            _entityID = entityID;

            updateUserData();

            Script.setTimeout(function () {
                if (_userDataProperties.whitelist) {
    
                    _passMarketplaceID = _userDataProperties.whitelist.marketplaceID || "";
                    _backupLocation = _userDataProperties.whitelist.rejectTeleportLocation;
                    _usernames = _userDataProperties.whitelist.usernames || [];
    
                }
            }, LOAD_TIME);

            if (APPROVED_USERNAMES.length > 0) {
                APPROVED_USERNAMES.forEach(function (username) {
                    whitelist.push(username.toLowerCase());
                });
            }

            checkUserDataInterval = Script.setInterval(function() {
                update();
            }, CHECK_USERDATA_INTERVAL);

        },
        enterEntity: function () {
            
            var isOnWhitelist = avatarUserName.isOnWhitelist();
            var isInUserData = avatarUserName.isInUserData();
            
            if (isOnWhitelist || isInUserData) {
                // do nothing
            } else {
                // did not pass username tests
                if (_passMarketplaceID) {
                    // if marketplaceID exists look for item
                    foundValidTestable = false;
                    marketplaceItem.searchForMatchingItem(); // will reject within function
                } else {
                    // otherwise reject avatar
                    rejectTeleportAvatar();
                }
            }

        },
        unload: function () {
            if (checkUserDataInterval) {
                Script.clearInterval(checkUserDataInterval);
            }
        }
    };

    return new ProtectedZone();

});
