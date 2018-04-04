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
// Buttons are named according to their type of function: open, close, hold, push in order, or simultaneous.
// The name also includes a number that must match the gate it is meant to control. A button changes color according to 
// its state and can only be pressed while green. Yellow indicates pressed down and red is disabled. A button should not 
// be parented or have children unless it is part of a "press in order" set in which case the child button must be in a 
// yellow state before its parent can be pressed. The last button of the series will not have a parentID and it 
// will open the gate. Buttons that must be held simultaneously have a sister button with the same name that must be in 
// a yellow state in order to open the gate. A "hold" must be held continuosly to open the gate.

/* global Pointers */

(function() {

    var BUTTON_PRESS_OFFSET = 0.02;
    var DOWN_TIME_MS = 3000;
    var DISABLED_TIME_MS = 10000;
    var NEGATIVE = -1;
    var SEARCH_RADIUS = 100;
    var NO_ID = "{00000000-0000-0000-0000-000000000000}";
    var GATE_NUMBER_INDEX = 12;
    var DEBUG = 0;
    var YELLOW = "https://hifi-content.s3.amazonaws.com/jimi/environment/201802_Shop/buttons/buttonYellow.fbx";
    var RED = "https://hifi-content.s3.amazonaws.com/jimi/environment/201802_Shop/buttons/buttonRed.fbx";
    var GREEN = "https://hifi-content.s3.amazonaws.com/jimi/environment/201802_Shop/buttons/buttonGreen.fbx";

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
                if (DEBUG) {
                    print("one red button");
                }
            } else {
                _this.color = GREEN;
                if (DEBUG) {
                    print("one green button");
                }
            }
            var properties = Entities.getEntityProperties(_this.entityID, ['position', 'name']);
            position = properties.position;
            _this.type = _this.getButtonType();
            if (DEBUG) {
                print("searching for a gate...");
            }
            var gateNumber = properties.name.charAt(GATE_NUMBER_INDEX);
            if (DEBUG) {
                print("gate number is " + gateNumber);
            }
            Entities.findEntities(properties.position, SEARCH_RADIUS).forEach(function(element) {
                var name = Entities.getEntityProperties(element, 'name').name;
                if (DEBUG) {
                    // print(name);
                }
                if ((name.indexOf("Zombie Gate") !== NEGATIVE) && (name.indexOf(gateNumber) !== NEGATIVE)) {
                    if (DEBUG) {
                        print("button " + _this.entityID + " is attached to gate " + element);
                    }
                    gate = element;
                    return;
                }
            });
        },
        getButtonType: function() {
            var buttonName = Entities.getEntityProperties(_this.entityID, 'name').name;
            if (buttonName.indexOf("Open") !== NEGATIVE) {
                if (DEBUG) {
                    print("button type is open");
                }
                return "open";
            } else if (buttonName.indexOf("Hold") !== NEGATIVE) {
                if (DEBUG) {
                    print("button type is hold");
                }
                return "hold";
            } else if (buttonName.indexOf("Synchronize") !== NEGATIVE) {
                if (DEBUG) {
                    print("button type is synch");
                }
                var buttonPosition = Entities.getEntityProperties(_this.entityID, 'position').position;
                Entities.findEntities(buttonPosition, SEARCH_RADIUS).forEach(function(element) {
                    var name = Entities.getEntityProperties(element, 'name').name;
                    if ((name.indexOf("Button") !== NEGATIVE) && (name.indexOf("Synchronize") !== NEGATIVE)) {
                        if (DEBUG) {
                            print("this button is " + _this.entityID);
                        }
                        if (_this.entityID !== element) {
                            _this.sisterButton = element;
                        }
                        if (DEBUG) {
                            print("sister button is " + _this.sisterButton);
                        }
                        var sisterColor = Entities.getEntityProperties(_this.sisterButton, 'color').color;
                        if (DEBUG) {
                            print("The initial sister color is " + JSON.stringify(sisterColor));
                        }
                        return;
                    }
                });
                return "synch";
            } else if (buttonName.indexOf("By Order") !== NEGATIVE) {
                var parent = Entities.getEntityProperties(_this.entityID, 'parentID').parentID;
                _this.parentID = parent;
                if (DEBUG) {
                    print("button type is order");
                }
                return "order";
            } else if (buttonName.indexOf("Close") !== NEGATIVE) {
                if (DEBUG) {
                    print("button type is close");
                }
                return "close";
            } else {
                if (DEBUG) {
                    print("Could not determine button type");
                }
            }
        },
        pressButton: function(){
            if (_this.color === GREEN) {
                if (_this.type === "open") {
                    if (DEBUG) {
                        print("open button pressed");
                    }
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
                    if (DEBUG) {
                        print("close button pressed");
                    }
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
                    if (DEBUG) {
                        print("button pressed");
                    }
                    _this.lowerButton();
                    _this.changeColorToYellow();
                    if (DEBUG) {
                        print("calling gate open method");
                    }
                    Entities.callEntityServerMethod(gate, 'openGate');
                    return;
                } else if (_this.type === "synch") {
                    if (DEBUG) {
                        print("button pressed is synch");
                    }
                    _this.changeColorToYellow();
                    _this.lowerButton();
                    var sisterColor = Entities.getEntityProperties(_this.sisterButton, 'color').color;
                    if (DEBUG) {
                        print("now the sister color is " + JSON.stringify(sisterColor));
                        print("yellow is " + JSON.stringify(YELLOW));
                    }
                    if (JSON.stringify(sisterColor) === (JSON.stringify(YELLOW))) {
                        Entities.callEntityServerMethod(gate, 'openGate');
                    }
                    return;
                } else if (_this.type === "order") {
                    if (DEBUG) {
                        print("pressed an order button");
                    }
                    if (_this.childButton) {
                        if (DEBUG) {
                            print("button has child, " + JSON.stringify(_this.childButton) + ", that must be pressed first");
                        }
                        var childColor = Entities.getEntityProperties(_this.childButton, 'modelURL').modelURL;
                        if (DEBUG) {
                            print("now the child color is " + JSON.stringify(childColor));
                            print("yellow is " + JSON.stringify(YELLOW));
                        }
                        if (JSON.stringify(childColor) === (JSON.stringify(YELLOW))) {
                            if (DEBUG) {
                                print("child button is yellow, pushing this button now");
                                print("button pressed");
                            }
                            _this.lowerButton();
                            _this.changeColorToYellow();
                            Script.setTimeout(function() {
                                _this.changeColorToRed();
                                _this.raiseButton();
                            }, DOWN_TIME_MS);
                            if (_this.parentID !== NO_ID) {
                                _this.changeParentColorToGreen();
                            } else {
                                if (DEBUG) {
                                    print("last node...calling gate open method");
                                }
                                Entities.callEntityServerMethod(gate, 'openGate');
                            }
                        } else {
                            if (DEBUG) {
                                print("child is not yellow...cannot push this one yet");
                            }
                        }
                    } else {
                        if (DEBUG) {
                            print("no child button...pressing this one...should be yellow now");
                        }
                        _this.lowerButton();
                        _this.changeColorToYellow();
                        Script.setTimeout(function() {
                            _this.changeColorToGreen();
                            _this.raiseButton();
                        }, DOWN_TIME_MS);
                        if (_this.parentID) {
                            _this.changeParentColorToGreen();
                        }
                    }
                    return;
                }
            }
        },
        changeParentColorToGreen: function() {
            if (DEBUG) {
                print("has parent...changing color of parent");
            }
            Entities.callEntityMethod(_this.parentID, 'changeColorToGreen');
            Script.setTimeout(function() {
                Entities.callEntityMethod(_this.parentID, 'changeColorToRed');
                Entities.callEntityMethod(_this.parentID, 'raiseButton');
            }, DISABLED_TIME_MS);
        },
        changeColorToGreen: function() {
            Entities.editEntity(_this.entityID, {
                modelURL: GREEN
            });
            _this.color = GREEN;
        },
        changeColorToRed: function() {
            Entities.editEntity(_this.entityID, {
                modelURL: RED
            });
            _this.color = RED;
        },
        changeColorToYellow: function() {
            Entities.editEntity(_this.entityID, {
                modelURL: YELLOW
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
        // for debugging
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
            if (_this.color === GREEN) {
                _this.pressButton();
            }
        },
        startNearTrigger: function(entityID, mouseEvent) {
            if (Pointers.isLeftHand(mouseEvent.id)) {
                currentHand = 0;
            } else if (Pointers.isRightHand(mouseEvent.id)) {
                currentHand = 1;
            }
            if (DEBUG) {
                print("trigger on button");
            }
            if (_this.color === GREEN) {
                _this.pressButton();
            }
        },
        mouseReleaseOnEntity: function(entityID, mouseEvent) {
            if (DEBUG) {
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
            }
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
            if (DEBUG) {
                print("stop near trigger on button");
            }
            if (_this.color === GREEN) {
                _this.pressButton();
            }
        },
        unload: function() {
        }
    };

    return new Button();
});
