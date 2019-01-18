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
// Remove the smoke intro outro smoke particles
delete particles["smoke1"];
var randomFloat = common.randomFloat;
var randomInt = common.randomInt;
var _this; 

var textureCollection = Script.require("../modules/collection_textures.js?" + Date.now());
textureCollection.forEach(function(texture){
    log("texture", texture);
    TextureCache.prefetch(texture);
});


// Main Particle Constructor Function
function ParticleGenerator() {
    this.particle = null;
    this.interval = null;
    this._entityID = null;
    this.textureCollection = textureCollection;
    _this = this;
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
    this.particle = Entities.addEntity(particle, true);
    console.log("adding particle: ", this.particle);
}


function registerEntity(entityID){
    this._entityID = entityID;
}


// Main Animator that is controlling the specific interval animations
var UDPATE_MIN = 60;
var UPDATE_MAX = 250;
function animate() {
    // Get a random amount between 17 to 1000 as how often to animate by
    var intervalAmount = randomInt(UDPATE_MIN, UPDATE_MAX);
    console.log("interval Amount", intervalAmount)
    this.interval = Script.setInterval(intervalAnimator.bind(this), intervalAmount);
}


// var textureCount = 0;
// var textureSwitchCount = 15;
var EMIT_RATE_MIN = 0;
var EMIT_RATE_MAX = 100;
var PARTICLE_RADIUS_MIN = 0;
var PARTICLE_RADIUS_MAX = 1; 
var EMIT_SPEED_MIN = 0;
var EMIT_SPEED_MAX = 3;
var EMIT_ACCELERATION_MIN = -1;
var EMIT_ACCELERATION_MAX = 1;
var EMIT_ORIENTATION_MIN = -180;
var EMIT_ORIENTATION_MAX = 180;
function intervalAnimator(){
    var particleProps = {
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
        )
    };

    // Get a random texture
    var maxTextureLength = _this.textureCollection.length - 1;
    var randomTexture = randomInt(0, maxTextureLength);
    particleProps.textures = _this.textureCollection[randomTexture];
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
