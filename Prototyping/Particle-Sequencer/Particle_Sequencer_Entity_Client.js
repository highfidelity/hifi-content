(function(){
    /* eslint-disable indent */
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
            ON = true,
            OFF = false
        ;

    // INIT
    // ////////////////////////////////////////////////////////////////////////
        var
            _this
        ;
    // HELPER FUNCTIONS
    // ////////////////////////////////////////////////////////////////////////
        function log(label, value){
            print(label, JSON.stringify(value));
        }

    // ENTITY DEFINITION
    // ////////////////////////////////////////////////////////////////////////
        function Particle_Sequencer_Client() {
            this._entityID = null;
            this._position = {};
            this._sequenceHooks = {};
            _this = this;
        }

        Particle_Sequencer_Client.prototype = {
            preload: function(id){
                this._entityID = id;

                // REGISTER HOOKS HERE!
                // ////////////////////////////////////////////////////////////
                var hooks = this._sequenceHooks;

                hooks["explode"] = {
                    start: [CLICK_DOWN],
                    stop: [CLICK_RELEASE]
                }


                /*

                */
                // TODO: This only supports one sequence per hook type
                // TODO: ADD RANDOM if more then one sequence given
                // TODO: ADD callback hook to combine for original callbacks
                // log("sequenceHooks", sequenceHooks);
                function transform(hooks){
                    var hookObject = {};
                    var sequenceKeys = Object.keys(hooks);
                    sequenceKeys.forEach(function(sequence){
                        // Create an object of the registered hooks
                        ["start", "stop"].forEach(function(type){
                            hooks[sequence][type].forEach(function(hook){
                                if (!hookObject[hook]) {
                                    hookObject[hook] = {
                                        start: [],
                                        stop: []
                                    };
                                }
                                hookObject[hook][type].push(sequence);
                            });
                        });
                    });
                    return hookObject;
                }
                var transformedHook = transform(hooks);

                for (var key in transformedHook) {
                    var startFunctions = [];
                    var stopFunctions = [];
                    // log("sequenceHooks[key]", sequenceHooks[key]);
                    // log("startFunctions", startFunctions);
                    if (transformedHook[key].start.length > 0) {
                        startFunctions.push(function(){
                            log("this is being triggered", key);
                            _this.callTrigger(transformedHook[key].start[0], ON);
                        });

                    }
                    if (transformedHook[key].stop.length > 0) {
                        stopFunctions.push(function(){
                            log("this is being triggered", key);
                            _this.callTrigger(transformedHook[key].stop[0], OFF);
                        });
                    }
                    // log("stopFunctions", stopFunctions[0]);

                    this[key] = function(){
                        startFunctions.forEach(function(fn){
                            fn();
                        });
                        stopFunctions.forEach(function(fn){
                            fn();
                        });
                    };
                }
            },
            callTrigger: function(name, type) {
                Entities.callEntityServerMethod(this._entityID, "callTrigger", [name, type]);
            },
            unload: function(){
            }
        }

        return new Particle_Sequencer_Client();
});