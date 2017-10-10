//
// dodgeball.js
//
//  Simple game of dodgeball
//  Created by Midnight Rift on 10/01/2017
//  Modified by Philip Rosedale and Milad Nazeri
//  Copyright 2017 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function () {
    var FORCE_DROP_CHANNEL = "Hifi-Hand-Drop";

    var proxInterval,
        proxTimeout;

    var _entityID;

    var lightTimer = 0,
        spotlight = null,
        MIN_SPOTLIGHT_INTENSITY = 5,
        MIN_SPOTLIGHT_FALLOFF_RADIUS = 5,
        SPOTLIGHT_INTENSITY = 50,
        SPOTLIGHT_FALLOFF_RADIUS = 10,
        LIGHT_UPDATE_INTERVAL = 50,
        LIGHT_LIFETIME = 200;


    var BALL_SOUNDS = [];

    var HIT_SOUND = null;

    var releasingAvatarID = null;

    var canMakeBounceNoise = true;

    function playBounceSound(position) {

        function randomNumber(start, end) {
            return Math.floor(Math.random() * (end - start + 1)) + start;
        }
        var ballsound = BALL_SOUNDS[randomNumber(0,BALL_SOUNDS.length)];
        Audio.playSound(ballsound, {
            position: position,
            volume: 1.0
        });
    }

    function makeLight(parent, position, colorDivisor) {
        //  Create a flickering light somewhere for a while
        if (spotlight !== null) {
            // light still exists, do nothing
            return;
        }

        var colorIndex = 180 + Math.random() * 50;

        spotlight = Entities.addEntity({
            type: "Light",
            name: "Test Light",
            intensity: 50.0,
            falloffRadius: 20.0,
            dimensions: {
                x: 150,
                y: 150,
                z: 150
            },
            position: position,
            parentID: parent,
            color: {
                red: colorIndex,
                green: colorIndex / colorDivisor,
                blue: 0
            },
            lifetime:  LIGHT_LIFETIME * 2
        });

        lightTimer = 0;
        lightTimeoutID = Script.setTimeout(updateLight, LIGHT_UPDATE_INTERVAL);
    }

    function updateLight() {
        lightTimer += LIGHT_UPDATE_INTERVAL;
        if ((spotlight !== null) && (lightTimer > LIGHT_LIFETIME)) {
            Entities.deleteEntity(spotlight);
            spotlight = null;
        } else {
            Entities.editEntity(spotlight, {
                intensity: MIN_SPOTLIGHT_INTENSITY + Math.random() * SPOTLIGHT_INTENSITY,
                falloffRadius:  MIN_SPOTLIGHT_FALLOFF_RADIUS + Math.random() * SPOTLIGHT_FALLOFF_RADIUS
            });
            lightTimeoutID = Script.setTimeout(updateLight, LIGHT_UPDATE_INTERVAL);
        }
    }

    var particleTrailEntity = null;

    function particleTrail() {

        var props = {
            type: 'ParticleEffect',
            name: 'Particle',
            parentID: _entityID,
            isEmitting: true,
            lifespan: 4.0,
            maxParticles: 100,
            textures: 'https://content.highfidelity.com/DomainContent/production/Particles/wispy-smoke.png',
            emitRate: 150,
            emitSpeed: 0,
            emitAcceleration: {
                x: 0,
                y: 0,
                z: 0
            },
            emitterShouldTrail: true,
            particleRadius: 0,
            radiusSpread: 0,
            radiusStart: 0.2,
            radiusFinish: 0.1,
            color: {
                red: 201,
                blue: 201,
                green: 34
            },
            accelerationSpread: {
                x: 0,
                y: 0,
                z: 0
            },
            alpha: 0,
            alphaSpread: 0,
            alphaStart: 1,
            alphaFinish: 0,
            polarStart: 0,
            polarFinish: 0,
            azimuthStart: -180,
            azimuthFinish: 180
        };

        particleTrailEntity = Entities.addEntity(props);
    }

    function particleExplode() {
        var entPos = Entities.getEntityProperties(_entityID, 'position').position;
        makeLight(_entityID, entPos, 10);
        var props = {
            type: 'ParticleEffect',
            name: 'Particle',
            parentID: _entityID,
            isEmitting: true,
            lifespan: 2,
            maxParticles: 10,
            localPosition: {
                x: 0,
                y: 0,
                z: 0
            },
            textures: 'https://content.highfidelity.com/DomainContent/production/Particles/wispy-smoke.png',
            emitRate: 1,
            emitSpeed: 0,
            emitterShouldTrail: false,
            particleRadius: 1,
            radiusSpread: 0,
            radiusStart: 0,
            radiusFinish: 1,
            color: {
                red: 232,
                blue: 232,
                green: 26
            },
            emitAcceleration: {
                x: 0,
                y: 0,
                z: 0
            },
            alpha: 0,
            alphaSpread: 0,
            alphaStart: 1,
            alphaFinish: 0.5,
            polarStart: 0,
            polarFinish: 0,
            azimuthStart: -180,
            azimuthFinish: 180
        };
        var explosionParticles = Entities.addEntity(props);

        playBounceSound(entPos);

        Script.setTimeout(function () {
            Entities.deleteEntity(explosionParticles);
        }, 500);

        Audio.playSound(HIT_SOUND, {
            position: entPos,
            volume: 0.3
        });
    }

    function clearProxCheck() {
        if (proxInterval) {
            Script.clearInterval(proxInterval);
            Entities.deleteEntity(particleTrailEntity);
            particleTrailEntity = null;
        }

        if (proxTimeout) {
            Script.clearTimeout(proxTimeout);
        }
    }

    function proxCheck() {
        var ballPos = Entities.getEntityProperties(_entityID, ['position']).position;
        var avatarReleasingBallPosition = AvatarList.getAvatar(releasingAvatarID).position;
        var ballFromAvatar = Vec3.distance(avatarReleasingBallPosition, ballPos);

        if (ballFromAvatar > 1.0) {
            var isAnyAvatarInRange = AvatarList.isAvatarInRange(ballPos, 0.80);
            if (isAnyAvatarInRange) {
                clearProxCheck();
                particleExplode();
            }
        }
    }

    this.preload = function (entityID) {
        _entityID = entityID;

        Entities.editEntity(_entityID, {
            userData: JSON.stringify({grabbableKey: {grabbable: true}})
        });
        BALL_SOUNDS.push(SoundCache.getSound(Script.resolvePath('bounce01.wav')));
        BALL_SOUNDS.push(SoundCache.getSound(Script.resolvePath('bounce02.wav')));
        BALL_SOUNDS.push(SoundCache.getSound(Script.resolvePath('bounce03.wav')));
        BALL_SOUNDS.push(SoundCache.getSound(Script.resolvePath('bounce04.wav')));
        BALL_SOUNDS.push(SoundCache.getSound(Script.resolvePath('bounce05.wav')));
        HIT_SOUND = SoundCache.getSound(Script.resolvePath('hit.wav'));
    };

    this.startDistanceGrab = function (thisEntityID, triggerHandAndAvatarUUIDArray) {
        clearProxCheck();
        var triggerHand = triggerHandAndAvatarUUIDArray[0];
        var avatarUUID = triggerHandAndAvatarUUIDArray[1];

        var ballPos = Entities.getEntityProperties(_entityID, ['position']).position;
        var MAX_DISTANCE_GRAB = 2; // meter

        if (Vec3.distance(ballPos, AvatarList.getAvatar(avatarUUID).position) > MAX_DISTANCE_GRAB) {
            Messages.sendMessage(FORCE_DROP_CHANNEL, triggerHand, true);
        }

    };

    this.startNearGrab = function (thisEntityID, triggerHandAndAvatarUUIDArray) {
        clearProxCheck();
    };

    this.releaseGrab = function (thisEntityID, triggerHandAndAvatarUUIDArray) {
        canMakeBounceNoise = true;
        releasingAvatarID = triggerHandAndAvatarUUIDArray[0];

        if (particleTrailEntity === null) {
            particleTrail();
        }

        Script.setTimeout(function () {
            proxInterval = Script.setInterval(proxCheck, 50);
        }, 200); // Setting a delay to give it time to leave initial avatar without proc.

        proxTimeout = Script.setTimeout(function () {
            clearProxCheck();
        }, 10000);
    };

    this.collisionWithEntity = function (thisEntityID, collisionEntityID, collisionInfo) {

        if (canMakeBounceNoise){ // a simple debounce
            playBounceSound(collisionInfo.contactPoint);
            canMakeBounceNoise = false;
            Script.setTimeout(function () {
                canMakeBounceNoise = true;
            }, 2000);
        }

        clearProxCheck();
    };

    this.unload = function () {
        clearProxCheck();
    };

});
