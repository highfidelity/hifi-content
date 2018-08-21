"use strict";

// ZoneDeleteEntitiesOnExit.js
//
// Copyright 2018 High Fidelity, Inc.
// Created by Robin Wilson 7/5/2018
//
// Add this script to a Zone Entity.
// Will search for entities with the contained string NAME_TO_SEARCH_FOR.
// Configure whether to search for children entities of a joint or a radius of the Avatar's position.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function () {

    // Configurable variables
    var NAME_TO_SEARCH_FOR = "marker"; // substring of the entity name to delete
    var JOINT1_NAME = "RightHand"; // joint name on Avatar to search for children entities
    var JOINT2_NAME = "LeftHand"; // joint name on Avatar to search for or "" if not using a second joint 

    // true - use JOINT1_NAME and/or JOINT2_NAME 
    // false - search 1 m from the avatar's position for the entity name
    var isSearchingByJoints = true;
    var SEARCH_RADIUS = 1; // if isSearchingByJoints is true, will search this radius from the avatar

    var ZoneDeleteEntitiesOnExit = function () {

    };

    ZoneDeleteEntitiesOnExit.prototype = {
        enterEntity: function (entityID) {
            if (isSearchingByJoints) {
                // set joint indexes
                this.jointIndex1 = MyAvatar.getJointIndex(JOINT1_NAME);
                this.jointIndex2 = MyAvatar.getJointIndex(JOINT2_NAME);
            }

        },

        leaveEntity: function (entityID) {
            this.deleteEntities(NAME_TO_SEARCH_FOR);
        },

        deleteEntities: function (name) {
            var entityList;

            if (isSearchingByJoints) {
                if (!this.jointIndex1 || !this.jointIndex2) {
                    this.jointIndex1 = MyAvatar.getJointIndex(JOINT1_NAME);
                    this.jointIndex2 = MyAvatar.getJointIndex(JOINT2_NAME);
                }

                var jointList1 = this.jointIndex1 !== -1
                    ? Entities.getChildrenIDsOfJoint(MyAvatar.sessionUUID, this.jointIndex1)
                    : [];
                var jointList2 = this.jointIndex2 !== -1
                    ? Entities.getChildrenIDsOfJoint(MyAvatar.sessionUUID, this.jointIndex2)
                    : [];

                entityList = jointList1.concat(jointList2);
            } else {
                entityList = Entities.findEntities(MyAvatar.position, SEARCH_RADIUS);
            }

            entityList.forEach(function (entityID) {
                var entityName = Entities.getEntityProperties(entityID, "name").name;

                if (entityName.indexOf(name) > -1) {
                    Entities.deleteEntity(entityID);
                }

            });
        }
    };

    return new ZoneDeleteEntitiesOnExit();
});
