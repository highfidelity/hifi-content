//
// makeDodgeball.js
//
//  Simple game of dodgeball - Make file
//  Created by Midnight Rift on 10/01/2017
//  Modified by Philip Rosedale and Milad Nazeri
//  Copyright 2017 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

var NAME = "dodgeball";
var SIZE = 0.2;
var TYPE = "Model";
var MODEL_URL = Script.resolvePath('Dodgeball.fbx');
var MODEL_DIMENSION = { x: 0.2, y: 0.2, z: 0.2 };
var ENTITY_URL = Script.resolvePath('dodgeball.js');
var LIFETIME = -1;
var GRAVITY = { x: 0, y: -9.8, z: 0 };

var collidable = true;
var gravity = true;

var HOW_FAR_IN_FRONT_OF_ME = 1;
var HOW_FAR_ABOVE_ME = 0;

var leaveBehind = false;

var userData = {
    grabbableKey: {
        grabbable: true
    }
};

var ballLocation = Vec3.sum(MyAvatar.position, Vec3.multiply(HOW_FAR_IN_FRONT_OF_ME, Quat.getForward(MyAvatar.orientation)));
ballLocation.y += HOW_FAR_ABOVE_ME;
var dodgeBall = Entities.addEntity({
    type: TYPE,
    modelURL: MODEL_URL,
    shapeType: "sphere",
    name: NAME,
    position: ballLocation,
    dimensions: (TYPE === "Model") ? MODEL_DIMENSION : { x: SIZE, y: SIZE, z: SIZE },
    gravity: (gravity ? GRAVITY : { x: 0, y: 0, z: 0 }),
    dynamic: collidable,
    lifetime: LIFETIME,
    script: ENTITY_URL,
    userData: JSON.stringify(userData)
});

function scriptEnding() {
    if (!leaveBehind) {
        Entities.deleteEntity(dodgeBall);
    }
}

Script.scriptEnding.connect(scriptEnding);
