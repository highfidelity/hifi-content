//
//  attachmentZoneServer.js
//
//  Created by Thijs Wenker on 9/20/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var shared = Script.require('./attachmentZoneShared.js');

    var ATTACHMENT_ZONE_CHANNEL_ACTIONS = shared.ATTACHMENT_ZONE_CHANNEL_ACTIONS;

    var _attachmentZoneChannel = null;

    var onMessageReceived = function(channel, message, sender, localOnly) {
        if (channel === _attachmentZoneChannel) {
            var data = JSON.parse(message);
            if (data.action === ATTACHMENT_ZONE_CHANNEL_ACTIONS.CREATE_ATTACHMENT_ENTITY) {
                var avatarEntityID = data.avatarEntityID; // for reference
                var entityProperties = data.entityProperties;

                // EXPERIMENTAL: remove parenting properties from attachment while its being created
                delete entityProperties.localPosition;
                delete entityProperties.localRotation;
                delete entityProperties.parentID;
                delete entityProperties.parentJointIndex;
                delete entityProperties.velocity;

                // EXPERIMENTAL: make object invisible, and have the client make it visible
                entityProperties.visible = false;

                var entityID = Entities.addEntity(entityProperties);

                Messages.sendMessage(_attachmentZoneChannel, JSON.stringify({
                    action: ATTACHMENT_ZONE_CHANNEL_ACTIONS.CREATED_ATTACHMENT_ENTITY,
                    entityID: entityID,
                    avatarEntityID: avatarEntityID,
                    avatarSessionUUID: sender
                }));
            } else if (data.action === ATTACHMENT_ZONE_CHANNEL_ACTIONS.CREATED_ATTACHMENT_ENTITY) {
                // received own sent message, ignore.
                return;
            } else {
                print('Unknown action in message ' + message);
            }
        }
    };

    this.preload = function(entityID) {
        _attachmentZoneChannel = shared.getAttachmentZoneChannel(entityID);
        Messages.subscribe(_attachmentZoneChannel);
        Messages.messageReceived.connect(onMessageReceived);
    };

    this.unload = function() {
        Messages.messageReceived.disconnect(onMessageReceived);
    };
});
