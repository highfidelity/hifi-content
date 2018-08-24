//
//  zombieSurvivorScript.js
//
//  Created by David Back on 2/8/18.
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

var CHANNEL_NAME = "ZOMBIE_BITE";
//var DEAD_ZONE_RUST = "hifi://Rust/-31.67,4989.96,-13.19";
var DEAD_ZONE_EMPTY = "hifi://AvatarIslandDemo/7.25304,-332.286,7.87865";
var MINIMUM_STRIDE_MOVEMENT = 0.1;
var MINIMUM_FORWARD_STRIDES = 20;
var MINIMUM_BACKWARD_STRIDES = 20;
var STRIDE_MAX_DIFFERENCE = 0.1;
var STRIDE_EXTREME_LISTS = 5;
var MAX_STRIDE_COUNT = 80;
var MAX_VELOCITY = 10;
var VELOCITY_INCREASE_FACTOR = 10;
var VELOCITY_DECREASE = 0.2;
var VELOCITY_DECREASE_RUNNING = 0.05;
var RUN_CONTROLS = [Controller.Standard.LeftGrip, Controller.Standard.RightGrip];
var RUN_CONTROLS_THRESHOLD = 0.9;
var BITE_ANIMATION = "atp:/biteReaction.fbx";
var BITE_ANIMATION_START_FRAME = 0;
var BITE_ANIMATION_BLOOD_KEYFRAME = 0;
var BITE_ANIMATION_END_FRAME = 138;
var BITE_ANIMATION_FPS = 60;
var BLOOD_HAZE = "atp:/BloodCircle_169.png";
var BLOOD_COLOR = { "blue": 7, "green": 7, "red": 138 };
var BLOOD_PARTICLE_TEXTURE = "atp:/bloodDrip.png";
var BLOOD_HEAD_DIFFERENCE_MULTIPLE = 0.8;
var BLOOD_Z_OFFSET = 0.15;
var MSEC_PER_SEC = 1000;
var BITES_REQUIRED = 3;
var BITES_SETTING_NAME = "ZombieBiteCount";
var HEALTH_VERTICAL_OFFSET_OVERHEAD = 1;
var HEALTH_VERTICAL_OFFSET_OVERLAY = -0.25;
var HEALTH_HORIZONTAL_OFFSET_OVERHEAD = 0.125;
var HEALTH_HORIZONTAL_OFFSET_OVERLAY = 0.1;
var HEALTH_OFFSET_WRIST = { x:0, y:0.035, z:0 };
var HEALTH_SIZE_OVERHEAD_MULTIPLIER = 0.25;
var HEALTH_SIZE_WRIST_MULTIPLIER = 0.1;
var BRAIN_FULL_MODEL = "atp:/brainFull.fbx";
var BRAIN_DEAD_MODEL = "atp:/brainDead.fbx";
var BRAIN_MODEL_DIMENSIONS = { x:0.4732, y:0.2819, z:0.0092 };
var DEBUG_BITE_KEY = "b";
var DEBUG_RESET_HEALTH_KEY = "h";
var DEBUG_RUN_KEY = "r";
var DEBUG_ENABLED = false;

var currentVelocity = 0;
var previousLeftDotProduct = 0;
var previousRightDotProduct = 0;
var avatarUp = Vec3.ZERO;
var avatarRight = Vec3.ZERO;
var minLeftStrides;
var maxLeftStrides;
var minRightStrides;
var maxRightStrides;
var leftStrideForwardCount = 0;
var leftStrideBackwardCount = 0;
var rightStrideForwardCount = 0;
var rightStrideBackwardCount = 0;
var biteAnimationPlaying = false;
var bloodHaze;
var healthOverhead = [];
var healthWrist = [];
var localPositionOverhead;
var localPositionOverlay;
var localPositionWrist;
var currentHealthIndex = 0;
var debugForceRun = false;

function onMessageReceived(channel, message, senderID) {
    var messageData = JSON.parse(message);
    var type = messageData['type'];
    var biterID = messageData['biterID'];
    var victimID = messageData['victimID'];
    if (type === "receiveBite" && victimID === MyAvatar.sessionUUID) {
        if (DEBUG_ENABLED) {
            print("receiveBite message received from biter " + biterID);
        }
        biteReceived();
    }
}

function keyPressEvent(event) {
    if (!DEBUG_ENABLED) {
        return;
    }
    if (DEBUG_BITE_KEY === event.text) {
        print("biteReceived called from debug key press");
        biteReceived();
    }
    if (DEBUG_RESET_HEALTH_KEY === event.text) {
        resetHealth();
    }
    if (DEBUG_RUN_KEY === event.text) {
        debugForceRun = !debugForceRun;
    }
}

