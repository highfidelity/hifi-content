//
//  attachmentZoneShared.js
//
//  Created by Thijs Wenker on 9/20/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

var ATTACHMENT_ZONE_CHANNEL_PREFIX = 'io.highfidelity.attachmentZoneServer_';
var ATTACHMENT_SEARCH_RADIUS = 100; // meters

/**
 * touches the UserData of an entityProperty set and lets you modify it as an object in its callback
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
        print('Something went wrong while trying to touch/modify the userData. Could be invalid JSON or problem with the callback function.');
    }
};

/**
 * This callback is displayed as a global member.
 * @callback touchJSONUserDataCallback
 * @param {Object} userData
 */

module.exports = {
    getAttachmentZoneChannel: function(entityID) {
        return ATTACHMENT_ZONE_CHANNEL_PREFIX + entityID;
    },
    removeUnnecessaryProperties: function(entityProperties) {
        var unnecessaryProperties = [
            'id', 'lastEdited', 'lastEditedBy', 'created', 'age', 'ageAsText', 'naturalDimensions', 'naturalPosition',
            'boundingBox', 'actionData', 'clientOnly', 'owningAvatarID', 'locked', 'renderInfo', 'queryAACube',
            'originalTextures'
        ];
        unnecessaryProperties.forEach(function(unnecessaryProperty) {
            delete entityProperties[unnecessaryProperty];
        });
    },
    getAvatarChildEntities: function(avatar) {
        var resultEntities = [];
        Entities.findEntities(avatar.position, ATTACHMENT_SEARCH_RADIUS).forEach(function(entityID) {
            var parentID = Entities.getEntityProperties(entityID, 'parentID').parentID;
            if (parentID === avatar.sessionUUID) {
                resultEntities.push(entityID);
            }
        });
        return resultEntities;
    },
    touchJSONUserData: touchJSONUserData,
    ATTACHMENT_ZONE_CHANNEL_ACTIONS: {
        CREATE_ATTACHMENT_ENTITY: 'createAttachmentEntity',
        CREATED_ATTACHMENT_ENTITY: 'createdAttachmentEntity'
    }
};
