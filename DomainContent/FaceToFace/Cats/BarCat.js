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

    var ROTATION_A = Quat.fromVec3Degrees({x:0, y: 90, z:0});
    var ROTATION_B = Quat.fromVec3Degrees({x:0, y: -90, z:0});

    var ITERATION_BASE = 100;
    var PAUSE_TIME_MS = 4000;
    var MOVE_TIME_MS = 10000;
    var UPDATE_RATE = 60;
    var MILLISECONDS = 1000;

    var SLERP_ALPHA_MAX = 1.0;
    var SLERP_ALPHA_ITERATION = 0.2;

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

                var rotation = isGoingUp ? ROTATION_A : ROTATION_B; 
                var newRotation = isGoingUp ? ROTATION_B : ROTATION_A; 
                
                var alpha = 0;

                var rotationInterval = Script.setInterval(function(){
                    if (alpha <= SLERP_ALPHA_MAX) {
                        var intermediateRotation = Quat.slerp(rotation, newRotation, alpha);
                        Entities.editEntity(_entityID, {'rotation': intermediateRotation});
                        alpha += SLERP_ALPHA_ITERATION;
                    }
                }, PAUSE_TIME_MS / ITERATION_BASE);
                
                Script.setTimeout(function () {
                    movePlatform(!isGoingUp);
                    Script.clearInterval(rotationInterval);
                }, PAUSE_TIME_MS);
            }
        }, MILLISECONDS / UPDATE_RATE);
    };
});