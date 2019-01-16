/*

    Party Ball
    smokeParticleProperties.js
    Created by Milad Nazeri on 2019-01-15
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Properties for smoke effects

*/

module.exports = {
    "type": "ParticleEffect",
    "name": "Suprise-Smoke",
    "parentID": _entityID,
    "position": position,
    "collisionless": 1,
    "dynamic": 0,
    "isEmitting": true,
    "lifespan": "1.62",
    "maxParticles": "520",
    "textures": "http://hifi-content.s3.amazonaws.com/alan/dev/Particles/Bokeh-Particle.png",
    "emitRate": "622",
    "emitSpeed": "0.7",
    "speedSpread": "1.43",
    "emitDimensions": {
        "x": "10",
        "y": "10",
        "z": ""
    },
    "emitOrientation": {
        "x": "270",
        "y": "0",
        "z": ""
    },
    "emitterShouldTrail": true,
    "particleRadius": "0.75",
    "radiusSpread": "0.5",
    "radiusStart": "0.21",
    "radiusFinish": "0",
    "color": {
        "red": "171",
        "blue": "171",
        "green": "171"
    },
    "colorSpread": {
        "red": "0",
        "blue": "0",
        "green": "0"
    },
    "colorStart": {
        "red": "255",
        "blue": "255",
        "green": "255"
    },
    "colorFinish": {
        "red": "255",
        "blue": "255",
        "green": "255"
    },
    "emitAcceleration": {
        "x": "0",
        "y": "4",
        "z": "0"
    },
    "accelerationSpread": {
        "x": "0",
        "y": "4",
        "z": "0"
    },
    "alpha": "1",
    "alphaSpread": "0",
    "alphaStart": "1",
    "alphaFinish": "0",
    "particleSpin": 1.6231562043547265,
    "spinSpread": 0,
    "spinStart": 1.6231562043547265,
    "spinFinish": 1.6231562043547265,
    "rotateWithEntity": false,
    "polarStart": 0,
    "polarFinish": 0.10471975511965978,
    "azimuthStart": -3.141592653589793,
    "azimuthFinish": 3.141592653589793
}