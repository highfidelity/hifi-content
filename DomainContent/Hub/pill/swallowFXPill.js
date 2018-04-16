//
// swallowFXPill.js
// Play a swallow sound and trigger visual effects after a pill has been swallowed
//
// Author: Elisa Lupin-Jimenez
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// All assets are under CC Attribution Non-Commerical
// http://creativecommons.org/licenses/
//

/* globals Render */

(function() {

    /* fun trippy sphere bug
    Entities.addEntity({ type: 'Sphere', dimensions: Vec3.ONE, position: MyAvatar.position, collisionless: true,
        angularDamping: 0, angularVelocity: Vec3.UNIT_Y, alpha: 0.5 })
    */

    var SWALLOW_SOUNDS_URLS = [
        "http://www.pacdv.com/sounds/people_sound_effects/gulp-2.wav",
        // rest of sounds from https://freesound.org/people/170084/sounds/408205/
        Script.resolvePath("sounds/swallow-1.wav"),
        Script.resolvePath("sounds/swallow-2.wav"),
        Script.resolvePath("sounds/swallow-3.wav"),
        Script.resolvePath("sounds/swallow-4.wav"),
        Script.resolvePath("sounds/swallow-5.wav"),
        Script.resolvePath("sounds/swallow-6.wav"),
        Script.resolvePath("sounds/swallow-7.wav")
    ];

    // sound from https://freesound.org/people/meschi06/sounds/220914/
    var EFFECT_SOUND_URL = Script.resolvePath("sounds/space-trip-short.wav");

    var SWALLOW_SOUNDS = [];
    var EFFECT_SOUND;

    var WIREFRAME = "Wireframe:LightingModel:enableWireframe";

    var VISUAL_EFFECTS = [
        WIREFRAME,
        1, // Depth
        2, // Albedo
        3, // Normal
        5, // Metallic
        6 // Emissive
    ];

    var SWALLOW_VOLUME = 0.5;
    var EFFECT_VOLUME = 0.7;
    var CHECK_RADIUS = 0.2; // meters
    var LIFETIME = 10; // seconds
    var GRAVITY = {x: 0, y: -9.8, z: 0};
    var EFFECT_START_TIMEOUT = 300; // ms
    var DEBUG = false;

    var LAST_ACTIVE_PILL_SETTING = "io.highfidelity.spacePills.lastActivePillSetting";

    var _entityID;
    var _this;

    function Pill() {
        return;
    }

    Pill.prototype = {
        swallowPlayback: null,
        effectPlayback: null,
        effectPlaying: null,
        isInactive: true,
        hasServerScript: false,

        resetRenderDefaults: function() {
            Render.getConfig("RenderMainView").getConfig(WIREFRAME.split(":")[1])[WIREFRAME.split(":")[2]] = false;
            Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").mode = 0;
            Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").enabled = false;
        },

        removeInjector: function() {
            if (_this.effectPlaying !== null) {
                if (_this.effectPlaying.playing) {
                    if (DEBUG) {
                        print("stopping wah sound");
                    }
                    _this.effectPlaying.stop();
                }
            }
        },

        startNearGrab: function(entityID) {
            if (DEBUG) {
                print("starting pill grab");
            }
            var editJSON = {
                visible: true,
                lifetime: -1,
                dynamic: true,
                dimensions: {x: 0.1259, y: 0.1259, z: 0.3227},
                collisionless: true,
                gravity: GRAVITY
            };
            Entities.editEntity(entityID, editJSON);
        },

        releaseGrab: function(entityID) {
            if (DEBUG) {
                print("releasing pill grab");
            }
            var age = Entities.getEntityProperties(entityID, 'age').age;
            var editJSON = {
                lifetime: age + LIFETIME,
                collisionless: false
            };
            Entities.editEntity(entityID, editJSON);
        },
      
        checkIfNearHead: function() {
            if (_this.isInactive && HMD.active) {
                var position = Entities.getEntityProperties(_entityID, "position").position;
                if (Vec3.distance(position, MyAvatar.getJointPosition("Head")) < (CHECK_RADIUS * MyAvatar.scale)) {
                    if (DEBUG) {
                        print("swallowing pill");
                    }
                    _this.isInactive = false;
                    _this.playSwallowEffect(_this.avatarHeadPosition, true);
                }
            }
        },

        enableVisualEffects: function() {
            var size = VISUAL_EFFECTS.length - 1;
            var index = Math.round(Math.random() * size);
            var effect = VISUAL_EFFECTS[index];
            if (DEBUG) {
                print("effect is: " + effect);
            }
            Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").size = {x: -1, y: -1, z: 1, w: 1};
            if (index === 0) {
                Render.getConfig("RenderMainView").getConfig(effect.split(":")[1])[effect.split(":")[2]] = true;
            } else {
                Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").enabled = true;
                Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").mode = effect;
            }
        },

        playSwallowEffect: function(position, isInHMD) {
            if (DEBUG) {
                print("playing swallow effect");
            }
            Settings.setValue(LAST_ACTIVE_PILL_SETTING, _entityID);

            var size = SWALLOW_SOUNDS_URLS.length - 1;
            var index = Math.round(Math.random() * size);
            var swallowSound = SWALLOW_SOUNDS[index];
            var headPosition = MyAvatar.getJointPosition("Head");
            _this.swallowPlayback.position = headPosition;
            Audio.playSound(swallowSound, _this.swallowPlayback);

            Script.setTimeout(function() {
                _this.effectPlaying = Audio.playSound(EFFECT_SOUND, _this.effectPlayback);
            }, EFFECT_START_TIMEOUT);

            _this.enableVisualEffects();

            if (isInHMD) {
                var age = Entities.getEntityProperties(_entityID, 'age').age;
                var editJSON = {
                    visible: false,
                    lifetime: age + LIFETIME,
                    collisionless: true
                };
                Entities.editEntity(_entityID, editJSON);
            } else {
                Script.setTimeout(function() {
                    _this.resetRenderDefaults();
                    _this.isInactive = true;
                }, LIFETIME * 1000);
            }           
        },

        mousePressOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.isLeftButton) {
                if (_this.hasServerScript && !HMD.active && _this.isInactive) {
                    if (DEBUG) {
                        print("pill has been clicked");
                    }
                    _this.isInactive = false;
                    _this.playSwallowEffect(_this.avatarHeadPosition, false);
                }
            }
        },

        preload: function(entityID) {
            _this = this;
            if (DEBUG) {
                print("loading new pill");
            }
            Script.update.connect(_this.checkIfNearHead);
            _entityID = entityID;
            SWALLOW_SOUNDS_URLS.forEach(function(swallow) {
                SWALLOW_SOUNDS.push(SoundCache.getSound(swallow));
            });
            EFFECT_SOUND = SoundCache.getSound(EFFECT_SOUND_URL);
            _this.swallowPlayback = {
                volume: SWALLOW_VOLUME,
            };
            _this.effectPlayback = {
                volume: EFFECT_VOLUME,
                localOnly: true
            };
            _this.hasServerScript = Entities.getEntityProperties(_entityID).serverScripts !== undefined;
        },

        unload: function(entityID) {
            if (DEBUG) {
                print("unloading pill");
            }
            Script.update.disconnect(_this.checkIfNearHead);
            if (_entityID === Settings.getValue(LAST_ACTIVE_PILL_SETTING, Uuid.NULL)) {
                _this.resetRenderDefaults();
                Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").size = {x: 0, y: -1, z: 1, w: 1};
                _this.removeInjector();
            }
        }
    };

    var self = new Pill();
    return self;

});
