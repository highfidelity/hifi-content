//
// noisemakerSpawnerServer.js
// 
// Created by Rebecca Stankus on 12/20/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function(){
    var LIFETIME = 30; // seconds
    var NOISEMAKER_SCRIPT = Script.resolvePath("./noisemaker.js?002");
    var INTERVAL = 5000;
    var DISTANCE = 0.5;
    var DEBUG = false;

    var noisemakerProperties; 
    var originalFoodName;
    
    function checkClonesAndUpdate() {
        var count = 0;
        var found = Entities.findEntities(noisemakerProperties.position, DISTANCE);
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
                print("adding replacement noisemaker");
            }
            Entities.addEntity(noisemakerProperties);
        }
    }

    var NoisemakerSpawner = function() {
    };

    NoisemakerSpawner.prototype = {
        remotelyCallable: ['spawnNoisemaker'],

        preload: function(entityID) {
            if (DEBUG) {
                print("preload for createFoodServer.js");
            }
            var properties = Entities.getEntityProperties(entityID, 
                ["position", "rotation", "dimensions", "modelURL", 
                    "name", "dimensions", "description", "userData"]);
            originalFoodName = properties.name;
            noisemakerProperties = {
                name: properties.name + "-temp",
                description: properties.description,
                type: "Model",
                shapeType: "compound",
                modelURL: properties.modelURL,
                script: NOISEMAKER_SCRIPT,
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

        spawnNoisemaker: function(entityID, args) {
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
            var newNoisemakerProperties = JSON.parse(JSON.stringify(noisemakerProperties));
            newNoisemakerProperties.visible = true;
            newNoisemakerProperties.collisionless = false;
            newNoisemakerProperties.position = newPosition;
            Entities.addEntity(newNoisemakerProperties);
        },

        unload: function() {
            if (DEBUG) {
                print("unload createFoodServer.js");
            }
            Script.clearInterval(checkClonesAndUpdate);
        }
    };

    return new NoisemakerSpawner();
});
