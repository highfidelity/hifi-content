//
// animatedBrushScript.js
// 
// Author: MGCraftsman
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
(function() {    
    Script.include("animatedBrushesList.js");
    var UPDATE_TIME = 33; //run at aproximatelly 30fps
    var MIN_PLAY_DISTANCE = 6; //Minimum distance from player to entity in order to play animation
    var self = this;
    this.preload = function(entityID) {
        self.intervalID = Script.setInterval(function() {
            var properties = Entities.getEntityProperties(entityID, ['lastEditedBy', 'position', 'userData']);
            if (MyAvatar.sessionUUID != properties.lastEditedBy) {
                Script.clearInterval(self.intervalID);
                return;
            }

            if (Vec3.withinEpsilon(MyAvatar.position, properties.position, MIN_PLAY_DISTANCE)) {
                var userData = properties.userData;
                if (userData) {
                    var userDataObject = JSON.parse(userData);
                    var animationObject = userDataObject.animations;
                    var newAnimationObject = null;
                    if (!userDataObject.timeFromLastAnimation) {
                        userDataObject.timeFromLastAnimation = Date.now();
                    }
                    Object.keys(animationObject).forEach(function(animationName) {
                        newAnimationObject = animationObject[animationName];
                        newAnimationObject.__proto__ = AnimatedBrushesInfo[animationName].proto;
                        newAnimationObject.onUpdate(Date.now() - userDataObject.timeFromLastAnimation, entityID);
                    });
                }
            }        
        }, UPDATE_TIME);
    };
    this.unload = function() {
        Script.clearInterval(self.intervalID);
    };
});
