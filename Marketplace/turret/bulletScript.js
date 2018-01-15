//
//  Created by Daniela Fontes & Thomas Papa (Mimicry) on 12/18/2017
//  Copyright 2017 High Fidelity, Inc.
//
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var bulletID;
    const lifetime = 4; 
    const AVATAR_IN_RANGE_DISTANCE = 0.7;
    const ENTITY_IN_RANGE_DISTANCE = 0.2;
    const MESSAGE_CHANNEL = "Turret-Bullet-Hit";

    var FLIGHT_SOUND = SoundCache.getSound(Script.resolvePath('assets/flightSound.wav'));
    var HIT_SOUND = SoundCache.getSound(Script.resolvePath('assets/hitSound.wav'));

    var proxInterval, proxTimeout;

    var particleTrailEntity = null;
    var explosionParticles = null;
    var flightSound;

    var currentTarget = null;
    var smartBullet = false;

    // Message system
    var bulletDamage = 1;
    var bulletUUID;
    var colliderUUID;
    var turretUUID;

    SCRIPT_PATH = Script.resolvePath('');
    CONTENT_PATH = SCRIPT_PATH.substr(0, SCRIPT_PATH.lastIndexOf('/'));

    var accumulatedTime = 0.0;
    
    getEntityUserData = function(id) {
        var results = null;
        var properties = Entities.getEntityProperties(id, "userData");
        if (properties.userData) {
            try {
                results = JSON.parse(properties.userData);
            } catch(err) {
                logDebug(err);
                logDebug(properties.userData);
            }
        }
        return results ? results : {};
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function clearProxCheck() {
        if (proxInterval) {
            Script.clearInterval(proxInterval);
        }
        if (proxTimeout) {
            Script.clearTimeout(proxTimeout);
        }
    }

    function proxCheck() {
        accumulatedTime += 50;
        var bulletPos = Entities.getEntityProperties(bulletID, ['position']).position;
        var isAnyAvatarInRange = AvatarList.isAvatarInRange(bulletPos, AVATAR_IN_RANGE_DISTANCE);
  
        if (isAnyAvatarInRange) {
            clearProxCheck();
            
            identifiers = AvatarList.getAvatarIdentifiers();
            for (var i = 0; i < identifiers.length; i++) {
                var avatarID = identifiers[i];
                // get the position for this avatar
                var avatar = AvatarList.getAvatar(avatarID);

                var avatarPosition = avatar && avatar.position;
                if (avatarID === null) {
                    avatar = MyAvatar.sessionUUID ;
                    avatarID = MyAvatar.sessionUUID ;
                    avatarPosition = MyAvatar.position;
                } else {
                    avatar = AvatarList.getAvatar(avatarID);
                    avatarPosition = avatar && avatar.position;
                }
                if (!avatarPosition) {
                    continue;
                }
                
                if ((Vec3.distance(avatarPosition, bulletPos) < AVATAR_IN_RANGE_DISTANCE)) {
                    colliderUUID = avatarID;
                    // send message
                    sendHitMessage();
                }
            }
            explode();
        } else {
            scanForEntityCollisionWithRayPicks(bulletPos);
        }

        var velocityMagnitude = Vec3.length(Entities.getEntityProperties(bulletID, ['velocity']).velocity);
        var adjustedVolume = (velocityMagnitude < 1 ? Math.LOG10E * Math.log(velocityMagnitude + 1) : 1);
        // update flight sound position and volume
        flightSound.options = { 
            position: bulletPos,
            volume: adjustedVolume
        };
        
        var curTargetPos = null ;

        if (currentTarget == MyAvatar.sessionUUID) {
            curTargetPos = MyAvatar.position;
        } else if (currentTarget != null) {
            curTargetPos = currentTarget.position;
        }
       
        // if in Smart Bullet mode: rotates towards the player
        if (smartBullet && curTargetPos != null && accumulatedTime > 200) {
            // velocity and rotation
            var newRotation = Quat.lookAt(bulletPos, curTargetPos, Quat.getUp(MyAvatar.orientation));
            var newBulletProps = {
                rotation: Quat.multiply(newRotation, Quat.fromPitchYawRollDegrees(0, 180, 0)),
                velocity: Vec3.multiply(velocityMagnitude, Quat.getFront(newRotation))
            }
            Entities.editEntity(bulletID, newBulletProps);
        }
        
    }

    function hitEntity(hitID) {
        clearProxCheck();
        var newBulletProps = {
            gravity: {
                x: 0,
                y: 0,
                z: 0
            },
            velocity: {
                x: 0,
                y: 0,
                z: 0
            }
        }
        Entities.editEntity(bulletID, newBulletProps);
        colliderUUID = hitID;
        sendHitMessage();
        explode();
    }

    function scanForEntityCollisionWithRayPicks(bulletPos) {
        
        var bulletDirection = Entities.getEntityProperties(bulletID, ['velocity']).velocity;

        var pickRay = {
            origin: bulletPos,
            direction: bulletDirection
        };

        var intersection = Entities.findRayIntersection(pickRay, true);
        if (intersection.distance < ENTITY_IN_RANGE_DISTANCE 
            && intersection.entityID != bulletID 
            && intersection.entityID != turretUUID 
            && intersection.entityID != particleTrailEntity ) {
            hitEntity(intersection.entityID);
            return;
        }

        // Scan 4 corners of the bounding box

        var halfDimensions = Vec3.multiply(0.5, Entities.getEntityProperties(bulletID, ['dimensions']).dimensions);
        var top = Quat.getUp(Entities.getEntityProperties(bulletID, ['rotation']).rotation);
        var right = Quat.getRight(Entities.getEntityProperties(bulletID, ['rotation']).rotation);
        
        top = Vec3.multiplyVbyV(halfDimensions, top);
        right = Vec3.multiplyVbyV(halfDimensions, right);

        var pickRayTopRight = {
            origin: Vec3.sum(Vec3.sum(bulletPos, top), right),
            direction: bulletDirection
        };
        intersection = Entities.findRayIntersection(pickRayTopRight, true);
        if (intersection.distance < ENTITY_IN_RANGE_DISTANCE 
            && intersection.entityID != bulletID
            && intersection.entityID != turretUUID  
            && intersection.entityID != particleTrailEntity ) {
            hitEntity(intersection.entityID);
            return;
        }


        var pickRayTopLeft = {
            origin: Vec3.sum(Vec3.sum(bulletPos, top), Vec3.multiply(-1, right)),
            direction: bulletDirection
        };
        intersection = Entities.findRayIntersection(pickRayTopLeft, true);
        if (intersection.distance < ENTITY_IN_RANGE_DISTANCE 
            && intersection.entityID != bulletID
            && intersection.entityID != turretUUID 
            && intersection.entityID != particleTrailEntity ) {
            hitEntity(intersection.entityID);
            return;
        }


        var pickRayBotomRight = {
            origin: Vec3.sum(Vec3.sum(bulletPos, Vec3.multiply(-1, top)), right),
            direction: bulletDirection
        };
        intersection = Entities.findRayIntersection(pickRayBotomRight, true);
        if (intersection.distance < ENTITY_IN_RANGE_DISTANCE 
            && intersection.entityID != bulletID
            && intersection.entityID != turretUUID 
            && intersection.entityID != particleTrailEntity ) {
            hitEntity(intersection.entityID);
            return;
        }

        var pickRayBotomLeft = {
            origin: Vec3.sum(Vec3.sum(bulletPos, Vec3.multiply(-1, top)), Vec3.multiply(-1, right)),
            direction: bulletDirection
        };
        intersection = Entities.findRayIntersection(pickRayBotomLeft, true);
        if (intersection.distance < ENTITY_IN_RANGE_DISTANCE 
            && intersection.entityID != bulletID
            && intersection.entityID != turretUUID 
            && intersection.entityID != particleTrailEntity ) { 
            hitEntity(intersection.entityID);
            return;
        }
    
    }

    function sendHitMessage() {
        // hitMessage - he name of a function to call on the entity it hits.
        Messages.sendMessage(MESSAGE_CHANNEL, JSON.stringify({
            type: "turret-bullet-hit",
            colliderUUID: colliderUUID,
            turretUUID: turretUUID,
            bulletID: bulletID,
            bulletDamage: bulletDamage        
        }));
    }

    function particleTrail() {
        // TEMPORARY PARTICLE PARAMETERS ARE NOT BEING IMPORTED CORRECTELY FROM JSON
        
        var props = {
            type: 'ParticleEffect',
            name: 'Particle',
            parentID: bulletID,
            isEmitting: true,
            lifespan: 1,
            maxParticles: 250,
            textures: CONTENT_PATH + "/assets/speed/cloud.png",
            emitRate: 10,
            emitSpeed: 0,
            emitAcceleration: {
                x: 0,
                y: 0,
                z: 0
            },
            emitterShouldTrail: true,
            particleRadius: 0.05,
            radiusSpread: 0,
            radiusStart: 0.1,
            radiusFinish: 0.0,
            color: {
                red: 255,
                blue: 255,
                green: 255
            },
            accelerationSpread: {
                x: 0,
                y: 0,
                z: 0
            },
            alpha: 1,
            emitOrientation: {"x":0,"y":0,"z":0},
            alphaSpread: 1,
            alphaStart: 1,
            alphaFinish: 0.0,
            polarStart: 0,
            polarFinish: 0,
            azimuthStart: -180,
            azimuthFinish: -180,
            position: Vec3.sum(Entities.getEntityProperties(bulletID, ['position']).position, 
                Vec3.multiply(0.3, Quat.getFront(Entities.getEntityProperties(bulletID, ['rotation']).rotation))),
            rotation: Entities.getEntityProperties(bulletID, ['rotation']).rotation
        };

        //var created = [];
        //var success = Clipboard.importEntities(Script.resolvePath('assets/flightParticle.json'));
        //if (success === true) {
            //created = Clipboard.pasteEntities(Entities.getEntityProperties(bulletID, ['position']).position);
            //particleTrailEntity = created[0];
            // TEMPORARY PARTICLE PARAMETERS ARE NOT BEING IMPORTED CORRECTELY
            //Entities.editEntity(particleTrailEntity, props);    
        // }
        particleTrailEntity = Entities.addEntity(props);
    }

    function particleExplode(entPos) {
        var props = {
            type: 'ParticleEffect',
            name: 'Particle',
            parentID: bulletID,
            isEmitting: true,
            lifespan: 3,
            lifetime: 3,
            maxParticles: 1,
            textures: CONTENT_PATH + "/assets/impact/impact" + getRandomInt(1, 8) + ".png",
            emitRate: 1,
            emitSpeed: 0,
            emitDimensions: {"x":0,"y":0,"z":0},
            emitOrientation: {"x":-90,"y":0,"z":0},
            emitterShouldTrail: false,
            particleRadius: 1.5,
            radiusSpread: 0,
            radiusStart: 0.2,
            radiusFinish: 5,
            color: {"red":255,"blue":255,"green":255},
            colorSpread: {"red":255,"blue":255,"green":255},
            colorStart: {"red":255,"blue":255,"green":255},
            colorFinish: {"red":255,"blue":255,"green":255},
            emitAcceleration: {"x":0.0,"y":0.0,"z":0.0},
            accelerationSpread: {"x":0,"y":0,"z":0},
            alpha: 0.5,
            alphaSpread: 0,
            alphaStart: 1,
            alphaFinish: 0.5,
            polarStart: 0,
            polarFinish: 0,
            azimuthStart: -180.00000500895632,
            azimuthFinish: 180.00000500895632,
            position: Vec3.sum(
                Entities.getEntityProperties(bulletID, ['position']).position, 
                Vec3.multiply(
                    -0.3, 
                    Quat.getFront(Entities.getEntityProperties(bulletID, ['rotation']).rotation
                ))
            )
            
        };
        explosionParticles = Entities.addEntity(props);
        return explosionParticles;
    }

    function explode() {
        var entPos = Entities.getEntityProperties(bulletID, 'position').position;
        
        flightSound.stop();
        var newBulletProps = {
            gravity: {
                x: 0,
                y: 0,
                z: 0
            },
            velocity: {
                x: 0,
                y: 0,
                z: 0
            }
        }
        Entities.editEntity(bulletID, newBulletProps);
        particleExplode(entPos);

        Script.setTimeout(function () {
            Entities.deleteEntity(explosionParticles);
            Entities.deleteEntity(bulletID);
        }, 500);

        Audio.playSound(HIT_SOUND, {
            position: entPos,
            volume: 1
        });
    }

    this.selfDestruct = function() {
        clearProxCheck();
        explode();
    }

    this.preload = function(entityID) {
        this.entityID = entityID;
        bulletID = entityID;
        bulletUUID = entityID;
       
        if (particleTrailEntity === null) {
            particleTrail();
            flightSound = Audio.playSound(FLIGHT_SOUND, {
                position: Entities.getEntityProperties(bulletID, 'position').position,
                volume: 0.5,
                loop: true
            });
        }
        
        Script.setTimeout(function () {
            proxInterval = Script.setInterval(proxCheck, 50);
        }, 200);

        proxTimeout = Script.setTimeout(function () {
            clearProxCheck();
        }, 10000);
        
        // Self destruct function allows to destroy the bullet with an explosion
        //Script.setTimeout(this.selfDestruct, lifetime*1000);

        // User Data processing
        var userData = getEntityUserData(entityID);
        smartBullet = userData["bulletData"].smartBullet;
        currentTarget = userData["bulletData"].target;
        bulletDamage = userData["bulletData"].damage;
        turretUUID = userData["bulletData"].turret;
    };

    this.unload = function() {
        print("Daantje Debug - Cleaning up! ");
        Entities.deleteEntity(particleTrailEntity);
    }
})