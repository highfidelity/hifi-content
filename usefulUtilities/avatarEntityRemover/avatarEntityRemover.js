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
        "Grifftech", "zfox"];
    var removedAvatarEntityProperties = [];
    var enableAvatarEntityRestore = false;


    function maybeSaveThenDelete(entityID) {
        if (enableAvatarEntityRestore) {
            var props = Entities.getEntityProperties(entityID);
            removedAvatarEntityProperties.push(props);
        }

        Entities.deleteEntity(entityID);
    }


    function onAddingEntity(entityID) {
        if (APPROVED_USERNAMES.indexOf(AccountServices.username) > -1) {
            return;
        }

        var props = Entities.getEntityProperties(entityID, ['avatarEntity', 'entityHostType']);
        if (props.avatarEntity || props.entityHostType === "avatar") {
            maybeSaveThenDelete(entityID);
        }
    }


    function removeAllCurrentAvatarEntities() {
        if (APPROVED_USERNAMES.indexOf(AccountServices.username) > -1) {
            return;
        }

        MyAvatar.getAvatarEntitiesVariant().forEach(function(avatarEntity) {
            maybeSaveThenDelete(avatarEntity.id);
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
            }

            Entities.addingEntity.connect(onAddingEntity);
            removeAllCurrentAvatarEntities();
        },

        unload: function() {
            Entities.addingEntity.disconnect(onAddingEntity);

            if (enableAvatarEntityRestore) {
                removedAvatarEntityProperties.forEach(function(props) {
                    Entities.addEntity(props, "avatar");
                });

                removedAvatarEntityProperties = [];
            }
        }
    };

    return new AvatarEntityRemover();
});
