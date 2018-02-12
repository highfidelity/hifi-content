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

    var whackSound;
    var partySound;
    var paddleID;
    var paddleOriginalPosition;
    var pinataID;
    var pinataOriginalPosition;

    var WHACK_URL = Script.resolvePath("./sounds/whack.wav");
    var PARTY_URL = Script.resolvePath("./sounds/PartyHorn4.wav");
    var CONFETTI_HELPER_SCRIPT = Script.resolvePath("./confettiHelper.js");
    var CHECK_DISTANCE_FROM_PADDLE = 3;
    var CONFETTI_SIZE_RANDOMIZER = 0.5;
    var AUDIO_VOLUME = 0.2;
    var RESET_PINATA_DISTANCE = 1;

    this.preload = function(entityID) {
        paddleID = entityID;
        paddleOriginalPosition = Entities.getEntityProperties(entityID, "position").position;
        var pinataArray = Entities.findEntities(paddleOriginalPosition, CHECK_DISTANCE_FROM_PADDLE);
        pinataArray.forEach(function(objectID) {
            var objectProperties = Entities.getEntityProperties(objectID, ["position", "name"]);
            if (objectProperties.name === "Pinata") {
                pinataID = objectID;
                pinataOriginalPosition = objectProperties.position;
            }
        });
        // sound from http://soundbible.com/1952-Punch-Or-Whack.html
        whackSound = SoundCache.getSound(WHACK_URL);
        partySound = SoundCache.getSound(PARTY_URL);
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
        script: CONFETTI_HELPER_SCRIPT,
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
        textures: Script.resolvePath("./assets/Confetti.png");
        alpha: 1,
        alphaSpread: 0,
        alphaStart: 1,
        alphaFinish: 1,
        emitterShouldTrail: 0
    };

    var CANDY = {
        name: "Pinata Candy",
        type: "Model",
        modelURL: Script.resolvePath("./assets/candy/candy%20corn.obj");
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
        script: Script.resolvePath("./crunch.js");
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
                x: Math.random() * CONFETTI_SIZE_RANDOMIZER,
                y: Math.random() * CONFETTI_SIZE_RANDOMIZER,
                z: Math.random() * CONFETTI_SIZE_RANDOMIZER
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
        var pinataProperties = Entities.getEntityProperties(pinataID, 
            ["name", "position", "rotation", "collisionless", "visible"]);
        if (pinataProperties.name === "Pinata") {
            shootConfetti(pinataProperties);
            if (hits > hitsToBreak) {
                Audio.playSound(partySound, {position: pinataProperties.position, volume: AUDIO_VOLUME, loop: false});
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
                Audio.playSound(whackSound, {position: pinataProperties.position, volume: AUDIO_VOLUME, loop: false});
                hits++;
            }
        }
    };

    Script.setInterval(function() {
        var pinataProperties = Entities.getEntityProperties(pinataID, "position");
        var paddleProperties = Entities.getEntityProperties(paddleID, "position");
        if (Vec3.distance(pinataOriginalPosition, pinataProperties.position) > RESET_PINATA_DISTANCE) {
            pinataProperties.position = pinataOriginalPosition;
            Entities.editEntity(pinataID, pinataProperties);
        }
        if (Vec3.distance(paddleOriginalPosition, paddleProperties.position) > RESET_PINATA_DISTANCE) {
            paddleProperties.position = paddleOriginalPosition;
            Entities.editEntity(paddleID, paddleProperties);
        }
    }, TIMEOUT);

});