//
//  shower-script.js
//
//  created by Liv
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* globals AnimationCache, MyAvatar */
(function() {

    var ANIMATION_URL_ARRAY = [
        Script.resolvePath("Animations/Scary%20Clown%20Walk.fbx"),
        Script.resolvePath("Animations/Walking_122.fbx"),
        Script.resolvePath("Animations/Walking_36.fbx"),
        Script.resolvePath("Animations/Walking_38.fbx"),
        Script.resolvePath("Animations/Walking_61.fbx"),
        Script.resolvePath("Animations/Walking_65.fbx")
    ];
    var SOUND_URL = Script.resolvePath("Sounds/animationSwap.wav");
    var FPS = 60;
    var AUDIO_VOLUME_LEVEL = 0.5;
    var NUMBER_OF_ANIMATIONS = 6;

    var walkRoles = ["walkFwdNormal", "idleToWalkFwd", "walkBwdNormal"];
    var Animations = Array();
    var sound;
    var _this;

    function resetAnimations() {
        walkRoles.forEach(function(item) {
            MyAvatar.restoreRoleAnimation(item);
        });
        if (sound.downloaded) {
            Audio.playSound(sound, {
                volume: 0.5,
                position: MyAvatar.position
            });
        }
    }

    var AnimationShower = function() {
        _this = this;
    };
  
    AnimationShower.prototype = {
        preload: function(entityID) {
            sound = SoundCache.getSound(SOUND_URL);
            ANIMATION_URL_ARRAY.forEach(function(url) {
                var resource = AnimationCache.prefetch(url);
                var animation = AnimationCache.getAnimation(url);
                Animations.push({url: url, animation: animation, resource: resource});
            });
        }, 

        enterEntity: function() {
            var animationIndex = Math.floor(Math.random()* NUMBER_OF_ANIMATIONS);
            _this.playSound(MyAvatar.position);
            resetAnimations();
            MyAvatar.overrideRoleAnimation("walkFwdNormal", Animations[animationIndex].url, FPS, true, 0, 
                Animations[animationIndex].animation.frames.length);
            MyAvatar.overrideRoleAnimation("idleToWalkFwd", Animations[animationIndex].url, FPS, true, 0, 
                Animations[animationIndex].animation.frames.length);
            MyAvatar.overrideRoleAnimation("walkBwdNormal", Animations[animationIndex].url, -FPS, true, 0, 
                Animations[animationIndex].animation.frames.length);
        },
        playSound: function(position) {
            if (sound.downloaded) {
                Audio.playSound(sound, {
                    position: position,
                    volume: AUDIO_VOLUME_LEVEL
                });
            }
        }
    };
  
    return new AnimationShower();
});