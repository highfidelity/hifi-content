//
//  attachmentItemScript.js
//
//  This script is a simplified version of the original attachmentItemScript.js 
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* globals utils, Selection */
(function() {
    var LEFT_RIGHT_PLACEHOLDER = '[LR]';
    var ATTACH_DISTANCE = 0.35;
    var DETACH_DISTANCE = 0.5;

    var _this, _entityID;
    var _attachmentData;
    var _supportedJoints = [];
    var isAttached = false;
    var previousHighlightID = 0;

    function AttachableItem() {
        _this = this;
    }
    AttachableItem.prototype = {
        preload : function(entityID) {
            print("Loading attachmentItemScript.js");
            _entityID = entityID;
            print("Attachment Entity ID: " + _entityID);
            _attachmentData = JSON.parse(Entities.getEntityProperties(entityID).userData).Attachment;
            print(JSON.stringify(_attachmentData.joint));
            if (_attachmentData.joint.indexOf(LEFT_RIGHT_PLACEHOLDER) !== -1) {
                var baseJoint = _attachmentData.joint.substring(3);
                _supportedJoints.push("Left".concat(baseJoint));
                _supportedJoints.push("Right".concat(baseJoint));
            } else {
                _supportedJoints.push(_attachmentData.joint);
            }
            print(JSON.stringify(_supportedJoints));            
        },
        startNearGrab: function() {
            this.intervalFunc = Script.setInterval(function(){
                var position = Entities.getEntityProperties(_entityID, ['position']).position;
                _supportedJoints.forEach(function(joint) {
                    var jointPosition = MyAvatar.getJointPosition(joint);
                    // TODO: make this less dumb
                    if (! isAttached) {
                        if (Vec3.distance(position, jointPosition) <= ATTACH_DISTANCE) {
                            isAttached = true;
                            Entities.editEntity(_entityID, {
                                parentID: MyAvatar.sessionUUID,
                                parentJointIndex: MyAvatar.getJointIndex(joint)
                            });
                        }
                    } else {
                    // We're attached, need to check to remove
                        if (Vec3.distance(position, jointPosition) >= DETACH_DISTANCE) {
                            isAttached = false;
                            Entities.editEntity(_entityID, {
                                parentID: "{00000000-0000-0000-0000-000000000000}"
                            });
                        }
                    }
                });
            }, 300);
            if (previousHighlightID !== _entityID) {
                Selection.addToSelectedItemsList("contextOverlayHighlightList", "entity", _entityID);
                previousHighlightID = _entityID;
            }
        },
        releaseGrab: function() {
            // We do not care about attaching/detaching if we are not being held
            print("Releasing grab");
            Script.clearInterval(this.intervalFunc);
            if (previousHighlightID !== 0) {
                Selection.removeFromSelectedItemsList("contextOverlayHighlightList", "entity", previousHighlightID);
                previousHighlightID = 0;
            }
        }
    };
    return new AttachableItem(); 
});
