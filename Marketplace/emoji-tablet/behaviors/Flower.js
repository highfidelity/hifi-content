//
// Flower.js
// An object that spawns flower particles when grabbed
// Attach to an entity 
// 
// Author: Liv Erickson
// Copyright High Fidelity 2017
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
(function() {

    var _this;

    var FlowerEmoji = function() {
        _this = this;
    };

    FlowerEmoji.prototype = {
        preload: function (entityID) {
            _this.entityID = entityID;
        },
        unload: function() {
            /* nothing here */
        },
        startNearGrab: function() {
            var petalProperties = {
                type: "ParticleEffect",
                position: Entities.getEntityProperties(_this.entityID).position,
                isEmitting: true,
                lifespan: 1.1,
                maxParticles: 10,
                // FIXME: save to another S3
                textures: "https://hifi-content.s3.amazonaws.com/liv/Particles/flower-1751495_960_720.png",
                emitRate: 3,
                emitSpeed: 1,
                emitDimensions: { x: 0, y: 0, z: 0, w: 0 },
                particleRadius: 0,
                radiusSpread: 0.27,
                radiusStart: 0.61,
                radiusFinish: 0.34,
                emitAcceleration: { x: 0, y: 0, z: 0 },
                accelerationSpread: { x: 0, y: 0, z: 0 },
                alpha: 1,
                alphaSpread: 0,
                alphaStart: 1,
                alphaFinish: 1,
                polarStart: 24,
                polarFinish: 168,
                lifetime: 5
            };

            Entities.addEntity(petalProperties);
            Entities.deleteEntity(_this.entityID);
        }
    };
    return new FlowerEmoji();
});
