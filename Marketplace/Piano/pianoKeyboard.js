//
//  pianoKeyboard.js
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
    var NEGATIVE = -1;
    var fingerEntities = [];
    var distance;
    var interval;

    var Keyboard = function() {
    };

    Keyboard.prototype = {
        preload: function(entityID) {

        },
        enterEntity: function() {
            this.createFingertipEntity("LeftHandIndex4");
            this.createFingertipEntity("LeftHandThumb4");
            this.createFingertipEntity("LeftHandPinky4");
            this.createFingertipEntity("LeftHandRing4");
            this.createFingertipEntity("LeftHandMiddle4");
            this.createFingertipEntity("RightHandIndex4");
            this.createFingertipEntity("RightHandThumb4");
            this.createFingertipEntity("RightHandPinky4");
            this.createFingertipEntity("RightHandRing4");
            this.createFingertipEntity("RightHandMiddle4");
            interval = Script.setInterval(this.updatePositions, POSITION_CHECK_INTERVAL_MS);
            Script.setTimeout(function () {
                Script.clearInterval(interval);
            }, POSITION_CHECK_TIMEOUT_MS);
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
            if (MyAvatar.getJointIndex(finger) === NEGATIVE) {
                finger = finger.substr(0, finger.length + NEGATIVE);
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
                name: "Piano Fingertip Entity",
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
            this.updatePositions();
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
            this.leaveEntity();
        }
    };
    return new Keyboard();
});
