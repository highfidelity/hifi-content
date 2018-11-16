//
//  FlashlightSpawner.js
//
//  created by Rebecca Stankus on 09/19/18
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

    function FlashlightSpawner() {
        _this = this;
    }

    FlashlightSpawner.prototype = {
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
                    if (name === "Flashlight") {
                        needClone = false;
                    }
                });
                if (needClone) {
                    _this.spawnNewFlashlight();
                }
            }, CHECKING_INTERVAL_MS);
        },

        spawnNewFlashlight: function() {

            var parent = Entities.addEntity({
                clientOnly: false,
                collidesWith: "static,dynamic,kinematic,",
                collisionMask: 7,
                lifetime: 1800,
                dimensions: {
                    x: 0.374295175075531,
                    y: 0.2721865177154541,
                    z: 0.24757488071918488
                },
                visible: true,
                modelURL: "https://hifi-content.s3.amazonaws.com/jimi/environment/201804_tomb/BuildersTorch.fbx?1?1",
                name: "Flashlight",
                serverScripts: Script.resolvePath("emptyServerScript.js"),
                position: _this.position,
                rotation: {
                    w: -0.460685133934021,
                    x: 0.22542154788970947,
                    y: -0.4716411232948303,
                    z: -0.7173113822937012
                },
                shapeType: "compound",
                type: "Model",
                userData: "{\"grabbableKey\":{\"grabbable\":true}}"
            });

            Entities.addEntity({
                clientOnly: false,
                cutoff: 90,
                dimensions: {
                    x: 0.3543652296066284,
                    y: 0.3543652296066284,
                    z: 0.3543652296066284
                },
                exponent: 10,
                falloffRadius: 10,
                intensity: 50,
                name: "Flashlight_InnerLight",
                parentID: parent,
                localPosition: {
                    x: -0.2738908529281616,
                    y: -0.05573397874832153,
                    z: -0.012888908386230469
                },
                localRotation: {
                    w: 1,
                    x: -4.57763671875e-05,
                    y: -1.52587890625e-05,
                    z: -4.57763671875e-05
                },
                type: "Light",
                userData: "{\"grabbableKey\":{\"grabbable\":false}}"
            });

            Entities.addEntity({
                clientOnly: false,
                dimensions: {
                    x: 0.444637656211853,
                    y: 0.4142301678657532,
                    z: 0.4142301380634308
                },
                modelURL: "https://hifi-content.s3.amazonaws.com/jimi/environment/201804_tomb/lightCone.fbx?3",
                name: "Flashlight_LightCone",
                parentID: parent,
                localPosition: {
                    x: -0.37824249267578125,
                    y: -0.01348876953125,
                    z: 0.0010976791381835938
                },
                localRotation: {
                    w: 1,
                    x: -1.52587890625e-05,
                    y: -4.57763671875e-05,
                    z: -1.52587890625e-05
                },
                type: "Model",
                userData: "{\"grabbableKey\":{\"grabbable\":false}}"
            });
            
            Entities.addEntity({
                type: "Light",
                clientOnly: false,
                color: {
                    blue: 189,
                    green: 245,
                    red: 255
                },
                cutoff: 30,
                dimensions: {
                    x: 14.527225494384766,
                    y: 14.527225494384766,
                    z: 29.05445098876953
                },
                exponent: 40,
                falloffRadius: 15,
                id: "{71b8c40f-1689-4ae0-809b-b906b947708c}",
                intensity: 2,
                isSpotlight: true,
                name: "Flashlight_SpotLight",
                parentID: parent,
                localPosition: {
                    x: -0.19927501678466797,
                    y: -0.09986162185668945,
                    z: 0.06051468849182129
                },
                localRotation: {
                    w: 0.7070878744125366,
                    x: -0.0001373291015625,
                    y: 0.7070878744125366,
                    z: -7.62939453125e-05
                }
            });
        },
        
        unload: function() {
            if (checking) {
                Script.clearInterval(checking);
            }
        }
    };

    return new FlashlightSpawner();
});
