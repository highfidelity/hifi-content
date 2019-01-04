//
//  keyboardZone.js
//
//  created by Rebecca Stankus on 01/16/18
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var MIN_DISTANCE_TO_FINGERTIP = 0.001;
    var FINGER_ENTITY_DIMENSIONS = {x: 0.005,y: 0.005,z: 0.005};
    var POSITION_CHECK_INTERVAL_MS = 100;
    var POSITION_CHECK_TIMEOUT_MS = 3000;

    var fingerEntities = [];
    var distance;
    var interval;
    var _this;

    var Keyboard = function() {
        _this = this;
    };

    Keyboard.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
        },

        enterEntity: function() {
            _this.createFingertipEntity("LeftHandIndex4");
            _this.createFingertipEntity("LeftHandThumb4");
            _this.createFingertipEntity("LeftHandPinky4");
            _this.createFingertipEntity("LeftHandRing4");
            _this.createFingertipEntity("LeftHandMiddle4");
            _this.createFingertipEntity("RightHandIndex4");
            _this.createFingertipEntity("RightHandThumb4");
            _this.createFingertipEntity("RightHandPinky4");
            _this.createFingertipEntity("RightHandRing4");
            _this.createFingertipEntity("RightHandMiddle4");
            interval = Script.setInterval(_this.updatePositions, POSITION_CHECK_INTERVAL_MS);
            Script.setTimeout(function () {
                Script.clearInterval(interval);
            }, POSITION_CHECK_TIMEOUT_MS);
            var keyboardBase = Entities.getEntityProperties(_this.entityID, 'parentID').parentID;
            MyAvatar.disableHandTouchForID(keyboardBase);
            Entities.getChildrenIDs(keyboardBase).forEach(function(keyboardPiece) {
                MyAvatar.disableHandTouchForID(keyboardPiece);
            });
        },

        leaveEntity: function() {
            if (interval) {
                Script.clearInterval(interval);
            }
            fingerEntities.forEach(function(entity) {
                Entities.deleteEntity(entity);
            });
            fingerEntities = [];
        },

        createFingertipEntity: function(finger) {
            if (MyAvatar.getJointIndex(finger) === -1) {
                finger = finger.substr(0, finger.length + -1);
                finger = finger.concat("3");
            }
            var entityData = {
                angularDamping: 0,
                clientOnly: 0,
                collidesWith: "static,",
                collisionMask: 1,
                damping: 0,
                dimensions: FINGER_ENTITY_DIMENSIONS,
                dynamic: 1,
                name: "Keyboard Fingertip Entity",
                parentID: MyAvatar.sessionUUID,
                parentJointName: finger,
                parentJointIndex: MyAvatar.getJointIndex(finger),
                position: "",
                visible: 0,
                type: "Sphere",
                userData: "{\"grabbableKey\":{\"grabbable\":false}}"
            };
            entityData.position = MyAvatar.getJointPosition(finger);
            var fingertipEntity = Entities.addEntity(entityData);
            fingerEntities.push(fingertipEntity);
            _this.updatePositions();
        },

        updatePositions: function() {
            fingerEntities.forEach(function(entity) {
                var properties = Entities.getEntityProperties(entity, ['position', 'parentJointIndex']);
                var fingerEntityPosition = properties.position;
                var fingertipPosition = MyAvatar.getJointPosition(properties.parentJointIndex);
                distance = Vec3.distance(fingerEntityPosition, fingertipPosition);
                if (distance > MIN_DISTANCE_TO_FINGERTIP) {
                    Entities.editEntity(entity, {position: fingertipPosition});
                    fingerEntityPosition = Entities.getEntityProperties(entity, 'position').position;
                    fingertipPosition = MyAvatar.getJointPosition(properties.parentJointIndex);
                    distance = Vec3.distance(fingerEntityPosition, fingertipPosition);
                }
            });
        },

        unload: function(){
            _this.leaveEntity();
        }
    };
    return new Keyboard();
});
