// AC stands for Alien Control

/* globals Entities, Agent, Script, EntityViewer, Sound, SoundCache, Avatar, Quat, Vec3, Users, Messages */
var invasionUtils = Script.require('./invasionUtils.js');

var MILLISECONDS_IN_SECOND = 1000;
var ADDED_LIFETIME = 15;
var LIFETIME_CHECK_INTERVAL = (ADDED_LIFETIME * MILLISECONDS_IN_SECOND) / 2;

var SOUNDS_PATH = 'https://cdn.glitch.com/b1db0709-5c86-4342-8be4-19325d64d41a/sounds/';
var INVASION_SOUND = SOUNDS_PATH + '219199__airborne80__invasion.wav';
var ALARM_SOUND = SOUNDS_PATH + '263682__ryanconway__warning-alarm-louder.wav';

var MOTHERSHIP_POSITION = {x: 15.8281, y: 84.2781, z: 10.0205};
var BEAM_IN_OFFSET = {x: 0.0, y: -33.0, z: 0.0};
var BEAM_FROM_POSITION = MOTHERSHIP_POSITION;
var BEAM_TO_POSITION = Vec3.sum(MOTHERSHIP_POSITION, BEAM_IN_OFFSET);

// TODO: number of UFO's depend on the amount of active-guests in the park
var NUMBER_OF_UFOS = 10;

var CLOSEST_LASER_RANGE = 10;
var LOWEST_HOVER_HEIGHT = -3.75;
var RANDOM_ATTACK_BOX_DIMENSIONS = {x: 12, y: 8, z: 12};

var UFO_ATTACK_INTERVAL_MS = 100;
var UFO_ATTACK_DAMAGE = 0.0015;

var MAX_DEGREES_IN_A_FULL_REVOLUTION = 360.0;

var UFO_SPIN_VELOCITY = {
    x: 0.0,
    y: 2.0,
    z: 0.0
};
var UFO_FULL_SPEED = 6.0;
var UFO_CAREFUL_SPEED = 5.0;

var UPDATE_RATE_FPS = 60;

var DEBUG = true;
var DEBUG_CUBES = false;

var HALF_DIMENSION_AXIS_OFFSET = -0.5;

var invasionSound = SoundCache.getSound(INVASION_SOUND);
var alarmSound = SoundCache.getSound(ALARM_SOUND);

var POWER_SOURCE_FULL_ANGULAR_VELOCITY = {
    x: 0,
    y: 0.2617993950843811,
    z: 0
};

var POWER_SOURCE_PROPERTIES = {
    angularDamping: 0,
    angularVelocity: {
        x: 0,
        y: 0.2617993950843811,
        z: 0
    },
    damping: 0,
    dimensions: {
        x: 4.974679946899414,
        y: 5.103892803192139,
        z: 8.011173248291016
    },
    modelURL: "atp:/0lAxOepK_-G_2fFBRNiK6y4_obj/tinker.obj",
    name: "PowerSource",
    rotation: {
        w: -0.421863317489624,
        x: 0.4218331277370453,
        y: 0.5675212740898132,
        z: 0.567457377910614
    },
    script: "https://hifi-content.s3.amazonaws.com/davidback/development/themepark/invasion/powerDevice.js",
    scriptTimestamp: Date.now(), // invalidate cache while dev
    type: "Model",
    userData: JSON.stringify({
        grabbableKey: {
            grabbable: false
        }
    })
};

var ALIEN_PROPERTIES = {
    damping: 0,
    angularDamping: 0,
    dimensions: {
        x: 2.922884702682495,
        y: 3.074074029922485,
        z: 2.251689076423646
    },
    modelURL: "https://hifi-content.s3.amazonaws.com/davidback/development/themepark/invasion/alien.obj",
    name: "UFO with Alien",
    rotation: {
        w: 0.8813782930374146,
        x: 0,
        y: -0.4724111258983612,
        z: 0
    },
    script: "https://hifi-content.s3.amazonaws.com/davidback/development/themepark/invasion/alien.js",
    scriptTimestamp: Date.now(), // invalidate cache while dev
    shapeType: "box",
    type: "Model"
};

