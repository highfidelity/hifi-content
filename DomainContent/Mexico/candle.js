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

    var AUDIO_VOLUME_LEVEL = 1;
    var SEARCHING_INTERVAL_MS = 10;
    var SEARCH_RADIUS_M = 0.1;
    var EXTINGUISH_TIMER_MS = 6000;
    var REMOVE_CANDLE_TIMER_MS = 10000;

    var sound;
    var firstLight = true;
    var injector;
    var flame;
    var removeCandle;
    var searching;

    var Candle = function() {
        _this = this;
    };

    Candle.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            sound = SoundCache.getSound(Script.resolvePath("DrumKit/COWBELL1.wav"));
            print("preload");
        },

        startNearGrab: function() {
            print("grabbed");
            if (removeCandle) {
                print("clearing delete timeout");
                Script.clearTimeout(removeCandle);
                removeCandle = null;
            }
            if (firstLight) {
                searching = Script.setInterval(this.searchForFire(), SEARCHING_INTERVAL_MS);
            }
        },

        searchForFire: function() {
            print("searching");
            Entities.findEntities(_this.entityID, SEARCH_RADIUS_M).forEach(function(element) {
                var name = Entities.getEntityProperties(element, 'name').name;
                if (name.indexOf("Flame") || name.indexOf("Candle")) {
                    print("found a flame");
                    this.lightCandle();
                    this.playSound();
                    Script.clearInterval(searching);
                }
            });
        },

        lightCandle: function() {
            print("lighting");
            this.playSound();
            flame = Entities.addEntity({
                type: "ParticleEffect",
                parentID: _this.entitiyID,
                localPosition: _this.flamePosition, 
                dimensions: { x: 0.2450, y: 0.2450, z: 0.2450 }, 
                color: { red: 0, green: 255, blue: 0 },
                gravity: { x: 0, y: 0, z: 0 },
                ignoreCollisions: true,
                userData: {
                    grabbable: false
                },
                name: "Candle Flame",
                isEmitting: true,
                maxParticles: 3033,
                lifespan: 0.44999998807907104,
                emitRate:262,
                emitSpeed:0,
                speedSpread: 0,
                emitOrientation: {
                    x: -0.0000152587890625,
                    y: -0.0000152587890625,
                    z: -0.0000152587890625,
                    w: 1
                },
                emitRadiusStart:1,
                polarStart: 1.8151423931121826,
                polarFinish: 1.9024088382720947,
                azimuthStart:-3.1415927410125732,
                azimuthFinish:3.1415927410125732,
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
                emitterShouldTrail: true,
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
            Script.setTimeout(function() {
                Entities.deleteEntity(flame);
            }, EXTINGUISH_TIMER_MS);
            firstLight = false;
        },

        releaseGrab: function() {
            print("releasing");
            removeCandle = Script.setTimeout(function() {
                if (flame) {
                    Entities.deleteEntity(flame);
                }
                if (injector) {
                    injector.stop();
                }
                Entities.deleteEntity(_this.entityID);
            }, REMOVE_CANDLE_TIMER_MS);
        },

        playSound: function(buttonID, params) {
            print("sound");
            _this.flamePosition = Entities.getEntityProperties(flame, ["position"]).position;
            _this.injector = Audio.playSound(_this.sound, {position: _this.flamePosition, volume: AUDIO_VOLUME_LEVEL});
            Audio.playSound(sound, {
                position: _this.flamePosition,
                volume: AUDIO_VOLUME_LEVEL
            });
        },

        unload: function() {
            if (injector) {
                injector.stop();
            }
            this.releaseGrab();
        }
    };

    return new Candle;
});
