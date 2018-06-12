//
//  materialSwapGun.js
//
//  created by Rebecca Stankus on 03/27/18
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
    var BARREL_LOCAL_OFFSET = {x: 0.015, y: 0.065, z: -0.25};
    var BARREL_LOCAL_DIRECTION = {x: 0, y: 0, z: -1000};
    var SHOOT_SOUND = Script.resolvePath("sounds/shoot.wav");
    var DESKTOP_HOW_TO_IMAGE_URL = Script.resolvePath("textures/desktopFireUnequip.png");
    var DESKTOP_HOW_TO_IMAGE_WIDTH = 384;
    var DESKTOP_HOW_TO_IMAGE_HEIGHT = 128;
    var FIRE_KEY = "f";
    var HAND = {LEFT: 0, RIGHT: 1};
    var DESKTOP_HOW_TO_OVERLAY = true;
    var CAN_FIRE_AGAIN_TIMEOUT_MS = 250;
    var SWAP_SOUND = Script.resolvePath("sounds/swap.wav");
    var MISS_SOUND = Script.resolvePath("sounds/miss.wav");
    var SWAP_TIMEOUT_MS = 500;
    var FIND_MATERIAL_RADIUS = 10;
    var PRIORITY_DEFAULT =100;
    var SUBMESH_DEFAULT = "0";
    var STOP_EMITTING_MS = 100;
    var DEFAULT_DISTANCE_M = 3;
    var LIFETIME = 45;
    var Y_OFFSET_FOR_WINDOW = 24;

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
    var nextMaterial;
    var nextColor;
    var swapSound;
    var missSound;
    var shootSound;
    var doNotRayPick = [];
    var offsetMultiplier = 0.8;
    
    function Gun() {
        _this = this;
    }

    Gun.prototype = {
        particleEffect: null,
        particleInterval: null,
        colorSpray: null,
        preload: function(entityID) {
            _this.entityID = entityID;
            previousHMDActive = HMD.active;
            swapSound = SoundCache.getSound(SWAP_SOUND);
            missSound = SoundCache.getSound(MISS_SOUND);
            shootSound = SoundCache.getSound(SHOOT_SOUND);
            Entities.getChildrenIDs(_this.entityID).forEach(function(element) {
                var name = Entities.getEntityProperties(element, 'name').name;
                if (name === "Gun Particle Effect") {
                    _this.particleEffect = element;
                }
            });
            _this.getNext();
            doNotRayPick = Entities.getChildrenIDs(_this.entityID);
            doNotRayPick.push(_this.entityID, nextMaterial);
        },
        
        callToShootBall: function(distance) {
            var params = [];
            params[0] = JSON.stringify(_this.getBarrelPosition());
            params[1] = JSON.stringify(_this.getBarrelDirection());
            params[2] = JSON.stringify(distance);
            Entities.callEntityServerMethod(_this.entityID, 'fire', params);
        },

        startEquip: function(id, params) {
            currentHand = params[0] === "left" ? 0 : 1;
            
            Entities.editEntity(_this.entityID, {
                visible: true,
                lifetime: -1 
            });

            Controller.keyReleaseEvent.connect(_this.keyReleaseEvent);

            if (!HMD.active) {
                _this.addMouseEquipAnimation();
                _this.addDesktopOverlay();
            }
            
            previousHMDActive = HMD.active;
        },

        startNearGrab: function() {
            Entities.editEntity(_this.entityID, {
                visible: true,
                lifetime: -1 
            });
        },

        releaseNearGrab: function() {
            var age = Entities.getEntityProperties(_this.entityID, "age").age;
            Entities.editEntity(_this.entityID, {
                lifetime: age + LIFETIME
            });
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
            
            var age = Entities.getEntityProperties(_this.entityID, "age").age;
            Entities.editEntity(_this.entityID, {
                lifetime: age + LIFETIME
            });

            Controller.keyReleaseEvent.disconnect(_this.keyReleaseEvent);

            _this.removeMouseEquipAnimation();
            _this.removeDesktopOverlay();
        },
        
        getNext: function() {
            var gunUserDataString = Entities.getEntityProperties(_this.entityID, 'userData').userData;
            var gunUserData;
            if (gunUserDataString) {
                gunUserData = JSON.parse(gunUserDataString);
            }
            if (gunUserData) {
                nextMaterial = gunUserData.nextMaterial;
                nextColor = gunUserData.nextColor;
                // just getting sim ownership
                Entities.editEntity(nextMaterial, {
                    parentID: _this.entityID,
                    priority: 2,
                    parentMaterialName: "0"
                });
            }
        },

        fire: function() {
            Entities.findEntities(MyAvatar.position, FIND_MATERIAL_RADIUS).forEach(function(element) {
                var type = Entities.getEntityProperties(element, 'type').type;
                if (type === "Material") {
                    doNotRayPick.push(element);
                }
            });
            
            var HAPTIC_STRENGTH = 1;
            var HAPTIC_DURATION = 20;
            Controller.triggerHapticPulse(HAPTIC_STRENGTH, HAPTIC_DURATION, currentHand);
            _this.playSound(Entities.getEntityProperties(_this.entityID, 'position').position, shootSound);
            
            _this.addParticleEffect();
            var fireStart = this.getBarrelPosition();
            var barrelDirection = this.getBarrelDirection();
            var barrelDirectionLength = Vec3.length(barrelDirection);
            var barrelDirectionNormalized = Vec3.normalize(barrelDirection);
            var fireRay = {
                origin: fireStart,
                direction: barrelDirectionNormalized
            };
            var entityIntersection = Entities.findRayIntersection(fireRay, true, [], doNotRayPick);
            var entityIntersectionDistance = entityIntersection.intersects ? entityIntersection.distance : Number.MAX_VALUE;
            var avatarIntersection = AvatarList.findRayIntersection(fireRay);
            var avatarIntersectionDistance = avatarIntersection.intersects ? avatarIntersection.distance : Number.MAX_VALUE;   
            var intersectEntityID = null;
            var intersection = null;
            if (entityIntersection.intersects && entityIntersectionDistance < avatarIntersectionDistance && 
                    entityIntersectionDistance < barrelDirectionLength) {
                intersectEntityID = entityIntersection.entityID;
                intersection = entityIntersection;
            } else if (avatarIntersection.intersects && avatarIntersectionDistance < entityIntersectionDistance && 
                    avatarIntersectionDistance < barrelDirectionLength) {
                intersectEntityID = avatarIntersection.avatarID;
                intersection = avatarIntersection;
            }
            _this.callToShootBall(intersection ? intersection.distance : DEFAULT_DISTANCE_M);  
            var intersectEntityProperties = Entities.getEntityProperties(intersectEntityID, ['position', 'rotation']);
            
            if (intersectEntityID) {
                Script.setTimeout(function() {
                    try {
                        var mesh = Graphics.getModel(intersectEntityID);
                    } catch (err) {
                        print("could not get mesh");
                        _this.playSound(intersectEntityProperties.position, missSound);
                    }
                    var priority;
                    var submesh;
                    var materialList;
                    if (mesh) {
                        materialList = mesh.materialLayers;
                        if (intersection && intersection.extraInfo) {
                            submesh = intersection.extraInfo.subMeshIndex;
                        } else {
                            submesh = SUBMESH_DEFAULT;
                        }
                    } else {
                        submesh = SUBMESH_DEFAULT;
                    }
                    if (materialList) {
                        if (materialList[submesh]) {
                            priority = _this.getTopMaterialPriority(materialList[submesh]);
                        }
                    } else {
                        priority = PRIORITY_DEFAULT;
                    }
                    Entities.getChildrenIDs(intersectEntityID).forEach(function(element) {
                        var name = Entities.getEntityProperties(element, 'name').name;
                        if (name === "Gun Material" && (element !== nextMaterial)) {
                            var otherSubmesh = 
                            Entities.getEntityProperties(element, 'parentMaterialName').parentMaterialName;
                            if (submesh == otherSubmesh) {
                                Entities.deleteEntity(element);
                            }
                        }
                    });
                
                    priority += 1;
                    var params = [];
                    params[0] = JSON.stringify(intersection.intersection);
                    Entities.callEntityServerMethod(_this.entityID, 'createSplat', params);
                    Entities.editEntity(nextMaterial, {
                        parentID: intersectEntityID,
                        priority: priority,
                        parentMaterialName: submesh
                    });
                    _this.playSound(intersectEntityProperties.position, swapSound);
                    _this.getNext();
                }, SWAP_TIMEOUT_MS);
            } else {
                _this.playSound(intersectEntityProperties.position, missSound);
            }
            
        },

        getTopMaterialPriority: function(multiMaterial) {
            if (multiMaterial.length > 1) {
                if (multiMaterial[1].priority > multiMaterial[0].priority) {
                    return multiMaterial[1].priority;
                }
            }
            return multiMaterial[0].priority;
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
        
        addParticleEffect: function() {
            if (_this.particleInterval) {
                Script.clearInterval(_this.particleInterval);
                _this.particleInterval = null;
            } else {
                Entities.editEntity(_this.particleEffect, {
                    polarStart: 0,
                    polarFinish: 17,
                    emitDimensions: {x: 0,y: 0,z: 0},
                    emitOrientation: {x: 0,y: 180,z: 0},
                    color: nextColor,
                    colorSpread: nextColor,
                    colorStart: nextColor,
                    colorFinish: nextColor,
                    isEmitting: true,
                    emitRate: 200
                });
            }

            Script.setTimeout(function() {
                Entities.editEntity(_this.particleEffect, { isEmitting: false });
            }, STOP_EMITTING_MS);
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
            result.leftHandType = 1;                        
            
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
            result.leftHandPosition = Vec3.multiply(offset, {x: 0.25, y: 0.6, z: 1});
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
            result.leftHandRotation = Quat.multiply(newRotation, Quat.fromPitchYawRollDegrees(80, -60, -90));
            
            return result;
        },
        
        rightHandMouseEquipAnimation: function() {
            var result = {};      
            result.rightHandType = 1;                       
            
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
            result.rightHandPosition = Vec3.multiply(offset, {x: -0.25, y: 0.8, z: 1.3});
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
            result.rightHandRotation = Quat.multiply(newRotation, Quat.fromPitchYawRollDegrees(80, -5, 90));
            
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
