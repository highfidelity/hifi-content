//
//  wearableServer.js
//
//  Creates invisible clones to be used so people can attach entities without rez rights
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var REMOVED_FROM_PARENT_CHANNEL_BASE = "AvatarStoreRemovedFromParent";
    var CLONE_LIFETIME = 300;
    var UPDATE_INTERVAL = 10000;

    var removedFromParentChannel;

    var removedFromParentHandler;
    var spawnMoreChildren;
    var properties;
    var newEntityProperties;

    var Wearable = function() {

    };

    Wearable.prototype = {
        remotelyCallable: ['spawnNewEntity'],
        preload: function(entityID){
            properties = Entities.getEntityProperties(entityID, ['dimensions', 'userData', 'modelURL']);
            removedFromParentChannel = REMOVED_FROM_PARENT_CHANNEL_BASE + entityID;
            Messages.subscribe(removedFromParentChannel);
            newEntityProperties = {
                type: 'Model',
                dimensions: properties.dimensions,
                userData: properties.userData,
                parentID: entityID,
                modelURL : properties.modelURL,
                script: Script.resolvePath("attachmentItemScript.js"),
                lifetime: CLONE_LIFETIME,
                visible: false,
                shapeType: "box",

                collidesWith: "dynamic,"

            };
            removedFromParentHandler = function(channel, data, sender) {
                if (channel === removedFromParentChannel) {
                    Entities.addEntity(newEntityProperties);
                }    
            };
            Messages.messageReceived.connect(removedFromParentHandler);
            spawnMoreChildren = Script.setInterval(function() {
                if (Entities.getChildrenIDs(entityID).length === 0) {
                    Entities.addEntity(newEntityProperties);
                }
            }, UPDATE_INTERVAL);
        },
        /**
         * Remotely callable spawnNewEntity function
         * @param entityID current entity ID
         * @param param parameters (expected to be empty)
         */
        spawnNewEntity: function(entityID, params) {
            Entities.addEntity(newEntityProperties);
        },
        unload: function() {
            Messages.messageReceived.disconnect(removedFromParentHandler);
            Script.clearInterval(spawnMoreChildren);
        }
    };
    return new Wearable();
});