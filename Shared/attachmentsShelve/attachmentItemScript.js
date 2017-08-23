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
    var _listeningChannel = null;
    var _virtualHoldController = null;
    
    var WANT_DEBUG = true;

    var ATTACHMENT_CHANNEL_PREFIX = 'attachmentItem-';

    var TOTAL_HOLD_LIFETIME = 60; // seconds
    
    var DEFAULT_SNAP_DISTANCE = 0.3;
    var HAND_LEFT = 0;
    var HAND_RIGHT = 1;

    var LEFT_RIGHT_PLACEHOLDER = '[LR]';

    var ATTACH_SOUND = SoundCache.getSound(Script.resolvePath('sound/attach_sound_1.wav'));
    var DETACH_SOUND = SoundCache.getSound(Script.resolvePath('sound/detach.wav'));

    var debugPrint = function(message) {};
    if (WANT_DEBUG) {
        debugPrint = function(message) {
            print(message);
        }
    }

    var getEntityProperty = function(entityID, property) {
        return Entities.getEntityProperties(entityID, property)[property];
    };

    var _this;
    function VirtualHoldController(hand, holdableEntity, localPosition, localRotation) {
        _this = this;
        _this.hand = hand;
        _this.holdableEntity = holdableEntity;
        _this.localPosition = localPosition;
        _this.localRotation = localRotation;
        _this.controllerWasReleased = false;
        _this.cleanedUp = false;
        _this.init();
    }

    VirtualHoldController.prototype = {
        hand: null,
        holdableEntity: null,
        holdAction: null,
        controllerWasReleased: null,
        mappingName: null,
        mapping: null,
        cleanedUp: null,
        onRelease: null,
        init: function() {
            Script.update.connect(_this.update);
            Messages.sendMessage('Hifi-Hand-Disabler', _this.hand);

            _this.mappingName = 'VirtualHoldController_' + _this.hand + '_' + _this.holdableEntity;

            _this.mapping = Controller.newMapping(_this.mappingName);
            var SMOOTH_TRIGGER_RELEASE_THRESHOLD = 0.3;
            var GRIP_BUTTON_ACTIVE_THRESHOLD = 0.5;
            var smoothTriggerCheck = function(value) {
                if (value < SMOOTH_TRIGGER_RELEASE_THRESHOLD) {
                    _this.release();
                }
            };
            var gripButtonCheck = function(value) {
                if (value > GRIP_BUTTON_ACTIVE_THRESHOLD) {
                    _this.release();
                }
            }

            var NEAR_GRABBING_ACTION_TIMEFRAME = 0.05;
            var NEAR_GRABBING_KINEMATIC = true;
            var NEAR_GRABBING_IGNORE_IK = false;
            _this.holdAction = Entities.addAction('hold', _this.holdableEntity, {
                hand: _this.hand,
                timeScale: NEAR_GRABBING_ACTION_TIMEFRAME,
                relativePosition: _this.localPosition,
                relativeRotation: _this.localRotation,
                ttl: TOTAL_HOLD_LIFETIME,
                kinematic: NEAR_GRABBING_KINEMATIC,
                kinematicSetVelocity: true,
                ignoreIK: NEAR_GRABBING_IGNORE_IK
            });

            if (_this.hand === 'left') {
                _this.mapping.from([Controller.Standard.LT]).peek().to(smoothTriggerCheck);
                _this.mapping.from([Controller.Standard.LB]).peek().to(gripButtonCheck);
                _this.mapping.from([Controller.Standard.LeftGrip]).peek().to(gripButtonCheck);
            } else {
                _this.mapping.from([Controller.Standard.RT]).peek().to(smoothTriggerCheck);
                _this.mapping.from([Controller.Standard.RB]).peek().to(gripButtonCheck);
                _this.mapping.from([Controller.Standard.RightGrip]).peek().to(gripButtonCheck);
            }
            _this.mapping.enable();

            Entities.callEntityMethod(_this.holdableEntity, 'startNearGrab', [_this.hand, MyAvatar.sessionUUID]);

        },
        update: function(deltaTime) {
            // check if entity still exists
            if (Object.keys(Entities.getEntityProperties(_this.holdableEntity)).length === 0) {
                debugPrint('Could not find holdableEntity. Cleaning up!');
                _this.cleanup();
                return;
            }
            // check if controller released
            if (_this.controllerWasReleased) {
                debugPrint('Controller was already released. Cleaning up!');
                _this.cleanup();
                return;
            }
            Entities.callEntityMethod(_this.holdableEntity, 'continueNearGrab', [_this.hand, MyAvatar.sessionUUID]);
        },
        release: function() {
            if (_this.controllerWasReleased) {
                debugPrint('Controller was already released!');
                return;
            }
            _this.controllerWasReleased = true;
            Entities.callEntityMethod(_this.holdableEntity, 'releaseGrab', [_this.hand, MyAvatar.sessionUUID]);

            Entities.deleteAction(_this.holdableEntity, _this.holdAction);

            if (_this.onRelease !== null) {
                _this.onRelease.call(_this);
            }

            debugPrint('We don\'t need a virtual controller after release. Cleaning up!');
            _this.cleanup();
        },
        cleanup: function() {
            if (_this.cleanedUp) {
                return;
            }
            _this.mapping.disable();
            Messages.sendMessage('Hifi-Hand-Disabler', 'none');
            Script.update.disconnect(_this.update);
            _this.cleanedUp = true;
        }
    };


    var getUserData = function() {
        try {
            return JSON.parse(getEntityProperty(_entityID, 'userData'));
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

    var getScriptTimestamp = function() {
        return getEntityProperty(_entityID, 'scriptTimestamp');
    }

    var messageHandler = function(channel, message, sender, localOnly) {
        if (channel !== _listeningChannel || localOnly) {
            return;
        }

        try {
            var data = JSON.parse(message);
            print('receivedData: ' + JSON.stringify(data));
            if (data.sessionUUID !== MyAvatar.sessionUUID) {
                print('Session UUID does not match');
                return;
            }
            if (data.action === 'attach') {
                var attempts = 0;
                var MAX_ATTEMPTS = 10;
                var attachAttemptInterval = null;
                var attachOnEntityFound = function() {
                    if (Object.keys(Entities.getEntityProperties(data.entityID, 'position')).length === 0) {
                        attempts++;
                        if (attempts >= MAX_ATTEMPTS) {
                            Script.clearInterval(attachAttemptInterval);
                        }
                        return;
                    }
                    Script.clearInterval(attachAttemptInterval);
                    if (_virtualHoldController !== null) {
                        _virtualHoldController.cleanup();
                        _virtualHoldController = null;
                    }

                    _virtualHoldController = new VirtualHoldController(data.hand, data.entityID, data.localPosition, data.localRotation);
                    _virtualHoldController.onRelease = function() {
                        Messages.sendMessage(_listeningChannel, JSON.stringify({
                            action: 'release',
                            entityID: data.entityID
                        }));
                    };
                };
                attachAttemptInterval = Script.setInterval(attachOnEntityFound, 100);
            }
        } catch (e) {

        }
    };

    this.preload = function(entityID) {
        _entityID = entityID;
        debugPrint('loaded ' + entityID);
        _listeningChannel = ATTACHMENT_CHANNEL_PREFIX + entityID;
        Messages.subscribe(_listeningChannel);

        Messages.messageReceived.connect(messageHandler);
    };

    this.unload = function() {
        Messages.messageReceived.disconnect(messageHandler);

        if (_virtualHoldController !== null) {
            _virtualHoldController.cleanup();
        }
    }

    function attachmentAction(joint) {
        var attachmentData = getAttachmentData();
        if (attachmentData === null) {
            return;
        }
        var otherJoint = null;
        if (joint === undefined) {
            if (attachmentData.joint.indexOf(LEFT_RIGHT_PLACEHOLDER) !== -1) {
                joint = attachmentData.joint.replace(LEFT_RIGHT_PLACEHOLDER, _leftRightAttachToggle ? 'Left' : 'Right');
                debugPrint('joint = ' + joint);
                otherJoint = attachmentData.joint.replace(LEFT_RIGHT_PLACEHOLDER, _leftRightAttachToggle ? 'Right' : 'Left');
                debugPrint('otherJoint = ' + otherJoint);
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
            var attachmentModel = getEntityProperty(_entityID, 'modelURL');
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
                    position: getEntityProperty(_entityID, 'position'),
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
                    position: getEntityProperty(_entityID, 'position'),
                    volume: 0.4,
                    localOnly: true
                });
            }
            var joints = [joint];
            if (otherJoint !== null) {
                joints.push(joint);
            }
            UserActivityLogger.logAction('attachmentItemScript_detach', {
                joints: joints
            });
        }

        MyAvatar.setAttachmentsVariant(newAttachments);        
    }

    this.startFarTrigger = function(entityID, args) {
        attachmentAction();
    };

    this.startNearTrigger = function(entityID, args) {
        var handJointName = args[0] === 'left' ? 'LeftHand': 'RightHand';
        Messages.sendMessage(_listeningChannel, JSON.stringify({
            action: 'create',
            hand: args[0],
            handPosition: MyAvatar.getJointPosition(handJointName),
            handRotation: MyAvatar.getJointRotation(handJointName)
        }));
    };

    this.startNearGrab = function(entityID, args) {
        debugPrint('NearGrabStarting ' + JSON.stringify(args));
        _isGrabbing = true;
        _attachmentData = getAttachmentData();

        // send grab message if possible, to extend lifetime of object, after switching hand or giving attachment to other user:
        try {
            var attachmentServer = JSON.parse(getEntityProperty(entityID, 'userData')).attachmentServer;
            if (attachmentServer !== undefined) {
                Messages.sendMessage(attachmentServer, JSON.stringify({action: 'grab', entityID: entityID}));
            }
        } catch (e) {
            // e
        }
    };

    this.continueNearGrab = function(entityID, args) {
        if (_isGrabbing && _attachmentData !== null) {
            // debugPrint('NearGrabHappening ' + JSON.stringify(args));
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
                debugPrint('attach' + closestJoint.name);
                attachmentAction(closestJoint.name);
                Controller.triggerShortHapticPulse(0.3, args[0] === 'left' ? HAND_LEFT : HAND_RIGHT);
                Entities.deleteEntity(_entityID);
            }
        }
    };

    this.releaseGrab = function(entityID, args) {
        if (_isGrabbing) {
            _isGrabbing = false;
            debugPrint('ReleaseGrab ' + JSON.stringify(args));

            // legacy behavior:
            var name = getEntityProperty(entityID, 'name');
            if (name !== undefined && name.toLowerCase().indexOf('clone') !== -1) {
                Entities.deleteEntity(_entityID);
            }
        }
    };

    this.clickReleaseOnEntity = function(entityID, mouseEvent) {
        if (mouseEvent.isLeftButton) {
            attachmentAction();
        }
    };
});