var MOTHERSHIP_PROPERTIES = {
    damping: 0,
    angularDamping: 0,
    dimensions: {
        x: 75.4637451171875,
        y: 63.58382034301758,
        z: 75.49683380126953
    },
    modelURL: "atp:/czAsGHdue___bkFfMVXC-KF_obj/FlyingSaucer_1352.obj",
    name: "Mothership",
    rotation: {
        w: -0.46968793869018555,
        x: -1.52587890625e-05,
        y: 0.8828107118606567,
        z: -1.52587890625e-05
    },
    type: "Model",
    shapeType: "box",
    userData: JSON.stringify({
        grabbableKey: {
            grabbable: false
        }
    })
};

var ZEBRA_OVERLORD_PROPERTIES = {
    animation: {
        running: true,
        url: "https://hifi-content.s3.amazonaws.com/elisalj/hack_week/zebra_simple_large.fbx"
    },
    dimensions: {
        x: 9.851162910461426,
        y: 15.667540550231934,
        z: 16.151466369628906
    },
    modelURL: "https://hifi-content.s3.amazonaws.com/elisalj/hack_week/zebra_simple_large.fbx",
    name: "Zebra Overlord",
    position: {"x": MOTHERSHIP_POSITION.x, "y":97.96224975585938, "z": MOTHERSHIP_POSITION.z},
    rotation: {
        w: -0.11046004295349121,
        x: 0.0643472671508789,
        y: 0.9819943904876709,
        z: -0.13908600807189941
    },
    type: "Model",
    userData: JSON.stringify({
        grabbableKey: {
            grabbable: false
        }
    }),
    locked: true
};

var HAPPY_SMILE_PROPERTIES = {
    accelerationSpread: {
        x: 0.5,
        y: 1,
        z: 0.5
    },
    alpha: 0.9100000262260437,
    alphaFinish: 0.9100000262260437,
    alphaStart: 0.9100000262260437,
    color: {
        blue: 250,
        green: 255,
        red: 255
    },
    colorFinish: {
        blue: 250,
        green: 255,
        red: 255
    },
    colorStart: {
        blue: 250,
        green: 255,
        red: 255
    },
    dimensions: {
        x: 0.45024099946022034,
        y: 0.45024099946022034,
        z: 0.45024099946022034
    },
    emitAcceleration: {
        x: -0.5,
        y: 2.5,
        z: -0.5
    },
    emitOrientation: {
        w: 0.7070915699005127,
        x: -0.7071220278739929,
        y: -1.5258869098033756e-05,
        z: -1.5258869098033756e-05
    },
    emitRate: 3,
    emitSpeed: 0,
    lifespan: 0.6100000143051147,
    maxParticles: 18,
    particleRadius: 0.3400000035762787,
    radiusFinish: 0.3400000035762787,
    radiusStart: 0.3400000035762787,
    rotation: {
        w: 0.529747486114502,
        x: -1.52587890625e-05,
        y: 0.8481422662734985,
        z: -1.52587890625e-05
    },
    speedSpread: 0,
    textures: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/220px-SNice.svg.png",
    type: "ParticleEffect",
    userData: JSON.stringify({
        grabbableKey: {
            grabbable: false
        }
    })
};

function debugPrint(message) {
    if (DEBUG) {
        print(message);
    }
}

function randomLocalPositionFromDimensions(dimensions) {
    return {
        x: dimensions.x * (Math.random() + HALF_DIMENSION_AXIS_OFFSET),
        y: dimensions.y * (Math.random() + HALF_DIMENSION_AXIS_OFFSET),
        z: dimensions.z * (Math.random() + HALF_DIMENSION_AXIS_OFFSET)
    };
}

