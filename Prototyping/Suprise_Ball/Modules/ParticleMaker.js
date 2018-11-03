var 
    common = Script.require("./Common.js"),
    randomFloat = common.randomFloat,
    randomInt = common.randomInt,
    lerp = common.lerp,
    clamp = common.lerp
;

function ParticleMaker(textureCollection) {
    var that = this;
    this.particle = null;
    this.interval = null;
    this._entityID = null;
    this.registerEntity = function(entityID){
        this._entityID = entityID;
    };
    this.animate = function() {
                           
        var SEED_MIN = 0;
        var SEED_MAX = 1;
        
        var UDPATE_MIN = 500;
        var UPDATE_MAX = 1000;

        var seed = randomFloat(SEED_MIN, SEED_MAX);
        var intervalAmount = parseInt(lerp(SEED_MIN, SEED_MAX, UDPATE_MIN, UPDATE_MAX, seed));
        
        var textureCount = 0;
        var textureSwitchCount = 15;
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
                    "z": clamp(-0.5, 0.5, lerp(SEED_MIN, SEED_MAX, -0.5, 0.5, Math.tan(seed)))
                },
                emitOrientation: Quat.fromPitchYawRollDegrees(
                    clamp(-180, 180, lerp(SEED_MIN, SEED_MAX, -180, 180, Math.sin(seed))),
                    clamp(-180, 180, lerp(SEED_MIN, SEED_MAX, -180, 180, Math.cos(seed))),
                    clamp(-180, 180, lerp(SEED_MIN, SEED_MAX, -180, 180, Math.tan(seed)))
                )
            };
                textureCount <= textureSwitchCount && 
                (particleProps.textures = textureCollection[randomInt(0, textureCollection.length - 1)]) &&
                textureCount++;

                textureCount >= textureSwitchCount && 
                (textureCount = 0);
                
            Entities.editEntity(that.particle, particleProps);
        }, intervalAmount);

    };
    this.create = function(position) {
        this.makeParticle();
        this.animate();
    };
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
        };
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
        };

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
        };

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
        };

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
        };

        var particleArray = [bubbles, smoke, star, circle, rays];
        var particle = particleArray[randomInt(0, 4)];
        particle.parentID = this.entityID;
        this.particle = Entities.addEntity(particle, true);
    };
    this.destory = function() {
        Entities.deleteEntity(this.particle);
        Script.clearInterval(this.interval);
    };
}

module.exports = ParticleMaker;