//
//  ZoneScript.js
//
//  This script serves as a virtual bouncer depending on username or whether or not a client can validate
//  ownership of a particular specified avatar entity. Can one or all three methods: hardcoded list in APPROVED_USERNAMES,
//  inside entity userData username list, and/or verifying an wearable marketplace entity through it's ID. 
//
//  Copyright 2017 High Fidelity, Inc.
//
//  Set Up: 
//     1. Add below userData object to zone entity userData
//          1. Fill in rejectTeleportLocation, example "/13.9828,-10.5277,0.0609192/0,0.460983,0,0.887409"
//          2. Optional: add marketplaceID of the item to verify
//          3. Optional: (can update while script is running): each username to add to whitelist
//     2. Add approved users to APPROVED_USERNAMES below, keep blank if not using
//     3. Add script to zone entity
//     4. Update userData at anytime to add more to usernames your whitelist
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
    var AVATARCHECK_DURATION = 5000;
    var AVATARCHECK_INTERVAL = 500;
    var MAX_CHECKS = Math.ceil(AVATARCHECK_DURATION / AVATARCHECK_INTERVAL);
    var avatarInsideCheckInterval;
    var avatarCheckStep = 0;
    var HALF = 0.5;
    var DEBUG = true;

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
            utils.rejectTeleportAvatar();
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
                utils.rejectTeleportAvatar();
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

    var utils = {

        updateUserData: function () {
            try {
                _userDataProperties = JSON.parse(Entities.getEntityProperties(_entityID, 'userData').userData);
            } catch (err) {
                console.error("Error parsing userData: ", err);
            }
        },

        stopAvatarInsideCheckInterval: function () {
            if (avatarInsideCheckInterval) {
                Script.clearInterval(avatarInsideCheckInterval);
                avatarInsideCheckInterval = null;
            }
        },

        rejectTeleportAvatar: function () {
            if (DEBUG) {
                print("Rejected from zone to: ", _backupLocation);
            }
            Window.location.handleLookupString(_backupLocation);
        },

        update: function (dt) {
            this.updateUserData();
            _usernames = _userDataProperties.whitelist && _userDataProperties.whitelist.usernames || [];
        },

        largestAxisVec: function (dimensions) {
            var max = Math.max(dimensions.x, dimensions.y, dimensions.z);
            return max;
        },

        isInEntity: function () {
            var properties = Entities.getEntityProperties(_entityID, ["position", "dimensions", "rotation"]);
            var position = properties.position;
            var dimensions = properties.dimensions;
            
            var avatarPosition = MyAvatar.position;
            var worldOffset = Vec3.subtract(avatarPosition, position);

            avatarPosition = Vec3.multiplyQbyV(Quat.inverse(properties.rotation), worldOffset);

            var minX = 0 - dimensions.x * HALF;
            var maxX = 0 + dimensions.x * HALF;
            var minY = 0 - dimensions.y * HALF;
            var maxY = 0 + dimensions.y * HALF;
            var minZ = 0 - dimensions.z * HALF;
            var maxZ = 0 + dimensions.z * HALF;

            if (avatarPosition.x >= minX && avatarPosition.x <= maxX
                && avatarPosition.y >= minY && avatarPosition.y <= maxY
                && avatarPosition.z >= minZ && avatarPosition.z <= maxZ) {
                
                if (DEBUG) {
                    print("Avatar is inside zone");
                }
                return true;

            } else {

                if (DEBUG) {
                    print("Avatar is NOT in zone");
                }
                return false;
            }
        }

    };

    var ProtectedZone = function () {

    };

    ProtectedZone.prototype = {

        preload: function (entityID) {
            _entityID = entityID;
            var _this = this;

            utils.updateUserData();

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
                utils.update();
            }, CHECK_USERDATA_INTERVAL);

            avatarInsideCheckInterval = Script.setInterval(function() {
                var properties = Entities.getEntityProperties(_entityID, ["position", "dimensions"]);
                avatarCheckStep++;
                var largestDimension = utils.largestAxisVec(properties.dimensions);
                var avatarsInRange = AvatarList.getAvatarsInRange(properties.position, largestDimension).filter(function(id) {
                    return id === MyAvatar.sessionUUID;
                });

                if (avatarsInRange.length > 0) {
                    if (DEBUG) {
                        print("Found avatar near zone: ", avatarCheckStep);
                    }

                    // do isInZone check
                    if (utils.isInEntity()) {
                        _this.enterEntity();
                        utils.stopAvatarInsideCheckInterval();
                    }
                }

                if (avatarCheckStep >= MAX_CHECKS) {
                    utils.stopAvatarInsideCheckInterval();
                    return;
                }

            }, AVATARCHECK_INTERVAL);

        },
        enterEntity: function () {
            
            var isInUserData = avatarUserName.isInUserData();
            
            if (isInUserData || (APPROVED_USERNAMES.length > 0 && avatarUserName.isOnWhitelist())) {
                // do nothing
            } else {
                // did not pass username tests
                if (_passMarketplaceID) {
                    // if marketplaceID exists look for item
                    foundValidTestable = false;
                    marketplaceItem.searchForMatchingItem(); // will reject within function
                } else {
                    // otherwise reject avatar
                    utils.rejectTeleportAvatar();
                }
            }

        },
        unload: function () {
            if (checkUserDataInterval) {
                Script.clearInterval(checkUserDataInterval);
            }

            utils.stopAvatarInsideCheckInterval();
        }
    };

    return new ProtectedZone();

});
