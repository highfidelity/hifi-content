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

    var SWALLOW_SOUNDS_URLS = [
        // sounds from https://freesound.org/people/170084/sounds/408205/
        Script.resolvePath("../sounds/swallow-1.wav"),
        Script.resolvePath("../sounds/swallow-2.wav"),
        Script.resolvePath("../sounds/swallow-3.wav"),
        Script.resolvePath("../sounds/swallow-4.wav"),
        Script.resolvePath("../sounds/swallow-5.wav"),
        Script.resolvePath("../sounds/swallow-6.wav"),
        Script.resolvePath("../sounds/swallow-7.wav")
    ];

    // sound from https://freesound.org/people/meschi06/sounds/220914/
    var EFFECT_SOUND_URL = Script.resolvePath("../sounds/space-trip-stereo.wav");

    var SWALLOW_SOUNDS = [];
    var EFFECT_SOUND;

    // retrieved from deferredLighting.qml
    var WIREFRAME = "Wireframe:LightingModel:enableWireframe";

    var VISUAL_EFFECTS = [
        WIREFRAME,
        2, // Albedo
        3, // Normal
        4, // Roughness
        6, // Emissive
        23 // Low Normal
    ];

    var SWALLOW_VOLUME = 0.5;
    var EFFECT_VOLUME = 0.65;
    var CHECK_RADIUS = 0.25; // meters
    var LIFETIME = 10; // seconds
    var GRAVITY = {x: 0, y: -9.8, z: 0};
    var PILL_SIZE = {x: 0.1259, y: 0.1259, z: 0.3227};
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

        resetRenderDefaults: function() {
            Render.getConfig("RenderMainView").getConfig(WIREFRAME.split(":")[1])[WIREFRAME.split(":")[2]] = false;
            Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").mode = 0;
            Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").enabled = false;

            Render.getConfig("SecondaryCameraJob").getConfig(WIREFRAME.split(":")[1])[WIREFRAME.split(":")[2]] = false;
            Render.getConfig("SecondaryCameraJob").getConfig("DebugDeferredBuffer").mode = 0;
            Render.getConfig("SecondaryCameraJob").getConfig("DebugDeferredBuffer").enabled = false;
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
                dimensions: PILL_SIZE,
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
                var pillDistance = CHECK_RADIUS * MyAvatar.scale;
                if (Vec3.distance(position, MyAvatar.getJointPosition("Head")) < pillDistance || 
                    Vec3.distance(position, MyAvatar.getJointPosition("Neck")) < pillDistance) {
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
            Render.getConfig("SecondaryCameraJob").getConfig("DebugDeferredBuffer").size = {x: -1, y: -1, z: 1, w: 1};
            if (effect === WIREFRAME) {
                Render.getConfig("RenderMainView").getConfig(effect.split(":")[1])[effect.split(":")[2]] = true;
                Render.getConfig("SecondaryCameraJob").getConfig(effect.split(":")[1])[effect.split(":")[2]] = true;
            } else {
                Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").enabled = true;
                Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").mode = effect;

                Render.getConfig("SecondaryCameraJob").getConfig("DebugDeferredBuffer").enabled = true;
                Render.getConfig("SecondaryCameraJob").getConfig("DebugDeferredBuffer").mode = effect;
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
                if (!HMD.active && _this.isInactive) {
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
                volume: SWALLOW_VOLUME
            };
            _this.effectPlayback = {
                volume: EFFECT_VOLUME,
                localOnly: true
            };
        },

        unload: function(entityID) {
            if (DEBUG) {
                print("unloading pill");
            }
            Script.update.disconnect(_this.checkIfNearHead);
            if (_entityID === Settings.getValue(LAST_ACTIVE_PILL_SETTING, Uuid.NULL)) {
                _this.resetRenderDefaults();
                Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").size = {x: 0, y: -1, z: 1, w: 1};
                Render.getConfig("SecondaryCameraJob").getConfig("DebugDeferredBuffer").size = {x: 0, y: -1, z: 1, w: 1};
                _this.removeInjector();
            }
        }
    };

    var self = new Pill();
    return self;

});
