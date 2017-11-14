//  
//  effectTrailer.js
//  An entity script to track trigger holds to create trails in a particle effect
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
    var firstController = Controller.Standard.LT;
    var controller = Controller.Standard.LT;

    _this.preload = function(entityID) {
        _this.entityID = entityID;
        //print("what is this 2: " + JSON.stringify(this));
        //var overlay = Entities.getChildrenIDs(_this.entityID);
        //print("what is the overlay id: " + overlay);
        var hand = Entities.getChildrenIDs(_this.entityID);
        //var hand = Entities.getChildrenIDs(entityID);
        var handProp = Overlays.getProperty(hand[0], "name");
        print("hand detected is " + handProp + ", typeof " + typeof handProp);

        if (handProp === "right") {
            print("this is right");
            controller = Controller.Standard.RT;
            print("controller switched: " + (controller !== firstController));
        }
    };

    /*var setController = function() {
        print("what is this: " + JSON.stringify(this));
        var hand = Entities.getChildrenIDs(_this.entityID);
        print("what is the hand id: " + hand);
        var handProp = Overlays.getProperty(hand[0], "name");
        print("hand detected is " + handProp + ", typeof " + typeof handProp);
        if (handProp === "right") {
            print("this is right");
            controller = Controller.Standard.RT;
            print("controller switched: " + controller !== firstController);
        }
    }

    setController();*/

    print("controller is left: " + (controller === firstController));

    // The name of the new mapping
    var MAPPING_NAME = "com.highfidelity.controllers.example.triggerExample";

    // Create a new mapping object
    var mapping = Controller.newMapping(MAPPING_NAME);
    var oldPressStrength = 0;
    var pressStrength = 0;

    mapping.from(controller).to(function(value) {
        print("controller is right: " + (controller !== firstController));
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