//
//  todayButtonTargetServer.js
//
//  Created by Rebecca Stankus on 6/6/18.
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() { 
    var _this;

    var moving;
    var currentPosition;
    var upPosition;
    var downPosition;
    var movementIntervalMS = 15;
    var fasterMovementInterval = 10;
    var movementIncrementM = 0.02;
    var movementIncrementMin = 0.01;
    var fasterMovementIncrementM = 0.3;
    var intervalChange = 0.0018;
    var jungle = false;

    var ButtonTarget = function() {
        _this = this;
    };

    ButtonTarget.prototype = {
        remotelyCallable: ['raise', 'lower'],

        preload: function(entityID) {
            _this.entityID = entityID;
            var properties = Entities.getEntityProperties(_this.entityID, ['dimensions','position', 'name']);
            if (properties.name === "Today Web Entity Left") {
                downPosition = { x: 92.6318, y: -3.3 , z: 29.1593 };
                upPosition = { x: 92.6318, y: 1.7866 , z: 29.1593 };
                currentPosition = { x: 92.6318, y: -3.3, z: 29.1593 };
                Entities.editEntity(_this.entityID, { position: currentPosition});
            } else if (properties.name === "Today Web Entity Right") {
                downPosition = { x: 106.5170, y: -3.3, z: 28.7495 };
                upPosition = { x: 106.5170, y: 1.7845, z: 28.7495 };
                currentPosition = { x: 106.5170, y: -3.3, z: 28.7495 };
                Entities.editEntity(_this.entityID, { position: currentPosition});
            } else if (properties.name === "Today Backdrop") {
                downPosition = { x: 99.5627, y: 4.3645 , z: 28.5393 };
                upPosition = { x: 99.5627, y: 16 , z: 28.5393 };
                currentPosition = { x: 99.5627, y: 16 , z: 28.5393 };
                Entities.editEntity(_this.entityID, { position: currentPosition});
            } else if (properties.name === "Jungle-Cube") {
                downPosition = { x: 100.2585, y: -25 , z: 23.7524 };
                upPosition = { x: 100.2585, y: 0.8465 , z: 23.7524 };
                currentPosition = { x: 100.2585, y: -25 , z: 23.7524 };
                Entities.editEntity(_this.entityID, { position: currentPosition});
                movementIntervalMS = fasterMovementInterval;
                movementIncrementM = fasterMovementIncrementM;
                jungle = true;
            }
        },

        up: function() {
            if (jungle && movementIncrementM > movementIncrementMin) {
                print("up jungle");
                movementIncrementM -= intervalChange;
            }
            if (currentPosition.y < upPosition.y) {
                currentPosition.y += movementIncrementM;
                Entities.editEntity(_this.entityID, {
                    position: currentPosition
                });
            } else {
                if (jungle) {
                    print("up else jungle");
                    movementIncrementM = fasterMovementIncrementM;
                }
                if (moving) {
                    Script.clearInterval(moving);
                }
            }
        },

        down: function() {
            if (jungle && movementIncrementM > movementIncrementMin) {
                print("down jungle");
                movementIncrementM -= intervalChange;
            }
            if (currentPosition.y > downPosition.y) {
                currentPosition.y -= movementIncrementM;
                Entities.editEntity(_this.entityID, {
                    position: currentPosition
                });
            } else {
                if (jungle) {
                    print("down jungle");
                    movementIncrementM = fasterMovementIncrementM;
                }
                if (moving) {
                    Script.clearInterval(moving);
                }
            }
        },

        raise: function() {
            if (moving) {
                Script.clearInterval(moving);
            }
            moving = Script.setInterval(function() {
                _this.up();
            }, movementIntervalMS);
        },

        lower: function() {
            if (moving) {
                Script.clearInterval(moving);
            }
            moving = Script.setInterval(function() {
                _this.down();
            }, movementIntervalMS);
        },

        unload: function() {
            if (moving) {
                Script.clearInterval(moving);
            }
        }
    };

    return new ButtonTarget();
});
