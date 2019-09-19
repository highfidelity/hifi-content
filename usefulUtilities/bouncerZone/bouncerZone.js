//
//  ZoneScript.js
//
//  This script serves as a virtual bouncer depending on username, admin status, and whether or not a client can validate
//  ownership of a particular specified avatar entity. 
//
//  Copyright 2019 High Fidelity, Inc.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* globals Entities, WalletScriptingInterface, Window, AccountServices */

(function () {

    // Enable this for debug prints in client logs.
    var DEBUG = false;

    var DEFAULT_USER_DATA = {
        "rejectTeleportLocation" : "/0,0,0/0,0,0,0",
        "whitelist" : {
            "allowAdmins": false,
            "marketplaceID": null,
            "usernames" : [""]
        },
        "bounceSound": {
            "bounceSoundURL": null,
            "bounceSoundVolume": 1
        }
    };

    // #region USERDATA VARIABLES

    // Dynamically approved usernames
    var userDataUsernameWhitelist;
    // Boolean to determine if all admins are allowed. Admins are defined as users with lock/unlock privileges.
    var allowAdmins;
    // Used when verifying ownership of a "ticket" wearable.
    var ticketMarketplaceID;
    // Used when teleporting users outside the bouncer zone.
    var rejectionLocation;
    // Downloaded sound object of sound to play if user gets bounced
    var downloadedBounceSound;
    // Volume, 0-1, to play bounce sound
    var bounceSoundVolume;

    // #endregion USERDATA VARIABLES
    
    // #region UTILITIES

    /* PLAY A SOUND: Plays a sound at the specified position, volume, local mode, and playback 
        mode requested. */
    var injector;
    function playSound(sound, volume, position, localOnly, loop) {
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
                injector = null;
            }
            injector = Audio.playSound(sound, {
                position: position,
                volume: volume,
                localOnly: localOnly,
                loop: loop
            });
        }
    }

    // #endregion UTILITIES

    // The handler for the `WalletScriptingInterface.ownershipVerificationSuccess` signal.
    function ticketVerificationSuccess(entityID) {
        // We don't care about entities that we didn't want to verify
        if (entityID !== potentialTicketEntityID) {
            return;
        }

        if (DEBUG) {
            print("You MAY enter - verification passed for entity: " + entityID);
        }
        if (signalsConnected) {
            WalletScriptingInterface.ownershipVerificationSuccess.disconnect(ticketVerificationSuccess);
            WalletScriptingInterface.ownershipVerificationFailed.disconnect(ticketVerificationFailed);
        }
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
        if (signalsConnected) {
            WalletScriptingInterface.ownershipVerificationSuccess.disconnect(ticketVerificationSuccess);
            WalletScriptingInterface.ownershipVerificationFailed.disconnect(ticketVerificationFailed);
        }
        bounceAvatarFromZone();
    }

    // Searches around MyAvatar for a wearable whose marketplaceID matches ticketMarketplaceID.
    var WEARABLE_SEARCH_RADIUS = 10;
    var potentialTicketEntityID;
    var signalsConnected = false;
    function userHasTicketWearable() {
        var currentAvatarWearableIDs = Entities.findEntitiesByType('Model', MyAvatar.position, WEARABLE_SEARCH_RADIUS);

        for (var i = 0; i < currentAvatarWearableIDs.length; i++) {
            var properties = Entities.getEntityProperties(currentAvatarWearableIDs[i],
                ['marketplaceID', 'certificateID', 'parentID']);
            if (properties.marketplaceID === ticketMarketplaceID && properties.parentID === MyAvatar.sessionUUID) {
                if (!signalsConnected) {
                    WalletScriptingInterface.ownershipVerificationSuccess.connect(ticketVerificationSuccess);
                    WalletScriptingInterface.ownershipVerificationFailed.connect(ticketVerificationFailed);
                    signalsConnected = true;
                }
                potentialTicketEntityID = currentAvatarWearableIDs[i];
                WalletScriptingInterface.proveAvatarEntityOwnershipVerification(currentAvatarWearableIDs[i]);
                return true;
            }
        }
        
        return false;
    }

    // Updates some internal variables based on the current userData property of the attached zone entity.
    function updateParametersFromUserData() {
        var userDataProperty = DEFAULT_USER_DATA;

        try {
            userDataProperty = JSON.parse(Entities.getEntityProperties(_entityID, 'userData').userData);
        } catch (err) {
            console.error("Error parsing userData: ", err);
        }

        rejectionLocation = userDataProperty.rejectTeleportLocation || DEFAULT_USER_DATA.rejectTeleportLocation;
        ticketMarketplaceID = userDataProperty.whitelist && userDataProperty.whitelist.marketplaceID || 
            DEFAULT_USER_DATA.whitelist.marketplaceID;
        userDataUsernameWhitelist = userDataProperty.whitelist && userDataProperty.whitelist.usernames || 
            DEFAULT_USER_DATA.whitelist.usernames;
        allowAdmins = userDataProperty.whitelist && userDataProperty.whitelist.allowAdmins || 
            DEFAULT_USER_DATA.whitelist.allowAdmins;
        var bounceSoundURL = userDataProperty.bounceSound && userDataProperty.bounceSound.bounceSoundURL || 
            DEFAULT_USER_DATA.bounceSound.bounceSoundURL;
        if (userDataProperty.bounceSound && (typeof userDataProperty.bounceSound.bounceSoundVolume === "number")) {
            bounceSoundVolume = Math.max(0, userDataProperty.bounceSound.bounceSoundVolume);
        } else {
            bounceSoundVolume = DEFAULT_USER_DATA.bounceSound.bounceSoundVolume;
        }
        downloadedBounceSound = bounceSoundURL && SoundCache.getSound(bounceSoundURL) || null;
    }

    // Moves my avatar to `rejectionLocation`
    function bounceAvatarFromZone() {
        if (DEBUG) {
            print("Rejected from zone to: ", rejectionLocation);
        }
        if (downloadedBounceSound) {
            playSound(downloadedBounceSound, bounceSoundVolume, MyAvatar.position, true, false);
        }
        Window.location = rejectionLocation;
    }

    var _entityID; // The Bouncer Zone entity ID.
    var LOAD_TIME_MS = 50; // A small delay to ensure that all internal variables are loaded from userData.
    var _this = this;


    // save this zone ID
    _this.preload = function(entityID) {
        _entityID = entityID;
    },

    // Performs the various bouncer checks to determine whether to do nothing
    // or bounce an avatar from the Bouncer Zone
    _this.performBouncerChecks = function() {
        // Determines whether or not my username is on the whitelist populated by userData.
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
            
        if (!isOnUserDataUsernameWhitelist() && !(allowAdmins && Entities.canAdjustLocks()) && 
            !(ticketMarketplaceID && userHasTicketWearable())) {
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
        if (DEBUG) {
            print("YOU'RE IN THE ZONE!");
        }
        _this.updateParametersThenPerformChecks();
    };

    // disconnect signals if necessary
    _this.unload = function() {
        if (signalsConnected) {
            WalletScriptingInterface.ownershipVerificationSuccess.disconnect(ticketVerificationSuccess);
            WalletScriptingInterface.ownershipVerificationFailed.disconnect(ticketVerificationFailed);
        }
    };
});
