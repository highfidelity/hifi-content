//
// tequilaSpawnerServer.js
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
    var SPAWN_CHECK_MS = 10000;

    function TequilaSpawner() {
        _this = this;
    }

    TequilaSpawner.prototype = {
        remotelyCallable: ['spawnIfNeeded', 'spawnNewTequilaShot'],
        preload: function(entityID) {
            _this.entityID = entityID;
            _this.position = Entities.getEntityProperties(_this.entityID, 'position').position;
            Script.setInterval(function() {
                _this.spawnIfNeeded();
            }, SPAWN_CHECK_MS);
        },

        spawnIfNeeded: function() {
            var needToSpawn = true;
            Entities.findEntities(_this.position, SEARCH_RADIUS).forEach(function(element){
                var name= Entities.getEntityProperties(element, 'name').name;
                if (name === "Tequila Shot") {
                    needToSpawn = false;
                }
            });
            if (needToSpawn) {
                _this.spawnNewTequilaShot();
            }
        },

        createDrunkZone: function() {
            Entities.addEntity({
                type: 'Zone',
                name: 'Tequila Drunk Zone',
                hazeMode: 'enabled',
                haze: {
                    hazeColor:{
                        red: 215,
                        green: 217,
                        blue: 167
                    },
                    hazeRange: 1000,
                    hazeBackgroundBlend: 0.9
                },
                position: _this.position,
                dimensions: {x: 0.5, y: 0.5, z: 0.5},
                lifetime: 30
            });
        },
        spawnNewTequilaShot: function() {
            var glass = Entities.addEntity({
                dimensions: {
                    "x": 0.06498056650161743,
                    "y": 0.06805062294006348,
                    "z": 0.060177650302648544
                },
                gravity: {
                    x: 0,
                    y: -9.8,
                    z: 0
                },
                position: _this.position,
                modelURL: "http://hifi-content.s3.amazonaws.com/rebecca/Hub/Space%20Juice/models/shot-glass.fbx",
                name: "Tequila Shot Glass CC-BY Jarlan Perez",
                script: "https://hifi-content.s3.amazonaws.com/rebecca/Mexico/tequilaClient.js",
                serverScripts: "http://hifi-content.s3.amazonaws.com/rebecca/Mexico/tequilaServer.js",
                shapeType: "simple-hull",
                type: "Model",
                dynamic: true
            });

            Entities.addEntity({
                collisionless: 1,
                color: {
                    blue: 45,
                    green: 170,
                    red: 247
                },
                dimensions: {
                    x: 0.05024334788322449,
                    y: 0.05231950804591179,
                    z: 0.049671873450279236
                },
                parentID: glass,
                localPosition: {x:0, y:0, z:0},
                localRotation: {x:0, y:0, z:90, w:0},
                name: "Tequila Shot",
                shape: "Cone",
                type: "Shape",
                userData: "{\"grabbableKey\":{\"grabbable\":false}}",
                "script": "http://hifi-content.s3.amazonaws.com/rebecca/Mexico/tequilaShotPrimitiveCatch.js"
            });
        }
    };

    return new TequilaSpawner();
});
