//
//  flamethrowerServer.js
//
//  Created by David Back on 3/28/18.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {   
    var FIREBALL_IMAGE = Script.resolvePath("../textures/fireball.jpg");
    var END_FIRE_SOUND_1 = SoundCache.getSound(Script.resolvePath("../sounds/flamethrowerEndFire.wav"));
    var END_FIRE_SOUND_2 = SoundCache.getSound(Script.resolvePath("../sounds/flamethrowerEndFire2.wav"));
    var END_FIRE_SOUND_3 = SoundCache.getSound(Script.resolvePath("../sounds/flamethrowerEndFire3.wav"));
    var END_FIRE_VOLUME = 0.6;
    
    var INTERSECT_TYPE = {
        ENTITY : 0,
        AVATAR : 1,
        NONE : 2 // now only used for debugging purposes to verify end of flame ray cast with DEBUG_FIRING in client script
    };
    var LIFETIMES = [3.0, 1.5, 1.0];
    
    var _this;
    var endFireSound = null;
    var endFireSoundPosition = undefined;
    var remainingSoundReplays = 0;
    
    Flamethrower = function() {
        _this = this;
    };

    Flamethrower.prototype = {
        remotelyCallable: ['createEndFireHitEntity', 'createEndFireHitShape', 'createEndFireHitAvatar', 'createEndFireNoHit'],
        createEndFireHitEntity: function(entityID, params) {
            this.createEndFire(INTERSECT_TYPE.ENTITY, params);
        },
        
        createEndFireHitAvatar: function(entityID, params) {
            this.createEndFire(INTERSECT_TYPE.AVATAR, params);
        },
        
        createEndFireNoHit: function(entityID, params) {
            this.createEndFire(INTERSECT_TYPE.NONE, params);
        },
        
        createEndFire: function(intersectType, params) {
            var intersectEntityID = params[0];
            var fireEnd = { x:params[1], y:params[2], z:params[3] };
            var intersectLocalPosition = { x:params[4], y:params[5], z:params[6] };
            var lifetime = LIFETIMES[intersectType];
            Entities.addEntity({
                accelerationSpread: {
                    x: 0.18,
                    y: 0.39,
                    z: 0.19
                },
                alpha: 0.8399999737739563,
                alphaSpread: 1,
                alphaStart: 0,
                alphaFinish: 0,
                azimuthStart: -115.99999867453464,
                azimuthFinish: 77.00000100435534,
                color: {
                    red: 255,
                    green: 255,
                    blue: 255
                },
                colorSpread: {
                    red: 115,
                    green: 115,
                    blue: 115
                },
                colorStart: {
                    red: 255,
                    green: 107,
                    blue: 15
                },
                colorFinish: {
                    red: 255,
                    green: 33,
                    blue: 26
                },
                emitAcceleration: {
                    x: 0,
                    y: 0.5,
                    z: 0
                },
                emitDimensions: {
                    x: 1,
                    y: 1,
                    z: 1
                },
                emitOrientation: {
                    x: -90,
                    y: 0,
                    z: 0
                },
                emitRate: 6,
                emitterShouldTrail: true,
                emitSpeed: 0.05000000074505806,
                lifespan: 1.0099999904632568,
                lifetime: lifetime,
                localPosition: intersectType === INTERSECT_TYPE.ENTITY ? intersectLocalPosition : undefined,
                maxParticles: 100,
                name: "Flamethrower End Flame",
                parentID: intersectType === INTERSECT_TYPE.ENTITY ? intersectEntityID : undefined,
                position: intersectType === INTERSECT_TYPE.ENTITY ? undefined : fireEnd,
                particleRadius: 0.4099999964237213,
                polarStart: 0,
                polarFinish: 1.9999999845072665,
                radiusSpread: 3.259999990463257,
                radiusStart: 0.3100000023841858,
                radiusFinish: 0.5099999904632568,
                speedSpread: 0,
                textures: FIREBALL_IMAGE,
                type: "ParticleEffect"
            });
            
            var newSound = endFireSoundPosition === undefined || Vec3.distance(fireEnd, endFireSoundPosition) > 0.5;
            if (endFireSound === null || !endFireSound.isPlaying() || newSound) {
                this.playEndFireSound(fireEnd);
            }
            
            remainingSoundReplays = intersectType === INTERSECT_TYPE.ENTITY ? 2 : 0;
        },
        
        playEndFireSound: function(fireEndPosition) {
            if (endFireSound !== null) {
                endFireSound.finished.disconnect(flamethrowerServer.onEndFireSoundFinished);
            }
            var random = Math.random();
            var sound = END_FIRE_SOUND_1;
            if (random > 0.33 & random <= 0.67) {
                sound = END_FIRE_SOUND_2;
            } if (random > 0.67) {
                sound = END_FIRE_SOUND_3;
            }
            endFireSound = Audio.playSound(sound, {
                volume: END_FIRE_VOLUME,
                position: fireEndPosition
            });
            endFireSound.finished.connect(flamethrowerServer.onEndFireSoundFinished);
            endFireSoundPosition = fireEndPosition;
        },

        onEndFireSoundFinished: function() {
            if (remainingSoundReplays > 0) {
                remainingSoundReplays--;
                this.playEndFireSound(endFireSoundPosition);
            }
        },
        
        unload: function() {
            endFireSound.finished.disconnect(flamethrowerServer.onEndFireSoundFinished);
        },

        preload: function(entityID) {
            _this.entityID = entityID;
        }
    };

    var flamethrowerServer = new Flamethrower();
    return flamethrowerServer;
});
