var watchURL = "https://hifi-content.s3.amazonaws.com/rebecca/Detachment/smallWatch.fbx";
var _isPoked = false;
var COOLDOWNDURATION = 200;
var cooldowntimer = 0;

var particles = Script.require("https://hifi-content.s3.amazonaws.com/liv/dev/funmodule.js");

var watchEntity = {
    type: "Model",
    name: "Watch",
    shapeType: "simple-hull",
    modelURL: watchURL,
    parentID: MyAvatar.sessionUUID,
    parentJointIndex: MyAvatar.getJointIndex("LeftForeArm"),
    position: MyAvatar.getJointPosition("LeftForeArm"),
    rotation: MyAvatar.getJointRotation("LeftForeArm"),
    script: "https://hifi-content.s3.amazonaws.com/rebecca/Detachment/detachAvatarEntity.js",
    "userData": "{\"grabbableKey\":{\"grabbable\":true}}"
};

var testPoke = function () {
    var x = MyAvatar.getJointPosition("LeftForeArm").x;
    var y = MyAvatar.getJointPosition("LeftForeArm").y;
    var z = MyAvatar.getJointPosition("LeftForeArm").z;

    var jointIndexRight = MyAvatar.getJointIndex("RightHandIndex4");
    var fingertipLocRight = MyAvatar.getJointPosition(jointIndexRight);

    if (isCloseEnough(x, fingertipLocRight.x) &&
            isCloseEnough(y, fingertipLocRight.y) &&
            isCloseEnough(z, fingertipLocRight.z) && !_isPoked) {
        print("You Poked Me with your Right Finger!");
        _isPoked = true;
        cooldowntimer = 0;
    }
    if (cooldowntimer >= COOLDOWNDURATION) {
        _isPoked = false;
    }
    if (_isPoked) {
        cooldowntimer++;
    }
};

var isCloseEnough = function (a, b) {
    return (Math.abs(a - b) <= 0.1); // within 10cm
};

var watchObject = Entities.addEntity(watchEntity);
Script.update.connect(function () {
    var properties = Entities.getEntityProperties(watchObject, true);
    testPoke();
});

Script.scriptEnding.connect(function () {
    Entities.deleteEntity(watchObject);
});