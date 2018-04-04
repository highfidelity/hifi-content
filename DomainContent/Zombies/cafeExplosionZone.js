(function () {
    var FIRE_BY_CAFE = "{b908d304-cbee-4eb0-85ed-e549264de3f4}";
    var AUDIO_VOLUME_LEVEL = 0.8;
    var EXPLOSION_SOUND = "sounds/156031__iwiploppenisse__explosion.wav";

    var sound;

    var ExplosionZone = function() {
    };

    ExplosionZone.prototype = {
        preload: function(entityID) {
            sound = SoundCache.getSound(Script.resolvePath(EXPLOSION_SOUND));
        },
        enterEntity: function() {
            // did explosion already happen?
            var explosion = Entities.getEntityProperties(FIRE_BY_CAFE, 'visible').visible;
            if (!explosion) {
                if (sound.downloaded) {
                    Audio.playSound(sound, {
                        position: Entities.getEntityProperties(FIRE_BY_CAFE, 'position').position,
                        volume: AUDIO_VOLUME_LEVEL
                    });
                }
                Entities.editEntity(FIRE_BY_CAFE, {
                    visible: true,
                    collisionless: false
                });
            }
        }
    };

    return new ExplosionZone();
});