function getRandomAttackPosition(randomTarget) {                
    var lowPosition = {
        x: BEAM_TO_POSITION.x,
        y: LOWEST_HOVER_HEIGHT + (RANDOM_ATTACK_BOX_DIMENSIONS.y / 2),
        z: BEAM_TO_POSITION.z
    };

    var direction = Vec3.normalize(Vec3.subtract(lowPosition, randomTarget.position));

    var centerOfBox = Vec3.sum(randomTarget.position,
        Vec3.multiply(direction, CLOSEST_LASER_RANGE + (RANDOM_ATTACK_BOX_DIMENSIONS.z / 2)));

    if (DEBUG_CUBES) {
        Entities.addEntity({
            type: 'Box',
            position: centerOfBox,
            lifetime: 10,
            dimensions: RANDOM_ATTACK_BOX_DIMENSIONS,
            rotation: Quat.lookAtSimple(Vec3.ZERO, direction)
        });
    }
    
    var randomPosition = Vec3.sum(centerOfBox, Vec3.multiplyQbyV(Quat.lookAtSimple(Vec3.ZERO, direction),
        randomLocalPositionFromDimensions(RANDOM_ATTACK_BOX_DIMENSIONS)));
    
    return randomPosition;
}

var getLivePowerSources = function() {
    var livePowerSources = [];
    powerSources.forEach(function(powerSource) {
        if (powerSource.isAlive.call(powerSource)) {
            livePowerSources.push(powerSource);
        }
    });
    return livePowerSources;
};

var getRandomLivePowerSources = function() {
    return getLivePowerSources().sort(function(a, b) {
        return 0.5 - Math.random();
    });
};

var TrackableEntity = (function() {
    function TrackableEntity(properties, label) {
        properties.lifetime = ADDED_LIFETIME;
        this.entity = Entities.addEntity(properties);
        this.label = label;
        this.updateLifetimeForEntity = true;
    }

    TrackableEntity.prototype = {
        entity: null,
        label: null,
        updateLifetimeForEntity: null,
        updateLifetime: function() {
            if (this.entity !== null && this.updateLifetimeForEntity) {
                var currentAge = Entities.getEntityProperties(this.entity, 'age').age;
                Entities.editEntity(this.entity, {
                    lifetime: currentAge + ADDED_LIFETIME
                });
            }
        },
        exists: function() {
            return this.entity !== null;
        }
    };
    return TrackableEntity;
})();

var PowerSource = (function() {
    function PowerSource(name, position) {
        this.name = name;
        this.position = position;
        this.health = 1.0;
        this.trackableEntity = null;
    }

    PowerSource.prototype = {
        trackableEntity: null,
        health: null,
        rez: function(device) {
            var newProperties = JSON.parse(JSON.stringify(POWER_SOURCE_PROPERTIES));
            newProperties.position = this.position;
            this.trackableEntity = new TrackableEntity(newProperties, "PowerSource_" + this.name);
        },
        isAlive: function() {
            return this.health > invasionUtils.MINIMUM_POWER_DEVICE_HEALTH;
        },
        applyDamage: function(damage) {
            var newHealth = this.health - damage;
            if (newHealth < invasionUtils.MINIMUM_POWER_DEVICE_HEALTH) {
                newHealth = invasionUtils.MINIMUM_POWER_DEVICE_HEALTH;
            }
            if (newHealth !== this.health) {
                this.health = newHealth;

                invasionUtils.setPowerDeviceHealth(this.trackableEntity.entity, this.health);
                
                Entities.editEntity(this.trackableEntity.entity, {
                    angularVelocity: Vec3.multiply(POWER_SOURCE_FULL_ANGULAR_VELOCITY, this.health)
                });
            }
            return this.isAlive();
        },
        repair: function(addedHealth) {
            var newHealth = this.health + addedHealth;
            if (newHealth > invasionUtils.MAXIMUM_POWER_DEVICE_HEALTH) {
                newHealth = invasionUtils.MAXIMUM_POWER_DEVICE_HEALTH;
            }
            if (newHealth !== this.health) {
                this.health = newHealth;

                invasionUtils.setPowerDeviceHealth(this.trackableEntity.entity, this.health);
                
                Entities.editEntity(this.trackableEntity.entity, {
                    angularVelocity: Vec3.multiply(POWER_SOURCE_FULL_ANGULAR_VELOCITY, this.health)
                });
            }
        }
    };
    return PowerSource;
})();

