/* eslint-disable indent */

// DEPENDENCIES
// ////////////////////////////////////////////////////////////////////////
    var
    // SEQUENCER = Script.require(
    //  "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/Prototyping/Particle-Sequencer/Particle_Sequencer.js?" + Date.now())
    SEQUENCER = Script.require("./Particle_Sequencer.js?" + Date.now())


// SETUPS AND CONSTS
// ////////////////////////////////////////////////////////////////////////

    // ENTITY CONSTS
    // ////////////////////////////////////////////////////////////////////////

    var 
    // General
    // ////////////////////////////////////////////////////////////////

        POSITION = "position",
        ROTATION = "rotation",

    // HOOKS
    // ////////////////////////////////////////////////////////////

        CLICK_DOWN = "clickDownOnEntity",
        CLICK_RELEASE = "clickReleaseOnEntity",
        CLICK_HOLD = "holdingClickOnEntity",
        MOUSE_MOVE = "mouseMoveOnEntity",
        MOUSE_PRESS = "mousePressOnEntity",
        MOUSE_RELEASE = "mouseReleaseOnEntity",
        MOUSE_DOUBLE_PRESS_OFF = "mouseDoublePressOffEntity",
        HOVER_ENTER = "hoverEnterEntity",
        HOVER_LEAVE = "hoverLeaveEntity",
        HOVER_OVER = "hoverOverEntity",
        WEB_EVENT = "webEventReceived",
        LEAVE = "leaveEntity",
        ENTER = "enterEntity",
        COLLISION = "collisionWithEntity",
        START_TRIGGER = "startTrigger",
        STOP_TRIGGER = "stopTrigger",
        START_FAR_TRIGGER = "startFarTrigger",
        CONTINUE_FAR_TRIGGER = "continueFarTrigger",
        STOP_FAR_TRIGGER = "stopFarTrigger",
        START_NEAR_TRIGGER = "startNearTrigger",
        CONTINUE_NEAR_TRIGGER = "continueNearTrigger",
        STOP_NEAR_TRIGGER = "stopNearTrigger",
        START_DISTANCE_GRAB = "startDistanceGrab",
        CONTINUE_DISTANCE_GRAB = "continueDistanceGrab",
        START_NEAR_GRAB = "startNearGrab",
        CONTINUE_NEAR_GRAB = "continueNearGrab",
        RELEASE_GRAB = "releaseGrab",
        START_EQUIP = "startEquip",
        CONTINUE_EQUIP = "continueEquip",
        RELEASE_EQUIP = "releaseEquip",

    // Particles
    // ////////////////////////////////////////////////////////////////

        LIFESPAN = "lifespan",
        MAX_PARTICLES = "maxParticles",
        TEXTURES = "textures",
        SPEED_SPREAD = "speedSpread",
        IS_EMITTING = "isEmitting",
        EMIT_RADIUS_START = "emitRadiusStart",
        EMIT_RATE = "emitRate",
        EMIT_SPEED = "emitSpeed",
        EMIT_DIMENSIONS = "emitDimensions",
        EMIT_ORIENTATION = "emitOrientation",
        EMIT_ACCELERATION = "emitAcceleration",
        EMITTER_SHOULD_TRAIL = "emitterShouldTrail",
        PARTICLE_RADIUS = "particleRadius",
        SPIN_SPREAD = "spinSpread",
        SPIN_START = "spinStart",
        SPIN_FINISH = "spinFinish",
        ROTATE_WITH_ENTITY = "rotateWithEntity",
        PARTICLE_SPIN = "particleSpin",
        RADIUS_SPREAD = "radiusSpread",
        RADIUS_START = "radiusStart",
        RADIUS_FINISH = "radiusFinish",
        COLOR = "color",
        COLOR_SPREAD = "colorSpread",
        COLOR_START = "colorStart",
        COLOR_FINISH = "colorFinish",
        ACCELERATION_SPREAD = "accelerationSpread",
        ALPHA = "alpha",
        ALPHA_SPREAD = "alphaSpread",
        ALPHA_START = "alphaStart",
        ALPHA_FINISH = "alphaFinish",
        POLOR_START = "polarStart",
        POLOR_FINISH = "polarFinish",
        AZIMUTH_START = "azimuthStart",
        AZIMUTH_FINISH = "azimuthFinish",
    
    // MIN AND MAX
    // ////////////////////////////////////////////////////////////////

        MINIMUM_MAX_PARTICLES = 1,
        MAXIMUM_MAX_PARTICLES = 100000,
        MINIMUM_LIFESPAN = 0.0,
        MAXIMUM_LIFESPAN = 86400.0,  // 1 day
        MINIMUM_EMIT_RATE = 0.0,
        MAXIMUM_EMIT_RATE = 100000.0,
        MINIMUM_EMIT_SPEED = -1000.0,
        MAXIMUM_EMIT_SPEED = 1000.0,  // Approx mach 3
        MINIMUM_EMIT_DIMENSION = 0.0,
        MAXIMUM_EMIT_DIMENSION = 32768,
        MINIMUM_EMIT_RADIUS_START = 0.0,
        MAXIMUM_EMIT_RADIUS_START = 1.0,
        MINIMUM_EMIT_ACCELERATION = -100.0, // ~ 10g
        MAXIMUM_EMIT_ACCELERATION = 100.0,
        MINIMUM_ACCELERATION_SPREAD = 0.0,
        MAXIMUM_ACCELERATION_SPREAD = 100.0,
        MINIMUM_PARTICLE_RADIUS = 0.0,
        MAXIMUM_PARTICLE_RADIUS = 32768,
        MINIMUM_PARTICLE_SPIN = -2.0 * Math.PI,
        MAXIMUM_PARTICLE_SPIN = 2.0 * Math.PI
