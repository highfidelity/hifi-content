//
//  attachmentItemScript.js
//
//  This script is a simplified version of the original attachmentItemScript.js 
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* global Render, Selection */

(function() {
    var highlightToggle = false;
  
    var GRAB_SOUND = SoundCache.getSound(Script.resolvePath('sounds/sound1.wav'));
    var ATTACH_SOUND = SoundCache.getSound(Script.resolvePath('sounds/sound2.wav'));
    var DETACH_SOUND = SoundCache.getSound(Script.resolvePath('sounds/sound7.wav'));
    var HIGHLIGHT = Script.require('./ExternalOutlineConfig.js');
    var SHARED = Script.require('./attachmentZoneShared.js');
    var LEFT_RIGHT_PLACEHOLDER = '[LR]';
    var RELEASE_LIFETIME = 10;
    var LIST_NAME = "highlightList1";
    var TRIGGER_INTENSITY = 1.0;
    var TRIGGER_TIME = 0.2;
    var EMPTY_PARENT_ID = "{00000000-0000-0000-0000-000000000000}";
    var ATTACH_SCALE = 3;
    var MESSAGE_CHANNEL_BASE = "AvatarStoreObject";
    var NOT_ATTACHED_DESTROY_RADIUS = 0.1;
  
    var messageChannel;
    var highlightConfig = Render.getConfig("UpdateScene.HighlightStageSetup");
    var _entityID;
    var _attachmentData;
    var _supportedJoints = [];
    var _isNearGrabbingWithHand = false;
    var isAttached;
    var firstGrab = true;
    var prevID = 0;
    var listType = "entity";
    var attachDistance;
    var initialParentPosition;


    var attachFunction = function() {
        attachDistance = MyAvatar.getEyeHeight() / ATTACH_SCALE;

    };

    var lastDesktopSupportedJointIndex = -1;

    var playAttachSound = function() {
        if (ATTACH_SOUND.downloaded) {
            Audio.playSound(ATTACH_SOUND, {
                position: MyAvatar.position,
                volume: SHARED.AUDIO_VOLUME_LEVEL,
                localOnly: true
            });
        }
    };

    function AttachableItem() {

    }

    AttachableItem.prototype = {
        preload : function(entityID) {
            _entityID = entityID;
            if (highlightToggle) {
                highlightConfig["selectionName"] = LIST_NAME; 
                Selection.clearSelectedItemsList(LIST_NAME);
                HIGHLIGHT.changeHighlight1(highlightConfig);
            }
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
            attachDistance = MyAvatar.getEyeHeight() / ATTACH_SCALE;
            initialParentPosition = Entities.getEntityProperties(properties.parentID, ['position']).position;
        },
        unload: function() {
            MyAvatar.scaleChanged.disconnect(attachFunction);
        },
        /**
         * Local remote function to be called from desktopAttachment.js whenever a click event is registered.
         * @param entityID current entityID
         * @param args array of arguments to be passed in from remote server
         */
        desktopAttach: function(entityID, args) {
            var newEntityProperties = Entities.getEntityProperties(_entityID, ['dimensions', 'userData']);
            var attachmentData = null;
            SHARED.touchJSONUserData(newEntityProperties, function(userData) {
                userData.Attachment.attached = true;
                attachmentData = userData.Attachment;
            });
            lastDesktopSupportedJointIndex = (lastDesktopSupportedJointIndex + 1) % _supportedJoints.length;
            
            var defaultPosition = {x: 0, y: 0, z: 0};
            if (attachmentData.defaultPosition !== undefined) {
                defaultPosition = attachmentData.defaultPosition;
            }
            var defaultRotation = {x: 0, y: 0, z: 0, w: 1};
            if (attachmentData.defaultRotation !== undefined) {
                defaultRotation = attachmentData.defaultRotation;
            }
            var defaultDimensions = newEntityProperties.dimensions;
            if (attachmentData.defaultDimensions !== undefined) {
                defaultDimensions = attachmentData.defaultDimensions;
            }
            var jointIndex = MyAvatar.getJointIndex(_supportedJoints[lastDesktopSupportedJointIndex]);
            if (jointIndex === -1) {
                // fail when no joint index is found and delete entity since a new one is being created already.
                Entities.deleteEntity(_entityID);
                return;
            }

            // Finally, if all worked out, set the attachment properties.
            Entities.editEntity(_entityID, {
                visible: true,
                localPosition: defaultPosition,
                localRotation: defaultRotation,
                dimensions: defaultDimensions,
                parentID: MyAvatar.sessionUUID,
                parentJointIndex: jointIndex,
                userData: newEntityProperties.userData,
                lifetime: -1
            });
            playAttachSound();
        },
        startNearGrab: function(entityID, args) {
            if (highlightToggle) {
                if (prevID !== entityID) {
                    Selection.addToSelectedItemsList(LIST_NAME, listType, entityID);
                    prevID = entityID;
                }
            }
            if (firstGrab) {
                if (!Entities.getEntityProperties(entityID, 'visible').visible) {
                    Entities.editEntity(entityID, {visible: true});
                }
                firstGrab = false;
                attachDistance = MyAvatar.getEyeHeight() / ATTACH_SCALE;
            }
            if (GRAB_SOUND.downloaded) {
                Audio.playSound(GRAB_SOUND, {
                    position: MyAvatar.position,
                    volume: SHARED.AUDIO_VOLUME_LEVEL,
                    localOnly: true
                });
            }
        },
        continueNearGrab: function(entity, args) {
            _isNearGrabbingWithHand = true;
        },
        releaseGrab: function(entityID, args) {
            if (!_isNearGrabbingWithHand) {
                return;
            }
            _isNearGrabbingWithHand = false;
            var hand = args[0];
            var properties = Entities.getEntityProperties(entityID, ['parentID', 'userData', 'position']);
            if (highlightToggle) {
                if (prevID !== 0) {
                    Selection.removeFromSelectedItemsList(LIST_NAME, listType, prevID);
                    prevID = 0;
                }
            }
            if (Entities.getNestableType(properties.parentID) === "entity") {
                Messages.sendMessage(messageChannel, "Removed Item :" + entityID);
                Messages.unsubscribe(messageChannel);
                Entities.editEntity(entityID, {parentID: EMPTY_PARENT_ID});
            }
            var userData = properties.userData;
            var position = properties.position; 
            var attachmentData = JSON.parse(userData).Attachment;
            isAttached = attachmentData.attached;
            if (!isAttached) {
                _supportedJoints.forEach(function(joint) {
                    var jointPosition = MyAvatar.getJointPosition(joint);
                    if (Vec3.distance(position, jointPosition) <= attachDistance) {
                        // Check that we are not holding onto an arm attachment in a hand
                        if (joint.toLowerCase().indexOf(hand) !== -1) {
                            return;
                        }
                        var newEntityProperties = Entities.getEntityProperties(_entityID, 'userData');
                        SHARED.touchJSONUserData(newEntityProperties, function(userData) {
                            userData.Attachment.attached = true;
                        });
                        Entities.editEntity(_entityID, {
                            parentID: MyAvatar.sessionUUID,
                            parentJointIndex: MyAvatar.getJointIndex(joint),
                            userData: newEntityProperties.userData,
                            lifetime: -1
                        });
                        playAttachSound();
                        isAttached = true;
                        Controller.triggerHapticPulse(TRIGGER_INTENSITY, TRIGGER_TIME, hand);
                    }
                }); 
            } else if (isAttached) {
                var jointPosition = (properties.parentID === MyAvatar.sessionUUID) ? 
                    MyAvatar.getJointPosition(properties.parentJointIndex) : 
                    AvatarList.getAvatar(properties.parentID).getJointPosition(properties.parentJointIndex);
                if (Vec3.distance(position, jointPosition) > attachDistance) {
                    var newDetachEntityProperties = Entities.getEntityProperties(entityID);
                    SHARED.touchJSONUserData(newDetachEntityProperties, function(userData) {
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
                            volume: SHARED.AUDIO_VOLUME_LEVEL,
                            localOnly: true
                        });
                    }
                    isAttached = false;
                    Controller.triggerHapticPulse(TRIGGER_INTENSITY, TRIGGER_TIME, hand);
                }
            }
            
            // If placed back within NOT_ATTACHED_DESTROY_RADIUS of the original parent entity 
            // and it is not attached then destroy it (if the user is putting it back)
            if (!isAttached && Vec3.distance(initialParentPosition, position) < NOT_ATTACHED_DESTROY_RADIUS) {
                Entities.deleteEntity(_entityID);
            }
        }
    };
    return new AttachableItem(); 
});
