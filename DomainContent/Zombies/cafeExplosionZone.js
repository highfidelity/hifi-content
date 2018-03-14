(function () {
    var EXPLOSION_BY_CAFE = "{61572699-d8b7-4186-b9a1-857a7ba7db34}";
    var AUDIO_VOLUME_LEVEL = 0.8;

    var sound;

    var _this;

    var ExplosionZone = function() {
        _this = this;
    };

    ExplosionZone.prototype = {
        preload: function(entityID) {
            sound = SoundCache.getSound(Script.resolvePath("sounds/156031__iwiploppenisse__explosion.wav"));
            _this.ready = false;
        },
        enterEntity: function() {
        // did explosion already happen?
            var explosion = Entities.getEntityProperties(EXPLOSION_BY_CAFE, 'visible').visible;
            if (!explosion && _this.ready) {
                if (sound.downloaded) {
                    print("sound!!!");
                    Audio.playSound(sound, {
                        position: Entities.getEntityProperties(EXPLOSION_BY_CAFE, 'position').position,
                        volume: AUDIO_VOLUME_LEVEL
                    });
                }
                Entities.editEntity(EXPLOSION_BY_CAFE, {
                    visible: true,
                    collisionless: false
                });
            }
        },
        readyToExplode: function() {
            _this.ready = true;
        },
        notReadyToExplode: function() {
            _this.ready = false;
        }
    };

    return new ExplosionZone();
});