function biteReceived() {
    var oldBites = Settings.getValue(BITES_SETTING_NAME, 0);
    var newBites = oldBites;
    newBites++;
    Settings.setValue(BITES_SETTING_NAME, newBites);
    if (DEBUG_ENABLED) {
        print("biteReceived - " + BITES_SETTING_NAME + " setting changed from " + oldBites + " to " + newBites);
    }

    var frameCount = BITE_ANIMATION_END_FRAME - BITE_ANIMATION_START_FRAME;
    MyAvatar.overrideAnimation(BITE_ANIMATION, BITE_ANIMATION_FPS, false, 
                               BITE_ANIMATION_START_FRAME, BITE_ANIMATION_END_FRAME);
    biteAnimationPlaying = true;

    var timeOut = MSEC_PER_SEC * frameCount / BITE_ANIMATION_FPS;
    Script.setTimeout(function () {
        biteAnimationPlaying = false;
        MyAvatar.restoreAnimation();
        Overlays.deleteOverlay(bloodHaze);
        if (newBites >= BITES_REQUIRED) {
            if (!DEBUG_ENABLED) {
                //Window.location = DEAD_ZONE_RUST;
                Window.location = DEAD_ZONE_EMPTY;
            } else {
                print("DEAD - " + BITES_SETTING_NAME + " reset back to 0");
            }
            resetHealth();
        }
    }, timeOut);

    var bloodTimeOut = MSEC_PER_SEC * BITE_ANIMATION_BLOOD_KEYFRAME / BITE_ANIMATION_FPS;
    Script.setTimeout(function () {
        bloodHaze = Overlays.addOverlay("image3d", {
            alpha: 1,
            drawInFront: true,
            emissive: true,
            localPosition: {x: 0, y: 0, z: -0.7 * MyAvatar.sensorToWorldScale},
            localRotation: {x: 0, y: 0, z: 0, w: 1},
            parentID: MyAvatar.sessionUUID,
            parentJointIndex: -7,
            scale: 3 * MyAvatar.sensorToWorldScale,
            url: BLOOD_HAZE,
            width: 1920,
            height: 2160        
        });
        
        var headPosition = MyAvatar.getJointPosition("Head");
        var headDifference = Vec3.length(Vec3.subtract(headPosition, MyAvatar.position));
        var bloodLocalPosition = { x:0, y:headDifference * BLOOD_HEAD_DIFFERENCE_MULTIPLE, z:BLOOD_Z_OFFSET };
        var bloodPosition = Vec3.sum(MyAvatar.position, bloodLocalPosition);
        var bloodEffect = {
            alpha: 1,
            alphaFinish: 0,
            alphaSpread: 1,
            alphaStart: 1,
            clientOnly: 1,
            color: BLOOD_COLOR,
            colorFinish: BLOOD_COLOR,
            colorSpread: BLOOD_COLOR,
            colorStart: BLOOD_COLOR,
            dimensions: {
                x: 0.5,
                y: 0.5,
                z: 0.5
            },
            emitAcceleration: {
                x: 0,
                y: -2,
                z: 0
            },
            emitDimensions: {
                x: 1,
                y: 0.2,
                z: 1
            },
            emitRate: 7.5,
            emitterShouldTrail: true,
            emitSpeed: 0.15,
            lifespan: 1.5,
            lifetime: 1.5,
            locked: true,
            particleRadius: 0.2,
            polarFinish: 0.6981316804885864,
            position: bloodPosition,
            radiusFinish: 0.2,
            radiusStart: 0,
            speedSpread: 0.3,
            textures: BLOOD_PARTICLE_TEXTURE,
            type: "ParticleEffect"
        };
        Entities.addEntity(bloodEffect);
    }, bloodTimeOut);

    loseHealth();
}

function getStride(stridesArray) {
    var strideTotal = 0;
    for (var i = 0; i < stridesArray.length; i++) {
        strideTotal += stridesArray[i];
    }
    return strideTotal / stridesArray.length;
}

function resetLeftStride() {
    maxLeftStrides = [];
    minLeftStrides = [];
    leftStrideForwardCount = 0;
    leftStrideBackwardCount = 0;
}

function resetRightStride() {
    maxRightStrides = [];
    minRightStrides = [];
    rightStrideForwardCount = 0;
    rightStrideBackwardCount = 0;
}

