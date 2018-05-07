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
    var CRUNCH_SCRIPT = Script.resolvePath("./crunch.js");
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
                ["position", "rotation", "dimensions", "modelURL", "name", "dimensions", "description"]);
            foodProperties = {
                name: properties.name + "-clone",
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
                grabbable: true
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
