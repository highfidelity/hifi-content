 /* eslint-disable indent */

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
    "FIRE": 
        {"isEmitting":true,"lifespan":"1.5","maxParticles":"10","textures":"https://content.highfidelity.com/DomainContent/production/Particles/wispy-smoke.png","emitRate":"5.5","emitSpeed":"0","speedSpread":"0","emitDimensions":{"x":"0","y":"0","z":"0"},"emitOrientation":{"x":"-90","y":"0","z":"0"},"emitterShouldTrail":true,"particleRadius":"0.25","radiusSpread":"0","radiusStart":"0","radiusFinish":"0.10000000149011612","color":{"red":"200","blue":"200","green":"200"},"colorSpread":{"red":"0","blue":"0","green":"0"},"colorStart":{"red":"200","blue":"200","green":"200"},"colorFinish":{"red":"0","blue":"0","green":"0"},"emitAcceleration":{"x":"-0.5","y":"2.5","z":"-0.5"},"accelerationSpread":{"x":"0.5","y":"1","z":"0.5"},"alpha":"0","alphaSpread":"0","alphaStart":"1","alphaFinish":"0","particleSpin":0,"spinSpread":0,"spinStart":0,"spinFinish":0,"rotateWithEntity":false,"polarStart":0,"polarFinish":0,"azimuthStart":-3.1415927410125732,"azimuthFinish":3.1415927410125732}  
    // ,
    // "SMOKE": 
        // { "isEmitting": true, "lifespan": "1.5", "maxParticles": "10", "textures": "https://content.highfidelity.com/DomainContent/production/Particles/wispy-smoke.png", "emitRate": "95", "emitSpeed": "1.35", "speedSpread": "1.35", "emitDimensions": { "x": "0", "y": "20", "z": "0" }, "emitOrientation": { "x": "0", "y": "90", "z": "0" }, "emitterShouldTrail": true, "particleRadius": "0.25", "radiusSpread": "0", "radiusStart": "0", "radiusFinish": "0.10000000149011612", "color": { "red": "200", "blue": "200", "green": "200" }, "colorSpread": { "red": "0", "blue": "0", "green": "0" }, "colorStart": { "red": "200", "blue": "200", "green": "200" }, "colorFinish": { "red": "0", "blue": "0", "green": "0" }, "emitAcceleration": { "x": "-0.5", "y": "2.5", "z": "-0.5" }, "accelerationSpread": { "x": "0.5", "y": "1", "z": "0.5" }, "alpha": "0", "alphaSpread": "0", "alphaStart": "1", "alphaFinish": "0", "particleSpin": 0, "spinSpread": 0, "spinStart": 0, "spinFinish": 0, "rotateWithEntity": false, "polarStart": 0, "polarFinish": 0, "azimuthStart": -3.1415927410125732, "azimuthFinish": 3.1415927410125732 }
};

// SEQUENCE
// ////////////////////////////////////////////////////////////////////////

// Add your sequence below
var sequence = {
    "FIRE": [
        [
            "START explode",
            "CHANGE position TO 0,0,0 AT 100",
            "CHANGE emit_rate TO 150 at 100",
            "CHANGE textures to atmosphere at 500",
            "CHANGE textures to bokeh at 800",
            "CHANGE textures to fireball at 1600",
            "CHANGE textures to dust at 2000",
            "CHANGE MAX_PARTICLES to 20 at 500",
            "CHANGE MAX_PARTICLES to 500 at 850",
            "CHANGE MAX_PARTICLES to 1500 at 1500",
            "CHANGE emit_acceleration to 20,10,10 at 200",
            "CHANGE color TO 255,255,0 AT 500",
            "CHANGE color_finish TO 255,255,0 AT 500",
            "CHANGE emit_rate TO 5000 at 1000",
            "CHANGE color_start TO 0,255,0 AT 500",
            "CHANGE color_start TO 100,155,0 AT 1000",
            "CHANGE color_start TO 0,255,200 AT 1500",
            "CHANGE position TO 0.5,0,0 AT 2000",
            "CHANGE loop TO 0 AT 3000",
            "END"
        ]
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