function update() {
    var runControlsHeld = true;
    for (var i = 0; i < RUN_CONTROLS.length; i++) {
        var controlValue = Controller.getValue(RUN_CONTROLS[i]);
        if (controlValue < RUN_CONTROLS_THRESHOLD) {
            runControlsHeld = false;
        }
    }    

    if (runControlsHeld && !biteAnimationPlaying) {
        if (Vec3.equal(avatarUp, Vec3.ZERO)) {
            avatarUp = Quat.getUp(MyAvatar.orientation);
            avatarRight = Quat.getRight(MyAvatar.orientation);
        }

        var leftHandPosition = Vec3.sum(MyAvatar.position, MyAvatar.getLeftHandPosition());
        var rightHandPosition = Vec3.sum(MyAvatar.position, MyAvatar.getRightHandPosition());
        var leftPlaneNormal = Vec3.cross(avatarUp, avatarRight);
        var rightPlaneNormal = leftPlaneNormal;
        var toLeftHand = Vec3.subtract(leftHandPosition, MyAvatar.position);
        var leftDotProduct = Vec3.dot(leftPlaneNormal, toLeftHand);
        var toRightHand = Vec3.subtract(rightHandPosition, MyAvatar.position);
        var rightDotProduct = Vec3.dot(rightPlaneNormal, toRightHand);

        var leftHandDifference = leftDotProduct - previousLeftDotProduct;
        var leftHandDirection = leftHandDifference > 0 ? 1 : -1;
        if (leftHandDirection === 1) {
            leftStrideForwardCount++;
        } else {
            leftStrideBackwardCount++;
        }
        var rightHandDifference = rightDotProduct - previousRightDotProduct;
        var rightHandDirection = rightHandDifference > 0 ? 1 : -1;
        if (rightHandDirection === 1) {
            rightStrideForwardCount++;
        } else {
            rightStrideBackwardCount++;
        }

        var idx = 0;
        if (minLeftStrides.length < STRIDE_EXTREME_LISTS) {
            minLeftStrides.push(leftDotProduct);
            minLeftStrides.sort(function(a, b) {
                return a - b;
            });
        } else if (leftDotProduct < minLeftStrides[minLeftStrides.length - 1]) {
            for (idx = 0; idx < minLeftStrides.length; idx++) {
                if (leftDotProduct < minLeftStrides[idx]) {
                    minLeftStrides.splice(idx, 0, leftDotProduct);
                    minLeftStrides.pop();
                    break;
                }
            }
        }
        if (maxLeftStrides.length < STRIDE_EXTREME_LISTS) {
            maxLeftStrides.push(leftDotProduct);
            maxLeftStrides.sort(function(a, b) { 
                return b - a;
            });
        } else if (leftDotProduct > maxLeftStrides[maxLeftStrides.length - 1]) {
            for (idx = 0; idx < maxLeftStrides.length; idx++) {
                if (leftDotProduct > maxLeftStrides[idx]) {
                    maxLeftStrides.splice(idx, 0, leftDotProduct);
                    maxLeftStrides.pop();
                    break;
                }
            }
        }
        if (minRightStrides.length < STRIDE_EXTREME_LISTS) {
            minRightStrides.push(rightDotProduct);
            minRightStrides.sort(function(a, b) {
                return a - b;
            });
        } else if (rightDotProduct < minRightStrides[minRightStrides.length - 1]) {
            for (idx = 0; idx < minRightStrides.length; idx++) {
                if (rightDotProduct < minRightStrides[idx]) {
                    minRightStrides.splice(idx, 0, rightDotProduct);
                    minRightStrides.pop();
                    break;
                }
            }
        }
        if (maxRightStrides.length < STRIDE_EXTREME_LISTS) {
            maxRightStrides.push(rightDotProduct);
            maxRightStrides.sort(function(a, b) {
                return b - a;
            });
        } else if (rightDotProduct > maxRightStrides[maxRightStrides.length - 1]) {
            for (idx = 0; idx < maxRightStrides.length; idx++) {
                if (rightDotProduct > maxRightStrides[idx]) {
                    maxRightStrides.splice(idx, 0, rightDotProduct);
                    maxRightStrides.pop();
                    break;
                }
            }
        }

        var maxLeftStride = getStride(maxLeftStrides);
        var minLeftStride = getStride(minLeftStrides);
        var maxLeftStrideDifference = Math.abs(leftDotProduct - maxLeftStride);
        var maxRightStride = getStride(maxRightStrides);
        var minRightStride = getStride(minRightStrides);
        var maxRightStrideDifference = Math.abs(rightDotProduct - maxRightStride);

        if (minLeftStrides.length === STRIDE_EXTREME_LISTS && maxLeftStrides.length === STRIDE_EXTREME_LISTS && 
            maxLeftStride - minLeftStride > MINIMUM_STRIDE_MOVEMENT && maxLeftStrideDifference < STRIDE_MAX_DIFFERENCE &&
            leftStrideForwardCount >= MINIMUM_FORWARD_STRIDES && leftStrideBackwardCount >= MINIMUM_BACKWARD_STRIDES) {
            var strideLengthLeft = maxLeftStride - minLeftStride;
            var velocityIncreaseLeft = strideLengthLeft * VELOCITY_INCREASE_FACTOR;
            currentVelocity += velocityIncreaseLeft;
            if (currentVelocity > MAX_VELOCITY) {
                currentVelocity = MAX_VELOCITY;
            }
            resetLeftStride();
            if (DEBUG_ENABLED) {
                print("********** LEFT STRIDE SUCCESS ********** stride length = " + strideLengthLeft);
            }
        } 
        
        if (minRightStrides.length === STRIDE_EXTREME_LISTS && maxRightStrides.length === STRIDE_EXTREME_LISTS && 
            maxRightStride - minRightStride > MINIMUM_STRIDE_MOVEMENT && maxRightStrideDifference < STRIDE_MAX_DIFFERENCE &&
            rightStrideForwardCount >= MINIMUM_FORWARD_STRIDES && rightStrideBackwardCount >= MINIMUM_BACKWARD_STRIDES) {
            var strideLengthRight = maxRightStride - minRightStride;
            var velocityIncreaseRight = strideLengthRight * VELOCITY_INCREASE_FACTOR;
            currentVelocity += velocityIncreaseRight;
            if (currentVelocity > MAX_VELOCITY) {
                currentVelocity = MAX_VELOCITY;
            }
            resetRightStride();
            if (DEBUG_ENABLED) {
                print("********** RIGHT STRIDE SUCCESS ********** stride length = " + strideLengthRight);
            }
        }

        // fail-safes in case stride detection gets into a weird state then reset our values and start over
        if (leftStrideForwardCount > MAX_STRIDE_COUNT || leftStrideBackwardCount > MAX_STRIDE_COUNT) {
            if (DEBUG_ENABLED) {
                print("Max left stride counts reached - triggering left stride reset");
            }
            resetLeftStride();
        }
        if (rightStrideForwardCount > MAX_STRIDE_COUNT || rightStrideBackwardCount > MAX_STRIDE_COUNT) {
            if (DEBUG_ENABLED) {
                print("Max right stride counts reached - triggering right stride reset");
            }
            resetRightStride();
        }

        /*
        print("minLeftStrides: ");
        for (idx = 0; idx < minLeftStrides.length; idx++) {
            print(minLeftStrides[idx]);
        }
        print("maxLeftStrides: ");
        for (idx = 0; idx < maxLeftStrides.length; idx++) {
            print(maxLeftStrides[idx]);
        }
        print("minRightStrides: ");
        for (idx = 0; idx < minRightStrides.length; idx++) {
            print(minRightStrides[idx]);
        }
        print("maxRightStrides: ");
        for (idx = 0; idx < maxRightStrides.length; idx++) {
            print(maxRightStrides[idx]);
        }
        */

        print("minL " + minLeftStride + "  maxL " + maxLeftStride + "  minR " + minRightStride + "  maxR " + maxRightStride + "  leftDot " + leftDotProduct + "  rightDot " + rightDotProduct + "  leftForw " + leftStrideForwardCount + "  leftBack " + leftStrideBackwardCount + "  rightForw " + rightStrideForwardCount + "  rightBack " + rightStrideBackwardCount);
    } else {
        resetLeftStride();
        resetRightStride();        
    }

    if (debugForceRun && !biteAnimationPlaying) {
        currentVelocity = MAX_VELOCITY;
    }

    var velocityDecrease = runControlsHeld ? VELOCITY_DECREASE_RUNNING : VELOCITY_DECREASE;
    if (currentVelocity > 0) {
        currentVelocity -= velocityDecrease;
    }
    if (currentVelocity < 0) {
        currentVelocity = 0;
    }

    var cameraOrientation = Camera.getOrientation();
    var velocityForward = Quat.getForward(cameraOrientation);
    velocityForward.y = 0;
    var newVelocity = currentVelocity;
    if (newVelocity < 0) {
        newVelocity = 0;
    }
    var newVelocityVector = Vec3.multiply(velocityForward, newVelocity);
    if (Vec3.length(newVelocityVector) > MAX_VELOCITY) {
        newVelocityVector = Vec3.normalize(newVelocityVector);
        newVelocityVector = Vec3.multiply(newVelocityVector, MAX_VELOCITY);
    }

    MyAvatar.motorVelocity = newVelocityVector;

    previousLeftDotProduct = leftDotProduct;
    previousRightDotProduct = rightDotProduct;
}

