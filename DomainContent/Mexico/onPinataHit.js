//
// onPinataHit.js
// A script to handle pinata behavior
// 
// Author: Elisa Lupin-Jimenez
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// All assets are under CC Attribution Non-Commerical
// http://creativecommons.org/licenses/
//

(function() {

    var WHACK_SOUND;
    var PARTY_SOUND;
    var paddleID;
    var paddleOriginalPosition;
    var pinataID;
    var pinataOriginalPosition;

    this.preload = function(entityID) {
        paddleID = entityID;
        paddleOriginalPosition = Entities.getEntityProperties(entityID, "position").position;
        var pinataArray = Entities.findEntities(paddleOriginalPosition, 3);
        for (i in pinataArray) {
            var objectID = pinataArray[i];
            if (Entities.getEntityProperties(objectID, "name").name === "Pinata") {
                pinataID = objectID;
                pinataOriginalPosition = Entities.getEntityProperties(objectID, "position").position;
            }
        }
        // sound from http://soundbible.com/1952-Punch-Or-Whack.html
        WHACK_SOUND = SoundCache.getSound("https://hifi-content.s3.amazonaws.com/elisalj/mexico/whack.wav");
        PARTY_SOUND = SoundCache.getSound("http://mpassets.highfidelity.com/a5f42695-f15a-4f44-9660-14b4f8ca2b29-v1/PartyHorn4.wav");
    };

    var hits = 0;
    var hitsToBreak = Math.random() * 10;
    var TIMEOUT = 30000;
    var CANDY_LIFETIME = 30;

    var PARTICLE_COUNT = 8;

    var CONFETTI = {
        type: "ParticleEffect",
        isEmitting: 1,
        maxParticles: 8,
        lifespan: 10,
        lifetime: 3,
        emitRate: 100,
        emitSpeed: 3,
        speedSpread: 1,
        script: "(function() { return { preload: function(e) { Script.setTimeout(function(){Entities.editEntity(e, { 'isEmitting': 0, 'script':'' }) },50); } } })",
        emitOrientation: Quat.fromVec3Degrees({x: 0, y: 90, z: 0}),
        emitDimensions: {
            x: 0.5,
            y: 0.5,
            z: 0.5
        },
        polarStart: Math.PI/180 * 75,
        polarFinish: Math.PI/180 * (90+15),
        azimuthStart: -0.3,
        azimuthFinish: 0.3,
        emitAcceleration: {
            x: 0,
            y: -0.5,
            z: 0
        },
        accelerationSpread: {
            x: 0,
            y: 0,
            z: 0
        },
        textures: "http://mpassets.highfidelity.com/a5f42695-f15a-4f44-9660-14b4f8ca2b29-v1/Confetti.png",
        alpha: 1,
        alphaSpread: 0,
        alphaStart: 1,
        alphaFinish: 1,
        emitterShouldTrail: 0
    };

    var CANDY = {
        name: "Pinata Candy",
        type: "Model",
        modelURL: "https://hifi-content.s3.amazonaws.com/elisalj/mexico/candy/candy%20corn.obj",
        dimensions: {
            x: 0.0784,
            y: 0.1164,
            z: 0.0784
        },
        dynamic: true,
        collisionless: false,
        shapeType: "Box",
        gravity: {
            "x": 0,
            "y": -9.8,
            "z": 0
        },
        lifetime: CANDY_LIFETIME,
        script: "https://hifi-content.s3.amazonaws.com/elisalj/emoji_scripts/behaviors/crunch.js"
    };

    var randColor = function() {
        return {
            red: Math.random() * 255,
            green: Math.random() * 255,
            blue: Math.random() * 255
        };
    };

    var shootConfetti = function(properties) {
        for (var i = 0; i < PARTICLE_COUNT; i++) {
            var part = CONFETTI;

            part.colorStart = randColor();
            part.colorFinish = part.colorStart;
            part.color = part.colorStart;
            part.dimensions = {
                x: Math.random()*0.5,
                y: Math.random()*0.5,
                z: Math.random()*0.5
            };
            part.position = properties.position;
            part.rotation = properties.rotation;
            Entities.addEntity(part, true);
        }
    };

    var dropCandy = function(properties) {
        for (var i = 0; i < PARTICLE_COUNT; i++) {
            var candy = CANDY;
            candy.position = properties.position;
            Entities.addEntity(candy, true);
        }
    };

    this.collisionWithEntity = function(paddleID, pinataID, collisionInfo) {
        if (Entities.getEntityProperties(pinataID, "name").name === "Pinata") {
            var pinataProperties = Entities.getEntityProperties(pinataID);
            shootConfetti(pinataProperties);
            if (hits > hitsToBreak) {
                print("pinata has been defeated");
                Audio.playSound(PARTY_SOUND, {position: pinataProperties.position, volume: 0.20, loop: false});
                dropCandy(pinataProperties);

                pinataProperties.name = "Invisible Pinata";
                pinataProperties.collisionless = true;
                pinataProperties.visible = false;
                Entities.editEntity(pinataID, pinataProperties);

                Script.setTimeout(function() {
                    hits = 0;
                    hitsToBreak = Math.random() * 10;
                    pinataProperties.name = "Pinata";
                    pinataProperties.collisionless = false;
                    pinataProperties.visible = true;
                    Entities.editEntity(pinataID, pinataProperties);
                }, TIMEOUT);
            } else {
                Audio.playSound(WHACK_SOUND, {position: pinataProperties.position, volume: 0.20, loop: false});
                hits++;
            }
        }
    };

    Script.setInterval(function() {
        var pinataProperties = Entities.getEntityProperties(pinataID, "position");
        var paddleProperties = Entities.getEntityProperties(paddleID, "position");
        if (Vec3.distance(pinataOriginalPosition, pinataProperties.position) > 1) {
            pinataProperties.position = pinataOriginalPosition;
            Entities.editEntity(pinataID, pinataProperties);
        }
        if (Vec3.distance(paddleOriginalPosition, paddleProperties.position) > 1) {
            paddleProperties.position = paddleOriginalPosition;
            Entities.editEntity(paddleID, paddleProperties);
        }
    }, TIMEOUT);

});