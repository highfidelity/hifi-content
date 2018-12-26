//
// noisemakerSpawner.js
// 
// Created by Rebecca Stankus on 12/20/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
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
                Entities.callEntityServerMethod(entityID, 'spawnNoisemaker', [cameraMode, JSON.stringify(myAvatarProperties)]);
            }
        }
    };
  
    return new Food();

});
