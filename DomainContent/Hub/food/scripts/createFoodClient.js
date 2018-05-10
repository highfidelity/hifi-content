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

/* globals Entities, SoundCache, Script */

(function() {
  
    var LIFETIME = 30;
    var foodProperties;

    var Food = function() {};
  
    Food.prototype = {
        foodProperties: null,

        preload: function(entityID) {
            var properties = Entities.getEntityProperties(entityID, 
                ["position", "rotation", "dimensions", "modelURL", 
                    "name", "dimensions", "description", "userData"]);
            foodProperties = {
                type: "Model",
                modelURL: properties.modelURL,
                name: properties.name + "-clone",
                description: properties.description,
                shapeType: "compound",
                position: properties.position,
                script: Script.resolvePath("./crunch.js"),
                dimensions: properties.dimensions,
                grabbable: true,
                lifetime: LIFETIME,
                dynamic: true,
                userData: properties.userData
            };
        },

        mousePressOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.isLeftButton) {
                var REZ_OFFSET;
                if (Camera.getModeString() === "first person") {
                    REZ_OFFSET = {
                        x: 0.0,
                        y: 0.4 * MyAvatar.scale,
                        z: -0.5 * MyAvatar.scale
                    };
                } else {
                    REZ_OFFSET = {
                        x: 0.0,
                        y: 0.7 * MyAvatar.scale,
                        z: -0.5 * MyAvatar.scale
                    };
                }
                var position = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, REZ_OFFSET));
                foodProperties.position = position;
                Entities.addEntity(foodProperties, true);
            }
        },

        startNearGrab: function() {
            Entities.callEntityServerMethod(foodProperties.entityID, 'createFoodClone', '');
        }

    };
  
    return new Food();

});
