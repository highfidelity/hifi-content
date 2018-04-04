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
        "http://www.pacdv.com/sounds/people_sound_effects/gulp-2.wav"
    ];

    var WIREFRAME = "Wireframe:LightingModel:enableWireframe";

    var VISUAL_EFFECTS = [
        WIREFRAME,
        1, // Depth
        2, // Albedo
        3, // Normal
        5, // Metallic
        6 // Emissive
    ];

    var VOLUME = 0.5;
    var WITHIN_10_CM = 0.1;
    var LIFETIME = 10;

    var _entityID;
    var _this;

    function Pill() {
        return;
    }

    Pill.prototype = {
        playback: null,
        isInactive: true,
      
        checkIfNearHead: function() {
            var position = Entities.getEntityProperties(_entityID).position;
            if (_this.isInactive) {
                if (Vec3.distance(position, MyAvatar.getJointPosition("Head")) < WITHIN_10_CM) {
                    print("swallowing pill");
                    _this.isInactive = false;
                    _this.playSwallowEffect(_this.avatarHeadPosition);
                }
            }
        },

        enableVisualEffects: function() {
            var size = VISUAL_EFFECTS.length - 1;
            var index = Math.round(Math.random() * size);
            var effect = VISUAL_EFFECTS[index];
            print("effect is: " + effect);
            if (index === 0) {
                Render.getConfig("RenderMainView").getConfig(effect.split(":")[1])[effect.split(":")[2]] = true;
            } else {
                Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").enabled = true;
                Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").mode = effect;
            }
        },

        playSwallowEffect: function(position) {
            print("playing swallow effect");
            var size = SWALLOW_SOUNDS_URLS.length - 1;
            var index = Math.round(Math.random() * size);
            var sound = SoundCache.getSound(SWALLOW_SOUNDS_URLS[index]);
            Audio.playSound(sound, this.playback);
            _this.enableVisualEffects();

            var age = Entities.getEntityProperties(_entityID, 'age').age;
            var editJSON = {
                visible: false,
                lifetime: age + LIFETIME,
                collisionless: true
            };
            Entities.editEntity(_entityID, editJSON);                   
        },

        mousePressOnEntity: function(entityID, mouseEvent) {
            print("pill has been clicked");
            if (_this.isInactive) {
                Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").size = {x: -1, y: -1, z: 1, w: 1};
                _this.isInactive = false;
                _this.playSwallowEffect(_this.avatarHeadPosition);
            }
        },

        preload: function(entityID) {
            _this = this;
            print("loading new pill");
            Script.update.connect(this.checkIfNearHead);
            _entityID = entityID;
            Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").size = {x: -1, y: -1, z: 1, w: 1};
            this.playback = {volume: VOLUME, position: Entities.getEntityProperties(_entityID).position};
        },

        unload: function(entityID) {
            print("unloading pill");
            Script.update.disconnect(_this.checkIfNearHead);
            if (!_this.isInactive) {
                Render.getConfig("RenderMainView").getConfig(WIREFRAME.split(":")[1])[WIREFRAME.split(":")[2]] = false;
                Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").mode = 0;
                Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").size = {x: 0, y: -1, z: 1, w: 1};
                Render.getConfig("RenderMainView").getConfig("DebugDeferredBuffer").enabled = false;
            }
        }

    };

    var self = new Pill();
    return self;

});
