/*

    Party Ball
    particleProperties.js
    Created by Milad Nazeri on 2019-01-15
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Library of particle effects

*/
print("in particle properties");


Script.resetModuleCache(true);


var smoke1 = {
    "type": "ParticleEffect",
    "name": "Party-Smoke",
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
};

var smoke2 = {
    "accelerationSpread": {
        "blue": 0,
        "green": 2.5,
        "red": 0,
        "x": 0,
        "y": 2.5,
        "z": 0
    },
    "alpha": 0,
    "alphaFinish": 0,
    "alphaStart": 1,
    "color": {
        "blue": 255,
        "green": 132,
        "red": 0
    },
    "colorFinish": {
        "blue": 0,
        "green": 0,
        "red": 0,
        "x": 0,
        "y": 0,
        "z": 0
    },
    "colorStart": {
        "blue": 162,
        "green": 0,
        "red": 255,
        "x": 255,
        "y": 0,
        "z": 162
    },
    "dimensions": {
        "blue": 13.795560836791992,
        "green": 13.795560836791992,
        "red": 13.795560836791992,
        "x": 13.795560836791992,
        "y": 13.795560836791992,
        "z": 13.795560836791992
    },
    "emitAcceleration": {
        "blue": 0,
        "green": 0,
        "red": 0,
        "x": 0,
        "y": 0,
        "z": 0
    },
    "emitOrientation": {
        "w": 1,
        "x": -1.52587890625e-05,
        "y": -1.52587890625e-05,
        "z": -1.52587890625e-05
    },
    "emitRate": 982,
    "emitSpeed": 0,
    "emitterShouldTrail": true,
    "maxParticles": 2446,
    "particleRadius": 0.10000000149011612,
    "radiusFinish": 0.009999999776482582,
    "radiusStart": 0,
    "speedSpread": 0,
    "spinFinish": 0,
    "spinSpread": 3.5953781604766846,
    "spinStart": 0,
    "textures": "https://content.highfidelity.com/DomainContent/production/Particles/wispy-smoke.png",
    "type": "ParticleEffect"
};

var bubbles = {
    "accelerationSpread": {
        "blue": 0.5,
        "green": 0.5,
        "red": 0.5,
        "x": 0.5,
        "y": 0.5,
        "z": 0.5
    },
    "alphaFinish": 1,
    "alphaSpread": 1,
    "alphaStart": 1,
    "colorFinish": {
        "blue": 0,
        "green": 0,
        "red": 0,
        "x": 0,
        "y": 0,
        "z": 0
    },
    "colorStart": {
        "blue": 255,
        "green": 255,
        "red": 255,
        "x": 255,
        "y": 255,
        "z": 255
    },
    "dimensions": {
        "blue": 1211.32080078125,
        "green": 1211.32080078125,
        "red": 1211.32080078125,
        "x": 1211.32080078125,
        "y": 1211.32080078125,
        "z": 1211.32080078125
    },
    "emitAcceleration": {
        "blue": 0,
        "green": 2,
        "red": 0,
        "x": 0,
        "y": 2,
        "z": 0
    },
    "emitDimensions": {
        "blue": 0.5,
        "green": 0.5,
        "red": 0.5,
        "x": 0.5,
        "y": 0.5,
        "z": 0.5
    },
    "emitOrientation": {
        "w": 1,
        "x": -1.52587890625e-05,
        "y": -1.52587890625e-05,
        "z": -1.52587890625e-05
    },
    "emitRate": 2,
    "emitSpeed": 0.5099999904632568,
    "emitterShouldTrail": true,
    "maxParticles": 200,
    "name": "Bubbles",
    "particleRadius": 0,
    "polarFinish": 1.4311699867248535,
    "polarStart": 0.7504915595054626,
    "radiusFinish": 0.10000000149011612,
    "radiusSpread": 0.20999999344348907,
    "radiusStart": 0.20000000298023224,
    "rotation": {
        "w": 0.6646066904067993,
        "x": -0.22746622562408447,
        "y": 0.20161747932434082,
        "z": -0.6826122999191284
    },
    "speedSpread": 0.10000000149011612,
    "spinFinish": -1.4137166738510132,
    "spinSpread": 2.4260077476501465,
    "spinStart": 1.2042771577835083,
    "textures": "http://hifi-content.s3.amazonaws.com/alexia/Avatars/Bevi/bubble.png",
    "type": "ParticleEffect"
};

