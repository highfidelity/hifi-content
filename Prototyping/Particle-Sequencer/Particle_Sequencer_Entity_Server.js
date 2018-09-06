(function(){
    /* eslint-disable indent */

     // DEPENDENCIES
    // ////////////////////////////////////////////////////////////////////////

        var
            // SEQUENCER = Script.require(
            //  "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/Prototyping/Particle-Sequencer/Particle_Sequencer.js?" + Date.now())
            SEQUENCER = Script.require("./Particle_Sequencer.js?" + Date.now())
        ;

    // HELPER FUNCTIONS
    // //////////////////////////////////////////////////////////////////////// 

        function log(label, value){
            print("\n" + label + "\n" + "***************************************\n", JSON.stringify(value));
        }

        function parseSequence(sequence) {
            log("sequence", sequence)
            var parsedSequences = {};
            var sequenceKeys = Object.keys(sequence);

            sequenceKeys.forEach(function(key){
                parsedSequences[key] = [];
                sequence[key].forEach(function(sequence){
                    var lines = [];
                    sequence.forEach(function(line){
                        var obj = {};
                        var lineArray = line.split(" ");
                        while (lineArray.length > 0) {
                            obj[lineArray.shift()] = lineArray.shift();
                        }
                        if (obj["TO"]){
                            var toValue = obj["TO"].split(",");
                            toValue = toValue.length === 1 
                                ? Number(toValue)
                                : toValue.map(function(value){
                                    return Number(value);
                                })
                            obj["TO"] = toValue;
                        }
                        if (obj["AT"]){
                            obj["AT"] = Number(obj["AT"]);
                        }
                        lines.push(obj);    
                    })
                    parsedSequences[key].push(lines);

                })
            });

            return parsedSequences;
        }

    // ENTITY DEFINITION
    // ////////////////////////////////////////////////////////////////////////

        function Particle_Sequencer_Server() {
            this._entityID = null;
            this._position = {};
            this._userData = {};
            this._userDataProperties = null;
            this._sequenceFile = null;
            this._sequencedEntities = {};
            this._sequencedEntitiesKeys = [];
            this._sequence = null;
            this._runningOnLoad = false;
            this._defaultSequence = null;
        }

        Particle_Sequencer_Server.prototype = {
            remotelyCallable: [
                "callTrigger"
            ],
            preload: function(id){
                this._entityID = id;
                this._position = Entities.getEntityProperties(this._entityID, 'position').position;
                // Set the anchor point for elements to be relative to
                SEQUENCER.setAnchorPosition(this._position);
                log("test");
                this._userData = Entities.getEntityProperties(this._entityID, 'userData').userData;
                try {
                    // If Sequence is in userProperties
                    this._userDataProperties = JSON.parse(this._userData);
                    this._sequencedEntities = this._userDataProperties.sequencedEntities;
                    if (this._sequencedEntities) {
                        this._sequencedEntitiesKeys = Object.keys(this._userDataProperties.sequencedEntities);

                        this._sequencedEntitiesKeys.forEach(function(entity){
                            this._sequencedEntities[entity] = new SEQUENCER.Particle(this._sequencedEntities[entity], entity);
                        });
                    }
                    this._sequenceFile = this._userDataProperties.sequence;
                    this._noTrigger = this._userDataProperties.noTrigger;
                    this._defaultSequence = this._userDataProperties.defaultSequence;
                    this._sequenceURL = this._userDataProperties.sequenceURL;
                    log("_sequenceURL", this._sequenceURL);
                    if (this._sequencedEntitiesKeys) {
                        this._sequencedEntitiesKeys.forEach(function(entity){
                            this._sequencedEntities[entity] = new SEQUENCER.Particle(this._sequencedEntities[entity], entity);
                        });
                    }
                   
                    if (this._sequence) {
                        log("### this.sequence", this._sequence);
                        var parsedSequence = parseSequence(this._sequence);
                        log("parsedSequence", parsedSequence); 
                    }
                  

                } catch (error) {
                    log("error", error);
                }

                if (this._sequenceURL) {
                    this._sequenceFile = Script.require(this._sequenceURL + "?" + Date.now());

                    this._sequencedEntitiesKeys = Object.keys(this._sequenceFile.sequencedEntities);
                    this._sequencedEntitiesKeys.forEach(function(entity){
                        this._sequenceFile.sequencedEntities[entity] = new SEQUENCER.Particle(this._sequenceFile.sequencedEntities[entity], entity);
                    }, this);

                    this._sequenceFile.sequence = parseSequence(this._sequenceFile.sequence);
                    log("this._sequenceFile.sequence", this._sequenceFile.sequence);
                    var sequenceKeys = Object.keys(this._sequenceFile.sequence);
                    // sequenceKeys ["FIRE","SMOKE"]
                    sequenceKeys.forEach(function(key){

                        this._sequenceFile.sequence[key].forEach(function(sequence){
                            // [{"START":"explode"},{"CHANGE":"color","TO":[0,255,0],"AT":500},{"CHANGE":"color_start","TO":[0,255,0],"AT":500},{"CHANGE":"position","TO":[0,0.5,0],"AT":1000},{"CHANGE":"loop","TO":0,"AT":1500}]
                            sequence.forEach(function(line){
                                // {"CHANGE":"color","TO":[0,255,0],"AT":500}
                                var lineKeys = Object.keys(line).forEach(function(command){
                                    if(line[command] instanceof Array) {
                                        log("%%%line[command]", line[command])
                                        this._sequenceFile.sequencedEntities[key][command.toLowerCase()](line[command]);
                                    } else {
                                        this._sequenceFile.sequencedEntities[key][command.toLowerCase()](line[command]);
                                    }
                                },this);
                            }, this);
                        }, this);
                    }, this);
                }

                if (this._noTrigger){
                    SEQUENCER.triggerOn(this._defaultSequence);
                }
            },
            unload: function(){
                log("IN UNLOAD");
                SEQUENCER.stop();
                this._sequencedEntitiesKeys.forEach(function(entity){
                    Entities.deleteEntity(this._sequenceFile.sequencedEntities[entity]._id);
                }, this);
            },
            callTrigger: function(id, param){
                log("callTrigger", param);
                var sequenceName = param[0];
                var type = param[1];
                log("SEQUENCER.getIsRunning()", SEQUENCER.getIsRunning());
                if (type === "true"){
                    log("TriggerOn being called", sequenceName);
                    SEQUENCER.triggerOn(sequenceName);
                    return;
                }
                if (type === "false"){
                    log("TriggerOff being called", sequenceName);
                    SEQUENCER.triggerOff(sequenceName);
                    return;
                }  
                if (type === "toggle" && !SEQUENCER.getIsRunning()){
                    log("trigger Toggle On being called", sequenceName);
                    SEQUENCER.triggerOn(sequenceName);
                    return;
                } 
                log("trigger Toggle Off being called", sequenceName);

                SEQUENCER.triggerOff(sequenceName);

            }
        }

        return new Particle_Sequencer_Server();
});

