//
//  attachmentItemScript.js
//
//  Created by Thijs Wenker on 5/30/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*
    // User Data formats:

    {
        "Attachment": {
            "action": "attach",
            "joint": "Hips",
            "options": {
                "translation": {
                    "x": 0,
                    "y": -0.11,
                    "z": 0.04
                }
            }
        }
    }

    {
        "Attachment": {
            "action": "attach",
            "joint": "[LR]Hips",
            "snapDistance": 0.31,
            "options": {
                "translation": {
                    "x": 0,
                    "y": -0.11,
                    "z": 0.04
                }
            }
        }
    }

    {
        "Attachment": {
            "action": "clear",
            "joint": "Hips"
        }
    }

    {
        "Attachment": {
            "action": "clear",
            "joint": "[LR]ForeArm"
        }
    }
*/


(function() {
    var _entityID = null;
    var _isGrabbing = false;
    var _attachmentData = null;
    var _leftRightAttachToggle = false;


    var DEFAULT_SNAP_DISTANCE = 0.3;
    var HAND_LEFT = 0;
    var HAND_RIGHT = 1;

    var LEFT_RIGHT_PLACEHOLDER = '[LR]';

    var ATTACH_SOUND = SoundCache.getSound(Script.resolvePath('sound/attach_sound_1.wav'));
    var DETACH_SOUND = SoundCache.getSound(Script.resolvePath('sound/detach.wav'));


    var getUserData = function() {
        try {
            return JSON.parse(Entities.getEntityProperties(_entityID, 'userData').userData);
        } catch (e) {
            // e
            print('Could not retrieve valid userData');
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

    this.preload = function(entityID) {
        _entityID = entityID;
        print('loaded ' + entityID);
    };

    function attachmentAction(joint) {
        var attachmentData = getAttachmentData();
        if (attachmentData === null) {
            return;
        }
        var otherJoint = null;
        if (joint === undefined) {
            if (attachmentData.joint.indexOf(LEFT_RIGHT_PLACEHOLDER) !== -1) {
                joint = attachmentData.joint.replace(LEFT_RIGHT_PLACEHOLDER, _leftRightAttachToggle ? 'Left' : 'Right');
                print('joint = ' + joint);
                otherJoint = attachmentData.joint.replace(LEFT_RIGHT_PLACEHOLDER, _leftRightAttachToggle ? 'Right' : 'Left');
                print('otherJoint = ' + otherJoint);
            } else {
                joint = attachmentData.joint;
            }

            // flip the state if attaching
            if (attachmentData.action === 'attach') {
                _leftRightAttachToggle = !_leftRightAttachToggle;
            }
        }
        var currentAttachments = MyAvatar.getAttachmentsVariant();
        var newAttachments = [];
        currentAttachments.forEach(function(attachment) {
            // do not add the current joint data to the list of the joint that we are changing
            if (attachment.jointName !== joint && (attachmentData.action === 'attach' || attachment.jointName !== otherJoint)) {
                newAttachments.push(attachment);
            }
        });

        if (attachmentData.action === 'attach') {
            var attachmentModel = Entities.getEntityProperties(_entityID, 'modelURL').modelURL;
            var newAttachment = {
                jointName: joint,
                modelUrl: attachmentModel
            };
            for (var key in attachmentData.options) {
                if (attachmentData.options.hasOwnProperty(key)) {
                    newAttachment[key] = attachmentData.options[key];
                }
            }

            newAttachments.push(newAttachment);

            if (ATTACH_SOUND.downloaded) {
                Audio.playSound(ATTACH_SOUND, {
                    position: Entities.getEntityProperties(_entityID, 'position').position,
                    volume: 0.2,
                    localOnly: true
                });
            }
            var modelPathParts = attachmentModel.split('/');
            var fileName = modelPathParts[modelPathParts.length - 1];
            UserActivityLogger.logAction('attachmentItemScript_attach', {
                joint: joint,
                model: fileName
            });
        } else if (attachmentData.action === 'clear') {
            if (DETACH_SOUND.downloaded) {
                Audio.playSound(DETACH_SOUND, {
                    position: Entities.getEntityProperties(_entityID, 'position').position,
                    volume: 0.4,
                    localOnly: true
                });
            }
            var joints = [joint];
            if (otherJoint !== null) {
                joints.push(joint);
            }
            UserActivityLogger.logAction("attachmentItemScript_detach", {
                joints: joints
            });
        }

        MyAvatar.setAttachmentsVariant(newAttachments);        
    }
    this.startFarTrigger = function(entityID, args) {
        attachmentAction();
    };

    this.startNearGrab = function(entityID, args) {
        print('NearGrabStarting ' + JSON.stringify(args));
        _isGrabbing = true;
        _attachmentData = getAttachmentData();
    };
    this.continueNearGrab = function(entityID, args) {
        if (_isGrabbing && _attachmentData !== null) {
            print('NearGrabHappening ' + JSON.stringify(args));
            var snapDistance = _attachmentData.snapDistance !== undefined ? _attachmentData.snapDistance :
                DEFAULT_SNAP_DISTANCE;
            var entityPosition = Entities.getEntityProperties(entityID, 'position').position;

            var joints = [];
            var closestJoint = null;
            if (_attachmentData.joint.indexOf(LEFT_RIGHT_PLACEHOLDER) !== -1) {
                joints.push(_attachmentData.joint.replace(LEFT_RIGHT_PLACEHOLDER, 'Left'));
                joints.push(_attachmentData.joint.replace(LEFT_RIGHT_PLACEHOLDER, 'Right'));
            } else {
                joints.push(_attachmentData.joint);
            }

            joints.forEach(function(joint) {
                var targetJointPosition = MyAvatar.getJointPosition(joint);
                var distance = Vec3.distance(entityPosition, targetJointPosition);
                if (distance < snapDistance && (closestJoint === null || distance < closestJoint.distance)) {
                    closestJoint = {
                        name: joint,
                        distance: distance
                    };
                }
            });


            if (closestJoint !== null) {
                print('attach' + closestJoint.name);
                attachmentAction(closestJoint.name);
                Controller.triggerShortHapticPulse(0.3, args[0] === 'left' ? HAND_LEFT : HAND_RIGHT);
                Entities.deleteEntity(_entityID);
            }
            /*
            if (Vec3.distance(entityPosition, targetJointPosition) < snapDistance) {
                print('attach');
                attachmentAction();
                Entities.deleteEntity(_entityID);
            }*/
        }
    };
    this.releaseGrab = function(entityID, args) {
        if (_isGrabbing) {
            _isGrabbing = false;
            print('ReleaseGrab ' + JSON.stringify(args));
            Entities.deleteEntity(_entityID);
        }
    };

    this.clickReleaseOnEntity = function(entityID, mouseEvent) {
        if (mouseEvent.isLeftButton) {
            attachmentAction();
        }
    };
});
