//
// courtyardPodiumButton_client.js
// 
// Created by Rebecca Stankus on 07/16/2019
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//


(function() {

    var BUTTON_PRESS_OFFSET = 0.02;
    var DEBUG = 0;
    var GREEN = "https://hifi-content.s3.amazonaws.com/jimi/environment/201802_Shop/buttons/buttonGreen.fbx";
    var TABLE_ID = "{7efa2a02-854f-4fca-a08a-40acca569a0d}";
    var FLOOR_ID = "{0e956af0-2d15-4719-9376-9dfcb455b495}";

    var position;
    var _this;
    var currentHand = 0;
    var otherButtons = [];

    var Button = function() {
        _this = this;
    };

    Button.prototype = {
        // Set up by getting info for this button and a list of other buttons
        preload: function(entityID) {
            _this.entityID = entityID;
            
            var properties = Entities.getEntityProperties(_this.entityID, ['position', 'name', 'modelURL', 'parentID']);
            _this.color = properties.modelURL;
            position = properties.position;
            _this.type = _this.getButtonType();
            
            Entities.getChildrenIDs(properties.parentID).forEach(function(podiumChild) {
                var properties = Entities.getEntityProperties(podiumChild, ['id', 'name']);
                if (properties.name.indexOf("Button") >= 0) {
                    if (properties.id !== _this.entityID) {
                        otherButtons.push(properties.id);
                    }
                }
            });
        },

        // Sort which type of button this is
        getButtonType: function() {
            var buttonName = Entities.getEntityProperties(_this.entityID, 'name').name;
            if (buttonName.indexOf("Open") >= 0) {
                if (DEBUG) {
                    print("button type is open");
                }
                return "open";
            } else if (buttonName.indexOf("Stage") >= 0) {
                if (DEBUG) {
                    print("button type is stage");
                }
                return "stage";
            } else if (buttonName.indexOf("Table") >= 0) {
                if (DEBUG) {
                    print("button type is table");
                }
                return "table";
            } else {
                if (DEBUG) {
                    print("Could not determine button type");
                }
            }
        },

        // Give haptic feedback if using controllers. Move objects into desired positions for each button type. 
        // Lower this button and raise other buttons.
        pressButton: function(){
            _this.color = Entities.getEntityProperties(_this.entityID, 'modelURL').modelURL;
            if (_this.color === GREEN) {
                var HAPTIC_STRENGTH = 1;
                var HAPTIC_DURATION = 20;
                Controller.triggerHapticPulse(HAPTIC_STRENGTH, HAPTIC_DURATION, currentHand);
                position.y -= BUTTON_PRESS_OFFSET;
                if (_this.type === "open") {
                    if (DEBUG) {
                        print("open button pressed");
                    }
                    Entities.callEntityServerMethod(TABLE_ID, 'lower');
                    Entities.callEntityServerMethod(FLOOR_ID, 'raise');
                } else if (_this.type === "stage") {
                    if (DEBUG) {
                        print("stage button pressed");
                    }
                    Entities.callEntityServerMethod(FLOOR_ID, 'lower');
                    Entities.callEntityServerMethod(TABLE_ID, 'lower');
                } else if (_this.type === "table") {
                    if (DEBUG) {
                        print("table button pressed");
                    }
                    Entities.callEntityServerMethod(TABLE_ID, 'raise');
                    Entities.callEntityServerMethod(FLOOR_ID, 'raise');
                }
                Entities.callEntityServerMethod(_this.entityID, 'lowerButton');
                otherButtons.forEach(function(otherButton) {
                    print("otherButton: ", otherButton);
                    Entities.callEntityServerMethod(otherButton, 'raiseButton');
                });
            }
        },

        // store which hand is being used and begin button press sequence
        mouseReleaseOnEntity: function(entityID, mouseEvent) {
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

        // store which hand is being used and begin button press sequence
        stopNearTrigger: function(entityID, mouseEvent) {
            if (Pointers.isLeftHand(mouseEvent.id)) {
                currentHand = 0;
            } else if (Pointers.isRightHand(mouseEvent.id)) {
                currentHand = 1;
            }
            if (DEBUG) {
                print("trigger on button");
            }
            _this.pressButton();
        }
    };

    return new Button();
});
