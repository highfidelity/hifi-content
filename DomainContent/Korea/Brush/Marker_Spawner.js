var modelURL = "https://hifi-content.s3.amazonaws.com/robin/models/korea/brushRotated2.fbx";

var orientation = MyAvatar.orientation;
orientation = Quat.safeEulerAngles(orientation);
var markerRotation = Quat.fromVec3Degrees({
    x: orientation.x + 10,
    y: orientation.y - 90,
    z: orientation.z
});

var markerPosition = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getForward(MyAvatar.orientation)));

var MARKER_CLIENT_SCRIPT_URL = Script.resolvePath("Marker_Client.js?v1" + Math.random());
var MARKER_SERVER_SCRIPT_URL = Script.resolvePath("Marker_Server.js?v1" + Math.random());

var leftHandPosition = {
    "x": -0.02,
    "y": 0.135,
    "z": 0.02
};

var leftHandRotation = Quat.fromPitchYawRollDegrees(90, -45, 0);
var rightHandPosition = Vec3.multiplyVbyV(leftHandPosition, { x: -1, y: 1, z: 1 });
var rightHandRotation = Quat.fromPitchYawRollDegrees(90, 45, 0);

var userData = {
    "grabbableKey": {
        "grabbable": true
    },
    "equipHotspots": [
        {
            "position": {
                "x": 0,
                "y": 0,
                "z": 0
            },
            "radius": 0.5,
            "joints": {
                "LeftHand": [
                    leftHandPosition,
                    leftHandRotation
                ],
                "RightHand": [
                    rightHandPosition,
                    rightHandRotation
                ]
            }
        }
    ]
};

userData = JSON.stringify(userData);

var marker = Entities.addEntity({
    locked: false,
    type: "Model",
    modelURL: modelURL,
    rotation: markerRotation,
    shapeType: "box",
    name: "marker",
    dynamic: false,
    gravity: {
        x: 0,
        y: 0,
        z: 0
    },
    velocity: {
        x: 0,
        y: -0.1,
        z: 0
    },
    position: markerPosition,
    dimensions: {
        x: 0.0336,
        y: 0.0336,
        z: 0.6000
    },
    cloneable: true,
    cloneLifetime: 500,

    restitution: 0,
    friction: 0,
    collisionless: true,
    collidesWith: "",
    script: MARKER_CLIENT_SCRIPT_URL,
    serverScripts: MARKER_SERVER_SCRIPT_URL,
    userData: userData
});