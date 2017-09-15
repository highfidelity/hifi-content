//  
//  emojiLib.js
//  A library of JSON links for emojis
//  
//  Author: Elisa Lupin-Jimenez
//  Copyright High Fidelity 2017
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
                "y": 1,
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
            "emitRate": 50,
            "emitterShouldTrail": true,
            "emitSpeed": 0.05000000074505806,
            "isEmitting": true,
            "lifespan": 0.5,
            "lifetime": -1,
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
            "textures": "http://hifi-content.s3.amazonaws.com/alan/dev/Particles/Fireball.jpg",
            "type": "ParticleEffect",
            "userData": "{\"grabbableKey\":{\"grabbable\":true}}",
            "name": "fire"
        },
        water: {
            "accelerationSpread": {
                "x": 1,
                "y": 1,
                "z": 1
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
            "emitRate": 10,
            "emitterShouldTrail": true,
            "emitSpeed": 0.05000000074505806,
            "isEmitting": true,
            "lifespan": 1.5,
            "lifetime": -1,
            "maxParticles": 10,
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
            "name": "water"
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
            "name": "invisible"
        }
        // water: "https://hifi-content.s3.amazonaws.com/elisalj/emoji_scripts/JSON_files/fireworks.json?" + Date.now(),
        // earth: "https://hifi-content.s3.amazonaws.com/elisalj/emoji_scripts/JSON_files/flower.json?" + Date.now(),
        // air: "https://hifi-content.s3.amazonaws.com/elisalj/emoji_scripts/JSON_files/heart.json?" + Date.now(),
        // snow: "https://hifi-content.s3.amazonaws.com/elisalj/emoji_scripts/JSON_files/monster.json?" + Date.now(),
        // rainbow: "https://hifi-content.s3.amazonaws.com/elisalj/emoji_scripts/JSON_files/pickle.json?" + Date.now(),
        // static: "https://hifi-content.s3.amazonaws.com/elisalj/emoji_scripts/JSON_files/pizza.json?" + Date.now(),
        // love: "https://hifi-content.s3.amazonaws.com/elisalj/emoji_scripts/JSON_files/poo.json?" + Date.now()
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