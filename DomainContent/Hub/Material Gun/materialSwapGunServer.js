//
//  materialSwapGunServer.js
//
//  created by Rebecca Stankus on 03/27/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* global Graphics */

(function() { 
    var _this;
    
    var MATERIAL_URL_0 = Script.resolvePath("materials/Red.json");
    var MATERIAL_URL_1 = Script.resolvePath("materials/Orange.json");
    var MATERIAL_URL_2 = Script.resolvePath("materials/Yellow.json");
    var MATERIAL_URL_3 = Script.resolvePath("materials/Green.json");
    var MATERIAL_URL_4 = Script.resolvePath("materials/Blue.json");
    var MATERIAL_URL_5 = Script.resolvePath("materials/Indigo.json");
    var MATERIAL_URL_6 = Script.resolvePath("materials/Violet.json");
    var MATERIAL_URL_7 = Script.resolvePath("materials/Chrome.json");
    var STOP_EMITTING_MS = 200;
    var VELOCITY_FACTOR = 20;
    var MATERIAL_LIFETIME_ON_FIRE = 30;
    var NUMBER_COLORS = 8;
     
    function Gun() {
        _this = this;
    }

    Gun.prototype = {
        nextColor: null,
        currentColor: null,
        randomMaterialURL: null,
        nextMaterial: null,
        remotelyCallable: ['fire', 'createSplat'],
        preload: function(entityID) {
            _this.entityID = entityID;
            _this.createMaterial();
        },

        fire: function(thisID, params) {
            var position = JSON.parse(params[0]);
            var direction = JSON.parse(params[1]);
            var distance = JSON.parse(params[2]);
            _this.shootBall(direction, position, distance);
            _this.createMaterial(position);
        },

        getRandomMaterialURL: function() {
            var materialChange = Math.floor(Math.random() * NUMBER_COLORS);
            _this.currentColor = _this.nextColor;
            switch (materialChange) {
                case 0:
                    _this.randomMaterialURL = MATERIAL_URL_0;
                    _this.nextColor = {red: 255, blue: 0, green: 0};
                    break;
                case 1:
                    _this.randomMaterialURL = MATERIAL_URL_1;
                    _this.nextColor = {red: 255, blue: 0, green: 100};
                    break;
                case 2:
                    _this.randomMaterialURL = MATERIAL_URL_2;
                    _this.nextColor = {red: 255, blue: 0, green: 255};
                    break;
                case 3:
                    _this.randomMaterialURL = MATERIAL_URL_3;
                    _this.nextColor = {red: 0, blue: 0, green: 200};
                    break;
                case 4:
                    _this.randomMaterialURL = MATERIAL_URL_4;
                    _this.nextColor = {red: 50, blue: 255, green: 150};
                    break;
                case 5:
                    _this.randomMaterialURL = MATERIAL_URL_5;
                    _this.nextColor = {red: 0, blue: 255, green: 0};
                    break;
                case 6:
                    _this.randomMaterialURL = MATERIAL_URL_6;
                    _this.nextColor = {red: 200, blue: 255, green: 0};
                    break;
                case 7:
                    _this.randomMaterialURL = MATERIAL_URL_7;
                    _this.nextColor = {red: 0, blue: 0, green: 0};
                    break;
                default:
                    _this.randomMaterialURL = MATERIAL_URL_7;
                    _this.nextColor = {red: 0, blue: 0, green: 0};
            }
            _this.storeNextMaterialAndColor();
        },

        createMaterial: function(position) {
            _this.getRandomMaterialURL();

            _this.nextMaterial = Entities.addEntity({
                clientOnly: false,
                materialURL: _this.randomMaterialURL,
                position: position,
                name: "Gun Material",
                dimensions: { x: 0.1, y: 0.1, z: 0.1 },
                priority: 1,
                visible: false,
                lifetime: -1,
                type: "Material"
            });
            _this.storeNextMaterialAndColor();
        },

        storeNextMaterialAndColor: function() {
            var gunUserData = JSON.parse(Entities.getEntityProperties(_this.entityID, 'userData').userData);
            gunUserData.nextMaterial = _this.nextMaterial;
            gunUserData.nextColor = _this.nextColor;
            Entities.editEntity(_this.entityID, {
                userData: JSON.stringify(gunUserData)
            });
        },

        shootBall: function(barrelDirection, fireStart, distance) {
            var normalizedDirection = Vec3.normalize(barrelDirection);
            var velocity = Vec3.multiply(normalizedDirection, VELOCITY_FACTOR);
            var magnitude = Vec3.length(velocity);
            var time = distance / magnitude;
            var hull = Entities.addEntity({
                clientOnly: false,
                collisionsWillMove: true,
                color: _this.nextColor,
                userData: JSON.stringify(
                    {
                        grabbableKey: {
                            grabbable: true,
                            wantsTrigger: false
                        },
                        gun: _this.entityID
                    }
                ),
                dimensions: { x: 0.1, y: 0.1, z: 0.1 },
                dynamic: true,
                name: "Gun Material Hull",
                position: fireStart,
                type: "Sphere",
                lifetime: time,
                velocity: velocity
            });

            var age = Entities.getEntityProperties(_this.nextMaterial, "age").age;
            Entities.editEntity(_this.nextMaterial,{
                parentID: hull,
                localPosition: { x: 0, y: 0, z: 0},
                lifetime: age + MATERIAL_LIFETIME_ON_FIRE
            });
        },

        createSplat: function(id, params) {
            var splat = Entities.addEntity({
                type: "ParticleEffect",
                position: JSON.parse(params[0]),
                dimensions: { x: 10.88, y: 10.88, z: 10.88 },
                collisionless: 1,
                dynamic: 0,
                name: "Gun Splat Particle Effect",
                isEmitting: true,
                lifespan: 0.3,
                maxParticles: 500,
                textures: Script.resolvePath("particles/Bokeh-Particle.png"),
                emitRate: 100,
                lifetime: 1,
                emitSpeed: 3.15,
                emitDimensions: { x: 0.1, y: 0.1, z: 0.1 },
                emitOrientation: { x: -90, y: 0, z: 0 },
                emitterShouldTrail: false,
                particleRadius: 0.02,
                radiusSpread: 0.03,
                radiusStart: 0.01,
                radiusFinish: 0,
                color: _this.currentColor,
                colorSpread: _this.currentColor,
                colorStart: _this.currentColor,
                colorFinish: _this.currentColor,
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

            Script.setTimeout(function() {
                Entities.editEntity(splat, { isEmitting: false });
            }, STOP_EMITTING_MS);
        },
        
        unload: function() {
            Entities.deleteEntity(_this.nextMaterial);
        }
    };

    return new Gun();
});
