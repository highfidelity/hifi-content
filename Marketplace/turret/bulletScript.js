

(function() {


    var bulletID;
    const lifetime = 4; 
    const AVATAR_IN_RANGE_DISTANCE = 1;
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

    function clearProxCheck() {
        if (proxInterval) {
            Script.clearInterval(proxInterval);
            //Entities.deleteEntity(particleTrailEntity);
            //particleTrailEntity = null;
        }

        if (proxTimeout) {
            Script.clearTimeout(proxTimeout);
        }
    }

    function proxCheck() {
        var bulletPos = Entities.getEntityProperties(bulletID, ['position']).position;
        var isAnyAvatarInRange = AvatarList.isAvatarInRange(bulletPos, AVATAR_IN_RANGE_DISTANCE);

        if (isAnyAvatarInRange) {
            clearProxCheck();
            
            identifiers = AvatarList.getAvatarIdentifiers();
            //print ("Daantje Debug avatar ID length: " + identifiers.length);
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
                    // TODO SEND MESSAGE
                    print("Info: Sending Message - Avatar " + colliderUUID 
                        + " was hit by Bullet " + bulletUUID 
                        + " launched by Turret " + turretUUID
                        + "  dealing " + bulletDamage + " of damage."
                    );
                    sendHitMessage();
                }
            }

            explode();
        }
        
        var velocityMagnitude = Vec3.length(Entities.getEntityProperties(bulletID, ['velocity']).velocity);
        var adjustedVolume = (velocityMagnitude < 1 ? Math.LOG10E * Math.log(velocityMagnitude + 1) : 1);
        // update flight sound position
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
       
        // If in Smart Bullet mode rotates towards the player
        if (smartBullet && curTargetPos != null) {
            // velocity and rotation
            var newRotation = Quat.lookAt(bulletPos, curTargetPos, Quat.getUp(MyAvatar.orientation));
            var newBulletProps = {
                rotation: newRotation,
                velocity: Vec3.multiply(velocityMagnitude, Quat.getFront(newRotation))
            }
            Entities.editEntity(bulletID, newBulletProps);
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
        // TEMPORARY PARTICLE PARAMETERS ARE NOT BEING IMPORTED CORRECTELY
        var props = {
            type: 'ParticleEffect',
            name: 'Particle',
            parentID: bulletID,
            isEmitting: true,
            lifespan: 4.0,
            maxParticles: 100,
            textures: 'https://content.highfidelity.com/DomainContent/production/Particles/wispy-smoke.png',
            emitRate: 150,
            emitSpeed: 0,
            emitAcceleration: {
                x: 0,
                y: 0,
                z: 0
            },
            emitterShouldTrail: true,
            particleRadius: 0,
            radiusSpread: 0,
            radiusStart: 0.1,
            radiusFinish: 0.05,
            color: {
                red: 201,
                blue: 201,
                green: 34
            },
            accelerationSpread: {
                x: 0,
                y: 0,
                z: 0
            },
            alpha: 0,
            alphaSpread: 0,
            alphaStart: 1,
            alphaFinish: 0,
            polarStart: 0,
            polarFinish: 0,
            azimuthStart: -180,
            azimuthFinish: 180
        };

        var created = [];
        var success = Clipboard.importEntities(Script.resolvePath('assets/flightParticle.json'));
        if (success === true) {
            created = Clipboard.pasteEntities(Entities.getEntityProperties(bulletID, ['position']).position);
            particleTrailEntity = created[0];
            // TEMPORARY PARTICLE PARAMETERS ARE NOT BEING IMPORTED CORRECTELY
            Entities.editEntity(particleTrailEntity, props);
        }
        //Entities.editEntity(particleTrailEntity, {parentID: ""});
        //Clipboard.exportEntities(Script.resolvePath('assets/')+"particledaantje.json", [particleTrailEntity]);
        //ntities.editEntity(particleTrailEntity, {parentID: bulletID});
    }

    function particleExplode(entPos) {
        var props = {
            type: 'ParticleEffect',
            name: 'Particle',
            parentID: bulletID,
            isEmitting: true,
            lifespan: 2,
            maxParticles: 10,
            localPosition: {
                x: 0,
                y: 0,
                z: 0
            },
            textures: 'https://content.highfidelity.com/DomainContent/production/Particles/wispy-smoke.png',
            emitRate: 1,
            emitSpeed: 0,
            emitterShouldTrail: false,
            particleRadius: 1,
            radiusSpread: 0,
            radiusStart: 0,
            radiusFinish: 1,
            color: {
                red: 232,
                blue: 232,
                green: 26
            },
            emitAcceleration: {
                x: 0,
                y: 0,
                z: 0
            },
            alpha: 0,
            alphaSpread: 0,
            alphaStart: 1,
            alphaFinish: 0.5,
            polarStart: 0,
            polarFinish: 0,
            azimuthStart: -180,
            azimuthFinish: 180
        };
        explosionParticles = Entities.addEntity(props);
        return explosionParticles;
    }

    function explode() {
        var entPos = Entities.getEntityProperties(bulletID, 'position').position;
        
        flightSound.stop();
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
                volume: 1,
                loop: true
            });
        }
        
        Script.setTimeout(function () {
            proxInterval = Script.setInterval(proxCheck, 50);
        }, 200); // Setting a delay to give it time to leave initial avatar without proc.

        proxTimeout = Script.setTimeout(function () {
            clearProxCheck();
        }, 10000);

        Script.setTimeout(this.selfDestruct, lifetime*1000);

        // User Data processing
        var userData = getEntityUserData(entityID);
        smartBullet = userData["bulletData"].smartBullet;
        currentTarget = userData["bulletData"].target;
        bulletDamage = userData["bulletData"].damage;
        turretUUID = userData["bulletData"].turret;
    };

    this.collisionWithEntity = function (thisEntityID, collisionEntityID, collisionInfo) {

        print("Daantje Debug: COLLIDING" + JSON.stringify(collisionInfo));
        colliderUUID = collisionEntityID;
        sendHitMessage();

        explode();
    };

    this.unload = function() {
        print("Daantje Debug - Cleaning up! ");
        Entities.deleteEntity(particleTrailEntity);
    }
})