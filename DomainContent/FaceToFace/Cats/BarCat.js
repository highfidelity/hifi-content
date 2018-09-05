//
//  BarCat.js
//
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
/* globals Script Entities Vec3 */

(function () {

    var POINT_A = {x: -0.2723, y: -8.9587, z: -2.4036};
    var POINT_B = {x: 3.6929, y: -8.9587, z: -2.4036};
    var PAUSE_TIME_MS = 4000;
    var MOVE_TIME_MS = 5000;
    var UPDATE_RATE = 60;
    var goingUp = false;
    var _entityID;

    this.preload = function (entityID) {
        _entityID = entityID;
        movePlatform(goingUp);
    };

    var movePlatform = function (isGoingUp) {
        var from = isGoingUp ? POINT_A : POINT_B;
        var to = isGoingUp ? POINT_B : POINT_A;
        var moveDirection = Vec3.subtract(to, from);

        var start = Date.now();
        var intervalHandle = Script.setInterval(function () {
            var current = Date.now();
            var elapsed = Math.min(MOVE_TIME_MS, current - start);

            var position = Vec3.multiply(moveDirection, elapsed / MOVE_TIME_MS);
            position = Vec3.sum(from, position);
            Entities.editEntity(_entityID, {
                position: position
            });

            if (elapsed >= MOVE_TIME_MS) {
                Script.clearInterval(intervalHandle);
                Script.setTimeout(function () {
                    movePlatform(!isGoingUp);
                }, PAUSE_TIME_MS);
            }
        }, 1000 / UPDATE_RATE);
    };
});