/*

    Particle Generator
    generator_particles.js
    Created by Milad Nazeri on 2019-01-16
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Makes random animated particles

*/
print("in generator particles2");

Script.require("../modules/polyfill.js")();
Script.resetModuleCache(true);
var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js')

var common = Script.require("../modules/commonUtilities.js?" + Date.now());
var particles = Script.require("../modules/particleProperties.js?" + Date.now());

var randomFloat = common.randomFloat;
var randomInt = common.randomInt;
var makeColor = common.makeColor;

var textureCollection = Script.require("../modules/collection_textures.js?" + Date.now());


// Main Particle Constructor Function
function ParticleGenerator() {
    this.particle = null;
    this.interval = null;
    this._entityID = null;
    this.textureCollection = textureCollection;
}


// First make the particle and then start the animation sequence
function create(position) {
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
    particle.localPosition = [0, 1, 0];
    particle.dimensions = [10, 10, 10];
    this.particle = Entities.addEntity(particle);
    console.log("adding particle: ", this.particle);
}


function registerEntity(entityID){
    this._entityID = entityID;
}


// Main Animator that is controlling the specific interval animations
var UDPATE_MIN = 50;
var UPDATE_MAX = 2000;
function animate() {
    // Get a random amount between 17 to 1000 as how often to animate by
    var intervalAmount = randomInt(UDPATE_MIN, UPDATE_MAX);
    console.log("interval Amount", intervalAmount)
    this.interval = Script.setInterval(intervalAnimator.bind(this), intervalAmount);
}

var CHANCE_THRESHOLD = 0.4;
function shouldAnimate(){
    var chanceAmount = randomFloat(0, 1);
    if (chanceAmount> CHANCE_THRESHOLD){
        return true;
    }
}

// var textureCount = 0;
// var textureSwitchCount = 15;
var EMIT_RATE_MIN = 0;
// var EMIT_RATE_MAX = 10000;
var EMIT_RATE_MAX = 500;
var PARTICLE_RADIUS_MIN = 0;
// var PARTICLE_RADIUS_MAX = 4; 
var PARTICLE_RADIUS_MAX = 1; 
var EMIT_SPEED_MIN = 0;
// var EMIT_SPEED_MAX = 40;
var EMIT_SPEED_MAX = 20;
var EMIT_ACCELERATION_MIN = -2;
// var EMIT_ACCELERATION_MAX = 25;
var EMIT_ACCELERATION_MAX = 2;
var EMIT_ORIENTATION_MIN = -180;
var EMIT_ORIENTATION_MAX = 180;
var ALPHA_MIN = 0.75;
var ALPHA_MAX = 1;
var MINIMUM_PARTICLE_SPIN = -2.0 * Math.PI;
var MAXIMUM_PARTICLE_SPIN = 2.0 * Math.PI;
var iterationsBeforeTextureSwitch = 15;
var currentIterationCount = 0;
var maxTextureLength = textureCollection.length - 1;
var MAXIMUM_PARTICLE = 3000;
function intervalAnimator(){
    if (shouldAnimate()){
        return;
    }

    var particleProps = {
        emitterShouldTrail: true,
        maxParticles: MAXIMUM_PARTICLE,
        emitRate: randomFloat(EMIT_RATE_MIN, EMIT_RATE_MAX),
        particleRadius: randomFloat(PARTICLE_RADIUS_MIN, PARTICLE_RADIUS_MAX),
        emitSpeed: randomFloat(EMIT_SPEED_MIN, EMIT_SPEED_MAX),
        emitAcceleration: {
            "x": randomFloat(EMIT_ACCELERATION_MIN, EMIT_ACCELERATION_MAX),
            "y": randomFloat(EMIT_ACCELERATION_MIN, EMIT_ACCELERATION_MAX),
            "z": randomFloat(EMIT_ACCELERATION_MIN, EMIT_ACCELERATION_MAX)
        },
        emitOrientation: Quat.fromPitchYawRollDegrees(
            randomInt(EMIT_ORIENTATION_MIN, EMIT_ORIENTATION_MAX),
            randomInt(EMIT_ORIENTATION_MIN, EMIT_ORIENTATION_MAX),
            randomInt(EMIT_ORIENTATION_MIN, EMIT_ORIENTATION_MAX)
        ),
        alpha: randomFloat(ALPHA_MIN, ALPHA_MAX),
        alphaStart: randomFloat(ALPHA_MIN, ALPHA_MAX),
        alphaFinish: randomFloat(ALPHA_MIN, ALPHA_MAX),
        color: makeColor(
            randomInt(0, 255),
            randomInt(0, 255),
            randomInt(0, 255)
        ),
        colorStart: makeColor(
            randomInt(0, 255),
            randomInt(0, 255),
            randomInt(0, 255)
        ),
        colorFinish: makeColor(
            randomInt(0, 255),
            randomInt(0, 255),
            randomInt(0, 255)
        ),
        radiusFinish: randomInt(PARTICLE_RADIUS_MIN, PARTICLE_RADIUS_MAX),
        radiusStart: randomInt(PARTICLE_RADIUS_MIN, PARTICLE_RADIUS_MAX),
        spinFinish: randomFloat(MINIMUM_PARTICLE_SPIN, MAXIMUM_PARTICLE_SPIN),
        spinStart: randomFloat(MINIMUM_PARTICLE_SPIN, MAXIMUM_PARTICLE_SPIN)
    };

    // Get a random texture
    if (currentIterationCount < iterationsBeforeTextureSwitch) {
        currentIterationCount++;
    } else {
        var randomTexture = randomInt(0, maxTextureLength);
        particleProps.textures = this.textureCollection[randomTexture];
        currentIterationCount = 0;
        iterationsBeforeTextureSwitch = randomInt(5, 35);
    }

    // console.log("particleProps", JSON.stringify(particleProps, null, 4));
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
    registerEntity: registerEntity,
    destroy: destroy
};

module.exports = ParticleGenerator;
