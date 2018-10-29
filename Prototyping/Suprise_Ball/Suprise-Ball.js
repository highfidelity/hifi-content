(function(){
    /* eslint-disable indent */
    // Init
    // ////////////////////////////////////////////////////////////////////////

        var
            _that,
            _entityID,
            _entityProperties,
            explodeTestID,
            originalRotation,
            canStartTimer,
            explodeTimer = false,
            dancer = null,
            dance = null
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

            TIME_TILL_DELETE = 3 * MILISECONDS,
            SMOKE_TIME = 0.85 * MILISECONDS
        ;

    // Collections
    // ////////////////////////////////////////////////////////////////////////
            var
                smokeParticleProperties,

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
                    "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/atmosphere-particle-2.png",
                    "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/Bokeh-Particle-2.png",
                    "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/cloud-sprite.png",
                    "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/Fireball.jpg",
                    "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/heart-2.png",
                    "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/Particle-Spark.png",
                    "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/plasma-sprite.png",
                    "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/playaDust.png",
                    "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/rainbow.png",
                    "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/mist-sprite.png",
                    "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/Star-sprite.png",
                    "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/water-bubble.png",
                    "https://hifi-content.s3.amazonaws.com/alan/dev/Particle-Triangle.png",
                    "http://hifi-content.s3.amazonaws.com/alexia/LoadingScreens/Portals/circle.png",
                    "http://hifi-content.s3.amazonaws.com/alexia/Models/Portal/stripe.png",
                    "http://hifi-content.s3.amazonaws.com/alexia/Models/Portal/star.png",
                    "http://hifi-content.s3.amazonaws.com/alexia/Avatars/Bevi/bubble.png",
                ],
                danceUrls = [ 
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Ballet 372.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/BBoy Look at me be Booooi 202.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Belly Dance 590.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Belly Dancing 643.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Beyonce Boogie 235.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Body Rocka 64.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Booty Booty Booty 148.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Breakdance 1990 16.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Chicken Dance 144.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Every day Im shuffelin 226.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Flair it Up 75.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Gangnam Style 372.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Hokey Pokey 351.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/In Yo Own World 392.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Jiggle Jangle 474.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/King Tut 509.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Mad attitude 184.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Raise the roof 124.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Runnin Man 326.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Salsa and Chips 566.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Salsa Papi 136.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Salsa spinna 79.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Shake it like you mean it 360.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Shoppin like its Costco 479.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Slider with cheese 520.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Smoov Playa 489.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/So into it 244.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Swing Batta Batta 742.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Swing so happy 628.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Swinga 700.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Thriller Idle 131.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Thriller Part 1 896.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Thriller Part 2 566.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Thriller Part 3 768.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Thriller Part 4 1113.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Twerk it Twerk it 457.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Twista 284.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Wavy baby 213.fbx',
                    'https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DanceApp/Animations/Ymca Dance 136.fbx' 
                ];
                Lights = new LightMaker(),
                Particles = new ParticleMaker(),
                Dancers = new DanceMaker(),
                Music = new SoundMaker(),
                SFX = new SoundMaker()
            ;

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

        function makeColor(red, green, blue) {
            var colorArray = [red,green,blue];
            var arrayToGet0 = Math.floor(Math.random() * colorArray.length);
            colorArray[arrayToGet0] = colorArray[arrayToGet0] * 0.20;
            var finalColorObject = {
                red: colorArray[0],
                green: colorArray[1],
                blue: colorArray[2]
            };
            return finalColorObject;
        }

        function lerp(InputLow, InputHigh, OutputLow, OutputHigh, Input) {
            return ((Input - InputLow) / (InputHigh - InputLow)) * (OutputHigh - OutputLow) + OutputLow;
        }

        function clamp(min, max, num) {
            return Math.min(Math.max(num, min), max);
        }

        function ParticleMaker() {
            var that = this;
            this.particle = null;
            this.interval = null;
            this.makeRandomParticleProps = function() {

            }
            this.animate = function() {
                                   
                var SEED_MIN = 0;
                var SEED_MAX = 1;
                
                var UDPATE_MIN = 500;
                var UPDATE_MAX = 1000;

                var seed = randomFloat(SEED_MIN, SEED_MAX);
                var intervalAmount = parseInt(lerp(SEED_MIN, SEED_MAX, UDPATE_MIN, UPDATE_MAX, seed));
                
                var textureCount = 0;
                var textureSwitchCount = 50;
                this.interval = Script.setInterval(function(){
                    var SEED_MIN = 0;
                    var SEED_MAX = 1;

                    var seed = randomFloat(SEED_MIN, SEED_MAX);
                    var particleProps = {
                        emitRate: clamp(0, 100, lerp(SEED_MIN, SEED_MAX, 0, 100, Math.sin(seed))),
                        particleRadius: clamp(0, 1, lerp(SEED_MIN, SEED_MAX, 0, 1, Math.sin(seed))),
                        emitSpeed: clamp(0, 3, lerp(SEED_MIN, SEED_MAX, 0, 3, Math.sin(seed))),
                        emitAcceleration: {
                            "x": clamp(-0.5, 0.5, lerp(SEED_MIN, SEED_MAX, -0.5, 0.5, Math.sin(seed))),
                            "y": clamp(-0.5, 0.5, lerp(SEED_MIN, SEED_MAX, -0.5, 0.5, Math.cos(seed))),
                            "z": clamp(-0.5, 0.5, lerp(SEED_MIN, SEED_MAX, -0.5, 0.5, Math.tan(seed))),
                        },
                        emitOrientation: Quat.fromPitchYawRollDegrees(
                            clamp(-180, 180, lerp(SEED_MIN, SEED_MAX, -180, 180, Math.sin(seed))),
                            clamp(-180, 180, lerp(SEED_MIN, SEED_MAX, -180, 180, Math.cos(seed))),
                            clamp(-180, 180, lerp(SEED_MIN, SEED_MAX, -180, 180, Math.tan(seed)))
                        ),
                    }
                        textureCount <= textureSwitchCount && 
                        (particleProps.textures = textureCollection[randomInt(0, textureCollection.length - 1)]) &&
                        textureCount++

                        textureCount >= textureSwitchCount && 
                        (textureCount = 0)
                        
                    Entities.editEntity(that.particle, particleProps)
                }, intervalAmount)

            }
            this.create = function(position) {
                this.makeParticle();
                this.animate();
            }
            this.makeParticle = function() {
                var bubbles = {
                    "accelerationSpread": {
                        "blue": 0.5,
                        "green": 0.5,
                        "red": 0.5,
                        "x": 0.5,
                        "y": 0.5,
                        "z": 0.5
                    },
                    "alphaFinish": 1,
                    "alphaSpread": 1,
                    "alphaStart": 1,
                    "colorFinish": {
                        "blue": 0,
                        "green": 0,
                        "red": 0,
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "colorStart": {
                        "blue": 255,
                        "green": 255,
                        "red": 255,
                        "x": 255,
                        "y": 255,
                        "z": 255
                    },
                    "dimensions": {
                        "blue": 1211.32080078125,
                        "green": 1211.32080078125,
                        "red": 1211.32080078125,
                        "x": 1211.32080078125,
                        "y": 1211.32080078125,
                        "z": 1211.32080078125
                    },
                    "emitAcceleration": {
                        "blue": 0,
                        "green": 2,
                        "red": 0,
                        "x": 0,
                        "y": 2,
                        "z": 0
                    },
                    "emitDimensions": {
                        "blue": 0.5,
                        "green": 0.5,
                        "red": 0.5,
                        "x": 0.5,
                        "y": 0.5,
                        "z": 0.5
                    },
                    "emitOrientation": {
                        "w": 1,
                        "x": -1.52587890625e-05,
                        "y": -1.52587890625e-05,
                        "z": -1.52587890625e-05
                    },
                    "emitRate": 2,
                    "emitSpeed": 0.5099999904632568,
                    "emitterShouldTrail": true,
                    "maxParticles": 200,
                    "name": "Bubbles",
                    "particleRadius": 0,
                    "polarFinish": 1.4311699867248535,
                    "polarStart": 0.7504915595054626,
                    "radiusFinish": 0.10000000149011612,
                    "radiusSpread": 0.20999999344348907,
                    "radiusStart": 0.20000000298023224,
                    "rotation": {
                        "w": 0.6646066904067993,
                        "x": -0.22746622562408447,
                        "y": 0.20161747932434082,
                        "z": -0.6826122999191284
                    },
                    "speedSpread": 0.10000000149011612,
                    "spinFinish": -1.4137166738510132,
                    "spinSpread": 2.4260077476501465,
                    "spinStart": 1.2042771577835083,
                    "textures": "http://hifi-content.s3.amazonaws.com/alexia/Avatars/Bevi/bubble.png",
                    "type": "ParticleEffect"
                }
                var smoke = {
                    "accelerationSpread": {
                        "blue": 0,
                        "green": 2.5,
                        "red": 0,
                        "x": 0,
                        "y": 2.5,
                        "z": 0
                    },
                    "alpha": 0,
                    "alphaFinish": 0,
                    "alphaStart": 1,
                    "color": {
                        "blue": 255,
                        "green": 132,
                        "red": 0
                    },
                    "colorFinish": {
                        "blue": 0,
                        "green": 0,
                        "red": 0,
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "colorStart": {
                        "blue": 162,
                        "green": 0,
                        "red": 255,
                        "x": 255,
                        "y": 0,
                        "z": 162
                    },
                    "dimensions": {
                        "blue": 13.795560836791992,
                        "green": 13.795560836791992,
                        "red": 13.795560836791992,
                        "x": 13.795560836791992,
                        "y": 13.795560836791992,
                        "z": 13.795560836791992
                    },
                    "emitAcceleration": {
                        "blue": 0,
                        "green": 0,
                        "red": 0,
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "emitOrientation": {
                        "w": 1,
                        "x": -1.52587890625e-05,
                        "y": -1.52587890625e-05,
                        "z": -1.52587890625e-05
                    },
                    "emitRate": 982,
                    "emitSpeed": 0,
                    "emitterShouldTrail": true,
                    "maxParticles": 2446,
                    "particleRadius": 0.10000000149011612,
                    "radiusFinish": 0.009999999776482582,
                    "radiusStart": 0,
                    "speedSpread": 0,
                    "spinFinish": 0,
                    "spinSpread": 3.5953781604766846,
                    "spinStart": 0,
                    "textures": "https://content.highfidelity.com/DomainContent/production/Particles/wispy-smoke.png",
                    "type": "ParticleEffect"
                }

                var star = {
                    "alpha": 0,
                    "alphaFinish": 0,
                    "alphaStart": 1,
                    "colorStart": {
                        "blue": 255,
                        "green": 255,
                        "red": 255,
                        "x": 255,
                        "y": 255,
                        "z": 255
                    },
                    "dimensions": {
                        "blue": 13.24000072479248,
                        "green": 13.24000072479248,
                        "red": 13.24000072479248,
                        "x": 13.24000072479248,
                        "y": 13.24000072479248,
                        "z": 13.24000072479248
                    },
                    "emitAcceleration": {
                        "blue": 0,
                        "green": 0.10000000149011612,
                        "red": 0,
                        "x": 0,
                        "y": 0.10000000149011612,
                        "z": 0
                    },
                    "emitDimensions": {
                        "blue": 1,
                        "green": 1,
                        "red": 1,
                        "x": 1,
                        "y": 1,
                        "z": 1
                    },
                    "emitOrientation": {
                        "w": 1,
                        "x": -1.52587890625e-05,
                        "y": -1.52587890625e-05,
                        "z": -1.52587890625e-05
                    },
                    "emitRate": 6,
                    "emitSpeed": 0,
                    "maxParticles": 10,
                    "name": "Stars",
                    "particleRadius": 0.07000000029802322,
                    "polarFinish": 3.1415927410125732,
                    "radiusFinish": 0,
                    "radiusStart": 0,
                    "rotation": {
                        "w": 0.9852292537689209,
                        "x": -1.52587890625e-05,
                        "y": -0.17122149467468262,
                        "z": -7.62939453125e-05
                    },
                    "speedSpread": 0,
                    "spinFinish": null,
                    "spinStart": null,
                    "textures": "http://hifi-content.s3.amazonaws.com/alexia/Models/Portal/star.png",
                    "type": "ParticleEffect",
                    "userData": "{\"grabbableKey\":{\"grabbable\":false}}"
                }

                var circle = {
                    "alpha": 0,
                    "alphaFinish": 0,
                    "alphaStart": 1,
                    "color": {
                        "blue": 242,
                        "green": 196,
                        "red": 80
                    },
                    "colorFinish": {
                        "blue": 0,
                        "green": 0,
                        "red": 0,
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "colorStart": {
                        "blue": 242,
                        "green": 216,
                        "red": 44,
                        "x": 44,
                        "y": 216,
                        "z": 242
                    },
                    "dimensions": {
                        "blue": 0.8199999928474426,
                        "green": 0.8199999928474426,
                        "red": 0.8199999928474426,
                        "x": 0.8199999928474426,
                        "y": 0.8199999928474426,
                        "z": 0.8199999928474426
                    },
                    "emitAcceleration": {
                        "blue": 0,
                        "green": 0,
                        "red": 0,
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "emitOrientation": {
                        "w": 0.7071068286895752,
                        "x": 0.7071068286895752,
                        "y": -1.5259198335115798e-05,
                        "z": -1.5259198335115798e-05
                    },
                    "emitRate": 1,
                    "emitSpeed": 0,
                    "lifespan": 6.130000114440918,
                    "maxParticles": 1609,
                    "particleRadius": 0.4099999964237213,
                    "radiusFinish": 0.10000000149011612,
                    "radiusStart": 0,
                    "rotation": {
                        "w": 0.8684672117233276,
                        "x": -1.52587890625e-05,
                        "y": 0.4957197904586792,
                        "z": -1.52587890625e-05
                    },
                    "speedSpread": 0,
                    "spinFinish": null,
                    "spinStart": null,
                    "textures": "http://hifi-content.s3.amazonaws.com/alexia/LoadingScreens/Portals/circle.png",
                    "type": "ParticleEffect",
                    "userData": "{\"grabbableKey\":{\"grabbable\":false}}"
                }

                var rays = {
                    "alpha": 0,
                    "alphaFinish": 0,
                    "alphaStart": 1,
                    "color": {
                        "blue": 211,
                        "green": 227,
                        "red": 104
                    },
                    "colorFinish": {
                        "blue": 0,
                        "green": 0,
                        "red": 0,
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "colorStart": {
                        "blue": 211,
                        "green": 227,
                        "red": 104,
                        "x": 104,
                        "y": 227,
                        "z": 211
                    },
                    "dimensions": {
                        "blue": 2.5,
                        "green": 2.5,
                        "red": 2.5,
                        "x": 2.5,
                        "y": 2.5,
                        "z": 2.5
                    },
                    "emitAcceleration": {
                        "blue": 0,
                        "green": 0,
                        "red": 0,
                        "x": 0,
                        "y": 0,
                        "z": 0
                    },
                    "emitDimensions": {
                        "blue": 1,
                        "green": 1,
                        "red": 1,
                        "x": 1,
                        "y": 1,
                        "z": 1
                    },
                    "emitOrientation": {
                        "w": 0.9993909597396851,
                        "x": 0.034897372126579285,
                        "y": -1.525880907138344e-05,
                        "z": -1.525880907138344e-05
                    },
                    "emitRate": 2,
                    "emitSpeed": 0,
                    "maxParticles": 40,
                    "name": "Rays",
                    "particleRadius": 0.75,
                    "polarFinish": 3.1415927410125732,
                    "radiusFinish": 0.10000000149011612,
                    "radiusStart": 0,
                    "rotation": {
                        "w": 0.9803768396377563,
                        "x": -1.52587890625e-05,
                        "y": 0.19707024097442627,
                        "z": -7.62939453125e-05
                    },
                    "speedSpread": 0,
                    "spinFinish": null,
                    "spinStart": null,
                    "textures": "http://hifi-content.s3.amazonaws.com/alexia/Models/Portal/stripe.png",
                    "type": "ParticleEffect",
                    "userData": "{\"grabbableKey\":{\"grabbable\":false}}"
                }

                var particleArray = [bubbles, smoke, star, circle, rays];
                var particle = particleArray[randomInt(0, 4)];
                particle.parentID = _entityID
                this.particle = Entities.addEntity(particle);
            }
            this.destory = function() {
                Entities.deleteEntity(this.particle);
                Script.clearInterval(this.interval);
            }
        }

        function DanceMaker() {
            var that = this;
            this.dancer = null;
            this.create = function(position) {
                this.dancer = Entities.addEntity({
                    type: "Model",
                    name: "supriseDancer",
                    modelURL: "http://mpassets.highfidelity.com/ad348528-de38-420c-82bb-054cb22163f5-v1/mannequin.fst",
                    position: Vec3.sum(position, vec(0,0.75,0)),
                    parentID: _entityID,
                    animation: {
                        url: dance,
                        running: true
                    },
                    visible: true
                })

            }
            this.destroy = function() {
                Entities.deleteEntity(this.dancer);
            }
        }


        function SoundMaker(audioOptions, autoUpdateAudioPosition) {
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
                try {
                    this.injector.stop();

                } catch(e) {
                    // e
                }
            };
        }

        function LightMaker(){
            var that = this;
            this.box = null;
            this.lights = [];
            this.spotLight = null;
            this.lightProps = {};
            this.makeProps = function(position) {
                this.lightProps = {
                    name: "Suprise lights",
                    type: "Light",
                    position: this.position,
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
                    userData: "{ \"grabbableKey\": { \"grabbable\": false} }"                };
            };
            this.makeRandomLightProps = function(){
                var SEED_MIN = 0;
                var SEED_MAX = 1;
                
                var seed = randomFloat(SEED_MIN, SEED_MAX);
                var lightProps = {
                    intensity: lerp(SEED_MIN, SEED_MAX, 2, 25, seed),
                    color: makeColor(
                        clamp(0, 255, parseInt(lerp(SEED_MIN, SEED_MAX, 0, 255, Math.sin(seed)))),
                        clamp(0, 255, parseInt(lerp(SEED_MIN, SEED_MAX, 0, 255, Math.cos(seed)))),
                        clamp(0, 255, parseInt(lerp(SEED_MIN, SEED_MAX, 0, 255, Math.tan(seed))))
                    ),
                    falloffRadius: clamp(0, 10, lerp(SEED_MIN, SEED_MAX, 0, 10, Math.sin(seed))),
                    cutoff: clamp(0, 100, lerp(SEED_MIN, SEED_MAX, 0, 100, Math.cos(seed)))
                }        
                return lightProps;        
            }

            this.interval = null, 
            this.animate = function(){
                                    
                var SEED_MIN = 0;
                var SEED_MAX = 1;
                
                var UDPATE_MIN = 25
                var UPDATE_MAX = 150

                var seed = randomFloat(SEED_MIN, SEED_MAX);
                var intervalAmount = parseInt(lerp(SEED_MIN, SEED_MAX, UDPATE_MIN, UPDATE_MAX, seed));
                
                this.interval = Script.setInterval(function(){
                    var seed = randomFloat(SEED_MIN, SEED_MAX);
                    var angularVelocity = {
                        x: clamp(1, 5, lerp(SEED_MIN, SEED_MAX, 1, 5, Math.sin(seed))),
                        y: clamp(1, 5, lerp(SEED_MIN, SEED_MAX, 1, 5, Math.cos(seed))),
                        z: clamp(1, 5, lerp(SEED_MIN, SEED_MAX, 1, 5, Math.tan(seed))), 
                    }
                    Entities.editEntity(that.box, {
                        angularVelocity: angularVelocity
                    })
                
                    Entities.editEntity(that.spotLight, that.makeRandomLightProps());
                    that.lights.forEach(function(light){
                        Entities.editEntity(light, that.makeRandomLightProps());
                    })
                }, intervalAmount)
            },
            this.create = function(position){
                this.position = position;
                this.makeProps();
                this.makeBox();
                this.makeLights();
                this.animate();
            };
            this.makeBox = function(position) {
                this.box = Entities.addEntity({
                    name: "Spot Light",
                    type: "Box",
                    position: this.position,
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
                    visible: false
                });
            };
            this.makeLights = function() {
                this.lightProps.parentID = this.box;
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
    
                this.lightProps.isSpotlight = 1;
                this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,-90,0);
                this.lights.push(Entities.addEntity(this.lightProps));

                this.lightProps.isSpotlight = 1;
                this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,45,0);
                this.lights.push(Entities.addEntity(this.lightProps));
    
                this.lightProps.isSpotlight = 1;
                this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,-45,0);
                this.lights.push(Entities.addEntity(this.lightProps));
    
                this.lightProps.isSpotlight = 1;
                this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,0,0);
                this.lights.push(Entities.addEntity(this.lightProps));
    
                this.lightProps.isSpotlight = 1;
                this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,0,180);
                this.lights.push(Entities.addEntity(this.lightProps));

                this.lightProps.isSpotlight = 1;
                this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,0,-180);
                this.lights.push(Entities.addEntity(this.lightProps));
            };
            this.destroy = function() {
                Script.clearInterval(this.interval);
                Entities.deleteEntity(this.box);
            };
        }

    // Procedural Functions
    // ////////////////////////////////////////////////////////////////////////

        function startParty(){
            log("Starting Party");

            var currentPosition = Entities.getEntityProperties(_entityID, ["position"]).position;

            var START_TIME = 500;
            createSmoke();
            SFX.playRandom();
            Script.setTimeout(function(){
                Music.playRandom();
                Lights.create(currentPosition);
                Particles.create(currentPosition);
                Dancers.create(currentPosition);

            }, START_TIME)

            var randomDurationTime = randomInt(MIN_DURATION_TIME, MAX_DURATION_TIME);

            Script.setTimeout(function(){
                log("Deleting Entities");
                Music.stop();
                Lights.destroy();
                Particles.destory();
                Dancers.destroy();
                
                explodeTimer = false;
                log("Reseting Ball");
                Entities.deleteEntity(_entityID);
                // Entities.editEntity(_entityID, {
                //     gravity: vec(0, GRAVITY, 0),
                //     velocity: vec(0, -3, 0),
                //     dynamic: true,
                //     visible: true
                // }); 
            }, randomDurationTime);
            // }, 12000);

        }
        
        // Start the timer for things to happen
        function startTimer(){
            if (explodeTimer) {
                return;
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
                startParty();
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
            _that = this;
        }

        SupriseBall.prototype = {
            preload: function(entityID){
                log("preload");
                _entityID = entityID;

                _entityProperties = Entities.getEntityProperties(_entityID, ["rotation", "position"]);

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

                dance = danceUrls[randomInt(0, danceUrls.length - 1)];

                AnimationCache.prefetch(dance);
            },

            continueNearGrab: function(id, hand){
                !canStartTimer && 
                (canStartTimer = true);
            },

            releaseGrab: function(id, hand){
                log("releaseGrab");

                canStartTimer &&
                log("Starting Timer") && 
                startTimer() &&
                (canStartTimer = false);
            },

            unload: function(){
                log("running unload");

                explodeTimer && Script.clearInterval(explodeTimer)
            }
        };

        return new SupriseBall();

});
