//
// bingoScannerParticleServer.js
// 
// Created by Rebecca Stankus on 11/08/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

/* global Entities */

(function() {
    var _this;

    var Particle = function() {
        _this = this;
    };

    Particle.prototype = {
        remotelyCallable: ['turnOn', 'turnOff'],
        
        /* ON LOADING THE APP: Save a reference to this entity ID */
        preload: function(entityID) {
            _this.entityID = entityID;
        },

        /* TURN ON PARTICLE: Set emitRate higher to turn on a particle emitter */
        turnOn: function() {
            var name = Entities.getEntityProperties(_this.entityID, 'name').name;
            if (name.indexOf("Confetti") !== -1) {
                Entities.editEntity(_this.entityID, { emitRate: 61 });
            } else {
                Entities.editEntity(_this.entityID, { emitRate: 19 });
            }
        },

        /* TURN OFF PARTICLE: Set emitRate back to 0 to turn off a particle emitter */
        turnOff: function() {
            Entities.editEntity(_this.entityID, { emitRate: 0 });
        }
    };
    
    return new Particle();
});
