//
// spawnPills.js
// 
// Author: Liv Erickson
// Edited for pills by: Elisa Lupin-Jimenez
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function(){
    var LIFETIME = 30; // seconds
    var SPAWN_POSITION;
    var CHECK_INTERVAL = LIFETIME * 100; // milliseconds
    var MAX_PILLS = 5;
    var PILL_URL = Script.resolvePath("models/Pill.obj");
    var SWALLOW_PILL_SCRIPT = Script.resolvePath('./swallowFXPill.js');

    var pillProperties; 
    var spawnPillInterval;
    var pillBox = [];
    
    var PillSpawner = function(){
        // nothing here
    };

    PillSpawner.prototype = {
        preload: function(entityID) {
            print("preload for spawnPills");
            SPAWN_POSITION = Entities.getEntityProperties(entityID, "position").position;
            pillProperties = {
                type: "Model",
                shapeType: "capsule-z",
                modelURL: PILL_URL,
                script: SWALLOW_PILL_SCRIPT,
                lifetime: LIFETIME,
                position: SPAWN_POSITION,
                dynamic: false,
                gravity: {x: 0, y: 0, z: 0},
                collisionless: false,
                visible: false,
                userData : "{\"grabbableKey\":{\"grabbable\":true}}"
            };        
            spawnPillInterval = Script.setInterval(function() {
                if (pillBox.length < MAX_PILLS) {
                    var pillID = Entities.addEntity(pillProperties);
                    pillBox.push(pillID);
                } else {
                    pillBox.pop();
                }
                
            }, CHECK_INTERVAL);
        },
        unload: function() {
            print("unload spawnPills");
            Script.clearInterval(spawnPillInterval);
        }
    };

    return new PillSpawner();
});
