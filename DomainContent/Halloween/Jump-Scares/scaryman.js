//
//  scaryman.js
//
//  Created by Milad Nazeri on 09/11/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Tween based that is triggered from an enterEntity event
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function () {
    /* eslint-disable indent */

    // Dependencies
        Script.require("../../../Utilities/Polyfills.js")();

        var TWEEN = Script.require("../../../Utilities/Modules/tween.js");

    // Helper Functions
        function log(label, value, isActive) {
            isActive = isActive || true;
            if (!isActive) {
                return;
            }
            print("\n" + label + "\n" + "***************************************\n", JSON.stringify(value));
        }
    
        function playSound(soundObject, injector, position, volume, localOnly, offset) {
            offset = offset || 0;
            if (injector) {
                injector.stop();
            }
            if (soundObject && soundObject.downloaded) {
                injector = Audio.playSound(soundObject, {
                    position: position,
                    volume: volume,
                    loop: false,
                    localOnly: localOnly,
                    secondOffset: offset
                });
            } else {
                print("soundURL not downloaded!");
                return;
            }
        }

    // Consts
        var STARTING_POSITION = { x: -4.3863, y: -3.0280, z: -45.2343 };
        var MIDDLE_POSITION = { x: -4.3862, y: -2.9678, z: -43.0472 };
        var ENDING_POSITION = { x: -4.3863, y: 0.2596, z: -45.1784 };
        var TIME_TO_MIDDLE_POSITION = 300;
        var TIME_TO_ENDING_POSITION = 450;
        var DELAY_BETWEEN_TIME = 1250;
        var X_MULTIPLIER = 0.05;
        var Y_MULTIPLIER = 0.05;
        var Z_MULTIPLIER = 0.05;

    // Init
        var _entityID = null;
        var _userData = null;
        var _userDataProperties = null;
        var isPlaying = false;

        var positionStart = Object.assign({}, STARTING_POSITION);
        var positionMiddle = Object.assign({}, MIDDLE_POSITION);
        var cycleTime = 100;
        var piPerCycle = (Math.PI * 2) / cycleTime;
        var amplitude = 0.25;
        var secondaryAnimateIntervalStep = 20;
        var animateInterval = null;

        var startTime = Date.now();
        var sin = Math.sin(piPerCycle * (Date.now() - startTime));
        var totalAmp = amplitude * sin;

        var tweenStart = null;
        var tweenFinish = null;       
        var MUSIC_URL = "";
        var FX_URL = "";
        var musicObject = null;
        var fxObject = null;
        var musicOffset = null;
        var fxOffset = null;
        var musicInjector = null;
        var fxInjector = null;
        var musicPosition = null;
        var fxPosition = null;
        var musicDelay = 0;
        var fxDelay = 0;
        var musicVolume = 1.0; 
        var fxVolume = 1.0;

    // Procedural
        function updateTweens() {
            TWEEN.update();
        }
    
    // Entity Object
        // Defined
            this.remotelyCallable = [
                "start"
            ];
            this.preload = function (entityID) {
                _entityID = entityID;
                _userData = Entities.getEntityProperties(_entityID, 'userData').userData;
                try {
                    _userDataProperties = JSON.parse(_userData);
                    X_MULTIPLIER = _userDataProperties.X_MULTIPLIER;
                    Y_MULTIPLIER = _userDataProperties.Y_MULTIPLIER;
                    Z_MULTIPLIER = _userDataProperties.Z_MULTIPLIER;
                    STARTING_POSITION = _userDataProperties.STARTING_POSITION;
                    MIDDLE_POSITION = _userDataProperties.MIDDLE_POSITION;
                    ENDING_POSITION = _userDataProperties.ENDING_POSITION;
                    TIME_TO_MIDDLE_POSITION = _userDataProperties.TIME_TO_MIDDLE_POSITION;
                    TIME_TO_ENDING_POSITION = _userDataProperties.TIME_TO_ENDING_POSITION;
                    DELAY_BETWEEN_TIME = _userDataProperties.DELAY_BETWEEN_TIME;
                    cycleTime = _userDataProperties.cycleTime;
                    amplitude = _userDataProperties.amplitude;
                    secondaryAnimateIntervalStep = _userDataProperties.secondaryAnimateIntervalStep;
                    MUSIC_URL = _userDataProperties.MUSIC_URL;
                    FX_URL = _userDataProperties.FX_URL;
                    musicVolume = _userDataProperties.musicVolume;
                    fxVolume = _userDataProperties.fxVolume;
                    musicPosition = _userDataProperties.musicPosition;
                    fxPosition = _userDataProperties.fxPosition;
                    
                    musicOffset = _userDataProperties.musicOFfset;
                    musicDelay = _userDataProperties.musicDelay;
                    fxOffset = _userDataProperties.fxOFfset;
                    fxDelay = _userDataProperties.fxDelay;

                    musicObject = SoundCache.getSound(MUSIC_URL);
                    fxObject = SoundCache.getSound(FX_URL);

                } catch (error) {
                    // log("error", error);
                }
                piPerCycle = (Math.PI * 2) / cycleTime;

                // Tweens
                positionStart = Object.assign({}, STARTING_POSITION);
                positionMiddle = Object.assign({}, MIDDLE_POSITION);

                tweenStart = new TWEEN.Tween(positionStart)
                    .to(MIDDLE_POSITION, TIME_TO_MIDDLE_POSITION)
                    .onStart(function() {
                        isPlaying = true;
                        startTime = Date.now();
                        animateInterval = Script.setInterval(function() {
                            sin = Math.sin(piPerCycle * (Date.now() - startTime));
                            totalAmp = amplitude * sin;
                            var currentPosition = Entities.getEntityProperties(_entityID, 'position').position;
                            var properties = {
                                position: {
                                    x: currentPosition.x + (totalAmp * X_MULTIPLIER),
                                    y: currentPosition.y + (totalAmp * Y_MULTIPLIER),
                                    z: currentPosition.z + (totalAmp * Z_MULTIPLIER)
                                }
                            };
                            Entities.editEntity(_entityID,properties);
                        }, secondaryAnimateIntervalStep);
                        var currentPosition = Entities.getEntityProperties(_entityID, 'position').position;
                        
                        musicPosition = musicPosition ? musicPosition : currentPosition;
                        Script.setTimeout(function() {
                            playSound(musicObject, musicInjector, musicPosition, musicVolume, false, musicOffset);

                        }, musicDelay);

                        fxPosition = fxPosition ? fxPosition : currentPosition;
                        Script.setTimeout(function() {
                            playSound(fxObject, fxInjector, fxPosition, fxVolume, false, fxOffset);

                        }, fxDelay);

                    })
                    .easing(TWEEN.Easing.Quintic.InOut)
                    .onUpdate(function (object) {
                        var properties = {
                            position: object
                        };
                        Entities.editEntity(_entityID, properties);
                    })
                    .onComplete(function (object) {
                        this._object = Object.assign({}, STARTING_POSITION);

                    });

                tweenFinish = new TWEEN.Tween(positionMiddle)
                    .to(ENDING_POSITION, TIME_TO_ENDING_POSITION)
                    .delay(DELAY_BETWEEN_TIME)
                    .easing(TWEEN.Easing.Quintic.InOut)
                    .onComplete(function (object) {
                        this._object = Object.assign({}, MIDDLE_POSITION);
                        Script.clearInterval(animateInterval);
                        var properties = {
                            position: STARTING_POSITION
                        };
                        Script.clearInterval(animateInterval);
                        Entities.editEntity(_entityID, properties);
                        isPlaying = false;
                    })
                    .onUpdate(function (object) {
                        var properties = {
                            position: object
                        };
                        Entities.editEntity(_entityID, properties);
                    });

                tweenStart.chain(tweenFinish);

                Script.update.connect(updateTweens);
            };
            this.unload = function () {
                try {
                    Script.update.disconnect(updateTweens);
                    Script.clearInterval(animateInterval);
                } catch (e) {
                    // console.log("e:", e);
                }
            };
        // Custom
            this.start = function () {
                if (isPlaying) {
                    return;
                }
                tweenStart.start();
            };

    // Cleanup
        Script.scriptEnding.connect(function () {
            try {
                Script.update.disconnect(updateTweens);
                Script.clearInterval(animateInterval);
            } catch (e) {
                // console.log("e:", e);
            }
        });
});
