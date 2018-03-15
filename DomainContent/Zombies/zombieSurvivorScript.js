//
//  zombieSurvivorScript.js
//
//  Created by David Back on 2/8/18.
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

var CHANNEL_NAME = "ZOMBIE_BITE";
var DEAD_ZONE_RUST = "hifi://Rust/-31.67,4989.96,-13.19";
var MINIMUM_STRIDE_MOVEMENT = 0.015;
var MINIMUM_FORWARD_STRIDES = 20;
var MINIMUM_BACKWARD_STRIDES = 20;
var MAX_VELOCITY = 10;
var VELOCITY_INCREASE_FACTOR = 60;
var VELOCITY_DECREASE = 0.2;
var VELOCITY_DECREASE_RUNNING = 0.05;
var RUN_CONTROLS = [Controller.Standard.LeftGrip, Controller.Standard.RightGrip];
var RUN_CONTROLS_THRESHOLD = 0.9;
var ADDITIONAL_BODY_OFFSET = {x:-0.097595, y:-0.018677, z:-0.088746};
var BITE_ANIMATION = "atp:/biteReaction.fbx";
var BITE_ANIMATION_START_FRAME = 0;
var BITE_ANIMATION_BLOOD_KEYFRAME = 0;
var BITE_ANIMATION_END_FRAME = 138;
var BITE_ANIMATION_FPS = 60;
var BLOOD_HAZE = "atp:/BloodCircle_169.png";
var BLOOD_COLOR = { "blue": 7, "green": 7, "red": 138 };
var BLOOD_PARTICLE_TEXTURE = "atp:/rain.png";
var BLOOD_HEAD_DIFFERENCE_MULTIPLE = 0.8;
var BLOOD_Z_OFFSET = 0.15;
var MSEC_PER_SEC = 1000;
var BITES_REQUIRED = 3;
var BITES_SETTING_NAME = "ZombieBiteCount";
var HEALTH_VERTICAL_OFFSET_OVERHEAD = 1;
var HEALTH_VERTICAL_OFFSET_OVERLAY = -0.25;
var HEALTH_HORIZONTAL_OFFSET_OVERHEAD = 0.1;
var HEALTH_HORIZONTAL_OFFSET_OVERLAY = 0.1;
var HEALTH_OFFSET_WRIST = { x:0, y:0.03, z:0 };
var HEALTH_SIZE_OVERHEAD = 0.1;
var HEALTH_SIZE_WRIST = 0.04;
var BRAIN_FULL_URL = "atp:/brainFull.png";
var BRAIN_FULL_TEXTURE = "{\"tex.picture\":\"atp:/brainFull.png\"}";
var BRAIN_DEAD_URL = "atp:/brainDead.png";
var BRAIN_DEAD_TEXTURE = "{\"tex.picture\":\"atp:/brainDead.png\"}";
var DEBUG_BITE_KEY = "b";
var DEBUG_RESET_HEALTH_KEY = "h";
var DEBUG_RUN_KEY = "r";
var DEBUG_ENABLED = false;

var currentVelocity = 0;
var previousLeftDotProduct = 0;
var previousRightDotProduct = 0;
var bodyOffset;
var additionalBodyOffset;
var minLeftStride;
var maxLeftStride;
var minRightStride;
var maxRightStride;
var leftStrideForwardCount = 0;
var previousLeftStrideForwardCount = 0;
var leftStrideBackwardCount = 0;
var rightStrideForwardCount = 0;
var previousRightStrideForwardCount = 0;
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
                Window.location = DEAD_ZONE_RUST;
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

