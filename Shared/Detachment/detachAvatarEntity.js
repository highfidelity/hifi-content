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
    var _entityID, entityPosition, parentJointIndex, parentPosition, checkDetach;

    // get id of reflection area and mirror
    this.preload = function(entityID) {
        _entityID = entityID;
        entityPosition = Entities.getEntityProperties(_entityID, 'position').position;
        parentJointIndex = Entities.getEntityProperties(_entityID, 'parentJointIndex').parentJointIndex;
        parentPosition = MyAvatar.getJointPosition(parentJointIndex);
    };
    
    // continuously check distance between parent joint and attachment entity. remove parent relationship when moved beyond a certain distance
    checkDetach = Script.setInterval(function() {
        entityPosition = Entities.getEntityProperties(_entityID, 'position').position;
        var distanceToParent = Vec3.distance(entityPosition, parentPosition);
        var detachDistance = 0.6;
        if (distanceToParent > detachDistance) {
            Entities.editEntity(_entityID, {parentID: "{00000000-0000-0000-0000-000000000000}"});
            Script.clearInterval(checkDetach);
        } 
    }, 100);
    
// exit script
});
