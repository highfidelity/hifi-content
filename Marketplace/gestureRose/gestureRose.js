var X_TRIGGER_LIMIT = 0.1;
var Y_TRIGGER_DIST = -0.2;
var Z_TRIGGER_LIMIT = 0.1;
var GLOBAL_UP = {x: 0, y: 1, z: 0};
var DEG_TO_RAD = Math.PI / 180;
var ANGLE_MATCH = Math.cos(45 * DEG_TO_RAD);

var ROSE_SCALE = {z: 0.1297, y: 0.3165, x: 0.1241};
var ROSE_REZ_OFFSET = {x: 0, y: 0.25, z: 0};
var ROSE_LIFETIME = 300;
var ROSE_DEFAULT_GRAVITY = {x: 0, y: -7, z: 0};
var ROSE_URL = Script.resolvePath('longStemRose.fbx');

var gestureStarted = false;
var gestureStartPos = null;

Script.scriptEnding.connect(function () {
    shutdown();
});

controllerMappingName = 'gestureRoseMapping';
controllerMapping = Controller.newMapping(controllerMappingName);
controllerMapping.from(Controller.Standard.RightGrip).to(function (value) {
    if (value === 1 && isPalmUpwards()) {
        gestureStarted = true;
        gestureStartPos = MyAvatar.getJointPosition("RightHand");
    } else if (value === 0) {
        if (isPalmUpwards() && gestureStarted) {
            var gestureEndPos = MyAvatar.getJointPosition("RightHand");
            var total = Vec3.subtract(gestureEndPos, gestureStartPos);
            if (Math.abs(total.x) < X_TRIGGER_LIMIT && total.y < Y_TRIGGER_DIST && Math.abs(total.z) < Z_TRIGGER_LIMIT) {
                var clientOnly = !(Entities.canRez() || Entities.canRezTmp());
                Entities.addEntity({
                    name: "Long Stemmed Rose",
                    shapeType: "simple-hull",
                    type: "Model",
                    modelURL: ROSE_URL,
                    position: Vec3.sum(gestureEndPos, Vec3.multiplyQbyV(MyAvatar.orientation, ROSE_REZ_OFFSET)),
                    dimensions: ROSE_SCALE,
                    dynamic: true,
                    lifetime: ROSE_LIFETIME,
                    gravity: ROSE_DEFAULT_GRAVITY,
                    userData: "{ \"grabbableKey\": { \"grabbable\": true, \"kinematic\": false } }"
                }, clientOnly);
                gestureStarted = false;
            }
        } else if (gestureStarted) {
            gestureStarted = false;
        }
    }
});


init();

function isPalmUpwards() {
    var returnVal = false;
    var normal = Vec3.multiplyQbyV(Quat.multiply(MyAvatar.orientation, MyAvatar.getRightHandPose()["rotation"]), {
        x: 0,
        y: 0,
        z: 1
    });
    var angle = Vec3.dot(GLOBAL_UP, normal);
    if (angle > ANGLE_MATCH) {
        returnVal = true;
    }
    return returnVal;
}

function init() {
    Controller.enableMapping(controllerMappingName);
}


function shutdown() {
    try {
        Controller.disableMapping(controllerMappingName);
    } catch (e) {
        // empty
    }
}