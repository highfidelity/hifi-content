//
//  materialGunSpawnerServer.js
//
//  created by Rebecca Stankus on 04/27/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* global Pointers */

(function() { 
    var _this;

    var SEARCH_RADIUS = 0.01;
    var CHECKING_INTERVAL_MS = 5000;

    var checking;

    function GunSpawner() {
        _this = this;
    }

    GunSpawner.prototype = {
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
                    if (name === "Gun Material Swapping") {
                        needClone = false;
                    }
                });
                if (needClone) {
                    _this.spawnNewGun();
                }
            }, CHECKING_INTERVAL_MS);
        },

        spawnNewGun: function() {
            var gun = Entities.addEntity({
                clientOnly: false,
                collisionless: true,
                damping: 0.5,
                visible: false,
                dimensions: { x: 0.254, y: 0.417, z: 0.604 },
                lifetime: -1,
                modelURL: Script.resolvePath("models/color-cannon.fbx"),
                name: "Gun Material Swapping",
                position: _this.position,
                description: "CC-BY Sebastien Labrunie",
                rotation: Quat.fromVec3Degrees({ x: 0, y: -90, z: 0 }),
                serverScripts: Script.resolvePath("materialSwapGunServer.js"),
                shapeType: "simple-compound",
                type: "Model",
                userData: JSON.stringify({
                    grabbableKey: { invertSolidWhileHeld: true },
                    wearable: { joints: {
                        RightHand: [
                            {
                                x: 0.07079616189002991,
                                y: 0.20177987217903137,
                                z: 0.06374628841876984
                            },
                            {
                                x: -0.5863648653030396,
                                y: -0.46007341146469116,
                                z: 0.46949487924575806,
                                w: -0.4733745753765106
                            }
                        ],
                        LeftHand: [
                            {
                                x: 0.1802254319190979,
                                y: 0.13442856073379517,
                                z: 0.08504903316497803
                            },
                            {
                                x: 0.2198076844215393,
                                y: -0.7377811074256897,
                                z: 0.2780133783817291,
                                w: 0.574519157409668
                            }
                        ]
                    }
                    }
                }),
                script: Script.resolvePath("materialSwapGun.js")
            });

            var gunUserData = JSON.parse(Entities.getEntityProperties(gun, 'userData').userData);
            gunUserData.nextColor = {red: 255, blue: 0, green: 255};
            Entities.editEntity(gun, {
                userData: JSON.stringify(gunUserData)
            });

            Entities.addEntity({
                type: "ParticleEffect",
                localPosition: {
                    x: 0.025548934936523438,
                    y: 0.07434320449829102,
                    z: -0.24008560180664062
                },
                dimensions: {
                    x: 10,
                    y: 10,
                    z: 10
                },
                parentID: gun,
                collisionless: 1,
                dynamic: 0,
                name: "Gun Particle Effect",
                isEmitting: false,
                lifespan: 2,
                maxParticles: 500,
                textures: Script.resolvePath("particles/Bokeh-Particle.png"),
                emitRate: 1,
                emitSpeed: 3.15,
                emitterShouldTrail: false,
                particleRadius: 0.02,
                radiusSpread: 6,
                radiusStart: 0.01,
                radiusFinish: 0,
                color: { red: 247, blue: 0, green: 247 },
                colorSpread: { red: 0, blue: 0, green: 0 },
                colorStart: { red: 255, blue: 255, green: 255 },
                colorFinish: { red: 255, blue: 255, green: 255 },
                emitDimensions: { x: 0, y: 0, z: 0 },
                emitOrientation: { x: 0, y: 180, z: 0 },
                emitAcceleration: { x: -0.0, y: 2.5, z: -0.1 },
                accelerationSpread: { x: 0.5, y: 3, z: 0.5 },
                alpha: 0,
                alphaSpread: 0,
                alphaStart: 1,
                alphaFinish: 0,
                polarStart: 0,
                polarFinish: 17,
                azimuthStart: -180,
                azimuthFinish: 180
            });
        },

        unload: function() {
            if (checking) {
                Script.clearInterval(checking);
            }
        }
    };

    return new GunSpawner();
});
