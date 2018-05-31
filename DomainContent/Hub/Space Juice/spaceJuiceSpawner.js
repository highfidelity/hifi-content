//
// spaceJuiceSpawner.js
// 
// Author: Rebecca Stankus on 05/02/18
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
/* global Pointers */

(function() { 
    var _this;

    var SEARCH_RADIUS = 0.1;
    var SPAWN_CHECK_MS = 5000;

    function SpaceJuiceSpawner() {
        _this = this;
    }

    SpaceJuiceSpawner.prototype = {
        remotelyCallable: ['spawnIfNeeded', 'spawnNewGlass'],
        preload: function(entityID) {
            _this.entityID = entityID;
            _this.position = Entities.getEntityProperties(_this.entityID, 'position').position;
            Script.setInterval(function() {
                _this.spawnIfNeeded();
            }, SPAWN_CHECK_MS);
        },

        spawnIfNeeded: function() {
            var needToSpawn = true;
            Entities.findEntities(_this.position, SEARCH_RADIUS).forEach(function(element) {
                var name= Entities.getEntityProperties(element, 'name').name;
                if (name === "Space Shot") {
                    needToSpawn = false;
                }
            });
            if (needToSpawn) {
                _this.spawnNewGlass();
            }
        },

        spawnNewGlass: function() {
            var glass = Entities.addEntity({
                dimensions: {
                    x: 0.1226,
                    y: 0.1796,
                    z: 0.1226
                },
                gravity: {
                    x: 0,
                    y: -12,
                    z: 0
                },
                position: _this.position,
                modelURL: Script.resolvePath("models/shot-glass.fbx"),
                name: "Space Juice CC-BY Jarlan Perez",
                rotation: {
                    w: -0.26305025815963745,
                    x: -4.57763671875e-05,
                    y: 0.9647821187973022,
                    z: -1.52587890625e-05
                },
                script: Script.resolvePath("spaceJuiceClient.js?996"),
                serverScripts: Script.resolvePath("spaceJuiceServer.js?994"),
                shapeType: "simple-hull",
                type: "Model",
                dynamic: false
            });

            Entities.addEntity({
                collisionless: 1,
                color: {
                    blue: 197,
                    green: 17,
                    red: 237
                },
                dimensions: {
                    x: 0.1049,
                    y: 0.1427,
                    z: 0.1049
                },
                parentID: glass,
                localPosition: {x: 0, y: 0, z: 0},
                localRotation: {x: 0, y: 0, z: 90, w: 0},
                name: "Space Shot",
                shape: "Cone",
                type: "Shape",
                userData: "{\"grabbableKey\":{\"grabbable\":false}}",
                script: Script.resolvePath("glassPrimitiveCatch.js")
            });
        }
    };

    return new SpaceJuiceSpawner();
});