/*
Deciding that the best way to deal with this is a seperate file .js 

Going to remove some of the code that dealt with placing the sequence here. 



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


        // function processParsedSequence(sequence) {
        //     sequence.forEach(function(line){
        //     })
        //     this._sequencedEntities[line]
        // }

        

    // PARTICLES
    // ////////////////////////////////////////////////////////////////////////

        var sequencedEntities = {
            "FIRE": { "isEmitting": true, "lifespan": "1.5", "maxParticles": "10", "textures": "https://content.highfidelity.com/DomainContent/production/Particles/wispy-smoke.png", "emitRate": "95", "emitSpeed": "1.35", "speedSpread": "1.35", "emitDimensions": { "x": "0", "y": "20", "z": "0" }, "emitOrientation": { "x": "0", "y": "90", "z": "0" }, "emitterShouldTrail": true, "particleRadius": "0.25", "radiusSpread": "0", "radiusStart": "0", "radiusFinish": "0.10000000149011612", "color": { "red": "200", "blue": "200", "green": "200" }, "colorSpread": { "red": "0", "blue": "0", "green": "0" }, "colorStart": { "red": "200", "blue": "200", "green": "200" }, "colorFinish": { "red": "0", "blue": "0", "green": "0" }, "emitAcceleration": { "x": "-0.5", "y": "2.5", "z": "-0.5" }, "accelerationSpread": { "x": "0.5", "y": "1", "z": "0.5" }, "alpha": "0", "alphaSpread": "0", "alphaStart": "1", "alphaFinish": "0", "particleSpin": 0, "spinSpread": 0, "spinStart": 0, "spinFinish": 0, "rotateWithEntity": false, "polarStart": 0, "polarFinish": 0, "azimuthStart": -3.1415927410125732, "azimuthFinish": 3.1415927410125732 },
            "SMOKE": { "isEmitting": true, "lifespan": "1.5", "maxParticles": "10", "textures": "https://content.highfidelity.com/DomainContent/production/Particles/wispy-smoke.png", "emitRate": "95", "emitSpeed": "1.35", "speedSpread": "1.35", "emitDimensions": { "x": "0", "y": "20", "z": "0" }, "emitOrientation": { "x": "0", "y": "90", "z": "0" }, "emitterShouldTrail": true, "particleRadius": "0.25", "radiusSpread": "0", "radiusStart": "0", "radiusFinish": "0.10000000149011612", "color": { "red": "200", "blue": "200", "green": "200" }, "colorSpread": { "red": "0", "blue": "0", "green": "0" }, "colorStart": { "red": "200", "blue": "200", "green": "200" }, "colorFinish": { "red": "0", "blue": "0", "green": "0" }, "emitAcceleration": { "x": "-0.5", "y": "2.5", "z": "-0.5" }, "accelerationSpread": { "x": "0.5", "y": "1", "z": "0.5" }, "alpha": "0", "alphaSpread": "0", "alphaStart": "1", "alphaFinish": "0", "particleSpin": 0, "spinSpread": 0, "spinStart": 0, "spinFinish": 0, "rotateWithEntity": false, "polarStart": 0, "polarFinish": 0, "azimuthStart": -3.1415927410125732, "azimuthFinish": 3.1415927410125732 }
        };
        var sequencedEntitiesKeys = Object.keys(sequencedEntities);
        

*/