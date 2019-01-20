/*

    Particle Generator
    generator_particles.js
    Created by Milad Nazeri on 2019-01-16
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Makes random animated particles

*/


var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js');

Script.require("../modules/polyfill.js")();

var common = Script.require("../modules/commonUtilities.js?" + Date.now());
var randomFloat = common.randomFloat;
var randomInt = common.randomInt;
var makeColor = common.makeColor;

var particles = Script.require("../modules/particleProperties.js?" + Date.now());
delete particles["intro"];
delete particles["outro"];

var textureCollection = Script.require("../modules/collection_textures.js?" + Date.now());


// Main Particle Constructor Function
function ParticleGenerator() {
    this.particle = null;
    this.interval = null;
    this._entityID = null;
    this.textureCollection = textureCollection;
}


// First make the particle and then start the animation sequence
function create(entityID) {
    this._entityID = entityID;
    this.makeParticle();
    this.animate();
}


// Pick a random particle from our particles array and create the entity using those base properties
function makeParticle() {
    // Turn the particles object into an array of particles
    var particleArray = Object.keys(particles).map(function(particle){
        return particles[particle];
    });
    var maxParticlesIndex = particleArray.length - 1;
    var randomParticleIndex = randomInt(0, maxParticlesIndex);
    var particle = particleArray[randomParticleIndex];

    particle.parentID = this._entityID;
    particle.name = "Party Particle";
    particle.localPosition = [0, 0.75, 0];
    particle.dimensions = [10, 10, 10];

    this.particle = Entities.addEntity(particle);
}


// Main Animator that is controlling the specific interval animations
var UDPATE_MIN = 17;
var UPDATE_MAX = 500;
function animate() {
    // Get a random amount between 17 to 1000 as how often to animate by
    var intervalAmount = randomInt(UDPATE_MIN, UPDATE_MAX);
    this.interval = Script.setInterval(intervalAnimator.bind(this), intervalAmount);
}


// Add in some chance so it doesn't animate every iteration
var CHANCE_THRESHOLD = 0.65;
function dontAnimatte(){
    var chanceAmount = randomFloat(0, 1);
    if (chanceAmount < CHANCE_THRESHOLD){
        return false;
    } else {
        return true;
    }
}

function AveragingFilter(length, initValue) {
    // initialize the array of past values
    initValue = initValue || 0;
    this.pastValues = [];
    for (var i = 0; i < length; i++) {
        this.pastValues.push(initValue);
    }
    // single arg is the nextInputValue
    this.process = function () {
        if (this.pastValues.length === 0 && arguments[0]) {
            return arguments[0];
        } else if (arguments[0] !== null) {
            this.pastValues.push(arguments[0]);
            this.pastValues.shift();
            var nextOutputValue = 0;
            for (var value in this.pastValues) {
                nextOutputValue += this.pastValues[value];
            }
            return nextOutputValue / this.pastValues.length;
        } else {
            return 0;
        }
    };
}

// var AVERAGING_LENGTH = 15;
var AVERAGING_LENGTH = 5;

var filterStore = {
    emitRate: new AveragingFilter(AVERAGING_LENGTH, 1),
    particleRadius: new AveragingFilter(AVERAGING_LENGTH, 0.05),
    emitSpeed: new AveragingFilter(AVERAGING_LENGTH, 1),
    emitAcceleration: {
        x: new AveragingFilter(AVERAGING_LENGTH, 0.10),
        y: new AveragingFilter(AVERAGING_LENGTH, 0.10),
        z: new AveragingFilter(AVERAGING_LENGTH, 0.10)
    },
    emitOrientation: {
        x: new AveragingFilter(AVERAGING_LENGTH, 10),
        y: new AveragingFilter(AVERAGING_LENGTH, 10),
        z: new AveragingFilter(AVERAGING_LENGTH, 10)
    },
    alpha: new AveragingFilter(AVERAGING_LENGTH, 1),
    alphaStart: new AveragingFilter(AVERAGING_LENGTH, 1),
    alphaFinish: new AveragingFilter(AVERAGING_LENGTH, 1),
    radiusFinish: new AveragingFilter(AVERAGING_LENGTH, 0.2),
    radiusStart: new AveragingFilter(AVERAGING_LENGTH, 0.4),
    spinFinish: new AveragingFilter(AVERAGING_LENGTH, 1),
    spinStart: new AveragingFilter(AVERAGING_LENGTH, -1)
};

