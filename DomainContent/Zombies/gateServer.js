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

    var MOVEMENT_INCREMENT = 0.01;
    var MOVEMENT_INCREMENT_LOWER = 0.025;
    var MOVEMENT_INTERVAL_MS = 25;
    var MOVEMENT_INTERVAL_LOWER_MS = 5;

    var currentPosition;
    var checking;
    var open = false;
    var closed = true;
    var moving;

    var Gate = function() {
        _this = this;
    };

    Gate.prototype = {
        remotelyCallable: ['raiseGate', 'lowerGate', 'openGate', 'closeGate', 'stopMovement'],
        preload: function(entityID){
            _this.entityID = entityID;
            var properties = Entities.getEntityProperties(_this.entityID, ['dimensions','position']);
            _this.closedYPosition = properties.position.y;
            currentPosition = properties.position;
            var height = properties.dimensions.y;
            _this.openedYPosition = height + _this.closedYPosition;
        },
        raiseGate: function() {
            closed = false;
            if (currentPosition.y < _this.openedYPosition) {
                currentPosition.y += MOVEMENT_INCREMENT;
                Entities.editEntity(_this.entityID, {
                    position: currentPosition
                });
            } else {
                open = true;
            }
        },
        lowerGate: function() {
            open = false;
            if (currentPosition.y > _this.closedYPosition) {
                currentPosition.y -= MOVEMENT_INCREMENT_LOWER;
                Entities.editEntity(_this.entityID, {
                    position: currentPosition
                });
            } else {
                closed = true;
            }
        },
        openGate: function() {
            closed = false;
            if (moving) {
                Script.clearInterval(moving);
            }
            moving = Script.setInterval(function() {
                if (!open) {
                    _this.raiseGate();
                } else {
                    Script.clearInterval(moving);
                }
            }, MOVEMENT_INTERVAL_MS);
        },
        closeGate: function() {
            open = false;
            if (moving) {
                Script.clearInterval(moving);
            }
            moving = Script.setInterval(function() {
                if (!closed) {
                    _this.lowerGate();
                } else {
                    Script.clearInterval(moving);
                }
            }, MOVEMENT_INTERVAL_LOWER_MS);
        },
        stopMovement: function() {
            if (moving) {
                Script.clearInterval(moving);
            }
        },
        unload: function() {
            if (checking) {
                Script.clearInterval(checking);
            }
            if (moving) {
                Script.clearInterval(moving);
            }
        }
    };

    return new Gate();
});
