//  
//  effectTrailerLeft.js
//  An entity script to track left trigger holds to create trails in a particle effect
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
    var pressThreshold = 0.01;

    _this.preload = function(entityID) {
        _this.entityID = entityID;
    };

    // The name of the new mapping
    var MAPPING_NAME = "com.highfidelity.controllers.example.triggerExample";

    // Create a new mapping object
    var mapping = Controller.newMapping(MAPPING_NAME);
    var oldPressStrength = 0;
    var pressStrength = 0;

    mapping.from(Controller.Standard.LT).to(function(value) {
        var props = Entities.getEntityProperties(_this.entityID, 'isEmitting');
        pressStrength = value;
        if (pressStrength < pressThreshold && oldPressStrength >= pressThreshold) {
            props.isEmitting = false;
            Entities.editEntity(_this.entityID, props);
        }

        if (pressStrength >= pressThreshold && oldPressStrength < pressThreshold) {
            props.isEmitting = true;
            Entities.editEntity(_this.entityID, props);
        }

        oldPressStrength = pressStrength;
    });

    Controller.enableMapping(MAPPING_NAME);

    // Disable the new mapping when the script ends
    Script.scriptEnding.connect(function () {
        Controller.disableMapping(MAPPING_NAME);
    });


});