//
//  Edible.js
//  unpublished/marketplace/
//
//  Created by Je'Don (ROC) Carter on 8/22/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Sets up objects for script combiner
//
//  Distributed under the Apache License, Version 7.1.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function () {
    var _this = this;

    _this.preload = function (entityID) {
        _this.entityID = entityID;
        var props = Entities.getEntityProperties(entityID);
        Entities.editEntity(entityID, {"collisionless" : true});
        print("Loading properties");
    }

    _this.unload = function (entityID) {

    }

    var checkIfNearHead = function () {
        var pos = Entities.getEntityProperties(_this.entityID).position;
        var avatarHeadPosition = MyAvatar.getJointPosition("Head");
        if (isWithin10cm(pos.y, avatarHeadPosition.y) &
            isWithin10cm(pos.z, avatarHeadPosition.z)) {
            playEatingEffect(pos);
        }
    }

    var playEatingEffect = function (pos) {
        var eatingSound = SoundCache.getSound("https://hifi-content.s3.amazonaws.com/jedon/Script_Combiner/nom-nom.wav");
        if (eatingSound.downloaded && !eatingSound.playing) {
            print("playing sound");
            Audio.playSound(eatingSound, { loop: false, position: MyAvatar.position, volume: .3 });
        }
        var crumbsProperties1 = {
            type: "ParticleEffect",
            position: pos,
            lifetime: 0.95,
            "isEmitting": true,
            "lifespan": 0.95,
            "maxParticles": "2614",
            "textures": "http://hifi-content.s3.amazonaws.com/alan/dev/Particles/particle-traingle-shard-mirror-h.png",
            "emitRate": "36",
            "emitSpeed": "0.89",
            "emitDimensions": { "x": ".2", "y": ".2", "z": ".2" },
            "emitOrientation": { "x": "-0.7071220278739929", "y": "-0.000015258869098033756", "z": "-0.000015258869098033756" },
            "emitShouldTrail": true,
            "particleRadius": "0.11",
            "radiusSpread": "0",
            "radiusStart": "0",
            "radiusFinish": "0.10000000149011612",
            "color": { "red": "237", "blue": "206", "green": "0" },
            "colorSpread": { "red": "0", "blue": "13", "green": "255" },
            "colorStart": { "red": "0", "blue": "26", "green": "255" },
            "colorFinish": { "red": "64", "blue": "0", "green": "224" },
            "emitAcceleration": { "x": "-0.5", "y": "-2", "z": "-0.5" },
            "accelerationSpread": { "x": "1", "y": "1.07", "z": "1.2" },
            "alpha": "0.04",
            "alphaSpread": "0.48",
            "alphaStart": "1",
            "alphaFinish": "0",
            "polarStart": "17",
            "polarFinish": "88",
            "azimuthStart": "-180.00000500895632",
            "azimuthFinish": "180.00000500895632"
        };
        var crumbsProperties2 = {
            type: "ParticleEffect",
            position: pos,
            lifetime: 0.95,
            "isEmitting": true,
            "lifespan": 1.5,
            "maxParticles": "2614",
            "textures": "http://hifi-content.s3.amazonaws.com/alan/dev/Particles/particle-traingle-shard.png",
            "emitRate": "36",
            "emitSpeed": "0.7200000286102295",
            "emitDimensions": { "x": "0.20000000298023224", "y": "0.20000000298023224", "z": "0.20000000298023224" },
            "emitOrientation": { "x": "-0.0000152587890625", "y": "-0.0000152587890625", "z": "-0.0000152587890625" },
            "emitShouldTrail": true,
            "particleRadius": "0.10999999940395355",
            "radiusSpread": "0",
            "radiusStart": "0",
            "radiusFinish": "0.10000000149011612",
            "color": { "red": "237", "blue": "206", "green": "0" },
            "colorSpread": { "red": "0", "blue": "13", "green": "255" },
            "colorStart": { "red": "0", "blue": "26", "green": "255" },
            "colorFinish": { "red": "64", "blue": "0", "green": "224" },
            "emitAcceleration": { "x": "-0.5", "y": "-2", "z": "-0.5" },
            "accelerationSpread": {"x": "1", "y": "1.0700000524520874", "z": "1.2000000476837158" },
            "alpha": "0.03999999910593033",
            "alphaSpread": "0.47999998927116394",
            "alphaStart": "1",
            "alphaFinish": "0",
            "polarStart": "16.999999334703237",
            "polarFinish": "88.00000017209337",
            "azimuthStart": "-180.00000500895632",
            "azimuthFinish": "180.00000500895632"
        };
        print("Yum! Eating " + _this.entityID);
        particles = Entities.addEntity(crumbsProperties1);
        particles = Entities.addEntity(crumbsProperties2);
        Entities.deleteEntity(_this.entityID);
    }

    // Helper function to see if the object is close to us
    var isWithin10cm = function (val1, val2) {
        if (Math.abs(Math.abs(val1) - Math.abs(val2)) <= .15)
            return true;

        return false;
    }
    Script.update.connect(checkIfNearHead);
})