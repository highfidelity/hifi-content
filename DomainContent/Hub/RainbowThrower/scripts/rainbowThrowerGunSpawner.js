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
    var NEGATIVE = -1;

    var checking;

    function RainbowThrowerSpawner() {
        _this = this;
    }

    RainbowThrowerSpawner.prototype = {
        position: null,
        preload: function(entityID) {
            _this.entityID = entityID;
            _this.position = Entities.getEntityProperties(_this.entityID, 'position').position;
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
                rotation: {
                    w: 0.7510643005371094,
                    x: -0.020492851734161377,
                    y: 0.6523995399475098,
                    z: 0.09913790225982666
                },
                script: Script.resolvePath("flamethrowerClient.js"),
                serverScripts: Script.resolvePath("flamethrowerServer.js"),
                shapeType: "compound",
                type: "Model",
                userData: JSON.stringify({
                    grabbableKey: {
                        invertSolidWhileHeld: true
                    },
                    wearable: {
                        joints:{
                            RightHand: [{
                                x: 0.0764474868774414,
                                y: 0.40706944465637207,
                                z: -0.13648319244384766
                            },
                            {
                                x: -0.8103914260864258,
                                y: -0.494316041469574,
                                z: 0.11076521873474121,
                                w: -0.29436177015304565
                            }],
                            LeftHand:[{
                                x: -0.0677480697631836,
                                y: 0.420626163482666,
                                z: -0.10563850402832031
                            },
                            {
                                x: 0.057083964347839355,
                                y: -0.15535211563110352,
                                z: -0.8364232778549194,
                                w: -0.5225147008895874
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