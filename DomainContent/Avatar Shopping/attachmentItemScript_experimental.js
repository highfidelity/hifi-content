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

    var TRIGGER_INTENSITY = 1.0;
    var TRIGGER_TIME = 0.2;

    var MESSAGE_CHANNEL_BASE = "AvatarStoreObject";
    var messageChannel;
    
    var _this, _entityID;
    var _attachmentData;
    var _supportedJoints = [];
    var isAttached;
    var firstGrab = true;
    var jointIsArmOrHand = false;
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
        _this = this;
    }
    AttachableItem.prototype = {
        preload : function(entityID) {
            _entityID = entityID;
            var properties = Entities.getEntityProperties(entityID);
            // Set up the joint data so we know where we can attach
            _attachmentData = JSON.parse(properties.userData).Attachment;
            if (_attachmentData.joint.indexOf(LEFT_RIGHT_PLACEHOLDER) !== -1) {
                var baseJoint = _attachmentData.joint.substring(4);
                _supportedJoints.push("Left".concat(baseJoint));
                _supportedJoints.push("Right".concat(baseJoint));
            } else {
                _supportedJoints.push(_attachmentData.joint);
            }
            if (_attachmentData.joint.indexOf("Hand") !== -1 ||
                _attachmentData.joint.indexOf("Arm") !== -1) {
                jointIsArmOrHand = true;
            }
            isAttached = _attachmentData.attached;
            print("Is attached? " + isAttached);
            messageChannel = MESSAGE_CHANNEL_BASE + properties.parentID;
            Messages.subscribe(messageChannel);
        },
        startNearGrab: function(entityID, args) {
            var hand = args[0] === "left" ? 0 : 1;
            var hasAvatarParent = false;
            // This is the first time we've grabbed this entity
            // See if it's attached to someone
            if (firstGrab) {
                firstGrab = false;
                // See if a parentID is an entity. If so, we are removing from shelf
                if (Entities.getNestableType(entityID) === "entity") {
                    print("Removing item from shelf");
                    Entities.editEntity(_entityID, {visible: true, parentID:"{00000000-0000-0000-0000-000000000000}"});
                    Messages.sendMessage(messageChannel, "Removed Item :" + entityID);
                    Messages.unsubscribe(messageChannel);
                } else if (Entities.getNestableType(entityID) === "avatar") {
                    hasAvatarParent = true; // This is attached to another avatar
                }
            }
            // Only do this if we haven't attached to another avatar
            if (!hasAvatarParent) {
                this.intervalFunc = Script.setInterval(function(){
                    var properties = Entities.getEntityProperties(entityID);
                    var userData = properties.userData;
                    var position = properties.position; 
                    var attachmentData = JSON.parse(userData).Attachment;
                    isAttached = attachmentData.attached; // Update, just in case
                    _supportedJoints.forEach(function(joint) {
                        var jointPosition = MyAvatar.getJointPosition(joint);
                        // Not attached - we can wear this
                        if (! isAttached) {
                            if (jointIsArmOrHand && joint.indexOf(args[0]) !== -1) {
                                return; // Do not check for joint on active hand
                            }
                            if (Vec3.distance(position, jointPosition) <= ATTACH_DISTANCE) {
                                isAttached = true;
                                var newEntityProperties = Entities.getEntityProperties(_entityID);
                                touchJSONUserData(newEntityProperties, function(userData) {
                                    userData.Attachment.attached = true;
                                });
                                print("New entity properties: " + JSON.stringify(newEntityProperties.userData));
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
                        } else {
                        // We're attached, need to remove
                            if (isAttached & Vec3.distance(position, jointPosition) > DETACH_DISTANCE) {
                                isAttached = false;
                                var newDetachEntityProperties = Entities.getEntityProperties(entityID);
                                touchJSONUserData(newDetachEntityProperties, function(userData) {
                                    userData.Attachment.attached = false;
                                });
                                Entities.editEntity(_entityID, {
                                    parentID: "{00000000-0000-0000-0000-000000000000}",
                                    lifetime: Entities.getEntityProperties(_entityID, ["age"]).age + 60,
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
                    });
                }, 300);
            } else {
                // We are adjusting OR we can remove
                var properties = Entities.getEntityProperties(entityID);
                var originalPosition = properties.position;
                this.intervalFunc = Script.setInterval(function(){
                    var newPos = Entities.getEntityProperties(entityID, ['position']).position;
                    if (Vec3.distance(newPos, originalPosition) > DETACH_DISTANCE) {
                        isAttached = false;
                        var newDetachEntityProperties = Entities.getEntityProperties(entityID);
                        touchJSONUserData(newDetachEntityProperties, function(userData) {
                            userData.Attachment.attached = false;
                        });
                        Entities.editEntity(_entityID, {
                            parentID: "{00000000-0000-0000-0000-000000000000}",
                            lifetime: Entities.getEntityProperties(_entityID, ["age"]).age + 60,
                            userData: newDetachEntityProperties.userData                            
                        });
                    }
                }, 1000);
            }
            
        },
        releaseGrab: function() {
            // We do not care about attaching/detaching if we are not being held
            print("Releasing grab");
            Script.clearInterval(this.intervalFunc);
        }
    };
    return new AttachableItem(); 
});
