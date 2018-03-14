(function () {
    var EXPLOSION_BY_GENERATOR = "{6beca683-d761-4490-a17a-9c7864b65464}";
    var AUDIO_VOLUME_LEVEL = 0.8;

    var sound;

    var ExplosionZone = function() {
    };

    ExplosionZone.prototype = {
        preload: function(entityID) {
            sound = SoundCache.getSound(Script.resolvePath("sounds/156031__iwiploppenisse__explosion.wav"));
        },
        enterEntity: function() {
        // did explosion already happen?
            var explosion = Entities.getEntityProperties(EXPLOSION_BY_GENERATOR, 'visible').visible;
            if (!explosion) {
                if (sound.downloaded) {
                    print("sound!!!");
                    Audio.playSound(sound, {
                        position: Entities.getEntityProperties(EXPLOSION_BY_GENERATOR, 'position').position,
                        volume: AUDIO_VOLUME_LEVEL
                    });
                }
                Entities.editEntity(EXPLOSION_BY_GENERATOR, {
                    visible: true,
                    collisionless: false
                });
            }
        }
    };

    return new ExplosionZone();
});