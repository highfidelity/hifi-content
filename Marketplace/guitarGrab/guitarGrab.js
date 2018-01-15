//
// guitarGrab.js
// A script to add a guitar to ones back and grab it off in VR or add it back
//
// Author: Fluffy Jenkins
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// All assets are under CC Attribution Non-Commerical
// http://creativecommons.org/licenses/
//

var GUITAR_MONITOR_RELEASE = false;
var GUITAR_ATTACH_POSITION = {x: 0, y: 0.420, z: -0.3};
var GUITAR_ATTACH_ROTATION = {
    x: -0.1830127239227295,
    y: 0.6830126643180847,
    z: -0.6830126643180847,
    w: 0.18301266431808472
};
var GUITAR_ATTACH_JOINT = "Spine";
var GUITAR_URL = "http://s3.amazonaws.com/hifi-public/models/attachments/guitar.fst";
var GUITAR_DEPLOYED = false;
var GUITAR_DEPLOYED_UUID;

var GUITAR_SCALE = {x: 0.3337, y: 0.0770, z: 0.8180};
var GUITAR_HAND_OFFSET = {x: 0, y: 0.1, z: 0.025};
var GUITAR_HAND_L_ROTATION = {
    x: -0.5,
    y: 0.5,
    z: -0.5,
    w: 0.5
};
var GUITAR_HAND_R_ROTATION = {
    x: -0.5,
    y: -0.5,
    z: 0.5,
    w: 0.5
};
var GUITAR_LIFETIME = 360;

var MAX_GRAB = 0.99;
var MIN_GRAB = 0.01;

var HAPTIC_AMOUNT = 100;
var DETECTION_Y_LIMIT = 0.1;

Script.scriptEnding.connect(function () {
    shutdown();
});

controllerMappingName = 'guitarGrabMapping';
controllerMapping = Controller.newMapping(controllerMappingName);
controllerMapping.from(Controller.Standard.LT).to(function (value) {
    grabLogic(value, 0);
});
controllerMapping.from(Controller.Standard.RT).to(function (value) {
    grabLogic(value, 1);
});

init();

function grabLogic(value, grabHand) {
    if (value > MAX_GRAB && !GUITAR_DEPLOYED) {
        checkHandBehindBack(grabHand);
    } else if (value < MIN_GRAB) {
        if (GUITAR_MONITOR_RELEASE) {
            dropGuitar();
            GUITAR_MONITOR_RELEASE = false;
        }
        if (GUITAR_DEPLOYED) {
            checkHandBehindBack(grabHand);
        }
    }
}

function checkHandBehindBack(grabHand) {
    var jointName = "LeftHand";
    if (grabHand === 1) {
        jointName = "RightHand";
    }
    var currAvatarPos = Camera.position;
    var currHandPos = MyAvatar.getJointPosition(jointName);

    if (Vec3.multiplyQbyV(Quat.inverse(MyAvatar.orientation), Vec3.subtract(currAvatarPos, currHandPos)).z < 0 && Vec3.multiplyQbyV(Quat.inverse(MyAvatar.orientation), Vec3.subtract(currAvatarPos, currHandPos)).y < DETECTION_Y_LIMIT) {
        if (GUITAR_DEPLOYED) {
            var currGuitarPos = Entities.getEntityProperties(GUITAR_DEPLOYED_UUID, ["Position"]).position;

            if (Vec3.multiplyQbyV(Quat.inverse(MyAvatar.orientation), Vec3.subtract(currAvatarPos, currGuitarPos)).z < 0) {
                Controller.triggerHapticPulse(1, HAPTIC_AMOUNT, grabHand);
                Entities.deleteEntity(GUITAR_DEPLOYED_UUID);
                GUITAR_DEPLOYED_UUID = null;
                addGuitar();
            }
        } else {
            Controller.triggerHapticPulse(1, HAPTIC_AMOUNT, grabHand);
            removeGuitar(grabHand);
        }
    }
}

function addGuitar() {
    GUITAR_DEPLOYED = false;
    MyAvatar.attach(GUITAR_URL, GUITAR_ATTACH_JOINT, GUITAR_ATTACH_POSITION, GUITAR_ATTACH_ROTATION, 1, false);
}

function removeGuitar(grabHand) {
    var jointName = "LeftHand";
    if (grabHand === 1) {
        jointName = "RightHand";
    }
    var handJointIndex = MyAvatar.getJointIndex(jointName);
    var found = false;
    MyAvatar.attachmentData.forEach(function (attachment) {
        if (attachment.modelURL === GUITAR_URL && !found) {
            GUITAR_ATTACH_POSITION = attachment.translation;
            found = true;
        }
    });

    MyAvatar.detachOne(GUITAR_URL, GUITAR_ATTACH_JOINT);

    var TEMP_HAND_ROTATION = GUITAR_HAND_L_ROTATION;

    if (grabHand === 1) {
        TEMP_HAND_ROTATION = GUITAR_HAND_R_ROTATION;
    }

    var clientOnly = !(Entities.canRez() || Entities.canRezTmp());
    GUITAR_DEPLOYED_UUID = Entities.addEntity({
        name: "Guitar",
        shapeType: "simple-hull",
        type: "Model",
        modelURL: GUITAR_URL,
        collisionless: true,
        collidesWith: "static,dynamic,kinematic,",
        parentID: MyAvatar.sessionUUID,
        parentJointIndex: handJointIndex,
        localPosition: GUITAR_HAND_OFFSET,
        localRotation: TEMP_HAND_ROTATION,
        dimensions: GUITAR_SCALE,
        dynamic: false,
        lifetime: GUITAR_LIFETIME,
        userData: "{ \"grabbableKey\": { \"grabbable\": true, \"kinematic\": false } }"
    }, clientOnly);
    GUITAR_DEPLOYED = true;
    GUITAR_MONITOR_RELEASE = true;
}

function dropGuitar() {
    Entities.editEntity(GUITAR_DEPLOYED_UUID, {parentID: "", parentJointIndex: "", dynamic: true, collisionless: false})
}

function clearAllGuitars() {
    MyAvatar.detachOne(GUITAR_URL, GUITAR_ATTACH_JOINT);
    if (GUITAR_DEPLOYED_UUID != null) {
        Entities.deleteEntity(GUITAR_DEPLOYED_UUID);
    }
}

function init() {
    addGuitar();
    Controller.enableMapping(controllerMappingName);
}

function shutdown() {
    try {
        clearAllGuitars();
        Controller.disableMapping(controllerMappingName);
    } catch (e) {
        // empty
    }
}
