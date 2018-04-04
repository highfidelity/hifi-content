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
    var CHECK_INTERVAL = LIFETIME * 100;

    var pillProperties; 
    var spawnPillInterval;
    
    var PillSpawner = function(){

    };

    PillSpawner.prototype = {
        preload: function(entityID) {
            print("preload for spawnPills");
            SPAWN_POSITION = Entities.getEntityProperties(entityID, "position").position;
            pillProperties = {
                type: "Model",
                shapeType: "Sphere",
                modelURL: "https://hifi-content.s3.amazonaws.com/DomainContent/Hub/models/pill/Pill.obj",
                script: Script.resolvePath('swallowFXPill.js'),
                dimensions : {x: 0.1259, y: 0.1259, z: 0.3227},
                lifetime: LIFETIME,
                position: SPAWN_POSITION,
                dynamic: true,
                userData : "{\"grabbableKey\":{\"grabbable\":true}}"
            };        
            spawnPillInterval = Script.setInterval(function() {
                Entities.addEntity(pillProperties); 
            }, CHECK_INTERVAL);
        },
        unload: function() {
            print("unload spawnPills");
            Script.clearInterval(spawnPillInterval);
        }
    };

    return new PillSpawner();
});
