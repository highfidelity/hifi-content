//
//  lockedAvatarEntityRemover.js
//
//  Created by Zach Fox on 2019-03-15
//  Copyright 2019 High Fidelity, Inc.
//
//  See accompanying README.md for usage instructions.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function () {
    var tryAgainDeleteInterval = false;
    var TRY_DELETE_AGAIN_MS = 1000;
    var DELETE_INTERVAL_MS = 5000;
    var cleanUserDomain = false;
    var neverMoveUsers = [];

    // Removes all avatar entities forcibly, including locked avatar entities.
    // The user must have lock/unlock permissions in the domain in which the client runs the script.
    // After forcible avatar entity removal, the user is moved to a configurable location
    // (unless their username is on a configurable list).
    function removeAllAvatarEntities() {
        var avatarEntityCount = 0;
        var lockedCount = 0;
        MyAvatar.getAvatarEntitiesVariant().forEach(function(avatarEntity) {
            avatarEntityCount++;

            if (avatarEntity.properties.locked) {
                lockedCount++;
                console.log("Locked Avatar Entity Name: " + avatarEntity.properties.name);

                if (Entities.canAdjustLocks()) {
                    console.log("Attempting to unlock then delete locked avatar entity... ");
                    Entities.editEntity(avatarEntity.id, {"locked": false});
                    Entities.deleteEntity(avatarEntity.id);

                    Script.setTimeout(function() {
                        console.log("After timeout, attempting to delete previously-locked avatar entity again... ");
                        Entities.deleteEntity(avatarEntity.id);
                    }, TRY_DELETE_AGAIN_MS);
                } else {
                    console.log("You are wearing a locked avatar entity," +
                        " but you do not have permissions to unlock it. Domain owner: Put this script on a domain " +
                        "in which all users have lock/unlock rights.");
                }
            } else {
                console.log("Unlocked Avatar Entity Name: " + avatarEntity.properties.name);
                Entities.deleteEntity(avatarEntity.id);
            }
        });
        console.log("You WERE wearing " + avatarEntityCount + " avatar entities, " + lockedCount + " of which were locked.");

        if (avatarEntityCount === 0 && cleanUserDomain && neverMoveUsers.indexOf(AccountServices.username) === -1) {
            console.log("You are clean now. Sending you to " + cleanUserDomain + "...");
            Window.location = cleanUserDomain;
        }
    }
    

    var LockedAvatarEntityRemover = function() {};

    LockedAvatarEntityRemover.prototype = {
        // Sets up some configuration options based on `userData`, then kicks off the
        // main removal interval.
        preload: function (id) {
            var properties = Entities.getEntityProperties(id, ["userData"]);
            var userData;

            try {
                userData = JSON.parse(properties.userData);
            } catch (e) {
                console.error("Error parsing userData: ", e);
            }

            if (userData) {
                if (userData.cleanUserDomain) {
                    cleanUserDomain = userData.cleanUserDomain;
                }

                if (userData.neverMoveUsers) {
                    neverMoveUsers = userData.neverMoveUsers;
                }
            }

            removeAllAvatarEntities();
            tryAgainDeleteInterval = Script.setInterval(removeAllAvatarEntities, DELETE_INTERVAL_MS);
        },

        // Clears the main removal interval
        unload: function() {
            if (tryAgainDeleteInterval) {
                Script.clearInterval(tryAgainDeleteInterval);
                tryAgainDeleteInterval = false;
            }
        }
    };

    return new LockedAvatarEntityRemover();
});