var UFO_PATH_ACTION = {
    PAUSE: 0,
    MOVE: 1,
    SPIN_MOVE: 2,
    WARP: 3
};

var UFOMovePathEvent = (function() {
    function UFOMovePathEvent(ufoMoveAction, options) {
        this.ufoMoveAction = ufoMoveAction;
        this.options = options;
    }

    UFOMovePathEvent.prototype = {
        ufoMoveAction: null,
        options: null
    };
    
    return UFOMovePathEvent;
})();

var ALIEN_ROTATION_OFFSET = {x: 0.0, y: 0.5986136794090271, z: 0.0, w: 0.8010378479957581};

var Alien = (function() {
    function Alien(motherShip, position, targetPowerSource) {
        this.motherShip = motherShip;
        this.position = position;
        var newProperties = JSON.parse(JSON.stringify(ALIEN_PROPERTIES));
        newProperties.position = this.position;
        
        var userData = {
            grabbableKey: {
                grabbable: false
            },
            TargetEntity: targetPowerSource.trackableEntity.entity,
            AlienStatus: invasionUtils.UFO_STATUS.MOVING
        };

        newProperties.userData = JSON.stringify(userData);
        
        this.trackableEntity = new TrackableEntity(newProperties, "UFO");
        
        this.pathMoveStack = [];
        this.attackInterval = null;
        this.health = 1.0;
        this.updateStatus(invasionUtils.UFO_STATUS.MOVING);
        this.setTargetPowerSource(targetPowerSource);
        this.goingHome = false;
    }

    Alien.prototype = {
        motherShip: null,
        position: null,
        targetPowerSource: null,
        trackableEntity: null,
        status: null,
        health: null,
        pathMoveStack: null,
        currentMove: null,
        currentMoveTimeout: null,
        movesCompletedCallback: null,
        attackInterval: null,
        goingHome: null,
        setTargetPowerSource: function(targetPowerSource) {
            this.targetPowerSource = targetPowerSource;
            
            invasionUtils.setAlienTarget(this.trackableEntity.entity,
                this.targetPowerSource.trackableEntity.entity);
        },
        attackPowerSource: function() {
            var alien = this;
            Entities.editEntity(this.trackableEntity.entity, {
                rotation: invasionUtils.getAlienFireRotation(this.trackableEntity.entity,
                    this.targetPowerSource.trackableEntity.entity)
            });
            this.updateStatus(invasionUtils.UFO_STATUS.ATTACKING);
            if (this.attackInterval !== null) {
                Script.clearInterval(this.attackInterval);
            }
            this.attackInterval = Script.setInterval(function() {
                if (alien.status !== invasionUtils.UFO_STATUS.ATTACKING) {
                    Script.clearInterval(alien.attackInterval);
                    alien.attackInterval = null;
                    return;
                }
                if (!alien.targetPowerSource.applyDamage.call(alien.targetPowerSource, UFO_ATTACK_DAMAGE)) {
                    // target is destroyed. lets move to another or return home
                    alien.updateStatus(invasionUtils.UFO_STATUS.MOVING);
                    var randomPowerSources = getRandomLivePowerSources();
                    if (randomPowerSources.length > 0) {
                        var randomPowerSource = randomPowerSources[0];
                        alien.setTargetPowerSource(randomPowerSource);
                        var randomPosition = getRandomAttackPosition(randomPowerSource);
                        // next target:
                        alien.movePath.call(alien, [
                            // now move the UFOs towards their target
                            new UFOMovePathEvent(UFO_PATH_ACTION.MOVE, {target: randomPosition, speed: UFO_FULL_SPEED})
                        ], function(alien) {
                            debugPrint('attack mode starting for alien');
                            // lets go in FULL attack mode!
                            alien.attackPowerSource.call(alien);
                        });
                    } else {
                        // E.T. go home:
                        alien.goHomeHappy.call(alien);
                    }
                }
            }, UFO_ATTACK_INTERVAL_MS);
        },
        updateStatus: function(newStatus) {
            if (this.status === newStatus) {
                return; // ignore unchanged
            }
            this.status = newStatus;
            invasionUtils.setAlienStatus(this.trackableEntity.entity, this.status);
        },
        movePath: function(moves, completedCallback) {
            // for now cancel all other actions when this happens:
            this.movesCompletedCallback = completedCallback;
            if (!Array.isArray(moves)) {
                moves = [moves];
            }
            this.pathMoveStack = moves;
            
            this.updateStatus(invasionUtils.UFO_STATUS.MOVING);
            
            this.nextMove();
        },
        nextMove: function() {
            if (this.pathMoveStack.length > 0) {
                var currentMove = this.currentMove = this.pathMoveStack.shift();
                var currentAlien = this;
                
                var timeout = this.currentMove.options.timeout;
                var direction, velocity;
                
                // start of move
                switch (currentMove.ufoMoveAction) {
                    case UFO_PATH_ACTION.PAUSE:
                        // do nothing
                        break;
                    case UFO_PATH_ACTION.MOVE:
                        timeout = (Vec3.distance(currentAlien.position, currentMove.options.target) / currentMove.options.speed)
                            * MILLISECONDS_IN_SECOND;
                        direction = Vec3.normalize(Vec3.subtract(currentMove.options.target, currentAlien.position));
                        velocity = Vec3.multiply(direction, currentMove.options.speed);
                        var rotation = Quat.cancelOutRollAndPitch(Quat.multiply(
                            Quat.lookAt(currentAlien.position, currentMove.options.target, Vec3.UP), ALIEN_ROTATION_OFFSET));

                        Entities.editEntity(currentAlien.trackableEntity.entity, {velocity: velocity, rotation: rotation});
                        break;
                    case UFO_PATH_ACTION.SPIN_MOVE:
                        timeout = (Vec3.distance(currentAlien.position, currentMove.options.target) / currentMove.options.speed)
                            * MILLISECONDS_IN_SECOND;
                        direction = Vec3.normalize(Vec3.subtract(currentMove.options.target, currentAlien.position));
                        velocity = Vec3.multiply(direction, currentMove.options.speed);
                        Entities.editEntity(currentAlien.trackableEntity.entity, {
                            velocity: velocity,
                            angularVelocity: UFO_SPIN_VELOCITY
                        });
                        break;
                    case UFO_PATH_ACTION.WARP:
                        // do nothing
                        break;
                }
                
                this.currentMoveTimeout = Script.setTimeout(function() {
                    // end of move
                    switch (currentMove.ufoMoveAction) {
                        case UFO_PATH_ACTION.PAUSE:
                            // do nothing
                            break;
                        case UFO_PATH_ACTION.MOVE:
                            // end moving
                            Entities.editEntity(currentAlien.trackableEntity.entity, {
                                position: currentMove.options.target,
                                velocity: Vec3.ZERO
                            });
                            currentAlien.position = currentMove.options.target;
                            break;
                        case UFO_PATH_ACTION.SPIN_MOVE:
                            // end spinning
                            Entities.editEntity(currentAlien.trackableEntity.entity, {
                                position: currentMove.options.target,
                                velocity: Vec3.ZERO,
                                angularVelocity: Vec3.ZERO
                            });
                            currentAlien.position = currentMove.options.target;
                            break;
                        case UFO_PATH_ACTION.WARP:
                            // end warping (make the move)
                            Entities.editEntity(currentAlien.trackableEntity.entity, {position: currentMove.options.target});
                            currentAlien.position = currentMove.options.target;
                            break;
                    }
                    
                    // reset move variables
                    currentAlien.currentMove = null;
                    currentAlien.currentMoveTimeout = null;
                    
                    // and start next move!
                    currentAlien.nextMove.call(currentAlien);
                    
                }, timeout);
            } else if (this.movesCompletedCallback) {
                this.movesCompletedCallback.call(this, this);
            }
        },
        applyDamage: function(damage) {
            var newHealth = this.health - damage;
            if (newHealth < 0.0) {
                newHealth = 0.0;
            }
            if (newHealth !== this.health) {
                this.health = newHealth;

                invasionUtils.setAlienHealth(this.trackableEntity.entity, this.health);
                
                if (this.health === 0.0) {
                    // set status to destoyed?
                    this.updateStatus(invasionUtils.UFO_STATUS.CRASHING);
                    this.trackableEntity.updateLifetimeForEntity = false;
                    Entities.editEntity(this.trackableEntity.entity, {
                        dynamic: true,
                        gravity: {x: 0, y: -8, z: 0},
                        velocity: {x: 0, y: -1, z: 0},
                        lifetime: Entities.getEntityProperties(this.trackableEntity.entity, 'age').age + 10
                    });
                    this.motherShip.removeActiveAlien.call(this.motherShip, this);
                }
            }
        },
        goHomeHappy: function() {
            if (this.goingHome) {
                return;
            }
            this.goingHome = true;

            var happySmileProperties = JSON.parse(JSON.stringify(HAPPY_SMILE_PROPERTIES));
            happySmileProperties.parentID = this.trackableEntity.entity;
            happySmileProperties.localPosition = {x: 0, y: 2, z: 0};
            
            Entities.addEntity(happySmileProperties);
            
            this.movePath.call(this, [
                // move back towards the beam
                new UFOMovePathEvent(UFO_PATH_ACTION.MOVE, {target: BEAM_TO_POSITION, speed: UFO_FULL_SPEED}),

                // now move the UFO spiraling up the beam
                new UFOMovePathEvent(UFO_PATH_ACTION.SPIN_MOVE, {target: BEAM_FROM_POSITION, speed: UFO_CAREFUL_SPEED})

            ], function(alien) {
                debugPrint('E.T. Return Home');

                // remove from activeAliens
                alien.motherShip.removeActiveAlien.call(alien.motherShip, alien);
                alien.trackableEntity.updateLifetimeForEntity = false;
                Entities.deleteEntity(alien.trackableEntity.entity);
            });
        }
    };
    return Alien;
})();


