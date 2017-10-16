//
//  attachmentItemScript.js
//
//  This script is a simplified version of the original attachmentItemScript.js 
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var ATTACH_SOUND = SoundCache.getSound(Script.resolvePath('sound/attach_sound_1.wav'));
    var DETACH_SOUND = SoundCache.getSound(Script.resolvePath('sound/detach.wav'));

    var LEFT_RIGHT_PLACEHOLDER = '[LR]';
    var ATTACH_DISTANCE = 0.35;
    var DETACH_DISTANCE = 0.5;
    var AUDIO_VOLUME_LEVEL = 0.2;
    var RELEASE_LIFETIME = 60;

    var TRIGGER_INTENSITY = 1.0;
    var TRIGGER_TIME = 0.2;

    var EMPTY_PARENT_ID = "{00000000-0000-0000-0000-000000000000}";

    var MESSAGE_CHANNEL_BASE = "AvatarStoreObject";
    var messageChannel;
    
    var _entityID;
    var _attachmentData;
    var _supportedJoints = [];
    var isAttached;

    var firstGrab = true;

    var prevID = 0;
    var listName = "contextOverlayHighlightList";
    var listType = "entity";

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
            print('Something went wrong while trying to touch/modify the userData. Could be invalid JSON or problem with the callback function.');
        }
    };

    /**
     * This callback is displayed as a global member.
     * @callback touchJSONUserDataCallback
     * @param {Object} userData
     */

    function AttachableItem() {

    }
    AttachableItem.prototype = {
        preload : function(entityID) {
            _entityID = entityID;
            var properties = Entities.getEntityProperties(entityID, ['parentID', 'userData']);

            _attachmentData = JSON.parse(properties.userData).Attachment;
            if (_attachmentData.joint.indexOf(LEFT_RIGHT_PLACEHOLDER) !== -1) {
                var baseJoint = _attachmentData.joint.substring(4);
                _supportedJoints.push("Left".concat(baseJoint));
                _supportedJoints.push("Right".concat(baseJoint));
            } else {
                _supportedJoints.push(_attachmentData.joint);
            }

            isAttached = _attachmentData.attached;

            if (Entities.getNestableType(properties.parentID) !== "avatar" && !isAttached) {
                messageChannel = MESSAGE_CHANNEL_BASE + properties.parentID;
                Messages.subscribe(messageChannel);
            }
        },
        startNearGrab: function(entityID, args) {
            if (firstGrab) {
                if (!Entities.getEntityProperties(entityID, 'visible').visible) {
                    Entities.editEntity(entityID, {visible: true});
                } 
                firstGrab = false;
            }

            if (prevID !== entityID) {
                Selection.addToSelectedItemsList(listName, listType, entityID);
                prevID = entityID;
            }
        },
            
        releaseGrab: function(entityID, args) {
            var hand = args[0] === "left" ? 0 : 1;
            var properties = Entities.getEntityProperties(entityID, ['parentID', 'userData', 'position']);

            if (Entities.getNestableType(properties.parentID) === "entity") {
                Messages.sendMessage(messageChannel, "Removed Item :" + entityID);
                Messages.unsubscribe(messageChannel); 
                Entities.editEntity(entityID, {parentID: EMPTY_PARENT_ID});
            }

            if (prevID !== 0) {
                Selection.removeFromSelectedItemsList("contextOverlayHighlightList", listType, prevID);
                prevID = 0;
            }

            var userData = properties.userData;
            var position = properties.position; 
            var attachmentData = JSON.parse(userData).Attachment;
            isAttached = attachmentData.attached;

            if (!isAttached) {
                _supportedJoints.forEach(function(joint) {
                    var jointPosition = MyAvatar.getJointPosition(joint);
                    if (Vec3.distance(position, jointPosition) <= ATTACH_DISTANCE) {
                        var newEntityProperties = Entities.getEntityProperties(_entityID, 'userData');
                        touchJSONUserData(newEntityProperties, function(userData) {
                            userData.Attachment.attached = true;
                        });
                        Entities.editEntity(_entityID, {
                            parentID: MyAvatar.sessionUUID,
                            parentJointIndex: MyAvatar.getJointIndex(joint),
                            userData: newEntityProperties.userData,
                            lifetime: -1
                        });
                        if (ATTACH_SOUND.downloaded) {
                            Audio.playSound(ATTACH_SOUND, {
                                position: MyAvatar.position,
                                volume: AUDIO_VOLUME_LEVEL,
                                localOnly: true
                            });
                        }
                        Controller.triggerHapticPulse(TRIGGER_INTENSITY, TRIGGER_TIME, hand);
                    }
                }); 
            } else if (isAttached) {
                var jointPosition = (properties.parentID === MyAvatar.sessionUUID) ? 
                    MyAvatar.getJointPosition(properties.parentJointIndex) : 
                    AvatarList.getAvatar(properties.parentID).getJointPosition(properties.parentJointIndex);
                if (Vec3.distance(position, jointPosition) > DETACH_DISTANCE) {
                    var newDetachEntityProperties = Entities.getEntityProperties(entityID);
                    touchJSONUserData(newDetachEntityProperties, function(userData) {
                        userData.Attachment.attached = false;
                    });
                    Entities.editEntity(_entityID, {
                        parentID: EMPTY_PARENT_ID,
                        lifetime: Entities.getEntityProperties(_entityID, 'age').age + RELEASE_LIFETIME,
                        userData: newDetachEntityProperties.userData
                    });
                    if (DETACH_SOUND.downloaded) {
                        Audio.playSound(DETACH_SOUND, {
                            position: MyAvatar.position,
                            volume:AUDIO_VOLUME_LEVEL,
                            localOnly: true
                        });
                    }
                    Controller.triggerHapticPulse(TRIGGER_INTENSITY, TRIGGER_TIME, hand);
                }
            } 
        }
    };
    return new AttachableItem(); 
});
