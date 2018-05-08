//
// animatedBrush.js
// 
// Author: MGCraftsman
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
function AnimatedBrushClass() {}

/**
 * Called on every frame draw after the user stops painting
 * 
 * @abstract
 * @param deltaSeconds, the number of seconds past since the last frame was rendered
 * @param entityID: the id of the polyline being drawn
 * @param fingerOverlayID: the id of the overlay that shows over the finger when using fingerpaint
 */
AnimatedBrushClass.prototype.onUpdate = function(deltaSeconds, entityID) {
    throw "Abstract method onUpdate not implemented";
};

/**
 * This function updates the user data so in the next frame the animation gets the previous values.\
 *
 * @param entityID: the id of the polyline being animated
 * @param animatedBrushObject: the animation object (should be a subclass of animatedBrush)
 */
AnimatedBrushClass.prototype.updateUserData = function(entityID, animatedBrushObject) {
    var prevUserData = Entities.getEntityProperties(entityID, 'userData').userData;

    if (prevUserData) {
        prevUserData = prevUserData == "" ? new Object() : JSON.parse(prevUserData); 
        if (prevUserData.animations != null && prevUserData.animations[animatedBrushObject.NAME] != null) {
            delete prevUserData.animations[animatedBrushObject.NAME];
            prevUserData.animations[animatedBrushObject.NAME] = animatedBrushObject;        
        }
        prevUserData.timeFromLastAnimation = Date.now();
        Entities.editEntity(entityID, {userData: JSON.stringify(prevUserData)});
    }
};

AnimatedBrush = AnimatedBrushClass;
