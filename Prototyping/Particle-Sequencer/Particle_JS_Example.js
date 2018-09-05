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
            LOOP = "loop"
        ;


// USER FILL OUT BELOW
// ////////////////////////////////////////////////////////////////////////

    // PARTICLES
    // ////////////////////////////////////////////////////////////////////////
        // Add your particles here
        var sequencedEntities = {
            "FIRE": { "isEmitting": true, "lifespan": "1.5", "maxParticles": "10", "textures": "https://content.highfidelity.com/DomainContent/production/Particles/wispy-smoke.png", "emitRate": "95", "emitSpeed": "1.35", "speedSpread": "1.35", "emitDimensions": { "x": "0", "y": "20", "z": "0" }, "emitOrientation": { "x": "0", "y": "90", "z": "0" }, "emitterShouldTrail": true, "particleRadius": "0.25", "radiusSpread": "0", "radiusStart": "0", "radiusFinish": "0.10000000149011612", "color": { "red": "200", "blue": "200", "green": "200" }, "colorSpread": { "red": "0", "blue": "0", "green": "0" }, "colorStart": { "red": "200", "blue": "200", "green": "200" }, "colorFinish": { "red": "0", "blue": "0", "green": "0" }, "emitAcceleration": { "x": "-0.5", "y": "2.5", "z": "-0.5" }, "accelerationSpread": { "x": "0.5", "y": "1", "z": "0.5" }, "alpha": "0", "alphaSpread": "0", "alphaStart": "1", "alphaFinish": "0", "particleSpin": 0, "spinSpread": 0, "spinStart": 0, "spinFinish": 0, "rotateWithEntity": false, "polarStart": 0, "polarFinish": 0, "azimuthStart": -3.1415927410125732, "azimuthFinish": 3.1415927410125732 },
            "SMOKE": { "isEmitting": true, "lifespan": "1.5", "maxParticles": "10", "textures": "https://content.highfidelity.com/DomainContent/production/Particles/wispy-smoke.png", "emitRate": "95", "emitSpeed": "1.35", "speedSpread": "1.35", "emitDimensions": { "x": "0", "y": "20", "z": "0" }, "emitOrientation": { "x": "0", "y": "90", "z": "0" }, "emitterShouldTrail": true, "particleRadius": "0.25", "radiusSpread": "0", "radiusStart": "0", "radiusFinish": "0.10000000149011612", "color": { "red": "200", "blue": "200", "green": "200" }, "colorSpread": { "red": "0", "blue": "0", "green": "0" }, "colorStart": { "red": "200", "blue": "200", "green": "200" }, "colorFinish": { "red": "0", "blue": "0", "green": "0" }, "emitAcceleration": { "x": "-0.5", "y": "2.5", "z": "-0.5" }, "accelerationSpread": { "x": "0.5", "y": "1", "z": "0.5" }, "alpha": "0", "alphaSpread": "0", "alphaStart": "1", "alphaFinish": "0", "particleSpin": 0, "spinSpread": 0, "spinStart": 0, "spinFinish": 0, "rotateWithEntity": false, "polarStart": 0, "polarFinish": 0, "azimuthStart": -3.1415927410125732, "azimuthFinish": 3.1415927410125732 }
        };

    // SEQUENCE
    // ////////////////////////////////////////////////////////////////////////
        // Add your sequence below
        var sequence = {
            "FIRE": [
                [
                    "START explode",
                    "CHANGE color TO 0,255,0 AT 500",
                    "CHANGE color_start TO 0,255,0 AT 500",
                    "CHANGE position TO 0,0.5,0 AT 1000",
                    "CHANGE loop TO 0 AT 1500"
                ],
                [
                    "START ohno",
                    "CHANGE color TO 0,255,0 AT 500",
                    "CHANGE color_start TO 0,255,0 AT 500",
                    "CHANGE position TO 0,0.5,0 AT 750",
                    "CHANGE loop TO 0 AT 1500"
                ]
            ],
            "SMOKE": [
                [
                    "START explode",
                    "CHANGE color TO 255,255,0 AT 500",
                    "CHANGE color_start TO 255,255,0 AT 500",
                    "CHANGE position TO 0,0.5,0 AT 1000",
                    "CHANGE loop TO 0 AT 1500"
                ],
                [
                    "START ohno",
                    "CHANGE color TO 255,255,0 AT 500",
                    "CHANGE color_start TO 255,255,0 AT 500",
                    "CHANGE position TO 0,0.5,0 AT 750",
                    "CHANGE loop TO 0 AT 1500"
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
    sequence: sequence
};