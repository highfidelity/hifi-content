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
            LOOP = "loop"
        ;

    // DEPENDENCIES
    // ////////////////////////////////////////////////////////////////////////
        var
            // SEQUENCER = Script.require("https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/Prototyping/Particle-Sequencer/Particle_Sequencer.js?" + Date.now())
            SEQUENCER = Script.require("./Particle_Sequencer.js?" + Date.now())
        ;
    // HELPER FUNCTIONS
    // ////////////////////////////////////////////////////////////////////////
        function log(label, value){
            print(label, JSON.stringify(value));
        }

    // PARTICLES
    // ////////////////////////////////////////////////////////////////////////
        var sequencedEntities = {
            "FIRE": { "isEmitting": true, "lifespan": "1.5", "maxParticles": "10", "textures": "https://content.highfidelity.com/DomainContent/production/Particles/wispy-smoke.png", "emitRate": "95", "emitSpeed": "1.35", "speedSpread": "1.35", "emitDimensions": { "x": "0", "y": "20", "z": "0" }, "emitOrientation": { "x": "0", "y": "90", "z": "0" }, "emitterShouldTrail": true, "particleRadius": "0.25", "radiusSpread": "0", "radiusStart": "0", "radiusFinish": "0.10000000149011612", "color": { "red": "200", "blue": "200", "green": "200" }, "colorSpread": { "red": "0", "blue": "0", "green": "0" }, "colorStart": { "red": "200", "blue": "200", "green": "200" }, "colorFinish": { "red": "0", "blue": "0", "green": "0" }, "emitAcceleration": { "x": "-0.5", "y": "2.5", "z": "-0.5" }, "accelerationSpread": { "x": "0.5", "y": "1", "z": "0.5" }, "alpha": "0", "alphaSpread": "0", "alphaStart": "1", "alphaFinish": "0", "particleSpin": 0, "spinSpread": 0, "spinStart": 0, "spinFinish": 0, "rotateWithEntity": false, "polarStart": 0, "polarFinish": 0, "azimuthStart": -3.1415927410125732, "azimuthFinish": 3.1415927410125732 },
            "SMOKE": { "isEmitting": true, "lifespan": "1.5", "maxParticles": "10", "textures": "https://content.highfidelity.com/DomainContent/production/Particles/wispy-smoke.png", "emitRate": "95", "emitSpeed": "1.35", "speedSpread": "1.35", "emitDimensions": { "x": "0", "y": "20", "z": "0" }, "emitOrientation": { "x": "0", "y": "90", "z": "0" }, "emitterShouldTrail": true, "particleRadius": "0.25", "radiusSpread": "0", "radiusStart": "0", "radiusFinish": "0.10000000149011612", "color": { "red": "200", "blue": "200", "green": "200" }, "colorSpread": { "red": "0", "blue": "0", "green": "0" }, "colorStart": { "red": "200", "blue": "200", "green": "200" }, "colorFinish": { "red": "0", "blue": "0", "green": "0" }, "emitAcceleration": { "x": "-0.5", "y": "2.5", "z": "-0.5" }, "accelerationSpread": { "x": "0.5", "y": "1", "z": "0.5" }, "alpha": "0", "alphaSpread": "0", "alphaStart": "1", "alphaFinish": "0", "particleSpin": 0, "spinSpread": 0, "spinStart": 0, "spinFinish": 0, "rotateWithEntity": false, "polarStart": 0, "polarFinish": 0, "azimuthStart": -3.1415927410125732, "azimuthFinish": 3.1415927410125732 }
        };
        var sequencedEntitiesKeys = Object.keys(sequencedEntities);

    // SEQUENCE
    // ////////////////////////////////////////////////////////////////////////
        // Add the sequence in the function below
        function registerSequence(){

            sequencedEntities["FIRE"]
                .start("explode")
                    .change(POSITION).to(0.5,0,0).at(500)
                    .change(COLOR).to(0,255,0).at(500)
                    .change(COLOR_START).to(0,255,0).at(500)
                    .change(COLOR_FINISH).to(0,255,0).at(500)
                    .change(POSITION).to(0,0.5,0).at(1000)
                    .change(COLOR).to(255,0,0).at(1000)
                    .change(COLOR_START).to(255,0,0).at(1000)
                    .change(COLOR_FINISH).to(255,0,0).at(1000)
                    .change(COLOR).to(0,0,255).at(1500)
                    .change(COLOR_START).to(0,0,255).at(1500)
                    .change(COLOR_FINISH).to(0,0,255).at(1500)
                    .change(COLOR).to(50,0,255).at(2000)
                    .change(COLOR_START).to(50,0,255).at(2000)
                    .change(COLOR_FINISH).to(50,0,255).at(2000)
                    .change(LOOP).to(0).at(2500)
                .end();
            sequencedEntities["SMOKE"]
                .start("explode")
                    .change(COLOR).to(150,80,0).at(500)
                    .change(COLOR_START).to(255,80,0).at(500)
                    .change(COLOR_FINISH).to(150,80,0).at(500)
                    .change(COLOR).to(255,0,0).at(1000)
                    .change(COLOR_START).to(255,0,0).at(1000)
                    .change(COLOR_FINISH).to(0,0,0).at(1000)
                    .change(COLOR).to(255,0,80).at(1500)
                    .change(COLOR_START).to(0,0,80).at(1500)
                    .change(COLOR_FINISH).to(0,0,80).at(1500)
                    .change(COLOR).to(0,0,80).at(2000)
                    .change(COLOR_START).to(255,0,80).at(2000)
                    .change(COLOR_FINISH).to(255,0,80).at(2000)
                    .change(LOOP).to(0).at(2500)
                .end();
        }
        

    // ENTITY DEFINITION
    // ////////////////////////////////////////////////////////////////////////
        function Particle_Sequencer_Server() {
            this._entityID = null;
            this._position = {};
        }

        Particle_Sequencer_Server.prototype = {
            remotelyCallable: [
                "callTrigger"
            ],
            preload: function(id){
                this._entityID = id;
                this._position = Entities.getEntityProperties(this._entityID, 'position').position;
                SEQUENCER.setAnchorPosition(this._position);

                sequencedEntitiesKeys.forEach(function(entity){
                    sequencedEntities[entity] = new SEQUENCER.Particle(sequencedEntities[entity], entity);
                });
                registerSequence();

                // REGISTER HOOKS HERE!
                // ////////////////////////////////////////////////////////////
                SEQUENCER.onStart("explode", [CLICK_DOWN]);
                SEQUENCER.onStop("explode", [CLICK_DOWN]);

                var sequenceHooks = SEQUENCER.getHooks();
                // SEQUENCER.triggerOn("explode");

                // Script.setTimeout(function(){
                //     SEQUENCER.triggerOff("explode");
                // }, 3000);
                // TODO: This only supports one sequence per hook type
                // TODO: ADD RANDOM if more then one sequence given
                // TODO: ADD callback hook to combine for original callbacks
                // log("sequenceHooks", sequenceHooks);
                for (var key in sequenceHooks) {
                    var startFunctions = [];
                    var stopFunctions = [];
                    // log("sequenceHooks[key]", sequenceHooks[key]);
                    // log("startFunctions", startFunctions);
                    if (sequenceHooks[key].start.length > 0) {
                        startFunctions.push(function(){
                            // log("this is being triggered");
                            SEQUENCER.triggerOn(sequenceHooks[key].start[0]);
                        });

                    }
                    if (sequenceHooks[key].stop.length > 0) {
                        stopFunctions.push(function(){
                            // log("this is being triggered");
                            SEQUENCER.triggerOff(sequenceHooks[key].stop[0]);
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
            unload: function(){
                SEQUENCER.stop();
                sequencedEntitiesKeys.forEach(function(entity){
                    Entities.deleteEntity(sequencedEntities[entity]._id);
                });
            },
            callTrigger: function(id, param){
                log("callTrigger", param);
                var sequenceName = param[0];
                var type = param[1];
                if (type === "true" && !SEQUENCER.getIsRunning()){
                    log("TriggerOn being called", sequenceName)
                    SEQUENCER.triggerOn(sequenceName);
                } else {
                    log("TriggerOff being called", sequenceName)
                    SEQUENCER.triggerOff(sequenceName);
                }
            }
            // trigger: function(sequenceName){
            //     SEQUENCER.trigger(sequenceName);
            // }
        }

        return new Particle_Sequencer_Server();
});