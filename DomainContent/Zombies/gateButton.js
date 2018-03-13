//
// gateButton.js
// 
// Edited by Rebecca Stankus on 03/07/2018
// from button1.js by Elisa Lupin-Jimenez
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

/* global Pointers*/

(function() {

    var BUTTON_PRESS_OFFSET = 0.02;
    var DOWN_TIME_MS = 3000;
    var DISABLED_TIME_MS = 10000;
    var NEGATIVE = -1;
    var SEARCH_RADIUS = 100;
    var NO_ID = "{00000000-0000-0000-0000-000000000000}";
    var GATE_NUMBER_INDEX = 12;

    var YELLOW = {
        red: 237,
        green: 220,
        blue: 26
    };

    var RED = {
        red: 255,
        green: 0,
        blue: 0
    };

    var GREEN = {
        red: 28,
        green: 165,
        blue: 23
    };

    var position;
    var _this;
    var gate;
    var currentHand = 0;

    var Button = function() {
        _this = this;
    };

    Button.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            var childIDs = Entities.getChildrenIDs(_this.entityID);
            if (childIDs[0]) {
                _this.childButton = childIDs[0];
                _this.color = RED;
            } else {
                _this.color = GREEN;
            }
            var properties = Entities.getEntityProperties(_this.entityID, ['position', 'name']);
            position = properties.position;
            _this.type = _this.getButtonType();
            print("searching fora gate...");
            var gateNumber = properties.name.charAt(GATE_NUMBER_INDEX);
            print("gate number is " + gateNumber);
            Entities.findEntities(_this.entityID, SEARCH_RADIUS).forEach(function(element) {
                var name = Entities.getEntityProperties(element, 'name').name;
                if ((name.indexOf("Zombie Gate") !== NEGATIVE) && (name.indexOf(gateNumber) !== NEGATIVE)) {
                    print("button " + _this.entityID + " is attached to gate " + element);
                    gate = element;
                    return;
                }
            });
        },
        getButtonType: function() {
            var buttonName = Entities.getEntityProperties(_this.entityID, 'name').name;
            if (buttonName.indexOf("Open") !== NEGATIVE) {
                return "open";
            } else if (buttonName.indexOf("Hold") !== NEGATIVE) {
                return "hold";
            } else if (buttonName.indexOf("Synchronize") !== NEGATIVE) {
                var buttonPosition = Entities.getEntityProperties(_this.entityID, 'position').position;
                Entities.findEntities(buttonPosition, SEARCH_RADIUS).forEach(function(element) {
                    var name = Entities.getEntityProperties(element, 'name').name;
                    if ((name.indexOf("Button") !== NEGATIVE) && (name.indexOf("Synchronize") !== NEGATIVE)) {
                        if (_this.entityID !== element) {
                            _this.sisterButton = element;
                        }
                        return;
                    }
                });
                return "synch";
            } else if (buttonName.indexOf("By Order") !== NEGATIVE) {
                var parent = Entities.getEntityProperties(_this.entityID, 'parentID').parentID;
                _this.parentID = parent;
                return "order";
            } else if (buttonName.indexOf("Close") !== NEGATIVE) {
                return "close";
            }
        },
        pressButton: function(){
            if (_this.color === GREEN) {
                if (_this.type === "open") {
                    _this.lowerButton();
                    _this.changeColorToYellow();
                    Entities.callEntityServerMethod(gate, 'openGate');
                    Script.setTimeout(function() {
                        _this.changeColorToRed();
                        _this.raiseButton();
                    }, DOWN_TIME_MS);
                    Script.setTimeout(function() {
                        _this.changeColorToGreen();
                    }, DISABLED_TIME_MS);
                    return;
                } if (_this.type === "close") {
                    _this.lowerButton();
                    _this.changeColorToYellow();
                    Entities.callEntityServerMethod(gate, 'closeGate');
                    Script.setTimeout(function() {
                        _this.changeColorToRed();
                        _this.raiseButton();
                    }, DOWN_TIME_MS);
                    Script.setTimeout(function() {
                        _this.changeColorToGreen();
                    }, DISABLED_TIME_MS);
                    return;
                } else if (_this.type === "hold") {
                    _this.lowerButton();
                    _this.changeColorToYellow();
                    Entities.callEntityServerMethod(gate, 'openGate');
                    return;
                } else if (_this.type === "synch") {
                    _this.changeColorToYellow();
                    _this.lowerButton();
                    var sisterColor = Entities.getEntityProperties(_this.sisterButton, 'color').color;
                    if (JSON.stringify(sisterColor) === (JSON.stringify(YELLOW))) {
                        Entities.callEntityServerMethod(gate, 'openGate');
                    }
                    return;
                } else if (_this.type === "order") {
                    if (_this.childButton) {
                        var childColor = Entities.getEntityProperties(_this.childButton, 'color').color;
                        if (JSON.stringify(childColor) === (JSON.stringify(YELLOW))) {
                            _this.lowerButton();
                            _this.changeColorToYellow();
                            Script.setTimeout(function() {
                                _this.changeColorToRed();
                                _this.raiseButton();
                            }, DISABLED_TIME_MS);
                            if (_this.parentID !== NO_ID) {
                                _this.changeParentColorToGreen();
                            } else {
                                Entities.callEntityServerMethod(gate, 'openGate');
                            }
                        }
                    } else {
                        _this.lowerButton();
                        _this.changeColorToYellow();
                        Script.setTimeout(function() {
                            _this.changeColorToGreen();
                            _this.raiseButton();
                        }, DISABLED_TIME_MS);
                        if (_this.parentID) {
                            _this.changeParentColorToGreen();
                        }
                    }
                    return;
                }
            }
        },
        changeParentColorToGreen: function() {
            Entities.callEntityMethod(_this.parentID, 'changeColorToGreen');
            Script.setTimeout(function() {
                Entities.callEntityMethod(_this.parentID, 'changeColorToRed');
                Entities.callEntityMethod(_this.parentID, 'raiseButton');
            }, DISABLED_TIME_MS);
        },
        changeColorToGreen: function() {
            Entities.editEntity(_this.entityID, {
                color: GREEN
            });
            _this.color = GREEN;
        },
        changeColorToRed: function() {
            Entities.editEntity(_this.entityID, {
                color: RED
            });
            _this.color = RED;
        },
        changeColorToYellow: function() {
            Entities.editEntity(_this.entityID, {
                color: YELLOW
            });
            _this.color = YELLOW;
        },
        raiseButton: function() {
            Entities.editEntity(_this.entityID, {
                position: position
            });
        },
        lowerButton: function() {
            var HAPTIC_STRENGTH = 1;
            var HAPTIC_DURATION = 20;
            Controller.triggerHapticPulse(HAPTIC_STRENGTH, HAPTIC_DURATION, currentHand);
            position.y -= BUTTON_PRESS_OFFSET;
            Entities.editEntity(_this.entityID, {
                position: position
            });
            position.y += BUTTON_PRESS_OFFSET;
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
            print("mouse press on button");
            if (_this.color === GREEN) {
                _this.pressButton();
            }
        },
        mouseReleaseOnEntity: function(entityID, mouseEvent) {
            if (!mouseEvent.button === "Primary") {
                return;
            }
            if (_this.type === "hold") {
                Entities.callEntityServerMethod(gate, 'stopMovement');
                _this.changeColorToGreen();
                _this.raiseButton();
                return;
            } else if (_this.type === "synch") {
                Entities.callEntityServerMethod(gate, 'stopMovement');
                _this.changeColorToGreen();
                _this.raiseButton();
                return;
            }
        },
        unload: function() {

        }
    };

    return new Button();
});