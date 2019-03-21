//
// tequilaSpawner.js
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

    function TequilaSpawner() {
        _this = this;
    }

    TequilaSpawner.prototype = {
        remotelyCallable: ['spawnIfNeeded', 'spawnNewGlass'],
        preload: function(entityID) {
            print("preload");
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
                if (name === "Tequila Shot") {
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
                    x: 0.0782,
                    y: 0.0936,
                    z: 0.0782
                },
                position: _this.position,
                modelURL: Script.resolvePath("models/shot-glass.fbx"),
                name: "Tequila CC-BY Jarlan Perez",
                rotation: {
                    w: -0.26305025815963745,
                    x: -4.57763671875e-05,
                    y: 0.9647821187973022,
                    z: -1.52587890625e-05
                },
                script: Script.resolvePath("tequilaClient.js?996"),
                serverScripts: Script.resolvePath("tequilaServer.js?994"),
                shapeType: "simple-hull",
                type: "Model",
                dynamic: false,
                collidesWith: "static, dynamic",
                restitution: 0
            });

            Script.setTimeout(function(){
                Entities.editEntity(glass, {
                    gravity: {
                        x: 0,
                        y: -12,
                        z: 0
                    },
                    dynamic: true
                });
            }, 300);

            Entities.addEntity({
                collisionless: true,
                dynamic: false,
                color: {
                    blue: 17,
                    green: 187,
                    red: 236
                },
                dimensions: {
                    x: 0.0634,
                    y: 0.0712,
                    z: 0.0628
                },
                parentID: glass,
                localPosition: {x: 0, y: 0, z: 0},
                localRotation: {x: 0, y: 0, z: 90, w: 0},
                name: "Tequila Shot",
                shape: "Cone",
                type: "Shape",
                userData: "{\"grabbableKey\":{\"grabbable\":false}}",
                script: Script.resolvePath("glassPrimitiveCatch.js"),
                serverScripts: Script.resolvePath("glassPrimitiveCatchServer.js")
            });
        }
    };

    return new TequilaSpawner();
});
