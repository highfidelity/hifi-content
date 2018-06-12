//
// generatorExplosionZone.js
// 
// Created by Rebecca Stankus on 03/07/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function () {
    var FIRE_BY_GENERATOR = "{84d98c70-fe1c-4624-a8ba-d0e9171a1e46}";
    var AUDIO_VOLUME_LEVEL = 0.8;
    var DEBUG = 0;
    var NEGATIVE = -1;
    var EXPLOSION ="sounds/156031__iwiploppenisse__explosion.wav";
    var SURVIVOR_SCRIPT = "https://hifi-content.s3.amazonaws.com/davidback/development/zombies/zombieSurvivorScript.js";

    var sound;
    var _this;

    var ExplosionZone = function() {
        _this = this;
    };

    ExplosionZone.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            sound = SoundCache.getSound(Script.resolvePath(EXPLOSION));
            _this.ready = true;
            Entities.editEntity(_this.entityID, {
                visible: false,
                collisionless: true,
                locked: false
            });
        },
        resetZone: function() {
            _this.ready = true;
            Entities.editEntity(FIRE_BY_GENERATOR, {
                visible: false,
                collisionless: true,
                locked: false
            });
        },
        enterEntity: function() {
            if (DEBUG) {
                print("entered fire by generator zone");
            }
            if (_this.ready) {
                if (DEBUG) {
                    print("zone is ready");
                }
                var runningScripts = JSON.stringify(ScriptDiscoveryService.getRunning());
                if (DEBUG) {
                    print(runningScripts);
                }
                if (runningScripts.indexOf(SURVIVOR_SCRIPT) !== NEGATIVE) {
                    if (DEBUG) {
                        print("avatar is a survivor");
                    }
                    if (sound.downloaded) {
                        Audio.playSound(sound, {
                            position: Entities.getEntityProperties(FIRE_BY_GENERATOR, 'position').position,
                            volume: AUDIO_VOLUME_LEVEL
                        });
                    }
                    Entities.editEntity(FIRE_BY_GENERATOR, {
                        visible: true,
                        collisionless: false,
                        locked: true
                    });
                    _this.ready = false;
                }
            }
        }
    };

    return new ExplosionZone();
});
