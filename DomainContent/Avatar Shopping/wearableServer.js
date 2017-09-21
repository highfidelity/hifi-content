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
    var messageChannel;

    var messageHandler;
    var spawnMoreChildren;
    var properties; 

    // var availableToWear = []; 

    var Wearable = function() {

    };
    Wearable.prototype = {

        preload: function(entityID){
            properties = Entities.getEntityProperties(entityID);    
            print(JSON.stringify(Entities.getEntityProperties(entityID).userData));
            messageChannel = MESSAGE_CHANNEL_BASE + entityID;
            print("Listening on channel: " + messageChannel);
            Messages.subscribe(messageChannel);
            var newEntityProperties = {
                type: 'Model',
                dimensions: properties.dimensions,
                userData: properties.userData,
                parentID: entityID,
                modelURL : properties.modelURL,
                script: Script.resolvePath("attachmentItemScript_experimental.js?v3"),
                lifetime: 300
            };

            messageHandler = Messages.messageReceived.connect(function(channel, data, sender) {
                print("wearableServer.js received a message on channel: " + channel + " : " + data);
                if (channel === messageChannel) {
                    print("Creating replacement entity");
                    Entities.addEntity(newEntityProperties);   
                }    
            });
            spawnMoreChildren = Script.setInterval(function() {
                print(JSON.stringify(Entities.getChildrenIDs(entityID)));
                if (Entities.getChildrenIDs(entityID).length === 0) {
                    Entities.addEntity(newEntityProperties);            
                }
            }, 1000);
        },
        unload: function() {
            Script.clearInterval(spawnMoreChildren);
        }
    };
    return new Wearable();
});
