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

    var _this, _entityID;
    var _attachmentData;
    var _supportedJoints = [];
    var isAttached = false;

    function AttachableItem() {
        _this = this;
    }
    AttachableItem.prototype = {
        preload : function(entityID) {
            print("Loading attachmentItemScript.js");
            _entityID = entityID;
            var properties = Entities.getEntityProperties(entityID);
            _attachmentData = JSON.parse(properties.userData).Attachment;
            if (_attachmentData.joint.indexOf(LEFT_RIGHT_PLACEHOLDER) !== -1) {
                var baseJoint = _attachmentData.joint.substring(4);
                _supportedJoints.push("Left".concat(baseJoint));
                _supportedJoints.push("Right".concat(baseJoint));
            } else {
                _supportedJoints.push(_attachmentData.joint);
            }
        },
        startNearGrab: function(entityID, args) {
            var hand = args[0] === "left" ? 0 : 1;
            this.intervalFunc = Script.setInterval(function(){
                var position = Entities.getEntityProperties(_entityID, ['position']).position;
                _supportedJoints.forEach(function(joint) {
                    var jointPosition = MyAvatar.getJointPosition(joint);
                    if (! isAttached) {
                        if (Vec3.distance(position, jointPosition) <= ATTACH_DISTANCE) {
                            isAttached = true;
                            Entities.editEntity(_entityID, {
                                parentID: MyAvatar.sessionUUID,
                                parentJointIndex: MyAvatar.getJointIndex(joint),
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
                    // We're attached, need to check to remove
                        if (isAttached & Vec3.distance(position, jointPosition) >= DETACH_DISTANCE) {
                            isAttached = false;
                            Entities.editEntity(_entityID, {
                                parentID: "{00000000-0000-0000-0000-000000000000}",
                                lifetime: Entities.getEntityProperties(_entityID, ["age"]).age + 60
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
        },
        releaseGrab: function() {
            // We do not care about attaching/detaching if we are not being held
            print("Releasing grab");
            Script.clearInterval(this.intervalFunc);
        }
    };
    return new AttachableItem(); 
});
