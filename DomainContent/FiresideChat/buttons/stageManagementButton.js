//
// todayButton.js
// 
// Created by Rebecca Stankus on 06/05/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function() {

    var BUTTON_PRESS_OFFSET = 0.02;
    var DOWN_TIME_MS = 3000;
    var NEGATIVE = -1;
    var SEARCH_RADIUS = 100;

    var _this;
    var windows = [];
    var backdrop;
    var properties;
    var currentHand = 0;

    var Button = function() {
        _this = this;
    };

    Button.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            properties = Entities.getEntityProperties(_this.entityID, ['position', 'name']);
            _this.type = _this.getButtonType();
            _this.target = _this.getButtonTarget();
            Entities.findEntities(properties.position, SEARCH_RADIUS).forEach(function(element) {
                var name = Entities.getEntityProperties(element, 'name').name;
                if (_this.target === "Web") {
                    if ((name.indexOf("Today Web Entity") !== NEGATIVE)) {
                        windows.push(element);
                        return;
                    }
                } else {
                    if ((name.indexOf("Today Backdrop") !== NEGATIVE)) {
                        backdrop = element;
                        return;
                    }
                }
            });
        },
        getButtonType: function() {
            
            if (properties.name.indexOf("Raise") !== NEGATIVE) {
                return "Raise";
            } else {
                return "Lower";
            }
            
        },

        getButtonTarget: function() {
            if (properties.name.indexOf("Web Entities") !== NEGATIVE) {
                return "Web";
            } else {
                return "Backdrop";
            }
        },

        pressButton: function() {
            if (_this.type === "Raise") {
                _this.lowerButton();
                if (_this.target === "Web") {
                    windows.forEach(function(element) {
                        Entities.callEntityServerMethod(element, 'raise');
                    });
                } else {
                    Entities.callEntityServerMethod(backdrop, 'raise');
                }
                Script.setTimeout(function() {
                    _this.raiseButton();
                }, DOWN_TIME_MS);
            } else {
                _this.lowerButton();
                if (_this.target === "Web") {
                    windows.forEach(function(element) {
                        Entities.callEntityServerMethod(element, 'lower');
                    });
                } else {
                    Entities.callEntityServerMethod(backdrop, 'lower');
                }
                Script.setTimeout(function() {
                    _this.raiseButton();
                }, DOWN_TIME_MS);
                return;
            }
        },

        raiseButton: function() {
            Entities.editEntity(_this.entityID, {
                position: properties.position
            });
        },

        lowerButton: function() {
            var HAPTIC_STRENGTH = 1;
            var HAPTIC_DURATION = 20;
            Controller.triggerHapticPulse(HAPTIC_STRENGTH, HAPTIC_DURATION, currentHand);
            properties.position.y -= BUTTON_PRESS_OFFSET;
            Entities.editEntity(_this.entityID, {
                position: properties.position
            });
            properties.position.y += BUTTON_PRESS_OFFSET;
        },
        
        mousePressOnEntity: function(entityID, mouseEvent) {
            if (!mouseEvent.button === "Primary") {
                return;
            }
            if (!Pointers.isMouse(mouseEvent.id)) {
                if (Pointers.isLeftHand(mouseEvent.id)) {
                    currentHand = 0;
                } else if (Pointers.isRightHand(mouseEvent.id)) {
                    currentHand = 1;
                }
            }
            _this.pressButton();
        },

        startNearTrigger: function(entityID, mouseEvent) {
            if (Pointers.isLeftHand(mouseEvent.id)) {
                currentHand = 0;
            } else if (Pointers.isRightHand(mouseEvent.id)) {
                currentHand = 1;
            }
            _this.pressButton();
        },

        stopNearTrigger: function(entityID, mouseEvent) {
            if (!mouseEvent.button === "Primary") {
                return;
            }
            if (!Pointers.isMouse(mouseEvent.id)) {
                if (Pointers.isLeftHand(mouseEvent.id)) {
                    currentHand = 0;
                } else if (Pointers.isRightHand(mouseEvent.id)) {
                    currentHand = 1;
                }
            }
            _this.pressButton();
        },

        unload: function() {
        }
    };

    return new Button();
});