;

// PARTICLE SEQUENCER CONSTS
// ////////////////////////////////////////////////////////////////////////

var
    LOOP = "loop",
    START = "start",
    END = "end",
    TO = "to",
    AT = "at",
;


// USER FILL OUT BELOW
// ////////////////////////////////////////////////////////////////////////

// TEXTURES
// ////////////////////////////////////////////////////////////////////////

// Add your textures here
var textures = {
    atmosphere: "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/atmosphere-particle-2.png",
    bokeh: "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/Bokeh-Particle-2.png",
    cloud: "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/cloud-sprite.png",
    fireball: "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/Fireball.jpg",
    heart: "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/heart-2.png",
    spark: "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/Particle-Spark.png",
    plasma: "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/plasma-sprite.png",
    dust: "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/playaDust.png",
    rainbow: "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/rainbow.png",
    mist: "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/mist-sprite.png",
    star: "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/Star-sprite.png",
    water: "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/water-bubble.png",
    triangle: "https://hifi-content.s3.amazonaws.com/alan/dev/Particle-Triangle.png"
}

// PARTICLES
// ////////////////////////////////////////////////////////////////////////

// Add your particles here
var sequencedEntities = {
        "SMOKE": {
            "accelerationSpread": {
            "blue": 0.20000000298023224,
            "green": 0.20000000298023224,
            "red": 0.20000000298023224,
            "x": 0.20000000298023224,
            "y": 0.20000000298023224,
            "z": 0.20000000298023224
        },
        "alpha": 0,
        "alphaFinish": 0,
        "alphaStart": 1,
        "color": {
            "blue": 200,
            "green": 200,
            "red": 200
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
            "blue": 61,
            "green": 61,
            "red": 61,
            "x": 61,
            "y": 61,
            "z": 61
        },
        "emitAcceleration": {
            "blue": 0,
            "green": 1,
            "red": 0,
            "x": 0,
            "y": 1,
            "z": 0
        },
        "emitOrientation": {
            "w": 0.7070763111114502,
            "x": -0.7071372866630554,
            "y": -1.5258539860951714e-05,
            "z": -1.5258539860951714e-05
        },
        "emitRate": 30,
        "emitSpeed": 0,
        "maxParticles": 40,
        "particleRadius": 2,
        "radiusFinish": 0,
        "radiusStart": 1,
        "speedSpread": 0,
        "spinFinish": null,
        "spinStart": null,
        "textures": "http://hifi-content.s3.amazonaws.com/alexia/Particles/smoke.png"
    },
    "TWINKLE": {
        "accelerationSpread": {
            "blue": 0.5,
            "green": 1,
            "red": 0.5,
            "x": 0.5,
            "y": 1,
            "z": 0.5
        },
        "alphaFinish": 1,
        "alphaSpread": 1,
        "alphaStart": 1,
        "clientOnly": false,
        "color": {
            "blue": 0,
            "green": 183,
            "red": 255
        },
        "colorFinish": {
            "blue": 255,
            "green": 252,
            "red": 255,
            "x": 255,
            "y": 252,
            "z": 255
        },
        "colorStart": {
            "blue": 20,
            "green": 149,
            "red": 255,
            "x": 255,
            "y": 149,
            "z": 20
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
            "blue": 0.5,
            "green": 0.5,
            "red": 0.5,
            "x": 0.5,
            "y": 0.5,
            "z": 0.5
        },
        "emitOrientation": {
            "w": 0.7070915699005127,
            "x": -0.7071220278739929,
            "y": -1.5258869098033756e-05,
            "z": -1.5258869098033756e-05
        },
        "emitRate": 100,
        "emitSpeed": 0,
        "emitterShouldTrail": true,
        "lifespan": 0.699999988079071,
        "maxParticles": 6,
        "particleRadius": 0.20000000298023224,
        "particleSpin": 0.2617993950843811,
        "polarFinish": 3.1415927410125732,
        "radiusFinish": 0.10000000149011612,
        "radiusSpread": 0.30000001192092896,
        "radiusStart": 0,
        "speedSpread": 0.5,
        "spinFinish": 1.3089969158172607,
        "spinSpread": 3.0019662380218506,
        "spinStart": -0.8901179432868958,
        "textures": "http://hifi-content.s3.amazonaws.com/alexia/Particles/twinkle.png",
    },
    "HEARTS": {
        "accelerationSpread": {
            "blue": 0.5,
            "green": 1,
            "red": 0.5,
            "x": 0.5,
            "y": 1,
            "z": 0.5
        },
        "alphaFinish": 1,
        "alphaStart": 1,
        "clientOnly": false,
        "color": {
            "blue": 0,
            "green": 0,
            "red": 255
        },
        "colorFinish": {
            "blue": 162,
            "green": 0,
            "red": 255,
            "x": 255,
            "y": 0,
            "z": 162
        },
        "colorStart": {
            "blue": 0,
            "green": 0,
            "red": 255,
            "x": 255,
            "y": 0,
            "z": 0
        },
        "emitAcceleration": {
            "blue": -0.5,
            "green": 2,
            "red": -0.5,
            "x": -0.5,
            "y": 2,
            "z": -0.5
        },
        "emitDimensions": {
            "blue": 0.5,
            "green": 0,
            "red": 0.5,
            "x": 0.5,
            "y": 0,
            "z": 0.5
        },
        "emitOrientation": {
            "w": 1,
            "x": -1.52587890625e-05,
            "y": -1.52587890625e-05,
            "z": -1.52587890625e-05
        },
        "emitRate": 3,
        "emitSpeed": 0,
        "emitterShouldTrail": true,
        "lifespan": 1,
        "maxParticles": 5,
        "particleRadius": 0.25,
        "polarFinish": 3.1415927410125732,
        "radiusFinish": 0.10000000149011612,
        "radiusStart": 0,
        "speedSpread": 0,
        "spinFinish": null,
        "spinStart": null,
        "textures": "http://hifi-content.s3.amazonaws.com/alexia/Particles/heart.png"
    }

};

