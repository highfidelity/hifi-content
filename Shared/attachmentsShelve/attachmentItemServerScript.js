//
//  attachmentItemServerScript.js
//
//  Created by Thijs Wenker on 8/21/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var _entityID = null;
    var _listeningChannel = null;
    var _attachmentData = null;

    // last created attachment per session
    var _lastCreatedAttachments = {};

    var WANT_DEBUG = true;

    var MILLISECONDS_PER_SECOND = 1000;

    // Can only create one entity per client in the period of MIN_CREATION_TIMEOUT in seconds
    var MIN_CREATION_TIMEOUT = 5; // seconds

    var LIFETIME_FROM_RELEASE = 4; // seconds

    var TOTAL_HOLD_LIFETIME = 60; // seconds

    var ATTACHMENT_CHANNEL_PREFIX = 'attachmentItem-';

    var _scriptTimestamp = null;

    var debugPrint = function(message) {};
    if (WANT_DEBUG) {
        debugPrint = function(message) {
            print(_entityID + ': ' + message);
        }
    }

    var getEntityProperty = function(entityID, property) {
        return Entities.getEntityProperties(entityID, property)[property];
    };

    var getScriptTimestamp = function() {
        return getEntityProperty(_entityID, 'scriptTimestamp');
    }

    var getUserData = function() {
        try {
            return JSON.parse(Entities.getEntityProperties(_entityID, 'userData').userData);
        } catch (e) {
            // e
            debugPrint('Could not retrieve valid userData');
        }
        return null;
    };

    var getAttachmentData = function() {
        var userDataObject = getUserData();
        if (userDataObject === null || userDataObject.Attachment === undefined) {
            return null;
        }
        return userDataObject.Attachment;
    };

    var messageHandler = function(channel, message, sender, localOnly) {
        if (channel !== _listeningChannel) {
            return;
        }

        // FIXME: entity server scripts don't always close down properly:
        if (_scriptTimestamp !== getScriptTimestamp()) {
            return;
        }
        
        try {
            var data = JSON.parse(message);
            debugPrint('Message received: ' + message);
            if (data.action === 'create') {
                if (_lastCreatedAttachments[sender] !== undefined) {
                    var creationTime = _lastCreatedAttachments[sender].createdAt;
                    var timespanSinceCreation = Date.now() - creationTime;
                    if (timespanSinceCreation < (MILLISECONDS_PER_SECOND * MIN_CREATION_TIMEOUT)) {
                        debugPrint('Throttling creation of attachment, another attachment has already been created for this session in the period of ' + MIN_CREATION_TIMEOUT + ' seconds.');
                        return;
                    }
                }

                var localPosition = Vec3.multiplyQbyV(Quat.inverse(data.handRotation), Vec3.subtract(data.entityPosition, data.handPosition));
                var localRotation = Quat.multiply(Quat.inverse(data.handRotation), data.entityRotation);

                debugPrint('trying to create entity');
                var newProperties = Entities.getEntityProperties(_entityID);
                debugPrint('received properties from ' + _entityID + ': ' + JSON.stringify(newProperties));
                
                newProperties.position = Vec3.sum(data.handPosition, Vec3.multiplyQbyV(data.handRotation, localPosition));
                newProperties.rotation = Quat.multiply(data.handRotation, localRotation);
                newProperties.lifetime = TOTAL_HOLD_LIFETIME;

                // delete some unused properties
                delete newProperties.id;
                delete newProperties.lastEdited;
                delete newProperties.lastEditedBy;
                delete newProperties.created;
                delete newProperties.age;
                delete newProperties.ageAsText;
                delete newProperties.naturalDimensions;
                delete newProperties.naturalPosition;
                delete newProperties.boundingBox;
                delete newProperties.actionData;


                // collisionMask is already set:
                delete newProperties.collidesWith;

                if (newProperties.locked !== undefined) {
                    delete newProperties.locked;
                }

                if (newProperties.renderInfo !== undefined) {
                    delete newProperties.renderInfo;
                }

                if (newProperties.angularVelocity !== undefined) {
                    delete newProperties.angularVelocity;
                }

                delete newProperties.localRotation;
                delete newProperties.localPosition;

                delete newProperties.parentID;
                delete newProperties.parentJointIndex;
                delete newProperties.queryAACube;
                delete newProperties.originalTextures;
                delete newProperties.animation;
                delete newProperties.owningAvatarID;
                delete newProperties.clientOnly;
                
                // We only want the server-side script in the locked item
                if (newProperties.serverScripts !== undefined) {
                    delete newProperties.serverScripts;
                }

                try {
                    // attempt to modify the userData
                    var userData = JSON.parse(newProperties.userData);
                    userData.grabbableKey.wantsTrigger = false;
                    userData.grabbableKey.grabbable = true;
                    userData.attachmentServer = _listeningChannel;
                    newProperties.userData = JSON.stringify(userData);
                } catch (e) {
                    debugPrint('Something went wrong while trying to modify the userData.');
                }

                // must be dynamic for hold action:
                newProperties.dynamic = true;

                if (newProperties.shapeType === undefined || newProperties.shapeType === 'none') {
                    // must have dynamic shapeType for hold action:
                    newProperties.shapeType = 'box';
                }
                var entityID = Entities.addEntity(newProperties);
                debugPrint('created ' + entityID + ' with properties: ' + JSON.stringify(newProperties));
                Messages.sendMessage(_listeningChannel, JSON.stringify({
                    action: 'attach',
                    entityID: entityID,
                    sessionUUID: sender,
                    hand: data.hand,
                    localPosition: localPosition,
                    localRotation: localRotation
                }));
                _lastCreatedAttachments[sender] = {
                    entityID: entityID,
                    createdAt: Date.now()
                };
            } else if (data.action === 'release' && _lastCreatedAttachments[sender] !== undefined) {
                if (_lastCreatedAttachments[sender].entityID !== data.entityID) {
                    debugPrint(data.entityID + ' does not match previously created entity for session.');
                    return;
                }
                // set lifetime to (entityProperties.age + LIFETIME_FROM_RELEASE)

                var age = getEntityProperty(data.entityID, 'age');
                debugPrint('Setting lifetime to release timeout');
                Entities.editEntity(data.entityID, {lifetime: age + LIFETIME_FROM_RELEASE});
            } else if (data.action === 'grab') {
                var found = false;
                Object.keys(_lastCreatedAttachments).forEach(function(session) {
                    if (_lastCreatedAttachments[session].entityID === data.entityID) {
                        found = true;
                    }
                });
                if (!found) {
                    debugPrint(data.entityID + ' not found in attachmentItemServer, ignoring grab message.');
                    return;
                }
                // set lifetime back to TOTAL_HOLD_LIFETIME
                debugPrint('Setting lifetime to default');
                Entities.editEntity(data.entityID, {lifetime: TOTAL_HOLD_LIFETIME});
            }
        } catch (e) {

        }
    };

    this.preload = function(entityID) {
        _entityID = entityID;
        _scriptTimestamp = getScriptTimestamp();
        _listeningChannel = ATTACHMENT_CHANNEL_PREFIX + entityID;
        Messages.subscribe(_listeningChannel);

        debugPrint(_entityID + ': Connecting messageHandler.');
        Messages.messageReceived.connect(messageHandler);
    };

    this.unload = function() {
        debugPrint(_entityID + ': Disconnecting messageHandler.');
        Messages.messageReceived.disconnect(messageHandler);
    };
})
