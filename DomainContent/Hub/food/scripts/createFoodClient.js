//
// createFoodClient.js
// A script to create avatar entity food clones from the original
// 
// Author: Elisa Lupin-Jimenez
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// All assets are under CC Attribution Non-Commerical
// http://creativecommons.org/licenses/
//

(function() {

    var Food = function() {};
  
    Food.prototype = {

        preload: function(entityID) {
            /* nothing to put here */
        },

        mousePressOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.isLeftButton) {
                var cameraMode = Camera.getModeString();
                var myAvatarProperties = {
                    scale: MyAvatar.scale,
                    orientation: MyAvatar.orientation,
                    position: MyAvatar.position
                };
                Entities.callEntityServerMethod(entityID, 'spawnFood', [cameraMode, JSON.stringify(myAvatarProperties)]);
            }
        }

    };
  
    return new Food();

});