// SEQUENCE
// ////////////////////////////////////////////////////////////////////////

// Add your sequence below
var sequence = {
    "SMOKE": [
        [
            "START explode",
            "CHANGE position TO 0.1,0,0 AT 100",
            "CHANGE position TO 0,0.1,0 AT 500",
            "CHANGE position TO 0,0,0.1 AT 1000",
            "CHANGE textures to atmosphere at 500",
            "CHANGE textures to bokeh at 800",
            "CHANGE textures to fireball at 1600",
            "CHANGE textures to dust at 2000",
            "CHANGE MAX_PARTICLES to 75 at 500",
            "CHANGE MAX_PARTICLES to 1200 at 850",
            "CHANGE MAX_PARTICLES to 3000 at 1500",
            "CHANGE LIFESPAN to 0.5 at 500",
            "CHANGE LIFESPAN to 1 at 1000",
            "CHANGE LIFESPAN to 3 at 2000",
            "CHANGE EMITTER_SHOULD_TRAIL to false at 250",
            "CHANGE EMITTER_SHOULD_TRAIL to true at 550",
            "CHANGE EMITTER_SHOULD_TRAIL to false at 2500",
            "CHANGE EMIT_RADIUS_START to 0.2 at 500",
            "CHANGE EMIT_RADIUS_START to 0.5 at 1000",
            "CHANGE EMIT_RATE to 500 at 500",
            "CHANGE EMIT_RATE to 2500 at 1000",
            "CHANGE EMIT_RATE to 7500 at 1750",
            "CHANGE speed_spread to 1 at 250",
            "CHANGE speed_spread to 2 at 500",
            "CHANGE speed_spread to 3 at 700",
            "CHANGE speed_spread to 4 at 1500",
            "CHANGE COLOR_START to 0,80,132 at 250",
            "CHANGE COLOR_START to 25,0,255 at 500",
            "CHANGE COLOR_START to 255,80,0 at 700",
            "CHANGE COLOR_START to 255,0,132 at 1500",
            "CHANGE COLOR_FINISH to 0,255,0 at 250",
            "CHANGE COLOR_FINISH to 0,54,255 at 500",
            "CHANGE COLOR_FINISH to 0,80,54 at 700",
            "CHANGE COLOR_FINISH to 43,0,255 at 1500",
            "CHANGE EMIT_SPEED to 5 at 50",
            "CHANGE EMIT_SPEED to 20 at 250",
            "CHANGE EMIT_SPEED to 75 at 850",
            "CHANGE EMIT_SPEED to 150 at 1500",
            "CHANGE PARTICLE_RADIUS to 1 at 50",
            "CHANGE PARTICLE_RADIUS to 2 at 250",
            "CHANGE PARTICLE_RADIUS to 3 at 850",
            "CHANGE PARTICLE_RADIUS to 30 at 1500",
            "CHANGE SPIN_SPREAD to 1 at 50",
            "CHANGE SPIN_SPREAD to 2 at 750",
            "CHANGE SPIN_SPREAD to 3 at 1850",
            "CHANGE SPIN_SPREAD to -3 at 2500",
            "CHANGE EMIT_ORIENTATION to 0,10,0 at 500",
            "CHANGE EMIT_ORIENTATION to 0,20,0 at 1000",
            "CHANGE EMIT_ORIENTATION to 0,30,0 at 1500",
            "CHANGE EMIT_ORIENTATION to 0,40,0 at 2000",
            "CHANGE EMIT_ACCELERATION to 2,2,3 at 50",
            "CHANGE EMIT_ACCELERATION to 5,6,7 at 450",
            "CHANGE EMIT_ACCELERATION to 7,4,3 at 650",
            "CHANGE EMIT_ACCELERATION to 5,6,10 at 900",
            "CHANGE loop TO 0 AT 3000",
            "END"
        ]
    ],
    "TWINKLE": [
        [
            "START explode",
            "CHANGE position TO 0.5,0,0 AT 100",
            "CHANGE position TO 0,0.5,0 AT 500",
            "CHANGE position TO 0,0,0.6 AT 1000",
            "CHANGE textures to cloud at 500",
            "CHANGE textures to heart at 800",
            "CHANGE textures to spark at 1600",
            "CHANGE textures to star at 2000",
            "CHANGE MAX_PARTICLES to 300 at 500",
            "CHANGE MAX_PARTICLES to 5000 at 850",
            "CHANGE MAX_PARTICLES to 7500 at 1500",
            "CHANGE LIFESPAN to 5.5 at 500",
            "CHANGE LIFESPAN to 3 at 1000",
            "CHANGE LIFESPAN to 1 at 2000",
            "CHANGE EMITTER_SHOULD_TRAIL to false at 250",
            "CHANGE EMITTER_SHOULD_TRAIL to true at 550",
            "CHANGE EMITTER_SHOULD_TRAIL to false at 2500",
            "CHANGE EMIT_RADIUS_START to 0.2 at 500",
            "CHANGE EMIT_RADIUS_START to 0.9 at 1000",
            "CHANGE EMIT_RATE to 200 at 500",
            "CHANGE EMIT_RATE to 6500 at 1000",
            "CHANGE EMIT_RATE to 500 at 1750",
            "CHANGE speed_spread to 1 at 250",
            "CHANGE speed_spread to 2 at 500",
            "CHANGE speed_spread to 1 at 700",
            "CHANGE speed_spread to 2 at 1500",
            "CHANGE COLOR_FINISH to 0,80,132 at 250",
            "CHANGE COLOR_FINISH to 25,0,255 at 500",
            "CHANGE COLOR_FINISH to 255,80,0 at 700",
            "CHANGE COLOR_FINISH to 255,0,132 at 1500",
            "CHANGE COLOR_START to 0,255,0 at 250",
            "CHANGE COLOR_START to 0,54,255 at 500",
            "CHANGE COLOR_START to 0,80,54 at 700",
            "CHANGE COLOR_START to 43,0,255 at 1500",
            "CHANGE EMIT_SPEED to 5 at 50",
            "CHANGE EMIT_SPEED to 20 at 250",
            "CHANGE EMIT_SPEED to 75 at 850",
            "CHANGE EMIT_SPEED to 550 at 1500",
            "CHANGE PARTICLE_RADIUS to 15 at 50",
            "CHANGE PARTICLE_RADIUS to 28 at 250",
            "CHANGE PARTICLE_RADIUS to 2 at 850",
            "CHANGE PARTICLE_RADIUS to 30 at 1500",
            "CHANGE SPIN_SPREAD to 1 at 50",
            "CHANGE SPIN_SPREAD to 3 at 750",
            "CHANGE SPIN_SPREAD to -2 at 1850",
            "CHANGE SPIN_SPREAD to -3 at 2500",
            "CHANGE EMIT_ORIENTATION to 0,30,0 at 500",
            "CHANGE EMIT_ORIENTATION to 0,50,0 at 1000",
            "CHANGE EMIT_ORIENTATION to 0,70,0 at 1500",
            "CHANGE EMIT_ORIENTATION to 0,80,0 at 2000",
            "CHANGE EMIT_ACCELERATION to 6,2,3 at 50",
            "CHANGE EMIT_ACCELERATION to 5,6,7 at 450",
            "CHANGE EMIT_ACCELERATION to 7,4,9 at 650",
            "CHANGE EMIT_ACCELERATION to 9,6,10 at 900",
            "CHANGE loop TO 0 AT 3000",
            "END"
        ]
    ],
    "HEARTS": [
        [
            "START explode",
            "CHANGE position TO 0.1,0,0.4 AT 100",
            "CHANGE position TO 0,0.1,0.8 AT 500",
            "CHANGE position TO 0,0,0.1.5 AT 1000",
            "CHANGE textures to rainbow at 500",
            "CHANGE textures to triangle at 800",
            "CHANGE textures to water at 1600",
            "CHANGE textures to dust at 2000",
            "CHANGE MAX_PARTICLES to 765 at 500",
            "CHANGE MAX_PARTICLES to 200 at 850",
            "CHANGE MAX_PARTICLES to 8000 at 1500",
            "CHANGE LIFESPAN to 0.5 at 500",
            "CHANGE LIFESPAN to 1 at 1000",
            "CHANGE LIFESPAN to 10 at 2000",
            "CHANGE EMITTER_SHOULD_TRAIL to false at 250",
            "CHANGE EMITTER_SHOULD_TRAIL to true at 550",
            "CHANGE EMITTER_SHOULD_TRAIL to false at 2500",
            "CHANGE EMIT_RADIUS_START to 0.2 at 500",
            "CHANGE EMIT_RADIUS_START to 0.5 at 1000",
            "CHANGE EMIT_RATE to 500 at 500",
            "CHANGE EMIT_RATE to 2500 at 1000",
            "CHANGE EMIT_RATE to 7500 at 1750",
            "CHANGE speed_spread to 1 at 250",
            "CHANGE speed_spread to 2 at 500",
            "CHANGE speed_spread to 3 at 700",
            "CHANGE speed_spread to 4 at 1500",
            "CHANGE EMIT_SPEED to 5 at 50",
            "CHANGE EMIT_SPEED to 20 at 250",
            "CHANGE EMIT_SPEED to 75 at 850",
            "CHANGE EMIT_SPEED to 150 at 1500",
            "CHANGE PARTICLE_RADIUS to 1 at 50",
            "CHANGE PARTICLE_RADIUS to 2 at 250",
            "CHANGE PARTICLE_RADIUS to 3 at 850",
            "CHANGE PARTICLE_RADIUS to 30 at 1500",
            "CHANGE COLOR_START to 0,80,132 at 250",
            "CHANGE COLOR_START to 25,0,255 at 500",
            "CHANGE COLOR_START to 255,80,0 at 700",
            "CHANGE COLOR_START to 255,0,132 at 1500",
            "CHANGE COLOR_FINISH to 0,255,0 at 250",
            "CHANGE COLOR_FINISH to 0,54,255 at 500",
            "CHANGE COLOR_FINISH to 0,80,54 at 700",
            "CHANGE COLOR_FINISH to 43,0,255 at 1500",
            "CHANGE SPIN_SPREAD to 1 at 50",
            "CHANGE SPIN_SPREAD to 2 at 750",
            "CHANGE SPIN_SPREAD to 3 at 1850",
            "CHANGE SPIN_SPREAD to -3 at 2500",
            "CHANGE EMIT_ORIENTATION to 0,10,0 at 500",
            "CHANGE EMIT_ORIENTATION to 0,20,0 at 1000",
            "CHANGE EMIT_ORIENTATION to 0,30,0 at 1500",
            "CHANGE EMIT_ORIENTATION to 0,40,0 at 2000",
            "CHANGE EMIT_ACCELERATION to 2,2,3 at 50",
            "CHANGE EMIT_ACCELERATION to 5,6,7 at 450",
            "CHANGE EMIT_ACCELERATION to 7,4,3 at 650",
            "CHANGE EMIT_ACCELERATION to 5,6,10 at 900",
            "CHANGE loop TO 0 AT 3000",
            "END"
        ]
    ]
};


