
/* global Pointers */

(function() { 
    var _this;

    var currentHand = 0;


    function Faucet() {
        _this = this;
    }

    Faucet.prototype = {
        particle: null,
        preload: function(entityID) {
            _this.entityID = entityID;
            print("preload");
            Entities.getChildrenIDs(_this.entityID).forEach(function(element) {
                var name = Entities.getEntityProperties(element, 'name').name;
                if (name === "Faucet Particle") {
                    print("got particle ", element);
                    _this.particle = element;
                }
            });
        },
        mousePressOnEntity: function(entityID, mouseEvent) {
            print(JSON.stringify(mouseEvent));
            if (mouseEvent.button === "Primary") {
                if (!Pointers.isMouse(mouseEvent.id)) {
                    if (Pointers.isLeftHand(mouseEvent.id)) {
                        currentHand = 0;
                    } else if (Pointers.isRightHand(mouseEvent.id)) {
                        currentHand = 1;
                    }
                }
                var HAPTIC_STRENGTH = 1;
                var HAPTIC_DURATION = 20;
                Controller.triggerHapticPulse(HAPTIC_STRENGTH, HAPTIC_DURATION, currentHand);
                print("calling server toggle");
                Entities.callEntityServerMethod(_this.particle, 'toggle');
            }
        }
        /* startNearTrigger : function() {
            print("trigger");
            Entities.callEntityServerMethod(_this.particle, 'toggle');
        }*/
    };

    return new Faucet();
});