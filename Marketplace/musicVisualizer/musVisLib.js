//  
//  musVisLib.js
//  A library of of effects for the Music Visualizer
//  
//  Author: Elisa Lupin-Jimenez
//  Edits: Cain Kilgore
//  Copyright High Fidelity 2018
//  
//  Licensed under the Apache 2.0 License
//  See accompanying license file or http://apache.org/
//  
//  All assets are under CC Attribution Non-Commerical
//  http://creativecommons.org/licenses/
//  

module.exports = {

    effectLib: {
        fire: {
            "accelerationSpread": {
                "x": 1,
                "y": 2,
                "z": 1
            },
            "alpha": 1,
            "alphaFinish": 1,
            "alphaSpread": 0,
            "alphaStart": 1,
            "clientOnly": 0,
            "color": {
                "blue": 22,
                "green": 128,
                "red": 242
            },
            "colorFinish": {
                "blue": 8,
                "green": 8,
                "red": 255
            },
            "colorSpread": {
                "blue": 12,
                "green": 114,
                "red": 247
            },
            "colorStart": {
                "blue": 22,
                "green": 180,
                "red": 242
            },
            "dimensions": {
                "x": 0.5574941039085388,
                "y": 0.5574941039085388,
                "z": 0.5574941039085388
            },
            "emitAcceleration": {
                "x": 0,
                "y": 4,
                "z": 0
            },
            "emitDimensions": {
                "x": 0.2,
                "y": 0.2,
                "z": 0
            },
            "emitOrientation": {
                "w": 0.7018997073173523,
                "x": -0.7122758030891418,
                "y": 0,
                "z": 0
            },
            "emitRate": 200,
            "emitterShouldTrail": true,
            "emitSpeed": 0.25000000074505806,
            "isEmitting": true,
            "lifespan": 0.5,
            "lifetime": 5400,
            "maxParticles": 500,
            "particleRadius": 0.25,
            "polarFinish": 0.6981316804885864,
            "queryAACube": {
                "scale": 0.9656081199645996,
                "x": -0.4828040599822998,
                "y": -0.4828040599822998,
                "z": -0.4828040599822998
            },
            "radiusFinish": 0.07,
            "radiusStart": 0.05,
            "rotation": {
                "w": 1,
                "x": -1.52587890625e-05,
                "y": -1.52587890625e-05,
                "z": -1.52587890625e-05
            },
            "script": "",
            "speedSpread": 0,
            "textures": "https://hifi-content.s3.amazonaws.com/elisalj/music_visualizer/textures/fire.jpg",
            "type": "ParticleEffect",
            "userData": "{\"grabbableKey\":{\"grabbable\":true}}",
            "name": "musvis_fire"
        },
        water: {
            "accelerationSpread": {
                "x": 0,
                "y": 1,
                "z": 0
            },
            "alpha": 1,
            "alphaFinish": 0,
            "alphaSpread": 0.5,
            "alphaStart": 1,
            "clientOnly": 0,
            "color": {
                "blue": 240,
                "green": 97,
                "red": 14
            },
            "colorFinish": {
                "blue": 240,
                "green": 33,
                "red": 14
            },
            "colorSpread": {
                "blue": 240,
                "green": 97,
                "red": 14
            },
            "colorStart": {
                "blue": 237,
                "green": 230,
                "red": 26
            },
            "dimensions": {
                "x": 0.5574941039085388,
                "y": 0.5574941039085388,
                "z": 0.5574941039085388
            },
            "emitAcceleration": {
                "x": 0,
                "y": -2,
                "z": 0
            },
            "emitDimensions": {
                "x": 0,
                "y": 1,
                "z": 0
            },
            "emitOrientation": {
                "w": 0.7018997073173523,
                "x": -0.7122758030891418,
                "y": 0,
                "z": 0
            },
            "emitRate": 50,
            "emitterShouldTrail": true,
            "emitSpeed": 0.05000000074505806,
            "isEmitting": true,
            "lifespan": 1.5,
            "lifetime": 5400,
            "maxParticles": 100,
            "particleRadius": 0.25,
            "polarFinish": 0.6981316804885864,
            "queryAACube": {
                "scale": 0.9656081199645996,
                "x": -0.4828040599822998,
                "y": -0.4828040599822998,
                "z": -0.4828040599822998
            },
            "radiusFinish": 0.25,
            "radiusStart": 0.0,
            "rotation": {
                "w": 1,
                "x": -1.52587890625e-05,
                "y": -1.52587890625e-05,
                "z": -1.52587890625e-05
            },
            "script": "",
            "speedSpread": 0,
            "textures": "https://hifi-content.s3.amazonaws.com/elisalj/music_visualizer/textures/rain.png",
            "type": "ParticleEffect",
            "userData": "{\"grabbableKey\":{\"grabbable\":true}}",
            "name": "musvis_water"
        },
        earth: {
            "accelerationSpread": {
                "x": 0.5,
                "y": 1,
                "z": 0.5
            },
            "alpha": 1,
            "alphaFinish": 0,
            "alphaSpread": 0.5,
            "alphaStart": 1,
            "clientOnly": 0,
            "color": {
                "blue": 165,
                "green": 197,
                "red": 209
            },
            "colorFinish": {
                "blue": 86,
                "green": 237,
                "red": 31
            },
            "colorSpread": {
                "blue": 23,
                "green": 153,
                "red": 77
            },
            "colorStart": {
                "blue": 5,
                "green": 70,
                "red": 110
            },
            "dimensions": {
                "x": 0.5574941039085388,
                "y": 0.5574941039085388,
                "z": 0.5574941039085388
            },
            "emitAcceleration": {
                "x": 0,
                "y": -2,
                "z": 0
            },
            "emitDimensions": {
                "x": 0.2,
                "y": 1,
                "z": 0.2
            },
            "emitOrientation": {
                "w": 0.7018997073173523,
                "x": -0.7122758030891418,
                "y": 0,
                "z": 0
            },
            "emitRate": 50,
            "emitterShouldTrail": true,
            "emitSpeed": 0.25000000074505806,
            "isEmitting": true,
            "lifespan": 1,
            "lifetime": 5400,
            "maxParticles": 100,
            "particleRadius": 0.25,
            "polarFinish": 0.6981316804885864,
            "queryAACube": {
                "scale": 0.9656081199645996,
                "x": -0.4828040599822998,
                "y": -0.4828040599822998,
                "z": -0.4828040599822998
            },
            "radiusFinish": 0.25,
            "radiusStart": 0.0,
            "rotation": {
                "w": 1,
                "x": -1.52587890625e-05,
                "y": -1.52587890625e-05,
                "z": -1.52587890625e-05
            },
            "script": "",
            "speedSpread": 0,
            "textures": "https://hifi-content.s3.amazonaws.com/elisalj/music_visualizer/textures/sand3.png",
            "type": "ParticleEffect",
            "userData": "{\"grabbableKey\":{\"grabbable\":true}}",
            "name": "musvis_earth"
        },
        air: {
            "accelerationSpread": {
                "x": 1,
                "y": 1,
                "z": 1
            },
            "alpha": 0.5,
            "alphaFinish": 0.5,
            "alphaSpread": 0,
            "alphaStart": 0,
            "clientOnly": 0,
            "color": {
                "blue": 200,
                "green": 200,
                "red": 200
            },
            "colorFinish": {
                "blue": 200,
                "green": 200,
                "red": 200
            },
            "colorSpread": {
                "blue": 0,
                "green": 0,
                "red": 0
            },
            "colorStart": {
                "blue": 200,
                "green": 200,
                "red": 200
            },
            "dimensions": {
                "x": 0.5574941039085388,
                "y": 0.5574941039085388,
                "z": 0.5574941039085388
            },
            "emitAcceleration": {
                "x": 0,
                "y": 10,
                "z": 0
            },
            "emitDimensions": {
                "x": 0.2,
                "y": 0.2,
                "z": 0
            },
            "emitOrientation": {
                "w": 0.7018997073173523,
                "x": -0.7122758030891418,
                "y": 0,
                "z": 0
            },
            "emitRate": 15,
            "emitterShouldTrail": true,
            "emitSpeed": 0.0,
            "isEmitting": true,
            "lifespan": 1,
            "lifetime": 5400,
            "maxParticles": 100,
            "particleRadius": 0.25,
            "polarFinish": 0.6981316804885864,
            "queryAACube": {
                "scale": 0.9656081199645996,
                "x": -0.4828040599822998,
                "y": -0.4828040599822998,
                "z": -0.4828040599822998
            },
            "radiusFinish": 0.07,
            "radiusStart": 0.05,
            "rotation": {
                "w": 1,
                "x": -1.52587890625e-05,
                "y": -1.52587890625e-05,
                "z": -1.52587890625e-05
            },
            "script": "",
            "speedSpread": 0,
            "textures": "https://hifi-content.s3.amazonaws.com/elisalj/music_visualizer/textures/air.png",
            "type": "ParticleEffect",
            "userData": "{\"grabbableKey\":{\"grabbable\":true}}",
            "name": "musvis_air"        	
        },
        snow: {
            "accelerationSpread": {
                "x": 0.5,
                "y": 1,
                "z": 0.5
            },
            "alpha": 1,
            "alphaFinish": 0,
            "alphaSpread": 0.5,
            "alphaStart": 1,
            "clientOnly": 0,
            "color": {
                "blue": 255,
                "green": 255,
                "red": 255
            },
            "colorFinish": {
                "blue": 255,
                "green": 255,
                "red": 255
            },
            "colorSpread": {
                "blue": 255,
                "green": 255,
                "red": 255
            },
            "colorStart": {
                "blue": 255,
                "green": 255,
                "red": 255
            },
            "dimensions": {
                "x": 0.5574941039085388,
                "y": 0.5574941039085388,
                "z": 0.5574941039085388
            },
            "emitAcceleration": {
                "x": 0,
                "y": -2,
                "z": 0
            },
            "emitDimensions": {
                "x": 0.2,
                "y": 1,
                "z": 0.2
            },
            "emitOrientation": {
                "w": 0.7018997073173523,
                "x": -0.7122758030891418,
                "y": 0,
                "z": 0
            },
            "emitRate": 50,
            "emitterShouldTrail": true,
            "emitSpeed": 0.05000000074505806,
            "isEmitting": true,
            "lifespan": 1,
            "lifetime": 5400,
            "maxParticles": 1000,
            "particleRadius": 0.25,
            "polarFinish": 0.6981316804885864,
            "queryAACube": {
                "scale": 0.9656081199645996,
                "x": -0.4828040599822998,
                "y": -0.4828040599822998,
                "z": -0.4828040599822998
            },
            "radiusFinish": 0.25,
            "radiusStart": 0.0,
            "rotation": {
                "w": 1,
                "x": -1.52587890625e-05,
                "y": -1.52587890625e-05,
                "z": -1.52587890625e-05
            },
            "script": "",
            "speedSpread": 0,
            "textures": "https://hifi-content.s3.amazonaws.com/elisalj/music_visualizer/textures/snow.jpg",
            "type": "ParticleEffect",
            "userData": "{\"grabbableKey\":{\"grabbable\":true}}",
            "name": "musvis_snow"
        },
        rainbow: {
            "accelerationSpread": {
                "x": 1,
                "y": 1,
                "z": 1
            },
            "alpha": 1,
            "alphaFinish": 0,
            "alphaSpread": 0,
            "alphaStart": 1,
            "clientOnly": 0,
            "color": {
                "blue": 255,
                "green": 255,
                "red": 255
            },
            "colorFinish": {
                "blue": 255,
                "green": 255,
                "red": 255
            },
            "colorSpread": {
                "blue": 255,
                "green": 255,
                "red": 255
            },
            "colorStart": {
                "blue": 255,
                "green": 255,
                "red": 255
            },
            "dimensions": {
                "x": 0.5574941039085388,
                "y": 0.5574941039085388,
                "z": 0.5574941039085388
            },
            "emitAcceleration": {
                "x": 0,
                "y": 1.5,
                "z": 0
            },
            "emitDimensions": {
                "x": 0.2,
                "y": 0.2,
                "z": 0
            },
            "emitOrientation": {
                "w": 0.7018997073173523,
                "x": -0.7122758030891418,
                "y": 0,
                "z": 0
            },
            "emitRate": 5,
            "emitterShouldTrail": true,
            "emitSpeed": 0.25000000074505806,
            "isEmitting": true,
            "lifespan": 3,
            "lifetime": 5400,
            "maxParticles": 100,
            "particleRadius": 0.25,
            "polarFinish": 0.6981316804885864,
            "queryAACube": {
                "scale": 0.9656081199645996,
                "x": -0.4828040599822998,
                "y": -0.4828040599822998,
                "z": -0.4828040599822998
            },
            "radiusFinish": 0.15,
            "radiusStart": 0.15,
            "rotation": {
                "w": 1,
                "x": -1.52587890625e-05,
                "y": -1.52587890625e-05,
                "z": -1.52587890625e-05
            },
            "script": "",
            "speedSpread": 0,
            "textures": "https://hifi-content.s3.amazonaws.com/elisalj/music_visualizer/textures/rainbows.png",
            "type": "ParticleEffect",
            "userData": "{\"grabbableKey\":{\"grabbable\":true}}",
            "name": "musvis_rainbow"
        },
        lightning: {
            "accelerationSpread": {
                "x": 1,
                "y": 1,
                "z": 1
            },
            "alpha": 1,
            "alphaFinish": 1,
            "alphaSpread": 0,
            "alphaStart": 1,
            "clientOnly": 0,
            "color": {
                "blue": 250,
                "green": 212,
                "red": 197
            },
            "colorFinish": {
                "blue": 240,
                "green": 181,
                "red": 175
            },
            "colorSpread": {
                "blue": 255,
                "green": 255,
                "red": 255
            },
            "colorStart": {
                "blue": 255,
                "green": 255,
                "red": 255
            },
            "dimensions": {
                "x": 0.5574941039085388,
                "y": 0.5574941039085388,
                "z": 0.5574941039085388
            },
            "emitAcceleration": {
                "x": 0.5,
                "y": 0.5,
                "z": 0.5
            },
            "emitDimensions": {
                "x": 0.2,
                "y": 0.2,
                "z": 0.2
            },
            "emitOrientation": {
                "w": 0.7018997073173523,
                "x": -0.7122758030891418,
                "y": 0,
                "z": 0
            },
            "emitRate": 10,
            "emitterShouldTrail": true,
            "emitSpeed": 0.25000000074505806,
            "isEmitting": true,
            "lifespan": 1,
            "lifetime": 5400,
            "maxParticles": 100,
            "particleRadius": 0.25,
            "polarFinish": 0.6981316804885864,
            "queryAACube": {
                "scale": 0.9656081199645996,
                "x": -0.4828040599822998,
                "y": -0.4828040599822998,
                "z": -0.4828040599822998
            },
            "radiusFinish": 0.07,
            "radiusStart": 0.05,
            "rotation": {
                "w": 1,
                "x": -1.52587890625e-05,
                "y": -1.52587890625e-05,
                "z": -1.52587890625e-05
            },
            "script": "",
            "speedSpread": 0,
            "textures": "https://hifi-content.s3.amazonaws.com/elisalj/music_visualizer/textures/lightning.jpg",
            "type": "ParticleEffect",
            "userData": "{\"grabbableKey\":{\"grabbable\":true}}",
            "name": "musvis_lightning"
        },
        love: {
            "accelerationSpread": {
                "x": 1,
                "y": 1,
                "z": 1
            },
            "alpha": 1,
            "alphaFinish": 0,
            "alphaSpread": 0,
            "alphaStart": 1,
            "clientOnly": 0,
            "color": {
                "blue": 255,
                "green": 255,
                "red": 255
            },
            "colorFinish": {
                "blue": 255,
                "green": 255,
                "red": 255
            },
            "colorSpread": {
                "blue": 255,
                "green": 255,
                "red": 255
            },
            "colorStart": {
                "blue": 255,
                "green": 255,
                "red": 255
            },
            "dimensions": {
                "x": 0.5574941039085388,
                "y": 0.5574941039085388,
                "z": 0.5574941039085388
            },
            "emitAcceleration": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "emitDimensions": {
                "x": 0.1,
                "y": 0.1,
                "z": 0
            },
            "emitOrientation": {
                "w": 0.7018997073173523,
                "x": -0.7122758030891418,
                "y": 0,
                "z": 0
            },
            "emitRate": 10,
            "emitterShouldTrail": true,
            "emitSpeed": 0.05000000074505806,
            "isEmitting": true,
            "lifespan": 2,
            "lifetime": 5400,
            "maxParticles": 100,
            "particleRadius": 0.25,
            "polarFinish": 0.6981316804885864,
            "queryAACube": {
                "scale": 0.9656081199645996,
                "x": -0.4828040599822998,
                "y": -0.4828040599822998,
                "z": -0.4828040599822998
            },
            "radiusFinish": 0.15,
            "radiusStart": 0.15,
            "rotation": {
                "w": 1,
                "x": -1.52587890625e-05,
                "y": -1.52587890625e-05,
                "z": -1.52587890625e-05
            },
            "script": "",
            "speedSpread": 0,
            "textures": "https://hifi-content.s3.amazonaws.com/elisalj/music_visualizer/textures/hearts_v2.png",
            "type": "ParticleEffect",
            "userData": "{\"grabbableKey\":{\"grabbable\":true}}",
            "name": "musvis_love"
        },
        invisible: {
            "collisionsWillMove": 1,
            "color": {
                "blue": 0,
                "green": 0,
                "red": 255
            },
            "dimensions": {
                "x": 0.20000000298023224,
                "y": 0.20000000298023224,
                "z": 0.20000000298023224
            },
            "dynamic": 1,
            "gravity": {
                "x": 0,
                "y": -9.800000190734863,
                "z": 0
            },
            "lifetime": 5400,
            "queryAACube": {
                "scale": 0.3464101552963257,
                "x": -0.17320507764816284,
                "y": -0.17320507764816284,
                "z": -0.17320507764816284
            },
            "rotation": {
                "w": 0.999786376953125,
                "x": -0.006942868232727051,
                "y": -0.0001068115234375,
                "z": -0.018142998218536377
            },
            "type": "Sphere",
            "userData": "{\"grabbableKey\":{\"grabbable\":true},\"ProceduralEntity\":{\"version\":2,\"shaderUrl\":\"https://hifi-content.s3.amazonaws.com/elisalj/music_visualizer/textures/invisible.fs\"}}",
            "visible": 1,
            "name": "musvis_invisible"
        }
    },

    getEffect: function(name, library) {
        print("Effect to retrieve: " + name);
        if (name in library) {
            // returns a copy
            return JSON.parse(JSON.stringify(library[name]));
        } else {
            print("Unable to locate effect");
            return null;
        }
    }

};