// Generate the random light props for each animation step
var EMIT_RATE_MIN = 1;
// var EMIT_RATE_MAX = 1000;
var EMIT_RATE_MAX = 100;
var PARTICLE_RADIUS_MIN = 0.15;
var PARTICLE_RADIUS_MAX = 1;
var EMIT_SPEED_MIN = 0.1;
var EMIT_SPEED_MAX = 1;
var EMIT_ACCELERATION_MIN = 0;
var EMIT_ACCELERATION_MAX = 1;
var EMIT_ORIENTATION_MIN = -180;
var EMIT_ORIENTATION_MAX = 180;
var ALPHA_MIN = 0.05;
var ALPHA_MAX = 1;
var PARTICLE_SPIN_MIN = -2.0 * Math.PI;
var PARTICLE_SPIN_MAX = 2.0 * Math.PI;
var MAXIMUM_PARTICLE = 2500;
var MINIMUM_COLOR_SCALER = 0.0;
var MAXIMUM_COLOR_SCALER = 0.4;
function makeRandomParticleProps(){
    var particleProps = {
        emitterShouldTrail: true,
        maxParticles: MAXIMUM_PARTICLE,
        emitRate: 
            filterStore.emitRate.process(randomFloat(EMIT_RATE_MIN, EMIT_RATE_MAX)),
        particleRadius: 
            filterStore.particleRadius.process(randomFloat(PARTICLE_RADIUS_MIN, PARTICLE_RADIUS_MAX)),
        emitSpeed: 
            filterStore.emitSpeed.process(randomFloat(EMIT_SPEED_MIN, EMIT_SPEED_MAX)),
        emitAcceleration: [
            filterStore.emitAcceleration.x.process(
                randomFloat(EMIT_ACCELERATION_MIN, EMIT_ACCELERATION_MAX)),
            filterStore.emitAcceleration.y.process(
                randomFloat(EMIT_ACCELERATION_MIN, EMIT_ACCELERATION_MAX)),
            filterStore.emitAcceleration.z.process(
                randomFloat(EMIT_ACCELERATION_MIN, EMIT_ACCELERATION_MAX))
        ],
        emitOrientation: Quat.fromPitchYawRollDegrees(
            filterStore.emitOrientation.x.process(
                randomInt(EMIT_ORIENTATION_MIN, EMIT_ORIENTATION_MAX)),
            filterStore.emitOrientation.y.process(
                randomInt(EMIT_ORIENTATION_MIN, EMIT_ORIENTATION_MAX)),
            filterStore.emitOrientation.z.process(
                randomInt(EMIT_ORIENTATION_MIN, EMIT_ORIENTATION_MAX))
        ),
        alpha: 
            filterStore.alpha.process(randomFloat(ALPHA_MIN, ALPHA_MAX)),
        alphaStart: 
            filterStore.alphaStart.process(randomFloat(ALPHA_MIN, ALPHA_MAX)),
        alphaFinish: 
            filterStore.alphaFinish.process(randomFloat(ALPHA_MIN, ALPHA_MAX)),
        color: makeColor(
            randomInt(0, 255),
            randomInt(0, 255),
            randomInt(0, 255),
            randomFloat(MINIMUM_COLOR_SCALER, MAXIMUM_COLOR_SCALER)
        ),
        colorStart: makeColor(
            randomInt(0, 255),
            randomInt(0, 255),
            randomInt(0, 255),
            randomFloat(MINIMUM_COLOR_SCALER, MAXIMUM_COLOR_SCALER)
        ),
        colorFinish: makeColor(
            randomInt(0, 255),
            randomInt(0, 255),
            randomInt(0, 255),
            randomFloat(MINIMUM_COLOR_SCALER, MAXIMUM_COLOR_SCALER)
        ),
        radiusStart:
            filterStore.radiusStart.process(randomInt(PARTICLE_RADIUS_MIN, PARTICLE_RADIUS_MAX)),
        radiusFinish: 
            filterStore.radiusFinish.process(randomInt(PARTICLE_RADIUS_MIN, PARTICLE_RADIUS_MAX)),
        spinStart:
            filterStore.spinStart.process((PARTICLE_SPIN_MIN, PARTICLE_SPIN_MAX)),
        spinFinish: 
            filterStore.spinFinish.process(randomFloat(PARTICLE_SPIN_MIN, PARTICLE_SPIN_MAX))
    };
    return particleProps;
}

// Main animation function run on each interval
var iterationsBeforeTextureSwitch = 15;
var currentIterationCount = 0;
var maxTextureLength = textureCollection.length - 1;
function intervalAnimator(){
    if (dontAnimatte()){
        return;
    }

    var particleProps = makeRandomParticleProps();
    
    // Get a random texture
    if (currentIterationCount < iterationsBeforeTextureSwitch) {
        currentIterationCount++;
    } else {
        var randomTexture = randomInt(0, maxTextureLength);
        particleProps.textures = this.textureCollection[randomTexture];
        currentIterationCount = 0;
        iterationsBeforeTextureSwitch = randomInt(5, 35);
    }

    Entities.editEntity(this.particle, particleProps);
}


// Clean up the entities and clear any intervals
function destroy() {
    Entities.deleteEntity(this.particle);
    Script.clearInterval(this.interval);
}


ParticleGenerator.prototype = {
    create: create,
    makeParticle: makeParticle,
    animate: animate,
    destroy: destroy
};

module.exports = ParticleGenerator;
