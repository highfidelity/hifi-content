/*

    Particle Generator
    generator_particles.js
    Created by Milad Nazeri on 2019-01-16
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Makes random animated particles

*/


Script.require("../modules/polyfill.js")();

var common = Script.require("../modules/commonUtilities.js?" + Date.now());
var randomFloat = common.randomFloat;
var randomInt = common.randomInt;
var makeColor = common.makeColor;

var particles = Script.require("../modules/particleProperties.js?" + Date.now());
var textureCollection = Script.require("../modules/collection_textures.js?" + Date.now());

// Main Particle Constructor Function
function ParticleGenerator() {    
    this.particle = null;

    this.currentBallPosition = null;
    this.interval = null;
    this.textureCollection = textureCollection;
}


// First make the particle and then start the animation sequence
function create(currentBallPosition) {
    this.currentBallPosition = currentBallPosition;
    this.makeParticle();
    this.animate();
}


// Pick a random particle from our particles array and create the entity using those base properties
var PARTICLE_Y_OFFSET = 0.5;
function makeParticle() {
    // Turn the particles object into an array of particles
    var particleArray = Object.keys(particles).map(function(particle){
        return particles[particle];
    });
    var maxParticlesIndex = particleArray.length - 1;
    var randomParticleIndex = randomInt(0, maxParticlesIndex);
    var particle = particleArray[randomParticleIndex];

    particle.parentID = this.parentID;
    particle.name = "Party Particle";
    particle.position = Vec3.sum(this.currentBallPosition, [0, PARTICLE_Y_OFFSET, 0]);
    particle.dimensions = [10, 10, 10];

    this.particle = Entities.addEntity(particle);
}


// Main Animator that is controlling the specific interval animations
var UDPATE_MIN = 17;
var UPDATE_MAX = 1000;
function animate() {
    // Get a random interval amount between update min/max as how often to animate by
    var intervalAmount = randomInt(UDPATE_MIN, UPDATE_MAX);
    this.interval = Script.setInterval(intervalAnimator.bind(this), intervalAmount);
}


// Add in some chance so it doesn't animate every iteration
var CHANCE_THRESHOLD = 0.25;
function shouldAnimate(){
    var chanceAmount = randomFloat(0, 1);
    if (chanceAmount > CHANCE_THRESHOLD){
        return true;
    } else {
        return false;
    }
}
 

// Return back an on going average from a given set
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


// Generate the random light props for each animation step
var EMIT_RATE_MIN = 1;
var EMIT_RATE_MAX = 1000;
var PARTICLE_RADIUS_MIN = 0.1;
var PARTICLE_RADIUS_MAX = 1.5;
var EMIT_SPEED_MIN = 0.1;
var EMIT_SPEED_MAX = 10;
var EMIT_ACCELERATION_MIN = 0;
var EMIT_ACCELERATION_MAX = 10;
var EMIT_ORIENTATION_MIN = -180;
var EMIT_ORIENTATION_MAX = 180;
var ALPHA_MIN = 0.25;
var ALPHA_MAX = 1;
var PARTICLE_SPIN_MIN = -2.0 * Math.PI;
var PARTICLE_SPIN_MAX = 2.0 * Math.PI;
var MAXIMUM_PARTICLE = 5000;
var MINIMUM_COLOR_SCALER = 0.0;
var MAXIMUM_COLOR_SCALER = 0.4;
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
        x: new AveragingFilter(AVERAGING_LENGTH, -180),
        y: new AveragingFilter(AVERAGING_LENGTH, 180),
        z: new AveragingFilter(AVERAGING_LENGTH, 90)
    },
    alpha: new AveragingFilter(AVERAGING_LENGTH, 1),
    alphaStart: new AveragingFilter(AVERAGING_LENGTH, 1),
    alphaFinish: new AveragingFilter(AVERAGING_LENGTH, 1),
    radiusFinish: new AveragingFilter(AVERAGING_LENGTH, 0.2),
    radiusStart: new AveragingFilter(AVERAGING_LENGTH, 0.4),
    spinFinish: new AveragingFilter(AVERAGING_LENGTH, 1),
    spinStart: new AveragingFilter(AVERAGING_LENGTH, -1)
};
function makeRandomParticleProps(){
    var particleProps = {
        emitterShouldTrail: randomInt(0, 1),
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
var maxTextureIndex = textureCollection.length - 1;
function intervalAnimator(){
    if (!shouldAnimate()){
        return;
    }

    var newParticleProperties = makeRandomParticleProps();
    
    // Get a new random texture after a changing amount of updates have past
    if (currentIterationCount < iterationsBeforeTextureSwitch) {
        currentIterationCount++;
    } else {
        var randomTexture = randomInt(0, maxTextureIndex);
        newParticleProperties.textures = this.textureCollection[randomTexture];
        currentIterationCount = 0;
        iterationsBeforeTextureSwitch = randomInt(5, 35);
    }

    Entities.editEntity(this.particle, newParticleProperties);
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
