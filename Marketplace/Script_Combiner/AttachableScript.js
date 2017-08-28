(function() {

    var _this = this;
    //used to see if entities touched each other 
    var entitiesTouched = true;
    //used to see if entites are being held together
    var entitiesTogether;
    //particle effect
    var MAKING_CONNECTION_PARTICLE_PROPS;
    //positions of both objects will be stored
    var posA;
    var posB;
    //Sounds
    var COMBINING_SOUND_URL = "https://s3-us-west-1.amazonaws.com/hifi-content/davidkelly/production/audio/4beat_sweep.wav";
    var SUCCESSFUL_COMBINING_SOUND_URL = "https://s3-us-west-1.amazonaws.com/hifi-content/davidkelly/production/audio/3rdbeat_success_bell.wav";
    //Variables to hold sounds
    var combiningInjector;
    var successfulCombiningInjector;
    //particle effect holder
    var particles;
    
    _this.preload = function(entityID) {
        _this.entityID = entityID;
        var props = Entities.getEntityProperties(entityID);
        print("Loading attachable script properties");
    }

    function stopCombiningSound() {
        combiningInjector.stop();
        combiningInjector = null;
    }

    _this.collisionWithEntity = function(idA, idB, collision) {
        print("Entering entity!!!");
        //returns a string of all userdata properties
        var check1 = Entities.getEntityProperties(idB).userData;
        print(Entities.getEntityProperties(idA).dynamic);
        var isDynamic = 1;
        //Checks to see if its a receiveable object and makes sure its not the stationary model with a dynamic check
        if ((JSON.parse(check1).canReceiveScripts == true) && 
            (isDynamic == Entities.getEntityProperties(idA).dynamic) && 
            (isDynamic == Entities.getEntityProperties(idB).dynamic)) {
            //Get position of both objects then make particle effect 
            //play around them by finding midpoint between the two
            posA = Entities.getEntityProperties(idA).position;
            posB = Entities.getEntityProperties(idB).position;
            var x1 = (posA.x + posB.x) / 2;
            var y1 = (posA.y + posB.y) / 2;
            var z1 = (posA.z + posB.z) / 2;
            var particlePosition = {
                x: x1,
                y: y1,
                z: z1
            };
        
            //makes sure only one particle effect appears at a time
            if (entitiesTouched == true) {
                entitiesTouched = false;
                //starts particle animation. Gives it a little time to play so you can know it didnt work if you separate them
                playJoiningParticleEffect(particlePosition, idA);
                
                //Play combining music
                if (!combiningInjector) {
                    combiningInjector = Audio.playSound(combiningSound, {
                    position: MyAvatar.position,
                    volume: 0.8,
                    localOnly: true
                });
                } else {
                    combiningInjector.restart();
                }

                //this checks to see if distance between objects has grown. 
                //basically if hands are apart so you can stop the animation
                var counter = 0;
                var isValidDistance = Script.setInterval(function() {
                    //gets distance between the two objects to make sure theyre hands
                    //are together or at least close. Need to get positions again
                    //because entities could have moved
                    posA = Entities.getEntityProperties(idA).position;
                    posB = Entities.getEntityProperties(idB).position;
                    var distance = getDistance(posA, posB);

                    //made 25 so that all together its 3 seconds (counting the prevois 500 miliseconds) 
                    //which is the animation length
                    if (counter === 5) {
                        //attach Float script to other entity
                        AttachScript(idA, idB);

                        //stop laoding sound
                        stopCombiningSound();

                        //Play success music
                        if (!successfulCombiningInjector) {
                            successfulCombiningInjector = Audio.playSound(successfulCombiningSound, {
                            position: particlePosition,
                            volume: 0.8,
                            localOnly: true
                        });
                        } else {
                            successfulCombiningInjector.restart();
                        }
                        //exit interval
                        Script.clearInterval(isValidDistance);
                    //if the player separates their arms you delete the animation and reset
                    } else if (distance > .25) {
                        print("transfer of scripts have been cancelled");
                        Entities.deleteEntity(particles);
                        //print(MAKING_CONNECTION_PARTICLE_PROPS.entityID);
                        entitiesTouched = true;
                        counter = 0;
                        stopCombiningSound();
                        Script.clearInterval(isValidDistance);
                    } else {
                        counter++;
                    }
                }, 200)
            }
        } else {
            print("Entity not script receivable");
        }
    }

    function AttachScript(idA, idB) {
        print("Adding script to other object");
        var data = Entities.getEntityProperties(idA).userData;
        //get name of script        
        print(JSON.parse(data).scriptURL);
        var scriptName = JSON.parse(data).scriptURL;
        //delete adding object
        Entities.deleteEntity(idA);
        //add script
        var addScriptProperty = {"script": scriptName}; 
        Entities.editEntity(idB, addScriptProperty);
    }

    function getDistance(pointA, pointB) {
        var dx = pointB.x - pointA.x;
        var dy = pointB.y - pointA.y;
        var dz = pointB.z - pointA.z;
        var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));
        return dist;
    }

    function playJoiningParticleEffect(pos, idA) {
        print("creating particle effect");
        MAKING_CONNECTION_PARTICLE_PROPS = {
            position: pos,
            parentID: idA,      
            "alpha": 0.07,
            "alphaStart": 0.011,
            "alphaSpread": 0,
            "alphaFinish": 0,
            "azimuthFinish": Math.PI,
            "azimuthStart": -1 * Math.PI,
            "emitRate": 3000,
            "emitSpeed": 0.0,
            "emitterShouldTrail": 1,
            "isEmitting": 1,
            "lifespan": 2.0,
            "maxParticles": 4000,
            "particleRadius": 0.2,
            "polarStart": 0,
            "polarFinish": 1,
            "radiusFinish": 0.3,
            "radiusStart": 0.04,
            "speedSpread": 0.03,
            "radiusSpread": 0.9,
            "textures": "http://hifi-content.s3.amazonaws.com/alan/dev/Particles/Bokeh-Particle.png",
            "color": {"red": 200, "green": 170, "blue": 255},
            "colorFinish": {"red": 0, "green": 134, "blue": 255},
            "colorStart": {"red": 185, "green": 222, "blue": 255},
            "emitOrientation": {"w": -0.71, "x": 0.0, "y": 0.0, "z": 0.71},
            "emitAcceleration": {"x": 0.0, "y": 0.0, "z": 0.0},
            "accelerationSpread": {"x": 0.0, "y": 0.0, "z": 0.0},
            "dimensions": {"x": 0.05, "y": 0.05, "z": 0.05},
            "type": "ParticleEffect",
            "lifetime": 3  //particle last for 3 seconds
        };
        particles = Entities.addEntity(MAKING_CONNECTION_PARTICLE_PROPS);
        print("particle ID: " + particles);
    }

    // load the sounds when the script loads
    combiningSound = SoundCache.getSound(COMBINING_SOUND_URL);
    successfulCombiningSound = SoundCache.getSound(SUCCESSFUL_COMBINING_SOUND_URL);
})
