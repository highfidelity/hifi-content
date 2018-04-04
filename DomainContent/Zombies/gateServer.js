//
//  gateServer.js
//
//  Created by Rebecca Stankus on 3/6/18.
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() { 
    var _this;

    var MOVEMENT_INCREMENT_RAISE = 0.01;
    var MOVEMENT_INCREMENT_LOWER = 0.02;
    var MOVEMENT_INTERVAL_MS = 25;
    var MOVEMENT_INTERVAL_LOWER_MS = 12.5;
    var GATE_NUMBER_INDEX = 12;
    var DEBUG = 1;
    var RESET_TIMEOUT_MS = 100;

    var moving;
    var gateNumber;
    var currentPosition;
    var openedPosition;
    var closedPosition;

    if (DEBUG) {
        print("gate server script with debug statements running");
    }
    var Gate = function() {
        _this = this;
    };

    Gate.prototype = {
        remotelyCallable: ['raiseGate', 'lowerGate', 'openGate', 'closeGate', 'stopMovement', 'resetGate'],
        preload: function(entityID){
            _this.entityID = entityID;
            if (DEBUG) {
                print("_this.entityID is " + _this.entityID);
            }
            var properties = Entities.getEntityProperties(_this.entityID, ['dimensions','position', 'name']);
            gateNumber = properties.name.charAt(GATE_NUMBER_INDEX);
            if (gateNumber === 'A') {
                closedPosition = { x: 11.4011, y: -331.9088 , z: 8.1086 };
                openedPosition = { x: 11.4011, y: -330.1049 , z: 8.1086 };
                currentPosition = { x: 11.4011, y: -331.9088 , z: 8.1086 };
                Entities.editEntity(_this.entityID, { position: currentPosition});
            } else if (gateNumber === '1') {
                closedPosition = { x: 29.1757, y: -2.0202 , z: -31.2400 };
                openedPosition = { x: 29.1757, y: 1.7051 , z: -31.2400 };
                currentPosition = { x: 29.2013, y: -2.0202 , z: -31.2400 };
                Entities.editEntity(_this.entityID, { position: currentPosition});
            } else if (gateNumber === '2') {
                closedPosition = { x: 17.8213, y: 2.4338 , z: -49.6727 };
                openedPosition = { x: 17.8213, y: 6.5886, z: -49.6727 };
                currentPosition = { x: 17.8213, y: 2.4338 , z: -49.6727 };
                Entities.editEntity(_this.entityID, { position: currentPosition});
            } else if (gateNumber === '3') {
                closedPosition = { x: -13.1934, y: 5.9643 , z: -54.5696 };
                openedPosition = { x: -13.1934, y: 10.2018 , z: -52.6600 };
                currentPosition = { x: -13.1934, y: 5.9643 , z: -54.5696 };
                Entities.editEntity(_this.entityID, { position: currentPosition});
            } else if (gateNumber === '4') {
                closedPosition = { x: -60.2142, y: -1.1808 , z: -59.2634 };
                openedPosition = { x: -60.2139, y: 3.5965 , z: -59.2634 };
                currentPosition = { x: -60.2142, y: -1.1808 , z: -59.2634 };
                Entities.editEntity(_this.entityID, { position: currentPosition});
            } else if (gateNumber === '5') {
                closedPosition = { x:-27.1310, y:-7.7721 , z:-11.2323};
                openedPosition = { x:-27.1310, y:-3.9064 , z:-11.2323};
                currentPosition = { x:-27.1310, y:-7.7721, z:-11.2323};
                Entities.editEntity(_this.entityID, { position: currentPosition});
            }
        },
        resetGate: function() {
            if (DEBUG) {
                print("resetting gate");
            }
            if (moving) {
                Script.clearInterval(moving);
            }
            Script.setTimeout(function(){
                if (DEBUG) {
                    print("gate " + _this.entityID + "should be at " + JSON.parse(JSON.stringify(closedPosition)));
                }
                Entities.editEntity(_this.entityID, { position: closedPosition});
                currentPosition = JSON.parse(JSON.stringify(closedPosition));
            }, RESET_TIMEOUT_MS);
        },
        raiseGate: function() {
            if (DEBUG) {
                print("raising");
                print("current y position is " + currentPosition.y);
            }
            if (currentPosition.y < openedPosition.y) {
                currentPosition.y += MOVEMENT_INCREMENT_RAISE;
                Entities.editEntity(_this.entityID, {
                    position: currentPosition
                });
            } else {
                if (moving) {
                    Script.clearInterval(moving);
                }
            }
        },
        lowerGate: function() {
            if (DEBUG) {
                print("lowering");
                print("current position is " + JSON.stringify(currentPosition));
            }
            if (currentPosition.y > closedPosition.y) {
                currentPosition.y -= MOVEMENT_INCREMENT_LOWER;
                if (DEBUG) {
                    print("moving " + _this.entityID + " to " + currentPosition.y);
                }
                Entities.editEntity(_this.entityID, {
                    position: currentPosition
                });
            } else {
                if (moving) {
                    Script.clearInterval(moving);
                }
            }
        },
        openGate: function() {
            if (DEBUG) {
                print("opening gate");
            }
            if (moving) {
                Script.clearInterval(moving);
            }
            moving = Script.setInterval(function() {
                _this.raiseGate();
            }, MOVEMENT_INTERVAL_MS);
        },
        closeGate: function() {
            if (DEBUG) {
                print("closing gate");
            }
            if (moving) {
                if (DEBUG) {
                    print("clearing opening interval");
                }
                Script.clearInterval(moving);
            }
            moving = Script.setInterval(function() {
                _this.lowerGate();
            }, MOVEMENT_INTERVAL_LOWER_MS);
        },
        stopMovement: function() {
            if (DEBUG) {
                print("stopping movement");
            }
            if (moving) {
                if (DEBUG) {
                    print("stopping movement");
                }
                Script.clearInterval(moving);
            }
        },
        unload: function() {
            if (moving) {
                Script.clearInterval(moving);
            }
        }
    };

    return new Gate();
});
