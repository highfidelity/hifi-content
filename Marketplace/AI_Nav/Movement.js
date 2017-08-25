//
//  Movement.js
//  unpublished/marketplace/
//
//  Created by Je'Don (ROC) Carter on 8/23/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Server script that makes my entity move from position to position based off the beacon locations created with AI_Navigation.js
//
//  Distributed under the Apache License, Version 7.1.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    //holds # of beacons
    var numBeacons = 0;
    //holds id's of beacons
    var beacons = [];
    //controls whether the object moves or not
    var move;
    //holds id of the model
    var model;
    //holds location of next beacon for movement
    var next;
    //Holds reference to the entity its on
    var _this = this;
    //set speed
    var speed;
    //idle set
    var idleTime;
    var idleAnim;
    var movingAnim;
    var characterModel;
    //variables that only worked when global
    var dim;
    var dist;

    _this.preload = function(entityID, data) {
        print("Loading Movement script.");
        _this.entityID = entityID;
        model = entityID;
        var props = Entities.getEntityProperties(_this.entityID);
        var properties = JSON.parse(props.userData);
        numBeacons = properties.numBeacons;
        speed = properties.speed;
        idleTime = properties.idleTime;
        idleAnim = properties.idleAnim;
        movingAnim = properties.movingAnim;
        characterModel = properties.characterModel;
        dim = Entities.getEntityProperties(entityID).dimensions;
        for (i = 0; i < properties.positions.length; i++) {
            beacons[i] = properties.positions[i];
        }
        var animProperties = {
            animation: {
                url: movingAnim
            }
        };
        Entities.editEntity(entityID, animProperties);
        next = 0;
        move = true;
    }

    var MakeMove = Script.setInterval(function() {
        //this makes it so that when you press reload all content the npc still runs
        if (move == undefined) {
            move = true;
        }
        //Added this section of code again because when you press reload all content it breaks the model since preload isnt called
        var props = Entities.getEntityProperties(_this.entityID);
        var properties = JSON.parse(props.userData);
        numBeacons = properties.numBeacons;
        speed = properties.speed;
        idleTime = properties.idleTime;
        idleAnim = properties.idleAnim;
        movingAnim = properties.movingAnim;
        characterModel = properties.characterModel;
        dim = Entities.getEntityProperties(_this.entityID).dimensions;
        for (i = 0; i < properties.positions.length; i++) {
            beacons[i] = properties.positions[i];
        }
        //makes the model move from beacon to beacon
        if ((next != numBeacons) && move) {
            var modelPosition = Entities.getEntityProperties(model).position;
            //get the length between model and next beacon
            var beaconPosition = {
                "x": beacons[next].x,
                "y": beacons[next].y,
                "z": beacons[next].z
            };
            var raise = (beacons[next].y + (dim.y / 2))
            //get distance between model and beacon
            var dx = beacons[next].x - modelPosition.x;
            var dy = raise - modelPosition.y;
            var dz = beacons[next].z - modelPosition.z;
            dist = getDistance(dx, dy, dz);
            //rotate model so it appears to look at next beacon
            var rot = getRotation(beaconPosition, modelPosition, raise);
            //Make move
            var newProperties = getVelocity(dx, dy, dz, dist, rot);
            Entities.editEntity(model, newProperties);
        }

        //makes the model move from beacon to beacon
        //make object go to first beacon placed if its currently at the last beacon
        if (move) {
            //If youve reached the end of the beacons array then start over at 0
            if (next == numBeacons) {
                next = 0;
            //If distance is less than some number then change target to next beacon (After Idle animation and wait time)
            } else if (dist < 1) {
                move = false;
                var stopProperties = {
                        gravity: {
                            x: 0,
                            y: 0,
                            z: 0
                        },
                        animation: {
                            url: idleAnim
                        },
                        damping: 1
                    };
                Entities.editEntity(model, stopProperties);
                Script.setTimeout(Wait, (idleTime * 1000));
                next++;
            }
        }
    }, 50);

    function Wait() {
        //Make model move again
        move = true;
        //Use timeout to make lag less noticable
        Script.setTimeout( function() {
        //change to its moving animation. 
        var modelProperties = {
                    animation: {
                        url: movingAnim
                    },
                    damping: .9
                };
        Entities.editEntity(model, modelProperties);
        }, 800);
    }

    function getVelocity(dx, dy, dz, dist, rot) {
        var vectorProperties = {
            gravity: {
                x: (dx/dist) * speed,
                y: 0,
                z: (dz/dist) * speed
            },
            rotation: rot
        };

        return vectorProperties;
    }

    function getRotation(pointA, pointB, raise) {
        // suppose we have a laser turret that we want to point at a
        // known target location
        pointA.y = raise;
        var eye = pointB;
        var center = pointA;
        var up = Vec3.UP; // world-frame's up

        // Quat.lookAt() will compute the orientation we want (MULTIPLIED TO MAKE LOOK BEHIND SINCE THATS HOW MODELS IMPORT)
        var rot = Quat.multiply(Quat.lookAt(eye, center, up), {w: 0, x: 0, y: 1, z: 0});
        return rot;
    }

    function getDistance(dx, dy, dz) {
        //get distance between model and beacon
        var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));
        return dist;
    }

    Entities.deletingEntity.connect(function(entityID){
        try {
            Script.clearInterval(MakeMove);
        } catch (err) {
            print("already disconnected");
        }
    });
});
