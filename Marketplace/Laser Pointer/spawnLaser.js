//
//  spawnLaser.js
//
//  Created by Rebecca Stankus on 1/9/18.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

function getPosition() {
    var direction = Quat.getFront(MyAvatar.orientation);
    var distance = 3;
    var position = Vec3.sum(MyAvatar.position, Vec3.multiply(direction, distance));
    position.y += 0.4;
    return position;
}

var laser = Entities.addEntity({
    name: "laser pointer CC-BY Joseph Simpson",
    dimensions: {
        "x": 0.026311200112104416,
        "y": 0.02934306487441063,
        "z": 0.15379677712917328
    },
    modelURL: "https://hifi-content.s3.amazonaws.com/rebecca/laser/laser.obj",
    position: getPosition(),
    script: "https://hifi-content.s3.amazonaws.com/rebecca/laser/laser.js",
    shapeType: "simple-compound",
    dynamic: false,
    locked: false,
    collisionless: true,
    userData: "{\"grabbableKey\":{\"invertSolidWhileHeld\":true},\"wearable\":{\"joints\":" +
        "{\"RightHand\": [{\"x\": 0.005133628845214844,\"y\": 0.0886240005493164,\"z\":0.0679941177368164}," +
        "{\"x\": -0.5153224468231201,\"y\": 0.39883291721343994,\"z\": 0.044368743896484375,\"w\": -0.7572215795516968}]," +
        "\"LeftHand\":" +
        "[{\"x\":0.0013141632080078125,\"y\":0.10050678253173828,\"z\":0.04808616638183594},{\"x\":-0.4234726130962372," +
        "\"y\":-0.4645879864692688,\"z\":0.14066995680332184,\"w\":-0.7648793458938599}]}}}",
    type: "Model"
});
