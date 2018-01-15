/**
Flaregun V2

Created by Matti 'Menithal' Lahtinen
on  7/5/2016 / Updated on 10/7/2016

Script Released Under CC Attribution 4.0
http://creativecommons.org/licenses/by/4.0/

All Assets refered in this script are
Released Under CC Attribution Non-Commercial 4.0
http://creativecommons.org/licenses/by/4.0/
**/
(function() {

    var SMOKE_TEXTURE = "http://mpassets.highfidelity.com/df227a80-069b-4d01-9aec-d016fbc1fbe3-v1/textures/smoke.png";
    var FLARE_TEXTURE = "http://mpassets.highfidelity.com/df227a80-069b-4d01-9aec-d016fbc1fbe3-v1/textures/flaresparks.png";


    var SHOOTING_SOUND_URL = "http://mpassets.highfidelity.com/df227a80-069b-4d01-9aec-d016fbc1fbe3-v1/sounds/flare_gun_fire.wav";
    var IGNITE_SOUND_URL = "http://mpassets.highfidelity.com/df227a80-069b-4d01-9aec-d016fbc1fbe3-v1/sounds/flare_explosion_and_fizz.wav";

    var SMOKE_PARTICLES = {
        name: "FLARE_SMOKE",
        type: "ParticleEffect",
        color: {
            red: 80,
            green: 80,
            blue: 80
        },
        isEmitting: 1,
        maxParticles: 1000,
        lifespan: 15,
        emitRate: 30,
        emitSpeed: 2,
        speedSpread: 0,
        emitOrientation: {
            x: -0.7071372866630554,
            y: -0.000015258539860951714,
            z: -0.000015258539860951714,
            w: 0.7070763111114502
        },
        emitDimensions: {
            x: 0.5,
            y: 0.5,
            z: 0.5
        },
        polarStart: 0,
        polarFinish: 2,
        azimuthStart: -3.0999999046325684,
        azimuthFinish: 3.0999999046325684,
        emitAcceleration: {
            x: 0,
            y: 2,
            z: 0
        },
        accelerationSpread: {
            x: 0,
            y: 0,
            z: 0
        },
        particleRadius: 5,
        radiusSpread: 0.20000000298023224,
        radiusStart: 0.5,
        radiusFinish: 2,
        colorSpread: {
            red: 0,
            green: 0,
            blue: 0
        },
        colorStart: {
            red: 200,
            green: 200,
            blue: 200
        },
        colorFinish: {
            red: 82,
            green: 82,
            blue: 82
        },
        alpha: 0.20000000298023224,
        alphaSpread: 0.5,
        alphaStart: 0.10000000149011612,
        alphaFinish: 0,
        emitterShouldTrail: 1,
        textures: SMOKE_TEXTURE
    };
    var SPARK_PARTICLES = {
        name: "FLARE_SPARKS",
        type: "ParticleEffect",
        color: {
            red: 255,
            green: 255,
            blue: 255
        },
        isEmitting: 1,
        maxParticles: 50,
        lifespan: 2,
        emitRate: 20,
        emitSpeed: 0,
        speedSpread: 4,
        emitOrientation: {
            x: -0.7071220278739929,
            y: -0.000015258869098033756,
            z: -0.000015258869098033756,
            w: 0.7070915699005127
        },
        emitDimensions: {
            x: 0,
            y: 0,
            z: 0
        },
        polarStart: 0,
        polarFinish: 3,
        azimuthStart: -3.1415927410125732,
        azimuthFinish: 3.1415927410125732,
        emitAcceleration: {
            x: 0,
            y: -2,
            z: 0
        },
        accelerationSpread: {
            x: 1,
            y: 1,
            z: 1
        },
        particleRadius: 0.12999999523162842,
        radiusSpread: 1,
        radiusStart: 0,
        radiusFinish: 0,
        colorSpread: {
            red: 0,
            green: 0,
            blue: 0
        },
        colorStart: {
            red: 255,
            green: 255,
            blue: 255
        },
        colorFinish: {
            red: 255,
            green: 255,
            blue: 255
        },
        alpha: 1,
        alphaSpread: 0,
        alphaStart: 1,
        alphaFinish: 0,
        emitterShouldTrail: 1,
        textures: FLARE_TEXTURE
    };
    var FLARE_PARTICLES = {
        name: "FLARE_FLARE",
        type: "ParticleEffect",
        color: {
            red: 255,
            green: 255,
            blue: 255
        },
        isEmitting: 1,
        maxParticles: 25,
        lifespan: 4,
        emitRate: 20,
        emitSpeed: 0,
        speedSpread: 0,
        emitOrientation: {
            x: -0.7071525454521179,
            y: -0.000015258869098033756,
            z: -0.000015258869098033756,
            w: 0.7070610523223877
        },
        emitDimensions: {
            x: 0,
            y: 0,
            z: 0
        },
        polarStart: 0,
        polarFinish: 0,
        azimuthStart: -3.1415927410125732,
        azimuthFinish: 3.1415927410125732,
        emitAcceleration: {
            x: 0,
            y: 0,
            z: 0
        },
        accelerationSpread: {
            x: 0,
            y: 0,
            z: 0
        },
        particleRadius: 0.02500000037252903,
        radiusSpread: 0,
        radiusStart: 1,
        radiusFinish: 0.02500000037252903,
        colorSpread: {
            red: 0,
            green: 0,
            blue: 0
        },
        colorStart: {
            red: 255,
            green: 255,
            blue: 255
        },
        colorFinish: {
            red: 255,
            green: 255,
            blue: 255
        },
        alpha: 1,
        alphaSpread: 0,
        alphaStart: 1,
        alphaFinish: 0,
        emitterShouldTrail: 0,
        textures: FLARE_TEXTURE
    };

    var MAX_INTENSITY = 100000;
    var MASSIVE_LIGHT = {
        collsionless: 1,
        color: {
            blue: 155,
            green: 199,
            red: 232
        },
        cutoff: 90,
        dimensions: {
            x: 350,
            y: 350,
            z: 350
        },
        ignoreForCollisions: 1,
        intensity: MAX_INTENSITY,
        name: "FLARE_LIGHT",
        type: "Light"
    };


    var RELOAD_ANIMATION = "";
    var RELOAD_THRESHOLD = 0.95;
    var RELOAD_TIME = 4;
    var GUN_TIP_FWD_OFFSET = 0.35;
    var GUN_TIP_UP_OFFSET = 0.12;
    var TRIGGER_CONTROLS = [
        Controller.Standard.LT,
        Controller.Standard.RT
    ];

    var GUN_FORCE = 35;

    var LOCAL_AUDIOPLAYBACK = {
        volume: 0.3,
        position: Vec3.sum(Camera.getPosition(), Quat.getFront(Camera.getOrientation()))
    };

    var BULLET_GRAVITY = {
        x: 0,
        y: -1,
        z: 0
    };
    var BULLET_DIMENSIONS = {
        x: 0.04,
        y: 0.04,
        z: 0.04
    };
    var BULLET_COLOR = {
        red: 255,
        green: 255,
        blue: 255
    };
    var BULLET_LINEAR_DAMPING = 0.6;


    var SHOOTING_SOUND = SoundCache.getSound(SHOOTING_SOUND_URL);
    var IGNITE_SOUND = SoundCache.getSound(IGNITE_SOUND_URL);

    function lightFlicker(intensity, variance) {
        var val = intensity + ((Math.random() * variance * 2) - (Math.random() * variance * 2));

        if (val <= MAX_INTENSITY && val > MAX_INTENSITY / 10) {
            return val;
        }
        return MAX_INTENSITY;
    }
    // Oddly again couldnt get prototype "this" to work here, so I improvised.
    var FlareBullet = function(gunProperties, fwd, velocity, weapon) {
        this.weapon = weapon;
        this.timer = 0;
        this.exploded = false;
        this.flareId = Entities.addEntity({
            type: "Sphere",
            name: "FLARE",
            visible: 1,
            color: BULLET_COLOR,
            dimensions: BULLET_DIMENSIONS,
            damping: BULLET_LINEAR_DAMPING,
            gravity: BULLET_GRAVITY,
            dynamic: true,
            lifetime: 30,
            rotation: gunProperties.orientation,
            position: fwd, //self.getGunTipPosition(gunProperties),
            velocity: velocity
        }, true);
        this.light = null;
        this.throttleTimer = 0;

        this.composite = [];
    }

    FlareBullet.prototype = {
        explosionComposition: [SPARK_PARTICLES, FLARE_PARTICLES, MASSIVE_LIGHT, SMOKE_PARTICLES],
        composite: null,
        light: null,
        throttleTimer: 0,
        flareId: null,
        timer: 0,
        globalTimer: 0,
        exploded: false,
        fuse: function(dt) {
            try {
                this.timer += dt;
                this.throttleTimer += dt;
                this.globalTimer += dt;
                if (this.throttleTimer > (100 / 1000)) {
                    this.throttleTimer = 0;
                    if (this.timer > 3 && !this.exploded) {
                        this.timer = 0;
                        this.exploded = true;
                        this.explode();
                    } else if (this.globalTimer > 3 && this.globalTimer < 18 && this.exploded) {
                        var lightEntity = Entities.getEntityProperties(this.light);
                        var newIntensity = lightFlicker(lightEntity.intensity, 5000);
                        Entities.editEntity(this.light, {
                            intensity: newIntensity
                        });
                    } else if (this.globalTimer >= 18 && this.exploded) {

                        var lightEntity = Entities.getEntityProperties(this.light);
                        Entities.editEntity(this.light, {
                            intensity: lightEntity.intensity / 1.05
                        });
                        var alphaVal = (lightEntity.intensity / 1.05) / MAX_INTENSITY;

                        for (var x = 0; x < this.composite.length; x++) {
                            var id = this.composite[x];
                            var properties = Entities.getEntityProperties(id);
                            Entities.editEntity(id, {
                                emitRate: properties.emitRate * alphaVal
                            })
                        }
                        if (this.globalTimer >= 25) {
                            Entities.deleteEntity(this.flareId);
                            return true;
                        }
                    }
                }
            } catch (e) {
                // We have to assume we no longer have no command over the entity, return true
                return true;
            }
            return false;
        },
        explode: function() {
            var parentProperties = Entities.getEntityProperties(this.flareId);

            Audio.playSound(IGNITE_SOUND, {
                volume: 0.5,
                position: Vec3.mix(MyAvatar.position, parentProperties.position, 0.5)
            });

            for (var i = 0; i < this.explosionComposition.length; i++) {

                var composite = this.explosionComposition[i];
                composite.parentID = this.flareId;
                composite.position = parentProperties.position;

                var id = Entities.addEntity(composite, true);
                if (composite.type === "Light") {
                    this.light = id;
                } else {
                    this.composite.push(id);
                }
            }
            Entities.editEntity(this.flareId, {
                velocity: {
                    x: 0,
                    y: -1,
                    z: 0
                }
            });
            this.weapon.canShoot = true;
        }
    }

    function FlareGun() {
        return;
    }
    FlareGun.prototype = {
        hand: null,
        gunTipPosition: null,
        canShoot: false,
        equipped: false,
        threadRunning: null,
        firedProjectiles: [],
        startEquip: function(entityID, args) {
            this.hand = args[0] == "left" ? 0 : 1;
        },

        continueEquip: function(entityID, args) {
            this.checkTriggerPressure(this.hand);
        },

        releaseEquip: function(entityID, args) {
            var _this = this;
            this.equipped = false;
            this.canShoot = false;
        },
        checkTriggerPressure: function(gunHand) {
            this.triggerValue = Controller.getValue(TRIGGER_CONTROLS[gunHand]);
            if (this.triggerValue >= RELOAD_THRESHOLD && this.canShoot) {
                this.canShoot = false;
                var gunProperties = Entities.getEntityProperties(this.entityID, ["position", "rotation"]);
                this.fire(gunProperties);
            } else if (this.triggerValue <= RELOAD_THRESHOLD && !this.equipped && !this.canShoot) {
                this.equipped = true;
                this.canShoot = true;
            }

            return;
        },
        getGunTipPosition: function(properties) {
            //the tip of the gun is going to be in a different place than the center, so we move in space relative to the model to find that position
            var frontVector = Quat.getFront(properties.rotation);
            var frontOffset = Vec3.multiply(frontVector, GUN_TIP_FWD_OFFSET);
            var upVector = Quat.getUp(properties.rotation);
            var upOffset = Vec3.multiply(upVector, GUN_TIP_UP_OFFSET);

            var gunTipPosition = Vec3.sum(properties.position, frontOffset);
            gunTipPosition = Vec3.sum(gunTipPosition, upOffset);

            return gunTipPosition;
        },
        thread: function(dt) {
            var cleanedProjectiles = [];
            for (var index in this.firedProjectiles) {
                var firedProjectile = this.firedProjectiles[index];
                if (firedProjectile instanceof FlareBullet) {
                    var complete = firedProjectile.fuse(dt);
                    if (!complete) {
                        cleanedProjectiles.push(firedProjectile);
                    }
                }
            }
            this.firedProjectiles = cleanedProjectiles;

            if (this.firedProjectiles.length === 0) {

                Script.update.disconnect(this._thread);
                this._thread = null;
            }
        },

        fire: function(gunProperties) {

            var _this = this;

            Controller.triggerShortHapticPulse(1, this.hand)
            var forwardVec = Quat.getFront(Quat.multiply(gunProperties.rotation, Quat.fromPitchYawRollDegrees(0, 0, 0)));
            forwardVec = Vec3.normalize(forwardVec);
            forwardVec = Vec3.multiply(forwardVec, GUN_FORCE);
            // Make the weapon handle all the flares currently active with try catches if flare bullets are removed from existance

            var projectile = new FlareBullet(
                gunProperties,
                this.getGunTipPosition(gunProperties),
                forwardVec, this);
            this.firedProjectiles.push(projectile);

            Audio.playSound(SHOOTING_SOUND, {
                volume: 1,
                position: gunProperties.position
            });

            // So when the thread is not yet running, lets initiate  it now that we have been fired.
            if (this.firedProjectiles.length > 0 && this._thread == null) {

                this._thread = function(dt) {
                    _this.thread(dt);
                };
                Script.update.connect(this._thread);
            }
        },
        preload: function(entityID) {
            this.entityID = entityID;
        }
    }

    var self = new FlareGun();
    return self;

});