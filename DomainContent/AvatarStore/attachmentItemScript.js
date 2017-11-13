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
    var shared = Script.require('./attachmentZoneShared.js');
    
    var GRAB_SOUND = SoundCache.getSound(Script.resolvePath('sounds/sound1.wav'));
    var ATTACH_SOUND = SoundCache.getSound(Script.resolvePath('sounds/sound2.wav'));
    var DETACH_SOUND = SoundCache.getSound(Script.resolvePath('sounds/sound7.wav'));

    var LEFT_RIGHT_PLACEHOLDER = '[LR]';
    var ATTACH_DISTANCE = 0.35;
    var RELEASE_LIFETIME = 10;

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

    var attachDistance = HMD.active ? (MyAvatar.getHeadPosition().y - MyAvatar.getLeftHandPosition().y) / 2 : ATTACH_DISTANCE;

    function AttachableItem() {

    }

    var attachFunction = function(){
        if (HMD.active) {
            attachDistance = (MyAvatar.getHeadPosition().y - MyAvatar.getLeftHandPosition().y)/2;
        }
    };

    AttachableItem.prototype = {
        preload : function(entityID) {
            _entityID = entityID;
            var properties = Entities.getEntityProperties(entityID, ['parentID', 'userData']);
            var userData = JSON.parse(properties.userData);
            _attachmentData = userData.Attachment;
            var _marketplaceID = userData.marketplaceID;

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

            Entities.editEntity(entityID, {marketplaceID: _marketplaceID});
            MyAvatar.scaleChanged.connect(attachFunction);
        },
        unload: function() {
            MyAvatar.scaleChanged.disconnect(attachFunction);
        },
        startNearGrab: function(entityID, args) {
            if (firstGrab) {
                if (!Entities.getEntityProperties(entityID, 'visible').visible) {
                    Entities.editEntity(entityID, {visible: true});
                }
                firstGrab = false;
            }
            if (GRAB_SOUND.downloaded) {
                Audio.playSound(GRAB_SOUND, {
                    position: MyAvatar.position,
                    volume: shared.AUDIO_VOLUME_LEVEL,
                    localOnly: true
                });
            }
            if (Entities.getEntityProperties(entityID, 'visible').visible === false) {
                Entities.editEntity(entityID, {visible: true});
            }
        },
            
        releaseGrab: function(entityID, args) {
            var hand = args[0];
            var properties = Entities.getEntityProperties(entityID, ['parentID', 'userData', 'position']);

            if (Entities.getNestableType(properties.parentID) === "entity") {
                Messages.sendMessage(messageChannel, "Removed Item :" + entityID);
                Messages.unsubscribe(messageChannel);
                Entities.editEntity(entityID, {parentID: EMPTY_PARENT_ID});
            }

            var userData = properties.userData;
            var position = properties.position; 
            var attachmentData = JSON.parse(userData).Attachment;
            isAttached = attachmentData.attached;
            if (isAttached) {
                var jointPosition = (properties.parentID === MyAvatar.sessionUUID) ? 
                    MyAvatar.getJointPosition(properties.parentJointIndex) : 
                    AvatarList.getAvatar(properties.parentID).getJointPosition(properties.parentJointIndex);
                if (Vec3.distance(position, jointPosition) > attachDistance) {
                    var newDetachEntityProperties = Entities.getEntityProperties(entityID);
                    shared.touchJSONUserData(newDetachEntityProperties, function(userData) {
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
                            volume: shared.AUDIO_VOLUME_LEVEL,
                            localOnly: true
                        });
                    }
                    Controller.triggerHapticPulse(TRIGGER_INTENSITY, TRIGGER_TIME, hand);
                    isAttached = false;
                }
            } else if (!isAttached) {
                _supportedJoints.forEach(function(joint) {
                    var jointPosition = MyAvatar.getJointPosition(joint);
                    if (Vec3.distance(position, jointPosition) <= attachDistance) {
                        // Check that we are not holding onto an arm attachment in a hand
                        if (joint.toLowerCase().indexOf(hand) !== -1) {
                            return;
                        }
                        var newEntityProperties = Entities.getEntityProperties(_entityID, 'userData');
                        shared.touchJSONUserData(newEntityProperties, function(userData) {
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
                                volume: shared.AUDIO_VOLUME_LEVEL,
                                localOnly: true
                            });
                        }
                        isAttached = true;
                        Controller.triggerHapticPulse(TRIGGER_INTENSITY, TRIGGER_TIME, hand);
                    }
                }); 
            } 
        }
    };
    return new AttachableItem(); 
});
