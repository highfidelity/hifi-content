//
//  candle.js
//
//  created by Rebecca Stankus on 02/09/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {

    var _this;

    var AUDIO_VOLUME_LEVEL = 0.25;
    var SEARCHING_INTERVAL_MS = 100;
    var SEARCH_RADIUS_M = 0.05;
    var EXTINGUISH_TIMER_MS = 60000;
    var REMOVE_CANDLE_TIMER_MS = 10000;
    var HALF = 0.5;
    var NOT_FOUND = -1;
    var BOTH_HANDS = 2;
    var ONE_HAND = 1;
    var NO_HANDS = 0;

    var sound;
    var injector;
    var flame;
    var removeCandle;
    var searching;
    var flamePosition;
    var candleDimensionsY;
    var flameLocalPosition;
    var handsOn = 0;
    var audioUpdate;

    var Candle = function() {
        _this = this;
    };

    Candle.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            sound = SoundCache.getSound(Script.resolvePath("Sounds/174494__unfa__firework-candle-raw.wav"));
            candleDimensionsY = Entities.getEntityProperties(_this.entityID, ['dimensions']).dimensions.y;
            flameLocalPosition = {x: 0, y: candleDimensionsY * HALF, z: 0};
        },

        startNearGrab: function() {
            if (handsOn === 0) {
                handsOn = ONE_HAND;
                if (removeCandle) {
                    Script.clearTimeout(removeCandle);
                    removeCandle = null;
                }
                searching = Script.setInterval(this.searchForFire, SEARCHING_INTERVAL_MS);
            } else {
                handsOn = BOTH_HANDS;
            }
        },

        searchForFire: function() {
            var candlePosition = Entities.getEntityProperties(_this.entityID, 'position').position;
            candlePosition.y += (HALF * candleDimensionsY);
            flamePosition = candlePosition;
            Entities.findEntities(flamePosition, SEARCH_RADIUS_M).forEach(function(element) {
                var name = Entities.getEntityProperties(element, 'name').name;
                if (name.indexOf("Flame") !== NOT_FOUND) {
                    _this.lightCandle();
                    Script.clearInterval(searching);
                    searching = null;
                }
            });
        },

        lightCandle: function() {
            var candlePosition = Entities.getEntityProperties(_this.entityID, 'position').position;
            candlePosition.y += (HALF * candleDimensionsY);
            flamePosition = candlePosition;
            flame = Entities.addEntity({
                type: "ParticleEffect",
                position: flamePosition,
                parentID: _this.entityID,
                localPosition: flameLocalPosition, 
                dimensions: { x: 0.2450, y: 0.2450, z: 0.2450 },
                naturalDimensions: {x:1,y:1,z:1},
                ignoreCollisions: true,
                userData: {
                    grabbable: false
                },
                name: "Candle Flame",
                isEmitting: true,
                maxParticles: 3033,
                lifespan: 0.44999998807907104,
                emitRate:262,
                emitSpeed: 0,
                speedSpread:0,
                emitOrientation: {
                    x: -0.0000152587890625,
                    y: -0.0000152587890625,
                    z: -0.0000152587890625,
                    w: 1
                },
                emitDimensions: {x:0, y:0, z:0},
                emitRadiusStart:1,
                polarStart: 1.8151423931121826,
                polarFinish: 1.9024088382720947,
                radiusFinish: 0.019999999552965164,
                radiusStart: 0.019999999552965164,
                radiusSpread:0,
                azimuthStart:-180,
                azimuthFinish:180,
                emitAcceleration:{
                    x:-0.009999999776482582,
                    y:1,
                    z:-0.009999999776482582
                },
                accelerationSpread:{
                    x:0.5,
                    y:1,
                    z:0.5
                },
                particleRadius:0.019999999552965164,
                alpha: 0.38999998569488525,
                alphaStart:0.1899999976158142,
                alphaFinish:0.3499999940395355,
                alphaSpread:0,
                emitterShouldTrail: 1,
                textures: "http://hifi-content.s3.amazonaws.com/alan/dev/Particles/Fireball.jpg",
                boundingBox:{
                    brn:{
                        x:496.9137268066406,
                        y:500.04229736328125,
                        z:467.0626525878906
                    },
                    tfl:{
                        x:497.3018493652344,
                        y:500.358642578125,
                        z:467.4186096191406
                    },
                    center:{
                        x:497.1077880859375,
                        y:500.2004699707031,
                        z:467.2406311035156},
                    dimensions:{
                        x:0.38812255859375,
                        y:0.31634521484375,
                        z:0.35595703125
                    }
                }
            });
            _this.playSound();
            audioUpdate = Script.setInterval(function() {
                if (flame) {
                    _this.updateSoundPosition;
                }
            }, SEARCHING_INTERVAL_MS);
            Script.setTimeout(function() {
                Entities.deleteEntity(flame);
                if (injector) {
                    if (audioUpdate) {
                        Script.clearInterval(audioUpdate);
                    }
                    injector.stop();
                }
                if (handsOn === 1) {
                    handsOn = NO_HANDS;
                    _this.startNearGrab();
                } else if (handsOn ===2) {
                    handsOn = ONE_HAND;
                    _this.startNearGrab();
                }
            }, EXTINGUISH_TIMER_MS);
        },

        updateSoundPosition: function() {
            var newSoundPosition = Entities.getEntityProperties(flame, 'position').position;
            if (injector) {
                injector.options = { position: newSoundPosition };
            }
        },

        releaseGrab: function() {
            if (handsOn === 1) {
                if (!removeCandle) {
                    removeCandle = Script.setTimeout(function() {
                        if (flame) {
                            Entities.deleteEntity(flame);
                        }
                        if (injector) {
                            if (audioUpdate) {
                                Script.clearInterval(audioUpdate);
                            }
                            injector.stop();
                        }
                        Entities.deleteEntity(_this.entityID);
                    }, REMOVE_CANDLE_TIMER_MS);
                }
                if (searching) {
                    Script.clearInterval(searching);
                }
                searching = null;
                handsOn = NO_HANDS;
            } else {
                handsOn = ONE_HAND;
            }
            
        },

        playSound: function(buttonID, params) {
            _this.flamePosition = Entities.getEntityProperties(flame, 'position').position;
            if (sound.downloaded) {
                if (injector) {
                    if (audioUpdate) {
                        Script.clearInterval(audioUpdate);
                    }
                    injector.stop();
                }
                injector = Audio.playSound(sound, {
                    position: _this.flamePosition,
                    volume: AUDIO_VOLUME_LEVEL,
                    loop: true
                }); 
            }
        },

        unload: function() {
            if (injector) {
                if (audioUpdate) {
                    Script.clearInterval(audioUpdate);
                }
                injector.stop();
            }
            this.releaseGrab();
        }
    };

    return new Candle;
});