var MotherShip = (function() {
    function MotherShip(position, numberOfUfos) {
        this.activeAliens = [];
        this.numberOfUfos = numberOfUfos;
        this.position = position;

        var newProperties = JSON.parse(JSON.stringify(MOTHERSHIP_PROPERTIES));
        newProperties.position = this.position;
        this.trackableEntity = new TrackableEntity(newProperties, "MotherShip");
        
        var zebraOverlordProperties = JSON.parse(JSON.stringify(ZEBRA_OVERLORD_PROPERTIES));
        zebraOverlordProperties.parentID = this.trackableEntity.entity;
        Entities.addEntity(zebraOverlordProperties);

        var currentMothership = this;
        // dramatic entrance, wait few sec before spawning the UFOs
        Script.setTimeout(function() {
            var randomPowerSources = getRandomLivePowerSources();
            
            for (var i = 0; i < currentMothership.numberOfUfos; i++) {
                var randomTarget = randomPowerSources[i % randomPowerSources.length];
                var alien = new Alien(currentMothership, BEAM_FROM_POSITION, randomTarget);
                
                var randomPosition = getRandomAttackPosition(randomTarget);
                
                if (DEBUG_CUBES) {
                    Entities.addEntity({
                        type: 'Box',
                        position: randomPosition,
                        lifetime: 20,
                        dimensions: {x: 0.2, y: 0.2, z: 0.2},
                        color: {red: 0, green: 0, blue: 255}
                    });
                }
                
                alien.movePath.call(alien, [
                    // delay the movement per alien that comes out of the ship
                    new UFOMovePathEvent(UFO_PATH_ACTION.PAUSE, {timeout: i * MILLISECONDS_IN_SECOND}),
                    
                    // first move the UFOs spiraling down the beam
                    new UFOMovePathEvent(UFO_PATH_ACTION.SPIN_MOVE, {target: BEAM_TO_POSITION, speed: UFO_CAREFUL_SPEED}),
                    
                    // now move the UFOs towards their target
                    new UFOMovePathEvent(UFO_PATH_ACTION.MOVE, {target: randomPosition, speed: UFO_FULL_SPEED})
                ], function(alien) {
                    debugPrint('attack mode starting for alien');
                    // lets go in FULL attack mode!
                    alien.attackPowerSource.call(alien);
                });
                
                currentMothership.activeAliens.push(alien);
            }
        }, 2500);
    }

    MotherShip.prototype = {
        activeAliens: null,
        numberOfUfos: null,
        position: null,
        trackableEntity: null,
        updateLifetime: function() {
            this.trackableEntity.updateLifetime();
            if (this.activeAliens !== null) {
                this.activeAliens.forEach(function(activeAlien) {
                    activeAlien.trackableEntity.updateLifetime();
                });
            }
        },
        removeActiveAlien: function(alien) {
            var index = this.activeAliens.indexOf(alien);
            if (index !== -1) {
                this.activeAliens.splice(index, 1);
            }
        }
    };
    return MotherShip;
})();

