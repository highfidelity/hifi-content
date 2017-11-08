//  
//  micSync.js
//  An entity script to track microphone input changes in a particle effect
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

(function() {
    var _this = this;
    var DEFAULT_RADIUS = 0.25;
    var lastUpdateLevel = 0;

    _this.preload = function(entityID) {
        _this.entityID = entityID;
    };

    // to enable gradual growth/decline of particle size
    function mixValue(valueA, valueB, percentage) {
        return valueA + ((valueB - valueA) * percentage);
    }

    _this.intervalID = Script.setInterval(function() {
        if (Audio.inputLevel === 0) {
            if (lastUpdateLevel !== 0) {
                var effectProps = Entities.getEntityProperties(_this.entityID, 'particleRadius');
                effectProps.particleRadius = DEFAULT_RADIUS;
                lastUpdateLevel = 0;
                Entities.editEntity(_this.entityID, effectProps);
            }
        } else {
            var effectPropsChange = Entities.getEntityProperties(_this.entityID, 'particleRadius');
            var targetLevel = Audio.inputLevel + DEFAULT_RADIUS;
            effectPropsChange.particleRadius = mixValue(effectPropsChange.particleRadius, targetLevel, 0.5);
            lastUpdateLevel = Audio.inputLevel;
            Entities.editEntity(_this.entityID, effectPropsChange);
        }
    }, 10);

    _this.unload = function() {
        Script.clearInterval(_this.intervalID);
    };

});