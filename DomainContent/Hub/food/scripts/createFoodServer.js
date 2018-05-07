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

/* globals Entities, Uuid */

(function(){
    var LIFETIME = 30; // seconds
    var CHECK_INTERVAL = LIFETIME * 100; // milliseconds
    var CRUNH_SCRIPT = Script.resolvePath("./crunch.js");
    var MAX_FOOD = 5;
    var DEBUG = false;

    var foodProperties; 
    var spawnFoodInterval;
    var foodArray = [];
    
    var FoodSpawner = function(){
        // nothing here
    };

    FoodSpawner.prototype = {
        preload: function(entityID) {
            if (DEBUG) {
                print("preload for createFoodServer.js");
            }
            var properties = Entities.getEntityProperties(entityID, 
                ["position", "dimensions", "modelURL", "name", "dimensions", "description"]);
            foodProperties = {
                type: "Model",
                shapeType: "capsule-z",
                modelURL: properties.modelURL,
                script: CRUNH_SCRIPT,
                lifetime: LIFETIME,
                position: properties.position,
                dimensions: properties.dimensions,
                dynamic: true,
                gravity: {x: 0, y: 0, z: 0},
                collisionless: true,
                visible: true,
                userData : "{\"grabbableKey\":{\"grabbable\":true}}"
            };        
            spawnFoodInterval = Script.setInterval(function() {
                if (foodArray.length < MAX_FOOD) {
                    var foodID = Entities.addEntity(foodProperties);
                    foodArray.push(foodID);
                } else {
                    foodArray.pop();
                }
                
            }, CHECK_INTERVAL);
        },
        unload: function() {
            if (DEBUG) {
                print("unload createFoodServer.js");
            }
            Script.clearInterval(spawnFoodInterval);
        }
    };

    return new FoodSpawner();
});