var powerSources = [
    new PowerSource("DropTower", {x: -21.538, y: -9.052, z: 11.328}),
    new PowerSource("Boomerang", {x: 24.365, y: -9.052, z: -31.682}),
    new PowerSource("PettingZoo", {x: 29.082, y: -9.052, z: -6.361}),
    new PowerSource("ZeroGravityBallPit", {x: 51.877, y: -9.052, z: 21.285}),
    new PowerSource("InvisibleMaze", {x: 37.261, y: -9.052, z: 34.976}),
    new PowerSource("FerrisWheel", {x: -12.053, y: -9.052, z: 46.761})
];


var motherShip = null;

function bringInTheMotherShip() {
    if (motherShip !== null) {
        return;
    }
    // TODO: number of UFO's depend on the amount of active-guests in the park
    motherShip = new MotherShip(MOTHERSHIP_POSITION, NUMBER_OF_UFOS);
}

Agent.isAvatar = true;

Users.disableIgnoreRadius();

var yaw = 0;
var spinningSpeed = 0.1;

var updateInterval = null;

Script.setInterval(function() {
    // update lifetimes
    powerSources.forEach(function(powerSource) {
        if (powerSource.trackableEntity) {
            powerSource.trackableEntity.updateLifetime.call(powerSource.trackableEntity);
        }
    });
    if (motherShip && motherShip.trackableEntity) {
        motherShip.updateLifetime.call(motherShip);
    }
}, LIFETIME_CHECK_INTERVAL);

