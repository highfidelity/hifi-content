//
//  elevator.js
//
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
/* globals Script Entities Vec3 */

(function() {
  
    var pointA = {x: -9.6362, y: -8.9245, z: 5.1167};
    var pointB = {x: -9.6362, y: -13.733, z: 5.1167};
    var pauseTime = 4; // seconds
    var MOVE_TIME = 5;
    var goingUp = false;
    var _entityID;
    this.preload = function(entityID) {
        _entityID = entityID;
        Script.setInterval(function() {
            movePlatform(goingUp);
            goingUp = !goingUp;
        }, (pauseTime + MOVE_TIME) * 1000);
    };
  
    var movePlatform = function(isGoingUp) {
        var from = isGoingUp ? pointA : pointB;
        var to = isGoingUp ? pointB : pointA;
        var moveTime = MOVE_TIME;
        var moveDirection = Vec3.subtract(to , from);
        var moveVelocity = Vec3.multiply(moveDirection, 1 / moveTime);
        Entities.editEntity(_entityID, {
            velocity: moveVelocity,
            position: from,
            damping: 0
        });

        Script.setTimeout(function() {
            Entities.editEntity(_entityID, {
                velocity: {x: 0, y: 0, z: 0},
                position: to
            });
        }, moveTime * 1000);

    };
});