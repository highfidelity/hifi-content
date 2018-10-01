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

    // Init
        var _entityID = null;
        var _userData = null;
        var _userDataProperties = null;
        var isPlaying = false;

        var positionStart = Object.assign({}, STARTING_POSITION);
        var positionMiddle = Object.assign({}, MIDDLE_POSITION);
        var cycleTime = 100;

        var tweenStart = null;
        var tweenFinish = null;       
        var MUSIC_URL = "";
        var FX_URL = "";
        var musicObject = null;
        var fxObject = null;
        var musicOffset = null;
        var fxOffset = null;
        var musicDelay = 0;
        var fxDelay = 0;
        var musicVolume = 1.0; 
        var fxVolume = 1.0;
        var musicInjector = null;
        var fxInjector = null;
        var musicPosition = null;
        var fxPosition = null;

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
                    STARTING_POSITION = _userDataProperties.STARTING_POSITION;
                    MIDDLE_POSITION = _userDataProperties.MIDDLE_POSITION;
                    ENDING_POSITION = _userDataProperties.ENDING_POSITION;
                    TIME_TO_MIDDLE_POSITION = _userDataProperties.TIME_TO_MIDDLE_POSITION;
                    TIME_TO_ENDING_POSITION = _userDataProperties.TIME_TO_ENDING_POSITION;
                    DELAY_BETWEEN_TIME = _userDataProperties.DELAY_BETWEEN_TIME;
                    cycleTime = _userDataProperties.cycleTime;
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

                // Tweens
                positionStart = Object.assign({}, STARTING_POSITION);
                positionMiddle = Object.assign({}, MIDDLE_POSITION);

                tweenStart = new TWEEN.Tween(positionStart)
                    .to(MIDDLE_POSITION, TIME_TO_MIDDLE_POSITION)
                    .onStart(function() {
                        isPlaying = true;
                        var currentPosition = Entities.getEntityProperties(_entityID, 'position').position;
                        
                        musicPosition = musicPosition ? musicPosition : currentPosition;
                        Script.setTimeout(function() {
                            playSound(musicObject, musicInjector, musicPosition, musicVolume, false, musicOffset);

                        }, musicDelay);

                        fxPosition = fxPosition ? fxPosition : currentPosition;
                        Script.setTimeout(function() {
                            playSound(fxObject, fxInjector, fxPosition, fxVolume, false, fxOffset);

                        }, fxDelay);
                        Entities.editEntity(_entityID,{ 
                            animation: { loop: false, hold: false, running: true, currentFrame: 20, firstFrame: 20
                            } });
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
                        var properties = {
                            position: STARTING_POSITION,
                            animation: { loop: false, hold: false, running: false, currentFrame: 20, firstFrame: 20 }
                        };
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
                } catch (e) {
                    //
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
            } catch (e) {
                //
            }
        });
});
