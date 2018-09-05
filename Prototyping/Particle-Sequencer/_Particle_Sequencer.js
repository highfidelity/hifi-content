// Particle Array Consts
var LIFESPAN = "lifespan",
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
    POSITION = "position",
    ROTATION = "rotation",
    LOOP = "loop"
;

// Min and Max
var 
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

// Init Variables
var 
    totalDelta = 0,
    DISTANCE_IN_FRONT = -2
    ENTITY_POSITION = getPosition(0, 0, DISTANCE_IN_FRONT)
;

// Log Helper
function log(label, value){
    print(label, JSON.stringify(value));
}

// Get Particle in front of you
function getPosition(x, y, z) {
    var localOffset = { x: x, y: y, z: z };
    var worldOffset = Vec3.multiplyQbyV(MyAvatar.orientation, localOffset);
    return Vec3.sum(MyAvatar.position, worldOffset);
}

// Paste the properties given to you by a particle, comma separated
var particleArray = [
    { "isEmitting": true, "lifespan": "1.5", "maxParticles": "10", "textures": "https://content.highfidelity.com/DomainContent/production/Particles/wispy-smoke.png", "emitRate": "95", "emitSpeed": "1.35", "speedSpread": "1.35", "emitDimensions": { "x": "0", "y": "20", "z": "0" }, "emitOrientation": { "x": "0", "y": "90", "z": "0" }, "emitterShouldTrail": true, "particleRadius": "0.25", "radiusSpread": "0", "radiusStart": "0", "radiusFinish": "0.10000000149011612", "color": { "red": "200", "blue": "200", "green": "200" }, "colorSpread": { "red": "0", "blue": "0", "green": "0" }, "colorStart": { "red": "200", "blue": "200", "green": "200" }, "colorFinish": { "red": "0", "blue": "0", "green": "0" }, "emitAcceleration": { "x": "-0.5", "y": "2.5", "z": "-0.5" }, "accelerationSpread": { "x": "0.5", "y": "1", "z": "0.5" }, "alpha": "0", "alphaSpread": "0", "alphaStart": "1", "alphaFinish": "0", "particleSpin": 0, "spinSpread": 0, "spinStart": 0, "spinFinish": 0, "rotateWithEntity": false, "polarStart": 0, "polarFinish": 0, "azimuthStart": -3.1415927410125732, "azimuthFinish": 3.1415927410125732 },
    { "isEmitting": true, "lifespan": "1.5", "maxParticles": "10", "textures": "https://content.highfidelity.com/DomainContent/production/Particles/wispy-smoke.png", "emitRate": "95", "emitSpeed": "1.35", "speedSpread": "1.35", "emitDimensions": { "x": "0", "y": "20", "z": "0" }, "emitOrientation": { "x": "0", "y": "90", "z": "0" }, "emitterShouldTrail": true, "particleRadius": "0.25", "radiusSpread": "0", "radiusStart": "0", "radiusFinish": "0.10000000149011612", "color": { "red": "200", "blue": "200", "green": "200" }, "colorSpread": { "red": "0", "blue": "0", "green": "0" }, "colorStart": { "red": "200", "blue": "200", "green": "200" }, "colorFinish": { "red": "0", "blue": "0", "green": "0" }, "emitAcceleration": { "x": "-0.5", "y": "2.5", "z": "-0.5" }, "accelerationSpread": { "x": "0.5", "y": "1", "z": "0.5" }, "alpha": "0", "alphaSpread": "0", "alphaStart": "1", "alphaFinish": "0", "particleSpin": 0, "spinSpread": 0, "spinStart": 0, "spinFinish": 0, "rotateWithEntity": false, "polarStart": 0, "polarFinish": 0, "azimuthStart": -3.1415927410125732, "azimuthFinish": 3.1415927410125732 }
].map(function(particle){ 
    var orientation = particle[EMIT_ORIENTATION];
    orientation = Quat.fromPitchYawRollDegrees(orientation.x,orientation.y,orientation.z);
    particle[EMIT_ORIENTATION] = orientation;
    return particle;
});


// Particles get stored here:
var particleEntities = [];

// Particle Constructor
function Particle(id, props) {
    this.id = id;
    this.props = props;
    this.rotation = Entities.getEntityProperties(id,'rotation').rotation;
    this.currentIndex = 0;
    this.currentChangeProperty = null;
    this.currentToValue = null;
    this.sequence = {};
    this.currentKeys = [];
    this.sequenceStartDelta = 0;
    this.shouldLoop = false;
    this.loopStart = 0;
    this.loopEnd = 0;
    this.duration
}

Particle.prototype.change = function (property) {
    log("in change");

    this.currentChangeProperty = property;
    log("currentChangeProperty", this.currentChangeProperty);
    return this;
};

