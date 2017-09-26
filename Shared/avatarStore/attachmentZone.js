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
    // TODO: how to identify that the avatar entity is an attachment?! Userdata?

    var ATTACHMENTS_SETTINGS_KEY = 'io.highfidelity.attachments';
    var ATTACHMENT_ENTITY_SCRIPT = 'https://hifi-content.s3.amazonaws.com/liv/avatar_shopping_demo/attachmentItemScript_experimental.js';
    var ATTACHMENT_ZONE_CHANNEL_ACTIONS = shared.ATTACHMENT_ZONE_CHANNEL_ACTIONS;

    var _attachmentZoneChannel = null;

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
                print('avatar entity ID = ' + avatarEntityID);
                var newTransformProperties = Entities.getEntityProperties(avatarEntityID, [
                    'localPosition', 'localRotation', 'parentID', 'parentJointIndex'
                ]);
                print('newTransformProperties = ' + JSON.stringify(newTransformProperties));
                
                
                var interval = null;
                var maxRuns = 50;
                var runs = 0;
                interval = Script.setInterval(function() {
                    runs++;
                    
                    var createdProperies = Entities.getEntityProperties(entityID, ['position']);
                    print('createdProperies = ' + JSON.stringify(createdProperies));
                    
                    if (Object.keys(createdProperies).length === 0) {
                        print('Object does not yet exist for our viewer.');

                        if (runs >= maxRuns) {
                            print('Could not find created entity in time, giving up.');
                            Script.clearInterval(interval);
                        }
                        return;
                    }

                    Entities.editEntity(entityID, {
                        localPosition: newTransformProperties.localPosition,
                        localRotation: newTransformProperties.localRotation,
                        parentID: newTransformProperties.parentID,
                        parentJointIndex: newTransformProperties.parentJointIndex
                    });
                    // delete the avatar-entity after the regular-entity has been created.
                    Entities.deleteEntity(avatarEntityID);
                    print('KAPOOOWWWW');
                    Script.clearInterval(interval);
                    
                }, 100);
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

    this.enterEntity = function() {
        // TODO: convert to entities

        if (Object.keys(MyAvatar.getAvatarEntityData()).length === 0) {
            MyAvatar.setAvatarEntityData(Settings.getValue(ATTACHMENTS_SETTINGS_KEY, {}));
        }

        // see JSON.stringify(MyAvatar.getAvatarEntityData())
        // in case its empty try to restore attachments from ATTACHMENT_SETTINGS_KEY
        shared.getAvatarChildEntities(MyAvatar).forEach(function(entityID) {
            var entityProperties = Entities.getEntityProperties(entityID, ['clientOnly', 'owningAvatarID', 'parentID']);
            if (entityProperties.clientOnly) {
                var newEntityProperties = Entities.getEntityProperties(entityID);
                shared.removeUnnecessaryProperties(newEntityProperties);
                newEntityProperties.script = ATTACHMENT_ENTITY_SCRIPT;
                shared.touchJSONUserData(newEntityProperties, function(userData) {
                    userData.grabbableKey.grabbable = true;

                    if (userData.Attachment === undefined) {
                        userData.Attachment = {};
                    }
                    userData.Attachment.attached = true;
                });
                print(JSON.stringify(newEntityProperties));
                Messages.sendMessage(_attachmentZoneChannel, JSON.stringify({
                    action: ATTACHMENT_ZONE_CHANNEL_ACTIONS.CREATE_ATTACHMENT_ENTITY,
                    entityProperties: newEntityProperties,
                    avatarEntityID: entityID
                }));
                // Entities.addEntity(newEntityProperties, false);
                // // remove the shops entity
                // Entities.deleteEntity(entityID);
            }
        });
    };

    this.leaveEntity = function() {
        shared.getAvatarChildEntities(MyAvatar).forEach(function(entityID) {
            var entityProperties = Entities.getEntityProperties(entityID, ['clientOnly', 'owningAvatarID', 'parentID']);
            if (!entityProperties.clientOnly) {
                var newEntityProperties = Entities.getEntityProperties(entityID);
                shared.removeUnnecessaryProperties(newEntityProperties);
                delete newEntityProperties.script;
                shared.touchJSONUserData(newEntityProperties, function(userData) {
                    userData.grabbableKey.grabbable = false;
                });
                print(JSON.stringify(newEntityProperties));
                Entities.addEntity(newEntityProperties, true);
                // remove the shops entity
                Entities.deleteEntity(entityID);
            }
        });
        Settings.setValue(ATTACHMENTS_SETTINGS_KEY, MyAvatar.getAvatarEntityData());
    };

    this.unload = function() {
        Messages.messageReceived.disconnect(onMessageReceived);
    };
});
