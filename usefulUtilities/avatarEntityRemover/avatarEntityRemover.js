//
//  avatarEntityRemover.js
//
//  Created by Zach Fox on 2019-03-15
//  Copyright 2019 High Fidelity, Inc.
//
//  See accompanying README.md for usage instructions.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function () {
    var approvedUsernames = [];
    var removedAvatarEntityProperties = [];
    var enableAvatarEntityRestore = false;
    var kickDomain = "hifi://domain";
    var enableCollisionlessAvatarEntities = false;
    var tryAgainDeleteInterval = false;
    var TRY_DELETE_AGAIN_MS = 1000;


    // Saves an entity's properties if the configuration options are set to enable that feature,
    // then deletes the entity
    function maybeSaveThenDelete(entityID, properties) {
        if (enableAvatarEntityRestore) {
            removedAvatarEntityProperties.push(properties);
        }

        // This will do nothing unless the user has lock/unlock rights
        Entities.editEntity(entityID, {"locked": false});

        Entities.editEntity(entityID, {"dimensions": {"x": 0.01, "y": 0.01, "z": 0.01}});
        Entities.deleteEntity(entityID);
    }


    // Gets called when the script runner adds an entity to their entity tree.
    // 1. Checks if the user is approved to add avatar entities, and stops execution if they are
    // 2. Gets some properties of the added entity
    // 3. If the added avatar entity is locked, kicks the user to a different domain
    // 4. If the added avatar entity is unlocked,
    //     depending on certain entity properties, keeps or deletes the entity.
    function onAddingEntity(entityID) {
        if (approvedUsernames.indexOf(AccountServices.username) > -1) {
            return;
        }

        var props = Entities.getEntityProperties(entityID, ['avatarEntity', 'entityHostType', 'locked', 'owningAvatarID', 'collisionless']);
        
        if (props.owningAvatarID === MyAvatar.sessionUUID && (props.avatarEntity || props.entityHostType === "avatar")) {
            if (enableCollisionlessAvatarEntities && props.collisionless) {
                return;
            }

            if (props.locked) {
                console.log("Boot Code 00000002");
                Window.location = kickDomain;
                return;
            }

            // This will do nothing unless the user has lock/unlock rights
            Entities.editEntity(entityID, {locked: false});

            Entities.editEntity(entityID, {"dimensions": {"x": 0.01, "y": 0.01, "z": 0.01}});
            Entities.deleteEntity(entityID);
        }
    }


    // Gets called on a short interval. If the user isn't approved to add avatar entities,
    // removes all avatar entities (unless the script is configured to allow collisionless avatar entities
    // and the avatar entity is collisionless).
    function maybeRemoveAllCurrentAvatarEntities() {
        if (approvedUsernames.indexOf(AccountServices.username) > -1) {
            return;
        }

        MyAvatar.getAvatarEntitiesVariant().forEach(function(avatarEntity) {
            if (enableCollisionlessAvatarEntities && avatarEntity.properties.collisionless) {
                return;
            }

            Entities.deleteEntity(avatarEntity.id);
        });
    }


    // Gets called on script startup. If the user isn't approved to add avatar entities,
    // calls `maybeSaveThenDelete()`. If the user is wearing any locked avatar entities,
    // they'll get kicked to a different domain.
    function maybeSaveThenRemoveAllCurrentAvatarEntities() {
        if (approvedUsernames.indexOf(AccountServices.username) > -1) {
            return;
        }

        MyAvatar.getAvatarEntitiesVariant().forEach(function(avatarEntity) {
            if (avatarEntity.properties.locked) {
                console.log("Boot Code 00000001");
                Window.location = kickDomain;
                return;
            }

            if (enableCollisionlessAvatarEntities && avatarEntity.properties.collisionless) {
                return;
            }

            maybeSaveThenDelete(avatarEntity.id, avatarEntity.properties);
        });
    }
    

    var AvatarEntityRemover = function() {};

    AvatarEntityRemover.prototype = {
        // On script startup, sets configuration options from `userData` and starts main script logic
        preload: function (id) {
            var properties = Entities.getEntityProperties(id, ["userData"]);
            var userData;

            try {
                userData = JSON.parse(properties.userData);
            } catch (e) {
                console.error("Error parsing userData: ", e);
            }

            if (userData) {
                if (userData.enableAvatarEntityRestore) {
                    enableAvatarEntityRestore = userData.enableAvatarEntityRestore;
                }

                if (userData.kickDomain) {
                    kickDomain = userData.kickDomain;
                }

                if (userData.enableCollisionlessAvatarEntities) {
                    enableCollisionlessAvatarEntities = userData.enableCollisionlessAvatarEntities;
                }

                if (userData.configURL) {
                    var configURL = userData.configURL;
                    // Cachebusting attempt
                    if (configURL.indexOf("?") === -1) {
                        configURL = configURL + "?" + Date.now();
                    }
                    approvedUsernames = Script.require(Script.resolvePath(configURL)).approvedUsernames;
                }
            }

            Entities.addingEntity.connect(onAddingEntity);
            maybeSaveThenRemoveAllCurrentAvatarEntities();
            tryAgainDeleteInterval = Script.setInterval(maybeRemoveAllCurrentAvatarEntities, TRY_DELETE_AGAIN_MS);
        },

        // Disconnects signals, stops timers, and, if enabled as a configuration option, restores the avatar entities
        // that this script deleted
        unload: function() {
            Entities.addingEntity.disconnect(onAddingEntity);

            if (enableAvatarEntityRestore) {
                removedAvatarEntityProperties.forEach(function(props) {
                    Entities.addEntity(props, "avatar");
                });
            }

            if (tryAgainDeleteInterval) {
                Script.clearInterval(tryAgainDeleteInterval);
                tryAgainDeleteInterval = false;
            }
        }
    };

    return new AvatarEntityRemover();
});
