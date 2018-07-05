var NO_HANDS = 0;
var ONE_HAND = 1;
var BOTH_HANDS = 2;
var LIFETIME_ON_PICKUP = 18;
var LIFETIME_ON_RELEASE = 8;

var SECS_TO_MS = 1000;
var UPDATE_POSITION_MS = 50;

var InstrumentClone = function (musicURLs, audioVolumeLevel) {
    this.musicURLs = musicURLs;
    this.audioVolumeLevel = audioVolumeLevel || 0.3;
    this.injector = null;
    this.playing = false;
    this.sounds = [];
    this.firstLoad = true;
    this.handNum = 0;
    this.updatePositionInterval = null;
    this.curPosition;
};

InstrumentClone.prototype = {

    // ENTITY METHODS
    preload: function (entityID) {
        this.entityID = entityID;

        this.curPosition = Entities.getEntityProperties(this.entityID, "position").position;
        this.handNum = 0;

        this.loadSounds();

        print("Loaded");
    },

    startNearGrab: function (thisEntity, otherEntity, collision) {

        if (this.handNum === NO_HANDS) {
            this.handNum = ONE_HAND;
        } else {
            this.handNum = BOTH_HANDS;
        }

        print("1");
        var age = Entities.getEntityProperties(this.entityID, "age").age;
        Entities.editEntity(this.entityID, { lifetime: age + LIFETIME_ON_PICKUP });
        this.startSound();
    },

    releaseGrab: function () {

        if (this.handNum === BOTH_HANDS) {
            this.handNum = ONE_HAND;
        } else {
            this.stopSound();

            var age = Entities.getEntityProperties(this.entityID, "age").age;
            Entities.editEntity(this.entityID, { lifetime: age + LIFETIME_ON_RELEASE });
            this.handNum = NO_HANDS;
        }
    },

    clickReleaseOnEntity: function (entityID, mouseEvent) {

        if (mouseEvent.isLeftButton) {
            if (!this.playing) {
                this.startSound();
            } else {
                this.stopSound();
            }
        }
    },

    unload: function () {
        this.stopSound();
        this.handNum = NO_HANDS;
    },

    // SOUND UTILITIES
    loadSounds: function () {

        var _this = this;

        print("2", JSON.stringify(this.musicURLs));
        this.musicURLs.forEach(function (soundURL, idx) {
            _this.sounds[idx] = SoundCache.getSound(Script.resolvePath(soundURL));
        });

        print(JSON.stringify(this.sounds));

        this.firstLoad = true;
    },

    startSound: function () {
        var _this = this;

        if (this.firstLoad) {
            Script.setTimeout(function () {
                _this.playSound();
            }, 50);

            this.firstLoad = false;
        } else {
            this.playSound();
        }
    },

    getRandomSound: function () {
        var randSound = this.sounds[Math.floor(Math.random() * this.sounds.length)];
        return randSound;
    },

    playSound: function () {

        var _this = this;
        var sound = this.getRandomSound();

        print(JSON.stringify(this.sounds));
        print(JSON.stringify(sound));

        print("NOT Playing?", !this.playing, sound.downloaded);

        if (!this.playing && sound.downloaded) {

            var position = Entities.getEntityProperties(this.entityID, 'position').position;

            this.injector = Audio.playSound(sound, {
                position: position,
                volume: _this.audioVolumeLevel
            });

            this.playing = true;

            print("SOUND IS: ", JSON.stringify(sound));
            var injector = this.injector;
            var entityID = this.entityID;

            // Update sound position using interval
            this.updatePositionInterval = Script.setInterval(function () {
                var position = Entities.getEntityProperties(entityID, 'position').position;
                injector.options = { position: position };
            }, UPDATE_POSITION_MS);

            // length of sound timeout
            var soundLength = sound.duration * SECS_TO_MS;

            Script.setTimeout(function () {
                if (_this.playing) {
                    _this.stopSound();
                }
            }, soundLength);
        }
    },

    stopSound: function () {

        print("STOP");
        this.playing = false;

        if (this.injector) {
            print("12");
            this.injector.stop();
            this.injector = null;
        }
        if (this.updatePositionInterval) {
            Script.clearInterval(this.updatePositionInterval);
            this.updatePositionInterval = null;
        }
    }
};

module.exports = {
    instrumentClone: InstrumentClone
};