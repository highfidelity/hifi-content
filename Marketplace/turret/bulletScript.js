

(function() {


	var bulletID;
	const lifetime = 4;	

	var FLIGHT_SOUND = SoundCache.getSound(Script.resolvePath('assets/flightSound.wav'));
	var HIT_SOUND = SoundCache.getSound(Script.resolvePath('assets/hitSound.wav'));

	var proxInterval, proxTimeout;

	var particleTrailEntity = null;
	var explosionParticles = null;
	var flightSound;

	var currentTarget = null;
	var smartBullet = false;
	var damage = 1;



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
		var isAnyAvatarInRange = AvatarList.isAvatarInRange(bulletPos, 1);
	    //print("Daantje Debug: Checking! " + JSON.stringify(Vec3.distance(bulletPos, MyAvatar.position)));
	    //print("Daantje Debug: Checking Ball! " + JSON.stringify(bulletPos));
	    //print("Daantje Debug: Checking Avatar! " + JSON.stringify(MyAvatar.position));
	    if (isAnyAvatarInRange) {
	    	clearProxCheck();
	        //TODO
	        explode();
	    }
        
        //print("Daantje Debug velocity of bullet> " + JSON.stringify(Entities.getEntityProperties(bulletID, ['velocity']).velocity));
        //print("Daantje Debug velocity of bullet total > " + JSON.stringify(Vec3.length(Entities.getEntityProperties(bulletID, ['velocity']).velocity)));
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
        } else {
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
	        print('created ' + created);
	        particleTrailEntity = created[0];
	        // TEMPORARY PARTICLE PARAMETERS ARE NOT BEING IMPORTED CORRECTELY
	        Entities.editEntity(particleTrailEntity, props);
	        //print(JSON.stringify(Entities.getEntityProperties(particleTrailEntity).parentID));
	    }
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
       
        if (particleTrailEntity === null) {
            particleTrail();
            flightSound = Audio.playSound(FLIGHT_SOUND, {
	            position: Entities.getEntityProperties(bulletID, 'position').position,
	            volume: 1,
	            loop: true
	        });
        }
        print("Daantje Debug: HERE");

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
        damage = userData["bulletData"].damage;
        //print( "Info: check bulletData " + JSON.stringify(userData["bulletData"]) );
    };

    this.collisionWithEntity = function (thisEntityID, collisionEntityID, collisionInfo) {

    	print("Daantje Debug: COLLIDING" + JSON.stringify(collisionInfo));
    	
    	explode();
    };

    this.unload = function() {
    	print("Daantje Debug - Cleaning up! ");
    	Entities.deleteEntity(particleTrailEntity);
    }


})