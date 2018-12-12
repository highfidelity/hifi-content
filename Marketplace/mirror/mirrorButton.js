//
//  mirrorButton.js
//
//  Edited 11/2/18 by Liv Erickson 
//  Created by Rebecca Stankus on 8/30/17.
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// This script acts on the reflection box in front of the mirror so that when and avatar
// enters the area, the mirror will reflect an image via the spectator camera

(function () {
    var mirrorID;
    var mirrorOn = false;
    
    var toggleMirrorMode = function() {
        if (!mirrorOn) {
            Entities.callEntityMethod(mirrorID, 'mirrorOverlayOn');
            mirrorOn = true;
        } else {
            Entities.callEntityMethod(mirrorID, 'mirrorOverlayOff');
            mirrorOn = false;
        }
    };
    
    // get id of reflection area and mirror
    this.preload = function(entityID) {
        mirrorID = Entities.getEntityProperties(entityID, 'parentID').parentID;
    };

    // when avatar triggers reflection area, begin reflecting
    this.mousePressOnEntity = function(entityID, event) {
        if (!HMD.active && event.isLeftButton) {
            toggleMirrorMode();
        }
    };

    // when avatar triggers reflection area, begin reflecting
    this.stopFarTrigger = function(entityID, event) {
        toggleMirrorMode();
    };
});