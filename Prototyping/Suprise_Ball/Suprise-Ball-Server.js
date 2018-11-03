(function(){
    /* eslint-disable indent */
    // Init
    // ////////////////////////////////////////////////////////////////////////

        var
            _entityID,
            canStartTimer = true,
            explodeTimer = false,
            currentPosition = null        
        ;
    
    // Consts
    // ////////////////////////////////////////////////////////////////////////

        var
            MILISECONDS = 1000,
            GRAVITY = -9.8,
            MIN_START_TIME = 2 * MILISECONDS,
            MAX_START_TIME = 10 * MILISECONDS,

            MIN_DURATION_TIME = 7 * MILISECONDS,
            MAX_DURATION_TIME = 25 * MILISECONDS,

            SMOKE_TIME = 0.85 * MILISECONDS        
        ;

    // Collections
    // ////////////////////////////////////////////////////////////////////////
            var
                musicCollection = [
                    Script.resolvePath("./Sounds/Music/03B_Eww Baby_INST.mp3"),
                    Script.resolvePath("./Sounds/Music/best.mp3"),
                    Script.resolvePath("./Sounds/Music/punish.mp3"),
                    Script.resolvePath("./Sounds/Music/house.mp3"),
                    Script.resolvePath("./Sounds/Music/end.mp3"),
                    Script.resolvePath("./Sounds/Music/hands.mp3"),
                    Script.resolvePath("./Sounds/Music/feel_good.mp3"),
                    Script.resolvePath("./Sounds/Music/dance_like.mp3"),
                    Script.resolvePath("./Sounds/Music/dance_to_this.mp3"),
                    Script.resolvePath("./Sounds/Music/come_back.mp3"),
                    Script.resolvePath("./Sounds/Music/beer_googles.mp3"),
                    Script.resolvePath("./Sounds/Music/not_this_time.mp3"),
                    Script.resolvePath("./Sounds/Music/i_love_it_all.mp3"),
                    Script.resolvePath("./Sounds/Music/ho_heart.mp3"),
                    Script.resolvePath("./Sounds/Music/animal.mp3"),
                    Script.resolvePath("./Sounds/Music/make_you_say.mp3"),
                    Script.resolvePath("./Sounds/Music/found_you.mp3")
                ],
                sfxCollection = [
                    Script.resolvePath("./Sounds/SFX/jg-032316-sfx-huge-stadium-horn-2.mp3"),
                    Script.resolvePath("./Sounds/SFX/crash-glass-wood-break_z1D5f2Vd.mp3"),
                    Script.resolvePath("./Sounds/SFX/crash-metal_MJuTGhVO.mp3"),
                    Script.resolvePath("./Sounds/SFX/explosion-house-demolition-crash_zkZhCoNO.mp3"),
                    Script.resolvePath("./Sounds/SFX/hit-flutter_z1H3E24d.mp3"),
                    Script.resolvePath("./Sounds/SFX/impact-car-hood-crash_Mkyd8v4u.mp3"),
                    Script.resolvePath("./Sounds/SFX/jg-032316-sfx-cinematic-tension-impact-4.mp3"),
                    Script.resolvePath("./Sounds/SFX/jg-032316-sfx-dj-scratch-4-times.mp3"),
                    Script.resolvePath("./Sounds/SFX/magic-laser-rays-spell_M1bPTHEd.mp3"),
                    Script.resolvePath("./Sounds/SFX/powerful-flyby-whoosh_GktpiHE_.mp3"),
                    Script.resolvePath("./Sounds/SFX/radio-impact-blast-electronic_GJFp1K4d.mp3"),
                    Script.resolvePath("./Sounds/SFX/radio-impact-blast-stutter_zJi31Y4u.mp3"),
                    Script.resolvePath("./Sounds/SFX/radio-impact-burst-descend_fkzexYN_.mp3"),
                    Script.resolvePath("./Sounds/SFX/radio-impact-hit-delay_MkBAZtVO.mp3"),
                    Script.resolvePath("./Sounds/SFX/radio-impact-power-down_z1WHMYNO.mp3"),
                    Script.resolvePath("./Sounds/SFX/scientific-laser-impact_zkG5qSEd.mp3"),
                    Script.resolvePath("./Sounds/SFX/thick-space-whoosh_fkEbsHVd.mp3"),
                    Script.resolvePath("./Sounds/SFX/time-spell-casting_G1ajwr4_.mp3"),
                    Script.resolvePath("./Sounds/SFX/twisted-spell-explosion_GJAT9S4O.mp3"),
                    Script.resolvePath("./Sounds/SFX/twisty-hit-whoosh_GkZPorNu.mp3")
                ],
                textureCollection = [
                    
                    Script.resolvePath("./Textures/atmosphere-particle-2.png"),
                    Script.resolvePath("./Textures/Bokeh-Particle-2.png"),
                    Script.resolvePath("./Textures/cloud-sprite.png"),
                    Script.resolvePath("./Textures/Fireball.jpg"),
                    Script.resolvePath("./Textures/heart-2.png"),
                    Script.resolvePath("./Textures/Particle-Spark.png"),
                    Script.resolvePath("./Textures/plasma-sprite.png"),
                    Script.resolvePath("./Textures/playaDust.png"),
                    Script.resolvePath("./Textures/rainbow.png"),
                    Script.resolvePath("./Textures/mist-sprite.png"),
                    Script.resolvePath("./Textures/Star-sprite.png"),
                    Script.resolvePath("./Textures/water-bubble.png"),
                    Script.resolvePath("./Textures/Particle-Triangle.png"),
                    Script.resolvePath("./Textures/circle.png"),
                    Script.resolvePath("./Textures/stripe.png"),
                    Script.resolvePath("./Textures/star.png"),
                    Script.resolvePath("./Textures/bubble.png"),
                    Script.resolvePath("./Textures/meowlad.png")
                ],
                danceCollection = [ 
                    Script.resolvePath("./Animations/Ballet 372.fbx"),
                    Script.resolvePath("./Animations/BBoy Look at me be Booooi 202.fbx"),
                    Script.resolvePath("./Animations/Belly Dance 590.fbx"),
                    Script.resolvePath("./Animations/Belly Dancing 643.fbx"),
                    Script.resolvePath("./Animations/Beyonce Boogie 235.fbx"),
                    Script.resolvePath("./Animations/Body Rocka 64.fbx"),
                    Script.resolvePath("./Animations/Booty Booty Booty 148.fbx"),
                    Script.resolvePath("./Animations/Breakdance 1990 16.fbx"),
                    Script.resolvePath("./Animations/Chicken Dance 144.fbx"),
                    Script.resolvePath("./Animations/Every day Im shuffelin 226.fbx"),
                    Script.resolvePath("./Animations/Flair it Up 75.fbx"),
                    Script.resolvePath("./Animations/Gangnam Style 372.fbx"),
                    Script.resolvePath("./Animations/Hokey Pokey 351.fbx"),
                    Script.resolvePath("./Animations/In Yo Own World 392.fbx"),
                    Script.resolvePath("./Animations/Jiggle Jangle 474.fbx"),
                    Script.resolvePath("./Animations/King Tut 509.fbx"),
                    Script.resolvePath("./Animations/Mad attitude 184.fbx"),
                    Script.resolvePath("./Animations/Raise the roof 124.fbx"),
                    Script.resolvePath("./Animations/Runnin Man 326.fbx"),
                    Script.resolvePath("./Animations/Salsa and Chips 566.fbx"),
                    Script.resolvePath("./Animations/Salsa Papi 136.fbx"),
                    Script.resolvePath("./Animations/Salsa spinna 79.fbx"),
                    Script.resolvePath("./Animations/Shake it like you mean it 360.fbx"),
                    Script.resolvePath("./Animations/Shoppin like its Costco 479.fbx"),
                    Script.resolvePath("./Animations/Slider with cheese 520.fbx"),
                    Script.resolvePath("./Animations/Smoov Playa 489.fbx"),
                    Script.resolvePath("./Animations/So into it 244.fbx"),
                    Script.resolvePath("./Animations/Swing Batta Batta 742.fbx"),
                    Script.resolvePath("./Animations/Swing so happy 628.fbx"),
                    Script.resolvePath("./Animations/Swinga 700.fbx"),
                    Script.resolvePath("./Animations/Thriller Idle 131.fbx"),
                    Script.resolvePath("./Animations/Thriller Part 1 896.fbx"),
                    Script.resolvePath("./Animations/Thriller Part 2 566.fbx"),
                    Script.resolvePath("./Animations/Thriller Part 3 768.fbx"),
                    Script.resolvePath("./Animations/Thriller Part 4 1113.fbx"),
                    Script.resolvePath("./Animations/Twerk it Twerk it 457.fbx"),
                    Script.resolvePath("./Animations/Twista 284.fbx"),
                    Script.resolvePath("./Animations/Wavy baby 213.fbx"),
                    Script.resolvePath("./Animations/Ymca Dance 136.fbx")
                ],
                dancerCollection = [ 
                    Script.resolvePath("./Models/alan.fst"),
                    Script.resolvePath("./Models/alisa.fst"),
                    Script.resolvePath("./Models/andrew.fst"),
                    Script.resolvePath("./Models/austin.fst"),
                    Script.resolvePath("./Models/birarda.fst"),
                    Script.resolvePath("./Models/brad.fst"),
                    Script.resolvePath("./Models/caitlyn.fst"),
                    Script.resolvePath("./Models/clement.fst")
                ]
            ;

    // Helper Functions
    // ////////////////////////////////////////////////////////////////////////
        var
            common = Script.require("./Modules/Common.js"),
            log = common.log,
            randomInt = common.randomInt,
            vec = common.vec,
            
            LightMaker = Script.require("./Modules/LightMaker.js"),
            ParticleMaker = Script.require("./Modules/ParticleMaker.js"),
            DanceMaker = Script.require("./Modules/DanceMaker.js"),
            SoundMaker = Script.require("./Modules/SoundMaker.js"),

            Lights = new LightMaker(),
            Particles = new ParticleMaker(textureCollection),
            Dancers = new DanceMaker(startParty, danceCollection, dancerCollection),
            Music = new SoundMaker(),
            SFX = new SoundMaker()
        ;
    // Procedural Functions
    // ////////////////////////////////////////////////////////////////////////

        function startParty(){
            log("Starting Party");

            currentPosition = Entities.getEntityProperties(_entityID, ["position"]).position;

            var START_TIME = 500;
            createSmoke();
            SFX.playRandom();
            Script.setTimeout(function(){
                Music.playRandom();
                Lights.create(currentPosition);
                Particles.create(currentPosition);
                Dancers.create(currentPosition);
            }, START_TIME);

            var randomDurationTime = randomInt(MIN_DURATION_TIME, MAX_DURATION_TIME);

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
                log("starting prefetch");
                Dancers.prefetch();
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
            }, true);

            Script.setTimeout(function() {
                Entities.deleteEntity(splat);
            }, SMOKE_TIME); 
        }

    // Entity Definition
    // ////////////////////////////////////////////////////////////////////////
        
        function SupriseBall(){
        }

        SupriseBall.prototype = {
            remotelyCallabe: [
                "startTimer"
            ],
            preload: function(entityID){
                log("preload");
                _entityID = entityID;

                Particles.registerEntity(_entityID);
                DanceMaker.registerEntity(_entityID);

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
