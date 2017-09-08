//
//  mirrorReflection.js
//
//  Created by Rebecca Stankus on 8/30/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// This script acts on the reflection box in front of the mirror so that when and avatar
// enters the area, the mirror will reflect an image via the spectator camera

(function () {
    print("Starting reflection script...............");
    var mirrorID, reflectionAreaID;
    // get id of reflection area and mirror
    this.preload = function(entityID) {
        reflectionAreaID = entityID;
        mirrorID = Entities.getEntityProperties(reflectionAreaID, 'parentID').parentID;
        print("Reflection area ID is : " + reflectionAreaID);
        print("Mirror area ID is : " + mirrorID);
    };

    // when avatar enters reflection area, begin reflecting
    this.enterEntity = function(entityID){
        Entities.callEntityMethod(mirrorID, 'mirrorOverlayOn');
        print("Mirror is now reflecting.");
    };

    // when avatar leaves reflection area, stop reflecting
    this.leaveEntity = function (entityID) {
        Entities.callEntityMethod(mirrorID, 'mirrorOverlayOff');
        print("Mirror is NOT reflecting anymore.");
    };
});
