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
    var ATTACHMENT_ENTITY_SCRIPT = 'https://hifi-content.s3.amazonaws.com/liv/avatar_shopping_demo/attachmentItemScript_Experimental.js';
    // var ATTACHMENT_ZONE_CHANNEL_PREFIX = 'io.highfidelity.attachmentZoneServer_';
    var ATTACHMENT_SEARCH_RADIUS = 100; // meters

    var _attachmentZoneChannel = null;
 
    var getAvatarChildEntities = function() {
        var resultEntities = [];
        Entities.findEntities(MyAvatar.position, ATTACHMENT_SEARCH_RADIUS).forEach(function(entityID) {
            var parentID = Entities.getEntityProperties(entityID, 'parentID').parentID;
            if (parentID === MyAvatar.sessionUUID) {
                resultEntities.push(entityID);
            }
        });
        return resultEntities;
    };

    var removeUnnecessaryProperties = function(entityProperties) {
        var unnecessaryProperties = ['id', 'lastEdited', 'lastEditedBy', 'created', 'age', 'ageAsText', 'naturalDimensions',
            'naturalPosition', 'boundingBox', 'actionData', 'clientOnly', 'owningAvatarID'];
        unnecessaryProperties.forEach(function(unnecessaryProperty) {
            delete entityProperties[unnecessaryProperty];
        });
    };

    /**
     * 
     * @param {Object} entityProperties 
     * @param {touchJSONUserDataCallback} touchCallback 
     */
    var touchJSONUserData = function(entityProperties, touchCallback) {
        try {
            // attempt to touch the userData
            var userData = JSON.parse(entityProperties.userData);
            touchCallback.call(this, userData);
            entityProperties.userData = JSON.stringify(userData);
        } catch (e) {
            print('Something went wrong while trying to modify the userData. Could be invalid JSON or problem with the callback function.');
        }
    };

    
    /**
     * This callback is displayed as a global member.
     * @callback modifyJSONUserDataCallback
     * @param {Object} userData
     */

    this.preload = function(entityID) {
        _attachmentZoneChannel = shared.getAttachmentZoneChannel(); // ATTACHMENT_ZONE_CHANNEL_PREFIX + entityID;
    };

    this.enterEntity = function() {
        // TODO: convert to entities

        if (Object.keys(MyAvatar.getAvatarEntityData()).length === 0) {
            MyAvatar.setAvatarEntityData(Settings.getValue(ATTACHMENTS_SETTINGS_KEY, {}));
        }

        // see JSON.stringify(MyAvatar.getAvatarEntityData())
        // in case its empty try to restore attachments from ATTACHMENT_SETTINGS_KEY
        getAvatarChildEntities().forEach(function(entityID) {
            var entityProperties = Entities.getEntityProperties(entityID, ['clientOnly', 'owningAvatarID', 'parentID']);
            
            print(entityID + ' ' + entityProperties.parentID + ' ' + entityProperties.clientOnly + ' ' + entityProperties.owningAvatarID);

            // TODO: ask the server for creation of the entities, and delete the avatar-entity after the entity has been created.
            if (entityProperties.clientOnly) {
                var newEntityProperties = Entities.getEntityProperties(entityID);
                removeUnnecessaryProperties(newEntityProperties);
                newEntityProperties.script = ATTACHMENT_ENTITY_SCRIPT;
                touchJSONUserData(newEntityProperties, function(userData) {
                    userData.grabbableKey.grabbable = true;

                    if (userData.Attachment === undefined) {
                        userData.Attachment = {};
                    }
                    userData.Attachment.attached = true;
                });
                print(JSON.stringify(newEntityProperties));
                Entities.addEntity(newEntityProperties, false);
                // remove the shops entity
                Entities.deleteEntity(entityID);
            }
        });
    };

    this.leaveEntity = function() {
        getAvatarChildEntities().forEach(function(entityID) {
            var entityProperties = Entities.getEntityProperties(entityID, ['clientOnly', 'owningAvatarID', 'parentID']);

            print(entityID + ' ' + entityProperties.parentID + ' ' + entityProperties.clientOnly + ' ' + entityProperties.owningAvatarID);

            if (!entityProperties.clientOnly) {
                var newEntityProperties = Entities.getEntityProperties(entityID);
                removeUnnecessaryProperties(newEntityProperties);
                delete newEntityProperties.script;
                touchJSONUserData(newEntityProperties, function(userData) {
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
});