var initialized = false;


function update(deltaTime) {
    deltaTime = MILLISECONDS_IN_SECOND / UPDATE_RATE_FPS;
    if (!initialized) {
        if (Entities.serversExist() && Entities.canRez()) {
            Entities.setPacketsPerSecond(60000);
            initialized = true;
            
            powerSources.forEach(function(powerSource) {
                powerSource.rez.call(powerSource);
            });
            
            Messages.sendMessage(invasionUtils.INVASION_CHANNEL, JSON.stringify({
                type: 'before_it_all_happens'
            }));
            
            var INITIAL_INVASION_ALERT_TIMEOUT = 3 * MILLISECONDS_IN_SECOND;
            var ALARM_START_TIMEOUT = INITIAL_INVASION_ALERT_TIMEOUT + (2 * MILLISECONDS_IN_SECOND);

            Script.setTimeout(function() {
                Audio.playSound(invasionSound, {
                    volume: 2.0,
                    position: {x: 0, y: 0, z: 0}
                });
                Messages.sendMessage(invasionUtils.INVASION_CHANNEL, JSON.stringify({
                    type: 'invasion_alert'
                }));
            }, INITIAL_INVASION_ALERT_TIMEOUT);

            Script.setTimeout(function() {
                Audio.playSound(alarmSound, {
                    volume: 0.5,
                    position: {x: 0, y: 0, z: 0}
                });
            }, ALARM_START_TIMEOUT);
            var ALARM_TIME = 2770;
            
            Script.setTimeout(function() {
                Audio.playSound(alarmSound, {
                    volume: 0.75,
                    position: {x: 0, y: 0, z: 0}
                });
            }, ALARM_START_TIMEOUT + ALARM_TIME);

            Script.setTimeout(function() {
                Audio.playSound(alarmSound, {
                    volume: 1.0,
                    position: {x: 0, y: 0, z: 0}
                });
                Messages.sendMessage(invasionUtils.INVASION_CHANNEL, JSON.stringify({
                    type: 'mothership'
                }));
                bringInTheMotherShip();
            }, ALARM_START_TIMEOUT + (ALARM_TIME * 2));
        }
        Messages.subscribe(invasionUtils.ALIEN_CHANNEL_BASE);
        Messages.subscribe(invasionUtils.REPAIR_CHANNEL);
        return;
    }
    yaw = (yaw + (deltaTime * spinningSpeed)) % MAX_DEGREES_IN_A_FULL_REVOLUTION;
    Avatar.orientation = Quat.fromVec3Degrees({x: 0, y: yaw, z: 0});
}

