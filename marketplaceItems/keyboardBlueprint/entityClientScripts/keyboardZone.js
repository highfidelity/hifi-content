//
//  keyboardZone.js
//
//  created by Rebecca Stankus on 01/16/18
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* global Entities, MyAvatar, Script */

(function() {
    var MIN_DISTANCE_TO_FINGERTIP_M = 0.001;
    var FINGER_ENTITY_DIMENSIONS = {x: 0.005,y: 0.005,z: 0.005};
    var POSITION_CHECK_INTERVAL_MS = 100;
    var POSITION_CHECK_TIMEOUT_MS = 3000;

    var fingerEntities = [];
    var updateSpherePositionInterval;
    var _this;

    var Keyboard = function() {
        _this = this;
    };

    Keyboard.prototype = {

        /* ON PRELOAD: Save a reference to this key */
        preload: function(entityID) {
            _this.entityID = entityID;
        },

        /* ENTER ENTITY: Upon entering this zone around the keyboard, create small sphere entities at the tip of each 
        finger and set up an interval that checks the distance between each sphere entity and its respective fingertip 
        every 100 MS for 3 seconds. This interval will account for cases where the entities were not placed in the 
        correct position, usually due avatar movement upon entering the zone, by moving the sphere closer to the 
        correct position on every interval check if possible. The keyboard base is found and hand touch is removed 
        for it and all of its child entities as all parts of the keyboard are parented to this base. This will 
        prevent fingers from moving uncontrollably upon approaching parts of the keyboard. */
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
            updateSpherePositionInterval = Script.setInterval(_this.updatePositions, POSITION_CHECK_INTERVAL_MS);
            Script.setTimeout(function () {
                if (updateSpherePositionInterval) {
                    Script.clearInterval(updateSpherePositionInterval);
                    updateSpherePositionInterval = null;
                }
            }, POSITION_CHECK_TIMEOUT_MS);
            var keyboardBase = Entities.getEntityProperties(_this.entityID, 'parentID').parentID;
            MyAvatar.disableHandTouchForID(keyboardBase);
            Entities.getChildrenIDs(keyboardBase).forEach(function(keyboardPiece) {
                MyAvatar.disableHandTouchForID(keyboardPiece);
            });
        },

        /* LEAVE ENTITY: Upon leaving the zone around the keyboard, clear the interval if it has not yet stopped and 
        delete all spheres attached to the fingers*/
        leaveEntity: function() {
            if (updateSpherePositionInterval) {
                Script.clearInterval(updateSpherePositionInterval);
                updateSpherePositionInterval = null;
            }
            fingerEntities.forEach(function(entity) {
                Entities.deleteEntity(entity);
            });
            fingerEntities = [];
        },

        /* CREATE FINGER TIP ENTITIES: Find the 4th joint (fingertip) for each finger and create a small sphere at its 
        position that is parented to the avatar at that joint. If the 4th joint does not exist, fall back to using the 
        3rd joint. Store the IDs of these spheres for later use and update the position for each one. */
        createFingertipEntity: function(finger) {
            if (MyAvatar.getJointIndex(finger) === -1) {
                finger = finger.substr(0, finger.length - 1);
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

        /* For each sphere entity at the finger tips, get its position and the position of its parent joint. If the 
        distance is more than the preset minimum, the sphere is too far away from the actual finger joint. Move it closer.*/
        updatePositions: function() {
            fingerEntities.forEach(function(entity) {
                var properties = Entities.getEntityProperties(entity, ['position', 'parentJointIndex']);
                var fingerEntityPosition = properties.position;
                var fingertipPosition = MyAvatar.getJointPosition(properties.parentJointIndex);
                var distance = Vec3.distance(fingerEntityPosition, fingertipPosition);
                if (distance > MIN_DISTANCE_TO_FINGERTIP_M) {
                    Entities.editEntity(entity, {position: fingertipPosition});
                }
            });
        },

        /* ON UNLOADING THE SCRIPT: Make sure the avatar leaves the zone so extra entities are deleted and intervals ended */
        unload: function(){
            _this.leaveEntity();
        }
    };
    return new Keyboard();
});