var star = {
    "alpha": 0,
    "alphaFinish": 0,
    "alphaStart": 1,
    "colorStart": {
        "blue": 255,
        "green": 255,
        "red": 255,
        "x": 255,
        "y": 255,
        "z": 255
    },
    "dimensions": {
        "blue": 13.24000072479248,
        "green": 13.24000072479248,
        "red": 13.24000072479248,
        "x": 13.24000072479248,
        "y": 13.24000072479248,
        "z": 13.24000072479248
    },
    "emitAcceleration": {
        "blue": 0,
        "green": 0.10000000149011612,
        "red": 0,
        "x": 0,
        "y": 0.10000000149011612,
        "z": 0
    },
    "emitDimensions": {
        "blue": 1,
        "green": 1,
        "red": 1,
        "x": 1,
        "y": 1,
        "z": 1
    },
    "emitOrientation": {
        "w": 1,
        "x": -1.52587890625e-05,
        "y": -1.52587890625e-05,
        "z": -1.52587890625e-05
    },
    "emitRate": 6,
    "emitSpeed": 0,
    "maxParticles": 10,
    "name": "Stars",
    "particleRadius": 0.07000000029802322,
    "polarFinish": 3.1415927410125732,
    "radiusFinish": 0,
    "radiusStart": 0,
    "rotation": {
        "w": 0.9852292537689209,
        "x": -1.52587890625e-05,
        "y": -0.17122149467468262,
        "z": -7.62939453125e-05
    },
    "speedSpread": 0,
    "spinFinish": null,
    "spinStart": null,
    "textures": "http://hifi-content.s3.amazonaws.com/alexia/Models/Portal/star.png",
    "type": "ParticleEffect",
    "userData": "{\"grabbableKey\":{\"grabbable\":false}}"
};

var circle = {
    "alpha": 0,
    "alphaFinish": 0,
    "alphaStart": 1,
    "color": {
        "blue": 242,
        "green": 196,
        "red": 80
    },
    "colorFinish": {
        "blue": 0,
        "green": 0,
        "red": 0,
        "x": 0,
        "y": 0,
        "z": 0
    },
    "colorStart": {
        "blue": 242,
        "green": 216,
        "red": 44,
        "x": 44,
        "y": 216,
        "z": 242
    },
    "dimensions": {
        "blue": 0.8199999928474426,
        "green": 0.8199999928474426,
        "red": 0.8199999928474426,
        "x": 0.8199999928474426,
        "y": 0.8199999928474426,
        "z": 0.8199999928474426
    },
    "emitAcceleration": {
        "blue": 0,
        "green": 0,
        "red": 0,
        "x": 0,
        "y": 0,
        "z": 0
    },
    "emitOrientation": {
        "w": 0.7071068286895752,
        "x": 0.7071068286895752,
        "y": -1.5259198335115798e-05,
        "z": -1.5259198335115798e-05
    },
    "emitRate": 1,
    "emitSpeed": 0,
    "lifespan": 6.130000114440918,
    "maxParticles": 1609,
    "particleRadius": 0.4099999964237213,
    "radiusFinish": 0.10000000149011612,
    "radiusStart": 0,
    "rotation": {
        "w": 0.8684672117233276,
        "x": -1.52587890625e-05,
        "y": 0.4957197904586792,
        "z": -1.52587890625e-05
    },
    "speedSpread": 0,
    "spinFinish": null,
    "spinStart": null,
    "textures": "http://hifi-content.s3.amazonaws.com/alexia/LoadingScreens/Portals/circle.png",
    "type": "ParticleEffect",
    "userData": "{\"grabbableKey\":{\"grabbable\":false}}"
};

var rays = {
    "alpha": 0,
    "alphaFinish": 0,
    "alphaStart": 1,
    "color": {
        "blue": 211,
        "green": 227,
        "red": 104
    },
    "colorFinish": {
        "blue": 0,
        "green": 0,
        "red": 0,
        "x": 0,
        "y": 0,
        "z": 0
    },
    "colorStart": {
        "blue": 211,
        "green": 227,
        "red": 104,
        "x": 104,
        "y": 227,
        "z": 211
    },
    "dimensions": {
        "blue": 2.5,
        "green": 2.5,
        "red": 2.5,
        "x": 2.5,
        "y": 2.5,
        "z": 2.5
    },
    "emitAcceleration": {
        "blue": 0,
        "green": 0,
        "red": 0,
        "x": 0,
        "y": 0,
        "z": 0
    },
    "emitDimensions": {
        "blue": 1,
        "green": 1,
        "red": 1,
        "x": 1,
        "y": 1,
        "z": 1
    },
    "emitOrientation": {
        "w": 0.9993909597396851,
        "x": 0.034897372126579285,
        "y": -1.525880907138344e-05,
        "z": -1.525880907138344e-05
    },
    "emitRate": 2,
    "emitSpeed": 0,
    "maxParticles": 40,
    "name": "Rays",
    "particleRadius": 0.75,
    "polarFinish": 3.1415927410125732,
    "radiusFinish": 0.10000000149011612,
    "radiusStart": 0,
    "rotation": {
        "w": 0.9803768396377563,
        "x": -1.52587890625e-05,
        "y": 0.19707024097442627,
        "z": -7.62939453125e-05
    },
    "speedSpread": 0,
    "spinFinish": null,
    "spinStart": null,
    "textures": "http://hifi-content.s3.amazonaws.com/alexia/Models/Portal/stripe.png",
    "type": "ParticleEffect",
    "userData": "{\"grabbableKey\":{\"grabbable\":false}}"
};


module.exports = {
    smoke1: smoke1,
    smoke2: smoke2,
    bubbles: bubbles,
    star: star,
    circle: circle,
    rays: rays
};