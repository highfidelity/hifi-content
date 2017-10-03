//
//  attachmentZone.js
//
//  Created by Thijs Wenker on 9/19/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var shared = Script.require('./attachmentZoneShared.js');

    var ATTACHMENTS_BECOME_ENTITIES_ON_ENTRY = false;
    var ATTACHMENT_ENTITY_SCRIPT = 'https://hifi-content.s3.amazonaws.com/liv/avatar_shopping_demo/attachmentItemScript.js';
    var ATTACHMENT_ZONE_CHANNEL_ACTIONS = shared.ATTACHMENT_ZONE_CHANNEL_ACTIONS;

    var _attachmentZoneChannel = null;

    if (ATTACHMENTS_BECOME_ENTITIES_ON_ENTRY) {
        var onMessageReceived = function(channel, message, sender, localOnly) {
            if (sender === MyAvatar.sessionUUID) {
                return;
            }
            if (channel === _attachmentZoneChannel) {
                var data = JSON.parse(message);
                if (data.action === ATTACHMENT_ZONE_CHANNEL_ACTIONS.CREATED_ATTACHMENT_ENTITY) {
                    if (data.avatarSessionUUID !== MyAvatar.sessionUUID) {
                        return;
                    }
                    var avatarEntityID = data.avatarEntityID; // for reference
                    var entityID = data.entityID;

                    var interval = null;
                    var maxRuns = 50;
                    var runs = 0;
                    interval = Script.setInterval(function() {
                        runs++;
                        
                        var createdProperties = Entities.getEntityProperties(entityID, 'position');                    
                        if (Object.keys(createdProperties).length === 0) {

                            if (runs >= maxRuns) {
                                print('Error. Could not find created entity in time, giving up.');
                                Script.clearInterval(interval);
                            }
                            return;
                        }

                        var transformKeys = ['localPosition', 'localRotation', 'parentID', 'parentJointIndex'];
                        var tempTransformProperties = Entities.getEntityProperties(avatarEntityID, transformKeys);
                        var newTransformProperties = {};
                        transformKeys.forEach(function(transformKey) {
                            newTransformProperties[transformKey] = tempTransformProperties[transformKey];
                        });

                        newTransformProperties.velocity = {x: 0, y: 0, z: 0};

                        Script.clearInterval(interval);
                        Entities.editEntity(entityID, newTransformProperties);

                        Script.setTimeout(function() {
                            // make the entity visible (the ESS creates an invisible entity)
                            newTransformProperties.visible = true;
                            Entities.editEntity(entityID, newTransformProperties);

                            // delete the avatar-entity after the regular-entity has been created.
                            Entities.deleteEntity(avatarEntityID);
                        }, 1000);
                    }, 100);
                } else {
                    print('Error. Unknown action in message ' + message);
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

        this.enterEntity = function() {

            // see JSON.stringify(MyAvatar.getAvatarEntityData())
            // in case its empty try to restore attachments from ATTACHMENT_SETTINGS_KEY
            shared.getAvatarChildEntities(MyAvatar).forEach(function(entityID) {
                if (Entities.getEntityProperties(entityID, 'clientOnly').clientOnly) {
                    var newEntityProperties = Entities.getEntityProperties(entityID);
                    shared.removeUnnecessaryProperties(newEntityProperties);
                    newEntityProperties.script = ATTACHMENT_ENTITY_SCRIPT;
                    shared.touchJSONUserData(newEntityProperties, function(userData) {
                        userData.grabbableKey.grabbable = true;

                        if (userData.Attachment === undefined) {
                            userData.Attachment = {};
                            if (newEntityProperties.parentJointIndex > -1 &&
                                newEntityProperties.parentJointIndex < MyAvatar.jointNames.length) {

                                userData.Attachment.joint = MyAvatar.jointNames[newEntityProperties.parentJointIndex];
                            }
                        }
                        userData.Attachment.attached = true;
                    });
                    Messages.sendMessage(_attachmentZoneChannel, JSON.stringify({
                        action: ATTACHMENT_ZONE_CHANNEL_ACTIONS.CREATE_ATTACHMENT_ENTITY,
                        entityProperties: newEntityProperties,
                        avatarEntityID: entityID
                    }));
                }
            });
        };
    } // endif ATTACHMENTS_BECOME_ENTITIES_ON_ENTRY

    this.leaveEntity = function() {
        shared.getAvatarChildEntities(MyAvatar).forEach(function(entityID) {
            if (!Entities.getEntityProperties(entityID, 'clientOnly').clientOnly) {
                var newEntityProperties = Entities.getEntityProperties(entityID);
                shared.removeUnnecessaryProperties(newEntityProperties);
                delete newEntityProperties.script;
                shared.touchJSONUserData(newEntityProperties, function(userData) {
                    userData.grabbableKey.grabbable = false;
                });
                Entities.addEntity(newEntityProperties, true);
                // remove the shops entity
                Entities.deleteEntity(entityID);
            }
        });
    };
});
