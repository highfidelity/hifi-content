//
//  flamethrowerClient.js
//
//  Created by David Back on 3/27/18.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

function exponentialSmoothing(target, current) {
    var smoothingConstant = 0.75;
    return target * (1 - smoothingConstant) + current * smoothingConstant;
}

(function() {       
    var FIRING_SOUND = SoundCache.getSound(Script.resolvePath("../sounds/39048__ls__sparkles.wav"));
    var RAINBOW_IMAGE = Script.resolvePath("../textures/rainbow.png");
    var DESKTOP_HOW_TO_IMAGE_URL = Script.resolvePath("../textures/desktopFireUnequip.png");
    var DESKTOP_HOW_TO_IMAGE_WIDTH = 384;
    var DESKTOP_HOW_TO_IMAGE_HEIGHT = 128;
    var TRIGGER_CONTROLS = [Controller.Standard.LT, Controller.Standard.RT];
    var FIRING_THRESHOLD = 0.3;
    var MIN_FIRE_LIFESPAN = 0.2;
    var MAX_FIRE_LIFESPAN = 0.6;
    var MIN_FIRING_SOUND_VOLUME = 0.2;
    var MAX_FIRING_SOUND_VOLUME = 0.6;
    var MIN_RADIUS_FINISH = 0.25;
    var MAX_RADIUS_FINISH = 0.7;
    var MIN_PARTICLE_RADIUS = 0.15;
    var MAX_PARTICLE_RADIUS = 0.45;
    var MIN_NOZZLE_LIGHT_INTENSITY = 3;
    var MAX_NOZZLE_LIGHT_INTENSITY = 30;
    var MIN_BARREL_LOCAL_X_DIRECTION = 1.75;
    var MAX_BARREL_LOCAL_X_DIRECTION = 17.5;
    var MIN_BARREL_LOCAL_Y_DIRECTION = -0.5;
    var MAX_BARREL_LOCAL_Y_DIRECTION = -4;
    var BARREL_LOCAL_OFFSET = {x:0.635, y:0.0325, z:0.0};
    var NOZZLE_LIGHT_LOCAL_POSITION = {x:1.0, y:-0.075, z:0.0};
    var FIRING_X_ACCELERATION = 100;
    var BASE_EMIT_RATE = 200;
    var EMIT_RATE_SPREAD = 200;
    var END_FIRE_FRAME_DELAY = 5;
    var NOT_HOME_RETURN_FRAMES = 2000;
    var FIRE_KEY = "f";
    var HAND = {LEFT : 0, RIGHT : 1};
    var DESKTOP_HOW_TO_OVERLAY = true;
    var NOZZLE_LIGHT = false;
    var DEBUG_FIRING = false;
    
    var _this;
    var currentHand = null;
    var isFiring = false;
    var flameEntity = null;
    var nozzleLight = null;
    var firingSound = null;
    var firingPercent = 0;
    var fireLifespan = 0;
    var fireKeyPressed = false;
    var mouseEquipAnimationHandler;
    var desktopHowToOverlay = null;
    var previousHMDActive;
    var endFireFrameDelay = 0;
    var endFireServerCall = null;
    var endFireServerArgs = null;
    var notHomeCount = 0;
    var homePosition = null;
    var homeRotation = null;
    
    var previousLeftYPosition = 0;
    var previousLeftXRotation = 0;
    var previousLeftZRotation = 0;
    var previousRightYPosition = 0;
    var previousRightXRotation = 0;
    var previousRightZRotation = 0;

    Flamethrower = function() {
        _this = this;
    };

    Flamethrower.prototype = {
        startEquip: function(id, params) {
            currentHand = params[0] === "left" ? HAND.LEFT : HAND.RIGHT;
            
            Controller.keyPressEvent.connect(this.keyPressEvent);
            Controller.keyReleaseEvent.connect(this.keyReleaseEvent);
            
            Entities.editEntity(this.entityID, {
                collidesWith: "static,dynamic,kinematic,myAvatar"
            });
            
            if (!HMD.active) {
                this.addMouseEquipAnimation();
                this.addDesktopOverlay();
            }
            
            previousHMDActive = HMD.active;
            
            if (homePosition !== null && notHomeCount > 0) {
                notHomeCount = 0;
                Script.update.disconnect(this.updateNotHome);
            }
        },

        continueEquip: function(id, params) {
            if (!currentHand === null) {
                return;
            }
            
            if (HMD.active !== previousHMDActive) {
                if (HMD.active) {
                    this.removeDesktopOverlay();
                    this.removeMouseEquipAnimation();
                } else {
                    this.addDesktopOverlay();
                    this.addMouseEquipAnimation();
                }
                previousHMDActive = HMD.active;
            }
            
            if (!Window.hasFocus() && fireKeyPressed) {
                fireKeyPressed = false;
            }
            
            this.triggerFire();
        },

        releaseEquip: function(id, params) {
            currentHand = null;
            
            Controller.keyPressEvent.disconnect(this.keyPressEvent);
            Controller.keyReleaseEvent.disconnect(this.keyReleaseEvent);
            
            Entities.editEntity(this.entityID, {
                collidesWith: "static,dynamic,kinematic,otherAvatar,myAvatar"
            });
            
            this.removeMouseEquipAnimation();
            this.removeDesktopOverlay();
            this.stopFiring();
            this.setupNotHomeUpdate();
        },
        
        releaseGrab: function(entityID, args) {
            this.setupNotHomeUpdate();
        },
        
        returnToHome: function() {
            if (homePosition !== null) {
                Entities.editEntity(this.entityID, {position: homePosition});
            }
            if (homeRotation !== null) {
                Entities.editEntity(this.entityID, {rotation: homeRotation});
            }
            notHomeCount = 0;
            Script.update.disconnect(this.updateNotHome);
        },
        
        setupNotHomeUpdate: function() {
            if (homePosition !== null && !DEBUG_FIRING) {
                notHomeCount = 0;
                Script.update.connect(this.updateNotHome);
            }
        },
        
        updateNotHome: function() {
            notHomeCount++;
            if (notHomeCount >= NOT_HOME_RETURN_FRAMES) {
                notHomeCount = 0;
                _this.returnToHome();
            }
        },
        
        getBarrelPosition: function() {
            var properties = Entities.getEntityProperties(this.entityID, ['position', 'rotation']);
            var barrelLocalPosition = Vec3.multiplyQbyV(properties.rotation, BARREL_LOCAL_OFFSET);
            var barrelWorldPosition = Vec3.sum(properties.position, barrelLocalPosition);
            return barrelWorldPosition;
        },

        getBarrelDirection: function() {
            var rotation = Entities.getEntityProperties(this.entityID, ['rotation']).rotation;
            var xDirection = firingPercent * (MAX_BARREL_LOCAL_X_DIRECTION - MIN_BARREL_LOCAL_X_DIRECTION) + 
                             MIN_BARREL_LOCAL_X_DIRECTION;
            var yDirection = firingPercent * (MAX_BARREL_LOCAL_Y_DIRECTION - MIN_BARREL_LOCAL_Y_DIRECTION) + 
                             MIN_BARREL_LOCAL_Y_DIRECTION;
            var barrelLocalDirection = { x:xDirection, y:yDirection, z:0 };
            var barrelAdjustedDirection = Vec3.multiplyQbyV(rotation, barrelLocalDirection);
            return barrelAdjustedDirection;
        },
        
        getFiringVolume: function() {
            return firingPercent * (MAX_FIRING_SOUND_VOLUME - MIN_FIRING_SOUND_VOLUME) + MIN_FIRING_SOUND_VOLUME;
        },
        
        getRadiusFinish: function() {
            var radiusFinish = firingPercent * (MAX_RADIUS_FINISH - MIN_RADIUS_FINISH) + MIN_RADIUS_FINISH;
            var randomAdditive = Math.random() / 40 - 0.0125;
            return radiusFinish + randomAdditive;
        },
        
        getParticleRadius: function() {
            var particleRadius = firingPercent * (MAX_PARTICLE_RADIUS - MIN_PARTICLE_RADIUS) + MIN_PARTICLE_RADIUS;
            var randomAdditive = Math.random() / 40 - 0.0125;
            return particleRadius + randomAdditive;
        },
        
        getRotatedEmitAcceleration: function() {
            var rotation = Entities.getEntityProperties(this.entityID, ['rotation']).rotation;
            var xAcceleration = FIRING_X_ACCELERATION;
            var randomAdditive = Math.random() * 20 - 10;
            xAcceleration += randomAdditive;
            var acceleration = { x:xAcceleration, y:-20, z:0 };
            var rotatedAcceleration = Vec3.multiplyQbyV(rotation, acceleration);
            return rotatedAcceleration;
        },
        
        getNozzleLightIntensity: function() {
            return firingPercent * (MAX_NOZZLE_LIGHT_INTENSITY - MIN_NOZZLE_LIGHT_INTENSITY) + MIN_NOZZLE_LIGHT_INTENSITY;
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
        
        triggerFire: function() {
            var triggerValue = 0.0;
            if (DEBUG_FIRING || fireKeyPressed) {
                triggerValue = 1.0;
            } else if (currentHand !== null) {
                triggerValue = Controller.getValue(TRIGGER_CONTROLS[currentHand]);
            }
            if (triggerValue >= FIRING_THRESHOLD) {
                firingPercent = (triggerValue - FIRING_THRESHOLD) / (1.0 - FIRING_THRESHOLD);
                fireLifespan = firingPercent * (MAX_FIRE_LIFESPAN - MIN_FIRE_LIFESPAN) + MIN_FIRE_LIFESPAN;
                this.fire();
            } else {
                firingPercent = 0;
                fireLifespan = 0;
                this.stopFiring();
            }
        },

        fire: function() {
            if (isFiring) {
                if (flameEntity) {
                    Entities.editEntity(flameEntity, {lifespan: fireLifespan});
                }
                this.continueFiring();
                return;
            }
            var emitAcceleration = this.getRotatedEmitAcceleration();
            var radiusFinish = this.getRadiusFinish();
            var particleRadius = this.getParticleRadius();
            
            if (flameEntity !== null) {
                Entities.editEntity(flameEntity, {
                    emitAcceleration: emitAcceleration, 
                    emitRate: BASE_EMIT_RATE,
                    particleRadius: particleRadius,
                    radiusFinish: radiusFinish,
                    isEmitting: true
                });
            }
            
            if (nozzleLight !== null) {
                Entities.deleteEntity(nozzleLight);
                nozzleLight = null;
            }
            var nozzleLightLocalPosition = NOZZLE_LIGHT_LOCAL_POSITION;
            var nozzleLightIntensity = this.getNozzleLightIntensity();
            if (NOZZLE_LIGHT) {
                nozzleLight = Entities.addEntity({
                    color: {
                        "blue": 0,
                        "green": 21,
                        "red": 255
                    },
                    cutoff: 90,
                    dimensions: {
                        "x": 7.266854763031006,
                        "y": 7.266854763031006,
                        "z": 7.266854763031006
                    },
                    falloffRadius: 5,
                    name: "Flamethrower Nozzle Light",
                    intensity: nozzleLightIntensity,
                    parentID: this.entityID,
                    localPosition: nozzleLightLocalPosition,
                    queryAACube: {
                        "scale": 12.586562156677246,
                        "x": -6.293281078338623,
                        "y": -6.293281078338623,
                        "z": -6.293281078338623
                    },
                    rotation: {
                        "w": 0.7796292304992676,
                        "x": -1.52587890625e-05,
                        "y": 0.6261844635009766,
                        "z": -1.52587890625e-05
                    },
                    type: "Light"
                }, true);
            }
            
            if (firingSound !== null) {
                firingSound.stop();
                firingSound = null;
            }
            var firingVolume = this.getFiringVolume();
            var barrelPosition = this.getBarrelPosition();
            firingSound = Audio.playSound(FIRING_SOUND, {
                volume: firingVolume,
                position: barrelPosition,
                loop: true
            });
            
            isFiring = true;
            endFireFrameDelay = END_FIRE_FRAME_DELAY;
        },

        continueFiring: function() {
            if (endFireFrameDelay > 0) {
                endFireFrameDelay--;
            } else {
                if (endFireServerCall !== null) {
                    // make the server call to spawn end fire from the last end fire check 
                    // (delayed since the ray cast is too fast compared to the gun stream)
                    Entities.callEntityServerMethod(this.entityID, endFireServerCall, endFireServerArgs);
                    endFireServerCall = null;
                    endFireServerArgs = null;
                }
                
                var fireStart = this.getBarrelPosition();
                var barrelDirection = this.getBarrelDirection();
                var barrelDirectionLength = Vec3.length(barrelDirection);
                var barrelDirectionNormalized = Vec3.normalize(barrelDirection);
                var fireEnd = Vec3.sum(fireStart, barrelDirection);
                var fireRay = {
                    origin: fireStart,
                    direction: barrelDirectionNormalized
                };
                
                var entityIntersection = Entities.findRayIntersection(fireRay, true, [], [this.entityID, flameEntity]);
                var entityIntersectionDistance = entityIntersection.intersects ? entityIntersection.distance : Number.MAX_VALUE;
                var avatarIntersection = AvatarList.findRayIntersection(fireRay);
                var avatarIntersectionDistance = avatarIntersection.intersects ? avatarIntersection.distance : Number.MAX_VALUE;
                
                var intersectEntityID = undefined;
                var intersectLocalPosition;
                if (entityIntersection.intersects && entityIntersectionDistance < avatarIntersectionDistance && 
                    entityIntersectionDistance < barrelDirectionLength) {
                    intersectEntityID = entityIntersection.entityID;
                    var entityDirection = Vec3.multiply(barrelDirectionNormalized, entityIntersection.distance);
                    fireEnd = Vec3.sum(fireStart, entityDirection);
                } else if (avatarIntersection.intersects && avatarIntersectionDistance < entityIntersectionDistance && 
                    avatarIntersectionDistance < barrelDirectionLength) {
                    intersectEntityID = avatarIntersection.avatarID;
                    var avatarDirection = Vec3.multiply(barrelDirectionNormalized, avatarIntersection.distance);
                    fireEnd = Vec3.sum(fireStart, avatarDirection);
                }
                
                var intersectEntityProperties = Entities.getEntityProperties(intersectEntityID, ['position', 'rotation']);
                intersectLocalPosition = Vec3.subtract(fireEnd, intersectEntityProperties.position);
                intersectLocalPosition = Vec3.multiplyQbyV(intersectEntityProperties.rotation, intersectLocalPosition);
                var args = [intersectEntityID, fireEnd.x, fireEnd.y, fireEnd.z, 
                            intersectLocalPosition.x, intersectLocalPosition.y, intersectLocalPosition.z];
                if (intersectEntityID !== undefined) {
                    if (intersectEntityID === entityIntersection.entityID) {
                        endFireServerCall = "createEndFireHitEntity";
                    } else if (intersectEntityID === avatarIntersection.avatarID) {
                        endFireServerCall = "createEndFireHitAvatar";
                    }
                    endFireServerArgs = args;
                } else if (DEBUG_FIRING) {
                    endFireServerCall = "createEndFireNoHit";
                    endFireServerArgs = args;
                }
                
                endFireFrameDelay = END_FIRE_FRAME_DELAY;
            }

            var barrelPosition = this.getBarrelPosition();
            var firingVolume = this.getFiringVolume();
            var soundOptions = firingSound.options;
            soundOptions.position = barrelPosition;
            soundOptions.volume = firingVolume;
            firingSound.options = soundOptions;

            var emitAcceleration = this.getRotatedEmitAcceleration();
            var emitRate = Math.random() * (EMIT_RATE_SPREAD * 2) + BASE_EMIT_RATE;
            var radiusFinish = this.getRadiusFinish();
            var particleRadius = this.getParticleRadius();
            Entities.editEntity(flameEntity, {
                emitAcceleration: emitAcceleration, 
                emitRate: emitRate,
                particleRadius: particleRadius,
                radiusFinish: radiusFinish
            });
            
            var nozzleLightIntensity = this.getNozzleLightIntensity();
            Entities.editEntity(nozzleLight, {intensity: nozzleLightIntensity});
        },
        
        stopFiring: function() {
            if (flameEntity !== null) {
                Entities.editEntity(flameEntity, {isEmitting: false});
            }
            if (nozzleLight !== null) {
                Entities.deleteEntity(nozzleLight);
                nozzleLight = null;
            }
            if (firingSound !== null) {
                firingSound.stop();
                firingSound = null;
            }
            isFiring = false;
            fireKeyPressed = false;
            endFireServerCall = null;
            endFireServerArgs = null;
        },
        
        addDesktopOverlay: function() {
            this.removeDesktopOverlay();
            
            if (currentHand === null || !DESKTOP_HOW_TO_OVERLAY) {
                return;
            }

            var showOverlay = true;
            var otherHandDesktopOverlay = this.getOtherHandDesktopOverlay();
            if (otherHandDesktopOverlay !== null) {
                desktopHowToOverlay = otherHandDesktopOverlay;
                showOverlay = false;    
            }
            
            if (showOverlay) {
                var viewport = Controller.getViewportDimensions();
                var windowHeight = viewport.y;
                desktopHowToOverlay = Overlays.addOverlay("image", {
                    imageURL: DESKTOP_HOW_TO_IMAGE_URL,
                    x: 0,
                    y: windowHeight - DESKTOP_HOW_TO_IMAGE_HEIGHT - 24,
                    width: DESKTOP_HOW_TO_IMAGE_WIDTH,
                    height: DESKTOP_HOW_TO_IMAGE_HEIGHT,
                    alpha: 1.0,
                    visible: true
                });
            }
            
            var userDataProperties = JSON.parse(Entities.getEntityProperties(this.entityID, 'userData').userData);
            userDataProperties.desktopHowToOverlay = desktopHowToOverlay;
            Entities.editEntity(this.entityID, { userData: JSON.stringify(userDataProperties) });
        },
        
        removeDesktopOverlay: function() {
            var otherHandDesktopOverlay = this.getOtherHandDesktopOverlay();
            if (desktopHowToOverlay !== null && otherHandDesktopOverlay === null) {
                Overlays.deleteOverlay(desktopHowToOverlay);
                desktopHowToOverlay = null;
            }
        },
        
        addMouseEquipAnimation: function() {
            this.removeMouseEquipAnimation();
            if (currentHand === HAND.LEFT) {
                mouseEquipAnimationHandler = MyAvatar.addAnimationStateHandler(this.leftHandMouseEquipAnimation, []);
            } else if (currentHand === HAND.RIGHT) {
                mouseEquipAnimationHandler = MyAvatar.addAnimationStateHandler(this.rightHandMouseEquipAnimation, []);
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
                offset = 0.8 * MyAvatar.getAbsoluteJointTranslationInObjectFrame(headIndex).y;
            }
            result.leftHandPosition = Vec3.multiply(offset, {x: 0.25, y: 0.8, z: 1.3});
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
            result.leftHandRotation = Quat.multiply(newRotation, Quat.fromPitchYawRollDegrees(110, 0, -90));
            
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
                offset = 0.8 * MyAvatar.getAbsoluteJointTranslationInObjectFrame(headIndex).y;
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
            result.rightHandRotation = Quat.multiply(newRotation, Quat.fromPitchYawRollDegrees(110, 0, 90));
            
            return result;
        },
        
        keyPressEvent: function(event) {
            if (event.text === FIRE_KEY) {
                fireKeyPressed = true;
            }
        },
        
        keyReleaseEvent: function(event) {
            if (event.text === FIRE_KEY) {
                fireKeyPressed = false;
            }
        },
        
        updateDebugFiring: function() {
            if (DEBUG_FIRING || fireKeyPressed) {
                _this.triggerFire();
            }
        },

        unload: function() {
            this.removeMouseEquipAnimation();
            this.stopFiring();
            this.removeDesktopOverlay();
            
            if (flameEntity !== null) {
                Entities.deleteEntity(flameEntity);
                flameEntity = null;
            }
            
            if (DEBUG_FIRING) {
                Script.update.disconnect(this.updateDebugFiring);
            } else if (notHomeCount > 0) {
                Script.update.disconnect(this.updateNotHome);
            }
        },

        preload: function(entityID) {
            this.entityID = entityID;
            previousHMDActive = HMD.active;
            
            var userDataProperties = JSON.parse(Entities.getEntityProperties(entityID, 'userData').userData);
            var userDataHomePosition = userDataProperties.homePosition;
            var userDataHomeRotation = userDataProperties.homeRotation;
            if (userDataHomePosition !== undefined) {
                var coordinates = userDataHomePosition.split(",");
                homePosition = { x:coordinates[0], y:coordinates[1], z:coordinates[2] };
            }
            if (userDataHomeRotation !== undefined) {
                var rotations = userDataHomeRotation.split(",");
                homeRotation = Quat.fromPitchYawRollDegrees(rotations[0], rotations[1], rotations[2]);
            }
            
            if (DEBUG_FIRING) {
                Script.update.connect(this.updateDebugFiring);
            }
            
            var clientOnly = true;
            flameEntity = Entities.addEntity({
                accelerationSpread: { x:1, y:1, z:1 },
                alpha: 0.4,
                alphaStart: 0.1,
                alphaFinish: 0.4,
                emitRate: BASE_EMIT_RATE,
                emitSpeed: 0,
                emitterShouldTrail: true,
                isEmitting: false,
                lifespan: 10,
                localPosition: BARREL_LOCAL_OFFSET,
                maxParticles: 500,
                name: "Flamethrower Flame",
                parentID: this.entityID,
                radiusSpread: 0.3,
                radiusStart: 0.05,
                speedSpread: 0,
                textures: RAINBOW_IMAGE,
                type: "ParticleEffect"
            }, clientOnly);
        }
    };

    return new Flamethrower();
});
