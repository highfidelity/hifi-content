//
// aNjExplosionServer.js
// 
// Created by Rebecca Stankus on 09/13/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function () {

    var Explosion = function() {
    };

    Explosion.prototype = {

        remotelyCallable: ['createMannequin'],

        createMannequin: function () {
            Entities.addEntity({
                dimensions: {
                    x: 0.5697039365768433,
                    y: 2.143354892730713,
                    z: 0.7674942016601562
                },
                modelURL: "http://content.highfidelity.com/baked/avatar_island/mannequin-2/baked/mannequin-2.baked.fbx",
                name: "Flying Mannequin",
                lifetime: 60,
                velocity: { x: 2, y: -2, z: -1 },
                angularVelocity: { x: 0.5, y: -0.5, z: -0.25 },
                dynamic: true,
                shapeType: "simple-hull",
                gravity: { x: 0, y: -9.8, z: 0 },
                alpha: 0.5,
                position: {
                    x: 24.7291,
                    y: -4.4427,
                    z: -4.1873
                },
                rotation: {
                    w: -0.844480037689209,
                    x: 0.062058448791503906,
                    y: 0.5203174352645874,
                    z: -0.11076521873474121
                },
                type: "Model",
                userData: "{\"grabbableKey\":{\"grabbable\":false}}"
            });
        }
    };
    
    return new Explosion();
    
});
