//
//  rainbowThrowerSpawner.js
//
//  created by Rebecca Stankus on 05/14/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* global Pointers */

(function() { 
    var _this;

    var SEARCH_RADIUS = 0.1;
    var CHECKING_INTERVAL_MS = 5000;

    var checking;

    function RainbowThrowerSpawner() {
        _this = this;
    }

    RainbowThrowerSpawner.prototype = {
        position: null,
        preload: function(entityID) {
            _this.entityID = entityID;
            var properties = Entities.getEntityProperties(_this.entityID, ['rotation', 'position']);
            _this.position = properties.position;
            _this.rotation = properties.rotation;
            _this.checkingStatus();
        },

        checkingStatus: function() {
            checking = Script.setInterval(function() {
                var needClone = true;
                Entities.findEntities(_this.position, SEARCH_RADIUS).forEach(function(element) {
                    var name = Entities.getEntityProperties(element, 'name').name;
                    if (name === "Rainbow-Thrower") {
                        needClone = false;
                    }
                });
                if (needClone) {
                    _this.spawnNewRainbowThrower();
                }
            }, CHECKING_INTERVAL_MS);
        },

        spawnNewRainbowThrower: function() {
            Entities.addEntity({
                clientOnly: false,
                collidesWith: "static,dynamic,kinematic,",
                collisionMask: 7,
                dimensions: {
                    x: 1.2234140634536743,
                    y: 0.39243215322494507,
                    z: 0.18208852410316467
                },
                visible: false,
                modelURL: Script.resolvePath("../models/rainbow-gun.fbx"),
                name: "Rainbow-Thrower",
                description: "CC-BY by Mario Tofani",
                position: _this.position,
                rotation: _this.rotation,
                script: Script.resolvePath("./flamethrowerClient.js"),
                serverScripts: Script.resolvePath("./flamethrowerServer.js"),
                shapeType: "compound",
                type: "Model",
                userData: JSON.stringify({
                    grabbableKey: {
                        invertSolidWhileHeld: true
                    },
                    wearable: {
                        joints:{
                            RightHand: [{
                                x: -0.007518768310546875,
                                y: 0.5544962882995605,
                                z: 0.16308164596557617
                            },
                            {
                                x: 0.7010452747344971,
                                y: 0.7008621692657471,
                                z: 0.09294271469116211,
                                w: -0.09321737289428711
                            }],
                            LeftHand:[{
                                x: 0.19799518585205078,
                                y: 0.48479366302490234,
                                z: -0.00713348388671875
                            },
                            {
                                x: 0.005630612373352051,
                                y: -0.05073624849319458,
                                z: -0.5772640705108643,
                                w: -0.8149996399879456
                            }]
                        }
                    }
                })
            });
        },
        
        unload: function() {
            if (checking) {
                Script.clearInterval(checking);
            }
        }
    };

    return new RainbowThrowerSpawner();
});
