
(function() { 
    var _this;
    var SOUND_URL = "http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/Hub/Faucets/sounds/faucet.wav";
    var AUDIO_VOLUME_LEVEL = 1;

    var sound;
    var injector;


    function Faucet() {
        _this = this;
    }

    Faucet.prototype = {
        on: null,
        remotelyCallable: ['toggle'],
        preload: function(entityID) {
            _this.entityID = entityID;
            sound = SoundCache.getSound(SOUND_URL);
            _this.on = Entities.getEntityProperties(_this.entityID, 'visible').visible;
        },
        toggle: function(){
            _this.on ? _this.turnOff() : _this.turnOn();
        },
        playSound: function(position) {
            print("sound");
            if (sound.downloaded) {
                print("playing");
                if (injector) {
                    injector.stop();
                }
                injector = Audio.playSound(sound, {
                    position: Entities.getEntityProperties(_this.entityID, 'position').position,
                    volume: AUDIO_VOLUME_LEVEL,
                    loop: true
                });
            }
        },
        turnOn: function() {
            print("toggling ON");
            Entities.editEntity(_this.entityID, {isEmitting: true});
            _this.on = true;
            _this.playSound();
        },
        turnOff: function() {
            print("toggling OFF");
            Entities.editEntity(_this.entityID, {isEmitting: false});
            _this.on = false;
            if (injector) {
                injector.stop();
            }
        },
        unload: function() {
            if (injector) {
                injector.stop();
            }
        }
    };

    return new Faucet();
});