Avatar.position = {x: 23.9099, y: -9.96, z: 19.7429};
Avatar.scale = 5;
Avatar.displayName = "Park Mascot: Leaky Bot";
Avatar.skeletonModelURL = "http://mpassets.highfidelity.com/24aa02b0-5aaa-4ebd-a413-30112b74060e-v1/Robimo_blue[1].fst";

EntityViewer.setPosition({
    x: 0.0,
    y: 2.0,
    z: 0.0
});

EntityViewer.setCenterRadius(60000);

// This should allow us to see nano-scale entities from great distances
EntityViewer.setVoxelSizeScale(Number.MAX_VALUE);

var OCTREE_UPDATE_TIMEOUT = MILLISECONDS_IN_SECOND; // 1 second

var octreeQueryInterval = Script.setInterval(function() {
    EntityViewer.queryOctree();
}, OCTREE_UPDATE_TIMEOUT);


Messages.messageReceived.connect(function(channel, message, sender) {
    if (channel === invasionUtils.ALIEN_CHANNEL_BASE) {
        var alienData = JSON.parse(message);
        if (alienData.type === "HitAlienWithLaser") {
            motherShip.activeAliens.forEach(function(activeAlien) {
                if (activeAlien.trackableEntity.entity === alienData.alienID) {
                    activeAlien.applyDamage.call(activeAlien, 0.1);
                }
            });
        } else if (alienData.type === "HitAlienWithFood") {
            motherShip.activeAliens.forEach(function(activeAlien) {
                if (activeAlien.trackableEntity.entity === alienData.alienID) {
                    activeAlien.goHomeHappy.call(activeAlien);
                }
            });
        }
    } else if (channel === invasionUtils.REPAIR_CHANNEL) {
        var repairData = JSON.parse(message);
        if (repairData.type === "RepairPowerSource") {
            powerSources.forEach(function(powerSource) {
                if (powerSource.trackableEntity.entity === repairData.powerSourceID) {
                    powerSource.repair.call(powerSource, 0.25);
                }
            });
        }
    }
});

updateInterval = Script.setInterval(update, MILLISECONDS_IN_SECOND / UPDATE_RATE_FPS);