function addHealth(deadHealth) {
    var brain = Entities.addEntity({
        clientOnly: 1,
        dimensions: Vec3.multiply(BRAIN_MODEL_DIMENSIONS, HEALTH_SIZE_OVERHEAD_MULTIPLIER),
        localPosition: localPositionOverhead,
        modelURL: deadHealth ? BRAIN_DEAD_MODEL : BRAIN_FULL_MODEL,
        name: "Zombie Brain",
        parentID: MyAvatar.sessionUUID,
        owningAvatarID: MyAvatar.sessionUUID,
        type: "Model",
        userData: JSON.stringify({
            grabbableKey: {
                grabbable: false
            }
        })
    });
    healthOverhead.push(brain);
    
    var overlayProperties = {
        alpha: 1,
        dimensions: Vec3.multiply(BRAIN_MODEL_DIMENSIONS, HEALTH_SIZE_WRIST_MULTIPLIER),
        localPosition: localPositionWrist,
        localRotation: Quat.fromPitchYawRollDegrees(0, 90, 0),
        parentID: MyAvatar.sessionUUID,
        parentJointIndex: MyAvatar.getJointIndex("RightForeArm"),
        url: deadHealth ? BRAIN_DEAD_MODEL : BRAIN_FULL_MODEL,
        visible: true
    };
    healthWrist.push(Overlays.addOverlay("model", overlayProperties));
}

