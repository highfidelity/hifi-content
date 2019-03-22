//
//  bouncerZone.js
//
//  This script serves as a virtual bouncer depending on username or whether or not a client can validate
//  ownership of a particular specified avatar entity. Can one or all three methods: hardcoded list in APPROVED_USERNAMES,
//  inside entity userData username list, and/or verifying an wearable marketplace entity through it's ID. 
//
//  Copyright 2019 High Fidelity, Inc.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* globals Entities, WalletScriptingInterface, Window, AccountServices */

(function () {
    // Hardcoded approved usernames
    var APPROVED_USERNAMES = ["philip"];
    // Dynamically approved usernames
    var userDataUsernameWhitelist;

    // Used when verifying ownership of a "ticket" wearable.
    // Set in zone entity's userData.
    var ticketMarketplaceID = "";
    
    // Used when teleporting users outside the bouncer zone.
    // Set in userData
    var rejectionLocation;
    
    // Enable this for debug prints in client logs.
    var DEBUG = false;

    // The handler for the `WalletScriptingInterface.ownershipVerificationSuccess` signal.
    function ticketVerificationSuccess(entityID) {
        // We don't care about entities that we didn't want to verify
        if (entityID !== potentialTicketEntityID) {
            return;
        }

        if (DEBUG) {
            print("You MAY enter - verification passed for entity: " + entityID);
        }
        WalletScriptingInterface.ownershipVerificationSuccess.disconnect(ticketVerificationSuccess);
        WalletScriptingInterface.ownershipVerificationFailed.disconnect(ticketVerificationFailed);
    }

    // The handler for the `WalletScriptingInterface.ownershipVerificationFailed` signal.
    // Will bounce avatars from the Bouncer Zone if the entity that failed verification
    // is the one we care about.
    function ticketVerificationFailed(entityID) {
        // We don't care about entities that we didn't want to verify
        if (entityID !== potentialTicketEntityID) {
            return;
        }

        if (DEBUG) {
            print("You MAY NOT enter - verification failed for entity: " + entityID);
        }
        WalletScriptingInterface.ownershipVerificationSuccess.disconnect(ticketVerificationSuccess);
        WalletScriptingInterface.ownershipVerificationFailed.disconnect(ticketVerificationFailed);

        bounceAvatarFromZone();
    }

    // Searches around MyAvatar for a wearable whose marketplaceID matches ticketMarketplaceID.
    var WEARABLE_SEARCH_RADIUS = 10;
    var potentialTicketEntityID;
    function searchForTicketWearable() {
        potentialTicketEntityID = "";
        var currentAvatarWearableIDs = Entities.findEntitiesByType('Model', MyAvatar.position, WEARABLE_SEARCH_RADIUS);

        for (var i = 0; i < currentAvatarWearableIDs.length; i++) {
            var properties = Entities.getEntityProperties(currentAvatarWearableIDs[i], 
                ['marketplaceID', 'certificateID', 'parentID']);
            if (properties.marketplaceID === ticketMarketplaceID && properties.parentID === MyAvatar.sessionUUID) {
                WalletScriptingInterface.ownershipVerificationSuccess.connect(ticketVerificationSuccess);
                WalletScriptingInterface.ownershipVerificationFailed.connect(ticketVerificationFailed);
                potentialTicketEntityID = currentAvatarWearableIDs[i];
                WalletScriptingInterface.proveAvatarEntityOwnershipVerification(currentAvatarWearableIDs[i]);
                return;
            }
        }

        bounceAvatarFromZone();
    }

    // Updates some internal variables based on the current userData property of the attached zone entity.
    function updateParametersFromUserData() {
        var userDataProperty = {
            "whitelist" : {
                "rejectTeleportLocation" : "/",
                "marketplaceID" : "",
                "usernames" : [""]
            }
        };

        try {
            userDataProperty = JSON.parse(Entities.getEntityProperties(_entityID, 'userData').userData);
        } catch (err) {
            console.error("Error parsing userData: ", err);
        }

        ticketMarketplaceID = userDataProperty.whitelist.marketplaceID || "";
        rejectionLocation = userDataProperty.whitelist.rejectTeleportLocation;
        userDataUsernameWhitelist = userDataProperty.whitelist && userDataProperty.whitelist.usernames || [];
    }

    // Moves my avatar to `rejectionLocation`
    function bounceAvatarFromZone() {
        if (DEBUG) {
            print("Rejected from zone to: ", rejectionLocation);
        }
        Window.location.handleLookupString(rejectionLocation);
    }

    // Returns true if my avatar is inside the bouncer zone, false otherwise.
    var HALF = 0.5;
    function avatarIsInsideBouncerZone() {
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
                print("Avatar IS inside zone");
            }
            return true;

        } else {
            if (DEBUG) {
                print("Avatar IS NOT in zone");
            }
            return false;
        }
    }


    var _entityID; // The Bouncer Zone entity ID.
    var LOAD_TIME_MS = 50; // A small delay to ensure that all internal variables are loaded from userData.
    var _this = this;


    _this.preload = function(entityID) {
        _entityID = entityID;

        _this.initialBounceCheck();
    },

    // Ensures that every avatar experiences the enterEntity method, even if they were already in the entity
    // when the script started.
    _this.initialBounceCheck = function() {
        function largestAxisVec(dimensions) {
            var max = Math.max(dimensions.x, dimensions.y, dimensions.z);
            return max;
        }
        var properties = Entities.getEntityProperties(_entityID, ["position", "dimensions"]);
        var largestDimension = largestAxisVec(properties.dimensions);
        var avatarsInRange = AvatarList.getAvatarsInRange(properties.position, largestDimension).filter(function(id) {
            return id === MyAvatar.sessionUUID;
        });

        if (avatarsInRange.length > 0) {
            if (DEBUG) {
                print("Found avatar near zone");
            }
            // do isInZone check
            if (avatarIsInsideBouncerZone()) {
                _this.enterEntity();
            }
        }
    },

    // Performs the various bouncer checks to determine whether to do nothing
    // or bounce an avatar from the Bouncer Zone
    _this.performBouncerChecks = function() {
        // Determines whether or not my username is on the whitelist populated
        // by userData.
        function isOnUserDataUsernameWhitelist() {
            var currentUsername = AccountServices.username.toLowerCase();
    
            for (var i = 0; i < userDataUsernameWhitelist.length; i++) {
                if (userDataUsernameWhitelist[i].toLowerCase() === currentUsername) {
                    if (DEBUG) {
                        print("Username is on userData whitelist");
                    }
                    return true;
                }
            }
            return false;
        }

        // Determines whether or not my username is on the whitelist
        // populated at the top of this script. 
        function isOnHardcodedWhitelist() {
            var configWhitelist = Script.require(
                Script.resolvePath("../../config/config.json?" + Date.now())).usersAllowedOnStage;
            var hardcodedWhitelist = APPROVED_USERNAMES.concat(configWhitelist);

            if (hardcodedWhitelist.length === 0) {
                return false;
            }

            var currentUsername = AccountServices.username.toLowerCase();
            var lowerCaseHardcodedUsernames = hardcodedWhitelist.map(function(value) {
                return value.toLowerCase();
            });

            if (lowerCaseHardcodedUsernames.indexOf(currentUsername) >= 0) {
                if (DEBUG) {
                    print("Username is on hardcoded whitelist");
                }
                return true;
            } else {
                return false;
            }
        }
            
        if (isOnUserDataUsernameWhitelist() || isOnHardcodedWhitelist()) {
            // Do nothing; allow the avatar to stay in the Bouncer Zone
        } else if (ticketMarketplaceID !== "") {
            // If ticketMarketplaceID is defined, start by searching my avatar for the ticket wearable
            searchForTicketWearable();
        } else {
            bounceAvatarFromZone();
        }
    },

    // Updates various internal variables from userData, waits a small bit, then performs bouncer checks.
    _this.updateParametersThenPerformChecks = function() {
        updateParametersFromUserData();

        Script.setTimeout(_this.performBouncerChecks, LOAD_TIME_MS);
    },

    // Fires when entering the Bouncer Zone entity
    _this.enterEntity = function() {
        _this.updateParametersThenPerformChecks();
    };
});
