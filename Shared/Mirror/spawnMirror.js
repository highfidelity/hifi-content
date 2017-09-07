// JavaScript source code

/**
This script creates a mirror that reflects when an avatar walks in front of it
*/

//get position in front of avatar for mirror
function getPosition() {
    var direction = Quat.getFront(MyAvatar.orientation);
    var distance = 5;
    var position = Vec3.sum(MyAvatar.position, Vec3.multiply(direction, distance));
    position.y += .4;
    return position;
}

var reflectionAreaPosition = getPosition();
//reflectionAreaPosition.y += .4;
reflectionAreaPosition.z += 1.5;

var mirror = Entities.addEntity({
    name: "mirror",
    dimensions: {
        x: 0.4,
        y: 0.8,
        z: 0.01
    },
    modelURL: "https://hifi-content.s3.amazonaws.com/patrickmanalich/mirrorFolder/models/mirror.fbx",
    "position": getPosition(),
    rotation: {
        w: 1,
        x: 0,
        y: 0,
        z: 0
    },
    script: "https://hifi-content.s3.amazonaws.com/rebecca/mirrorClient.js",
    shapeType: "simple-hull",
    type: "Model",
    dynamic: false,
    locked: true,
    collisionless: true,
    "userData": "{\"grabbableKey\":{\"grabbable\":true}}"
});

var reflection = Entities.addEntity({
    shape: "Cube",
    name: "mirrorReflectionArea",
    "position": reflectionAreaPosition,
    dimensions: {
        x: 0.8,
        y: 1.6,
        z: 3
    },
    rotation: {
        w: 1,
        x: 0,
        y: 0,
        z: 0
    },
    script: "https://hifi-content.s3.amazonaws.com/rebecca/mirrorReflection.js",
    shapeType: "box",
    parentID: mirror,
    type: "Zone",
    dynamic: false,
    locked: true,
    visible: false,
    collisionless: true
});




