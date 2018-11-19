//
//  christmasGun.js
//
//  created by Rebecca Stankus on 11/07/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* global Pointers, Graphics */
function exponentialSmoothing(target, current) {
    var smoothingConstant = 0.75;
    return target * (1 - smoothingConstant) + current * smoothingConstant;
}

(function() { 
    var _this;

    var TRIGGER_CONTROLS = [Controller.Standard.LT, Controller.Standard.RT];
    var TRIGGER_THRESHOLD = 0.97;
    var AUDIO_VOLUME_LEVEL = 0.1;
    var BARREL_LOCAL_OFFSET = {x: 0, y: 0, z: 0};
    var BARREL_LOCAL_DIRECTION = {x: 1000, y: 0, z: 0};
    var DESKTOP_HOW_TO_IMAGE_URL = Script.resolvePath("assets/textures/desktopFireUnequip.png");
    var DESKTOP_HOW_TO_IMAGE_WIDTH = 384;
    var DESKTOP_HOW_TO_IMAGE_HEIGHT = 128;
    var FIRE_KEY = "f";
    var HAND = {LEFT: 0, RIGHT: 1};
    var DESKTOP_HOW_TO_OVERLAY = true;
    var CAN_FIRE_AGAIN_TIMEOUT_MS = 250;
    var Y_OFFSET_FOR_WINDOW = 24;
    var VELOCITY_FACTOR = 5;
    var LIFETIME = 900;

    var currentHand = null;
    var canShoot = true;
    var injector;
    var canFire = true;
    var mouseEquipAnimationHandler;
    var desktopHowToOverlay = null;
    var previousHMDActive;
    var previousLeftYPosition = 0;
    var previousLeftXRotation = 0;
    var previousLeftZRotation = 0;
    var previousRightYPosition = 0;
    var previousRightXRotation = 0;
    var previousRightZRotation = 0;
    var offsetMultiplier = 0.8;
    var treeProperties = {
        description: "CC_BY Alan Zimmerman",
        dimensions: {
            x: 0.06,
            y: 0.1,
            z: 0.06
        },
        restitution: 0.1,
        angularDamping: 1,
        modelURL: Script.resolvePath("assets/models/tree-spruce-low-poly.fbx"),
        name: "Christmas App Tree",
        gravity: {
            x: 0,
            y: -0.5,
            z: 0
        },
        lifetime: LIFETIME,
        dynamic: true,
        type: "Model",
        serverScripts: Script.resolvePath("christmasItemGrow.js?100"),
        shapeType: "simple-compound",
        userData: "{\"grabbableKey\":{\"grabbable\":false}}"
    };
    var starProperties = {
        description: "CC_BY Poly By Google",
        dimensions: {
            x: 0.025,
            y: 0.1,
            z: 0.1
        },
        lifetime: LIFETIME,
        restitution: 0,
        linearDamping: 0,
        angularDamping: 1,
        dynamic: true,
        modelURL: Script.resolvePath("assets/models/star.fbx"),
        name: "Christmas App Star",
        rotation: {
            w: 0.23338675498962402,
            x: 0.5388723611831665,
            y: 0.36150145530700684,
            z: -0.7241779565811157
        },
        type: "Model",
        script: Script.resolvePath("christmasItem.js"),
        serverScripts: Script.resolvePath("christmasStarSpawnLights.js?103"),
        shapeType: "simple-compound",
        userData: "{\"grabbableKey\":{\"grabbable\":true}}"
    };
    var silverOrnamentProperties = {
        description: "CC_BY Alan Zimmerman",
        dimensions: {
            x: 0.10102071613073349,
            y: 0.1010207012295723,
            z: 0.1010206937789917
        },
        lifetime: LIFETIME,
        restitution: 0.1,
        angularDamping: 1,
        dynamic: true,
        modelURL: Script.resolvePath("assets/models/mirror-ball.fbx"),
        name: "Christmas App Ornament",
        script: Script.resolvePath("christmasItem.js"),
        shapeType: "simple-compound",
        type: "Model",
        userData: "{\"grabbableKey\":{\"grabbable\":true}}"
    };
    var redOrnamentProperties = {
        description: "CC_BY Alan Zimmerman",
        dimensions: {
            x: 0.09,
            y: 0.1,
            z: 0.09
        },
        lifetime: LIFETIME,
        restitution: 0.1,
        angularDamping: 1,
        dynamic: true,
        modelURL: Script.resolvePath("assets/models/ornament-red.fbx"),
        name: "Christmas App Ornament",
        script: Script.resolvePath("christmasItem.js"),
        shapeType: "simple-compound",
        type: "Model",
        userData: "{\"grabbableKey\":{\"grabbable\":true}}"
    };
    var greenOrnamentProperties = {
        description: "CC_BY Alan Zimmerman",
        dimensions: {
            x: 0.09,
            y: 0.1,
            z: 0.09
        },
        lifetime: LIFETIME,
        restitution: 0.1,
        angularDamping: 1,
        dynamic: true,
        modelURL: Script.resolvePath("assets/models/ornament-green.fbx"),
        name: "Christmas App Ornament",
        script: Script.resolvePath("christmasItem.js"),
        shapeType: "simple-compound",
        type: "Model",
        userData: "{\"grabbableKey\":{\"grabbable\":true}}"
    };
    var goldOrnamentProperties = {
        description: "CC_BY Alan Zimmerman",
        dimensions: {
            x: 0.09,
            y: 0.1,
            z: 0.09
        },
        lifetime: LIFETIME,
        restitution: 0.1,
        angularDamping: 1,
        dynamic: true,
        modelURL: Script.resolvePath("assets/models/ornament-gold.fbx"),
        name: "Christmas App Ornament",
        script: Script.resolvePath("christmasItem.js"),
        shapeType: "simple-compound",
        type: "Model",
        userData: "{\"grabbableKey\":{\"grabbable\":true}}"
    };
    var blueLightProperties = {
        description: "CC_BY Alan Zimmerman",
        dimensions: {
            x: 0.1,
            y: 0.1,
            z: 0.1
        },
        lifetime: LIFETIME,
        restitution: 0,
        linearDamping: 0,
        dynamic: true,
        modelURL: Script.resolvePath("assets/models/Glow-ball-blue.fbx"),
        name: "Christmas App Red Light",
        script: Script.resolvePath("christmasItem.js"),
        shapeType: "simple-compound",
        type: "Model",
        userData: "{\"grabbableKey\":{\"grabbable\":false}}"
    };
    var redLightProperties = {
        description: "CC_BY Alan Zimmerman",
        dimensions: {
            x: 0.1,
            y: 0.1,
            z: 0.1
        },
        lifetime: LIFETIME,
        textures: JSON.stringify({
            Texture: "http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/ChristmasGun/assets/images/ember-red.png"
        }),
        restitution: 0,
        linearDamping: 0,
        dynamic: true,
        modelURL: Script.resolvePath("assets/models/Glow-ball-blue.fbx"),
        name: "Christmas App Red Light",
        script: Script.resolvePath("christmasItem.js"),
        shapeType: "simple-compound",
        type: "Model",
        userData: "{\"grabbableKey\":{\"grabbable\":false}}"
    };
    var greenLightProperties = {
        description: "CC_BY Alan Zimmerman",
        dimensions: {
            x: 0.1,
            y: 0.1,
            z: 0.1
        },
        lifetime: LIFETIME,
        textures: JSON.stringify({
            Texture: "http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/ChristmasGun/assets/images/ember-green.png"
        }),
        restitution: 0,
        linearDamping: 0,
        dynamic: true,
        modelURL: Script.resolvePath("assets/models/Glow-ball-blue.fbx"),
        name: "Christmas App Red Light",
        script: Script.resolvePath("christmasItem.js"),
        shapeType: "simple-compound",
        type: "Model",
        userData: "{\"grabbableKey\":{\"grabbable\":false}}"
    };
    var yellowLightProperties = {
        description: "CC_BY Alan Zimmerman",
        dimensions: {
            x: 0.1,
            y: 0.1,
            z: 0.1
        },
        lifetime: LIFETIME,
        textures: JSON.stringify({
            Texture: "http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/ChristmasGun/assets/images/ember-yellow.png"
        }),
        restitution: 0,
        linearDamping: 0,
        dynamic: true,
        modelURL: Script.resolvePath("assets/models/Glow-ball-blue.fbx"),
        name: "Christmas App Red Light",
        script: Script.resolvePath("christmasItem.js"),
        shapeType: "simple-compound",
        type: "Model",
        userData: "{\"grabbableKey\":{\"grabbable\":false}}"
    };
    var whiteLightProperties = {
        description: "CC_BY Alan Zimmerman",
        dimensions: {
            x: 0.1,
            y: 0.1,
            z: 0.1
        },
        lifetime: LIFETIME,
        textures: JSON.stringify({
            Texture: "http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/ChristmasGun/assets/images/ember-white.png"
        }),
        restitution: 0,
        linearDamping: 0,
        dynamic: true,
        modelURL: Script.resolvePath("assets/models/Glow-ball-blue.fbx"),
        name: "Christmas App Red Light",
        script: Script.resolvePath("christmasItem.js"),
        shapeType: "simple-compound",
        type: "Model",
        userData: "{\"grabbableKey\":{\"grabbable\":false}}"
    };
    redLightProperties.texture = Script.resolvePath("assets/images/particle-ember-red.png");
    greenLightProperties.texture = Script.resolvePath("assets/images/particle-ember-green.png");
    yellowLightProperties.texture = Script.resolvePath("assets/images/particle-ember-yellow.png");
    whiteLightProperties.texture = Script.resolvePath("assets/images/particle-ember-white.png");
    var candyCaneProperties = {
        description: "CC_BY Poly By Google",
        dimensions: {
            x: 0.0365,
            y: 0.085,
            z: 0.008
        },
        restitution: 0,
        angularDamping: 1,
        linearDamping: 0,
        dynamic: true,
        modelURL: Script.resolvePath("assets/models/candyCane/275_Candy%20Cane.obj"),
        name: "Christmas App Candy Cane",
        script: Script.resolvePath("candyCane.js"),
        serverScripts: Script.resolvePath("christmasItemGrow.js?100"),
        shapeType: "simple-compound",
        type: "Model",
        userData: "{\"grabbableKey\":{\"grabbable\":true}}"
    };
    var giftProperties = {
        description: "CC_BY Aaron Clifford",
        dimensions: {
            x: 0.061,
            y: 0.1,
            z: 0.061
        },
        restitution: 0,
        angularDamping: 1,
        linearDamping: 0,
        dynamic: true,
        modelURL: Script.resolvePath("assets/models/gift.fbx"),
        name: "Christmas App Gift",
        script: Script.resolvePath("christmasItem.js"),
        serverScripts: Script.resolvePath("christmasItemGrow.js?100"),
        shapeType: "simple-compound",
        type: "Model",
        userData: "{\"grabbableKey\":{\"grabbable\":false}}"
    };
    var giftsProperties = {
        description: "CC-BY Jarlan Perez",
        dimensions: {
            x: 0.1,
            y: 0.05,
            z: 0.08
        },
        restitution: 0,
        angularDamping: 1,
        linearDamping: 0,
        dynamic: true,
        modelURL: Script.resolvePath("assets/models/gifts.obj"),
        name: "Christmas App Gifts",
        script: Script.resolvePath("christmasItem.js"),
        serverScripts: Script.resolvePath("christmasItemGrow.js?100"),
        shapeType: "simple-compound",
        type: "Model",
        userData: "{\"grabbableKey\":{\"grabbable\":false}}"
    };
    var snowmanProperties = {
        description: "CC_BY Alex ?SAFFY? Safa",
        dimensions: {
            x: 0.05,
            y: 0.1,
            z: 0.07
        },
        restitution: 0,
        angularDamping: 1,
        linearDamping: 0,
        dynamic: true,
        modelURL: Script.resolvePath("assets/models/snowMan.fbx"),
        name: "Christmas App Snowman",
        script: Script.resolvePath("christmasItem.js"),
        serverScripts: Script.resolvePath("christmasItemGrow.js?100"),
        shapeType: "simple-compound",
        type: "Model",
        userData: "{\"grabbableKey\":{\"grabbable\":false}}"
    };
    var currentSpawnItem = treeProperties;
    
    function Gun() {
        _this = this;
    }

    Gun.prototype = {
        remotelyCallable: ['setSpawn'],
        particleEffect: null,
        particleInterval: null,
        colorSpray: null,
        preload: function(entityID) {
            _this.entityID = entityID;
            previousHMDActive = HMD.active;
        },

        setSpawn: function(thisID, params) {
            var item = params[0];
            switch (item) { 
                case "redLight":
                    currentSpawnItem = redLightProperties;
                    break;
                case "blueLight":
                    currentSpawnItem = blueLightProperties;
                    break;
                case "yellowLight":
                    currentSpawnItem = yellowLightProperties;
                    break;
                case "greenLight":
                    currentSpawnItem = greenLightProperties;
                    break;
                case "whiteLight":
                    currentSpawnItem = whiteLightProperties;
                    break;
                case "silverOrnament":
                    currentSpawnItem = silverOrnamentProperties;
                    break;
                case "goldOrnament":
                    currentSpawnItem = goldOrnamentProperties;
                    break;
                case "redOrnament":
                    currentSpawnItem = redOrnamentProperties;
                    break;
                case "greenOrnament":
                    currentSpawnItem = greenOrnamentProperties;
                    break;
                case "tree":
                    currentSpawnItem = treeProperties;
                    break;
                case "snowman":
                    currentSpawnItem = snowmanProperties;
                    break;
                case "candyCane":
                    currentSpawnItem = candyCaneProperties;
                    break;
                case "gift":
                    currentSpawnItem = giftProperties;
                    break;
                case "gifts":
                    currentSpawnItem = giftsProperties;
                    break;
                
                case "star":
                    currentSpawnItem = starProperties;
                    break;
                default:
                    currentSpawnItem = treeProperties;
            }
        },

        startEquip: function(id, params) {
            currentHand = params[0] === "left" ? 0 : 1;

            Controller.keyReleaseEvent.connect(_this.keyReleaseEvent);

            if (!HMD.active) {
                _this.addMouseEquipAnimation();
                _this.addDesktopOverlay();
            }
            
            previousHMDActive = HMD.active;
        },

        continueEquip: function(id, params) {
            if (currentHand === null) {
                return;
            }

            if (HMD.active !== previousHMDActive) {
                if (HMD.active) {
                    _this.removeDesktopOverlay();
                    _this.removeMouseEquipAnimation();
                } else {
                    _this.addDesktopOverlay();
                    _this.addMouseEquipAnimation();
                }
                previousHMDActive = HMD.active;
            }

            _this.toggleWithTriggerPressure();
        },

        releaseEquip: function(id, params) {
            currentHand = null;

            Controller.keyReleaseEvent.disconnect(_this.keyReleaseEvent);

            _this.removeMouseEquipAnimation();
            _this.removeDesktopOverlay();
        },

        fire: function() {
            var HAPTIC_STRENGTH = 1;
            var HAPTIC_DURATION = 20;
            Controller.triggerHapticPulse(HAPTIC_STRENGTH, HAPTIC_DURATION, currentHand);
            var fireStart = this.getBarrelPosition();
            var barrelDirection = this.getBarrelDirection();
            var normalizedDirection = Vec3.normalize(barrelDirection);
            var velocity = Vec3.multiply(normalizedDirection, VELOCITY_FACTOR);
            currentSpawnItem.position = fireStart;
            currentSpawnItem.velocity = velocity;
            var gunRotation = Entities.getEntityProperties(_this.entityID, 'rotation').rotation;
            currentSpawnItem.rotation = Quat.cancelOutRollAndPitch(gunRotation);
            Entities.addEntity(currentSpawnItem);
        },

        playSound: function(position, sound) {
            if (sound.downloaded) {
                if (injector) {
                    injector.stop();
                }
                injector = Audio.playSound(sound, {
                    position: Entities.getEntityProperties(_this.entityID, 'position').position,
                    volume: AUDIO_VOLUME_LEVEL
                });
            }
        },

        getBarrelPosition: function() {
            var properties = Entities.getEntityProperties(_this.entityID, ['position', 'rotation']);
            var barrelLocalPosition = Vec3.multiplyQbyV(properties.rotation, BARREL_LOCAL_OFFSET);
            var barrelWorldPosition = Vec3.sum(properties.position, barrelLocalPosition);
            return barrelWorldPosition;
        },

        getBarrelDirection: function() {
            var rotation = Entities.getEntityProperties(_this.entityID, ['rotation']).rotation;
            var barrelAdjustedDirection = Vec3.multiplyQbyV(rotation, BARREL_LOCAL_DIRECTION);
            return barrelAdjustedDirection;
        },

        toggleWithTriggerPressure: function() {
            var triggerValue = Controller.getValue(TRIGGER_CONTROLS[currentHand]);
            if (triggerValue >= TRIGGER_THRESHOLD) {
                if (canShoot === true) {
                    _this.fire();
                    canShoot = false;
                }
            } else {
                canShoot = true;
            }
        },

        addDesktopOverlay: function() {
            _this.removeDesktopOverlay();
            var userDataProperties = JSON.parse(Entities.getEntityProperties(_this.entityID, 'userData').userData);
            
            if (currentHand === null || !DESKTOP_HOW_TO_OVERLAY) {
                return;
            }

            var showOverlay = true;
            var otherHandDesktopOverlay = _this.getOtherHandDesktopOverlay();
            if (otherHandDesktopOverlay !== null) {
                desktopHowToOverlay = userDataProperties.desktopHowToOverlay;
                showOverlay = false;    
            }
            
            if (showOverlay) {
                var viewport = Controller.getViewportDimensions();
                var windowHeight = viewport.y;
                desktopHowToOverlay = Overlays.addOverlay("image", {
                    imageURL: DESKTOP_HOW_TO_IMAGE_URL,
                    x: 0,
                    y: windowHeight - DESKTOP_HOW_TO_IMAGE_HEIGHT - Y_OFFSET_FOR_WINDOW,
                    width: DESKTOP_HOW_TO_IMAGE_WIDTH,
                    height: DESKTOP_HOW_TO_IMAGE_HEIGHT,
                    alpha: 1.0,
                    visible: true
                });
                
                userDataProperties.desktopHowToOverlay = desktopHowToOverlay;
                Entities.editEntity(_this.entityID, {
                    userData: JSON.stringify(userDataProperties)
                });
            }
        },

        getOtherHandDesktopOverlay: function() {
            var otherHandDesktopOverlay = null;
            if (currentHand !== null) {
                var handJointIndex = MyAvatar.getJointIndex(currentHand === HAND.LEFT ? "RightHand" : "LeftHand");
                var children = Entities.getChildrenIDsOfJoint(MyAvatar.SELF_ID, handJointIndex);
                children.forEach(function(childID) {
                    var userDataProperties = JSON.parse(Entities.getEntityProperties(childID, 'userData').userData);
                    if (userDataProperties.desktopHowToOverlay) {
                        otherHandDesktopOverlay = userDataProperties.desktopHowToOverlay;
                    }
                });
            }
            return otherHandDesktopOverlay;
        },
        
        removeDesktopOverlay: function() {
            var otherHandDesktopOverlay = _this.getOtherHandDesktopOverlay();
            if (desktopHowToOverlay !== null && otherHandDesktopOverlay === null) {
                Overlays.deleteOverlay(desktopHowToOverlay);
                desktopHowToOverlay = null;
            }
        },
        
        addMouseEquipAnimation: function() {
            print("MOUSE EQUIP ANIMATION");
            _this.removeMouseEquipAnimation();
            if (currentHand === HAND.LEFT) {
                mouseEquipAnimationHandler = MyAvatar.addAnimationStateHandler(_this.leftHandMouseEquipAnimation, []);
            } else if (currentHand === HAND.RIGHT) {
                mouseEquipAnimationHandler = MyAvatar.addAnimationStateHandler(_this.rightHandMouseEquipAnimation, []);
            }           
        },
        
        removeMouseEquipAnimation: function() {
            if (mouseEquipAnimationHandler) {
                mouseEquipAnimationHandler = MyAvatar.removeAnimationStateHandler(mouseEquipAnimationHandler);
            }
        },
        
        leftHandMouseEquipAnimation: function() {
            var result = {};      
            result.leftHandType = 0;                        
            
            var leftHandPosition = MyAvatar.getJointPosition("LeftHand");
            var leftShoulderPosition = MyAvatar.getJointPosition("LeftShoulder");
            var shoulderToHandDistance = Vec3.distance(leftHandPosition, leftShoulderPosition);
            
            var cameraForward = Quat.getForward(Camera.orientation);
            var newForward = Vec3.multiply(cameraForward, shoulderToHandDistance);
            var newLeftHandPosition = Vec3.sum(leftShoulderPosition, newForward);
            var newLeftHandPositionAvatarFrame = Vec3.subtract(newLeftHandPosition, MyAvatar.position);
            
            var headIndex = MyAvatar.getJointIndex("Head");
            var offset = 0.5;
            if (headIndex) {
                offset = offsetMultiplier* MyAvatar.getAbsoluteJointTranslationInObjectFrame(headIndex).y;
            }
            result.leftHandPosition = Vec3.multiply(offset, {x: 0.25, y: 0.6, z: 0.9});
            var yPosition = exponentialSmoothing(newLeftHandPositionAvatarFrame.y, previousLeftYPosition);
            result.leftHandPosition.y = yPosition;
            previousLeftYPosition = yPosition;
            var leftHandPositionNew = Vec3.sum(MyAvatar.position, result.leftHandPosition);
            
            var rotation = Quat.lookAtSimple(leftHandPositionNew, leftShoulderPosition);
            var rotationAngles = Quat.safeEulerAngles(rotation);
            var xRotation = exponentialSmoothing(rotationAngles.x, previousLeftXRotation);
            var zRotation = exponentialSmoothing(rotationAngles.z, previousLeftZRotation);
            var newRotation = Quat.fromPitchYawRollDegrees(rotationAngles.x, 0, rotationAngles.z);
            previousLeftXRotation = xRotation;
            previousLeftZRotation = zRotation;
            result.leftHandRotation = Quat.multiply(newRotation, Quat.fromPitchYawRollDegrees(80, -20, -90));
            
            return result;
        },
        
        rightHandMouseEquipAnimation: function() {
            var result = {};      
            result.rightHandType = 0;                       
            
            var rightHandPosition = MyAvatar.getJointPosition("RightHand");
            var rightShoulderPosition = MyAvatar.getJointPosition("RightShoulder");
            var shoulderToHandDistance = Vec3.distance(rightHandPosition, rightShoulderPosition);
            
            var cameraForward = Quat.getForward(Camera.orientation);
            var newForward = Vec3.multiply(cameraForward, shoulderToHandDistance);
            var newRightHandPosition = Vec3.sum(rightShoulderPosition, newForward);
            var newRightHandPositionAvatarFrame = Vec3.subtract(newRightHandPosition, MyAvatar.position);
            
            var headIndex = MyAvatar.getJointIndex("Head");
            var offset = 0.5;
            if (headIndex) {
                offset = offsetMultiplier * MyAvatar.getAbsoluteJointTranslationInObjectFrame(headIndex).y;
            }
            result.rightHandPosition = Vec3.multiply(offset, {x: -0.25, y: 0.6, z: 0.9});
            var yPosition = exponentialSmoothing(newRightHandPositionAvatarFrame.y, previousRightYPosition);
            result.rightHandPosition.y = yPosition;
            previousRightYPosition = yPosition;
            
            var rightHandPositionNew = Vec3.sum(MyAvatar.position, result.rightHandPosition);
            
            var rotation = Quat.lookAtSimple(rightHandPositionNew, rightShoulderPosition);
            var rotationAngles = Quat.safeEulerAngles(rotation);
            var xRotation = exponentialSmoothing(rotationAngles.x, previousRightXRotation);
            var zRotation = exponentialSmoothing(rotationAngles.z, previousRightZRotation);
            var newRotation = Quat.fromPitchYawRollDegrees(rotationAngles.x, 0, rotationAngles.z);
            previousRightXRotation = xRotation;
            previousRightZRotation = zRotation;
            result.rightHandRotation = Quat.multiply(newRotation, Quat.fromPitchYawRollDegrees(80, 0, 90));
            
            return result;
        },

        keyReleaseEvent: function(event) {
            if ((event.text).toLowerCase() === FIRE_KEY) {
                if (canFire) {
                    canFire = false;
                    _this.fire();
                    Script.setTimeout(function() {
                        canFire = true;
                    }, CAN_FIRE_AGAIN_TIMEOUT_MS);
                }
            }
        },
        
        unload: function() {
            this.removeMouseEquipAnimation();
            this.removeDesktopOverlay();
        }
    };

    return new Gun();
});
