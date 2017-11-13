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
    var MESSAGE_CHANNEL_BASE = "AvatarStoreObject";
    var CLONE_LIFETIME = 300;
    var UPDATE_INTERVAL = 10000;

    var messageChannel;

    var messageHandler;
    var spawnMoreChildren;
    var properties;
    var newEntityProperties;

    var Wearable = function() {

    };

    Wearable.prototype = {
        remotelyCallable: ['spawnNewEntity'],
        preload: function(entityID){
            properties = Entities.getEntityProperties(entityID, ['dimensions', 'userData', 'modelURL']);
            messageChannel = MESSAGE_CHANNEL_BASE + entityID;
            Messages.subscribe(messageChannel);
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
            messageHandler = function(channel, data, sender) {
                if (channel === messageChannel) {
                    Entities.addEntity(newEntityProperties);
                }    
            };
            Messages.messageReceived.connect(messageHandler);
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
            Messages.messageReceived.disconnect(messageHandler);
            Script.clearInterval(spawnMoreChildren);
        }
    };
    return new Wearable();
});