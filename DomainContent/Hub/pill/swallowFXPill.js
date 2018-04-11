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
        "http://www.pacdv.com/sounds/people_sound_effects/gulp-2.wav",
        // rest of sounds from https://freesound.org/people/170084/sounds/408205/
        Script.resolvePath("./sounds/swallow-1.wav"),
        Script.resolvePath("./sounds/swallow-2.wav"),
        Script.resolvePath("./sounds/swallow-3.wav"),
        Script.resolvePath("./sounds/swallow-4.wav"),
        Script.resolvePath("./sounds/swallow-5.wav"),
        Script.resolvePath("./sounds/swallow-6.wav"),
        Script.resolvePath("./sounds/swallow-7.wav")
    ];

    // sound from https://freesound.org/people/meschi06/sounds/220914/
    var WAH_SOUND = SoundCache.getSound(Script.resolvePath("./wah-formatted.wav"));

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
    var WAH_VOLUME = 0.2;
    var WITHIN_10_CM = 0.1;
    var LIFETIME = 10; // seconds
    var GRAVITY = {x: 0, y: -9.8, z: 0};
    var WAH_START_TIMEOUT = 300; // ms
    var DEBUG = false;

    var _entityID;
    var _this;

    function Pill() {
        return;
    }

    Pill.prototype = {
        swallowPlayback: null,
        wahPlayback: null,
        wahPlaying: null,
        isInactive: true,
        hasServerScript: false,

        resetRenderDefaults: function() {
            if (!_this.isInactive) {
                Render.getConfig("RenderMainView").getConfig(WIREFRAME.split(":")[1])[WIREFRAME.split(":")[2]] = false;
                Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").mode = 0;
                Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").size = {x: 0, y: -1, z: 1, w: 1};
                Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").enabled = false;
            }
        },

        removeInjector: function() {
            if (_this.wahPlaying !== null) {
                if (_this.wahPlaying.playing) {
                    if (DEBUG) {
                        print("stopping wah sound");
                    }
                    _this.wahPlaying.stop();
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
                collisionless: true,
                gravity: GRAVITY
            };
            Entities.editEntity(entityID, editJSON);
        },

        // FIXME: if someone is holding the pill and disconnects the pills don't disappear
        /* continueNearGrab: function() {
            if (DEBUG) {
                print("holding pill");
            }
        }, */

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
                if (Vec3.distance(position, MyAvatar.getJointPosition("Head")) < WITHIN_10_CM) {
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
            var size = SWALLOW_SOUNDS_URLS.length - 1;
            var index = Math.round(Math.random() * size);
            var swallowSound = SoundCache.getSound(SWALLOW_SOUNDS_URLS[index]);
            Audio.playSound(swallowSound, _this.swallowPlayback);
            Script.setTimeout(function() {
                _this.wahPlaying = Audio.playSound(WAH_SOUND, _this.wahPlayback);
            }, WAH_START_TIMEOUT);

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
                    _this.removeInjector();
                    _this.isInactive = true;
                }, LIFETIME * 1000);
            }           
        },

        mousePressOnEntity: function(entityID, mouseEvent) {
            if (_this.hasServerScript && !HMD.active && _this.isInactive) {
                if (DEBUG) {
                    print("pill has been clicked");
                }
                _this.removeInjector();
                Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").size = {x: -1, y: -1, z: 1, w: 1};
                _this.isInactive = false;
                _this.playSwallowEffect(_this.avatarHeadPosition, false);
            }
        },

        preload: function(entityID) {
            _this = this;
            if (DEBUG) {
                print("loading new pill");
            }
            Script.update.connect(_this.checkIfNearHead);
            _entityID = entityID;
            Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").size = {x: -1, y: -1, z: 1, w: 1};
            _this.swallowPlayback = {
                volume: SWALLOW_VOLUME,
                position: Entities.getEntityProperties(_entityID).position,
                stereo: true
            };
            _this.wahPlayback = {
                volume: WAH_VOLUME,
                position: MyAvatar.getJointPosition("Head"),
                loop: true,
                localOnly: true
            };
            _this.hasServerScript = Entities.getEntityProperties(_entityID).serverScripts !== undefined;
        },

        unload: function(entityID) {
            if (DEBUG) {
                print("unloading pill");
            }
            Script.update.disconnect(_this.checkIfNearHead);
            _this.resetRenderDefaults();
            _this.removeInjector();
        }
    };

    var self = new Pill();
    return self;

});
