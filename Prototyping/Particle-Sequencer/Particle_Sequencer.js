// Particle Array Consts
var IS_EMITTING = "isEmitting",
    LIFESPAN = "lifespan",
    MAX_PARTICLES = "maxParticles",
    TEXTURES = "textures",
    EMIT_RATE = "emitRate",
    EMIT_SPEED = "emitSpeed",
    SPEED_SPREAD = "speedSpread",
    EMIT_DIMENSIONS = "emitDimensions",
    EMIT_ORIENTATION = "emitOrientation",
    EMITTER_SHOULD_TRAIL = "emitterShouldTrail",
    PARTICLE_RADIUS = "particleRadius",
    RADIUS_SPREAD = "radiusSpread",
    RADIUS_START = "radiusStart",
    RADIUS_FINISH = "radiusFinish",
    COLOR = "color",
    COLOR_SPREAD = "colorSpread",
    COLOR_START = "colorStart",
    COLOR_FINISH = "colorFinish",
    EMIT_ACCELERATION = "emitAcceleration",
    ACCELERATION_SPREAD = "accelerationSpread",
    ALPHA = "alpha",
    ALPHA_SPREAD = "alphaSpread",
    ALPHA_START = "alphaStart",
    ALPHA_FINISH = "alphaFinish",
    POLOR_START = "polarStart",
    POLOR_FINISH = "polarFinish",
    AZIMUTH_START = "azimuthStart",
    AZIMUTH_FINISH = "azimuthFinish";

// Get Particle in front of you
function getPosition(x, y, z) {
    var localOffset = {x: x, y: y, z: z}; 
    var worldOffset = Vec3.multiplyQbyV(MyAvatar.orientation, localOffset);
    return Vec3.sum(MyAvatar.position, worldOffset);
}

// Paste the properties given to you by a particle, comma separated
var particleArray = [
    {"isEmitting":true,"lifespan":"1.5","maxParticles":"10","textures":"https://content.highfidelity.com/DomainContent/production/Particles/wispy-smoke.png","emitRate":"95","emitSpeed":"1.35","speedSpread":"1.35","emitDimensions":{"x":"0","y":"20","z":"0"},"emitOrientation":{"x":"0","y":"90","z":"0"},"emitterShouldTrail":true,"particleRadius":"0.25","radiusSpread":"0","radiusStart":"0","radiusFinish":"0.10000000149011612","color":{"red":"200","blue":"200","green":"200"},"colorSpread":{"red":"0","blue":"0","green":"0"},"colorStart":{"red":"200","blue":"200","green":"200"},"colorFinish":{"red":"0","blue":"0","green":"0"},"emitAcceleration":{"x":"-0.5","y":"2.5","z":"-0.5"},"accelerationSpread":{"x":"0.5","y":"1","z":"0.5"},"alpha":"0","alphaSpread":"0","alphaStart":"1","alphaFinish":"0","particleSpin":0,"spinSpread":0,"spinStart":0,"spinFinish":0,"rotateWithEntity":false,"polarStart":0,"polarFinish":0,"azimuthStart":-3.1415927410125732,"azimuthFinish":3.1415927410125732}
];

// Particles get stored here:
var particleEntities = [];

// Create the particles
particleArray.forEach(function(particle){
    particle.type = "ParticleEffect";
    particle.position = getPosition(0,0,-2);
    particleEntities.push(Entities.addEntity(particle));
});

// Sequencing section
particle[0].at(100)
    .change(AZIMUTH_START).to(PI/2).at(200)
    .change(EMIT_ACCELERATION).to(500).at(200)
    .change(EMIT_ACCELERATION).from().to().at(500)
    .exec();
particle[1]


// Delete the Entities on cleanup
Script.scriptEnding.connect(function(){
    particleEntities.forEach(function(id){
        Entities.deleteEntity(id);
    });
});
