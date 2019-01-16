(function(){

    // Helper Functions
    // ////////////////////////////////////////////////////////////////////////
        var

        ;
    // Procedural Functions
    // ////////////////////////////////////////////////////////////////////////

        function startParty(){
            log("Starting Party");

            currentPosition = Entities.getEntityProperties(_entityID, ["position"]).position;
            log("current position", currentPosition);

            var START_TIME = 500;
            createSmoke();
            SFX.updatePosition(currentPosition);
            SFX.playRandom();
            Script.setTimeout(function(){
                // Music.updatePosition(currentPosition);
                // Music.playRandom();
                Lights.create(currentPosition);
                Particles.create(currentPosition);
                // Dancers.create(currentPosition);
            }, START_TIME);

            var randomDurationTime = randomInt(MIN_DURATION_TIME, MAX_DURATION_TIME);
            // var randomDurationTime = 60000;

            log("randomDuration", randomDurationTime);

            Script.setTimeout(function(){
                log("Deleting Entities");
                createSmoke();
                SFX.playRandom();
                Music.stop();
                Lights.destroy();
                Particles.destory();
                Dancers.destroy();
                
                explodeTimer = false;
                log("Reseting Ball");
                Entities.deleteEntity(_entityID);
            }, randomDurationTime);
        }

        // Start the timer for things to happen
        function startTimer(){
            log("inside start Timer");
            if (explodeTimer) {
                log("returning from Explode");
                return;
            }
            var randomTimeToExplode = randomInt(MIN_START_TIME, MAX_START_TIME);
            log("starting explode timer");
            explodeTimer = Script.setTimeout(function(){
                log("About to explode");
                Entities.editEntity(_entityID, {
                    gravity: vec(0, 0, 0),
                    angularVelocity: vec(0,0,0),
                    velocity: vec(0,0,0),
                    dynamic: false,
                    visible: false,
                    rotation: Quat.IDENTITY
                }); 
                log("starting party");
                startParty();
            }, randomTimeToExplode);
        } 

        function createSmoke(position) {
            var splat = Entities.addEntity({
                "type":"ParticleEffect",
                "name": "Suprise-Smoke",
                "parentID": _entityID,
                "position": position,
                "collisionless":1,
                "dynamic":0,
                "isEmitting": true,
                "lifespan": "1.62",
                "maxParticles": "520",
                "textures": "http://hifi-content.s3.amazonaws.com/alan/dev/Particles/Bokeh-Particle.png",
                "emitRate": "622",
                "emitSpeed": "0.7",
                "speedSpread": "1.43",
                "emitDimensions": {
                    "x": "10",
                    "y": "10",
                    "z": ""
                },
                "emitOrientation": {
                    "x": "270",
                    "y": "0",
                    "z": ""
                },
                "emitterShouldTrail": true,
                "particleRadius": "0.75",
                "radiusSpread": "0.5",
                "radiusStart": "0.21",
                "radiusFinish": "0",
                "color": {
                    "red": "171",
                    "blue": "171",
                    "green": "171"
                },
                "colorSpread": {
                    "red": "0",
                    "blue": "0",
                    "green": "0"
                },
                "colorStart": {
                    "red": "255",
                    "blue": "255",
                    "green": "255"
                },
                "colorFinish": {
                    "red": "255",
                    "blue": "255",
                    "green": "255"
                },
                "emitAcceleration": {
                    "x": "0",
                    "y": "4",
                    "z": "0"
                },
                "accelerationSpread": {
                    "x": "0",
                    "y": "4",
                    "z": "0"
                },
                "alpha": "1",
                "alphaSpread": "0",
                "alphaStart": "1",
                "alphaFinish": "0",
                "particleSpin": 1.6231562043547265,
                "spinSpread": 0,
                "spinStart": 1.6231562043547265,
                "spinFinish": 1.6231562043547265,
                "rotateWithEntity": false,
                "polarStart": 0,
                "polarFinish": 0.10471975511965978,
                "azimuthStart": -3.141592653589793,
                "azimuthFinish": 3.141592653589793
            });

            Script.setTimeout(function() {
                Entities.deleteEntity(splat);
            }, SMOKE_TIME); 
        }

    // Entity Definition
    // ////////////////////////////////////////////////////////////////////////
        
        function SupriseBall(){
        }

        SupriseBall.prototype = {
            remotelyCallable: [
                "startTimer"
            ],
            preload: function(entityID){
                log("preload");
                _entityID = entityID;

                Particles.registerEntity(_entityID);
                Dancers.registerEntity(_entityID);

                Entities.editEntity(entityID, {
                    gravity: vec(0, GRAVITY, 0),
                    dynamic: true,
                    rotation: Quat.IDENTITY,
                    visible: true
                });

                musicCollection.forEach(function(sound){
                    Music.addSound(sound);
                });

                sfxCollection.forEach(function(sound){
                    SFX.addSound(sound);
                });

            },

            startTimer: function(){
                log("startTimer called");
                if (canStartTimer) {
                    startTimer();
                    canStartTimer = false;
                }
            },

            unload: function(){
                log("running unload");

                explodeTimer && Script.clearInterval(explodeTimer);
            }
        };

        return new SupriseBall();

});
