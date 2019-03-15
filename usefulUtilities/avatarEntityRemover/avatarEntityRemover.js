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
    var APPROVED_USERNAMES = ["Whyroc", "Judas", "Monoglu", "Spade_", "Red_SIM",
        "ultranique", "Lyra121", "project8vr", "DragonSMP", "123.Basinsky.321",
        "SUP3RFlyN1NJA", "Koala", "bon3s", "Aimily", "Saracen", "Silverfish",
        "Snow", "ASingleGiggle", "XaosPrincess", "krougeau", "CornyNachos",
        "bigtin", "Octuplex", "Dalek", "MMMaellon", "Dalus", "Scena", "Lathe",
        "vegaslon", "Xeverian", "VardVR", "1029chris", "Menithal", "Virtual_Origin",
        "Grifftech", "zfox", "scobot", "prophecy288"];
    var removedAvatarEntityProperties = [];
    var enableAvatarEntityRestore = false;
    var kickDomain = "hifi://domain";
    var tryAgainDeleteInterval = false;
    var TRY_DELETE_AGAIN_MS = 1000;


    function maybeSaveThenDelete(entityID, properties) {
        if (enableAvatarEntityRestore) {
            removedAvatarEntityProperties.push(properties);
        }

        // This will do nothing unless the user has lock/unlock rights
        Entities.editEntity(entityID, {"locked": false});

        Entities.editEntity(entityID, {"dimensions": {"x": 0.01, "y": 0.01, "z": 0.01}});
        Entities.deleteEntity(entityID);
    }


    function onAddingEntity(entityID) {
        if (APPROVED_USERNAMES.indexOf(AccountServices.username) > -1) {
            return;
        }

        var props = Entities.getEntityProperties(entityID, ['avatarEntity', 'entityHostType', 'locked', 'owningAvatarID']);

        if (props.owningAvatarID === MyAvatar.sessionUUID && (props.avatarEntity || props.entityHostType === "avatar")) {
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


    function maybeRemoveAllCurrentAvatarEntities() {
        if (APPROVED_USERNAMES.indexOf(AccountServices.username) > -1) {
            return;
        }

        MyAvatar.getAvatarEntitiesVariant().forEach(function(avatarEntity) {
            Entities.deleteEntity(avatarEntity.id);
        });
    }


    function maybeSaveThenRemoveAllCurrentAvatarEntities() {
        if (APPROVED_USERNAMES.indexOf(AccountServices.username) > -1) {
            return;
        }

        MyAvatar.getAvatarEntitiesVariant().forEach(function(avatarEntity) {
            if (avatarEntity.properties.locked) {
                console.log("Boot Code 00000001");
                Window.location = kickDomain;
                return;
            }

            maybeSaveThenDelete(avatarEntity.id, avatarEntity.properties);
        });
    }
    

    var AvatarEntityRemover = function() {};

    AvatarEntityRemover.prototype = {
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
            }

            Entities.addingEntity.connect(onAddingEntity);
            maybeSaveThenRemoveAllCurrentAvatarEntities();
            tryAgainDeleteInterval = Script.setInterval(maybeRemoveAllCurrentAvatarEntities, TRY_DELETE_AGAIN_MS);
        },

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