// REGISTER HOOKS HERE!
// ////////////////////////////////////////////////////////////
var hooks = {
"explode": {
    start: [MOUSE_PRESS],
    stop: [MOUSE_PRESS]
},
"ohno": {
    start: [ENTER],
    stop: [LEAVE]
}
};


module.exports = {
sequencedEntities: sequencedEntities,
hooks: hooks,
sequence: sequence,
textures: textures
};


/*
        // [
        //     "START ohno",
        //     "CHANGE color TO 0,255,0 AT 500",
        //     "CHANGE color_start TO 0,255,0 AT 500",
        //     "CHANGE position TO 0,0.5,0 AT 750",
        //     "CHANGE loop TO 0 AT 1500",
        //     "END"
        // ]
    ]
    // "SMOKE": [
    //     [
    //         "START explode",
    //         "CHANGE color TO 255,255,0 AT 500",
    //         "CHANGE color_start TO 255,255,0 AT 500",
    //         "CHANGE position TO 0,2,0 AT 1000",
    //         "CHANGE loop TO 0 AT 1500",
    //         "END"
    //     ],
    //     [
    //         "START ohno",
    //         "CHANGE color TO 255,255,0 AT 500",
    //         "CHANGE color_start TO 255,255,0 AT 500",
    //         "CHANGE position TO 0,0.5,0 AT 750",
    //         "CHANGE loop TO 0 AT 1500",
    //         "END"
    //     ]
    // ]
*/