function update() {
    var runControlsHeld = true;
    for (var i = 0; i < RUN_CONTROLS.length; i++) {
        var controlValue = Controller.getValue(RUN_CONTROLS[i]);
        if (controlValue < RUN_CONTROLS_THRESHOLD) {
            runControlsHeld = false;
        }
    }    

    if (runControlsHeld && !biteAnimationPlaying) {
        if (Vec3.equal(bodyOffset, Vec3.ZERO)) {
            bodyOffset = Vec3.subtract(MyAvatar.getJointPosition("Body"), MyAvatar.position);
            additionalBodyOffset = Vec3.sum(bodyOffset, ADDITIONAL_BODY_OFFSET);
        }

        var leftHandPosition = Vec3.sum(MyAvatar.position, MyAvatar.getLeftHandPosition());
        var rightHandPosition = Vec3.sum(MyAvatar.position, MyAvatar.getRightHandPosition());
        var leftPlaneNormal = Vec3.cross(bodyOffset, additionalBodyOffset);
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

        if (minLeftStride === undefined || leftDotProduct < minLeftStride) {
            minLeftStride = leftDotProduct;
        }
        if (maxLeftStride === undefined || leftDotProduct > maxLeftStride) {
            maxLeftStride = leftDotProduct;
        }
        if (minRightStride === undefined || rightDotProduct < minRightStride) {
            minRightStride = rightDotProduct;
        }
        if (maxRightStride === undefined || rightDotProduct > maxRightStride) {
            maxRightStride = rightDotProduct;
        }

        if (minLeftStride !== undefined && maxLeftStride !== undefined && 
            maxLeftStride - minLeftStride > MINIMUM_STRIDE_MOVEMENT && 
            leftStrideForwardCount >= MINIMUM_FORWARD_STRIDES && leftStrideBackwardCount >= MINIMUM_BACKWARD_STRIDES) {
            var maxLeftStrideDifference = Math.abs(leftDotProduct - maxLeftStride);
            if (maxLeftStrideDifference > 0 && maxLeftStrideDifference < 0.01) {
                var strideLengthLeft = maxLeftStride - minLeftStride;
                var velocityIncreaseLeft = strideLengthLeft * VELOCITY_INCREASE_FACTOR;
                currentVelocity += velocityIncreaseLeft;
                if (currentVelocity > MAX_VELOCITY) {
                    currentVelocity = MAX_VELOCITY;
                }
                maxLeftStride = undefined;
                minLeftStride = undefined;
                leftStrideForwardCount = 0;
                leftStrideBackwardCount = 0;
            }
        } 
        
        if (minRightStride !== undefined && maxRightStride !== undefined && 
            maxRightStride - minRightStride > MINIMUM_STRIDE_MOVEMENT && 
            rightStrideForwardCount >= MINIMUM_FORWARD_STRIDES && rightStrideBackwardCount >= MINIMUM_BACKWARD_STRIDES) {
            var maxRightStrideDifference = Math.abs(rightDotProduct - maxRightStride);
            if (maxRightStrideDifference > 0 && maxRightStrideDifference < 0.01) {
                var strideLengthRight = maxRightStride - minRightStride;
                var velocityIncreaseRight = strideLengthRight * VELOCITY_INCREASE_FACTOR;
                currentVelocity += velocityIncreaseRight;
                if (currentVelocity > MAX_VELOCITY) {
                    currentVelocity = MAX_VELOCITY;
                }
                maxRightStride = undefined;
                minRightStride = undefined;
                rightStrideForwardCount = 0;
                rightStrideBackwardCount = 0;
            }
        }
    } else {
        maxLeftStride = undefined;
        minLeftStride = undefined;
        maxRightStride = undefined;
        minRightStride = undefined;
        leftStrideForwardCount = 0;
        leftStrideBackwardCount = 0;
        rightStrideForwardCount = 0;
        rightStrideBackwardCount = 0;
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

    var velocityForward = { x:0, y:0, z:1 }; 
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
        dimensions: {
            x: HEALTH_SIZE_OVERHEAD,
            y: HEALTH_SIZE_OVERHEAD,
            z: 0.00001
        },
        localPosition: localPositionOverhead,
        modelURL: "https://hifi-content.s3.amazonaws.com/DomainContent/production/default-image-model.fbx",
        name: "Zombie Brain",
        parentID: MyAvatar.sessionUUID,
        owningAvatarID: MyAvatar.sessionUUID,
        textures: deadHealth ? BRAIN_DEAD_TEXTURE : BRAIN_FULL_TEXTURE,
        type: "Model"
    });
    healthOverhead.push(brain);
    
    var overlayProperties = {
        alpha: 1,
        dimensions: {
            x: HEALTH_SIZE_WRIST,
            y: HEALTH_SIZE_WRIST,
            z: HEALTH_SIZE_WRIST
        },
        localPosition: localPositionWrist,
        localRotation: Quat.fromPitchYawRollDegrees(0, 90, 0),
        parentID: MyAvatar.sessionUUID,
        parentJointIndex: MyAvatar.getJointIndex("RightForeArm"),
        url: deadHealth ? BRAIN_DEAD_URL : BRAIN_FULL_URL,
        visible: true
    };
    healthWrist.push(Overlays.addOverlay("image3d", overlayProperties));
}

function loseHealth() {
    var brainOverhead = healthOverhead[currentHealthIndex];
    Entities.editEntity(brainOverhead, { textures: BRAIN_DEAD_TEXTURE });
    var brainWrist = healthWrist[currentHealthIndex];
    Overlays.editOverlay(brainWrist, { url: BRAIN_DEAD_URL });
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
    MyAvatar.motorReferenceFrame = "camera";

    Script.update.connect(update);

    Script.setTimeout(function () {
        initializeHealth();
    }, 2000);
}

init();
