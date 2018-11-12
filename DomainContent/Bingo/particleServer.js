//
// particleServer.js
// 
// Created by Rebecca Stankus on 11/08/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function() {
    var _this;

    var Particle = function() {
        _this = this;
    };

    Particle.prototype = {
        calledNumbers: [],
        remotelyCallable: ['turnOn', 'turnOff'],
        
        preload: function(entityID) {
            _this.entityID = entityID;
        },

        turnOn: function() {
            var name = Entities.getEntityProperties(_this.entityID, 'name').name;
            if (name.indexOf("Confetti") !== -1) {
                Entities.editEntity(_this.entityID, { emitRate: 61 });
            } else {
                Entities.editEntity(_this.entityID, { emitRate: 19 });
            }
        },

        turnOff: function() {
            Entities.editEntity(_this.entityID, { emitRate: 0 });
        }
    };
    
    return new Particle();
});
