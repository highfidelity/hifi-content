//
//  faucetClient.js
//
//  created by Rebecca Stankus on 03/27/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* global Pointers */

(function() { 
    var _this;

    var LEFT = 0;
    var RIGHT = 1;

    var currentHand = 0;
    
    function Faucet() {
        _this = this;
    }

    Faucet.prototype = {
        particle: null,
        preload: function(entityID) {
            _this.entityID = entityID;
            Entities.getChildrenIDs(_this.entityID).forEach(function(element) {
                var name = Entities.getEntityProperties(element, 'name').name;
                if (name === "Faucet Particle") {
                    _this.particle = element;
                }
            });
        },

        mousePressOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.button === "Primary") {
                if (!Pointers.isMouse(mouseEvent.id)) {
                    if (Pointers.isLeftHand(mouseEvent.id)) {
                        currentHand = LEFT;
                    } else if (Pointers.isRightHand(mouseEvent.id)) {
                        currentHand = RIGHT;
                    }
                }
                var HAPTIC_STRENGTH = 1;
                var HAPTIC_DURATION = 20;
                Controller.triggerHapticPulse(HAPTIC_STRENGTH, HAPTIC_DURATION, currentHand);
                Entities.callEntityServerMethod(_this.particle, 'toggle');
            }
        }
    };

    return new Faucet();
});
