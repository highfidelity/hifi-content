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
    
    // var VELOCITY_FACTOR = 2;
    var MATERIAL_URL_0 = "https://hifi-content.s3.amazonaws.com/liv/dev/Materials/Red.json";
    var MATERIAL_URL_1 = "https://hifi-content.s3.amazonaws.com/liv/dev/Materials/Orange.json";
    var MATERIAL_URL_2 = "https://hifi-content.s3.amazonaws.com/liv/dev/Materials/Yellow.json";
    var MATERIAL_URL_3 = "https://hifi-content.s3.amazonaws.com/liv/dev/Materials/Green.json";
    var MATERIAL_URL_4 = "https://hifi-content.s3.amazonaws.com/liv/dev/Materials/Blue.json";
    var MATERIAL_URL_5 = "https://hifi-content.s3.amazonaws.com/liv/dev/Materials/Indigo.json";
    var MATERIAL_URL_6 = "https://hifi-content.s3.amazonaws.com/liv/dev/Materials/Violet.json";
    
    // var NEGATIVE = -1;
    // var nextMaterial = [];
    // var WAIT_BEFORE_EDITING_PROPERTIES = 20;
    // var currentMaterialMarker;
    // var nextMaterialHolder;
     
    function Gun() {
        _this = this;
    }

    Gun.prototype = {
        nextColor: null,
        randomMaterial: null,
        showNextColor: [],
        nextMaterial: null,
        remotelyCallable: ['fire', 'createMaterial', 'resetNextMaterials', 'spawnNewGun'],
        preload: function(entityID) {
            print("this is the right script");
            _this.entityID = entityID;
            // get materials for next color priority holder
            Entities.getChildrenIDs(_this.entityID).forEach(function(element) {
                var properties = Entities.getEntityProperties(element, ['materialURL', 'name']);
                var name = properties.name;
                if (name ==="Gun Next Color Material") {
                    switch (properties.materialURL) {
                        case MATERIAL_URL_0:
                            _this.showNextColor[0] = element;
                            // print("added ", element);
                            break;
                        case MATERIAL_URL_1:
                            _this.showNextColor[1] = element;
                            // print("added ", element);
                            break;
                        case MATERIAL_URL_2:
                            _this.showNextColor[2] = element;
                            // print("added ", element);
                            break;
                        case MATERIAL_URL_3:
                            _this.showNextColor[3] = element;
                            // print("added ", element);
                            break;
                        case MATERIAL_URL_4:
                            _this.showNextColor[4] = element;
                            // print("added ", element);
                            break;
                        case MATERIAL_URL_5:
                            _this.showNextColor[5] = element;
                            // print("added ", element);
                            break;
                        case MATERIAL_URL_6:
                            _this.showNextColor[6] = element;
                            // print("added ", element);
                            break;
                        default:
                            print("found Gun next color entity that does not match");
                    }
                }
            });
        },
        fire: function(thisID, params) {
            // print("params string is " + JSON.stringify(params));
            // print("fire server side");
            // print("received barrelDirection ", params[0]);
            // print("received barrelPosition ", params[1]);
            _this.shootMaterial(JSON.parse(params[0]), JSON.parse(params[1]));
        },
        resetNextMaterials: function() {
            _this.showNextColor.forEach(function(materialEntity){
                // print("setting a material  to priority 0");
                Entities.editEntity(materialEntity, {priority: 0, parentMaterialName: "39"});
            });
        },
        getRandomMaterial: function() {
            var materialChange = Math.floor(Math.random() * 7);
            _this.resetNextMaterials();
            switch (materialChange) {
                case 0:
                    _this.randomMaterial = MATERIAL_URL_0;
                    Entities.editEntity(_this.showNextColor[0], {priority: 1});
                    break;
                case 1:
                    _this.randomMaterial = MATERIAL_URL_1;
                    Entities.editEntity(_this.showNextColor[1], {priority: 1});
                    break;
                case 2:
                    _this.randomMaterial = MATERIAL_URL_2;
                    Entities.editEntity(_this.showNextColor[2], {priority: 1});
                    break;
                case 3:
                    _this.randomMaterial = MATERIAL_URL_3;
                    Entities.editEntity(_this.showNextColor[3], {priority: 1});
                    break;
                case 4:
                    _this.randomMaterial = MATERIAL_URL_4;
                    Entities.editEntity(_this.showNextColor[4], {priority: 1});
                    break;
                case 5:
                    _this.randomMaterial = MATERIAL_URL_5;
                    Entities.editEntity(_this.showNextColor[5], {priority: 1});
                    break;
                case 6:
                    _this.randomMaterial = MATERIAL_URL_6;
                    Entities.editEntity(_this.showNextColor[6], {priority: 1});
                    break;
                default:
                    _this.randomMaterial = MATERIAL_URL_6;
                    Entities.editEntity(_this.showNextColor[6], {priority: 1});
            }
        },
        createMaterial: function(thisID, params) {
            // print("params0 string is " + params[0]);
            _this.getRandomMaterial();

            // print("getting priority by calling client");
            _this.currentMaterial = Entities.addEntity({
                "clientOnly": false,
                "materialURL": _this.randomMaterial,
                /* "localPosition": {
                    "x": 0,
                    "y": 0,
                    "z": 0
                },*/
                "position": JSON.parse(params[0]),
                "name": "Gun Material",
                "dimensions": {
                    "x": 0.1,
                    "y": 0.1,
                    "z": 0.1
                },
                "priority": 1,
                "visible": false,
                // "parentMaterialName": "39",
                "lifetime": 120,
                // "parentID": _this.entityID,
                "type": "Material",
                "userData": "{\"grabbableKey\":{\"grabbable\":false}}"
            });
            // print("created next material: ", _this.currentMaterial, " at ", JSON.stringify(
            // Entities.getEntityProperties(_this.currentMaterial, 'position')).position);
        },
        shootMaterial: function(barrelDirection, fireStart) {
            // print("firestart is " + JSON.stringify(fireStart));
            // print("barrelDirection is " + JSON.stringify(barrelDirection));
            /* var normalizedDirection = Vec3.normalize(barrelDirection);
            var velocity = Vec3.multiply(normalizedDirection, VELOCITY_FACTOR);*/

            // print("gun's parentID is ", Entities.getEntityProperties(_this.entityID, 'parentID').parentID);
            // print("creating material hull");
            var materialHolder = Entities.addEntity({
                "clientOnly": false,
                "collisionsWillMove": true,
                "color": {
                    "blue": 255,
                    "green": 255,
                    "red": 255
                },
                "dimensions": {
                    "x": 0.1,
                    "y": 0.1,
                    "z": 0.1
                },
                "dynamic": true,
                "userData": JSON.stringify(
                    {
                        "grabbableKey": {
                            "grabbable": true,
                            "wantsTrigger" : false
                        },
                        "gun": _this.entityID,
                        "material": _this.currentMaterial,
                        "startPosition": fireStart,
                        "startDirection": barrelDirection
                    }
                ),
                "name": "Gun Material Hull",
                "position": fireStart,
                "script": 
                   "http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/Hub/Material%20Gun/materialSwapBullet.js",
                "type": "Sphere",
                "lifetime": 120
            });

            Entities.addEntity({
                "type":"ParticleEffect",
                "localPosition":{
                    "x": 0,
                    "y": 0,
                    "z": 0
                },
                "dimensions": {
                    "x": 32.87999725341797,
                    "y": 32.87999725341797,
                    "z": 32.87999725341797
                },
                "parentID": materialHolder,
                "collisionless":1,
                "dynamic":0,
                "name":"Gun Splat Particle Effect",
                "isEmitting":false,
                "lifespan":"10",
                "maxParticles":"500",
                "textures":"http://hifi-content.s3.amazonaws.com/alan/dev/Particles/Bokeh-Particle.png",
                "emitRate":"1",
                "emitSpeed":"3.15",
                "emitDimensions":{"x":"0.1","y":".1","z":".1"},
                "emitOrientation":{"x":"-90","y":"0","z":"0"},
                "emitterShouldTrail":false,
                "particleRadius":"0.02",
                "radiusSpread":"6",
                "radiusStart":"0.01",
                "radiusFinish":"0",
                "color":{"red":"247","blue":"0","green":"247"},
                "colorSpread":{"red":"0","blue":"0","green":"0"},
                "colorStart":{"red":"255","blue":"255","green":"255"},
                "colorFinish":{"red":"255","blue":"255","green":"255"},
                "emitAcceleration":{"x":"-0.0","y":"2.5","z":"-0.1"},
                "accelerationSpread":{"x":"0.5","y":"3","z":"0.5"},
                "alpha":"0",
                "alphaSpread":"0",
                "alphaStart":"1",
                "alphaFinish":"0",
                "polarStart":"0",
                "polarFinish":"17",
                "azimuthStart":"-180",
                "azimuthFinish":"180"
            });

            // print("editing ", _this.currentMaterial);
           
            Entities.editEntity(_this.currentMaterial,{
                parentID: materialHolder,
                // parentMaterialName: "0",
                localPosition: {
                    "x": 0,
                    "y": 0,
                    "z": 0
                },
                lifetime: 120
            });
        },
        
        unload: function() {
        }
    };

    return new Gun();
});
