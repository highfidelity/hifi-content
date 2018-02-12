//
// createSpirit.js
// A script to activate the spirit within the cemetery in hifi://Mexico
// 
// Author: Elisa Lupin-Jimenez
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// All assets are under CC Attribution Non-Commerical
// http://creativecommons.org/licenses/
//

(function() {

    var spiritID;

    var DISPLACEMENT = 0.5;
    var DISTANCE_FROM_AVATAR = 0.05;
    var INTERVAL = 200;
    var TIMEOUT = 5000;
    var START_POSITION = {
        x: 500,
        y: 503.5,
        z: 529
    };

    var flower = {
        "dynamic": true,
        "gravity": {
            x: 0.0,
            y: -2,
            z: 0.0
        },
        "lifetime": 30,
        "modelURL": Script.resolvePath("./assets/marigold/model.obj"),
        "name": "Spirit Rose",
        "type": "Model",
        "position": START_POSITION,
        "shapeType": "compound",
        "userData": "{\"grabbableKey\":{\"grabbable\":true}}"
    };

    var SPIRIT = {
        "accelerationSpread": {
            "x": 0,
            "y": 2,
            "z": 0.5
        },
        "alphaSpread": 1,
        "clientOnly": 0,
        "color": {
            "blue": 200,
            "green": 200,
            "red": 200
        },
        "colorFinish": {
            "blue": 200,
            "green": 200,
            "red": 200
        },
        "colorStart": {
            "blue": 200,
            "green": 200,
            "red": 200
        },
        "created": "2018-02-05T22:13:30Z",
        "dimensions": {
            "x": 6.5,
            "y": 6.5,
            "z": 6.5
        },
        "emitAcceleration": {
            "x": 0,
            "y": 2,
            "z": 0
        },
        "emitOrientation": {
            "w": 1,
            "x": -1.52587890625e-05,
            "y": -1.52587890625e-05,
            "z": -1.52587890625e-05
        },
        "emitRate": 5,
        "emitSpeed": 0,
        "id": "{b12733e5-03bd-4576-9229-8295e833baff}",
        "lastEdited": 1517869051214151,
        "lastEditedBy": "{f3373fd7-e958-4584-ab6f-65531a92e6c7}",
        "lifespan": 5,
        "maxParticles": 10,
        "name": "Cemetery Spirit",
        "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
        "particleRadius": 0.25,
        "position": START_POSITION,
        "queryAACube": {
            "scale": 104.78907012939453,
            "x": -52.394535064697266,
            "y": -52.394535064697266,
            "z": -52.394535064697266
        },
        "radiusFinish": 0.25,
        "radiusStart": 0.25,
        "rotation": {
            "w": 0.5780575275421143,
            "x": -1.52587890625e-05,
            "y": -0.8159762024879456,
            "z": -1.52587890625e-05
        },
        "speedSpread": 0,
        "textures": Script.resolvePath("./assets/sparkle.png"),
        "type": "ParticleEffect",
        "userData": "{\"grabbableKey\":{\"grabbable\":false}}"
    };

    function getPositionToCreateEntity() {
        var direction = Quat.getFront(MyAvatar.orientation);
        var position = Vec3.sum(MyAvatar.position, Vec3.multiply(direction, DISPLACEMENT));
        position.y += DISPLACEMENT;
        return position;
    };

    this.enterEntity = function(entityID) {
        spiritID = Entities.addEntity(SPIRIT, true);
        var position;
        Script.setInterval(function () {
            if (spiritID !== 0) {
                position = Entities.getEntityProperties(spiritID, "position").position;
                var destination = Vec3.multiply(-1, Vec3.normalize(Vec3.subtract(position, MyAvatar.position)));
                var newVelocity = {
                    "velocity": destination
                };
                Entities.editEntity(spiritID, newVelocity);

                if (Vec3.distance(MyAvatar.position, position) < DISTANCE_FROM_AVATAR) {
                    Entities.deleteEntity(spiritID);
                    flower.position = getPositionToCreateEntity();
                    Entities.addEntity(flower, true);
                    spiritID = 0;
                }
            }
        }, INTERVAL);
    };

    this.leaveEntity = function(entityID) {
        if (spiritID !== 0) {
            Entities.deleteEntity(spiritID);
        }
    };

});