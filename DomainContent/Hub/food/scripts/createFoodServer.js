//
// createFoodServer.js
// 
// Author: Elisa Lupin-Jimenez
// Modified from "ShatterPlateServer.js" by Liv Erickson
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function(){
    var LIFETIME = 30; // seconds
    var CRUNCH_SCRIPT = Script.resolvePath("./crunch.js");
    var INTERVAL = 5000;
    var DISTANCE = 0.5;
    var DEBUG = false;

    var foodProperties; 
    var originalFoodName;
    
    function checkClonesAndUpdate() {
        var count = 0;
        var found = Entities.findEntities(foodProperties.position, DISTANCE);
        found.forEach(function(foundEntity) {
            var name = Entities.getEntityProperties(foundEntity, 'name').name;
            var tempName = originalFoodName + "-temp";
            if (DEBUG) {
                print("temp name is: " + tempName);
            }
            if (name === tempName) {
                count++;
            }
        });
        if (count === 0) {
            if (DEBUG) {
                print("adding replacement burger");
            }
            Entities.addEntity(foodProperties);
        }
    }

    var FoodSpawner = function() {
        /* nothing to put here */
    };

    FoodSpawner.prototype = {
        remotelyCallable: ['spawnFood'],

        preload: function(entityID) {
            if (DEBUG) {
                print("preload for createFoodServer.js");
            }
            var properties = Entities.getEntityProperties(entityID, 
                ["position", "rotation", "dimensions", "modelURL", 
                    "name", "dimensions", "description", "userData"]);
            originalFoodName = properties.name;
            foodProperties = {
                name: properties.name + "-temp",
                descript: properties.description,
                type: "Model",
                shapeType: "compound",
                modelURL: properties.modelURL,
                script: CRUNCH_SCRIPT,
                lifetime: LIFETIME,
                position: properties.position,
                rotation: properties.rotation,
                dimensions: properties.dimensions,
                dynamic: true,
                gravity: {x: 0, y: 0, z: 0},
                collisionless: true,
                visible: false,
                grabbable: true,
                userData: properties.userData
            };        

            Script.setInterval(checkClonesAndUpdate, INTERVAL);
        },

        spawnFood: function(entityID, args) {
            var cameraMode = args[0];
            var myAvatarProperties = JSON.parse(args[1]);
            var scale = myAvatarProperties.scale;
            var orientation = myAvatarProperties.orientation;
            var position = myAvatarProperties.position;
            var rezOffset;
            if (cameraMode === "first person") {
                rezOffset = {
                    x: 0.0,
                    y: 0.4,
                    z: -0.5
                };

            } else {
                rezOffset = {
                    x: 0.0,
                    y: 0.7,
                    z: -0.5
                };
            }
            rezOffset = Vec3.multiply(rezOffset, scale);
            var newPosition = Vec3.sum(position, Vec3.multiplyQbyV(orientation, rezOffset));
            var newFoodProperties = JSON.parse(JSON.stringify(foodProperties));
            newFoodProperties.visible = true;
            newFoodProperties.collisionless = false;
            newFoodProperties.position = newPosition;
            Entities.addEntity(newFoodProperties);
        },

        unload: function() {
            if (DEBUG) {
                print("unload createFoodServer.js");
            }
            Script.clearInterval(checkClonesAndUpdate);
        }
    };

    return new FoodSpawner();
});
