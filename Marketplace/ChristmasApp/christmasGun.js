//
//  christmasGun.js
//
//  created by Rebecca Stankus on 11/07/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// This is the client script on the gun that will create the entities that it shoots

/* global Pointers, Graphics */
function exponentialSmoothing(target, current) {
    var smoothingConstant = 0.75;
    return target * (1 - smoothingConstant) + current * smoothingConstant;
}

(function() { 
    var _this;

    var TRIGGER_CONTROLS = [Controller.Standard.LT, Controller.Standard.RT];
    var TRIGGER_THRESHOLD = 0.97; // How far down the trigger is pressed
    var AUDIO_VOLUME_LEVEL = 0.1;
    var BARREL_LOCAL_OFFSET = {x: 0, y: 0, z: 0}; // Can adjust the position of the gun barrel for different shapes
    var BARREL_LOCAL_DIRECTION = {x: 1000, y: 0, z: 0}; // Which direction the gun shoots in
    var DESKTOP_HOW_TO_IMAGE_URL = Script.resolvePath("assets/textures/desktopFireUnequip.png");
    var DESKTOP_HOW_TO_IMAGE_WIDTH = 384;
    var DESKTOP_HOW_TO_IMAGE_HEIGHT = 128;
    var FIRE_KEY = "f";
    var HAND = {LEFT: 0, RIGHT: 1};
    var DESKTOP_HOW_TO_OVERLAY = true;
    var CAN_FIRE_AGAIN_TIMEOUT_MS = 250;
    var Y_OFFSET_FOR_WINDOW = 24;
    var VELOCITY_FACTOR = 5;
    var LIFETIME = 900; // How long each item should persist before being deleted

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
        serverScripts: Script.resolvePath("christmasItemGrow.js"),
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
        serverScripts: Script.resolvePath("christmasStarSpawnLights.js"),
        shapeType: "simple-compound",
        userData: "{\"grabbableKey\":{\"grabbable\":true}}"
    };
    var stockingProperties = {
        description: "CC_BY Alan Zimmerman",
        dimensions: {
            x: 0.08,
            y: 0.1,
            z: 0.025
        },
        lifetime: LIFETIME,
        restitution: 0.1,
        angularDamping: 1,
        dynamic: true,
        modelURL: Script.resolvePath("assets/models/stocking.fbx"),
        name: "Christmas App Stocking",
        script: Script.resolvePath("christmasItem.js"),
        shapeType: "simple-compound",
        type: "Model",
        userData: "{\"grabbableKey\":{\"grabbable\":true}}"
    };
    var icicleProperties = {
        description: "CC_BY Alan Zimmerman",
        dimensions: {
            x: 0.0378,
            y: 0.1,
            z: 0.0378
        },
        lifetime: LIFETIME,
        restitution: 0.1,
        angularDamping: 1,
        dynamic: true,
        modelURL: Script.resolvePath("assets/models/icicle.fbx"),
        name: "Christmas App Icicle",
        script: Script.resolvePath("christmasItem.js"),
        shapeType: "simple-compound",
        type: "Model",
        userData: "{\"grabbableKey\":{\"grabbable\":true}}"
    };
    var gingerbreadManProperties = {
        description: "CC_BY Alan Zimmerman",
        dimensions: {
            x: 0.0136,
            y: 0.1,
            z: 0.09
        },
        lifetime: LIFETIME,
        restitution: 0.1,
        angularDamping: 1,
        dynamic: true,
        modelURL: Script.resolvePath("assets/models/gingerbread.fbx"),
        name: "Christmas App Gingerbread Man",
        script: Script.resolvePath("edibleItem.js"),
        shapeType: "simple-compound",
        type: "Model",
        userData: "{\"grabbableKey\":{\"grabbable\":true}}"
    };
    var ornamentProperties = {
        description: "CC_BY Alan Zimmerman",
        dimensions: {
            x: 0.08,
            y: 0.1,
            z: 0.08
        },
        lifetime: LIFETIME,
        restitution: 0.1,
        angularDamping: 1,
        dynamic: true,
        modelURL: Script.resolvePath("assets/models/ornament.fbx"),
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
            Texture: Script.resolvePath("assets/images/ember-red.png")
        }),
        texture: Script.resolvePath("assets/images/particle-ember-red.png"),
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
            Texture: Script.resolvePath("assets/images/ember-green.png")
        }),
        texture: Script.resolvePath("assets/images/particle-ember-green.png"),
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
            Texture: Script.resolvePath("assets/images/ember-yellow.png")
        }),
        texture: Script.resolvePath("assets/images/particle-ember-yellow.png"),
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
            Texture: Script.resolvePath("assets/images/ember-white.png")
        }),
        texture: Script.resolvePath("assets/images/particle-ember-white.png"),
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
    var candyCaneProperties = {
        description: "CC_BY Poly By Google",
        dimensions: {
            x: 0.0365,
            y: 0.085,
            z: 0.008
        },
        lifetime: LIFETIME,
        restitution: 0,
        angularDamping: 1,
        linearDamping: 0,
        dynamic: true,
        modelURL: Script.resolvePath("assets/models/candyCane/275_Candy%20Cane.obj"),
        name: "Christmas App Candy Cane",
        script: Script.resolvePath("edibleItem.js"),
        serverScripts: Script.resolvePath("christmasItemGrow.js"),
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
        lifetime: LIFETIME,
        restitution: 0,
        angularDamping: 1,
        linearDamping: 0,
        dynamic: true,
        modelURL: Script.resolvePath("assets/models/gift.fbx"),
        name: "Christmas App Gift",
        script: Script.resolvePath("christmasItem.js"),
        serverScripts: Script.resolvePath("christmasItemGrow.js"),
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
        lifetime: LIFETIME,
        restitution: 0,
        angularDamping: 1,
        linearDamping: 0,
        dynamic: true,
        modelURL: Script.resolvePath("assets/models/gifts.obj"),
        name: "Christmas App Gifts",
        script: Script.resolvePath("christmasItem.js"),
        serverScripts: Script.resolvePath("christmasItemGrow.js"),
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
        lifetime: LIFETIME,
        restitution: 0,
        angularDamping: 1,
        linearDamping: 0,
        dynamic: true,
        modelURL: Script.resolvePath("assets/models/snowMan.fbx"),
        name: "Christmas App Snowman",
        script: Script.resolvePath("christmasItem.js"),
        serverScripts: Script.resolvePath("christmasItemGrow.js"),
        shapeType: "simple-compound",
        type: "Model",
        userData: "{\"grabbableKey\":{\"grabbable\":false}}"
    };
    var currentSpawnItem = treeProperties; // default item if nothing else has been selected
    
    function Gun() {
        _this = this;
    }

    Gun.prototype = {
        remotelyCallable: ['setSpawn'], // this will be called from the app when a button has been pressed
        preload: function(entityID) {
            _this.entityID = entityID;
            previousHMDActive = HMD.active; // storing whether or not the user is in HMD for later
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
                case "stocking":
                    currentSpawnItem = stockingProperties;
                    break;
                case "icicle":
                    currentSpawnItem = icicleProperties;
                    break;
                case "gingerbreadMan":
                    currentSpawnItem = gingerbreadManProperties;
                    break;
                case "ornament":
                    currentSpawnItem = ornamentProperties;
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

        // When the gun is equipped, store which hand it is in and whether the user is in HMD, listen for key release 
        // events, and if the user is in desktop, animate their avatar to be holding the gun and set up an instructional 
        // overlay so they know how to unequip and fire
        startEquip: function(id, params) {
            currentHand = params[0] === "left" ? 0 : 1;

            Controller.keyReleaseEvent.connect(_this.keyReleaseEvent);

            if (!HMD.active) {
                _this.addMouseEquipAnimation();
                _this.addDesktopOverlay();
            }
            
            previousHMDActive = HMD.active;
        },

        // While the gun is held, if the user switches between HMD and desktop, change the gun setup to account for it 
        // and listen for trigger pulls
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

        // When the user releases the gun, remove the animation and instructional over lay if needed, stop listening 
        // for key events and set the current hand to none
        releaseEquip: function(id, params) {
            currentHand = null;

            Controller.keyReleaseEvent.disconnect(_this.keyReleaseEvent);

            _this.removeMouseEquipAnimation();
            _this.removeDesktopOverlay();
        },

        // On firing the gun, we trigger haptic feedback for 20ms at full strength. Then, we calculate the direction 
        // to shoot the item based on the position and rotation of the gun and change the rotation of the item to match. 
        // Then we create the item with velocity so it will be moving in the correct direction
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
            if (currentSpawnItem.name === "Christmas App Stocking") { // the stocking needs to be rotated an extra 90 degrees
                var newRotation = Quat.fromPitchYawRollRadians(0, 90, 0 );
                currentSpawnItem.rotation = Quat.multiply(gunRotation, newRotation);
            } else {
                currentSpawnItem.rotation = Quat.cancelOutRollAndPitch(gunRotation);
            }
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

        // When the trigger is pressed past the set threshold while the gun is equipped, we either shoot or set a 
        // variable to allow it to shoot next time the trigger is pressed
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

        // Adding the overlay that tells users how to operate the gun in desktop. We must find the size of the screen 
        // and then position the overlay accordingly and store its state in the userData. If the overlay has already 
        // been created, we can reuse it's former properties
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

        // checks userdata to reuse properties of the desktop overlay if possible
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
        
        // Here we calculate a position for the avatars left hand and the rest of the arm will position itself around  
        // this. We find the length of the arm, and position of the head (if a "Head" joint exists), then set the 
        // postion of the hand relative to them.
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
        
        // see "leftHandMouseEquipAnimation" description
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

        // listening for key events in desktop mode and preventing the gun from firing multiple times in succession 
        // by setting a "canShoot" variable
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
