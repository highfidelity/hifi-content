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
(function(){

    var ANIMATION_URL_ARRAY = [
        "https://hifi-content.s3.amazonaws.com/liv/dev/HubPrototypes/Crouched-Walking-32.fbx",
        "https://hifi-content.s3.amazonaws.com/liv/dev/HubPrototypes/Walking_122.fbx",
        "https://hifi-content.s3.amazonaws.com/liv/dev/HubPrototypes/Walking_36.fbx",
        "https://hifi-content.s3.amazonaws.com/liv/dev/HubPrototypes/Walking_38.fbx",
        "https://hifi-content.s3.amazonaws.com/liv/dev/HubPrototypes/Walking_61.fbx",
        "https://hifi-content.s3.amazonaws.com/liv/dev/HubPrototypes/Walking_65.fbx"
    ];
    var SOUND_URL = 
        "http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/Hub/Animation%20Shower/Sounds/animationSwap.wav";
    var FPS = 60;
    var AUDIO_VOLUME_LEVEL = 0.5;
    var NUMBER_OF_ANIMATIONS = 6;

    var Animations = Array();
    var sound;
    var _this;

    var AnimationShower = function(){
        _this = this;
    };
  
    AnimationShower.prototype = {
        preload: function(entityID){
            sound = SoundCache.getSound(SOUND_URL);
            ANIMATION_URL_ARRAY.forEach(function(url){
                var resource = AnimationCache.prefetch(url);
                var animation = AnimationCache.getAnimation(url);
                Animations.push({url: url, animation: animation, resource: resource});
            });
        }, 

        enterEntity: function() {
            var animationIndex = Math.floor(Math.random()* NUMBER_OF_ANIMATIONS);
            _this.playSound(MyAvatar.position);
            MyAvatar.overrideRoleAnimation("walkFwd", Animations[animationIndex].url, FPS, true, 0, 
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
        },

        unload: function() {
            MyAvatar.restoreRoleAnimation("walkFwd");
            MyAvatar.restoreRoleAnimation("idleToWalkFwd");
            MyAvatar.restoreRoleAnimation("walkBwdNormal");
        }
    };
  
    return new AnimationShower();
});