Particle.prototype.to = function (value) {
    var newValue = value;
    if (arguments.length === 3) {
        if (this.currentChangeProperty.toLowerCase().indexOf("color") > -1) {
            newValue = {
                red: arguments[0],
                green: arguments[1],
                blue: arguments[2]
            };
        } else if (
            this.currentChangeProperty.toLowerCase().indexOf("rotation") > -1 ||
            this.currentChangeProperty.toLowerCase().indexOf("orientation") > -1) {
            newValue = Quat.fromPitchYawRollDegrees(arguments[0],arguments[1],argumnets[2]);
        } else {
            newValue = {
                x: arguments[0],
                y: arguments[1],
                z: arguments[2]
            };
        }

    }
    this.currentToValue = newValue;
    log("currentToValue", this.currentToValue);
    return this;
};

Particle.prototype.at = function (time) {
    log("in at");
    if (!this.sequence[String(time)]) {
        this.sequence[String(time)] = [];
    } 
    if (this.currentChangeProperty === LOOP) {
        this.shouldLoop = true;
        this.loopStart = this.currentToValue;
        this.loopEnd = time;
    }
    this.sequence[String(time)].push({ change: this.currentChangeProperty, to: this.currentToValue });
    this.currentChangeProperty = null;
    this.currentToValue = null;
    this.updateKeys();
    // log("updateKeys", this.currentKeys);
    // log("sequence", this.sequence);
    return this;
};

Particle.prototype.edit = function (propArray) {
    log("in Edit");
    var self = this;
    var propertiesToChange = propArray.reduce(function (prev, cur) {
        var changeAmount = cur.to;
        if (cur.change === LOOP) {
            log("About to loop");
            self.sequenceStartDelta = totalDelta;
        }
        if (cur.change === POSITION) {
            var worldOffset = Vec3.multiplyQbyV(self.rotation, cur.to);
            log("worldOffset", worldOffset);
            var moveTo = Vec3.sum(ENTITY_POSITION, worldOffset);
            log("moveTo", moveTo);
            changeAmount = moveTo;
        }
        prev[cur.change] = changeAmount;
        // log("currentPrev", prev);
        return prev;
    }, {});
    log("propertiesToChange", propertiesToChange);
    Entities.editEntity(this.id, propertiesToChange);
    log("currentIndex", this.currentIndex);
    log("this.currentKeys.length",this.currentKeys.length);
    this.currentIndex = 
        this.currentIndex >= this.currentKeys.length - 1
            ? (log("currentIndex is over"), this.currentIndex = 0)
            : (log("currentIndex is under"), this.currentIndex += 1);
    log("currentIndex", this.currentIndex);
    
};

Particle.prototype.editCurrentIndex = function(){
    log("in editCurrentIndex");

    this.edit(this.sequence[this.currentKeys[this.currentIndex]]);
};

Particle.prototype.updateKeys = function () {
    log("in updateKeys");
    this.currentKeys = Object.keys(this.sequence);
};

// Create the particles
particleArray.forEach(function (particle) {
    particle.type = "ParticleEffect";
    particle.position = ENTITY_POSITION;
    var id = Entities.addEntity(particle);
    particleEntities.push(new Particle(id, particle));
});

// Particle Alias
var FIRE = 0,
    SMOKE = 1;

// Sequencing section
particleEntities[FIRE]
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
    .change(LOOP).to(0).at(2500);
particleEntities[SMOKE]
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
    .change(LOOP).to(0).at(2500);

// particleEntities[1]
startUpdate();

// Run on update
function onUpdate(delta) {
    var deltaInMs = delta * 1000;
    var withinMargin = 15;
    totalDelta += deltaInMs;
    // Run through all the particles I have
    particleEntities.forEach(function(particle){
        // log("particle", particle);
        var currentIndexTimeStamp = particle.sequenceStartDelta + Number(particle.currentKeys[particle.currentIndex]);
        // log("totalDelta", totalDelta);
        // log("currentIndexTimeStamp", currentIndexTimeStamp);
        var timeStampDifference = Math.abs(totalDelta - currentIndexTimeStamp);
        if (timeStampDifference <= withinMargin) {
            // log("timeStampDifference <= withinMargin === TRUE", timeStampDifference);
            particle.editCurrentIndex();
        }
    });
    // Check if the current TotalDelta is within the currentIndex 
}

function startUpdate() {
    Script.update.connect(onUpdate);
}

function stopUpdate() {
    Script.update.disconnect(onUpdate);
}

// Delete the Entities on cleanup
Script.scriptEnding.connect(function () {
    particleEntities.forEach(function (particle) {
        Entities.deleteEntity(particle.id);
    });
    stopUpdate();
});


// Ideas
/*

this.delay
_delayTime = amount;
return this;

this.delay
this.repeat
this.yoyo
this.easing
  _easingFunction = easing
this.interpolation
this.chain
    _chainedTweens = arguments
this.update
    elapsed = (time - _start) / _duration // Where in the process it is
    elapsed = elapsed > 1 ? 1: elapsed; 
    value = _easingFunction(elapsed)  // using the normalized value
    end 

    easing functions
    none : k => k
    Quadratic
        in: K => k * k
        out: K => k * (2-k)
        inout: k =>
            if ((k *= 2) < 1) {
                return 0.5 * K * K
            }
            return - 0.5 * (--k * (K - 2) - 1);
        





*/