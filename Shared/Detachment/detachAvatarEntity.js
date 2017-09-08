//
//  detachAvatarEntity.js
//
//  Created by Rebecca Stankus on 09/08/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// This script detaches an avatar entity from the parent joint when it is moved beyond a certain distance from its parent joint

(function () {
    print("Starting detachment script...............");

    var _entityID, entityPosition, parentJointIndex, parentPosition, checkDetach;

    // get id of reflection area and mirror
    this.preload = function(entityID) {
        _entityID = entityID;
        entityPosition = Entities.getEntityProperties(_entityID, 'position').position;
        parentJointIndex = Entities.getEntityProperties(_entityID, 'parentJointIndex').parentJointIndex;
        // print("Attachment ID is : " + _entityID);
        // print("Parent joint index is : " + parentJointIndex);
        //  parentJointName = MyAvatar.getJointNames()[parentJointIndex];
        //  print("Parent joint name is : " + parentJointName);
        parentPosition = MyAvatar.getJointPosition(parentJointIndex);
        // print("Entity position is : " + JSON.stringify(entityPosition));
        // print("Parent position is : " + JSON.stringify(parentPosition));
    };

    // distanceToParent = Vec3.distance(entityPosition, parentPosition);
    // print("Distance to parent joint is : " + distanceToParent);
    
    checkDetach = Script.setInterval(function() {
        entityPosition = Entities.getEntityProperties(_entityID, 'position').position;
        var distanceToParent = Vec3.distance(entityPosition, parentPosition);
        print("Distance to parent joint is : " + distanceToParent);
        if (distanceToParent > 0.6) {
            print("I am no longer in setInterval...goodbye");
            Entities.editEntity(_entityID, {parentID: "{00000000-0000-0000-0000-000000000000}"});
            print (Entities.getEntityProperties(_entityID, 'parentJointIndex').parentJointIndex);
            print("Detaching....Distance to parent joint is : " + distanceToParent);
            Script.clearInterval(checkDetach);
        } 
    }, 100);
    
// exit script
});
