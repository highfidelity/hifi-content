//
//  audioFileSync.js
//  An entity script to track audio file changes in a particle effect
// 
//  Author: Elisa Lupin-Jimenez
//  Copyright High Fidelity 2017
//
//  Licensed under the Apache 2.0 License
//  See accompanying license file or http://apache.org/
//
//  All assets are under CC Attribution Non-Commerical
//  http://creativecommons.org/licenses/
//

(function() {
    var _this = this;
    var DEFAULT_RADIUS = 0.25;
    var lastUpdateLevel = 0;
    var lastPosition = {x:0, y:0, z:0};
    var updateInterval = 10;
    var injector;
    var options;

    function loadInjector(sound) {
        options = { loop: true, position: Entities.getEntityProperties(_this.entityID, 'position').position };
        injector = Audio.playSound(sound, options);
        return injector;     
    }

    // load audio injector
    _this.preload = function(entityID) {
        _this.entityID = entityID;
        var audioFile = JSON.parse(Entities.getEntityProperties(_this.entityID, 'userData').userData).audio;
        var sound = SoundCache.getSound(audioFile);
        // if sound is already in cache
        if (sound.downloaded) {
            injector = loadInjector(sound);            
        } else {
            sound.ready.connect(function(){
                injector = loadInjector(sound);
            });
        }
    };

    // to enable gradual growth/decline of particle size
    function mixValue(valueA, valueB, percentage) {
        return valueA + ((valueB - valueA) * percentage);
    }

    _this.intervalID = Script.setInterval(function() {
        if (injector !== undefined && injector.isPlaying()) {
            // update spatialized sound location with particle movement
            var entityPosition = Entities.getEntityProperties(_this.entityID, 'position').position;
            if (Vec3.distance(lastPosition, entityPosition) > 0.01) {
                options.position = entityPosition;
                injector.setOptions(options);
                lastPosition = injector.options.position;
            }
            // default particle size with no sound
            if (injector.getLoudness() === 0) {
                if (lastUpdateLevel !== 0) {
                    var effectProps = Entities.getEntityProperties(_this.entityID, 'particleRadius');
                    effectProps.particleRadius = DEFAULT_RADIUS;
                    lastUpdateLevel = 0;
                    Entities.editEntity(_this.entityID, effectProps);
                }
            // update particle size with loudness of audio
            } else {
                var effectPropsChange = Entities.getEntityProperties(_this.entityID, 'particleRadius');
                var targetLevel = injector.getLoudness() + DEFAULT_RADIUS;
                effectPropsChange.particleRadius = mixValue(effectPropsChange.particleRadius, targetLevel, 0.5);
                lastUpdateLevel = injector.getLoudness();
                Entities.editEntity(_this.entityID, effectPropsChange);
            }
        }
    }, updateInterval);

    // stop audio injector when entity is deleted
    _this.unload = function() {
        Script.clearInterval(_this.intervalID);
        if (injector !== undefined) {
            injector.stop();
        }
    };
});