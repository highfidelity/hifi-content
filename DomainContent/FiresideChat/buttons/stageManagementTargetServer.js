//
//  stageManagementTargetServer.js
//
//  Created by Rebecca Stankus on 3/6/18.
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() { 
    var _this;

    var MOVEMENT_INCREMENT_M = 0.02;
    var MOVEMENT_INTERVAL_MS = 15;

    var isMoving;
    var currentPosition;
    var upPosition;
    var downPosition;

    var ButtonTarget = function() {
        _this = this;
    };

    ButtonTarget.prototype = {
        remotelyCallable: ['raise', 'lower'],
        preload: function(entityID) {
            _this.entityID = entityID;
            var properties = Entities.getEntityProperties(_this.entityID, ['dimensions','position', 'name']);
            if (properties.name === "Today Web Entity 1") {
                downPosition = { x: 92.6318, y: -3 , z: 29.1593 };
                upPosition = { x: 92.6318, y: 1.7866 , z: 29.1593 };
                currentPosition = { x: 92.6318, y: -3, z: 29.1593 };
                Entities.editEntity(_this.entityID, { position: currentPosition});
            } else if (properties.name === "Today Web Entity 2") {
                downPosition = { x: 99.6177, y: -2 , z: 32.9348 };
                upPosition = { x: 99.6177, y: -0.5222 , z: 32.9348 };
                currentPosition = { x: 99.6177, y: -2 , z: 32.9348 };
                Entities.editEntity(_this.entityID, { position: currentPosition});
            } else if (properties.name === "Today Web Entity 3") {
                downPosition = { x: 106.5170, y: -3, z: 28.7495 };
                upPosition = { x: 106.5170, y: 1.7845, z: 28.7495 };
                currentPosition = { x: 106.5170, y: -3, z: 28.7495 };
                Entities.editEntity(_this.entityID, { position: currentPosition});
            } else if (properties.name === "Today Backdrop") {
                downPosition = { x: 99.5627, y: 4.3645 , z: 28.5393 };
                upPosition = { x: 99.5627, y: 16 , z: 28.5393 };
                currentPosition = { x: 99.5627, y: 16 , z: 28.5393 };
                Entities.editEntity(_this.entityID, { position: currentPosition});
            }
        },
        up: function() {
            if (currentPosition.y < upPosition.y) {
                currentPosition.y += MOVEMENT_INCREMENT_M;
                Entities.editEntity(_this.entityID, {
                    position: currentPosition
                });
            } else {
                if (isMoving) {
                    Script.clearInterval(isMoving);
                }
            }
        },
        down: function() {
            if (currentPosition.y > downPosition.y) {
                currentPosition.y -= MOVEMENT_INCREMENT_M;
                Entities.editEntity(_this.entityID, {
                    position: currentPosition
                });
            } else {
                if (isMoving) {
                    Script.clearInterval(isMoving);
                }
            }
        },
        raise: function() {
            if (isMoving) {
                Script.clearInterval(isMoving);
            }
            isMoving = Script.setInterval(function() {
                _this.up();
            }, MOVEMENT_INTERVAL_MS);
        },
        lower: function() {
            if (isMoving) {
                Script.clearInterval(isMoving);
            }
            isMoving = Script.setInterval(function() {
                _this.down();
            }, MOVEMENT_INTERVAL_MS);
        },
        unload: function() {
            if (isMoving) {
                Script.clearInterval(isMoving);
            }
        }
    };

    return new ButtonTarget();
});
