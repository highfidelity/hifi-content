(function(){
    /* eslint-disable indent */

    // Notes
    // ////////////////////////////////////////////////////////////////////////
        /*
            Things Needed:

                1. Check if ball is equiped
                2. Random Timer for when it goes off
                3. Particle Effects (possibly use the particle animation system)
                4. Light Show
                5. Shape Explosion
                6. Each effect is a Type
                7. Random Amount of Types used
                8. Function to combine the types
                9. Function to run everything

            Things to Test:

                1. Which works, release or grab?

            Nice to Have Ideas:
                1. Ball changes color as it's about to explode
                2. Smoke Particles
                3. Ball Break apart pieces ( similar to the plates breaking )
                4. Custom Made Music
            TODO:
                1. Better Smoke Particles
    
        */
    // Init
    // ////////////////////////////////////////////////////////////////////////

        var
            _that,
            _entityID,
            _entityProperties,
            explodeTestID,
            originalRotation,
            canStartTimer,
            explodeTimer = false
        ;
    
    // Consts
    // ////////////////////////////////////////////////////////////////////////

        var
            MILISECONDS = 1000,
            GRAVITY = -9.8,
            MIN_START_TIME = 1 * MILISECONDS,
            MAX_START_TIME = 5 * MILISECONDS,

            MIN_DURATION_TIME = 1 * MILISECONDS,
            MAX_DURATION_TIME = 5 * MILISECONDS,

            TIME_TILL_DELETE = 3 * MILISECONDS,
            SMOKE_TIME = 0.85 * MILISECONDS
        ;

    // Collections
    // ////////////////////////////////////////////////////////////////////////
            var
                smokeParticleProperties,

                musicCollection = [
                    Script.resolvePath("./Sounds/Music/03B_Eww Baby_INST.mp3")
                ],
                Lights = new LightMaker(),
                Particles = {},
                FBX_Animations = {},
                Images = {},
                Text = {},
                Sounds = new SoundArray()
            ;

    // Constructors
    // ////////////////////////////////////////////////////////////////////////
    // Object Definitions
    // ////////////////////////////////////////////////////////////////////////
    

    // Helper Functions
    // ////////////////////////////////////////////////////////////////////////
        function log(label, value, isActive) {
            isActive = isActive || true;
            if (!isActive) {
                return;
            }
            print("\n" + label + "\n" + "***************************************\n", JSON.stringify(value));
        }

        function randomFloat (low, high) {
                return low + Math.random() * (high - low);
        }
            
            
        function randomInt(low, high) {
            return Math.floor(randomFloat(low, high));
        }

        function vec(x, y, z) {
            var obj = {};
            obj.x = x;
            obj.y = y;
            obj.z = z;
            return obj;
        }

        function SoundArray(audioOptions, autoUpdateAudioPosition) {
            this.audioOptions = audioOptions !== undefined ? audioOptions : {};
            this.autoUpdateAudioPosition = autoUpdateAudioPosition !== undefined ? autoUpdateAudioPosition : false;
            if (this.audioOptions.position === undefined) {
                this.audioOptions.position = Vec3.sum(MyAvatar.position, { x: 0, y: 1, z: 0});
            }
            if (this.audioOptions.volume === undefined) {
                this.audioOptions.volume = 1.0;
            }
            this.injector = null;
            this.sounds = new Array();
            this.addSound = function (soundURL) {
                this.sounds[this.sounds.length] = SoundCache.getSound(soundURL);
            };
            this.play = function (index) {
                if (0 <= index && index < this.sounds.length) {
                    if (this.autoUpdateAudioPosition) {
                        this.updateAudioPosition();
                    }
                    if (this.sounds[index].downloaded) {
                        this.injector = Audio.playSound(this.sounds[index], this.audioOptions);
                    }
                } else {
                    print("[ERROR] libraries/soundArray.js:play() : Index " + index + " out of range.");
                }
            };
            this.playRandom = function () {
                if (this.sounds.length > 0) {
                    this.play(Math.floor(Math.random() * this.sounds.length));
                } else {
                    print("[ERROR] libraries/soundArray.js:playRandom() : Array is empty.");
                }
            };
            this.updateAudioPosition = function() {
                var position = MyAvatar.position;
                var forwardVector = Quat.getForward(MyAvatar.orientation);
                this.audioOptions.position = Vec3.sum(position, forwardVector);
            };
            this.stop = function() {
                this.injector.stop();
            };
        }

        function LightMaker(position){
            this.box = null;
            this.lights = [];
            this.spotLight = null;
            this.lightProps = {
                name: "Suprise lights",
                type: "Light",
                position: position,
                dimensions: {
                    x: 10,
                    y: 10,
                    z: 10
                },
                angularDamping: 0,
                color:{red: 255,
                    blue: 255,
                    green: 255
                },
                intensity: 1000,
                falloffRadius: 0,
                isSpotlight: 0,
                exponent: 1,
                cutoff: 10,
                collisionless: true,
                userData: "{ \"grabbableKey\": { \"grabbable\": false} }",
                parentID: this.box
            };
            this.create = function(){
                this.makeBox();
                this.makeLights();
            };
            this.makeBox = function() {
                this.box = Entities.addEntity({
                    name: "Spot Light",
                    type: "Box",
                    position: position,
                    dimensions: {
                        x: 0.35,
                        y: 0.35,
                        z: 0.35
                    },
                    angularDamping: 0,
                    friction: 0,
                    color:{
                        red: 100,
                        blue: 0,
                        green: 0
                    },
                    visible: true
                });
            };
            this.makeLights = function() {
                this.lightProps.isSpotlight = 0;
                this.spotLight = Entities.addEntity(this.lightProps);
    
                this.lightProps.isSpotlight = 1;
                this.lightProps.rotation = Quat.fromPitchYawRollDegrees(90,0,0);
                this.lights.push(Entities.addEntity(this.lightProps));
    
                this.lightProps.isSpotlight = 1;
                this.lightProps.rotation = Quat.fromPitchYawRollDegrees(180,0,0);
                this.lights.push(Entities.addEntity(this.lightProps));
    
                this.lightProps.isSpotlight = 1;
                this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,90,0);
                this.lights.push(Entities.addEntity(this.lightProps));
    
                // this.lightProps.isSpotlight = 1;
                // this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,-90,0);
                // this.lights.push(Entities.addEntity(this.lightProps));
    
                this.lightProps.isSpotlight = 1;
                this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,0,0);
                this.lights.push(Entities.addEntity(this.lightProps));
    
                this.lightProps.isSpotlight = 1;
                this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,0,180);
                this.lights.push(Entities.addEntity(this.lightProps));
            };
            this.destroy = function() {
                Entities.deleteEntity(this.box);
            };
        }

    // Procedural Functions
    // ////////////////////////////////////////////////////////////////////////

        function explodeTest(){
            log("Starting Explode Test");

            var currentPosition = Entities.getEntityProperties(_entityID, ["position"]);
            createSmoke();
            Sounds.playRandom();
            Lights.create(currentPosition);

            explodeTestID = Entities.addEntity({
                type: "Text",
                text: "THIS HAS EXPLODE",
                name: "Explode Test",
                dimensions: vec(1,1,1),
                parentID: _entityID,
                localPosition: vec(0,1,0)
            });
            
            var randomDurationTime = randomInt(MIN_DURATION_TIME, MAX_DURATION_TIME);

            Script.setTimeout(function(){
                log("Deleting Entities", explodeTestID);
                Entities.deleteEntity(explodeTestID);
                Sounds.stop();
                Lights.destroy();

                log("Reseting Ball");
                Entities.editEntity(_entityID, {
                    gravity: vec(0, GRAVITY, 0),
                    velocity: vec(0, -3, 0),
                    dynamic: true,
                    visible: true
                }); 
            }, 30000);
        }
        
        // Start the timer for things to happen
        function startTimer(){
            if (explodeTimer) {
                Script.clearTimeout(explodeTimer);
            }
            var randomTimeToExplode = randomInt(MIN_START_TIME, MAX_START_TIME);
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
                explodeTest();
            }, randomTimeToExplode);
        } 

        function createSmoke(position) {
            var splat = Entities.addEntity({
                "type":"ParticleEffect",
                "parentID": _entityID,
                "position": position,
                "collisionless":1,
                "dynamic":0,
                "isEmitting": true,
                "lifespan": "1.62",
                "maxParticles": "520",
                "textures": "http://hifi-content.s3.amazonaws.com/alan/dev/Particles/Bokeh-Particle.png",
                "emitRate": "622",
                "emitSpeed": "0.05",
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
                "particleRadius": "0",
                "radiusSpread": "0",
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
            })

            Script.setTimeout(function() {
                Entities.deleteEntity(splat);
            }, SMOKE_TIME); 
        }

    // Entity Definition
    // ////////////////////////////////////////////////////////////////////////
        
        function SupriseBall(){
            _that = this;
        }

        SupriseBall.prototype = {
            preload: function(entityID){
                log("preload");
                _entityID = entityID;

                _entityProperties = Entities.getEntityProperties(_entityID, ["rotation"]);

                Entities.editEntity(entityID, {
                    gravity: vec(0, GRAVITY, 0),
                    dynamic: true,
                    rotation: Quat.IDENTITY,
                    visible: true
                    // userData: JSON.stringify(userData)
                });

                musicCollection.forEach(function(sound){
                    Sounds.addSound(sound);
                });

            },

            startNearGrab: function(){
                log("startNearGrab");
                var actionsIds = Entities.getActionIDs(_entityID);
                log("actionIds", actionsIds);
            },

            continueNearGrab: function(id, hand){
                canStartTimer = true;
            },

            startFarGrab: function(){
                log("startFarGrab");
                var actionsIds = Entities.getActionIDs(_entityID);
                log("actionIds", actionsIds);
            },

            startEquip: function(){
                log("startEquip");

            },

            releaseGrab: function(id, hand){
                log("releaseGrab");

                if (canStartTimer) {
                    log("Starting Timer");
                    startTimer();
                }

                canStartTimer = false;
            },

            // releaseEquip: function(){
            //     log("releaseEquip");

            // },

            unload: function(){
                log("preload");
            }
        };

        return new SupriseBall();
});