function loseHealth() {
    var brainOverhead = healthOverhead[currentHealthIndex];
    Entities.editEntity(brainOverhead, { modelURL: BRAIN_DEAD_MODEL });
    var brainWrist = healthWrist[currentHealthIndex];
    Overlays.editOverlay(brainWrist, { url: BRAIN_DEAD_MODEL });
    currentHealthIndex++;
}

function initializeHealth() {
    // fail-safe to make sure all brain avatar entities get deleted
    Entities.findEntitiesByType('Model', MyAvatar.position, 2).forEach(function(entityID) {
        var properties = Entities.getEntityProperties(entityID, ['name', 'parentID']);
        if (properties.name === "Zombie Brain" && properties.parentID === MyAvatar.sessionUUID){
            Entities.deleteEntity(entityID);
        }
    });

    var currentBites = Settings.getValue(BITES_SETTING_NAME, 0);
    for (var i = 0; i < BITES_REQUIRED; i++) {
        if (i === 0) {
            localPositionOverhead = {x:-HEALTH_HORIZONTAL_OFFSET_OVERHEAD, y:HEALTH_VERTICAL_OFFSET_OVERHEAD, z:0};
            localPositionWrist = {x:0.06, y:0.15, z:0};
        } else {
            localPositionOverhead.x += HEALTH_HORIZONTAL_OFFSET_OVERHEAD;
            localPositionWrist = Vec3.sum(localPositionWrist, HEALTH_OFFSET_WRIST);
        }
        var deadHealth = i < currentBites;
        addHealth(deadHealth);
    }
    currentHealthIndex = currentBites > 0 ? currentBites : 0;
}

function removeHealth() {
    for (var i = 0; i < BITES_REQUIRED; i++) {
        if (healthOverhead[i]) {
            Entities.deleteEntity(healthOverhead[i]);
        }
        if (healthWrist[i]) {
            Overlays.deleteOverlay(healthWrist[i]);
        }
    }
    healthOverhead = [];
    healthWrist = [];
}

function resetHealth() {
    Settings.setValue(BITES_SETTING_NAME, 0);
    removeHealth();
    initializeHealth();
}

function shutdown() {
    Messages.unsubscribe(CHANNEL_NAME);
    Messages.messageReceived.disconnect(onMessageReceived);
    Controller.keyPressEvent.disconnect(keyPressEvent);
    
    MyAvatar.motorVelocity = { x:0, y:0, z:0 };
    MyAvatar.motorMode = "simple";

    removeHealth();
}

function init() {
    Script.scriptEnding.connect(shutdown);
    Messages.subscribe(CHANNEL_NAME);
    Messages.messageReceived.connect(onMessageReceived);
    Controller.keyPressEvent.connect(keyPressEvent);
    
    MyAvatar.motorMode = "dynamic";
    MyAvatar.motorReferenceFrame = "world";

    Script.update.connect(update);

    Script.setTimeout(function () {
        initializeHealth();
    }, 2000);
}

init();
