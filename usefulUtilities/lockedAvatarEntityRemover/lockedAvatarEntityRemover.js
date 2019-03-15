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
    }
    

    var LockedAvatarEntityRemover = function() {};

    LockedAvatarEntityRemover.prototype = {
        preload: function (id) {
            removeAllAvatarEntities();
            tryAgainDeleteInterval = Script.setInterval(removeAllAvatarEntities, DELETE_INTERVAL_MS);
        },

        unload: function() {
            if (tryAgainDeleteInterval) {
                Script.clearInterval(tryAgainDeleteInterval);
                tryAgainDeleteInterval = false;
            }
        }
    };

    return new LockedAvatarEntityRemover();
});
